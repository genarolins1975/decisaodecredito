"""Infográficos de abertura dos capítulos: SVG em retrato (860 × 1052) para a capa de cada capítulo da apostila.

Conteúdo: content/infograficos/cNN.json (uma fonte para a capa impressa e para os slides FGV).
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

def curva_logistica(s, x, y, w, h, titulo, eixo):
    """Curva em S da função logística, z de −6 a 6."""
    import math
    ml, mr, mt, mb = 40, 10, 22, 30
    sx = lambda z: x + ml + (z + 6) / 12 * (w - ml - mr); sy = lambda p: y + mt + (1 - p) * (h - mt - mb)
    s.append(t(x + ml + (w - ml - mr) / 2, y + 12, titulo, 11, NAVY, "bold", anchor="middle"))
    for p in (0, .5, 1):
        s.append(f'<line x1="{sx(-6)}" y1="{sy(p)}" x2="{sx(6)}" y2="{sy(p)}" stroke="{RULE}" stroke-width="1"/>'); s.append(t(x + ml - 6, sy(p) + 4, f"{int(p * 100)}%", 9.5, MUT, anchor="end"))
    s.append(f'<line x1="{sx(0)}" y1="{y + mt}" x2="{sx(0)}" y2="{y + h - mb}" stroke="{RULE}" stroke-width="1"/>')
    for z in (-4, 0, 4): s.append(t(sx(z), y + h - mb + 13, "−4" if z < 0 else str(z), 9.5, MUT, anchor="middle"))
    s.append(t(x + ml + (w - ml - mr) / 2, y + h - 4, eixo, 9.5, MUT, anchor="middle"))
    pts = " ".join(f"{sx(z):.1f},{sy(1 / (1 + math.exp(-z))):.1f}" for z in [-6 + i * .2 for i in range(61)])
    s.append(f'<polyline points="{pts}" fill="none" stroke="{COR["green"]}" stroke-width="2.5"/>'); s.append(f'<circle cx="{sx(0)}" cy="{sy(.5)}" r="4" fill="{NAVY}"/>')


def gerar_fluxo(n, d, cor, soft):
    """Variante de fluxo (capítulo 4): três etapas com setas, dois painéis (escalas com a curva e coeficiente) e a faixa de limite."""
    W, H = 860, 1052; G = COR["green"]
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">', rect(0, 0, W, H, "#ffffff", r=0), rect(0, 0, W, 8, cor, r=0)]
    s.append(t(24, 72, d["numero"], 58, cor, "bold")); s.append(eyebrow(122, 36, f"Capítulo {n} de 11 · {d.get('eyebrow', 'infográfico de abertura')}", cor))
    tit = d["titulo"]; s.append(t(122, 64, tit, 22 if len(tit) <= 40 else 18, NAVY, "bold"))
    s.append(lines(122, 86, quebrar(d["pergunta"], 100)[:2], 12.5, MUT, 15))
    # etapas: três cartões lado a lado com setas
    ex, ey, ew, eh, gap = 24, 124, 258, 262, 19
    for i, e in enumerate(d["etapas"]):
        x = ex + i * (ew + gap); s.append(rect(x, ey, ew, eh, "#ffffff", RULE)); yy = ey + 26
        s.append(t(x + 16, yy, f"0{i + 1}", 11, G, "bold")); s.append(eyebrow(x + 40, yy, e["rot"], G)); yy += 30
        if e.get("tit"): s.append(t(x + 16, yy, e["tit"], 16, NAVY, "bold")); yy += 30
        for ent in e.get("entradas", []):
            s.append(t(x + 16, yy, ent["k"], 11.5, MUT)); yy += 30
            s.append(t(x + 16, yy, ent["v"], 28, NAVY, "bold")); s.append(t(x + 150, yy - 2, "→ " + ent["x"], 14, G, "bold")); yy += 30
        if e.get("txt"): s.append(t(x + 16, yy, e["txt"], 17, NAVY, style="font-style:italic")); yy += 30
        for p in e.get("parcelas", []):
            s.append(t(x + 16, yy, p["v"], 19, COR[p["cor"]], "bold")); s.append(t(x + ew - 16, yy - 2, p["rot"], 10.5, MUT, anchor="end")); yy += 30
        if e.get("total"):
            s.append(f'<line x1="{x + 16}" y1="{yy - 20}" x2="{x + ew - 16}" y2="{yy - 20}" stroke="{RULE}" stroke-width="1.5"/>'); s.append(t(x + 16, yy + 2, e["total"], 21, NAVY, "bold")); yy += 30
        if e.get("destaque"): s.append(t(x + 16, yy + 8, e["destaque"], 27, G, "bold")); yy += 40
        if e.get("texto"): ls = quebrar(e["texto"], 36); s.append(lines(x + 16, yy, ls, 11, "#1a1a1a", 15)); yy += 15 * len(ls) + 6
        if e.get("nota"): s.append(lines(x + 16, ey + eh - 16, quebrar(e["nota"], 40)[:2], 10.5 if not e.get("notaForte") else 11, NAVY if e.get("notaForte") else MUT, 13, "bold" if e.get("notaForte") else "normal"))
        if i < 2: s.append(seta(x + ew + 2, ey + eh / 2, x + ew + gap - 2, G))
    # painéis
    py, ph = ey + eh + 20, 250; pw1 = 396; pw2 = W - 48 - pw1 - 12
    esc_ = d["escalas"]; s.append(rect(24, py, pw1, ph, PAPER, RULE)); s.append(eyebrow(40, py + 26, esc_["titulo"], G)); yy = py + 56
    for f in esc_["formulas"]: s.append(t(40, yy, f["txt"], 14, NAVY, style="font-style:italic")); yy += 26
    s.append(t(40, yy + 8, esc_["exemploTit"], 11, NAVY, "bold")); s.append(t(40, yy + 30, esc_["exemplo"], 14, NAVY, "bold"))
    for k, l in enumerate(esc_["exemploLinhas"]): s.append(t(40, yy + 50 + k * 16, l, 10.5, MUT))
    curva_logistica(s, 24 + 200, py + 30, pw1 - 210, ph - 40, esc_["curvaTit"], esc_["eixoX"])
    co = d["coeficiente"]; x2 = 24 + pw1 + 12; s.append(rect(x2, py, pw2, ph, PAPER, RULE)); s.append(eyebrow(x2 + 16, py + 26, co["titulo"], G))
    s.append(t(x2 + 16, py + 58, co["headline"], 13.2 if len(co["headline"]) <= 50 else 12, NAVY, "bold")); s.append(lines(x2 + 16, py + 80, quebrar(co["texto"], 66)[:2], 10.5, MUT, 14))
    cw = (pw2 - 32) / 3
    for k, c in enumerate(co["casos"]):
        cx = x2 + 16 + k * cw; s.append(t(cx, py + 140, f"{c['de']} → {c['para']}", 13.5, NAVY, "bold")); s.append(t(cx, py + 164, c["delta"], 14, G, "bold"))
    s.append(t(x2 + 16, py + ph - 20, co["nota"], 11, NAVY, "bold"))
    # faixa e rodapé
    fy = py + ph + 16; s.append(rect(24, fy, W - 48, 56, NAVY, r=8)); s.append(eyebrow(44, fy + 33, d["faixa"]["kicker"], COR["gold"]))
    s.append(t(268, fy + 33, d["faixa"]["texto"], 12, "#ffffff"))
    rod = d.get("rodape", []); ry = fy + 56 + 24
    if rod: s.append(t(24, ry, rod[0], 10, MUT)); s.append(t(W - 24, ry, " · ".join(rod[1:]), 10, MUT, anchor="end"))
    H = int(ry + 26); s[0] = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'; s[1] = rect(0, 0, W, H, "#ffffff", r=0)
    s.append("</svg>")
    with open(OUT + f"infografico-c{n}.svg", "w") as fh: fh.write("\n".join(s))


def gerar(n):
    d = json.load(open(os.path.join(AQUI, "../../content/infograficos", f"c{n:02d}.json")))
    cor, soft = TEMAS.get(str(n), ["#B36A18", "#FBF1E3"])
    if d.get("variante") == "fluxo": return gerar_fluxo(n, d, cor, soft)
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


caps = [int(c) for c in sys.argv[1].split(",")] if len(sys.argv) > 1 else sorted(int(os.path.basename(f)[1:3]) for f in glob.glob(os.path.join(AQUI, "../../content/infograficos", "c*.json")))
for n in caps: gerar(n)
print("infográficos gerados:", caps, "em", OUT)
