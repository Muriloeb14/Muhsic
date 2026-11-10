/* ============================================================
   MUHSIC — APP / MAX-PANEL.JS
   ------------------------------------------------------------
   Painel lateral com o vinil grande e a lista "A seguir".
   Aceita os mesmos gestos do vinil compacto.
   ============================================================ */

let maxIsDragging        = false;
let maxDragStartMouseAng = 0;
let maxDragStartDiskAng  = 0;
let maxDragTotalRotation = 0;
let maxDragMoved         = false;

/* ---------- Abrir / fechar ---------- */
function isMaxPanelOpen() {
    return !!(maxPanel && maxPanel.classList.contains('open'));
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

/* ---------- Menu de contexto ---------- */
function isMaxContextMenuOpen() {
    return !!(maxContextMenu && maxContextMenu.classList.contains('visible'));
}

function openMaxContextMenu() {
    if (maxContextMenu) maxContextMenu.classList.add('visible');
    if (maxCtxRandom) maxCtxRandom.classList.toggle('active', state.isShuffled);
}

function closeMaxContextMenu() {
    if (maxContextMenu) maxContextMenu.classList.remove('visible');
}

function setMaxRotation(angle) {
    if (maxVinyl) maxVinyl.style.transform = `rotate(${angle}deg)`;
}

/* ============================================================
   BIND
   ============================================================ */
function bindMaxPanelEvents() {
    if (!maxPanel) return;

    if (maxCtxMinimize) maxCtxMinimize.addEventListener('click', (e) => {
        e.stopPropagation(); fecharMaxPanel();
    });
    $('maxClose')?.addEventListener('click', fecharMaxPanel);

    /* Clique no fundo escuro também fecha */
    maxPanel.addEventListener('click', (e) => {
        if (e.target === maxPanel) fecharMaxPanel();
    });
    if (maxCtxRandom) maxCtxRandom.addEventListener('click', (e) => {
        e.stopPropagation(); closeMaxContextMenu(); tocarAleatoriaGlobal();
    });

    if (maxVinylWrapper) {
        maxVinylWrapper.addEventListener('wheel', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (isMaxContextMenuOpen()) return;
            applyVolume(state.volume + (e.deltaY > 0 ? -PLAYER.volumeStep : PLAYER.volumeStep));
            showMaxVolumeOverlay();
        }, { passive: false });

        maxVinylWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (isMaxContextMenuOpen()) closeMaxContextMenu();
            else openMaxContextMenu();
        });

        maxVinylWrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || isMaxContextMenuOpen()) return;
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
            if (isMaxContextMenuOpen()) return;
            toggleLikeCurrent();
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!maxIsDragging) return;
        const cur = getMouseAngleFor(maxVinylWrapper, e);
        maxDragTotalRotation += angleDiff(cur, maxDragStartMouseAng);
        maxDragStartMouseAng = cur;
        if (!maxDragMoved && Math.abs(maxDragTotalRotation) > CLICK_TOLERANCE) {
            maxDragMoved = true;
            maxVinylWrapper.classList.add('dragging');
        }
        if (maxDragMoved) setMaxRotation(maxDragStartDiskAng + maxDragTotalRotation);
    });

    window.addEventListener('mouseup', () => {
        if (!maxIsDragging) return;
        maxIsDragging = false;
        if (maxVinylWrapper) maxVinylWrapper.classList.remove('dragging');
        const total = maxDragTotalRotation;

        if (total >= SWAP_THRESHOLD) {
            maxAccumulatedAngle = maxDragStartDiskAng + total;
            setMaxRotation(maxAccumulatedAngle);
            nextTrack();
        } else if (total <= -SWAP_THRESHOLD) {
            maxAccumulatedAngle = maxDragStartDiskAng + total;
            setMaxRotation(maxAccumulatedAngle);
            prevTrack();
        } else if (!maxDragMoved) {
            togglePlay();
        } else {
            maxAccumulatedAngle = maxDragStartDiskAng;
            if (maxVinyl) maxVinyl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1)';
            setMaxRotation(maxAccumulatedAngle);
            setTimeout(() => {
                if (maxVinyl) maxVinyl.style.transition = 'none';
                if (audio && !audio.paused) startMaxSpin();
            }, 420);
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
        if (e.key !== 'Escape' || !isMaxPanelOpen()) return;
        if (isMaxContextMenuOpen()) closeMaxContextMenu();
        else fecharMaxPanel();
    });
}
