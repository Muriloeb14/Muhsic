/* ============================================================
   MUHSIC — APP / VIEWS / HOME.JS
   Tela "Início": seções de gêneros, álbuns, playlists e curtidos.
   ============================================================ */

/** Gera uma seção (título + grade de pastas) */
async function renderSecaoHome(titulo, cards) {
    if (!cards.length) return '';
    let html = `<div class="section-header"><h2>${titulo}</h2></div><div class="playlists-grid">`;
    for (const c of cards) html += await createCardHTMLAsync(c.name, c.tracks, c.type, c.cover);
    return html + `</div>`;
}

/** { nome: faixas } → [{ name, tracks, type }] */
function paraCards(mapa, type) {
    return Object.entries(mapa).map(([name, tracks]) => ({ name, tracks, type }));
}

async function renderHome() {
    const c = $('homePlaylistsContainer');
    if (!c) return;

    const curtidas = getCurtidasVisiveis();
    const cardsCurtidos = curtidas.length ? [
        { name: LIKED_COLLECTION, tracks: curtidas, type: 'liked' },
        ...likedAlbums.map(a => ({ name: a.name, tracks: a.tracks, type: 'liked' })),
        ...likedGenres.map(g => ({ name: g.name, tracks: g.tracks, type: 'liked' }))
    ] : [];

    let html = '';
    html += await renderSecaoHome('Feito pra você',  paraCards(groupByCategory(currentUserId, 'genre', 'genre'), 'genre'));
    html += await renderSecaoHome('Álbuns Salvos',   paraCards(groupByCategory(currentUserId, 'album', 'album'), 'album'));
    html += await renderSecaoHome('Suas Playlists',  paraCards(groupByCategory(currentUserId, 'playlist', 'playlist'), 'playlist'));
    html += await renderSecaoHome('Discos Curtidos', cardsCurtidos);

    c.innerHTML = html;
    bindAbrirDetalhe(c, '.pasta-card');
}
