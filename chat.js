document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const modelTitle = document.getElementById('model-title');
    const pliBtn = document.getElementById('pli-btn');
    const gemmaBtn = document.getElementById('gemma-btn');

    // --- MODEL AND API CONFIGURATION ---
    let currentModel = 'pli6lte'; // 'pli6lte' or 'gemma3'
    // Ensure pliApiUrl ends with a slash if your Python server expects it: '/r/'
    const pliApiUrl = 'https://fhf567456745.pythonanywhere.com/r/';
    const gemmaApiKey = 'AIzaSyAIRur0TPzTkhcQz7vnn25X9bWI7mUWGw4'; // <-- PASTE YOUR GOOGLE AI API KEY HERE
    const gemmaApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${gemmaApiKey}`;


    // --- EVENT LISTENERS (with safety checks to prevent crashes) ---

    // Listen for when the user submits the form manually
    if (chatForm) {
        chatForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const messageText = userInput.value.trim();
            if (messageText) {
                addMessageToChatbox('user', messageText);
                userInput.value = '';
                getBotResponse(messageText);
            }
        });
    }

    // Event listeners for model switching buttons
    if (pliBtn) {
        pliBtn.addEventListener('click', () => switchModel('pli6lte'));
    }
    // FIX: Added gemmaBtn listener check, which was missing in your last paste
    if (gemmaBtn) {
        gemmaBtn.addEventListener('click', () => switchModel('gemma3'));
    }

    // --- Listener for postMessage from the parent window ---
    window.addEventListener('message', (event) => {
        console.log("--- DEBUG (Iframe): Message received from parent! ---");
        console.log("DEBUG (Iframe): Event data:", event.data);

        if (event.data && event.data.type === 'AUTOGENERATE_ANSWER') {
            console.log("DEBUG (Iframe): Message type is correct ('AUTOGENERATE_ANSWER').");
            const autoPrompt = event.data.prompt;
            console.log("DEBUG (Iframe): Received prompt:", autoPrompt);

            if (autoPrompt) {
                 console.log("DEBUG (Iframe): Adding message to chatbox and calling getBotResponse...");
                 // Automatically handle the received prompt
                 addMessageToChatbox('user', autoPrompt);
                 if (userInput) userInput.value = ''; // Clear input field if it exists
                 getBotResponse(autoPrompt);
                 console.log("DEBUG (Iframe): Process complete.");
            } else {
                console.error("DEBUG (Iframe): Prompt was received but it is empty.");
            }
        } else {
            console.warn("DEBUG (Iframe): Received message but type was not 'AUTOGENERATE_ANSWER' or data was missing.");
        }
    });


    // --- CORE FUNCTIONS ---

    /**
     * Switches the current AI model.
     */
    function switchModel(model) {
        currentModel = model;
        // Check chatBox existence before manipulating it
        if (chatBox) chatBox.innerHTML = ''; // Clear chatbox for a fresh start

        if (model === 'pli6lte') {
            if (modelTitle) modelTitle.textContent = 'PLI 6.X5LTE (Fallback Ready)';
            if (pliBtn) pliBtn.classList.add('active');
            if (gemmaBtn) gemmaBtn.classList.remove('active');
            addMessageToChatbox('PLI6.X5', '_-_This is the LTE model_-_');
        } else {
            if (modelTitle) modelTitle.textContent = 'Gemma 3 (Direct)';
            if (gemmaBtn) gemmaBtn.classList.add('active');
            if (pliBtn) pliBtn.classList.remove('active');
            addMessageToChatbox('Gemini', 'Ask me anything!');
        }
    }

    /**
     * Helper function to format message text (markdown bold, line breaks).
     */
    function formatMessageText(text) {
        let formattedText = text;
        // Convert markdown bold: **text** to <strong>text</strong>
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert line breaks to HTML <br> tags
        formattedText = formattedText.replace(/\n/g, '<br>');
        return formattedText;
    }
    
    /**
     * Adds a message to the chat box display.
     */
    function addMessageToChatbox(sender, text) {
        if (!chatBox) return; // Safety check

        const messageElement = document.createElement('div');
        const senderClass = (sender === 'user') ? 'user-message' : 'bot-message';
        messageElement.classList.add('message', senderClass);

        const pElement = document.createElement('p');
        const formattedText = formatMessageText(text);

        const displayedContent = (sender !== 'user') 
            ? `<strong>${sender}:</strong> ${formattedText}` 
            : formattedText;
        
        pElement.innerHTML = displayedContent;
        messageElement.appendChild(pElement);
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    /**
     * Main logic to get bot response, including the robust failure fallback.
     */
    async function getBotResponse(messageText) {
        showTypingIndicator();
        let finalResponse = '';
        let finalSender = 'bot';

        if (currentModel === 'pli6lte') {
            // 1. Attempt to get the response from PLI
            let pliResponse = await getPliResponse(messageText);

            // 2. Define known "unhelpful" content responses
            const unhelpfulContent = [
                "I'm not sure about",
                "I couldn't solve that math problem.", 
                "That's a great question about"
            ];

            // 3. Determine if a fallback is needed
            let needsFallback = false;

            if (pliResponse === null) {
                // Case 1: Server/network error or invalid response.
                needsFallback = true;
                console.log("PLI6LTE failed (server/network error/invalid response). Falling back to Gemma.");
            } else {
                // Case 2: We got a response, but check if it's unhelpful content.
                if (unhelpfulContent.some(phrase => pliResponse.startsWith(phrase))) {
                    needsFallback = true;
                    console.log("PLI6LTE response was unhelpful. Falling back to Gemma.");
                }
            }
            
            // 4. Execute the logic based on the fallback check
            if (needsFallback) {
                let gemmaResponse = await getGemmaResponse(messageText);
                // Clean and simple fallback message format
                finalResponse = `${gemmaResponse}`;
                finalSender = 'Gemini';
            } else {
                // If no fallback was needed, the PLI response was successful and helpful.
                finalResponse = pliResponse;
                finalSender = 'PLI6.X5';
            }

        } else {
            // If the current model is already Gemma, just use it
            finalResponse = await getGemmaResponse(messageText);
            finalSender = 'Gemini';
        }

        hideTypingIndicator();
        if (finalResponse) {
            addMessageToChatbox(finalSender, finalResponse);
        } else {
            // This final fallback message is for when BOTH PLI and Gemini fail.
            addMessageToChatbox('bot', 'Sorry, both AI services seem to be unavailable at the moment.');
        }
    }

    /**
     * Gets a response from the PLI6LTE API using a POST request.
     */
    async function getPliResponse(messageText) {
        try {
            const fullUrl = pliApiUrl;

            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: messageText }),
            });

            // If the response is NOT okay (e.g., 404, 500, etc.)
            if (!response.ok) {
                console.error(`PLI6LTE server error: ${response.status}`);
                return null; // Signal failure
            }

            const data = await response.json();
            
            // Also treat an empty or non-existent response key as a failure
            if (!data || !data.response) {
                console.error("PLI6LTE returned an invalid or empty response object.");
                return null; // Signal failure
            }

            return data.response; // Return the valid response string

        } catch (error) {
            // This catches network errors (e.g., server is down, CORS failure)
            console.error("A network or fetch error occurred with PLI6LTE:", error);
            return null; // Signal failure
        }
    }

    /**
     * Gets a response from the Gemma 3 API.
     */
    async function getGemmaResponse(messageText) {
        if (gemmaApiKey === 'YOUR_API_KEY_HERE' || gemmaApiKey === '') {
            return 'Please add your Google AI API key to chat.js to use the Gemma 3 model.';
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
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error with Gemma 3 API:', error);
            return 'Sorry, something went wrong with the Gemma 3 model.';
        }
    }


    // --- UI HELPER FUNCTIONS (TYPING INDICATOR) ---

    function showTypingIndicator() {
        if (!chatBox) return; // Safety check
        if (document.getElementById('typing-indicator')) return;
        const indicator = document.createElement('div');
        indicator.classList.add('message', 'bot-message', 'typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';
        indicator.id = 'typing-indicator';
        chatBox.appendChild(indicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            chatBox.removeChild(indicator);
        }
    }
    
    // Initial setup to ensure model is set on load
    switchModel(currentModel);
});