/* ============================================================
   MUHSIC — SCRIPT.JS
   Player + renderização do app (só roda no muhsic.html)
   ============================================================ */

/* ============================================================
   GUARD: exige login
   ============================================================ */
const session = requireSession();
if (!session) { throw new Error('Sessão obrigatória'); }

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
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
    repeat: 'none',
    volume: 0.5,
    currentItem: null,
    currentItemName: null,
    isDragging: false
};

let currentPlayingSongId = null;

/* Elementos */
let audio, playBtn, prevBtn, nextBtn, shuffleBtn, resetBtn;
let progressBar, progressFill, currentTimeEl, totalTimeEl;
let volumeBar, volumeFill, volumeIcon;
let npTitle, npArtist, npImg, npLike, visualizer;
let playerFooter;

let progressInterval = null;
let fadeInterval = null;
let searchTimeout = null;
let clickSound = null;

const $ = id => document.getElementById(id);

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Carrega tema salvo
    loadTheme();

    // Pega elementos
    audio         = $('audioPlayer');
    playBtn       = $('playBtn');
    prevBtn       = $('prevBtn');
    nextBtn       = $('nextBtn');
    shuffleBtn    = $('shuffleBtn');
    resetBtn      = $('resetBtn');
    progressBar   = $('progressBar');
    progressFill  = $('progressFill');
    currentTimeEl = $('currentTime');
    totalTimeEl   = $('totalTime');
    volumeBar     = $('volumeBar');
    volumeFill    = $('volumeFill');
    volumeIcon    = $('volumeIcon');
    npTitle       = $('npTitle');
    npArtist      = $('npArtist');
    npImg         = $('npImg');
    npLike        = $('npLike');
    visualizer    = $('audioVisualizer');
    playerFooter  = $('playerFooter');

    clickSound = new Audio('https://res.cloudinary.com/oizv8icb/video/upload/v1786688312/TapClick.wav');

    // Aplica dados do usuário na UI
    applyUserToUI();

    // Bind de eventos
    bindPlayerEvents();
    bindNavEvents();
    bindUserMenu();
    bindSearch();
    bindSettings();
    bindKeyboard();

    // Inicializa o app
    initApp();

    // Animação de boas-vindas (só na primeira carga após login)
    showLoginAnimation();

    console.log(`👤 Logado como: ${currentUserName} (ID ${currentUserId})`);
    console.log(`💳 Plano: ${currentPlanCfg.label}`);
    console.log(`📀 Total de músicas visíveis: ${getVisibleSongs(currentUserId).length}`);
});

/* ============================================================
   APLICA DADOS DO USUÁRIO NA INTERFACE
   ============================================================ */
