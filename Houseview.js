import { supabase } from "./supabase.js";

export async function Houseview(app) {
  

  app.innerHTML = `
  
  <div class="paybuttom">
  <h1 class="paytext">Obtener ticket</h1>
  </div>
    
    <div class="countdown-container">
  <p class="countdown-label">Empieza en</p>
  <p id="countdown" class="countdown-timer"></p>
</div>

<div class="Flyerbox">
  <img id="flyerimg" class="flyerimg" src="" alt="Flyer del evento">
</div>
  `;








async function startCountdownFromDB() {
  const countdownEl = document.getElementById("countdown");
  if (!countdownEl) return;

  // 🔗 Traer fecha del evento desde Supabase
  const { data, error } = await supabase
    .from("Eventos")
    .select("Fecha")
    .limit(1)
    .single();

  if (error) {
    console.error("Error al obtener evento:", error);
    countdownEl.textContent = "Error";
    return;
  }

  const eventDate = new Date(data.Fecha);

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

/* INICIAR CONTADOR REAL */
startCountdownFromDB();





const { data, error } = await supabase
  .from("Eventos")
  .select("Flyer")
  .limit(1);

if (error || !data || data.length === 0) return;

const fileName = data[0].Flyer;

// 🔗 URL pública
const { data: publicData } = supabase
  .storage
  .from("images")
  .getPublicUrl(fileName);

const imageUrl = publicData.publicUrl;

// 🖼 asignar al img existente
const img = document.getElementById("flyerimg");
img.src = imageUrl;

}