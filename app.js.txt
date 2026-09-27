const messagesEl = document.getElementById('messages');
const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChat');
const welcome = document.getElementById('welcome');
const statusPill = document.getElementById('statusPill');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

let history = [];
let busy = false;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function addMessage(role, text, meta = '') {
  const item = document.createElement('article');
  item.className = `message ${role}`;
  item.innerHTML = `
    <div class="avatar">${role === 'assistant' ? 'C' : 'You'}</div>
    <div class="message-body">
      <div class="message-meta">${role === 'assistant' ? 'CRAFT' : 'YOU'}${meta ? ` · ${escapeHtml(meta)}` : ''}</div>
      <div class="message-text">${escapeHtml(text).replaceAll('\n', '<br>')}</div>
    </div>`;
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setBusy(value) {
  busy = value;
  sendBtn.disabled = value;
  sendBtn.textContent = value ? 'Thinking…' : 'Send ↗';
  input.disabled = value;
}

async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    if (data.aiConfigured) {
      statusPill.textContent = 'AI ready';
      statusPill.classList.add('ready');
    } else {
      statusPill.textContent = 'Add API key';
    }
  } catch {
    statusPill.textContent = 'Server offline';
  }
}

async function sendMessage(text) {
  if (!text.trim() || busy) return;

  const userText = text.trim();
  welcome?.classList.add('hidden');
  addMessage('user', userText);
  history.push({ role: 'user', content: userText });
  input.value = '';
  input.style.height = 'auto';
  setBusy(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    addMessage('assistant', data.reply, data.model || 'AI');
    history.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    addMessage('assistant', `Connection note: ${error.message}`);
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
});

document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => sendMessage(button.dataset.prompt));
});

newChatBtn.addEventListener('click', () => {
  history = [];
  messagesEl.innerHTML = '';
  welcome?.classList.remove('hidden');
  input.value = '';
  input.focus();
  sidebar.classList.remove('open');
});

menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

checkHealth();
input.focus();
