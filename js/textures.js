// Procedural canvas textures so the site needs no texture downloads.
import * as THREE from "three";

function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
function tex(c, repeat) {
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

export function houndstooth(colA = "#6f8fc9", colB = "#3f5f9c", cell = 16, repeat = [6, 8]) {
  const [c, g] = canvas(cell * 4, cell * 4); g.fillStyle = colA; g.fillRect(0, 0, c.width, c.height); g.fillStyle = colB;
  const s = cell;
  // classic houndstooth tile drawn with polygons over a 4x4 cell grid
  const poly = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0] * s, p[1] * s) : g.moveTo(p[0] * s, p[1] * s)); g.closePath(); g.fill(); };
  for (const [ox, oy] of [[0, 0], [2, 2]]) {
    g.save(); g.translate(ox * s, oy * s);
    poly([[0, 0], [1, 0], [1, 1], [0, 1]]); poly([[1, 1], [2, 1], [2, 2], [1, 2]]);
    poly([[0, 1], [1, 2], [0, 3]]); poly([[1, 0], [3, 0], [2, 1]]);
    poly([[2, 1], [3, 0], [4, 0], [4, 1], [3, 2], [2, 2]]); poly([[1, 2], [2, 2], [2, 4], [1, 4], [1, 3], [0, 3]]);
    g.restore();
  }
  return tex(c, repeat);
}

export function knit(base = "#1c2233", light = "#2d364d", repeat = [40, 4]) {
  const [c, g] = canvas(64, 64); g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = light; g.lineWidth = 3; g.lineCap = "round";
  for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) {
    g.beginPath(); g.moveTo(x, y + 6); g.quadraticCurveTo(x + 4, y - 2, x + 8, y + 6); g.stroke();
  }
  return tex(c, repeat);
}

export function wood(repeat = [8, 8]) {
  const [c, g] = canvas(512, 512); g.fillStyle = "#b98a5e"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) {
    const y = i * 64; g.fillStyle = i % 2 ? "#b4845a" : "#c29468"; g.fillRect(0, y, 512, 64);
    g.strokeStyle = "rgba(90,50,20,.25)"; g.lineWidth = 2;
    for (let k = 0; k < 6; k++) { g.beginPath(); const yy = y + 8 + k * 9 + Math.random() * 4; g.moveTo(0, yy); for (let x = 0; x <= 512; x += 32) g.lineTo(x, yy + Math.sin(x / 40 + i) * 2); g.stroke(); }
    g.fillStyle = "rgba(60,30,10,.45)"; g.fillRect(0, y, 512, 2);
    const seam = (i * 173) % 512; g.fillRect(seam, y, 2, 64);
  }
  const t = tex(c, repeat); return t;
}

export function wall(color = "#f3ead9") {
  const [c, g] = canvas(256, 256); g.fillStyle = color; g.fillRect(0, 0, 256, 256);
  const img = g.getImageData(0, 0, 256, 256); for (let i = 0; i < img.data.length; i += 4) { const n = (Math.random() - .5) * 10; img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n; }
  g.putImageData(img, 0, 0); return tex(c, [4, 2]);
}

export function dimples() {
  const [c, g] = canvas(256, 128); g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 128);
  for (let y = 0; y < 128; y += 12) for (let x = (y / 12 % 2) * 6; x < 256; x += 12) {
    const r = g.createRadialGradient(x, y, 0, x, y, 5); r.addColorStop(0, "#404040"); r.addColorStop(1, "#808080");
    g.fillStyle = r; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
}

export function golfBox(face) {
  // Kirkland-style black box with red diagonal stripes; face: "front" | "side" | "top"
  const W = face === "front" ? 512 : 256, H = face === "top" ? 256 : 384;
  const [c, g] = canvas(W, H); g.fillStyle = "#111214"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(200,16,46,.55)"; g.lineWidth = 4;
  for (let i = -H; i < W + H; i += 28) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); }
  g.fillStyle = "#c8102e"; g.fillRect(W * .08, H * .09, W * .34, H * .13);
  g.fillStyle = "#fff"; g.font = `bold ${Math.round(H * .075)}px Arial`; g.textBaseline = "middle"; g.fillText("KIRKLAND", W * .11, H * .155);
  g.font = `${Math.round(H * .04)}px Arial`; g.fillText("Signature", W * .11, H * .20);
  if (face === "front") {
    g.fillStyle = "#fff"; g.font = `bold ${Math.round(H * .11)}px Arial`; g.fillText("GOLF BALL", W * .08, H * .36); g.font = `bold ${Math.round(H * .05)}px Arial`; g.fillText("v3.0  ·  3-PIECE URETHANE COVER", W * .08, H * .46);
    g.font = `bold ${Math.round(H * .16)}px Arial`; g.fillText("24", W * .08, H * .70); g.font = `${Math.round(H * .045)}px Arial`; g.fillText("TOTAL BALLS · 2 DOZEN", W * .08, H * .82);
    // ball
    const bx = W * .76, by = H * .55, br = H * .19; const r = g.createRadialGradient(bx - br * .3, by - br * .3, br * .1, bx, by, br); r.addColorStop(0, "#f5ff6a"); r.addColorStop(1, "#b9c91a");
    g.fillStyle = r; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#111"; g.font = `bold ${Math.round(H * .045)}px Arial`; g.textAlign = "center"; g.fillText("KIRKLAND", bx, by);
  } else if (face === "side") { g.fillStyle = "#fff"; g.font = `bold ${Math.round(H * .07)}px Arial`; g.save(); g.translate(W * .5, H * .62); g.rotate(-Math.PI / 2); g.textAlign = "center"; g.fillText("GOLF BALL v3.0", 0, 0); g.restore(); }
  return tex(c);
}