function applyUserToUI() {
    const userNameEl = $('userName');
    const greetingEl = $('greetingUser');
    const libUserEl  = $('libraryUser');
    const avatarEl   = $('userAvatar');
    const planInfoEl = $('planInfo');

    if (userNameEl) userNameEl.textContent = currentUserName;
    if (greetingEl) greetingEl.textContent = currentUserName;
    if (libUserEl)  libUserEl.textContent  = currentUserName;
    if (avatarEl && session.avatar) avatarEl.src = session.avatar;

    if (planInfoEl) {
        planInfoEl.innerHTML = `<i class="fas fa-crown"></i> Plano: ${currentPlanCfg.label}`;
        planInfoEl.style.color = currentPlanCfg.color;
    }

    // Mostra anúncio apenas pra plano Free
    const adBanner = $('adBanner');
    if (adBanner) {
        adBanner.style.display = currentPlanCfg.showAds ? 'block' : 'none';
    }

    // Bloqueia temas se não tiver permissão
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

/* ============================================================
   ANIMAÇÃO DE LOGIN
   ============================================================ */
function showLoginAnimation() {
    const anim = $('loginAnimation');
    if (!anim) return;

    anim.classList.add('active');
    void anim.offsetWidth;

    setTimeout(() => {
        const startSound = new Audio('https://res.cloudinary.com/oizv8icb/video/upload/v1786685196/StartTypo.wav');
        startSound.play().catch(() => {});
    }, 100);

    setTimeout(() => anim.classList.remove('active'), 2200);
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
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

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getTotalDuration(tracks) {
    let total = 0;
    tracks.forEach(t => total += (t.duration || 0));
    return formatTime(total);
}

/* ============================================================
   PLAYER
   ============================================================ */
function fadeTo(target, duration = 400) {
    return new Promise(resolve => {
        if (fadeInterval) clearInterval(fadeInterval);
        const start = audio.volume;
        const steps = duration / 20;
        const step = (target - start) / steps;
        let i = 0;
        fadeInterval = setInterval(() => {
            i++;
            audio.volume = Math.min(1, Math.max(0, start + step * i));
            if (i >= steps) {
                clearInterval(fadeInterval);
                fadeInterval = null;
                audio.volume = Math.min(1, Math.max(0, target));
                resolve();
            }
        }, 20);
    });
}

async function fadePlay() {
    if (audio.paused) {
        audio.volume = 0;
        try { await audio.play(); } catch (e) {}
        await fadeTo(state.volume, 300);
        state.isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        startProgressUpdate();
        updateHighlight();
        visualizer.classList.add('active');
    }
}

async function fadePause() {
    if (!audio.paused) {
        await fadeTo(0, 300);
        audio.pause();
        audio.volume = state.volume;
        state.isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        stopProgressUpdate();
        updateHighlight();
        visualizer.classList.remove('active');
    }
}

function loadSong(index) {
    const song = state.playlist[index % state.playlist.length];
    if (!song) return;
    audio.src = song.url;
    audio.load();
    totalTimeEl.textContent = formatTime(song.duration || 180);
    currentTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';
    updateNowPlaying(song);
    if (state.isPlaying) audio.play().catch(() => {});
    currentPlayingSongId = song.id;
    updateHighlight();
}

function updateNowPlaying(song) {
    npTitle.textContent = song.title;
    npArtist.textContent = song.artist;
    if (song.coverImage) {
        npImg.innerHTML = `<img src="${song.coverImage}" alt="${song.title}">`;
    } else {
        npImg.innerHTML = `<span>${song.title.charAt(0).toUpperCase()}</span>`;
    }
    npLike.innerHTML = '<i class="fas fa-heart"></i>';
    npLike.style.color = 'var(--green-spotify)';
}

function togglePlay()       { state.isPlaying ? fadePause() : fadePlay(); }
function prevSong() {
    if (!state.playlist.length) return;
    if (state.currentIndex > 0) state.currentIndex--;
    else state.currentIndex = state.playlist.length - 1;
    loadSong(state.currentIndex);
    if (state.isPlaying) audio.play().then(() => fadeTo(state.volume, 300)).catch(() => {});
}
function nextSong() {
    if (!state.playlist.length) return;
    if (state.currentIndex < state.playlist.length - 1) state.currentIndex++;
    else state.currentIndex = 0;
    loadSong(state.currentIndex);
    if (state.isPlaying) audio.play().then(() => fadeTo(state.volume, 300)).catch(() => {});
}
function resetSong() {
    if (!audio.src) return;
    audio.currentTime = 0;
    currentTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';
}
function toggleShuffle() {
    state.isShuffled = !state.isShuffled;
    shuffleBtn.style.color = state.isShuffled ? 'var(--green-spotify)' : 'var(--text-secondary)';
    applyShuffle();
}
function seekTo(percent) {
    if (!audio.src) return;
    const dur = audio.duration || 180;
    audio.currentTime = (percent / 100) * dur;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    progressFill.style.width = percent + '%';
}
function setVolume(val) {
    state.volume = Math.min(1, Math.max(0, val));
    if (!fadeInterval) {
        audio.volume = state.volume;
        volumeFill.style.width = (state.volume * 100) + '%';
        updateVolumeIcon();
    }
}
function updateVolumeIcon() {
    if (state.volume === 0) volumeIcon.className = 'fas fa-volume-mute';
    else if (state.volume < 0.5) volumeIcon.className = 'fas fa-volume-down';
    else volumeIcon.className = 'fas fa-volume-up';
}
function startProgressUpdate() {
    stopProgressUpdate();
    progressInterval = setInterval(updateProgress, 500);
}
function stopProgressUpdate() {
    if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
}
function updateProgress() {
    if (state.isDragging) return;
    if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = pct + '%';
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
}
function updateHighlight() {
    document.querySelectorAll('.track-list .track-item').forEach(el => {
        const id = parseInt(el.dataset.id);
        const isCurrent = currentPlayingSongId !== null && id === currentPlayingSongId && state.isPlaying;
        el.classList.toggle('current', isCurrent);
        const indexSpan = el.querySelector('.track-index');
        if (indexSpan) {
            if (isCurrent) {
                indexSpan.innerHTML = `<span class="playing-indicator"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1787351956/M-SPINNING.gif" alt="Tocando"></span>`;
            } else if (el.dataset.originalIndex) {
                indexSpan.textContent = el.dataset.originalIndex;
            }
        }
    });
}
function applyShuffle() {
    if (!state.playlist.length) return;
    if (state.isShuffled) {
        state.playlist = shuffleArray([...state.playlist]);
    } else {
        const visible = getVisibleSongs(currentUserId);
        const all = visible.filter(s => {
            if (state.currentItem === 'album')    return s.category === 'album'    && s.album    === state.currentItemName;
            if (state.currentItem === 'playlist') return s.category === 'playlist' && s.playlist === state.currentItemName;
            if (state.currentItem === 'genre')    return s.category === 'genre'    && s.genre    === state.currentItemName;
            if (state.currentItem === 'liked')    return likedSongs.some(ls => ls.id === s.id);
            return true;
        });
        state.playlist = all.length ? all : visible;
    }
    const current = getCurrentSong();
    if (current) {
        const idx = state.playlist.findIndex(s => s.id === current.id);
        if (idx !== -1) state.currentIndex = idx;
    }
    updateHighlight();
}

/* ============================================================
   LIKE / SAVE
   ============================================================ */
function toggleLike(btn, songId, type, name) {
    playClickSound();
    btn.classList.toggle('liked');
    const liked = btn.classList.contains('liked');

    if (type === 'album' || type === 'genre') {
        const items = type === 'album' ? likedAlbums : likedGenres;
        const index = items.findIndex(item => item.name === name);
        if (liked) {
            const tracks = baseSongs.filter(s => s.category === type && s[type] === name);
            if (tracks.length && index === -1) {
                items.push({ name, coverImage: tracks[0].coverImage, tracks, type });
            }
        } else if (index !== -1) {
            items.splice(index, 1);
        }
        renderSidebar();
        renderHome();
        return;
    }

    const song = baseSongs.find(s => s.id === songId);
    if (!song) return;
    if (liked) {
        if (!likedSongs.some(s => s.id === song.id)) likedSongs.push({...song});
    } else {
        likedSongs = likedSongs.filter(s => s.id !== song.id);
    }
    renderSidebar();
    renderHome();
    if (state.currentItem === 'liked') openDetail('liked', 'Músicas curtidas');
}

function toggleSave(btn) {
    playClickSound();
    btn.classList.toggle('saved');
    const svg = btn.querySelector('svg');
    if (btn.classList.contains('saved')) {
        svg.innerHTML = `
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <polyline points="7 13 10 16 17 9" stroke="currentColor" stroke-width="2" fill="none"/>
        `;
    } else {
        svg.innerHTML = `
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
        `;
    }
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */
function getItemsByCategory(category, nameField) {
    const visible = getVisibleSongs(currentUserId);
    const map = {};
    visible.forEach(s => {
        if (s.category === category) {
            const key = s[nameField];
            if (!map[key]) map[key] = [];
            map[key].push(s);
        }
    });
    return map;
}

function createCardHTML(name, tracks, type, customCover) {
    const isSingle = tracks.length === 1 || new Set(tracks.map(t => t.coverImage)).size === 1;
    const coverClass = isSingle ? 'single-cover' : '';
    let coverHtml = '';
    if (customCover) {
        coverHtml = `<img src="${customCover}" alt="${name}">`;
    } else if (isSingle) {
        const img = tracks[0].coverImage;
        coverHtml = img ? `<img src="${img}" alt="${name}">` : `<div class="placeholder">${name.charAt(0)}</div>`;
    } else {
        const coverTracks = type === 'genre' ? tracks.slice(-4) : tracks.slice(0, 4);
        const covers = coverTracks.map(t =>
            t.coverImage
                ? `<img src="${t.coverImage}" alt="${t.title}">`
                : `<div class="placeholder" style="background:#333">${t.title.charAt(0)}</div>`
        );
        while (covers.length < 4) covers.push(`<div class="placeholder" style="background:#3a3a3a;">+</div>`);
        coverHtml = covers.join('');
    }
    const totalDur = getTotalDuration(tracks);
    let likedClass = '';
    if (type === 'album')      likedClass = likedAlbums.some(a => a.name === name) ? 'liked' : '';
    else if (type === 'genre') likedClass = likedGenres.some(g => g.name === name) ? 'liked' : '';
    else if (type === 'liked') likedClass = 'liked';

    return `
        <div class="playlist-card" data-type="${type}" data-name="${name}">
            <div class="playlist-cover ${coverClass}">${coverHtml}</div>
            <div class="playlist-title">${name}</div>
            <div class="playlist-sub">${tracks.length} músicas • ${totalDur}</div>
            <div class="playlist-actions">
                <button class="like-btn ${likedClass}" data-id="${tracks[0]?.id}" data-type="${type}" data-name="${name}">
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
                <button class="save-btn">
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

function renderHome() {
    const container = $('homePlaylistsContainer');
    if (!container) return;
    let html = '';

    const genres = getItemsByCategory('genre', 'genre');
    if (Object.keys(genres).length) {
        html += `<h3 class="section-title">Gêneros</h3><div class="playlists-grid">`;
        for (const [name, tracks] of Object.entries(genres)) html += createCardHTML(name, tracks, 'genre');
        html += `</div>`;
    }

    const albums = getItemsByCategory('album', 'album');
    if (Object.keys(albums).length) {
        html += `<h3 class="section-title">Álbuns Salvos</h3><div class="playlists-grid">`;
        for (const [name, tracks] of Object.entries(albums)) html += createCardHTML(name, tracks, 'album');
        html += `</div>`;
    }

    const playlists = getItemsByCategory('playlist', 'playlist');
    if (Object.keys(playlists).length) {
        html += `<h3 class="section-title">Playlists</h3><div class="playlists-grid">`;
        for (const [name, tracks] of Object.entries(playlists)) html += createCardHTML(name, tracks, 'playlist');
        html += `</div>`;
    }

    if (likedSongs.length) {
        const likedVisible = likedSongs.filter(s => s.userIds.includes(0) || s.userIds.includes(currentUserId));
        if (likedVisible.length) {
            html += `<h3 class="section-title">Suas Playlists</h3><div class="playlists-grid">`;
            html += createCardHTML('Músicas curtidas', likedVisible, 'liked', 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png');
            likedAlbums.forEach(a => html += createCardHTML(a.name, a.tracks, 'liked', a.coverImage));
            likedGenres.forEach(g => html += createCardHTML(g.name, g.tracks, 'liked', g.coverImage));
            html += `</div>`;
        }
    }

    container.innerHTML = html;
    container.querySelectorAll('.playlist-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.playlist-actions')) return;
            openDetail(this.dataset.type, this.dataset.name);
        });
    });
}

function createSidebarItem(name, tracks, type, customCover, originalType) {
    let coverHtml = '';
    let isSingle = false;

    if (type === 'liked' && originalType === 'genre') {
        const covers = tracks.slice(-4).map(t =>
            t.coverImage ? `<img src="${t.coverImage}" alt="${t.title}">` : `<div class="placeholder">${t.title.charAt(0)}</div>`
        );
        while (covers.length < 4) covers.push(`<div class="placeholder">+</div>`);
        coverHtml = covers.join('');
    } else if (type === 'liked' || type === 'album') {
        const img = customCover || tracks[0]?.coverImage;
        coverHtml = img ? `<img src="${img}" alt="${name}">` : `<div class="placeholder">${name.charAt(0)}</div>`;
        isSingle = true;
    } else {
        const covers = (type === 'genre' ? tracks.slice(-4) : tracks.slice(0, 4)).map(t =>
            t.coverImage ? `<img src="${t.coverImage}" alt="${t.title}">` : `<div class="placeholder">${t.title.charAt(0)}</div>`
        );
        while (covers.length < 4) covers.push(`<div class="placeholder">+</div>`);
        coverHtml = covers.join('');
    }

    const coverClass = isSingle ? 'cover-thumb single-cover' : 'cover-thumb';
    return `
        <div class="playlist-item-sidebar" data-type="${type}" data-name="${name}">
            <div class="${coverClass}">${coverHtml}</div>
            <span>${name}</span>
        </div>
    `;
}

function renderSidebar() {
    const container = $('sidebarPlaylistsContainer');
    if (!container) return;
    let html = '';

    // ÁLBUNS SALVOS
    const albums = getItemsByCategory('album', 'album');
    if (Object.keys(albums).length) {
        html += `<div class="playlists-section-title">Álbuns Salvos</div>`;
        for (const [name, tracks] of Object.entries(albums)) html += createSidebarItem(name, tracks, 'album');
    }

    // PLAYLISTS
    const playlists = getItemsByCategory('playlist', 'playlist');
    if (Object.keys(playlists).length) {
        html += `<div class="playlists-section-title">Playlists</div>`;
        for (const [name, tracks] of Object.entries(playlists)) html += createSidebarItem(name, tracks, 'playlist');
    }

    // CURTIDAS
    const likedVisible = likedSongs.filter(s => s.userIds.includes(0) || s.userIds.includes(currentUserId));
    if (likedVisible.length) {
        html += `<div class="playlists-section-title">Suas Curtidas</div>`;
        html += createSidebarItem('Músicas curtidas', likedVisible, 'liked', 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png', 'album');
        likedAlbums.forEach(a => html += createSidebarItem(a.name, a.tracks, 'liked', a.coverImage, 'album'));
        likedGenres.forEach(g => html += createSidebarItem(g.name, g.tracks, 'liked', null, 'genre'));
    }

    // GÊNEROS
    const genres = getItemsByCategory('genre', 'genre');
    if (Object.keys(genres).length) {
        html += `<div class="playlists-section-title">Gêneros</div>`;
        for (const [name, tracks] of Object.entries(genres)) html += createSidebarItem(name, tracks, 'genre');
    }

    container.innerHTML = html;
    container.querySelectorAll('.playlist-item-sidebar').forEach(item => {
        item.addEventListener('click', function() {
            openDetail(this.dataset.type, this.dataset.name);
        });
    });
}

function openDetail(type, name) {
    const visible = getVisibleSongs(currentUserId);
    let tracks = [];
    let albumColor = '#1a1a2e';
    let customCover = null;

    if (type === 'album') {
        tracks = visible.filter(s => s.category === 'album' && s.album === name);
        if (tracks.length) albumColor = tracks[0].albumColor || '#1a1a2e';
    } else if (type === 'playlist') {
        tracks = visible.filter(s => s.category === 'playlist' && s.playlist === name);
    } else if (type === 'genre') {
        tracks = visible.filter(s => s.category === 'genre' && s.genre === name);
    } else if (type === 'liked') {
        if (name === 'Músicas curtidas') {
            tracks = likedSongs.filter(s => s.userIds.includes(0) || s.userIds.includes(currentUserId));
            albumColor = '#2a4a7a';
            customCover = 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png';
        } else {
            const album = likedAlbums.find(a => a.name === name);
            const genre = likedGenres.find(g => g.name === name);
            if (album) { tracks = album.tracks; customCover = album.coverImage; }
            else if (genre) tracks = genre.tracks;
            albumColor = '#2a4a7a';
        }
    }

    if (!tracks.length) return;

    state.currentItem = type;
    state.currentItemName = name;
    state.playlist = tracks;
    state.currentIndex = 0;

    $('page-home').classList.remove('active');
    $('playlistDetail').classList.add('active');

    const header = $('detailHeader');
    header.style.background = `linear-gradient(135deg, ${albumColor}, ${albumColor}dd)`;

    const coverContainer = $('detailCover');
    const isSingle = tracks.length === 1 || new Set(tracks.map(t => t.coverImage)).size === 1;
    if (customCover || isSingle) {
        coverContainer.className = 'big-cover single-cover';
        const img = customCover || tracks[0].coverImage;
        coverContainer.innerHTML = img
            ? `<img src="${img}" alt="${name}">`
            : `<div class="placeholder">${name.charAt(0)}</div>`;
    } else {
        coverContainer.className = 'big-cover';
        const items = tracks.slice(0, 4).map(t =>
            t.coverImage
                ? `<img src="${t.coverImage}" alt="${t.title}">`
                : `<div class="placeholder">${t.title.charAt(0)}</div>`
        );
        while (items.length < 4) items.push(`<div class="placeholder">+</div>`);
        coverContainer.innerHTML = items.join('');
    }

    $('detailTitle').textContent = name;
    $('detailMeta').innerHTML = `
        <span class="meta-item"><i class="fas fa-list-ul"></i> ${tracks.length} músicas</span>
        <span class="meta-item"><i class="far fa-clock"></i> ${getTotalDuration(tracks)}</span>
        <span class="meta-item"><i class="fas fa-user"></i> ${currentUserName}</span>
    `;
    renderTrackList(tracks, 'trackList');
}

function renderTrackList(tracks, targetId) {
    const list = $(targetId);
    if (!list) return;
    if (!tracks.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Nenhuma música.</p>';
        return;
    }

    list.innerHTML = tracks.map((song, idx) => {
        const coverHtml = song.coverImage
            ? `<img src="${song.coverImage}" alt="${song.title}">`
            : `<div class="placeholder">${song.title.charAt(0)}</div>`;
        const isLiked = likedSongs.some(s => s.id === song.id);
        const likedClass = isLiked ? 'liked' : '';
        const isCurrent = currentPlayingSongId !== null && song.id === currentPlayingSongId && state.isPlaying;
        const indexNumber = idx + 1;
        const origin = getSongOrigin(song);
        return `
            <div class="track-item" data-id="${song.id}" data-original-index="${indexNumber}">
                <span class="track-index">
                    ${isCurrent
                        ? `<span class="playing-indicator"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1787351956/M-SPINNING.gif" alt="Tocando"></span>`
                        : indexNumber}
                </span>
                <div class="track-cover">${coverHtml}</div>
                <div class="track-info">
                    <div class="track-title">${song.title}</div>
                    <div class="track-artist">${song.artist}${origin ? ' • ' + origin : ''}</div>
                </div>
                <div class="track-meta">
                    <span class="track-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</span>
                    <span class="track-added"><img src="${session.avatar}" class="added-avatar" alt="${currentUserName}"> ${currentUserName}</span>
                </div>
                <div class="track-actions">
                    <button class="like-btn ${likedClass}" data-id="${song.id}">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <button class="save-btn">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="16"/>
                            <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                    </button>
                </div>
                <span class="track-play"><i class="fas fa-play-circle"></i></span>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.track-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.track-actions')) return;
            const id = parseInt(this.dataset.id);
            const idx = state.playlist.findIndex(s => s.id === id);
            if (idx !== -1) {
                state.currentIndex = idx;
                loadSong(state.currentIndex);
                fadePlay();
                updateHighlight();
            }
        });
    });

    updateHighlight();
}

