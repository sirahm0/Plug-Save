// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful');
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Navigation functions
function switchToLogin() {
    window.location.href = "login.html";
}

function switchToSignup() {
    window.location.href = "signup.html";
}

function switchToDash() {
    window.location.href = "dashboard.html";
}

function switchToAddDev() {
    window.location.href = "addDevice.html";
}

function logout() {
    firebase.auth().signOut()
        .then(() => {
            // Sign-out successful
            window.location.href = 'login.html';
        })
        .catch((error) => {
            // An error happened
            showPopup(error.message, false);
        });
}