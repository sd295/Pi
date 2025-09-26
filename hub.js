// hub.js (Final Version with Lesson Unlocking Logic)

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const hubContainer = document.querySelector('.hub-container');
    const subject = hubContainer.dataset.subject;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadAndDisplayProgress(user);
        } else {
            window.location.href = 'login.html';
        }
    });

    async function loadAndDisplayProgress(user) {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        let completedLessons = {};
        if (docSnap.exists() && docSnap.data().completedLessons) {
            completedLessons = docSnap.data().completedLessons;
        }

        // Get a list of all lesson buttons on the page
        const levelButtons = document.querySelectorAll('.level-btn');

        // Loop through the buttons to update their state
        levelButtons.forEach((button, index) => {
            const lessonFile = button.dataset.lesson;
            const lessonId = `${subject}-${lessonFile}`;

            // --- Part 1: Mark completed lessons as green ---
            if (completedLessons[lessonId]) {
                button.classList.add('completed');
                if (!button.querySelector('.checkmark')) {
                    button.innerHTML += '<span class="checkmark">✓</span>';
                }
            }

            // --- Part 2: Unlock the next lesson in the sequence ---
            // The first lesson (index 0) is always unlocked.
            if (index === 0) {
                button.disabled = false;
                return; // Go to the next button in the loop
            }

            // For all other buttons, find the PREVIOUS button in the list.
            const previousButton = levelButtons[index - 1];
            const prevLessonFile = previousButton.dataset.lesson;
            const prevLessonId = `${subject}-${prevLessonFile}`;

            // If the PREVIOUS lesson is in our completed list, unlock the CURRENT one.
            if (completedLessons[prevLessonId]) {
                button.disabled = false;
            }
        });
    }

    // This part remains the same. It only handles what happens when you click a button.
    const levelButtons = document.querySelectorAll('.level-btn');
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            const lessonFile = button.dataset.lesson;
            window.location.href = `quiz.html?subject=${subject}&lesson=${lessonFile}`;
        });
    });
});