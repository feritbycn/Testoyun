import * as THREE from "three";
import "./styles.css";
import { VehicleController } from "./game/VehicleController";
import { InputController } from "./game/InputController";
import { TrafficManager } from "./game/TrafficManager";
import { createWorld } from "./game/World";
import { EconomyManager } from "./systems/EconomyManager";
import { SaveManager } from "./systems/SaveManager";
import { GarageManager, BUS_CATALOG } from "./systems/GarageManager";
import { RouteManager, ROUTES } from "./systems/RouteManager";
import { MissionManager } from "./systems/MissionManager";
import { RewardedAdService, PurchaseService } from "./systems/PlatformServices";
import { translations, type Language } from "./i18n/translations";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas")!;
const uiRoot = document.querySelector<HTMLDivElement>("#ui-root")!;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#8eb8d0");
scene.fog = new THREE.Fog("#8eb8d0", 90, 360);
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 700);
const world = createWorld(scene);
const vehicle = new VehicleController(world.bus);
const input = new InputController();
const traffic = new TrafficManager(scene);
const save = new SaveManager();
const loaded = save.load();
const economy = new EconomyManager(loaded?.wallet);
const garage = new GarageManager(loaded?.garage);
const routes = new RouteManager(loaded?.route);
const missions = new MissionManager(loaded?.missions);
const ads = new RewardedAdService();
const purchases = new PurchaseService();
let language: Language = (loaded?.language === "en" ? "en" : "tr");
let cameraMode = 0;
let engineOn = true;
let tripStarted = false;
let tripProgress = 0;
let currentRouteId = routes.currentRouteId;
let lastTime = performance.now();
let hudTick = 0;
let notice = "";
let noticeUntil = 0;
let menuOpen = false;
let selectedPanel = "home";
let settings = { graphics: "medium", sound: true, ...loaded?.settings };
let headlightOn = false;
let leftIndicator = false;
let rightIndicator = false;
let hornUntil = 0;

const t = (key: string) => translations[language][key] ?? translations.tr[key] ?? key;
const money = (n: number) => `${Math.round(n).toLocaleString(language === "tr" ? "tr-TR" : "en-US")} ₺`;
const currentBus = () => garage.currentBus;
const currentRoute = () => ROUTES.find(r => r.id === currentRouteId) ?? ROUTES[0];

