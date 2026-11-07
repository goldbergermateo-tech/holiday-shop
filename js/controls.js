// First-person controls: pointer lock + WASD on laptops, joystick + drag-look + tap on phones.
import * as THREE from "three";

export const isTouch = () => ("ontouchstart" in window) || navigator.maxTouchPoints > 0;

export function createControls({ camera, canvas, joystickEl, colliders, bounds, pickables, onSelect, onHover, onLockChange, onFallback }) {
  const state = { yaw: 0, pitch: 0, active: false, locked: false, fallback: false, keys: {}, joy: { x: 0, y: 0 }, look: null, joyTouch: null, tap: null, bob: 0 };
  const raycaster = new THREE.Raycaster(); raycaster.far = 7; let lastHover = null;
  const SPEED = 2.9, RADIUS = 0.35, EYE = 1.6, TURN = 1.9;
  const touch = isTouch();

  function applyLook() { state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch)); camera.rotation.set(0, 0, 0, "YXZ"); camera.rotation.y = state.yaw; camera.rotation.x = state.pitch; }
  function setYaw(yaw) { state.yaw = yaw; applyLook(); }

  // ----- desktop: pointer lock
  const canLock = !!canvas.requestPointerLock;
  let lockTimer = null;
  function lock() {
    if (state.fallback || !canLock || state.locked) return;
    if (state.lockTried && performance.now() - state.lockTried < 1000) return; state.lockTried = performance.now();
    try { const r = canvas.requestPointerLock(); if (r && typeof r.then === "function") r.then(() => {}, () => enableFallback()); } catch { enableFallback(); return; }
    clearTimeout(lockTimer); lockTimer = setTimeout(() => { if (!state.locked) enableFallback(); }, 700);
  }
  function enableFallback() { if (state.fallback) return; state.fallback = true; onFallback?.(); }
  function unlock() { if (document.pointerLockElement === canvas) document.exitPointerLock(); }
  document.addEventListener("pointerlockchange", () => { state.locked = document.pointerLockElement === canvas; onLockChange?.(state.locked); });
  document.addEventListener("pointerlockerror", () => { state.locked = false; enableFallback(); onLockChange?.(false); });
  document.addEventListener("mousemove", e => { if (!state.active) return; if (state.fallback && !state.look) { const h = pickAt(e.clientX, e.clientY, false); const id = h ? h.id : null; if (id !== lastHover) { lastHover = id; onHover?.(id, h?.dist); } } if (state.locked) { state.yaw -= e.movementX * 0.0017; state.pitch -= e.movementY * 0.0017; applyLook(); } else if (state.look && e.buttons === 1 && !touch) { state.yaw -= (e.clientX - state.look.x) * 0.0032; state.pitch -= (e.clientY - state.look.y) * 0.0032; state.look = { x: e.clientX, y: e.clientY, t: state.look.t }; state.auto = null; applyLook(); } });
  canvas.addEventListener("mousedown", e => { if (!state.active || touch) return; if (!state.locked) state.look = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener("mouseup", e => { if (!state.active || touch) return; if (state.locked) { pickCenter(true); return; } const l = state.look; state.look = null; if (l && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 6 && performance.now() - l.t < 400) { if (canLock && !state.fallback) lock(); else pickAt(e.clientX, e.clientY, true); } });
  document.addEventListener("keydown", e => { if (!state.active || e.target.tagName === "INPUT") return; state.keys[e.code] = true; if (e.code.startsWith("Arrow") || e.code === "Space") e.preventDefault(); if (e.code !== "ShiftLeft" && e.code !== "ShiftRight") state.auto = null; if (e.code === "KeyE" || e.code === "Enter") pickCenter(true); });
  document.addEventListener("keyup", e => { state.keys[e.code] = false; });
  window.addEventListener("blur", () => { state.keys = {}; });

  // ----- touch: joystick + look + tap
  if (touch && joystickEl) {
    joystickEl.hidden = false; const knob = joystickEl.querySelector(".knob"); const R = 44;
    const setKnob = (x, y) => { knob.style.transform = `translate(${x}px,${y}px)`; };
    joystickEl.addEventListener("touchstart", e => { e.preventDefault(); const t = e.changedTouches[0]; const r = joystickEl.getBoundingClientRect(); state.joyTouch = { id: t.identifier, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }, { passive: false });
    joystickEl.addEventListener("touchmove", e => { e.preventDefault(); if (!state.joyTouch) return; for (const t of e.changedTouches) if (t.identifier === state.joyTouch.id) { let dx = t.clientX - state.joyTouch.cx, dy = t.clientY - state.joyTouch.cy; const len = Math.hypot(dx, dy); if (len > R) { dx *= R / len; dy *= R / len; } state.joy = { x: dx / R, y: dy / R }; setKnob(dx, dy); } }, { passive: false });
    const endJoy = e => { for (const t of e.changedTouches) if (state.joyTouch && t.identifier === state.joyTouch.id) { state.joyTouch = null; state.joy = { x: 0, y: 0 }; setKnob(0, 0); } };
    joystickEl.addEventListener("touchend", endJoy); joystickEl.addEventListener("touchcancel", endJoy);
    canvas.addEventListener("touchstart", e => { if (!state.active) return; const t = e.changedTouches[0]; state.look = { id: t.identifier, x: t.clientX, y: t.clientY, sx: t.clientX, sy: t.clientY, t: performance.now() }; }, { passive: true });
    canvas.addEventListener("touchmove", e => { if (!state.active || !state.look) return; for (const t of e.changedTouches) if (t.identifier === state.look.id) { state.yaw -= (t.clientX - state.look.x) * 0.005; state.pitch -= (t.clientY - state.look.y) * 0.005; state.look.x = t.clientX; state.look.y = t.clientY; applyLook(); } }, { passive: true });
    canvas.addEventListener("touchend", e => { if (!state.look) return; for (const t of e.changedTouches) if (t.identifier === state.look.id) { const l = state.look; state.look = null; if (Math.hypot(t.clientX - l.sx, t.clientY - l.sy) < 12 && performance.now() - l.t < 350 && state.active) pickAt(t.clientX, t.clientY, true); } });
  }

  // ----- picking
  function hitFromRay() { const hits = raycaster.intersectObjects(pickables, false); return hits.length ? { id: hits[0].object.userData.productId, dist: hits[0].distance } : null; }
  function pickCenter(select) { raycaster.setFromCamera(new THREE.Vector2(0, 0), camera); const h = hitFromRay(); if (select && h) onSelect?.(h.id, h.dist); return h; }
  function pickAt(x, y, select) { const r = canvas.getBoundingClientRect(); raycaster.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera); const h = hitFromRay(); if (select && h) onSelect?.(h.id, h.dist); return h; }

  // ----- movement with simple AABB collision
  const vel = new THREE.Vector3(), target = new THREE.Vector3(); const fwd = new THREE.Vector3(), right = new THREE.Vector3();
  // glide toward a point while turning to face something (used when you click a far-away item)
  function autoStep(dt, out) {
    const a = state.auto, p = camera.position; const dx = a.to.x - p.x, dz = a.to.z - p.z; const d = Math.hypot(dx, dz);
    const wantYaw = Math.atan2(-(a.look.x - p.x), -(a.look.z - p.z)); let dy = wantYaw - state.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    state.yaw += dy * Math.min(1, dt * 6); const wantPitch = Math.atan2(a.look.y - EYE, Math.hypot(a.look.x - p.x, a.look.z - p.z)); state.pitch += (wantPitch - state.pitch) * Math.min(1, dt * 6); applyLook();
    if (d < 0.12 || (a.lastD !== undefined && Math.abs(a.lastD - d) < 0.002 && (a.stuck = (a.stuck || 0) + dt) > 0.5)) { const cb = a.done; state.auto = null; cb && cb(); return; }
    a.lastD = d; const sp = Math.min(3.2, 1.2 + d * 2); out.set(dx / d * sp, 0, dz / d * sp);
  }
  function update(dt) {
    if (!state.active) return;
    let mx = 0, mz = 0; const k = state.keys;
    if (k.KeyW || k.ArrowUp) mz -= 1; if (k.KeyS || k.ArrowDown) mz += 1; if (k.KeyA) mx -= 1; if (k.KeyD) mx += 1;
    if (k.ArrowLeft) { state.yaw += TURN * dt; applyLook(); } if (k.ArrowRight) { state.yaw -= TURN * dt; applyLook(); }
    if (state.joy.x || state.joy.y) state.auto = null;
    mx += state.joy.x; mz += state.joy.y;
    const len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }
    const speed = SPEED * ((k.ShiftLeft || k.ShiftRight) ? 1.6 : 1);
    fwd.set(-Math.sin(state.yaw), 0, -Math.cos(state.yaw)); right.set(Math.cos(state.yaw), 0, -Math.sin(state.yaw));
    target.set(0, 0, 0).addScaledVector(fwd, -mz * speed).addScaledVector(right, mx * speed);
    const p = camera.position;
    if (state.auto) autoStep(dt, target);
    vel.lerp(target, Math.min(1, dt * 9));
    const nx = p.x + vel.x * dt, nz = p.z + vel.z * dt;
    const pos = resolve(nx, nz); p.x = Math.min(bounds.maxX, Math.max(bounds.minX, pos.x)); p.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, pos.z));
    const moving = vel.length() > 0.3; state.bob = moving ? state.bob + dt * 9 : 0; p.y = EYE + (moving ? Math.sin(state.bob) * 0.025 : 0);
    if (!touch && !state.fallback) { const h = state.locked ? pickCenter(false) : null; const id = h ? h.id : null; if (id !== lastHover) { lastHover = id; onHover?.(id, h?.dist); } }
  }
  function resolve(x, z) {
    for (let iter = 0; iter < 3; iter++) for (const b of colliders) {
      const cx = Math.max(b.min.x, Math.min(x, b.max.x)), cz = Math.max(b.min.z, Math.min(z, b.max.z)); const dx = x - cx, dz = z - cz; const d2 = dx * dx + dz * dz;
      if (d2 < RADIUS * RADIUS) { if (d2 > 1e-6) { const d = Math.sqrt(d2); x = cx + dx / d * RADIUS; z = cz + dz / d * RADIUS; } else { const px = Math.min(x - b.min.x, b.max.x - x), pz = Math.min(z - b.min.z, b.max.z - z); if (px < pz) x = (x - b.min.x < b.max.x - x) ? b.min.x - RADIUS : b.max.x + RADIUS; else z = (z - b.min.z < b.max.z - z) ? b.min.z - RADIUS : b.max.z + RADIUS; } }
    }
    return { x, z };
  }

  return {
    state, touch, update, lock, unlock, setYaw,
    goTo(to, look, done) { state.auto = { to, look, done }; },
    teleport(x, z, yaw) { camera.position.set(x, EYE, z); state.pitch = 0; state.auto = null; vel.set(0, 0, 0); setYaw(yaw); },
    setActive(v) { state.active = v; if (!v) { state.keys = {}; state.joy = { x: 0, y: 0 }; state.look = null; unlock(); } },
    isLocked: () => state.locked, canLock, isFallback: () => state.fallback,
  };
}
