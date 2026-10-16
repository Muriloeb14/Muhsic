// ============================================================
// USUÁRIOS E SISTEMA DE IDs
// ============================================================
const users = [
    { id: 1, name: 'Muh.png', pass: '010918' },
    { id: 2, name: 'Carol', pass: '1234' },
    { id: 3, name: 'Raiany', pass: '1234' }
];

let currentUserId = 1;
let currentUserName = 'Muh.png';

// ============================================================
// LOGIN HANDLER (chamado após o DOM estar pronto - ver script.js)
// ============================================================
function handleLogin() {
    const loginUser = document.getElementById('loginUser');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('app');
    const playerFooter = document.getElementById('playerFooter');
    const loginAnimation = document.getElementById('loginAnimation');

    const user = loginUser.value.trim();
    const pass = loginPassword.value.trim();
    const found = users.find(u => u.name === user && u.pass === pass);

    if (found) {
        currentUserId = found.id;
        currentUserName = found.name;
        loginError.textContent = '';
        loginScreen.classList.add('hidden');
        appContainer.classList.add('active');
        playerFooter.style.display = 'flex';
        document.getElementById('userName').textContent = currentUserName;
        document.getElementById('greetingUser').textContent = currentUserName;
        initApp();

        loginAnimation.classList.add('active');
        void loginAnimation.offsetWidth;
        setTimeout(() => {
            const startSound = new Audio('https://res.cloudinary.com/oizv8icb/video/upload/v1786685196/StartTypo.wav');
            startSound.play().catch(e => console.log('Som não pôde ser reproduzido:', e));
        }, 100);
        setTimeout(() => {
            loginAnimation.classList.remove('active');
        }, 2200);
    } else {
        loginError.textContent = 'Usuário ou senha inválidos. Tente novamente.';
        loginUser.focus();
    }
}

// ============================================================
// LOGOUT HANDLER
// ============================================================
function handleLogout() {
    const appContainer = document.getElementById('app');
    const playerFooter = document.getElementById('playerFooter');
    const loginScreen = document.getElementById('loginScreen');
    const dropdownMenu = document.getElementById('dropdownMenu');

    appContainer.classList.remove('active');
    playerFooter.style.display = 'none';
    loginScreen.classList.remove('hidden');
    fadePause().then(() => { audio.currentTime = 0; });
    dropdownMenu.classList.remove('show');
    state.isPlaying = false;
    currentPlayingSongId = null;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    visualizer.classList.remove('active');
    document.getElementById('playlistDetail').classList.remove('active');
    document.getElementById('page-home').classList.add('active');
    document.querySelector('.nav-menu li[data-page="home"]')?.classList.add('active');
    document.querySelector('.nav-menu li[data-page="search"]')?.classList.remove('active');
    document.querySelector('.nav-menu li[data-page="library"]')?.classList.remove('active');
    updateHighlight();
}