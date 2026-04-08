import { supabase } from "./supabase.js";

export async function Houseview(app) {

  console.log("🚀 Houseview iniciado");

  app.innerHTML = `
  
  <a href="https://mpago.la/21xn9GS" target="_blank" class="paybuttom">
    <h1 class="paytext">Obtener ticket</h1>
  </a>

  <div class="countdown-container">
    <p class="countdown-label">Empieza en</p>
    <p id="countdown" class="countdown-timer"></p>
  </div>

  <div class="Flyerbox">
    <img id="flyerimg" class="flyerimg" src="" alt="Flyer del evento">
  </div>

  <div id="match-scroll" class="match-scroll"></div>
  `;

  console.log("✅ HTML renderizado");

  await startCountdownFromDB();
  await loadFlyer();
  await renderMatches();
}

/* ===================== */
/* ⏳ COUNTDOWN EVENTO */
/* ===================== */
async function startCountdownFromDB() {
  console.log("⏳ Iniciando countdown");

  const countdownEl = document.getElementById("countdown");
  console.log("📍 countdownEl:", countdownEl);

  if (!countdownEl) return;

  const { data, error } = await supabase
    .from("Eventos")
    .select("Fecha")
    .limit(1)
    .single();

  console.log("📦 Evento data:", data);
  console.log("❌ Evento error:", error);

  if (error) {
    countdownEl.textContent = "Error";
    return;
  }

  const eventDate = new Date(data.Fecha);
  console.log("📅 Fecha evento:", eventDate);

  const interval = setInterval(() => {
    const now = new Date();
    let time = Math.floor((eventDate - now) / 1000);

    if (time <= 0) {
      clearInterval(interval);
      countdownEl.textContent = "0D 00H 00M 00S";
      return;
    }

    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    countdownEl.textContent =
      `${days}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M ${seconds.toString().padStart(2, '0')}S`;

  }, 1000);
}

/* ===================== */
/* 🖼 FLYER */
/* ===================== */
async function loadFlyer() {
  console.log("🖼 Cargando flyer");

  const { data, error } = await supabase
    .from("Eventos")
    .select("Flyer")
    .limit(1);

  console.log("📦 Flyer data:", data);
  console.log("❌ Flyer error:", error);

  if (error || !data || data.length === 0) return;

  const fileName = data[0].Flyer;
  console.log("📁 Nombre archivo:", fileName);

  const { data: publicData } = supabase
    .storage
    .from("images")
    .getPublicUrl(fileName);

  console.log("🌐 URL pública:", publicData);

  const img = document.getElementById("flyerimg");
  console.log("📍 img element:", img);

  if (img) img.src = publicData.publicUrl;
}

/* ===================== */
/* 🔥 MATCHES */
/* ===================== */
async function renderMatches() {
  console.log("🔥 renderMatches START");

  const userId = localStorage.getItem("user_id"); // ✅ clave correcta
  const container = document.getElementById("match-scroll");

  console.log("👤 userId:", userId);
  console.log("📦 container:", container);

  if (!userId) {
    console.error("❌ user_id no existe en localStorage");
    return;
  }

  if (!container) {
    console.error("❌ #match-scroll no existe en el DOM");
    return;
  }

  /* ===================== */
  /* 🔥 TRAER LIKES */
  /* ===================== */

  const { data: likes, error } = await supabase
    .from("Likes")
    .select('"A4", "Remitente", "Destinatario", "Acepto"');

  if (error) {
    console.error("❌ ERROR SUPABASE (Likes):", {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }

  if (!likes || likes.length === 0) {
    console.error("❌ No hay likes en la tabla");
    return;
  }

  console.log("📦 Likes:", likes.length);

  /* ===================== */
  /* 🔍 FILTRO USUARIO */
  /* ===================== */

  const filtered = likes.filter(l =>
    String(l.Remitente) === String(userId) ||
    String(l.Destinatario) === String(userId)
  );

  if (filtered.length === 0) {
    console.error("❌ El user_id NO aparece en Likes");
    console.log("👉 user_id:", userId);
    console.log("👉 ejemplo Likes:", likes.slice(0, 3));
    return;
  }

  console.log("✅ Filtered:", filtered.length);

  /* ===================== */
  /* ✅ MATCHES */
  /* ===================== */

  const matches = filtered.filter(l =>
    String(l.Acepto)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") === "si"
  );

  if (matches.length === 0) {
    console.warn("⚠️ No hay matches (Acepto ≠ sí)");
    console.log("👉 valores:", filtered.map(l => l.Acepto));
    return;
  }

  console.log("✅ Matches:", matches.length);

  /* ===================== */
  /* 📊 AGRUPAR */
  /* ===================== */

  const groups = {};

  matches.forEach(l => {
    const key = l.A4;

    if (!key) {
      console.warn("⚠️ A4 undefined:", l);
      return;
    }

    if (!groups[key]) {
      groups[key] = [];
    }

    const otherUser =
      String(l.Remitente) === String(userId)
        ? l.Destinatario
        : l.Remitente;

    groups[key].push(otherUser);
  });

  console.log("📊 Groups:", groups);

  if (Object.keys(groups).length === 0) {
    console.error("❌ No se generaron grupos");
    return;
  }

  /* ===================== */
  /* 🎨 RENDER */
  /* ===================== */

  for (const a4 in groups) {
    const userIds = [...new Set(groups[a4])];
    const count = userIds.length;

    

    const text = `${a4} ${count} personas`;

    /* ===================== */
    /* 👤 TRAER USERS */
    /* ===================== */

    const { data: users, error: userError } = await supabase
      .from("posts") // ✅ CORREGIDO (minúscula)
      .select('"user_id", "imagenPerfil"')
      .in("user_id", userIds);

    if (userError) {
      console.error("❌ ERROR SUPABASE (posts):", {
        message: userError.message,
        code: userError.code,
        details: userError.details,
        hint: userError.hint
      });
      continue;
    }

    if (!users) {
      console.error("❌ users es null");
      continue;
    }

    if (users.length === 0) {
      console.warn("⚠️ No se encontraron usuarios en posts");
      console.log("👉 userIds buscados:", userIds);
      continue;
    }

  

    /* ===================== */
    /* 🎨 CREAR CARD */
    /* ===================== */

    const card = document.createElement("div");
    card.className = "match-card";

    const title = document.createElement("div");
    title.className = "match-text";
    title.textContent = text;

    const imgContainer = document.createElement("div");
    imgContainer.className = "match-images";

    users.forEach(u => {
      if (!u.imagenPerfil) {
        console.warn("⚠️ Usuario sin imagenPerfil:", u);
      }

      const img = document.createElement("img");
      img.className = "match-img";
      img.src = u.imagenPerfil || "";

      imgContainer.appendChild(img);
    });

    card.appendChild(title);
    card.appendChild(imgContainer);
    container.appendChild(card);

  }

  console.log("🏁 renderMatches END");
                           }
