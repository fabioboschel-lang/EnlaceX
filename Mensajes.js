import { supabase } from "./supabase.js";
import { navigate } from "./app.js";

export async function Mensajes(app) {

  app.innerHTML = `
    <div id="cards-container" class="cards-container"></div>

    <div id="bottom-bar" class="bottom-bar">
      <div class="profile-section">
        <div id="profile-img" class="profile-img"></div>
        <span class="profile-text">Editar perfil</span>
      </div>
    </div>
  `;

  document.getElementById("bottom-bar")
    .addEventListener("click", () => navigate("profile"));

  await loadProfile();
  await loadCards();
}

/* ===================== */
/* 🔥 CARDS CON SUBTEXTO (A3) */
/* ===================== */
async function loadCards() {
  const userId = localStorage.getItem("user_id");
  const container = document.getElementById("cards-container");

  if (!userId || !container) return;

  /* ===================== */
  /* 🔥 TRAER LIKES */
  /* ===================== */
  const { data: likes, error } = await supabase
    .from("Likes")
    .select('"Remitente", "Destinatario", "Acepto", "A3"');

  if (error || !likes) {
    console.error("Error Likes:", error);
    return;
  }

  /* ===================== */
  /* 🔍 FILTRO 1: usuario */
  /* ===================== */
  const related = likes.filter(l =>
    String(l.Remitente) === String(userId) ||
    String(l.Destinatario) === String(userId)
  );

  /* ===================== */
  /* 🔍 FILTRO 2: acepto = si */
  /* ===================== */
  const matches = related.filter(l =>
    String(l.Acepto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") === "si"
  );

  if (matches.length === 0) {
    container.innerHTML = "<p style='color:white'>Sin matches</p>";
    return;
  }

  /* ===================== */
  /* 🔁 ARMAR PARES (ID + A3) */
  /* ===================== */
  const pairs = matches.map(l => {
    const otherUser =
      String(l.Remitente) === String(userId)
        ? l.Destinatario
        : l.Remitente;

    return {
      userId: otherUser,
      a3: l.A3
    };
  });

  /* ===================== */
  /* 👤 TRAER USERS */
  /* ===================== */
  const uniqueIds = [...new Set(pairs.map(p => p.userId))];

  const { data: users, error: userError } = await supabase
    .from("posts")
    .select("user_id, imagenPerfil, username")
    .in("user_id", uniqueIds);

  if (userError || !users) {
    console.error("Error users:", userError);
    return;
  }

  /* ===================== */
  /* 🔗 MAPA DE USERS */
  /* ===================== */
  const userMap = {};
  users.forEach(u => {
    userMap[u.user_id] = u;
  });

  /* ===================== */
  /* 🎨 RENDER */
  /* ===================== */
  container.innerHTML = "";

  pairs.forEach(p => {
    const user = userMap[p.userId];
    if (!user) return;

    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("div");
    img.className = "card-img";
    img.style.backgroundImage = `url(${user.imagenPerfil || ""})`;

    const textContainer = document.createElement("div");

    const username = document.createElement("div");
    username.className = "card-text";
    username.textContent = user.username || "Sin nombre";

    const subtext = document.createElement("div");
    subtext.className = "card-subtext";
    subtext.textContent = p.a3 || "";

    textContainer.appendChild(username);
    textContainer.appendChild(subtext);

    card.appendChild(img);
    card.appendChild(textContainer);

    card.addEventListener("click", () => {
  navigate("chat", { userId: p.userId });
});
    container.appendChild(card);
  });
}

/* ===================== */
/* 👤 PERFIL */
/* ===================== */
async function loadProfile() {
  const userId = localStorage.getItem("user_id");

  if (!userId) return;

  const { data, error } = await supabase
    .from("posts")
    .select("imagenPerfil")
    .eq("user_id", userId)
    .limit(1);

  if (error || !data || data.length === 0) return;

  const imgDiv = document.getElementById("profile-img");
  if (!imgDiv) return;

  const imageUrl = data[0].imagenPerfil;
  if (!imageUrl) return;

  imgDiv.style.backgroundImage = `url(${imageUrl})`;
}