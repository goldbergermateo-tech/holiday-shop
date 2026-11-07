// Peter Millar 127th U.S. Open "Pine" performance hoodie, Bali Blue, hanging on a rack.
import * as THREE from "three";
import { M, mesh, rbox, V, sweep, decal } from "./common.js";
import * as T from "../textures.js";

export function hoodie() {
  const g = new THREE.Group();
  const chrome = M({ color: 0xcfd3d8, roughness: .25, metalness: .9 });
  for (const x of [-0.55, 0.55]) { g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.75, 12), chrome, x, 0.875, 0)); g.add(mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.02, 24), chrome, x, 0.01, 0)); }
  const bar = mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.14, 12), chrome, 0, 1.75, 0); bar.rotation.z = Math.PI / 2; g.add(bar);
  // wooden hanger
  const wood = M({ color: 0x8a5a36, roughness: .6 });
  g.add(mesh(new THREE.TorusGeometry(0.03, 0.004, 8, 16, Math.PI), chrome, 0, 1.745, 0));
  for (const s of [-1, 1]) { const arm = mesh(rbox(0.26, 0.022, 0.012, 0.005), wood, s * 0.115, 1.655, 0); arm.rotation.z = s * 0.28; g.add(arm); }
  // fabric: fine micro-houndstooth so it reads as heathered light blue up close and solid from afar
  const fabric = M({ map: T.houndstooth("#8ea9d9", "#6d8bc4", 8, [28, 36]), roughness: 1 });
  const dark = M({ color: 0x5f7bb3, roughness: 1 });
  // torso: extruded silhouette with sloped shoulders
  const s = new THREE.Shape(); s.moveTo(-0.24, 0); s.lineTo(0.24, 0); s.lineTo(0.255, 0.42); s.quadraticCurveTo(0.26, 0.55, 0.19, 0.6); s.lineTo(0.08, 0.63); s.quadraticCurveTo(0, 0.64, -0.08, 0.63); s.lineTo(-0.19, 0.6); s.quadraticCurveTo(-0.26, 0.55, -0.255, 0.42); s.closePath();
  const torso = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.13, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 5, curveSegments: 12 }), fabric, 0, 1.0, -0.065); g.add(torso);
  g.add(mesh(rbox(0.5, 0.06, 0.2, 0.02), dark, 0, 1.0, 0));                                           // ribbed hem
  // sleeves: swept tubes hanging from the shoulders with a slight bend at the elbow
  for (const k of [-1, 1]) {
    const pts = [V(k * 0.2, 1.6, 0), V(k * 0.3, 1.5, 0.01), V(k * 0.335, 1.3, 0.02), V(k * 0.325, 1.12, 0.03), V(k * 0.31, 1.0, 0.04)];
    g.add(mesh(sweep(pts, t => 0.075 - t * 0.02, { segs: 24, radial: 18, capEnd: false, capStart: true }), fabric));
    g.add(mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 24), dark, k * 0.31, 0.985, 0.04).rotateX(Math.PI / 2)); // cuff
  }
  // hood: a thick half-torus behind the neck plus a dark inner lining
  const hood = mesh(new THREE.TorusGeometry(0.13, 0.055, 14, 28, Math.PI), fabric, 0, 1.6, -0.03); hood.rotation.x = -0.25; g.add(hood);
  const lining = mesh(new THREE.CircleGeometry(0.1, 24), M({ color: 0x4e6aa3, roughness: 1, side: THREE.DoubleSide }), 0, 1.6, -0.03); lining.rotation.x = -0.25; g.add(lining);
  // kangaroo pocket with seam lines, drawstrings, embroidered championship logo
  g.add(mesh(rbox(0.3, 0.17, 0.025, 0.012), fabric, 0, 1.12, 0.08));
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.004, 0.027), dark, 0, 1.205, 0.08));
  for (const k of [-1, 1]) { g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.24, 6), M({ color: 0xf4f4f4, roughness: .8 }), k * 0.045, 1.44, 0.085)); g.add(mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.02, 6), M({ color: 0xd9d9d9, metalness: .6, roughness: .3 }), k * 0.045, 1.315, 0.085)); }
  g.add(decal(T.badge("127th", "U.S. OPEN", "PEBBLE BEACH"), 0.075, 0.075, -0.13, 1.46, 0.088));
  g.userData.height = 1.85; g.userData.onFloor = true; return g;
}
