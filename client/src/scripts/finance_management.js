let socket;
let userBranchId = null;
let userRole = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    if (!token || !['finance_officer', 'branch_manager', 'super_admin'].includes(userRole)) {
        window.location.href = '/index.html';
        return;
    }
    initializeFinance();
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

    socket.on('financeUpdate', (update) => {
        if (userRole === 'super_admin' || update.branchId === userBranchId) {
            updateBanner(update.title + ': ' + update.content);
            loadFees();
        }
    });

    socket.on('connect_error', (error) => {
        showError('WebSocket connection failed: Wiltshire');
    });
}

async function initializeFinance() {
    await Promise.all([
        fetchUserInfo(),
        fetchBranches(),
        fetchStudents()
    ]);
    loadFees();
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        userBranchId = data.branchId;
        document.getElementById('userName').textContent = data.name || 'Finance Officer';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'FO';
        document.getElementById('branchName').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = userRole === 'super_admin' ? 'All Branches' : data.branchName || 'Branch';

        if (userRole === 'super_admin') {
            document.getElementById('sectionActions').innerHTML = `
                <select id="branchSelect" onchange="loadFees()">
                    <option value="">All Branches</option>
                    <!-- Populated dynamically -->
                </select>
                <button class="btn btn-primary" onclick="openModal('recordPaymentModal')"><i class="fas fa-plus"></i> Record Payment</button>
                <button class="btn btn-primary" onclick="openModal('uploadFeesModal')"><i class="fas fa-upload"></i> Bulk Upload</button>
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

        if (userRole === 'super_admin') {
            const branchOptions = data.branches.map(branch => `<option value="${branch._id}">${branch.name}</option>`).join('');
            document.getElementById('branchSelect').innerHTML = `<option value="">All Branches</option>${branchOptions}`;
        }
    } catch (error) {
        showError(error.message);
    }
}

async function fetchStudents() {
    try {
        const url = userRole === 'super_admin' ? '/api/admin/students' : `/api/admin/students?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();

        const studentOptions = data.students.map(student => `<option value="${student._id}">${student.name} (${student.branchName})</option>`).join('');
        document.getElementById('studentSelect').innerHTML = `<option value="">Select Student</option>${studentOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function loadFees() {
    const branchId = userRole === 'super_admin' ? document.getElementById('branchSelect')?.value : userBranchId;
    try {
        const url = branchId ? `/api/admin/finance/fees?branchId=${branchId}` : '/api/admin/finance/fees';
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch fees');
        const data = await response.json();

        document.getElementById('feeTable').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Fee Type</th>
                        <th>Amount (GHS)</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.fees.map(fee => `
                        <tr>
                            <td>${fee.studentName}</td>
                            <td>${fee.feeType}</td>
                            <td>${fee.amount.toFixed(2)}</td>
                            <td>${new Date(fee.paymentDate).toLocaleDateString()}</td>
                            <td>${fee.status}</td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="viewFee('${fee._id}')">View</button>
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

async function searchTransactions(query) {
    try {
        const url = userRole === 'super_admin' ?
            `/api/admin/finance/search?query=${encodeURIComponent(query)}` :
            `/api/admin/finance/search?query=${encodeURIComponent(query)}&branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search transactions');
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
                                <th>Amount (GHS)</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.transactions.map(transaction => `
                                <tr>
                                    <td>${transaction.type}</td>
                                    <td>${transaction.details}</td>
                                    <td>${transaction.amount.toFixed(2)}</td>
                                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                                    <td>${transaction.status}</td>
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

async function recordPayment() {
    const studentId = document.getElementById('studentSelect').value;
    const feeType = document.getElementById('feeType').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const paymentDate = document.getElementById('paymentDate').value;

    if (!studentId || !feeType || !amount || !paymentDate) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/finance/fees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ studentId, feeType, amount, paymentDate, branchId: userBranchId })
        });
        if (!response.ok) throw new Error('Failed to record payment');
        closeModal('recordPaymentModal');
        loadFees();
        socket.emit('financeUpdate', {
            title: 'Fee Payment Recorded',
            content: `Payment of GHS ${amount} recorded for ${feeType}`,
            branchId: userBranchId
        });
        sendFeeNotification(studentId, feeType, amount);
    } catch (error) {
        showError(error.message);
    }
}

