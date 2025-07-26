let performanceChart;
let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'headmaster') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/headmaster', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('chatMessage', (data) => {
        const { message, timestamp } = data;
        if (document.getElementById('chatMessages')) {
            appendChatMessage(message, timestamp, 'received');
        }
    });

    socket.on('newUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
        fetchNotifications();
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await Promise.all([
        fetchDashboardStats(),
        fetchNotifications(),
        fetchActivityFeed(),
        fetchUpdates(),
        fetchClasses()
    ]);
    initializeChart();
}

async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/headmaster/overview', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();

        document.getElementById('totalStudents').textContent = data.totalStudents || 0;
        document.getElementById('totalStaff').textContent = data.totalStaff || 0;
        document.getElementById('totalRevenue').textContent = `₵${(data.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('attendanceRate').textContent = `${data.attendanceRate || 0}%`;
        document.getElementById('userName').textContent = data.headmasterName || 'Headmaster';
        document.getElementById('userAvatar').textContent = data.headmasterName ? data.headmasterName.charAt(0).toUpperCase() : 'HM';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchNotifications() {
    try {
        const response = await fetch('/api/headmaster/notifications', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();

        const dropdown = document.getElementById('notificationDropdown');
        const badge = document.getElementById('notificationBadge');
        const navBadge = document.getElementById('notificationCount');
        badge.textContent = data.notifications.length;
        navBadge.textContent = data.notifications.length;
        dropdown.innerHTML = data.notifications.map(notification => `
            <div class="notification-item">
                <i class="fas fa-${notification.icon || 'bell'}"></i>
                <p>${notification.message}</p>
                <span class="dismiss" onclick="dismissNotification('${notification._id}')">✖</span>
            </div>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchActivityFeed() {
    try {
        const response = await fetch('/api/headmaster/activity', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();

        document.getElementById('activityFeed').innerHTML = data.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.icon || 'info-circle'}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchUpdates() {
    try {
        const response = await fetch('/api/headmaster/updates', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch updates');
        const data = await response.json();
        if (data.updates.length > 0) {
            const latestUpdate = data.updates[0];
            updateBanner(latestUpdate.title + ': ' + latestUpdate.content);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function fetchClasses() {
    try {
        const response = await fetch('/api/headmaster/classes', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch classes');
        const data = await response.json();
        document.getElementById('studentClass').innerHTML = '<option value="">Select Class</option>' +
            data.classes.map(cls => `<option value="${cls._id}">${cls.name}</option>`).join('');
    } catch (error) {
        showError(error.message);
    }
}

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new updates';
}

function initializeChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
    updateChart();
}

async function updateChart() {
    const chartType = document.getElementById('chartType').value;
    try {
        const response = await fetch(`/api/headmaster/analytics?type=${chartType}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch analytics data');
        const data = await response.json();

        performanceChart.data.labels = data.labels;
        performanceChart.data.datasets = data.datasets;
        performanceChart.update();
    } catch (error) {
        showError(error.message);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('active');
}

async function dismissNotification(notificationId) {
    try {
        const response = await fetch(`/api/headmaster/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to dismiss notification');
        fetchNotifications();
    } catch (error) {
        showError(error.message);
    }
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
    } else if (modalId === 'addStaffModal') {
        document.getElementById('staffName').value = '';
        document.getElementById('staffId').value = '';
        document.getElementById('staffRole').value = 'teacher';
    } else if (modalId === 'scheduleEventModal') {
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventDescription').value = '';
    } else if (modalId === 'monthlyReportModal') {
        document.getElementById('reportMonth').value = '';
        document.getElementById('reportStudentSummary').value = '';
        document.getElementById('reportFinancialSummary').value = '';
        document.getElementById('reportKeyEvents').value = '';
    }
}

async function saveStudent() {
    const name = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const classId = document.getElementById('studentClass').value;

    if (!name || !studentId || !classId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/headmaster/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, studentId, classId })
        });
        if (!response.ok) throw new Error('Failed to save student');
        closeModal('addStudentModal');
        fetchDashboardStats();
        fetchActivityFeed();
    } catch (error) {
        showError(error.message);
    }
}

async function saveStaff() {
    const name = document.getElementById('staffName').value;
    const staffId = document.getElementById('staffId').value;
    const role = document.getElementById('staffRole').value;

    if (!name || !staffId || !role) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/headmaster/staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, staffId, role })
        });
        if (!response.ok) throw new Error('Failed to save staff');
        closeModal('addStaffModal');
        fetchDashboardStats();
        fetchActivityFeed();
    } catch (error) {
        showError(error.message);
    }
}

async function scheduleEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const description = document.getElementById('eventDescription').value;

    if (!title || !date || !description) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/headmaster/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, date, description })
        });
        if (!response.ok) throw new Error('Failed to schedule event');
        closeModal('scheduleEventModal');
        fetchActivityFeed();
    } catch (error) {
        showError(error.message);
    }
}

