const emojiBtn = document.querySelector(".emoji-button");
    const emojiPicker = document.getElementById("emojiPicker");
    const input = document.getElementById("chatInput");

    // toggle emoji panel
    emojiBtn.addEventListener("click", () => {
        emojiPicker.classList.toggle("hidden");
    });

    // insert emoji
    emojiPicker.addEventListener("click", (e) => {
        if (e.target.tagName === "SPAN") {
            input.value += e.target.textContent;
            input.focus();
        }
    });

    document.addEventListener("click", (e) => {
        if (!emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
            emojiPicker.classList.add("hidden");
        }
    });