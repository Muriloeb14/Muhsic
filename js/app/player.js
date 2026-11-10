/* ============================================================
   MUHSIC — APP / PLAYER.JS
   ------------------------------------------------------------
   Controle da reprodução: carregar faixa, tocar/pausar,
   próxima/anterior, aleatório, volume, capa e durações.
   Os eventos de mouse/teclado ficam em player-events.js.
   ============================================================ */

/* ============================================================
   SONS DE INTERFACE
   ============================================================ */
function playClickSound() {
    if (!clickSound) return;
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
}

/* ============================================================
   CAPA (crossfade entre duas <img>)
   ============================================================ */
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

    /* Pré-carrega para a troca não "piscar" */
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

/* ============================================================
   VOLUME (anel SVG em volta do disco)
   ============================================================ */
const RING_CIRCUMFERENCE = PLAYER.ringCircumference;
let volumeOverlayTimeout    = null;
let maxVolumeOverlayTimeout = null;

function applyVolume(value) {
    state.volume = Math.max(0, Math.min(1, value));
    if (audio) audio.volume = state.volume;
    const offset = RING_CIRCUMFERENCE * (1 - state.volume);
    [volumeRingFill, volumeRingGlow, maxVolumeRingFill, maxVolumeRingGlow].forEach(ring => {
        if (ring) ring.style.strokeDashoffset = offset;
    });

    /* Medidor de LEDs no teclado da vitrola */
    const meter = $('volumeMeter');
    if (meter) {
        meter.style.setProperty('--vol', state.volume);
        meter.title = `Volume ${Math.round(state.volume * 100)}%`;
    }
}

/** Mostra o anel por alguns instantes */
function flashVolumeOverlay(overlay, wrapper, timeoutRef) {
    if (!overlay) return timeoutRef;
    overlay.classList.add('visible');
    if (wrapper) wrapper.classList.add('volume-active');
    clearTimeout(timeoutRef);
    return setTimeout(() => {
        overlay.classList.remove('visible');
        if (wrapper) wrapper.classList.remove('volume-active');
    }, 900);
}

function showVolumeOverlay() {
    volumeOverlayTimeout = flashVolumeOverlay(volumeOverlay, vinylWrapper, volumeOverlayTimeout);
}

function showMaxVolumeOverlay() {
    maxVolumeOverlayTimeout = flashVolumeOverlay(maxVolumeOverlay, maxVinylWrapper, maxVolumeOverlayTimeout);
}

/* ============================================================
   BRAÇO DA VITROLA
   O áudio só começa quando a transição do braço termina
   (ver listeners "transitionend" em player-events/max-panel).
   ============================================================ */
function baixarBraco() {
    if (tonearm) tonearm.classList.add('active');
    if (maxTonearm) maxTonearm.classList.add('active');
}

function levantarBraco() {
    if (tonearm) tonearm.classList.remove('active');
    if (maxTonearm) maxTonearm.classList.remove('active');
}

/* ============================================================
   EXIBIÇÃO DA FAIXA
   ============================================================ */

/** Atualiza título, artista, capa e progresso para a faixa */
function exibirFaixa(track) {
    setCover(track.coverImage, `Capa - ${track.title}`);
    if (titleEl)       titleEl.textContent = track.title;
    if (artistEl)      artistEl.textContent = track.artist;
    if (progress)      progress.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    if (durationEl)    durationEl.textContent = formatTime(track.duration || 0);
    if (maxTitle)      maxTitle.textContent = track.title;
    if (maxArtist)     maxArtist.textContent = track.artist;
    if (maxCover && track.coverImage) maxCover.src = track.coverImage;
}

/**
 * Prepara a primeira faixa ao abrir o app (sem tocar).
 */
function engatilharFaixaInicial(track) {
    exibirFaixa(track);
    if (audio) { audio.src = track.url; audio.load(); audio.pause(); }
    currentPlayingSongId = track.id;
    playerHasStarted = true;
    state.isPlaying = false;
    musicaReiniciada = false;
    levantarBraco();
}

/* ============================================================
   CARREGAR / TOCAR
   ============================================================ */
function loadTrack(index, autoPlay = false, addToHistory = false) {
    if (!state.playlist.length) return;

    if (addToHistory) {
        const cur = state.playlist[state.currentIndex];
        const ultimo = playHistory[playHistory.length - 1];
        if (cur && (!ultimo || ultimo.id !== cur.id)) adicionarAoHistorico(cur);
    }

    state.currentIndex = index % state.playlist.length;
    const track = state.playlist[state.currentIndex];
    if (!track) return;

    exibirFaixa(track);
    if (audio) audio.src = track.url;
    currentPlayingSongId = track.id;
    musicaReiniciada = false;
    updateHighlight();

    if (autoPlay && audio) {
        pendingPlay = true;
        baixarBraco();
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
        baixarBraco();
        audio.play().catch(() => {});
    } else {
        pendingPlay = false;
        audio.pause();
    }
}

