/* ============================================================
   MUHSIC — LOGIN.JS
   Login, cadastro, sessão e configuração de plano
   ============================================================ */

const SESSION_KEY = 'muhsic_session';
const USERS_KEY   = 'muhsic_users';

/* ============================================================
   SESSÃO
   ============================================================ */
function salvarSessao(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        plan: user.plan || 'free',
        avatar: user.avatar || null
    }));
}

function requireSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || !s.id || !s.name) return null;
        return s;
    } catch (e) {
        console.error('Sessão inválida:', e);
        return null;
    }
}

function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.replace('index.html');
}

/* ============================================================
   PLANOS
   ============================================================ */
function getPlanConfig(plan) {
    const plans = {
        free:    { label: 'Free',    color: '#b3b3b3', showAds: true,  hasThemes: false },
        plus:    { label: 'Muhsic+', color: '#1ed760', showAds: false, hasThemes: true  },
        premium: { label: 'Premium', color: '#FFD700', showAds: false, hasThemes: true  }
    };
    return plans[plan] || plans.free;
}

/* ============================================================
   USUÁRIOS — leitura do users.js + cadastros locais
   ============================================================ */
function carregarUsuariosLocais() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function salvarUsuariosLocais(lista) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(lista));
    } catch (e) {
        console.error('Falha ao salvar usuários:', e);
    }
}

/* Tenta extrair usuários de users.js em vários formatos comuns */
function extrairUsuariosBase() {
    // 1) getUsers() função
    try {
        if (typeof getUsers === 'function') {
            const r = getUsers();
            if (Array.isArray(r)) return r;
        }
    } catch (e) {}

    // 2) Arrays globais comuns
    const candidatos = [];
    try { if (typeof baseUsers !== 'undefined') candidatos.push(baseUsers); } catch (e) {}
    try { if (typeof USERS !== 'undefined') candidatos.push(USERS); } catch (e) {}
    try { if (typeof users !== 'undefined') candidatos.push(users); } catch (e) {}
    try { if (typeof baseSongs !== 'undefined' && Array.isArray(baseSongs)) {} } catch (e) {}

    for (const c of candidatos) {
        if (Array.isArray(c) && c.length) return c;
    }

    // 3) Objeto mapa { user1: {...}, user2: {...} }
    for (const nome of ['USERS', 'users', 'baseUsers']) {
        try {
            const obj = eval(nome);
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                const vals = Object.values(obj);
                if (vals.length && typeof vals[0] === 'object') return vals;
            }
        } catch (e) {}
    }

    return [];
}

/* Junta usuários base + locais (locais sobrescrevem base por username) */
function listarTodosUsuarios() {
    const base = extrairUsuariosBase();
    const locais = carregarUsuariosLocais();
    const mapa = new Map();

    [...base, ...locais].forEach(u => {
        if (!u || typeof u !== 'object') return;
        const chave = (
            u.username || u.user || u.login || u.name || ''
        ).toString().toLowerCase();
        if (chave) mapa.set(chave, u);
    });

    return [...mapa.values()];
}

/* Extrai nome de usuário de um objeto usuário em vários formatos */
function nomeDoUsuario(u) {
    return (u.username || u.user || u.login || u.name || '').toString();
}

/* Extrai senha em vários formatos */
function senhaDoUsuario(u) {
    return (u.password || u.pass || u.senha || '').toString();
}

/* Valida usuário/senha. Retorna o objeto usuário ou null */
function validarCredenciais(username, password) {
    const alvo = username.trim().toLowerCase();
    const lista = listarTodosUsuarios();
    return lista.find(u => {
        const nome = nomeDoUsuario(u).toLowerCase();
        const senha = senhaDoUsuario(u);
        return nome === alvo && senha === password;
    }) || null;
}

/* ============================================================
   LANDING (index.html) — modal de login e register
   ============================================================ */
