import { supabase } from "./supabase.js";
import { navigate } from "./app.js";

let channel = null; // 🔥 evitar duplicaciones realtime

export async function Chat(app, params) {

  const { userId } = params;
  const me = localStorage.getItem("user_id");

  app.innerHTML = `
    <div class="chat-header">
      <div id="back-btn">←</div>
      <div id="chat-img" class="chat-img"></div>
      <div id="chat-username" class="chat-username"></div>
    </div>

    <div id="chat-body" class="chat-body"></div>

    <div class="chat-input-bar">
      <input id="chat-input" type="text" placeholder="Escribir mensaje..." />
      <button id="send-btn">Enviar</button>
    </div>
  `;

  document.getElementById("back-btn")
    .addEventListener("click", () => {
      if (channel) supabase.removeChannel(channel); // 🔥 cleanup
      navigate("mensajes");
    });

  await loadChatHeader(userId);

  const chatId = await getOrCreateChat(me, userId);

  await loadMessages(chatId);

  scrollToBottom();

  listenMessages(chatId);

  document.getElementById("send-btn")
    .addEventListener("click", () => sendMessage(chatId, me));

  document.getElementById("chat-input")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage(chatId, me);
      }
    });
}

/* ===================== */
/* 👤 HEADER */
/* ===================== */
async function loadChatHeader(userId) {

  const { data, error } = await supabase
    .from("posts")
    .select("imagenPerfil, username")
    .eq("user_id", userId)
    .limit(1);

  if (error || !data || data.length === 0) return;

  const user = data[0];

  const img = document.getElementById("chat-img");
  const username = document.getElementById("chat-username");

  if (img) img.style.backgroundImage = `url(${user.imagenPerfil})`;
  if (username) username.textContent = user.username;
}

/* ===================== */
/* 🔍 GET OR CREATE CHAT */
/* ===================== */
async function getOrCreateChat(me, other) {

  const { data: chats } = await supabase
    .from("Chats")
    .select("*")
    .or(
      `and(user1_id.eq.${me},user2_id.eq.${other}),and(user1_id.eq.${other},user2_id.eq.${me})`
    )
    .limit(1);

  if (chats && chats.length > 0) return chats[0].id;

  const { data: newChat } = await supabase
    .from("Chats")
    .insert([
      {
        user1_id: me,
        user2_id: other
      }
    ])
    .select()
    .single();

  return newChat.id;
}

/* ===================== */
/* 📥 CARGAR MENSAJES */
/* ===================== */
async function loadMessages(chatId) {

  const { data: messages, error } = await supabase
    .from("Mensajes")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error || !messages) return;

  const container = document.getElementById("chat-body");
  container.innerHTML = "";

  messages.forEach(m => renderMessage(m));
}

/* ===================== */
/* ✉️ RENDER MENSAJE */
/* ===================== */
function renderMessage(m) {

  const me = localStorage.getItem("user_id");
  const container = document.getElementById("chat-body");

  const msg = document.createElement("div");
  msg.className = m.sender_id === me ? "msg me" : "msg other";

  msg.textContent = m.contenido; // ✅ FIX

  container.appendChild(msg);

  scrollToBottom();
}

/* ===================== */
/* 🚀 ENVIAR MENSAJE */
/* ===================== */
async function sendMessage(chatId, me) {

  const input = document.getElementById("chat-input");
  const text = input.value.trim();

  if (!text) return;

  input.value = "";

  await supabase
    .from("Mensajes")
    .insert([
      {
        chat_id: chatId,
        sender_id: me,
        contenido: text // ✅ FIX
      }
    ]);
}

/* ===================== */
/* ⚡ TIEMPO REAL */
/* ===================== */
function listenMessages(chatId) {

  if (channel) {
    supabase.removeChannel(channel); // 🔥 evita duplicados
  }

  channel = supabase
    .channel("chat-" + chatId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Mensajes",
        filter: `chat_id=eq.${chatId}`
      },
      payload => {
        renderMessage(payload.new);
      }
    )
    .subscribe();
}

/* ===================== */
/* ⬇️ SCROLL */
/* ===================== */
function scrollToBottom() {
  const container = document.getElementById("chat-body");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}