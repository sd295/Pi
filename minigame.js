// minigame.js (New "Code Typer" Version)
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    const lessonFile = params.get('lesson');
    if (!subject || !lessonFile) { window.location.href = 'index.html'; return; }
    
    const script = document.createElement('script');
    script.src = `lessons/${subject}/${lessonFile}.js`;
    document.head.appendChild(script);

    script.onload = () => {
        const gameTitle = document.getElementById('game-title');
        const gamePrompt = document.getElementById('game-prompt');
        const promptCode = document.getElementById('prompt-code');
        const userCodeDisplay = document.getElementById('user-code-display');
        const codeInput = document.getElementById('code-input');
        const feedbackOverlay = document.getElementById('feedback-overlay');
        const feedbackBox = document.getElementById('feedback-box');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackText = document.getElementById('feedback-text');
        const nextStepBtn = document.getElementById('next-step-btn');
        const hubLink = document.getElementById('hub-link');

        if (!lessonContent || !lessonContent.minigame || lessonContent.minigame.gameType !== 'code-typer') {
            if (gameTitle) gameTitle.textContent = "Error";
            if (gamePrompt) gamePrompt.textContent = "No 'Code Typer' game was found for this lesson.";
            return;
        }
        if(hubLink) hubLink.href = `${subject}.html`;

        const solutionCode = lessonContent.minigame.solution;

        function initializeGame() {
            const gameData = lessonContent.minigame;
            gameTitle.textContent = gameData.title;
            gamePrompt.textContent = gameData.prompt;
            promptCode.textContent = solutionCode;
            
            codeInput.value = '';
            renderUserCode('');
            codeInput.focus();
        }

        function handleInput() {
            const userInput = codeInput.value;
            renderUserCode(userInput);

            if (userInput === solutionCode) {
                codeInput.disabled = true;
                showFeedback(true);
            }
        }

        function renderUserCode(userInput) {
            let html = '';
            for (let i = 0; i < solutionCode.length; i++) {
                const char = solutionCode[i];
                if (i < userInput.length) {
                    if (userInput[i] === char) {
                        html += `<span class="correct">${char === ' ' ? '&nbsp;' : char}</span>`;
                    } else {
                        html += `<span class="incorrect">${char === ' ' ? '&nbsp;' : char}</span>`;
                    }
                } else {
                    html += `<span class="upcoming">${char === ' ' ? '&nbsp;' : char}</span>`;
                }
            }
            userCodeDisplay.innerHTML = html;
        }
        
        function showFeedback(isCorrect) {
            feedbackOverlay.classList.remove('hidden');
            if (isCorrect) {
                feedbackBox.className = 'correct';
                feedbackTitle.textContent = 'Perfect! 🎉';
                feedbackText.textContent = 'You typed the code exactly right. Great job!';
                nextStepBtn.textContent = 'Continue';
                nextStepBtn.onclick = () => { window.location.href = `${subject}.html`; };
            }
        }
        
        // When the user clicks the display, focus the hidden textarea
        userCodeDisplay.addEventListener('click', () => codeInput.focus());
        codeInput.addEventListener('input', handleInput);
        
        initializeGame();
    };
});