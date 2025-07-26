let financialChart;
let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'accountant') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/accountant', {
        auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
        console.log('Connected to WebSocket');
    });

    socket.on('newUpdate', (update) => {
        updateBanner(update.title + ': ' + update.content);
        fetchNotifications();
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: ' + error.message);
    });
}

async function initializeDashboard() {
    await Promise.all([
        fetchDashboardStats(),
        fetchNotifications(),
        fetchTransactions(),
        fetchUpdates(),
        fetchStudents()
    ]);
    initializeChart();
}

async function fetchDashboardStats() {
    try {
        const response = await fetch('/api/accountant/overview', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();

        document.getElementById('totalRevenue').textContent = `₵${(data.totalRevenue || 0).toLocaleString()}`;
        document.getElementById('totalExpenses').textContent = `₵${(data.totalExpenses || 0).toLocaleString()}`;
        document.getElementById('pendingFees').textContent = `₵${(data.pendingFees || 0).toLocaleString()}`;
        document.getElementById('netProfit').textContent = `₵${(data.netProfit || 0).toLocaleString()}`;
        document.getElementById('userName').textContent = data.accountantName || 'Accountant';
        document.getElementById('userAvatar').textContent = data.accountantName ? data.accountantName.charAt(0).toUpperCase() : 'AC';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchNotifications() {
    try {
        const response = await fetch('/api/accountant/notifications', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();

        const dropdown = document.getElementById('notificationDropdown');
        const badge = document.getElementById('notificationBadge');
        const navBadge = document.getElementById('notificationCount');
        badge.textContent = data.notifications.length;
        navBadge.textContent = data.notifications.length;
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

async function fetchTransactions() {
    try {
        const response = await fetch('/api/accountant/transactions', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();

        document.getElementById('transactionTable').querySelector('tbody').innerHTML = data.transactions.map(transaction => `
            <tr>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>${transaction.type}</td>
                <td>₵${transaction.amount.toLocaleString()}</td>
                <td>${transaction.description}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchUpdates() {
    try {
        const response = await fetch('/api/accountant/updates', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch updates');
        const data = await response.json();
        if (data.updates.length > 0) {
            const latestUpdate = data.updates[0];
            updateBanner(latestUpdate.title + ': ' + latestUpdate.content);
        }
    } catch (error) {
        showError(error.message);
    }
}

async function fetchStudents() {
    try {
        const response = await fetch('/api/accountant/students', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        const studentOptions = '<option value="">Select Student</option>' +
            data.students.map(student => `<option value="${student._id}">${student.name}</option>`).join('');
        document.getElementById('paymentStudent').innerHTML = studentOptions;
        document.getElementById('invoiceStudent').innerHTML = studentOptions;
    } catch (error) {
        showError(error.message);
    }
}

function updateBanner(text) {
    document.getElementById('updateText').textContent = text || 'No new updates';
}

function initializeChart() {
    const ctx = document.getElementById('financialChart').getContext('2d');
    financialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
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
    const chartType = document.getElementById('chartType').value;
    try {
        const response = await fetch(`/api/accountant/analytics?type=${chartType}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch analytics data');
        const data = await response.json();

        financialChart.data.labels = data.labels;
        financialChart.data.datasets = data.datasets;
        financialChart.update();
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
        const response = await fetch(`/api/accountant/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to dismiss notification');
        fetchNotifications();
    } catch (error) {
        showError(error.message);
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (modalId === 'recordPaymentModal') {
        document.getElementById('paymentStudent').value = '';
        document.getElementById('paymentAmount').value = '';
        document.getElementById('paymentMethod').value = 'cash';
    } else if (modalId === 'createInvoiceModal') {
        document.getElementById('invoiceStudent').value = '';
        document.getElementById('invoiceAmount').value = '';
        document.getElementById('invoiceDescription').value = '';
    }
}

async function recordPayment() {
    const studentId = document.getElementById('paymentStudent').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;

    if (!studentId || !amount || !method) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/accountant/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ studentId, amount, method })
        });
        if (!response.ok) throw new Error('Failed to record payment');
        closeModal('recordPaymentModal');
        fetchDashboardStats();
        fetchTransactions();
    } catch (error) {
        showError(error.message);
    }
}

async function createInvoice() {
    const studentId = document.getElementById('invoiceStudent').value;
    const amount = parseFloat(document.getElementById('invoiceAmount').value);
    const description = document.getElementById('invoiceDescription').value;

    if (!studentId || !amount || !description) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/accountant/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ studentId, amount, description })
        });
        if (!response.ok) throw new Error('Failed to create invoice');
        closeModal('createInvoiceModal');
        fetchDashboardStats();
        fetchTransactions();
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport(type) {
    try {
        const response = await fetch(`/api/accountant/reports/${type}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to generate ${type} report`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_report.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
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
                        <h2 class="section-title"><i class="fas fa-comments"></i> Admin Updates</h2>
                    </div>
                    <div class="table-container">
                        <table id="updatesTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Title</th>
                                    <th>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            await fetchUpdatesForTable();
            return;
        }

        const response = await fetch(`/api/accountant/${section}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error(`Failed to load ${section}`);
        const data = await response.json();

        content.innerHTML = renderSection(section, data);
    } catch (error) {
        content.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function fetchUpdatesForTable() {
    try {
        const response = await fetch('/api/accountant/updates', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch updates');
        const data = await response.json();

        document.getElementById('updatesTable').querySelector('tbody').innerHTML = data.updates.map(update => `
            <tr>
                <td>${new Date(update.timestamp).toLocaleDateString()}</td>
                <td>${update.title}</td>
                <td>${update.content}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

function renderSection(section, data) {
    switch (section) {
        case 'dashboard':
            return document.getElementById('dashboardContent').innerHTML;
        case 'invoices':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-receipt"></i> Invoices</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('createInvoice')"><i class="fas fa-plus"></i> Create Invoice</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Student</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.invoices.map(invoice => `
                                    <tr>
                                        <td>${invoice.id}</td>
                                        <td>${invoice.studentName}</td>
                                        <td>₵${invoice.amount.toLocaleString()}</td>
                                        <td>${invoice.status}</td>
                                        <td><button class="btn btn-secondary btn-small" onclick="viewInvoice('${invoice.id}')">View</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'payments':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-money-bill-wave"></i> Payments</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('recordPayment')"><i class="fas fa-plus"></i> Record Payment</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Student</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.payments.map(payment => `
                                    <tr>
                                        <td>${payment.id}</td>
                                        <td>${payment.studentName}</td>
                                        <td>₵${payment.amount.toLocaleString()}</td>
                                        <td>${payment.method}</td>
                                        <td>${new Date(payment.date).toLocaleDateString()}</td>
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

function showError(message) {
    alert(message); // Replace with a better UI notification in production
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/index.html';
}