"""Infográficos de abertura dos capítulos (SVG desenhado à mão, sem dependências).

Uso: python3 scripts/apostila/infograficos.py   (APOSTILA_DIR define onde fica fig/; padrão tmp/apostila)
Saída: fig/infografico-cN.svg, usado pelo gerador na capa do capítulo quando existir.
Todos os números vêm do conteúdo do capítulo (extract.json) ou da figura conceitual já validada.
"""
import os

OUT = os.path.join(os.environ.get("APOSTILA_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../tmp/apostila")), "fig") + "/"
os.makedirs(OUT, exist_ok=True)

NAVY, MUT, PAPER, RULE = "#00205B", "#52514e", "#f5f4f0", "#dedbd2"
BLUE, ORANGE, AQUA = "#2a78d6", "#eb6834", "#1baf7a"
FONT = "DejaVu Sans, Arial, sans-serif"


def esc(s): return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def t(x, y, s, size=13, fill="#1a1a1a", weight="normal", anchor="start", style=""):
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}" style="{style}">{esc(s)}</text>'
def lines(x, y, items, size=12, fill="#1a1a1a", dy=17, weight="normal"):
    return "".join(t(x, y + i * dy, s, size, fill, weight) for i, s in enumerate(items))
def rect(x, y, w, h, fill, stroke="none", r=8, sw=1): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def quebrar(texto, largura):
    ls, atual = [], ""
    for w in texto.split():
        if atual and len(atual + " " + w) > largura: ls.append(atual); atual = w
        else: atual = (atual + " " + w).strip()
    if atual: ls.append(atual)
    return ls
def eyebrow(x, y, s, fill): return t(x, y, s.upper(), 10.5, fill, "bold", style="letter-spacing:1.5px")
def seta(x1, y, x2, cor=MUT): return f'<line x1="{x1}" y1="{y}" x2="{x2 - 8}" y2="{y}" stroke="{cor}" stroke-width="2"/><polygon points="{x2},{y} {x2 - 10},{y - 5} {x2 - 10},{y + 5}" fill="{cor}"/>'


