# 🎵 Muhsic

> Player de música com alma de **vitrola dos anos 80**, feito em HTML, CSS e JavaScript puro.
> Projeto acadêmico do grupo **MPS — MapleProjectSeries**.

![Status](https://img.shields.io/badge/status-BETA-orange)
![Versão](https://img.shields.io/badge/versão-0.7-blue)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-orange)
![Dependências](https://img.shields.io/badge/frameworks-nenhum-lightgrey)
![Licença](https://img.shields.io/badge/licença-MPS-red)

---

## 📖 Sobre o projeto

**Muhsic** é um player de música desenvolvido como trabalho de faculdade por
**Murilo N.B**. Em vez de botões tradicionais, a interface é uma **vitrola**:
o disco gira enquanto a música toca, o braço desce sobre o vinil e o usuário
controla tudo com gestos — girar o disco troca de faixa, rolar o mouse muda o
volume e dois cliques curtem a música.

O sistema tem login, três planos de assinatura, temas de cor e músicas
exclusivas por usuário. O "backend" é **simulado**: os dados ficam em arquivos
`.js` e as preferências de cada usuário no `localStorage` do navegador.

### Identidade visual

O Muhsic tem identidade própria, inspirada nos aparelhos de som dos anos 80 e
com cara de **tela de jogo** — nada de cópia de app de streaming:

| Elemento | Como é |
|----------|--------|
| **Paleta** | Café e madeira, com creme, laranja *sunset*, mostarda, tijolo e verde-água (as faixas listradas clássicas da época) |
| **Botões** | Teclas de teclado antigo, bege amarelado, com relevo, legenda no canto, LED de "ligado" e som de clique |
| **Visores** | LCD âmbar com brilho e scanlines (título da música, tempo, busca, formulários) |
| **Tela** | Três painéis com parafusos nos cantos — **rack** de discos, **tela** central e o **toca-discos hi-fi** à direita |
| **Efeitos** | Scanlines de CRT, vinheta, granulado de papel nas capas, VU meter animado |
| **Tipografia** | Bungee (títulos), VT323 (LCD) e Rubik (texto) |

### Objetivos acadêmicos

- Construir uma aplicação completa **sem frameworks**, dominando o DOM, eventos
  e a Web Audio/HTML5 Audio API.
- Aplicar **arquitetura em camadas** (configuração → dados → núcleo → interface)
  em um projeto front-end.
- Explorar animação com `requestAnimationFrame`, transições CSS e leitura de
  pixels com `<canvas>`.

---

## ✨ Funcionalidades

| Área | O que faz |
|------|-----------|
| 🎧 **Toca-discos hi-fi** | Painel direito com prato, braço, visor LCD e VU meter. O disco gira em tempo real, freia ao pausar e o braço desce antes do play |
| 🖱️ **Gestos** | Clique = play/pause · Girar = próxima/anterior · Scroll = volume · Duplo clique = curtir · Botão direito = menu |
| ⌨️ **Teclado da vitrola** | Teclas físicas: anterior, play/pausa, próxima, aleatório, curtir, modo vitrine e volume −/+ com medidor de LEDs |
| 📥 **Arrastar e soltar** | Arraste qualquer disco da prateleira até a vitrola — o prato acende e mostra "SOLTE O DISCO AQUI" |
| 🔀 **Aleatório inteligente** | Sorteia músicas da biblioteca inteira, não só da lista atual |
| 📚 **Fila automática** | Os 3 próximos discos ficam no painel da vitrola; clique em um para tocá-lo |
| 🖥️ **Modo vitrine** | Vitrola grande em tela cheia com a lista "A seguir" (7 discos) |
| 🎨 **Pastas de vinil** | Capas com textura de papel; no hover os discos saem da pasta. A cor vem da capa via `<canvas>` |
| ❤️ **Curtidas** | Curta músicas e álbuns — **salvo por usuário** e mantido após recarregar |
| 🔍 **Busca** | Campo em visor LCD; busca por título, artista, álbum, playlist ou gênero, ignorando acentos |
| 🎨 **7 acabamentos** | Sunset, Papel (claro), Cereja, Cobalto, Vinil, Oliva e Âmbar (salvo por usuário) |
| 💎 **Planos** | Free (com anúncio), Muhsic+ e Premium |
| 🔒 **Conteúdo exclusivo** | Músicas visíveis apenas para usuários específicos |
| ⌨️ **Atalhos** | `Espaço` play/pause · `→` próxima · `←` anterior · `Esc` fecha menus |
| 📱 **Responsivo** | Layout adaptado de 1400px até celulares |

---

## 🚀 Como rodar

### Localmente
1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU-USUARIO/muhsic.git
   ```
2. Abra o `index.html` no navegador — **não precisa instalar nada**.
   (Também funciona com a extensão **Live Server** do VS Code.)

### GitHub Pages
1. Faça o push do projeto.
2. Vá em **Settings → Pages**.
3. Em **Source**, escolha `Deploy from a branch` → `main` → `/ (root)`.
4. Acesse: `https://SEU-USUARIO.github.io/muhsic/`

> ⚠️ É necessário internet para carregar as músicas e capas (Cloudinary),
> os ícones (Font Awesome) e as fontes (Google Fonts — Bungee, VT323 e Rubik).
> Logo, capa de curtidos e carimbo das pastas são SVGs locais em `assets/img/`.

---

## 👥 Usuários de teste

| ID | Login    | Senha   | Nome       | Plano |
|----|----------|---------|------------|-------|
| 1  | Muh.png  | 010918  | Murilo N.B | 🟣 Premium |
| 2  | Raiany   | 1234    | Raiany     | 🟡 Muhsic+ |
| 3  | Carol    | 1234    | Carol      | 🟡 Muhsic+ |
| 4  | Teste    | 1234    | Teste      | 🟢 Free |

> O login não diferencia maiúsculas de minúsculas; a senha diferencia.
> Contas novas podem ser criadas na aba **Novo perfil** (ficam salvas no navegador).

### Roteiro sugerido para apresentação
1. Na landing, role pelas seções (Recursos, Como tocar, Planos, Ficha técnica).
2. Entre como **Teste** (Free) → mostre o "comercial" e os acabamentos bloqueados.
3. Desligue (sair) e entre como **Muh.png** (Premium) → músicas exclusivas aparecem.
4. Abra uma pasta, **puxe um disco e solte na vitrola** — o braço desce e a música começa.
5. Gire o vinil para trocar de faixa, use o scroll (ou VOL −/+) para o volume.
6. Dê duplo clique para curtir → a pasta **Discos curtidos** aparece no rack.
7. Tecla ⤢ (ou botão direito → maximizar) → **modo vitrine** em tela cheia.
8. Menu do perfil → **Acabamento do aparelho** → troque a cor; recarregue — tudo continua salvo.

---

## 💎 Planos

| Plano | Anúncios | Temas | Exclusivas | Usuários |
|-------|:--------:|:-----:|:----------:|:--------:|
| 🟢 **Free**    | ✅ | — | — | 1 |
| 🟡 **Muhsic+** | — | ✅ | ✅ | 2 |
| 🟣 **Premium** | — | ✅ | ✅ | 4 |

Os planos são definidos em um único lugar: [`js/config/plans.js`](js/config/plans.js).

---

## 📁 Estrutura

```
muhsic/
├── index.html              ← Página inicial (apresentação + login/cadastro)
├── muhsic.html             ← Player (app principal)
├── README.md
├── ARQUITETURA.txt         ← Documentação técnica completa
├── CHANGELOG.md            ← Histórico de versões
│
├── assets/img/             ← Logo, capa de curtidos e carimbo (SVG)
│
├── css/
│   ├── site.css            ← Entrada da landing (index.html)
│   ├── app.css             ← Entrada do player (muhsic.html)
│   ├── base/               ← tokens, reset, efeitos CRT, responsivo
│   ├── layout/             ← os 3 painéis: app, rack (sidebar), tela (header)
│   ├── components/         ← teclas, pastas, prateleira, busca, modais, anúncio
│   ├── player/             ← deck hi-fi, toca-discos, fila, overlays, modo vitrine
│   ├── pages/              ← landing e detalhe de pasta
│   └── themes/             ← acabamentos de cor por usuário
│
└── js/
    ├── config/             ← constantes, URLs, parâmetros do player, planos
    ├── data/               ← "banco de dados": users.js e songs.js
    ├── core/               ← regras sem interface: storage, sessão, auth, biblioteca
    ├── pages/              ← landing.js (modal de login/cadastro)
    └── app/                ← player: estado, vitrola, fila, curtidas, eventos
        └── views/          ← renderização das telas
```

A explicação de cada arquivo, o fluxo de dados e o guia para novas
funcionalidades estão em **[ARQUITETURA.txt](ARQUITETURA.txt)**.

---

## 🧠 Sistema de visibilidade (IDs)

Cada música tem um array `userIds` que define quem pode vê-la:

```javascript
userIds: [0]      // global — todos veem
userIds: [0, 1]   // global (o 1 é redundante, mas permitido)
userIds: [1]      // APENAS o usuário 1 (Murilo) vê
userIds: [1, 2]   // exclusiva de Murilo e Raiany
```

| ID | Significado |
|----|-------------|
| `0` | Global (todos os usuários logados) |
| `1` | Murilo N.B |
| `2` | Raiany |
| `3` | Carol |
| `4` | Teste |

Contas criadas pelo formulário recebem um ID único e veem as músicas globais.

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura e `<audio>` |
| **CSS3** | Variáveis, `color-mix()`, grid, flexbox, máscaras, animações, `@import` modular |
| **SVG** | Logo e ilustrações próprias |
| **JavaScript (ES2020)** | Toda a lógica, sem frameworks nem build |
| **Canvas API** | Extração da cor dominante das capas |
| **localStorage** | Sessão, contas criadas, curtidas e tema |
| **Font Awesome 6** | Ícones |
| **Google Fonts** | Bungee, VT323 e Rubik |
| **Cloudinary** | Hospedagem de áudio e imagens |

---

## 🗺️ Próximos passos

- [ ] Curtir playlists e gêneros pela página de detalhe
- [ ] Controle de volume e progresso por toque (celular)
- [ ] Criar playlists personalizadas
- [ ] Backend real (API + banco de dados) substituindo `js/data/` e `core/storage.js`
- [ ] Senhas com hash (hoje ficam em texto puro — aceitável apenas por ser simulação)

---

## 👤 Autor

**Murilo N.B** — MPS (MapleProjectSeries)

---

## 📄 Licença

Copyright © 2026 Muhsic / MPS — Todos os direitos reservados.
Projeto acadêmico, sem fins comerciais.
