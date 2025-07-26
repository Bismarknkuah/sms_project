let socket;
let userBranchId = null;
let userRole = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    if (!token || !['pta_admin', 'super_admin'].includes(userRole)) {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
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

    socket.on('ptaUpdate', (update) => {
        if (userRole === 'super_admin' || update.branchId === userBranchId) {
            updateBanner(update.title + ': ' + update.content);
            loadDues();
        }
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await fetchUserInfo();
    loadDues();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        userBranchId = data.branchId;
        document.getElementById('userName').textContent = data.name || 'PTA Admin';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'PA';
        document.getElementById('branchName').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';

        if (userRole === 'super_admin') {
            document.getElementById('sectionActions').innerHTML = `
                <select id="branchSelect" onchange="loadDues()">
                    <option value="">All Branches</option>
                    <!-- Populated dynamically -->
                </select>
                <button class="btn btn-primary" onclick="openModal('processPaymentModal')"><i class="fas fa-plus"></i> Process Payment</button>
                <button class="btn btn-primary" onclick="openModal('uploadDuesModal')"><i class="fas fa-upload"></i> Bulk Upload</button>
            `;
            fetchBranches();
        } else {
            document.getElementById('sectionActions').innerHTML = `
                <button class="btn btn-primary" onclick="openModal('processPaymentModal')"><i class="fas fa-plus"></i> Process Payment</button>
                <button class="btn btn-primary" onclick="openModal('uploadDuesModal')"><i class="fas fa-upload"></i> Bulk Upload</button>
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

async function loadDues() {
    const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;
    try {
        const url = branchId ? `/api/admin/pta/dues?branchId=${branchId}` : '/api/admin/pta/dues';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dues');
        const data = await response.json();

        document.getElementById('duesTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Parent ID</th>
                        <th>Name</th>
                        <th>Amount (GHS)</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.dues.map(dues => `
                        <tr>
                            <td>${dues.parentId}</td>
                            <td>${dues.parentName}</td>
                            <td>${dues.amount}</td>
                            <td>${dues.status}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewDues('${dues._id}')">View</button>
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

async function searchResources(query) {
    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/pta/search?query=${encodeURIComponent(query)}` :
            `/api/admin/pta/search?query=${encodeURIComponent(query)}&branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search resources');
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
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.results.map(result => `
                                <tr>
                                    <td>${result.type}</td>
                                    <td>${result.details}</td>
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

async function processPayment() {
    const parentId = document.getElementById('parentId').value;
    const amount = document.getElementById('amount').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const status = document.getElementById('paymentStatus').value;

    if (!parentId || !amount || !phoneNumber || !status) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/pta/dues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ parentId, amount, phoneNumber, status, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to process payment');

        const data = await response.json();
        await initiateMoMoPayment(data.paymentId, amount, phoneNumber);
        closeModal('processPaymentModal');
        loadDues();
        socket.emit('ptaUpdate', {
            title: 'Payment Processed',
            content: `Dues payment of GHS ${amount} processed for parent ${parentId}`,
            branchId: userBranchId
        });
        sendPaymentNotification(parentId, amount, status);
    } catch (error) {
        showError(error.message);
    }
}

async function initiateMoMoPayment(paymentId, amount, phoneNumber) {
    try {
        const response = await fetch('/api/admin/pta/momo-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ paymentId, amount, phoneNumber, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to initiate MoMo payment');
    } catch (error) {
        showError(error.message);
    }
}

async function scheduleMeeting() {
    const title = document.getElementById('meetingTitle').value;
    const date = document.getElementById('meetingDate').value;
    const location = document.getElementById('meetingLocation').value;
    const description = document.getElementById('meetingDescription').value;

    if (!title || !date || !location || !description) {
        showError('Please provide valid meeting details');
        return;
    }

    try {
        const response = await fetch('/api/admin/pta/meetings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, date, location, description, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to schedule meeting');
        closeModal('scheduleMeetingModal');
        loadSection('meetings');
        socket.emit('ptaUpdate', {
            title: 'Meeting Scheduled',
            content: `Meeting: ${title} scheduled for ${new Date(date).toLocaleDateString()}`,
            branchId: userBranchId
        });
        sendMeetingNotification(title, date, location);
    } catch (error) {
        showError(error.message);
    }
}

async function sendNotification() {
    const title = document.getElementById('notificationTitle').value;
    const content = document.getElementById('notificationContent').value;
    const type = document.getElementById('notificationType').value;

    if (!title || !content || !type) {
        showError('Please provide valid notification details');
        return;
    }

    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, content, type, branchId: userBranchId, recipient: 'pta_parents' })
        });
        if (!response.ok) throw new Error('Failed to send notification');
        closeModal('sendNotificationModal');
        loadSection('notifications');
        socket.emit('ptaUpdate', {
            title: 'Notification Sent',
            content: `Notification: ${title} sent to parents`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function sendPaymentNotification(parentId, amount, status) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipient: parentId,
                subject: 'PTA Dues Payment Update',
                content: `Your PTA dues payment of GHS ${amount} has been marked as ${status}.`,
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send payment notification');
    } catch (error) {
        showError(error.message);
    }
}

async function sendMeetingNotification(title, date, location) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipient: 'pta_parents',
                subject: 'PTA Meeting Scheduled',
                content: `A PTA meeting titled "${title}" is scheduled for ${new Date(date).toLocaleString()} at ${location}.`,
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send meeting notification');
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/pta/${section}` :
            `/api/admin/pta/${section}?branchId=${userBranchId}`;
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
        case 'dues':
            return document.getElementById('dashboardContent').innerHTML;
        case 'meetings':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-calendar-alt"></i> Meetings</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('scheduleMeetingModal')"><i class="fas fa-plus"></i> Schedule Meeting</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.meetings.map(meeting => `
                                    <tr>
                                        <td>${meeting.title}</td>
                                        <td>${new Date(meeting.date).toLocaleString()}</td>
                                        <td>${meeting.location}</td>
                                        <td>${meeting.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewMeeting('${meeting._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'notifications':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-bell"></i> Notifications</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('sendNotificationModal')"><i class="fas fa-plus"></i> Send Notification</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Content</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.notifications.map(notification => `
                                    <tr>
                                        <td>${notification.title}</td>
                                        <td>${notification.content}</td>
                                        <td>${notification.type}</td>
                                        <td>${new Date(notification.createdTimestamp).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewNotification('${notification._id}')">View</button>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> PTA Analytics</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-file-pdf"></i> Generate Report</button>
                        </div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-money-bill"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalDues}</h3>
                                <p>Total Dues (GHS)</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="stat-info">
                                <h3>${data.paidPercentage}%</h3>
                                <p>Paid Dues</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
                            <div class="stat-info">
                                <h3>${data.meetingAttendance}</h3>
                                <p>Avg. Meeting Attendance</p>
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
                            <button class="btn btn-primary" onclick="openModal('sendNotificationModal')"><i class="fas fa-plus"></i> Send Message</button>
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
                                        <td>${message.recipient}</td>
                                        <td>${message.subject}</td>
                                        <td>${new Date(message.createdTimestamp).toLocaleDateString()}</td>
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

async function viewDues(id) {
    try {
        const response = await fetch(`/api/admin/pta/dues/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch dues details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.dues.branchId !== userBranchId) {
            showError('Access denied: Dues record belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-money-bill"></i> Dues Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('dues')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Parent ID</th><td>${data.dues.parentId}</td></tr>
                        <tr><th>Name</th><td>${data.dues.parentName}</td></tr>
                        <tr><th>Amount (GHS)</th><td>${data.dues.amount}</td></tr>
                        <tr><th>Status</th><td>${data.dues.status}</td></tr>
                        <tr><th>Phone Number</th><td>${data.dues.phoneNumber}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function viewMeeting(id) {
    try {
        const response = await fetch(`/api/admin/pta/meetings/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch meeting details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.meeting.branchId !== userBranchId) {
            showError('Access denied: Meeting belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-calendar-alt"></i> Meeting Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('meetings')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Title</th><td>${data.meeting.title}</td></tr>
                        <tr><th>Date</th><td>${new Date(data.meeting.date).toLocaleString()}</td></tr>
                        <tr><th>Location</th><td>${data.meeting.location}</td></tr>
                        <tr><th>Description</th><td>${data.meeting.description}</td></tr>
                        <tr><th>Status</th><td>${data.meeting.status}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function viewNotification(id) {
    try {
        const response = await fetch(`/api/admin/pta/notifications/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notification details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.notification.branchId !== userBranchId) {
            showError('Access denied: Notification belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-bell"></i> Notification Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('notifications')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Title</th><td>${data.notification.title}</td></tr>
                        <tr><th>Content</th><td>${data.notification.content}</td></tr>
                        <tr><th>Type</th><td>${data.notification.type}</td></tr>
                        <tr><th>Date</th><td>${new Date(data.notification.createdTimestamp).toLocaleDateString()}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

function initializeFileUpload() {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('duesFile');

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

async function uploadDues() {
    const fileInput = document.getElementById('duesFile');

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
        const response = await fetch('/api/admin/pta/dues/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload dues');
        closeModal('uploadDuesModal');
        loadSection('dues');
        socket.emit('ptaUpdate', {
            title: 'Dues Uploaded',
            content: `Bulk dues uploaded for branch ${userBranchId}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport() {
    try {
        const url = userRole === 'super_admin' && document.getElementById('branchSelect')?.value ?
            `/api/admin/pta/report?branchId=${document.getElementById('branchSelect').value}` :
            `/api/admin/pta/report?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to generate report');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `pta_report_${userBranchId || 'all'}_${Date.now()}.pdf`;
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
    const sidebar = document.querySelector('#sidebar');
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