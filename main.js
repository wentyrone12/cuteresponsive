'use strict';

const $ = (id) => document.getElementById(id);
const noBtn = $('noBtn');
const yesBtn = $('yesBtn');
const title = $('title');
const subtitle = $('subtitle');
const playground = $('playground');
const messageCard = $('messageCard');
const messageText = $('messageText');
const messageIcon = $('messageIcon');
const heroEmblem = $('heroEmblem');
const celebration = $('celebration');
const replayBtn = $('replayBtn');
const musicBtn = $('musicBtn');
const musicNote = $('musicNote');
const music = $('bgMusic');
const heartsContainer = $('hearts');
const originalGif = $('cuteGif');
const dodgeCounter = $('dodgeCounter');
const chaseProgress = $('chaseProgress');
const chaseGoal = $('chaseGoal');
const chaseMeta = $('chaseMeta');
const secretNote = $('secretNote');
const shareModal = $('shareModal');
const shareUrl = $('shareUrl');
const shareHelp = $('shareHelp');
const toast = $('toast');

const originalTitle = title.innerHTML;
const originalSubtitle = subtitle.innerHTML;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const messages = [
  ['🥺', 'Hala, sure ka? Try mo ulit hehe!'],
  ['🙈', 'Oops! Mabilis tumakbo si No!'],
  ['💘', 'Catch me if you can! Bawal sumuko!'],
  ['🐱', 'Pati si kitty, rooting for Yes!'],
  ['💌', 'Psst... may secret note ka na! Open mo sa baba.'],
  ['🌷', 'Bilis ko tumakbo, noh? Hihi!'],
  ['✨', 'Plot twist: lalo akong lumiliit!'],
  ['💗', 'Isang Yes lang, happy na ako!']
];
const symbols = ['💗', '💕', '💖', '💘', '🌸', '✨', '♡'];

// Preserve the EXACT celebration GIF URL from the original project.
// When GIPHY isn't reachable, show the packaged cat photo instead.
originalGif.addEventListener('load', () => {
  if (originalGif.naturalWidth > 0) originalGif.parentElement.classList.add('gif-loaded');
});
originalGif.addEventListener('error', () => {
  if (originalGif.dataset.fallback) return;
  originalGif.dataset.fallback = '1';
  originalGif.classList.add('gif-fallback');
  originalGif.src = 'cute2.png';
});

// No needs to be outside the card so it can escape across the entire viewport.
document.body.append(noBtn);

let dodgeCount = 0;
let lastDodge = -Infinity;
let lastPosition = null;
let accepted = false;
let heartTimer = null;
let toastTimer = null;
let preModalFocus = null;

function displayMessage(icon, text) {
  messageIcon.textContent = icon;
  messageText.textContent = text;
  messageCard.classList.remove('bump');
  // Restart the subtle animation even on repeated escapes.
  void messageCard.offsetWidth;
  messageCard.classList.add('bump');
}

function bounds() {
  const view = window.visualViewport;
  return {
    left: view ? view.offsetLeft : 0,
    top: view ? view.offsetTop : 0,
    width: view ? view.width : window.innerWidth,
    height: view ? view.height : window.innerHeight
  };
}

