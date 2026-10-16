// ============================================================
// ESTADO GLOBAL
// ============================================================
let likedAlbums = [];
let likedGenres = [];
let likedSongs = [];

let state = {
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    isShuffled: false,
    repeat: 'none',
    volume: 0.5,
    currentItem: null,
    currentItemName: null,
    isDragging: false,
};

let currentPlayingSongId = null;

// Elementos (preenchidos no DOMContentLoaded)
let audio, playBtn, prevBtn, nextBtn, shuffleBtn, resetBtn;
let progressBar, progressFill, currentTimeEl, totalTimeEl;
let volumeBar, volumeFill, volumeIcon;
let npTitle, npArtist, npImg, npLike, visualizer;
let playerFooter, appContainer, loginScreen, loginAnimation;

let progressInterval = null;
let fadeInterval = null;
let searchTimeout = null;
let clickSound = null;

const $ = id => document.getElementById(id);

// ============================================================
// INICIALIZAÇÃO (aguarda DOM + musics.js + login.js carregados)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Referências do player
    audio = $('audioPlayer');
    playBtn = $('playBtn');
    prevBtn = $('prevBtn');
    nextBtn = $('nextBtn');
    shuffleBtn = $('shuffleBtn');
    resetBtn = $('resetBtn');
    progressBar = $('progressBar');
    progressFill = $('progressFill');
    currentTimeEl = $('currentTime');
    totalTimeEl = $('totalTime');
    volumeBar = $('volumeBar');
    volumeFill = $('volumeFill');
    volumeIcon = $('volumeIcon');
    npTitle = $('npTitle');
    npArtist = $('npArtist');
    npImg = $('npImg');
    npLike = $('npLike');
    visualizer = $('audioVisualizer');
    playerFooter = $('playerFooter');
    appContainer = $('app');
    loginScreen = $('loginScreen');
    loginAnimation = $('loginAnimation');

    clickSound = new Audio('https://res.cloudinary.com/oizv8icb/video/upload/v1786688312/TapClick.wav');

    bindPlayerEvents();
    bindNavEvents();
    bindUserMenu();
    bindSearch();
    bindLoginEvents();
    bindKeyboard();

    console.log('🎵 Muhsic Player - BETA 0.5 - Pronto!');
});

// ============================================================
// UTILITÁRIOS
// ============================================================
function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log('Som não reproduzido:', e));
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

// ============================================================
// PLAYER: FADE, PLAY, PAUSE
// ============================================================
function fadeTo(target, duration = 400) {
    return new Promise((resolve) => {
        if (fadeInterval) clearInterval(fadeInterval);
        const start = audio.volume;
        const steps = duration / 20;
        const step = (target - start) / steps;
        let i = 0;
        fadeInterval = setInterval(() => {
            i++;
            const newVol = start + step * i;
            audio.volume = Math.min(1, Math.max(0, newVol));
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
    if (state.isPlaying) {
        audio.play().catch(() => {});
    }
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
        npImg.style.background = '#333';
    }
    npLike.innerHTML = '<i class="fas fa-heart"></i>';
    npLike.style.color = 'var(--green-spotify)';
}

function togglePlay() {
    if (state.isPlaying) fadePause();
    else fadePlay();
}

function prevSong() {
    if (!state.playlist.length) return;
    if (state.currentIndex > 0) state.currentIndex--;
    else {
        if (state.repeat === 'all' || state.repeat === 'one') state.currentIndex = state.playlist.length - 1;
        else return;
    }
    loadSong(state.currentIndex);
    if (state.isPlaying) audio.play().then(() => fadeTo(state.volume, 300)).catch(() => {});
}

function nextSong() {
    if (!state.playlist.length) return;
    if (state.repeat === 'one') {
        loadSong(state.currentIndex);
        if (state.isPlaying) audio.play().then(() => fadeTo(state.volume, 300)).catch(() => {});
        return;
    }
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
    const time = (percent / 100) * dur;
    audio.currentTime = time;
    currentTimeEl.textContent = formatTime(time);
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
            } else {
                const originalIndex = el.dataset.originalIndex;
                if (originalIndex) indexSpan.textContent = originalIndex;
            }
        }
    });
}

