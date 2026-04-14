import { navigate } from "./app.js";

export function initNavigation(){

  const nav = document.getElementById("nav");

  nav.innerHTML = `
<div class="nav-bar">
<button id="nav-feed" class="nav-btn">
  <!-- Corazón estilo SVG grande -->
  <svg viewBox="0 0 512 512" class="icon">
    <path d="M256 464s-16-14.8-70-68.3C88.5 331 32 271.5 32 192 32 120 88 64 160 64c48 0 80 32 96 64 16-32 48-64 96-64 72 0 128 56 128 128 0 79.5-56.5 139-154 203.7-54 53.5-70 68.3-70 68.3z" />
  </svg>
</button>
  <button id="nav-mensajes" class="nav-btn">
  <svg viewBox="0 0 24 24" class="icon">
    <!-- Triángulo principal con bordes redondeados -->
    <path d="M2 21 Q2 21 2 3 L22 12 Z"  stroke="none" stroke-linejoin="round"/>

    <!-- Hueco interno: empieza desde el punto medio de la línea esquina1-esquina2 -->
    <path d="M2 12 L12 12"
          fill="none"
          stroke="white"
          stroke-width="4"
          stroke-linecap="round"/>
  </svg>
</button>

    <button id="nav-house" class="nav-btn">
    <!-- Casita -->
    <svg viewBox="0 0 24 24" class="icon">
      <path d="M3 10.5L12 3l9 7.5v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
    </svg>
  </button>
</div>


  `;

  const profileBtn = document.getElementById("nav-mensajes");
  const feedBtn = document.getElementById("nav-feed");
  const houseBtn = document.getElementById("nav-house");
  

  
  

  profileBtn.addEventListener("click", () => {
    navigate("mensajes");
  });

  feedBtn.addEventListener("click", () => {
    navigate("feed");
  });

  houseBtn.addEventListener("click", () => {
    navigate("house");
  });








}