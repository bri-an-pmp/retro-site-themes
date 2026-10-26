import { tr, getLang, setLang, applyPage } from './i18n.js';
import { sfx, setSound, soundEnabled } from './sound.js';
import { startMusic, stopMusic, musicPlaying, onMusicChange } from './music.js';

// EDIT: your GitHub username. The Code Zone lists your public projects from it,
// and every GitHub link on the page points to your profile.
const GITHUB_USER = 'octocat';

// Music players load only when the visitor asks (faster page, no tracking until then).
// EDIT: paste each service's embed address in src (leave it '' to show a short
// note instead of a player). Examples of the format:
//   Spotify:     https://open.spotify.com/embed/artist/YOUR_ARTIST_ID?theme=0
//   Apple Music: https://embed.music.apple.com/us/album/YOUR_ALBUM_NAME/YOUR_ALBUM_ID
//   YouTube:     https://www.youtube-nocookie.com/embed/videoseries?list=YOUR_PLAYLIST_ID
//   SoundCloud:  https://w.soundcloud.com/player/?url=<your SoundCloud page, URL-encoded>
// The keys match data-embed="..." in index.html. If you add another service,
// also add its address to frame-src in the Content-Security-Policy in index.html.
const EMBEDS = {
  'spotify-main': { name: 'Spotify', src: '', height: 352 },
  'spotify-side': { name: 'Spotify', src: '', height: 352 },
  apple: {
    name: 'Apple Music',
    src: '',
    height: 450,
    sandbox: 'allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation',
  },
  youtube: { name: 'YouTube', src: '', height: 315 },
  soundcloud: { name: 'SoundCloud', src: '', height: 400 },
};

// Shown if the GitHub API can't be reached (it limits visitors to 60 requests an hour).
// EDIT: replace with a few of your own projects.
const FALLBACK_REPOS = [
  { name: 'Hello-World', description: 'My first repository on GitHub!', language: '' },
  { name: 'Spoon-Knife', description: 'This repo is for demonstration purposes only.', language: 'HTML' },
];

// How many empty photo frames to show in the Photo Zone.
const PHOTO_PLACEHOLDERS = 6;

const status = document.getElementById('status');
const announce = (msg) => {
  status.textContent = '';
  requestAnimationFrame(() => { status.textContent = msg; });
};
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Language ---------- */
const langBtn = document.getElementById('lang-toggle');
function refreshLangButton() {
  langBtn.textContent = tr('langButton');
  langBtn.lang = getLang() === 'en' ? 'es' : 'en';
  langBtn.setAttribute('aria-label', tr('langButtonLabel'));
}
langBtn.addEventListener('click', () => {
  setLang(getLang() === 'en' ? 'es' : 'en');
  refreshAll();
  sfx('select');
});

/* ---------- Sound ---------- */
const soundBtn = document.getElementById('sound-toggle');
function refreshSoundButton() {
  const on = soundEnabled();
  soundBtn.setAttribute('aria-pressed', String(on));
  const label = soundBtn.querySelector('.sound-label');
  label.dataset.i18n = on ? 'soundOn' : 'soundOff';
  label.textContent = tr(label.dataset.i18n);
}
soundBtn.addEventListener('click', () => {
  setSound(!soundEnabled());
  refreshSoundButton();
  announce(tr(soundEnabled() ? 'soundOnStatus' : 'soundOffStatus'));
  sfx('select');
});

/* ---------- Theme music ---------- */
const musicBtn = document.getElementById('music-toggle');
const themeBtn = document.getElementById('theme-play');
function refreshMusicButtons() {
  const on = musicPlaying();
  musicBtn.setAttribute('aria-pressed', String(on));
  const label = musicBtn.querySelector('.music-label');
  label.dataset.i18n = on ? 'musicOn' : 'musicOff';
  label.textContent = tr(label.dataset.i18n);
  themeBtn.setAttribute('aria-pressed', String(on));
  const themeLabel = document.getElementById('theme-play-label');
  themeLabel.dataset.i18n = on ? 'stopTheme' : 'playTheme';
  themeLabel.textContent = tr(themeLabel.dataset.i18n);
}
function toggleMusic() {
  if (musicPlaying()) {
    stopMusic();
    announce(tr('musicOffStatus'));
  } else if (startMusic()) {
    announce(tr('musicOnStatus'));
  } else {
    announce(tr('musicError'));
  }
}
musicBtn.addEventListener('click', toggleMusic);
themeBtn.addEventListener('click', toggleMusic);
onMusicChange(refreshMusicButtons);

