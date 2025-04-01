function switchToLogin() {
    window.location.href = "login.html";
}

function switchToSignup(){
    window.location.href = "signup.html";
}

function switchToDash(){
    window.location.href = "dashboard.html";
}

function switchToAddDev(){
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