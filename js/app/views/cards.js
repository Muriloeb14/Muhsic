/* ============================================================
   MUHSIC — APP / VIEWS / CARDS.JS
   ------------------------------------------------------------
   Geradores de HTML das "pastas de vinil":
     - card grande (tela Início)
     - item compacto (barra lateral)
   ============================================================ */

/** Coleção especial "Discos curtidos"? */
function isColecaoCurtidas(type, name) {
    return type === 'liked' && name === LIKED_COLLECTION;
}

/** Imagem da pasta: capa personalizada ou a capa da última faixa */
function capaDaColecao(tracks, customCover) {
    const ultima = tracks[tracks.length - 1];
    return customCover || ultima?.coverImage || null;
}

/** Card grande da tela Início */
async function createCardHTMLAsync(name, tracks, type, customCover) {
    const nome = escapeHTML(name);
    const meta = `${tracks.length} discos · ${getTotalDuration(tracks)}`;

    if (isColecaoCurtidas(type, name)) {
        return `
            <div class="pasta-card pasta-card-curtidas" data-type="${type}" data-name="${nome}">
                <div class="pasta-cover">
                    <img class="curtidas-cover-full" src="${ASSETS.likedCover}" alt="Discos Curtidos">
                </div>
                <div class="pasta-info">
                    <h3>${nome}</h3>
                    <p>${meta}</p>
                </div>
            </div>
        `;
    }

    /* Até 4 discos "saindo" da pasta no hover */
    const qtd = Math.min(4, Math.max(1, tracks.length));
    const discosHTML = tracks.slice(-qtd).map(t => {
        const img = t.coverImage
            ? `<img src="${t.coverImage}" alt="${escapeHTML(t.title)}">`
            : `<div class="placeholder">${escapeHTML(t.title.charAt(0))}</div>`;
        return `<div class="pasta-vinyl"><div class="pasta-vinyl-label">${img}</div></div>`;
    }).join('');

    const imagem   = capaDaColecao(tracks, customCover);
    const pastaCor = await getCorPasta(imagem);

    return `
        <div class="pasta-card" data-type="${type}" data-name="${nome}">
            <div class="pasta-cover">
                <div class="pasta-vinyls" data-count="${qtd}">${discosHTML}</div>
                <div class="pasta-sleeve ${pastaCor.classe}${imagem ? ' has-image' : ''}" ${estiloPasta(imagem, pastaCor)}>
                    <div class="sleeve-tint"></div>
                    <div class="sleeve-shine"></div>
                    <div class="pasta-logo"><img src="${ASSETS.folderLogo}" alt="MFADE"></div>
                </div>
            </div>
            <div class="pasta-info">
                <h3>${nome}</h3>
                <p>${meta}</p>
            </div>
        </div>
    `;
}

/** Item compacto da barra lateral */
async function createSidebarItemAsync(name, tracks, type, customCover) {
    const nome = escapeHTML(name);

    if (isColecaoCurtidas(type, name)) {
        return `
            <div class="pasta-item-sidebar" data-type="${type}" data-name="${nome}">
                <div class="pasta-mini pasta-mini-curtidas"><img src="${ASSETS.likedCover}" alt="Curtidos"></div>
                <span>${nome}</span>
            </div>
        `;
    }

    const imagem   = capaDaColecao(tracks, customCover);
    const pastaCor = await getCorPasta(imagem);

    return `
        <div class="pasta-item-sidebar" data-type="${type}" data-name="${nome}">
            <div class="pasta-mini ${pastaCor.classe}${imagem ? ' has-image' : ''}" ${estiloPasta(imagem, pastaCor)}>
                <div class="mini-tint"></div>
                <div class="mini-shine"></div>
                <div class="mini-logo"><img src="${ASSETS.folderLogo}" alt="MFADE"></div>
            </div>
            <span>${nome}</span>
        </div>
    `;
}

/** Liga o clique de cada pasta à abertura do detalhe */
function bindAbrirDetalhe(container, selector) {
    container.querySelectorAll(selector).forEach(el => {
        el.addEventListener('click', () => openDetail(el.dataset.type, el.dataset.name));
    });
}
