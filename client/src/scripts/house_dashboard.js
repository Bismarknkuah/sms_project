let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['housemaster', 'super_admin'].includes(role)) {
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

    socket.on('houseUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
        loadHouses();
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await Promise.all([
        fetchUserInfo(),
        fetchBranches(),
        fetchStaff(),
        fetchHouses()
    ]);
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'Housemaster';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'HM';
        document.getElementById('branchName').textContent = 'All Branches';
        document.getElementById('userBranch').textContent = 'All Branches';
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
        document.getElementById('branchAssignSelect').innerHTML = `<option value="">Select Branch</option>${branchOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchStaff() {
    try {
        const response = await fetch('/api/admin/staff', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch staff');
        const data = await response.json();

        const staffOptions = data.staff.map(staff => `<option value="${staff._id}">${staff.name} (${staff.branchName})</option>`).join('');
        document.getElementById('staffSelect').innerHTML = `<option value="">Select Staff</option>${staffOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchHouses() {
    const branchId = document.getElementById('branchSelect').value;
    try {
        const url = branchId ? `/api/admin/houses?branchId=${branchId}` : '/api/admin/houses';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch houses');
        const data = await response.json();

        document.getElementById('houseTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>House Name</th>
                        <th>Branch</th>
                        <th>House Master/Matron</th>
                        <th>Students</th>
                        <th>Points</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.houses.map(house => `
                        <tr>
                            <td>${house.name}</td>
                            <td>${house.branchName}</td>
                            <td>${house.houseMaster ? house.houseMaster.name : 'Unassigned'}</td>
                            <td>${house.studentCount}</td>
                            <td>${house.points}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewHouse('${house._id}')">View</button>
                                <button class="btn btn-secondary btn-small" onclick="removeHouseMaster('${house._id}')">Remove Master</button>
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

async function searchHouses(query) {
    try {
        const response = await fetch(`/api/admin/houses/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search houses');
        const data = await response.json();

        document.getElementById('houseTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>House Name</th>
                        <th>Branch</th>
                        <th>House Master/Matron</th>
                        <th>Students</th>
                        <th>Points</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.houses.map(house => `
                        <tr>
                            <td>${house.name}</td>
                            <td>${house.branchName}</td>
                            <td>${house.houseMaster ? house.houseMaster.name : 'Unassigned'}</td>
                            <td>${house.studentCount}</td>
                            <td>${house.points}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewHouse('${house._id}')">View</button>
                                <button class="btn btn-secondary btn-small" onclick="removeHouseMaster('${house._id}')">Remove Master</button>
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

async function assignStaff() {
    const staffId = document.getElementById('staffSelect').value;
    const houseId = document.getElementById('houseSelect').value;
    const branchId = document.getElementById('branchAssignSelect').value;

    if (!staffId || !houseId || !branchId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/houses/assign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ staffId, houseId, branchId })
        });
        if (!response.ok) throw new Error('Failed to assign staff');
        closeModal('assignStaffModal');
        fetchHouses();
        socket.emit('houseUpdate', {
            title: 'House Master Assigned',
            content: `Staff assigned to house ${houseId} in branch ${branchId}`
        });
    } catch (error) {
        showError(error.message);
    }
}

async function removeHouseMaster(houseId) {
    if (!confirm('Are you sure you want to remove the House Master/Matron?')) return;

    try {
        const response = await fetch(`/api/admin/houses/${houseId}/remove-master`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to remove House Master');
        fetchHouses();
        socket.emit('houseUpdate', {
            title: 'House Master Removed',
            content: `House Master removed from house ${houseId}`
        });
    } catch (error) {
        showError(error.message);
    }
}

async function viewHouse(houseId) {
    try {
        const response = await fetch(`/api/admin/houses/${houseId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch house');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-home"></i> ${data.house.name}</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('houses')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <h3>${data.house.studentCount}</h3>
                            <p>Total Students</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                        <div class="stat-info">
                            <h3>${data.house.points}</h3>
                            <p>House Points</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <div class="stat-info">
                            <h3>${data.house.incidents}</h3>
                            <p>Discipline Incidents</p>
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Room</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.students.map(student => `
                                <tr>
                                    <td>${student.name}</td>
                                    <td>${student.className}</td>
                                    <td>${student.room || 'Unassigned'}</td>
                                    <td>
                                        <button class="btn btn-primary btn-small" onclick="allocateRoom('${student._id}', '${houseId}')">Allocate Room</button>
                                    </td>
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

async function allocateRoom(studentId, houseId) {
    const room = prompt('Enter room number:');
    if (!room) return;

    try {
        const response = await fetch(`/api/admin/houses/${houseId}/allocate-room`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ studentId, room })
        });
        if (!response.ok) throw new Error('Failed to allocate room');
        viewHouse(houseId);
        socket.emit('houseUpdate', {
            title: 'Room Allocated',
            content: `Student ${studentId} allocated to room ${room}`
        });
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/admin/houses/${section}`, {
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
        case 'houses':
            return document.getElementById('dashboardContent').innerHTML;
        case 'staffAssignment':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-user-tie"></i> Staff Assignment</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('assignStaffModal')"><i class="fas fa-user-plus"></i> Assign Staff</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Staff Name</th>
                                    <th>House</th>
                                    <th>Branch</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.assignments.map(assignment => `
                                    <tr>
                                        <td>${assignment.staffName}</td>
                                        <td>${assignment.houseName}</td>
                                        <td>${assignment.branchName}</td>
                                        <td>
                                            <button class="btn btn-secondary btn-small" onclick="removeHouseMaster('${assignment.houseId}')">Remove</button>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> House Analytics</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-file-pdf"></i> Generate Report</button>
                        </div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-home"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalHouses}</h3>
                                <p>Total Houses</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalStudents}</h3>
                                <p>Total Students</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalPoints}</h3>
                                <p>Total Points</p>
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

function initializeFileUpload() {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('uploadFile');

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

async function uploadFile() {
    const uploadType = document.getElementById('uploadType').value;
    const fileInput = document.getElementById('uploadFile');

    if (!uploadType || !fileInput.files.length) {
        showError('Please select an upload type and file');
        return;
    }

    const file = fileInput.files[0];
    if (file.type !== 'text/csv') {
        showError('Only CSV files are allowed');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);

    try {
        const response = await fetch('/api/admin/houses/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload file');
        closeModal('uploadModal');
        fetchHouses();
        socket.emit('houseUpdate', {
            title: 'Bulk Upload',
            content: `${uploadType} uploaded successfully`
        });
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport() {
    try {
        const response = await fetch('/api/admin/houses/report', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to generate report');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'house_report.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
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