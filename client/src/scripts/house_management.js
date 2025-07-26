let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['house_master', 'super_admin'].includes(role)) {
        window.location.href = '/index.html';
        return;
    }
    initializeHouseManagement();
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

    socket.on('houseUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
        loadStudents();
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeHouseManagement() {
    await Promise.all([
        fetchUserInfo(),
        fetchHouse(),
        fetchStudents()
    ]);
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'House Master';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'HM';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchHouse() {
    try {
        const response = await fetch('/api/admin/house', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch house');
        const data = await response.json();

        document.getElementById('branchName').textContent = `${data.house.name} (${data.branchName})`;
    } catch (error) {
        showError(error.message);
    }
}

async function fetchStudents() {
    try {
        const response = await fetch('/api/admin/house/students', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();

        document.getElementById('studentTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
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
                                <button class="btn btn-primary btn-small" onclick="allocateRoomModal('${student._id}')">Allocate Room</button>
                                <button class="btn btn-primary btn-small" onclick="recordIncidentModal('${student._id}')">Record Incident</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const studentOptions = data.students.map(student => `<option value="${student._id}">${student.name}</option>`).join('');
        document.getElementById('studentSelect').innerHTML = `<option value="">Select Student</option>${studentOptions}`;
        document.getElementById('incidentStudent').innerHTML = `<option value="">Select Student</option>${studentOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function searchStudents(query) {
    try {
        const response = await fetch(`/api/admin/house/students/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search students');
        const data = await response.json();

        document.getElementById('studentTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
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
                                <button class="btn btn-primary btn-small" onclick="allocateRoomModal('${student._id}')">Allocate Room</button>
                                <button class="btn btn-primary btn-small" onclick="recordIncidentModal('${student._id}')">Record Incident</button>
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

function allocateRoomModal(studentId) {
    document.getElementById('studentSelect').value = studentId;
    openModal('allocateRoomModal');
}

async function allocateRoom() {
    const studentId = document.getElementById('studentSelect').value;
    const room = document.getElementById('roomNumber').value;

    if (!studentId || !room) {
        showError('Please fill all required