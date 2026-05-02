document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const imageInput = document.getElementById("imageInput");
    const imageButton = document.querySelector(".image-button");
    const messagesContainer = document.getElementById("messagesContainer");

    const send_url = form?.dataset.sendUrl;
    const url = messagesContainer?.dataset.fetchUrl;
    const currentUserId = document.body.dataset.userId;

    if (!form || !messagesContainer || !url || !send_url) return;

    // =========================
    // FORCE SCROLL FUNCTION
    // =========================
    function scrollToBottom() {
        requestAnimationFrame(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    }

    // =========================
    // INITIAL SCROLL
    // =========================
    scrollToBottom();

    // =========================
    // SEND MESSAGE
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

            input.value = "";

            // ALWAYS scroll after sending
            scrollToBottom();
        })
        .catch(err => console.error("Send failed:", err));
    }

    // =========================
    // IMAGE UPLOAD
    // =========================
    if (imageButton && imageInput) {
        imageButton.addEventListener("click", () => imageInput.click());

        imageInput.addEventListener("change", function () {
            const file = this.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be less than 5MB");
                this.value = "";
                return;
            }

            const formData = new FormData();
            formData.append("image", file);

            sendMessage(formData);
            this.value = "";
        });
    }

    // =========================
    // TEXT SEND
    // =========================
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const message = input.value.trim();
        if (!message) return;

        const formData = new FormData();
        formData.append("message", message);

        sendMessage(formData);
    });

    // =========================
    // RENDER MESSAGE
    // =========================
    function renderMessage(msg) {
        const el = document.createElement("article");

        const isOwn = msg.user_id == currentUserId;
        el.className = "message " + (isOwn ? "own" : "other");

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
    }

    // =========================
    // POLLING
    // =========================
    function pollMessages() {

        let lastId = Number(messagesContainer.dataset.lastId || 0);

        fetch(`${url}?last_id=${lastId}`)
            .then(res => res.json())
            .then(data => {

                if (!data.messages.length) return;

                data.messages.forEach(msg => {

                    renderMessage(msg);

                    messagesContainer.dataset.lastId = Math.max(
                        Number(messagesContainer.dataset.lastId || 0),
                        msg.id
                    );
                });

                // ALWAYS FORCE BOTTOM AFTER POLL
                scrollToBottom();
            })
            .catch(err => console.error("Polling error:", err));
    }

    setInterval(pollMessages, 2000);

    // =========================
    // CSRF TOKEN
    // =========================
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
});