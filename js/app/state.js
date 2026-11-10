/* ============================================================
   MUHSIC — APP / STATE.JS
   ------------------------------------------------------------
   Estado global do player e referências aos elementos da tela.
   Primeiro módulo do app a ser carregado: todos os outros leem
   e alteram as variáveis declaradas aqui.
   ============================================================ */

/* ---------- Sessão ---------- */
const session = requireSession();
if (!session) {
    console.warn('Sessão ausente — redirecionando para o login...');
    window.location.replace('index.html');
}

const currentUserId   = session ? session.id   : null;
const currentUserName = session ? session.name : '';
const currentUserPlan = session ? session.plan : 'free';
const currentPlanCfg  = getPlanConfig(currentUserPlan);

/* ---------- Estado da reprodução ---------- */
const state = {
    playlist: [],           // lista "ativa" (álbum aberto, busca, biblioteca...)
    currentIndex: 0,
    isPlaying: false,
    isShuffled: false,
    volume: PLAYER.defaultVolume,
    currentItem: null,      // tipo aberto no detalhe: album | playlist | genre | liked
    currentItemName: null
};

let autoQueue   = [];       // próximas faixas (pilha ao lado da vitrola)
let playHistory = [];       // faixas anteriores (botão "voltar")

const QUEUE_SIZE        = PLAYER.queueSize;
const MAX_VISIBLE_QUEUE = PLAYER.maxVisibleQueue;
const MAX_HISTORY       = PLAYER.maxHistory;

let currentPlayingSongId = null;
let pendingPlay          = false;   // play aguardando o braço da vitrola descer
let playerHasStarted     = false;
let musicaReiniciada     = false;   // "anterior" já voltou a faixa ao início?

let clickSound    = null;
let searchTimeout = null;

/* ---------- Referências de DOM (preenchidas em cacheDomRefs) ---------- */
let audio, vinyl, vinylWrapper, tonearm, tonearmArm;
let progressBar, progress, currentTimeEl, durationEl;
let coverA, coverB;
let titleEl, artistEl;
let volumeOverlay, volumeRingFill, volumeRingGlow;
let likeOverlay;
let contextMenu, ctxRandomBtn, ctxMaximizeBtn;
let queueStack;

let maxPanel;
let maxTonearm, maxTonearmArm, maxVinylWrapper, maxVinyl;
let maxCover, maxTitle, maxArtist, maxNextList;
let maxLikeOverlay, maxContextMenu, maxCtxRandom, maxCtxMinimize;
let maxVolumeOverlay, maxVolumeRingFill, maxVolumeRingGlow;

function cacheDomRefs() {
    /* Player compacto */
    audio           = $('audio');
    vinyl           = $('vinyl');
    vinylWrapper    = $('vinyl-wrapper');
    tonearm         = $('tonearm');
    tonearmArm      = $('tonearm-arm');
    progressBar     = $('progress-bar');
    progress        = $('progress');
    currentTimeEl   = $('current-time');
    durationEl      = $('duration');
    coverA          = $('cover-a');
    coverB          = $('cover-b');
    titleEl         = $('track-title');
    artistEl        = $('track-artist');
    volumeOverlay   = $('volume-overlay');
    volumeRingFill  = $('volume-ring-fill');
    volumeRingGlow  = $('volume-ring-glow');
    likeOverlay     = $('like-overlay');
    contextMenu     = $('context-menu');
    ctxRandomBtn    = $('ctx-random');
    ctxMaximizeBtn  = $('ctx-maximize');

    /* Painel maximizado */
    maxPanel          = $('maxPlayerPanel');
    maxTonearm        = $('maxTonearm');
    maxTonearmArm     = $('maxTonearmArm');
    maxVinylWrapper   = $('maxVinylWrapper');
    maxVinyl          = $('maxVinyl');
    maxCover          = $('maxCover');
    maxTitle          = $('maxTitle');
    maxArtist         = $('maxArtist');
    maxNextList       = $('maxNextList');
    maxLikeOverlay    = $('maxLikeOverlay');
    maxContextMenu    = $('maxContextMenu');
    maxCtxRandom      = $('maxCtxRandom');
    maxCtxMinimize    = $('maxCtxMinimize');
    maxVolumeOverlay  = $('maxVolumeOverlay');
    maxVolumeRingFill = $('maxVolumeRingFill');
    maxVolumeRingGlow = $('maxVolumeRingGlow');
}

/** Faixa atual da lista ativa */
function getCurrentSong() {
    if (!state.playlist.length) return null;
    return state.playlist[state.currentIndex % state.playlist.length];
}

/** Registra uma faixa no histórico do botão "anterior" */
function adicionarAoHistorico(song) {
    playHistory.push({ ...song });
    if (playHistory.length > MAX_HISTORY) playHistory.shift();
}

/** Garante que a música está na lista ativa e retorna seu índice */
function garantirNaPlaylist(song) {
    let idx = state.playlist.findIndex(s => s.id === song.id);
    if (idx === -1) {
        state.playlist.push({ ...song });
        idx = state.playlist.length - 1;
    }
    return idx;
}
