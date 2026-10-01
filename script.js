const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const navigation = document.querySelector('[data-navigation]');
const search = document.querySelector('[data-plugin-search]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const pluginCards = [...document.querySelectorAll('[data-plugin]')];
const resultsStatus = document.querySelector('[data-results-status]');
const emptyState = document.querySelector('[data-empty-state]');

const setHeaderState = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

const closeMenu = () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('is-open');
};

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation?.classList.toggle('is-open', !isOpen);
});

navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

let selectedCategory = 'all';

const filterPlugins = () => {
  const query = search?.value.trim().toLocaleLowerCase() ?? '';
  let visibleCount = 0;

  pluginCards.forEach((card) => {
    const categories = card.dataset.category?.split(' ') ?? [];
    const searchableText = `${card.dataset.search ?? ''} ${card.textContent}`.toLocaleLowerCase();
    const categoryMatches = selectedCategory === 'all' || categories.includes(selectedCategory);
    const queryMatches = !query || searchableText.includes(query);
    const visible = categoryMatches && queryMatches;

    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (resultsStatus) {
    const label = visibleCount === 1 ? 'plugin' : 'plugins';
    resultsStatus.textContent = query || selectedCategory !== 'all'
      ? `${visibleCount} matching ${label}`
      : `Showing all ${visibleCount} ${label}`;
  }

  if (emptyState) emptyState.hidden = visibleCount !== 0;
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter ?? 'all';
    filterButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle('is-active', active);
      candidate.setAttribute('aria-pressed', String(active));
    });
    filterPlugins();
  });
});

search?.addEventListener('input', filterPlugins);

/* ---------- Title-screen splash text ---------- */
const splash = document.querySelector('[data-splash]');
const splashes = [
  '13 plugins!',
  'Open source!',
  'Do distribute!',
  'MIT licensed!',
  'Also try Paper!',
  'Now with Java 25!',
  'Redstone not included!',
  'Minecarts go brr!',
  'Pull requests welcome!',
  'Blood Moon rising!',
  'Backups saved!',
  'Made of cobblestone!',
  '100% pure Java!',
  'Wireless redstone!',
  'Read the README!',
  'Grapple responsibly!',
];
let splashIndex = -1;

const nextSplash = () => {
  if (!splash) return;
  let index;
  do index = Math.floor(Math.random() * splashes.length);
  while (index === splashIndex && splashes.length > 1);
  splashIndex = index;
  splash.textContent = splashes[index];
};

nextSplash();
splash?.addEventListener('click', nextSplash);

/* ---------- XP bar tracks scroll progress, levels 0–30 ---------- */
const xpFill = document.querySelector('[data-xp-fill]');
const xpLevel = document.querySelector('[data-xp-level]');

const updateXp = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  const levels = progress * 30;
  const level = Math.floor(levels);
  xpFill?.style.setProperty('--xp-progress', `${level === 30 ? 100 : (levels - level) * 100}%`);
  if (xpLevel) xpLevel.textContent = String(level);
};

updateXp();
window.addEventListener('scroll', updateXp, { passive: true });
window.addEventListener('resize', updateXp);

/* ---------- Optional menu click sound (off by default) ---------- */
const soundToggle = document.querySelector('[data-sound-toggle]');
const soundLabel = document.querySelector('[data-sound-label]');
let soundOn = false;
let audio;

try {
  soundOn = localStorage.getItem('cobbleworks-sound') === 'on';
} catch {
  soundOn = false;
}

const renderSound = () => {
  soundToggle?.setAttribute('aria-pressed', String(soundOn));
  if (soundLabel) soundLabel.textContent = soundOn ? 'ON' : 'OFF';
};

const playClick = () => {
  if (!soundOn) return;
  audio ??= new (window.AudioContext || window.webkitAudioContext)();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1400, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.08);
};

soundToggle?.addEventListener('click', () => {
  soundOn = !soundOn;
  try {
    localStorage.setItem('cobbleworks-sound', soundOn ? 'on' : 'off');
  } catch {
    // Preference simply isn't remembered.
  }
  renderSound();
});

document.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.button, .filter-buttons button, .sound-toggle, .menu-button, .splash')) playClick();
});

renderSound();