function renderLibrary() {
    const list = $('libraryList');
    if (!list) return;
    const visible = getVisibleSongs(currentUserId);
    $('libraryCount').textContent = visible.length;
    $('libraryDuration').textContent = getTotalDuration(visible);
    $('libraryUser').textContent = currentUserName;

    const sorted = [...visible].sort((a, b) => a.title.localeCompare(b.title));
    renderTrackList(sorted, 'libraryList');
}

function renderSearchResults(filtered) {
    const results = $('searchResults');
    if (!results) return;
    const unique = getUniqueSongs(filtered);
    renderTrackList(unique, 'searchResults');
}

/* ============================================================
   BIND DE EVENTOS
   ============================================================ */
function bindPlayerEvents() {
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    resetBtn.addEventListener('click', resetSong);
    shuffleBtn.addEventListener('click', toggleShuffle);

    progressBar.addEventListener('mousedown', e => {
        state.isDragging = true;
        const rect = progressBar.getBoundingClientRect();
        seekTo(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
        document.addEventListener('mousemove', onProgressMove);
        document.addEventListener('mouseup', onProgressUp);
    });

    volumeBar.addEventListener('mousedown', e => {
        const rect = volumeBar.getBoundingClientRect();
        setVolume(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
        document.addEventListener('mousemove', onVolumeMove);
        document.addEventListener('mouseup', onVolumeUp);
    });

    volumeIcon.addEventListener('click', () => setVolume(state.volume > 0 ? 0 : 0.5));

    audio.addEventListener('ended', nextSong);
    audio.addEventListener('timeupdate', () => {
        if (!state.isDragging && audio.duration) {
            progressFill.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    });

    npLike.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('fas')) {
            icon.className = 'far fa-heart';
            this.style.color = 'var(--text-secondary)';
        } else {
            icon.className = 'fas fa-heart';
            this.style.color = 'var(--green-spotify)';
        }
    });

    document.getElementById('nowPlayingClick').addEventListener('click', () => {
        const c = getCurrentSong();
        if (!c) return;
        let name = null, type = null;
        if (c.category === 'album')         { name = c.album;    type = 'album'; }
        else if (c.category === 'playlist') { name = c.playlist; type = 'playlist'; }
        else if (c.category === 'genre')    { name = c.genre;    type = 'genre'; }
        if (name && type) openDetail(type, name);
    });

    document.addEventListener('click', e => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            e.preventDefault();
            const songId = parseInt(likeBtn.dataset.id);
            const type   = likeBtn.dataset.type || 'song';
            const name   = likeBtn.dataset.name || '';
            if (type === 'album' || type === 'genre') toggleLike(likeBtn, null, type, name);
            else toggleLike(likeBtn, songId, 'song');
        }
        const saveBtn = e.target.closest('.save-btn');
        if (saveBtn) { e.preventDefault(); toggleSave(saveBtn); }
    });

    document.getElementById('backToHome').addEventListener('click', () => {
        $('playlistDetail').classList.remove('active');
        $('page-home').classList.add('active');
        state.currentItem = null;
        state.currentItemName = null;
        state.playlist = getVisibleSongs(currentUserId);
        setTimeout(updateHighlight, 50);
    });
}

