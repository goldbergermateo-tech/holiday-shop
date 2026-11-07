// Shared claims (so the whole family sees what is taken) need a free Firebase Realtime Database.
// 1. console.firebase.google.com -> Add project -> Build -> Realtime Database -> Create.
// 2. Project settings -> Your apps -> Web app -> copy the firebaseConfig object.
// 3. Paste it below, replacing null, and set the database rules from README.md.
// Until then the site runs in "demo mode": claims are only saved on this device.
window.FIREBASE_CONFIG = null;
/* Example:
window.FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "holiday-shop-xxxxx.firebaseapp.com",
  databaseURL: "https://holiday-shop-xxxxx-default-rtdb.firebaseio.com",
  projectId: "holiday-shop-xxxxx",
  storageBucket: "holiday-shop-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
*/
