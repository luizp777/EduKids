# EduKids — Brincar e Aprender

Aplicativo web educativo (PWA offline-first) para crianças da primeira infância (**3 a 6 anos**), com atividades interativas de **alfabetização**, **matemática**, **formas e cores**, **figuras e lógica**, **coordenação motora**, **música e sons**, **emoções e rotina**, **natureza e habitats**, **idiomas (Inglês e Espanhol)** e **hora da história**.

- **App publicado:** https://edu-kids-pink.vercel.app/
- **Repositório:** https://github.com/luizp777/EduKids

---

## Principais Recursos

- **Faixas Etárias Progressivas e Dificuldade Adaptativa (Desafio Estrela):**
  - **Exploradores (3–4 anos):** menos opções por tela, foco em vogais, contagem 1–5, tamanhos, cores, formas básicas, caminhos motores e traçado amplo.
  - **Descobridores (5–6 anos):** alfabeto ampliado, completar e montar palavras, sílaba inicial, somas/subtrações visuais, sequências e ordem crescente, matriz lógica, quebra-cabeça 3×2 e traçado de consoantes e números até 9.
  - **Modo Desafio Estrela:** ao conquistar medalha **Prata** ou **Ouro** (3+ rodadas concluídas em qualquer um dos 10 pilares), o nível expande progressivamente os desafios e concede +1 estrela bônus por rodada, além de sugerir gentilmente a transição para 5–6 anos quando a criança demonstra domínio consolidado.
- **Voz Neural Offline e Áudio Normalizado (`pt-BR`, `en-US` e `es-MX`):**
  - **1.367 clipes MP3 neurais** pré-gerados com `pt-BR-FranciscaNeural` (português), `en-US-AnaNeural` (inglês nativo infantil) e `es-MX-DaliaNeural` (espanhol nativo) em `public/audio/pt-br/`, garantindo prosódia natural contínua e **zero vozes robóticas** (sem dependência de `speechSynthesis`).
  - **Barramento Mestre Normalizado:** compressor dinâmico (`DynamicsCompressorNode`) e ganho mestre (`MasterGainNode`) via **Web Audio API**, mantendo leitura de texto, notas musicais do xilofone, discriminação grave/agudo, sons sintetizados dos animais, tambor de ritmo e efeitos sonoros sempre equilibrados no mesmo volume selecionado, com calibragem de velocidade por faixa etária.
- **Design Responsivo, Acessibilidade, Modo Calmo e Ergonomia Infantil:**
  - Layout adaptado para smartphones, tablets (retrato e paisagem) e laptops: jogos ajustados à tela visível (`100dvh`), abas horizontais roláveis com `snap-x` e centralização automática no celular, e divisão lado a lado em telas largas.
  - **Autonomia para pré-leitores:** pílulas de seleção com ilustrações SVG em Contos, Músicas e Pintura Mágica; contraste reforçado (WCAG) nos cartões da Home; rótulos e indicadores de seleção para daltonismo; destaque sequencial (karaokê) de sílabas no Álbum.
  - **Acessibilidade completa:** foco preso (`useModalFocusTrap`) em todos os modais, traçado acessível por teclado (`Enter`/`Space`) no Traçado Mágico, botão de **Dica Gentil (Lâmpada)** no cabeçalho, **Modo Calmo / Sensorial** (sem afetar `position: fixed`) e suporte a `prefers-reduced-motion`.
- **Gamificação Sem Punição, Figurinhas Douradas e Acessórios da Lumi:**
  - Erros não removem vidas; oferecem dica gentil, expressão acolhedora da mascote Lumi e incentivo falado.
  - Acertos rendem **estrelas**, confete e desbloqueiam **36 figurinhas SVG** no **Álbum de Figurinhas** (com evolução para **Figurinhas Douradas Brilhantes** após completar o álbum).
  - Marcos de estrelas desbloqueiam **6 acessórios visuais para a Lumi** e **8 troféus no Mural de Conquistas**, além da **Galeria de Pinturas Mágicas**.
- **Interação Motora Híbrida:**
  - Atividades de encaixe e traçado aceitam **arrastar e soltar** (Pointer Events), **toque simples** e **navegação/interação por teclado**.
- **Perfis Locais, Tempo de Tela, Resiliência e Área dos Pais:**
  - Múltiplos perfis salvos no `localStorage` (`edukids_state_v1`), com troca rápida de perfil/faixa etária na tela inicial, ofensiva de **dias seguidos brincando (Streak)**, `ErrorBoundary` resiliente com a Lumi, carregamento *lazy* dos 10 pilares com prefetch da *Aventura do Dia* e **Parental Gate** (desafio matemático) para configurações avançadas.
  - Painel dos pais com progresso por pilar, histórico recente, confirmações inline (sem `window.confirm`), **Temporizador Gentil ("Hora da Pausa com a Lumi")**, **Download Offline Total em 1 Clique com cancelamento (`AbortController`)**, backup/restauração JSON validado, velocidade da leitura (`Devagar`, `Normal`, `Rápida`) e **Volume Geral** sincronizado (`Baixo`, `Médio`, `Alto` + slider).

---

## Os 10 Pilares de Atividades

