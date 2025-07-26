let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['transport_manager', 'super_admin'].includes(role)) {
        window.location.href = '/index.html';
        return;
    }
    initializeManagement();
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

    socket.on('newUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeManagement() {
    await Promise.all([
        fetchUserInfo(),
        fetchVehicles(),
        fetchDrivers()
    ]);
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'Transport Manager';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'TM';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchVehicles() {
    try {
        const response = await fetch('/api/admin/transport/vehicles', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();

        document.getElementById('vehicleTable').querySelector('tbody').innerHTML = data.vehicles.map(vehicle => `
            <tr>
                <td>${vehicle.registration}</td>
                <td>${vehicle.type}</td>
                <td>${vehicle.capacity}</td>
                <td>${vehicle.driverName || 'Unassigned'}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editVehicle('${vehicle._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteVehicle('${vehicle._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchDrivers() {
    try {
        const response = await fetch('/api/admin/transport/drivers', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch drivers');
        const data = await response.json();

        const driverOptions = data.drivers.map(driver => `<option value="${driver._id}">${driver.name}</option>`).join('');
        document.getElementById('vehicleDriver').innerHTML = `<option value="">Select Driver</option>${driverOptions}`;
        document.getElementById('editVehicleDriver').innerHTML = `<option value="">Select Driver</option>${driverOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function searchTransport(query) {
    try {
        const response = await fetch(`/api/admin/transport/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search transport');
        const data = await response.json();

        document.getElementById('vehicleTable').querySelector('tbody').innerHTML = data.vehicles.map(vehicle => `
            <tr>
                <td>${vehicle.registration}</td>
                <td>${vehicle.type}</td>
                <td>${vehicle.capacity}</td>
                <td>${vehicle.driverName || 'Unassigned'}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editVehicle('${vehicle._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteVehicle('${vehicle._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
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
    if (modalId === 'addVehicleModal') {
        document.getElementById('vehicleReg').value = '';
        document.getElementById('vehicleType').value = '';
        document.getElementById('vehicleCapacity').value = '';
        document.getElementById('vehicleDriver').value = '';
    } else if (modalId === 'editVehicleModal') {
        document.getElementById('editVehicleId').value = '';
        document.getElementById('editVehicleReg').value = '';
        document.getElementById('editVehicleType').value = '';
        document.getElementById('editVehicleCapacity').value = '';
        document.getElementById('editVehicleDriver').value = '';
    }
}

async function saveVehicle() {
    const registration = document.getElementById('vehicleReg').value;
    const type = document.getElementById('vehicleType').value;
    const capacity = document.getElementById('vehicleCapacity').value;
    const driverId = document.getElementById('vehicleDriver').value;

    if (!registration || !type || !capacity) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/transport/vehicles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ registration, type, capacity, driverId })
        });
        if (!response.ok) throw new Error('Failed to save vehicle');
        closeModal('addVehicleModal');
        fetchVehicles();
    } catch (error) {
        showError(error.message);
    }
}

async function editVehicle(vehicleId) {
    try {
        const response = await fetch(`/api/admin/transport/vehicles/${vehicleId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch vehicle');
        const vehicle = await response.json();

        document.getElementById('editVehicleId').value = vehicle._id;
        document.getElementById('editVehicleReg').value = vehicle.registration;
        document.getElementById('editVehicleType').value = vehicle.type;
        document.getElementById('editVehicleCapacity').value = vehicle.capacity;
        document.getElementById('editVehicleDriver').value = vehicle.driverId || '';

        openModal('editVehicleModal');
    } catch (error) {
        showError(error.message);
    }
}

async function updateVehicle() {
    const vehicleId = document.getElementById('editVehicleId').value;
    const registration = document.getElementById('editVehicleReg').value;
    const type = document.getElementById('editVehicleType').value;
    const capacity = document.getElementById('editVehicleCapacity').value;
    const driverId = document.getElementById('editVehicleDriver').value;

    if (!registration || !type || !capacity) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/admin/transport/vehicles/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ registration, type, capacity, driverId })
        });
        if (!response.ok) throw new Error('Failed to update vehicle');
        closeModal('editVehicleModal');
        fetchVehicles();
    } catch (error) {
        showError(error.message);
    }
}

async function deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
        const response = await fetch(`/api/admin/transport/vehicles/${vehicleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete vehicle');
        fetchVehicles();
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/admin/transport/${section}`, {
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
        case 'vehicles':
            return document.getElementById('dashboardContent').innerHTML;
        case 'routes':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-route"></i> Routes</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('addRouteModal')"><i class="fas fa-plus"></i> Add Route</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Route Name</th>
                                    <th>Pickup Points</th>
                                    <th>Assigned Vehicle</th>
                                    <th>Passengers</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.routes.map(route => `
                                    <tr>
                                        <td>${route.name}</td>
                                        <td>${route.pickupPoints.join(', ')}</td>
                                        <td>${route.vehicleReg || 'Unassigned'}</td>
                                        <td>${route.passengerCount}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="editRoute('${route._id}')">Edit</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteRoute('${route._id}')">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'drivers':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-users"></i> Drivers</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('addDriverModal')"><i class="fas fa-plus"></i> Add Driver</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Staff ID</th>
                                    <th>Assigned Vehicle</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.drivers.map(driver => `
                                    <tr>
                                        <td>${driver.name}</td>
                                        <td>${driver.staffId}</td>
                                        <td>${driver.vehicleReg || 'Unassigned'}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="editDriver('${driver._id}')">Edit</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteDriver('${driver._id}')">Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'reports':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-file-alt"></i> Transport Reports</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport('fuel')">Fuel Report</button>
                            <button class="btn btn-primary" onclick="generateReport('route')">Route Efficiency Report</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Report Type</th>
                                    <th>Date Generated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.reports.map(report => `
                                    <tr>
                                        <td>${report.type}</td>
                                        <td>${new Date(report.date).toLocaleDateString()}</td>
                                        <td><button class="btn btn-secondary btn-small" onclick="viewReport('${report._id}')">View</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'updates':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-bell"></i> Updates</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.updates.map(update => `
                                    <tr>
                                        <td>${new Date(update.timestamp).toLocaleDateString()}</td>
                                        <td>${update.title}</td>
                                        <td>${update.content}</td>
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

async function generateReport(type) {
    try {
        const response = await fetch(`/api/admin/transport/reports/${type}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to generate ${type} report`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transport_${type}_report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError(error.message);
    }
}

async function viewReport(reportId) {
    try {
        const response = await fetch(`/api/admin/transport/reports/${reportId}`, {
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

async function editRoute(routeId) {
    showError('Route editing not implemented yet');
}

async function deleteRoute(routeId) {
    showError('Route deletion not implemented yet');
}

async function editDriver(driverId) {
    showError('Driver editing not implemented yet');
}

async function deleteDriver(driverId) {
    showError('Driver deletion not implemented yet');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function showError(message) {
    alert(message); // Replace with a better UI notification in production
}