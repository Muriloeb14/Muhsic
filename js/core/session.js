/* ============================================================
   MUHSIC — CORE / SESSION.JS
   Sessão do usuário logado (salva no localStorage).
   ============================================================ */

/** Salva somente os dados necessários (nunca a senha) */
function salvarSessao(user) {
    Store.set(STORAGE_KEYS.session, {
        id:     user.id,
        name:   user.name,
        plan:   user.plan || 'free',
        avatar: user.avatar || null
    });
}

/** Retorna a sessão válida ou null */
function requireSession() {
    const s = Store.get(STORAGE_KEYS.session);
    if (!s || s.id === undefined || s.id === null || !s.name) return null;
    return s;
}

function handleLogout() {
    Store.remove(STORAGE_KEYS.session);
    window.location.replace('index.html');
}
