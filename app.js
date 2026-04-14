import { FeedView } from './Feedview.js';
import { Houseview } from './Houseview.js';
import { Mensajes } from './Mensajes.js';
import { Chat } from './Chat.js';
import { ProfileView } from './Profileview.js';
import { initNavigation } from './navigate.js';

const app = document.getElementById("app"); // 👈 FALTABA ESTO

window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash-screen");

    if (!splash) return;

    splash.style.opacity = "0";

    setTimeout(() => {
      splash.style.display = "none";
    }, 500);

  }, 1500);
});

export function navigate(view, params = {}) {

  const nav = document.getElementById("nav");
  if (nav) {
    nav.style.display = (view === "chat") ? "none" : "block";
  }


  if(view === "mensajes"){
    Mensajes(app);
  }

  if(view === "feed"){
    FeedView(app);
  }
  
  if(view === "house"){
    Houseview(app);
  }
  
  if(view === "profile"){
    ProfileView(app);
  }
  
  if(view === "chat"){
    Chat(app, params); // 👈 correcto
  }
}

document.addEventListener("DOMContentLoaded", () => {

  initNavigation();
  navigate("mensajes");

});