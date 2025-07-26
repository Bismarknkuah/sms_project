let socket;
let userBranchId = null;
let userRole = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    if (!token || !['report_admin', 'super_admin'].includes(userRole)) {
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

    socket.on('reportUpdate', (update) => {
        if (userRole === 'super_admin' || update.branchId === userBranchId) {
            updateBanner(update.title + ': ' + update.content);
            loadReports();
        }
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await fetchUserInfo();
    loadReports();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        userBranchId = data.branchId;
        document.getElementById('userName').textContent = data.name || 'Report Admin';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'RA';
        document.getElementById('branchName').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';

        if (userRole === 'super_admin') {
            document.getElementById('sectionActions').innerHTML = `
                <select id="branchSelect" onchange="loadReports()">
                    <option value="">All Branches</option>
                    <!-- Populated dynamically -->
                </select>
                <button class="btn btn-primary" onclick="openModal('generateReportModal')"><i class="fas fa-plus"></i> Generate Report</button>
                <button class="btn btn-primary" onclick="openModal('scheduleReportModal')"><i class="fas fa-calendar-alt"></i> Schedule Report</button>
                <button class="btn btn-primary" onclick="openModal('uploadTemplateModal')"><i class="fas fa-upload"></i> Upload Template</button>
            `;
            fetchBranches();
            fetchTemplates('templateId');
            fetchTemplates('scheduleTemplateId');
        } else {
            document.getElementById('sectionActions').innerHTML = `
                <button class="btn btn-primary" onclick="openModal('generateReportModal')"><i class="fas fa-plus"></i> Generate Report</button>
                <button class="btn btn-primary" onclick="openModal('scheduleReportModal')"><i class="fas fa-calendar-alt"></i> Schedule Report</button>
            `;
            fetchTemplates('templateId');
            fetchTemplates('scheduleTemplateId');
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

async function fetchTemplates(selectId) {
    try {
        const response = await fetch('/api/admin/reports/templates', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch templates');
        const data = await response.json();

        const templateOptions = data.templates.map(template => `<option value="${template._id}">${template.name}</option>`).join('');
        document.getElementById(selectId).innerHTML = `<option value="">Select Template</option>${templateOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function loadReports() {
    const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;
    try {
        const url = branchId ? `/api/admin/reports?branchId=${branchId}` : '/api/admin/reports';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();

        document.getElementById('reportsTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Date Range</th>
                        <th>Generated On</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.reports.map(report => `
                        <tr>
                            <td>${report.type}</td>
                            <td>${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}</td>
                            <td>${new Date(report.createdTimestamp).toLocaleString()}</td>
                            <td>${report.status}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="downloadReport('${report._id}')">Download</button>
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

async function searchReports(query) {
    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/reports/search?query=${encodeURIComponent(query)}` :
            `/api/admin/reports/search?query=${encodeURIComponent(query)}&branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search reports');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            dysregulation-content-section {
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
                            </tbody>
                        </table>
                    </div>
                </div>`).join('')}
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport() {
    const type = document.getElementById('reportType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const templateId = document.getElementById('templateId').value;

    if (!type || !startDate || !endDate || !templateId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ type, startDate, endDate, templateId, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to generate report');
        const data = await response.json();

        closeModal('generateReportModal');
        loadReports();
        socket.emit('reportUpdate', {
            title: 'Report Generated',
            content: `Report generated for ${type} from ${startDate} to ${endDate}`,
            branchId: userBranchId
        });
        sendReportNotification(data.reportId, type);
        downloadReport(data.reportId);
    } catch (error) {
        showError(error.message);
    }
}

async function scheduleReport() {
    const type = document.getElementById('scheduleReportType').value;
    const frequency = document.getElementById('scheduleFrequency').value;
    const recipient = document.getElementById('scheduleRecipient').value;
    const templateId = document.getElementById('scheduleTemplateId').value;

    if (!type || !frequency || !recipient || !type) {
        showError('Please provide valid schedule details');
        return;
    }

    try {
        const response = await fetch('/api/admin/reports/schedule', {
            method: 'POST',
            headers: {
                'content-type-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ type, frequency, recipient, templateId, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('failed to schedule report');
        closeModal('scheduleReportModal');
        loadSection('schedules');
        socket.emit('reportUpdate', {
            title: 'Report Scheduled',
            content: `Report ${type} scheduled with frequency ${frequency}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function uploadTemplate() {
    const fileInput = document.getElementById('templateFile');
    const name = document.getElementById('templateName').value;
    const type = document.getElementById('templateType').value;

    if (!fileInput.files.length || !name || !type) {
        showError('Please provide valid template details');
        return;
    }

    const file = fileInput.files[0];
    if (file.name.endsWith('.tex')) {
        showError('Only LaTeX files (.tex) are allowed');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('type', type);
    formData.append('branchId', userBranchId);

    try {
        const response = await fetch('/api/admin/reports/templates', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload template');
        closeModal('uploadTemplateModal');
        loadSection('templates');
        socket.emit('reportUpdate', {
            title: 'Template Uploaded',
            content: `Template ${name} uploaded for ${type}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function sendReportNotification(reportId, type) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                content: `A new ${type} report has been generated with ID: ${reportId}.`,
                contentType: 'text/plain',
                subject: 'Report Generated',
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send report notification');
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/reports/${section}` :
            `/api/admin/reports/${section}?branchId=${userBranchId}`;
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
        case 'reports':
            return document.getElementById('dashboardContent').innerHTML;
        case 'schedules':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa fa-calendar"></i> Schedules</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('scheduleReportModal')"><i class="fas fa fa-ticket-alt"></i> Schedule Report</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Frequency</th>
                                    <th>Recipient</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.schedules.map(schedule => `
                                    <tr>
                                        <td>${schedule.type}</td>
                                        <td>${schedule.frequency}</td>
                                        <td>${schedule.email}</td>
                                        <td>${schedule.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewSchedule('${schedule._id}')"></button>View Schedule
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>`).
            join('');}
        case 'analytics':
            return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa fa-chart-bar"></i> Report Analytics</h2>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa fa-file"></i></div>
                        <div class="stat-info">
                            <h3>${data.totalReports}</h3>
                            <p>Total Reports</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa fa-download"></i></div>
                        <div class="stat-info">
                            <h3>${data.downloads}</h3>
                            <p>Downloads</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa fa-exclamation-circle"></i></div>
                        <div class="stats-info">
                            <h3>${data.pendingSchedules}</p3>
                            <p>Pending Schedules</p>
                        </div>
                    </div>
                </div>
            </div>
            `;
        case 'templates':
            return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa fa-file-code"></i> Templates</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="openModal('uploadTemplateModal')"><i class="fas fa fa-upload"></i> Upload Template</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                </td><th>Type</th>
                                <th>Uploaded</th>
                                </td><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.templates.map(template => `
                                <tr>
                                    <td>${template.name}</td>
                                    </td><td>${template.type}</td>
                                    <td>${new Date(template.createdAt).toLocaleDateString()}</td>
                                    </td><td>
                                        <button class="btn btn-primary btn-small" onclick="downloadTemplate('${template._id}')"></button>View Template
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>`).
                    join('');}
        case 'messages':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa fa-envelope"></i> Messages</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('sendNotificationModal')"><i class="fas fa fa-plus"></i> Send Message</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Recipient</th>
                                    </th>
                                    <th>Subject</th>
                                    </th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                    </tr>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.messages.map(message => `
                                    <tr>
                                        <td>${message.recipient}</td>
                                        </td><td>${message.subject}</td>
                                        <td>${new Date(message.createdTimestamp).toLocaleDateString()}</td>
                                        </td><td>
                                            <button class="btn btn-primary btn-small" onclick="viewMessage('${message._id}')"></button>View</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>`).
                    join('');}
        default:
            return `<p>${section} not implemented</p>`;
    }
}

async function downloadReport(id) {
    try {
        const response = await fetch(`/api/admin/reports/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to download report');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${id}_${Date.now()}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError(error.message);
    }
}

async function downloadTemplate(id) {
    try {
        const response = await fetch(`/api/admin/reports/templates/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to download template');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template_${id}_${Date.now()}.tex`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError(error.message);
    }
}

async function viewSchedule(id) {
    try {
        const response = await fetch(`/api/admin/reports/schedules/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch schedule details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.schedule.branchId !== userBranchId) {
            showError('Access denied: details Schedule details belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa fa-calendar"></i> Schedule Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('schedules')"><i class="fas fa fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><td><th>Type</th><td></td>${data.schedule.type}</td></tr>
                        <tr><td><th>Frequency</th><td></td>${data.schedule.frequency}</td></tr>
                        <tr><td><th>Recipient</td></th><td>${data.schedule.recipient}</td></tr>
                        <tr><td><th>Status</td></th><td>${data.schedule.status}</td></tr>
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
    const fileInput = document.getElementById('templateFile');

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
    document.querySelector('#sidebar').classList.toggle('active');
}

function showError(message) {
    alert(message); // Replace with a better UI notification in production
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}