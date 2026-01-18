/* =========================================================
   LONELESS — STATUS APP
   LAYOUT AJUSTADO + ESCALA MEJORADA
   ========================================================= */

/* ================= STATUS SPRITESHEET UI (24x24) ================= */

const STATUS_SHEET_UI = {
  size: 24,
  icons: {
    bleeding:   { x: 0,  y: 0 },
    contusion: { x: 24, y: 24 },
    sprain:    { x: 48, y: 24 }
  }
};

/* ================================================================ */

let selectedBodyPart = null;

/* ================= STATS BASE ================= */

const BASE_STATS = {
  accuracy: 100,
  movement: 100,
  staminaCost: 100,
  staminaRegen: 100,
  fallRisk: 0
};

/* ================= CATÁLOGO DE LESIONES ================= */

const InjuryCatalog = {
  fracture: {
    name: "Fractura",
    severity: "grave",
    description: "Hueso roto. El miembro pierde gran parte de su funcionalidad.",
    modifiers: {
      movement: -40,
      staminaCost: +60,
      accuracy: -25,
      fallRisk: +25
    },
    treatment: "Férula + analgésicos. Reposo prolongado."
  },
  sprain: {
    name: "Esguince",
    severity: "media",
    description: "Daño ligamentoso que reduce el control del miembro.",
    modifiers: {
      accuracy: -15,
      staminaCost: +10
    },
    treatment: "Vendaje compresivo + reposo."
  },
  bleeding: {
    name: "Sangrado",
    severity: "media",
    description: "Pérdida continua de sangre.",
    modifiers: {
      staminaRegen: -20,
      staminaCost: +10
    },
    treatment: "Vendaje o sutura inmediata."
  },
  contusion: {
    name: "Contusión",
    severity: "leve",
    description: "Golpe interno. Dolor persistente.",
    modifiers: {
      staminaRegen: -10
    },
    treatment: "Reposo + analgésicos."
  }
};

/* ================= FUNCIÓN PRINCIPAL ================= */

window.renderStatusApp = function(){
  const terminal = document.getElementById("pip-app-content");

  if(!Engine.player.bodyStatus){
    Engine.player.bodyStatus = {
      head: [],
      torso: [],
      leftArm: [],
      rightArm: [],
      leftLeg: [],
      rightLeg: []
    };
  }

  terminal.innerHTML = `
    <div style="
      max-height:420px;
      display:flex;
      flex-direction:column;
      gap:8px;
      overflow:hidden;
    ">

      <!-- HUMANOIDE -->
      <div style="text-align:center;margin-top:-14px;">
        <div class="dbg-title" style="margin-bottom:4px;">
          CUERPO
        </div>
        ${renderSurvivorSVG()}
      </div>

      <!-- DEBUFFS RÁPIDOS -->
      <div>
        <div class="dbg-title">CONDICIÓN</div>
        ${renderQuickDebuffs()}
      </div>

      <!-- DETALLE CONTEXTUAL -->
      <div style="flex:1; overflow-y:auto; padding-right:4px;">
        <div class="dbg-title">DIAGNÓSTICO</div>
        ${renderInjuryDetails()}
      </div>

    </div>
  `;

  applyBodyVisualState();
};

/* ================= SPRITE + HITBOX ================= */

function renderSurvivorSVG(){
  return `
  <div style="
    position:relative;
    width:160px;
    height:320px;
    margin:0 auto;
  ">

    <!-- SPRITE BASE -->
    <img
      src="./assets/spritesheets/survivor_base_64.png"
      style="
        width:160px;
        height:320px;
        image-rendering:pixelated;
        display:block;
      "
    />

    <!-- HITBOX SVG INVISIBLE -->
    <svg
      viewBox="0 0 220 440"
      xmlns="http://www.w3.org/2000/svg"
      style="
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        pointer-events:auto;
      "
    >
      <style>
        .body-part{
          fill:transparent;
          cursor:pointer;
        }
      </style>

      <ellipse cx="110" cy="42" rx="24" ry="22"
        class="body-part"
        onclick="selectBodyPart('head')" />

      <path d="M70 70 Q110 55 150 70 V190 Q110 205 70 190 Z"
        class="body-part"
        onclick="selectBodyPart('torso')" />

      <rect x="40" y="90" width="22" height="140"
        class="body-part"
        onclick="selectBodyPart('leftArm')" />

      <rect x="158" y="90" width="22" height="140"
        class="body-part"
        onclick="selectBodyPart('rightArm')" />

      <rect x="90" y="200" width="24" height="180"
        class="body-part"
        onclick="selectBodyPart('leftLeg')" />

      <rect x="116" y="200" width="24" height="180"
        class="body-part"
        onclick="selectBodyPart('rightLeg')" />
    </svg>

  </div>
  `;
}