async function recordExpense() {
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const date = document.getElementById('expenseDate').value;
    const description = document.getElementById('expenseDescription').value;
    const receipt = document.getElementById('expenseReceipt').files[0];

    if (!category || !amount || !date) {
        showError('Please fill all required fields');
        return;
    }

    const formData = new FormData();
    formData.append('category', category);
    formData.append('amount', amount);
    formData.append('date', date);
    formData.append('description', description);
    formData.append('branchId', userBranchId);
    if (receipt) formData.append('receipt', receipt);

    try {
        const response = await fetch('/api/admin/finance/expenses', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to record expense');
        closeModal('recordExpenseModal');
        loadSection('expenses');
        socket.emit('financeUpdate', {
            title: 'Expense Recorded',
            content: `Expense of GHS ${amount} recorded for ${category}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function sendFeeNotification(studentId, feeType, amount) {
    try {
        const response = await fetch('/api/admin/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                recipientId: studentId,
                recipientType: 'parent',
                subject: 'Fee Payment Confirmation',
                content: `A payment of GHS ${amount} for ${feeType} has been received. Thank you!`,
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
            `/api/admin/finance/${section}` :
            `/api/admin/finance/${section}?branchId=${userBranchId}`;
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
        case 'fees':
            return document.getElementById('dashboardContent').innerHTML;
        case 'expenses':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-receipt"></i> Expenses</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('recordExpenseModal')"><i class="fas fa-plus"></i> Record Expense</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Amount (GHS)</th>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.expenses.map(expense => `
                                    <tr>
                                        <td>${expense.category}</td>
                                        <td>${expense.amount.toFixed(2)}</td>
                                        <td>${new Date(expense.date).toLocaleDateString()}</td>
                                        <td>${expense.description || ''}</td>
                                        <td>${expense.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewExpense('${expense._id}')">View</button>
                                            ${expense.status === 'pending' && userRole === 'branch_manager' ? 
                                              `<button class="btn btn-primary btn-small" onclick="approveExpense('${expense._id}')">Approve</button>` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'budgets':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-wallet"></i> Budgets</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('createBudgetModal')"><i class="fas fa-plus"></i> Create Budget</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>Category</th>
                                    <th>Allocated (GHS)</th>
                                    <th>Spent (GHS)</th>
                                    <th>Remaining (GHS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.budgets.map(budget => `
                                    <tr>
                                        <td>${budget.period}</td>
                                        <td>${budget.category}</td>
                                        <td>${budget.allocated.toFixed(2)}</td>
                                        <td>${budget.spent.toFixed(2)}</td>
                                        <td>${(budget.allocated - budget.spent).toFixed(2)}</td>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Financial Analytics</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="generateReport()"><i class="fas fa-file-pdf"></i> Generate Report</button>
                        </div>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                            <div class="stat-info">
                                <h3>GHS ${data.totalRevenue.toFixed(2)}</h3>
                                <p>Total Revenue</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-receipt"></i></div>
                            <div class="stat-info">
                                <h3>GHS ${data.totalExpenses.toFixed(2)}</h3>
                                <p>Total Expenses</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-circle"></i></div>
                            <div class="stat-info">
                                <h3>GHS ${data.overdueFees.toFixed(2)}</h3>
                                <p>Overdue Fees</p>
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

async function viewFee(feeId) {
    try {
        const response = await fetch(`/api/admin/finance/fees/${feeId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch fee details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.fee.branchId !== userBranchId) {
            showError('Access denied: Fee belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-money-bill-wave"></i> Fee Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('fees')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Student</th><td>${data.fee.studentName}</td></tr>
                        <tr><th>Fee Type</th><td>${data.fee.feeType}</td></tr>
                        <tr><th>Amount (GHS)</th><td>${data.fee.amount.toFixed(2)}</td></tr>
                        <tr><th>Payment Date</th><td>${new Date(data.fee.paymentDate).toLocaleDateString()}</td></tr>
                        <tr><th>Status</th><td>${data.fee.status}</td></tr>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function viewExpense(expenseId) {
    try {
        const response = await fetch(`/api/admin/finance/expenses/${expenseId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch expense details');
        const data = await response.json();

        if (userRole !== 'super_admin' && data.expense.branchId !== userBranchId) {
            showError('Access denied: Expense belongs to another branch');
            return;
        }

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-receipt"></i> Expense Details</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="loadSection('expenses')"><i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <tr><th>Category</th><td>${data.expense.category}</td></tr>
                        <tr><th>Amount (GHS)</th><td>${data.expense.amount.toFixed(2)}</td></tr>
                        <tr><th>Date</th><td>${new Date(data.expense.date).toLocaleDateString()}</td></tr>
                        <tr><th>Description</th><td>${data.expense.description || ''}</td></tr>
                        <tr><th>Status</th><td>${data.expense.status}</td></tr>
                        ${data.expense.receiptUrl ? `<tr><th>Receipt</th><td><a href="${data.expense.receiptUrl}" target="_blank">View Receipt</a></td></tr>` : ''}
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        showError(error.message);
    }
}

async function approveExpense(expenseId) {
    try {
        const response = await fetch(`/api/admin/finance/expenses/${expenseId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (userRole !== 'super_admin' && data.expense.branchId !== userBranchId) {
            showError('Access denied: Expense belongs to another branch');
            return;
        }

        const approveResponse = await fetch(`/api/admin/finance/expenses/${expenseId}/approve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!approveResponse.ok) throw new Error('Failed to approve expense');
        loadSection('expenses');
        socket.emit('financeUpdate', {
            title: 'Expense Approved',
            content: `Expense ID ${expenseId} approved`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

function initializeFileUpload() {
    const uploadContainer = document.getElementById('uploadContainer');
    const fileInput = document.getElementById('feeFile');

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

async function uploadFees() {
    const fileInput = document.getElementById('feeFile');

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
        const response = await fetch('/api/admin/finance/fees/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload fees');
        closeModal('uploadFeesModal');
        loadFees();
        socket.emit('financeUpdate', {
            title: 'Bulk Fees Uploaded',
            content: `Fee payments uploaded for branch ${userBranchId}`,
            branchId: userBranchId
        });
    } catch (error) {
        showError(error.message);
    }
}

async function generateReport() {
    try {
        const url = userRole === 'super_admin' && document.getElementById('branchSelect')?.value ?
            `/api/admin/finance/report?branchId=${document.getElementById('branchSelect').value}` :
            `/api/admin/finance/report?branchId=${userBranchId}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to generate report');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `finance_report_${userBranchId || 'all'}.pdf`;
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