function initLanding() {
    const modal = document.getElementById('authModal');
    if (!modal) return; // não está na landing

    const tabLogin     = document.getElementById('tabLogin');
    const tabRegister  = document.getElementById('tabRegister');
    const paneLogin    = document.getElementById('paneLogin');
    const paneRegister = document.getElementById('paneRegister');

    function abrirModal(aba) {
        modal.classList.add('active');
        trocarAba(aba || 'login');
    }
    function fecharModal() {
        modal.classList.remove('active');
        limparMensagens();
    }
    function trocarAba(aba) {
        const isLogin = aba === 'login';
        tabLogin.classList.toggle('active', isLogin);
        tabRegister.classList.toggle('active', !isLogin);
        paneLogin.classList.toggle('hidden', !isLogin);
        paneRegister.classList.toggle('hidden', isLogin);
        limparMensagens();
    }
    function limparMensagens() {
        const l = document.getElementById('loginMsg');
        const r = document.getElementById('registerMsg');
        if (l) { l.textContent = ''; l.className = 'modal-msg'; }
        if (r) { r.textContent = ''; r.className = 'modal-msg'; }
    }

    /* Botões de abrir (usa optional chaining para não quebrar se algum faltar) */
    document.getElementById('btnHeaderEntrar')?.addEventListener('click', () => abrirModal('login'));
    document.getElementById('navLogin')?.addEventListener('click', (e) => { e.preventDefault(); abrirModal('login'); });
    document.getElementById('navRegister')?.addEventListener('click', (e) => { e.preventDefault(); abrirModal('register'); });
    document.getElementById('btnHeroComecar')?.addEventListener('click', () => abrirModal('register'));
    document.getElementById('btnHeroLogin')?.addEventListener('click', () => abrirModal('login'));

    /* Fechar */
    document.getElementById('modalClose')?.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });

    /* Tabs */
    tabLogin?.addEventListener('click', () => trocarAba('login'));
    tabRegister?.addEventListener('click', () => trocarAba('register'));

    /* ===== LOGIN ===== */
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('loginMsg');
        const userEl = document.getElementById('loginUser');
        const passEl = document.getElementById('loginPass');

        const username = (userEl?.value || '').trim();
        const password = passEl?.value || '';

        if (!username || !password) {
            if (msg) { msg.textContent = 'Preencha usuário e senha.'; msg.className = 'modal-msg error'; }
            return;
        }

        const conta = validarCredenciais(username, password);

        if (!conta) {
            if (msg) { msg.textContent = 'Usuário ou senha inválidos.'; msg.className = 'modal-msg error'; }
            return;
        }

        salvarSessao({
            id: conta.id ?? Date.now(),
            name: conta.name || nomeDoUsuario(conta) || username,
            plan: conta.plan || 'free',
            avatar: conta.avatar || null
        });

        if (msg) { msg.textContent = 'Entrando...'; msg.className = 'modal-msg success'; }
        setTimeout(() => { window.location.href = 'muhsic.html'; }, 250);
    });

    /* ===== REGISTER ===== */
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const msg = document.getElementById('registerMsg');
        const name  = (document.getElementById('regName').value || '').trim();
        const email = (document.getElementById('regEmail').value || '').trim();
        const pass  = document.getElementById('regPass').value || '';
        const plan  = document.getElementById('regPlan').value || 'free';

        if (!name || !email || !pass) {
            if (msg) { msg.textContent = 'Preencha todos os campos.'; msg.className = 'modal-msg error'; }
            return;
        }
        if (pass.length < 4) {
            if (msg) { msg.textContent = 'A senha precisa ter pelo menos 4 caracteres.'; msg.className = 'modal-msg error'; }
            return;
        }

        const lista = listarTodosUsuarios();
        const alvo = name.toLowerCase();
        const existe = lista.some(u => nomeDoUsuario(u).toLowerCase() === alvo);
        if (existe) {
            if (msg) { msg.textContent = 'Este nome de usuário já está em uso.'; msg.className = 'modal-msg error'; }
            return;
        }

        const novo = {
            id: Date.now(),
            name,
            username: name,
            email,
            password: pass,
            plan,
            avatar: null,
            createdAt: new Date().toISOString()
        };

        const locais = carregarUsuariosLocais();
        locais.push(novo);
        salvarUsuariosLocais(locais);

        salvarSessao({
            id: novo.id,
            name: novo.name,
            plan: novo.plan,
            avatar: novo.avatar
        });

        if (msg) { msg.textContent = 'Conta criada! Entrando...'; msg.className = 'modal-msg success'; }
        setTimeout(() => { window.location.href = 'muhsic.html'; }, 450);
    });
}

/* ============================================================
   BOOT
   ============================================================ */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanding);
} else {
    initLanding();
}