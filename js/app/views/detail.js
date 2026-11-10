/* ============================================================
   MUHSIC — APP / VIEWS / DETAIL.JS
   ------------------------------------------------------------
   Página de detalhe de uma coleção (álbum, playlist, gênero ou
   curtidos): cabeçalho colorido, metadados, ações e prateleira.
   ============================================================ */

const ICONE_SALVAR = `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>`;
const ICONE_SALVO  = `<polyline points="5 12 10 17 19 7" />`;

/** Descobre as faixas (e capa) de uma coleção */
function resolverColecao(type, name) {
    const visible = getVisibleSongs(currentUserId);

    if (type === 'album' || type === 'playlist' || type === 'genre') {
        return { tracks: visible.filter(s => s.category === type && s[type] === name), cover: null };
    }

    if (type === 'liked') {
        if (name === LIKED_COLLECTION) return { tracks: getCurtidasVisiveis(), cover: ASSETS.likedCover };
        const a = likedAlbums.find(x => x.name === name);
        if (a) return { tracks: a.tracks, cover: a.coverImage };
        const g = likedGenres.find(x => x.name === name);
        if (g) return { tracks: g.tracks, cover: null };
    }

    return { tracks: [], cover: null };
}

async function openDetail(type, name) {
    const { tracks, cover } = resolverColecao(type, name);
    if (!tracks.length) return;

    state.currentItem = type;
    state.currentItemName = name;
    state.playlist = tracks;

    $('page-home')?.classList.remove('active');
    $('playlistDetail')?.classList.add('active');

    const imagem   = capaDaColecao(tracks, cover);
    const pastaCor = await getCorPasta(imagem);

    renderDetailHeader(type, name, imagem, pastaCor);
    renderDetailMeta(type, tracks);
    renderDetailActions(type, name);
    renderVinylShelf(tracks, 'trackList');
}

/* ---------- Cabeçalho com a cor da capa ---------- */
function renderDetailHeader(type, name, imagem, pastaCor) {
    const header = $('detailHeader');
    if (header) {
        header.style.setProperty('--detail-cor', pastaCor.cor);
        header.style.setProperty('--detail-cor-escura', pastaCor.corEscura);
        header.style.background = `linear-gradient(135deg, ${pastaCor.cor}, ${pastaCor.corEscura})`;
    }

    const coverC = $('detailCover');
    if (coverC) {
        coverC.className = '';
        coverC.innerHTML = isColecaoCurtidas(type, name)
            ? `<div class="detail-pasta-wrap detail-pasta-curtidas"><img src="${ASSETS.likedCover}" alt="Curtidos"></div>`
            : `
                <div class="detail-pasta-wrap ${pastaCor.classe}${imagem ? ' has-image' : ''}" ${estiloPasta(imagem, pastaCor)}>
                    <div class="detail-pasta-tint"></div>
                    <div class="detail-pasta-shine"></div>
                    <div class="detail-pasta-logo"><img src="${ASSETS.folderLogo}" alt="MFADE"></div>
                </div>
            `;
    }

    const tEl = $('detailTitle');
    if (tEl) tEl.textContent = name;
}

/* ---------- Quantidade, duração e tipo ---------- */
function renderDetailMeta(type, tracks) {
    const metaEl = $('detailMeta');
    if (!metaEl) return;

    let html = `
        <span class="meta-item"><i class="fas fa-list-ul"></i> ${tracks.length} discos</span>
        <span class="meta-item"><i class="far fa-clock"></i> ${getTotalDuration(tracks)}</span>
    `;
    if (type === 'playlist')   html += `<span class="meta-item"><i class="fas fa-user"></i> ${escapeHTML(currentUserName)}</span>`;
    else if (type === 'album') html += `<span class="meta-item"><i class="fas fa-compact-disc"></i> Álbum</span>`;
    else if (type === 'genre') html += `<span class="meta-item"><i class="fas fa-tag"></i> Gênero</span>`;

    metaEl.innerHTML = html;
}

/* ---------- Botões ♥ e + (apenas álbuns e playlists) ---------- */
function renderDetailActions(type, name) {
    const likeBtn = $('detailLikeBtn');
    const saveBtn = $('detailSaveBtn');
    if (!likeBtn || !saveBtn) return;

    const mostraAcoes = (type === 'album' || type === 'playlist');
    likeBtn.style.display = mostraAcoes ? '' : 'none';
    saveBtn.style.display = mostraAcoes ? '' : 'none';
    if (!mostraAcoes) return;

    const atualizarBotoes = (curtido) => {
        likeBtn.classList.toggle('liked', curtido);
        saveBtn.classList.toggle('saved', curtido);
        const svg = saveBtn.querySelector('svg');
        if (svg) svg.innerHTML = curtido ? ICONE_SALVO : ICONE_SALVAR;
    };

    atualizarBotoes(type === 'album' && isAlbumCurtido(name));

    /* Por enquanto só álbuns podem ser salvos; em playlists os botões
       existem mas não alteram nada (mesmo comportamento da v0.5). */
    const aoClicar = () => {
        const curtido = type === 'album' ? toggleAlbumCurtido(name) : false;
        atualizarBotoes(curtido);
    };
    likeBtn.onclick = aoClicar;
    saveBtn.onclick = aoClicar;
}
