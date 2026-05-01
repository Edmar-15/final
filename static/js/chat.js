document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const imageInput = document.getElementById("imageInput");
    const imageButton = document.querySelector(".image-button");
    const messagesContainer = document.querySelector(".chat-messages");
    const send_url = form.dataset.sendUrl;
    
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);

    // =========================
    // IMAGE BUTTON (image only)
    // =========================
    if (imageButton && imageInput) {
        imageButton.addEventListener("click", () => imageInput.click());

        imageInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            // limit: 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be less than 5MB");
                this.value = "";
                return;
            }

            const formData = new FormData();
            formData.append("image", file); // ONLY image

            sendMessage(formData);

            this.value = ""; // reset after send
        });
    }

    // =========================
    // TEXT SEND (text only)
    // =========================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const message = input.value.trim();
        if (!message) return;

        const formData = new FormData();
        formData.append("message", message); // ONLY text

        sendMessage(formData);
    });

    // =========================
    // SINGLE FETCH FUNCTION
    // =========================
    function sendMessage(formData) {
        fetch(send_url, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            }
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) return;

            renderMessage(data.message);
        })
        .catch(err => console.error("Send failed:", err));
    }

    // =========================
    // RENDER MESSAGE
    // =========================
    function renderMessage(msg) {
        const el = document.createElement("article");
        el.className = "message";

        el.innerHTML = `
            <div class="message-meta">
                <span class="message-user">${msg.user}</span>
                <span class="message-meta-separator">•</span>
                <span class="message-time">${msg.time}</span>
            </div>
            ${msg.content ? `<p>${msg.content}</p>` : ""}
        `;

        if (msg.image_url) {
            el.innerHTML += `
                <img src="${msg.image_url}" 
                     style="max-width:100%; margin-top:8px; border-radius:8px; width:600px;">
            `;
        }

        messagesContainer.appendChild(el);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // clear text input only
        input.value = "";
    }

});

    const container = document.getElementById("messagesContainer");
    const url = container.dataset.fetchUrl;

    function pollMessages() {
        let lastId = container.dataset.lastId || 0;

        if (!lastId || lastId === "undefined") {
            lastId = 0;
        }

        fetch(url + "?last_id=" + lastId)
            .then(res => res.json())
            .then(data => {

                if (data.messages.length === 0) return;

                data.messages.forEach(msg => {
                    const el = document.createElement("article");
                    el.className = "message";

                    el.innerHTML = `
                        <div class="message-meta">
                            <span class="message-user">${msg.user}</span>
                            <span class="message-meta-separator">•</span>
                            <span class="message-time">${msg.time}</span>
                        </div>
                        ${msg.content ? `<p>${msg.content}</p>` : ""}
                    `;

                    // ✅ ADD THIS (image support)
                    if (msg.image_url) {
                        el.innerHTML += `
                            <img src="${msg.image_url}" 
                                style="max-width:100%; margin-top:8px; border-radius:8px; width:600px;">
                        `;
                    }

                    container.appendChild(el);

                    container.dataset.lastId = msg.id;
                });

                // auto scroll
                container.scrollTop = container.scrollHeight;
            })
            .catch(err => console.error("Polling error:", err));
    }

    // run every 2 seconds
    setInterval(pollMessages, 2000);
    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}