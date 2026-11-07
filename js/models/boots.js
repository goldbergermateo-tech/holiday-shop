// Salomon Crosstrak Powder Waterproof: high-cut winter boots on a snowy platform.
import * as THREE from "three";
import { M, mesh, rbox, V, sweep, decal } from "./common.js";
import * as T from "../textures.js";

export function boots() {
  const g = new THREE.Group();
  const rubber = M({ color: 0x17181b, roughness: .95 }), upper = M({ map: T.ripstop(), roughness: .85, side: THREE.DoubleSide }), rand = M({ color: 0x24262b, roughness: .9, side: THREE.DoubleSide });
  const grey = M({ color: 0x8d9299, roughness: .5 }), lace = M({ color: 0x2c2f36, roughness: .6 });
  const boot = (k) => {
    const b = new THREE.Group();
    // lugged outsole: extruded footprint + lug blocks around the edge
    const o = new THREE.Shape(); o.moveTo(-0.15, -0.045); o.lineTo(0.07, -0.056); o.quadraticCurveTo(0.18, -0.05, 0.18, 0); o.quadraticCurveTo(0.18, 0.05, 0.07, 0.056); o.lineTo(-0.15, 0.045); o.quadraticCurveTo(-0.185, 0.03, -0.185, 0); o.quadraticCurveTo(-0.185, -0.03, -0.15, -0.045);
    const sole = mesh(new THREE.ExtrudeGeometry(o, { depth: 0.035, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, curveSegments: 14 }), rubber); sole.rotation.x = -Math.PI / 2; sole.position.y = 0.0; b.add(sole);
    for (let i = 0; i < 9; i++) { const x = -0.16 + i * 0.04; for (const z of [-0.036, 0.036]) b.add(mesh(new THREE.BoxGeometry(0.028, 0.012, 0.016), rubber, x, 0.002, z * (1 - Math.abs(x) * 0.6 * (x > 0.1 ? 1 : 0)))); }
    // upper: swept shell from toe over the instep, around the heel and up the shaft
    const pts = [V(0.17, 0.065, 0), V(0.12, 0.075, 0), V(0.04, 0.09, 0), V(-0.06, 0.1, 0), V(-0.13, 0.12, 0), V(-0.125, 0.2, 0), V(-0.105, 0.3, 0)];
    const rad = t => t < 0.12 ? 0.03 + t * 0.25 : t < 0.5 ? 0.06 : t < 0.7 ? 0.064 : 0.066;
    b.add(mesh(sweep(pts, rad, { segs: 60, radial: 28, rx: t => (t < 0.55 ? 0.9 : 1), ry: t => (t < 0.55 ? 0.72 : 1), capStart: true, capEnd: false, tension: 0.35 }), upper));
    // rubber rand around the lower foot (bottom half of the section only)
    b.add(mesh(sweep(pts.slice(0, 5), t => 0.062 + t * 0.004, { segs: 30, radial: 16, rx: 0.93, ry: 0.5, thetaStart: Math.PI, thetaLength: Math.PI, capStart: true, capEnd: false, tension: 0.35 }), rand));
    // padded collar, pull loop, tongue, quicklace with eyelets
    b.add(mesh(new THREE.TorusGeometry(0.058, 0.016, 12, 30), rand, -0.105, 0.305, 0).rotateX(Math.PI / 2));
    b.add(mesh(rbox(0.03, 0.05, 0.012, 0.004), grey, -0.17, 0.3, 0));
    b.add(mesh(rbox(0.07, 0.14, 0.03, 0.01), rand, -0.045, 0.22, 0).rotateZ(0.55));
    for (let i = 0; i < 5; i++) { const x = 0.02 - i * 0.03, y = 0.135 + i * 0.03; const l = mesh(new THREE.TorusGeometry(0.03 + i * 0.004, 0.0035, 6, 18), lace, x, y, 0); l.rotation.y = Math.PI / 2; l.rotation.x = 0.5 - i * 0.08; b.add(l); for (const z of [-1, 1]) b.add(mesh(new THREE.TorusGeometry(0.005, 0.0015, 6, 12), grey, x, y, z * (0.03 + i * 0.004)).rotateY(Math.PI / 2)); }
    b.add(mesh(rbox(0.03, 0.01, 0.014, 0.003), grey, -0.1, 0.27, 0.0));                           // lace garage
    const logo = decal(T.textDecal(["SALOMON"], { w: 640, h: 128, font: "bold 96px Arial", color: "#b9bec6", italic: true }), 0.13, 0.026, 0.0, 0.093, k * 0.058, V(0, 0.15, k)); b.add(logo);
    b.add(decal(T.textDecal(["Contagrip"], { w: 512, h: 128, font: "bold 70px Arial", color: "#8d9299" }), 0.06, 0.015, -0.14, 0.03, k * 0.053, V(0, 0, k)));
    return b;
  };
  const l = boot(1), r = boot(-1); l.position.z = -0.085; r.position.z = 0.085; r.rotation.y = -0.14; g.add(l, r);
  // a little snow on the platform
  for (let i = 0; i < 7; i++) { const s = mesh(new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 10, 8), M({ color: 0xffffff, roughness: 1 }), -0.25 + Math.random() * 0.5, 0, -0.22 + Math.random() * 0.44); s.scale.y = 0.4; g.add(s); }
  g.scale.setScalar(1.75); g.userData.height = 0.34 * 1.75; return g;
}
