// Unified error/success popup
function showPopup(message, isSuccess = true) {
    const popup = document.createElement('div');
    popup.className = 'popup ' + (isSuccess ? 'success' : 'error');
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 500);
    }, 3000);
}

const db = firebase.firestore();

function generateDeviceID() {
    return 'DEV_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

firebase.auth().onAuthStateChanged((user) => {
    if (!user) window.location.href = 'login.html';
});

document.addEventListener('DOMContentLoaded', () => {
    const deviceForm = document.getElementById('deviceForm');
    if (deviceForm) {
        deviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const deviceName = document.getElementById('deviceName').value;
            const deviceIP = document.getElementById('deviceIP').value;

            const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
            if (!ipRegex.test(deviceIP)) {
                showPopup("Invalid IP address format. Please enter a correct IP like 192.168.1.1", false);
                return;
            }

            try {
                const user = firebase.auth().currentUser;
                if (!user) throw new Error('No user logged in');

                await db.collection('devices').add({
                    userEmail: user.email,
                    ownerId: user.uid, 
                    deviceName,
                    deviceIP,
                    deviceID: generateDeviceID(),
                    status: "OFF",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                showPopup('Device added successfully!', true);
                deviceForm.reset();
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Error adding device:', error);
                showPopup('Error adding device. Please try again.', false);
            }
        });
    }
});
