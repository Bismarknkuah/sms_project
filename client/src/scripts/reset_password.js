document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        document.getElementById('requestForm').style.display = 'none';
        document.getElementById('resetForm').style.display = 'block';
        validateToken(token);
    }
    document.getElementById('newPassword').addEventListener('input', updatePasswordStrength);
});

async function requestReset() {
    const email = document.getElementById('email').value;
    const emailError = document.getElementById('emailError');
    const emailSuccess = document.getElementById('emailSuccess');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        emailSuccess.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('/api/auth/reset-password/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send reset link');

        emailError.style.display = 'none';
        emailSuccess.textContent = 'Reset link sent to your email. Please check your inbox.';
        emailSuccess.style.display = 'block';
    } catch (error) {
        emailError.textContent = error.message;
        emailError.style.display = 'block';
        emailSuccess.style.display = 'none';
    }
}

async function validateToken(token) {
    try {
        const response = await fetch('/api/auth/reset-password/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        if (!response.ok) throw new Error('Invalid or expired token');
    } catch (error) {
        document.getElementById('resetContainer').innerHTML = `
            <div class="logo">S</div>
            <h1>Error</h1>
            <p>${error.message}. Please request a new reset link.</p>
            <a href="/reset_password.html" class="back-link">Request New Link</a>
            <a href="/login.html" class="back-link">Back to Login</a>
        `;
    }
}

async function resetPassword() {
    const token = new URLSearchParams(window.location.search).get('token');
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Password policy: min 8 chars, uppercase, lowercase, number, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        passwordError.textContent = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
        passwordError.style.display = 'block';
        confirmPasswordError.style.display = 'none';
        return;
    }

    if (newPassword !== confirmPassword) {
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPasswordError.style.display = 'block';
        passwordError.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to reset password');

        document.getElementById('resetContainer').innerHTML = `
            <div class="logo">S</div>
            <h1>Success</h1>
            <p>Your password has been reset successfully.</p>
            <a href="/login.html" class="back-link">Back to Login</a>
        `;
        sendResetNotification(data.userId, 'success');
    } catch (error) {
        passwordError.textContent = error.message;
        passwordError.style.display = 'block';
        confirmPasswordError.style.display = 'none';
        sendResetNotification(null, 'failed', error.message);
    }
}

function updatePasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthText = document.getElementById('passwordStrength');
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;

    switch (strength) {
        case 0:
        case 1:
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#ef4444';
            break;
        case 2:
        case 3:
            strengthText.textContent = 'Moderate';
            strengthText.style.color = '#f59e0b';
            break;
        case 4:
        case 5:
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#10b981';
            break;
    }
}

async function sendResetNotification(userId, status, errorMessage = '') {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: status === 'success'
                    ? `Password reset successful for user ${userId}`
                    : `Password reset attempt failed: ${errorMessage}`,
                contentType: 'text/plain',
                subject: 'Password Reset Notification',
                branchId: null // Sent to Security Admins across branches
            })
        });
        if (!response.ok) throw new Error('Failed to send notification');
    } catch (error) {
        console.error('Notification error:', error.message);
    }
}