/* ---------- HUD timer ---------- */
const timeEl = document.getElementById('hud-time');
const started = Date.now();
setInterval(() => {
  const s = Math.floor((Date.now() - started) / 1000);
  timeEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}, 1000);

/* ---------- Gold records ---------- */
const RECORD_SPOTS = [
  [8, 30], [16, 22], [24, 30], [76, 28], [84, 20], [92, 28], [12, 62], [88, 60],
];
const recordsEl = document.getElementById('title-records');
const recordCount = document.getElementById('hud-records');
let collected = 0;
RECORD_SPOTS.forEach(([x, y]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'record';
  b.style.left = `calc(${x}% - 22px)`;
  b.style.top = `${y}%`;
  b.dataset.i18nLabel = 'collectLabel';
  b.setAttribute('aria-label', tr('collectLabel'));
  b.addEventListener('click', () => {
    if (b.classList.contains('collected')) return;
    b.classList.add('collected');
    collected += 1;
    recordCount.textContent = String(collected);
    sfx('record');
    announce(collected === RECORD_SPOTS.length
      ? tr('allCollected')
      : tr('collected', { n: collected, total: RECORD_SPOTS.length }));
    // Remove from tab order once picked up.
    setTimeout(() => { b.hidden = true; }, 500);
  });
  recordsEl.appendChild(b);
});

/* ---------- Zone title card + navigation ---------- */
const card = document.getElementById('title-card');
const cardZone = document.getElementById('tc-zone');
// Zone id (from index.html) → the i18n key of its name, shown on the title card.
const ZONE_KEYS = { music: 'zoneMusic', code: 'zoneCode', photo: 'zonePhoto', contact: 'zoneContact' };
let cardTimer = 0;

function goTo(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const heading = section.querySelector('h2');
  section.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth' });
  history.replaceState(null, '', `#${id}`);
  heading?.focus({ preventScroll: true });
}

function enterZone(zone) {
  sfx('select');
  if (reducedMotion() || !ZONE_KEYS[zone]) { goTo(zone); return; }
  cardZone.textContent = tr(ZONE_KEYS[zone]);
  card.classList.remove('show');
  void card.offsetWidth; // restart the animation
  card.classList.add('show');
  clearTimeout(cardTimer);
  // Jump while the card covers the screen, then let it slide away.
  setTimeout(() => {
    const section = document.getElementById(zone);
    section?.scrollIntoView({ behavior: 'instant' });
    history.replaceState(null, '', `#${zone}`);
    section?.querySelector('h2')?.focus({ preventScroll: true });
  }, 500);
  cardTimer = setTimeout(() => card.classList.remove('show'), 1700);
}

document.querySelectorAll('[data-zone]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    enterZone(link.dataset.zone);
  });
});

document.getElementById('press-start').addEventListener('click', () => {
  sfx('start');
  goTo('zones');
});

/* ---------- Music players ---------- */
function renderPlayers() {
  document.querySelectorAll('.player-slot').forEach((slot) => {
    if (slot.querySelector('iframe')) return;
    const embed = EMBEDS[slot.dataset.embed];
    if (!embed) return;
    slot.replaceChildren();
    if (!embed.src) {
      const note = document.createElement('p');
      note.className = 'player-note';
      note.textContent = tr('playerNotSet');
      slot.appendChild(note);
      return;
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'load-btn';
    btn.textContent = tr('loadPlayer');
    btn.setAttribute('aria-label', tr('loadPlayerLabel', { name: embed.name }));
    btn.addEventListener('click', () => {
      const frame = document.createElement('iframe');
      frame.src = embed.src;
      frame.height = String(embed.height);
      frame.title = `${embed.name} player`;
      frame.loading = 'lazy';
      frame.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      if (embed.sandbox) frame.setAttribute('sandbox', embed.sandbox);
      slot.replaceChildren(frame);
      sfx('select');
      announce(tr('playerLoaded', { name: embed.name }));
    });
    slot.appendChild(btn);
  });
}

/* ---------- GitHub projects ---------- */
let repos = null;
let reposFailed = false;

async function loadRepos() {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(GITHUB_USER)}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Unexpected reply');
    repos = data
      .filter((r) => r && !r.fork && typeof r.name === 'string')
      .slice(0, 12)
      .map((r) => ({
        name: r.name,
        description: typeof r.description === 'string' ? r.description : '',
        language: typeof r.language === 'string' ? r.language : '',
        stars: Number.isFinite(r.stargazers_count) ? r.stargazers_count : 0,
        pushed: typeof r.pushed_at === 'string' ? r.pushed_at : '',
      }));
    if (!repos.length) throw new Error('No repos');
  } catch {
    repos = FALLBACK_REPOS;
    reposFailed = true;
  }
  renderRepos();
}

