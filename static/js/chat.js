document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("chatForm");
        const input = document.getElementById("chatInput");
        const messagesContainer = document.querySelector(".chat-messages");
        const send_url = form.dataset.sendUrl;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const message = input.value.trim();
            if (!message) return;

            const formData = new FormData();
            formData.append("message", message);

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

                const msg = data.message;

                const el = document.createElement("article");
                el.className = "message";

                el.innerHTML = `
                    <div class="message-meta">
                        <span class="message-user">${msg.user}</span>
                        <span class="message-meta-separator">•</span>
                        <span class="message-time">${msg.time}</span>
                    </div>
                    <p>${msg.content}</p>
                `;

                messagesContainer.appendChild(el);

                messagesContainer.dataset.lastId = msg.id;

                // auto scroll
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // clear input
                input.value = "";
            })
            .catch(err => console.error("Message send failed:", err));
        });

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
                        <p>${msg.content}</p>
                    `;

                    container.appendChild(el);

                    // update last message id
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