function applyShuffle() {
    if (!state.playlist.length) return;
    if (state.isShuffled) {
        state.playlist = shuffleArray([...state.playlist]);
        const current = getCurrentSong();
        if (current) {
            const idx = state.playlist.findIndex(s => s.id === current.id);
            if (idx !== -1) state.currentIndex = idx;
        }
    } else {
        const visible = getVisibleSongs();
        const all = visible.filter(s => {
            if (state.currentItem === 'album') return s.category === 'album' && s.album === state.currentItemName;
            if (state.currentItem === 'playlist') return s.category === 'playlist' && s.playlist === state.currentItemName;
            if (state.currentItem === 'genre') return s.category === 'genre' && s.genre === state.currentItemName;
            if (state.currentItem === 'liked') return likedSongs.some(ls => ls.id === s.id);
            return true;
        });
        state.playlist = all.length ? all : visible;
        const current = getCurrentSong();
        if (current) {
            const idx = state.playlist.findIndex(s => s.id === current.id);
            if (idx !== -1) state.currentIndex = idx;
        }
    }
    updateHighlight();
}

// ============================================================
// LIKE / SAVE
// ============================================================
function toggleLike(btn, songId, type, name) {
    playClickSound();
    btn.classList.toggle('liked');
    const liked = btn.classList.contains('liked');

    if (type === 'album' || type === 'genre') {
        const items = type === 'album' ? likedAlbums : likedGenres;
        const index = items.findIndex(item => item.name === name);
        if (liked) {
            const tracks = allSongs.filter(s => s.category === type && s[type] === name);
            if (tracks.length && index === -1) {
                items.push({ name, coverImage: tracks[0].coverImage, tracks, type });
            }
        } else {
            if (index !== -1) items.splice(index, 1);
        }
        renderSidebar();
        renderHome();
        if (state.currentItem === 'liked' && state.currentItemName === name) {
            openDetail('liked', name);
        }
        return;
    }

    const song = allSongs.find(s => s.id === songId);
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

// ============================================================
// RENDERIZAÇÃO: HOME, SIDEBAR, TRACKLIST, LIBRARY, SEARCH
// ============================================================
function getItemsByCategory(category, nameField) {
    const visible = getVisibleSongs();
    const map = {};
    visible.forEach(s => {
        if (s.category === category) {
            const key = s[nameField];
            if (!map[key]) map[key] = [];
            map[key].push(s);
        }
    });
    const likedVisible = likedSongs.filter(s => s.userIds.includes(currentUserId));
    if (category === 'playlist' && likedVisible.length > 0) {
        map['Músicas curtidas'] = likedVisible;
    }
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
        const covers = coverTracks.map(t => {
            if (t.coverImage) return `<img src="${t.coverImage}" alt="${t.title}">`;
            return `<div class="placeholder" style="background:#333">${t.title.charAt(0)}</div>`;
        });
        while (covers.length < 4) covers.push(`<div class="placeholder" style="background:#3a3a3a;">+</div>`);
        coverHtml = covers.join('');
    }
    const totalDur = getTotalDuration(tracks);
    let likedClass = '';
    if (type === 'album') likedClass = likedAlbums.some(a => a.name === name) ? 'liked' : '';
    else if (type === 'genre') likedClass = likedGenres.some(g => g.name === name) ? 'liked' : '';
    else if (type === 'liked') likedClass = 'liked';

    return `
        <div class="playlist-card" data-type="${type}" data-name="${name}">
            <div class="playlist-cover ${coverClass}">${coverHtml}</div>
            <div class="playlist-title">${name}</div>
            <div class="playlist-sub">${tracks.length} músicas • ${totalDur}</div>
            <div class="playlist-actions">
                <button class="like-btn ${likedClass}" data-id="${tracks[0]?.id}" data-type="${type}" data-name="${name}" title="Curtir">
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
                <button class="save-btn" title="Salvar">
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
    const container = document.getElementById('homePlaylistsContainer');
    let html = '';
    const genres = getItemsByCategory('genre', 'genre');
    if (Object.keys(genres).length) {
        html += `<h3 class="section-title">Gêneros</h3><div class="playlists-grid">`;
        for (const [name, tracks] of Object.entries(genres)) html += createCardHTML(name, tracks, 'genre');
        html += `</div>`;
    }
    const albums = getItemsByCategory('album', 'album');
    if (Object.keys(albums).length) {
        html += `<h3 class="section-title">Álbuns</h3><div class="playlists-grid">`;
        for (const [name, tracks] of Object.entries(albums)) html += createCardHTML(name, tracks, 'album');
        html += `</div>`;
    }
    const playlists = getItemsByCategory('playlist', 'playlist');
    let hasPlaylists = false;
    let playlistHtml = '';
    if (playlists['Músicas curtidas']) {
        hasPlaylists = true;
        const tracks = playlists['Músicas curtidas'];
        playlistHtml += createCardHTML('Músicas curtidas', tracks, 'liked', 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png');
        delete playlists['Músicas curtidas'];
    }
    likedAlbums.forEach(album => {
        const vt = album.tracks.filter(s => s.userIds.includes(currentUserId));
        if (vt.length) {
            hasPlaylists = true;
            playlistHtml += createCardHTML(album.name, vt, 'liked', album.coverImage);
        }
    });
    likedGenres.forEach(genre => {
        const vt = genre.tracks.filter(s => s.userIds.includes(currentUserId));
        if (vt.length) {
            hasPlaylists = true;
            playlistHtml += createCardHTML(genre.name, vt, 'liked', genre.coverImage);
        }
    });
    for (const [name, tracks] of Object.entries(playlists)) {
        hasPlaylists = true;
        playlistHtml += createCardHTML(name, tracks, 'playlist');
    }
    if (hasPlaylists) html += `<h3 class="section-title">Suas Playlists</h3><div class="playlists-grid">${playlistHtml}</div>`;
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
    if (type === 'liked') {
        if (originalType === 'genre') {
            const coverTracks = tracks.slice(-4);
            const covers = coverTracks.map(t => {
                if (t.coverImage) return `<img src="${t.coverImage}" alt="${t.title}">`;
                return `<div class="placeholder">${t.title.charAt(0)}</div>`;
            });
            while (covers.length < 4) covers.push(`<div class="placeholder">+</div>`);
            coverHtml = covers.join('');
        } else {
            const img = customCover || tracks[0]?.coverImage;
            coverHtml = img ? `<img src="${img}" alt="${name}">` : `<div class="placeholder">${name.charAt(0)}</div>`;
            isSingle = true;
        }
    } else if (type === 'album') {
        const img = tracks[0]?.coverImage;
        coverHtml = img ? `<img src="${img}" alt="${name}">` : `<div class="placeholder">${name.charAt(0)}</div>`;
        isSingle = true;
    } else {
        const coverTracks = (type === 'genre') ? tracks.slice(-4) : tracks.slice(0, 4);
        const covers = coverTracks.map(t => {
            if (t.coverImage) return `<img src="${t.coverImage}" alt="${t.title}">`;
            return `<div class="placeholder">${t.title.charAt(0)}</div>`;
        });
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
    const container = document.getElementById('sidebarPlaylistsContainer');
    let html = '';
    const albums = getItemsByCategory('album', 'album');
    if (Object.keys(albums).length) {
        html += `<div class="playlists-section-title">Álbuns</div>`;
        for (const [name, tracks] of Object.entries(albums)) html += createSidebarItem(name, tracks, 'album');
    }
    let hasPlaylists = false;
    let playlistHtml = '';
    const likedVisible = likedSongs.filter(s => s.userIds.includes(currentUserId));
    if (likedVisible.length > 0) {
        hasPlaylists = true;
        playlistHtml += createSidebarItem('Músicas curtidas', likedVisible, 'liked', 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png', 'album');
    }
    likedAlbums.forEach(album => {
        const vt = album.tracks.filter(s => s.userIds.includes(currentUserId));
        if (vt.length) {
            hasPlaylists = true;
            playlistHtml += createSidebarItem(album.name, vt, 'liked', album.coverImage, 'album');
        }
    });
    likedGenres.forEach(genre => {
        const vt = genre.tracks.filter(s => s.userIds.includes(currentUserId));
        if (vt.length) {
            hasPlaylists = true;
            playlistHtml += createSidebarItem(genre.name, vt, 'liked', null, 'genre');
        }
    });
    const playlists = getItemsByCategory('playlist', 'playlist');
    for (const [name, tracks] of Object.entries(playlists)) {
        if (name !== 'Músicas curtidas') {
            hasPlaylists = true;
            playlistHtml += createSidebarItem(name, tracks, 'playlist');
        }
    }
    if (hasPlaylists) {
        html += `<div class="playlists-section-title">Suas Playlists</div>`;
        html += playlistHtml;
    }
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
    const visible = getVisibleSongs();
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
            tracks = likedSongs.filter(s => s.userIds.includes(currentUserId));
            albumColor = '#2a4a7a';
            customCover = 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png';
        } else {
            const album = likedAlbums.find(a => a.name === name);
            const genre = likedGenres.find(g => g.name === name);
            if (album) {
                tracks = album.tracks.filter(s => s.userIds.includes(currentUserId));
                albumColor = '#2a4a7a';
                customCover = album.coverImage;
            } else if (genre) {
                tracks = genre.tracks.filter(s => s.userIds.includes(currentUserId));
                albumColor = '#2a4a7a';
            }
        }
    }

    if (!tracks.length) {
        if (type === 'liked') {
            document.getElementById('page-home').classList.remove('active');
            const detail = document.getElementById('playlistDetail');
            detail.classList.add('active');
            document.getElementById('detailCover').innerHTML = `<img src="${customCover || 'https://res.cloudinary.com/oizv8icb/image/upload/v1786816886/HEART.png'}" alt="Músicas curtidas">`;
            document.getElementById('detailTitle').textContent = name;
            document.getElementById('detailMeta').innerHTML = `
                <span class="meta-item"><i class="fas fa-list-ul"></i> 0 músicas</span>
                <span class="meta-item"><i class="far fa-clock"></i> 0:00</span>
                <span class="meta-item"><i class="fas fa-user"></i> ${currentUserName}</span>
            `;
            document.getElementById('trackList').innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Você ainda não curtiu nenhuma música.</p>';
            state.currentItem = type;
            state.currentItemName = name;
            state.playlist = [];
            state.currentIndex = 0;
            return;
        }
        return;
    }

    state.currentItem = type;
    state.currentItemName = name;
    state.playlist = tracks;
    state.currentIndex = 0;

    document.getElementById('page-home').classList.remove('active');
    const detail = document.getElementById('playlistDetail');
    detail.classList.add('active');

    const header = document.getElementById('detailHeader');
    header.style.background = type === 'liked'
        ? `linear-gradient(135deg, #2a4a7a, #1a2a4a)`
        : `linear-gradient(135deg, ${albumColor}, ${albumColor}dd)`;
    header.style.backgroundSize = '200% 200%';
    header.style.animation = 'gradientMove 8s ease-in-out infinite';

    const coverContainer = document.getElementById('detailCover');
    if (customCover) {
        coverContainer.className = 'big-cover single-cover';
        coverContainer.innerHTML = `<img src="${customCover}" alt="${name}">`;
    } else {
        const isSingle = tracks.length === 1 || new Set(tracks.map(t => t.coverImage)).size === 1;
        if (isSingle) {
            coverContainer.className = 'big-cover single-cover';
            const img = tracks[0].coverImage;
            coverContainer.innerHTML = img ? `<img src="${img}" alt="${name}">` : `<div class="placeholder">${name.charAt(0)}</div>`;
        } else {
            coverContainer.className = 'big-cover';
            const items = tracks.slice(0, 4).map(t => {
                if (t.coverImage) return `<img src="${t.coverImage}" alt="${t.title}">`;
                return `<div class="placeholder">${t.title.charAt(0)}</div>`;
            });
            while (items.length < 4) items.push(`<div class="placeholder">+</div>`);
            coverContainer.innerHTML = items.join('');
        }
    }

    document.getElementById('detailTitle').textContent = name;
    const totalDur = getTotalDuration(tracks);
    document.getElementById('detailMeta').innerHTML = `
        <span class="meta-item"><i class="fas fa-list-ul"></i> ${tracks.length} músicas</span>
        <span class="meta-item"><i class="far fa-clock"></i> ${totalDur}</span>
        <span class="meta-item"><i class="fas fa-user"></i> ${currentUserName}</span>
    `;
    renderTrackList(tracks);
}

function renderTrackList(tracks) {
    const list = document.getElementById('trackList');
    if (!tracks.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Nenhuma música.</p>';
        return;
    }
    list.innerHTML = tracks.map((song, idx) => {
        const coverHtml = song.coverImage ? `<img src="${song.coverImage}" alt="${song.title}">` : `<div class="placeholder">${song.title.charAt(0)}</div>`;
        const isLiked = likedSongs.some(s => s.id === song.id);
        const likedClass = isLiked ? 'liked' : '';
        const isCurrent = currentPlayingSongId !== null && song.id === currentPlayingSongId && state.isPlaying;
        const indexNumber = idx + 1;
        const origin = getSongOrigin(song);
        return `
            <div class="track-item" data-id="${song.id}" data-original-index="${indexNumber}">
                <span class="track-index">
                    ${isCurrent ? `<span class="playing-indicator"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1787351956/M-SPINNING.gif" alt="Tocando"></span>` : indexNumber}
                </span>
                <div class="track-cover">${coverHtml}</div>
                <div class="track-info">
                    <div class="track-title">${song.title}</div>
                    <div class="track-artist">${song.artist} ${origin ? '• ' + origin : ''}</div>
                </div>
                <div class="track-meta">
                    <span class="track-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</span>
                    <span class="track-added"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg" class="added-avatar" alt="Muh.png"> Muh.png</span>
                </div>
                <div class="track-actions">
                    <button class="like-btn ${likedClass}" data-id="${song.id}" title="Curtir">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <button class="save-btn" title="Salvar">
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
    const list = document.getElementById('libraryList');
    const visible = getVisibleSongs();
    document.getElementById('libraryCount').textContent = visible.length;
    document.getElementById('libraryDuration').textContent = getTotalDuration(visible);
    document.getElementById('libraryUser').textContent = currentUserName;

    const sortedSongs = [...visible].sort((a, b) => a.title.localeCompare(b.title));

    list.innerHTML = sortedSongs.map((song, idx) => {
        const coverHtml = song.coverImage ? `<img src="${song.coverImage}" alt="${song.title}">` : `<div class="placeholder">${song.title.charAt(0)}</div>`;
        const isLiked = likedSongs.some(s => s.id === song.id);
        const likedClass = isLiked ? 'liked' : '';
        const isCurrent = currentPlayingSongId !== null && song.id === currentPlayingSongId && state.isPlaying;
        const indexNumber = idx + 1;
        return `
            <div class="track-item" data-id="${song.id}" data-original-index="${indexNumber}">
                <span class="track-index">
                    ${isCurrent ? `<span class="playing-indicator"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1787351956/M-SPINNING.gif" alt="Tocando"></span>` : indexNumber}
                </span>
                <div class="track-cover">${coverHtml}</div>
                <div class="track-info">
                    <div class="track-title">${song.title}</div>
                    <div class="track-artist">${song.artist}</div>
                </div>
                <div class="track-meta">
                    <span class="track-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</span>
                    <span class="track-added"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg" class="added-avatar" alt="Muh.png"> Muh.png</span>
                </div>
                <div class="track-actions">
                    <button class="like-btn ${likedClass}" data-id="${song.id}" title="Curtir">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <button class="save-btn" title="Salvar">
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
            const idx = visible.findIndex(s => s.id === id);
            if (idx !== -1) {
                state.playlist = visible;
                state.currentIndex = idx;
                state.currentItem = null;
                state.currentItemName = null;
                loadSong(state.currentIndex);
                fadePlay();
                updateHighlight();
            }
        });
    });

    updateHighlight();
}

function renderSearchResults(filteredSongs) {
    const results = document.getElementById('searchResults');
    const uniqueSongs = getUniqueSongs(filteredSongs);
    if (!uniqueSongs || uniqueSongs.length === 0) {
        results.innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Nenhum resultado encontrado.</p>';
        return;
    }
    results.innerHTML = uniqueSongs.map((song, idx) => {
        const coverHtml = song.coverImage ? `<img src="${song.coverImage}" alt="${song.title}">` : `<div class="placeholder">${song.title.charAt(0)}</div>`;
        const isLiked = likedSongs.some(s => s.id === song.id);
        const likedClass = isLiked ? 'liked' : '';
        const isCurrent = currentPlayingSongId !== null && song.id === currentPlayingSongId && state.isPlaying;
        const indexNumber = idx + 1;
        const origin = getSongOrigin(song);
        return `
            <div class="track-item" data-id="${song.id}" data-original-index="${indexNumber}">
                <span class="track-index">
                    ${isCurrent ? `<span class="playing-indicator"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1787351956/M-SPINNING.gif" alt="Tocando"></span>` : indexNumber}
                </span>
                <div class="track-cover">${coverHtml}</div>
                <div class="track-info">
                    <div class="track-title">${song.title}</div>
                    <div class="track-artist">${song.artist} ${origin ? '• ' + origin : ''}</div>
                </div>
                <div class="track-meta">
                    <span class="track-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</span>
                    <span class="track-added"><img src="https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg" class="added-avatar" alt="Muh.png"> Muh.png</span>
                </div>
                <div class="track-actions">
                    <button class="like-btn ${likedClass}" data-id="${song.id}" title="Curtir">
                        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </button>
                    <button class="save-btn" title="Salvar">
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

    results.querySelectorAll('.track-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.closest('.track-actions')) return;
            const id = parseInt(this.dataset.id);
            const visible = getVisibleSongs();
            const idx = visible.findIndex(s => s.id === id);
            if (idx !== -1) {
                state.playlist = visible;
                state.currentIndex = idx;
                state.currentItem = null;
                state.currentItemName = null;
                loadSong(state.currentIndex);
                fadePlay();
                updateHighlight();
            }
        });
    });
    updateHighlight();
}

