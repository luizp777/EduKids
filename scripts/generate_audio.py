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


# Exact phrase -> (filename, spoken_text_for_tts)
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

    # Connectors
    "isso": "Isso!",
    "par-de": "Par de",
    "de": "de",
    "mais": "mais",
    "igual-a": "é igual a",
    "sao": "São",
    "ficaram": "Ficaram",
    "o-numero": "O número",
    "com": "com",
    "rima-com": "rima com",
    "tem": "tem",
    "silaba": "sílaba!",
    "silabas": "sílabas!",
    "forma": "Forma",
    "esse-grupo-tem": "Esse grupo tem",
    "que-e-mais": "que é mais!",
    "que-e-menos": "que é menos!",
    "sairam": "saíram.",
    "quantos-ficaram": "Quantos ficaram?",
    "pertence-grupo": "pertence a qual grupo?",
    "voce-desenhou": "Você desenhou",
    "voce-montou": "Você montou",

    # Prompts
    "p-letra-inicial": "Qual figura começa com a letra",
    "p-letra-falta": "Qual letra falta na palavra",
    "p-rima": "Qual figura rima com",
    "p-silabas": "Vamos bater palmas! Quantos pedacinhos tem a palavra",
    "p-contar": "Vamos contar! Quantas figuras aparecem na tela?",
    "p-somar": "Vamos somar! Quanto é",
    "p-mais": "Toque no grupo que tem mais figuras!",
    "p-menos": "Toque no grupo que tem menos figuras!",
    "p-tinha": "Tinha",
    "p-sequencia-num": "Qual número está faltando na sequência?",
    "p-encaixe-formas": "Encaixe cada forma no seu lugar! Você pode arrastar ou tocar.",
    "p-toque-cor": "Toque nas figuras da cor",
    "p-mistura-cores": "Qual cor aparece quando misturamos",
    "p-padrao-seq": "Observe a sequência! Qual forma vem depois?",
    "p-padrao-obs": "Observe o padrão! Qual forma vem depois?",
    "p-memoria": "Encontre os pares de figuras iguais!",
    "p-sombra": "De qual figura é esta sombra?",
    "p-diferente": "Qual figura é diferente das outras?",
    "p-puzzle": "Toque em duas peças para trocar e montar",
    "p-tracar": "Use o dedinho para traçar",

    # New v2 prompts
    "p-montar-palavra": "Toque nas letras na ordem certa para montar a palavra",
    "p-ordem-tamanhos": "Toque nas figuras do menor para o maior!",
    "p-ordem-numeros": "Toque nos números do menor para o maior!",
    "p-pintura-magica": "Escolha uma cor e toque no desenho para pintar!",
    "p-combinar": "Quem combina com",
    "p-xilofone": "Toque nas teclas coloridas para fazer música!",
    "p-simon-ouca": "Ouça a melodia com atenção!",
    "p-simon-sua-vez": "Agora é a sua vez! Repita a melodia!",
    "p-som-gato": "Quem faz Miau, Miau?",
    "p-som-pato": "Quem faz Quá, Quá?",
    "p-som-sapo": "Quem faz Croac, Croac?",
    "p-som-abelha": "Quem faz Zum, Zum?",
    "p-som-ovelha": "Quem faz Méé, Méé?",
    "p-emocao": "Qual rostinho combina com essa situação?",
    "p-dia-noite": "Isso acontece de dia ou de noite?",
    "p-habitos": "O que usamos para cuidar da nossa saúde?",
    "p-habitat": "Onde este bichinho mora?",
    "p-clima": "O que devemos usar neste clima?",

    # New v3 prompts
    "p-silaba-inicial": "Com qual pedacinho começa a palavra",
    "p-grupo-tem": "Toque no grupo que tem",
    "p-parece-forma": "parece com qual forma?",
    "p-matriz": "Observe o quadro! Qual figura está faltando?",
    "p-som-cachorro": "Quem faz Au, Au?",
    "p-som-leao": "Quem ruge forte: Roar!",
    "p-som-passaro": "Quem faz Piu, Piu?",
    "p-som-urso": "Quem faz Grrr, Grrr?",
    "p-grave-agudo": "Ouça o som! Ele é grave como o elefante ou agudo como o passarinho?",
    "p-onde-encontramos": "Onde encontramos",
    "p-cuidar-agua": "A florzinha está com sede! O que ajuda ela a crescer?",
    "p-cuidar-sol": "A árvore precisa de luz e calor! Quem ajuda?",
    "p-cuidar-polen": "Quem ajuda a levar o pólen de flor em flor?",
    "p-cuidar-jardim": "Qual bichinho também mora e cuida do jardim?",

    # Situations & items for pre-readers
    "sit-abraco": "Ganhou um abraço bem apertado!",
    "sit-sorvete": "O sorvete caiu no chão!",
    "sit-presente": "Abriu um presente surpresa!",
    "sit-dormir": "Hora de dormir na caminha!",
    "dn-sol": "Sol brilhando!",
    "dn-bola": "Brincar com a bola!",
    "dn-lua": "Lua no céu!",
    "dn-estrela": "Ver as estrelas!",
    "dn-flor": "Passear no jardim!",
    "hab-lanche": "Hora do lanchinho saudável!",
    "hab-fruta": "Vamos comer uma fruta gostosa!",
    "hab-maos": "Lavar as mãos antes de comer!",
    "hab-ar-livre": "Brincar ao ar livre faz bem!",
    "cli-sol": "Dia de Sol!",
    "cli-chuva": "Dia de Chuva!",
    "cli-ilha": "Passeio na Ilha!",

    # Tracing template spoken names
    "tr-linha-reta": "a linha reta!",
    "tr-ondinha": "a ondinha!",
    "tr-zigue-zague": "o zigue-zague!",
    "tr-circulo": "o Círculo!",
    "tr-quadrado": "o Quadrado!",
    "tr-triangulo": "o Triângulo!",
    "tr-coracao": "o Coração!",
    "tr-estrela": "a Estrela!",
    "tr-montanha": "a montanha!",
    "tr-curva-dupla": "a curva dupla!",
    "tr-castelo": "o castelo!",
    "tr-caracol": "o caracol!",
    "tr-retangulo": "o Retângulo!",
    "tr-diamante": "o Diamante!",
}

