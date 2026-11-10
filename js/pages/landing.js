/* ============================================================
   MUHSIC — PAGES / LANDING.JS
   ------------------------------------------------------------
   Interface da página inicial (index.html):
   modal com abas "Entrar" e "Criar conta".
   As regras de negócio ficam em core/auth.js.
   ============================================================ */

function initLanding() {
    const modal = $('authModal');
    if (!modal) return;

    renderVersionBadges();

    const tabLogin     = $('tabLogin');
    const tabRegister  = $('tabRegister');
    const paneLogin    = $('paneLogin');
    const paneRegister = $('paneRegister');

    /* ---------- Helpers de UI ---------- */
    function mostrarMensagem(id, texto, tipo) {
        const el = $(id);
        if (!el) return;
        el.textContent = texto;
        el.className = `modal-msg${tipo ? ' ' + tipo : ''}`;
    }

    function limparMensagens() {
        mostrarMensagem('loginMsg', '');
        mostrarMensagem('registerMsg', '');
    }

    function trocarAba(aba) {
        const isLogin = aba === 'login';
        tabLogin.classList.toggle('active', isLogin);
        tabRegister.classList.toggle('active', !isLogin);
        paneLogin.classList.toggle('hidden', !isLogin);
        paneRegister.classList.toggle('hidden', isLogin);
        limparMensagens();
    }

    function abrirModal(aba = 'login') {
        modal.classList.add('active');
        trocarAba(aba);
        setTimeout(() => $(aba === 'login' ? 'loginUser' : 'regName')?.focus(), 50);
    }

    function fecharModal() {
        modal.classList.remove('active');
        limparMensagens();
    }

    function entrarNoApp(usuario, mensagem, atraso) {
        salvarSessao(usuario);
        mostrarMensagem(mensagem.alvo, mensagem.texto, 'success');
        setTimeout(() => { window.location.href = 'muhsic.html'; }, atraso);
    }

    /* ---------- Abrir / fechar ---------- */
    $('btnHeaderEntrar')?.addEventListener('click', () => abrirModal('login'));
    $('navLogin')?.addEventListener('click', (e) => { e.preventDefault(); abrirModal('login'); });
    $('navRegister')?.addEventListener('click', (e) => { e.preventDefault(); abrirModal('register'); });
    $('btnHeroComecar')?.addEventListener('click', () => abrirModal('register'));
    $('btnHeroLogin')?.addEventListener('click', () => abrirModal('login'));

    /* Qualquer botão com data-auth="login|register" abre o modal */
    document.querySelectorAll('[data-auth]').forEach(btn => {
        btn.addEventListener('click', () => abrirModal(btn.dataset.auth));
    });

    /* Cards de plano: abrem o cadastro com o plano já selecionado */
    document.querySelectorAll('[data-plan]').forEach(btn => {
        btn.addEventListener('click', () => {
            abrirModal('register');
            const select = $('regPlan');
            if (select && PLANS[btn.dataset.plan]) select.value = btn.dataset.plan;
            $('regName')?.focus();
        });
    });

    $('modalClose')?.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });

    tabLogin?.addEventListener('click', () => trocarAba('login'));
    tabRegister?.addEventListener('click', () => trocarAba('register'));

    /* ---------- Login ---------- */
    $('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = ($('loginUser')?.value || '').trim();
        const senha = $('loginPass')?.value || '';

        if (!login || !senha) {
            mostrarMensagem('loginMsg', 'Preencha usuário e senha.', 'error');
            return;
        }

        const conta = validarCredenciais(login, senha);
        if (!conta) {
            mostrarMensagem('loginMsg', 'Usuário ou senha inválidos.', 'error');
            return;
        }

        entrarNoApp(conta, { alvo: 'loginMsg', texto: 'Entrando...' }, 250);
    });

    /* ---------- Cadastro ---------- */
    $('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const resultado = registrarUsuario({
            name:  $('regName')?.value,
            email: $('regEmail')?.value,
            pass:  $('regPass')?.value || '',
            plan:  $('regPlan')?.value || 'free'
        });

        if (!resultado.ok) {
            mostrarMensagem('registerMsg', resultado.erro, 'error');
            return;
        }

        entrarNoApp(resultado.usuario, { alvo: 'registerMsg', texto: 'Conta criada! Entrando...' }, 450);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanding);
} else {
    initLanding();
}
