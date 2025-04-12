// Initialize Firebase Auth
const auth = firebase.auth();

// Handle password change form submission
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    try {
        // Reauthenticate user before changing password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        alert('Password changed successfully!');
        // Clear form
        document.getElementById('passwordForm').reset();
        
        // Redirect back to profile settings
        window.location.href = 'profile-settings.html';
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password: ' + error.message);
    }
}); 