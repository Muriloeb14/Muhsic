/* ============================================================
   MUHSIC — SCRIPT.JS (v10 — ações só em álbuns/playlists, curtir/discurtir)
   ============================================================ */

const session = requireSession();
if (!session) {
    console.error('❌ Sessão ausente — redirecionando para login...');
    window.location.replace('index.html');
    throw new Error('Sessão obrigatória');
}

const currentUserId   = session.id;
const currentUserName = session.name;
const currentUserPlan = session.plan;
const currentPlanCfg  = getPlanConfig(currentUserPlan);

let likedSongs  = [];
let likedAlbums = [];
let likedGenres = [];

let state = {
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isShuffled: false,
    volume: 0.7,
    currentItem: null,
    currentItemName: null
};

let autoQueue = [];
const QUEUE_SIZE = 3;
const MAX_VISIBLE_QUEUE = 7;

let playHistory = [];
const MAX_HISTORY = 50;

let currentPlayingSongId = null;
let pendingPlay = false;
let playerHasStarted = false;
let musicaReiniciada = false;

let audio, vinyl, vinylWrapper, tonearm, tonearmArm;
let progressBar, progress, currentTimeEl, durationEl;
let coverA, coverB;
let titleEl, artistEl;
let volumeOverlay, volumeRingFill, volumeRingGlow;
let likeOverlay;
let contextMenu, ctxRandomBtn, ctxMaximizeBtn;
let queueStack;

let maxPanel;
let maxTonearm, maxTonearmArm, maxVinylWrapper, maxVinyl;
let maxCover, maxTitle, maxArtist, maxNextList;
let maxLikeOverlay, maxContextMenu, maxCtxRandom, maxCtxMinimize;
let maxVolumeOverlay, maxVolumeRingFill, maxVolumeRingGlow;

let maxRafId = null;
let maxAngle = 0;
let maxLastTs = 0;
let maxAccumulatedAngle = 0;

let maxIsDragging = false;
let maxDragStartMouseAng = 0;
let maxDragStartDiskAng = 0;
let maxDragTotalRotation = 0;
let maxDragMoved = false;
let maxClickTimeout = null;

let clickSound = null;
let searchTimeout = null;

const $ = id => document.getElementById(id);

const CAPA_CURTIDAS = 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png';

const PASTA_CORES = [
    { classe: 'sleeve-green',  cor: '#00e676', corEscura: '#0d8a3a', grad: 'linear-gradient(145deg, #00e676 0%, #00c853 40%, #0d8a3a 100%)' },
    { classe: 'sleeve-purple', cor: '#c44dff', corEscura: '#7b1fa2', grad: 'linear-gradient(145deg, #c44dff 0%, #a020f0 40%, #7b1fa2 100%)' },
    { classe: 'sleeve-red',    cor: '#ff3b3b', corEscura: '#c62828', grad: 'linear-gradient(145deg, #ff3b3b 0%, #e53935 40%, #c62828 100%)' },
    { classe: 'sleeve-orange', cor: '#ff9800', corEscura: '#e65100', grad: 'linear-gradient(145deg, #ff9800 0%, #f57c00 40%, #e65100 100%)' },
    { classe: 'sleeve-blue',   cor: '#2196f3', corEscura: '#0d47a1', grad: 'linear-gradient(145deg, #2196f3 0%, #1976d2 40%, #0d47a1 100%)' },
    { classe: 'sleeve-pink',   cor: '#ff4081', corEscura: '#c2185b', grad: 'linear-gradient(145deg, #ff4081 0%, #e91e63 40%, #c2185b 100%)' },
    { classe: 'sleeve-yellow', cor: '#ffd600', corEscura: '#f57f17', grad: 'linear-gradient(145deg, #ffd600 0%, #fbc02d 40%, #f57f17 100%)' },
    { classe: 'sleeve-cyan',   cor: '#00e5ff', corEscura: '#00838f', grad: 'linear-gradient(145deg, #00e5ff 0%, #00bcd4 40%, #00838f 100%)' }
];

function getCorAleatoria() {
    return PASTA_CORES[Math.floor(Math.random() * PASTA_CORES.length)];
}

const corCache = new Map();

function extrairCorDominante(urlImagem) {
    return new Promise((resolve) => {
        if (!urlImagem) return resolve(null);
        if (corCache.has(urlImagem)) return resolve(corCache.get(urlImagem));
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = 50; canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                const data = ctx.getImageData(0, 0, 50, 50).data;
                let rSoma = 0, gSoma = 0, bSoma = 0, count = 0;
                for (let i = 0; i < data.length; i += 16) {
                    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                    if (a < 100) continue;
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (lum < 30 || lum > 230) continue;
                    rSoma += r; gSoma += g; bSoma += b; count++;
                }
                if (count === 0) { corCache.set(urlImagem, null); return resolve(null); }
                const cor = `rgb(${Math.round(rSoma / count)}, ${Math.round(gSoma / count)}, ${Math.round(bSoma / count)})`;
                corCache.set(urlImagem, cor);
                resolve(cor);
            } catch (e) {
                corCache.set(urlImagem, null);
                resolve(null);
            }
        };
        img.onerror = () => { corCache.set(urlImagem, null); resolve(null); };
        img.src = urlImagem;
    });
}

function escurecerCor(rgbStr, fator = 0.45) {
    if (!rgbStr) return '#0f7a33';
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return '#0f7a33';
    const r = Math.round(parseInt(match[0]) * fator);
    const g = Math.round(parseInt(match[1]) * fator);
    const b = Math.round(parseInt(match[2]) * fator);
    return `rgb(${r}, ${g}, ${b})`;
}

async function getCorPasta(urlUltimaMusica) {
    const corExtraida = await extrairCorDominante(urlUltimaMusica);
    if (!corExtraida) return getCorAleatoria();
    return {
        classe: 'sleeve-custom',
        cor: corExtraida,
        corEscura: escurecerCor(corExtraida),
        grad: `linear-gradient(145deg, ${corExtraida} 0%, ${corExtraida}dd 100%)`
    };
}

let accumulatedAngle = 0;
let spinStartTime    = 0;
let spinStartAngle   = 0;
let rafId            = null;
let brakeTimeoutId   = null;
const DEG_PER_SEC    = 360 / 4;

function applyAngle(angle) { if (vinyl) vinyl.style.transform = `rotate(${angle}deg)`; }

function spinLoop() {
    const elapsed = (performance.now() - spinStartTime) / 1000;
    applyAngle(spinStartAngle + elapsed * DEG_PER_SEC);
    rafId = requestAnimationFrame(spinLoop);
}

function startSpin() {
    if (!vinyl) return;
    cancelAnimationFrame(rafId);
    clearTimeout(brakeTimeoutId);
    spinStartAngle = accumulatedAngle;
    spinStartTime  = performance.now();
    rafId = requestAnimationFrame(spinLoop);
}

function stopSpin() {
    cancelAnimationFrame(rafId);
    rafId = null;
    const elapsed = (performance.now() - spinStartTime) / 1000;
    return spinStartAngle + elapsed * DEG_PER_SEC;
}

function brakeAndStop() {
    if (!vinyl) return;
    const startAngle = stopSpin();
    vinyl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.7, 0.4, 1)';
    applyAngle(startAngle + 28);
    brakeTimeoutId = setTimeout(() => {
        vinyl.style.transition = 'transform 0.35s cubic-bezier(0.3, 0.9, 0.4, 1)';
        applyAngle(startAngle + 18);
        accumulatedAngle = startAngle + 18;
        brakeTimeoutId = setTimeout(() => { vinyl.style.transition = 'none'; }, 360);
    }, 300);
}

function maxSpinLoop(ts) {
    if (!maxLastTs) maxLastTs = ts;
    const dt = (ts - maxLastTs) / 1000;
    maxLastTs = ts;
    maxAccumulatedAngle = (maxAccumulatedAngle + DEG_PER_SEC * dt) % 360;
    maxAngle = maxAccumulatedAngle;
    if (maxVinyl) maxVinyl.style.transform = `rotate(${maxAngle}deg)`;
    maxRafId = requestAnimationFrame(maxSpinLoop);
}

