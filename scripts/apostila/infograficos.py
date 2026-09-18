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
    COR, SOFT = "#B36A18", "#FBF1E3"
    W, H = 1200, 862
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', rect(0, 0, W, H, "#ffffff", r=0)]
    # cabeçalho
    s.append(rect(0, 0, W, 8, COR, r=0))
    s.append(t(28, 78, "01", 64, COR, "bold"))
    s.append(eyebrow(140, 36, "Capítulo 1 de 11 · infográfico de abertura", COR))
    s.append(t(140, 66, "O problema da decisão de crédito", 27, NAVY, "bold"))
    s.append(t(140, 90, "O que precisamos saber para decidir?", 15, MUT, style="font-style:italic"))
    s.append(t(W - 28, 60, "Laboratório de Decisão de Crédito · FGV", 11, MUT, anchor="end"))

    # 1. fluxo da decisão
    y0 = 118
    s.append(eyebrow(28, y0, "1 · Uma proposta chega hoje. O desfecho só aparece em doze meses.", NAVY))
    cw, ch, gap, cy = 258, 172, 40, y0 + 14
    cards = [
        ("A proposta", BLUE, ["Helena Braga, autônoma", "Pede R$ 9.000", "", "Renda declarada  R$ 4.200", "Tempo na ocupação  1 ano e 6 meses", "Relacionamento  6 meses"]),
        ("Mais informação", ORANGE, ["O mesmo cliente parece outro:", "", "Utilização do limite  78%", "Maior atraso em 6 meses  22 dias", "Comprometimento de renda  34%", "Consultas a bureau (3 meses)  3"]),
        ("A decisão", NAVY, ["Aprovar, recusar ou encaminhar.", "", "Hoje, sem ver o desfecho.", "Sem números, é preferência", "de risco, não cálculo."]),
        ("O desfecho", AQUA, ["Doze meses depois:", "pagou, ou passou de 90 dias", "de atraso.", "", "Clientes idênticos no que o banco", "vê têm desfechos diferentes."]),
    ]
    for i, (tit, cor, body) in enumerate(cards):
        x = 28 + i * (cw + gap)
        s.append(rect(x, cy, cw, ch, PAPER, RULE))
        s.append(rect(x, cy, cw, 6, cor, r=3))
        s.append(t(x + 14, cy + 34, tit, 15, cor, "bold"))
        s.append(lines(x + 14, cy + 60, body, 11.5, "#1a1a1a", 18))
        if i < 3: s.append(seta(x + cw + 6, cy + ch / 2, x + cw + gap - 6))

    # 2. três números escondidos
    y1 = cy + ch + 40
    s.append(eyebrow(28, y1, "2 · Três números escondidos em toda decisão", NAVY))
    tw, th, ty = 300, 118, y1 + 14
    tiles = [("PD", "probabilidade de default", "A chance de o cliente não pagar dentro do horizonte declarado. É o que o modelo entrega.", BLUE),
             ("LGD", "perda dado o default", "A fração da exposição que se perde quando o default acontece.", ORANGE),
             ("EAD", "exposição no default", "Quanto está em jogo no momento do default: o saldo, não o limite.", AQUA)]
    for i, (sig, nome, desc, cor) in enumerate(tiles):
        x = 28 + i * (tw + 22)
        s.append(rect(x, ty, tw, th, "#ffffff", RULE))
        s.append(rect(x, ty, 8, th, cor, r=4))
        s.append(t(x + 22, ty + 40, sig, 30, cor, "bold"))
        s.append(t(x + 96, ty + 40, nome, 12, MUT))
        # descrição em duas linhas
        s.append(lines(x + 22, ty + 68, quebrar(desc, 44), 11.5, "#1a1a1a", 17))
    # fórmula
    fx = 28 + 3 * (tw + 22)
    s.append(rect(fx, ty, W - 28 - fx, th, SOFT, r=8))
    s.append(t(fx + 16, ty + 32, "Perda esperada", 12, COR, "bold"))
    s.append(t(fx + 16, ty + 62, "PD × LGD × EAD", 20, NAVY, "bold"))
    s.append(lines(fx + 16, ty + 84, ["Só com os três números", "a decisão vira conta,", "não opinião."], 11, MUT, 14))

    # 3. três ideias
    y2 = ty + th + 40
    s.append(eyebrow(28, y2, "3 · O que a PD é, e o que ela não decide", NAVY))
    pw, ph, py = 368, 190, y2 + 14
    # painel A: frequência
    x = 28
    s.append(rect(x, py, pw, ph, PAPER, RULE))
    s.append(t(x + 14, py + 26, "PD é frequência, não veredito", 13.5, NAVY, "bold"))
    defaults = {3, 7, 12, 18, 25, 31, 44, 52, 66, 71, 83, 88, 95, 97}  # 14 em 100, como no sorteio da página 1.5
    for k in range(100):
        r, c = divmod(k, 20)
        cx, cyy = x + 22 + c * 15, py + 48 + r * 15
        s.append(f'<circle cx="{cx}" cy="{cyy}" r="5.2" fill="{ORANGE if k in defaults else "#c9d8f2"}"/>')
    s.append(lines(x + 14, py + 142, ["Cem operações, todas com PD de 10%: esperam-se", "cerca de 10 defaults. Este sorteio deu 14.", "Uma realização não contradiz a PD."], 11, "#1a1a1a", 15))
    # painel B: horizonte
    x = 28 + pw + 20
    s.append(rect(x, py, pw, ph, PAPER, RULE))
    s.append(t(x + 14, py + 26, "O horizonte faz parte da estimativa", 13.5, NAVY, "bold"))
    lx0, lx1, ly = x + 30, x + pw - 30, py + 92
    s.append(f'<line x1="{lx0}" y1="{ly}" x2="{lx1}" y2="{ly}" stroke="{MUT}" stroke-width="2"/>')
    for m in [0, 6, 12, 18, 24]:
        px = lx0 + (lx1 - lx0) * m / 24
        s.append(f'<line x1="{px}" y1="{ly - 5}" x2="{px}" y2="{ly + 5}" stroke="{MUT}" stroke-width="2"/>')
        s.append(t(px, ly + 20, f"M{m}", 10, MUT, anchor="middle"))
    px14 = lx0 + (lx1 - lx0) * 14 / 24
    s.append(f'<circle cx="{px14}" cy="{ly}" r="7" fill="{ORANGE}"/>')
    s.append(t(px14, ly - 14, "90 dias de atraso no mês 14", 10.5, ORANGE, "bold", anchor="middle"))
    px12 = lx0 + (lx1 - lx0) * 12 / 24; px18 = lx0 + (lx1 - lx0) * 18 / 24
    s.append(f'<rect x="{lx0}" y="{ly + 30}" width="{px12 - lx0}" height="12" rx="3" fill="{BLUE}" opacity=".85"/>')
    s.append(t(px12 + 8, ly + 40, "12 meses: não é default", 10.5, BLUE, "bold"))
    s.append(f'<rect x="{lx0}" y="{ly + 48}" width="{px18 - lx0}" height="12" rx="3" fill="{ORANGE}" opacity=".9"/>')
    s.append(t(px18 + 8, ly + 58, "18 meses: default", 10.5, ORANGE, "bold"))
    s.append(lines(x + 14, py + 172, ["A trajetória é a mesma; o rótulo depende da janela declarada."], 10.5, "#1a1a1a", 15))
    # painel C: a previsão não decide sozinha
    x = 28 + 2 * (pw + 20)
    s.append(rect(x, py, pw, ph, PAPER, RULE))
    s.append(t(x + 14, py + 26, "A previsão sozinha não decide", 13.5, NAVY, "bold"))
    s.append(lines(x + 14, py + 46, ["Operação de R$ 10.000: receita de 16% se pagar (R$ 1.600),", "LGD de 62%, custo de R$ 35 por proposta."], 10.5, MUT, 14))
    barras = [("PD 10%", 785, BLUE), ("PD 20,1%", 0, MUT), ("PD 30%", -775, ORANGE)]
    bx0, by0, escala = x + 100, py + 84, 0.13
    for i, (rot, v, cor) in enumerate(barras):
        yy = by0 + i * 24
        s.append(t(bx0 - 8, yy + 12, rot, 11, "#1a1a1a", "bold", anchor="end"))
        wv = max(abs(v) * escala, 4)
        s.append(f'<rect x="{bx0}" y="{yy}" width="{wv}" height="16" rx="3" fill="{cor}"/>')
        s.append(t(bx0 + wv + 6, yy + 12, f"{'+' if v > 0 else '−' if v < 0 else ''}R$ {abs(v)}" + (": ponto de equilíbrio" if v == 0 else " esperados"), 11, cor, "bold"))
    s.append(lines(x + 14, py + 160, ["O limiar (20,1%) vem de receita, LGD, EAD e custo.", "A PD é o que o modelo entrega; a decisão é a conta."], 10.5, "#1a1a1a", 15))

    # rodapé: três perguntas
    y3 = py + ph + 26
    s.append(rect(0, y3, W, H - y3, NAVY, r=0))
    s.append(eyebrow(28, y3 + 28, "Antes de qualquer modelo, três perguntas", "#F2C879"))
    trio = [("Evento", "O que conta como default? Um fato objetivo, observável e definido antes da modelagem."),
            ("Horizonte", "Em quanto tempo? A janela muda o rótulo e, com ele, a PD."),
            ("Uso", "Para qual decisão? Concessão, limite, preço ou provisão pedem ajustes declarados.")]
    for i, (k, v) in enumerate(trio):
        x = 28 + i * 385
        s.append(t(x, y3 + 58, k, 15, "#ffffff", "bold"))
        s.append(lines(x, y3 + 78, quebrar(v, 58), 11, "#dfe6f3", 15))
    s.append("</svg>")
    with open(OUT + "infografico-c1.svg", "w") as f: f.write("\n".join(s))


cap1()
print("infográficos gerados em", OUT)