function placeNo(pointerX = null, pointerY = null, initial = false) {
  if (accepted || noBtn.hidden) return;
  const view = bounds();
  const zone = playground.getBoundingClientRect();
  const yes = yesBtn.getBoundingClientRect();
  const scale = initial ? 1 : Math.max(.36, 1 - dodgeCount * .083);
  const halfW = noBtn.offsetWidth * scale / 2;
  const halfH = noBtn.offsetHeight * scale / 2;
  const pad = 11;
  const minX = view.left + halfW + pad;
  const maxX = Math.max(minX, view.left + view.width - halfW - pad);
  const minY = view.top + halfH + pad;
  const maxY = Math.max(minY, view.top + view.height - halfH - pad);
  let x, y;

  if (initial) {
    // Start alongside Yes; after the first chase roam the full screen.
    x = zone.left + zone.width * (window.innerWidth <= 520 ? .76 : .72);
    y = zone.top + zone.height * .65;
  } else {
    let bestScore = -Infinity;
    let best = { x: maxX, y: minY };
    for (let i = 0; i < 175; i += 1) {
      const tryX = minX + Math.random() * Math.max(0, maxX - minX);
      const tryY = minY + Math.random() * Math.max(0, maxY - minY);
      const rect = { left: tryX - halfW, right: tryX + halfW, top: tryY - halfH, bottom: tryY + halfH };
      const onYes = rect.left < yes.right + 15 && rect.right > yes.left - 15 && rect.top < yes.bottom + 15 && rect.bottom > yes.top - 15;
      if (onYes) continue;
      const mouseDist = pointerX == null ? 700 : Math.hypot(tryX - pointerX, tryY - pointerY);
      if (pointerX != null && mouseDist < Math.min(160, Math.max(85, view.width * .25))) continue;
      const oldDist = lastPosition ? Math.hypot(tryX - lastPosition.x, tryY - lastPosition.y) : 0;
      const score = Math.min(oldDist, 640) + .36 * Math.min(mouseDist, 620) + Math.random() * 160;
      if (score > bestScore) { best = { x: tryX, y: tryY }; bestScore = score; }
    }
    x = best.x; y = best.y;
  }
  x = Math.max(minX, Math.min(maxX, x));
  y = Math.max(minY, Math.min(maxY, y));
  lastPosition = { x, y };
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

function createHeart() {
  if (heartsContainer.childElementCount >= 42) return;
  const heart = document.createElement('span');
  heart.className = 'heart';
  heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${16 + Math.random() * 17}px`;
  heart.style.setProperty('--heart-duration', `${3 + Math.random() * 2}s`);
  heart.style.setProperty('--heart-drift', `${(Math.random() - .5) * 160}px`);
  heartsContainer.append(heart);
  heart.addEventListener('animationend', () => heart.remove(), { once: true });
  setTimeout(() => heart.remove(), 5500);
}
function burstHearts(number) {
  if (reducedMotion.matches) return;
  for (let i = 0; i < number; i += 1) createHeart();
}
function stopHearts() {
  if (heartTimer != null) clearInterval(heartTimer);
  heartTimer = null;
  heartsContainer.replaceChildren();
}

function dodge(event) {
  if (accepted || !shareModal.hidden) return;
  const now = performance.now();
  if (now - lastDodge < 185) return;
  lastDodge = now;
  dodgeCount += 1;
  const [icon, msg] = messages[Math.min(dodgeCount - 1, messages.length - 1)];
  displayMessage(icon, msg);
  dodgeCounter.textContent = String(dodgeCount).padStart(2, '0');
  chaseProgress.style.width = `${Math.min(100, dodgeCount / 5 * 100)}%`;
  if (dodgeCount >= 5) {
    secretNote.hidden = false;
    chaseGoal.textContent = 'secret note unlocked ♡';
    if (dodgeCount === 5) burstHearts(11);
  }
  placeNo(event && Number.isFinite(event.clientX) ? event.clientX : null,
    event && Number.isFinite(event.clientY) ? event.clientY : null);
}

// Mouse movement anywhere on the page triggers a dodge when near the button.
document.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || event.pointerType !== 'mouse' || accepted || !shareModal.hidden) return;
  const r = noBtn.getBoundingClientRect();
  const x = Math.max(r.left, Math.min(event.clientX, r.right));
  const y = Math.max(r.top, Math.min(event.clientY, r.bottom));
  if (Math.hypot(event.clientX - x, event.clientY - y) < 91) dodge(event);
}, { passive: true });
noBtn.addEventListener('pointerenter', (event) => {
  if (finePointer.matches && event.pointerType === 'mouse') dodge(event);
});
noBtn.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'mouse') {
    event.preventDefault();
    dodge(event);
  }
});
noBtn.addEventListener('click', (event) => {
  event.preventDefault();
  dodge(event);
});

function syncMusicButton() {
  musicBtn.textContent = music.paused ? '♫ Play music' : '♫ Pause music';
  musicBtn.setAttribute('aria-pressed', String(!music.paused));
}
async function playMusic() {
  try {
    await music.play();
    musicNote.textContent = '';
  } catch {
    musicNote.textContent = 'Tap “Play music” to start the song on your device. ♡';
  }
  syncMusicButton();
}
musicBtn.addEventListener('click', () => {
  if (music.paused) void playMusic();
  else { music.pause(); musicNote.textContent = ''; syncMusicButton(); }
});
music.addEventListener('pause', syncMusicButton);
music.addEventListener('play', syncMusicButton);
music.addEventListener('ended', syncMusicButton);

yesBtn.addEventListener('click', () => {
  if (accepted) return;
  accepted = true;
  title.textContent = 'Yieeee! Crushback mo rin pala ako! 🥰';
  subtitle.textContent = 'Sabi na eh! You just made my whole day extra special. 💕';
  heroEmblem.querySelector('.hero-emblem-inner').textContent = '😍';
  playground.hidden = true;
  noBtn.hidden = true;
  messageCard.hidden = true;
  chaseMeta.hidden = true;
  secretNote.hidden = true;
  celebration.hidden = false;
  musicNote.textContent = '';
  burstHearts(18);
  if (!reducedMotion.matches) heartTimer = setInterval(createHeart, 320);
  void playMusic();
});
replayBtn.addEventListener('click', () => {
  accepted = false;
  dodgeCount = 0;
  lastDodge = -Infinity;
  lastPosition = null;
  music.pause();
  music.currentTime = 0;
  syncMusicButton();
  stopHearts();
  title.innerHTML = originalTitle;
  subtitle.innerHTML = originalSubtitle;
  heroEmblem.querySelector('.hero-emblem-inner').textContent = '🥹';
  playground.hidden = false;
  noBtn.hidden = false;
  messageCard.hidden = false;
  chaseMeta.hidden = false;
  celebration.hidden = true;
  secretNote.hidden = true;
  dodgeCounter.textContent = '00';
  chaseProgress.style.width = '0%';
  chaseGoal.textContent = '5 escapes = secret note ✨';
  musicNote.textContent = '';
  displayMessage('💭', 'May dalawang choices ka... pero may isang makulit! 😚');
  placeNo(null, null, true);
  yesBtn.focus({ preventScroll: true });
});

// Theme change works completely offline. Persist only the selected color.
function setTheme(theme) {
  if (!['blush','lilac','peach'].includes(theme)) return;
  document.body.dataset.theme = theme;
  document.querySelectorAll('[data-set-theme]').forEach((button) => {
    const active = button.dataset.setTheme === theme;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  try { localStorage.setItem('cute-theme', theme); } catch { /* private browsing */ }
}
try { setTheme(localStorage.getItem('cute-theme') || 'blush'); } catch { setTheme('blush'); }
document.querySelectorAll('[data-set-theme]').forEach(button => {
  button.addEventListener('click', () => setTheme(button.dataset.setTheme));
});

// Share in a styled custom card. A file:// link isn't publicly shareable.
function isPublished() { return /^https?:$/.test(window.location.protocol); }
function getLink() { return window.location.href.split('#')[0]; }
function showToast(text) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.textContent = text;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3300);
}
function openShare() {
  preModalFocus = document.activeElement;
  if (isPublished()) {
    shareUrl.textContent = getLink();
    shareHelp.textContent = 'Send this link to your crush or bestie ♡';
    $('copyShareBtn').textContent = '♡ Copy challenge link';
  } else {
    shareUrl.textContent = 'Your published website URL';
    shareHelp.textContent = 'For a working link, upload this website to GitHub Pages or another web host first.';
    $('copyShareBtn').textContent = '♡ Copy invite caption';
  }
  shareModal.hidden = false;
  document.body.classList.add('modal-open');
  $('closeShareBtn').focus();
}
function closeShare() {
  shareModal.hidden = true;
  document.body.classList.remove('modal-open');
  preModalFocus?.focus?.({ preventScroll: true });
}
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* use fallback */ }
  const box = document.createElement('textarea');
  box.value = text;
  box.style.position = 'fixed'; box.style.opacity = '0';
  document.body.append(box); box.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { /* unavailable */ }
  box.remove();
  return copied;
}
$('shareTopBtn').addEventListener('click', openShare);
$('shareBottomBtn').addEventListener('click', openShare);
$('closeShareBtn').addEventListener('click', closeShare);
shareModal.addEventListener('click', (event) => { if (event.target === shareModal) closeShare(); });
document.addEventListener('keydown', (event) => {
  if (shareModal.hidden) return;
  if (event.key === 'Escape') { closeShare(); return; }
  if (event.key === 'Tab') {
    const buttons = [$('closeShareBtn'), $('copyShareBtn')];
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[1]) { event.preventDefault(); buttons[0].focus(); }
  }
});
$('copyShareBtn').addEventListener('click', async () => {
  const text = isPublished() ? getLink() : 'Try mo tong cute Yes-or-No challenge ko! 💗 #NoButtonChallenge';
  const copied = await copyText(text);
  if (copied) { closeShare(); showToast(isPublished() ? 'Challenge link copied! 💌' : 'Invite caption copied! 💌'); }
  else { shareHelp.textContent = 'Copy manually: ' + text; shareUrl.textContent = text; }
});

let resizeFrame = 0;
function handleViewportChange() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    if (!accepted && shareModal.hidden) placeNo(null, null, dodgeCount === 0);
  });
}
window.addEventListener('resize', handleViewportChange);
window.visualViewport?.addEventListener('resize', handleViewportChange);
window.visualViewport?.addEventListener('scroll', handleViewportChange);

placeNo(null, null, true);
