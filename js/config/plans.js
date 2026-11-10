/* ============================================================
   MUHSIC — CONFIG / PLANS.JS
   ------------------------------------------------------------
   Fonte ÚNICA da verdade sobre os planos de assinatura.
   Para criar um plano novo, adicione uma entrada aqui e use
   o "id" dela no campo "plan" do usuário.
   ============================================================ */

const PLANS = {

    free: {
        id: 'free',
        label: 'Free',
        icon: '🟢',
        color: '#2fa39a',
        showAds: true,
        hasThemes: false,
        hasExclusive: false,
        maxUsers: 1
    },

    plus: {
        id: 'plus',
        label: 'Muhsic+',
        icon: '🟡',
        color: '#f2b33d',
        showAds: false,
        hasThemes: true,
        hasExclusive: true,
        maxUsers: 2
    },

    premium: {
        id: 'premium',
        label: 'Premium',
        icon: '🟣',
        color: '#c77dba',
        showAds: false,
        hasThemes: true,
        hasExclusive: true,
        maxUsers: 4
    }

};

/**
 * Retorna a configuração de um plano.
 * Planos desconhecidos caem no Free.
 */
function getPlanConfig(planId) {
    return PLANS[planId] || PLANS.free;
}