// ============================================================
// BIND DE EVENTOS
// ============================================================
function bindPlayerEvents() {
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    resetBtn.addEventListener('click', resetSong);
    shuffleBtn.addEventListener('click', toggleShuffle);

    progressBar.addEventListener('mousedown', function(e) {
        state.isDragging = true;
        const rect = this.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        seekTo(Math.min(100, Math.max(0, pct)));
        document.addEventListener('mousemove', onProgressMove);
        document.addEventListener('mouseup', onProgressUp);
    });

    volumeBar.addEventListener('mousedown', function(e) {
        const rect = this.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        setVolume(Math.min(1, Math.max(0, pct)));
        document.addEventListener('mousemove', onVolumeMove);
        document.addEventListener('mouseup', onVolumeUp);
    });

    volumeIcon.addEventListener('click', function() {
        if (state.volume > 0) setVolume(0);
        else setVolume(0.5);
    });

    audio.addEventListener('ended', nextSong);
    audio.addEventListener('timeupdate', function() {
        if (!state.isDragging && audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            progressFill.style.width = pct + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
            totalTimeEl.textContent = formatTime(audio.duration);
        }
    });
    audio.addEventListener('pause', function() {
        if (!state.isPlaying) {
            setTimeout(() => { if (!state.isPlaying) updateHighlight(); }, 100);
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

    document.getElementById('nowPlayingClick').addEventListener('click', function() {
        const current = getCurrentSong();
        if (!current) return;
        let itemName = null, itemType = null;
        if (current.category === 'album') { itemName = current.album; itemType = 'album'; }
        else if (current.category === 'playlist') { itemName = current.playlist; itemType = 'playlist'; }
        else if (current.category === 'genre') { itemName = current.genre; itemType = 'genre'; }
        else if (likedSongs.some(s => s.id === current.id)) { itemName = 'Músicas curtidas'; itemType = 'liked'; }
        if (itemName && itemType) openDetail(itemType, itemName);
    });

    document.addEventListener('click', function(e) {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            e.preventDefault();
            const songId = parseInt(likeBtn.dataset.id);
            const type = likeBtn.dataset.type || 'song';
            const name = likeBtn.dataset.name || '';
            if (type === 'album' || type === 'genre') toggleLike(likeBtn, null, type, name);
            else toggleLike(likeBtn, songId, 'song');
        }
        const saveBtn = e.target.closest('.save-btn');
        if (saveBtn) {
            e.preventDefault();
            toggleSave(saveBtn);
        }
    });

    document.getElementById('backToHome').addEventListener('click', function() {
        document.getElementById('playlistDetail').classList.remove('active');
        document.getElementById('page-home').classList.add('active');
        state.currentItem = null;
        state.currentItemName = null;
        state.playlist = getVisibleSongs();
        const current = getCurrentSong();
        if (current) {
            const idx = state.playlist.findIndex(s => s.id === current.id);
            if (idx !== -1) state.currentIndex = idx;
        }
        setTimeout(updateHighlight, 50);
    });
}

function onProgressMove(e) {
    const rect = progressBar.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seekTo(Math.min(100, Math.max(0, pct)));
}
function onProgressUp() {
    state.isDragging = false;
    document.removeEventListener('mousemove', onProgressMove);
    document.removeEventListener('mouseup', onProgressUp);
}
function onVolumeMove(e) {
    const rect = volumeBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setVolume(Math.min(1, Math.max(0, pct)));
}
function onVolumeUp() {
    document.removeEventListener('mousemove', onVolumeMove);
    document.removeEventListener('mouseup', onVolumeUp);
}

function bindNavEvents() {
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = {
        home: document.getElementById('page-home'),
        search: document.getElementById('page-search'),
        library: document.getElementById('page-library')
    };
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.dataset.page;
            if (!page || !pages[page]) return;
            navItems.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            Object.values(pages).forEach(p => p.classList.remove('active'));
            pages[page].classList.add('active');
            document.getElementById('playlistDetail').classList.remove('active');
            if (page === 'search') renderSearchResults(getVisibleSongs());
            if (page === 'library') renderLibrary();
            setTimeout(updateHighlight, 50);
        });
    });
}

