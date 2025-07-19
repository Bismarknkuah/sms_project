// public/js/modules/library.js
SMS.protectPage();

const BRANCHES = [
  'Assin Fosu',
  'Accra Branch',
  'Dunkwa Offin Branch',
  'Asanwinso Branch',
  'Magasim Branch'
];

function populateBranchLibrary() {
  const sel = document.getElementById('branch');
  if (!sel) return;
  sel.innerHTML = BRANCHES.map(b => `<option value="${b}">${b}</option>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  populateBranchLibrary();
  loadLibrary();
  document.getElementById('addBookForm')
    ?.addEventListener('submit', handleAddBook);
});

async function loadLibrary() {
  try {
    const books = await SMS.apiRequest('/library/books');
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';
    books.forEach(b => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.category}</td>
        <td>${b.branch}</td>
        <td>${b.availableCopies}/${b.totalCopies}</td>
        <td>
          <button onclick="issueBook('${b._id}')">Issue</button>
          <button onclick="returnBook('${b._id}')">Return</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

async function handleAddBook(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await SMS.apiRequest('/library/books', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    SMS.showNotification('Book added','success');
    e.target.reset();
    loadLibrary();
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
}

window.issueBook = async function(id) {
  const studentId = JSON.parse(localStorage.getItem('sms_user')).id;
  const returnDate = document.getElementById('returnDate').value;
  try {
    await SMS.apiRequest(`/library/books/${id}/issue`, {
      method:'POST',
      body: JSON.stringify({ studentId, returnDate })
    });
    SMS.showNotification('Book issued','success');
    loadLibrary();
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
};

window.returnBook = async function(id) {
  const studentId = JSON.parse(localStorage.getItem('sms_user')).id;
  try {
    await SMS.apiRequest(`/library/books/${id}/return`, {
      method:'POST',
      body: JSON.stringify({ studentId })
    });
    SMS.showNotification('Book returned','success');
    loadLibrary();
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
};
