function toggleBranchField() {
    const role = document.getElementById('role').value;
    const branchGroup = document.getElementById('branchGroup');
    if (role === 'super_admin') {
        branchGroup.style.display = 'none';
        document.getElementById('branch').removeAttribute('required');
    } else {
        branchGroup.style.display = 'block';
        document.getElementById('branch').setAttribute('required', '');
    }
}

async function login() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const branch = role === 'super_admin' ? null : document.getElementById('branch').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, branch, role })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and redirect based on role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);
        if (branch) localStorage.setItem('branch', branch);

        switch (role) {
            case 'super_admin':
                window.location.href = '/pages/super_admin_dashboard.html';
                break;
            case 'branch_admin':
                window.location.href = '/pages/admin_dashboard.html';
                break;
            case 'student':
                window.location.href = '/pages/student_dashboard.html';
                break;
            case 'accountant':
                window.location.href = '/pages/finance_dashboard.html';
                break;
            case 'transport_manager':
                window.location.href = '/pages/transport_dashboard.html';
                break;
            case 'house_master':
                window.location.href = '/pages/house_dashboard.html';
                break;
            case 'librarian':
                window.location.href = '/pages/library_dashboard.html';
                break;
            case 'staff':
                window.location.href = '/pages/staff_dashboard.html';
                break;
            case 'headmaster':
                window.location.href = '/pages/headmaster_dashboard.html';
                break;
            case 'pta_chairman':
                window.location.href = '/pages/pta_dashboard.html';
                break;
            case 'it_admin':
                window.location.href = '/pages/it_dashboard.html';
                break;
            case 'security_officer':
                window.location.href = '/pages/security_dashboard.html';
                break;
            default:
                window.location.href = '/pages/dashboard.html';
        }
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    }
}

// Initialize branch field visibility on page load
document.addEventListener('DOMContentLoaded', () => {
    toggleBranchField();
});