    if (window.location.search.includes("updated=true")) {
        openModal();
    }

    function openModal() {
        document.getElementById("profileModal").style.display = "block";
    }

    function closeModal() {
        document.getElementById("profileModal").style.display = "none";
    }

    document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("profileForm");
        const fileInput = document.getElementById("id_profile_pic");
        const uploadBtn = document.getElementById("uploadBtn");
        const tooltip = document.getElementById("fileNameTooltip");
        const profileImg = document.querySelector(".profile-picture");
        const profileUrl = form.dataset.profileUrl

        // open file picker
        uploadBtn.addEventListener("click", () => {
            fileInput.click();
        });

        // file name preview
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length > 0) {
                tooltip.textContent = fileInput.files[0].name;
            }
        });

        // AJAX submit
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData();
            const file = fileInput.files[0];

            if (!file) return;

            formData.append("profile_pic", file);

            fetch(profileUrl, {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRFToken": getCookie("csrftoken")
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                    // update image instantly
                    profileImg.src = data.image_url + "?t=" + new Date().getTime();

                    // reset input
                    fileInput.value = "";
                    tooltip.textContent = "";

                    // keep modal open (do nothing)
                }
            })
            .catch(err => {
                console.error("Upload failed", err);
            });
        });

    });