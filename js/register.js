/* ============================================================
   MUHSIC — REGISTER.JS
   Lógica de cadastro (só exemplo — NÃO SALVA em banco)
   ------------------------------------------------------------
   Este arquivo é apenas uma demonstração de como seria um
   fluxo de registro. Nenhum dado é persistido.
   ============================================================ */

/**
 * Valida e "cria" uma conta fictícia.
 * Na prática, apenas mostra uma mensagem de sucesso.
 */
function handleRegister() {
    const name  = document.getElementById('registerName').value.trim();
    const pass  = document.getElementById('registerPass').value.trim();
    const pass2 = document.getElementById('registerPass2').value.trim();
    const errEl = document.getElementById('registerError');

    errEl.textContent = '';

    // ---- Validações básicas ----
    if (!name || !pass || !pass2) {
        errEl.textContent = 'Preencha todos os campos.';
        return;
    }
    if (name.length < 3) {
        errEl.textContent = 'O nome precisa ter pelo menos 3 caracteres.';
        return;
    }
    if (pass.length < 4) {
        errEl.textContent = 'A senha precisa ter pelo menos 4 caracteres.';
        return;
    }
    if (pass !== pass2) {
        errEl.textContent = 'As senhas não coincidem.';
        return;
    }

    // ---- Verifica se o nome já existe ----
    const exists = users.some(u => u.login.toLowerCase() === name.toLowerCase());
    if (exists) {
        errEl.textContent = 'Este nome de usuário já está em uso.';
        return;
    }

    // ---- Sucesso (fictício) ----
    errEl.style.color = '#1db954';
    errEl.textContent = 'Conta criada com sucesso! Faça login para continuar.';

    // Limpa os campos
    document.getElementById('registerName').value  = '';
    document.getElementById('registerPass').value  = '';
    document.getElementById('registerPass2').value = '';

    // Espera 1.5s e troca para o modal de login
    setTimeout(() => {
        errEl.style.color = '';
        errEl.textContent = '';
        closeModal('registerModal');
        openModal('loginModal');
    }, 1500);
}

/* ============================================================
   BIND DE EVENTOS (Register)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('registerButton');
    if (btn) btn.addEventListener('click', handleRegister);

    // Enter nos inputs
    ['registerName', 'registerPass', 'registerPass2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); handleRegister(); }
        });
    });
});