function onProgressMove(e) {
    const rect = progressBar.getBoundingClientRect();
    seekTo(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
}
function onProgressUp() {
    state.isDragging = false;
    document.removeEventListener('mousemove', onProgressMove);
    document.removeEventListener('mouseup', onProgressUp);
}
function onVolumeMove(e) {
    const rect = volumeBar.getBoundingClientRect();
    setVolume(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
}
function onVolumeUp() {
    document.removeEventListener('mousemove', onVolumeMove);
    document.removeEventListener('mouseup', onVolumeUp);
}

function bindNavEvents() {
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = {
        home:    $('page-home'),
        search:  $('page-search'),
        library: $('page-library')
    };
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (!page || !pages[page]) return;
            navItems.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            Object.values(pages).forEach(p => p.classList.remove('active'));
            pages[page].classList.add('active');
            $('playlistDetail').classList.remove('active');
            if (page === 'search')  renderSearchResults(getVisibleSongs(currentUserId));
            if (page === 'library') renderLibrary();
            setTimeout(updateHighlight, 50);
        });
    });
}

function bindUserMenu() {
    const userProfile  = $('userProfile');
    const dropdownMenu = $('dropdownMenu');
    const logoutBtn    = $('logoutBtn');

    userProfile.addEventListener('click', e => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => dropdownMenu.classList.remove('show'));
    logoutBtn.addEventListener('click', e => {
        e.stopPropagation();
        handleLogout();
    });
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
            const visible = getVisibleSongs(currentUserId);
            const filtered = visible.filter(s =>
                removeAccents(s.title.toLowerCase()).includes(nq) ||
                removeAccents(s.artist.toLowerCase()).includes(nq) ||
                (s.album    && removeAccents(s.album.toLowerCase()).includes(nq)) ||
                (s.playlist && removeAccents(s.playlist.toLowerCase()).includes(nq)) ||
                (s.genre    && removeAccents(s.genre.toLowerCase()).includes(nq))
            );
            renderSearchResults(filtered);
        }, 300);
    });
}

