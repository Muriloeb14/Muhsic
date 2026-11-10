/* ============================================================
   MUHSIC — APP / VIEWS / SHELF.JS
   ------------------------------------------------------------
   "Prateleira de vinil": a lista de discos usada no detalhe,
   na busca e na biblioteca. Cada disco pode ser arrastado
   até a vitrola para tocar.
   ============================================================ */

const ICONE_CORACAO = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

/** Destaca o disco que está tocando */
function updateHighlight() {
    document.querySelectorAll('.vinyl-item').forEach(el => {
        const id = parseInt(el.dataset.id, 10);
        const tocando = currentPlayingSongId !== null && id === currentPlayingSongId && state.isPlaying;
        el.classList.toggle('current', tocando);
    });
}

function discoHTML(song, comBotaoCurtir) {
    const titulo = escapeHTML(song.title);
    const cover = song.coverImage
        ? `<img src="${song.coverImage}" alt="${titulo}" draggable="false">`
        : `<div class="placeholder">${escapeHTML(song.title.charAt(0))}</div>`;
    const tocando = currentPlayingSongId !== null && song.id === currentPlayingSongId && state.isPlaying;
    const likeBtn = comBotaoCurtir
        ? `<button class="vinyl-like-btn liked" data-like-id="${song.id}" title="Remover dos curtidos">${ICONE_CORACAO}</button>`
        : '';

    return `
        <div class="vinyl-item ${tocando ? 'current' : ''}" data-id="${song.id}" draggable="true" title="Arraste até o player pra tocar">
            ${likeBtn}
            <div class="shelf-vinyl"><div class="shelf-cover">${cover}</div></div>
            <div class="shelf-info">
                <div class="shelf-title">${titulo}</div>
                <div class="shelf-artist">${escapeHTML(song.artist)}</div>
                <div class="shelf-duration"><i class="far fa-clock"></i> ${formatTime(song.duration || 0)}</div>
            </div>
        </div>
    `;
}

function renderVinylShelf(tracks, targetId) {
    const list = $(targetId);
    if (!list) return;

    if (!tracks.length) {
        list.innerHTML = '<p style="color:var(--text-secondary);padding:20px;text-align:center;">Nenhum disco.</p>';
        return;
    }

    /* Em "Discos curtidos" cada disco ganha um ♥ para descurtir */
    const isLikedView = targetId === 'trackList' && isColecaoCurtidas(state.currentItem, state.currentItemName);

    list.className = 'vinyl-shelf';
    list.innerHTML = tracks.map(song => discoHTML(song, isLikedView)).join('');

    list.querySelectorAll('.vinyl-item').forEach(item => {
        const id = parseInt(item.dataset.id, 10);
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', String(id));
            e.dataTransfer.effectAllowed = 'copy';
            item.classList.add('dragging-source');
            document.body.classList.add('is-dragging-disc');   // a vitrola acende
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging-source');
            document.body.classList.remove('is-dragging-disc');
        });
    });

    list.querySelectorAll('.vinyl-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const songId = parseInt(btn.dataset.likeId, 10);
            if (!isNaN(songId)) removerCurtida(songId);
        });
    });

    updateHighlight();
}

/* ============================================================
   BIBLIOTECA E BUSCA
   Ambas definem a lista ativa do player (state.playlist).
   ============================================================ */
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
