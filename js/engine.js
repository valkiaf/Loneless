/* =========================================================
   LONELESS — ENGINE CORE (ESTABLE + STATUS INTEGRADO)
   ========================================================= */

const Engine = {
  player: {
    name: "",
    life: 100,
    hunger: 100,
    thirst: 100,
    stamina: 100,
    stress: 100,
    weight: 0,
    height: 0,
    effects: {
      panic: false,
      hunger: false,
      thirst: false,
      injured: false,
      tired: false,
      radiation: false
    },
    bodyStatus: {
      head: [],
      torso: [],
      leftArm: [],
      rightArm: [],
      leftLeg: [],
      rightLeg: []
    }
  },
  radiation: 0,
  debug: false
};

/* ================= AUDIO ================= */
const soundType  = new Audio("assets/sounds/type.wav");
const soundClick = new Audio("assets/sounds/click.wav");
soundType.volume  = 0.4;
soundClick.volume = 0.5;

function playType(){ try{ soundType.currentTime=0; soundType.play(); }catch{} }
function playClick(){ try{ soundClick.currentTime=0; soundClick.play(); }catch{} }

/* ================= WEATHER ================= */
const weatherList = [
  "☀ Despejado","⛅ Nublado","🌧 Lluvia","🌧☢ Lluvia Radioactiva","☁ Niebla","⛈ Tormenta"
];

/* ================= ELEMENTS ================= */
const input      = document.getElementById("commandInput");
const terminal   = document.getElementById("pip-app-content");
const statusBox  = document.getElementById("status-container");
const appsBar    = document.getElementById("pipboy-apps");
const debugPanel = document.getElementById("debug-panel");

/* ================= STATE ================= */
let inputMode = "name";
let lastStats = { life:100,hunger:100,thirst:100,stamina:100,stress:100 };

/* ================= TERMINAL ================= */
function printTerminal(text){
  terminal.textContent += "\n" + text;
  terminal.scrollTop = terminal.scrollHeight;
}

/* ================= INPUT ================= */
window.onload = () => {
  input.focus();

  input.addEventListener("keydown", e=>{
    playType();
    if(e.key!=="Enter") return;
    e.preventDefault();

    const text=input.value.trim();
    if(!text) return;

    if(text.toLowerCase()==="mimicita"){
      toggleDebug();
      input.value="";
      return;
    }

    if(inputMode==="name"){
      Engine.player.name=text;
      inputMode="play";
      input.value="";
      input.placeholder="¿Qué quieres hacer?";
      startGame();
    }else{
      printTerminal(">"+text);
      input.value="";
    }
  });
};

/* ================= GAME START ================= */
function startGame(){
  document.querySelectorAll(".hud-off").forEach(e=>e.classList.remove("hud-off"));

  Engine.player.weight=55+Math.floor(Math.random()*30);
  Engine.player.height=(1.5+Math.random()*0.4).toFixed(2);

  document.getElementById("player-name").innerHTML =
    Engine.player.name+"<br>"+Engine.player.weight+"kg "+Engine.player.height+"m";

  document.getElementById("weather").textContent =
    weatherList[Math.floor(Math.random()*weatherList.length)];

  document.getElementById("time").textContent =
    String(Math.floor(Math.random()*24)).padStart(2,"0")+":"+
    String(Math.floor(Math.random()*60)).padStart(2,"0");

  terminal.textContent="";
  printTerminal(`>Bienvenido "${Engine.player.name}"`);

  buildBars();
  renderStatus();
  setupApps();
  setupRing();
}

/* ================= BARS ================= */
function buildBars(){
  ["life","hunger","thirst","stamina","stress"].forEach(stat=>{
    const el=document.getElementById("seg-"+stat);
    if(!el) return;
    el.innerHTML="";

    const cur=Engine.player[stat];
    const prev=lastStats[stat];
    const filled=Math.round(cur/10);
    const prevFilled=Math.round(prev/10);

    for(let i=0;i<10;i++){
      const d=document.createElement("div");
      d.className="segment";
      if(i<filled){ d.classList.add("on"); if(filled<=3) d.classList.add("danger"); }
      if(i>=filled && i<prevFilled) d.classList.add("damage-pop");
      el.appendChild(d);
    }
    lastStats[stat]=cur;
  });
}

