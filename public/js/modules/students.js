// public/js/modules/students.js
SMS.protectPage();

const BRANCHES = [
  'Assin Fosu',
  'Accra Branch',
  'Dunkwa Offin Branch',
  'Asanwinso Branch',
  'Magasim Branch'
];

function populateBranchSelect() {
  const sel = document.getElementById('branch');
  if (!sel) return;
  sel.innerHTML = BRANCHES.map(b => `<option value="${b}">${b}</option>`).join('');
}

let editingStudentId = null;

document.addEventListener('DOMContentLoaded', () => {
  populateBranchSelect();
  loadStudents();
  document.getElementById('studentForm')
    .addEventListener('submit', handleStudentForm);
});

async function loadStudents() {
  try {
    const students = await SMS.apiRequest('/student');
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';
    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.studentId}</td>
        <td>${s.firstName} ${s.lastName}</td>
        <td>${s.branch}</td>
        <td>${s.class}</td>
        <td>${s.section}</td>
        <td>${s.email}</td>
        <td>
          <button onclick="startEditStudent('${s._id}')">Edit</button>
          <button onclick="deleteStudent('${s._id}')">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

async function handleStudentForm(e) {
  e.preventDefault();
  const form = e.target;
  if (!SMS.validateForm(form)) {
    return SMS.showNotification('Please fill all required fields', 'error');
  }
  const data = Object.fromEntries(new FormData(form));
  try {
    if (editingStudentId) {
      await SMS.apiRequest(`/student/${editingStudentId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      SMS.showNotification('Student updated', 'success');
      editingStudentId = null;
      form.querySelector('button[type="submit"]').textContent = 'Add Student';
    } else {
      await SMS.apiRequest('/student', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      SMS.showNotification('Student added', 'success');
    }
    form.reset();
    loadStudents();
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

window.startEditStudent = function(id) {
  SMS.apiRequest(`/student/${id}`)
    .then(s => {
      editingStudentId = id;
      const form = document.getElementById('studentForm');
      Object.keys(s).forEach(k => {
        if (form[k]) form[k].value = s[k];
      });
      form.querySelector('button[type="submit"]').textContent = 'Update Student';
    })
    .catch(err => SMS.showNotification(err.message, 'error'));
};

window.deleteStudent = async function(id) {
  if (!confirm('Delete this student?')) return;
  try {
    await SMS.apiRequest(`/student/${id}`, { method: 'DELETE' });
    SMS.showNotification('Student deleted', 'success');
    loadStudents();
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
};
