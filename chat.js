// chat.js - Logic for the chatbot interface

// Get references to the HTML elements we need to interact with
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// The URL of your PythonAnywhere chatbot API
const apiUrl = 'https://fhf567456745.pythonanywhere.com/r/';

// Listen for when the user submits the form (by clicking Send or pressing Enter)
chatForm.addEventListener('submit', function(event) {
    // Prevent the form from actually submitting and reloading the page
    event.preventDefault();

    // Get the user's message and trim any extra whitespace
    const messageText = userInput.value.trim();

    // If the message isn't empty, process it
    if (messageText) {
        // Add the user's message to the chat box
        addMessageToChatbox('user', messageText);
        
        // Clear the input field for the next message
        userInput.value = '';
        
        // Get a response from the bot
        getBotResponse(messageText);
    }
});

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

    // Automatically scroll to the bottom to show the new message
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Sends the user's message to the API and displays the bot's response.
 * @param {string} messageText - The user's message.
 */
async function getBotResponse(messageText) {
    // Show a "typing..." indicator while we wait for the response
    showTypingIndicator();

    try {
        // Construct the full API URL. We must encode the user's message
        // to handle special characters and spaces correctly in a URL.
        const encodedMessage = encodeURIComponent(messageText);
        const fullUrl = apiUrl + encodedMessage;

        // Use the 'fetch' API to make a request to the server
        const response = await fetch(fullUrl);
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        // Parse the JSON response from the server
        const data = await response.json();
        
        // Remove the "typing..." indicator
        hideTypingIndicator();

        // Add the bot's response to the chat box
        addMessageToChatbox('bot', data.response);

    } catch (error) {
        // If something goes wrong (e.g., network error, server down)
        console.error("Error fetching bot response:", error);
        hideTypingIndicator();
        addMessageToChatbox('bot', 'Sorry, I seem to be having trouble connecting. Please try again later.');
    }
}

/**
 * Shows a "typing..." animation in the chat box.
 */
function showTypingIndicator() {
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
