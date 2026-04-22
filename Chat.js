import { supabase } from "./supabase.js";  
import { navigate } from "./app.js";  
  
let channel = null;  
  
export async function Chat(app, params) {  
  
  const { userId } = params;  
  const me = localStorage.getItem("user_id");  
  
  app.innerHTML = `  
   
   <div class="chat-screen chat-enter">
    <div class="chat-header">  
      <div id="back-btn">←</div>  
  
      <div id="chat-img" class="chat-img"></div>  
  
      
        <div id="chat-username" class="chat-username"></div>  
        <div id="chat-subtext" class="chat-subtext"></div>  
      
    </div>  
  
    <div id="chat-body" class="chat-body"></div>  
  
    <div class="chat-input-bar">  
      <input id="chat-input" type="text" placeholder="Escribir mensaje..." />  
      <button id="send-btn">Enviar</button>  
    </div>  
    </div>
  `;  
  
  document.getElementById("back-btn")  
    .addEventListener("click", () => {  
      if (channel) supabase.removeChannel(channel);  
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
      if (e.key === "Enter") sendMessage(chatId, me);  
    });  
}  
  
/* ===================== */  
/* HEADER */  
/* ===================== */  
async function loadChatHeader(userId) {  
  
  const me = localStorage.getItem("user_id");  
  
  const { data, error } = await supabase  
    .from("posts")  
    .select("imagenPerfil, username")  
    .eq("user_id", userId)  
    .limit(1);  
  
  if (error || !data || data.length === 0) return;  
  
  const user = data[0];  
  
  const img = document.getElementById("chat-img");  
  const username = document.getElementById("chat-username");  
  const subtext = document.getElementById("chat-subtext");  
  
  if (img) img.style.backgroundImage = `url(${user.imagenPerfil})`;  
  if (username) username.textContent = user.username;  
  
  const { data: likeData } = await supabase  
    .from("Likes")  
    .select("A3")  
    .or(  
      `and(Remitente.eq.${me},Destinatario.eq.${userId}),and(Remitente.eq.${userId},Destinatario.eq.${me})`  
    )  
    .limit(1);  
  
  if (subtext && likeData?.length > 0) {  
    subtext.textContent = likeData[0].A3 || "";  
  }  
}  
  
/* ===================== */  
/* CHAT ID */  
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
    .insert([{ user1_id: me, user2_id: other }])  
    .select()  
    .single();  
  
  return newChat.id;  
}  
  
/* ===================== */  
/* MENSAJES (AGRUPADOS POR FECHA) */  
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
  
  let lastKey = null;  
  
  messages.forEach(m => {  
  
    const key = getDateKey(m.created_at);  
  
    if (key !== lastKey) {  
      container.appendChild(createDateSeparator(key));  
      lastKey = key;  
    }  
  
    container.appendChild(renderMessage(m));  
  });  
}  
  
/* ===================== */  
/* RENDER MENSAJE */  
/* ===================== */  
function renderMessage(m) {  
  
  const me = localStorage.getItem("user_id");  
  
  const msg = document.createElement("div");  
  msg.className = m.sender_id === me ? "msg me" : "msg other";  
  
  const text = document.createElement("div");  
  text.className = "msg-text";  
  text.textContent = m.contenido;  
  
  const time = document.createElement("div");  
  time.className = "msg-time";  
  time.textContent = formatHour(m.created_at);  
  
  msg.appendChild(text);  
  msg.appendChild(time);  
  
  return msg;  
}  
  
/* ===================== */  
/* ENVIAR MENSAJE */  
/* ===================== */  
async function sendMessage(chatId, me) {  
  
  const input = document.getElementById("chat-input");  
  const text = input.value.trim();  
  
  if (!text) return;  
  
  input.value = "";  
  
  await supabase  
    .from("Mensajes")  
    .insert([{  
      chat_id: chatId,  
      sender_id: me,  
      contenido: text  
    }]);  
}  
  
/* ===================== */  
/* REALTIME */  
/* ===================== */  
function listenMessages(chatId) {  
  
  if (channel) supabase.removeChannel(channel);  
  
  channel = supabase  
    .channel(`chat:${chatId}`)  
    .on(  
      "postgres_changes",  
      {  
        event: "INSERT",  
        schema: "public",  
        table: "Mensajes",  
        filter: `chat_id=eq.${chatId}`  
      },  
      payload => {  
  
        const container = document.getElementById("chat-body");  
  
        const key = getDateKey(payload.new.created_at);  
  
        const lastSeparator = getLastDateSeparator();  
  
        // 🔥 SOLO si cambia el día real del DOM  
        if (!lastSeparator || lastSeparator.textContent !== key) {  
          container.appendChild(createDateSeparator(key));  
        }  
  
        container.appendChild(renderMessage(payload.new));  
  
        scrollToBottom();  
      }  
    )  
    .subscribe();  
}  
/* ===================== */  
/* FECHA HELPERS */  
/* ===================== */  
function getDateKey(timestamp) {  
  
  const date = new Date(timestamp);  
  const now = new Date();  
  
  if (date.toDateString() === now.toDateString()) return "HOY";  
  
  const yesterday = new Date();  
  yesterday.setDate(now.getDate() - 1);  
  
  if (date.toDateString() === yesterday.toDateString()) return "AYER";  
  
  const d = String(date.getDate()).padStart(2, "0");  
  const m = String(date.getMonth() + 1).padStart(2, "0");  
  const y = date.getFullYear();  
  
  return `${d}/${m}/${y}`;  
}  
  
function formatHour(timestamp) {  
  
  const date = new Date(timestamp);  
  
  // fuerza interpretación local correcta  
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);  
  
  const h = String(local.getHours()).padStart(2, "0");  
  const min = String(local.getMinutes()).padStart(2, "0");  
  
  return `${h}:${min}`;  
}  
function createDateSeparator(text) {  
  
  const div = document.createElement("div");  
  div.className = "date-separator";  
  div.textContent = text;  
  
  return div;  
}  
  
function createDateSeparatorIfNeeded(key) {  
  
  const container = document.getElementById("chat-body");  
  
  const last = container.lastChild;  
  
  if (!last || last.className !== "date-separator" || last.textContent !== key) {  
    return createDateSeparator(key);  
  }  
  
  return document.createDocumentFragment();  
}  
  
/* ===================== */  
/* SCROLL */  
/* ===================== */  
function scrollToBottom() {  
  
  const container = document.getElementById("chat-body");  
  
  if (container) {  
    container.scrollTop = container.scrollHeight;  
  }  
}  
  
function getLastDateSeparator() {  
  
  const container = document.getElementById("chat-body");  
  if (!container) return null;  
  
  const elements = container.querySelectorAll(".date-separator");  
  
  if (elements.length === 0) return null;  
  
  return elements[elements.length - 1];  
}  
  
  
  