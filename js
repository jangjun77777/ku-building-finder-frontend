const API_URL = "https://ku-building-finder-backend-9.onrender.com/chat";

const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const chat = document.getElementById("chat");
const hubToggle = document.getElementById("hubToggle");
const sidebar = document.getElementById("sidebar");

// Scroll to the latest message
function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

// Create a chat bubble
function createMessage(role, text) {

    const wrapper = document.createElement("div");
    wrapper.className = role === "user" ? "user-message" : "bot-message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "🙂" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "message";

    if (role === "bot") {

        const escaped = text
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        bubble.innerHTML = escaped.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>'
        );

    } else {

        bubble.textContent = text;

    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chat.appendChild(wrapper);

    scrollToBottom();

    return bubble;
}

// Send message to backend
async function sendMessage(message) {

    if (!message) return;

    createMessage("user", message);

    input.value = "";

    const loadingBubble = createMessage("bot", "Thinking...");

    const sendButton = form.querySelector("button");

    sendButton.disabled = true;

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

        loadingBubble.innerHTML = (data.reply || "No response.")
            .replace(
                /(https?:\/\/[^\s]+)/g,
                '<a href="$1" target="_blank" rel="noopener">$1</a>'
            );

    } catch (error) {

        loadingBubble.textContent =
            "Sorry, I couldn't connect to the server.";

        console.error(error);

    } finally {

        sendButton.disabled = false;

        input.focus();

        scrollToBottom();

    }

}

// Submit
form.addEventListener("submit", function (e) {

    e.preventDefault();

    const message = input.value.trim();

    sendMessage(message);

});

// Quick Question buttons
document.querySelectorAll(".chip, .example-btn").forEach(button => {

    button.addEventListener("click", () => {

        sendMessage(button.textContent.trim());

    });

});

// Student Hub button (Mobile)
if (hubToggle && sidebar) {

    hubToggle.addEventListener("click", () => {

        if (window.innerWidth <= 960) {

            sidebar.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

    });

}

// Auto focus
input.focus();
