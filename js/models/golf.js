// Kirkland Signature V3.0 yellow golf balls, 2-dozen box with loose balls and a sleeve.
import * as THREE from "three";
import { M, mesh, rbox, V } from "./common.js";
import * as T from "../textures.js";

export function golfballs() {
  const g = new THREE.Group();
  const black = M({ color: 0x0f1012, roughness: .55 });
  const box = mesh(new THREE.BoxGeometry(0.42, 0.3, 0.14), [M({ map: T.golfBox("side") }), M({ map: T.golfBox("side") }), M({ map: T.golfBox("top") }), black, M({ map: T.golfBox("front") }), M({ map: T.golfBox("front") })], 0.02, 0.15, -0.08);
  box.rotation.y = -0.22; g.add(box);
  const ballMat = M({ color: 0xe6f23a, roughness: .5, bumpMap: T.dimples(), bumpScale: 0.003 });
  const ball = (x, z) => { const b = mesh(new THREE.SphereGeometry(0.0427, 40, 28), ballMat, x, 0.0427, z); b.rotation.set(Math.random() * 3, Math.random() * 3, 0); g.add(b); };
  ball(-0.2, 0.1); ball(-0.11, 0.17); ball(0.17, 0.12); ball(0.24, 0.03);
  // open sleeve showing two balls
  const sleeve = new THREE.Group(); sleeve.position.set(0.03, 0.045, 0.14); sleeve.rotation.y = 0.5; sleeve.rotation.z = Math.PI / 2;
  const sl = mesh(new THREE.BoxGeometry(0.09, 0.27, 0.09), [M({ map: T.sleeve() }), M({ map: T.sleeve() }), black, black, M({ map: T.sleeve() }), M({ map: T.sleeve() })]); sleeve.add(sl);
  sleeve.add(mesh(new THREE.SphereGeometry(0.0427, 32, 24), ballMat, 0, 0.17, 0));
  g.add(sleeve);
  g.userData.height = 0.42; return g;
}
