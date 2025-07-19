// public/js/transport.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('jwt');
  if (!token) return location.href = 'login.html';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Elements
  const routeTable = document.querySelector('#routes-table tbody');
  const hostelTable = document.querySelector('#hostels-table tbody');
  const routeSearch = document.getElementById('route-search');
  const hostelSearch = document.getElementById('hostel-search');

  // Modal helpers
  function openModal(id) { document.getElementById(id).style.display = 'flex'; }
  function closeModal(e) {
    const overlay = e.target.dataset.close;
    if (overlay) document.getElementById(overlay).style.display = 'none';
  }
  document.querySelectorAll('.close-btn, [data-close]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Fetch & render data
  async function fetchRoutes() {
    const data = await fetch('/api/transport/routes', { headers }).then(r => r.json());
    return data;
  }
  async function fetchHostels() {
    const data = await fetch('/api/hostel', { headers }).then(r => r.json());
    return data;
  }
  function renderRoutes(data) {
    const filter = routeSearch.value.toLowerCase();
    routeTable.innerHTML = data
      .filter(r => r.routeName.toLowerCase().includes(filter))
      .map(r => `
        <tr>
          <td>${r.routeName}</td>
          <td>${r.branch}</td>
          <td>${r.driverName}</td>
          <td>${r.vehicleNumber}</td>
          <td>${r.capacity}</td>
          <td>
            <button class="action-btn small" data-edit-route='${JSON.stringify(r)}'>✎</button>
            <button class="action-btn small" data-delete-route='${r._id}'>🗑</button>
          </td>
        </tr>
      `).join('');
    attachRouteRowHandlers();
  }
  function renderHostels(data) {
    const filter = hostelSearch.value.toLowerCase();
    hostelTable.innerHTML = data
      .filter(h => h.name.toLowerCase().includes(filter))
      .map(h => `
        <tr>
          <td>${h.name}</td>
          <td>${h.branch}</td>
          <td>${h.capacity}</td>
          <td>${h.students.length}</td>
          <td>
            <button class="action-btn small" data-edit-hostel='${JSON.stringify(h)}'>✎</button>
            <button class="action-btn small" data-delete-hostel='${h._id}'>🗑</button>
          </td>
        </tr>
      `).join('');
    attachHostelRowHandlers();
  }

  // Row button handlers
  function attachRouteRowHandlers() {
    document.querySelectorAll('[data-edit-route]').forEach(btn => {
      btn.onclick = () => {
        const r = JSON.parse(btn.dataset.editRoute);
        const form = document.getElementById('route-form');
        form.id.value = r._id; form.routeName.value = r.routeName;
        form.branch.value = r.branch; form.driverName.value = r.driverName;
        form.vehicleNumber.value = r.vehicleNumber; form.capacity.value = r.capacity;
        openModal('route-modal-overlay');
      };
    });
    document.querySelectorAll('[data-delete-route]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Delete this route?')) return;
        await fetch(`/api/transport/routes/${btn.dataset.deleteRoute}`, {
          method: 'DELETE', headers
        });
        init();
      };
    });
  }
  function attachHostelRowHandlers() {
    document.querySelectorAll('[data-edit-hostel]').forEach(btn => {
      btn.onclick = () => {
        const h = JSON.parse(btn.dataset.editHostel);
        const form = document.getElementById('hostel-form');
        form.id.value = h._id; form.name.value = h.name;
        form.branch.value = h.branch; form.capacity.value = h.capacity;
        openModal('hostel-modal-overlay');
      };
    });
    document.querySelectorAll('[data-delete-hostel]').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Delete this hostel?')) return;
        await fetch(`/api/hostel/${btn.dataset.deleteHostel}`, {
          method: 'DELETE', headers
        });
        init();
      };
    });
  }

  // Form submissions
  document.getElementById('route-form').onsubmit = async e => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      routeName: f.routeName.value, branch: f.branch.value,
      driverName: f.driverName.value, vehicleNumber: f.vehicleNumber.value,
      capacity: +f.capacity.value
    };
    const method = f.id.value ? 'PUT' : 'POST';
    const url = f.id.value
      ? `/api/transport/routes/${f.id.value}`
      : '/api/transport/routes';
    await fetch(url, { method, headers, body: JSON.stringify(payload) });
    closeModal({ target: { dataset: { close: 'route-modal-overlay' } } });
    init();
  };

  document.getElementById('hostel-form').onsubmit = async e => {
    e.preventDefault();
    const f = e.target;
    const payload = {
      name: f.name.value,
      branch: f.branch.value,
      capacity: +f.capacity.value
    };
    const method = f.id.value ? 'PUT' : 'POST';
    const url = f.id.value
      ? `/api/hostel/${f.id.value}`
      : '/api/hostel';
    await fetch(url, { method, headers, body: JSON.stringify(payload) });
    closeModal({ target: { dataset: { close: 'hostel-modal-overlay' } } });
    init();
  };

  // Search filters
  routeSearch.oninput = () => fetchRoutes().then(renderRoutes);
  hostelSearch.oninput = () => fetchHostels().then(renderHostels);

  // Open new modals
  document.getElementById('open-route-modal')
    .onclick = () => {
      const form = document.getElementById('route-form');
      form.reset(); form.id.value = '';
      openModal('route-modal-overlay');
    };
  document.getElementById('open-hostel-modal')
    .onclick = () => {
      const form = document.getElementById('hostel-form');
      form.reset(); form.id.value = '';
      openModal('hostel-modal-overlay');
    };

  // Init
  async function init() {
    const [routes, hostels] = await Promise.all([fetchRoutes(), fetchHostels()]);
    renderRoutes(routes);
    renderHostels(hostels);
  }
  init();
});
