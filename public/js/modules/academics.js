// public/js/modules/academics.js
SMS.protectPage();

document.addEventListener('DOMContentLoaded', () => {
  loadAcademicSettings();
  document.getElementById('saveSettingsBtn')
    .addEventListener('click', saveAcademicSettings);
  document.getElementById('generateReportBtn')
    .addEventListener('click', generateAcademicReport);
  document.getElementById('exportPdfBtn')
    .addEventListener('click', exportAcademicReport);
});

async function loadAcademicSettings() {
  try {
    const s = await SMS.apiRequest('/academics/settings');
    ['gradingScale', 'passingGrade', 'semesterSystem'].forEach(id => {
      const el = document.getElementById(id);
      if (el && s[id] !== undefined) el.value = s[id];
    });
  } catch (_) { /* no settings yet */ }
}

async function saveAcademicSettings() {
  const payload = {
    gradingScale:    document.getElementById('gradingScale').value,
    passingGrade:    document.getElementById('passingGrade').value,
    semesterSystem:  document.getElementById('semesterSystem').value
  };
  try {
    await SMS.apiRequest('/academics/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    SMS.showNotification('Settings saved', 'success');
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

async function generateAcademicReport() {
  const type   = document.getElementById('reportType').value;
  const period = document.getElementById('reportPeriod').value;
  try {
    const data = await SMS.apiRequest(
      `/academics/report?type=${encodeURIComponent(type)}&period=${encodeURIComponent(period)}`
    );
    displayAcademicReport(data);
  } catch (err) {
    SMS.showNotification(err.message, 'error');
  }
}

function exportAcademicReport() {
  const type   = document.getElementById('reportType').value;
  const period = document.getElementById('reportPeriod').value;
  window.open(
    `/api/academics/report/pdf?type=${encodeURIComponent(type)}&period=${encodeURIComponent(period)}`,
    '_blank'
  );
}

function displayAcademicReport(rows) {
  const container = document.getElementById('reportContainer');
  container.innerHTML = '';
  if (!rows.length) return container.textContent = 'No data';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const htr = document.createElement('tr');
  Object.keys(rows[0]).forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    htr.appendChild(th);
  });
  thead.appendChild(htr);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr');
    Object.values(r).forEach(val => {
      const td = document.createElement('td');
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}
