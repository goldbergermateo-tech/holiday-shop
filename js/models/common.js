// Shared helpers for the product models.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const M = (o) => new THREE.MeshStandardMaterial(o);
export const mesh = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
export const rbox = (w, h, d, r = 0.02, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, r);
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Sweep an elliptical cross-section along a smooth curve through `points`.
// radiusAt(t) -> base radius; rx/ry scale the section sideways / vertically (numbers or functions of t).
// Frames use parallel transport so the section never twists; "ry" is world-up for horizontal runs.
export function sweep(points, radiusAt, { segs = 48, radial = 24, rx = 1, ry = 1, thetaStart = 0, thetaLength = Math.PI * 2, tension = 0.5, capEnd = true, capStart = false } = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", tension);
  const up = V(0, 1, 0); let N = null; const pos = [], uvs = [], idx = [];
  const fx = typeof rx === "function" ? rx : () => rx, fy = typeof ry === "function" ? ry : () => ry;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, P = curve.getPointAt(t), T = curve.getTangentAt(t).normalize();
    if (!N) { N = new THREE.Vector3().crossVectors(up, T); if (N.length() < 1e-3) N.set(0, 0, -1); N.normalize(); }
    else { N.sub(T.clone().multiplyScalar(T.dot(N))).normalize(); }
    const B = new THREE.Vector3().crossVectors(T, N).normalize();
    let r = radiusAt(t); if ((capEnd && i === segs) || (capStart && i === 0)) r = 0.0005;
    const sx = fx(t), sy = fy(t);
    for (let j = 0; j <= radial; j++) {
      const th = thetaStart + thetaLength * j / radial, cx = Math.cos(th) * r * sx, cy = Math.sin(th) * r * sy;
      pos.push(P.x + N.x * cx + B.x * cy, P.y + N.y * cx + B.y * cy, P.z + N.z * cx + B.z * cy); uvs.push(j / radial, t);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// Flat decal plane that hugs a surface point, facing `normal`
export function decal(texture, w, h, x, y, z, normal = V(0, 0, 1), opts = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, ...opts }));
  m.position.set(x, y, z); m.lookAt(V(x, y, z).add(normal)); m.renderOrder = 2; return m;
}
