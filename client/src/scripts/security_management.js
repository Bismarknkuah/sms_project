let socket;
let userBranchId = null;
let userRole = null;
let roleChart = null;

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
    document.getElementById('policyScope')?.addEventListener('change', togglePolicyBranch);
});

function initializeSocket() {
    socket = io('/admin', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('securityUpdate', (update) => {
        if (userRole === 'super_admin' || update.branchId === userBranchId) {
            updateBanner(`Security Update: ${update.message}`);
            sendSecurityNotification(update.message);
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
                <button class="btn btn-primary" onclick="openModal('createRoleModal')"><i class="fas fa-plus"></i> Create Role</button>
                <button class="btn btn-primary" onclick="openModal('configurePolicyModal')"><i class="fas fa-cog"></i> Configure Policy</button>
                <button class="btn btn-primary" onclick="generatePolicyReport()"><i class="fas fa-file-pdf"></i> Policy Report</button>
            `;
            fetchBranches();
            fetchPermissions('rolePermissions');
        } else {
            document.getElementById('sectionActions').innerHTML = `
                <button class="btn btn-primary" onclick="openModal('createRoleModal')"><i class="fas fa-plus"></i> Create Role</button>
            `;
            fetchPermissions('rolePermissions');
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
        document.getElementById('roleBranch').innerHTML = `<option value="">Select Branch</option>${branchOptions}`;
        document.getElementById('policyBranch').innerHTML = `<option value="">Select Branch</option>${branchOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchPermissions(selectId) {
    try {
        const response = await fetch('/api/admin/security/permissions', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch permissions');
        const data = await response.json();

        const permissionOptions = data.permissions.map(perm => `<option value="${perm._id}">${perm.name}</option>`).join('');
        document.getElementById(selectId).innerHTML = permissionOptions;
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
        if (section === 'analytics') initializeRoleChart(data.roleData);
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
                            <div class="stat-icon"><i class="fas fa-user-tag"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalRoles}</h3>
                                <p>Total Roles</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-key"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalPermissions}</h3>
                                <p>Total Permissions</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-cog"></i></div>
                            <div class="stat-info">
                                <h3>${data.activePolicies}</h3>
                                <p>Active Policies</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'roles':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-user-tag"></i> Roles</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('createRoleModal')"><i class="fas fa-plus"></i> Create Role</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>Permissions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.roles.map(role => `
                                    <tr>
                                        <td>${role.name}</td>
                                        <td>${role.branchName || 'Global'}</td>
                                        <td>${role.permissions.join(', ')}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="editRole('${role._id}')">Edit</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteRole('${role._id}')">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'permissions':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-key"></i> Permissions</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Module</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.permissions.map(perm => `
                                    <tr>
                                        <td>${perm.name}</td>
                                        <td>${perm.module}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="editPermission('${perm._id}')">Edit</button>
                                        </td>
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
                        <h2 class="section-title"><i class="fas fa-cog"></i> Policies</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('configurePolicyModal')"><i class="fas fa-plus"></i> Configure Policy</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Scope</th>
                                    <th>Rules</th>
                                    <th>Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.policies.map(policy => `
                                    <tr>
                                        <td>${policy.name}</td>
                                        <td>${policy.scope}</td>
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
                    <canvas id="roleChart" height="100"></canvas>
                </div>
            `;
        default:
            return `<p>Section ${section} not implemented</p>`;
    }
}

async function initializeRoleChart(data) {
    if (roleChart) roleChart.destroy();
    const ctx = document.getElementById('roleChart').getContext('2d');
    roleChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.branches, // e.g., ['Assin Fosu', 'Accra', ...]
            datasets: [{
                label: 'Roles per Branch',
                data: data.roleCounts, // e.g., [5, 3, ...]
                backgroundColor: '#7b68ee',
                borderColor: '#4b3c8e',
                borderWidth: 1
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
            `/api/admin/security/search?query=${encodeURIComponent(query)}&branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search security data');
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
                                <th>Name</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.results.map(result => `
                                <tr>
                                    <td>${result.type}</td>
                                    <td>${result.name}</td>
                                    <td>${result.details}</td>
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

async function createRole() {
    const name = document.getElementById('roleName').value;
    const branchId = document.getElementById('roleBranch').value;
    const permissions = Array.from(document.getElementById('rolePermissions').selectedOptions).map(opt => opt.value);

    if (!name || !permissions.length || (userRole !== 'super_admin' && !branchId)) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/security/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, branchId: userRole === 'super_admin' ? branchId : userBranchId, permissions })
        });
        if (!response.ok) throw new Error('Failed to create role');
        closeModal('createRoleModal');
        loadSection('roles');
        socket.emit('securityUpdate', {
            message: `Role created: ${name}`,
            branchId: userRole === 'super_admin' ? branchId : userBranchId
        });
        logSecurityAction('create_role', { name, branchId, permissions });
    } catch (error) {
        showError(error.message);
    }
}

async function configurePolicy() {
    const name = document.getElementById('policyName').value;
    let rules;
    try {
        rules = JSON.parse(document.getElementById('policyRules').value);
    } catch (error) {
        showError('Invalid JSON format for rules');
        return;
    }
    const scope = document.getElementById('policyScope').value;
    const branchId = scope === 'branch' ? document.getElementById('policyBranch').value : null;

    if (!name || !rules || (scope === 'branch' && !branchId)) {
        showError('Please provide valid policy details');
        return;
    }

    try {
        const response = await fetch('/api/admin/security/policies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, rules, scope, branchId: userRole === 'super_admin' ? branchId : userBranchId })
        });
        if (!response.ok) throw new Error('Failed to configure policy');
        closeModal('configurePolicyModal');
        loadSection('policies');
        socket.emit('securityUpdate', {
            message: `Policy configured: ${name}`,
            branchId: userRole === 'super_admin' ? branchId : userBranchId
        });
        logSecurityAction('configure_policy', { name, scope, branchId });
    } catch (error) {
        showError(error.message);
    }
}

async function editRole(id) {
    try {
        const response = await fetch(`/api/admin/security/roles/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch role');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.role.branchId !== userBranchId) {
            showError('Access denied: Role belongs to another branch');
            return;
        }

        document.getElementById('roleName').value = data.role.name;
        document.getElementById('roleBranch').value = data.role.branchId || '';
        document.getElementById('rolePermissions').value = data.role.permissions;
        openModal('createRoleModal');

        document.getElementById('createRoleModal').querySelector('.modal-header h3').textContent = 'Edit Role';
        document.getElementById('createRoleModal').querySelector('.btn-primary').onclick = () => updateRole(id);
    } catch (error) {
        showError(error.message);
    }
}

async function updateRole(id) {
    const name = document.getElementById('roleName').value;
    const branchId = document.getElementById('roleBranch').value;
    const permissions = Array.from(document.getElementById('rolePermissions').selectedOptions).map(opt => opt.value);

    if (!name || !permissions.length || (userRole !== 'super_admin' && !branchId)) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/admin/security/roles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, branchId: userRole === 'super_admin' ? branchId : userBranchId, permissions })
        });
        if (!response.ok) throw new Error('Failed to update role');
        closeModal('createRoleModal');
        loadSection('roles');
        socket.emit('securityUpdate', {
            message: `Role updated: ${name}`,
            branchId: userRole === 'super_admin' ? branchId : userBranchId
        });
        logSecurityAction('update_role', { name, branchId, permissions });
    } catch (error) {
        showError(error.message);
    }
}

async function deleteRole(id) {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
        const response = await fetch(`/api/admin/security/roles/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete role');
        loadSection('roles');
        socket.emit('securityUpdate', {
            message: `Role deleted: ${id}`,
            branchId: userBranchId
        });
        logSecurityAction('delete_role', { roleId: id });
    } catch (error) {
        showError(error.message);
    }
}

async function editPolicy(id) {
    try {
        const response = await fetch(`/api/admin/security/policies/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch policy');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.policy.branchId !== userBranchId) {
            showError('Access denied: Policy belongs to another branch');
            return;
        }

        document.getElementById('policyName').value = data.policy.name;
        document.getElementById('policyRules').value = JSON.stringify(data.policy.rules, null, 2);
        document.getElementById('policyScope').value = data.policy.scope;
        document.getElementById('policyBranch').value = data.policy.branchId || '';
        togglePolicyBranch();
        openModal('configurePolicyModal');

        document.getElementById('configurePolicyModal').querySelector('.modal-header h3').textContent = 'Edit Policy';
        document.getElementById('configurePolicyModal').querySelector('.btn-primary').onclick = () => updatePolicy(id);
    } catch (error) {
        showError(error.message);
    }
}

async function updatePolicy(id) {
    const name = document.getElementById('policyName').value;
    let rules;
    try {
        rules = JSON.parse(document.getElementById('policyRules').value);
    } catch (error) {
        showError('Invalid JSON format for rules');
        return;
    }
    const scope = document.getElementById('policyScope').value;
    const branchId = scope === 'branch' ? document.getElementById('policyBranch').value : null;

    if (!name || !rules || (scope === 'branch' && !branchId)) {
        showError('Please provide valid policy details');
        return;
    }

    try {
        const response = await fetch(`/api/admin/security/policies/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, rules, scope, branchId: userRole === 'super_admin' ? branchId : userBranchId })
        });
        if (!response.ok) throw new Error('Failed to update policy');
        closeModal('configurePolicyModal');
        loadSection('policies');
        socket.emit('securityUpdate', {
            message: `Policy updated: ${name}`,
            branchId: userRole === 'super_admin' ? branchId : userBranchId
        });
        logSecurityAction('update_policy', { name, scope, branchId });
    } catch (error) {
        showError(error.message);
    }
}

async function generatePolicyReport() {
    try {
        const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;
        const url = branchId ? `/api/admin/security/policy-report?branchId=${branchId}` : '/api/admin/security/policy-report';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to generate policy report');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = `policy_report_${branchId || 'all'}_${Date.now()}.pdf`;
        anchor.click();
        window.URL.revokeObjectURL(downloadUrl);
        socket.emit('securityUpdate', {
            message: 'Policy report generated',
            branchId
        });
        logSecurityAction('generate_policy_report', { branchId });
    } catch (error) {
        showError(error.message);
    }
}

async function logSecurityAction(action, details) {
    try {
        const response = await fetch('/api/admin/security/audit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ action, details, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to log security action');
    } catch (error) {
        console.error('Audit log error:', error.message);
    }
}

async function sendSecurityNotification(message) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                content: message,
                contentType: 'text/plain',
                subject: 'Security Management Update',
                branchId: userBranchId
            })
        });
        if (!response.ok) throw new Error('Failed to send notification');
    } catch (error) {
        console.error('Notification error:', error.message);
    }
}

function togglePolicyBranch() {
    const scope = document.getElementById('policyScope').value;
    document.getElementById('policyBranchGroup').style.display = scope === 'branch' ? 'block' : 'none';
}

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new security updates';
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