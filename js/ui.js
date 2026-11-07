// All 2D UI: entry screen, HUD, product panel, claim form, list view, toasts.
import { fmtPrice } from "./products.js";
import { claimsFor, remaining } from "./backend.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); if (m < 1) return "just now"; if (m < 60) return `${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `${h} h ago`; return `${Math.round(h / 24)} d ago`; };
const LS = { get: (k, d) => { try { return JSON.parse(localStorage.getItem("holiday-store:" + k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem("holiday-store:" + k, JSON.stringify(v)); } catch {} } };

export function createUI({ products, byId, backend, store }) {
  const handlers = {}; const on = (ev, fn) => (handlers[ev] = fn); const emit = (ev, ...a) => handlers[ev]?.(...a);
  let claims = {}, current = null, imgIndex = 0, first = true;
  const mine = new Set(LS.get("mine", []));

  $("entry-title").textContent = store.title; $("entry-tagline").textContent = store.tagline; document.title = store.title;
  if (backend.mode === "local") { const b = $("mode-banner"); b.hidden = false; b.innerHTML = "<b>Demo mode.</b> Claims are only saved on this device until the shared database is connected (see README)."; }
  $("entry-help").textContent = ("ontouchstart" in window) ? "Phone: joystick to walk, drag to look, tap a gift." : "Laptop: arrow keys to walk and turn, mouse to look, click a gift.";

  $("btn-enter").onclick = () => { $("entry").hidden = true; emit("enter"); };
  $("btn-list").onclick = () => { $("entry").hidden = true; showList(); emit("list"); };
  $("hud-list").onclick = () => { showList(); emit("list"); };
  $("hud-menu").onclick = () => openMenu();
  $("menu-resume").onclick = () => closeMenu();
  $("menu-list").onclick = () => { $("menu").hidden = true; showList(); emit("list"); };
  $("menu-howto").onclick = () => { $("howto").hidden = !$("howto").hidden; };
  $("menu-home").onclick = () => { closeMenu(); emit("home"); };
  $("menu-exit").onclick = () => { $("menu").hidden = true; hideList(); $("panel").hidden = true; current = null; $("entry").hidden = false; emit("exit"); };
  function openMenu() { $("howto").hidden = true; $("menu").hidden = false; emit("pause"); }
  function closeMenu() { $("menu").hidden = true; emit("resume"); }
  $("list-close").onclick = () => { hideList(); emit("resume"); };
  $("list-walk").onclick = () => { hideList(); emit("resume"); };
  $("panel-close").onclick = () => closeProduct();
  $("btn-claim").onclick = () => { $("claim-form").hidden = false; $("claim-name").value = LS.get("name", ""); setTimeout(() => $("claim-name").focus(), 50); };
  $("claim-cancel").onclick = () => { $("claim-form").hidden = true; };
  $("claim-confirm").onclick = async () => {
    const name = $("claim-name").value.trim(); if (!name) { $("claim-name").focus(); return; }
    const note = $("claim-note").value.trim(); LS.set("name", name); $("claim-confirm").disabled = true;
    try { const id = await backend.claim(current.id, { name, note }); mine.add(id); LS.set("mine", [...mine]); $("claim-form").hidden = true; $("claim-note").value = ""; toast(`🎁 Got it, ${name}. ${current.name} is yours to get.`); }
    catch (e) { console.error(e); toast("Hmm, that didn't save. Try again."); }
    $("claim-confirm").disabled = false;
  };
  $("claim-name").addEventListener("keydown", e => { if (e.key === "Enter") $("claim-confirm").click(); });

  function statusOf(p) {
    const r = remaining(p, claims);
    if (r === Infinity) return { text: "Always available", kind: "ok", open: true };
    if (r <= 0) return { text: p.qty > 1 ? "All claimed" : "Claimed", kind: "gone", open: false };
    if (p.qty > 1) return { text: `${r} of ${p.qty} left`, kind: "some", open: true };
    return { text: "Available", kind: "ok", open: true };
  }

  function renderClaimRows(p, container) {
    const rows = claimsFor(claims, p.id); container.innerHTML = "";
    rows.forEach(c => {
      const d = document.createElement("div"); d.className = "claim"; const own = mine.has(c.id);
      d.innerHTML = `<div><b>${esc(c.name)}</b> is getting this${p.qty > 1 && p.unit ? ` (1 ${esc(p.unit)})` : ""}<small>${esc(c.note || "")}${c.note ? " · " : ""}${ago(c.at)}</small></div><button data-id="${esc(c.id)}">${own ? "Release" : "Not them?"}</button>`;
      d.querySelector("button").onclick = async () => { if (!own && !confirm(`Release ${c.name}'s claim so someone else can get it?`)) return; await backend.release(p.id, c.id); mine.delete(c.id); LS.set("mine", [...mine]); toast(`${p.name} is available again.`); };
      container.appendChild(d);
    });
  }

  function renderPanel() {
    const p = current; if (!p) return; const s = statusOf(p);
    $("panel-brand").textContent = p.brand; $("panel-name").textContent = p.name; $("panel-price").textContent = fmtPrice(p);
    const st = $("panel-status"); st.textContent = s.text; st.className = "status " + s.kind;
    $("panel-variant").textContent = p.variant || ""; $("panel-blurb").textContent = p.blurb || ""; $("panel-howto").textContent = p.howTo || ""; $("panel-howto").hidden = !p.howTo; $("panel-pricenote").textContent = p.priceNote || ""; $("panel-pricenote").hidden = !p.priceNote;
    $("panel-img").src = p.images[imgIndex] || ""; $("panel-img").alt = p.name;
    const th = $("panel-thumbs"); th.innerHTML = ""; if (p.images.length > 1) p.images.forEach((src, i) => { const im = document.createElement("img"); im.src = src; im.className = i === imgIndex ? "on" : ""; im.onclick = () => { imgIndex = i; renderPanel(); }; th.appendChild(im); });
    renderClaimRows(p, $("panel-claims"));
    const btn = $("btn-claim"); btn.disabled = !s.open; btn.textContent = s.open ? (p.qty === Infinity ? "🎁 I'm getting one of these" : "🎁 I've got this") : "Already claimed";
    $("btn-buy").href = p.url; $("btn-buy").textContent = `Open it on ${p.brand} ↗`;
  }

  function openProduct(id) { current = byId[id]; imgIndex = 0; $("claim-form").hidden = true; renderPanel(); $("panel").hidden = false; $("panel").scrollTop = 0; emit("pause"); }
  function closeProduct() { if ($("panel").hidden) return; $("panel").hidden = true; current = null; if ($("list").hidden) emit("resume"); }

  function renderList() {
    const grid = $("list-grid"); grid.innerHTML = "";
    products.forEach(p => {
      const s = statusOf(p); const card = document.createElement("div"); card.className = "card" + (s.open ? "" : " gone");
      const who = claimsFor(claims, p.id).map(c => esc(c.name)).join(", ");
      card.innerHTML = `<img src="${p.images[0]}" alt=""><div class="cbody"><div class="brand">${esc(p.brand)}</div><div class="cname">${esc(p.name)}</div><div class="cmeta"><span class="price">${fmtPrice(p)}</span><span class="status ${s.kind}">${s.text}</span></div>${who ? `<small style="color:var(--muted)">Claimed by ${who}</small>` : ""}<button class="btn ${s.open ? "primary" : "ghost"}">${s.open ? "View & claim" : "View"}</button></div>`;
      card.querySelector("button").onclick = () => openProduct(p.id); grid.appendChild(card);
    });
    const feed = $("feed"); feed.innerHTML = "";
    const all = products.flatMap(p => claimsFor(claims, p.id).map(c => ({ ...c, p }))).sort((a, b) => b.at - a.at).slice(0, 12);
    if (!all.length) feed.innerHTML = "<li>Nothing claimed yet. Be the first!</li>";
    all.forEach(c => { const li = document.createElement("li"); li.innerHTML = `<b>${esc(c.name)}</b> claimed ${esc(c.p.name)} · ${ago(c.at)}`; feed.appendChild(li); });
  }
  function showList() { renderList(); $("list").hidden = false; emit("pause"); }
  function hideList() { $("list").hidden = true; }

  function toast(msg, ms = 4200) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; $("toasts").appendChild(t); setTimeout(() => t.remove(), ms); }
  function setHint(text, keys = false) { const h = $("hint"); h.classList.toggle("keys", keys); if (text) { h.textContent = text; h.classList.add("show"); } else h.classList.remove("show"); }

  // claims updates: diff for notifications
  function setClaims(next) {
    const prevIds = new Set(), nextIds = new Map();
    products.forEach(p => { claimsFor(claims, p.id).forEach(c => prevIds.add(c.id)); claimsFor(next, p.id).forEach(c => nextIds.set(c.id, { c, p })); });
    if (!first) {
      const myName = (LS.get("name", "") || "").trim().toLowerCase();
      nextIds.forEach(({ c, p }, id) => { if (!prevIds.has(id) && !mine.has(id) && (c.name || "").trim().toLowerCase() !== myName) toast(`🔔 ${c.name} just claimed ${p.name}`); });
      prevIds.forEach(id => { if (!nextIds.has(id)) { /* release; keep quiet unless it was ours */ } });
    }
    first = false; claims = next || {};
    const open = products.filter(p => statusOf(p).open).length, total = products.length;
    $("entry-stats").textContent = open === total ? `${total} gifts, nothing claimed yet` : `${total - open} of ${total} gifts already claimed · ${open} still available`;
    if (current) renderPanel(); if (!$("list").hidden) renderList();
  }

  return { on, openProduct, closeProduct, showList, hideList, openMenu, closeMenu, toast, setHint, setClaims, statusOf, isPanelOpen: () => !$("panel").hidden, isListOpen: () => !$("list").hidden, isMenuOpen: () => !$("menu").hidden, isEntryOpen: () => !$("entry").hidden };
}
