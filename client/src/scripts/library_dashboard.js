let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'library_staff') {
        window.location.href = '/index.html';
        return;
    }
    initializeDashboard();
    initializeSocket();
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

function initializeSocket() {
    socket = io('/library', {
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
        fetchLibraryProfile(),
        fetchBorrowing(),
        fetchOverdue()
    ]);
}

async function fetchLibraryProfile() {
    try {
        const response = await fetch('/api/library/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();

        document.getElementById('totalBooks').textContent = data.totalBooks || 0;
        document.getElementById('booksBorrowed').textContent = data.booksBorrowed || 0;
        document.getElementById('overdueBooks').textContent = data.overdueBooks || 0;
        document.getElementById('userName').textContent = data.name || 'Library Staff';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'LS';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchBorrowing() {
    try {
        const response = await fetch('/api/library/borrowing', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch borrowing records');
        const data = await response.json();

        document.getElementById('borrowingTable').querySelector('tbody').innerHTML = data.borrowing.map(record => `
            <tr>
                <td>${record.bookTitle}</td>
                <td>${record.borrowerName}</td>
                <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
                <td>${new Date(record.dueDate).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchOverdue() {
    try {
        const response = await fetch('/api/library/overdue', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch overdue records');
        const data = await response.json();

        document.getElementById('overdueTable').querySelector('tbody').innerHTML = data.overdue.map(record => `
            <tr>
                <td>${record.bookTitle}</td>
                <td>${record.borrowerName}</td>
                <td>${new Date(record.dueDate).toLocaleDateString()}</td>
                <td>${record.fine.toFixed(2)} GHS</td>
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
        const response = await fetch(`/api/library/${section}`, {
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
        case 'books':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-book"></i> Books</h2>
                        <div class="section-actions">
                            <div class="search-box">
                                <input type="text" placeholder="Search books..." oninput="searchBooks(this.value)">
                                <i class="fas fa-search"></i>
                            </div>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.books.map(book => `
                                    <tr>
                                        <td>${book.title}</td>
                                        <td>${book.author}</td>
                                        <td>${book.category}</td>
                                        <td>${book.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="viewBook('${book._id}')">View</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'borrowing':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-exchange-alt"></i> Borrowing Records</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Borrower</th>
                                    <th>Date Borrowed</th>
                                    <th>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.borrowing.map(record => `
                                    <tr>
                                        <td>${record.bookTitle}</td>
                                        <td>${record.borrowerName}</td>
                                        <td>${new Date(record.borrowDate).toLocaleDateString()}</td>
                                        <td>${new Date(record.dueDate).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'reservations':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-bookmark"></i> Reservations</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Borrower</th>
                                    <th>Reservation Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.reservations.map(res => `
                                    <tr>
                                        <td>${res.bookTitle}</td>
                                        <td>${res.borrowerName}</td>
                                        <td>${new Date(res.reservationDate).toLocaleDateString()}</td>
                                        <td>${res.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        case 'overdue':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-clock"></i> Overdue Books</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Borrower</th>
                                    <th>Due Date</th>
                                    <th>Fine</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.overdue.map(record => `
                                    <tr>
                                        <td>${record.bookTitle}</td>
                                        <td>${record.borrowerName}</td>
                                        <td>${new Date(record.dueDate).toLocaleDateString()}</td>
                                        <td>${record.fine.toFixed(2)} GHS</td>
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

async function searchBooks(query) {
    try {
        const response = await fetch(`/api/library/books/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search books');
        const data = await response.json();

        document.getElementById('dashboardContent').innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title"><i class="fas fa-book"></i> Search Results</h2>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.books.map(book => `
                                <tr>
                                    <td>${book.title}</td>
                                    <td>${book.author}</td>
                                    <td>${book.category}</td>
                                    <td>${book.status}</td>
                                    <td>
                                        <button class="btn btn-primary btn-small" onclick="viewBook('${book._id}')">View</button>
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

async function viewBook(bookId) {
    try {
        const response = await fetch(`/api/library/books/${bookId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to view book');
        const book = await response.json();
        showError(`Book Details: ${book.title} by ${book.author} (Status: ${book.status})`); // Replace with modal
    } catch (error) {
        showError(error.message);
    }
}

function openCheckOutModal() {
    document.getElementById('checkOutModal').classList.add('active');
}

function openCheckInModal() {
    document.getElementById('checkInModal').classList.add('active');
}

function openReservationModal() {
    document.getElementById('reservationModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.getElementById(`${modalId}BookId`).value = '';
    if (modalId === 'checkOutModal' || modalId === 'reservationModal') {
        document.getElementById(`${modalId}UserId`).value = '';
    }
}

async function checkOutBook() {
    const bookId = document.getElementById('checkOutBookId').value;
    const userId = document.getElementById('checkOutUserId').value;

    if (!bookId || !userId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/library/borrow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ bookId, userId })
        });
        if (!response.ok) throw new Error('Failed to check out book');
        closeModal('checkOutModal');
        fetchBorrowing();
        fetchLibraryProfile();
    } catch (error) {
        showError(error.message);
    }
}

async function checkInBook() {
    const bookId = document.getElementById('checkInBookId').value;

    if (!bookId) {
        showError('Please enter book ID');
        return;
    }

    try {
        const response = await fetch('/api/library/return', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ bookId })
        });
        if (!response.ok) throw new Error('Failed to check in book');
        closeModal('checkInModal');
        fetchBorrowing();
        fetchOverdue();
        fetchLibraryProfile();
    } catch (error) {
        showError(error.message);
    }
}

async function reserveBook() {
    const bookId = document.getElementById('reserveBookId').value;
    const userId = document.getElementById('reserveUserId').value;

    if (!bookId || !userId) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/library/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ bookId, userId })
        });
        if (!response.ok) throw new Error('Failed to reserve book');
        closeModal('reservationModal');
        loadSection('reservations');
    } catch (error) {
        showError(error.message);
    }
}