| Pilar | Sub-modos |
| --- | --- |
| **Alfabetização** | Som Inicial, Caça às Vogais, Completar Palavra, Rimas Divertidas (10 pares), Contar Sílabas, Sílaba Inicial, Letra Final, Montar a Palavra |
| **Matemática** | Contar Figuras, Somas Visuais, Comparar (Mais/Menos), Subtração Visual, Sequência Numérica, Ordem e Tamanhos, Quantidades, Dividir Igualmente (2 Amigos), Vizinhos (Antes e Depois) |
| **Formas e Cores** | Encaixar Formas, Caça às Cores, Mistura de Cores, Sequência de Padrões, Formas no Mundo, Pintura Mágica (10 desenhos + Salvar no Álbum) |
| **Figuras e Lógica** | Jogo da Memória, Sombras/Silhuetas, Encontre o Diferente, Separar por Grupo, Intruso da Categoria, Quebra-Cabeça (2×2 / 3×2), Combinar Pares Lógicos (14 pares), Matriz Lógica (2×2) |
| **Traçado Mágico** | Caminhos Motores (linha, ondinha, zigue-zague, montanha, curva dupla, castelo, caracol), Formas (incluindo retângulo e diamante), Letras (alfabeto completo `A–Z`, 26 letras) e Números (`0–9`) |
| **Música e Sons** | Xilofone Mágico (8 músicas guiadas), Melodia (Simon), Sons dos Bichos (9 animais com síntese acústica), Grave ou Agudo, Ritmo (Tambor) |
| **Emoções e Rotina** | Emoções/Sentimentos (6 emoções, 10 situações), Dia e Noite (10 itens), Hábitos Saudáveis (8 situações), Ordem da Rotina, Ajudar Amigo (Empatia) |
| **Natureza e Habitats** | Onde o Bichinho Mora (13 animais), Clima e Roupas (7 cenários com ícones), Cuidar da Natureza, Terra, Água ou Céu, Cuidar do Parque |
| **Idiomas (EN / ES)** | Vocabulário (36 figuras), Cores (6 cores), Números (`1–5` / `1–10`), Cumprimentos (6 expressões), Frases Curtas (Listening), Explorar (Cartões de Descoberta com voz nativa) |
| **Hora da História** | Contos da Lumi (4 histórias ilustradas página a página), Perguntas de Compreensão, Começo-Meio-Fim (Sequência Narrativa), Fábrica de Histórias (criação interativa narrada) |

---

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React
- **Áudio:** HTMLAudioElement (1.367 MP3s neurais contínuos em pt-BR, en-US e es-MX com pré-carregamento em fila) + Web Audio API (Master Compressor/Gain + SFX + Xilofone + Grave/Agudo + Sons Sintetizados de Animais + Tambor)
- **PWA:** `public/manifest.webmanifest` + `public/sw.js` (`edukids-cache-v5`, network-first para navegação/manifestos, cache offline de Google Fonts, pré-cache essencial de UI/elogios + download offline total sob demanda)
- **Testes:** Vitest
- **Deploy:** Vercel (`vercel.json`)

---

## Estrutura do Projeto

```text
public/
  audio/pt-br/       # 1.367 clipes MP3 neurais (PT, EN e ES) + manifest.json
  manifest.webmanifest
  sw.js              # Service Worker offline (edukids-cache-v5)
scripts/
  generate_audio.py  # Script Edge-TTS para gerar/atualizar os áudios PT/EN/ES
src/
  components/
    activities/      # Os 10 módulos de atividades interativas
    illustrations/   # Mascote Lumi (com 6 acessórios), 36 figuras SVG, formas e avatares
    ui/              # ActivityHeader, LumiPromptBanner, CelebrationModal, ScreenTimeBreakModal, ParentalGateModal, ErrorBoundary e ActivityLoadingFallback
  data/
    catalog.ts       # Catálogo de figuras, rimas, cores, formas, 36 figurinhas, 10 desenhos e traçados A-Z
    languagesCatalog.ts # Traduções EN/ES das 36 figuras, 6 cores, números 1–10, 6 cumprimentos e 6 frases curtas
    storiesCatalog.ts   # Contos ilustrados, perguntas de compreensão, sequências e Fábrica de Histórias
    audioClips.ts    # Manifesto gerado com IDs dos clipes MP3 disponíveis
  pages/             # HomePage, StickerAlbumPage e ParentsDashboardPage
  state/             # AppContext e persistência em localStorage
  types/             # Tipos TypeScript do domínio
  utils/             # audio.ts, gameGenerators.ts, useTimers.ts, useActivityFeedback.ts, useModalFocusTrap.ts, activityLoaders.ts, swCache.ts e testes unitários
```

---

## Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Executar verificação de lint (ESLint)
npm run lint

# Executar testes unitários (Vitest)
npm test

# Gerar build de produção (pasta dist/)
npm run build
```

### Regenerar Áudios Neurais (opcional)
Caso adicione novas palavras ou enunciados em `scripts/generate_audio.py`:

```bash
python3 -m venv .venv-tts
.venv-tts/bin/pip install edge-tts
.venv-tts/bin/python scripts/generate_audio.py
```