/* ================= ESTADO VISUAL ================= */

function applyBodyVisualState(){
  Object.keys(Engine.player.bodyStatus).forEach(part=>{
    const el = document.getElementById("body-" + part);
    if(!el) return;

    el.classList.remove("body-normal","body-injured","body-critical");

    const injuries = Engine.player.bodyStatus[part];
    if(injuries.length === 0){
      el.classList.add("body-normal");
      return;
    }

    const critical = injuries.some(
      i => InjuryCatalog[i]?.severity === "grave"
    );

    el.classList.add(critical ? "body-critical" : "body-injured");
  });
}

/* ================= SELECCIÓN ================= */

function selectBodyPart(part){
  selectedBodyPart = part;
  window.renderStatusApp();
}

/* ================= CÁLCULO DE STATS ================= */

function calculateFinalStats(){
  const stats = { ...BASE_STATS };

  Object.values(Engine.player.bodyStatus).forEach(list=>{
    list.forEach(key=>{
      const inj = InjuryCatalog[key];
      if(!inj) return;
      Object.entries(inj.modifiers).forEach(([k,v])=>{
        stats[k] += v;
      });
    });
  });

  return stats;
}

/* ================= DEBUFFS RÁPIDOS ================= */

function renderQuickDebuffs(){
  const s = calculateFinalStats();
  return `
    <div class="pip-btn">
      🎯 ${s.accuracy}% &nbsp;
      🏃 ${s.movement}% &nbsp;
      🔋 ${s.staminaRegen}% &nbsp;
      🎲 +${s.fallRisk}%
    </div>
  `;
}

/* ================= DETALLE CONTEXTUAL ================= */

function renderInjuryDetails(){
  if(!selectedBodyPart){
    return `<div class="pip-btn">Selecciona una parte del cuerpo.</div>`;
  }

  const injuries = Engine.player.bodyStatus[selectedBodyPart];

  if(injuries.length === 0){
    return `
      <div class="pip-btn">
        <strong>${translatePart(selectedBodyPart)}</strong><br>
        Sin lesiones.
      </div>
    `;
  }

  let html = `<div class="pip-btn"><strong>${translatePart(selectedBodyPart)}</strong></div>`;

  injuries.forEach(key=>{
    const inj = InjuryCatalog[key];
    if(!inj) return;

    html += `
      <div class="pip-btn" style="margin-top:6px;">
        <strong>
          ${getStatusIconHTML(key)}
          ${inj.name}
        </strong><br>
        <em>${inj.description}</em><br><br>
        ${Object.entries(inj.modifiers)
          .map(([k,v])=>`${formatStat(k)}: ${v>0?"+":""}${v}%`)
          .join("<br>")}
        <br><br>
        🩹 ${inj.treatment}
      </div>
    `;
  });

  return html;
}

/* ================= UTIL ================= */

function translatePart(part){
  return {
    head:"Cabeza",
    torso:"Torso",
    leftArm:"Brazo izquierdo",
    rightArm:"Brazo derecho",
    leftLeg:"Pierna izquierda",
    rightLeg:"Pierna derecha"
  }[part] || part;
}

function formatStat(stat){
  return {
    accuracy:"Puntería",
    movement:"Movimiento",
    staminaCost:"Costo stamina",
    staminaRegen:"Regeneración stamina",
    fallRisk:"Riesgo de caída"
  }[stat] || stat;
}

/* ================= ICONO STATUS (HTML) ================= */

function getStatusIconHTML(statusKey){
  const icon = STATUS_SHEET_UI.icons[statusKey];
  if(!icon) return "";

  return `
    <span style="
      display:inline-block;
      width:24px;
      height:24px;
      background-image:url('./assets/spritesheets/status_icons.sheet24.png');
      background-position:-${icon.x}px -${icon.y}px;
      background-repeat:no-repeat;
      image-rendering:pixelated;
      vertical-align:middle;
      margin-right:6px;
    "></span>
  `;
}