function renderRepos() {
  const grid = document.getElementById('repo-grid');
  const line = document.getElementById('repo-status');
  if (!repos) return;
  if (reposFailed) {
    line.dataset.i18n = 'reposError';
    line.textContent = tr('reposError');
  } else {
    line.hidden = true;
  }
  const fmt = new Intl.DateTimeFormat(getLang() === 'es' ? 'es-419' : 'en-US', { year: 'numeric', month: 'short' });
  grid.replaceChildren(...repos.map((r) => {
    const li = document.createElement('li');
    li.className = 'repo';
    const h = document.createElement('h4');
    const a = document.createElement('a');
    a.href = `https://github.com/${encodeURIComponent(GITHUB_USER)}/${encodeURIComponent(r.name)}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = r.name.replace(/[-_]/g, ' ');
    h.appendChild(a);
    const p = document.createElement('p');
    p.textContent = r.description || tr('noDescription');
    const meta = document.createElement('div');
    meta.className = 'repo-meta';
    if (r.language) {
      const lang = document.createElement('span');
      lang.className = 'repo-lang';
      lang.textContent = `● ${r.language}`;
      meta.appendChild(lang);
    }
    if (r.stars) {
      const s = document.createElement('span');
      s.textContent = `★ ${r.stars} ${tr(r.stars === 1 ? 'star' : 'stars')}`;
      meta.appendChild(s);
    }
    const when = r.pushed ? new Date(r.pushed) : null;
    if (when && !Number.isNaN(when.getTime())) {
      const u = document.createElement('span');
      u.textContent = `${tr('updated')} ${fmt.format(when)}`;
      meta.appendChild(u);
    }
    li.append(h, p, meta);
    return li;
  }));
}

/* ---------- Photos (placeholders until real photos arrive) ---------- */
function renderPhotos() {
  const grid = document.getElementById('photo-grid');
  grid.replaceChildren(...Array.from({ length: PHOTO_PLACEHOLDERS }, () => {
    const li = document.createElement('li');
    li.className = 'photo-slot';
    li.textContent = tr('photoSoon');
    return li;
  }));
}

/* ---------- Start ---------- */
function refreshAll() {
  applyPage();
  refreshLangButton();
  refreshSoundButton();
  refreshMusicButtons();
  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    el.setAttribute('aria-label', tr(el.dataset.i18nLabel));
  });
  document.querySelectorAll('.load-btn, .player-note').forEach((b) => b.remove());
  renderPlayers();
  renderRepos();
  renderPhotos();
}

document.getElementById('year').textContent = String(new Date().getFullYear());
document.querySelectorAll('[data-github-link]').forEach((a) => {
  a.href = `https://github.com/${encodeURIComponent(GITHUB_USER)}`;
});
refreshAll();
loadRepos();

/* ---------- Theme menu: switch to the Neon Noir template (Neon Noir or Alien) ---------- */
// EDIT: if you keep only this theme, remove the <select id="theme-select"> in index.html too.
const THEME_PAGES = { noir: '../neon-noir/', alien: '../neon-noir/?theme=alien' };
const siteTheme = document.getElementById('theme-select');
siteTheme.value = 'zone';
siteTheme.addEventListener('change', () => {
  const page = THEME_PAGES[siteTheme.value];
  if (!page) return;
  try { localStorage.setItem('rst_theme', siteTheme.value); } catch { /* ignore */ }
  location.href = page;
});
