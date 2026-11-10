/* ============================================================
   MUHSIC — CONFIG / APP.CONFIG.JS
   ------------------------------------------------------------
   Configuração central do projeto. Qualquer valor "mágico"
   usado em mais de um lugar deve morar aqui.

   Carregado PRIMEIRO em todas as páginas.
   ============================================================ */

/* ---------- Identidade do projeto ---------- */
const APP = {
    name:    'Muhsic',
    stage:   'BETA',
    version: '0.7',
    author:  'Murilo N.B',
    org:     'MPS — MapleProjectSeries'
};

/* ---------- Chaves do localStorage ----------
   Chaves com função recebem o ID do usuário, para que
   cada conta tenha seus próprios dados no mesmo navegador. */
const STORAGE_KEYS = {
    session:  'muhsic_session',
    users:    'muhsic_users',
    lastSong: 'muhsic_lastSongId',
    theme:    (userId) => `muhsic_theme_${userId}`,
    likes:    (userId) => `muhsic_likes_${userId}`
};

/* ---------- ID reservado ----------
   Músicas com userIds contendo 0 aparecem para todos. */
const GLOBAL_USER_ID = 0;

/* ---------- Mídias (identidade local em assets/img, sons no Cloudinary) ---------- */
const ASSETS = {
    logo:          'assets/img/muhsic-mark.svg',
    logoFade:      'assets/img/muhsic-mark.svg',
    folderLogo:    'assets/img/mark-bars.svg',
    likedCover:    'assets/img/liked-cover.svg',
    defaultAvatar: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg',
    sounds: {
        click: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786688312/TapClick.wav',
        intro: 'https://res.cloudinary.com/oizv8icb/video/upload/v1786685196/StartTypo.wav'
    }
};

/* ---------- Comportamento do player ---------- */
const PLAYER = {
    queueSize:         3,     // discos empilhados ao lado da vitrola
    maxVisibleQueue:   7,     // itens em "A seguir" no painel maximizado
    maxHistory:        50,    // músicas lembradas pelo botão "anterior"
    restartThreshold:  3,     // segundos: antes disso "anterior" volta a faixa
    degreesPerSecond:  90,    // velocidade do vinil (1 volta a cada 4s)
    swapThreshold:     60,    // graus de giro manual para trocar de faixa
    clickTolerance:    6,     // graus tolerados antes de virar "arraste"
    defaultVolume:     0.7,
    volumeStep:        0.05,  // incremento por "scroll" no vinil
    ringCircumference: 289,   // 2πr do anel SVG de volume (r = 46)
    searchDebounceMs:  300,
    durationTimeoutMs: 8000   // tempo máximo para ler a duração real do áudio
};

/* ---------- Temas disponíveis (ver css/themes/themes.css) ---------- */
const THEMES = ['default', 'light', 'red', 'blue', 'purple', 'green', 'orange'];
const DEFAULT_THEME = 'default';

/* ---------- Nome fixo da coleção de músicas curtidas ---------- */
const LIKED_COLLECTION = 'Discos curtidos';
