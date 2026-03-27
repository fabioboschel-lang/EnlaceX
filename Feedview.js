import { supabase } from "./supabase.js";

export async function FeedView(app) {
  console.log("🚀 FeedView iniciado");

  app.innerHTML = `
    <div class="feed-container">
      <div id="imagesGrid" class="imagesGrid"></div>
    </div>
  `;

  const imagesGrid = document.getElementById("imagesGrid");
  const BATCH_SIZE = 30;
  const currentUserId = localStorage.getItem("user_id");

  if (!currentUserId) {
    alert("No hay user_id en localStorage");
    return;
  }

  try {
    // 🔹 POSTS
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("imagenPost, user_id")
      .not("imagenPost", "is", null)
      .order("updated_at", { ascending: false })
      .limit(BATCH_SIZE);

    if (postsError) throw postsError;

    // 🔹 LIKES
    const { data: likes, error: likesError } = await supabase
      .from("Likes")
      .select("id, Remitente, Destinatario, A1, A2, A3, Acepto");

    if (likesError) throw likesError;

    // 🔹 TEXTOS (solo para estado1 random)
    const { data: textos, error: textosError } = await supabase
      .from("Proposiciones")
      .select("Estado1");

    if (textosError) throw textosError;

    imagesGrid.innerHTML = "";

    // 🔥 RENDER POSTS
    (posts ?? []).forEach((post) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("post");
      wrapper.dataset.userId = post.user_id;

      // 🔹 Fondo borroso
      const postBg = document.createElement("div");
      postBg.classList.add("post-bg");
      postBg.style.backgroundImage = `url(${post.imagenPost})`;
      wrapper.appendChild(postBg);

      // 🔹 Imagen principal
      const img = document.createElement("img");
      img.classList.add("feed-img");
      img.src = post.imagenPost;

      // 🔹 Texto
      const textoDiv = document.createElement("div");
      textoDiv.classList.add("post-text");

      let estado1 = false;
      let estado2 = false;
      let estado3 = false;
      let textoFinal = "";

      // 🔹 RELACIONES ENTRE USUARIOS
      const relaciones = (likes ?? []).filter(
        (l) =>
          (l.Remitente === post.user_id && l.Destinatario === currentUserId) ||
          (l.Remitente === currentUserId && l.Destinatario === post.user_id)
      );

      // 🔴 ESTADO 3
      const filaEstado3 = relaciones.find((l) => l.Acepto === "sí");
      if (filaEstado3) {
        estado3 = true;
        textoFinal = filaEstado3.A3;
        wrapper.dataset.estado3 = "true";
      } else {
        // 🟡 ESTADO 2
        const filaEstado2 = relaciones.find(
          (l) =>
            l.Acepto === "no" &&
            l.Remitente === post.user_id &&
            l.Destinatario === currentUserId
        );
        if (filaEstado2) {
          estado2 = true;
          textoFinal = filaEstado2.A2;
          wrapper.dataset.estado2 = "true";
        } else {
          // 🔵 ESTADO 1
          estado1 = true;
          wrapper.dataset.estado1 = "true";

          const filaEstado1 = relaciones.find(
            (l) =>
              l.Remitente === currentUserId &&
              l.Destinatario === post.user_id
          );
          if (filaEstado1) {
            textoFinal = filaEstado1.A1;
            wrapper.dataset.hasGivenLike = "true";
          } else {
            const idx = Math.floor(Math.random() * textos.length);
            textoFinal = textos[idx]?.Estado1 || "";
            wrapper.dataset.hasGivenLike = "false";
          }
        }
      }

      // 🔹 TEXTO + CLASE
      textoDiv.textContent = textoFinal;
      const claseTexto = (textoFinal || "")
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9áéíóúüñ]/gi, '');
      textoDiv.classList.add(claseTexto);

      // 🔹 Botón de like como div con clases CSS
const btn = document.createElement("div");
btn.classList.add("like-btn");

// Asignar clase según estado
if (estado3) btn.classList.add("like-bloqueado");
else if (estado1 && wrapper.dataset.hasGivenLike === "true") btn.classList.add("like-activo");
else btn.classList.add("like-inactivo");

// Insertar SVG dentro del div
btn.innerHTML = `
<svg viewBox="0 0 512 512">
  <path d="M256 464s-16-14.8-70-68.3C88.5 331 32 271.5 32 192 32 120 88 64 160 64c48 0 80 32 96 64 16-32 48-64 96-64 72 0 128 56 128 128 0 79.5-56.5 139-154 203.7-54 53.5-70 68.3-70 68.3z"/>
</svg>
`;


      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      wrapper.appendChild(textoDiv);

      imagesGrid.appendChild(wrapper);
    });

  } catch (err) {
    console.error("💥 Error general:", err);
  }
}

// 🔥 TOGGLE LIKE
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".like-btn");
if (!btn) return;

