let performanceChart;
let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'branch_admin') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/branchadmin', {
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
        const response = await fetch('/api/branchadmin/overview', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();

        document.getElementById('totalStudents').textContent = data.totalStudents || 0;
        document.getElementById('totalStaff').textContent = data.totalStaff || 0;
        document.getElementById('totalRevenue').textContent = `₵${(data.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('attendanceRate').textContent = `${data.attendanceRate || 0}%`;
        document.getElementById('userName').textContent = data.adminName || 'Branch Admin';
        document.getElementById('userAvatar').textContent = data.adminName ? data.adminName.charAt(0).toUpperCase() : 'BA';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchNotifications() {
    try {
        const response = await fetch('/api/branchadmin/notifications', {
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
        const response = await fetch('/api/branchadmin/activity', {
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
        const response = await fetch('/api/branchadmin/updates', {
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
        const response = await fetch('/api/branchadmin/classes', {
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
        const response = await fetch(`/api/branchadmin/analytics?type=${chartType}`, {
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
        const response = await fetch(`/api/branchadmin/notifications/${notificationId}`, {
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
        const response = await fetch('/api/branchadmin/students', {
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
        const response = await fetch('/api/branchadmin/staff', {
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

async function generateReport(type) {
    try {
        const response = await fetch(`/api/branchadmin/reports/${type}`, {
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

        const response = await fetch(`/api/branchadmin/${section}`, {
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
        const response = await fetch('/api/branchadmin/messages', {
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
        const response = await fetch(`/api/branchadmin/messages/${messageId}`, {
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

        await fetch('/api/branchadmin/messages', {
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

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}