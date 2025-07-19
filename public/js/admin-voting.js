const authHeader = () => ({ 'Authorization': 'Bearer '+localStorage.getItem('smsToken') });

async function fetchElections() {
  const res = await fetch('/api/admin/elections', { headers: authHeader() });
  const list = await res.json();
  const sel = document.getElementById('eSelect');
  sel.innerHTML = list.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
}

async function createElection() {
  const body = {
    title:    document.getElementById('eTitle').value,
    startsAt: document.getElementById('eStart').value,
    endsAt:   document.getElementById('eEnd').value
  };
  await fetch('/api/admin/elections', {
    method: 'POST',
    headers: {...authHeader(), 'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  alert('Election created');
  fetchElections().then(loadPositions);
}

async function loadPositions() {
  const eid = document.getElementById('eSelect').value;
  const res = await fetch(`/api/admin/positions/${eid}`, { headers: authHeader() });
  const list = await res.json();
  document.getElementById('posSelect').innerHTML =
    list.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
}

async function addPosition() {
  const body = {
    electionId: document.getElementById('eSelect').value,
    name:       document.getElementById('pName').value
  };
  await fetch('/api/admin/positions', {
    method:'POST', headers:{...authHeader(),'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  alert('Position added');
  loadPositions();
}

async function addCandidate() {
  const fd = new FormData();
  fd.append('positionId', document.getElementById('posSelect').value);
  fd.append('name', document.getElementById('cName').value);
  fd.append('image', document.getElementById('cImage').files[0]);
  await fetch('/api/admin/candidates', {
    method:'POST', headers: authHeader(), body: fd
  });
  alert('Candidate added');
}

document.addEventListener('DOMContentLoaded', () => {
  fetchElections().then(loadPositions);
  document.getElementById('createBtn').onclick   = createElection;
  document.getElementById('addPosBtn').onclick   = addPosition;
  document.getElementById('addCandBtn').onclick  = addCandidate;
});
