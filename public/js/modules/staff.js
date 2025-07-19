// public/js/modules/staff.js
SMS.protectPage();

const BRANCHES = [
  'Assin Fosu',
  'Accra Branch',
  'Dunkwa Offin Branch',
  'Asanwinso Branch',
  'Magasim Branch'
];

function populateBranchSelectStaff() {
  const sel = document.getElementById('branch');
  if (!sel) return;
  sel.innerHTML = BRANCHES.map(b => `<option value="${b}">${b}</option>`).join('');
}

let editingStaffId = null;

document.addEventListener('DOMContentLoaded', () => {
  populateBranchSelectStaff();
  loadStaff();
  document.getElementById('staffForm')
    .addEventListener('submit', handleStaffForm);
});

async function loadStaff() {
  try {
    const list = await SMS.apiRequest('/staff');
    const tbody = document.getElementById('staffTableBody');
    tbody.innerHTML = '';
    list.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.staffId}</td>
        <td>${s.firstName} ${s.lastName}</td>
        <td>${s.branch}</td>
        <td>${s.role}</td>
        <td>${s.email}</td>
        <td>
          <button onclick="startEditStaff('${s._id}')">Edit</button>
          <button onclick="deleteStaff('${s._id}')">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

async function handleStaffForm(e) {
  e.preventDefault();
  const form = e.target;
  if (!SMS.validateForm(form)) {
    return SMS.showNotification('Please fill all required fields', 'error');
  }
  const data = Object.fromEntries(new FormData(form));
  try {
    if (editingStaffId) {
      await SMS.apiRequest(`/staff/${editingStaffId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      SMS.showNotification('Staff updated', 'success');
      editingStaffId = null;
      form.querySelector('button[type="submit"]').textContent = 'Add Staff';
    } else {
      await SMS.apiRequest('/staff', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      SMS.showNotification('Staff added', 'success');
    }
    form.reset();
    loadStaff();
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

window.startEditStaff = function(id) {
  SMS.apiRequest(`/staff/${id}`)
    .then(s => {
      editingStaffId = id;
      const form = document.getElementById('staffForm');
      Object.keys(s).forEach(k => {
        if (form[k]) form[k].value = s[k];
      });
      form.querySelector('button[type="submit"]').textContent = 'Update Staff';
    })
    .catch(err => SMS.showNotification(err.message, 'error'));
};

window.deleteStaff = async function(id) {
  if (!confirm('Delete this staff?')) return;
  try {
    await SMS.apiRequest(`/staff/${id}`, { method: 'DELETE' });
    SMS.showNotification('Staff deleted', 'success');
    loadStaff();
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
};
