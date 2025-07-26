let socket;
let userBranchId = null;
let userRole = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    if (!token || !['it_admin', 'super_admin'].includes(userRole)) {
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

    socket.on('itUpdate', (update) => {
        if (userRole === 'super_admin' || update.branchId === userBranchId) {
            updateBanner(update.title + ': ' + update.content);
            loadInventory();
        }
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await fetchUserInfo();
    loadInventory();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        userBranchId = data.branchId;
        document.getElementById('userName').textContent = data.name || 'IT Admin';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'IA';
        document.getElementById('branchName').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';

        if (userRole === 'super_admin') {
            document.getElementById('sectionActions').innerHTML = `
                <select id="branchSelect" onchange="loadInventory()">
                    <option value="">All Branches</option>
                    <!-- Populated dynamically -->
                </select>
                <button class="btn btn-primary" onclick="openModal('addDeviceModal')"><i class="fas fa-plus"></i> Add Device</button>
                <button class="btn btn-primary" onclick="openModal('uploadInventoryModal')"><i class="fas fa-upload"></i> Bulk Upload</button>
            `;
            fetchBranches();
        } else {
            document.getElementById('sectionActions').innerHTML = `
                <button class="btn btn-primary" onclick="openModal('addDeviceModal')"><i class="fas fa-plus"></i> Add Device</button>
                <button class="btn btn-primary" onclick="openModal('uploadInventoryModal')"><i class="fas fa-upload"></i> Bulk Upload</button>
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

async function loadInventory() {
    const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;
    try {
        const url = branchId ? `/api/admin/it/inventory?branchId=${branchId}` : '/api/admin/it/inventory';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        const data = await response.json();

        document.getElementById('inventoryTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Serial Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.devices.map(device => `
                        <tr>
                            <td>${device.type}</td>
                            <td>${device.name}</td>
                            <td>${device.serialNumber}</td>
                            <td>${device.status}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewDevice('${device._id}')">View</button>
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
            `/api/admin/it/search?query=${encodeURIComponent(query)}` :
            `/api/admin/it/search?query=${encodeURIComponent(query)}&branchId=${userBranchId}`;
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

async function addDevice() {
    const type = document.getElementById('deviceType').value;
    const name = document.getElementById('deviceName').value;
    const serialNumber = document.getElementById('deviceSerial').value;
    const status = document.getElementById('deviceStatus').value;

    if (!type || !name || !serialNumber || !status) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/it/inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ type, name, serialNumber, status, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to add device');
        closeModal('addDeviceModal');
        loadInventory();
        socket.emit('itUpdate', {
            title: 'Device Added',
            content: `Device ${name} added to inventory`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function createAccount() {
    const name = document.getElementById('accountName').value;
    const email = document.getElementById('accountEmail').value;
    const role = document.getElementById('accountRole').value;
    const password = document.getElementById('accountPassword').value;

    if (!name || !email || !role || !password) {
        showError('Please provide valid account details');
        return;
    }

    try {
        const response = await fetch('/api/admin/it/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, email, role, password, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to create account');
        closeModal('createAccountModal');
        loadSection('accounts');
        socket.emit('itUpdate', {
            title: 'Account Created',
            content: `Account for ${name} created`,
            branchId: userBranchId
        });
        sendAccountNotification(name, email, role);
    } catch (error) {
        showError(error.message);
    }
}

async function logTicket() {
    const title = document.getElementById('ticketTitle').value;
    const description = document.getElementById('ticketDescription').value;
    const priority = document.getElementById('ticketPriority').value;

    if (!title || !description || !priority) {
        showError('Please provide valid ticket details');
        return;
    }

    try {
        const response = await fetch('/api/admin/it/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, description, priority, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to log ticket');
        closeModal('logTicketModal');
        loadSection('tickets');
        socket.emit('itUpdate', {
            title: 'Ticket Logged',
            content: `Ticket: ${title} logged`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function sendAccountNotification(name, email, role) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipientEmail: email,
                subject: 'Account Creation Notification',
                content: `Your account for St. Andrews SMS has been created with role ${role}.`,
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
            `/api/admin/it/${section}` :
            `/api/admin/it/${section}?branchId=${userBranchId}`;
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
        case 'inventory':
            return document.getElementById('dashboardContent').innerHTML;
        case 'network':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-network-wired"></i> Network</h2>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-wifi"></i></div>
                            <div class="stat-info">
                                <h3>${data.bandwidth} Mbps</h3>
                                <p>Bandwidth</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                            <div class="stat-info">
                                <h3>${data.uptime}%</h3>
                                <p>Uptime</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                            <div class="stat-info">
                                <h3>${data.issues}</h3>
                                <p>Active Issues</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'accounts':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-users"></i> Accounts</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('createAccountModal')"><i class="fas fa-plus"></i> Create Account</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th></th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.accounts.map(account => `
                                    <tr>
                                        <td>${account.name}</td>
                                        <td>${account.email}</td>
                                        <td>${account.role}</td>
                                        <td>${account.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewAccount('${account._id}')"></button>View
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'tickets':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-ticket-alt"></i> Tickets</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('logTicketModal')"><i class="fas fa-plus"></i> Log Ticket</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.tickets.map(ticket => `
                                    <tr>
                                        <td>${ticket.title}</td>
                                        <td>${ticket.description}</td>
                                        <td>${ticket.priority}</td>
                                        <td>${ticket.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewTicket('${ticket._id}')"></button>View
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> IT Analytics</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport()">Generate Report<i class="fas fa-file-pdf"></i></button>
                        </div>
                    </div>
                    <div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-server"></i></i>
                            </div>
                            <div class="stat-info">
                                <h3>${data.totalDevices}</h3>
                                <p>Total Devices</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>
                            <div class="stat-info">
                                <h3>${data.openTickets}</h3>
                                <p>Open Tickets</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                            <div class="stat-info">
                                <h3>${data.avgResolutionTime}</h3>
                                <p>Avg. Resolution Time</p>
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
                                        <td>${message.recipientEmail}</td>
                                        <td>${message.subject}</td>
                                        <td>${new Date(message.createdTimestamp).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewMessage">('${message._id}')">View</button>
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

async function viewDevice(id) {
    try {
        const response = await fetch(`/api/admin/it/inventory/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch device details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.device.branchId !== userBranchId) {
            showError('Access denied: Device belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa fa-server"></i> Device Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('inventory')"><i class="fas fa fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Type</th><td>${data.device.type}</td></tr>
                        <tr><th>Name</th><td>${data.device.name}</td></tr>
                        <tr><th>Serial Number</th><td>${data.device.serialNumber}</td></tr>
                        <tr><th>Status</th><td>${data.device.status}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function viewAccount(id) {
    try {
        const response = await fetch(`/api/admin/it/accounts/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch account details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.account.branchId !== userBranchId) {
            showError('Access denied: Account belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-users"></i> Account Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('accounts')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Name</th><td>${data.account.name}</td></tr>
                        <tr><th>Email</td></th><td>${data.account.email}</td></tr>
                        <tr><th>Role</th><td>${data.account.role}</td></tr>
                        <tr><th>Status</td></th><td>${data.account.status}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function viewTicket(id) {
    try {
        const response = await fetch(`/api/admin/it/tickets/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch ticket details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.ticket.branchId !== userBranchId) {
            showError('Access denied: Ticket belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-ticket-alt"></i> Ticket Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('tickets')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Title</th><td>${data.ticket.title}</td></tr>
                        <tr><td>${Description}</td></td><td>${data.ticket.description}</td></tr>
                        <tr><th>Priority</th><td>${data.ticket.priority}</td></tr>
                        <tr><td>${Status}</td></td><td>${data.ticket.status}</td></tr>
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
    const fileInput = document.getElementById('inventoryFile');

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
        const files = event.dataTransfer.files;
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

async function uploadInventory() {
    const fileInput = document.getElementById('inventoryFile');

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
        const response = await fetch('/api/admin/it/inventory/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload inventory');
        closeModal('uploadInventoryModal');
        loadSection('inventory');
        socket.emit('itUpdate', {
            title: 'Inventory Updated',
            content: `Bulk inventory uploaded for branch ${userBranchId}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport() {
    try {
        const url = userRole === 'super_admin' && document.getElementById('branchSelect')?.value ?
            `/api/admin/it/report/?branchId=${document.getElementById('branchSelect').value}` :
            `/api/admin/it/report/?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to generate report');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `it_report_${userBranchId || 'all'}_${Date.now()}`.pdf`;
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
</xaiAgent>

### Step 3: LaTeX IT Report Template
This LaTeX template generates a professional IT report, detailing inventory, network status, and ticket summaries, compatible with PDFLaTeX and texlive-full.

<xaiArtifact artifact_id="9c6672d0-0581-45ef-875b-b4931f547d4d" artifact_version_id="f04665e2-2f35-42d2-a392-c9de89a999e8" title="it_report.tex" contentType="text/latex">
\documentclass[a4paper,12pt]{article}
\usepackage{geometry}
\usepackage{xcolor}
\usepackage{lmodern}
\usepackage{booktabs}
\usepackage{siunitx}
\usepackage{fancyhdr}
\usepackage{lastpage}

\geometry{margin=1in}
\sisetup{group-separator={,}, output-decimal-marker={.}}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{St. Andrews School Management System}
\fancyhead[R]{\today}
\fancyfoot[C]{Page \thepage\ of \pageref{LastPage}}
\definecolor{twilight}{RGB}{75,60,142}

\begin{document}

\begin{titlepage}
    \centering
    \vspace*{2cm}
    {\color{twilight}\huge\bfseries IT Dashboard Report \\ St. Andrews SMS \par}
    \vspace{1cm}
    {\Large\itshape Branch: All Branches \par}
    \vspace{0.5cm}
    {\large Generated on \today \par}
    \vspace{2cm}
    {\large Prepared by: IT Admin \par}
\end{titlepage}

\section*{IT Summary Report}
This report provides an overview of IT operations for St. Andrews School Management System for the period ending \today.

\subsection*{Inventory Overview}
\begin{tabular}{l l l l}
    \toprule
    \textbf{Branch} & \textbf{Computers} & \textbf{Printers} & \textbf{Routers} \\
    \midrule
    Assin Fosu & 30 & 5 & 2 \\
    Accra & 20 & 3 & 2 \\
    Dunkwa-on-Offin & 15 & 4 & 1 \\
    Mankessim & 25 & 6 & 3 \\
    Sefwi Asawinso & 10 & 2 & 1 \\
    Takoradi & 30 & 5 & 2 \\
    New Edubiase & 20 & 3 & 2 \\
    \bottomrule
\end{tabular}

\subsection*{Network Status}
\begin{tabular}{l S[table-format=3.1] c}
    \toprule
    \textbf{Branch} & \textbf{Bandwidth (Mbps)} & \textbf{Uptime (\%)} \\
    \midrule
    Assin Fosu & 50.0 & 99.5 \\
    Accra & 100.0 & 99.0 \\
    Dunkwa-on-Offin & 30.0 & 98.5 \\
    Mankessim & 60.0 & 99.2 \\
    Sefwi Asawinso & 20.0 & 98.0 \\
    Takoradi & 80.0 & 99.3 \\
    New Edubiase & 40.0 & 98.8 \\
    \bottomrule
\end{tabular}

\subsection*{Incident Summary}
\begin{tabular}{l c c c}
    \toprule
    \textbf{Branch} & \textbf{Open Tickets} & \textbf{Avg. Resolution Time (hrs)} & \textbf{High Priority} \\
    \midrule
    Assin Fosu & 5 & 4 & 1 \\
    Accra & 3 & 3 & 0 \\
    Dunkwa-on-Offin & 7 & 5 & 2 \\
    Mankessim & 4 & 3 & 1 \\
    Sefwi Asawinso & 2 & 2 & 0 \\
    Takoradi & 1 & 2 & 0 \\
    New Edubiase & 6 & 4 & 1 \\
    \bottomrule
\end{tabular}

\section*{Consolidated IT Metrics}
\begin{tabular}{l S[table-format=4.0] c}
    \toprule
    \textbf{Metric} & \textbf{Value} & \textbf{Percentage (\%)} \\
    \midrule
    Total Devices & 150 & 100 \\
    Open Tickets & 28 & -- \\
    Average Uptime & -- & 98.9 \\
    \bottomrule
\end{tabular}

\end{document}