import asyncio
import json
import os
import re
import unicodedata
import edge_tts

VOICE = "pt-BR-FranciscaNeural"
PITCH = "+4Hz"
RATE = "-6%"

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "pt-br")
MANIFEST_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "audioClips.ts")


def slugify(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", ascii_str.lower()).strip("-")


# Exact phrase -> spoken_text_for_tts
PHRASES: dict[str, str] = {
    # Welcome & UI
    "som-ligado": "Som ligado!",
    "lumi-home": "Olá! Eu sou a Lumi! Escolha uma atividade divertida para brincar!",
    "lumi-teste": "Olá! Eu sou a Lumi e vou ler os exercícios com você!",
    "sticker-locked": "Jogue mais atividades para ganhar esta figurinha!",

    # Celebrate & Encourage
    "cel-0": "Muito bem! Você acertou!",
    "cel-1": "Parabéns! Incrível!",
    "cel-2": "Isso mesmo! Você brilhou!",
    "cel-3": "Arrasou! Que esperteza!",
    "enc-0": "Quase lá! Tente de novo!",
    "enc-1": "Você consegue! Vamos tentar mais uma vez!",
    "enc-2": "Ops, tente outra opção!",
    "enc-3": "Muito bem por tentar! Qual será a certa?",

    # Standalone fixed prompts
    "p-contar": "Vamos contar! Quantas figuras aparecem na tela?",
    "p-mais": "Toque no grupo que tem mais figuras!",
    "p-menos": "Toque no grupo que tem menos figuras!",
    "p-sequencia-num": "Qual número está faltando na sequência?",
    "p-encaixe-formas": "Encaixe cada forma no seu lugar! Você pode arrastar ou tocar.",
    "p-padrao-seq": "Observe a sequência! Qual forma vem depois?",
    "p-padrao-obs": "Observe o padrão! Qual forma vem depois?",
    "p-memoria": "Encontre os pares de figuras iguais!",
    "p-sombra": "De qual figura é esta sombra?",
    "p-diferente": "Qual figura é diferente das outras?",
    "p-ordem-tamanhos": "Toque nas figuras do menor para o maior!",
    "p-ordem-numeros": "Toque nos números do menor para o maior!",
    "p-pintura-magica": "Escolha uma cor e toque no desenho para pintar!",
    "p-matriz": "Observe o quadro! Qual figura está faltando?",
    "p-xilofone": "Toque nas teclas coloridas para fazer música!",
    "p-simon-ouca": "Ouça a melodia com atenção!",
    "p-simon-sua-vez": "Agora é a sua vez! Repita a melodia!",
    "p-som-gato": "Quem faz Miau, Miau?",
    "p-som-pato": "Quem faz Quá, Quá?",
    "p-som-sapo": "Quem faz Croac, Croac?",
    "p-som-abelha": "Quem faz Zum, Zum?",
    "p-som-ovelha": "Quem faz Méé, Méé?",
    "p-som-cachorro": "Quem faz Au, Au?",
    "p-som-leao": "Quem ruge forte: Roar!",
    "p-som-passaro": "Quem faz Piu, Piu?",
    "p-som-urso": "Quem faz Grrr, Grrr?",
    "p-grave-agudo-1": "Ouça o som! Ele é grave como o elefante ou agudo como o passarinho?",
    "p-grave-agudo-2": "Ouça com atenção! Esse som é grave ou agudo?",
    "p-cuidar-agua": "A florzinha está com sede! O que ajuda ela a crescer?",
    "p-cuidar-sol": "A árvore precisa de luz e calor! Quem ajuda?",
    "p-cuidar-polen": "Quem ajuda a levar o pólen de flor em flor?",
    "p-cuidar-jardim": "Qual bichinho também mora e cuida do jardim?",

    # Complete composite sentences for Emotions & Routine
    "emo-abraco": "Ganhou um abraço bem apertado! Qual rostinho combina com essa situação?",
    "emo-sorvete": "O sorvete caiu no chão! Qual rostinho combina com essa situação?",
    "emo-presente": "Abriu um presente surpresa! Qual rostinho combina com essa situação?",
    "emo-dormir": "Hora de dormir na caminha! Qual rostinho combina com essa situação?",
    "emo-jardim": "Respirar fundo olhando o jardim! Qual rostinho combina com essa situação?",
    "emo-quebrou": "O brinquedo quebrou sem querer! Qual rostinho combina com essa situação?",
    "emo-parque": "Brincar no parque com os amigos! Qual rostinho combina com essa situação?",
    "emo-amigo": "O amigo foi embora mais cedo! Qual rostinho combina com essa situação?",
    "emo-arcoiris": "Viu um arco-íris gigante no céu! Qual rostinho combina com essa situação?",
    "emo-historia": "Ouvir uma historinha calminha antes de dormir! Qual rostinho combina com essa situação?",

    # Complete composite sentences for Day & Night
    "dn-full-sol": "Sol brilhando! Isso acontece de dia ou de noite?",
    "dn-full-bola": "Brincar com a bola! Isso acontece de dia ou de noite?",
    "dn-full-lua": "Lua no céu! Isso acontece de dia ou de noite?",
    "dn-full-estrela": "Ver as estrelas! Isso acontece de dia ou de noite?",
    "dn-full-flor": "Passear no jardim! Isso acontece de dia ou de noite?",
    "dn-full-arcoiris": "Ver o arco-íris! Isso acontece de dia ou de noite?",
    "dn-full-passaro": "Ouvir os passarinhos! Isso acontece de dia ou de noite?",
    "dn-full-carro": "Andar de carro ao passeio! Isso acontece de dia ou de noite?",
    "dn-full-livro": "Ler historinha na cama! Isso acontece de dia ou de noite?",
    "dn-full-urso": "Dormir com o ursinho! Isso acontece de dia ou de noite?",

    # Complete composite sentences for Habits
    "hab-full-lanche": "Hora do lanchinho saudável! O que usamos para cuidar da nossa saúde?",
    "hab-full-fruta": "Vamos comer uma fruta gostosa! O que usamos para cuidar da nossa saúde?",
    "hab-full-maos": "Lavar as mãos antes de comer! O que usamos para cuidar da nossa saúde?",
    "hab-full-ar-livre": "Brincar ao ar livre faz bem! O que usamos para cuidar da nossa saúde?",
    "hab-full-melancia": "Comer frutas refrescantes no calor! O que usamos para cuidar da nossa saúde?",
    "hab-full-livro": "Aprender e descansar com uma história! O que usamos para cuidar da nossa saúde?",
    "hab-full-uva": "Comer uvas docinhas no lanche! O que usamos para cuidar da nossa saúde?",
    "hab-full-pao": "Tomar café da manhã saudável! O que usamos para cuidar da nossa saúde?",

    # Complete composite sentences for Routine Order
    "rt-manha": "Rotina da Manhã: do começo ao fim! Toque do primeiro ao último passo!",
    "rt-noite": "Rotina da Noite: antes de dormir! Toque do primeiro ao último passo!",
    "rt-flor": "Ciclo da Florzinha no Jardim! Toque do primeiro ao último passo!",
    "rt-passeio": "Dia de Passeio Feliz! Toque do primeiro ao último passo!",

    # Complete composite sentences for Weather
    "cli-full-sol": "Dia de Sol! O que devemos usar neste clima?",
    "cli-full-chuva": "Dia de Chuva! O que devemos usar neste clima?",
    "cli-full-ilha": "Passeio na Ilha! O que devemos usar neste clima?",
    "cli-full-arcoiris": "Dia de Arco-Íris! O que devemos usar neste clima?",
    "cli-full-noite-fresca": "Noite Fresca! O que devemos usar neste clima?",
    "cli-full-nublado": "Dia Nublado! O que devemos usar neste clima?",
    "cli-full-estrelada": "Noite Estrelada! O que devemos usar neste clima?",
}

# Letters A..Z (isolated + full question)
LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
LETTER_TTS = {"E": "É", "O": "Ó", "A": "Á", "I": "Í", "U": "Ú"}
for ch in LETTERS:
    l_low = ch.lower()
    l_spoken = LETTER_TTS.get(ch, ch)
    PHRASES[f"letter-{l_low}"] = l_spoken
    PHRASES[f"q-letra-inicial-{l_low}"] = f"Qual figura começa com a letra {l_spoken}?"

# Numbers 0..15 + full math sentences
for n in range(16):
    PHRASES[f"num-{n}"] = str(n)
    if n >= 1:
        PHRASES[f"ans-sao-{n}"] = f"São {n}!"
        PHRASES[f"ans-o-numero-{n}"] = f"O número {n}!"

for n in range(1, 10):
    PHRASES[f"ans-ficaram-{n}"] = f"Ficaram {n}!"
    PHRASES[f"ans-grupo-mais-{n}"] = f"Esse grupo tem {n}, que é mais!"
    PHRASES[f"ans-grupo-menos-{n}"] = f"Esse grupo tem {n}, que é menos!"

for n in range(1, 9):
    unit = "figura" if n == 1 else "figuras"
    PHRASES[f"q-grupo-tem-{n}"] = f"Toque no grupo que tem {n} {unit}!"

for a in range(1, 5):
    for b in range(1, 5):
        PHRASES[f"q-somar-{a}-{b}"] = f"Vamos somar! Quanto é {a} mais {b}?"
        PHRASES[f"ans-somar-{a}-{b}"] = f"{a} mais {b} é igual a {a + b}!"

for start in range(2, 9):
    for rem in range(1, start):
        PHRASES[f"q-sub-{start}-{rem}"] = f"Tinha {start}, saíram {rem}. Quantos ficaram?"

# Figures (36 items) -> full natural phrases for every figure
FIGURES = [
    ("abelha", "abelha", "A", 3),
    ("elefante", "elefante", "E", 4),
    ("ilha", "ilha", "I", 2),
    ("ovelha", "ovelha", "O", 3),
    ("urso", "urso", "U", 2),
    ("bola", "bola", "B", 2),
    ("casa", "casa", "C", 2),
    ("dado", "dado", "D", 2),
    ("flor", "flor", "F", 1),
    ("gato", "gato", "G", 2),
    ("lua", "lua", "L", 2),
    ("maca", "maçã", "M", 2),
    ("nuvem", "nuvem", "N", 2),
    ("pato", "pato", "P", 2),
    ("sapo", "sapo", "S", 2),
    ("sol", "sol", "S", 1),
    ("peixe", "peixe", "P", 2),
    ("morango", "morango", "M", 3),
    ("banana", "banana", "B", 3),
    ("borboleta", "borboleta", "B", 4),
    ("carro", "carro", "C", 2),
    ("foguete", "foguete", "F", 3),
    ("rato", "rato", "R", 2),
    ("pao", "pão", "P", 1),
    ("mao", "mão", "M", 1),
    ("uva", "uva", "U", 2),
    ("arvore", "árvore", "A", 3),
    ("estrela", "estrela", "E", 3),
    ("cachorro", "cachorro", "C", 3),
    ("leao", "leão", "L", 2),
    ("passaro", "pássaro", "P", 3),
    ("tartaruga", "tartaruga", "T", 4),
    ("aviao", "avião", "A", 3),
    ("livro", "livro", "L", 2),
    ("arcoiris", "arco-íris", "A", 4),
    ("melancia", "melancia", "M", 4),
]

FIG_SPOKEN = {fid: spoken for fid, spoken, _, _ in FIGURES}

for fid, spoken, letter, syl_count in FIGURES:
    letter_spoken = LETTER_TTS.get(letter, letter)
    syl_unit = "sílaba" if syl_count == 1 else "sílabas"
    PHRASES[f"fig-{fid}"] = spoken
    PHRASES[f"q-letra-falta-{fid}"] = f"Qual letra falta na palavra {spoken}?"
    PHRASES[f"q-rima-{fid}"] = f"Qual figura rima com {spoken}?"
    PHRASES[f"q-silabas-{fid}"] = f"Vamos bater palmas! Quantos pedacinhos tem a palavra {spoken}?"
    PHRASES[f"q-silaba-inicial-{fid}"] = f"Com qual pedacinho começa a palavra {spoken}?"
    PHRASES[f"q-montar-{fid}"] = f"Toque nas letras na ordem certa para montar a palavra {spoken}!"
    PHRASES[f"q-combinar-{fid}"] = f"Quem combina com {spoken}?"
    PHRASES[f"q-parece-forma-{fid}"] = f"{spoken} parece com qual forma?"
    PHRASES[f"q-pertence-grupo-{fid}"] = f"{spoken} pertence a qual grupo?"
    PHRASES[f"q-puzzle-{fid}"] = f"Toque em duas peças para trocar e montar: {spoken}!"
    PHRASES[f"ans-montou-{fid}"] = f"Você montou {spoken}!"
    PHRASES[f"ans-par-de-{fid}"] = f"Par de {spoken}!"
    PHRASES[f"q-habitat-{fid}"] = f"Onde este bichinho mora? {spoken}!"
    PHRASES[f"q-onde-{fid}"] = f"Onde encontramos {spoken}?"
    PHRASES[f"ans-letra-de-{fid}"] = f"{letter_spoken} de {spoken}!"
    PHRASES[f"ans-silabas-{fid}"] = f"{spoken} tem {syl_count} {syl_unit}!"
    PHRASES[f"ans-isso-{fid}"] = f"Isso! {spoken}!"

# Rhyme pairs (both directions as complete sentences)
RHYME_PAIRS = [
    ("gato", "pato"),
    ("gato", "rato"),
    ("pato", "rato"),
    ("pao", "mao"),
    ("abelha", "ovelha"),
    ("leao", "aviao"),
    ("leao", "pao"),
    ("leao", "mao"),
    ("aviao", "pao"),
    ("aviao", "mao"),
]
for a, b in RHYME_PAIRS:
    PHRASES[f"ans-rima-{a}-{b}"] = f"{FIG_SPOKEN[a]} rima com {FIG_SPOKEN[b]}!"
    PHRASES[f"ans-rima-{b}-{a}"] = f"{FIG_SPOKEN[b]} rima com {FIG_SPOKEN[a]}!"

# Shapes
SHAPES = [
    ("circulo", "Círculo"),
    ("quadrado", "Quadrado"),
    ("triangulo", "Triângulo"),
    ("estrela", "Estrela"),
    ("coracao", "Coração"),
    ("retangulo", "Retângulo"),
]
for sid, spoken in SHAPES:
    PHRASES[f"shape-{sid}"] = spoken

# Colors & Color Mixes
COLORS = [
    ("vermelho", "vermelho"),
    ("azul", "azul"),
    ("amarelo", "amarelo"),
    ("verde", "verde"),
    ("laranja", "laranja"),
    ("roxo", "roxo"),
]
COLOR_SPOKEN = dict(COLORS)
for cid, spoken in COLORS:
    PHRASES[f"color-{cid}"] = spoken
    PHRASES[f"q-toque-cor-{cid}"] = f"Toque nas figuras da cor {spoken}!"
    PHRASES[f"ans-forma-cor-{cid}"] = f"Forma {spoken}!"

for ca, cb in [("vermelho", "amarelo"), ("azul", "amarelo"), ("vermelho", "azul")]:
    PHRASES[f"q-mistura-{ca}-{cb}"] = (
        f"Qual cor aparece quando misturamos {COLOR_SPOKEN[ca]} com {COLOR_SPOKEN[cb]}?"
    )

# Categories
CATEGORIES = [
    ("animais", "Animais"),
    ("frutas", "Frutas"),
    ("natureza", "Natureza"),
    ("objetos", "Objetos"),
]
for cid, spoken in CATEGORIES:
    PHRASES[f"cat-{cid}"] = spoken
    PHRASES[f"ans-isso-{cid}"] = f"Isso! {spoken}!"

# Tracing templates (full natural sentences)
TRACING_ITEMS = [
    ("linha-reta", "a linha reta"),
    ("ondinha", "a ondinha"),
    ("zigue-zague", "o zigue-zague"),
    ("montanha", "a montanha"),
    ("curva-dupla", "a curva dupla"),
    ("castelo", "o castelo"),
    ("caracol", "o caracol"),
    ("circulo", "o Círculo"),
    ("quadrado", "o Quadrado"),
    ("triangulo", "o Triângulo"),
    ("coracao", "o Coração"),
    ("estrela", "a Estrela"),
    ("retangulo", "o Retângulo"),
    ("diamante", "o Diamante"),
]
for ch in LETTERS:
    l_low = ch.lower()
    l_spoken = LETTER_TTS.get(ch, ch)
    TRACING_ITEMS.append((f"letra-{l_low}", f"a letra {l_spoken}"))
for n in range(10):
    TRACING_ITEMS.append((f"num-{n}", f"o número {n}"))

for tid, spoken_name in TRACING_ITEMS:
    PHRASES[f"q-tracar-{tid}"] = f"Use o dedinho para traçar {spoken_name}!"
    PHRASES[f"ans-desenhou-{tid}"] = f"Você desenhou {spoken_name}!"

# Sticker names (29 items)
STICKERS = [
    ("abelha", "Abelha Zuzu"),
    ("elefante", "Elefante Dudu"),
    ("gato", "Gatinho Mimi"),
    ("sapo", "Sapo Pipoca"),
    ("urso", "Urso Mel"),
    ("borboleta", "Borboleta Lili"),
    ("pato", "Patinho Quá"),
    ("peixe", "Peixe Bolha"),
    ("rato", "Ratinho Tico"),
    ("foguete", "Foguete Turbo"),
    ("lua", "Lua Soneca"),
    ("sol", "Sol Brilhante"),
    ("estrela", "Estrela Guia"),
    ("nuvem", "Nuvem Fofa"),
    ("flor", "Flor Mágica"),
    ("ilha", "Ilha Feliz"),
    ("arvore", "Árvore Viva"),
    ("maca", "Maçã Doce"),
    ("morango", "Moranguinho"),
    ("banana", "Banana Pop"),
    ("uva", "Uva Roxinha"),
    ("carro", "Carrinho Vrum"),
    ("cachorro", "Cachorrinho Au"),
    ("leao", "Leão Juba"),
    ("passaro", "Passarinho Azul"),
    ("tartaruga", "Tartaruga Tina"),
    ("aviao", "Avião Veloz"),
    ("arcoiris", "Arco-íris Vivo"),
    ("melancia", "Melancia Doce"),
]
for sid, spoken in STICKERS:
    PHRASES[f"stk-{sid}"] = spoken


async def synth_one(sem: asyncio.Semaphore, clip_id: str, text: str) -> None:
    out_file = os.path.join(OUT_DIR, f"{clip_id}.mp3")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 100:
        return
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
                await comm.save(out_file)
                return
            except Exception:
                if attempt == 2:
                    raise
                await asyncio.sleep(1.0)


async def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    sem = asyncio.Semaphore(10)
    tasks = [synth_one(sem, cid, text) for cid, text in PHRASES.items()]
    await asyncio.gather(*tasks)

    # Remove orphan .mp3 files that are no longer in PHRASES
    removed = 0
    valid_files = {f"{cid}.mp3" for cid in PHRASES.keys()}
    for fname in os.listdir(OUT_DIR):
        if fname.endswith(".mp3") and fname not in valid_files:
            os.remove(os.path.join(OUT_DIR, fname))
            removed += 1

    # Write TypeScript lookup manifest
    ts_content = (
        "// Auto-generated by scripts/generate_audio.py\n"
        "export const AUDIO_CLIP_IDS = new Set<string>([\n"
        + "".join(f"  {json.dumps(cid)},\n" for cid in sorted(PHRASES.keys()))
        + "]);\n"
    )
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        f.write(ts_content)

    # Write JSON manifest for Service Worker offline pre-caching
    sw_manifest_path = os.path.join(OUT_DIR, "manifest.json")
    audio_urls = [f"/audio/pt-br/{cid}.mp3" for cid in sorted(PHRASES.keys())]
    with open(sw_manifest_path, "w", encoding="utf-8") as f:
        json.dump(audio_urls, f, indent=2)

    print(f"Generated/verified {len(PHRASES)} neural audio clips in {OUT_DIR} (removed {removed} orphans)")


if __name__ == "__main__":
    asyncio.run(main())
