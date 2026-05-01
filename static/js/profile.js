    if (window.location.search.includes("updated=true")) {
        openModal();
    }

    function openModal() {
        document.getElementById("profileModal").style.display = "block";
    }

    function closeModal() {
        document.getElementById("profileModal").style.display = "none";
    }

    function openMemberModal(data) {
        const modal = document.getElementById("memberProfileModal");
        document.getElementById("memberProfilePicture").src = data.profilePic || "";
        document.getElementById("memberProfileName").textContent = data.username;
        document.getElementById("memberProfileUsername").textContent = data.username;
        document.getElementById("memberProfileEmail").textContent = data.email || "Not provided";
        document.getElementById("memberProfileFirstName").textContent = data.firstName || "Not provided";
        document.getElementById("memberProfileLastName").textContent = data.lastName || "Not provided";
        document.getElementById("memberProfileStatus").textContent = data.status || "Active";
        modal.style.display = "block";
    }

    function closeMemberModal() {
        document.getElementById("memberProfileModal").style.display = "none";
    }

    // Close modals when clicking outside
    window.addEventListener("click", function(event) {
        const profileModal = document.getElementById("profileModal");
        const memberProfileModal = document.getElementById("memberProfileModal");

        if (event.target === profileModal) {
            closeModal();
        }
        if (event.target === memberProfileModal) {
            closeMemberModal();
        }
    });

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

        // member profile click handling
        const memberButtons = document.querySelectorAll('.member-item');
        memberButtons.forEach(button => {
            button.addEventListener('click', function () {
                const data = {
                    username: this.dataset.username,
                    email: this.dataset.email,
                    firstName: this.dataset.firstName,
                    lastName: this.dataset.lastName,
                    profilePic: this.dataset.profilePic,
                    status: this.dataset.status,
                };
                openMemberModal(data);
            });
        });

    });