/* ============================================================
   MUHSIC — APP / USER-UI.JS
   Dados do usuário na tela e recursos liberados pelo plano.
   ============================================================ */

function applyUserToUI() {
    const userNameEl = $('userName');
    const greetingEl = $('greetingUser');
    const avatarEl   = $('userAvatar');
    const planInfoEl = $('planInfo');

    if (userNameEl) userNameEl.textContent = currentUserName;
    if (greetingEl) greetingEl.textContent = currentUserName;
    if (avatarEl)   avatarEl.src = session.avatar || ASSETS.defaultAvatar;
    if (planInfoEl) planInfoEl.textContent = currentPlanCfg.label;

    const planInfoRow = $('planInfoRow');
    if (planInfoRow) {
        planInfoRow.innerHTML = `<i class="fas fa-crown"></i> Plano: ${escapeHTML(currentPlanCfg.label)}`;
        planInfoRow.style.color = currentPlanCfg.color;
    }

    /* Recursos por plano */
    const adBanner = $('adBanner');
    if (adBanner) adBanner.style.display = currentPlanCfg.showAds ? 'block' : 'none';

    const grid   = $('themeGrid');
    const locked = $('settingsLocked');
    if (grid)   grid.classList.toggle('locked', !currentPlanCfg.hasThemes);
    if (locked) locked.style.display = currentPlanCfg.hasThemes ? 'none' : 'block';
}

/** Logo animado + som ao entrar */
function showLoginAnimation() {
    const anim = $('loginAnimation');
    if (!anim) return;
    anim.classList.add('active');
    void anim.offsetWidth;
    setTimeout(() => {
        new Audio(ASSETS.sounds.intro).play().catch(() => {});
    }, 100);
    setTimeout(() => anim.classList.remove('active'), 2200);
}
