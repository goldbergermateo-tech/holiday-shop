// Duke Stores gift card on an acrylic easel, virtual certificate fanned behind it.
import * as THREE from "three";
import { M, mesh, rbox, V, decal } from "./common.js";
import * as T from "../textures.js";

export function giftcard() {
  const g = new THREE.Group();
  const acrylic = M({ color: 0xe8eef7, transparent: true, opacity: .4, roughness: .05 });
  const tilt = -0.3, navy = M({ color: 0x012169, roughness: .5 });
  const back = mesh(new THREE.BoxGeometry(0.3, 0.24, 0.006), acrylic, 0, 0.125, -0.025); back.rotation.x = tilt; g.add(back);
  g.add(mesh(new THREE.BoxGeometry(0.3, 0.006, 0.09), acrylic, 0, 0.003, 0.015));
  const card = (texUrl, x, y, z, rot) => { const c = mesh(rbox(0.34, 0.217, 0.008, 0.012), [navy, navy, navy, navy, M({ map: T.imageTexture(texUrl), roughness: .45 }), navy], x, y, z); c.rotation.x = tilt; c.rotation.z = rot; return c; };
  g.add(card("assets/img/tex_dukecert.jpg", 0.06, 0.135, -0.012, 0.12));
  g.add(card("assets/img/tex_dukecard.jpg", 0, 0.125, 0, 0));
  const tag = decal(T.textDecal(["ANY AMOUNT"], { w: 512, h: 160, font: "bold 80px Arial", color: "#fff", bg: "#c8102e" }), 0.16, 0.05, 0.11, 0.25, 0.015, V(0, 0.3, 1)); g.add(tag);
  g.scale.setScalar(1.7); g.userData.height = 0.3 * 1.7; return g;
}
