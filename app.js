const API_URL = "https://craft-ai-tutor.onrender.com/api/chat";

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const providerSelect = document.getElementById('model-selector');

    const message = inputField.value.trim();
    const provider = providerSelect ? providerSelect.value : 'gemini';

    if (!message) return;

    chatBox.innerHTML += `
        <div class="message user-message" style="margin-bottom: 10px; color: blue;">
            <b>Aap:</b> ${message}
        </div>
    `;
    
    inputField.value = ""; 

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                message: message, 
                provider: provider 
            })
        });

        const data = await response.json();

        if (data.reply) {
            chatBox.innerHTML += `
                <div class="message ai-message" style="margin-bottom: 10px; color: green;">
                    <b>CRAFT Tutor:</b> ${data.reply}
                </div>
            `;
        } else if (data.error) {
            chatBox.innerHTML += `
                <div class="message error-message" style="margin-bottom: 10px; color: red;">
                    <b>Qi Blocked (Error):</b> ${data.error}
                </div>
            `;
        }
    } catch (error) {
        console.error("API Fetch Error:", error);
        chatBox.innerHTML += `
            <div class="message error-message" style="margin-bottom: 10px; color: red;">
                <b>System Error:</b> Server se connection toot gaya. Apna Internet check karein!
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });
    }
});
