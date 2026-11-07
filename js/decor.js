// Holiday decorations: tree, presents, wreath, string lights, snow, checkout counter.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as T from "./textures.js";

const M = (o) => new THREE.MeshStandardMaterial(o);
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
const rand = (a, b) => a + Math.random() * (b - a);

export function buildTree(height = 2.6) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.4, 10), M({ color: 0x5a3a1e, roughness: .9 }), 0, 0.2, 0));
  const green = M({ color: 0x1f6b3a, roughness: .95 });
  const tiers = 4;
  for (let i = 0; i < tiers; i++) { const r = 0.95 - i * 0.2, h = 0.85; g.add(mesh(new THREE.ConeGeometry(r, h, 14), green, 0, 0.5 + i * 0.52, 0)); }
  const colors = [0xd7263d, 0xe3b341, 0x2a7fd4, 0xf2f2f2, 0xc44bd6];
  for (let i = 0; i < 46; i++) {
    const t = i / 46, y = 0.45 + t * (height - 0.9), r = (0.95 - (y - 0.5) / (height - 0.9) * 0.8) * rand(0.6, 0.98), a = i * 2.39996;
    g.add(mesh(new THREE.SphereGeometry(0.045, 10, 8), M({ color: colors[i % colors.length], roughness: .3, metalness: .3 }), Math.cos(a) * r, y, Math.sin(a) * r));
  }
  for (let i = 0; i < 24; i++) { const t = i / 24, y = 0.5 + t * (height - 1), r = (0.95 - t * 0.78) * 0.9, a = i * 1.1; g.add(mesh(new THREE.SphereGeometry(0.022, 8, 6), M({ color: 0xfff0b0, emissive: 0xffd36a, emissiveIntensity: 1.6 }), Math.cos(a) * r, y, Math.sin(a) * r)); }
  const star = mesh(new THREE.OctahedronGeometry(0.14), M({ color: 0xffd76a, emissive: 0xffb300, emissiveIntensity: .8, metalness: .6, roughness: .3 }), 0, height - 0.05, 0); star.scale.set(1, 1.4, 0.4); g.add(star);
  g.userData.light = new THREE.PointLight(0xffc877, 6, 6, 1.6); g.userData.light.position.set(0, 1.6, 0); g.add(g.userData.light);
  return g;
}

export function buildPresents(n = 6, radius = 1.15) {
  const g = new THREE.Group(); const wraps = [0xc8102e, 0x1f7a3f, 0x2a7fd4, 0xe3b341, 0xf2f2f2, 0x8e44ad];
  for (let i = 0; i < n; i++) {
    const s = rand(0.22, 0.4), a = (i / n) * Math.PI * 2 + 0.4, r = radius + rand(-0.1, 0.25);
    const b = new THREE.Group(); const w = M({ color: wraps[i % wraps.length], roughness: .6 }), rib = M({ color: i % 2 ? 0xffd76a : 0xffffff, roughness: .4 });
    b.add(mesh(new RoundedBoxGeometry(s, s * 0.8, s, 2, 0.015), w, 0, s * 0.4, 0));
    b.add(mesh(new THREE.BoxGeometry(s * 1.02, s * 0.82, s * 0.14), rib, 0, s * 0.4, 0)); b.add(mesh(new THREE.BoxGeometry(s * 0.14, s * 0.82, s * 1.02), rib, 0, s * 0.4, 0));
    b.add(mesh(new THREE.TorusGeometry(s * 0.1, s * 0.03, 6, 12), rib, 0, s * 0.86, 0).rotateX(Math.PI / 2));
    b.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); b.rotation.y = rand(0, Math.PI); g.add(b);
  }
  return g;
}

export function buildWreath(r = 0.45) {
  const g = new THREE.Group(); const green = M({ color: 0x1f6b3a, roughness: .95 });
  g.add(mesh(new THREE.TorusGeometry(r, r * 0.28, 12, 36), green));
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; g.add(mesh(new THREE.SphereGeometry(r * 0.09, 8, 6), M({ color: i % 3 ? 0xd7263d : 0xe3b341, roughness: .3 }), Math.cos(a) * r * rand(0.8, 1.2), Math.sin(a) * r * rand(0.8, 1.2), r * 0.22)); }
  const bow = M({ color: 0xc8102e, roughness: .5 });
  g.add(mesh(new THREE.TorusGeometry(r * 0.2, r * 0.07, 8, 16), bow, -r * 0.18, -r * 0.95, r * 0.25)); g.add(mesh(new THREE.TorusGeometry(r * 0.2, r * 0.07, 8, 16), bow, r * 0.18, -r * 0.95, r * 0.25));
  g.add(mesh(new THREE.BoxGeometry(r * 0.12, r * 0.45, r * 0.05), bow, -r * 0.12, -r * 1.25, r * 0.25)); g.add(mesh(new THREE.BoxGeometry(r * 0.12, r * 0.45, r * 0.05), bow, r * 0.12, -r * 1.25, r * 0.25));
  return g;
}

