// Initialize Firestore
const db = firebase.firestore();

// Load user profile data and device statistics
async function loadProfile() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('userName').value = userData.name || '';
            document.getElementById('userEmail').value = user.email;
        }

        // Get device statistics
        const devicesSnapshot = await db.collection('devices')
            .where('userEmail', '==', user.email)
            .get();

        const totalDevices = devicesSnapshot.size;
        let activeDevices = 0;
        let totalSavings = 0;

        devicesSnapshot.forEach(doc => {
            const device = doc.data();
            if (device.isActive) {
                activeDevices++;
            }
            totalSavings += device.totalSavings || 0;
        });

        // Update statistics in the UI
        document.getElementById('totalDevices').textContent = totalDevices;
        document.getElementById('activeDevices').textContent = activeDevices;
        document.getElementById('totalSavings').textContent = `$${totalSavings.toFixed(2)}`;

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile data. Please try again.');
    }
}

// Update profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        // Update name in Firestore
        await db.collection('users').doc(user.uid).update({
            name: userName,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update email if changed
        if (userEmail !== user.email) {
            if (!currentPassword) {
                throw new Error('Current password is required to change email');
            }
            // Reauthenticate before changing email
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await user.reauthenticateWithCredential(credential);
            await user.updateEmail(userEmail);
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                throw new Error('Current password is required to change password');
            }
            // Reauthenticate before changing password
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPassword);
        }

        alert('Profile updated successfully!');
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile: ' + error.message);
    }
});

// Load profile when page loads
document.addEventListener('DOMContentLoaded', loadProfile); 