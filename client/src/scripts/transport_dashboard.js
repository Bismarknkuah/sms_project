let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'transport_staff') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/transport', {
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

async function initializeDashboard() {
    await Promise.all([
        fetchTransportProfile(),
        fetchSchedule(),
        fetchMaintenance()
    ]);
}

async function fetchTransportProfile() {
    try {
        const response = await fetch('/api/transport/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();

        document.getElementById('assignedVehicles').textContent = data.assignedVehicles?.length || 0;
        document.getElementById('assignedRoutes').textContent = data.assignedRoutes?.length || 0;
        document.getElementById('maintenancePending').textContent = data.maintenancePending || 0;
        document.getElementById('userName').textContent = data.name || 'Transport Staff';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'TS';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchSchedule() {
    try {
        const response = await fetch('/api/transport/schedule', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch schedule');
        const data = await response.json();

        const tbody = document.getElementById('scheduleTable').querySelector('tbody');
        tbody.innerHTML = data.schedule.map(item => `
            <tr>
                <td>${item.time}</td>
                <td>${item.routeName}</td>
                <td>${item.vehicleReg}</td>
                <td>${item.passengerCount}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchMaintenance() {
    try {
        const response = await fetch('/api/transport/maintenance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch maintenance');
        const data = await response.json();

        document.getElementById('maintenanceTable').querySelector('tbody').innerHTML = data.maintenance.map(task => `
            <tr>
                <td>${task.vehicleReg}</td>
                <td>${task.issue}</td>
                <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                <td>${task.status}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/transport/${section}`, {
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
        case 'dashboard':
            return document.getElementById('dashboardContent').innerHTML;
        case 'profile':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-user"></i> Profile</h2>
                    </div>
                    <div class="profile-details">
                        <p><strong>Name:</strong> ${data.name}</p>
                        <p><strong>Staff ID:</strong> ${data.staffId}</p>
                        <p><strong>Role:</strong> ${data.role}</p>
                        <p><strong>Branch:</strong> ${data.branchName}</p>
                    </div>
                </div>
            `;
        case 'vehicles':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-bus"></i> Assigned Vehicles</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Registration</th>
                                    <th>Type</th>
                                    <th>Capacity</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.vehicles.map(vehicle => `
                                    <tr>
                                        <td>${vehicle.registration}</td>
                                        <td>${vehicle.type}</td>
                                        <td>${vehicle.capacity}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewVehicle('${vehicle._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'routes':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-route"></i> Assigned Routes</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Route Name</th>
                                    <th>Pickup Points</th>
                                    <th>Passengers</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.routes.map(route => `
                                    <tr>
                                        <td>${route.name}</td>
                                        <td>${route.pickupPoints.join(', ')}</td>
                                        <td>${route.passengerCount}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewRoute('${route._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'schedule':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-clock"></i> Daily Schedule</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Route</th>
                                    <th>Vehicle</th>
                                    <th>Passengers</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.schedule.map(item => `
                                    <tr>
                                        <td>${item.time}</td>
                                        <td>${item.routeName}</td>
                                        <td>${item.vehicleReg}</td>
                                        <td>${item.passengerCount}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'maintenance':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-tools"></i> Maintenance Alerts</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Issue</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.maintenance.map(task => `
                                    <tr>
                                        <td>${task.vehicleReg}</td>
                                        <td>${task.issue}</td>
                                        <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                                        <td>${task.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'fuel':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-gas-pump"></i> Fuel Logs</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openFuelLogModal()">Add Fuel Log</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vehicle</th>
                                    <th>Litres</th>
                                    <th>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.fuelLogs.map(log => `
                                    <tr>
                                        <td>${new Date(log.date).toLocaleDateString()}</td>
                                        <td>${log.vehicleReg}</td>
                                        <td>${log.litres}</td>
                                        <td>${log.cost}</td>
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

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new updates';
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

async function viewVehicle(vehicleId) {
    try {
        const response = await fetch(`/api/transport/vehicles/${vehicleId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to view vehicle');
        const data = await response.json();
        // Implement vehicle view logic (e.g., modal or new section)
        showError('Vehicle view not implemented yet');
    } catch (error) {
        showError(error.message);
    }
}

async function viewRoute(routeId) {
    try {
        const response = await fetch(`/api/transport/routes/${routeId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to view route');
        const data = await response.json();
        // Implement route view logic (e.g., modal or new section)
        showError('Route view not implemented yet');
    } catch (error) {
        showError(error.message);
    }
}

async function openFuelLogModal() {
    // Implement fuel log modal logic
    showError('Fuel log entry not implemented yet');
}