const post = btn.closest(".post");
  const destinatario = post?.dataset.userId;
  const remitente = localStorage.getItem("user_id");

  const estado1 = post?.dataset.estado1 === "true";
  const estado2 = post?.dataset.estado2 === "true";
  const estado3 = post?.dataset.estado3 === "true";

  if (!post || !remitente || !destinatario) return;
  if (post.dataset.liking === "true") return;

  post.dataset.liking = "true";
  

  try {
    // 🔵 ESTADO 1
    if (estado1) {
      const hasGivenLike = post.dataset.hasGivenLike === "true";

      if (hasGivenLike) {
        btn.classList.remove("like-activo");
        btn.classList.add("like-inactivo");
        post.dataset.hasGivenLike = "false";

        await supabase
          .from("Likes")
          .delete()
          .eq("Remitente", remitente)
          .eq("Destinatario", destinatario);

      } else {
        const textoActual = post.querySelector(".post-text")?.textContent;

        await supabase.from("Likes").insert([{
          Remitente: remitente,
          Destinatario: destinatario,
          A1: textoActual,
          Acepto: "no"
        }]);

        btn.classList.remove("like-inactivo");
        btn.classList.add("like-activo");
        post.dataset.hasGivenLike = "true";
      }

    // 🟡 ESTADO 2 → MATCH
    } else if (estado2) {
      const { data: filas } = await supabase
        .from("Likes")
        .select("*")
        .eq("Remitente", destinatario)
        .eq("Destinatario", remitente)
        .limit(1);

      if (!filas || filas.length === 0) return;

      await supabase
        .from("Likes")
        .update({ Acepto: "sí" })
        .eq("id", filas[0].id);

      btn.classList.remove("like-inactivo");
      btn.classList.add("like-bloqueado");
      post.dataset.estado2 = "false";
      post.dataset.estado3 = "true";

      const textDiv = post.querySelector(".post-text");
      if (textDiv && filas[0].A3) {
        textDiv.textContent = filas[0].A3;
        const nuevaClase = filas[0].A3
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9áéíóúüñ]/gi, '');
        textDiv.className = "post-text " + nuevaClase;
      }
      return;

    // 🔴 ESTADO 3
    } else if (estado3) {
      btn.classList.remove("like-inactivo", "like-activo");
      btn.classList.add("like-bloqueado");
      return;
    }

  } catch (err) {
    console.error("💥 Error en toggle like:", err);
  } finally {
    post.dataset.liking = "false";
  }
});

// 🔹 Doble tap para corazón grande (mantener igual)
document.addEventListener("dblclick", async (e) => {
  if (!e.target.classList.contains("feed-img")) return;

  const img = e.target;
  const wrapper = img.closest(".post");
  if (!wrapper) return;

  const destinatario = wrapper.dataset.userId;
  const remitente = localStorage.getItem("user_id");

  const estado1 = wrapper.dataset.estado1 === "true";
  const estado2 = wrapper.dataset.estado2 === "true";
  const estado3 = wrapper.dataset.estado3 === "true";

  const hasGivenLike = wrapper.dataset.hasGivenLike === "true";
  const btn = wrapper.querySelector(".like-btn");

  crearBigHeart(wrapper, img, e);

  if (estado1 && !hasGivenLike) {
    wrapper.dataset.hasGivenLike = "true";
    btn.classList.remove("like-inactivo");
    btn.classList.add("like-activo");

    if (wrapper.dataset.liking === "true") return;
    wrapper.dataset.liking = "true";

    try {
      const textoActual = wrapper.querySelector(".post-text")?.textContent;

      await supabase.from("Likes").insert([{
        Remitente: remitente,
        Destinatario: destinatario,
        A1: textoActual,
        Acepto: "no"
      }]);
    } catch (err) {
      console.error("❌ Error insert dbltap:", err);
      wrapper.dataset.hasGivenLike = "false";
      btn.classList.remove("like-activo");
      btn.classList.add("like-inactivo");
    } finally {
      wrapper.dataset.liking = "false";
    }

  } else if (estado2) {
    if (wrapper.dataset.liking === "true") return;
    wrapper.dataset.liking = "true";

    const textDiv = wrapper.querySelector(".post-text");

    try {
      const { data: filas } = await supabase
        .from("Likes")
        .select("*")
        .eq("Remitente", destinatario)
        .eq("Destinatario", remitente)
        .limit(1);

      if (filas && filas.length > 0) {
        await supabase
          .from("Likes")
          .update({ Acepto: "sí" })
          .eq("id", filas[0].id);

        btn.classList.remove("like-inactivo", "like-activo");
        btn.classList.add("like-bloqueado");
        wrapper.dataset.estado2 = "false";
        wrapper.dataset.estado3 = "true";

        if (textDiv && filas[0].A3) {
          textDiv.textContent = filas[0].A3;
          const nuevaClase = filas[0].A3
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9áéíóúüñ]/gi, '');
          textDiv.className = "post-text " + nuevaClase;
        }
      }
    } catch (err) {
      console.error("❌ Error match dbltap:", err);
    } finally {
      wrapper.dataset.liking = "false";
    }
  }
});

