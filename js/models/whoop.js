// WHOOP 5.0 with the SuperKnit Luxe band (Midnight with Titanium) on a wrist-form display.
import * as THREE from "three";
import { M, mesh, rbox, V, decal } from "./common.js";
import * as T from "../textures.js";

export function whoop() {
  const g = new THREE.Group();
  const chrome = M({ color: 0xd0d4da, roughness: .2, metalness: .95 });
  // base + post + horizontal wrist form (matte charcoal)
  g.add(mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.012, 40), M({ color: 0x1c1e24, roughness: .4, metalness: .3 }), 0, 0.006, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.11, 14), chrome, 0, 0.065, 0));
  const wrist = mesh(new THREE.CapsuleGeometry(0.03, 0.1, 8, 24), M({ color: 0x3a3d45, roughness: .85 }), 0, 0.15, 0); wrist.rotation.z = Math.PI / 2; g.add(wrist);
  // band: flat knitted loop around the wrist form (axis along X)
  const shape = new THREE.Shape(); shape.absarc(0, 0, 0.0365, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.031, 0, Math.PI * 2, true); shape.holes.push(hole);
  const band = mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.022, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, curveSegments: 64 }), M({ map: T.knit("#1d2538", "#4a5a84", [48, 2]), roughness: .9 }), 0.011, 0.15, 0);
  band.rotation.y = Math.PI / 2; g.add(band);
  // sensor pod on top of the band, rounded with a soft curve, tiny lens + LED
  const pod = mesh(rbox(0.034, 0.011, 0.026, 0.004, 4), M({ color: 0x15171c, roughness: .35, metalness: .25 }), 0, 0.15 + 0.0365 + 0.005, 0); g.add(pod);
  g.add(mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.002, 16), M({ color: 0x0a0b0e, roughness: .2, metalness: .6 }), 0.008, 0.15 + 0.0365 + 0.011, 0));
  g.add(mesh(new THREE.SphereGeometry(0.0016, 8, 8), M({ color: 0x4cff7a, emissive: 0x2bff66, emissiveIntensity: 3 }), -0.009, 0.15 + 0.0365 + 0.0115, 0.006));
  g.add(decal(T.textDecal(["WHOOP"], { w: 512, h: 160, font: "bold 110px Arial", color: "#cfd3dc" }), 0.018, 0.0056, 0, 0.15 + 0.0365 + 0.0112, 0, V(0, 1, 0)));
  // titanium hardware: hook clasp underneath and a slider on the side
  g.add(mesh(rbox(0.026, 0.004, 0.024, 0.0015), M({ color: 0xc7cbd3, roughness: .25, metalness: .95 }), 0, 0.15 - 0.0375, 0));
  g.add(mesh(new THREE.TorusGeometry(0.006, 0.0014, 8, 18), M({ color: 0xc7cbd3, roughness: .25, metalness: .95 }), 0.012, 0.15 - 0.0375, 0).rotateX(Math.PI / 2));
  g.add(mesh(rbox(0.024, 0.016, 0.006, 0.0015), M({ color: 0xc7cbd3, roughness: .25, metalness: .95 }), 0, 0.15, 0.0345));
  // small plaque
  const plaque = decal(T.textDecal(["WHOOP 5.0", "SuperKnit Luxe · Midnight"], { w: 768, h: 256, font: "bold 70px Arial", color: "#f4f5f8", bg: "#15171c" }), 0.14, 0.047, 0, 0.03, 0.075, V(0, 0.55, 1)); g.add(plaque);
  g.scale.setScalar(2.4); g.userData.height = 0.2 * 2.4; return g;
}
