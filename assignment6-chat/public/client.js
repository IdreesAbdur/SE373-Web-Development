const socket = io();

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("form");
const nameEl = document.getElementById("name");
const messageEl = document.getElementById("message");
const typingEl = document.getElementById("typing");

function addMessage({ user, text, time, isBot }) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${isBot ? "bot" : "user"}`;

  const meta = document.createElement("div");
  meta.className = "meta";

  const when = time ? new Date(time).toLocaleTimeString() : "";
  meta.textContent = `${user} • ${when}`;

  const body = document.createElement("div");
  body.className = "text";
  body.textContent = text;

  wrapper.appendChild(meta);
  wrapper.appendChild(body);

  chatEl.appendChild(wrapper);
  chatEl.scrollTop = chatEl.scrollHeight;
}

socket.on("chat_message", (msg) => addMessage(msg));

socket.on("system_message", (msg) => {
  addMessage({ user: "system", text: msg.text, time: msg.time, isBot: true });
});

socket.on("bot_typing", ({ isTyping }) => {
  if (isTyping) typingEl.classList.remove("hidden");
  else typingEl.classList.add("hidden");
});

formEl.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = nameEl.value.trim() || "Anonymous";
  const text = messageEl.value.trim();
  if (!text) return;

  socket.emit("chat_message", { user, text });
  messageEl.value = "";
  messageEl.focus();
});