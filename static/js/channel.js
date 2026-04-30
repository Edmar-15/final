document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("channelModal");
    const form = document.getElementById("channelForm");

    window.openChannelModal = function () {
        modal.classList.remove("hidden-channel");
    };

    window.closeChannelModal = function () {
        modal.classList.add("hidden-channel");
    };

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();

            const url = form.dataset.url;
            const formData = new FormData(form);

            fetch(url, {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRFToken": form.querySelector("[name=csrfmiddlewaretoken]").value
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                    const list = document.querySelector(".channels-list");

                    const newChannel = document.createElement("a");
                    newChannel.href = `/piyu/chat/${data.channel.id}/`;
                    newChannel.classList.add("channel-item");

                    newChannel.innerHTML = `<span class="channel-hash">#</span>${data.channel.name}`;

                    list.appendChild(newChannel);

                    closeChannelModal();
                    form.reset();

                } else {
                    document.getElementById("channelError").innerText = data.error;
                }
            });
        });
    }

});