# Letters
LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
LETTER_TTS = {"E": "É", "O": "Ó", "A": "Á", "I": "Í", "U": "Ú"}
for ch in LETTERS:
    PHRASES[f"letter-{ch.lower()}"] = LETTER_TTS.get(ch, ch)
    PHRASES[f"tr-letra-{ch.lower()}"] = f"a letra {LETTER_TTS.get(ch, ch)}!"

# Numbers 0..15
for n in range(16):
    PHRASES[f"num-{n}"] = str(n)
    if n <= 9:
        PHRASES[f"tr-num-{n}"] = f"o número {n}!"

# Figures
FIGURES = [
    ("abelha", "abelha"),
    ("elefante", "elefante"),
    ("ilha", "ilha"),
    ("ovelha", "ovelha"),
    ("urso", "urso"),
    ("bola", "bola"),
    ("casa", "casa"),
    ("dado", "dado"),
    ("flor", "flor"),
    ("gato", "gato"),
    ("lua", "lua"),
    ("maca", "maçã"),
    ("nuvem", "nuvem"),
    ("pato", "pato"),
    ("sapo", "sapo"),
    ("sol", "sol"),
    ("peixe", "peixe"),
    ("morango", "morango"),
    ("banana", "banana"),
    ("borboleta", "borboleta"),
    ("carro", "carro"),
    ("foguete", "foguete"),
    ("rato", "rato"),
    ("pao", "pão"),
    ("mao", "mão"),
    ("uva", "uva"),
    ("arvore", "árvore"),
    ("estrela", "estrela"),
    ("cachorro", "cachorro"),
    ("leao", "leão"),
    ("passaro", "pássaro"),
    ("tartaruga", "tartaruga"),
    ("aviao", "avião"),
    ("livro", "livro"),
    ("arcoiris", "arco-íris"),
    ("melancia", "melancia"),
]
for fid, spoken in FIGURES:
    PHRASES[f"fig-{fid}"] = spoken

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

# Colors
COLORS = [
    ("vermelho", "vermelho"),
    ("azul", "azul"),
    ("amarelo", "amarelo"),
    ("verde", "verde"),
    ("laranja", "laranja"),
    ("roxo", "roxo"),
]
for cid, spoken in COLORS:
    PHRASES[f"color-{cid}"] = spoken

# Categories
CATEGORIES = [
    ("animais", "Animais"),
    ("frutas", "Frutas"),
    ("natureza", "Natureza"),
    ("objetos", "Objetos"),
]
for cid, spoken in CATEGORIES:
    PHRASES[f"cat-{cid}"] = spoken

# Sticker names
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
    sem = asyncio.Semaphore(6)
    tasks = [synth_one(sem, cid, text) for cid, text in PHRASES.items()]
    await asyncio.gather(*tasks)

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

    print(f"Generated {len(PHRASES)} audio clips in {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
