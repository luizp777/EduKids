# EduKids — Brincar e Aprender

Aplicativo web educativo (PWA offline-first) para crianças da primeira infância (**3 a 6 anos**), com atividades interativas de **alfabetização**, **matemática**, **formas e cores**, **figuras e lógica** e **coordenação motora (traçado)**.

- **App publicado:** https://edu-kids-pink.vercel.app/
- **Repositório:** https://github.com/luizp777/EduKids

---

## Principais Recursos

- **Faixas Etárias Progressivas:**
  - **Exploradores (3–4 anos):** menos opções por tela, foco em vogais, contagem 1–5, cores, formas básicas, caminhos motores e traçado amplo.
  - **Descobridores (5–6 anos):** alfabeto ampliado, completar palavras, somas/subtrações visuais, sequências numéricas, quebra-cabeça 3×2 e traçado de consoantes e números até 9.
- **Voz Neural Offline em Português (`pt-BR`):**
  - **198 clipes MP3** pré-gerados com `pt-BR-FranciscaNeural` em `public/audio/pt-br/`, montados dinamicamente para enunciados, letras, números, figuras, figurinhas e elogios — zero voz robótica e 100% offline.
  - Efeitos sonoros gentis sintetizados via **Web Audio API**.
- **Gamificação Sem Punição:**
  - Erros não removem vidas; oferecem dica gentil e incentivo falado.
  - Acertos rendem **estrelas**, confete e desbloqueiam **22 figurinhas SVG** no **Álbum de Figurinhas**.
- **Interação Motora Híbrida:**
  - Atividades de encaixe aceitam tanto **arrastar e soltar** (Pointer Events) quanto **toque simples** (selecionar peça → tocar alvo).
- **Perfis Locais e Área dos Pais:**
  - Múltiplos perfis salvos no `localStorage` (`edukids_state_v1`), protegidos por **Parental Gate** (desafio matemático).
  - Painel dos pais com progresso por pilar, gestão de perfis, nível etário e controle de velocidade da leitura (`Devagar`, `Normal`, `Rápida`).

---

## Os 5 Pilares de Atividades

| Pilar | Sub-modos |
| --- | --- |
| **Alfabetização** | Som Inicial, Completar Palavra, Rimas Divertidas, Contar Sílabas |
| **Matemática** | Contar Figuras, Somas Visuais, Comparar (Mais/Menos), Subtração Visual, Sequência Numérica |
| **Formas e Cores** | Encaixar Formas, Caça às Cores, Mistura de Cores, Sequência de Padrões |
| **Figuras e Lógica** | Jogo da Memória, Sombras/Silhuetas, Encontre o Diferente, Separar por Grupo, Quebra-Cabeça (2×2 / 3×2) |
| **Traçado Mágico** | Caminhos Motores (reta, ondinha, zigue-zague), Formas, Letras (`A–Z` principais/vogais) e Números (`0–9`) |

---

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React
- **Áudio:** HTMLAudioElement (MP3s neurais pré-gerados) + Web Audio API + Web Speech API (fallback)
- **PWA:** `public/manifest.webmanifest` + `public/sw.js` (network-first para navegação, pré-cache dos áudios MP3)
- **Testes:** Vitest
- **Deploy:** Vercel (`vercel.json`)

---

## Estrutura do Projeto

```text
public/
  audio/pt-br/       # 198 clipes MP3 neurais + manifest.json para pré-cache
  manifest.webmanifest
  sw.js              # Service Worker offline
scripts/
  generate_audio.py  # Script Edge-TTS para gerar/atualizar os áudios pt-BR
src/
  components/
    activities/      # Os 5 módulos de atividades interativas
    illustrations/   # Mascote Lumi, 28 figuras SVG, formas e avatares
    ui/              # Cabeçalho, celebração/confete e ParentalGateModal
  data/
    catalog.ts       # Catálogo de figuras, cores, formas, figurinhas e traçados
    audioClips.ts    # Manifesto gerado com IDs dos clipes MP3 disponíveis
  pages/             # HomePage, StickerAlbumPage e ParentsDashboardPage
  state/             # AppContext e persistência em localStorage
  types/             # Tipos TypeScript do domínio
  utils/             # audio.ts, gameGenerators.ts, useTimers.ts e testes
```

---

## Como Rodar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Executar testes unitários
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
