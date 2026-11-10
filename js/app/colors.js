/* ============================================================
   MUHSIC — APP / COLORS.JS
   ------------------------------------------------------------
   Cor das "pastas" de vinil. A cor é extraída da capa da última
   faixa (média dos pixels via <canvas>). Se a imagem não puder
   ser lida, usa uma das cores fixas abaixo.
   ============================================================ */

/* Paleta retrô usada quando a cor da capa não pode ser lida */
const PASTA_CORES = [
    { classe: 'sleeve-green',  cor: '#2fa39a', corEscura: '#16514c', grad: 'linear-gradient(145deg, #4fc1b6 0%, #2fa39a 45%, #16514c 100%)' },
    { classe: 'sleeve-purple', cor: '#8a4a7a', corEscura: '#44223c', grad: 'linear-gradient(145deg, #b06aa0 0%, #8a4a7a 45%, #44223c 100%)' },
    { classe: 'sleeve-red',    cor: '#c4452c', corEscura: '#5e1f14', grad: 'linear-gradient(145deg, #e0674c 0%, #c4452c 45%, #5e1f14 100%)' },
    { classe: 'sleeve-orange', cor: '#e8702a', corEscura: '#6e3110', grad: 'linear-gradient(145deg, #ff9a52 0%, #e8702a 45%, #6e3110 100%)' },
    { classe: 'sleeve-blue',   cor: '#3a6ea5', corEscura: '#1a3352', grad: 'linear-gradient(145deg, #5b90c8 0%, #3a6ea5 45%, #1a3352 100%)' },
    { classe: 'sleeve-pink',   cor: '#d46a6a', corEscura: '#6a2f2f', grad: 'linear-gradient(145deg, #ee9090 0%, #d46a6a 45%, #6a2f2f 100%)' },
    { classe: 'sleeve-yellow', cor: '#f2b33d', corEscura: '#7a5512', grad: 'linear-gradient(145deg, #ffd27a 0%, #f2b33d 45%, #7a5512 100%)' },
    { classe: 'sleeve-cyan',   cor: '#6f8f4e', corEscura: '#334423', grad: 'linear-gradient(145deg, #93b370 0%, #6f8f4e 45%, #334423 100%)' }
];

/* A coleção "Discos curtidos" tem sempre a mesma cor (tijolo) */
const COR_CURTIDOS = PASTA_CORES[2];

const COR_FALLBACK = '#5e1f14';
const corCache = new Map();

function getCorAleatoria() {
    return pickRandom(PASTA_CORES);
}

/** Lê a cor média de uma imagem (ignora pixels muito claros/escuros) */
function extrairCorDominante(urlImagem) {
    return new Promise((resolve) => {
        if (!urlImagem) return resolve(null);
        if (corCache.has(urlImagem)) return resolve(corCache.get(urlImagem));

        const finalizar = (cor) => { corCache.set(urlImagem, cor); resolve(cor); };
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = 50; canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                const data = ctx.getImageData(0, 0, 50, 50).data;

                let rSoma = 0, gSoma = 0, bSoma = 0, count = 0;
                for (let i = 0; i < data.length; i += 16) {
                    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                    if (a < 100) continue;
                    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                    if (lum < 30 || lum > 230) continue;
                    rSoma += r; gSoma += g; bSoma += b; count++;
                }
                if (count === 0) return finalizar(null);
                finalizar(`rgb(${Math.round(rSoma / count)}, ${Math.round(gSoma / count)}, ${Math.round(bSoma / count)})`);
            } catch (e) {
                finalizar(null);
            }
        };
        img.onerror = () => finalizar(null);
        img.src = urlImagem;
    });
}

function escurecerCor(rgbStr, fator = 0.45) {
    if (!rgbStr) return COR_FALLBACK;
    const match = rgbStr.match(/\d+/g);
    if (!match || match.length < 3) return COR_FALLBACK;
    const [r, g, b] = match.slice(0, 3).map(v => Math.round(parseInt(v, 10) * fator));
    return `rgb(${r}, ${g}, ${b})`;
}

/** Paleta completa da pasta a partir de uma capa */
async function getCorPasta(urlCapa) {
    if (urlCapa === ASSETS.likedCover) return COR_CURTIDOS;
    const corExtraida = await extrairCorDominante(urlCapa);
    if (!corExtraida) return getCorAleatoria();
    return {
        classe: 'sleeve-custom',
        cor: corExtraida,
        corEscura: escurecerCor(corExtraida),
        grad: `linear-gradient(145deg, ${corExtraida} 0%, ${corExtraida}dd 100%)`
    };
}

/** Atributo style="" com as variáveis CSS da pasta (e a capa, se houver) */
function estiloPasta(imagem, pastaCor) {
    const vars = `--pasta-cor: ${pastaCor.cor}; --pasta-cor-escura: ${pastaCor.corEscura}; --pasta-grad: ${pastaCor.grad};`;
    return imagem
        ? `style="background-image: url('${imagem}'); ${vars}"`
        : `style="${vars}"`;
}
