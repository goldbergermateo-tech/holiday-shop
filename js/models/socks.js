// Del Campo "Smiley Lowcut" socks: two pairs, white ribbed, smiley on the ankle.
import * as THREE from "three";
import { M, mesh, V, sweep, decal } from "./common.js";
import * as T from "../textures.js";

export function socks() {
  const g = new THREE.Group(); const units = [];
  const cotton = M({ map: T.rib(), roughness: 1, side: THREE.DoubleSide });
  const face = T.smiley();
  // one sock lying on its side: ankle rises, foot flat, rounded toe, heel pocket
  const sock = (k) => {
    const s = new THREE.Group();
    const pts = [V(-0.02, 0.17, 0), V(-0.015, 0.1, 0), V(0, 0.045, 0), V(0.05, 0.03, 0), V(0.14, 0.03, 0), V(0.22, 0.032, 0), V(0.25, 0.034, 0)];
    const rad = t => t < 0.3 ? 0.036 : t < 0.45 ? 0.036 + (t - 0.3) * 0.12 : t < 0.9 ? 0.054 - (t - 0.45) * 0.02 : 0.045 - (t - 0.9) * 0.3;
    const geo = sweep(pts, rad, { segs: 56, radial: 24, rx: t => (t < 0.35 ? 1 : 1.25), ry: t => (t < 0.35 ? 1 : 0.68), capEnd: true, capStart: false, tension: 0.4 });
    s.add(mesh(geo, cotton));
    s.add(mesh(new THREE.TorusGeometry(0.034, 0.011, 10, 28), M({ color: 0xf2f2f2, roughness: 1 }), -0.02, 0.17, 0).rotateX(Math.PI / 2)); // thicker cuff
    const heel = mesh(new THREE.SphereGeometry(0.038, 18, 14), cotton, -0.012, 0.05, 0); heel.scale.set(1, 0.8, 1.1); s.add(heel);
    s.add(decal(face, 0.04, 0.04, k * 0.0375, 0.115, 0.0, V(k, 0, 0)));                            // smiley on the outer ankle
    s.add(decal(T.textDecal(["del campo"], { w: 512, h: 128, font: "italic bold 70px Arial", color: "#1a1a1a" }), 0.07, 0.0175, 0.12, 0.0, 0, V(0, -1, 0)));
    return s;
  };
  [[-0.2, 0.35], [0.2, -0.25]].forEach(([x, ry], i) => {
    const pair = new THREE.Group(); const a = sock(1), b = sock(-1); a.position.z = -0.07; b.position.z = 0.07; b.rotation.y = 0.12; pair.add(a, b); pair.position.x = x; pair.rotation.y = ry; g.add(pair); units.push(pair);
  });
  g.scale.setScalar(1.4); g.userData.height = 0.26 * 1.4; g.userData.units = units; return g;
}