function toast(message: string) {
  notice = message;
  noticeUntil = performance.now() + 2600;
  renderUI();
}
function persist() {
  save.save({
    wallet: economy.snapshot(), garage: garage.snapshot(), route: routes.snapshot(),
    missions: missions.snapshot(), language, settings
  });
}
function completeTrip() {
  if (!tripStarted) return;
  tripStarted = false;
  const route = currentRoute();
  const bus = currentBus();
  const revenue = Math.round(route.fare * Math.min(bus.seats, Math.max(8, Math.round(bus.seats * (0.55 + Math.random() * 0.35)))));
  const fuelCost = Math.round(route.distance * bus.fuelRate * 1.8);
  const wearCost = Math.round(vehicle.damage * 1.4 + route.distance * 0.6);
  const profit = Math.max(0, revenue - fuelCost - wearCost);
  economy.credit(profit, "trip-reward", `${route.from} → ${route.to}`);
  economy.debit(Math.min(economy.balance, fuelCost + wearCost), "trip-expense", "Yakıt ve bakım");
  economy.creditGold(2, "gold-bonus", "Sefer tamamlandı", `gold-trip:${routes.totalCompleted + 1}`);
  missions.record("trip", 1);
  missions.record("distance", route.distance);
  routes.markCompleted(route.id);
  tripProgress = 0;
  vehicle.refuel(100);
  persist();
  toast(`${t("tripComplete")}: +${money(profit)} · +2 ${t("gold")}`);
}
function startTrip() {
  if (tripStarted) { toast(t("tripAlready")); return; }
  if (!engineOn) { engineOn = true; }
  tripStarted = true;
  tripProgress = 0;
  vehicle.resetDamageIfRepaired();
  toast(`${t("tripStarted")}: ${currentRoute().from} → ${currentRoute().to}`);
  renderUI();
}
function panelContent(): string {
  if (selectedPanel === "garage") {
    return `<h2>${t("garage")}</h2><p class="muted">${t("garageHint")}</p><div class="bus-list">${BUS_CATALOG.map(b => {
      const owned = garage.ownedBusIds.includes(b.id);
      const active = garage.currentBusId === b.id;
      return `<article class="bus-card ${active ? "active" : ""}"><div class="bus-swatch" style="--bus:${b.color}"><span>▰</span></div><div class="bus-info"><b>${b.name}</b><small>${b.seats} ${t("seats")} · ${b.maxSpeed} km/h</small><small>${t("power")}: ${b.power} hp · ${t("fuel")}: ${b.fuelRate.toFixed(1)} L/100km</small></div><div class="bus-actions">${owned ? `<button data-action="select-bus" data-id="${b.id}" ${active ? "disabled" : ""}>${active ? t("selected") : t("select")}</button>` : `<button data-action="buy-bus" data-id="${b.id}">${money(b.price)}</button>`}</div></article>`;
    }).join("")}</div><div class="inline-actions"><button data-action="paint">${t("changePaint")}</button><button data-action="upgrade">${t("upgrade")}</button><button data-action="repair">${t("repair")}</button></div>`;
  }
  if (selectedPanel === "routes") return `<h2>${t("routes")}</h2><p class="muted">${t("routeHint")}</p>${ROUTES.map(r => `<button class="route-row ${r.id === currentRouteId ? "active" : ""}" data-action="route" data-id="${r.id}"><span><b>${r.from} → ${r.to}</b><small>${r.distance} km · ${r.duration} dk · ${t("demand")}: ${r.demand}%</small></span><strong>${money(r.fare)}</strong></button>`).join("")}<button class="primary wide" data-action="start-trip">${tripStarted ? t("tripInProgress") : t("startTrip")}</button>`;
  if (selectedPanel === "company") return `<h2>${t("company")}</h2><div class="stats-grid"><div><small>${t("companyLevel")}</small><b>${1 + Math.floor(missions.completedCount / 3)}</b></div><div><small>${t("reputation")}</small><b>${Math.min(100, 45 + missions.completedCount * 3)}%</b></div><div><small>${t("trips")}</small><b>${routes.totalCompleted}</b></div><div><small>${t("ownedBuses")}</small><b>${garage.ownedBusIds.length}</b></div></div><h3>${t("ledger")}</h3><div class="ledger">${economy.ledger.slice(-8).reverse().map(x => `<div><span>${x.description}<small>${new Date(x.at).toLocaleTimeString()}</small></span><b class="${x.amount >= 0 ? "positive" : "negative"}">${x.amount > 0 ? "+" : ""}${money(x.amount)}</b></div>`).join("") || `<p class="muted">${t("noTransactions")}</p>`}</div>`;
  if (selectedPanel === "missions") return `<h2>${t("missions")}</h2>${missions.items.map(m => `<div class="mission"><div><b>${t(m.titleKey)}</b><small>${m.progress}/${m.target}</small></div><div class="progress"><span style="width:${Math.min(100, m.progress / m.target * 100)}%"></span></div><small>${m.claimed ? t("claimed") : m.progress >= m.target ? `<button data-action="claim-mission" data-id="${m.id}">${t("claim")} · ${money(m.reward)}</button>` : `${t("reward")}: ${money(m.reward)}`}</small></div>`).join("")}`;
  if (selectedPanel === "store") return `<h2>${t("store")}</h2><p class="muted">${t("storeDisclaimer")}</p><div class="store-card"><div><b>${t("cashPack")}</b><small>${t("developmentOnly")}</small></div><button data-action="test-cash">+5.000 ₺ ${t("testOnly")}</button></div><div class="store-card"><div><b>${t("removeAds")}</b><small>${t("realPurchaseUnavailable")}</small></div><button data-action="purchase">${t("notConfigured")}</button></div><div class="store-card"><div><b>${t("premium")}</b><small>${t("premiumBenefits")}</small></div><button data-action="purchase">${t("notConfigured")}</button></div><button data-action="watch-ad">${t("watchAd")}</button>`;
  if (selectedPanel === "settings") return `<h2>${t("settings")}</h2><label class="setting-row">${t("language")}<select id="language-select"><option value="tr" ${language === "tr" ? "selected" : ""}>Türkçe</option><option value="en" ${language === "en" ? "selected" : ""}>English</option></select></label><label class="setting-row">${t("graphics")}<select id="graphics-select"><option value="low" ${settings.graphics === "low" ? "selected" : ""}>${t("low")}</option><option value="medium" ${settings.graphics === "medium" ? "selected" : ""}>${t("medium")}</option><option value="high" ${settings.graphics === "high" ? "selected" : ""}>${t("high")}</option></select></label><label class="setting-row">${t("sound")}<input id="sound-toggle" type="checkbox" ${settings.sound ? "checked" : ""}/></label><button data-action="save">${t("saveSettings")}</button><button class="danger" data-action="reset">${t("resetSave")}</button>`;
  if (selectedPanel === "daily") return `<h2>${t("dailyReward")}</h2><p>${t("dailyHint")}</p><div class="daily-reward">🎁<b>+750 ₺</b><small>${t("oncePerDay")}</small></div><button class="primary wide" data-action="daily">${t("claimReward")}</button>`;
  return `<h2>${t("quickMenu")}</h2><div class="quick-grid">${[["routes","routes","🗺"],["garage","garage","🚌"],["company","company","🏢"],["missions","missions","🏆"],["daily","dailyReward","🎁"],["store","store","🛒"],["settings","settings","⚙"]].map(([id,label,icon]) => `<button data-panel="${id}"><span>${icon}</span>${t(label)}</button>`).join("")}</div><p class="muted">${t("homeHint")}</p>`;
}
function renderUI() {
  const bus = currentBus();
  const route = currentRoute();
  uiRoot.innerHTML = `
    <header class="topbar"><div class="brand"><span class="brand-icon">RM</span><div><b>ROADMASTER</b><small>BUS EMPIRE</small></div></div><div class="wallet"><span>₺ ${Math.round(economy.balance).toLocaleString("tr-TR")}</span><span>◆ ${economy.gold}</span></div><button class="menu-button" data-action="menu">☰</button></header>
    <section class="hud"><div class="speed-card"><strong id="speed-value">${Math.round(vehicle.speed)}</strong><small>KM/H</small><div class="speed-line"><span id="speed-line" style="width:${Math.min(100, vehicle.speed / bus.maxSpeed * 100)}%"></span></div></div><div class="trip-card"><small>${t("currentRoute")}</small><b>${route.from} → ${route.to}</b><div class="trip-meta"><span>⛽ <i id="fuel-value">${Math.round(vehicle.fuel)}%</i></span><span>♥ <i id="damage-value">${Math.round(vehicle.damage)}%</i></span></div><div class="progress"><span id="trip-progress" style="width:${tripProgress}%"></span></div></div></section>
    <div class="right-tools"><button data-action="lights" class="${headlightOn ? "lit" : ""}" title="${t("lights")}">☼</button><button data-action="indicator-left" class="${leftIndicator ? "lit" : ""}" title="${t("indicator")}">◀</button><button data-action="indicator-right" class="${rightIndicator ? "lit" : ""}" title="${t("indicator")}">▶</button><button data-action="camera" title="${t("camera")}">◉</button><button data-action="engine" title="${t("engine")}">${engineOn ? "⏻" : "▶"}</button></div>
    <div class="route-banner"><span class="route-dot"></span><span>${tripStarted ? t("drivingTo") : t("readyForRoute")} <b>${route.to}</b></span><button data-action="open-routes">${t("change")}</button></div>
    <div class="drive-controls"><div class="steer-controls"><button data-control="left" aria-label="Sola dön">◀</button><button data-control="right" aria-label="Sağa dön">▶</button></div><div class="pedal-controls"><button class="brake" data-control="brake">${t("brake")}</button><button class="throttle" data-control="throttle">${t("throttle")}</button></div></div>
    <div class="bottom-nav"><button data-panel="home" class="${selectedPanel === "home" ? "selected" : ""}"><span>⌂</span>${t("home")}</button><button data-panel="routes" class="${selectedPanel === "routes" ? "selected" : ""}"><span>↗</span>${t("routes")}</button><button data-panel="garage" class="${selectedPanel === "garage" ? "selected" : ""}"><span>▰</span>${t("garage")}</button><button data-panel="company" class="${selectedPanel === "company" ? "selected" : ""}"><span>▦</span>${t("company")}</button></div>
    <div class="panel ${menuOpen ? "open" : ""}" id="panel"><div class="panel-head"><span class="drag-handle"></span><button class="close-panel" data-action="close-panel">×</button></div><div class="panel-body">${panelContent()}</div></div>
    <div class="notice ${performance.now() < noticeUntil ? "visible" : ""}">${notice}</div><div class="status-pill">${engineOn ? "● " + t("engineOn") : "○ " + t("engineOff")} · ${bus.name}</div>
  `;
  uiRoot.querySelectorAll<HTMLElement>("[data-panel]").forEach(el => el.addEventListener("click", () => {
    selectedPanel = el.dataset.panel ?? "home"; menuOpen = true; renderUI();
  }));
  uiRoot.querySelectorAll<HTMLElement>("[data-action]").forEach(el => el.addEventListener("click", () => handleAction(el.dataset.action ?? "", el.dataset.id)));
  uiRoot.querySelectorAll<HTMLElement>("[data-control]").forEach(el => {
    const control = el.dataset.control as "left" | "right" | "brake" | "throttle";
    const down = (e: Event) => { e.preventDefault(); input.setTouch(control, true); };
    const up = (e: Event) => { e.preventDefault(); input.setTouch(control, false); };
    el.addEventListener("pointerdown", down); el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up); el.addEventListener("pointercancel", up);
  });
  const lang = uiRoot.querySelector<HTMLSelectElement>("#language-select");
  lang?.addEventListener("change", () => { language = lang.value as Language; persist(); renderUI(); });
  uiRoot.querySelector<HTMLSelectElement>("#graphics-select")?.addEventListener("change", e => {
    settings.graphics = (e.target as HTMLSelectElement).value; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.graphics === "low" ? 1 : settings.graphics === "medium" ? 1.4 : 1.7)); persist();
  });
  uiRoot.querySelector<HTMLInputElement>("#sound-toggle")?.addEventListener("change", e => { settings.sound = (e.target as HTMLInputElement).checked; persist(); });
}
function handleAction(action: string, id?: string) {
  switch (action) {
    case "menu": menuOpen = !menuOpen; selectedPanel = "home"; break;
    case "close-panel": menuOpen = false; break;
    case "open-routes": selectedPanel = "routes"; menuOpen = true; break;
    case "start-trip": startTrip(); return;
    case "route": if (id) { currentRouteId = id; routes.select(id); persist(); } break;
    case "buy-bus": {
      const result = id ? garage.buy(id, economy) : { ok: false, message: "Otobüs seçilmedi" };
      toast(result.message); persist(); break;
    }
    case "select-bus": if (id) { garage.select(id); vehicle.setBus(garage.currentBus); toast(t("busSelected")); persist(); } break;
    case "paint": garage.cyclePaint(); vehicle.setBus(garage.currentBus); toast(t("paintChanged")); persist(); break;
    case "upgrade": {
      const result = garage.upgrade(economy);
      toast(result.message); vehicle.setBus(garage.currentBus); persist(); break;
    }
    case "repair": {
      const cost = Math.min(economy.balance, Math.round(vehicle.damage * 18));
      economy.debit(cost, "repair", "Otobüs onarımı"); vehicle.repair(); toast(`${t("repaired")}: ${money(cost)}`); persist(); break;
    }
    case "camera": cameraMode = (cameraMode + 1) % 3; break;
    case "lights": headlightOn = !headlightOn; world.setLights(headlightOn); break;
    case "indicator-left": leftIndicator = !leftIndicator; rightIndicator = false; break;
    case "indicator-right": rightIndicator = !rightIndicator; leftIndicator = false; break;
    case "engine": engineOn = !engineOn; if (!engineOn) input.clear(); break;
    case "daily": {
      const key = `roadmaster-daily-${new Date().toISOString().slice(0,10)}`;
      if (localStorage.getItem(key)) toast(t("dailyClaimed"));
      else { localStorage.setItem(key, "1"); economy.credit(750, "daily-reward", "Günlük ödül"); toast(t("rewardReceived")); persist(); }
      break;
    }
    case "claim-mission": {
      const result = missions.claim(id ?? "", economy);
      toast(result.message); persist(); break;
    }
    case "watch-ad": void ads.showRewarded("cash").then(result => toast(result.message)); break;
    case "purchase": void purchases.purchase("premium_monthly").then(result => toast(result.message)); break;
    case "test-cash": toast(t("testDisabled")); break;
    case "save": persist(); toast(t("saved")); break;
    case "reset": if (confirm(t("resetConfirm"))) { save.clear(); location.reload(); } return;
  }
  renderUI();
}
renderUI();

