// Initialize Firestore
const db = firebase.firestore();

// Function to display devices
function displayDevices(devices) {
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = '';

    if (devices.length === 0) {
        devicesList.innerHTML = '<p>No devices found. Add your first device!</p>';
        return;
    }

    devices.forEach(device => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'device-card';
        deviceElement.innerHTML = `
            <h3>${device.deviceName}</h3>
            <p>IP Address: ${device.deviceIP}</p>
            <p>Device ID: ${device.deviceID}</p>
            <p>Added on: ${device.createdAt ? new Date(device.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
            <button onclick="deleteDevice('${device.id}')">Delete Device</button>
        `;
        devicesList.appendChild(deviceElement);
    });
}

// Function to delete a device
async function deleteDevice(deviceId) {
    if (!confirm('Are you sure you want to delete this device?')) {
        return;
    }

    try {
        await db.collection('devices').doc(deviceId).delete();
        alert('Device deleted successfully!');
        loadDevices(); // Reload the devices list
    } catch (error) {
        console.error('Error deleting device:', error);
        alert('Error deleting device. Please try again.');
    }
}

// Function to load devices
async function loadDevices() {
    const user = firebase.auth().currentUser;
    console.log('Current user:', user); // Debug log

    if (!user) {
        console.log('No user logged in'); // Debug log
        return;
    }

    try {
        console.log('Fetching devices for email:', user.email); // Debug log
        const snapshot = await db.collection('devices')
            .where('userEmail', '==', user.email)
            .get();

        const devices = [];
        snapshot.forEach(doc => {
            devices.push({ id: doc.id, ...doc.data() });
        });

        console.log('Found devices:', devices); // Debug log
        displayDevices(devices);
    } catch (error) {
        console.error('Error loading devices:', error);
        console.error('Error details:', error.message); // Additional error details
        document.getElementById('devicesList').innerHTML = 
            '<p>Error loading devices. Please try again later.</p>';
    }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User logged in' : 'No user'); // Debug log
    if (user) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('userContent').style.display = 'block';
        document.getElementById('userEmail').textContent = user.email;
        loadDevices();
    } else {
        window.location.href = 'login.html';
    }
}); 