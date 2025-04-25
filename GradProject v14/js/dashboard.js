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

  function displayDevices(devices) {
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = '';
  
    if (devices.length === 0) {
      devicesList.innerHTML = `
        <p>No devices found. Add your first device!</p>
        <button class="primary-button" onclick="window.location.href='addDevice.html'">Add Device</button>
      `;
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
        <div class="device-actions">
          <button onclick="viewDeviceDetails('${device.docId}')" class="view-button">View More</button>
        </div>
      `;
      devicesList.appendChild(deviceElement);
    });
  }
  function showNoDevicesMessage() {
    const devicesList = document.getElementById('devicesList');
    devicesList.innerHTML = `
        <p>No devices found. Add your first device!</p>
        <button class="primary-button" onclick="window.location.href='addDevice.html'">Add Device</button>
    `;
  }

  async function loadDevices(userId) {
    try {
      const snapshot = await db.collection('devices').where('ownerId', '==', userId).get();
      const devices = [];
      snapshot.forEach(doc => {
        const deviceData = doc.data();
        deviceData.docId = doc.id;
        devices.push(deviceData);
      });
  
      if (devices.length === 0) {
        showNoDevicesMessage();
      } else {
        displayDevices(devices);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      showPopup('Error loading devices. Please try again later.', false);
    }
  }
  

  
  function viewDeviceDetails(deviceId) {
    window.location.href = `device-details.html?id=${deviceId}`;
  }
  
  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('userContent').style.display = 'block';
  
      try {
        const userDoc = await db.collection("user").doc(user.uid).get();
        const userName = userDoc.exists ? userDoc.data().name : user.email;
        
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
          userEmailElement.textContent = userName;
        } else {
          console.error("Element #userEmail not found");
        }
  
        document.getElementById("welcomeUser").innerText = `Welcome, ${userName}!`;
  
        loadDevices(user.uid);
      } catch (error) {
        console.error("Error fetching user info:", error);
        showPopup('Error fetching user info', false);
      }
    } else {
      window.location.href = 'login.html';
    }
  });
  