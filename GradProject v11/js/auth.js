// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVIwKggjCMcHJ9Bkn-rK3CakJYcLLkcnM",
    authDomain: "plugandsavemwa.firebaseapp.com",
    projectId: "plugandsavemwa",
    storageBucket: "plugandsavemwa.firebasestorage.app",
    messagingSenderId: "710630897704",
    appId: "1:710630897704:web:0b1dd210cad5e2efc19d1d",
    measurementId: "G-SHJ8CZL63Q"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

const auth = firebase.auth();

// Function to show popup notification
function showPopup(message, isSuccess = true) {
    // Create popup element if it doesn't exist
    let popup = document.getElementById('notification-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'notification-popup';
        popup.className = 'popup';
        document.body.appendChild(popup);
    }

    // Set popup content and style
    popup.textContent = message;
    popup.className = 'popup ' + (isSuccess ? 'success' : 'error');
    popup.style.display = 'block';

    // Hide popup after 3 seconds
    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.5s ease-in-out';
        setTimeout(() => {
            popup.style.display = 'none';
            popup.style.animation = '';
        }, 500);
    }, 3000);
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Debug: Log current page
    const currentPage = window.location.pathname;
    console.log("Current page:", currentPage);

    // Check if user is already logged in
    auth.onAuthStateChanged((user) => {
        console.log("Auth state changed:", user ? "User logged in" : "No user");
        
        // Handle dashboard page
        if (currentPage.includes('dashboard.html')) {
            if (user) {
                // User is signed in
                document.getElementById('loading').style.display = 'none';
                document.getElementById('userContent').style.display = 'block';
                
                // Fetch user data from Firestore
                firebase.firestore().collection('users').doc('5h2fh4yQGpCmEC40bPPl').get()
                    .then((userDoc) => {
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            document.getElementById('userEmail').textContent = userData.name;
                        } else {
                            document.getElementById('userEmail').textContent = user.email;
                        }
                    })
                    .catch((error) => {
                        console.error('Error fetching user data:', error);
                        document.getElementById('userEmail').textContent = user.email;
                    });
            } else {
                // User is signed out, redirect to login
                window.location.href = 'login.html';
            }
            return;
        }

        // Handle device details page
        if (currentPage.includes('device-details.html')) {
            if (!user) {
                // User is signed out, redirect to login
                window.location.href = 'login.html';
                return;
            }
            return;
        }

        // Handle enter-kw page
        if (currentPage.includes('enter-kw.html')) {
            if (!user) {
                // User is signed out, redirect to login
                window.location.href = 'login.html';
                return;
            }
            return;
        }

        // Handle login page
        if (currentPage.includes('login.html')) {
            if (user) {
                // User is already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
                return;
            }

            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log("Login form submitted");
                    
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;

                    console.log("Email:", email);

                    // Sign in with email and password
                    auth.signInWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            // Login successful
                            const user = userCredential.user;
                            console.log("Login successful:", user.email);
                            showPopup('Login successful!');
                            // Redirect to dashboard after a short delay
                            setTimeout(() => {
                                window.location.href = 'dashboard.html';
                            }, 1500);
                        })
                        .catch((error) => {
                            // Handle errors
                            console.error("Login error:", error);
                            showPopup(error.message, false);
                        });
                });
            }
        }

        // Handle signup page
        if (currentPage.includes('signup.html')) {
            if (user) {
                // User is already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
                return;
            }

            const registrationForm = document.getElementById('registrationForm');
            if (registrationForm) {
                registrationForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    console.log("Registration form submitted");
                    
                    const email = document.getElementById('signupEmail').value;
                    const password = document.getElementById('signupPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;

                    console.log("Email:", email);

                    if (password !== confirmPassword) {
                        showPopup("Passwords don't match!", false);
                        return;
                    }

                    // Create user with email and password
                    auth.createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            // Registration successful
                            const user = userCredential.user;
                            console.log("Registration successful:", user.email);
                            showPopup('Registration successful!');
                            // Redirect to dashboard after a short delay
                            setTimeout(() => {
                                window.location.href = 'dashboard.html';
                            }, 1500);
                        })
                        .catch((error) => {
                            // Handle errors
                            console.error("Registration error:", error);
                            showPopup(error.message, false);
                        });
                });
            }
        }
    });
}); 