function startMaxSpin() {
    if (maxRafId) return;
    maxLastTs = 0;
    maxRafId = requestAnimationFrame(maxSpinLoop);
}

function stopMaxSpin() {
    if (maxRafId) { cancelAnimationFrame(maxRafId); maxRafId = null; }
}

function maxBrakeAndStop() {
    if (!maxVinyl) return;
    cancelAnimationFrame(maxRafId);
    maxRafId = null;
    const startAngle = maxAngle;
    maxVinyl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.7, 0.4, 1)';
    maxVinyl.style.transform = `rotate(${startAngle + 28}deg)`;
    setTimeout(() => {
        maxVinyl.style.transition = 'transform 0.35s cubic-bezier(0.3, 0.9, 0.4, 1)';
        maxVinyl.style.transform = `rotate(${startAngle + 18}deg)`;
        maxAccumulatedAngle = startAngle + 18;
        setTimeout(() => { maxVinyl.style.transition = 'none'; }, 360);
    }, 300);
}

function ensureQueueStack() {
    queueStack = $('queueStack');
    if (queueStack) return queueStack;
    const turntable = document.querySelector('.turntable');
    if (!turntable) return null;
    const stack = document.createElement('div');
    stack.className = 'queue-stack';
    stack.id = 'queueStack';
    const vinylW = turntable.querySelector('.vinyl-wrapper');
    if (vinylW) turntable.insertBefore(stack, vinylW);
    else turntable.appendChild(stack);
    queueStack = stack;
    return queueStack;
}

function initMuhsic() {
    if (window.__muhsicInited) return;
    window.__muhsicInited = true;

    try { loadTheme(); } catch (e) {}

    audio           = $('audio');
    vinyl           = $('vinyl');
    vinylWrapper    = $('vinyl-wrapper');
    tonearm         = $('tonearm');
    tonearmArm      = $('tonearm-arm');
    progressBar     = $('progress-bar');
    progress        = $('progress');
    currentTimeEl   = $('current-time');
    durationEl      = $('duration');
    coverA          = $('cover-a');
    coverB          = $('cover-b');
    titleEl         = $('track-title');
    artistEl        = $('track-artist');
    volumeOverlay   = $('volume-overlay');
    volumeRingFill  = $('volume-ring-fill');
    volumeRingGlow  = $('volume-ring-glow');
    likeOverlay     = $('like-overlay');
    contextMenu     = $('context-menu');
    ctxRandomBtn    = $('ctx-random');
    ctxMaximizeBtn  = $('ctx-maximize');

    maxPanel         = $('maxPlayerPanel');
    maxTonearm       = $('maxTonearm');
    maxTonearmArm    = $('maxTonearmArm');
    maxVinylWrapper  = $('maxVinylWrapper');
    maxVinyl         = $('maxVinyl');
    maxCover         = $('maxCover');
    maxTitle         = $('maxTitle');
    maxArtist        = $('maxArtist');
    maxNextList      = $('maxNextList');
    maxLikeOverlay   = $('maxLikeOverlay');
    maxContextMenu   = $('maxContextMenu');
    maxCtxRandom     = $('maxCtxRandom');
    maxCtxMinimize   = $('maxCtxMinimize');
    maxVolumeOverlay = $('maxVolumeOverlay');
    maxVolumeRingFill= $('maxVolumeRingFill');
    maxVolumeRingGlow= $('maxVolumeRingGlow');

    if (!audio || !vinyl || !vinylWrapper) return;

    ensureQueueStack();
    clickSound = new Audio('https://res.cloudinary.com/oizv8icb/video/upload/v1786688312/TapClick.wav');

    applyUserToUI();
    try { bindPlayerEvents(); } catch (e) {}
    try { bindMaxPanelEvents(); } catch (e) {}
    try { bindNavEvents(); } catch (e) {}
    try { bindUserMenu(); } catch (e) {}
    try { bindSearch(); } catch (e) {}
    try { bindSettings(); } catch (e) {}
    try { bindKeyboard(); } catch (e) {}

    initApp().catch(e => tentarEngatilharPrimeira());
    showLoginAnimation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMuhsic);
} else {
    initMuhsic();
}

function tentarEngatilharPrimeira() {
    try {
        const visible = getVisibleSongs(currentUserId);
        if (!visible.length) return;
        const p = visible[0];
        state.playlist = visible; state.currentIndex = 0;
        if (audio) { audio.src = p.url; audio.load(); audio.pause(); }
        if (titleEl) titleEl.textContent = p.title;
        if (artistEl) artistEl.textContent = p.artist;
        if (durationEl) durationEl.textContent = formatTime(p.duration || 0);
        setCover(p.coverImage, `Capa - ${p.title}`);
        currentPlayingSongId = p.id;
        playerHasStarted = true;
        state.isPlaying = false;
        if (tonearm) tonearm.classList.remove('active');
        if (progress) progress.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        buildQueue();
        updateHighlight();
    } catch (e) {}
}

function applyUserToUI() {
    const userNameEl = $('userName');
    const greetingEl = $('greetingUser');
    const avatarEl   = $('userAvatar');
    const planInfoEl = $('planInfo');
    if (userNameEl) userNameEl.textContent = currentUserName;
    if (greetingEl) greetingEl.textContent = currentUserName;
    if (avatarEl && session.avatar) avatarEl.src = session.avatar;
    if (planInfoEl) planInfoEl.textContent = currentPlanCfg.label;

    const planInfoRow = $('planInfoRow');
    if (planInfoRow) {
        planInfoRow.innerHTML = `<i class="fas fa-crown"></i> Plano: ${currentPlanCfg.label}`;
        planInfoRow.style.color = currentPlanCfg.color;
    }
    const adBanner = $('adBanner');
    if (adBanner) adBanner.style.display = currentPlanCfg.showAds ? 'block' : 'none';

    if (!currentPlanCfg.hasThemes) {
        const grid = $('themeGrid');
        const locked = $('settingsLocked');
        if (grid) grid.classList.add('locked');
        if (locked) locked.style.display = 'block';
    } else {
        const locked = $('settingsLocked');
        if (locked) locked.style.display = 'none';
    }
}

function showLoginAnimation() {
    const anim = $('loginAnimation');
    if (!anim) return;
    anim.classList.add('active');
    void anim.offsetWidth;
    setTimeout(() => {
        const s = new Audio('https://res.cloudinary.com/oizv8icb/video/upload/v1786685196/StartTypo.wav');
        s.play().catch(() => {});
    }, 100);
    setTimeout(() => anim.classList.remove('active'), 2200);
}

function playClickSound() {
    if (!clickSound) return;
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
}

function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getCurrentSong() {
    if (!state.playlist.length) return null;
    return state.playlist[state.currentIndex % state.playlist.length];
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getTotalDuration(tracks) {
    let t = 0;
    tracks.forEach(x => t += (x.duration || 0));
    return formatTime(t);
}

const duracaoCache = new Map();

function obterDuracaoReal(src) {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        if (duracaoCache.has(src)) return resolve(duracaoCache.get(src));
        const a = new Audio();
        a.preload = 'metadata';
        a.src = src;
        let r = false;
        const done = (v) => { if (r) return; r = true; duracaoCache.set(src, v); resolve(v); };
        a.addEventListener('loadedmetadata', () => done(isFinite(a.duration) && a.duration > 0 ? a.duration : null));
        a.addEventListener('error', () => done(null));
        setTimeout(() => done(null), 8000);
    });
}

