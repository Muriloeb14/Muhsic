/* ============================================================
   MUHSIC — LOGIN.JS
   Lógica de login, sessão, logout e temas
   ------------------------------------------------------------
   Usado tanto na landing (index.html) quanto no app (muhsic.html)
   ============================================================ */

/* ============================================================
   MODAIS (só na landing)
   ============================================================ */
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

/* ============================================================
   SESSÃO (localStorage)
   ============================================================ */
function saveSession(user) {
    localStorage.setItem('muhsic_userId', user.id);
    localStorage.setItem('muhsic_userName', user.name);
    localStorage.setItem('muhsic_userLogin', user.login);
    localStorage.setItem('muhsic_userPlan', user.plan);
    localStorage.setItem('muhsic_userAvatar', user.avatar || '');
}

function loadSession() {
    const id = localStorage.getItem('muhsic_userId');
    if (!id) return null;
    return {
        id: parseInt(id),
        name: localStorage.getItem('muhsic_userName'),
        login: localStorage.getItem('muhsic_userLogin'),
        plan: localStorage.getItem('muhsic_userPlan'),
        avatar: localStorage.getItem('muhsic_userAvatar')
    };
}

function clearSession() {
    ['muhsic_userId', 'muhsic_userName', 'muhsic_userLogin',
     'muhsic_userPlan', 'muhsic_userAvatar', 'muhsic_theme']
    .forEach(k => localStorage.removeItem(k));
}

/* ============================================================
   LOGIN
   ============================================================ */
function handleLogin() {
    const loginEl = document.getElementById('loginUser');
    const passEl  = document.getElementById('loginPassword');
    const errEl   = document.getElementById('loginError');

    if (!loginEl || !passEl) return;

    const login = loginEl.value.trim();
    const pass  = passEl.value.trim();

    if (errEl) errEl.textContent = '';

    if (!login || !pass) {
        if (errEl) errEl.textContent = 'Preencha usuário e senha.';
        return;
    }

    const user = findUserByLogin(login, pass);
    if (!user) {
        if (errEl) errEl.textContent = 'Usuário ou senha inválidos.';
        return;
    }

    // Sucesso
    saveSession(user);

    // Redireciona para o app
    window.location.href = 'muhsic.html';
}

/* ============================================================
   LOGOUT
   ============================================================ */
function handleLogout() {
    clearSession();
    window.location.href = 'index.html';
}

/* ============================================================
   GUARD DE SESSÃO (só no muhsic.html)
   ------------------------------------------------------------
   Se o usuário não está logado, redireciona pra landing.
   ============================================================ */
function requireSession() {
    const session = loadSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    return session;
}

/* ============================================================
   TEMAS (perso.css)
   ============================================================ */
function applyTheme(themeId) {
    document.body.setAttribute('data-theme', themeId);
    localStorage.setItem('muhsic_theme', themeId);
}

function loadTheme() {
    const saved = localStorage.getItem('muhsic_theme') || 'default';
    applyTheme(saved);
}

/* ============================================================
   BIND DE EVENTOS — LANDING
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ---- Botões que abrem modais ---- */
    const openLogin    = document.getElementById('openLoginBtn');
    const openRegister = document.getElementById('openRegisterBtn');
    const heroLogin    = document.getElementById('heroLoginBtn');
    const heroRegister = document.getElementById('heroRegisterBtn');

    if (openLogin)    openLogin.addEventListener('click', () => openModal('loginModal'));
    if (openRegister) openRegister.addEventListener('click', () => openModal('registerModal'));
    if (heroLogin)    heroLogin.addEventListener('click', () => openModal('loginModal'));
    if (heroRegister) heroRegister.addEventListener('click', () => openModal('registerModal'));

    /* ---- Botões de fechar ---- */
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    /* ---- Fechar clicando fora ---- */
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    /* ---- Trocar entre login/register ---- */
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin    = document.getElementById('switchToLogin');

    if (switchToRegister) switchToRegister.addEventListener('click', e => {
        e.preventDefault();
        closeModal('loginModal');
        openModal('registerModal');
    });
    if (switchToLogin) switchToLogin.addEventListener('click', e => {
        e.preventDefault();
        closeModal('registerModal');
        openModal('loginModal');
    });

    /* ---- Botão de login ---- */
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);

    /* ---- Enter nos campos de login ---- */
    ['loginUser', 'loginPassword'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); handleLogin(); }
        });
    });

    /* ---- Botões de plano na landing ---- */
    document.querySelectorAll('.btn-plan').forEach(btn => {
        btn.addEventListener('click', () => {
            openModal('registerModal');
        });
    });

});