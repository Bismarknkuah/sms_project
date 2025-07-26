let socket;
let userBranchId = null;
let userRole = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    if (!token || !['teacher', 'exam_officer', 'branch_manager', 'super_admin'].includes(userRole)) {
        window.location.href = '/index.html';
        return;
    }
    initializeExams();
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

    socket.on('examUpdate', (update) => {
        if (userRole === 'super_admin' || update.branchId === userBranchId) {
            updateBanner(update.title + ': ' + update.content);
            loadSchedules();
        }
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeExams() {
    await Promise.all([
        fetchUserInfo(),
        fetchSubjects(),
        fetchClasses(),
        fetchStudents()
    ]);
    loadSchedules();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        userBranchId = data.branchId;
        document.getElementById('userName').textContent = data.name || 'Exam Officer';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'EO';
        document.getElementById('branchName').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';

        if (userRole === 'super_admin') {
            document.getElementById('sectionActions').innerHTML = `
                <select id="branchSelect" onchange="loadSchedules()">
                    <option value="">All Branches</option>
                    <!-- Populated dynamically -->
                </select>
                <button class="btn btn-primary" onclick="openModal('scheduleExamModal')"><i class="fas fa-plus"></i> Schedule Exam</button>
                <button class="btn btn-primary" onclick="openModal('uploadGradesModal')"><i class="fas fa-upload"></i> Bulk Upload Grades</button>
            `;
            fetchBranches();
        } else {
            document.getElementById('sectionActions').innerHTML = `
                <button class="btn btn-primary" onclick="openModal('scheduleExamModal')"><i class="fas fa-plus"></i> Schedule Exam</button>
                <button class="btn btn-primary" onclick="openModal('uploadGradesModal')"><i class="fas fa-upload"></i> Bulk Upload Grades</button>
            `;
        }
    } catch (error) {
        showError(error.message);
    }
}

async function fetchBranches() {
    try {
        const response = await fetch('/api/admin/branches', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();

        const branchOptions = data.branches.map(branch => `<option value="${branch._id}">${branch.name}</option>`).join('');
        document.getElementById('branchSelect').innerHTML = `<option value="">All Branches</option>${branchOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchSubjects() {
    try {
        const url = userRole === 'super_admin' ? '/api/admin/subjects' : `/api/admin/subjects?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();

        const subjectOptions = data.subjects.map(subject => `<option value="${subject._id}">${subject.name}</option>`).join('');
        document.getElementById('examSubject').innerHTML = `<option value="">Select Subject</option>${subjectOptions}`;
        document.getElementById('gradeExam').innerHTML = `<option value="">Select Exam</option>${data.subjects.map(subject => `<option value="${subject._id}">${subject.name}</option>`).join('')}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchClasses() {
    try {
        const url = userRole === 'super_admin' ? '/api/admin/classes' : `/api/admin/classes?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();

        const classOptions = data.classes.map(cls => `<option value="${cls._id}">${cls.name}</option>`).join('');
        document.getElementById('examClass').innerHTML = `<option value="">Select Class</option>${classOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchStudents() {
    try {
        const url = userRole === 'super_admin' ? '/api/admin/students' : `/api/admin/students?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();

        const studentOptions = data.students.map(student => `<option value="${student._id}">${student.name} (${student.branchName})</option>`).join('');
        document.getElementById('gradeStudent').innerHTML = `<option value="">Select Student</option>${studentOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function loadSchedules() {
    const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;
    try {
        const url = branchId ? `/api/admin/exams/schedules?branchId=${branchId}` : '/api/admin/exams/schedules';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch schedules');
        const data = await response.json();

        document.getElementById('scheduleTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Class</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Venue</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.schedules.map(schedule => `
                        <tr>
                            <td>${schedule.subjectName}</td>
                            <td>${schedule.className}</td>
                            <td>${new Date(schedule.date).toLocaleDateString()}</td>
                            <td>${schedule.time}</td>
                            <td>${schedule.venue}</td>
                            <td>${schedule.status}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewSchedule('${schedule._id}')">View</button>
                                ${schedule.status === 'pending' && (userRole === 'branch_manager' || userRole === 'super_admin') ? 
                                  `<button class="btn btn-primary btn-small" onclick="approveSchedule('${schedule._id}')">Approve</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function searchExams(query) {
    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/exams/search?query=${encodeURIComponent(query)}` :
            `/api/admin/exams/search?query=${encodeURIComponent(query)}&branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search exams');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-search"></i> Search Results</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.results.map(result => `
                                <tr>
                                    <td>${result.type}</td>
                                    <td>${result.details}</td>
                                    <td>${new Date(result.date).toLocaleDateString()}</td>
                                    <td>${result.status}</td>
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

async function scheduleExam() {
    const subjectId = document.getElementById('examSubject').value;
    const classId = document.getElementById('examClass').value;
    const date = document.getElementById('examDate').value;
    const time = document.getElementById('examTime').value;
    const venue = document.getElementById('examVenue').value;

    if (!subjectId || !classId || !date || !time || !venue) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/exams/schedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ subjectId, classId, date, time, venue, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to schedule exam');
        closeModal('scheduleExamModal');
        loadSchedules();
        socket.emit('examUpdate', {
            title: 'Exam Scheduled',
            content: `Exam for subject ${subjectId} scheduled on ${date}`,
            branchId: userBranchId
        });
        sendExamNotification(subjectId, classId, date, time, venue);
    } catch (error) {
        showError(error.message);
    }
}

async function recordGrade() {
    const studentId = document.getElementById('gradeStudent').value;
    const examId = document.getElementById('gradeExam').value;
    const mark = parseInt(document.getElementById('gradeMark').value);

    if (!studentId || !examId || !mark || mark < 0 || mark > 100) {
        showError('Please provide valid grade details');
        return;
    }

    try {
        const response = await fetch('/api/admin/exams/grades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ studentId, examId, mark, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to record grade');
        closeModal('recordGradeModal');
        loadSection('grades');
        socket.emit('examUpdate', {
            title: 'Grade Recorded',
            content: `Grade ${mark} recorded for student ${studentId}`,
            branchId: userBranchId
        });
        sendGradeNotification(studentId, examId, mark);
    } catch (error) {
        showError(error.message);
    }
}

async function sendExamNotification(subjectId, classId, date, time, venue) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipientType: 'parents',
                classId,
                subject: 'Exam Schedule Notification',
                content: `An exam for ${subjectId} is scheduled on ${date} at ${time} in ${venue}.`,
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send notification');
    } catch (error) {
        showError(error.message);
    }
}

async function sendGradeNotification(studentId, examId, mark) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipientId: studentId,
                recipientType: 'parent',
                subject: 'Grade Notification',
                content: `Your child received a mark of ${mark} for exam ${examId}.`,
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send notification');
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/exams/${section}` :
            `/api/admin/exams/${section}?branchId=${userBranchId}`;
        const response = await fetch(url, {
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
        case 'schedules':
            return document.getElementById('dashboardContent').innerHTML;
        case 'grades':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-marker"></i> Grades</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('recordGradeModal')"><i class="fas fa-plus"></i> Record Grade</button>
                            <button class="btn btn-primary" onclick="openModal('uploadGradesModal')"><i class="fas fa-upload"></i> Bulk Upload</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Exam</th>
                                    <th>Mark</th>
                                    <th>Grade</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.grades.map(grade => `
                                    <tr>
                                        <td>${grade.studentName}</td>
                                        <td>${grade.examName}</td>
                                        <td>${grade.mark}</td>
                                        <td>${calculateGrade(grade.mark)}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewGrade('${grade._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'results':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-chart-line"></i> Results</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-file-pdf"></i> Generate Report</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Average Mark</th>
                                    <th>Rank</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.results.map(result => `
                                    <tr>
                                        <td>${result.studentName}</td>
                                        <td>${result.className}</td>
                                        <td>${result.averageMark.toFixed(2)}</td>
                                        <td>${result.rank}</td>
                                        <td>${result.status}</td>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Exam Analytics</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-file-pdf"></i> Generate Report</button>
                        </div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalStudents}</h3>
                                <p>Total Students</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                            <div class="stat-info">
                                <h3>${data.passRate.toFixed(2)}%</h3>
                                <p>Pass Rate</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                            <div class="stat-info">
                                <h3>${data.underperformingStudents}</h3>
                                <p>Underperforming</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'messages':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-envelope"></i> Messages</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('sendMessageModal')"><i class="fas fa-plus"></i> Send Message</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.messages.map(message => `
                                    <tr>
                                        <td>${message.recipientName}</td>
                                        <td>${message.subject}</td>
                                        <td>${new Date(message.timestamp).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewMessage('${message._id}')">View</button>
                                        </td>
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

function calculateGrade(mark) {
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    return 'F';
}

async function viewSchedule(scheduleId) {
    try {
        const response = await fetch(`/api/admin/exams/schedules/${scheduleId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch schedule details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.schedule.branchId !== userBranchId) {
            showError('Access denied: Schedule belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-calendar-alt"></i> Schedule Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('schedules')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Subject</th><td>${data.schedule.subjectName}</td></tr>
                        <tr><th>Class</th><td>${data.schedule.className}</td></tr>
                        <tr><th>Date</th><td>${new Date(data.schedule.date).toLocaleDateString()}</td></tr>
                        <tr><th>Time</th><td>${data.schedule.time}</td></tr>
                        <tr><th>Venue</th><td>${data.schedule.venue}</td></tr>
                        <tr><th>Status</th><td>${data.schedule.status}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function viewGrade(gradeId) {
    try {
        const response = await fetch(`/api/admin/exams/grades/${gradeId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch grade details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.grade.branchId !== userBranchId) {
            showError('Access denied: Grade belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-marker"></i> Grade Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('grades')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Student</th><td>${data.grade.studentName}</td></tr>
                        <tr><th>Exam</th><td>${data.grade.examName}</td></tr>
                        <tr><th>Mark</th><td>${data.grade.mark}</td></tr>
                        <tr><th>Grade</th><td>${calculateGrade(data.grade.mark)}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function approveSchedule(scheduleId) {
    try {
        const response = await fetch(`/api/admin/exams/schedules/${scheduleId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (userRole !== 'super_admin' && data.schedule.branchId !== userBranchId) {
            showError('Access denied: Schedule belongs to another branch');
            return;
        }

        const approveResponse = await fetch(`/api/admin/exams/schedules/${scheduleId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!approveResponse.ok) throw new Error('Failed to approve schedule');
        loadSchedules();
        socket.emit('examUpdate', {
            title: 'Schedule Approved',
            content: `Schedule ID ${scheduleId} approved`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

function initializeFileUpload() {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('gradeFile');

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

async function uploadGrades() {
    const fileInput = document.getElementById('gradeFile');

    if (!fileInput.files.length) {
        showError('Please select a file');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'text/csv') {
        showError('Only CSV files are allowed');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('branchId', userBranchId);

    try {
        const response = await fetch('/api/admin/exams/grades/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload grades');
        closeModal('uploadGradesModal');
        loadSection('grades');
        socket.emit('examUpdate', {
            title: 'Grades Uploaded',
            content: `Grades uploaded for branch ${userBranchId}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport() {
    try {
        const url = userRole === 'super_admin' && document.getElementById('branchSelect')?.value ?
            `/api/admin/exams/report?branchId=${document.getElementById('branchSelect').value}` :
            `/api/admin/exams/report?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to generate report');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `exam_report_${userBranchId || 'all'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
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