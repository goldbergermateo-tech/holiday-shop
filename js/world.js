// The shop itself: room, lights, decorations, display tables, products and their floating labels.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as T from "./textures.js";
import * as D from "./decor.js";
import { buildProduct, setDim } from "./models.js";
import { fmtPrice } from "./products.js";

const M = (o) => new THREE.MeshStandardMaterial(o);
const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };

export const ROOM = { w: 16, d: 12, h: 3.4 };
export const SPAWN = { pos: [0.6, 1.6, 5.2], yaw: 0.08 };

export function createWorld(scene, products, { shadows = true } = {}) {
  const colliders = [], pickables = [], groups = new Map(), labels = new Map(), banners = new Map(), animated = [];
  const addCollider = (cx, cz, hw, hd) => colliders.push(new THREE.Box3(new THREE.Vector3(cx - hw, 0, cz - hd), new THREE.Vector3(cx + hw, 3, cz + hd)));
  const { w, d, h } = ROOM;

  // --- room shell
  scene.background = new THREE.Color(0x0f1a2b); scene.fog = new THREE.Fog(0x0f1a2b, 14, 30);
  const floor = mesh(new THREE.PlaneGeometry(w, d), M({ map: T.wood([8, 6]), roughness: .75 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2; floor.castShadow = false; scene.add(floor);
  const wallMat = M({ map: T.wall("#f1e7d4"), roughness: .95 }); const wainscot = M({ color: 0x1f3d2b, roughness: .8 });
  const walls = [[0, h / 2, -d / 2, w, h, 0.2], [0, h / 2, d / 2, w, h, 0.2], [-w / 2, h / 2, 0, 0.2, h, d], [w / 2, h / 2, 0, 0.2, h, d]];
  walls.forEach(([x, y, z, sx, sy, sz]) => { const m = mesh(new THREE.BoxGeometry(sx, sy, sz), wallMat, x, y, z); m.castShadow = false; scene.add(m); const ws = mesh(new THREE.BoxGeometry(sx === 0.2 ? 0.26 : sx, 0.95, sz === 0.2 ? 0.26 : sz), wainscot, x, 0.475, z); ws.castShadow = false; scene.add(ws); });
  const ceiling = mesh(new THREE.PlaneGeometry(w, d), M({ color: 0xf7f2e8, roughness: 1 }), 0, h, 0); ceiling.rotation.x = Math.PI / 2; ceiling.castShadow = false; scene.add(ceiling);
  // front window (looking out onto snow) and door
  const glass = mesh(new THREE.PlaneGeometry(4.2, 1.7), M({ color: 0x9fc4ff, transparent: true, opacity: .18, roughness: .05 }), -4.2, 1.9, d / 2 - 0.11); glass.rotation.y = Math.PI; scene.add(glass);
  const night = mesh(new THREE.PlaneGeometry(4.2, 1.7), new THREE.MeshBasicMaterial({ color: 0x1b2a4a }), -4.2, 1.9, d / 2 + 0.3); night.rotation.y = Math.PI; scene.add(night);
  const frame = M({ color: 0xfefefe, roughness: .6 }); [[-4.2, 2.8, 4.4, 0.12], [-4.2, 1.0, 4.4, 0.12]].forEach(([x, y, lw, lh]) => scene.add(mesh(new THREE.BoxGeometry(lw, lh, 0.16), frame, x, y, d / 2 - 0.12)));
  [[-6.35], [-2.05], [-4.2]].forEach(([x]) => scene.add(mesh(new THREE.BoxGeometry(0.12, 1.9, 0.16), frame, x, 1.9, d / 2 - 0.12)));
  const snow = D.buildSnow(4.2, 2.2, 0.3, 160); snow.position.set(-4.2, 0.9, d / 2 + 0.15); scene.add(snow); animated.push(snow.userData.update);
  scene.add(mesh(new THREE.BoxGeometry(1.1, 2.3, 0.1), M({ color: 0x5a2d1a, roughness: .7 }), 3.0, 1.15, d / 2 - 0.12));   // door
  scene.add(mesh(new THREE.SphereGeometry(0.04, 10, 8), M({ color: 0xd4af37, metalness: .9, roughness: .3 }), 2.6, 1.1, d / 2 - 0.2));
  const sign = mesh(new THREE.PlaneGeometry(4.6, 0.7), new THREE.MeshBasicMaterial({ map: T.textDecal(["MATEO'S HOLIDAY SHOP"], { w: 1536, h: 234, font: "bold 110px Georgia", color: "#ffd76a", bg: "#1f3d2b" }) }), 0, 2.98, -d / 2 + 0.12); sign.castShadow = false; scene.add(sign);

  // --- lights
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a2a1a, 0.9));
  const key = new THREE.DirectionalLight(0xffe9c8, 1.6); key.position.set(4, 6, 3); key.castShadow = shadows; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -9; key.shadow.camera.right = 9; key.shadow.camera.top = 9; key.shadow.camera.bottom = -9; key.shadow.camera.far = 20; key.shadow.bias = -0.0005; scene.add(key);
  [[-5, 0], [0, -2.5], [5, 0], [0, 3.5]].forEach(([x, z]) => {
    const lamp = new THREE.PointLight(0xffd9a8, 8, 9, 1.8); lamp.position.set(x, h - 0.5, z); scene.add(lamp);
    const shade = mesh(new THREE.ConeGeometry(0.28, 0.25, 20, 1, true), M({ color: 0x2a2a2a, side: THREE.DoubleSide, roughness: .5 }), x, h - 0.45, z); shade.castShadow = false; scene.add(shade);
    scene.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6), M({ color: 0x222 }), x, h - 0.2, z));
    scene.add(mesh(new THREE.SphereGeometry(0.06, 10, 8), M({ color: 0xfff3d6, emissive: 0xffe2a8, emissiveIntensity: 2 }), x, h - 0.56, z));
  });

  // --- decor
  const tree = D.buildTree(2.6); tree.position.set(0, 0, -0.8); scene.add(tree); addCollider(0, -0.8, 1.05, 1.05);
  const presents = D.buildPresents(7, 1.25); presents.position.copy(tree.position); scene.add(presents);
  const rug = D.buildRug(2.1); rug.position.copy(tree.position); scene.add(rug);
  const wreath = D.buildWreath(0.5); wreath.position.set(w / 2 - 0.15, 2.2, 0); wreath.rotation.y = -Math.PI / 2; scene.add(wreath);
  const star = D.buildStarOfDavid(0.42); star.position.set(-w / 2 + 0.12, 2.2, 0); star.rotation.y = Math.PI / 2; scene.add(star);
  const hb = D.buildBanner("HAPPY HANUKKAH", "#0f3d91", "#ffffff", 2.4, 0.5); hb.position.set(-w / 2 + 0.12, 2.45, 3.3); hb.rotation.y = Math.PI / 2; scene.add(hb);
  const cb = D.buildBanner("MERRY CHRISTMAS", "#8b0f1f", "#ffd76a", 2.6, 0.5); cb.position.set(w / 2 - 0.12, 2.45, 3.3); cb.rotation.y = -Math.PI / 2; scene.add(cb);
  const htable = new THREE.Group(); htable.position.set(-4.9, 0, 3.5); scene.add(htable); addCollider(-4.9, 3.5, 0.7, 0.7);
  htable.add(mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 36), M({ color: 0x1a2a4a, roughness: .5 }), 0, 0.875, 0)); htable.add(mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.85, 16), M({ color: 0xd6d9df, roughness: .3, metalness: .8 }), 0, 0.425, 0)); htable.add(mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.03, 24), M({ color: 0xd6d9df, roughness: .3, metalness: .8 }), 0, 0.015, 0));
  const menorah = D.buildMenorah(); menorah.position.set(0, 0.9, -0.05); menorah.rotation.y = 0.8; htable.add(menorah); animated.push((dt, t) => menorah.userData.flicker(t));
  [[0.3, 0.25, 0x2d6bd6, 0.4], [-0.32, 0.3, 0xd6d9df, -0.6], [0.05, 0.42, 0x1a2a4a, 1.9]].forEach(([x, z, c, ry]) => { const d = D.buildDreidel(c); d.position.set(x, 0.9, z); d.rotation.y = ry; htable.add(d); });
  const gelt = D.buildGelt(10); gelt.position.set(-0.05, 0.9, 0.15); htable.add(gelt);
  const counter = D.buildCounter(); counter.position.set(5.2, 0, 4.6); counter.rotation.y = Math.PI; scene.add(counter); addCollider(5.2, 4.6, 1.2, 0.45);
  const strands = [[[-7.6, 3.1, -5.6], [-0.2, 3.1, -5.6]], [[0.2, 3.1, -5.6], [7.6, 3.1, -5.6]], [[-7.6, 3.1, -5.4], [-7.6, 3.1, 5.4]], [[7.6, 3.1, -5.4], [7.6, 3.1, 5.4]], [[-7.6, 3.1, 5.6], [7.6, 3.1, 5.6]]];
  strands.forEach(([a, b], i) => { const s = D.buildStringLights(a, b, 16, 0.3, i === 2 ? [0x6ab7ff, 0xffffff] : undefined); scene.add(s); animated.push((dt, t) => s.userData.twinkle(t)); });

  // --- products on display furniture
  const tableTop = M({ map: T.wood([2, 2]), color: 0xa57a4f, roughness: .6 }), tableLeg = M({ color: 0x2b2b2e, roughness: .5, metalness: .4 });
  products.forEach(p => {
    const g = buildProduct(p); const [x, , z] = p.pos; const onFloor = !!g.userData.onFloor;
    let baseY = 0;
    if (onFloor) { addCollider(x, z, 0.8, 0.45); }
    else if (p.model === "boots") { const plat = mesh(new RoundedBoxGeometry(1.2, 0.3, 0.9, 2, 0.03), M({ color: 0xf4f6fa, roughness: 1 }), x, 0.15, z); scene.add(plat); baseY = 0.3; addCollider(x, z, 0.65, 0.5); }
    else { scene.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 36), tableTop, x, 0.875, z)); scene.add(mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.85, 16), tableLeg, x, 0.425, z)); scene.add(mesh(new THREE.CylinderGeometry(0.32, 0.34, 0.03, 24), tableLeg, x, 0.015, z)); baseY = 0.9; addCollider(x, z, 0.6, 0.6); }
    g.position.set(x, baseY, z); g.rotation.y = p.rot || 0; scene.add(g); groups.set(p.id, g);
    g.traverse(o => { if (o.isMesh) pickables.push(o); });
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.labelTexture(p.name, fmtPrice(p), "Available", "ok"), transparent: true, depthTest: false }));
    label.scale.set(1.15, 0.5, 1); label.position.set(x, baseY + g.userData.height + 0.3, z); label.renderOrder = 10; scene.add(label); labels.set(p.id, label);
    const banner = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.claimedBanner(), transparent: true, depthTest: false })); banner.scale.set(0.9, 0.22, 1); banner.position.set(x, baseY + g.userData.height * 0.55, z); banner.visible = false; banner.renderOrder = 11; scene.add(banner); banners.set(p.id, banner);
  });

  function setStatus(p, { remaining, total, claimedUnits = 0 }) {
    const label = labels.get(p.id), g = groups.get(p.id), banner = banners.get(p.id); if (!label) return;
    let text, kind;
    if (remaining === Infinity) { text = "Always available"; kind = "ok"; }
    else if (remaining <= 0) { text = "Claimed"; kind = "gone"; }
    else if (total > 1) { text = `${remaining} of ${total} left`; kind = "some"; }
    else { text = "Available"; kind = "ok"; }
    label.material.map?.dispose(); label.material.map = T.labelTexture(p.name, fmtPrice(p), text, kind); label.material.needsUpdate = true;
    banner.visible = remaining !== Infinity && remaining <= 0;
    if (g.userData.units) g.userData.units.forEach((u, i) => setDim(u, i < claimedUnits));
    else setDim(g, remaining !== Infinity && remaining <= 0);
  }

  const bounds = { minX: -w / 2 + 0.5, maxX: w / 2 - 0.5, minZ: -d / 2 + 0.5, maxZ: d / 2 - 0.5 };
  return { colliders, pickables, groups, labels, bounds, setStatus, update: (dt, t) => animated.forEach(f => f(dt, t)) };
}