export function textDecal(lines, { w = 512, h = 256, bg = "rgba(0,0,0,0)", color = "#fff", font = "bold 60px Arial", italic = false } = {}) {
  const [c, g] = canvas(w, h); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = color; g.font = (italic ? "italic " : "") + font; g.textAlign = "center"; g.textBaseline = "middle";
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * parseInt(font.match(/(\d+)px/)[1]) * 1.15));
  const t = tex(c); return t;
}

export function smiley() {
  const [c, g] = canvas(128, 128); g.clearRect(0, 0, 128, 128); g.strokeStyle = "#111"; g.lineWidth = 7; g.lineCap = "round";
  g.beginPath(); g.arc(64, 64, 44, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#111"; g.beginPath(); g.arc(48, 52, 6, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(80, 52, 6, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(64, 68, 24, Math.PI * .15, Math.PI * .85); g.stroke();
  return tex(c);
}

export function imageTexture(url) {
  const t = new THREE.TextureLoader().load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// Floating label above a product: name, price, status pill
export function labelTexture(title, price, status, statusKind) {
  const [c, g] = canvas(512, 224); g.clearRect(0, 0, 512, 224);
  const r = 28; g.fillStyle = "rgba(20,28,46,.86)"; g.beginPath(); g.roundRect(8, 8, 496, 180, r); g.fill();
  g.beginPath(); g.moveTo(236, 188); g.lineTo(276, 188); g.lineTo(256, 214); g.closePath(); g.fill();
  g.fillStyle = "#fff"; g.font = "bold 34px Arial"; g.textAlign = "center"; g.textBaseline = "middle";
  const words = title.split(" "); const lines = []; let cur = "";
  for (const w of words) { if (g.measureText(cur + " " + w).width > 460 && cur) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }
  lines.push(cur); const shown = lines.slice(0, 2); if (lines.length > 2) shown[1] += "…";
  shown.forEach((l, i) => g.fillText(l, 256, 52 + i * 40 - (shown.length - 1) * 18));
  g.font = "bold 32px Arial"; g.fillStyle = "#ffd76a"; g.fillText(price, 150, 146);
  const colors = { ok: "#2eaa5c", some: "#e0a62b", gone: "#d7263d" }; g.fillStyle = colors[statusKind] || colors.ok;
  g.beginPath(); g.roundRect(250, 124, 240, 44, 22); g.fill(); g.fillStyle = "#fff"; g.font = "bold 26px Arial"; g.fillText(status, 370, 146);
  return tex(c);
}

export function claimedBanner(text = "CLAIMED") {
  const [c, g] = canvas(512, 128); g.fillStyle = "#d7263d"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#fff"; g.font = "bold 86px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 256, 66);
  return tex(c);
}

// Round embroidered badge (championship logo stand-in)
export function badge(top, middle, bottom) {
  const [c, g] = canvas(256, 256); g.clearRect(0, 0, 256, 256);
  g.fillStyle = "#f7f7f2"; g.beginPath(); g.arc(128, 128, 118, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#1d2d5a"; g.lineWidth = 10; g.beginPath(); g.arc(128, 128, 110, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#1d2d5a"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "bold 30px Georgia"; g.fillText(top, 128, 78); g.font = "bold 40px Georgia"; g.fillText(middle, 128, 128); g.font = "bold 22px Arial"; g.fillText(bottom, 128, 172);
  g.fillStyle = "#c8102e"; g.beginPath(); g.moveTo(108, 205); g.lineTo(148, 205); g.lineTo(128, 225); g.closePath(); g.fill();
  return tex(c);
}

// Ribbed white sock fabric
export function rib() {
  const [c, g] = canvas(128, 128); g.fillStyle = "#f6f6f4"; g.fillRect(0, 0, 128, 128);
  for (let x = 0; x < 128; x += 8) { g.fillStyle = "rgba(0,0,0,.07)"; g.fillRect(x, 0, 3, 128); g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(x + 4, 0, 2, 128); }
  return tex(c, [6, 3]);
}
// Golf ball sleeve art (white with yellow band)
export function sleeve() {
  const [c, g] = canvas(128, 384); g.fillStyle = "#f4f4f2"; g.fillRect(0, 0, 128, 384); g.fillStyle = "#111214"; g.fillRect(0, 0, 128, 70); g.fillStyle = "#e6f23a"; g.fillRect(0, 70, 128, 14);
  g.fillStyle = "#c8102e"; g.font = "bold 22px Arial"; g.fillText("KIRKLAND", 8, 30); g.fillStyle = "#fff"; g.font = "16px Arial"; g.fillText("Signature", 8, 52);
  g.fillStyle = "#111"; g.font = "bold 26px Arial"; g.save(); g.translate(64, 230); g.rotate(-Math.PI / 2); g.textAlign = "center"; g.fillText("GOLF BALL v3.0", 0, 8); g.restore();
  return tex(c);
}

// Dark ripstop nylon for the boot upper
export function ripstop() {
  const [c, g] = canvas(128, 128); g.fillStyle = "#2a2d33"; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 1; for (let i = 0; i <= 128; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); }
  return tex(c, [6, 6]);
}
