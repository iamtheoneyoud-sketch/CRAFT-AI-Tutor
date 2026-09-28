document.addEventListener("DOMContentLoaded", () => {
    const sendButton = document.getElementById('send-btn') || document.querySelector('button[type="submit"]');
    const inputField = document.getElementById('user-input') || document.querySelector('input[type="text"]');
    const chatBox = document.getElementById('chat-box') || document.getElementById('chat-container');
    const providerSelect = document.getElementById('model-selector') || document.getElementById('provider-select');

    const API_URL = "https://craft-ai-tutor.onrender.com/api/chat";

    async function handleSendMessage() {
        if (!inputField || !chatBox) return;

        const message = inputField.value.trim();
        if (!message) return;

        const provider = providerSelect ? providerSelect.value : 'gemini';

        // User message screen par show karein
        chatBox.innerHTML += `
            <div class="message user-message" style="margin: 10px 0; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <b>Aap:</b> ${escapeHtml(message)}
            </div>
        `;

        inputField.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;

        // Loading indicator
        const loadingId = 'loading-' + Date.now();
        chatBox.innerHTML += `
            <div id="${loadingId}" class="message ai-message" style="margin: 10px 0; padding: 10px; opacity: 0.7;">
                <b>CRAFT Tutor:</b> Soch raha hai... (Qi flow active hai)
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;

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
            
            // Loading message remove karein
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();

            if (data.reply) {
                chatBox.innerHTML += `
                    <div class="message ai-message" style="margin: 10px 0; padding: 10px; background: rgba(0,255,0,0.05); border-radius: 8px;">
                        <b>CRAFT Tutor:</b> ${escapeHtml(data.reply)}
                    </div>
                `;
            } else if (data.error) {
                chatBox.innerHTML += `
                    <div class="message error-message" style="margin: 10px 0; padding: 10px; color: #ff6b6b;">
                        <b>Qi Blocked:</b> ${escapeHtml(data.error)}
                    </div>
                `;
            }
        } catch (error) {
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) loadingElement.remove();

            console.error("API Error:", error);
            chatBox.innerHTML += `
                <div class="message error-message" style="margin: 10px 0; padding: 10px; color: #ff6b6b;">
                    <b>System Error:</b> Server se rabta nahi ho saka. Internet connection check karein!
                </div>
            `;
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // HTML escape helper to prevent basic injection issues
    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    if (sendButton) {
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleSendMessage();
        });
    }

    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }
});
                          