/** Troca para a faixa de índice "idx", guardando a atual no histórico */
function tocarIndice(idx, songId) {
    const cur = state.playlist[state.currentIndex];
    if (cur && playerHasStarted && cur.id !== songId) adicionarAoHistorico(cur);
    state.currentIndex = idx;
    playerHasStarted = true;
    loadTrack(idx, true, false);
    buildQueue();
}

/** Disco arrastado da prateleira para a vitrola */
function playFromShelf(songId) {
    if (!state.playlist.length) return;
    const idx = state.playlist.findIndex(s => s.id === songId);
    if (idx === -1) return;
    tocarIndice(idx, songId);
}

/** Clique em um disco da lista "A seguir" */
function tocarDiscoPorId(songId) {
    let idx = state.playlist.findIndex(s => s.id === songId);
    if (idx === -1) {
        const song = getSongById(songId, currentUserId);
        if (!song) return;
        idx = garantirNaPlaylist(song);
    }
    const posFila = autoQueue.findIndex(s => s.id === songId);
    if (posFila !== -1) { autoQueue = autoQueue.slice(posFila + 1); pushToEnd(); }
    tocarIndice(idx, songId);
}

/* ============================================================
   NAVEGAÇÃO ENTRE FAIXAS
   ============================================================ */
function nextTrack() {
    if (!state.playlist.length && !state.isShuffled) return;

    /* 1) Há fila montada: toca o primeiro da fila */
    if (autoQueue.length > 0) {
        /* O índice só muda dentro de loadTrack, para que a faixa ATUAL
           (e não a próxima) vá para o histórico do botão "anterior". */
        const idx = garantirNaPlaylist(autoQueue[0]);
        shiftQueue();
        loadTrack(idx, true, true);
        return;
    }

    /* 2) Sem fila: sorteia (aleatório) ou segue a ordem */
    let nextIndex;
    if (state.isShuffled) {
        const pool = getVisibleSongs(currentUserId).filter(s => s.id !== currentPlayingSongId);
        if (pool.length === 0) return;
        nextIndex = garantirNaPlaylist(pickRandom(pool));
    } else {
        nextIndex = (state.currentIndex + 1) % state.playlist.length;
    }
    loadTrack(nextIndex, true, true);
    buildQueue();
}

function prevTrack() {
    if (!state.playlist.length) return;

    /* Passou de 3s? Primeiro volta ao início da própria faixa */
    const t = (audio && audio.currentTime) || 0;
    if (t > PLAYER.restartThreshold && !musicaReiniciada) {
        audio.currentTime = 0;
        musicaReiniciada = true;
        if (audio.paused) {
            pendingPlay = true;
            baixarBraco();
            audio.play().catch(() => {});
        }
        return;
    }

    /* Senão, volta pelo histórico */
    if (playHistory.length > 0) {
        loadTrack(garantirNaPlaylist(playHistory.pop()), true, false);
        buildQueue();
        return;
    }

    /* Sem histórico: faixa anterior da lista */
    const prevIndex = (state.currentIndex - 1 + state.playlist.length) % state.playlist.length;
    loadTrack(prevIndex, true, false);
    buildQueue();
}

/** Ativa o modo aleatório e sorteia da biblioteca inteira */
function tocarAleatoriaGlobal() {
    const pool = getVisibleSongs(currentUserId).filter(s => s.id !== currentPlayingSongId);
    if (!pool.length) return;

    if (!state.isShuffled) {
        state.isShuffled = true;
        if (ctxRandomBtn) ctxRandomBtn.classList.add('active');
        if (maxCtxRandom) maxCtxRandom.classList.add('active');
        $('deckShuffle')?.classList.add('active');
    }

    const sorteada = pickRandom(pool);
    tocarIndice(garantirNaPlaylist(sorteada), sorteada.id);
    animarShuffleVisual();
}

/* ============================================================
   DURAÇÃO REAL DOS ÁUDIOS
   O catálogo tem durações aproximadas; aqui lemos os metadados
   reais em segundo plano e corrigimos a interface.
   ============================================================ */
const duracaoCache = new Map();

function obterDuracaoReal(src) {
    return new Promise((resolve) => {
        if (!src) return resolve(null);
        if (duracaoCache.has(src)) return resolve(duracaoCache.get(src));
        const a = new Audio();
        a.preload = 'metadata';
        a.src = src;
        let resolvido = false;
        const done = (v) => {
            if (resolvido) return;
            resolvido = true;
            duracaoCache.set(src, v);
            resolve(v);
        };
        a.addEventListener('loadedmetadata', () => done(isFinite(a.duration) && a.duration > 0 ? a.duration : null));
        a.addEventListener('error', () => done(null));
        setTimeout(() => done(null), PLAYER.durationTimeoutMs);
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
    if (!mudou) return;

    renderLibrary();
    renderSearchResults(getVisibleSongs(currentUserId));
    if (state.currentItem && state.currentItemName) openDetail(state.currentItem, state.currentItemName);
}
