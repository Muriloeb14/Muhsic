/* ============================================================
   MUHSIC — APP / LIKES.JS
   ------------------------------------------------------------
   Músicas, álbuns e gêneros curtidos.
   Persistência: localStorage por usuário (STORAGE_KEYS.likes),
   guardando apenas IDs/nomes — os dados completos são sempre
   reconstruídos a partir do catálogo atual.
   ============================================================ */

let likedSongs  = [];   // [{...song}]
let likedAlbums = [];   // [{ name, coverImage, tracks, type: 'album' }]
let likedGenres = [];   // [{ name, tracks }]

/* ============================================================
   PERSISTÊNCIA
   ============================================================ */
function salvarCurtidas() {
    Store.set(STORAGE_KEYS.likes(currentUserId), {
        songs:  likedSongs.map(s => s.id),
        albums: likedAlbums.map(a => a.name),
        genres: likedGenres.map(g => g.name)
    });
}

function carregarCurtidas() {
    const salvo = Store.get(STORAGE_KEYS.likes(currentUserId), {}) || {};
    const visiveis = getVisibleSongs(currentUserId);
    const porId = new Map(visiveis.map(s => [s.id, s]));

    likedSongs = (salvo.songs || [])
        .map(id => porId.get(id))
        .filter(Boolean)
        .map(s => ({ ...s }));

    likedAlbums = (salvo.albums || [])
        .map(name => montarColecao('album', name, visiveis))
        .filter(Boolean);

    likedGenres = (salvo.genres || [])
        .map(name => montarColecao('genre', name, visiveis))
        .filter(Boolean);
}

/** Monta o objeto de um álbum/gênero curtido a partir do catálogo */
function montarColecao(category, name, visiveis = getVisibleSongs(currentUserId)) {
    const tracks = visiveis.filter(s => s.category === category && s[category] === name);
    if (!tracks.length) return null;
    return category === 'album'
        ? { name, coverImage: tracks[0]?.coverImage, tracks, type: 'album' }
        : { name, tracks };
}

/* ============================================================
   CONSULTAS
   ============================================================ */
function isAlbumCurtido(name) { return likedAlbums.some(a => a.name === name); }
function isGenreCurtido(name) { return likedGenres.some(g => g.name === name); }
function isSongCurtida(id)    { return likedSongs.some(s => s.id === id); }

/** Curtidas que o usuário ainda pode ver */
function getCurtidasVisiveis() {
    return likedSongs.filter(s => songIsVisibleTo(s, currentUserId));
}

/* ============================================================
   AÇÕES
   ============================================================ */

/** Re-renderiza tudo que depende das curtidas */
function aoMudarCurtidas() {
    salvarCurtidas();
    renderSidebar();
    renderHome();
}

function playLikeAnimation(overlay) {
    if (!overlay) return;
    overlay.classList.remove('playing-like');
    overlay.classList.add('liked');
    void overlay.offsetWidth;               // reinicia a animação CSS
    overlay.classList.add('playing-like');
    setTimeout(() => overlay.classList.remove('playing-like'), 1450);
}

/** Duplo clique no vinil: curte/descurte a faixa atual */
function toggleLikeCurrent() {
    const track = getCurrentSong();
    if (!track) return;

    if (isSongCurtida(track.id)) {
        likedSongs = likedSongs.filter(s => s.id !== track.id);
        if (likeOverlay) likeOverlay.classList.remove('liked');
        if (maxLikeOverlay) maxLikeOverlay.classList.remove('liked');
    } else {
        likedSongs.push({ ...track });
        playLikeAnimation(likeOverlay);
        playLikeAnimation(maxLikeOverlay);
    }

    aoMudarCurtidas();
    if (state.currentItem === 'liked' && state.currentItemName === LIKED_COLLECTION) {
        openDetail('liked', LIKED_COLLECTION);
    }
    updateHighlight();
}

/** Botão ♥ na prateleira de "Discos curtidos" */
function removerCurtida(songId) {
    likedSongs = likedSongs.filter(s => s.id !== songId);
    aoMudarCurtidas();
    openDetail('liked', LIKED_COLLECTION);
}

/** Botões ♥ / + no cabeçalho de um álbum */
function toggleAlbumCurtido(name) {
    const idx = likedAlbums.findIndex(a => a.name === name);
    if (idx >= 0) {
        likedAlbums.splice(idx, 1);
    } else {
        const album = montarColecao('album', name);
        if (album) likedAlbums.push(album);
    }
    aoMudarCurtidas();
    return isAlbumCurtido(name);
}
