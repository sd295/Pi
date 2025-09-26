// practice.js (New, More Robust Version)

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get('subject');
    const lessonFile = params.get('lesson');

    if (!subject || !lessonFile) {
        window.location.href = 'index.html';
        return;
    }

    const script = document.createElement('script');
    script.src = `lessons/${subject}/${lessonFile}.js`;
    document.head.appendChild(script);

    script.onload = () => {
        initializePractice();
    };

    const projectTitle = document.getElementById('project-title');
    const projectInstructions = document.getElementById('project-instructions');
    const codeEditor = document.getElementById('code-editor');
    const livePreview = document.getElementById('live-preview');
    const runBtn = document.getElementById('run-btn');
    const gameLink = document.getElementById('game-link');

    function initializePractice() {
        // --- THIS IS THE CRITICAL FIX ---
        // First, check if lessonContent and its practice property actually exist.
        if (!lessonContent || !lessonContent.practice) {
            // If the lesson has no practice section, show an error message and stop.
            projectTitle.textContent = "Error: No Practice Project Found";
            projectInstructions.innerHTML = "<p>This lesson does not have an associated practice project. Please use the link below to go back.</p>";
            codeEditor.value = "/* An error occurred while loading this project. */";
            if(gameLink) gameLink.style.display = 'none'; // Hide the minigame link
            return; // Stop the function here to prevent the crash.
        }
        // --- END OF FIX ---

        // If we get past the check, we know it's safe to proceed.
        const practiceData = lessonContent.practice;
        
        projectTitle.textContent = practiceData.title;
        projectInstructions.innerHTML = practiceData.instructions;
        codeEditor.value = practiceData.defaultCode;

        // Also, check if a minigame exists for this lesson before showing the link
        if (gameLink && lessonContent.minigame) {
            gameLink.href = `minigame.html?subject=${subject}&lesson=${lessonFile}`;
        } else if (gameLink) {
            gameLink.style.display = 'none';
        }

        updatePreview();
    }

    function updatePreview() {
        const userCode = codeEditor.value;
        const previewDoc = livePreview.contentDocument || livePreview.contentWindow.document;
        previewDoc.open();
        previewDoc.write(userCode);
        previewDoc.close();
    }

    runBtn.addEventListener('click', updatePreview);
});