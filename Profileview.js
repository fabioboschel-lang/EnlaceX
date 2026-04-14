import { supabase } from "./supabase.js";
import { navigate } from "./app.js";

export function ProfileView(app) {

  app.innerHTML = `
  <div class="container">

<button class="cta" id="saveBtn">guardar</button>

    <div class="circular-selector" id="circularSelector">
      <img id="circularImg">
    </div>

    <input type="file" id="circularInput" accept="image/*">

    <input type="text"  class="username-input" id="usernameInput">

    <div class="rect-selector" id="rectSelector">
      <img id="rectImg">
    </div>

    <input type="file" id="rectInput" accept="image/*">
    
    <div class="back-arrow" id="backArrow">&#8592;</div>

  </div>
  `;
  const volver = document.getElementById("backArrow");
  volver.addEventListener("click", () => {
    navigate("mensajes");
  });
  
  
  // Elementos
  const circularSelector = document.getElementById('circularSelector');
  const circularImg = document.getElementById('circularImg');
  const circularInput = document.getElementById('circularInput');

  const rectSelector = document.getElementById('rectSelector');
  const rectImg = document.getElementById('rectImg');
  const rectInput = document.getElementById('rectInput');

  const usernameInput = document.getElementById('usernameInput');
  const saveBtn = document.getElementById('saveBtn');

  // Obtener o crear user_id
  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("user_id", userId);
  }

  // Click en el div abre el input
  circularSelector.onclick = () => circularInput.click();
  rectSelector.onclick = () => rectInput.click();

  // Subida automática de la imagen de perfil (circular)
circularInput.addEventListener('change', async () => {

  alert("1️⃣ Evento change detectado");

  const file = circularInput.files[0];
  if (!file) {
    alert("❌ No se detectó archivo");
    return;
  }

  alert("2️⃣ Archivo detectado: " + file.name);

  const filePath = `images/${Date.now()}-${file.name}`;
  alert("3️⃣ Ruta generada: " + filePath);

  try {

    alert("4️⃣ Intentando subir al storage...");

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      alert("❌ Error subiendo imagen: " + uploadError.message);
      return;
    }

    alert("5️⃣ Imagen subida correctamente");

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    const imageUrl = data.publicUrl;

    alert("6️⃣ URL generada: " + imageUrl);

    alert("7️⃣ user_id enviado: " + userId);

    alert("8️⃣ Intentando guardar en tabla posts...");

    const { data: dbData, error: dbError } = await supabase
      .from("posts")
      .upsert(
        { user_id: userId, imagenPerfil: imageUrl },
        { onConflict: "user_id" }
      );

    if (dbError) {
      alert("❌ Error guardando en la tabla: " + dbError.message);
      return;
    }

    alert("9️⃣ Guardado en base de datos correctamente");

    circularImg.src = imageUrl;
    localStorage.setItem("imagenPerfil", imageUrl);

    alert("✅ Flujo completo funcionando");

  } catch (err) {

    alert("💥 Error inesperado: " + err.message);

  }

});
     
  // Subida automática de la imagen del post (rectangular)
  rectInput.addEventListener('change', async () => {
    const file = rectInput.files[0];
    if (!file) return;

    const filePath = `images/${Date.now()}-${file.name}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        alert("Error subiendo imagen del post: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      const imageUrl = data.publicUrl;

      await supabase
  .from("posts")
  .upsert(
    { 
      user_id: userId, 
      imagenPost: imageUrl,
      updated_at: new Date()
    },
    { onConflict: "user_id" }
  );

      rectImg.src = imageUrl;
      localStorage.setItem("imagenPost", imageUrl);

      alert("Imagen del post subida y guardada 😎");

    } catch (err) {
      alert("Error inesperado al subir imagen del post: " + err.message);
    }
  });

  // Guardar nombre de usuario con el botón
  saveBtn.onclick = async () => {

  alert("1️⃣ Botón guardar presionado");

  const username = usernameInput.value.trim();

  alert("2️⃣ Username leído: " + username);

  if (!username) {
    alert("❌ Username vacío");
    return;
  }

  alert("3️⃣ user_id enviado: " + userId);

  try {

    alert("4️⃣ Ejecutando upsert...");

    const { error } = await supabase
      .from("posts")
      .upsert(
        { user_id: userId, username: username },
        { onConflict: "user_id" }
      );

    if (error) {
      alert("❌ Error guardando: " + error.message);
      return;
    }

    alert("5️⃣ Upsert ejecutado correctamente");

    // 🔎 Verificar qué quedó guardado en la tabla
    alert("6️⃣ Consultando la base de datos...");

    const { data, error: readError } = await supabase
      .from("posts")
      .select("username")
      .eq("user_id", userId)
      .single();

    if (readError) {
      alert("❌ Error leyendo la fila: " + readError.message);
      return;
    }

    alert("7️⃣ Username en base de datos: " + data.username);

    localStorage.setItem("username", username);

    alert("✅ Username guardado y confirmado en la tabla posts");

  } catch (err) {

    alert("💥 Error inesperado: " + err.message);

  }

};

  // Cargar datos previos del usuario desde localStorage
  function loadProfile() {
    const savedCircular = localStorage.getItem("imagenPerfil");
    const savedRect = localStorage.getItem("imagenPost");
    const savedUsername = localStorage.getItem("username");

    if (savedCircular) circularImg.src = savedCircular;
    if (savedRect) rectImg.src = savedRect;
    if (savedUsername) usernameInput.value = savedUsername;
  }


usernameInput.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {        // Detecta Enter/Go/Done
    e.preventDefault();           // Evita comportamiento por defecto (como saltar de línea)
    usernameInput.blur();         // Fuerza blur → cierra teclado
    alert("Blur forzado desde teclado");
    
    // Acá podés llamar la función de guardar automáticamente
    saveBtn.onclick?.();
  }
});
  loadProfile();
}