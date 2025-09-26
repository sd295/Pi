// login.js

// Import the Firebase services and functions we need
import { auth } from './firebase-config.js';
import { 
    // NEW: Import GoogleAuthProvider
    GithubAuthProvider, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // NEW: Get reference to the Google button
    const googleBtn = document.getElementById('google-btn');
    const githubBtn = document.getElementById('github-btn');
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const errorMessage = document.getElementById('error-message');

    // NEW: Handle Google Sign-In
    googleBtn.addEventListener('click', () => {
        const provider = new GoogleAuthProvider(); // Create a Google provider
        signInWithPopup(auth, provider)
            .then((result) => {
                // User is signed in! Redirect to the main page.
                window.location.href = 'index.html';
            })
            .catch((error) => {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            });
    });

    // Handle GitHub Sign-In (no changes here)
    githubBtn.addEventListener('click', () => {
        const provider = new GithubAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
            });
    });

    // Handle Email/Password Sign-In and Sign-Up (no changes here)
    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            errorMessage.classList.remove('hidden');
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                if (error.code === 'auth/user-not-found') {
                    createUserWithEmailAndPassword(auth, email, password)
                        .then((userCredential) => {
                            window.location.href = 'index.html';
                        })
                        .catch((createError) => {
                            errorMessage.textContent = createError.message;
                            errorMessage.classList.remove('hidden');
                        });
                } else {
                    errorMessage.textContent = error.message;
                    errorMessage.classList.remove('hidden');
                }
            });
    });
});