async function sincronizarDuracoesBiblioteca() {
    const visible = getVisibleSongs(currentUserId);
    let mudou = false;
    for (const song of visible) {
        if (!song.url) continue;
        const real = await obterDuracaoReal(song.url);
        if (real && Math.abs((song.duration || 0) - real) > 1) { song.duration = real; mudou = true; }
    }
    if (mudou) {
        try { renderLibrary(); } catch (e) {}
        try { renderSearchResults(getVisibleSongs(currentUserId)); } catch (e) {}
        if (state.currentItem && state.currentItemName) {
            try { openDetail(state.currentItem, state.currentItemName); } catch (e) {}
        }
        const metaEl = $('libraryMeta');
        if (metaEl) {
            const vis = getVisibleSongs(currentUserId);
            metaEl.textContent = `${vis.length} discos · ${getTotalDuration(vis)}`;
        }
    }
}

let activeCover = 'a';

function setCover(src, alt = 'Capa') {
    if (!src) {
        if (coverA) coverA.src = '';
        if (coverB) coverB.src = '';
        if (maxCover) maxCover.src = '';
        return;
    }
    if (!coverA || !coverB) return;
    const incoming = activeCover === 'a' ? coverB : coverA;
    const outgoing = activeCover === 'a' ? coverA : coverB;
    const img = new Image();
    img.onload = () => {
        incoming.src = src;
        incoming.alt = alt;
        incoming.classList.add('active');
        outgoing.classList.remove('active');
        activeCover = activeCover === 'a' ? 'b' : 'a';
        if (maxCover) maxCover.src = src;
    };
    img.onerror = () => { incoming.src = ''; };
    img.src = src;
}

function playLikeAnimation(overlay) {
    if (!overlay) return;
    overlay.classList.remove('playing-like');
    overlay.classList.add('liked');
    void overlay.offsetWidth;
    overlay.classList.add('playing-like');
    setTimeout(() => overlay.classList.remove('playing-like'), 1450);
}

function toggleLikeCurrent() {
    const track = getCurrentSong();
    if (!track) return;
    const isFav = likedSongs.some(s => s.id === track.id);
    if (isFav) {
        likedSongs = likedSongs.filter(s => s.id !== track.id);
        if (likeOverlay) likeOverlay.classList.remove('liked');
        if (maxLikeOverlay) maxLikeOverlay.classList.remove('liked');
    } else {
        likedSongs.push({ ...track });
        playLikeAnimation(likeOverlay);
        playLikeAnimation(maxLikeOverlay);
    }
    try { renderSidebar(); } catch (e) {}
    try { renderHome(); } catch (e) {}
    if (state.currentItem === 'liked' && state.currentItemName === 'Discos curtidos') {
        try { openDetail('liked', 'Discos curtidos'); } catch (e) {}
    }
    updateHighlight();
}

let volumeOverlayTimeout = null;
let maxVolumeOverlayTimeout = null;
const RING_CIRCUMFERENCE = 289;

function applyVolume(value) {
    state.volume = Math.max(0, Math.min(1, value));
    if (audio) audio.volume = state.volume;
    const offset = RING_CIRCUMFERENCE * (1 - state.volume);
    if (volumeRingFill) volumeRingFill.style.strokeDashoffset = offset;
    if (volumeRingGlow) volumeRingGlow.style.strokeDashoffset = offset;
    if (maxVolumeRingFill) maxVolumeRingFill.style.strokeDashoffset = offset;
    if (maxVolumeRingGlow) maxVolumeRingGlow.style.strokeDashoffset = offset;
}

function showVolumeOverlay() {
    if (!volumeOverlay) return;
    volumeOverlay.classList.add('visible');
    if (vinylWrapper) vinylWrapper.classList.add('volume-active');
    clearTimeout(volumeOverlayTimeout);
    volumeOverlayTimeout = setTimeout(() => {
        volumeOverlay.classList.remove('visible');
        if (vinylWrapper) vinylWrapper.classList.remove('volume-active');
    }, 900);
}

function showMaxVolumeOverlay() {
    if (!maxVolumeOverlay) return;
    maxVolumeOverlay.classList.add('visible');
    if (maxVinylWrapper) maxVinylWrapper.classList.add('volume-active');
    clearTimeout(maxVolumeOverlayTimeout);
    maxVolumeOverlayTimeout = setTimeout(() => {
        maxVolumeOverlay.classList.remove('visible');
        if (maxVinylWrapper) maxVinylWrapper.classList.remove('volume-active');
    }, 900);
}

function buildQueue() {
    if (!state.playlist.length) { autoQueue = []; renderQueue(); renderMaxNext(); return; }
    const listLen = state.playlist.length;
    if (listLen <= 1 && !state.isShuffled) { autoQueue = []; renderQueue(); renderMaxNext(); return; }
    autoQueue = [];
    if (state.isShuffled) {
        const bib = getVisibleSongs(currentUserId);
        const pool = bib.filter(s => s.id !== currentPlayingSongId);
        if (pool.length === 0) { renderQueue(); renderMaxNext(); return; }
        for (let i = 0; i < QUEUE_SIZE; i++) autoQueue.push({ ...pool[Math.floor(Math.random() * pool.length)] });
    } else {
        for (let i = 1; i <= QUEUE_SIZE; i++) {
            autoQueue.push({ ...state.playlist[(state.currentIndex + i) % listLen] });
        }
    }
    renderQueue(); renderMaxNext();
}

function shiftQueue() { if (!autoQueue.length) return; autoQueue.shift(); pushToEnd(); }

function pushToEnd() {
    if (!state.playlist.length && !state.isShuffled) return;
    const listLen = state.playlist.length;
    if (listLen === 1 && !state.isShuffled) return;
    if (autoQueue.length >= QUEUE_SIZE) return;
    while (autoQueue.length < QUEUE_SIZE) {
        if (state.isShuffled) {
            const bib = getVisibleSongs(currentUserId);
            const ids = autoQueue.map(s => s.id);
            const pool = bib.filter(s => s.id !== currentPlayingSongId && !ids.includes(s.id));
            const poolF = pool.length > 0 ? pool : bib.filter(s => s.id !== currentPlayingSongId);
            if (poolF.length === 0) break;
            autoQueue.push({ ...poolF[Math.floor(Math.random() * poolF.length)] });
        } else {
            const ult = autoQueue.length ? autoQueue[autoQueue.length - 1] : state.playlist[state.currentIndex];
            const idxU = state.playlist.findIndex(s => s.id === ult.id);
            autoQueue.push({ ...state.playlist[(idxU + 1) % listLen] });
        }
    }
    renderQueue(); renderMaxNext();
}

function animarShuffleVisual() {
    if (queueStack) {
        queueStack.classList.add('shuffling');
        setTimeout(() => queueStack.classList.remove('shuffling'), 800);
    }
    const maxNextEl = $('maxNextList');
    if (maxNextEl) {
        maxNextEl.classList.add('shuffling');
        setTimeout(() => maxNextEl.classList.remove('shuffling'), 800);
    }
}

function shuffleQueue() { animarShuffleVisual(); setTimeout(() => buildQueue(), 400); }

function renderQueue() {
    if (!queueStack) ensureQueueStack();
    if (!queueStack) return;
    if (autoQueue.length === 0) { queueStack.innerHTML = ''; return; }
    const pos = [
        { x: 60,  s: 0.96, z: 4 },
        { x: 110, s: 0.92, z: 3 },
        { x: 160, s: 0.88, z: 2 }
    ];
    queueStack.innerHTML = autoQueue.slice(0, 3).map((song, i) => {
        const img = song.coverImage
            ? `<img src="${song.coverImage}" alt="${song.title}">`
            : `<div style="width:100%;height:100%;background:#3a3a3a;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:700;">${song.title.charAt(0)}</div>`;
        const p = pos[i] || pos[pos.length - 1];
        return `<div class="queue-vinyl" style="transform: translateX(${p.x}px) scale(${p.s}); z-index: ${p.z}; --q-x: ${p.x}px; --q-s: ${p.s};"><div class="queue-cover">${img}</div></div>`;
    }).join('');
}

