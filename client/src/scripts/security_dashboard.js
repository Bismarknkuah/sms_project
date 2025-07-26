let socket;
let userBranchId = null;
let userRole = null;
let threatChart = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    if (!token || !['security_admin', 'super_admin'].includes(userRole)) {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/admin', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('securityAlert', (alert) => {
        if (userRole === 'super_admin' || alert.branchId === userBranchId) {
            updateBanner(`Security Alert: ${alert.message}`);
            sendSecurityNotification(alert.message, alert.severity);
        }
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await fetchUserInfo();
    loadSection('overview');
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        userBranchId = data.branchId;
        document.getElementById('userName').textContent = data.name || 'Security Admin';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'SA';
        document.getElementById('branchName').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';

        if (userRole === 'super_admin') {
            document.getElementById('sectionActions').innerHTML = `
                <select id="branchSelect" onchange="loadSection('overview')">
                    <option value="">All Branches</option>
                </select>
                <button class="btn btn-primary" onclick="openModal('logIncidentModal')"><i class="fas fa-plus"></i> Log Incident</button>
                <button class="btn btn-primary" onclick="openModal('configurePolicyModal')"><i class="fas fa-cog"></i> Configure Policy</button>
                <button class="btn btn-primary" onclick="generateAuditReport()"><i class="fas fa-file-pdf"></i> Audit Report</button>
            `;
            fetchBranches();
        } else {
            document.getElementById('sectionActions').innerHTML = `
                <button class="btn btn-primary" onclick="openModal('logIncidentModal')"><i class="fas fa-plus"></i> Log Incident</button>
                <button class="btn btn-primary" onclick="generateAuditReport()"><i class="fas fa-file-pdf"></i> Audit Report</button>
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

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';
    const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;

    try {
        const url = branchId ? `/api/admin/security/${section}?branchId=${branchId}` : `/api/admin/security/${section}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to load ${section}`);
        const data = await response.json();

        content.innerHTML = renderSection(section, data);
        if (section === 'analytics') initializeThreatChart(data.threatData);
    } catch (error) {
        content.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function renderSection(section, data) {
    switch (section) {
        case 'overview':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-shield-alt"></i> Security Overview</h2>
                        <div class="section-actions" id="sectionActions">${document.getElementById('sectionActions').innerHTML}</div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-user-lock"></i></div>
                            <div class="stat-info">
                                <h3>${data.loginAttempts}</h3>
                                <p>Login Attempts</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <div class="stat-info">
                                <h3>${data.openIncidents}</h3>
                                <p>Open Incidents</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-bug"></i></div>
                            <div class="stat-info">
                                <h3>${data.vulnerabilities}</h3>
                                <p>Vulnerabilities</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'access_logs':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-user-lock"></i> Access Logs</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Action</th>
                                    <th>Timestamp</th>
                                    <th>IP Address</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.logs.map(log => `
                                    <tr>
                                        <td>${log.userId}</td>
                                        <td>${log.action}</td>
                                        <td>${new Date(log.timestamp).toLocaleString()}</td>
                                        <td>${log.ipAddress}</td>
                                        <td>${log.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'incidents':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-exclamation-triangle"></i> Incidents</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('logIncidentModal')"><i class="fas fa-plus"></i> Log Incident</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Severity</th>
                                    <th>Status</th>
                                    <th>Reported</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.incidents.map(incident => `
                                    <tr>
                                        <td>${incident.title}</td>
                                        <td>${incident.severity}</td>
                                        <td>${incident.status}</td>
                                        <td>${new Date(incident.reportedAt).toLocaleString()}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewIncident('${incident._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'vulnerabilities':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-bug"></i> Vulnerabilities</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Description</th>
                                    <th>Severity</th>
                                    <th>Status</th>
                                    <th>Detected</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.vulnerabilities.map(vuln => `
                                    <tr>
                                        <td>${vuln.id}</td>
                                        <td>${vuln.description}</td>
                                        <td>${vuln.severity}</td>
                                        <td>${vuln.status}</td>
                                        <td>${new Date(vuln.detectedAt).toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'policies':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-cog"></i> Security Policies</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('configurePolicyModal')"><i class="fas fa-plus"></i> Add Policy</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Rules</th>
                                    <th>Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.policies.map(policy => `
                                    <tr>
                                        <td>${policy.name}</td>
                                        <td>${JSON.stringify(policy.rules, null, 2)}</td>
                                        <td>${new Date(policy.updatedAt).toLocaleString()}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="editPolicy('${policy._id}')">Edit</button>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Security Analytics</h2>
                    </div>
                    <canvas id="threatChart" height="100"></canvas>
                </div>
            `;
        default:
            return `<p>Section ${section} not implemented</p>`;
    }
}

async function initializeThreatChart(data) {
    if (threatChart) threatChart.destroy();
    const ctx = document.getElementById('threatChart').getContext('2d');
    threatChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels, // e.g., ['Jan', 'Feb', ...]
            datasets: [{
                label: 'Threat Events',
                data: data.values, // e.g., [10, 20, ...]
                borderColor: '#7b68ee',
                backgroundColor: 'rgba(123, 104, 238, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

async function searchSecurity(query) {
    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/security/search?query=${encodeURIComponent(query)}` :
            `/api/admin/security/search?query=${encodeURIComponent(query)}&branchId=${encodeURIComponent(query)}&branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search security events');
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
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.results.map(result => `
                                <tr>
                                    <td>${result.type}</td>
                                    <td>${result.details}</td>
                                    <td>${new Date(result.timestamp).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>`).join(''));
    } catch (error) {
        showError(error.message);
    }
}

async function logIncident() {
    const title = document.getElementById('incidentTitle').value;
    const description = document.getElementById('incidentDescription').value;
    const severity = document.getElementById('incidentSeverity').value;
    const status = document.getElementById('incidentStatus').value;
    
    if (!title || !description || !severity || !status) {
        showError('Please fill all required fields');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/security/incidents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`'
            },
            body: JSON.stringify({ title, description, severity, status, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to log incident');
        closeModal('logIncidentModal');
        loadSection('incidents');
        socket.emit('securityAlert', { 
            message: `New ${severity} severity incident: ${title}`, 
            severity,
            branchId: userBranchId
        });
        sendSecurityIncidentNotification(title, severity, status);
    } catch (error) {
        showError(error.message);
    }
}

async function configurePolicy() {
    const name = document.getElementById('policyName').value;
    const rules = JSON.parse(document.getElementById('policyRules').value);
    
    if (!name || !rules) {
        showError('Please provide valid policy details');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/security/policies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`'
            },
            body: JSON.stringify({ name, rules, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to configure policy');
        closeModal('configurePolicyModal');
        loadSection('policies');
        socket.emit('securityAlert', { 
            message: `Security policy configured: ${name}`, 
            severity: 'low',
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function sendSecurityIncidentNotification(title) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`'
            },
            body: JSON.stringify({
                content: `New ${severity} severity incident reported: ${title}`,
                contentType: 'application/json',
                subject: 'Security Incident Reported',
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send incident notification');
    } catch (error) {
        showError(error.message);

    }
}

async function generateAuditReport() {
    try {
        const url = userRole === 'super_admin' && document.getElementById('branchSelect')?.value ? 
            `/api/admin/security/audit?branch=${id=${document.getElementById('branchSelect').value}}` :
            `/api/admin/security/audit/${branchId}?value=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }'
        });
        if (!response.ok) throw new Error('Failed to generate audit report');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = `security_audit_${userBranchId || 'all'}_${Date.now()}.pdf`';
        anchor.click();
        window.URL.revokeObjectURL(downloadUrl);
        socket.emit('securityAuditReport', { 
            message: 'Audit report generated',
            severity: 'info',
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function viewDetails(type, id) {
    try {
        const response = await fetch(`/api/admin/security/${type}/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }'
        });
        if (!response.ok) throw new Error(`Failed to fetch (${type} details`);
        const data = await response.json();

        if (userRole !== 'super_admin' && data[type].branchId !== userBranchId) {
            showError(`Access denied: ${type.charAt(0).toUpperCase() + type.slice(1)} belongs to another branch`);
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-${type === 'incident' ? 'exclamation-triangle' : 'user-lock'}"></i> ${type.charAt(0).toUpperCase() + type.slice(1)} Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('${type}s')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        ${Object.entries(data[type]).map(([key, value]) => `
                            <tr><th>${key.charAt(0).toUpperCase() + key.slice(1)}</th><td>${value instanceof Date ? value.toLocaleString() : value}</td></tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new security alerts';
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