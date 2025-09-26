// quiz.js (Final Version with Streak and UI Fixes)

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let currentUser = null;
const params = new URLSearchParams(window.location.search);
const subject = params.get('subject');
const lessonFile = params.get('lesson');

function getFormattedDate(date) {
    return date.toISOString().split('T')[0];
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadAndRouteLesson();
    } else {
        window.location.href = 'login.html';
    }
});

function loadAndRouteLesson() {
    if (!subject || !lessonFile) {
        window.location.href = 'index.html';
        return;
    }
    const script = document.createElement('script');
    script.src = `lessons/${subject}/${lessonFile}.js`;
    document.head.appendChild(script);

    script.onload = () => {
        if (lessonContent.lessonType === 'interactive_discovery') {
            window.location.href = `${lessonContent.url}?subject=${subject}&lesson=${lessonFile}`;
        } else if (!lessonContent.questions || lessonContent.questions.length === 0) {
            window.location.href = `practice.html?subject=${subject}&lesson=${lessonFile}`;
        } else {
            initializeQuiz();
        }
    };
    script.onerror = () => { document.getElementById('lesson-title').textContent = 'Error: Lesson not found.'; };
}

function initializeQuiz() {
    let currentQuestionIndex = 0;
    let score = 0;
    let dailyStreak = 0;
    let sessionStreak = 0; // A separate counter for the current session
    let streakFreezes = 0;
    let selectedAnswer = null;

    const promptText = document.getElementById('prompt-text'),
          optionsContainer = document.getElementById('options-container'),
          checkBtn = document.getElementById('check-btn'),
          feedbackContainer = document.querySelector('.feedback-container'),
          feedbackMessage = document.getElementById('feedback-message'),
          feedbackText = document.getElementById('feedback-text'),
          correctAnswerText = document.getElementById('correct-answer-text'),
          scoreStat = document.getElementById('score-stat'),
          streakStat = document.getElementById('streak-stat'),
          rewardImage = document.getElementById('css-reward-image');
    
    // --- FIX 1: Make sure the lesson title is always set ---
    document.getElementById('lesson-title').textContent = lessonContent.title;

    async function loadProgress() {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data()) {
            const userData = docSnap.data();
            score = userData.score || 0;
            dailyStreak = userData.streak || 0; // Load the REAL daily streak
            streakFreezes = userData.streakFreezes || 0;
            const lastDate = userData.lastCompletedDate;
            
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const todayStr = getFormattedDate(today);
            const yesterdayStr = getFormattedDate(yesterday);
            
            if (lastDate && lastDate !== todayStr && lastDate !== yesterdayStr) {
                if (streakFreezes > 0) {
                    streakFreezes--;
                    await saveStreakData(dailyStreak, yesterdayStr, streakFreezes); 
                } else {
                    dailyStreak = 0; // The daily streak is broken
                }
            }
        }
        updateStats();
    }
    
    // --- FIX 2: This function now ONLY saves the score ---
    async function saveScore() {
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, { 
            score: score, 
            displayName: currentUser.displayName || currentUser.email
        }, { merge: true });
    }

    async function saveStreakData(newStreak, newDate, newFreezes) {
         const userDocRef = doc(db, "users", currentUser.uid);
         await setDoc(userDocRef, {
             streak: newStreak,
             lastCompletedDate: newDate,
             streakFreezes: newFreezes
         }, { merge: true });
    }

    async function markLessonAsComplete() {
        const lessonId = `${subject}-${lessonFile}`;
        const userDocRef = doc(db, "users", currentUser.uid);
        
        await setDoc(userDocRef, { completedLessons: { [lessonId]: true } }, { merge: true });

        const todayStr = getFormattedDate(new Date());
        
        const docSnap = await getDoc(userDocRef);
        let currentDailyStreak = 0, lastDate = null, currentFreezes = 0;

        if (docSnap.exists() && docSnap.data()) {
            const data = docSnap.data();
            currentDailyStreak = data.streak || 0;
            lastDate = data.lastCompletedDate;
            currentFreezes = data.streakFreezes || 0;
        }

        if (lastDate === todayStr) {
            return; 
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getFormattedDate(yesterday);
        
        let newDailyStreak;
        if (lastDate === yesterdayStr) {
            newDailyStreak = currentDailyStreak + 1;
        } else {
            newDailyStreak = 1;
        }
        
        dailyStreak = newDailyStreak; // Update the local variable
        await saveStreakData(newDailyStreak, todayStr, currentFreezes);
        updateStats();
    }

    function loadQuestion() {
        selectedAnswer = null;
        checkBtn.disabled = true;
        checkBtn.textContent = 'Check';
        checkBtn.classList.remove('hidden');
        optionsContainer.className = 'options-grid';
        feedbackMessage.classList.add('hidden');
        optionsContainer.innerHTML = '';
        if (rewardImage) rewardImage.classList.add('hidden');

        if (currentQuestionIndex >= lessonContent.questions.length) {
            markLessonAsComplete();
            promptText.textContent = 'Lesson Complete!';
            document.getElementById('quiz-header').querySelector('h2').textContent = 'Congratulations! 🎉';
            
            const practiceBtn = document.createElement('a');
            practiceBtn.className = 'level-btn';
            practiceBtn.textContent = 'Start Practice Project';
            practiceBtn.href = `practice.html?subject=${subject}&lesson=${lessonFile}`;

            const gameBtn = document.createElement('a');
            gameBtn.className = 'level-btn';
            gameBtn.textContent = 'Play Mini-Game Challenge';
            gameBtn.href = `minigame.html?subject=${subject}&lesson=${lessonFile}`;

            const hubBtn = document.createElement('a');
            hubBtn.className = 'level-btn';
            hubBtn.textContent = 'Back to Subject Hub';
            hubBtn.href = `${subject}.html`;
            
            optionsContainer.className = 'level-selection';
            if(lessonContent.practice) optionsContainer.appendChild(practiceBtn);
            if(lessonContent.minigame) optionsContainer.appendChild(gameBtn);
            optionsContainer.appendChild(hubBtn);
            
            checkBtn.classList.add('hidden');
            return;
        }

        const question = lessonContent.questions[currentQuestionIndex];
        promptText.innerHTML = question.prompt;
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = option;
            button.onclick = () => selectOption(button, option);
            optionsContainer.appendChild(button);
        });
    }

    function selectOption(button, option) {
        const currentlySelected = document.querySelector('.option-btn.selected');
        if (currentlySelected) currentlySelected.classList.remove('selected');
        button.classList.add('selected');
        selectedAnswer = option;
        checkBtn.disabled = false;
    }

    function checkAnswer() {
        const question = lessonContent.questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        feedbackMessage.classList.remove('hidden');
        if (isCorrect) {
            feedbackText.textContent = 'You are correct!';
            correctAnswerText.innerHTML = '';
            score += 10;
            sessionStreak++; // Only update the temporary session streak
            if (question.id === 'image_src_question' && rewardImage) {
                rewardImage.classList.remove('hidden');
            }
        } else {
            feedbackText.textContent = 'Oops! That\'s not right.';
            correctAnswerText.innerHTML = `Correct answer: ${question.correctAnswer}`;
            sessionStreak = 0; // Reset session streak
        }
        
        feedbackContainer.className = isCorrect ? 'feedback-container correct' : 'feedback-container incorrect';
        updateStats();
        saveScore(); // Only save the score, not the streak
        
        checkBtn.textContent = 'Continue';
        checkBtn.onclick = () => {
            currentQuestionIndex++;
            loadQuestion();
            checkBtn.onclick = checkAnswer;
        };
    }

    function updateStats() {
        scoreStat.textContent = `Score: ${score}`;
        // The streak display now shows the REAL daily streak, not the session one.
        streakStat.innerHTML = `Daily Streak: ${dailyStreak} 🔥 <span class="streak-freeze"> | Freezes: ${streakFreezes} ❄️</span>`;
    }
    
    checkBtn.onclick = checkAnswer;
    loadProgress().then(() => {
        loadQuestion();
    });
}