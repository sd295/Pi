document.addEventListener('DOMContentLoaded', () => {
    // Get all scenes and elements
    const sceneFlag = document.getElementById('scene-flag');
    const sceneCapital = document.getElementById('scene-capital');
    const sceneAurora = document.getElementById('scene-aurora');

    // Flag scene elements
    const flagBackground = document.querySelector('.flag-background');
    const flagVertical = document.querySelector('.flag-cross-vertical');
    const flagHorizontal = document.querySelector('.flag-cross-horizontal');
    const paletteButtons = document.querySelectorAll('.palette .color-btn');
    const checkFlagBtn = document.getElementById('check-flag-btn');
    const flagFeedback = sceneFlag.querySelector('.feedback');
    let selectedColor = null;

    // Capital scene elements
    const capitalInput = document.getElementById('capital-input');
    const checkCapitalBtn = document.getElementById('check-capital-btn');
    const capitalFeedback = sceneCapital.querySelector('.feedback');

    // --- SCENE 1: FLAG LOGIC ---
    paletteButtons.forEach(btn => {
        btn.addEventListener('click', () => { selectedColor = btn.dataset.color; });
    });
    flagBackground.addEventListener('click', () => { if (selectedColor) flagBackground.style.backgroundColor = selectedColor; });
    flagVertical.addEventListener('click', (e) => { if (selectedColor) { e.stopPropagation(); flagVertical.style.backgroundColor = selectedColor; } });
    flagHorizontal.addEventListener('click', (e) => { if (selectedColor) { e.stopPropagation(); flagHorizontal.style.backgroundColor = selectedColor; } });

    checkFlagBtn.addEventListener('click', () => {
        const isBgCorrect = flagBackground.style.backgroundColor === 'white';
        const isVertCorrect = flagVertical.style.backgroundColor === 'blue';
        const isHorizCorrect = flagHorizontal.style.backgroundColor === 'blue';

        if (isBgCorrect && isVertCorrect && isHorizCorrect) {
            flagFeedback.textContent = "Correct! The colors of Finland represent snow and lakes.";
            flagFeedback.className = 'feedback correct';
            setTimeout(() => {
                sceneFlag.classList.remove('active');
                sceneCapital.classList.add('active');
            }, 2000);
        } else {
            flagFeedback.textContent = "Not quite right. Try again!";
            flagFeedback.className = 'feedback incorrect';
        }
    });

    // --- SCENE 2: CAPITAL LOGIC ---
    const checkCapitalAnswer = () => {
        const answer = capitalInput.value.trim().toLowerCase();
        if (answer === 'helsinki') {
            capitalFeedback.textContent = "Perfect! Helsinki is the capital.";
            capitalFeedback.className = 'feedback correct';
            setTimeout(() => {
                sceneCapital.classList.remove('active');
                sceneAurora.classList.add('active');
                // End the lesson after the animation
                setTimeout(() => { window.location.href = 'css.html'; }, 8000);
            }, 2000);
        } else {
            capitalFeedback.textContent = "That's not it. Need a hint? It starts with 'H'.";
            capitalFeedback.className = 'feedback incorrect';
        }
    };
    checkCapitalBtn.addEventListener('click', checkCapitalAnswer);
    capitalInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') checkCapitalAnswer(); });
});