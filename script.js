// ── Fireflies ──
const firefliesContainer = document.getElementById('fireflies');

function createFirefly() {
  const el = document.createElement('span');
  el.className = 'firefly';
  el.style.left = `${Math.random() * 100}%`;
  el.style.top = `${Math.random() * 100}%`;
  el.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
  el.style.setProperty('--dy', `${(Math.random() - 0.5) * 120}px`);
  el.style.animationDuration = `${6 + Math.random() * 10}s`;
  el.style.animationDelay = `${Math.random() * 4}s`;
  firefliesContainer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

setInterval(createFirefly, 600);
for (let i = 0; i < 12; i++) createFirefly();

// ── City → Forest scroll transition ──
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  document.documentElement.style.setProperty('--forest-progress', progress.toFixed(3));
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// ── Countdown to September 1 ──
const COUNTDOWN_TARGET = new Date(new Date().getFullYear(), 8, 1); // September = month 8
if (COUNTDOWN_TARGET < new Date()) {
  COUNTDOWN_TARGET.setFullYear(COUNTDOWN_TARGET.getFullYear() + 1);
}

const cdDays = document.getElementById('cdDays');
const cdHours = document.getElementById('cdHours');
const cdMins = document.getElementById('cdMins');

function pad(n) {
  return String(n).padStart(2, '0');
}

function tickCountdown() {
  const diff = COUNTDOWN_TARGET - Date.now();
  if (diff <= 0) {
    cdDays.textContent = '0';
    cdHours.textContent = '00';
    cdMins.textContent = '00';
    return;
  }
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  cdDays.textContent = days;
  cdHours.textContent = pad(hours);
  cdMins.textContent = pad(mins);
}

tickCountdown();
setInterval(tickCountdown, 30000);

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach((el, i) => {
  el.style.transitionDelay = `${(i % 8) * 0.06}s`;
  observer.observe(el);
});

// ── Secret envelope ──
const envelope = document.getElementById('envelope');
const secretLetter = document.getElementById('secretLetter');

envelope.addEventListener('click', () => {
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  setTimeout(() => {
    secretLetter.classList.remove('hidden');
    envelope.style.display = 'none';
  }, 500);
});

// ── Nature sounds (Web Audio API) ──
const soundToggle = document.getElementById('soundToggle');
let audioCtx = null;
let soundNodes = [];
let soundActive = false;

function createNatureSound() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  const master = audioCtx.createGain();
  master.gain.value = 0.18;
  master.connect(audioCtx.destination);

  // Fire crackle — filtered noise bursts
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  function crackle() {
    if (!soundActive) return;
    const source = audioCtx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400 + Math.random() * 600;
    filter.Q.value = 0.5;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.06, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15 + Math.random() * 0.2);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start();
    source.stop(audioCtx.currentTime + 0.5);
    setTimeout(crackle, 80 + Math.random() * 200);
  }

  // Soft forest hum
  const hum = audioCtx.createOscillator();
  hum.type = 'sine';
  hum.frequency.value = 110;
  const humGain = audioCtx.createGain();
  humGain.gain.value = 0.03;
  hum.connect(humGain);
  humGain.connect(master);
  hum.start();

  // Occasional bird chirp
  function chirp() {
    if (!soundActive) return;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800 + Math.random() * 800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
    setTimeout(chirp, 2000 + Math.random() * 4000);
  }

  soundNodes = [hum];
  crackle();
  chirp();
}

function toggleSound() {
  soundActive = !soundActive;
  soundToggle.classList.toggle('active', soundActive);
  soundToggle.querySelector('.icon-off').classList.toggle('hidden', soundActive);
  soundToggle.querySelector('.icon-on').classList.toggle('hidden', !soundActive);
  soundToggle.setAttribute('aria-label', soundActive ? 'Звуки природы вкл' : 'Звуки природы выкл');

  if (soundActive) {
    if (!audioCtx) createNatureSound();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }
}

soundToggle.addEventListener('click', toggleSound);

// ── Footer year ──
document.getElementById('year').textContent = new Date().getFullYear();

// ── RSVP ──
const btnYes = document.getElementById('btnYes');
const btnMaybe = document.getElementById('btnMaybe');
const rsvpResult = document.getElementById('rsvpResult');

function burstConfetti(x, y) {
  const colors = ['#e8a0b4', '#c4728a', '#d4a574', '#72a078', '#c8e6a0'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    const size = 4 + Math.random() * 6;
    piece.style.cssText = `
      left: ${x}px; top: ${y}px;
      width: ${size}px; height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      --dx: ${(Math.random() - 0.5) * 200}px;
      --dy: ${-80 - Math.random() * 160}px;
    `;
    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

function showResult(text) {
  rsvpResult.textContent = text;
  rsvpResult.classList.remove('hidden');
  btnYes.disabled = true;
  btnMaybe.disabled = true;
  btnYes.style.opacity = '0.4';
  btnMaybe.style.opacity = '0.4';
}

btnYes.addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  showResult('Отлично! Как только будут даты — сообщу ♥');
});

btnMaybe.addEventListener('click', () => {
  showResult('Ладно... Хотя стоп, что нахуй?');
});
