/* ============================================================
   MUHSIC — APP / PLAYER-EVENTS.JS
   ------------------------------------------------------------
   Interações com o vinil compacto (barra inferior):
     clique ............ play / pause
     girar (arrastar) .. próxima / anterior
     scroll ............ volume
     duplo clique ...... curtir
     botão direito ..... menu (aleatório / maximizar)
     soltar um disco ... tocar a faixa arrastada
   ============================================================ */

let isDragging        = false;
let dragStartMouseAng = 0;
let dragStartDiskAng  = 0;
let dragTotalRotation = 0;
let dragMoved         = false;

/* ---------- Menu de contexto ---------- */
function isContextMenuOpen() {
    return !!(contextMenu && contextMenu.classList.contains('visible'));
}

function openContextMenu() {
    if (contextMenu) contextMenu.classList.add('visible');
    if (ctxRandomBtn) ctxRandomBtn.classList.toggle('active', state.isShuffled);
}

function closeContextMenu() {
    if (contextMenu) contextMenu.classList.remove('visible');
}

/* ============================================================
   BIND
   ============================================================ */
function bindPlayerEvents() {
    if (!audio || !vinylWrapper) return;

    bindAudioEvents();
    bindProgressBar();
    bindVinylGestures();
    bindVinylDrop();

    if (ctxRandomBtn) ctxRandomBtn.addEventListener('click', (e) => {
        e.stopPropagation(); closeContextMenu(); tocarAleatoriaGlobal();
    });
    if (ctxMaximizeBtn) ctxMaximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); closeContextMenu(); abrirMaxPanel();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeContextMenu();
    });

    /* O áudio só começa quando o braço termina de descer */
    if (tonearmArm) {
        tonearmArm.addEventListener('transitionend', (e) => {
            if (e.propertyName !== 'transform') return;
            if (tonearm && tonearm.classList.contains('active') && pendingPlay) {
                pendingPlay = false;
                audio.play().catch(() => {});
            }
        });
    }
}

/* ---------- Eventos do <audio> ---------- */
function bindAudioEvents() {
    audio.addEventListener('play', () => {
        clearTimeout(brakeTimeoutId);
        if (vinyl) vinyl.style.transition = 'none';
        startSpin();
        state.isPlaying = true;
        updateHighlight();
        baixarBraco();
        if (maxPanel && maxPanel.classList.contains('open')) startMaxSpin();
        if (currentPlayingSongId) Store.set(STORAGE_KEYS.lastSong, currentPlayingSongId);
        document.body.classList.add('is-playing');      // LEDs, VU e botão play no CSS
    });

    audio.addEventListener('pause', () => {
        brakeAndStop();
        levantarBraco();
        if (maxVinyl) maxBrakeAndStop();
        state.isPlaying = false;
        updateHighlight();
        document.body.classList.remove('is-playing');
    });

    audio.addEventListener('loadedmetadata', () => {
        const d = audio.duration;
        if (!isFinite(d) || d <= 0) return;
        if (durationEl) durationEl.textContent = formatTime(d);
        const track = getCurrentSong();
        if (!track) return;
        track.duration = d;
        const el = document.querySelector(`.vinyl-item[data-id="${track.id}"] .shelf-duration`);
        if (el) el.innerHTML = `<i class="far fa-clock"></i> ${formatTime(d)}`;
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        if (progress) progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
        if (audio.currentTime > PLAYER.restartThreshold) musicaReiniciada = false;
    });

    audio.addEventListener('ended', () => nextTrack());
}

/* ---------- Barra de progresso (clique para pular) ---------- */
function bindProgressBar() {
    if (!progressBar) return;
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (!isNaN(audio.duration)) audio.currentTime = pct * audio.duration;
    });
}

/* ---------- Gestos no vinil ---------- */
function bindVinylGestures() {
    vinylWrapper.addEventListener('wheel', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (isContextMenuOpen()) return;
        applyVolume(state.volume + (e.deltaY > 0 ? -PLAYER.volumeStep : PLAYER.volumeStep));
        showVolumeOverlay();
    }, { passive: false });

    vinylWrapper.addEventListener('contextmenu', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (isContextMenuOpen()) closeContextMenu();
        else openContextMenu();
    });

    vinylWrapper.addEventListener('dblclick', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (isContextMenuOpen()) return;
        toggleLikeCurrent();
    });

    vinylWrapper.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || isContextMenuOpen()) return;
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
        dragTotalRotation += angleDiff(cur, dragStartMouseAng);
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

        if (total >= SWAP_THRESHOLD) {             // girou para frente
            accumulatedAngle = dragStartDiskAng + total;
            nextTrack();
        } else if (total <= -SWAP_THRESHOLD) {     // girou para trás
            accumulatedAngle = dragStartDiskAng + total;
            prevTrack();
        } else if (!dragMoved) {                   // foi só um clique
            togglePlay();
        } else {                                   // giro curto: volta ao lugar
            accumulatedAngle = dragStartDiskAng;
            if (vinyl) vinyl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)';
            applyAngle(accumulatedAngle);
            setTimeout(() => {
                if (vinyl) vinyl.style.transition = 'none';
                if (audio && !audio.paused) startSpin();
            }, 420);
        }
        dragTotalRotation = 0;
    });
}

/* ---------- Teclado físico da vitrola (botões do deck) ---------- */
function bindDeckControls() {
    const acoes = {
        deckPrev:    () => prevTrack(),
        deckPlay:    () => togglePlay(),
        deckNext:    () => nextTrack(),
        deckShuffle: () => tocarAleatoriaGlobal(),
        deckLike:    () => toggleLikeCurrent(),
        deckMax:     () => abrirMaxPanel(),
        deckVolDown: () => { applyVolume(state.volume - PLAYER.volumeStep * 2); showVolumeOverlay(); },
        deckVolUp:   () => { applyVolume(state.volume + PLAYER.volumeStep * 2); showVolumeOverlay(); }
    };

    Object.entries(acoes).forEach(([id, acao]) => {
        $(id)?.addEventListener('click', (e) => {
            e.currentTarget.blur();     // Espaço não "clica" de novo no botão focado
            playClickSound();
            acao();
        });
    });

    /* Som de tecla em todos os outros botões .key do app */
    document.querySelectorAll('.key').forEach(k => {
        if (k.id && acoes[k.id]) return;
        k.addEventListener('click', playClickSound);
    });
}

/* ---------- Arrastar disco da prateleira até a vitrola ---------- */
function bindVinylDrop() {
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
        const songId = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (songId) playFromShelf(songId);
    });
}