function getDiscosASeguir() {
    const lista = [...autoQueue];
    if (lista.length >= MAX_VISIBLE_QUEUE) return lista.slice(0, MAX_VISIBLE_QUEUE);
    const usados = new Set(lista.map(s => s.id));
    if (currentPlayingSongId) usados.add(currentPlayingSongId);
    const bib = getVisibleSongs(currentUserId);
    const extras = bib.filter(s => !usados.has(s.id));
    for (let i = extras.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [extras[i], extras[j]] = [extras[j], extras[i]];
    }
    while (lista.length < MAX_VISIBLE_QUEUE && extras.length) lista.push(extras.shift());
    return lista;
}

function renderMaxNext() {
    if (!maxNextList) return;
    const lista = getDiscosASeguir();
    if (!lista.length) {
        maxNextList.innerHTML = `<p style="color:var(--text-secondary);font-size:12px;text-align:center;padding:10px;">Nenhum disco na fila.</p>`;
        return;
    }
    maxNextList.innerHTML = lista.map((song) => {
        const cover = song.coverImage
            ? `<img src="${song.coverImage}" alt="${song.title}">`
            : `<div class="placeholder">${song.title.charAt(0)}</div>`;
        return `
            <div class="max-next-item" data-song-id="${song.id}">
                <div class="max-next-cover">${cover}</div>
                <div class="max-next-info">
                    <div class="max-next-title">${song.title}</div>
                    <div class="max-next-artist">${song.artist}</div>
                </div>
            </div>
        `;
    }).join('');
    maxNextList.querySelectorAll('.max-next-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.songId);
            if (!isNaN(id)) tocarDiscoPorId(id);
        });
    });
}

function tocarDiscoPorId(songId) {
    let idx = state.playlist.findIndex(s => s.id === songId);
    if (idx === -1) {
        const bib = getVisibleSongs(currentUserId);
        const song = bib.find(s => s.id === songId);
        if (!song) return;
        state.playlist.push({ ...song });
        idx = state.playlist.length - 1;
    }
    const posFila = autoQueue.findIndex(s => s.id === songId);
    if (posFila !== -1) { autoQueue = autoQueue.slice(posFila + 1); pushToEnd(); }
    const cur = state.playlist[state.currentIndex];
    if (cur && playerHasStarted && cur.id !== songId) {
        playHistory.push({ ...cur });
        if (playHistory.length > MAX_HISTORY) playHistory.shift();
    }
    state.currentIndex = idx;
    playerHasStarted = true;
    loadTrack(idx, true, false);
    buildQueue();
}

function loadTrack(index, autoPlay = false, addToHistory = false) {
    if (!state.playlist.length) return;
    if (addToHistory) {
        const cur = state.playlist[state.currentIndex];
        if (cur && (playHistory.length === 0 || playHistory[playHistory.length - 1].id !== cur.id)) {
            playHistory.push({ ...cur });
            if (playHistory.length > MAX_HISTORY) playHistory.shift();
        }
    }
    state.currentIndex = index % state.playlist.length;
    const track = state.playlist[state.currentIndex];
    if (!track) return;
    setCover(track.coverImage, `Capa - ${track.title}`);
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (audio) audio.src = track.url;
    if (progress) progress.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    if (durationEl) durationEl.textContent = formatTime(track.duration || 0);
    currentPlayingSongId = track.id;
    musicaReiniciada = false;
    updateHighlight();
    if (maxTitle) maxTitle.textContent = track.title;
    if (maxArtist) maxArtist.textContent = track.artist;
    if (maxCover && track.coverImage) maxCover.src = track.coverImage;
    if (autoPlay && audio) {
        pendingPlay = true;
        if (tonearm) tonearm.classList.add('active');
        if (maxTonearm) maxTonearm.classList.add('active');
        const pp = audio.play();
        if (pp && pp.catch) pp.catch(() => {});
    } else if (audio) {
        audio.pause();
    }
}

function togglePlay() {
    if (!audio) return;
    if (audio.paused) {
        pendingPlay = true;
        if (tonearm) tonearm.classList.add('active');
        if (maxTonearm) maxTonearm.classList.add('active');
        audio.play().catch(() => {});
    } else {
        pendingPlay = false;
        audio.pause();
    }
}

function playFromShelf(songId) {
    if (!state.playlist.length) return;
    const idx = state.playlist.findIndex(s => s.id === songId);
    if (idx === -1) return;
    const cur = state.playlist[state.currentIndex];
    if (cur && playerHasStarted && cur.id !== songId) {
        playHistory.push({ ...cur });
        if (playHistory.length > MAX_HISTORY) playHistory.shift();
    }
    state.currentIndex = idx;
    playerHasStarted = true;
    loadTrack(idx, true, false);
    buildQueue();
}

function nextTrack() {
    if (!state.playlist.length && !state.isShuffled) return;
    if (autoQueue.length > 0) {
        const next = autoQueue[0];
        let idx = state.playlist.findIndex(s => s.id === next.id);
        if (idx === -1) { state.playlist.push({ ...next }); idx = state.playlist.length - 1; }
        state.currentIndex = idx;
        shiftQueue();
        loadTrack(state.currentIndex, true, true);
        return;
    }
    let nextIndex;
    if (state.isShuffled) {
        const bib = getVisibleSongs(currentUserId);
        const pool = bib.filter(s => s.id !== currentPlayingSongId);
        if (pool.length === 0) return;
        const next = pool[Math.floor(Math.random() * pool.length)];
        let idx = state.playlist.findIndex(s => s.id === next.id);
        if (idx === -1) { state.playlist.push({ ...next }); idx = state.playlist.length - 1; }
        nextIndex = idx;
    } else {
        nextIndex = (state.currentIndex + 1) % state.playlist.length;
    }
    loadTrack(nextIndex, true, true);
    buildQueue();
}

function prevTrack() {
    if (!state.playlist.length) return;
    const t = (audio && audio.currentTime) || 0;
    if (t > 3 && !musicaReiniciada) {
        audio.currentTime = 0;
        musicaReiniciada = true;
        if (audio.paused) {
            pendingPlay = true;
            if (tonearm) tonearm.classList.add('active');
            if (maxTonearm) maxTonearm.classList.add('active');
            audio.play().catch(() => {});
        }
        return;
    }
    if (playHistory.length > 0) {
        const prev = playHistory.pop();
        let idx = state.playlist.findIndex(s => s.id === prev.id);
        if (idx !== -1) { loadTrack(idx, true, false); buildQueue(); return; }
        state.playlist.push({ ...prev });
        loadTrack(state.playlist.length - 1, true, false);
        buildQueue();
        return;
    }
    const prevIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
    loadTrack(prevIndex, true, false);
    buildQueue();
}

function tocarAleatoriaGlobal() {
    const bib = getVisibleSongs(currentUserId);
    if (!bib.length) return;
    const pool = bib.filter(s => s.id !== currentPlayingSongId);
    if (!pool.length) return;
    if (!state.isShuffled) {
        state.isShuffled = true;
        if (ctxRandomBtn) ctxRandomBtn.classList.add('active');
        if (maxCtxRandom) maxCtxRandom.classList.add('active');
    }
    const sort = pool[Math.floor(Math.random() * pool.length)];
    let idx = state.playlist.findIndex(s => s.id === sort.id);
    if (idx === -1) { state.playlist.push({ ...sort }); idx = state.playlist.length - 1; }
    const cur = state.playlist[state.currentIndex];
    if (cur && playerHasStarted && cur.id !== sort.id) {
        playHistory.push({ ...cur });
        if (playHistory.length > MAX_HISTORY) playHistory.shift();
    }
    state.currentIndex = idx;
    playerHasStarted = true;
    loadTrack(idx, true, false);
    buildQueue();
    animarShuffleVisual();
}

function openContextMenu() {
    if (contextMenu) contextMenu.classList.add('visible');
    if (ctxRandomBtn) ctxRandomBtn.classList.toggle('active', state.isShuffled);
}
function closeContextMenu() {
    if (contextMenu) contextMenu.classList.remove('visible');
}

