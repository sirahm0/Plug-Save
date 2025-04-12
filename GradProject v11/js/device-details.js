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
            document.getElementById('deviceName').textContent = deviceData.deviceName || 'Unnamed Device';
            document.getElementById('deviceIP').textContent = deviceData.deviceIP || 'Not available';
            document.getElementById('deviceID').textContent = deviceData.deviceID || deviceId;
            document.getElementById('deviceCreatedAt').textContent = 
                deviceData.createdAt ? new Date(deviceData.createdAt.toDate()).toLocaleDateString() : 'N/A';
            document.getElementById('lastUpdated').textContent = 
                deviceData.lastUpdated ? new Date(deviceData.lastUpdated.toDate()).toLocaleString() : 'N/A';
            
            // Update power status
            const powerStatus = deviceData.powerStatus || 'off';
            const powerStatusElement = document.getElementById('powerStatus');
            powerStatusElement.textContent = powerStatus.charAt(0).toUpperCase() + powerStatus.slice(1);
            powerStatusElement.className = 'status-value ' + powerStatus;
            
            // Update toggle button
            const toggleButton = document.getElementById('togglePower');
            toggleButton.textContent = powerStatus === 'on' ? 'Turn Off' : 'Turn On';
            toggleButton.className = 'toggle-button ' + powerStatus;
            
            // Update current time
            updateCurrentTime();
            
            // Update energy consumption
            document.getElementById('currentConsumption').textContent = 
                deviceData.kwValue ? `${deviceData.kwValue.toFixed(2)} kW` : '0.00 kW';
            document.getElementById('todayUsage').textContent = 
                deviceData.kwValue ? `${deviceData.kwValue.toFixed(2)} kW` : '0.00 kW';
            document.getElementById('monthlyUsage').textContent = 
                deviceData.kwValue ? `${(deviceData.kwValue * 30).toFixed(2)} kW` : '0.00 kW';
            
            // Update cost information
            const currentRate = 0.18; // Default rate in SAR per kWh
            document.getElementById('currentRate').textContent = 
                `${currentRate.toFixed(2)} SAR/kWh`;
            document.getElementById('todayCost').textContent = 
                deviceData.kwValue ? `${(deviceData.kwValue * currentRate).toFixed(2)} SAR` : '0.00 SAR';
            document.getElementById('monthlyCost').textContent = 
                deviceData.kwValue ? `${(deviceData.kwValue * currentRate * 30).toFixed(2)} SAR` : '0.00 SAR';

            // Update power limits
            updatePowerLimits(deviceData);

            // Hide loading and show content
            document.getElementById('loading').style.display = 'none';
            document.getElementById('deviceContent').style.display = 'block';

            // Check if limits are exceeded
            checkPowerLimits(deviceData);
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

// Function to update current time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('currentTime').textContent = timeString;
}

// Function to toggle device power
async function toggleDevicePower() {
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
                showPopup('You do not have permission to control this device', false);
                return;
            }
            
            // Toggle power status
            const currentStatus = deviceData.powerStatus || 'off';
            const newStatus = currentStatus === 'on' ? 'off' : 'on';
            
            // Update in Firestore
            await db.collection('devices').doc(deviceId).update({
                powerStatus: newStatus,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update UI
            const powerStatusElement = document.getElementById('powerStatus');
            powerStatusElement.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            powerStatusElement.className = 'status-value ' + newStatus;
            
            const toggleButton = document.getElementById('togglePower');
            toggleButton.textContent = newStatus === 'on' ? 'Turn Off' : 'Turn On';
            toggleButton.className = 'toggle-button ' + newStatus;
            
            showPopup(`Device turned ${newStatus}`, true);
        }
    } catch (error) {
        console.error('Error toggling device power:', error);
        showPopup('Error toggling device power', false);
    }
}

// Function to show delete confirmation
function showDeleteConfirmation() {
    document.getElementById('deleteConfirmation').classList.add('active');
}

// Function to hide delete confirmation
function hideDeleteConfirmation() {
    document.getElementById('deleteConfirmation').classList.remove('active');
}

// Function to confirm device deletion
async function confirmDelete() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        await db.collection('devices').doc(deviceId).delete();
        showPopup('Device deleted successfully', true);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        console.error('Error deleting device:', error);
        showPopup('Error deleting device', false);
    }
}

// Function to show popup message
function showPopup(message, isSuccess = true) {
    const popup = document.createElement('div');
    popup.className = `popup ${isSuccess ? 'success' : 'error'}`;
    popup.textContent = message;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 500);
    }, 3000);
}

