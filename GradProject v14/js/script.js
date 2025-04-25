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

function switchToAddKW() {
    window.location.href = "enter-kw.html";
}

function switchToReport() {
    window.location.href = "report.html";
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

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('signupPassword');
    const policyItems = {
        lengthCheck: /.{8,}/,
        uppercaseCheck: /[A-Z]/,
        lowercaseCheck: /[a-z]/,
        numberCheck: /[0-9]/
    };

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        Object.entries(policyItems).forEach(([id, regex]) => {
            const element = document.getElementById(id);
            const icon = element.querySelector('.policy-icon');
            
            if (regex.test(password)) {
                element.classList.add('valid');
                element.classList.remove('invalid');
                icon.textContent = '✓';
                icon.style.color = '#28a745';
            } else {
                element.classList.add('invalid');
                element.classList.remove('valid');
                icon.textContent = '❌';
                icon.style.color = '#dc3545';
            }
        });
    });
});