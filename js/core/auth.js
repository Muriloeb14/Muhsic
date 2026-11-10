/* ============================================================
   MUHSIC — CORE / AUTH.JS
   ------------------------------------------------------------
   Regras de autenticação e cadastro (sem interface).
   Usuários vêm de duas fontes:
     1. js/data/users.js      → contas pré-cadastradas
     2. localStorage          → contas criadas pelo formulário

   Todas as contas são normalizadas para o mesmo formato:
     { id, login, pass, name, email, plan, avatar }
   ============================================================ */

/**
 * Converte qualquer formato salvo para o formato padrão.
 * (Versões antigas salvavam "username/password".)
 */
function normalizarUsuario(u) {
    if (!u || typeof u !== 'object') return null;
    const login = String(u.login || u.username || u.name || '').trim();
    if (!login) return null;
    return {
        id:     u.id ?? Date.now(),
        login,
        pass:   String(u.pass || u.password || ''),
        name:   u.name || login,
        email:  u.email || null,
        plan:   PLANS[u.plan] ? u.plan : 'free',
        avatar: u.avatar || null
    };
}

function carregarUsuariosLocais() {
    const lista = Store.get(STORAGE_KEYS.users, []);
    return Array.isArray(lista) ? lista : [];
}

function salvarUsuariosLocais(lista) {
    Store.set(STORAGE_KEYS.users, lista);
}

/** Contas base + locais (uma conta local nunca sobrescreve uma base) */
function listarTodosUsuarios() {
    const mapa = new Map();
    [...carregarUsuariosLocais(), ...users].forEach(raw => {
        const u = normalizarUsuario(raw);
        if (u) mapa.set(u.login.toLowerCase(), u);
    });
    return [...mapa.values()];
}

function usuarioExiste(login) {
    const alvo = String(login).trim().toLowerCase();
    return listarTodosUsuarios().some(u => u.login.toLowerCase() === alvo);
}

/** Login não diferencia maiúsculas; senha diferencia. */
function validarCredenciais(login, senha) {
    const alvo = String(login).trim().toLowerCase();
    return listarTodosUsuarios().find(u =>
        u.login.toLowerCase() === alvo && u.pass === senha
    ) || null;
}

/**
 * Cria uma conta local.
 * @returns {{ ok: boolean, erro?: string, usuario?: object }}
 */
function registrarUsuario({ name, email, pass, plan }) {
    name  = String(name || '').trim();
    email = String(email || '').trim();

    if (!name || !email || !pass)  return { ok: false, erro: 'Preencha todos os campos.' };
    if (pass.length < 4)           return { ok: false, erro: 'A senha precisa ter pelo menos 4 caracteres.' };
    if (usuarioExiste(name))       return { ok: false, erro: 'Este nome de usuário já está em uso.' };

    const novo = {
        id:        Date.now(),
        login:     name,
        pass,
        name,
        email,
        plan:      PLANS[plan] ? plan : 'free',
        avatar:    null,
        createdAt: new Date().toISOString()
    };

    const locais = carregarUsuariosLocais();
    locais.push(novo);
    salvarUsuariosLocais(locais);

    return { ok: true, usuario: novo };
}