// 🔹 Función crearBigHeart se mantiene idéntica a tu versión actual





















function crearBigHeart(wrapper, img, e) {
  const rect = img.getBoundingClientRect();

  // 🔹 Punto inicial: justo donde se hizo el doble tap
  const xStart = e.clientX - rect.left;
  const yStart = e.clientY - rect.top ;

  // 🔹 Posición final: unos píxeles arriba del toque (disparo hacia arriba)
  const xEnd = xStart - 50;      
  const yEnd = yStart - 200; // ajustar píxeles hacia arriba según gusto

  const bigHeart = document.createElement("div");
  bigHeart.classList.add("bigHeartEffect");
  // Lo posicionamos en el punto inicial
  bigHeart.style.left = `${xStart}px`;
  bigHeart.style.top = `${yStart}px`;

  // 🔹 Combinaciones de gradientes optimizadas
  const gradients = [
    ["#FF0000", "#FFA500"],   // rojo → naranja
    ["#FF0000", "#FF69B4"],   // rojo → rosa
    ["#FF69B4", "#8A2BE2"],   // rosa → violeta
    ["#8A2BE2", "#FF00FF"],   // violeta → magenta
    ["#FFA500", "#FF69B4"],   // naranja → rosa
    ["#FF00FF", "#FF4500"],   // magenta → rojo
    ["#FF0000", "#FF7F50"],   // rojo → coral
    ["#FF69B4", "#FF7F50"],   // rosa → coral
    ["#8A2BE2", "#1E90FF"],   // violeta → azul
    ["#1E90FF", "#00FFFF"]    // azul → celeste
  ];

  // Direcciones posibles de gradiente
  const directions = [
    ["0%", "0%", "0%", "100%"],  // arriba → abajo
    ["0%", "100%", "0%", "0%"],  // abajo → arriba
    ["0%", "0%", "100%", "0%"],  // izquierda → derecha
    ["100%", "0%", "0%", "0%"]   // derecha → izquierda
  ];

  const gradientColors = gradients[Math.floor(Math.random() * gradients.length)];
  const dir = directions[Math.floor(Math.random() * directions.length)];
  const gradientId = "gradientHeart-" + Date.now();

  bigHeart.innerHTML = `
    <svg viewBox="0 0 512 512">
      <defs>
        <linearGradient id="${gradientId}" x1="${dir[0]}" y1="${dir[1]}" x2="${dir[2]}" y2="${dir[3]}">
          <stop offset="0%" stop-color="${gradientColors[0]}"/>
          <stop offset="100%" stop-color="${gradientColors[1]}"/>
        </linearGradient>
      </defs>
      <path fill="url(#${gradientId})" d="M256 464s-16-14.8-70-68.3C88.5 331 32 271.5 32 192 32 120 88 64 160 64c48 0 80 32 96 64 16-32 48-64 96-64 72 0 128 56 128 128 0 79.5-56.5 139-154 203.7-54 53.5-70 68.3-70 68.3z"/>
    </svg>
  `;

  wrapper.appendChild(bigHeart);
  void bigHeart.offsetWidth;

  // 🔹 Animación: disparo desde el toque hacia arriba + vibración 20° + desaparición
  // 🔹 Animación: disparo desde el toque hacia arriba + vibración 20° + estabilización
// 🔹 Animación: vibración rápida + estabilización + desvanecimiento
bigHeart.animate(
  [
    { transform: `translate(px,px) scale(1) rotate(30deg)`, opacity: 0.5 },
    // Disparo + inicio de vibración
    { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(-25deg)`, opacity: 1, offset: 0.05 },
    { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(20deg)`, offset: 0.1 },
    { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(-15deg)`, offset: 0.18 },
    { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(15deg)`, offset: 0.28 },
    // 🔹 Fin de vibración y estabilización
    { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(0deg)`, opacity: 1, offset: 0.4 },
    // 🔹 Tiempo estático restante hasta desvanecerse
    { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(0deg)`, opacity: 0.8, offset: 0.7 },
    
    
         { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(0deg)`, opacity: 0.6, offset: 0.8 },
         
         
         
     { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(0deg)`, opacity: 0.4, offset: 0.9 },
     
      { transform: `translate(${xEnd - xStart}px, ${yEnd - yStart}px) scale(1) rotate(0deg)`, opacity: 0, offset: 1 }
         
         
         
    



       
       
         
  ],
  {
    duration: 1500, // duración total sin cambiar
    easing: "ease-out",
    fill: "forwards"
  }
);
}