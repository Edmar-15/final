const container = document.getElementById("messagesContainer");
const currentUser = container ? container.dataset.currentUser : "";

function isEmojiOnly(text) {
    if (!text) return false;
    const cleaned = text.trim();
    if (!cleaned) return false;
    return /^([\p{Extended_Pictographic}\uFE0F\u200D])+$/u.test(cleaned);
}

function formatPhilippinesTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (isNaN(date)) return "";
    return new Intl.DateTimeFormat("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Manila"
    }).format(date);
}

document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("chatForm");
        const input = document.getElementById("chatInput");
        const messagesContainer = document.querySelector(".chat-messages");
        const send_url = form.dataset.sendUrl;
        const imageInput = document.getElementById("imageInput");
        const imageButton = document.querySelector(".image-button");

        if (imageButton) {
            imageButton.addEventListener("click", () => imageInput.click());
        }

        if (imageInput) {
            imageInput.addEventListener("change", function() {
                const file = this.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                    alert("Image size must be less than 5MB");
                    return;
                }
                const formData = new FormData();
                formData.append("image", file);

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
                    el.className = "message" + (msg.user === currentUser ? " message-outgoing" : "");
                    el.dataset.timestamp = msg.timestamp || "";
                    el.innerHTML = `
                        <div class="message-meta">
                            <span class="message-user">${msg.user}</span>
                            <span class="message-meta-separator">•</span>
                            <span class="message-time">${formatPhilippinesTime(msg.timestamp) || msg.time}</span>
                        </div>
                        <p>${msg.content}</p>
                    `;
                    if (msg.image_url) {
                        el.innerHTML += `<img src="${msg.image_url}" alt="Uploaded image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
                    }
                    messagesContainer.appendChild(el);
                    messagesContainer.dataset.lastId = msg.id;
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    this.value = "";
                })
                .catch(err => console.error("Image send failed:", err));
            });
        }

        if (messagesContainer) {
            messagesContainer.querySelectorAll(".message[data-timestamp]").forEach(messageEl => {
                const content = messageEl.querySelector("p")?.textContent || "";
                if (isEmojiOnly(content)) {
                    messageEl.classList.add("emoji-large");
                }
                const timestamp = messageEl.dataset.timestamp;
                const timeEl = messageEl.querySelector(".message-time");
                if (timeEl && timestamp) {
                    timeEl.textContent = formatPhilippinesTime(timestamp);
                }
            });

            // Scroll to bottom on page load
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

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
                el.className = "message" + (msg.user === currentUser ? " message-outgoing" : "");
                el.dataset.timestamp = msg.timestamp || "";

                el.innerHTML = `
                    <div class="message-meta">
                        <span class="message-user">${msg.user}</span>
                        <span class="message-meta-separator">•</span>
                        <span class="message-time">${formatPhilippinesTime(msg.timestamp) || msg.time}</span>
                    </div>
                    <p>${msg.content}</p>
                `;

                if (msg.image_url) {
                    el.innerHTML += `<img src="${msg.image_url}" alt="Uploaded image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
                }

                if (isEmojiOnly(msg.content)) {
                    el.classList.add("emoji-large");
                }

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
                    el.className = "message" + (msg.user === currentUser ? " message-outgoing" : "");
                    el.dataset.timestamp = msg.timestamp || "";

                    el.innerHTML = `
                        <div class="message-meta">
                            <span class="message-user">${msg.user}</span>
                            <span class="message-meta-separator">•</span>
                            <span class="message-time">${formatPhilippinesTime(msg.timestamp) || msg.time}</span>
                        </div>
                        <p>${msg.content}</p>
                    `;

                    if (msg.image_url) {
                        el.innerHTML += `<img src="${msg.image_url}" alt="Uploaded image" style="max-width: 100%; border-radius: 8px; margin-top: 8px;">`;
                    }

                    if (isEmojiOnly(msg.content)) {
                        el.classList.add("emoji-large");
                    }

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