import { navigate } from "./app.js";

export function initNavigation(){

  const nav = document.getElementById("nav");

  nav.innerHTML = `
<div class="nav-bar">
  <button id="nav-feed" class="nav-btn">
    <!-- Corazón -->
    <svg viewBox="0 0 24 24" class="icon">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
           2 6 4 4 6.5 4 
           8.24 4 9.91 5.01 10.5 6.09 
           11.09 5.01 12.76 4 14.5 4 
           17 4 19 6 19 8.5 
           19 12.28 15.6 15.36 10.45 20.04 
           L12 21.35z"/>
</svg>
  </button>

  <button id="nav-profile" class="nav-btn">
    <!-- Casita -->
    <svg viewBox="0 0 24 24" class="icon">
      <path d="M3 10.5L12 3l9 7.5v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
    </svg>
  </button>
</div>
  `;

  const profileBtn = document.getElementById("nav-profile");
  const feedBtn = document.getElementById("nav-feed");

  profileBtn.addEventListener("click", () => {
    navigate("profile");
  });

  feedBtn.addEventListener("click", () => {
    navigate("feed");
  });








}