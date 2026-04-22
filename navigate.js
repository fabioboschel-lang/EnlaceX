import { navigate } from "./app.js";

export function initNavigation(){

  const nav = document.getElementById("nav");

  nav.innerHTML = `
<div class="nav-bar">
<button id="feed" class="nav-btn">
  <!-- Corazón estilo SVG grande -->
  <svg viewBox="0 0 512 512" class="icon">
    <path d="M256 464s-16-14.8-70-68.3C88.5 331 32 271.5 32 192 32 120 88 64 160 64c48 0 80 32 96 64 16-32 48-64 96-64 72 0 128 56 128 128 0 79.5-56.5 139-154 203.7-54 53.5-70 68.3-70 68.3z" />
  </svg>
</button>
  <button id="mensajes" class="nav-btn">
<svg viewBox="0 0 100 100" class="icon">

  <!-- avioncito estilo Telegram -->
  <path
    d="
      M10 47
      Q10 43 15 41

      L83 13
      Q92 9 90 18

      L78 82
      Q76 91 68 85

      L41 61

      L73 32
      Q76 29 73 28

      L31 55

      L15 50
      Q10 49 10 47
      Z
    "
    fill="white"
  />

</svg>
</button>

    <button id="house" class="nav-btn">
    <!-- Casita -->
    <svg viewBox="0 0 24 24" class="icon">
      <path d="M3 10.5L12 3l9 7.5v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
    </svg>
  </button>
  
    <button id="profile" class="nav-btn">
    <!-- profile-->
   <svg viewBox="0 0 100 100" class="icon">
  <!-- perfil blanco -->
  <circle cx="50" cy="38" r="18" fill="white"/>

  <path
    d="M20 85
       C25 65, 75 65, 80 85
       Z"
    fill="white"
  />
</svg>
  </button>
</div>






  `;

  const mensajesBtn = document.getElementById("mensajes");
  const feedBtn = document.getElementById("feed");
  const houseBtn = document.getElementById("house");
  const profileBtn = document.getElementById("profile");

  
  

  mensajesBtn.addEventListener("click", () => {
    navigate("mensajes");
  });

  feedBtn.addEventListener("click", () => {
    navigate("feed");
  });

  houseBtn.addEventListener("click", () => {
    navigate("house");
  });

profileBtn.addEventListener("click", () => {
    navigate("profile");
  });






}