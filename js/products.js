// Product catalogue for the store. Edit freely: names, prices, notes, quantities.
// qty: how many of this item can be claimed (Infinity = never sells out, e.g. gift cards).
// model: which 3D builder in models.js renders it.  pos/rot: where it sits in the store.

export const STORE = {
  title: "Mateo's Holiday Shop",
  tagline: "Walk around, find something, and tap “I've got this” so nobody doubles up.",
  registryId: "mateo-holidays-2026",      // Firebase path; change to start a fresh list
};

export const PRODUCTS = [
  {
    id: "whoop",
    name: "WHOOP 5.0 + SuperKnit Luxe Band",
    brand: "WHOOP",
    price: 89,
    priceNote: "$89 for the band at checkout. The WHOOP 5.0 Peak membership starts as a free 1-month trial.",
    variant: "Band: SuperKnit Luxe, Midnight with Titanium",
    qty: 1,
    url: "https://join.whoop.com/us/en/bands/?tier=TRIAL",
    images: ["assets/img/whoop_1.jpg", "assets/img/whoop_2.jpg"],
    blurb: "Fitness tracker band. At checkout pick the Peak trial, then add the 5.0 SuperKnit Luxe Band in Midnight with Titanium.",
    howTo: "Click the link, choose the TRIAL tier, add the SuperKnit Luxe band (Midnight with Titanium) as the accessory, and check out.",
    model: "whoop",
    pos: [-5.2, 0, -3.2], rot: 0.35,
  },
  {
    id: "hoodie",
    name: "127th U.S. Open Pine Houndstooth Performance Hoodie",
    brand: "Peter Millar",
    price: 190,
    variant: "Color: Bali Blue · Size: S · Classic Fit",
    qty: 1,
    url: "https://www.petermillar.com/p/127th-u.s.-open-pine-houndstooth-performance-hoodie/197889724988-MF26EK45A-USOPEN27.html?dwvar_mf26ek45a-usopen27_color=BAL",
    images: ["assets/img/hoodie_1.jpg", "assets/img/hoodie_2.jpg"],
    blurb: "Limited-edition U.S. Open (Pebble Beach) performance hoodie with the embroidered championship logo.",
    howTo: "Custom-embroidered item: Peter Millar says order by Thu Dec 10 for Christmas delivery. Size S, color Bali Blue.",
    model: "hoodie",
    pos: [0, 0, -4.6], rot: 0,
  },
  {
    id: "golfballs",
    name: "Kirkland Signature V3.0 Yellow Golf Balls, 2 dozen",
    brand: "Costco",
    price: 39.99,
    variant: "Yellow · 24 balls (2 dozen) · Item 1819441",
    qty: 1,
    url: "https://www.costco.com/p/-/kirkland-signature-v30-yellow-golf-ball-2-dozen/4000331846",
    images: ["assets/img/golf_1.jpg"],
    blurb: "Three-piece urethane golf balls in neon yellow. Online price was $39.99 with shipping included.",
    howTo: "Costco.com (a Costco membership is needed to buy). Delivery is available even when the warehouse is out of stock.",
    model: "golfballs",
    pos: [5.2, 0, -3.2], rot: -0.35,
  },
  {
    id: "socks",
    name: "Smiley Lowcut Socks",
    brand: "Del Campo Golf",
    price: 16,
    priceNote: "$16 per pair, or $31 for 2 pairs together.",
    variant: "Size: Small/Medium · White with smiley",
    qty: 2,
    unit: "pair",
    url: "https://delcampogolf.com/products/smiley-lowcut?variant=52791958241597",
    images: ["assets/img/socks_1.jpg", "assets/img/socks_2.jpg", "assets/img/socks_3.jpg"],
    blurb: "Low-cut golf socks with the little smiley face, made in the USA. I want two pairs.",
    howTo: "Size Small/Medium. One person can grab both pairs (2 Pair bundle, $31) or two people can take one each.",
    model: "socks",
    pos: [5.6, 0, 0.6], rot: -1.9,
  },
  {
    id: "boots",
    name: "Crosstrak Powder Waterproof Boots",
    brand: "Salomon",
    price: 200,
    variant: "Color: Asphalt / Black / Sharkskin · Size: 8.5 Men's",
    qty: 1,
    url: "https://www.salomon.com/en-us/product/crosstrak-powder-waterproof-li5834/L47569600?sizeId=L47569600029",
    images: ["assets/img/boots_1.jpg", "assets/img/boots_2.jpg"],
    blurb: "High-cut insulated, waterproof winter boots with snow-gripping lugs.",
    howTo: "Pick size 8.5 Men's in Asphalt / Black / Sharkskin (the link preselects it).",
    model: "boots",
    pos: [-2.6, 0, 3.2], rot: 2.4,
  },
  {
    id: "dukecard",
    name: "Duke Stores Gift Card",
    brand: "Duke University Stores",
    price: null,
    priceNote: "Any amount: $25, $50, $100 cards, or a virtual gift certificate.",
    variant: "Physical card or virtual certificate",
    qty: Infinity,
    url: "https://shop.duke.edu/gifts/gift-cards",
    images: ["assets/img/duke_1.jpg", "assets/img/duke_2.jpg"],
    blurb: "Gift card for the Duke campus store. Never sells out, so more than one person can pick this.",
    howTo: "Any denomination works. The virtual gift certificate arrives by email.",
    model: "giftcard",
    pos: [-5.6, 0, 0.2], rot: 1.9,
  },
];

export const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

export function fmtPrice(p) {
  if (p.price == null) return "Any amount";
  return "$" + (Number.isInteger(p.price) ? p.price : p.price.toFixed(2));
}
