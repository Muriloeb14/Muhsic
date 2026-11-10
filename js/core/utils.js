/* ============================================================
   MUHSIC — CORE / UTILS.JS
   Funções utilitárias puras, sem dependência de estado.
   ============================================================ */

/** Atalho para document.getElementById */
const $ = (id) => document.getElementById(id);

/** 125 → "2:05" */
function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/** "Coração" → "Coracao" (usado na busca) */
function removeAccents(str) {
    return String(str).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Normaliza texto para comparação: sem acento e minúsculo */
function normalizeText(str) {
    return removeAccents(String(str || '').toLowerCase());
}

/** Soma a duração de uma lista de faixas e formata */
function getTotalDuration(tracks) {
    const total = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    return formatTime(total);
}

/**
 * Escapa texto antes de inserir via innerHTML.
 * Evita que um nome cadastrado como "<img onerror=...>" vire HTML.
 */
function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Embaralha uma cópia do array (Fisher–Yates) */
function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/** Sorteia um item do array */
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Preenche todos os selos de versão (.version-badge) a partir do APP */
function renderVersionBadges() {
    document.querySelectorAll('.version-badge').forEach(el => {
        el.textContent = `${APP.stage} ${APP.version}`;
    });
}
