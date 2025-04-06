// Initialize Firestore
const db = firebase.firestore();

// Get device ID from URL
const urlParams = new URLSearchParams(window.location.search);
const deviceId = urlParams.get('id');

// Function to load device details
async function loadDeviceDetails() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        if (deviceDoc.exists) {
            const deviceData = deviceDoc.data();
            
            // Check if the device belongs to the current user
            if (deviceData.userEmail !== user.email) {
                showPopup('You do not have permission to view this device', false);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                return;
            }
            
            // Update UI with device details
            document.getElementById('deviceName').textContent = deviceData.deviceName;
            document.getElementById('deviceIP').textContent = deviceData.deviceIP;
            document.getElementById('deviceID').textContent = deviceData.deviceID;
            document.getElementById('deviceCreatedAt').textContent = 
                deviceData.createdAt ? new Date(deviceData.createdAt.toDate()).toLocaleDateString() : 'N/A';
            document.getElementById('deviceStatus').textContent = deviceData.status || 'Active';
            document.getElementById('lastUpdated').textContent = 
                deviceData.lastUpdated ? new Date(deviceData.lastUpdated.toDate()).toLocaleString() : 'N/A';
            document.getElementById('energyUsage').textContent = 
                deviceData.energyUsage ? `${deviceData.energyUsage} kWh` : 'Not available';

            // Hide loading and show content
            document.getElementById('loading').style.display = 'none';
            document.getElementById('deviceContent').style.display = 'block';
        } else {
            showPopup('Device not found', false);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Error loading device details:', error);
        showPopup('Error loading device details', false);
    }
}

// Function to delete device
async function deleteDevice() {
    if (!confirm('Are you sure you want to delete this device?')) {
        return;
    }

    try {
        await db.collection('devices').doc(deviceId).delete();
        showPopup('Device deleted successfully');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Error deleting device:', error);
        showPopup('Error deleting device', false);
    }
}

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    if (!deviceId) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    loadDeviceDetails();
}); 