# Changelog

Todas as mudanças relevantes do Muhsic são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [0.7] — 2026-11-10 · Identidade "Hi-Fi anos 80"

### Visual (nova identidade)
- O verde e cinza no estilo Spotify deram lugar a uma paleta própria dos anos 80:
  café, madeira, creme, laranja *sunset*, mostarda, tijolo e verde-água.
- Todos os botões viraram **teclas de teclado antigo** (bege amarelado, com relevo,
  legenda no canto, LED de "ligado" e som de clique) — `components/keycaps.css`.
- Visores **LCD âmbar** para título da música, tempo, busca, formulários e selos.
- Efeitos de "tela de jogo": scanlines de CRT, vinheta e granulado (`base/effects.css`).
- Logo, capa de curtidos e carimbo das capas refeitos em SVG (`assets/img/`).
- Fontes Bungee (títulos), VT323 (LCD) e Rubik (texto).

### Landing page
- Refeita como "tela título" de jogo e apresentação completa do produto:
  hero com vitrola ilustrada animada, letreiro de LCD, recursos, "Como tocar"
  (passos e tabela de controles), "Selecione seu plano" com valores fictícios,
  ficha técnica e chamada final.
- Modal de login/cadastro virou a janela "Seleção de perfil".
- Os cards de plano abrem o cadastro com o plano já selecionado.

### App (pós-login)
- Novo layout de 3 painéis: **rack** de discos, **tela** central e um
  **toca-discos hi-fi** completo no lado direito, que agora é o player.
- O toca-discos tem prato com marcas estroboscópicas, braço com contrapeso,
  visor LCD com VU meter, fila clicável, teclado de controle e medidor de volume.
- A mecânica de **arrastar o disco até a vitrola** continua; agora o prato pulsa
  e mostra "SOLTE O DISCO AQUI" durante o arraste.
- Pastas com textura de papel e faixa sunset; prateleira de madeira com etiquetas.
- "Modo maximizado" virou **modo vitrine** em tela cheia, com botão de fechar.
- Temas renomeados para "acabamentos": Sunset, Papel, Cereja, Cobalto, Vinil,
  Oliva e Âmbar. O tema Papel (claro) foi refeito.
- Celular: o rack vira barra superior e a vitrola uma faixa compacta embaixo.

### Corrigido
- Botão "anterior" logo após avançar pela fila não voltava para a faixa
  anterior (a faixa nova ia para o histórico). Problema existente desde a 0.5.

## [0.6] — 2026-11-10

### Reestruturado
- O CSS saiu de um arquivo único de 2.639 linhas (`style.css`) para 20 módulos
  organizados em `base/`, `layout/`, `components/`, `player/`, `pages/` e `themes/`,
  carregados por `css/app.css` na mesma ordem de cascata de antes.
- O JavaScript saiu de um `script.js` de 1.687 linhas para módulos em camadas:
  `config/`, `data/`, `core/`, `pages/` e `app/` (com `app/views/`).
- Configurações centralizadas em `js/config/app.config.js`: versão, chaves do
  localStorage, URLs de mídia e parâmetros do player.
- Planos definidos em um único lugar (`js/config/plans.js`).
- Acesso ao localStorage centralizado no objeto `Store` (`js/core/storage.js`).
- Regras de login e cadastro separadas da interface (`js/core/auth.js`).

### Corrigido
- A troca de tema não funcionava: `applyTheme()` e `loadTheme()` eram chamadas
  mas não existiam. Agora o tema é aplicado e salvo por usuário.
- `getPlanConfig()` estava definida duas vezes com cores diferentes.
- Nomes de usuário inseridos via `innerHTML` agora são escapados (`escapeHTML`).
- Uma falha em qualquer etapa da inicialização aparece no console em vez de ser
  silenciada.

### Adicionado
- As curtidas (músicas e álbuns) são salvas por usuário e permanecem após
  recarregar a página.
- O selo de versão (`BETA 0.6`) é preenchido a partir de `APP.version`.
- `ARQUITETURA.txt` com a documentação técnica completa.
- `.editorconfig`, `.gitattributes` e `.gitignore`.

### Removido
- `js/register.js`: não era carregado por nenhuma página.
- Cópia duplicada do código de cadastro que estava no final de `musics.js`.
- Uso de `eval()` na leitura dos usuários.
- Variáveis e funções sem uso (`shuffleQueue`, `DBLCLICK_DELAY`, `clickTimeout`,
  `findUserById`, `getSongOrigin`).

### Renomeado
| Antes | Depois |
|-------|--------|
| `js/musics.js` | `js/data/songs.js` |
| `js/users.js` | `js/data/users.js` |
| `js/login.js` | `js/core/session.js` + `js/core/auth.js` + `js/pages/landing.js` |
| `js/script.js` | `js/app/*.js` |
| `css/style.css` | `css/app.css` + módulos |
| `css/landing.css` | `css/pages/landing.css` |
| `css/perso.css` | `css/themes/themes.css` |

## [0.5] — Identidade de vinil
- Vitrola animada, fila em pilha, painel maximizado e pastas de vinil.
- Login, planos, músicas exclusivas por usuário e busca sem acentos.
