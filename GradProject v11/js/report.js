// Initialize Firestore
const db = firebase.firestore();

// Function to load report data
async function loadReportData() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Set report generation date
        const now = new Date();
        document.getElementById('generationDate').textContent = now.toLocaleString();
        
        // Get all devices for the current user
        const devicesSnapshot = await db.collection('devices')
            .where('userEmail', '==', user.email)
            .get();
        
        if (devicesSnapshot.empty) {
            showNoDevicesMessage();
            return;
        }
        
        // Initialize summary variables
        let totalDevices = 0;
        let activeDevices = 0;
        let totalMonthlyUsage = 0;
        let totalMonthlyCost = 0;
        let totalSavings = 0;
        
        // Process each device
        const deviceTableBody = document.getElementById('deviceTableBody');
        deviceTableBody.innerHTML = ''; // Clear existing rows
        
        devicesSnapshot.forEach(doc => {
            const deviceData = doc.data();
            totalDevices++;
            
            // Check if device is active
            if (deviceData.powerStatus === 'on') {
                activeDevices++;
            }
            
            // Calculate monthly usage and cost
            const currentRate = 0.18; // Default rate in SAR per kWh
            const monthlyUsage = deviceData.kwValue ? deviceData.kwValue * 30 : 0;
            const monthlyCost = monthlyUsage * currentRate;
            totalMonthlyUsage += monthlyUsage;
            totalMonthlyCost += monthlyCost;
            
            // Calculate savings (example: 15% savings from smart management)
            const deviceSavings = monthlyCost * 0.15;
            totalSavings += deviceSavings;
            
            // Add device row to table
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${deviceData.deviceName || 'Unnamed Device'}</td>
                <td>${deviceData.powerStatus === 'on' ? 'Active' : 'Inactive'}</td>
                <td>${monthlyUsage.toFixed(2)} kW</td>
                <td>${monthlyCost.toFixed(2)} SAR</td>
                <td>${deviceSavings.toFixed(2)} SAR</td>
            `;
            deviceTableBody.appendChild(row);
        });
        
        // Update summary values
        document.getElementById('totalDevices').textContent = totalDevices;
        document.getElementById('activeDevices').textContent = activeDevices;
        document.getElementById('totalMonthlyUsage').textContent = `${totalMonthlyUsage.toFixed(2)} kW`;
        document.getElementById('totalMonthlyCost').textContent = `${totalMonthlyCost.toFixed(2)} SAR`;
        
        // Update savings values
        document.getElementById('monthlySavings').textContent = `${totalSavings.toFixed(2)} SAR`;
        document.getElementById('annualSavings').textContent = `${(totalSavings * 12).toFixed(2)} SAR`;
        
        // Calculate carbon footprint reduction (example: 0.5 kg CO2 per kWh saved)
        const carbonReduction = totalMonthlyUsage * 0.15 * 0.5; // 15% savings, 0.5 kg CO2 per kWh
        document.getElementById('carbonReduction').textContent = `${carbonReduction.toFixed(2)} kg CO₂`;
        
        // Generate recommendations
        generateRecommendations(devicesSnapshot);
        
        // Hide loading and show content
        document.getElementById('loading').style.display = 'none';
        document.getElementById('reportContent').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading report data:', error);
        showPopup('Error loading report data', false);
    }
}

// Function to show message when no devices are found
function showNoDevicesMessage() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('reportContent').style.display = 'block';
    
    const reportCard = document.getElementById('reportCard');
    const noDevicesMessage = document.createElement('div');
    noDevicesMessage.className = 'no-devices-message';
    noDevicesMessage.innerHTML = `
        <h3>No Devices Found</h3>
        <p>You don't have any devices added to your account yet.</p>
        <p>Add devices to generate energy consumption reports.</p>
        <button class="primary-button" onclick="window.location.href='addDevice.html'">Add Device</button>
    `;
    
    reportCard.appendChild(noDevicesMessage);
}

// Function to generate recommendations based on device data
function generateRecommendations(devicesSnapshot) {
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = ''; // Clear existing recommendations
    
    // Default recommendations
    const defaultRecommendations = [
        "Set power limits for your devices to prevent excessive consumption.",
        "Use the scheduling feature to turn off devices when not in use.",
        "Monitor your energy usage regularly to identify high-consumption devices.",
        "Consider upgrading to more energy-efficient devices for long-term savings."
    ];
    
    // Add default recommendations
    defaultRecommendations.forEach(recommendation => {
        const recommendationItem = document.createElement('div');
        recommendationItem.className = 'recommendation-item';
        recommendationItem.innerHTML = `<p>${recommendation}</p>`;
        recommendationsList.appendChild(recommendationItem);
    });
    
    // Add device-specific recommendations
    devicesSnapshot.forEach(doc => {
        const deviceData = doc.data();
        
        // Check for high consumption devices
        if (deviceData.kwValue > 100) {
            const highConsumptionItem = document.createElement('div');
            highConsumptionItem.className = 'recommendation-item';
            highConsumptionItem.innerHTML = `<p>Your device "${deviceData.deviceName || 'Unnamed Device'}" has high monthly consumption. Consider setting stricter power limits or replacing it with a more efficient model.</p>`;
            recommendationsList.appendChild(highConsumptionItem);
        }
        
        // Check for devices without power limits
        if (!deviceData.powerLimit && !deviceData.costLimit) {
            const noLimitsItem = document.createElement('div');
            noLimitsItem.className = 'recommendation-item';
            noLimitsItem.innerHTML = `<p>Set power or cost limits for "${deviceData.deviceName || 'Unnamed Device'}" to prevent unexpected energy costs.</p>`;
            recommendationsList.appendChild(noLimitsItem);
        }
    });
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


// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    loadReportData();
}); 