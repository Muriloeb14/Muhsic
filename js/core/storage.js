/* ============================================================
   MUHSIC — CORE / STORAGE.JS
   ------------------------------------------------------------
   Camada única de acesso ao localStorage.
   - Serializa/deserializa JSON automaticamente
   - Nunca lança erro (aba anônima, cota cheia, JSON corrompido)

   Se um dia o projeto ganhar um backend, apenas este arquivo
   precisa ser trocado por chamadas à API.
   ============================================================ */

const Store = {

    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('[Store] Falha ao salvar', key, e);
            return false;
        }
    },

    remove(key) {
        try { localStorage.removeItem(key); } catch (e) { /* ignora */ }
    }

};
