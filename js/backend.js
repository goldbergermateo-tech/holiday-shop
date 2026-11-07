// Claims storage. Two adapters with the same shape:
//   firebase  -> shared live across everyone (needs window.FIREBASE_CONFIG)
//   local     -> this browser only (demo mode), synced across tabs via BroadcastChannel
// claims shape: { [productId]: { [claimId]: { name, note, at } } }

export function createBackend(registryId) {
  const cfg = window.FIREBASE_CONFIG;
  if (cfg && window.firebase && typeof window.firebase.initializeApp === "function") {
    try { return firebaseBackend(cfg, registryId); }
    catch (e) { console.warn("Firebase failed, using local mode", e); }
  }
  return localBackend(registryId);
}

function firebaseBackend(cfg, registryId) {
  const app = window.firebase.initializeApp(cfg);
  const db = window.firebase.database(app);
  const ref = db.ref(`registries/${registryId}/claims`);
  return {
    mode: "firebase",
    subscribe(cb) {
      const handler = ref.on("value", snap => cb(snap.val() || {}), err => { console.error(err); cb({}, err); });
      return () => ref.off("value", handler);
    },
    async claim(productId, { name, note }) {
      const child = ref.child(productId).push();
      await child.set({ name, note: note || "", at: Date.now() });
      return child.key;
    },
    async release(productId, claimId) {
      await ref.child(productId).child(claimId).remove();
    },
  };
}

function localBackend(registryId) {
  const KEY = `holiday-store:${registryId}`;
  const chan = ("BroadcastChannel" in window) ? new BroadcastChannel(KEY) : null;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  const subs = new Set();
  const notify = () => { const v = read(); subs.forEach(cb => cb(v)); };
  if (chan) chan.onmessage = notify;
  window.addEventListener("storage", e => { if (e.key === KEY) notify(); });
  return {
    mode: "local",
    subscribe(cb) { subs.add(cb); setTimeout(() => cb(read()), 0); return () => subs.delete(cb); },
    async claim(productId, { name, note }) {
      const v = read(); const id = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      (v[productId] ||= {})[id] = { name, note: note || "", at: Date.now() };
      write(v); chan?.postMessage("x"); notify(); return id;
    },
    async release(productId, claimId) {
      const v = read(); if (v[productId]) { delete v[productId][claimId]; if (!Object.keys(v[productId]).length) delete v[productId]; }
      write(v); chan?.postMessage("x"); notify();
    },
  };
}

// Small helpers shared by UI and world
export function claimsFor(claims, productId) {
  const c = claims?.[productId] || {};
  return Object.entries(c).map(([id, v]) => ({ id, ...v })).sort((a, b) => a.at - b.at);
}
export function remaining(product, claims) {
  if (product.qty === Infinity) return Infinity;
  return Math.max(0, product.qty - claimsFor(claims, product.id).length);
}