let isDragging = false;
let dragStartMouseAng = 0;
let dragStartDiskAng = 0;
let dragTotalRotation = 0;
let dragMoved = false;
const SWAP_THRESHOLD = 60;
const CLICK_TOLERANCE = 6;
const DBLCLICK_DELAY = 280;
let clickTimeout = null;

function getMouseAngleFor(el, evt) {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = evt.clientX - cx;
    const dy = evt.clientY - cy;
    return Math.atan2(dy, dx) * (180 / Math.PI);
}

function angleDiff(a, b) {
    let d = a - b;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
}

function abrirMaxPanel() {
    if (!maxPanel) return;
    maxPanel.classList.add('open');
    maxPanel.setAttribute('aria-hidden', 'false');
    renderMaxNext();
    if (audio && !audio.paused) {
        if (maxTonearm) maxTonearm.classList.add('active');
        startMaxSpin();
    }
}

function fecharMaxPanel() {
    if (!maxPanel) return;
    maxPanel.classList.remove('open');
    maxPanel.setAttribute('aria-hidden', 'true');
    stopMaxSpin();
}

function bindPlayerEvents() {
    if (!audio || !vinylWrapper) return;

    audio.addEventListener('play', () => {
        clearTimeout(brakeTimeoutId);
        if (vinyl) vinyl.style.transition = 'none';
        startSpin();
        state.isPlaying = true;
        updateHighlight();
        if (tonearm) tonearm.classList.add('active');
        if (maxTonearm) maxTonearm.classList.add('active');
        if (maxPanel && maxPanel.classList.contains('open')) startMaxSpin();
    });

    audio.addEventListener('pause', () => {
        brakeAndStop();
        if (tonearm) tonearm.classList.remove('active');
        if (maxTonearm) maxTonearm.classList.remove('active');
        if (maxVinyl) maxBrakeAndStop();
        state.isPlaying = false;
        updateHighlight();
    });

    audio.addEventListener('loadedmetadata', () => {
        const d = audio.duration;
        if (!isFinite(d) || d <= 0) return;
        if (durationEl) durationEl.textContent = formatTime(d);
        const track = getCurrentSong();
        if (track) {
            track.duration = d;
            const el = document.querySelector(`.vinyl-item[data-id="${track.id}"] .shelf-duration`);
            if (el) el.innerHTML = `<i class="far fa-clock"></i> ${formatTime(d)}`;
        }
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        if (progress) progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (audio.currentTime > 3) musicaReiniciada = false;
    });

    audio.addEventListener('ended', () => nextTrack());

    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (!isNaN(audio.duration)) audio.currentTime = pct * audio.duration;
        });
    }

    vinylWrapper.addEventListener('wheel', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (contextMenu && contextMenu.classList.contains('visible')) return;
        applyVolume(state.volume + (e.deltaY > 0 ? -0.05 : 0.05));
        showVolumeOverlay();
    }, { passive: false });

    vinylWrapper.addEventListener('contextmenu', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (contextMenu && contextMenu.classList.contains('visible')) closeContextMenu();
        else openContextMenu();
    });

    if (ctxRandomBtn) ctxRandomBtn.addEventListener('click', (e) => {
        e.stopPropagation(); closeContextMenu(); tocarAleatoriaGlobal();
    });
    if (ctxMaximizeBtn) ctxMaximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); closeContextMenu(); abrirMaxPanel();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeContextMenu();
    });

    vinylWrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (contextMenu && contextMenu.classList.contains('visible')) return;
        isDragging = true;
        dragStartMouseAng = getMouseAngleFor(vinylWrapper, e);
        dragStartDiskAng = accumulatedAngle;
        dragTotalRotation = 0;
        dragMoved = false;
        clearTimeout(brakeTimeoutId);
        if (vinyl) vinyl.style.transition = 'none';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const cur = getMouseAngleFor(vinylWrapper, e);
        const delta = angleDiff(cur, dragStartMouseAng);
        dragTotalRotation += delta;
        dragStartMouseAng = cur;
        if (!dragMoved && Math.abs(dragTotalRotation) > CLICK_TOLERANCE) {
            dragMoved = true;
            cancelAnimationFrame(rafId);
            vinylWrapper.classList.add('dragging');
        }
        if (dragMoved) applyAngle(dragStartDiskAng + dragTotalRotation);
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        vinylWrapper.classList.remove('dragging');
        const total = dragTotalRotation;
        if (total >= SWAP_THRESHOLD) {
            accumulatedAngle = dragStartDiskAng + total;
            nextTrack();
        } else if (total <= -SWAP_THRESHOLD) {
            accumulatedAngle = dragStartDiskAng + total;
            prevTrack();
        } else {
            if (!dragMoved) {
                togglePlay();
            } else {
                accumulatedAngle = dragStartDiskAng;
                if (vinyl) vinyl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)';
                applyAngle(accumulatedAngle);
                setTimeout(() => {
                    if (vinyl) vinyl.style.transition = 'none';
                    if (audio && !audio.paused) startSpin();
                }, 420);
            }
        }
        dragTotalRotation = 0;
    });

    vinylWrapper.addEventListener('dblclick', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (contextMenu && contextMenu.classList.contains('visible')) return;
        toggleLikeCurrent();
    });

    if (tonearmArm) {
        tonearmArm.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'transform') return;
            if (tonearm && tonearm.classList.contains('active') && pendingPlay) {
                pendingPlay = false;
                audio.play().catch(() => {});
            }
        });
    }

    vinylWrapper.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        vinylWrapper.classList.add('drop-target');
    });
    vinylWrapper.addEventListener('dragleave', (e) => {
        if (!vinylWrapper.contains(e.relatedTarget)) vinylWrapper.classList.remove('drop-target');
    });
    vinylWrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        vinylWrapper.classList.remove('drop-target');
        const songId = parseInt(e.dataTransfer.getData('text/plain'));
        if (songId) playFromShelf(songId);
    });
}

