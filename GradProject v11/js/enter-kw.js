// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get references to form elements
    const kwForm = document.getElementById('kwForm');
    const deviceSelect = document.getElementById('deviceSelect');
    
    // Wait for auth state to be ready before loading devices
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadUserDevices();
        } else {
            window.location.href = 'login.html';
        }
    });

    // Add form submit event listener
    kwForm.addEventListener('submit', handleKWSubmit);
});

// Function to load user's devices into the select dropdown
async function loadUserDevices() {
    try {
        const user = firebase.auth().currentUser;
        console.log('Current user:', user); // Debug log

        if (!user) {
            console.log('No user logged in');
            return;
        }

        const db = firebase.firestore();
        console.log('Fetching devices for email:', user.email); // Debug log
        const snapshot = await db.collection('devices')
            .where('userEmail', '==', user.email)
            .get();

        const deviceSelect = document.getElementById('deviceSelect');
        deviceSelect.innerHTML = '<option value="">Select a device</option>';

        snapshot.forEach(doc => {
            const device = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = device.deviceName;
            deviceSelect.appendChild(option);
        });

        console.log('Found devices:', snapshot.size); // Debug log
    } catch (error) {
        console.error('Error loading devices:', error);
        console.error('Error details:', error.message); // Additional error details
        alert('Error loading devices. Please try again.');
    }
}

// Function to handle form submission
async function handleKWSubmit(event) {
    event.preventDefault();

    try {
        const user = firebase.auth().currentUser;
        const kwValue = parseFloat(document.getElementById('kwValue').value);
        const deviceId = document.getElementById('deviceSelect').value;

        if (!deviceId) {
            alert('Please select a device');
            return;
        }

        const db = firebase.firestore();
        await db.collection('devices').doc(deviceId).update({
            kwValue: kwValue,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('KW value saved successfully!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        console.error('Error saving KW value:', error);
        alert('Error saving KW value. Please try again.');
    }
} 

