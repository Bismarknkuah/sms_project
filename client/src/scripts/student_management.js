

let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['headmaster', 'super_admin'].includes(role)) {
        window.location.href = '/index.html';
        return;
    }
    initializeManagement();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/admin', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('newUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeManagement() {
    await Promise.all([
        fetchUserInfo(),
        fetchStaff(),
        fetchClasses()
    ]);
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'Admin';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'AD';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchStaff() {
    try {
        const response = await fetch('/api/admin/staff', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch staff');
        const data = await response.json();

        document.getElementById('staffTable').querySelector('tbody').innerHTML = data.staff.map(member => `
            <tr>
                <td>${member.name}</td>
                <td>${member.staffId}</td>
                <td>${member.department}</td>
                <td>${member.role}</td>
                <td>${member.assignedClasses?.length || 0}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editStaff('${member._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteStaff('${member._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchClasses() {
    try {
        const response = await fetch('/api/admin/classes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();

        const classOptions = data.classes.map(cls => `<option value="${cls._id}">${cls.name}</option>`).join('');
        document.getElementById('staffClasses').innerHTML = classOptions;
        document.getElementById('editStaffClasses').innerHTML = classOptions;
    } catch (error) {
        showError(error.message);
    }
}

async function searchStaff(query) {
    try {
        const response = await fetch(`/api/admin/staff?search=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search staff');
        const data = await response.json();

        document.getElementById('staffTable').querySelector('tbody').innerHTML = data.staff.map(member => `
            <tr>
                <td>${member.name}</td>
                <td>${member.staffId}</td>
                <td>${member.department}</td>
                <td>${member.role}</td>
                <td>${member.assignedClasses?.length || 0}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editStaff('${member._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteStaff('${member._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new updates';
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'addStaffModal') {
        document.getElementById('staffName').value = '';
        document.getElementById('staffId').value = '';
        document.getElementById('staffDepartment').value = '';
        document.getElementById('staffRole').value = '';
        document.getElementById('staffClasses').value = '';
    } else if (modalId === 'editStaffModal') {
        document.getElementById('editStaffId').value = '';
        document.getElementById('editStaffName').value = '';
        document.getElementById('editStaffDepartment').value = '';
        document.getElementById('editStaffRole').value = '';
        document.getElementById('editStaffClasses').value = '';
    }
}

async function saveStaff() {
    const name = document.getElementById('staffName').value;
    const staffId = document.getElementById('staffId').value;
    const department = document.getElementById('staffDepartment').value;
    const role = document.getElementById('staffRole').value;
    const assignedClasses = Array.from(document.getElementById('staffClasses').selectedOptions).map(opt => opt.value);

    if (!name || !staffId || !department || !role) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, staffId, department, role, assignedClasses })
        });
        if (!response.ok) throw new Error('Failed to save staff');
        closeModal('addStaffModal');
        fetchStaff();
    } catch (error) {
        showError(error.message);
    }
}

async function editStaff(staffId) {
    try {
        const response = await fetch(`/api/admin/staff/${staffId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch staff');
        const staff = await response.json();

        document.getElementById('editStaffId').value = staff._id;
        document.getElementById('editStaffName').value = staff.name;
        document.getElementById('editStaffDepartment').value = staff.department;
        document.getElementById('editStaffRole').value = staff.role;
        const classSelect = document.getElementById('editStaffClasses');
        Array.from(classSelect.options).forEach(opt => {
            opt.selected = staff.assignedClasses.includes(opt.value);
        });

        openModal('editStaffModal');
    } catch (error) {
        showError(error.message);
    }
}

async function updateStaff() {
    const staffId = document.getElementById('editStaffId').value;
    const name = document.getElementById('editStaffName').value;
    const department = document.getElementById('editStaffDepartment').value;
    const role = document.getElementById('editStaffRole').value;
    const assignedClasses = Array.from(document.getElementById('editStaffClasses').selectedOptions).map(opt => opt.value);

    if (!name || !department || !role) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/admin/staff/${staffId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, department, role, assignedClasses })
        });
        if (!response.ok) throw new Error('Failed to update staff');
        closeModal('editStaffModal');
        fetchStaff();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteStaff(staffId) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
        const response = await fetch(`/api/admin/staff/${staffId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete staff');
        fetchStaff();
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/admin/${section}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to load ${section}`);
        const data = await response.json();

        content.innerHTML = renderSection(section, data);
    } catch (error) {
        content.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function renderSection(section, data) {
    switch (section) {
        case 'staff':
            return document.getElementById('dashboardContent').innerHTML;
        case 'reports':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-file-alt"></i> Staff Reports</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport('department')">Department Report</button>
                            <button class="btn btn-primary" onclick="generateReport('performance')">Performance Report</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Report Type</th>
                                    <th>Date Generated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.reports.map(report => `
                                    <tr>
                                        <td>${report.type}</td>
                                        <td>${new Date(report.date).toLocaleDateString()}</td>
                                        <td><button class="btn btn-secondary btn-small" onclick="viewReport('${report._id}')">View</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'updates':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-bell"></i> Updates</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.updates.map(update => `
                                    <tr>
                                        <td>${new Date(update.timestamp).toLocaleDateString()}</td>
                                        <td>${update.title}</td>
                                        <td>${update.content}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        default:
            return `<p>Section ${section} not implemented</p>`;
    }
}

async function generateReport(type) {
    try {
        const response = await fetch(`/api/admin/reports/staff/${type}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to generate ${type} report`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `staff_${type}_report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError(error.message);
    }
}

async function viewReport(reportId) {
    try {
        const response = await fetch(`/api/admin/reports/${reportId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to view report');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url);
    } catch (error) {
        showError(error.message);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function showError(message) {
    alert(message); // Replace with a better UI notification in production
}