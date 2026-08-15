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

// ── Background music ──
const soundToggle = document.getElementById('soundToggle');
const bgMusic = document.getElementById('bgMusic');
let musicPlaying = false;

bgMusic.volume = 0.55;

function updateSoundUI(on) {
  soundToggle.classList.toggle('active', on);
  soundToggle.querySelector('.icon-off').classList.toggle('hidden', on);
  soundToggle.querySelector('.icon-on').classList.toggle('hidden', !on);
  soundToggle.setAttribute('aria-label', on ? 'Музыка вкл' : 'Музыка выкл');
}

function waitForMusicReady() {
  if (bgMusic.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('audio load failed'));
    };
    const cleanup = () => {
      bgMusic.removeEventListener('canplaythrough', onReady);
      bgMusic.removeEventListener('error', onError);
    };
    bgMusic.addEventListener('canplaythrough', onReady, { once: true });
    bgMusic.addEventListener('error', onError, { once: true });
    bgMusic.load();
  });
}

// если loop не сработал — начинаем сначала
bgMusic.addEventListener('ended', () => {
  if (!musicPlaying) return;
  bgMusic.currentTime = 0;
  bgMusic.play().catch(() => {});
});

// после паузы вкладки — продолжить, если музыка была включена
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && musicPlaying && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
});

async function toggleSound() {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    updateSoundUI(false);
    return;
  }

  try {
    await waitForMusicReady();
    await bgMusic.play();
    musicPlaying = true;
    updateSoundUI(true);
  } catch {
    musicPlaying = false;
    updateSoundUI(false);
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

function showResult(text, choice) {
  rsvpResult.textContent = text;
  rsvpResult.classList.remove('hidden');
  btnYes.classList.toggle('btn-selected', choice === 'yes');
  btnMaybe.classList.toggle('btn-selected', choice === 'maybe');
}

btnYes.addEventListener('click', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  showResult('Отлично! Как только будут даты — сообщу ♥', 'yes');
});

btnMaybe.addEventListener('click', () => {
  showResult('Ладно... Хотя стоп, что нахуй?', 'maybe');
});

// ── Easter egg: Boba ──
const easterTrigger = document.getElementById('easterTrigger');
const easterModal = document.getElementById('easterModal');
const easterClose = document.getElementById('easterClose');
const easterBackdrop = document.getElementById('easterBackdrop');
const easterImg = document.getElementById('easterImg');
let bobaLoaded = false;

function openEaster() {
  if (!bobaLoaded) {
    easterImg.src = 'boba.png';
    bobaLoaded = true;
  }
  easterModal.classList.add('is-open');
  easterModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeEaster() {
  easterModal.classList.remove('is-open');
  easterModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

easterTrigger.addEventListener('click', openEaster);
easterClose.addEventListener('click', closeEaster);
easterBackdrop.addEventListener('click', closeEaster);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && easterModal.classList.contains('is-open')) {
    closeEaster();
  }
});

closeEaster();
