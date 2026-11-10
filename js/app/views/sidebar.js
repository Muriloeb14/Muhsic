/* ============================================================
   MUHSIC — APP / VIEWS / SIDEBAR.JS
   Barra lateral: álbuns, playlists, curtidos e gêneros.
   ============================================================ */

async function renderSecaoSidebar(titulo, itens) {
    if (!itens.length) return '';
    let html = `<div class="playlists-section-title">${titulo}</div>`;
    for (const i of itens) html += await createSidebarItemAsync(i.name, i.tracks, i.type, i.cover);
    return html;
}

async function renderSidebar() {
    const c = $('sidebarPlaylistsContainer');
    if (!c) return;

    const curtidas = getCurtidasVisiveis();
    const itensCurtidos = curtidas.length ? [
        { name: LIKED_COLLECTION, tracks: curtidas, type: 'liked' },
        ...likedAlbums.map(a => ({ name: a.name, tracks: a.tracks, type: 'liked', cover: a.coverImage })),
        ...likedGenres.map(g => ({ name: g.name, tracks: g.tracks, type: 'liked' }))
    ] : [];

    let html = '';
    html += await renderSecaoSidebar('Álbuns Salvos',   paraCards(groupByCategory(currentUserId, 'album', 'album'), 'album'));
    html += await renderSecaoSidebar('Playlists',       paraCards(groupByCategory(currentUserId, 'playlist', 'playlist'), 'playlist'));
    html += await renderSecaoSidebar('Discos Curtidos', itensCurtidos);
    html += await renderSecaoSidebar('Gêneros',         paraCards(groupByCategory(currentUserId, 'genre', 'genre'), 'genre'));

    c.innerHTML = html;
    bindAbrirDetalhe(c, '.pasta-item-sidebar');
}