function bindSettings() {
    const openBtn  = $('openSettings');
    const closeBtn = $('closeSettings');
    const modal    = $('settingsModal');

    if (openBtn)  openBtn.addEventListener('click', () => { modal.classList.add('active'); markActiveTheme(); });
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (modal) modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Cliques nos temas
    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            if (!currentPlanCfg.hasThemes) return;
            applyTheme(sw.dataset.theme);
            markActiveTheme();
        });
    });
}

function markActiveTheme() {
    const current = localStorage.getItem('muhsic_theme') || 'default';
    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.classList.toggle('active', sw.dataset.theme === current);
    });
}

function bindKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') { e.preventDefault(); nextSong(); }
        if (e.code === 'ArrowLeft')  { e.preventDefault(); prevSong(); }
    });
}

/* ============================================================
   INIT APP
   ============================================================ */
function initApp() {
    const visible = getVisibleSongs(currentUserId);
    state.playlist = visible;
    state.currentIndex = 0;

    renderHome();
    renderSidebar();
    renderLibrary();
    renderSearchResults(visible);

    if (visible.length) loadSong(0);
    else {
        npTitle.textContent = 'Nenhuma música disponível';
        npArtist.textContent = '';
        npImg.innerHTML = '<span>🎵</span>';
    }

    setVolume(0.5);
    updateVolumeIcon();
    $('page-home').classList.add('active');
    npLike.innerHTML = '<i class="fas fa-heart"></i>';
    npLike.style.color = 'var(--green-spotify)';
    updateHighlight();
}