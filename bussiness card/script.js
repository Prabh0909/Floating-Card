/* ====== EDIT THESE ====== */
const CONFIG = {
  name: "YOUR NAME",
  role: "Painter & Visual Artist",
  siteUrl: "https://yourwebsite.com"
};
/* ======================== */

const $ = id => document.getElementById(id);
$('name').textContent = CONFIG.name;
$('role').textContent = CONFIG.role;
$('siteBtn').href = CONFIG.siteUrl;
document.title = CONFIG.name + " – Artist";

// Pop up + one flip once the whole page has loaded
window.addEventListener('load', () => {
  const go = () => { $('card').classList.add('show'); $('saveBtn').parentElement.classList.add('show'); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 300));
});

// Save card as PNG (with site QR added; QR is NOT shown on screen)
$('saveBtn').addEventListener('click', () => {
  const box = $('qrTemp'); box.innerHTML = ''; box.hidden = false;
  box.style.cssText = 'position:fixed;left:-9999px';
  new QRCode(box, {text: CONFIG.siteUrl, width: 400, height: 400, correctLevel: QRCode.CorrectLevel.H});
  setTimeout(() => {
    const qrImg = box.querySelector('canvas');
    const W = 1100, H = 1800, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    // brushed steel base
    const g = x.createLinearGradient(0, 0, W, H * .6);
    [[0,'#9a9c9f'],[.22,'#e4e6e8'],[.4,'#b4b6b9'],[.58,'#f1f2f3'],[.78,'#a3a5a8'],[1,'#d6d8da']].forEach(s => g.addColorStop(s[0], s[1]));
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let i = 0; i < H; i += 2) {           // horizontal brush lines
      x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '0,0,0'},${Math.random() * .07})`;
      x.fillRect(0, i, W, 1 + Math.random() * 2);
    }
    x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 6; x.strokeRect(3, 3, W - 6, H - 6);

    // engraved helper
    const engrave = (fn) => {
      x.save(); x.translate(0, 3); x.fillStyle = x.strokeStyle = 'rgba(255,255,255,.9)'; fn(); x.restore();
      x.save(); x.translate(0, -2); x.fillStyle = x.strokeStyle = 'rgba(0,0,0,.35)'; fn(); x.restore();
      x.fillStyle = x.strokeStyle = '#4a4c4f'; fn();
    };
    // logo (same shapes as page)
    const s = 4.2;
    engrave(() => {
      x.save(); x.translate(W / 2 - 50 * s, 330); x.scale(s, s);
      const p = new Path2D('M18 66C30 24 62 14 84 30C70 32 56 42 50 62C44 80 28 88 18 66Z');
      x.fill(p); x.beginPath(); x.arc(76, 72, 7, 0, 7); x.fill(); x.restore();
    });
    x.textAlign = 'center';
    engrave(() => { x.font = '600 96px "Cormorant Garamond", serif'; x.fillText(CONFIG.name, W / 2, 860); });
    engrave(() => { x.font = '400 40px Jost, sans-serif'; x.fillText(CONFIG.role, W / 2, 940); });

    // QR panel
    const q = 380, qx = (W - q) / 2, qy = 1130;
    x.fillStyle = '#f4f5f6'; x.fillRect(qx - 30, qy - 30, q + 60, q + 60);
    x.drawImage(qrImg, qx, qy, q, q);
    x.fillStyle = '#4a4c4f'; x.font = '400 34px Jost, sans-serif';
    x.fillText(CONFIG.siteUrl.replace(/^https?:\/\//, ''), W / 2, qy + q + 90);

    const a = document.createElement('a');
    a.download = CONFIG.name.replace(/\s+/g, '-').toLowerCase() + '-card.png';
    a.href = c.toDataURL('image/png'); a.click();
    box.innerHTML = '';
  }, 150);
});
// Drag to rotate the card in 3D
const spin = $('spin');
let rx = 0, ry = 0, vx = 0, vy = 0, lx = 0, ly = 0, dragging = false, target = null;

let idleTimer = null;

const goFront = () => {
  vx = vy = 0;
  target = { x: Math.round(rx / 360) * 360, y: Math.round(ry / 360) * 360 };
};

const apply = () => spin.style.transform =
  `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;

spin.addEventListener('pointerdown', e => {
  dragging = true; target = null; lx = e.clientX; ly = e.clientY;
  spin.setPointerCapture(e.pointerId);
});
spin.addEventListener('pointermove', e => {
  if (!dragging) return;
  vy = (e.clientX - lx) * 0.5;
  vx = -(e.clientY - ly) * 0.5;
  ry += vy; rx += vx;
  lx = e.clientX; ly = e.clientY;
  apply();
});
['pointerup', 'pointercancel'].forEach(t =>
  spin.addEventListener(t, () => {
    dragging = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goFront, 1500);
  }));

// double-tap / double-click: turn back to the front
spin.addEventListener('dblclick', () => {
  target = { x: Math.round(rx / 360) * 360, y: Math.round(ry / 360) * 360 };
});

(function tick() {
  if (!dragging) {
    if (target) {                       // ease back to front
      rx += (target.x - rx) * 0.12;
      ry += (target.y - ry) * 0.12;
      if (Math.abs(target.x - rx) < .1 && Math.abs(target.y - ry) < .1) {
        rx = target.x; ry = target.y; target = null;
      }
      apply();
    } else if (Math.abs(vx) > .05 || Math.abs(vy) > .05) {   // glide after release
      rx += vx; ry += vy; vx *= .95; vy *= .95;
      apply();
    }
  }
  requestAnimationFrame(tick);

  spin.addEventListener('dblclick', goFront);

  spin.addEventListener('pointerdown', e => {
  clearTimeout(idleTimer);
  dragging = true; target = null; lx = e.clientX; ly = e.clientY;
  spin.setPointerCapture(e.pointerId);
});
})();