/* ================= STATUS HUD ================= */
function renderStatus(){
  statusBox.innerHTML="";
  if(Engine.player.stress<30||Engine.player.effects.panic) statusBox.innerHTML+="<span>😵 Pánico</span>";
  if(Engine.player.hunger<30||Engine.player.effects.hunger) statusBox.innerHTML+="<span>🍖 Hambre</span>";
  if(Engine.player.thirst<30||Engine.player.effects.thirst) statusBox.innerHTML+="<span>💧 Sed</span>";
  if(Engine.player.life<30||Engine.player.effects.injured) statusBox.innerHTML+="<span>🩸 Herido</span>";
  if(Engine.player.stamina<30||Engine.player.effects.tired) statusBox.innerHTML+="<span>🐌 Cansado</span>";
}

/* ================= APPS ================= */
function setupApps(){
  const apps=[
    ["terminal","💻 Terminal"],
    ["inventory","🎒 Inventario"],
    ["map","🗺 Mapa"],
    ["missions","📜 Misiones"],
    ["status","👤 Estado"],
    ["radio","📻 Radio"]
  ];

  appsBar.innerHTML="";
  apps.forEach(([id,label],i)=>{
    const b=document.createElement("div");
    b.className="pip-app";
    b.textContent=label;
    b.onclick=()=>{ playClick(); selectApp(b,id); };
    appsBar.appendChild(b);
    if(i===0 && inputMode==="play") b.click();
  });
}

function selectApp(btn,app){
  document.querySelectorAll(".pip-app").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");

  input.style.display = app==="terminal" ? "block" : "none";
  if(inputMode==="play") terminal.textContent="";

  if(app==="status"){
    window.renderStatusApp?.();
    return;
  }

  if(app!=="terminal"){
    terminal.textContent=">"+app+" no implementado";
  }
}

/* ================= DEBUG ================= */
function toggleDebug(){
  Engine.debug=!Engine.debug;
  playClick();

  if(Engine.debug){
    debugPanel.style.display="block";
    debugPanel.style.position="fixed";
    debugPanel.style.bottom="80px";
    debugPanel.style.right="12px";
    debugPanel.style.zIndex="999";
    debugPanel.style.maxHeight="60vh";
    debugPanel.style.overflowY="auto";
    buildDebugMenu();
  }else{
    debugPanel.style.display="none";
  }
}

function buildDebugMenu(){
  debugPanel.innerHTML=`
    <div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
      <button class="pip-btn" onclick="toggleDebug()">⬅ Cerrar</button>
    </div>
    <div class="dbg-title">STATS</div>
    ${debugRow("Vida","life")}
    ${debugRow("Hambre","hunger")}
    ${debugRow("Sed","thirst")}
    ${debugRow("Aguante","stamina")}
    ${debugRow("Cordura","stress")}
  `;
}

function debugRow(label,stat){
  return `
    <div class="dbg-row">
      <span>${label}</span>
      <div class="dbg-controls">
        <span class="pip-btn" onclick="Engine.player.${stat}-=10;buildBars();renderStatus()">-10</span>
        <span class="pip-btn" onclick="Engine.player.${stat}+=10;buildBars();renderStatus()">+10</span>
      </div>
    </div>
  `;
}

/* ================= RING ================= */
function setupRing(){
  const btn=document.getElementById("npc-toggle");
  const pop=document.getElementById("npc-popup");
  const close=document.getElementById("closeNpc");
  btn.onclick=()=>{ playClick(); pop.style.display="block"; };
  close.onclick=()=>{ playClick(); pop.style.display="none"; };
}