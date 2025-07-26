let socket;
let attendanceData = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['attendance_manager', 'super_admin', 'teacher'].includes(role)) {
        window.location.href = '/index.html';
        return;
    }
    initializeAttendance();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    initializeFileUpload();
});

function initializeSocket() {
    socket = io('/admin', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('attendanceUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
        loadClassAttendance();
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeAttendance() {
    await Promise.all([
        fetchUserInfo(),
        fetchClasses()
    ]);
    document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
    loadClassAttendance();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'Attendance Manager';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'AM';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
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
        document.getElementById('classSelect').innerHTML = `<option value="">Select Class</option>${classOptions}`;
        document.getElementById('eventClass').innerHTML = `<option value="">Select Class</option>${classOptions}`;
        document.getElementById('uploadClass').innerHTML = `<option value="">Select Class</option>${classOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function loadClassAttendance() {
    const classId = document.getElementById('classSelect').value;
    const date = document.getElementById('attendanceDate').value;
    if (!classId || !date) return;

    try {
        const response = await fetch(`/api/admin/attendance/class/${classId}?date=${date}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to load attendance');
        const data = await response.json();

        attendanceData = data.attendance;
        renderAttendanceGrid(data.students, data.attendance);
    } catch (error) {
        showError(error.message);
    }
}

function renderAttendanceGrid(students, attendance) {
    const statuses = ['Present', 'Absent', 'Late'];
    let grid = '<div class="attendance-cell header">Student</div>';
    statuses.forEach(status => {
        grid += `<div class="attendance-cell header">${status}</div>`;
    });
    grid += '<div class="attendance-cell header">Notes</div>';

    students.forEach(student => {
        const record = attendance.find(a => a.studentId === student._id) || { status: '', notes: '' };
        grid += `
            <div class="attendance-cell">${student.name}</div>
            ${statuses.map(status => `
                <div class="attendance-cell ${record.status === status.toLowerCase() ? status.toLowerCase() : ''}"
                     onclick="toggleStatus('${student._id}', '${status.toLowerCase()}')">
                    <i class="fas fa-${record.status === status.toLowerCase() ? 'check-circle' : 'circle'}"></i>
                </div>
            `).join('')}
            <div class="attendance-cell">
                <input type="text" value="${record.notes || ''}" 
                       oninput="updateNotes('${student._id}', this.value)" 
                       placeholder="Notes...">
            </div>
        `;
    });

    document.getElementById('attendanceGrid').innerHTML = grid;
}

function toggleStatus(studentId, status) {
    const record = attendanceData.find(a => a.studentId === studentId) || { studentId, status: '', notes: '' };
    record.status = record.status === status ? '' : status;

    if (!attendanceData.find(a => a.studentId === studentId)) {
        attendanceData.push(record);
    }

    loadClassAttendance();
}

function updateNotes(studentId, notes) {
    const record = attendanceData.find(a => a.studentId === studentId) || { studentId, status: '', notes: '' };
    record.notes = notes;

    if (!attendanceData.find(a => a.studentId === studentId)) {
        attendanceData.push(record);
    }
}

async function saveAttendance() {
    const classId = document.getElementById('classSelect').value;
    const date = document.getElementById('attendanceDate').value;

    if (!classId || !date) {
        showError('Please select a class and date');
        return;
    }

    try {
        const response = await fetch('/api/admin/attendance/class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ classId, date, attendance: attendanceData })
        });
        if (!response.ok) throw new Error('Failed to save attendance');
        loadClassAttendance();
        socket.emit('attendanceUpdate', {
            title: 'Attendance Updated',
            content: `Attendance for class ${classId} on ${date} updated`
        });
    } catch (error) {
        showError(error.message);
    }
}

async function searchAttendance(query) {
    try {
        const response = await fetch(`/api/admin/attendance/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search attendance');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-user-check"></i> Search Results</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.records.map(record => `
                                <tr>
                                    <td>${record.studentName}</td>
                                    <td>${record.className}</td>
                                    <td>${new Date(record.date).toLocaleDateString()}</td>
                                    <td>${record.status}</td>
                                    <td>${record.notes || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/admin/attendance/${section}`, {
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
        case 'classAttendance':
            return document.getElementById('dashboardContent').innerHTML;
        case 'eventAttendance':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-calendar-check"></i> Event Attendance</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('addEventModal')"><i class="fas fa-plus"></i> Add Event</button>
                            <button class="btn btn-primary" onclick="openModal('uploadAttendanceModal')"><i class="fas fa-upload"></i> Upload Attendance</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Event Name</th>
                                    <th>Date</th>
                                    <th>Class</th>
                                    <th>Attendance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.events.map(event => `
                                    <tr>
                                        <td>${event.name}</td>
                                        <td>${new Date(event.date).toLocaleDateString()}</td>
                                        <td>${event.className}</td>
                                        <td>${event.attendanceCount} / ${event.totalStudents}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewEvent('${event._id}')">View</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteEvent('${event._id}')">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'analytics':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Attendance Analytics</h2>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-user-check"></i></div>
                            <div class="stat-info">
                                <h3>${data.attendanceRate}%</h3>
                                <p>Overall Attendance Rate</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-user-times"></i></div>
                            <div class="stat-info">
                                <h3>${data.absentCount}</h3>
                                <p>Total Absences</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                            <div class="stat-info">
                                <h3>${data.lateCount}</h3>
                                <p>Total Late Arrivals</p>
                            </div>
                        </div>
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

async function saveEvent() {
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const classId = document.getElementById('eventClass').value;

    if (!name || !date || !classId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/attendance/event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, date, classId })
        });
        if (!response.ok) throw new Error('Failed to save event');
        closeModal('addEventModal');
        loadSection('eventAttendance');
        socket.emit('attendanceUpdate', {
            title: 'Event Added',
            content: `${name} on ${date} added`
        });
    } catch (error) {
        showError(error.message);
    }
}

async function viewEvent(eventId) {
    try {
        const response = await fetch(`/api/admin/attendance/event/${eventId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch event');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-calendar-check"></i> ${data.event.name}</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('eventAttendance')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.attendance.map(record => `
                                <tr>
                                    <td>${record.studentName}</td>
                                    <td>${record.status}</td>
                                    <td>${record.notes || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        const response = await fetch(`/api/admin/attendance/event/${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete event');
        loadSection('eventAttendance');
        socket.emit('attendanceUpdate', {
            title: 'Event Deleted',
            content: `Event ID ${eventId} removed`
        });
    } catch (error) {
        showError(error.message);
    }
}

function initializeFileUpload() {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('attendanceFile');

    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.classList.add('dragover');
    });

    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.classList.remove('dragover');
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            uploadContainer.querySelector('p').textContent = files[0].name;
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            uploadContainer.querySelector('p').textContent = fileInput.files[0].name;
        }
    });
}

async function uploadAttendance() {
    const classId = document.getElementById('uploadClass').value;
    const date = document.getElementById('uploadDate').value;
    const fileInput = document.getElementById('attendanceFile');

    if (!classId || !date || !fileInput.files.length) {
        showError('Please select a class, date, and file');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'text/csv') {
        showError('Only CSV files are allowed');
        return;
    }

    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('date', date);
    formData.append('file', file);

    try {
        const response = await fetch('/api/admin/attendance/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload attendance');
        closeModal('uploadAttendanceModal');
        loadSection('eventAttendance');
        socket.emit('attendanceUpdate', {
            title: 'Bulk Attendance Uploaded',
            content: `Attendance for class ${classId} on ${date} uploaded`
        });
    } catch (error) {
        showError(error.message);
    }
}

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new updates';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function showError(message) {
    alert(message); // Replace with a better UI notification in production
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}