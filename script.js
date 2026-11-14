// Open button
const opening = document.getElementById('opening');
const main = document.getElementById('main');
document.getElementById('openBtn').addEventListener('click', () => {
  opening.classList.add('hide');
  main.classList.add('show');
  main.setAttribute('aria-hidden', 'false');
  document.body.classList.remove('locked');
  window.scrollTo(0, 0);
  setTimeout(() => document.querySelectorAll('.hero .reveal').forEach(e => e.classList.add('in')), 400);
});

// Scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Countdown (Muhurtham 07:30 AM IST)
const target = new Date('2026-12-12T07:30:00+05:30').getTime();
const pad = n => String(n).padStart(2, '0');
function tick() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5); diff %= 36e5;
  const m = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  setUnit('d', pad(d));
  setUnit('h', pad(h));
  setUnit('m', pad(m));
  setUnit('s', pad(s));
}
// Update a countdown number and play the flip animation only when it changes
// The old number rolls up and fades out while the new one rolls up from below.
function setUnit(id, value) {
  const el = document.getElementById(id);
  const old = el.querySelector('span:last-child');
  if (!old) { // first render
    el.innerHTML = `<span>${value}</span>`;
    return;
  }
  if (old.textContent === value) return;

  const next = document.createElement('span');
  next.textContent = value;
  el.appendChild(next);

  const opts = { duration: 700, easing: 'cubic-bezier(.22,.9,.3,1)', fill: 'both' };
  old.animate([
    { transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' },
    { transform: 'translateY(-70%)', opacity: 0, filter: 'blur(2px)' }
  ], opts).onfinish = () => old.remove();
  next.animate([
    { transform: 'translateY(70%)', opacity: 0, filter: 'blur(2px)' },
    { transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' }
  ], opts);

  // Border light on change (seconds has its own continuous light in CSS)
  if (id !== 's') {
    const box = el.parentElement;
    box.classList.remove('pulse');
    void box.offsetWidth;
    box.classList.add('pulse');
  }
}
// Tick exactly on each second boundary so the roll is evenly paced
(function loop() { tick(); setTimeout(loop, 1000 - (Date.now() % 1000) + 5); })();

// Slow falling petals
const canvas = document.getElementById('petals');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
// Flower palette: white+yellow mix, burgundy, soft red (not pure red) and yellow
const palette = [
  { petal: '#fff6dc', center: '#f4c430' }, // white + yellow
  { petal: '#fdf1c4', center: '#f0b323' }, // white + yellow (creamier)
  { petal: '#7a1230', center: '#f2c94c' }, // burgundy
  { petal: '#b0303c', center: '#f5d36a' }, // soft red
  { petal: '#f4c430', center: '#c98a1b' }  // yellow
];
// Small sparkling diamonds mixed in with the flowers
const gems = ['#fff3c4', '#f7d774', '#ffffff', '#e8c97e'];
const count = innerWidth < 600 ? 20 : 35;
const petals = Array.from({ length: count }, () => newPetal(true));
function newPetal(random) {
  const gem = Math.random() < 0.5;
  return {
    gem,
    gemColor: gems[Math.floor(Math.random() * gems.length)],
    twinkle: Math.random() * Math.PI * 2,
    x: Math.random() * innerWidth,
    y: random ? Math.random() * innerHeight : -20 - Math.random() * 120, // new ones always enter from the top
    r: gem ? 2 + Math.random() * 2.2 : 2.4 + Math.random() * 3.6,
    vy: 0.35 + Math.random() * 0.45,   // slow, steady fall from top to bottom
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.003 + Math.random() * 0.005,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.015,
    color: palette[Math.floor(Math.random() * palette.length)],
    alpha: 0.6 + Math.random() * 0.35
  };
}
function draw(p) {
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(p.rot);
  if (p.gem) {
    p.twinkle += 0.03;
    ctx.globalAlpha = 0.45 + 0.45 * Math.abs(Math.sin(p.twinkle));
    ctx.fillStyle = p.gemColor;
    ctx.shadowColor = p.gemColor; ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -p.r * 1.3); ctx.lineTo(p.r * 0.85, 0); ctx.lineTo(0, p.r * 1.3); ctx.lineTo(-p.r * 0.85, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    return;
  }
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color.petal;
  for (let i = 0; i < 5; i++) {
    ctx.rotate(Math.PI * 2 / 5);
    ctx.beginPath(); ctx.ellipse(0, p.r * 0.8, p.r * 0.38, p.r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = p.color.center;
  ctx.beginPath(); ctx.arc(0, 0, p.r * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach((p, i) => {
    p.y += p.vy; p.sway += p.swaySpeed; p.x += Math.sin(p.sway) * 0.2; p.rot += p.vr;
    if (p.y > canvas.height + 20) petals[i] = newPetal(false);
    draw(p);
  });
  requestAnimationFrame(loop);
}
loop();

// RSVP form
// GitHub Pages has no server, so responses go to one of these:
//  1. FORM_ENDPOINT: a Formspree (https://formspree.io) URL, e.g. 'https://formspree.io/f/xxxxxxx'. Replies are emailed to you.
//  2. WHATSAPP_NUMBER: digits with country code, e.g. '919876543210'. Opens WhatsApp with the reply pre-filled.
const FORM_ENDPOINT = '';
const WHATSAPP_NUMBER = '';

const form = document.getElementById('rsvpForm');
const msg = document.getElementById('rsvpMsg');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(form);
  const name = (fd.get('name') || '').toString().trim();
  const attending = fd.get('attending');
  msg.className = 'rsvp-msg';
  if (!name || !attending) {
    msg.classList.add('error');
    msg.textContent = 'Please enter your name and tell us if you can join.';
    return;
  }
  const data = {
    name,
    phone: (fd.get('phone') || '').toString().trim(),
    attending: attending.toString(),
    guests: fd.get('guests'),
    events: fd.getAll('events').join(', ') || 'Not specified',
    wishes: (fd.get('wishes') || '').toString().trim()
  };
  const btn = form.querySelector('.send');
  btn.disabled = true;
  try {
    if (FORM_ENDPOINT) {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Request failed');
    } else if (WHATSAPP_NUMBER) {
      const text = `RSVP from ${data.name}\nPhone: ${data.phone || '-'}\nResponse: ${data.attending}\nGuests: ${data.guests}\nEvents: ${data.events}\nWishes: ${data.wishes || '-'}`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    } else {
      throw new Error('RSVP is not configured yet.');
    }
    form.reset();
    msg.textContent = 'Thank you! Your RSVP has been sent. ♥';
  } catch (err) {
    msg.classList.add('error');
    msg.textContent = 'Sorry, we could not send your RSVP. Please try again.';
  } finally {
    btn.disabled = false;
  }
});

// Photo lightbox (one photo at a time, with previous/next)
const lightbox = document.getElementById('lightbox');
const lbImg = lightbox.querySelector('.lb-img');
const shots = Array.from(document.querySelectorAll('.shot img'));
let lbIndex = 0;

function showShot(i) {
  lbIndex = (i + shots.length) % shots.length;
  lbImg.classList.add('swap');
  setTimeout(() => {
    lbImg.src = shots[lbIndex].src;
    lbImg.alt = shots[lbIndex].alt;
    lbImg.classList.remove('swap');
  }, 150);
}
function openLightbox(i) {
  lbImg.src = shots[i].src;
  lbImg.alt = shots[i].alt;
  lbIndex = i;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('locked');
}
function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('locked');
}
shots.forEach((img, i) => img.closest('.shot').addEventListener('click', () => openLightbox(i)));
lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); showShot(lbIndex - 1); });
lightbox.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); showShot(lbIndex + 1); });
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
  if (e.key === 'ArrowRight') showShot(lbIndex + 1);
});
