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

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const kwForm = document.getElementById('kwForm');
    const deviceSelect = document.getElementById('deviceSelect');

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadUserDevices();
        } else {
            window.location.href = 'login.html';
        }
    });

    kwForm.addEventListener('submit', handleKWSubmit);
});

// Function to load user's devices into the select dropdown
async function loadUserDevices() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const db = firebase.firestore();
        const snapshot = await db.collection('devices')
            .where('ownerId', '==', user.uid)
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

    } catch (error) {
        console.error('Error loading devices:', error);
        showPopup('Error loading devices. Please try again.', false);
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
            showPopup('Please select a device', false);
            return;
        }

        const db = firebase.firestore();
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        const deviceData = deviceDoc.data();

        console.log('Current device data:', deviceData);

        // Check if device is powered off
        if (deviceData.powerStatus === "off") {
            showPopup('Cannot add KW value: Device is powered off', false);
            return;
        }

        // Check power limit
        if (deviceData.powerLimit && kwValue > deviceData.powerLimit) {
            showPopup(`Cannot add KW value: Exceeds power limit of ${deviceData.powerLimit} KW`, false);
            return;
        }

        // Get current date and month for tracking
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

        // Initialize or get existing usage data
        const dailyUsage = deviceData.dailyUsage || {};
        const monthlyUsage = deviceData.monthlyUsage || {};

        // Get current totals, defaulting to 0 if not set
        const currentDailyTotal = parseFloat(dailyUsage[today] || 0);
        const currentMonthlyTotal = parseFloat(monthlyUsage[currentMonth] || 0);

        console.log('Current daily total:', currentDailyTotal);
        console.log('Current monthly total:', currentMonthlyTotal);

        // Calculate new totals by adding the new value
        const newDailyTotal = currentDailyTotal + kwValue;
        const newMonthlyTotal = currentMonthlyTotal + kwValue;

        // Update the usage objects
        dailyUsage[today] = newDailyTotal;
        monthlyUsage[currentMonth] = newMonthlyTotal;

        console.log('New daily total:', newDailyTotal);
        console.log('New monthly total:', newMonthlyTotal);

        // Update device document
        const updateData = {
            kwValue: kwValue, // Current KW value
            dailyUsage: dailyUsage,
            monthlyUsage: monthlyUsage,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log('Updating with data:', updateData);

        await db.collection('devices').doc(deviceId).update(updateData);

        showPopup(`KW value saved successfully! Today's total: ${newDailyTotal} KW`, true);
        setTimeout(() => {
            window.location.href = 'kw.html';
        }, 1200);

    } catch (error) {
        console.error('Error saving KW value:', error);
        showPopup('Error saving KW value. Please try again.', false);
    }
}

// Function to reset device KW values
async function resetDeviceKW() {
    try {
        const deviceId = document.getElementById('deviceSelect').value;
        if (!deviceId) {
            showPopup('Please select a device first', false);
            return;
        }

        const db = firebase.firestore();
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        const deviceData = deviceDoc.data();

        // Get current date and month
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentMonth = now.toISOString().slice(0, 7);

        // Initialize or get existing usage data
        const dailyUsage = deviceData.dailyUsage || {};
        const monthlyUsage = deviceData.monthlyUsage || {};

        // Reset values
        dailyUsage[today] = 0;
        monthlyUsage[currentMonth] = 0;

        await db.collection('devices').doc(deviceId).update({
            kwValue: 0,
            dailyUsage: dailyUsage,
            monthlyUsage: monthlyUsage,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        showPopup('Device KW values have been reset', true);
        setTimeout(() => {
            window.location.href = 'kw.html';
        }, 1200);

    } catch (error) {
        console.error('Error resetting KW values:', error);
        showPopup('Error resetting KW values. Please try again.', false);
    }
}

// Function to update device details display
async function updateDeviceDetailsDisplay(deviceId) {
    try {
        const db = firebase.firestore();
        const deviceDoc = await db.collection('devices').doc(deviceId).get();
        const deviceData = deviceDoc.data();

        // Get current date and month
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentMonth = now.toISOString().slice(0, 7);

        // Get current totals
        const currentDailyTotal = parseFloat(deviceData.dailyUsage?.[today] || 0);
        const currentMonthlyTotal = parseFloat(deviceData.monthlyUsage?.[currentMonth] || 0);

        // Update the display elements
        const currentConsumptionElement = document.getElementById('currentConsumption');
        const dailyUsageElement = document.getElementById('dailyUsage');
        const monthlyUsageElement = document.getElementById('monthlyUsage');

        if (currentConsumptionElement) {
            currentConsumptionElement.textContent = `${deviceData.kwValue || 0} kW`;
        }
        if (dailyUsageElement) {
            dailyUsageElement.textContent = `${currentDailyTotal} kW`;
        }
        if (monthlyUsageElement) {
            monthlyUsageElement.textContent = `${currentMonthlyTotal} kW`;
        }

    } catch (error) {
        console.error('Error updating device details:', error);
    }
}