// String lights hanging in a gentle sag between two points
export function buildStringLights(a, b, bulbs = 14, sag = 0.35, palette) {
  const g = new THREE.Group(); const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; const p = A.clone().lerp(B, t); p.y -= Math.sin(t * Math.PI) * sag; pts.push(p); }
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2a2a2a })));
  const colors = palette || [0xff5a5a, 0xffd36a, 0x7cff8a, 0x6ab7ff, 0xffffff];
  const bulbGeo = new THREE.SphereGeometry(0.035, 8, 6);
  for (let i = 0; i < bulbs; i++) { const t = (i + 0.5) / bulbs; const p = A.clone().lerp(B, t); p.y -= Math.sin(t * Math.PI) * sag + 0.05; const col = colors[i % colors.length]; const m = M({ color: col, emissive: col, emissiveIntensity: 1.8 }); const bm = new THREE.Mesh(bulbGeo, m); bm.position.copy(p); bm.userData.phase = i * 0.7; g.add(bm); }
  g.userData.twinkle = (time) => g.children.forEach(c => { if (c.userData.phase !== undefined) c.material.emissiveIntensity = 1.2 + Math.sin(time * 3 + c.userData.phase) * 0.8; });
  return g;
}

export function buildSnow(w = 10, h = 5, d = 3, count = 220) {
  const pos = new Float32Array(count * 3); for (let i = 0; i < count; i++) { pos[i * 3] = rand(-w / 2, w / 2); pos[i * 3 + 1] = rand(0, h); pos[i * 3 + 2] = rand(-d / 2, d / 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: .9, depthWrite: false }));
  pts.userData.update = (dt) => { const p = geo.attributes.position.array; for (let i = 0; i < count; i++) { p[i * 3 + 1] -= dt * (0.35 + (i % 5) * 0.08); p[i * 3] += Math.sin(p[i * 3 + 1] * 2 + i) * dt * 0.1; if (p[i * 3 + 1] < 0) p[i * 3 + 1] = h; } geo.attributes.position.needsUpdate = true; };
  return pts;
}

export function buildCounter() {
  const g = new THREE.Group(); const woodMat = M({ map: T.wood([2, 1]), color: 0x8a5a36, roughness: .7 });
  g.add(mesh(new RoundedBoxGeometry(2.2, 1.0, 0.7, 2, 0.03), woodMat, 0, 0.5, 0));
  g.add(mesh(new THREE.BoxGeometry(2.35, 0.05, 0.85), M({ color: 0x2d2d30, roughness: .35 }), 0, 1.02, 0));
  const reg = M({ color: 0x1d2330, roughness: .4 }); g.add(mesh(new RoundedBoxGeometry(0.34, 0.08, 0.3, 2, 0.02), reg, 0.6, 1.08, 0));
  const screen = mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ map: T.textDecal(["HAPPY", "HOLIDAYS"], { w: 384, h: 256, font: "bold 64px Arial", color: "#fff", bg: "#1f7a3f" }) }), 0.6, 1.24, 0.02); screen.rotation.x = -0.3; g.add(screen);
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 16), M({ color: 0xc8102e, roughness: .5 }), -0.7, 1.13, 0.05));  // candy jar
  return g;
}

export function buildRug(r = 1.9) {
  const g = new THREE.Group(); g.add(mesh(new THREE.CircleGeometry(r, 48), M({ color: 0x9b1b30, roughness: 1 }), 0, 0.006, 0).rotateX(-Math.PI / 2)); g.add(mesh(new THREE.RingGeometry(r * 0.82, r * 0.88, 48), M({ color: 0xe3b341, roughness: 1 }), 0, 0.008, 0).rotateX(-Math.PI / 2));
  g.children.forEach(c => c.castShadow = false); return g;
}

