const API_URL = 'http://127.0.0.1:8000/chat/';
const POLL_INTERVAL = 3000;

const messagesEl = document.getElementById('messages');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const form = document.getElementById('chat-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const sendButton = form.querySelector('button');

nameInput.value = localStorage.getItem('chatName') || '';

async function loadMessages() {
  try {
    const response = await fetch(API_URL);
    const chats = await response.json();
    renderMessages(chats);
    statusEl.textContent = 'Verbunden';
  } catch (error) {
    statusEl.textContent = 'Keine Verbindung zum Server';
    console.error('Fehler beim Laden der Nachrichten:', error);
  }
}

function renderMessages(chats) {
  const nearBottom =
    messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 48;

  messagesEl.replaceChildren();

  if (chats.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'chat__empty';
    empty.textContent = 'Noch keine Nachrichten. Schreib die erste!';
    messagesEl.appendChild(empty);
    return;
  }

  chats.forEach((chat) => messagesEl.appendChild(createMessage(chat)));

  if (nearBottom) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

function createMessage(chat) {
  const item = document.createElement('li');
  item.className = 'message';
  if (chat.name === nameInput.value.trim()) {
    item.classList.add('message--own');
  }

  const meta = document.createElement('div');
  meta.className = 'message__meta';

  const name = document.createElement('span');
  name.className = 'message__name';
  name.textContent = chat.name;

  const time = document.createElement('span');
  time.textContent = new Date(chat.created_at).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const text = document.createElement('p');
  text.className = 'message__text';
  text.textContent = chat.message;

  meta.append(name, time);
  item.append(meta, text);
  return item;
}

async function sendMessage(event) {
  event.preventDefault();
  errorEl.hidden = true;
  sendButton.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value,
        message: messageInput.value,
      }),
    });

    if (!response.ok) {
      showError(await response.json());
      return;
    }

    localStorage.setItem('chatName', nameInput.value.trim());
    messageInput.value = '';
    await loadMessages();
    messagesEl.scrollTop = messagesEl.scrollHeight;
  } catch (error) {
    showError({ error: 'Server nicht erreichbar' });
    console.error('Fehler beim Senden:', error);
  } finally {
    sendButton.disabled = false;
    messageInput.focus();
  }
}

function showError(data) {
  const texts = data.errors ? Object.values(data.errors).flat() : [data.error];
  errorEl.textContent = texts.join(' ');
  errorEl.hidden = false;
}

form.addEventListener('submit', sendMessage);

loadMessages().then(() => {
  messagesEl.scrollTop = messagesEl.scrollHeight;
});
setInterval(loadMessages, POLL_INTERVAL);
