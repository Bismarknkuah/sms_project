// public/js/dashboard.js
// Utility to open/close modals
function setupModal(buttonId, modalId) {
  const btn = document.getElementById(buttonId);
  const modal = document.getElementById(modalId);
  const closeBtn = modal.querySelector('.close');

  btn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

// Run after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setupModal('generateReportBtn', 'reportModal');
  setupModal('sendNoticeBtn',    'noticeModal');
  setupModal('scheduleEventBtn', 'eventModal');

  document.getElementById('reportForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Report generated!');
    document.getElementById('reportModal').classList.remove('open');
  });

  document.getElementById('noticeForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Notice sent!');
    document.getElementById('noticeModal').classList.remove('open');
  });

  document.getElementById('eventForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Event scheduled!');
    document.getElementById('eventModal').classList.remove('open');
  });
});
