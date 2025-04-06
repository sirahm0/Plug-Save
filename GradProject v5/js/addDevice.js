// Initialize Firestore
const db = firebase.firestore();

// Function to generate a random device ID
function generateDeviceID() {
    return 'DEV_' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Check authentication state
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
        return;
    }
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Handle form submission
    const deviceForm = document.getElementById('deviceForm');
    if (deviceForm) {
        deviceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const deviceName = document.getElementById('deviceName').value;
            const deviceIP = document.getElementById('deviceIP').value;
            
            try {
                const user = firebase.auth().currentUser;
                if (!user) {
                    throw new Error('No user logged in');
                }

                // Add device to Firestore with auto-generated document ID
                await db.collection('devices').add({
                    userEmail: user.email,
                    deviceName: deviceName,
                    deviceIP: deviceIP,
                    deviceID: generateDeviceID(),
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Show success message
                alert('Device added successfully!');
                
                // Clear form
                deviceForm.reset();
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('Error adding device:', error);
                alert('Error adding device. Please try again.');
            }
        });
    } else {
        console.error('Device form not found');
    }
});

// Function to switch to dashboard
function switchToDash() {
    window.location.href = 'dashboard.html';
}