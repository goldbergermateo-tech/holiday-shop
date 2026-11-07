# Mateo's Holiday Shop

A tiny 3D store you can walk around in (laptop or phone). Each gift on the list is a 3D object on a display table.
Family members open an item, read the details, follow the link to buy it, and tap **"I've got this"** so nobody doubles up.

Controls: on a laptop the arrow keys walk and turn (W A S D work too), the mouse looks around, and clicking a gift walks you up to it and opens it; Esc opens the pause menu. On a phone, the joystick walks, dragging looks, tapping a gift opens it. The ☰ Menu button always gets you out.
Claimed items get a red CLAIMED banner in the store and in the list view, and everyone with the page open sees it live.

## Files

- `index.html`, `css/style.css` – page shell and styling
- `js/products.js` – **the gift list** (names, prices, sizes, links, photos, quantities, positions in the store)
- `js/models.js` – procedural 3D models of each gift; `js/decor.js` – tree, presents, lights
- `js/world.js` – the room; `js/controls.js` – walking/looking (keyboard + mouse, or joystick + touch)
- `js/backend.js` – where claims are stored (Firebase if configured, otherwise this device only)
- `js/ui.js` – entry screen, product panel, claim form, list view, toasts
- `firebase-config.js` – paste your Firebase config here to make claims shared
- `assets/img/` – product photos

## Run it locally

```bash
python3 serve_local.py
```

Then open http://127.0.0.1:8765

## Make claims shared (5 minutes, free)

Without this, the site works but each phone only remembers its own claims ("Demo mode" on the entry screen).

1. Go to https://console.firebase.google.com → **Add project** (any name, analytics off is fine).
2. **Build → Realtime Database → Create database** → pick a location → start in **locked mode**.
3. On the database's **Rules** tab paste this and publish:

```json
{
  "rules": {
    "registries": {
      "$registry": {
        "claims": {
          ".read": true,
          ".write": true,
          "$product": { "$claim": { ".validate": "newData.hasChildren(['name','at']) && newData.child('name').isString() && newData.child('name').val().length <= 40" } }
        }
      }
    }
  }
}
```

4. **Project settings (gear) → Your apps → Web (</>)** → register the app → copy the `firebaseConfig` object.
5. Paste it into `firebase-config.js` (replace `null`). Done: every visitor now sees the same claims instantly.

Only the `claims` branch is writable, and only by the fields the page writes. Anyone with the link can claim or release, which is the point for a family list.

## Put it online (GitHub Pages)

1. Create a new public repo (for example `holiday-shop`) and upload every file in this folder (keep the folder structure).
2. Repo **Settings → Pages → Source: Deploy from a branch → main / (root)** → Save.
3. The site appears at `https://<username>.github.io/holiday-shop/` within a minute. Share that link (or a short link) with the family.
4. Deep links work: `…/holiday-shop/?item=hoodie` opens that gift straight away. Item ids are in `js/products.js`.

## Editing the list

Open `js/products.js`. Each entry has `name`, `brand`, `price`, `variant` (color/size), `qty` (how many can be claimed; `Infinity` never sells out), `url`, `images`, `blurb`, `howTo`, `model` (which 3D builder to use) and `pos`/`rot` (where it stands in the room).
To start a brand-new list next year, change `registryId` in the same file.
