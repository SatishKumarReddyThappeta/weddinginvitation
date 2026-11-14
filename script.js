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

// Countdown (Muhurtham 09:15 AM IST)
const target = new Date('2026-12-12T09:15:00+05:30').getTime();
const pad = n => String(n).padStart(2, '0');
function tick() {
  let diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 864e5); diff %= 864e5;
  const h = Math.floor(diff / 36e5); diff %= 36e5;
  const m = Math.floor(diff / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  document.getElementById('d').textContent = pad(d);
  document.getElementById('h').textContent = pad(h);
  document.getElementById('m').textContent = pad(m);
  document.getElementById('s').textContent = pad(s);
}
tick(); setInterval(tick, 1000);

// Slow falling petals
const canvas = document.getElementById('petals');
const ctx = canvas.getContext('2d');
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
const colors = ['#f3c777', '#e9d8b0', '#c0392b', '#d4a553', '#f7e7c1'];
const count = innerWidth < 600 ? 22 : 40;
const petals = Array.from({ length: count }, () => newPetal(true));
function newPetal(random) {
  return {
    x: Math.random() * innerWidth,
    y: random ? Math.random() * innerHeight : -20,
    r: 3 + Math.random() * 6,
    vy: 0.25 + Math.random() * 0.45,   // slow fall
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.004 + Math.random() * 0.008,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.015,
    color: colors[Math.floor(Math.random() * colors.length)],
    alpha: 0.4 + Math.random() * 0.5,
    flower: Math.random() < 0.3
  };
}
function draw(p) {
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
  if (p.flower) {
    for (let i = 0; i < 5; i++) {
      ctx.rotate(Math.PI * 2 / 5);
      ctx.beginPath(); ctx.ellipse(0, p.r * 0.8, p.r * 0.35, p.r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach((p, i) => {
    p.y += p.vy; p.sway += p.swaySpeed; p.x += Math.sin(p.sway) * 0.5; p.rot += p.vr;
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
