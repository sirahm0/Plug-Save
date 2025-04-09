// Initialize Firestore
const db = firebase.firestore();

// Load current name
async function loadCurrentName() {
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('newName').value = userData.name || '';
        }
    } catch (error) {
        console.error('Error loading name:', error);
        alert('Error loading current name. Please try again.');
    }
}

// Handle name change form submission
document.getElementById('nameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = firebase.auth().currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const newName = document.getElementById('newName').value;

    try {
        // Update name in Firestore
        await db.collection('users').doc(user.uid).update({
            name: newName,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Name updated successfully!');
        // Redirect back to profile settings
        window.location.href = 'profile-settings.html';
    } catch (error) {
        console.error('Error updating name:', error);
        alert('Error updating name: ' + error.message);
    }
});

// Load current name when page loads
document.addEventListener('DOMContentLoaded', loadCurrentName); 