function animate(now: number) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.04);
  lastTime = now;
  const controls = input.read();
  if (engineOn) vehicle.update(dt, controls, headlightOn);
  else vehicle.coast(dt);
  traffic.update(dt, world.bus.position);
  const route = currentRoute();
  if (tripStarted) {
    tripProgress = Math.min(100, tripProgress + dt * (vehicle.speed / 12) * 0.8);
    if (tripProgress >= 100) completeTrip();
  }
  const bus = world.bus;
  if (cameraMode === 0) {
    camera.position.lerp(new THREE.Vector3(bus.position.x, bus.position.y + 5.2, bus.position.z + 10.5), 1 - Math.exp(-dt * 3.5));
    camera.lookAt(bus.position.x, bus.position.y + 1.3, bus.position.z - 2.5);
  } else if (cameraMode === 1) {
    camera.position.lerp(new THREE.Vector3(bus.position.x, bus.position.y + 2.45, bus.position.z + 0.25), 1 - Math.exp(-dt * 4));
    camera.lookAt(bus.position.x + Math.sin(bus.rotation.y) * 10, bus.position.y + 2, bus.position.z - 15);
  } else {
    camera.position.lerp(new THREE.Vector3(bus.position.x + 14, bus.position.y + 9, bus.position.z + 13), 1 - Math.exp(-dt * 2));
    camera.lookAt(bus.position);
  }
  renderer.render(scene, camera);
  hudTick += dt;
  if (hudTick > 0.15) {
    hudTick = 0;
    const speed = document.querySelector("#speed-value"); if (speed) speed.textContent = String(Math.round(vehicle.speed));
    const line = document.querySelector<HTMLElement>("#speed-line"); if (line) line.style.width = `${Math.min(100, vehicle.speed / currentBus().maxSpeed * 100)}%`;
    const fuel = document.querySelector("#fuel-value"); if (fuel) fuel.textContent = `${Math.round(vehicle.fuel)}%`;
    const damage = document.querySelector("#damage-value"); if (damage) damage.textContent = `${Math.round(vehicle.damage)}%`;
    const progress = document.querySelector<HTMLElement>("#trip-progress"); if (progress) progress.style.width = `${tripProgress}%`;
    if (now < noticeUntil) { const n = document.querySelector(".notice"); n?.classList.add("visible"); }
    else document.querySelector(".notice")?.classList.remove("visible");
  }
  if (now > hornUntil && input.hornPressed) { hornUntil = now + 600; toast(t("horn")); }
}
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener("beforeunload", persist);
