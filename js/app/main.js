/* ============================================================
   MUHSIC — APP / MAIN.JS
   ------------------------------------------------------------
   Ponto de entrada do player (muhsic.html).
   ÚLTIMO script a ser carregado: aqui todas as funções dos
   outros módulos já existem.

   Ordem de inicialização:
     1. tema + referências de DOM
     2. dados do usuário e curtidas salvas
     3. eventos (player, painel, navegação, busca, teclado...)
     4. renderização das telas e primeira faixa
   ============================================================ */

/** Executa um passo da inicialização sem derrubar os demais */
function etapa(nome, fn) {
    try {
        const r = fn();
        if (r && typeof r.catch === 'function') return r.catch(e => console.error(`[Muhsic] ${nome}:`, e));
        return r;
    } catch (e) {
        console.error(`[Muhsic] ${nome}:`, e);
    }
}

function initMuhsic() {
    if (!session) return;                 // sem sessão: state.js já redirecionou
    if (window.__muhsicInited) return;
    window.__muhsicInited = true;

    etapa('tema', loadTheme);
    cacheDomRefs();
    if (!audio || !vinyl || !vinylWrapper) return;

    renderVersionBadges();
    ensureQueueStack();
    clickSound = new Audio(ASSETS.sounds.click);

    applyUserToUI();
    etapa('curtidas', carregarCurtidas);

    etapa('eventos do player',  bindPlayerEvents);
    etapa('teclas da vitrola',  bindDeckControls);
    etapa('painel maximizado',  bindMaxPanelEvents);
    etapa('navegação',          bindNavEvents);
    etapa('menu do usuário',    bindUserMenu);
    etapa('busca',              bindSearch);
    etapa('configurações',      bindSettings);
    etapa('teclado',            bindKeyboard);

    initApp().catch(e => {
        console.error('[Muhsic] initApp:', e);
        prepararPrimeiraFaixa();
    });
    showLoginAnimation();
}

/** Deixa a primeira música da biblioteca pronta para tocar */
function prepararPrimeiraFaixa() {
    const visible = getVisibleSongs(currentUserId);
    state.playlist = visible;
    state.currentIndex = 0;
    if (visible.length) engatilharFaixaInicial(visible[0]);
    etapa('fila', buildQueue);
    updateHighlight();
}

async function initApp() {
    const visible = getVisibleSongs(currentUserId);
    playerHasStarted = false;
    autoQueue = [];

    await etapa('início', renderHome);
    await etapa('barra lateral', renderSidebar);
    etapa('biblioteca', renderLibrary);
    etapa('busca', () => renderSearchResults(visible));

    prepararPrimeiraFaixa();
    applyVolume(PLAYER.defaultVolume);
    $('page-home')?.classList.add('active');

    /* Corrige as durações em segundo plano */
    sincronizarDuracoesBiblioteca().catch(() => {});
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMuhsic);
} else {
    initMuhsic();
}