def cap1():
    """Retrato (860 × 1030) para ocupar a capa inteira do capítulo em A4 com texto legível."""
    COR, SOFT = "#B36A18", "#FBF1E3"
    W, H = 860, 1052
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', rect(0, 0, W, H, "#ffffff", r=0)]
    # cabeçalho
    s.append(rect(0, 0, W, 8, COR, r=0))
    s.append(t(24, 72, "01", 58, COR, "bold"))
    s.append(eyebrow(122, 36, "Capítulo 1 de 11 · infográfico de abertura", COR))
    s.append(t(122, 64, "O problema da decisão de crédito", 24, NAVY, "bold"))
    s.append(t(122, 86, "O que precisamos saber para decidir?", 13.5, MUT, style="font-style:italic"))

    # 1. fluxo da decisão: quatro cartões em 2 × 2
    y0 = 118
    s.append(eyebrow(24, y0, "1 · Uma proposta chega hoje. O desfecho só aparece em doze meses.", NAVY))
    cw, ch, gx, gy, cy = 402, 128, 8, 8, y0 + 12
    cards = [
        ("A proposta", BLUE, ["Helena Braga, autônoma, pede R$ 9.000.", "Renda declarada R$ 4.200 · tempo na ocupação 1 ano", "e 6 meses · relacionamento 6 meses."]),
        ("Mais informação", ORANGE, ["O mesmo cliente parece outro: utilização do limite", "78%, maior atraso em 6 meses 22 dias, comprometimento", "de renda 34%, 3 consultas a bureau em 3 meses."]),
        ("A decisão", NAVY, ["Aprovar, recusar ou encaminhar, hoje, sem ver o", "desfecho. Sem números, é preferência de risco,", "não cálculo."]),
        ("O desfecho", AQUA, ["Doze meses depois: pagou, ou passou de 90 dias de", "atraso. Clientes idênticos no que o banco vê têm", "desfechos diferentes."]),
    ]
    for i, (tit, cor, body) in enumerate(cards):
        x = 24 + (i % 2) * (cw + gx); y = cy + (i // 2) * (ch + gy)
        s.append(rect(x, y, cw, ch, PAPER, RULE)); s.append(rect(x, y, 6, ch, cor, r=3))
        s.append(t(x + 18, y + 30, f"{i + 1}. {tit}", 14, cor, "bold"))
        s.append(lines(x + 18, y + 56, body, 11.5, "#1a1a1a", 18))
    s.append(seta(24 + cw + 1, cy + ch / 2, 24 + cw + gx - 1)); s.append(seta(24 + cw + 1, cy + ch + gy + ch / 2, 24 + cw + gx - 1))

    # 2. três números escondidos
    y1 = cy + 2 * ch + gy + 34
    s.append(eyebrow(24, y1, "2 · Três números escondidos em toda decisão", NAVY))
    tw, th, ty = 268, 96, y1 + 12
    tiles = [("PD", "probabilidade de default", "A chance de o cliente não pagar dentro do horizonte declarado. É o que o modelo entrega.", BLUE),
             ("LGD", "perda dado o default", "A fração da exposição que se perde quando o default acontece.", ORANGE),
             ("EAD", "exposição no default", "Quanto está em jogo no momento do default: o saldo, não o limite.", AQUA)]
    for i, (sig, nome, desc, cor) in enumerate(tiles):
        x = 24 + i * (tw + 4)
        s.append(rect(x, ty, tw, th, "#ffffff", RULE)); s.append(rect(x, ty, 7, th, cor, r=3))
        s.append(t(x + 20, ty + 34, sig, 26, cor, "bold")); s.append(t(x + 88 if sig != "EAD" else x + 92, ty + 34, nome, 11, MUT))
        s.append(lines(x + 20, ty + 58, quebrar(desc, 40), 11, "#1a1a1a", 15))
    fy = ty + th + 8
    s.append(rect(24, fy, W - 48, 44, SOFT, r=8))
    s.append(t(40, fy + 28, "Perda esperada = PD × LGD × EAD", 17, NAVY, "bold"))
    s.append(t(W - 40, fy + 28, "Só com os três números a decisão vira conta, não opinião.", 11.5, COR, "bold", anchor="end"))

    # 3. o que a PD é e o que ela não decide
    y2 = fy + 44 + 34
    s.append(eyebrow(24, y2, "3 · O que a PD é, e o que ela não decide", NAVY))
    pw, ph, py = 402, 168, y2 + 12
    x = 24
    s.append(rect(x, py, pw, ph, PAPER, RULE)); s.append(t(x + 16, py + 26, "PD é frequência, não veredito", 13.5, NAVY, "bold"))
    defaults = {3, 7, 12, 18, 25, 31, 44, 52, 66, 71, 83, 88, 95, 97}  # 14 em 100, como no sorteio da página 1.5
    for k in range(100):
        r, c = divmod(k, 25)
        s.append(f'<circle cx="{x + 24 + c * 14.6}" cy="{py + 48 + r * 15}" r="5" fill="{ORANGE if k in defaults else "#c9d8f2"}"/>')
    s.append(lines(x + 16, py + 120, ["Cem operações, todas com PD de 10%: esperam-se cerca de", "10 defaults. Este sorteio deu 14. Uma realização não", "contradiz a PD; ela é uma frequência com incerteza de amostra."], 10.5, "#1a1a1a", 15))
    x = 24 + pw + 8
    s.append(rect(x, py, pw, ph, PAPER, RULE)); s.append(t(x + 16, py + 26, "O horizonte faz parte da estimativa", 13.5, NAVY, "bold"))
    lx0, lx1, ly = x + 30, x + pw - 120, py + 78
    s.append(f'<line x1="{lx0}" y1="{ly}" x2="{lx1}" y2="{ly}" stroke="{MUT}" stroke-width="2"/>')
    for m in [0, 6, 12, 18, 24]:
        px = lx0 + (lx1 - lx0) * m / 24
        s.append(f'<line x1="{px}" y1="{ly - 5}" x2="{px}" y2="{ly + 5}" stroke="{MUT}" stroke-width="2"/>'); s.append(t(px, ly + 18, f"M{m}", 9.5, MUT, anchor="middle"))
    px14 = lx0 + (lx1 - lx0) * 14 / 24; px12 = lx0 + (lx1 - lx0) * 12 / 24; px18 = lx0 + (lx1 - lx0) * 18 / 24
    s.append(f'<circle cx="{px14}" cy="{ly}" r="6.5" fill="{ORANGE}"/>'); s.append(t(px14, ly - 13, "90 dias de atraso no mês 14", 10, ORANGE, "bold", anchor="middle"))
    s.append(f'<rect x="{lx0}" y="{ly + 28}" width="{px12 - lx0}" height="11" rx="3" fill="{BLUE}" opacity=".85"/>'); s.append(t(px12 + 8, ly + 37, "12 meses: não é default", 10, BLUE, "bold"))
    s.append(f'<rect x="{lx0}" y="{ly + 45}" width="{px18 - lx0}" height="11" rx="3" fill="{ORANGE}" opacity=".9"/>'); s.append(t(px18 + 8, ly + 54, "18 meses: default", 10, ORANGE, "bold"))
    s.append(lines(x + 16, py + 150, ["A trajetória é a mesma; o rótulo depende da janela declarada."], 10.5, "#1a1a1a", 15))
    # painel largo: a previsão sozinha não decide
    py2 = py + ph + 8; ph2 = 112
    s.append(rect(24, py2, W - 48, ph2, PAPER, RULE)); s.append(t(40, py2 + 26, "A previsão sozinha não decide", 13.5, NAVY, "bold"))
    s.append(lines(40, py2 + 46, quebrar("Operação de R$ 10.000: receita de 16% se pagar (R$ 1.600), LGD de 62%, custo de R$ 35 por proposta. O limiar econômico (20,1%) vem de receita, LGD, EAD e custo. A PD é o que o modelo entrega; a decisão é a conta.", 78), 10.5, "#1a1a1a", 15))
    barras = [("PD 10%", 785, BLUE), ("PD 20,1%", 0, MUT), ("PD 30%", -775, ORANGE)]
    bx0, by0, escala = 640, py2 + 20, 0.1
    for i, (rot, v, cor) in enumerate(barras):
        yy = by0 + i * 26
        s.append(t(bx0 - 8, yy + 12, rot, 11, "#1a1a1a", "bold", anchor="end")); wv = max(abs(v) * escala, 4)
        s.append(f'<rect x="{bx0}" y="{yy}" width="{wv}" height="16" rx="3" fill="{cor}"/>')
        s.append(t(bx0 + wv + 6, yy + 12, f"{'+' if v > 0 else '−' if v < 0 else ''}R$ {abs(v)}" + (": equilíbrio" if v == 0 else ""), 11, cor, "bold"))

    # rodapé: três perguntas
    y3 = py2 + ph2 + 20
    s.append(rect(0, y3, W, H - y3, NAVY, r=0))
    s.append(eyebrow(24, y3 + 26, "Antes de qualquer modelo, três perguntas", "#F2C879"))
    trio = [("Evento", "O que conta como default? Um fato objetivo, observável e definido antes da modelagem."),
            ("Horizonte", "Em quanto tempo? A janela muda o rótulo e, com ele, a PD."),
            ("Uso", "Para qual decisão? Concessão, limite, preço ou provisão pedem ajustes declarados.")]
    for i, (k, v) in enumerate(trio):
        x = 24 + i * 276
        s.append(t(x, y3 + 54, k, 14, "#ffffff", "bold")); s.append(lines(x, y3 + 72, quebrar(v, 46), 10.5, "#dfe6f3", 14))
    s.append("</svg>")
    with open(OUT + "infografico-c1.svg", "w") as f: f.write("\n".join(s))


cap1()
print("infográficos gerados em", OUT)
