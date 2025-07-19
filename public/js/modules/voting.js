const authHeader2 = () => ({ 'Authorization': 'Bearer '+localStorage.getItem('smsToken') });

async function loadElections() {
  const res = await fetch('/api/voting/elections');
  const list = await res.json();
  const sel = document.getElementById('elecSelect');
  sel.innerHTML = list.map(e => `<option value="${e._id}">${e.title}</option>`).join('');
  loadBallot();
}

async function loadBallot() {
  const id = document.getElementById('elecSelect').value;
  const res = await fetch(`/api/voting/elections/${id}/ballot`);
  const ballot = await res.json();
  const container = document.getElementById('ballot');
  container.innerHTML = '';
  ballot.forEach(item => {
    const sec = document.createElement('div');
    sec.className = 'ballot-section';
    sec.innerHTML = `<h3>${item.position.name}</h3>` +
      item.candidates.map(c => `
        <label>
          <input type="radio" name="pos_${item.position._id}" value="${c._id}">
          <img src="${c.imagePath}" alt="${c.name}"/> ${c.name}
        </label><br>
      `).join('');
    container.append(sec);
  });
}

document.getElementById('voteForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('elecSelect').value;
  const votes = Array.from(document.querySelectorAll('input[type=radio]:checked'))
    .map(inp => ({
      positionId: inp.name.split('_')[1],
      candidateId: inp.value
    }));
  await fetch('/api/voting/vote', {
    method:'POST',
    headers:{ ...authHeader2(), 'Content-Type':'application/json' },
    body: JSON.stringify({ electionId: id, votes })
  });
  alert('Thank you for voting!');
});

window.addEventListener('DOMContentLoaded', loadElections);