function bindUserMenu() {
    const userProfile = document.getElementById('userProfile');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
    });
    logoutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        handleLogout();
    });
}

function bindSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('focus', function() {
        if (!this.value.trim()) renderSearchResults(getVisibleSongs());
    });
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (searchTimeout) clearTimeout(searchTimeout);
        if (!query) {
            renderSearchResults(getVisibleSongs());
            return;
        }
        searchTimeout = setTimeout(() => {
            const normalizedQuery = removeAccents(query.toLowerCase());
            const visible = getVisibleSongs();
            const filtered = visible.filter(s => {
                const titleMatch = removeAccents(s.title.toLowerCase()).includes(normalizedQuery);
                const artistMatch = removeAccents(s.artist.toLowerCase()).includes(normalizedQuery);
                const albumMatch = s.album ? removeAccents(s.album.toLowerCase()).includes(normalizedQuery) : false;
                const playlistMatch = s.playlist ? removeAccents(s.playlist.toLowerCase()).includes(normalizedQuery) : false;
                const genreMatch = s.genre ? removeAccents(s.genre.toLowerCase()).includes(normalizedQuery) : false;
                return titleMatch || artistMatch || albumMatch || playlistMatch || genreMatch;
            });
            renderSearchResults(filtered);
        }, 300);
    });
}

function bindLoginEvents() {
    document.getElementById('loginButton').addEventListener('click', handleLogin);
    document.getElementById('loginUser').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
    });
    document.getElementById('loginPassword').addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
    });
}

function bindKeyboard() {
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') { e.preventDefault(); nextSong(); }
        if (e.code === 'ArrowLeft') { e.preventDefault(); prevSong(); }
    });
}

// ============================================================
// INIT APP (chamado após login bem-sucedido)
// ============================================================
function initApp() {
    const visible = getVisibleSongs();
    state.playlist = visible;
    state.currentIndex = 0;
    state.currentItem = null;
    state.currentItemName = null;
    currentPlayingSongId = null;

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
    document.querySelector('.nav-menu li[data-page="home"]')?.classList.add('active');
    document.getElementById('page-home').classList.add('active');
    npLike.innerHTML = '<i class="fas fa-heart"></i>';
    npLike.style.color = 'var(--green-spotify)';
    updateHighlight();

    console.log(`👤 Logado como: ${currentUserName} (ID ${currentUserId})`);
    console.log(`📀 Total de músicas visíveis: ${getVisibleSongs().length}`);
}