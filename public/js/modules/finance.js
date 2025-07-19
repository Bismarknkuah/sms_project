// public/js/modules/finance.js
SMS.protectPage();

const BRANCHES = [
  'Assin Fosu',
  'Accra Branch',
  'Dunkwa Offin Branch',
  'Asanwinso Branch',
  'Magasim Branch'
];

function populateBranchSelectFinance() {
  const sel = document.getElementById('branch');
  if (!sel) return;
  sel.innerHTML = BRANCHES.map(b => `<option value="${b}">${b}</option>`).join('');
}

let editingFinanceId = null;

document.addEventListener('DOMContentLoaded', () => {
  populateBranchSelectFinance();
  loadFinance();
  document.getElementById('financeForm')
    .addEventListener('submit', handleFinanceForm);
});

async function loadFinance() {
  try {
    const recs = await SMS.apiRequest('/finance');
    const tbody = document.getElementById('financeTableBody');
    tbody.innerHTML = '';
    recs.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.studentId}</td>
        <td>${r.branch}</td>
        <td>${r.feeType}</td>
        <td>${r.amount}</td>
        <td>${new Date(r.dueDate).toLocaleDateString()}</td>
        <td>${r.status}</td>
        <td>
          <button onclick="startEditFinance('${r._id}')">Edit</button>
          <button onclick="deleteFinance('${r._id}')">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

async function handleFinanceForm(e) {
  e.preventDefault();
  const form = e.target;
  if (!SMS.validateForm(form)) {
    return SMS.showNotification('Please fill all required fields','error');
  }
  const data = Object.fromEntries(new FormData(form));
  try {
    if (editingFinanceId) {
      await SMS.apiRequest(`/finance/${editingFinanceId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      SMS.showNotification('Record updated','success');
      editingFinanceId = null;
      form.querySelector('button[type="submit"]').textContent = 'Add Record';
    } else {
      await SMS.apiRequest('/finance', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      SMS.showNotification('Record added','success');
    }
    form.reset();
    loadFinance();
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
}

window.startEditFinance = function(id) {
  SMS.apiRequest(`/finance/${id}`)
    .then(r => {
      editingFinanceId = id;
      const form = document.getElementById('financeForm');
      Object.keys(r).forEach(k => {
        if (form[k]) form[k].value = r[k];
      });
      form.querySelector('button[type="submit"]').textContent = 'Update Record';
    })
    .catch(err => SMS.showNotification(err.message,'error'));
};

window.deleteFinance = async function(id) {
  if (!confirm('Delete this record?')) return;
  try {
    await SMS.apiRequest(`/finance/${id}`, { method: 'DELETE' });
    SMS.showNotification('Record deleted','success');
    loadFinance();
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
};
