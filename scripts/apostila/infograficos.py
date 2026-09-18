"""Infográficos de abertura dos capítulos: SVG em retrato (860 × 1052) para a capa de cada capítulo da apostila.

Conteúdo: scripts/apostila/infograficos/cNN.json (uma fonte para a capa impressa e para os slides FGV).
Uso: python3 scripts/apostila/infograficos.py [capítulos ex.: 1,4]   (APOSTILA_DIR define onde fica fig/; padrão tmp/apostila)
Saída: fig/infografico-cN.svg, usado pelo gerador da apostila quando existir.
Tipos de painel: pontos (grade de 100), tempo (linha do tempo com janelas), barras (horizontais), kv (linhas chave e valor), lista (marcadores).
"""
import json, os, sys, glob

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.environ.get("APOSTILA_DIR", os.path.join(AQUI, "../../tmp/apostila")), "fig") + "/"
os.makedirs(OUT, exist_ok=True)

NAVY, MUT, PAPER, RULE = "#00205B", "#52514e", "#f5f4f0", "#dedbd2"
COR = {"steel": "#2a78d6", "orange": "#eb6834", "green": "#1baf7a", "navy": "#00205B", "red": "#c40002", "mute": "#52514e", "sky": "#c9d8f2", "gold": "#F2C879"}
FONT = "DejaVu Sans, Arial, sans-serif"
TEMAS = json.load(open(os.path.join(AQUI, "../../content/generated/extract.json")))["meta"]["temas"]


def esc(s): return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def t(x, y, s, size=13, fill="#1a1a1a", weight="normal", anchor="start", style=""):
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}" style="{style}">{esc(s)}</text>'
def lines(x, y, items, size=12, fill="#1a1a1a", dy=17, weight="normal"):
    return "".join(t(x, y + i * dy, s, size, fill, weight) for i, s in enumerate(items))
def rect(x, y, w, h, fill, stroke="none", r=8, sw=1): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def quebrar(texto, largura):
    ls, atual = [], ""
    for w in str(texto).split():
        if atual and len(atual + " " + w) > largura: ls.append(atual); atual = w
        else: atual = (atual + " " + w).strip()
    if atual: ls.append(atual)
    return ls
def eyebrow(x, y, s, fill): return t(x, y, s.upper(), 10.5, fill, "bold", style="letter-spacing:1.5px")
def seta(x1, y, x2, cor=MUT): return f'<line x1="{x1}" y1="{y}" x2="{x2 - 8}" y2="{y}" stroke="{cor}" stroke-width="2"/><polygon points="{x2},{y} {x2 - 10},{y - 5} {x2 - 10},{y + 5}" fill="{cor}"/>'
def tam_sigla(s): n = len(s); return 26 if n <= 4 else 21 if n <= 7 else 17 if n <= 10 else 14