function bindMaxPanelEvents() {
    if (!maxPanel) return;

    if (maxCtxMinimize) maxCtxMinimize.addEventListener('click', (e) => {
        e.stopPropagation(); fecharMaxPanel();
    });
    if (maxCtxRandom) maxCtxRandom.addEventListener('click', (e) => {
        e.stopPropagation(); closeMaxContextMenu(); tocarAleatoriaGlobal();
    });

    if (maxVinylWrapper) {
        maxVinylWrapper.addEventListener('wheel', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (maxContextMenu && maxContextMenu.classList.contains('visible')) return;
            applyVolume(state.volume + (e.deltaY > 0 ? -0.05 : 0.05));
            showMaxVolumeOverlay();
        }, { passive: false });

        maxVinylWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (maxContextMenu && maxContextMenu.classList.contains('visible')) closeMaxContextMenu();
            else openMaxContextMenu();
        });

        maxVinylWrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (maxContextMenu && maxContextMenu.classList.contains('visible')) return;
            maxIsDragging = true;
            maxDragStartMouseAng = getMouseAngleFor(maxVinylWrapper, e);
            maxDragStartDiskAng = maxAccumulatedAngle;
            maxDragTotalRotation = 0;
            maxDragMoved = false;
            stopMaxSpin();
            if (maxVinyl) maxVinyl.style.transition = 'none';
            e.preventDefault();
        });

        maxVinylWrapper.addEventListener('dblclick', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (maxContextMenu && maxContextMenu.classList.contains('visible')) return;
            toggleLikeCurrent();
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!maxIsDragging) return;
        const cur = getMouseAngleFor(maxVinylWrapper, e);
        const delta = angleDiff(cur, maxDragStartMouseAng);
        maxDragTotalRotation += delta;
        maxDragStartMouseAng = cur;
        if (!maxDragMoved && Math.abs(maxDragTotalRotation) > CLICK_TOLERANCE) {
            maxDragMoved = true;
            maxVinylWrapper.classList.add('dragging');
        }
        if (maxDragMoved && maxVinyl) {
            maxVinyl.style.transform = `rotate(${maxDragStartDiskAng + maxDragTotalRotation}deg)`;
        }
    });

    window.addEventListener('mouseup', () => {
        if (!maxIsDragging) return;
        maxIsDragging = false;
        if (maxVinylWrapper) maxVinylWrapper.classList.remove('dragging');
        const total = maxDragTotalRotation;
        if (total >= SWAP_THRESHOLD) {
            maxAccumulatedAngle = maxDragStartDiskAng + total;
            if (maxVinyl) maxVinyl.style.transform = `rotate(${maxAccumulatedAngle}deg)`;
            nextTrack();
        } else if (total <= -SWAP_THRESHOLD) {
            maxAccumulatedAngle = maxDragStartDiskAng + total;
            if (maxVinyl) maxVinyl.style.transform = `rotate(${maxAccumulatedAngle}deg)`;
            prevTrack();
        } else {
            if (!maxDragMoved) {
                togglePlay();
            } else {
                maxAccumulatedAngle = maxDragStartDiskAng;
                if (maxVinyl) maxVinyl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)';
                if (maxVinyl) maxVinyl.style.transform = `rotate(${maxAccumulatedAngle}deg)`;
                setTimeout(() => {
                    if (maxVinyl) maxVinyl.style.transition = 'none';
                    if (audio && !audio.paused) startMaxSpin();
                }, 420);
            }
        }
        maxDragTotalRotation = 0;
    });

    if (maxTonearmArm) {
        maxTonearmArm.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'transform') return;
            if (maxTonearm && maxTonearm.classList.contains('active') && pendingPlay) {
                pendingPlay = false;
                audio.play().catch(() => {});
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && maxPanel && maxPanel.classList.contains('open')) {
            if (maxContextMenu && maxContextMenu.classList.contains('visible')) closeMaxContextMenu();
            else fecharMaxPanel();
        }
    });
}

function openMaxContextMenu() {
    if (maxContextMenu) maxContextMenu.classList.add('visible');
    if (maxCtxRandom) maxCtxRandom.classList.toggle('active', state.isShuffled);
}
function closeMaxContextMenu() {
    if (maxContextMenu) maxContextMenu.classList.remove('visible');
}

function updateHighlight() {
    document.querySelectorAll('.vinyl-item').forEach(el => {
        const id = parseInt(el.dataset.id);
        const cur = currentPlayingSongId !== null && id === currentPlayingSongId && state.isPlaying;
        el.classList.toggle('current', cur);
    });
}

function getItemsByCategory(category, nameField) {
    const visible = getVisibleSongs(currentUserId);
    const map = {};
    visible.forEach(s => {
        if (s.category === category) {
            const k = s[nameField];
            if (!map[k]) map[k] = [];
            map[k].push(s);
        }
    });
    return map;
}

/* ✅ Helper: verifica se um álbum/gênero/playlist está curtido */
function isAlbumCurtido(name) {
    return likedAlbums.some(a => a.name === name);
}
function isGenreCurtido(name) {
    return likedGenres.some(g => g.name === name);
}

/* ✅ Botão ♥ do header do detalhe — só em Álbuns e Playlists */
async function createCardHTMLAsync(name, tracks, type, customCover) {
    const totalDur = getTotalDuration(tracks);
    const isCurt = type === 'liked' && name === 'Discos curtidos';

    if (isCurt) {
        return `
            <div class="pasta-card pasta-card-curtidas" data-type="${type}" data-name="${name}">
                <div class="pasta-cover">
                    <img class="curtidas-cover-full" src="${CAPA_CURTIDAS}" alt="Discos Curtidos">
                </div>
                <div class="pasta-info">
                    <h3>${name}</h3>
                    <p>${tracks.length} discos · ${totalDur}</p>
                </div>
            </div>
        `;
    }

    const qtd = Math.min(4, Math.max(1, tracks.length));
    const discos = tracks.slice(-qtd);
    const discosHTML = discos.map(t => {
        const img = t.coverImage ? `<img src="${t.coverImage}" alt="${t.title}">` : `<div class="placeholder">${t.title.charAt(0)}</div>`;
        return `<div class="pasta-vinyl"><div class="pasta-vinyl-label">${img}</div></div>`;
    }).join('');
    const ultima = tracks[tracks.length - 1];
    const imgF = customCover || ultima?.coverImage || null;
    const pastaCor = await getCorPasta(imgF);
    const cor = pastaCor.classe;
    const has = !!imgF;
    const bg = has
        ? `style="background-image: url('${imgF}'); --pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};"`
        : `style="--pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};"`;

    return `
        <div class="pasta-card" data-type="${type}" data-name="${name}">
            <div class="pasta-cover">
                <div class="pasta-vinyls" data-count="${qtd}">${discosHTML}</div>
                <div class="pasta-sleeve ${cor}${has ? ' has-image' : ''}" ${bg}>
                    <div class="sleeve-tint"></div>
                    <div class="sleeve-shine"></div>
                    <div class="pasta-logo"><img src="https://res.cloudinary.com/txf25hqh/image/upload/v1792431741/MFADE.png" alt="MFADE"></div>
                </div>
            </div>
            <div class="pasta-info">
                <h3>${name}</h3>
                <p>${tracks.length} discos · ${totalDur}</p>
            </div>
        </div>
    `;
}

async function renderHome() {
    const c = $('homePlaylistsContainer');
    if (!c) return;
    let html = '';
    const genres = getItemsByCategory('genre', 'genre');
    if (Object.keys(genres).length) {
        html += `<div class="section-header"><h2>Feito pra você</h2></div><div class="playlists-grid">`;
        for (const [n, t] of Object.entries(genres)) html += await createCardHTMLAsync(n, t, 'genre');
        html += `</div>`;
    }
    const albums = getItemsByCategory('album', 'album');
    if (Object.keys(albums).length) {
        html += `<div class="section-header"><h2>Álbuns Salvos</h2></div><div class="playlists-grid">`;
        for (const [n, t] of Object.entries(albums)) html += await createCardHTMLAsync(n, t, 'album');
        html += `</div>`;
    }
    const playlists = getItemsByCategory('playlist', 'playlist');
    if (Object.keys(playlists).length) {
        html += `<div class="section-header"><h2>Suas Playlists</h2></div><div class="playlists-grid">`;
        for (const [n, t] of Object.entries(playlists)) html += await createCardHTMLAsync(n, t, 'playlist');
        html += `</div>`;
    }
    const likedVisible = likedSongs.filter(s => s.userIds.includes(0) || s.userIds.includes(currentUserId));
    if (likedVisible.length) {
        html += `<div class="section-header"><h2>Discos Curtidos</h2></div><div class="playlists-grid">`;
        html += await createCardHTMLAsync('Discos curtidos', likedVisible, 'liked');
        for (const a of likedAlbums) html += await createCardHTMLAsync(a.name, a.tracks, 'liked');
        for (const g of likedGenres) html += await createCardHTMLAsync(g.name, g.tracks, 'liked');
        html += `</div>`;
    }
    c.innerHTML = html;
    c.querySelectorAll('.pasta-card').forEach(card => {
        card.addEventListener('click', function(e) {
            openDetail(this.dataset.type, this.dataset.name);
        });
    });
}

