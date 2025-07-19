
// public/js/modules/communication.js
SMS.protectPage();

document.addEventListener('DOMContentLoaded', () => {
  loadConversations();
  document.getElementById('sendBtn')
    .addEventListener('click', sendMessage);
  autoResizeInput();
});

let currentConv = null;
const convCache = {};

async function loadConversations() {
  try {
    const list = await SMS.apiRequest('/communication');
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    list.forEach(c => {
      const div = document.createElement('div');
      div.className = 'contact-item';
      div.textContent = c.name;
      div.onclick = () => selectConversation(c._id, div);
      sidebar.appendChild(div);
    });
    if (list[0]) selectConversation(list[0]._id, sidebar.firstChild);
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
}

async function selectConversation(id, elem) {
  currentConv = id;
  document.querySelectorAll('.contact-item')
    .forEach(d => d.classList.remove('active'));
  elem.classList.add('active');
  if (!convCache[id]) {
    convCache[id] = (await SMS.apiRequest(`/communication/${id}`)).messages;
  }
  renderMessages(convCache[id]);
}

function renderMessages(msgs) {
  const c = document.getElementById('messagesContainer');
  c.innerHTML = '';
  msgs.forEach(m => {
    const div = document.createElement('div');
    div.className = `message ${m.sender==='You'?'sent':''}`;
    div.innerHTML = `
      <p><strong>${m.sender}</strong> <em>${m.time}</em></p>
      <p>${m.text}</p>`;
    c.appendChild(div);
  });
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text  = input.value.trim();
  if (!text || !currentConv) return;
  const time  = new Date().toLocaleString();
  try {
    await SMS.apiRequest(`/communication/${currentConv}/send`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
    convCache[currentConv].push({ sender:'You', time, text });
    renderMessages(convCache[currentConv]);
    input.value = '';
  } catch (err) {
    SMS.showNotification(err.message,'error');
  }
}

function autoResizeInput() {
  const inp = document.getElementById('messageInput');
  inp.addEventListener('input', () => {
    inp.style.height = 'auto';
    inp.style.height = Math.min(inp.scrollHeight, 100) + 'px';
  });
}