async function previewReport() {
    const month = document.getElementById('reportMonth').value;
    const studentSummary = document.getElementById('reportStudentSummary').value;
    const financialSummary = document.getElementById('reportFinancialSummary').value;
    const keyEvents = document.getElementById('reportKeyEvents').value;

    if (!month || !studentSummary || !financialSummary || !keyEvents) {
        showError('Please fill all required fields');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Monthly Report - ${month}`, 20, 20);
    doc.setFontSize(14);
    doc.text('Student Summary', 20, 40);
    doc.setFontSize(12);
    doc.text(studentSummary, 20, 50, { maxWidth: 170 });
    doc.setFontSize(14);
    doc.text('Financial Summary', 20, 80);
    doc.setFontSize(12);
    doc.text(financialSummary, 20, 90, { maxWidth: 170 });
    doc.setFontSize(14);
    doc.text('Key Events', 20, 120);
    doc.setFontSize(12);
    doc.text(keyEvents, 20, 130, { maxWidth: 170 });

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url);
}

async function submitReport() {
    const month = document.getElementById('reportMonth').value;
    const studentSummary = document.getElementById('reportStudentSummary').value;
    const financialSummary = document.getElementById('reportFinancialSummary').value;
    const keyEvents = document.getElementById('reportKeyEvents').value;

    if (!month || !studentSummary || !financialSummary || !keyEvents) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`Monthly Report - ${month}`, 20, 20);
        doc.setFontSize(14);
        doc.text('Student Summary', 20, 40);
        doc.setFontSize(12);
        doc.text(studentSummary, 20, 50, { maxWidth: 170 });
        doc.setFontSize(14);
        doc.text('Financial Summary', 20, 80);
        doc.setFontSize(12);
        doc.text(financialSummary, 20, 90, { maxWidth: 170 });
        doc.setFontSize(14);
        doc.text('Key Events', 20, 120);
        doc.setFontSize(12);
        doc.text(keyEvents, 20, 130, { maxWidth: 170 });

        const pdfBase64 = doc.output('datauristring').split(',')[1];

        const response = await fetch('/api/headmaster/reports/monthly', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                month,
                studentSummary,
                financialSummary,
                keyEvents,
                pdf: pdfBase64
            })
        });
        if (!response.ok) throw new Error('Failed to submit report');
        closeModal('monthlyReportModal');
        showSuccess('Report submitted to CEO successfully');
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport(type) {
    try {
        const response = await fetch(`/api/headmaster/reports/${type}`, {
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

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        if (section === 'communication') {
            content.innerHTML = `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-comments"></i> Admin Communication</h2>
                    </div>
                    <div class="chat-container">
                        <div class="chat-sidebar" id="messageList">
                            <!-- Populated dynamically -->
                        </div>
                        <div class="chat-main">
                            <div class="chat-header">Super Admin Chat</div>
                            <div class="chat-messages" id="chatMessages"></div>
                            <div class="chat-input">
                                <input type="text" id="chatInput" placeholder="Type a message...">
                                <button onclick="sendChatMessage()">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            await fetchMessages();
            return;
        }

        if (section === 'monthly-report') {
            content.innerHTML = `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-file-alt"></i> Monthly Report</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('monthlyReportModal')"><i class="fas fa-plus"></i> Create Report</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table id="reportTable">
                            <thead>
                                <tr>
                                    <th>Month</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            await fetchReports();
            return;
        }

        const response = await fetch(`/api/headmaster/${section}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to load ${section}`);
        const data = await response.json();

        content.innerHTML = renderSection(section, data);
    } catch (error) {
        content.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function fetchMessages() {
    try {
        const response = await fetch('/api/headmaster/messages', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();

        const messageList = document.getElementById('messageList');
        messageList.innerHTML = data.messages.map(msg => `
            <div class="chat-message" onclick="loadChat('${msg._id}')">
                <p>${msg.content.substring(0, 20)}...</p>
                <div class="time">${new Date(msg.timestamp).toLocaleDateString()}</div>
            </div>
        `).join('');

        if (data.messages.length > 0) {
            loadChat(data.messages[0]._id);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function loadChat(messageId) {
    try {
        const response = await fetch(`/api/headmaster/messages/${messageId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to load chat');
        const data = await response.json();

        const messages = document.getElementById('chatMessages');
        messages.innerHTML = data.history.map(msg => `
            <div class="chat-message ${msg.senderId === 'super_admin' ? 'received' : 'sent'}">
                <p>${msg.content}</p>
                <div class="time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchReports() {
    try {
        const response = await fetch('/api/headmaster/reports', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();

        document.getElementById('reportTable').querySelector('tbody').innerHTML = data.reports.map(report => `
            <tr>
                <td>${report.month}</td>
                <td>${report.status}</td>
                <td><button class="btn btn-secondary btn-small" onclick="viewReport('${report._id}')">View</button></td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function viewReport(reportId) {
    try {
        const response = await fetch(`/api/headmaster/reports/${reportId}`, {
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

function appendChatMessage(message, timestamp, type) {
    const messages = document.getElementById('chatMessages');
    messages.innerHTML += `
        <div class="chat-message ${type}">
            <p>${message}</p>
            <div class="time">${new Date(timestamp).toLocaleTimeString()}</div>
        </div>
    `;
    messages.scrollTop = messages.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    try {
        socket.emit('chatMessage', { message });
        appendChatMessage(message, new Date(), 'sent');
        input.value = '';

        await fetch('/api/headmaster/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content: message, type: 'message' })
        });
        fetchMessages();
    } catch (error) {
        showError(error.message);
    }
}

function renderSection(section, data) {
    switch (section) {
        case 'dashboard':
            return document.getElementById('dashboardContent').innerHTML;
        case 'analytics':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-chart-line"></i> Branch Analytics</h2>
                    </div>
                    <div class="analytics-grid">
                        <div class="chart-container">
                            <canvas id="analyticsChart"></canvas>
                        </div>
                        <div class="content-section">
                            <h3 class="section-title">Summary</h3>
                            <p>Students: ${data.students}</p>
                            <p>Revenue: ₵${data.revenue.toLocaleString()}</p>
                            <p>Attendance: ${data.attendance}%</p>
                        </div>
                    </div>
                </div>
            `;
        default:
            return `<p>Section ${section} not implemented</p>`;
    }
}

function showError(message) {
    alert(message); // Replace with a better UI notification in production
}

function showSuccess(message) {
    alert(message); // Replace with a better UI notification in production
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}