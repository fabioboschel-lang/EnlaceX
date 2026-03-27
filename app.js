import { ProfileView } from './Profileview.js';
import {Houseview} from  './Houseview.js';
import { FeedView } from './Feedview.js';
import { initNavigation } from './navigate.js';

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

const app = document.getElementById("app");

export function navigate(view){

  if(view === "profile"){
    ProfileView(app);
  }

  if(view === "feed"){
    FeedView(app);
  }
  
  if(view === "house"){
    Houseview(app);
  }


}

document.addEventListener("DOMContentLoaded", () => {

  
   
   
   initNavigation();
   
  navigate("house");
  
  
  
  
  
  

});