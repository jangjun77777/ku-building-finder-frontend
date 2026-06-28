const API_URL = "https://ku-building-finder-backend-9.onrender.com/chat";

const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const chat = document.getElementById("chat");
const hubToggle = document.getElementById("hubToggle");
const sidebar = document.getElementById("sidebar");

function scrollToBottom() {
    if (!chat) return;
    chat.scrollTop = chat.scrollHeight;
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function linkify(text) {
    return text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

function createMessage(role, text) {
    const wrapper = document.createElement("div");
    wrapper.className = role === "user" ? "user-message" : "bot-message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "🙂" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "message";

    if (role === "bot") {
        bubble.innerHTML = linkify(escapeHTML(text));
    } else {
        bubble.textContent = text;
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chat.appendChild(wrapper);

    scrollToBottom();

    return bubble;
}

function setLoading(isLoading) {
    const sendButton = form.querySelector("button");

    sendButton.disabled = isLoading;
    input.disabled = isLoading;

    sendButton.textContent = isLoading ? "Sending..." : "Send";
}

async function sendMessage(message) {
    if (!message) return;

    createMessage("user", message);

    input.value = "";

    const loadingBubble = createMessage("bot", "Thinking...");

    setLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const data = await response.json();

        const reply = data.reply || "No response.";

        loadingBubble.innerHTML = linkify(escapeHTML(reply));

    } catch (error) {
        loadingBubble.textContent =
            "Sorry, something went wrong. Please try again.";

        console.error(error);

    } finally {
        setLoading(false);
        input.focus();
        scrollToBottom();
    }
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const message = input.value.trim();

    sendMessage(message);
});

document.querySelectorAll(".chip, .example-btn").forEach(button => {
    button.addEventListener("click", () => {
        sendMessage(button.textContent.trim());
    });
});

if (hubToggle && sidebar) {
    hubToggle.addEventListener("click", () => {
        sidebar.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

input.focus();