async function createSidebarItemAsync(name, tracks, type, customCover) {
    const isCurt = type === 'liked' && name === 'Discos curtidos';
    if (isCurt) {
        return `
            <div class="pasta-item-sidebar" data-type="${type}" data-name="${name}">
                <div class="pasta-mini pasta-mini-curtidas"><img src="${CAPA_CURTIDAS}" alt="Curtidos"></div>
                <span>${name}</span>
            </div>
        `;
    }
    const ultima = tracks[tracks.length - 1];
    const imgF = customCover || ultima?.coverImage || null;
    const pastaCor = await getCorPasta(imgF);
    const cor = pastaCor.classe;
    const has = !!imgF;
    const bg = has
        ? `style="background-image: url('${imgF}'); --pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};"`
        : `style="--pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};"`;
    return `
        <div class="pasta-item-sidebar" data-type="${type}" data-name="${name}">
            <div class="pasta-mini ${cor}${has ? ' has-image' : ''}" ${bg}>
                <div class="mini-tint"></div>
                <div class="mini-shine"></div>
                <div class="mini-logo"><img src="https://res.cloudinary.com/txf25hqh/image/upload/v1792431741/MFADE.png" alt="MFADE"></div>
            </div>
            <span>${name}</span>
        </div>
    `;
}

async function renderSidebar() {
    const c = $('sidebarPlaylistsContainer');
    if (!c) return;
    let html = '';
    const albums = getItemsByCategory('album', 'album');
    if (Object.keys(albums).length) {
        html += `<div class="playlists-section-title">Álbuns Salvos</div>`;
        for (const [n, t] of Object.entries(albums)) html += await createSidebarItemAsync(n, t, 'album');
    }
    const playlists = getItemsByCategory('playlist', 'playlist');
    if (Object.keys(playlists).length) {
        html += `<div class="playlists-section-title">Playlists</div>`;
        for (const [n, t] of Object.entries(playlists)) html += await createSidebarItemAsync(n, t, 'playlist');
    }
    const likedVisible = likedSongs.filter(s => s.userIds.includes(0) || s.userIds.includes(currentUserId));
    if (likedVisible.length) {
        html += `<div class="playlists-section-title">Discos Curtidos</div>`;
        html += await createSidebarItemAsync('Discos curtidos', likedVisible, 'liked');
        for (const a of likedAlbums) html += await createSidebarItemAsync(a.name, a.tracks, 'liked', a.coverImage);
        for (const g of likedGenres) html += await createSidebarItemAsync(g.name, g.tracks, 'liked');
    }
    const genres = getItemsByCategory('genre', 'genre');
    if (Object.keys(genres).length) {
        html += `<div class="playlists-section-title">Gêneros</div>`;
        for (const [n, t] of Object.entries(genres)) html += await createSidebarItemAsync(n, t, 'genre');
    }
    c.innerHTML = html;
    c.querySelectorAll('.pasta-item-sidebar').forEach(item => {
        item.addEventListener('click', function() {
            openDetail(this.dataset.type, this.dataset.name);
        });
    });
}

async function openDetail(type, name) {
    const visible = getVisibleSongs(currentUserId);
    let tracks = [];
    let customCover = null;
    const isCurt = type === 'liked' && name === 'Discos curtidos';

    if (type === 'album') tracks = visible.filter(s => s.category === 'album' && s.album === name);
    else if (type === 'playlist') tracks = visible.filter(s => s.category === 'playlist' && s.playlist === name);
    else if (type === 'genre') tracks = visible.filter(s => s.category === 'genre' && s.genre === name);
    else if (type === 'liked') {
        if (name === 'Discos curtidos') {
            tracks = likedSongs.filter(s => s.userIds.includes(0) || s.userIds.includes(currentUserId));
            customCover = CAPA_CURTIDAS;
        } else {
            const a = likedAlbums.find(x => x.name === name);
            const g = likedGenres.find(x => x.name === name);
            if (a) { tracks = a.tracks; customCover = a.coverImage; }
            else if (g) tracks = g.tracks;
        }
    }
    if (!tracks.length) return;

    state.currentItem = type;
    state.currentItemName = name;
    state.playlist = tracks;

    const pageHome = $('page-home');
    if (pageHome) pageHome.classList.remove('active');
    const detail = $('playlistDetail');
    if (detail) detail.classList.add('active');

    const header = $('detailHeader');
    const coverC = $('detailCover');
    const ultima = tracks[tracks.length - 1];
    const imgF = customCover || ultima?.coverImage || null;
    const pastaCor = await getCorPasta(imgF);
    const cor = pastaCor.classe;
    const has = !!imgF;

    if (header) {
        header.style.setProperty('--detail-cor', pastaCor.cor);
        header.style.setProperty('--detail-cor-escura', pastaCor.corEscura);
        header.style.background = `linear-gradient(135deg, ${pastaCor.cor}, ${pastaCor.corEscura})`;
    }

    if (coverC) {
        if (isCurt) {
            coverC.className = '';
            coverC.innerHTML = `<div class="detail-pasta-wrap detail-pasta-curtidas"><img src="${CAPA_CURTIDAS}" alt="Curtidos"></div>`;
        } else {
            const bg = has
                ? `style="background-image: url('${imgF}'); --pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};"`
                : `style="--pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};"`;
            coverC.className = '';
            coverC.innerHTML = `
                <div class="detail-pasta-wrap ${cor}${has ? ' has-image' : ''}" ${bg}>
                    <div class="detail-pasta-tint"></div>
                    <div class="detail-pasta-shine"></div>
                    <div class="detail-pasta-logo"><img src="https://res.cloudinary.com/txf25hqh/image/upload/v1792431741/MFADE.png" alt="MFADE"></div>
                </div>
            `;
        }
    }

    const tEl = $('detailTitle'); if (tEl) tEl.textContent = name;

    /* ✅ Meta: nome do usuário APENAS em playlists */
    const metaEl = $('detailMeta');
    if (metaEl) {
        let metaHTML = `
            <span class="meta-item"><i class="fas fa-list-ul"></i> ${tracks.length} discos</span>
            <span class="meta-item"><i class="far fa-clock"></i> ${getTotalDuration(tracks)}</span>
        `;
        if (type === 'playlist') {
            metaHTML += `<span class="meta-item"><i class="fas fa-user"></i> ${currentUserName}</span>`;
        } else if (type === 'album') {
            metaHTML += `<span class="meta-item"><i class="fas fa-compact-disc"></i> Álbum</span>`;
        } else if (type === 'genre') {
            metaHTML += `<span class="meta-item"><i class="fas fa-tag"></i> Gênero</span>`;
        }
        metaEl.innerHTML = metaHTML;
    }

    /* ✅ Botões do header: só em álbuns e playlists */
    const likeBtn = $('detailLikeBtn');
    const saveBtn = $('detailSaveBtn');
    if (likeBtn && saveBtn) {
        const mostraAcoes = (type === 'album' || type === 'playlist');
        likeBtn.style.display = mostraAcoes ? '' : 'none';
        saveBtn.style.display = mostraAcoes ? '' : 'none';

        if (mostraAcoes) {
            const curtido = (type === 'album' && isAlbumCurtido(name));
            likeBtn.classList.toggle('liked', curtido);
            saveBtn.classList.toggle('saved', curtido);

            const saveSVG = saveBtn.querySelector('svg');
            const setSaveSVG = (isCurtido) => {
                if (!saveSVG) return;
                saveSVG.innerHTML = isCurtido
                    ? `<polyline points="5 12 10 17 19 7" />`
                    : `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`;
            };
            setSaveSVG(curtido);

            const toggleCurto = async () => {
                if (type === 'album') {
                    const idx = likedAlbums.findIndex(a => a.name === name);
                    if (idx >= 0) likedAlbums.splice(idx, 1);
                    else {
                        const tr = visible.filter(s => s.category === 'album' && s.album === name);
                        if (tr.length) likedAlbums.push({ name, coverImage: tr[0]?.coverImage, tracks: tr, type: 'album' });
                    }
                }
                try { renderSidebar(); } catch (e) {}
                try { renderHome(); } catch (e) {}
                const nowCurtido = (type === 'album' && isAlbumCurtido(name));
                likeBtn.classList.toggle('liked', nowCurtido);
                saveBtn.classList.toggle('saved', nowCurtido);
                setSaveSVG(nowCurtido);
            };

            likeBtn.onclick = toggleCurto;
            saveBtn.onclick = toggleCurto;
        }
    }

    renderVinylShelf(tracks, 'trackList');
}

