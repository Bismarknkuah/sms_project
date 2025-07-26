let revenueChart;
let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'super_admin') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/superadmin', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('chatMessage', (data) => {
        const { senderId, message, timestamp } = data;
        const currentChatUser = document.querySelector('.chat-user.active')?.dataset.userId;
        if (currentChatUser === senderId) {
            appendChatMessage(message, timestamp, 'received');
        }
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
        fetchAuditLog(),
        fetchBranches()
    ]);
    initializeChart();
}

async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/superadmin/overview', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();

        document.getElementById('totalBranches').textContent = data.totalBranches || 0;
        document.getElementById('totalStudents').textContent = data.totalStudents || 0;
        document.getElementById('totalStaff').textContent = data.totalStaff || 0;
        document.getElementById('totalRevenue').textContent = `₵${(data.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('branchCount').textContent = data.totalBranches || 0;
        document.getElementById('userName').textContent = data.adminName || 'Super Admin';
        document.getElementById('userAvatar').textContent = data.adminName ? data.adminName.charAt(0).toUpperCase() : 'SA';

        document.getElementById('branchChange').textContent = data.branchChange || '';
        document.getElementById('studentChange').textContent = data.studentChange || '';
        document.getElementById('staffChange').textContent = data.staffChange || '';
        document.getElementById('revenueChange').textContent = data.revenueChange || '';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchNotifications() {
    try {
        const response = await fetch('/api/superadmin/notifications', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();

        const dropdown = document.getElementById('notificationDropdown');
        const badge = document.getElementById('notificationBadge');
        badge.textContent = data.notifications.length;
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
        const response = await fetch('/api/superadmin/activity', {
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

async function fetchAuditLog() {
    try {
        const response = await fetch('/api/superadmin/audit', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch audit log');
        const data = await response.json();

        document.getElementById('auditLog').innerHTML = data.logs.map(log => `
            <div class="audit-item">
                <div class="audit-icon">
                    <i class="fas fa-${log.icon || 'history'}"></i>
                </div>
                <div class="audit-details">
                    <p>${log.message}</p>
                </div>
                <div class="audit-time">${new Date(log.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchBranches() {
    try {
        const response = await fetch('/api/superadmin/branches', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();

        document.getElementById('branchesGrid').innerHTML = data.branches.map(branch => `
            <div class="branch-card">
                <div class="branch-header">
                    <div class="branch-name"><i class="fas fa-building"></i> ${branch.name}</div>
                    <div class="branch-status ${branch.status}">${branch.status}</div>
                </div>
                <div class="branch-stats">
                    <div class="branch-stat">
                        <h4>${branch.studentCount}</h4>
                        <p>Students</p>
                    </div>
                    <div class="branch-stat">
                        <h4>${branch.staffCount}</h4>
                        <p>Staff</p>
                    </div>
                </div>
                <div class="branch-admin">
                    <div class="admin-avatar">${branch.adminName ? branch.adminName.charAt(0).toUpperCase() : 'N/A'}</div>
                    <div class="admin-info">
                        <h5>${branch.adminName || 'No Admin Assigned'}</h5>
                        <p>Branch Admin</p>
                    </div>
                </div>
                <div class="branch-actions">
                    <button class="btn-small btn-view" onclick="viewBranch('${branch._id}')">View</button>
                    <button class="btn-small btn-edit" onclick="openBranchModal('edit', '${branch._id}')">Edit</button>
                    <button class="btn-small btn-control" onclick="controlBranch('${branch._id}')">Control</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

function initializeChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Populated dynamically
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
    const dateRange = document.getElementById('dateRange').value;
    try {
        const response = await fetch(`/api/superadmin/revenue?range=${dateRange}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch revenue data');
        const data = await response.json();

        revenueChart.data.labels = data.labels;
        revenueChart.data.datasets = data.datasets;
        revenueChart.update();
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
        const response = await fetch(`/api/superadmin/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to dismiss notification');
        fetchNotifications();
    } catch (error) {
        showError(error.message);
    }
}

function openUserModal(mode, userId = '') {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('modalTitle');
    title.textContent = mode === 'add' ? 'Add New User' : 'Edit User';
    modal.classList.add('active');
    if (mode === 'edit') {
        fetch(`/api/superadmin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('userUsername').value = data.username;
                document.getElementById('userFullName').value = data.fullName;
                document.getElementById('userRole').value = data.role;
                document.getElementById('userBranch').value = data.branch || '';
            })
            .catch(error => showError(error.message));
    }
}

function openBranchModal(mode, branchId = '') {
    const modal = document.getElementById('branchModal');
    const title = document.getElementById('branchModalTitle');
    title.textContent = mode === 'add' ? 'Add New Branch' : 'Edit Branch';
    modal.classList.add('active');
    if (mode === 'edit') {
        fetch(`/api/superadmin/branches/${branchId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('branchName').value = data.name;
                document.getElementById('branchLocation').value = data.location;
                fetchBranchAdmins();
            })
            .catch(error => showError(error.message));
    } else {
        fetchBranchAdmins();
    }
}

async function fetchBranchAdmins() {
    try {
        const response = await fetch('/api/superadmin/users?role=branch_admin', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch admins');
        const data = await response.json();
        const select = document.getElementById('branchAdmin');
        select.innerHTML = '<option value="">Select Admin</option>' +
            data.users.map(user => `<option value="${user._id}">${user.fullName}</option>`).join('');
    } catch (error) {
        showError(error.message);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'userModal') {
        document.getElementById('userUsername').value = '';
        document.getElementById('userPassword').value = '';
        document.getElementById('userFullName').value = '';
        document.getElementById('userRole').value = 'branch_admin';
        document.getElementById('userBranch').value = '';
    } else if (modalId === 'branchModal') {
        document.getElementById('branchName').value = '';
        document.getElementById('branchLocation').value = '';
        document.getElementById('branchAdmin').value = '';
    } else if (modalId === 'messageModal') {
        document.getElementById('messageRecipient').value = 'user';
        document.getElementById('userSelect').value = '';
        document.getElementById('roleSelect').value = 'branch_admin';
        document.getElementById('branchSelect').value = '';
        document.getElementById('messageContent').value = '';
        toggleRecipientFields();
    } else if (modalId === 'updateModal') {
        document.getElementById('updateRecipient').value = 'branch_admins';
        document.getElementById('updateTitle').value = '';
        document.getElementById('updateContent').value = '';
    }
}

async function saveUser() {
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    const fullName = document.getElementById('userFullName').value;
    const role = document.getElementById('userRole').value;
    const branch = document.getElementById('userBranch').value;

    try {
        const response = await fetch('/api/superadmin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ username, password, fullName, role, branch })
        });
        if (!response.ok) throw new Error('Failed to save user');
        closeModal('userModal');
        fetchActivityFeed();
        fetchNotifications();
    } catch (error) {
        showError(error.message);
    }
}

async function saveBranch() {
    const name = document.getElementById('branchName').value;
    const location = document.getElementById('branchLocation').value;
    const adminId = document.getElementById('branchAdmin').value;

    try {
        const response = await fetch('/api/superadmin/branches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, location, adminId })
        });
        if (!response.ok) throw new Error('Failed to save branch');
        closeModal('branchModal');
        fetchBranches();
        fetchDashboardStats();
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
                        <h2 class="section-title"><i class="fas fa-comments"></i> Communication Hub</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openMessageModal()"><i class="fas fa-envelope"></i> Send Message</button>
                            <button class="btn btn-primary" onclick="openUpdateModal()"><i class="fas fa-bullhorn"></i> Send Update</button>
                        </div>
                    </div>
                    <div class="tabs">
                        <div class="tab active" onclick="switchTab('send-message', this)">Send Message</div>
                        <div class="tab" onclick="switchTab('chat-admins', this)">Chat with Admins</div>
                        <div class="tab" onclick="switchTab('send-updates', this)">Send Updates</div>
                    </div>
                    <div id="send-message" class="tab-content">
                        <p>Select "Send Message" to send a message to specific users, roles, branches, or all users.</p>
                    </div>
                    <div id="chat-admins" class="tab-content" style="display: none;">
                        <div class="chat-container">
                            <div class="chat-sidebar" id="chatUsers">
                                <!-- Populated dynamically -->
                            </div>
                            <div class="chat-main">
                                <div class="chat-header" id="chatHeader">Select a user to start chatting</div>
                                <div class="chat-messages" id="chatMessages"></div>
                                <div class="chat-input">
                                    <input type="text" id="chatInput" placeholder="Type a message..." disabled>
                                    <button onclick="sendChatMessage()" disabled>Send</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="send-updates" class="tab-content" style="display: none;">
                        <p>Select "Send Update" to broadcast announcements to branch admins or all users.</p>
                    </div>
                </div>
            `;
            await fetchChatUsers();
            return;
        }

        const response = await fetch(`/api/superadmin/${section}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to load ${section}`);
        const data = await response.json();

        content.innerHTML = renderSection(section, data);
    } catch (error) {
        content.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function switchTab(tabId, element) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    element.classList.add('active');
    document.getElementById(tabId).style.display = 'block';
}

async function fetchChatUsers() {
    try {
        const response = await fetch('/api/superadmin/users?role=branch_admin', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch chat users');
        const data = await response.json();

        const chatUsers = document.getElementById('chatUsers');
        chatUsers.innerHTML = data.users.map(user => `
            <div class="chat-user" data-user-id="${user._id}" onclick="selectChatUser('${user._id}', '${user.fullName}')">
                <div class="avatar">${user.fullName.charAt(0).toUpperCase()}</div>
                <span>${user.fullName}</span>
            </div>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function selectChatUser(userId, fullName) {
    document.querySelectorAll('.chat-user').forEach(user => user.classList.remove('active'));
    document.querySelector(`.chat-user[data-user-id="${userId}"]`).classList.add('active');
    document.getElementById('chatHeader').textContent = `Chat with ${fullName}`;
    document.getElementById('chatInput').disabled = false;
    document.getElementById('chatInput').nextElementSibling.disabled = false;

    try {
        const response = await fetch(`/api/superadmin/messages?recipientId=${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch chat history');
        const data = await response.json();

        const messages = document.getElementById('chatMessages');
        messages.innerHTML = data.messages.map(msg => `
            <div class="chat-message ${msg.senderId === 'super_admin' ? 'sent' : 'received'}">
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
    const recipientId = document.querySelector('.chat-user.active')?.dataset.userId;

    if (!message || !recipientId) return;

    try {
        socket.emit('chatMessage', { recipientId, message });
        appendChatMessage(message, new Date(), 'sent');
        input.value = '';

        await fetch('/api/superadmin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ recipientId, content: message, type: 'message' })
        });
    } catch (error) {
        showError(error.message);
    }
}

function openMessageModal() {
    const modal = document.getElementById('messageModal');
    modal.classList.add('active');
    fetchMessageRecipients();
}

async function fetchMessageRecipients() {
    try {
        const [usersResponse, branchesResponse] = await Promise.all([
            fetch('/api/superadmin/users', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }),
            fetch('/api/superadmin/branches', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        ]);

        if (!usersResponse.ok || !branchesResponse.ok) throw new Error('Failed to fetch recipients');

        const users = await usersResponse.json();
        const branches = await branchesResponse.json();

        document.getElementById('userSelect').innerHTML = '<option value="">Select User</option>' +
            users.users.map(user => `<option value="${user._id}">${user.fullName} (${user.role})</option>`).join('');
        document.getElementById('branchSelect').innerHTML = '<option value="">Select Branch</option>' +
            branches.branches.map(branch => `<option value="${branch._id}">${branch.name}</option>`).join('');
    } catch (error) {
        showError(error.message);
    }
}

function toggleRecipientFields() {
    const recipientType = document.getElementById('messageRecipient').value;
    document.getElementById('userSelectGroup').style.display = recipientType === 'user' ? 'block' : 'none';
    document.getElementById('roleSelectGroup').style.display = recipientType === 'role' ? 'block' : 'none';
    document.getElementById('branchSelectGroup').style.display = recipientType === 'branch' ? 'block' : 'none';
}

async function sendMessage() {
    const recipientType = document.getElementById('messageRecipient').value;
    const content = document.getElementById('messageContent').value.trim();
    let recipientId, role, branchId;

    if (recipientType === 'user') {
        recipientId = document.getElementById('userSelect').value;
    } else if (recipientType === 'role') {
        role = document.getElementById('roleSelect').value;
    } else if (recipientType === 'branch') {
        branchId = document.getElementById('branchSelect').value;
    }

    if (!content || (recipientType === 'user' && !recipientId) || (recipientType === 'role' && !role) || (recipientType === 'branch' && !branchId)) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/superadmin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ recipientId, role, branchId, content, type: 'message' })
        });
        if (!response.ok) throw new Error('Failed to send message');
        closeModal('messageModal');
        fetchActivityFeed();
        fetchNotifications();
    } catch (error) {
        showError(error.message);
    }
}

function openUpdateModal() {
    document.getElementById('updateModal').classList.add('active');
}

async function sendUpdate() {
    const recipient = document.getElementById('updateRecipient').value;
    const title = document.getElementById('updateTitle').value.trim();
    const content = document.getElementById('updateContent').value.trim();

    if (!title || !content) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/superadmin/updates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ recipient, title, content, type: 'update' })
        });
        if (!response.ok) throw new Error('Failed to send update');
        closeModal('updateModal');
        fetchActivityFeed();
        fetchNotifications();
    } catch (error) {
        showError(error.message);
    }
}

function renderSection(section, data) {
    switch (section) {
        case 'dashboard':
            // Dashboard content is already loaded
            return document.getElementById('dashboardContent').innerHTML;