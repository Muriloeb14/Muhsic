/* ============================================================
   MUHSIC — APP / THEMES.JS
   ------------------------------------------------------------
   Temas de cor (planos Muhsic+ e Premium).
   O tema é aplicado como <body data-theme="..."> e as cores
   ficam em css/themes/themes.css. A escolha é salva por usuário.

   Para criar um tema novo:
     1. Adicione o nome em THEMES (js/config/app.config.js)
     2. Crie o bloco body[data-theme="nome"] em themes.css
     3. Adicione o botão .theme-swatch no modal de muhsic.html
   ============================================================ */

function getSavedTheme() {
    const t = Store.get(STORAGE_KEYS.theme(currentUserId), DEFAULT_THEME);
    return THEMES.includes(t) ? t : DEFAULT_THEME;
}

function setBodyTheme(theme) {
    document.body.dataset.theme = THEMES.includes(theme) ? theme : DEFAULT_THEME;
}

/** Aplica e salva o tema escolhido */
function applyTheme(theme) {
    if (!currentPlanCfg.hasThemes) return;
    setBodyTheme(theme);
    Store.set(STORAGE_KEYS.theme(currentUserId), document.body.dataset.theme);
}

/** Na abertura do app: tema salvo (ou o padrão, se o plano não permite) */
function loadTheme() {
    setBodyTheme(currentPlanCfg.hasThemes ? getSavedTheme() : DEFAULT_THEME);
}

function markActiveTheme() {
    const atual = document.body.dataset.theme || DEFAULT_THEME;
    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.classList.toggle('active', sw.dataset.theme === atual);
    });
}

/* ---------- Modal de configurações ---------- */
function bindSettings() {
    const modal = $('settingsModal');
    if (!modal) return;

    const abrir  = () => { modal.classList.add('active'); markActiveTheme(); };
    const fechar = () => modal.classList.remove('active');

    $('openSettings')?.addEventListener('click', abrir);
    $('closeSettings')?.addEventListener('click', fechar);
    modal.addEventListener('click', e => { if (e.target === modal) fechar(); });

    document.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            if (!currentPlanCfg.hasThemes) return;
            applyTheme(sw.dataset.theme);
            markActiveTheme();
        });
    });
}