function renderVinylShelf(tracks, targetId) {
    const list = $(targetId);
    if (!list) return;
    if (!tracks.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Nenhum disco.</p>';
        return;
    }

    /* ✅ Na lista de Discos Curtidos, mostra ♥ verde ao lado do disco */
    const isLikedView = (targetId === 'trackList') &&
                        (state.currentItem === 'liked') &&
                        (state.currentItemName === 'Discos curtidos');

    list.className = 'vinyl-shelf';
    list.innerHTML = tracks.map(song => {
        const cover = song.coverImage
            ? `<img src="${song.coverImage}" alt="${song.title}" draggable="false">`
            : `<div class="placeholder">${song.title.charAt(0)}</div>`;
        const cur = currentPlayingSongId !== null && song.id === currentPlayingSongId && state.isPlaying;

        const likeBtnHTML = isLikedView
            ? `<button class="vinyl-like-btn liked" data-like-id="${song.id}" title="Remover dos curtidos">
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
               </button>`
            : '';

        return `
            <div class="vinyl-item ${cur ? 'current' : ''}" data-id="${song.id}" draggable="true" title="Arraste até o player pra tocar">
                ${likeBtnHTML}
                <div class="shelf-vinyl"><div class="shelf-cover">${cover}</div></div>
                <div class="shelf-info">
                    <div class="shelf-title">${song.title}</div>
                    <div class="shelf-artist">${song.artist}</div>
                    <div class="shelf-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</div>
                </div>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.vinyl-item').forEach(item => {
        const id = parseInt(item.dataset.id);
        item.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', String(id));
            e.dataTransfer.effectAllowed = 'copy';
            this.classList.add('dragging-source');
        });
        item.addEventListener('dragend', function() { this.classList.remove('dragging-source'); });
    });

    list.querySelectorAll('.vinyl-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = parseInt(btn.dataset.likeId);
            if (isNaN(songId)) return;
            likedSongs = likedSongs.filter(s => s.id !== songId);
            try { renderSidebar(); } catch (err) {}
            try { renderHome(); } catch (err) {}
            try { openDetail('liked', 'Discos curtidos'); } catch (err) {}
        });
    });

    updateHighlight();
}

function renderLibrary() {
    const list = $('libraryList');
    if (!list) return;
    const visible = getVisibleSongs(currentUserId);
    const metaEl = $('libraryMeta');
    if (metaEl) metaEl.textContent = `${visible.length} discos · ${getTotalDuration(visible)}`;
    const sorted = [...visible].sort((a, b) => a.title.localeCompare(b.title));
    state.playlist = sorted;
    state.currentItem = null;
    state.currentItemName = null;
    renderVinylShelf(sorted, 'libraryList');
}

function renderSearchResults(filtered) {
    const results = $('searchResults');
    if (!results) return;
    const unique = getUniqueSongs(filtered);
    state.playlist = unique;
    state.currentItem = null;
    state.currentItemName = null;
    renderVinylShelf(unique, 'searchResults');
}

function bindNavEvents() {
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = { home: $('page-home'), search: $('page-search'), library: $('page-library') };
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (!page || !pages[page]) return;
            navItems.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            Object.values(pages).forEach(p => p && p.classList.remove('active'));
            pages[page].classList.add('active');
            const detail = $('playlistDetail');
            if (detail) detail.classList.remove('active');
            if (page === 'search') renderSearchResults(getVisibleSongs(currentUserId));
            if (page === 'library') renderLibrary();
            setTimeout(updateHighlight, 50);
        });
    });
    const back = $('backToHome');
    if (back) back.addEventListener('click', () => {
        const detail = $('playlistDetail');
        if (detail) detail.classList.remove('active');
        const home = $('page-home');
        if (home) home.classList.add('active');
        state.currentItem = null;
        state.currentItemName = null;
        setTimeout(updateHighlight, 50);
    });
}

function bindUserMenu() {
    const up = $('userProfile');
    const dm = $('dropdownMenu');
    const lb = $('logoutBtn');
    if (!up || !dm) return;
    up.addEventListener('click', e => { e.stopPropagation(); dm.classList.toggle('show'); });
    document.addEventListener('click', () => dm.classList.remove('show'));
    if (lb) lb.addEventListener('click', e => { e.stopPropagation(); handleLogout(); });
}

function bindSearch() {
    const input = $('searchInput');
    if (!input) return;
    input.addEventListener('focus', function() {
        if (!this.value.trim()) renderSearchResults(getVisibleSongs(currentUserId));
    });
    input.addEventListener('input', function() {
        const q = this.value.trim();
        if (searchTimeout) clearTimeout(searchTimeout);
        if (!q) { renderSearchResults(getVisibleSongs(currentUserId)); return; }
        searchTimeout = setTimeout(() => {
            const nq = removeAccents(q.toLowerCase());
            const vis = getVisibleSongs(currentUserId);
            const filtered = vis.filter(s =>
                removeAccents(s.title.toLowerCase()).includes(nq) ||
                removeAccents(s.artist.toLowerCase()).includes(nq) ||
                (s.album && removeAccents(s.album.toLowerCase()).includes(nq)) ||
                (s.playlist && removeAccents(s.playlist.toLowerCase()).includes(nq)) ||
                (s.genre && removeAccents(s.genre.toLowerCase()).includes(nq))
            );
            renderSearchResults(filtered);
        }, 300);
    });
}

function bindSettings() {
    const ob = $('openSettings');
    const cb = $('closeSettings');
    const m = $('settingsModal');
    if (ob) ob.addEventListener('click', () => { m && m.classList.add('active'); markActiveTheme(); });
    if (cb) cb.addEventListener('click', () => m && m.classList.remove('active'));
    if (m) m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            if (!currentPlanCfg.hasThemes) return;
            applyTheme(sw.dataset.theme);
            markActiveTheme();
        });
    });
}

function markActiveTheme() {
    const cur = localStorage.getItem('muhsic_theme') || 'default';
    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.classList.toggle('active', sw.dataset.theme === cur);
    });
}

function bindKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') { e.preventDefault(); nextTrack(); }
        if (e.code === 'ArrowLeft') { e.preventDefault(); prevTrack(); }
    });
}

async function initApp() {
    const visible = getVisibleSongs(currentUserId);
    state.playlist = visible;
    state.currentIndex = 0;
    playerHasStarted = false;
    autoQueue = [];

    try { await renderHome(); } catch (e) {}
    try { await renderSidebar(); } catch (e) {}
    try { renderLibrary(); } catch (e) {}
    try { renderSearchResults(visible); } catch (e) {}

    if (visible.length) {
        const p = visible[0];
        setCover(p.coverImage, `Capa - ${p.title}`);
        if (titleEl) titleEl.textContent = p.title;
        if (artistEl) artistEl.textContent = p.artist;
        if (durationEl) durationEl.textContent = formatTime(p.duration || 0);
        if (audio) { audio.src = p.url; audio.load(); audio.pause(); }
        currentPlayingSongId = p.id;
        playerHasStarted = true;
        state.isPlaying = false;
        if (tonearm) tonearm.classList.remove('active');
        if (maxTonearm) maxTonearm.classList.remove('active');
        musicaReiniciada = false;
        if (progress) progress.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        if (maxTitle) maxTitle.textContent = p.title;
        if (maxArtist) maxArtist.textContent = p.artist;
        if (maxCover && p.coverImage) maxCover.src = p.coverImage;
    }

    try { buildQueue(); } catch (e) {}

    applyVolume(0.7);
    const home = $('page-home'); if (home) home.classList.add('active');
    updateHighlight();

    if (audio) {
        audio.addEventListener('play', () => {
            if (currentPlayingSongId) localStorage.setItem('muhsic_lastSongId', currentPlayingSongId);
        });
    }

    sincronizarDuracoesBiblioteca().catch(e => {});
}