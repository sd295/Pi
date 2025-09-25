
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements we need to interact with
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const modelTitle = document.getElementById('model-title');
    const pliBtn = document.getElementById('pli-btn');
    const gemmaBtn = document.getElementById('gemma-btn');

    // --- MODEL AND API CONFIGURATION ---
    let currentModel = 'pli6lte'; // 'pli6lte' or 'gemma3'
    const pliApiUrl = 'https://fhf567456745.pythonanywhere.com/r/';
    const gemmaApiKey = 'AIzaSyAIRur0TPzTkhcQz7vnn25X9bWI7mUWGw4'; // <-- PASTE YOUR GOOGLE AI API KEY HERE
    const gemmaApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${gemmaApiKey}`;


    // --- EVENT LISTENERS ---

    // Listen for when the user submits the form
    chatForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const messageText = userInput.value.trim();
        if (messageText) {
            addMessageToChatbox('user', messageText);
            userInput.value = '';
            getBotResponse(messageText);
        }
    });

    // Event listeners for model switching buttons
    pliBtn.addEventListener('click', () => switchModel('pli6lte'));
    gemmaBtn.addEventListener('click', () => switchModel('gemma3'));


    // --- CORE FUNCTIONS ---

    /**
     * Switches the current AI model.
     * @param {string} model - The model to switch to ('pli6lte' or 'gemma3').
     */
    function switchModel(model) {
        currentModel = model;
        // Clear the chatbox for a fresh start with the new model
        chatBox.innerHTML = ''; 

        if (model === 'pli6lte') {
            modelTitle.textContent = 'PLI 6LTE';
            pliBtn.classList.add('active');
            gemmaBtn.classList.remove('active');
            addMessageToChatbox('bot', 'Switched to PLI6 LTE. How can I help you?');
        } else {
            modelTitle.textContent = 'Gemma 3';
            gemmaBtn.classList.add('active');
            pliBtn.classList.remove('active');
            addMessageToChatbox('bot', 'Switched to Gemma 3. Ask me anything!');
        }
    }

    /**
     * Adds a message to the chat box display.
     * @param {string} sender - Who sent the message ('user' or 'bot').
     * @param {string} text - The content of the message.
     */
    function addMessageToChatbox(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);

        const pElement = document.createElement('p');
        pElement.textContent = text;
        
        messageElement.appendChild(pElement);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    /**
     * Sends the user's message to the correct API based on the current model.
     * @param {string} messageText - The user's message.
     */
    async function getBotResponse(messageText) {
        showTypingIndicator();

        if (currentModel === 'pli6lte') {
            await getPliResponse(messageText);
        } else {
            await getGemmaResponse(messageText);
        }
    }

    /**
     * Gets a response from the PLI6LTE (PythonAnywhere) API.
     * @param {string} messageText - The user's message.
     */
    async function getPliResponse(messageText) {
        try {
            const encodedMessage = encodeURIComponent(messageText);
            const fullUrl = pliApiUrl + encodedMessage;
            const response = await fetch(fullUrl);
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();
            hideTypingIndicator();
            addMessageToChatbox('bot', data.response);
        } catch (error) {
            console.error("Error fetching PLI6LTE response:", error);
            hideTypingIndicator();
            addMessageToChatbox('bot', 'Sorry, I seem to be having trouble connecting to PLI6LTE. Please try again later.');
        }
    }

    /**
     * Gets a response from the Gemma 3 (Google AI) API.
     * @param {string} messageText - The user's message.
     */
    async function getGemmaResponse(messageText) {
        if (gemmaApiKey === 'AIzaSyAIRur0TPzTkhcQz7vnn25X9bWI7mUWGw4') {
            hideTypingIndicator();
            addMessageToChatbox('bot', 'Please add your Google AI API key to chat.js to use the Gemma 3 model.');
            return;
        }

        try {
            const response = await fetch(gemmaApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: messageText }] }]
                }),
            });

            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

            const data = await response.json();
            const botMessage = data.candidates[0].content.parts[0].text;
            hideTypingIndicator();
            addMessageToChatbox('bot', botMessage);

        } catch (error) {
            console.error('Error with Gemma 3 API:', error);
            hideTypingIndicator();
            addMessageToChatbox('bot', 'Sorry, something went wrong with the Gemma 3 model.');
        }
    }


    // --- UI HELPER FUNCTIONS (TYPING INDICATOR) ---

    /**
     * Shows a "typing..." animation in the chat box.
     */
    function showTypingIndicator() {
        // Prevent multiple indicators
        if (document.getElementById('typing-indicator')) return; 

        const indicator = document.createElement('div');
        indicator.classList.add('message', 'bot-message', 'typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';
        indicator.id = 'typing-indicator';
        chatBox.appendChild(indicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    /**
     * Removes the "typing..." animation from the chat box.
     */
    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            chatBox.removeChild(indicator);
        }
    }
});    chatBox.scrollTop = chatBox.scrollHeight;
}

