// Procedural 3D models of each gift. Every mesh carries userData.productId for picking.
import { whoop } from "./models/whoop.js";
import { hoodie } from "./models/hoodie.js";
import { golfballs } from "./models/golf.js";
import { socks } from "./models/socks.js";
import { boots } from "./models/boots.js";
import { giftcard } from "./models/giftcard.js";

const builders = { whoop, hoodie, golfballs, socks, boots, giftcard };

export function buildProduct(product) {
  const g = builders[product.model](); g.userData.productId = product.id;
  g.traverse(o => { if (o.isMesh) { o.userData.productId = product.id; o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// Dim a model (or one of its units) to show it is taken
export function setDim(obj, dim) {
  obj.traverse(o => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach(m => { if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity; m.transparent = dim || m.userData.baseOpacity < 1; m.opacity = dim ? m.userData.baseOpacity * 0.3 : m.userData.baseOpacity; m.needsUpdate = true; });
  });
}
