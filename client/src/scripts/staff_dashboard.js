let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'staff') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/staff', {
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

async function initializeDashboard() {
    await Promise.all([
        fetchStaffProfile(),
        fetchTimetable(),
        fetchTasks()
    ]);
}

async function fetchStaffProfile() {
    try {
        const response = await fetch('/api/staff/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();

        document.getElementById('assignedClasses').textContent = data.assignedClasses?.length || 0;
        document.getElementById('pendingTasks').textContent = data.pendingTasks || 0;
        document.getElementById('attendancePending').textContent = data.attendancePending || 0;
        document.getElementById('userName').textContent = data.name || 'Staff';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'ST';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchTimetable() {
    try {
        const response = await fetch('/api/staff/timetable', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch timetable');
        const data = await response.json();

        const tbody = document.getElementById('timetableTable').querySelector('tbody');
        tbody.innerHTML = data.timeslots.map(slot => `
            <tr>
                <td>${slot.time}</td>
                <td>${slot.days.monday || '-'}</td>
                <td>${slot.days.tuesday || '-'}</td>
                <td>${slot.days.wednesday || '-'}</td>
                <td>${slot.days.thursday || '-'}</td>
                <td>${slot.days.friday || '-'}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchTasks() {
    try {
        const response = await fetch('/api/staff/tasks', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();

        document.getElementById('tasksTable').querySelector('tbody').innerHTML = data.tasks.map(task => `
            <tr>
                <td>${task.description}</td>
                <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                <td>${task.status}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/staff/${section}`, {
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
        case 'dashboard':
            return document.getElementById('dashboardContent').innerHTML;
        case 'profile':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-user"></i> Profile</h2>
                    </div>
                    <div class="profile-details">
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Staff ID:</strong> ${data.staffId}</p>
                        <p><strong>Department:</strong> ${data.department}</p>
                        <p><strong>Role:</strong> ${data.role}</p>
                        <p><strong>Branch:</strong> ${data.branchName}</p>
                    </div>
                </div>
            `;
        case 'classes':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-chalkboard-teacher"></i> Assigned Classes</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Course</th>
                                    <th>Students</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.classes.map(cls => `
                                    <tr>
                                        <td>${cls.name}</td>
                                        <td>${cls.course}</td>
                                        <td>${cls.studentCount}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewClass('${cls._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'attendance':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-check-circle"></i> Attendance</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openAttendanceModal()">Mark Attendance</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Class</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.attendanceRecords.map(record => `
                                    <tr>
                                        <td>${new Date(record.date).toLocaleDateString()}</td>
                                        <td>${record.className}</td>
                                        <td>${record.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'grades':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-book"></i> Grades</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openGradeModal()">Submit Grades</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.grades.map(grade => `
                                    <tr>
                                        <td>${grade.studentName}</td>
                                        <td>${grade.className}</td>
                                        <td>${grade.subject}</td>
                                        <td>${grade.score}</td>
                                        <td>${grade.grade}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'tasks':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-tasks"></i> Department Tasks</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.tasks.map(task => `
                                    <tr>
                                        <td>${task.description}</td>
                                        <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                                        <td>${task.status}</td>
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

async function viewClass(classId) {
    try {
        const response = await fetch(`/api/staff/classes/${classId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to view class');
        const data = await response.json();
        // Implement class view logic (e.g., modal or new section)
        showError('Class view not implemented yet');
    } catch (error) {
        showError(error.message);
    }
}

async function openAttendanceModal() {
    // Implement attendance modal logic
    showError('Attendance marking not implemented yet');
}

async function openGradeModal() {
    // Implement grade submission modal logic
    showError('Grade submission not implemented yet');
}