def painel(s, p, x, y, pw, ph):
    """Um painel de evidência. Largura de quebra proporcional à largura do painel (≈ 6,5 px por caractere a 10,5 px)."""
    s.append(rect(x, y, pw, ph, PAPER, RULE)); s.append(t(x + 16, y + 26, p["titulo"], 13.5, NAVY, "bold"))
    tipo = p["tipo"]; larg = int((pw - 40) / 6.3)
    if tipo == "pontos":
        defaults = set(p["defaults"]); cols = p["cols"]
        for k in range(p["n"]):
            r, c = divmod(k, cols)
            s.append(f'<circle cx="{x + 24 + c * 14.6}" cy="{y + 48 + r * 15}" r="5" fill="{COR["orange"] if k in defaults else COR["sky"]}"/>')
        s.append(lines(x + 16, y + 118, quebrar(p["legenda"], larg), 10.5, "#1a1a1a", 15))
    elif tipo == "tempo":
        s.append(lines(x + 16, y + 44, quebrar(p["legenda"], larg), 10, MUT, 13))
        lx0, lx1, ly = x + 30, x + pw - 120, y + 92; meses = p["meses"]; fim = meses[-1]
        px = lambda m: lx0 + (lx1 - lx0) * m / fim
        s.append(f'<line x1="{lx0}" y1="{ly}" x2="{lx1}" y2="{ly}" stroke="{MUT}" stroke-width="2"/>')
        for m in meses:
            s.append(f'<line x1="{px(m)}" y1="{ly - 5}" x2="{px(m)}" y2="{ly + 5}" stroke="{MUT}" stroke-width="2"/>'); s.append(t(px(m), ly + 18, f"M{m}", 9.5, MUT, anchor="middle"))
        s.append(f'<circle cx="{px(p["marcaMes"])}" cy="{ly}" r="6.5" fill="{COR["orange"]}"/>'); s.append(t(px(p["marcaMes"]), ly - 13, p["marcaTexto"], 10, COR["orange"], "bold", anchor="middle"))
        for i, j in enumerate(p["janelas"]):
            yy = ly + 28 + i * 17; cor = COR[j["cor"]]
            s.append(f'<rect x="{lx0}" y="{yy}" width="{px(j["ate"]) - lx0}" height="11" rx="3" fill="{cor}" opacity=".9"/>'); s.append(t(px(j["ate"]) + 8, yy + 9, j["texto"], 10, cor, "bold"))
    elif tipo == "barras":
        yy = y + 40
        if p.get("texto"):
            ls = quebrar(p["texto"], larg); s.append(lines(x + 16, yy + 4, ls, 10.5, "#1a1a1a", 14)); yy += 14 * len(ls) + 4
        itens = p["itens"]; maxv = max(abs(i["v"]) for i in itens) or 1; labw = 84; txtw = max(len(i["texto"]) for i in itens) * 6.5 + 12
        escala = (pw - 32 - labw - txtw) / maxv
        notas = quebrar(p["nota"], larg + 4)[:2] if p.get("nota") else []
        fim = y + ph - (14 + 13 * len(notas) if notas else 10); passo = min(24, (fim - yy - 6) / len(itens))
        for i, it in enumerate(itens):
            by = yy + 6 + i * passo; bw = max(abs(it["v"]) * escala, 4); cor = COR[it["cor"]]; bh = min(16, passo - 6)
            s.append(t(x + 16 + labw - 8, by + bh / 2 + 4, it["rot"], 10.5, "#1a1a1a", "bold", anchor="end"))
            s.append(f'<rect x="{x + 16 + labw}" y="{by}" width="{bw}" height="{bh}" rx="3" fill="{cor}"/>')
            s.append(t(x + 16 + labw + bw + 6, by + bh / 2 + 4, it["texto"], 10.5, cor, "bold"))
        if notas: s.append(lines(x + 16, y + ph - 14 - 13 * (len(notas) - 1), notas, 9.5, MUT, 13))
    elif tipo == "kv":
        yy = y + 40
        if p.get("texto"): s.append(t(x + 16, yy + 4, p["texto"], 10.5, "#1a1a1a")); yy += 20
        for k, v in p["linhas"]:
            s.append(rect(x + 16, yy, pw - 32, 20, "#ffffff", RULE, r=3)); s.append(t(x + 24, yy + 14, k, 10.5, NAVY, "bold")); s.append(t(x + pw - 24, yy + 14, v, 10.5, "#1a1a1a", anchor="end")); yy += 24
        if p.get("nota") and yy + 12 < y + ph: s.append(lines(x + 16, yy + 12, quebrar(p["nota"], larg + 4)[:1], 9.5, MUT, 13))
    elif tipo == "lista":
        yy = y + 46
        for it in p["itens"]:
            ls = quebrar(it, larg - 3); s.append(t(x + 18, yy, "▪", 10, NAVY)); s.append(lines(x + 32, yy, ls, 10.5, "#1a1a1a", 14)); yy += 14 * len(ls) + 5


