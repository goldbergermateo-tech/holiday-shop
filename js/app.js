import * as THREE from "three";
import { STORE, PRODUCTS, byId } from "./products.js";
import { createBackend, remaining, claimsFor } from "./backend.js";
import { createWorld, SPAWN } from "./world.js";
import { createControls, isTouch } from "./controls.js";
import { createUI } from "./ui.js";

const canvas = document.getElementById("scene"); canvas.tabIndex = 0;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
const mobile = isTouch();
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(mobile ? 75 : 68, window.innerWidth / window.innerHeight, 0.05, 60);
camera.position.set(...SPAWN.pos);

const world = createWorld(scene, PRODUCTS, { shadows: !mobile });
const backend = createBackend(STORE.registryId);
const ui = createUI({ products: PRODUCTS, byId, backend, store: STORE });

function approach(id) {
  // a spot ~1.7 m from the product, on the side the viewer is on, plus the point to look at
  const g = world.groups.get(id); const p = g.position; const cam = camera.position;
  const dx = cam.x - p.x, dz = cam.z - p.z, d = Math.hypot(dx, dz) || 1; const dist = 1.7 + (g.userData.onFloor ? 0.5 : 0);
  return { to: new THREE.Vector3(p.x + dx / d * dist, 0, p.z + dz / d * dist), look: new THREE.Vector3(p.x, p.y + Math.min(1.3, g.userData.height * 0.55), p.z) };
}
const controls = createControls({
  camera, canvas, joystickEl: document.getElementById("joystick"), colliders: world.colliders, bounds: world.bounds, pickables: world.pickables,
  onSelect: (id, dist) => { if (dist > 2.6) { const a = approach(id); ui.setHint(`Walking over to the ${byId[id].name}…`); controls.goTo(a.to, a.look, () => { ui.setHint(""); ui.openProduct(id); }); } else ui.openProduct(id); },
  onHover: (id) => { const ch = document.getElementById("crosshair"); if (id) { const p = byId[id]; const s = ui.statusOf(p); ui.setHint(`${p.name} · ${s.text} · click to open`); ch.classList.add("hot"); } else { if (!controls.state.auto) ui.setHint(""); ch.classList.remove("hot"); } },
  onLockChange: () => {},
  onFallback: () => {},
});
controls.setYaw(SPAWN.yaw);

const hud = document.getElementById("hud");
document.getElementById("look-hint").hidden = !mobile; if (mobile) setTimeout(() => { document.getElementById("look-hint").hidden = true; }, 9000);
document.getElementById("crosshair").hidden = mobile;
let keysHintShown = false;
function startWalking() {
  hud.hidden = false; controls.setActive(true); canvas.focus();
  if (!mobile && !keysHintShown) { keysHintShown = true; ui.setHint("↑ ↓ walk · ← → turn · move the mouse to look · click a gift", true); setTimeout(() => ui.setHint(""), 7000); }
  if (!mobile) controls.lock();
}
function pauseWalking() { controls.setActive(false); ui.setHint(""); }

ui.on("enter", startWalking);
ui.on("list", pauseWalking);
ui.on("pause", pauseWalking);
ui.on("resume", () => { hud.hidden = false; startWalking(); });
ui.on("home", () => { controls.teleport(SPAWN.pos[0], SPAWN.pos[2], SPAWN.yaw); });
ui.on("exit", () => { pauseWalking(); hud.hidden = true; controls.teleport(SPAWN.pos[0], SPAWN.pos[2], SPAWN.yaw); });

// live claims -> 3D labels + UI
backend.subscribe((claims, err) => {
  if (err) ui.toast("Couldn't reach the shared list. Showing what we have.");
  ui.setClaims(claims);
  PRODUCTS.forEach(p => world.setStatus(p, { remaining: remaining(p, claims), total: p.qty, claimedUnits: claimsFor(claims, p.id).length }));
});

// deep link: ?item=hoodie opens that gift straight away
const want = new URLSearchParams(location.search).get("item");
if (want && byId[want]) { document.getElementById("entry").hidden = true; ui.openProduct(want); }

window.addEventListener("resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (ui.isPanelOpen()) { ui.closeProduct(); return; }
  if (ui.isListOpen()) { ui.hideList(); startWalking(); return; }
  if (ui.isEntryOpen()) return;
  if (ui.isMenuOpen()) ui.closeMenu(); else ui.openMenu();
});

window.__shop = { camera, controls, world, ui, backend, PRODUCTS };
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => { const dt = Math.min(clock.getDelta(), 0.05); controls.update(dt); world.update(dt, clock.elapsedTime); renderer.render(scene, camera); });
