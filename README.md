# 🎵 Muhsic

> Player de música web inspirado no Spotify — feito em HTML, CSS e JavaScript puro.
> Projeto acadêmico do grupo **MPS — MapleProjectSeries**.

![Status](https://img.shields.io/badge/status-BETA%200.5-green)
![Versão](https://img.shields.io/badge/versão-0.5-blue)
![Licença](https://img.shields.io/badge/licença-MPS-red)

---

## 📖 Sobre

**Muhsic** é um player de música fictício desenvolvido como trabalho de faculdade
por **Murilo N.B**. Possui sistema de login, planos, temas personalizados e
conteúdo exclusivo por usuário.

Todo o backend é **simulado** — os dados ficam em arquivos `.js` (`users.js`,
`musics.js`) sem uso de banco de dados real.

---

## 🚀 Como rodar

### Localmente
1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/muhsic.git
   ```
2. Abra o `index.html` no navegador (ou use **Live Server** no VSCode).

### GitHub Pages
1. Faça o push do projeto.
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha `Deploy from a branch` → `main` → `/ (root)`.
4. Acesse: `https://SEU-USUARIO.github.io/muhsic/`

> ⚠️ É necessário internet para carregar as músicas (Cloudinary),
> ícones (Font Awesome) e fontes (Google Fonts).

---

## 📁 Estrutura

```
muhsic/
├── index.html            ← Landing page (apresentação + login/register)
├── muhsic.html           ← App principal (player, sidebar, biblioteca)
├── README.md
│
├── css/
│   ├── style.css         ← Design geral (app + player)
│   ├── landing.css       ← Estilos exclusivos da landing
│   └── perso.css         ← Temas personalizados por usuário
│
└── js/
    ├── users.js          ← Usuários pré-cadastrados
    ├── musics.js         ← Banco de músicas
    ├── register.js       ← Cadastro (fictício)
    ├── login.js          ← Login + sessão + temas
    └── script.js         ← Player + renderização do app
```

---

## 👥 Usuários de teste

| ID | Login    | Senha   | Nome       | Plano    |
|----|----------|---------|------------|----------|
| 1  | Muh.png  | 010918  | Murilo N.B | 🟣 Premium |
| 2  | Raiany   | 1234    | Raiany     | 🟡 Muhsic+ |
| 3  | Carol    | 1234    | Carol      | 🟡 Muhsic+ |
| 4  | Teste    | 1234    | Teste      | 🟢 Free  |

---

## 💎 Planos

| Plano | Benefícios |
|-------|-----------|
| 🟢 **Free** | Player básico, anúncios fictícios, 1 usuário |
| 🟡 **Muhsic+** | Sem anúncios, temas personalizados, músicas exclusivas, até 2 usuários |
| 🟣 **Premium** | Tudo do +, download offline, qualidade máxima, até 4 usuários |

---

## ✨ Funcionalidades

- 🔐 Login com validação e sessão via `localStorage`
- 🎨 7 temas de cor (padrão, claro, vermelho, azul, roxo, verde, laranja)
- 🎧 Player com fade-in/fade-out, shuffle, próxima, anterior e reset
- 🎚️ Barra de progresso arrastável + controle de volume
- 📂 Navegação por Gêneros, Álbuns Salvos, Playlists e Biblioteca
- ❤️ Curtir músicas, álbuns e gêneros
- 🔍 Busca com normalização de acentos
- 📢 Banner de anúncio fictício (apenas plano Free)
- 🎬 Visualizador de áudio animado
- 📱 Layout 100% responsivo
- 🔒 Sistema de IDs: músicas globais (ID 0) + exclusivas por usuário

---

## 🧠 Sistema de IDs

Cada música tem um array `userIds`:

```javascript
userIds: [0]      // global — todos veem
userIds: [0, 1]   // global + Murilo
userIds: [1]      // APENAS Murilo
```

- `0` = global (todos os usuários logados)
- `1` = Murilo N.B
- `2` = Raiany
- `3` = Carol
- `4` = Teste

---

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis, grid, flexbox, animações)
- JavaScript (ES6+, sem frameworks)
- Font Awesome (ícones)
- Google Fonts (Roboto)
- Cloudinary (hospedagem de áudio e imagens)

---

## 👤 Autor

**Murilo N.B** — MPS (MapleProjectSeries)

---

## 📄 Licença

Copyright © 2026 Muhsic / MPS — Todos os direitos reservados.
Projeto acadêmico, sem fins comerciais.