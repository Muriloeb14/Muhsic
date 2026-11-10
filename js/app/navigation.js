/* ============================================================
   MUHSIC — APP / NAVIGATION.JS
   Menu lateral, voltar, menu do usuário, busca e atalhos.
   ============================================================ */

function bindNavEvents() {
    const navItems = document.querySelectorAll('.nav-menu li');
    const pages = { home: $('page-home'), search: $('page-search'), library: $('page-library') };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (!page || !pages[page]) return;

            navItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            Object.values(pages).forEach(p => p && p.classList.remove('active'));
            pages[page].classList.add('active');
            $('playlistDetail')?.classList.remove('active');

            if (page === 'search')  renderSearchResults(getVisibleSongs(currentUserId));
            if (page === 'library') renderLibrary();
            setTimeout(updateHighlight, 50);
        });
    });

    $('backToHome')?.addEventListener('click', () => {
        $('playlistDetail')?.classList.remove('active');
        $('page-home')?.classList.add('active');
        state.currentItem = null;
        state.currentItemName = null;
        setTimeout(updateHighlight, 50);
    });
}

function bindUserMenu() {
    const up = $('userProfile');
    const dm = $('dropdownMenu');
    if (!up || !dm) return;

    up.addEventListener('click', e => { e.stopPropagation(); dm.classList.toggle('show'); });
    document.addEventListener('click', () => dm.classList.remove('show'));
    $('logoutBtn')?.addEventListener('click', e => { e.stopPropagation(); handleLogout(); });
}

function bindSearch() {
    const input = $('searchInput');
    if (!input) return;

    const mostrarTudo = () => renderSearchResults(getVisibleSongs(currentUserId));

    input.addEventListener('focus', () => {
        if (!input.value.trim()) mostrarTudo();
    });

    input.addEventListener('input', () => {
        const q = input.value.trim();
        clearTimeout(searchTimeout);
        if (!q) { mostrarTudo(); return; }
        searchTimeout = setTimeout(() => {
            renderSearchResults(searchSongs(getVisibleSongs(currentUserId), q));
        }, PLAYER.searchDebounceMs);
    });
}

/** Espaço = play/pause · → próxima · ← anterior */
function bindKeyboard() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;
        if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowRight') { e.preventDefault(); nextTrack(); }
        if (e.code === 'ArrowLeft')  { e.preventDefault(); prevTrack(); }
    });
}
