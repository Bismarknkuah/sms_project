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
        fetchStudents(),
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

async function fetchStudents() {
    try {
        const response = await fetch('/api/admin/students', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();

        document.getElementById('studentTable').querySelector('tbody').innerHTML = data.students.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.studentId}</td>
                <td>${student.class}</td>
                <td>${student.course}</td>
                <td>${student.house}</td>
                <td>${student.sportsPreference}</td>
                <td>${student.status}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editStudent('${student._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteStudent('${student._id}')">Delete</button>
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

        const classOptions = '<option value="">Select Class</option>' +
            data.classes.map(cls => `<option value="${cls._id}">${cls.name}</option>`).join('');
        document.getElementById('studentClass').innerHTML = classOptions;
        document.getElementById('editStudentClass').innerHTML = classOptions;
    } catch (error) {
        showError(error.message);
    }
}

async function searchStudents(query) {
    try {
        const response = await fetch(`/api/admin/students?search=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search students');
        const data = await response.json();

        document.getElementById('studentTable').querySelector('tbody').innerHTML = data.students.map(student => `
            <tr>
                <td>${student.name}</td>
                <td>${student.studentId}</td>
                <td>${student.class}</td>
                <td>${student.course}</td>
                <td>${student.house}</td>
                <td>${student.sportsPreference}</td>
                <td>${student.status}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editStudent('${student._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteStudent('${student._id}')">Delete</button>
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
    if (modalId === 'addStudentModal') {
        document.getElementById('studentName').value = '';
        document.getElementById('studentId').value = '';
        document.getElementById('studentClass').value = '';
        document.getElementById('studentCourse').value = '';
        document.getElementById('studentHouse').value = '';
        document.getElementById('studentSports').value = '';
        document.getElementById('studentStatus').value = '';
    } else if (modalId === 'editStudentModal') {
        document.getElementById('editStudentId').value = '';
        document.getElementById('editStudentName').value = '';
        document.getElementById('editStudentClass').value = '';
        document.getElementById('editStudentCourse').value = '';
        document.getElementById('editStudentHouse').value = '';
        document.getElementById('editStudentSports').value = '';
        document.getElementById('editStudentStatus').value = '';
    }
}

async function saveStudent() {
    const name = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const classId = document.getElementById('studentClass').value;
    const course = document.getElementById('studentCourse').value;
    const house = document.getElementById('studentHouse').value;
    const sportsPreference = document.getElementById('studentSports').value;
    const status = document.getElementById('studentStatus').value;

    if (!name || !studentId || !classId || !course || !house || !sportsPreference || !status) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, studentId, classId, course, house, sportsPreference, status })
        });
        if (!response.ok) throw new Error('Failed to save student');
        closeModal('addStudentModal');
        fetchStudents();
    } catch (error) {
        showError(error.message);
    }
}

async function editStudent(studentId) {
    try {
        const response = await fetch(`/api/admin/students/${studentId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch student');
        const student = await response.json();

        document.getElementById('editStudentId').value = student._id;
        document.getElementById('editStudentName').value = student.name;
        document.getElementById('editStudentClass').value = student.classId;
        document.getElementById('editStudentCourse').value = student.course;
        document.getElementById('editStudentHouse').value = student.house;
        document.getElementById('editStudentSports').value = student.sportsPreference;
        document.getElementById('editStudentStatus').value = student.status;

        openModal('editStudentModal');
    } catch (error) {
        showError(error.message);
    }
}

async function updateStudent() {
    const studentId = document.getElementById('editStudentId').value;
    const name = document.getElementById('editStudentName').value;
    const classId = document.getElementById('editStudentClass').value;
    const course = document.getElementById('editStudentCourse').value;
    const house = document.getElementById('editStudentHouse').value;
    const sportsPreference = document.getElementById('editStudentSports').value;
    const status = document.getElementById('editStudentStatus').value;

    if (!name || !classId || !course || !house || !sportsPreference || !status) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/admin/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, classId, course, house, sportsPreference, status })
        });
        if (!response.ok) throw new Error('Failed to update student');
        closeModal('editStudentModal');
        fetchStudents();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await fetch(`/api/admin/students/${studentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete student');
        fetchStudents();
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
        case 'students':
            return document.getElementById('dashboardContent').innerHTML;
        case 'reports':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-file-alt"></i> Student Reports</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport('class')">Class Report</button>
                            <button class="btn btn-primary" onclick="generateReport('house')">House Report</button>
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
        const response = await fetch(`/api/admin/reports/${type}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to generate ${type} report`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report.pdf`;
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

