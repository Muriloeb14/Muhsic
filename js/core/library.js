/* ============================================================
   MUHSIC — CORE / LIBRARY.JS
   ------------------------------------------------------------
   Consultas sobre o catálogo (js/data/songs.js).
   É a única camada que lê "baseSongs" diretamente.
   ============================================================ */

/** Usuário pode ver a música? (global ou exclusiva dele) */
function songIsVisibleTo(song, userId) {
    return song.userIds.includes(GLOBAL_USER_ID) || song.userIds.includes(userId);
}

/**
 * Músicas visíveis para um usuário, sem duplicatas.
 */
function getVisibleSongs(userId) {
    return getUniqueSongs(baseSongs.filter(s => songIsVisibleTo(s, userId)));
}

/**
 * Remove duplicatas mantendo 1 ocorrência por (título + artista).
 */
function getUniqueSongs(songs) {
    const seen = new Set();
    return songs.filter(s => {
        const key = `${s.title}|||${s.artist}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/** Busca uma música visível pelo ID */
function getSongById(id, userId) {
    return getVisibleSongs(userId).find(s => s.id === id) || null;
}

/**
 * Agrupa as músicas visíveis por categoria.
 * Ex.: groupByCategory(1, 'album', 'album') → { 'Nome do Álbum': [faixas] }
 */
function groupByCategory(userId, category, nameField) {
    const map = {};
    getVisibleSongs(userId).forEach(s => {
        if (s.category !== category) return;
        const k = s[nameField];
        (map[k] = map[k] || []).push(s);
    });
    return map;
}

/** Filtra por texto em título, artista, álbum, playlist e gênero */
function searchSongs(songs, query) {
    const q = normalizeText(query);
    if (!q) return songs;
    return songs.filter(s =>
        [s.title, s.artist, s.album, s.playlist, s.genre]
            .some(campo => campo && normalizeText(campo).includes(q))
    );
}