// Function to update power limits display
function updatePowerLimits(deviceData) {
    const powerLimit = deviceData.powerLimit || null;
    const costLimit = deviceData.costLimit || null;
    const limitPeriod = deviceData.limitPeriod || null;

    document.getElementById('currentPowerLimit').textContent = 
        powerLimit ? `${powerLimit.toFixed(2)} kW` : 'Not set';
    document.getElementById('currentCostLimit').textContent = 
        costLimit ? `${costLimit.toFixed(2)} SAR` : 'Not set';
    document.getElementById('currentLimitPeriod').textContent = 
        limitPeriod ? limitPeriod.charAt(0).toUpperCase() + limitPeriod.slice(1) : 'Not set';

    // Update form fields with existing values
    document.getElementById('powerLimit').value = powerLimit || '';
    document.getElementById('costLimit').value = costLimit || '';
    document.getElementById('limitPeriod').value = limitPeriod || 'daily';
    
    // Update button visibility
    document.getElementById('removePowerLimit').style.display = powerLimit ? 'block' : 'none';
    document.getElementById('removeCostLimit').style.display = costLimit ? 'block' : 'none';
}

// Function to check if power limits are exceeded
function checkPowerLimits(deviceData) {
    const powerLimit = deviceData.powerLimit;
    const costLimit = deviceData.costLimit;
    const limitPeriod = deviceData.limitPeriod;
    const currentConsumption = deviceData.kwValue || 0;
    const currentRate = 0.18; // Default rate in SAR per kWh
    const todayCost = currentConsumption * currentRate;
    const monthlyCost = todayCost * 30;

    if (powerLimit && currentConsumption > powerLimit) {
        showPopup(`Power limit exceeded! Current consumption: ${currentConsumption.toFixed(2)} kW`, false);
        if (deviceData.powerStatus === 'on') {
            toggleDevicePower();
        }
    }

    if (costLimit) {
        if (limitPeriod === 'daily' && todayCost > costLimit) {
            showPopup(`Daily cost limit exceeded! Current cost: ${todayCost.toFixed(2)} SAR`, false);
            if (deviceData.powerStatus === 'on') {
                toggleDevicePower();
            }
        } else if (limitPeriod === 'monthly' && monthlyCost > costLimit) {
            showPopup(`Monthly cost limit exceeded! Current cost: ${monthlyCost.toFixed(2)} SAR`, false);
            if (deviceData.powerStatus === 'on') {
                toggleDevicePower();
            }
        }
    }
}

// Function to save power limits
async function savePowerLimits() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const powerLimit = parseFloat(document.getElementById('powerLimit').value);
    const costLimit = parseFloat(document.getElementById('costLimit').value);
    const limitPeriod = document.getElementById('limitPeriod').value;

    if (isNaN(powerLimit) && isNaN(costLimit)) {
        showPopup('Please enter at least one limit value', false);
        return;
    }

    try {
        const updateData = {
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Always update all fields, even if they're empty
        updateData.powerLimit = isNaN(powerLimit) ? null : powerLimit;
        updateData.costLimit = isNaN(costLimit) ? null : costLimit;
        updateData.limitPeriod = limitPeriod || 'daily';

        await db.collection('devices').doc(deviceId).update(updateData);
        showPopup('Power limits saved successfully', true);
        
        // Reload device details to update the UI
        loadDeviceDetails();
    } catch (error) {
        console.error('Error saving power limits:', error);
        showPopup('Error saving power limits', false);
    }
}

// Function to remove power limit
async function removePowerLimit() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        await db.collection('devices').doc(deviceId).update({
            powerLimit: null,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        document.getElementById('powerLimit').value = '';
        document.getElementById('currentPowerLimit').textContent = 'Not set';
        document.getElementById('removePowerLimit').style.display = 'none';
        
        showPopup('Power limit removed successfully', true);
    } catch (error) {
        console.error('Error removing power limit:', error);
        showPopup('Error removing power limit', false);
    }
}

// Function to remove cost limit
async function removeCostLimit() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        await db.collection('devices').doc(deviceId).update({
            costLimit: null,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        document.getElementById('costLimit').value = '';
        document.getElementById('currentCostLimit').textContent = 'Not set';
        document.getElementById('removeCostLimit').style.display = 'none';
        
        showPopup('Cost limit removed successfully', true);
    } catch (error) {
        console.error('Error removing cost limit:', error);
        showPopup('Error removing cost limit', false);
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set up toggle power button
    const toggleButton = document.getElementById('togglePower');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleDevicePower);
    }
    
    // Set up save limits button
    const saveLimitsButton = document.getElementById('saveLimits');
    if (saveLimitsButton) {
        saveLimitsButton.addEventListener('click', savePowerLimits);
    }
    
    // Set up remove power limit button
    const removePowerLimitButton = document.getElementById('removePowerLimit');
    if (removePowerLimitButton) {
        removePowerLimitButton.addEventListener('click', removePowerLimit);
    }
    
    // Set up remove cost limit button
    const removeCostLimitButton = document.getElementById('removeCostLimit');
    if (removeCostLimitButton) {
        removeCostLimitButton.addEventListener('click', removeCostLimit);
    }
    
    // Update time every second
    setInterval(updateCurrentTime, 1000);
});

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