def gerar(n):
    d = json.load(open(os.path.join(AQUI, "infograficos", f"c{n:02d}.json")))
    cor, soft = TEMAS.get(str(n), ["#B36A18", "#FBF1E3"])
    W, H = 860, 1052
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', rect(0, 0, W, H, "#ffffff", r=0), rect(0, 0, W, 8, cor, r=0)]
    s.append(t(24, 72, d["numero"], 58, cor, "bold")); s.append(eyebrow(122, 36, f"Capítulo {n} de 11 · infográfico de abertura", cor))
    tit = d["titulo"]; s.append(t(122, 64, tit, 24 if len(tit) <= 34 else 20, NAVY, "bold")); s.append(t(122, 86, d["pergunta"], 13.5, MUT, style="font-style:italic"))
    # 1. cartões 2 × 2
    y0 = 118; s.append(eyebrow(24, y0, d["kicker1"], NAVY))
    cw, ch, gx, gy, cy = 402, 116, 8, 8, y0 + 12
    for i, c in enumerate(d["cartoes"]):
        x = 24 + (i % 2) * (cw + gx); y = cy + (i // 2) * (ch + gy); cc = COR[c["cor"]]
        s.append(rect(x, y, cw, ch, PAPER, RULE)); s.append(rect(x, y, 6, ch, cc, r=3))
        s.append(t(x + 18, y + 30, f"{i + 1}. {c['tit']}", 14, cc, "bold")); ls = quebrar(c["corpo"], 58)
        s.append(lines(x + 18, y + 54, ls, 11 if len(ls) <= 4 else 10, "#1a1a1a", 16 if len(ls) <= 4 else 13.5))
    s.append(seta(24 + cw + 1, cy + ch / 2, 24 + cw + gx - 1)); s.append(seta(24 + cw + 1, cy + ch + gy + ch / 2, 24 + cw + gx - 1))
    # 2. tiles + fórmula
    y1 = cy + 2 * ch + gy + 34; s.append(eyebrow(24, y1, d["kicker2"], NAVY))
    tw, th, ty = 268, 106, y1 + 12
    for i, tl in enumerate(d["tiles"]):
        x = 24 + i * (tw + 4); cc = COR[tl["cor"]]; fs = tam_sigla(tl["sigla"])
        s.append(rect(x, ty, tw, th, "#ffffff", RULE)); s.append(rect(x, ty, 7, th, cc, r=3))
        s.append(t(x + 20, ty + 34, tl["sigla"], fs, cc, "bold")); s.append(t(x + 20, ty + 50, tl["nome"], 9.5, MUT))
        s.append(lines(x + 20, ty + 65, quebrar(tl["desc"], 42)[:3], 10, "#1a1a1a", 13))
    fy = ty + th + 8; s.append(rect(24, fy, W - 48, 44, soft, r=8))
    f = d["formula"]; nota = d.get("formulaNota", "")
    if len(f) + len(nota) <= 100:
        s.append(t(40, fy + 28, f, 17 if len(f) <= 42 else 14, NAVY, "bold")); s.append(t(W - 40, fy + 28, nota, 11, cor, "bold", anchor="end"))
    else:
        s.append(t(40, fy + 20, f, 14 if len(f) <= 60 else 12.5, NAVY, "bold")); s.append(t(40, fy + 36, nota, 9.8, cor, "bold"))
    # 3. painéis: dois lado a lado e um largo
    y2 = fy + 44 + 34; s.append(eyebrow(24, y2, d["kicker3"], NAVY))
    pw, ph, py = 402, 168, y2 + 12; P = d["paineis"]
    painel(s, P[0], 24, py, pw, ph); painel(s, P[1], 24 + pw + 8, py, pw, ph); painel(s, P[2], 24, py + ph + 8, W - 48, 112)
    # rodapé
    y3 = py + ph + 8 + 112 + 20; s.append(rect(0, y3, W, H - y3, NAVY, r=0)); s.append(eyebrow(24, y3 + 26, d["faixa"]["kicker"], COR["gold"]))
    for i, it in enumerate(d["faixa"]["itens"]):
        x = 24 + i * 276; s.append(t(x, y3 + 54, it["k"], 14, "#ffffff", "bold")); s.append(lines(x, y3 + 72, quebrar(it["v"], 44)[:3], 10.5, "#dfe6f3", 14))
    s.append("</svg>")
    with open(OUT + f"infografico-c{n}.svg", "w") as fh: fh.write("\n".join(s))


caps = [int(c) for c in sys.argv[1].split(",")] if len(sys.argv) > 1 else sorted(int(os.path.basename(f)[1:3]) for f in glob.glob(os.path.join(AQUI, "infograficos", "c*.json")))
for n in caps: gerar(n)
print("infográficos gerados:", caps, "em", OUT)
