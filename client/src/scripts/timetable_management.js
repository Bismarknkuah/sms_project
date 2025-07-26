let socket;
let draggedSlot = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['timetable_manager', 'super_admin', 'teacher'].includes(role)) {
        window.location.href = '/index.html';
        return;
    }
    initializeTimetable();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    initializeDragAndDrop();
});

function initializeSocket() {
    socket = io('/admin', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('timetableUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
        loadClassTimetable();
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeTimetable() {
    await Promise.all([
        fetchUserInfo(),
        fetchClasses(),
        fetchSubjects(),
        fetchTeachers(),
        fetchRooms()
    ]);
    loadClassTimetable();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'Timetable Manager';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'TM';
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
        document.getElementById('slotClass').innerHTML = `<option value="">Select Class</option>${classOptions}`;
        document.getElementById('examClass').innerHTML = `<option value="">Select Class</option>${classOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchSubjects() {
    try {
        const response = await fetch('/api/admin/subjects', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();

        const subjectOptions = data.subjects.map(subject => `<option value="${subject._id}">${subject.name}</option>`).join('');
        document.getElementById('slotSubject').innerHTML = `<option value="">Select Subject</option>${subjectOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchTeachers() {
    try {
        const response = await fetch('/api/admin/teachers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch teachers');
        const data = await response.json();

        const teacherOptions = data.teachers.map(teacher => `<option value="${teacher._id}">${teacher.name}</option>`).join('');
        document.getElementById('slotTeacher').innerHTML = `<option value="">Select Teacher</option>${teacherOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchRooms() {
    try {
        const response = await fetch('/api/admin/rooms', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const data = await response.json();

        const roomOptions = data.rooms.map(room => `<option value="${room._id}">${room.name}</option>`).join('');
        document.getElementById('slotRoom').innerHTML = `<option value="">Select Room</option>${roomOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function loadClassTimetable() {
    const classId = document.getElementById('classSelect').value;
    if (!classId) return;

    try {
        const response = await fetch(`/api/admin/timetable/class/${classId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to load timetable');
        const data = await response.json();

        renderTimetableGrid(data.timetable);
    } catch (error) {
        showError(error.message);
    }
}

function renderTimetableGrid(timetable) {
    const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
        '08:00-08:40', '08:40-09:20', '09:20-10:00', '10:00-10:40',
        '10:40-11:20', '11:20-12:00', '12:00-12:40', '12:40-13:20'
    ];

    let grid = '<div class="timetable-cell header"></div>';
    days.slice(1).forEach(day => {
        grid += `<div class="timetable-cell header">${day}</div>`;
    });

    periods.forEach((period, index) => {
        grid += `<div class="timetable-cell header">${period}</div>`;
        days.slice(1).forEach(day => {
            const slot = timetable.find(s => s.day === day && s.period === (index + 1).toString()) || {};
            const conflict = slot.conflict ? 'conflict' : '';
            grid += `
                <div class="timetable-cell ${conflict}" data-day="${day}" data-period="${index + 1}" draggable="true">
                    ${slot.subject || ''}<br>
                    ${slot.teacher || ''}<br>
                    ${slot.room || ''}
                </div>
            `;
        });
    });

    document.getElementById('timetableGrid').innerHTML = grid;
}

function initializeDragAndDrop() {
    const cells = document.querySelectorAll('.timetable-cell[draggable="true"]');
    cells.forEach(cell => {
        cell.addEventListener('dragstart', (e) => {
            draggedSlot = cell;
            cell.classList.add('draggable');
            e.dataTransfer.setData('text/plain', '');
        });

        cell.addEventListener('dragend', () => {
            cell.classList.remove('draggable');
            draggedSlot = null;
        });

        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        cell.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (draggedSlot && draggedSlot !== cell) {
                const fromDay = draggedSlot.dataset.day;
                const fromPeriod = draggedSlot.dataset.period;
                const toDay = cell.dataset.day;
                const toPeriod = cell.dataset.period;

                try {
                    const response = await fetch('/api/admin/timetable/swap', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            classId: document.getElementById('classSelect').value,
                            from: { day: fromDay, period: fromPeriod },
                            to: { day: toDay, period: toPeriod }
                        })
                    });
                    if (!response.ok) throw new Error('Failed to swap slots');
                    loadClassTimetable();
                } catch (error) {
                    showError(error.message);
                }
            }
        });
    });
}

async function searchTimetable(query) {
    try {
        const response = await fetch(`/api/admin/timetable/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search timetable');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-calendar-alt"></i> Search Results</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Class</th>
                                <th>Day</th>
                                <th>Period</th>
                                <th>Subject</th>
                                <th>Teacher</th>
                                <th>Room</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.slots.map(slot => `
                                <tr>
                                    <td>${slot.className}</td>
                                    <td>${slot.day}</td>
                                    <td>${slot.period}</td>
                                    <td>${slot.subject}</td>
                                    <td>${slot.teacher}</td>
                                    <td>${slot.room}</td>
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
        const response = await fetch(`/api/admin/timetable/${section}`, {
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
        case 'classTimetable':
            return document.getElementById('dashboardContent').innerHTML;
        case 'examTimetable':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-file-alt"></i> Exam Timetable</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('uploadExamModal')"><i class="fas fa-upload"></i> Upload Timetable</button>
                            <button class="btn btn-primary" onclick="openModal('addExamSlotModal')"><i class="fas fa-plus"></i> Add Exam Slot</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.exams.map(exam => `
                                    <tr>
                                        <td>${exam.className}</td>
                                        <td>${exam.subject}</td>
                                        <td>${new Date(exam.date).toLocaleDateString()}</td>
                                        <td>${exam.time}</td>
                                        <td>${exam.room}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="downloadExam('${exam._id}')">Download</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteExam('${exam._id}')">Delete</button>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Timetable Analytics</h2>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                            <div class="stat-info">
                                <h3>${data.teacherWorkload.total}</h3>
                                <p>Teacher Workload (Hours)</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-door-open"></i></div>
                            <div class="stat-info">
                                <h3>${data.roomUsage.total}</h3>
                                <p>Room Usage (%)</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                            <div class="stat-info">
                                <h3>${data.conflicts}</h3>
                                <p>Timetable Conflicts</p>
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

async function saveSlot() {
    const classId = document.getElementById('slotClass').value;
    const day = document.getElementById('slotDay').value;
    const period = document.getElementById('slotPeriod').value;
    const subjectId = document.getElementById('slotSubject').value;
    const teacherId = document.getElementById('slotTeacher').value;
    const roomId = document.getElementById('slotRoom').value;

    if (!classId || !day || !period || !subjectId || !teacherId || !roomId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/timetable/class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ classId, day, period, subjectId, teacherId, roomId })
        });
        if (!response.ok) throw new Error('Failed to save timetable slot');
        closeModal('addSlotModal');
        loadClassTimetable();
    } catch (error) {
        showError(error.message);
    }
}

function initializeFileUpload() {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('examFile');

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
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            uploadContainer.querySelector('p').textContent = fileInput.files[0].name;
        }
    });
}

async function uploadExamTimetable() {
    const classId = document.getElementById('examClass').value;
    const fileInput = document.getElementById('examFile');

    if (!classId || !fileInput.files.length) {
        showError('Please select a class and a file');
        return;
    }

    const file = fileInput.files[0];
    if (!['text/csv', 'application/pdf'].includes(file.type)) {
        showError('Only CSV or PDF files are allowed');
        return;
    }

    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('file', file);

    try {
        const response = await fetch('/api/admin/timetable/exam/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload exam timetable');
        closeModal('uploadExamModal');
        loadSection('examTimetable');
    } catch (error) {
        showError(error.message);
    }
}

async function downloadExam(examId) {
    try {
        const response = await fetch(`/api/admin/timetable/exam/${examId}/download`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to download exam timetable');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exam_timetable_${examId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError(error.message);
    }
}

async function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam timetable?')) return;

    try {
        const response = await fetch(`/api/admin/timetable/exam/${examId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete exam timetable');
        loadSection('examTimetable');
    } catch (error) {
        showError(error.message);
    }
}