let socket;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || !['library_manager', 'super_admin'].includes(role)) {
        window.location.href = '/index.html';
        return;
    }
    initializeManagement();
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
        fetchBooks(),
        fetchCategories()
    ]);
}

async function fetchUserInfo() {
    try {
        const response = await fetch('/api/admin/profile', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user info');
        const data = await response.json();

        document.getElementById('userName').textContent = data.name || 'Library Manager';
        document.getElementById('userAvatar').textContent = data.name ? data.name.charAt(0).toUpperCase() : 'LM';
        document.getElementById('branchName').textContent = data.branchName || 'Branch';
        document.getElementById('userBranch').textContent = data.branchName || 'Branch';
    } catch (error) {
        showError(error.message);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch('/api/admin/library/books', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();

        document.getElementById('bookTable').querySelector('tbody').innerHTML = data.books.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.status}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editBook('${book._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteBook('${book._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        showError(error.message);
    }
}

async function fetchCategories() {
    try {
        const response = await fetch('/api/admin/library/categories', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();

        const categoryOptions = data.categories.map(category => `<option value="${category._id}">${category.name}</option>`).join('');
        document.getElementById('bookCategory').innerHTML = `<option value="">Select Category</option>${categoryOptions}`;
        document.getElementById('editBookCategory').innerHTML = `<option value="">Select Category</option>${categoryOptions}`;
    } catch (error) {
        showError(error.message);
    }
}

async function searchLibrary(query) {
    try {
        const response = await fetch(`/api/admin/library/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to search library');
        const data = await response.json();

        document.getElementById('bookTable').querySelector('tbody').innerHTML = data.books.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.category}</td>
                <td>${book.status}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="editBook('${book._id}')">Edit</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteBook('${book._id}')">Delete</button>
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
    if (modalId === 'addBookModal') {
        document.getElementById('bookTitle').value = '';
        document.getElementById('bookAuthor').value = '';
        document.getElementById('bookCategory').value = '';
        document.getElementById('bookISBN').value = '';
        document.getElementById('bookQuantity').value = '';
    } else if (modalId === 'editBookModal') {
        document.getElementById('editBookId').value = '';
        document.getElementById('editBookTitle').value = '';
        document.getElementById('editBookAuthor').value = '';
        document.getElementById('editBookCategory').value = '';
        document.getElementById('editBookISBN').value = '';
        document.getElementById('editBookQuantity').value = '';
    } else if (modalId === 'addCategoryModal') {
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryDescription').value = '';
    } else if (modalId === 'editCategoryModal') {
        document.getElementById('editCategoryId').value = '';
        document.getElementById('editCategoryName').value = '';
        document.getElementById('editCategoryDescription').value = '';
    }
}

async function saveBook() {
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const categoryId = document.getElementById('bookCategory').value;
    const isbn = document.getElementById('bookISBN').value;
    const quantity = document.getElementById('bookQuantity').value;

    if (!title || !author || !categoryId || !isbn || !quantity) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch('/api/admin/library/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, author, categoryId, isbn, quantity })
        });
        if (!response.ok) throw new Error('Failed to save book');
        closeModal('addBookModal');
        fetchBooks();
        socket.emit('newUpdate', { title: 'New Book Added', content: `${title} by ${author} added to library` });
    } catch (error) {
        showError(error.message);
    }
}

async function editBook(bookId) {
    try {
        const response = await fetch(`/api/admin/library/books/${bookId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch book');
        const book = await response.json();

        document.getElementById('editBookId').value = book._id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookCategory').value = book.categoryId;
        document.getElementById('editBookISBN').value = book.isbn;
        document.getElementById('editBookQuantity').value = book.quantity;

        openModal('editBookModal');
    } catch (error) {
        showError(error.message);
    }
}

async function updateBook() {
    const bookId = document.getElementById('editBookId').value;
    const title = document.getElementById('editBookTitle').value;
    const author = document.getElementById('editBookAuthor').value;
    const categoryId = document.getElementById('editBookCategory').value;
    const isbn = document.getElementById('editBookISBN').value;
    const quantity = document.getElementById('editBookQuantity').value;

    if (!title || !author || !categoryId || !isbn || !quantity) {
        showError('Please fill all required fields');
        return;
    }

    try {
        const response = await fetch(`/api/admin/library/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ title, author, categoryId, isbn, quantity })
        });
        if (!response.ok) throw new Error('Failed to update book');
        closeModal('editBookModal');
        fetchBooks();
        socket.emit('newUpdate', { title: 'Book Updated', content: `${title} by ${author} updated in library` });
    } catch (error) {
        showError(error.message);
    }
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`/api/admin/library/books/${bookId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete book');
        fetchBooks();
        socket.emit('newUpdate', { title: 'Book Deleted', content: `Book ID ${bookId} removed from library` });
    } catch (error) {
        showError(error.message);
    }
}

async function saveCategory() {
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;

    if (!name) {
        showError('Category name is required');
        return;
    }

    try {
        const response = await fetch('/api/admin/library/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, description })
        });
        if (!response.ok) throw new Error('Failed to save category');
        closeModal('addCategoryModal');
        fetchCategories();
        socket.emit('newUpdate', { title: 'New Category Added', content: `${name} added to library categories` });
    } catch (error) {
        showError(error.message);
    }
}

async function editCategory(categoryId) {
    try {
        const response = await fetch(`/api/admin/library/categories/${categoryId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch category');
        const category = await response.json();

        document.getElementById('editCategoryId').value = category._id;
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryDescription').value = category.description;

        openModal('editCategoryModal');
    } catch (error) {
        showError(error.message);
    }
}

async function updateCategory() {
    const categoryId = document.getElementById('editCategoryId').value;
    const name = document.getElementById('editCategoryName').value;
    const description = document.getElementById('editCategoryDescription').value;

    if (!name) {
        showError('Category name is required');
        return;
    }

    try {
        const response = await fetch(`/api/admin/library/categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name, description })
        });
        if (!response.ok) throw new Error('Failed to update category');
        closeModal('editCategoryModal');
        fetchCategories();
        socket.emit('newUpdate', { title: 'Category Updated', content: `${name} updated in library categories` });
    } catch (error) {
        showError(error.message);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
        const response = await fetch(`/api/admin/library/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete category');
        fetchCategories();
        socket.emit('newUpdate', { title: 'Category Deleted', content: `Category ID ${categoryId} removed from library` });
    } catch (error) {
        showError(error.message);
    }
}

async function loadSection(section) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = '<p>Loading...</p>';

    try {
        const response = await fetch(`/api/admin/library/${section}`, {
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
        case 'books':
            return document.getElementById('dashboardContent').innerHTML;
        case 'categories':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-tags"></i> Categories</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('addCategoryModal')"><i class="fas fa-plus"></i> Add Category</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.categories.map(category => `
                                    <tr>
                                        <td>${category.name}</td>
                                        <td>${category.description || 'No description'}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="editCategory('${category._id}')">Edit</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteCategory('${category._id}')">Delete</button>
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
                        <h2 class="section-title"><i class="fas fa-chart-bar"></i> Library Analytics</h2>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-book"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalBooks}</h3>
                                <p>Total Books</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-book-reader"></i></div>
                            <div class="stat-info">
                                <h3>${data.borrowedBooks}</h3>
                                <p>Borrowed Books</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-tags"></i></div>
                            <div class="stat-info">
                                <h3>${data.totalCategories}</h3>
                                <p>Total Categories</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        case 'uploads':
            return `
                <div class="content-section">
                    <div class="section-header">
                        <h2 class="section-title"><i class="fas fa-upload"></i> Bulk Book Upload</h2>
                        <div class="section-actions">
                            <button class="btn btn-primary" onclick="openModal('uploadBookModal')"><i class="fas fa-upload"></i> Upload CSV</button>
                        </div>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Upload Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.uploads.map(upload => `
                                    <tr>
                                        <td>${upload.fileName}</td>
                                        <td>${new Date(upload.uploadDate).toLocaleDateString()}</td>
                                        <td>${upload.status}</td>
                                        <td>
                                            <button class="btn btn-primary btn-small" onclick="downloadUpload('${upload._id}')">Download</button>
                                            <button class="btn btn-secondary btn-small" onclick="deleteUpload('${upload._id}')">Delete</button>
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
    const fileInput = document.getElementById('bookFile');

    if (!uploadContainer || !fileInput) return;

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

async function uploadBooks() {
    const fileInput = document.getElementById('bookFile');

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

    try {
        const response = await fetch('/api/admin/library/bulk-upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        });
        if (!response.ok) throw new Error('Failed to upload books');
        closeModal('uploadBookModal');
        fetchBooks();
        loadSection('uploads');
        socket.emit('newUpdate', { title: 'Bulk Book Upload', content: `CSV file ${file.name} uploaded successfully` });
    } catch (error) {
        showError(error.message);
    }
}

async function downloadUpload(uploadId) {
    try {
        const response = await fetch(`/api/admin/library/uploads/${uploadId}/download`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to download file');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `upload_${uploadId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showError(error.message);
    }
}

async function deleteUpload(uploadId) {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
        const response = await fetch(`/api/admin/library/uploads/${uploadId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error('Failed to delete upload');
        loadSection('uploads');
        socket.emit('newUpdate', { title: 'Upload Deleted', content: `Upload ID ${uploadId} removed from library` });
    } catch (error) {
        showError(error.message);
    }
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