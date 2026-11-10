/* ============================================================
   MUHSIC — APP / QUEUE.JS
   ------------------------------------------------------------
   Fila automática ("próximos discos").
     - Modo normal: as próximas faixas da lista ativa
     - Modo aleatório: sorteio na biblioteca inteira
   Renderiza a pilha ao lado da vitrola e a lista "A seguir".
   ============================================================ */

/** Cria o contêiner da pilha caso ele não exista no HTML */
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

function renderizarFilas() {
    renderQueue();
    renderMaxNext();
}

/* ============================================================
   MONTAGEM DA FILA
   ============================================================ */

/** Recria a fila do zero */
function buildQueue() {
    autoQueue = [];
    const listLen = state.playlist.length;

    if (!listLen || (listLen <= 1 && !state.isShuffled)) {
        renderizarFilas();
        return;
    }

    if (state.isShuffled) {
        const pool = getVisibleSongs(currentUserId).filter(s => s.id !== currentPlayingSongId);
        for (let i = 0; pool.length && i < QUEUE_SIZE; i++) autoQueue.push({ ...pickRandom(pool) });
    } else {
        for (let i = 1; i <= QUEUE_SIZE; i++) {
            autoQueue.push({ ...state.playlist[(state.currentIndex + i) % listLen] });
        }
    }
    renderizarFilas();
}

/** Remove o primeiro da fila e completa no final */
function shiftQueue() {
    if (!autoQueue.length) return;
    autoQueue.shift();
    pushToEnd();
}

/** Completa a fila até QUEUE_SIZE */
function pushToEnd() {
    if (!state.playlist.length && !state.isShuffled) return;
    const listLen = state.playlist.length;
    if (listLen === 1 && !state.isShuffled) return;
    if (autoQueue.length >= QUEUE_SIZE) return;

    while (autoQueue.length < QUEUE_SIZE) {
        if (state.isShuffled) {
            const bib = getVisibleSongs(currentUserId);
            const ids = autoQueue.map(s => s.id);
            const semRepetir = bib.filter(s => s.id !== currentPlayingSongId && !ids.includes(s.id));
            const pool = semRepetir.length > 0 ? semRepetir : bib.filter(s => s.id !== currentPlayingSongId);
            if (pool.length === 0) break;
            autoQueue.push({ ...pickRandom(pool) });
        } else {
            const ultima = autoQueue.length ? autoQueue[autoQueue.length - 1] : state.playlist[state.currentIndex];
            const idxU = state.playlist.findIndex(s => s.id === ultima.id);
            autoQueue.push({ ...state.playlist[(idxU + 1) % listLen] });
        }
    }
    renderizarFilas();
}

/** Animação de "embaralhar" nas duas filas */
function animarShuffleVisual() {
    [queueStack, $('maxNextList')].forEach(el => {
        if (!el) return;
        el.classList.add('shuffling');
        setTimeout(() => el.classList.remove('shuffling'), 800);
    });
}

/* ============================================================
   RENDERIZAÇÃO
   ============================================================ */

/** Discos da fila (o posicionamento fica em css/player/queue.css) */
function renderQueue() {
    if (!queueStack) ensureQueueStack();
    if (!queueStack) return;
    if (autoQueue.length === 0) { queueStack.innerHTML = ''; return; }

    queueStack.innerHTML = autoQueue.slice(0, QUEUE_SIZE).map(song => {
        const titulo = escapeHTML(song.title);
        const img = song.coverImage
            ? `<img src="${song.coverImage}" alt="${titulo}">`
            : `<div class="placeholder">${escapeHTML(song.title.charAt(0))}</div>`;
        return `
            <div class="queue-vinyl" data-song-id="${song.id}" title="${titulo} — ${escapeHTML(song.artist)}">
                <div class="queue-cover">${img}</div>
            </div>`;
    }).join('');

    /* Clique em um disco da fila toca ele direto */
    queueStack.querySelectorAll('.queue-vinyl').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.songId, 10);
            if (!isNaN(id)) tocarDiscoPorId(id);
        });
    });
}

/** Fila + discos sorteados para completar MAX_VISIBLE_QUEUE itens */
function getDiscosASeguir() {
    const lista = [...autoQueue];
    if (lista.length >= MAX_VISIBLE_QUEUE) return lista.slice(0, MAX_VISIBLE_QUEUE);

    const usados = new Set(lista.map(s => s.id));
    if (currentPlayingSongId) usados.add(currentPlayingSongId);

    const extras = shuffleArray(getVisibleSongs(currentUserId).filter(s => !usados.has(s.id)));
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

    maxNextList.innerHTML = lista.map(song => {
        const titulo = escapeHTML(song.title);
        const cover = song.coverImage
            ? `<img src="${song.coverImage}" alt="${titulo}">`
            : `<div class="placeholder">${escapeHTML(song.title.charAt(0))}</div>`;
        return `
            <div class="max-next-item" data-song-id="${song.id}">
                <div class="max-next-cover">${cover}</div>
                <div class="max-next-info">
                    <div class="max-next-title">${titulo}</div>
                    <div class="max-next-artist">${escapeHTML(song.artist)}</div>
                </div>
            </div>
        `;
    }).join('');

    maxNextList.querySelectorAll('.max-next-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.songId, 10);
            if (!isNaN(id)) tocarDiscoPorId(id);
        });
    });
}
