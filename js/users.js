/* ============================================================
   MUHSIC — USERS.JS
   Usuários pré-cadastrados do sistema (simulação, sem banco)
   ------------------------------------------------------------
   Estrutura de cada usuário:
       id      → número único (1, 2, 3...)
       name    → nome de exibição
       login   → usuário usado para entrar
       pass    → senha
       plan    → 'free' | 'plus' | 'premium'
       avatar  → URL da imagem (opcional)
   ------------------------------------------------------------
   IMPORTANTE:
   - O ID 0 é RESERVADO para "global" (não é um usuário).
   - Músicas com userIds: [0] aparecem para TODOS.
   ============================================================ */

const users = [

    {
        id: 1,
        login: 'Muh.png',
        pass: '010918',
        name: 'Murilo N.B',
        plan: 'premium',
        avatar: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg'
    },

    {
        id: 2,
        login: 'Raiany',
        pass: '1234',
        name: 'Raiany',
        plan: 'plus',
        avatar: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg'
    },

    {
        id: 3,
        login: 'Carol',
        pass: '1234',
        name: 'Carol',
        plan: 'plus',
        avatar: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg'
    },

    {
        id: 4,
        login: 'Teste',
        pass: '1234',
        name: 'Teste',
        plan: 'free',
        avatar: 'https://res.cloudinary.com/oizv8icb/image/upload/v1786594773/178054037.jpg'
    }

];

/* ============================================================
   CONFIGURAÇÃO DE PLANOS
   ============================================================ */
const plans = {

    free: {
        id: 'free',
        label: 'Muhsic Free',
        icon: '🟢',
        color: '#1db954',
        showAds: true,
        hasThemes: false,
        hasExclusive: false,
        maxUsers: 1
    },

    plus: {
        id: 'plus',
        label: 'Muhsic+',
        icon: '🟡',
        color: '#FFD700',
        showAds: false,
        hasThemes: true,
        hasExclusive: true,
        maxUsers: 2
    },

    premium: {
        id: 'premium',
        label: 'Muhsic Premium',
        icon: '🟣',
        color: '#a020f0',
        showAds: false,
        hasThemes: true,
        hasExclusive: true,
        maxUsers: 4
    }

};

/* ============================================================
   HELPERS DE USUÁRIO
   ============================================================ */

/**
 * Busca um usuário pelo login + senha.
 * Retorna o objeto do usuário ou null.
 */
function findUserByLogin(login, pass) {
    return users.find(u => u.login === login && u.pass === pass) || null;
}

/**
 * Busca um usuário pelo ID.
 */
function findUserById(id) {
    return users.find(u => u.id === id) || null;
}

/**
 * Retorna o objeto de configuração do plano.
 */
function getPlanConfig(planId) {
    return plans[planId] || plans.free;
}