// ---------- Hanukkah ----------
const silver = () => M({ color: 0xd6d9df, roughness: .25, metalness: .9 });
export function buildMenorah() {
  const g = new THREE.Group(); const s = silver();
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.03, 32), s, 0, 0.015, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.34, 16), s, 0, 0.2, 0));
  const cups = [];
  for (let i = 1; i <= 4; i++) { const r = i * 0.075; const arc = mesh(new THREE.TorusGeometry(r, 0.008, 10, 40, Math.PI), s, 0, 0.3, 0); g.add(arc); cups.push([-r, 0.3], [r, 0.3]); }
  cups.push([0, 0.42]); g.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 12), s, 0, 0.36, 0));
  cups.forEach(([x, y], i) => {
    g.add(mesh(new THREE.CylinderGeometry(0.02, 0.014, 0.03, 16), s, x, y + 0.015, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.13, 12), M({ color: i % 2 ? 0x2d6bd6 : 0xf6f6f6, roughness: .6 }), x, y + 0.095, 0));
    const f = mesh(new THREE.ConeGeometry(0.012, 0.04, 8), M({ color: 0xffd36a, emissive: 0xff9a1f, emissiveIntensity: 2.2 }), x, y + 0.18, 0); f.userData.flame = Math.random() * 6; g.add(f);
  });
  const light = new THREE.PointLight(0xffb05a, 3, 4, 1.8); light.position.set(0, 0.6, 0.1); g.add(light);
  g.userData.flicker = (t) => g.children.forEach(c => { if (c.userData.flame !== undefined) { c.scale.y = 1 + Math.sin(t * 9 + c.userData.flame) * 0.18; c.material.emissiveIntensity = 2 + Math.sin(t * 7 + c.userData.flame) * 0.5; } });
  return g;
}
export function buildDreidel(color = 0x2d6bd6) {
  const g = new THREE.Group(); const mat = M({ color, roughness: .55 });
  g.add(mesh(new THREE.ConeGeometry(0.045, 0.04, 4), mat, 0, 0.02, 0).rotateY(Math.PI / 4).rotateX(Math.PI));
  const body = mesh(new THREE.BoxGeometry(0.064, 0.064, 0.064), mat, 0, 0.072, 0); g.add(body);
  g.add(mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 10), M({ color: 0xe9e9e9, roughness: .5 }), 0, 0.128, 0));
  const letters = ["נ", "ג", "ה", "ש"]; const faces = [[0, 0, 0.0325, 0], [0.0325, 0, 0, Math.PI / 2], [0, 0, -0.0325, Math.PI], [-0.0325, 0, 0, -Math.PI / 2]];
  faces.forEach(([x, y, z, ry], i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshBasicMaterial({ map: T.textDecal([letters[i]], { w: 128, h: 128, font: "bold 84px Arial", color: "#ffffff" }), transparent: true })); p.position.set(x, 0.072, z); p.rotation.y = ry; p.position.add(new THREE.Vector3(x, 0, z).normalize().multiplyScalar(0.001)); g.add(p); });
  return g;
}
export function buildStarOfDavid(r = 0.42, color = 0xd6d9df) {
  const g = new THREE.Group(); const mat = M({ color, roughness: .3, metalness: .85 });
  const tri = (rot) => { const s = new THREE.Shape(); for (let i = 0; i < 3; i++) { const a = rot + i * Math.PI * 2 / 3; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath();
    const inner = new THREE.Path(); for (let i = 0; i < 3; i++) { const a = rot + i * Math.PI * 2 / 3; const x = Math.cos(a) * r * 0.78, y = Math.sin(a) * r * 0.78; i ? inner.lineTo(x, y) : inner.moveTo(x, y); } inner.closePath(); s.holes.push(inner);
    return mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), mat); };
  g.add(tri(Math.PI / 2)); g.add(tri(-Math.PI / 2));
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(mesh(new THREE.SphereGeometry(0.02, 8, 6), M({ color: 0xbfe0ff, emissive: 0x7cc4ff, emissiveIntensity: 1.6 }), Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1, 0.02)); }
  return g;
}
export function buildGelt(n = 9) {
  const g = new THREE.Group(); const gold = M({ color: 0xf2c14e, roughness: .3, metalness: .8 });
  for (let i = 0; i < n; i++) { const c = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 20), gold, rand(-0.18, 0.18), 0.002 + (i % 3) * 0.004, rand(-0.12, 0.12)); c.rotation.y = rand(0, 3); g.add(c); }
  return g;
}
export function buildBanner(text, bg, color, w = 2.2, h = 0.45) {
  const m = mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: T.textDecal([text], { w: 1024, h: Math.round(1024 * h / w), font: `bold ${Math.round(120 * h / 0.45)}px Georgia`, color, bg }) })); m.castShadow = false; return m;
}
