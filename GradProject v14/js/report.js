// Unified popup message
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
  
  function showNoDevicesMessage() {
    const overlay = document.createElement('div');
    overlay.className = 'no-devices-overlay';
    
    const messageBox = document.createElement('div');
    messageBox.className = 'no-devices-box';
    messageBox.innerHTML = `
        <div class="no-devices-content">
            <i class="no-devices-icon">⚠️</i>
            <h3>No Devices Connected</h3>
            <p>You don't have any devices connected to your account.</p>
            <p>Redirecting to dashboard in <span id="countdown">5</span> seconds...</p>
        </div>
    `;
    
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);
    
    let countdown = 5;
    const countdownElement = document.getElementById('countdown');
    
    const timer = setInterval(() => {
        countdown--;
        if (countdownElement) {
            countdownElement.textContent = countdown;
        }
        if (countdown <= 0) {
            clearInterval(timer);
            window.location.href = 'dashboard.html';
        }
    }, 1000);
  }
  
  function drawDailyChart(deviceUsageByDay) {
    const ctx = document.getElementById('dailyTrendChart').getContext('2d');
    const labels = Object.keys(deviceUsageByDay);
    const data = Object.values(deviceUsageByDay);
  
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Usage (kW)',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  function drawMonthlyChart(deviceUsageByMonth) {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
    const labels = Object.keys(deviceUsageByMonth);
    const data = Object.values(deviceUsageByMonth);
  
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Usage (kW)',
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
  
    loadReportData(user);
  });
  
  async function loadReportData(user) {
    const db = firebase.firestore();
  
    try {
      const now = new Date();
      document.getElementById('generationDate').textContent = now.toLocaleString();
  
      const devicesSnapshot = await db.collection('devices')
        .where('ownerId', '==', user.uid)
        .get();
  
      if (devicesSnapshot.empty) {
        showNoDevicesMessage();
        return;
      }
  
      let totalDevices = 0;
      let activeDevices = 0;
      let totalMonthlyUsage = 0;
      let totalMonthlyCost = 0;
  
      const deviceTableBody = document.getElementById('deviceTableBody');
      deviceTableBody.innerHTML = '';
  
      const deviceUsageByDay = {
        'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
      };
  
      const deviceUsageByMonth = {
        'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0,
        'May': 0, 'Jun': 0, 'Jul': 0, 'Aug': 0,
        'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
      };
  
      devicesSnapshot.forEach(doc => {
        const data = doc.data();
        totalDevices++;
  
        const isActive = data.powerStatus === 'on';
        if (isActive) activeDevices++;
  
        const rate = 0.18;
        const monthlyUsage = data.kwValue ? data.kwValue * 30 : 0;
        const monthlyCost = monthlyUsage * rate;
        totalMonthlyUsage += monthlyUsage;
        totalMonthlyCost += monthlyCost;
  
        const row = document.createElement('tr');
        row.innerHTML = `
          <td data-label="Device Name">${data.deviceName || 'Unnamed Device'}</td>
          <td data-label="Status">${isActive ? 'Active' : 'Inactive'}</td>
          <td data-label="Monthly Usage">${monthlyUsage.toFixed(2)} kW</td>
          <td data-label="Monthly Cost">${monthlyCost.toFixed(2)} SAR</td>
          <td data-label="Savings">${(monthlyCost * 0.15).toFixed(2)} SAR</td>
        `;
        deviceTableBody.appendChild(row);
  
        Object.keys(deviceUsageByDay).forEach(day => {
          deviceUsageByDay[day] += monthlyUsage / 7;
        });
  
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        if (deviceUsageByMonth[currentMonth] !== undefined) {
          deviceUsageByMonth[currentMonth] += monthlyUsage;
        }
      });
  
      document.getElementById('totalDevices').textContent = totalDevices;
      document.getElementById('activeDevices').textContent = activeDevices;
      document.getElementById('totalMonthlyUsage').textContent = `${totalMonthlyUsage.toFixed(2)} kW`;
      document.getElementById('totalMonthlyCost').textContent = `${totalMonthlyCost.toFixed(2)} SAR`;
  
      drawDailyChart(deviceUsageByDay);
      drawMonthlyChart(deviceUsageByMonth);
  
      document.getElementById('loading').style.display = 'none';
      document.getElementById('reportContent').style.display = 'block';
  
    } catch (error) {
      console.error('Error loading report data:', error);
      showPopup('Error loading report data', false);
    }
  }
  