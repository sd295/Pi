// script.js
document.addEventListener('DOMContentLoaded', () => {
    // State variables
    let currentQuestionIndex = 0;
    let score = 0;
    let streak = 0;
    let selectedAnswer = null;

    // DOM element references
    const promptText = document.getElementById('prompt-text');
    const optionsContainer = document.getElementById('options-container');
    const checkBtn = document.getElementById('check-btn');
    const feedbackContainer = document.querySelector('.feedback-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const feedbackText = document.getElementById('feedback-text');
    const correctAnswerText = document.getElementById('correct-answer-text');
    const scoreStat = document.getElementById('score-stat');
    const streakStat = document.getElementById('streak-stat');

    function loadQuestion() {
        selectedAnswer = null;
        checkBtn.disabled = true;
        checkBtn.textContent = 'Check';
        feedbackContainer.className = 'feedback-container';
        feedbackMessage.classList.add('hidden');
        optionsContainer.innerHTML = '';

        if (currentQuestionIndex >= lessonData.length) {
            promptText.textContent = 'Lesson Complete!';
            document.getElementById('quiz-header').querySelector('h2').textContent = 'Congratulations! 🎉';
            checkBtn.textContent = 'Play Again';
            checkBtn.disabled = false;
            checkBtn.onclick = () => window.location.reload();
            return;
        }

        const question = lessonData[currentQuestionIndex];
        
        // Use .innerHTML to render the <code> tags correctly
        promptText.innerHTML = question.prompt;

        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            // Use .innerHTML here as well
            button.innerHTML = option;
            button.onclick = () => selectOption(button, option);
            optionsContainer.appendChild(button);
        });
    }

    function selectOption(button, option) {
        const currentlySelected = document.querySelector('.option-btn.selected');
        if (currentlySelected) {
            currentlySelected.classList.remove('selected');
        }

        button.classList.add('selected');
        selectedAnswer = option;
        checkBtn.disabled = false;
    }

    function checkAnswer() {
        const question = lessonData[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        feedbackMessage.classList.remove('hidden');
        if (isCorrect) {
            feedbackContainer.className = 'feedback-container correct';
            feedbackText.textContent = 'You are correct!';
            correctAnswerText.innerHTML = '';
            score += 10;
            streak++;
        } else {
            feedbackContainer.className = 'feedback-container incorrect';
            feedbackText.textContent = 'Oops! That\'s not right.';
            // Use .innerHTML to render the correct answer's <code> tags
            correctAnswerText.innerHTML = `Correct answer: ${question.correctAnswer}`;
            streak = 0;
        }

        updateStats();

        checkBtn.textContent = 'Continue';
        checkBtn.onclick = () => {
            currentQuestionIndex++;
            loadQuestion();
            checkBtn.onclick = checkAnswer;
        };
    }

    function updateStats() {
        scoreStat.textContent = `Score: ${score}`;
        streakStat.textContent = `Streak: ${streak} 🔥`;
    }

    checkBtn.onclick = checkAnswer;
    loadQuestion();
});