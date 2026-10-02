"""Figuras conceituais da apostila (SVG, vetoriais). Paleta validada: azul #2a78d6, laranja #eb6834, água #1baf7a; texto #0b0b0b / #52514e."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.ticker as mticker
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch
import os, sys
OUT = os.path.join(os.environ.get("APOSTILA_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../tmp/apostila")), "fig") + "/"; os.makedirs(OUT, exist_ok=True)
B, O, A, Y = "#2a78d6", "#eb6834", "#1baf7a", "#eda100"; INK, MUT, GRID = "#0b0b0b", "#52514e", "#e6e4dd"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.edgecolor": MUT, "axes.labelcolor": INK, "xtick.color": MUT, "ytick.color": MUT, "axes.spines.top": False, "axes.spines.right": False, "axes.grid": True, "grid.color": GRID, "grid.linewidth": 0.6, "legend.frameon": False, "svg.fonttype": "none", "text.parse_math": False})
def salvar(fig, nome): fig.savefig(OUT + nome + ".svg", bbox_inches="tight"); plt.close(fig)
sig = lambda z: 1 / (1 + np.exp(-z))

# c1 · a decisão é uma conta: valor esperado por PD
fig, ax = plt.subplots(figsize=(7, 3.6)); pd_ = np.linspace(0, 0.5, 200); ead, receita, lgd, custo = 10000, 0.16, 0.62, 35
ve = (1 - pd_) * receita * ead - pd_ * lgd * ead - custo; ax.plot(pd_ * 100, ve, color=B, lw=2); ax.axhline(0, color=MUT, lw=1)
pd_eq = (receita * ead - custo) / (receita * ead + lgd * ead); ax.axvline(pd_eq * 100, color=O, lw=1.5, ls="--"); ax.annotate(f"ponto de equilíbrio\nPD ≈ {pd_eq*100:.1f}%", (pd_eq * 100, 300), xytext=(pd_eq * 100 + 6, 900), color=INK, arrowprops=dict(arrowstyle="-", color=MUT))
ax.set_xlabel("probabilidade de default (%)"); ax.set_ylabel("valor esperado da operação (R$)"); ax.set_title("EAD R$ 10.000, receita 16% da EAD, LGD 62%, custo R$ 35 por proposta", fontsize=9, color=MUT, loc="left"); salvar(fig, "conceito-c1-valor-esperado")

# c2 · ajuste contra generalização
fig, ax = plt.subplots(figsize=(7, 3.4)); k = np.arange(1, 21); tr = 0.42 * np.exp(-0.22 * k) + 0.05; va = 0.42 * np.exp(-0.22 * k) + 0.05 + 0.0025 * (k - 6) ** 2 * (k > 6)
ax.plot(k, tr, color=B, lw=2, label="erro no treino"); ax.plot(k, va, color=O, lw=2, label="erro na validação"); ax.axvline(6, color=MUT, ls=":", lw=1); ax.text(6.3, 0.36, "a partir daqui o modelo decora", color=MUT, fontsize=9)
ax.set_xlabel("complexidade do modelo (parâmetros, profundidade, iterações)"); ax.set_ylabel("erro"); ax.legend(loc="upper right"); salvar(fig, "conceito-c2-generalizacao")

# c3 · calendário do protocolo
fig, ax = plt.subplots(figsize=(9, 3.5)); ax.grid(False); ax.set_xlim(-0.5, 54.5); ax.set_ylim(-0.4, 4.6); ax.axis("off")
def barra(y, x0, x1, cor, rot, sub="", fora=False):
    ax.add_patch(FancyBboxPatch((x0, y), x1 - x0, 0.9, boxstyle="round,pad=0,rounding_size=0.12", fc=cor, ec="none"))
    if fora: ax.text((x0 + x1) / 2, y + 1.15, rot, ha="center", va="center", color=cor, fontsize=9.5, fontweight="bold")
    else: ax.text((x0 + x1) / 2, y + 0.45, rot, ha="center", va="center", color="white", fontsize=10.5, fontweight="bold")
    if sub: ax.text((x0 + x1) / 2 if fora else x0 + 0.3, y - 0.3, sub, ha="center" if fora else "left", va="center", color=MUT, fontsize=9)
barra(3, 0, 30, B, "Treino · jan/21 a jun/23", "imputação, escala, categorias, modelo, calibrador"); barra(3, 30, 36, A, "Validação", "jul a dez/23", fora=True); barra(3, 36, 42, O, "OOT cego", "jan a jun/24", fora=True)
ax.add_patch(Rectangle((42, 3), 12, 0.9, fc="none", ec=MUT, ls="--")); ax.text(48, 3.45, "maturação\n+12 meses +30 dias", ha="center", va="center", color=MUT, fontsize=9, linespacing=1.3)
ax.annotate("", xy=(54, 1.6), xytext=(0, 1.6), arrowprops=dict(arrowstyle="->", color=MUT)); 
for x, t in [(0, "jan/21"), (30, "jul/23"), (36, "jan/24"), (42, "jul/24"), (54, "jan/25")]: ax.text(x, 1.2, t, ha="center", color=INK, fontsize=9.5)
ax.text(0, 0.55, "Data de referência do arquivo: 31/01/2025. Toda proposta de dez/23 tem rótulo disponível em jan/25\n(data_rotulo_disponivel). O OOT cego é avaliado uma única vez.", color=MUT, fontsize=9.5, va="top", linespacing=1.4); salvar(fig, "conceito-c3-calendario")

# c4 · curva logística e log odds
fig, axs = plt.subplots(1, 2, figsize=(8, 3.2)); z = np.linspace(-6, 6, 300); axs[0].plot(z, sig(z), color=B, lw=2); axs[0].axhline(0.5, color=MUT, lw=0.8, ls=":"); axs[0].axvline(0, color=MUT, lw=0.8, ls=":")
for zz in [-2, 0, 2]: axs[0].plot([zz], [sig(zz)], "o", color=O, ms=7); axs[0].annotate(f"z={zz:+d} → PD {sig(zz)*100:.0f}%", (zz, sig(zz)), xytext=(zz + 0.4, sig(zz) - 0.12 if zz >= 0 else sig(zz) + 0.08), fontsize=8.5, color=INK)
axs[0].set_xlabel("escore z (log odds)"); axs[0].set_ylabel("PD"); axs[0].set_title("A curva nunca toca 0 nem 1", fontsize=9.5, loc="left")
pdv = np.linspace(0.01, 0.99, 300); axs[1].plot(pdv * 100, np.log(pdv / (1 - pdv)), color=B, lw=2); axs[1].set_xlabel("PD (%)"); axs[1].set_ylabel("log odds = ln(PD / (1 − PD))"); axs[1].set_title("O mesmo caminho, de volta", fontsize=9.5, loc="left"); fig.tight_layout(); salvar(fig, "conceito-c4-logistica")

# c4b · odds ratio: somar no log odds, multiplicar nas odds
fig, ax = plt.subplots(figsize=(7, 2.8)); ax.grid(False); ax.axis("off"); ax.set_xlim(0, 10); ax.set_ylim(0, 3)
cols = [("PD", "10%", "18%", "31%", "47%"), ("odds", "0,11", "0,22", "0,44", "0,89"), ("log odds", "−2,20", "−1,50", "−0,81", "−0,12")]
for i, row in enumerate(cols):
    ax.text(0.2, 2.4 - i * 0.9, row[0], fontsize=10, fontweight="bold", color=INK, va="center")
    for j, v in enumerate(row[1:]): ax.text(2 + j * 2.2, 2.4 - i * 0.9, v, fontsize=12, color=B if i == 0 else INK, va="center", ha="center")
for j in range(3): ax.annotate("", xy=(2.9 + j * 2.2, 1.5), xytext=(2.4 + j * 2.2, 1.5), arrowprops=dict(arrowstyle="->", color=O, lw=1.5)); ax.text(2.65 + j * 2.2, 1.78, "×2", color=O, ha="center", fontsize=9, fontweight="bold"); ax.text(2.65 + j * 2.2, 0.85, "+0,69", color=O, ha="center", fontsize=9, fontweight="bold")
ax.text(0.2, 0.15, "Um coeficiente de 0,69 no log odds dobra as odds em qualquer ponto; o efeito na PD depende de onde se está.", color=MUT, fontsize=8.5); salvar(fig, "conceito-c4-odds")

# c5 · impureza e a busca do corte; incerteza da folha
fig, axs = plt.subplots(1, 2, figsize=(8, 3.2)); x = np.linspace(0.2, 0.95, 200); gini = 0.18 - 0.09 * np.exp(-((x - 0.7) / 0.12) ** 2)
axs[0].plot(x * 100, gini, color=B, lw=2); axs[0].plot([70], [0.09], "o", color=O, ms=8); axs[0].annotate("melhor corte: utilização 70%", (70, 0.09), xytext=(35, 0.10), color=INK, fontsize=9, arrowprops=dict(arrowstyle="-", color=MUT)); axs[0].set_xlabel("corte candidato (utilização do limite, %)"); axs[0].set_ylabel("impureza ponderada dos filhos"); axs[0].set_title("A árvore testa todos os cortes e guarda o melhor", fontsize=9.5, loc="left")
n = np.array([5, 10, 20, 50, 100, 200, 500, 1000]); p = 0.2; z95 = 1.96; lo = (p + z95**2/(2*n) - z95*np.sqrt(p*(1-p)/n + z95**2/(4*n**2)))/(1+z95**2/n); hi = (p + z95**2/(2*n) + z95*np.sqrt(p*(1-p)/n + z95**2/(4*n**2)))/(1+z95**2/n)
axs[1].fill_between(n, lo * 100, hi * 100, color=B, alpha=0.18); axs[1].plot(n, np.full_like(n, 20.0), color=B, lw=2); axs[1].set_xscale("log"); axs[1].set_xticks([10, 100, 1000, 10000]); axs[1].set_xticklabels(["10", "100", "1.000", "10.000"]); axs[1].xaxis.set_minor_formatter(mticker.NullFormatter()); axs[1].set_xlabel("n na folha (escala log)"); axs[1].set_ylabel("taxa de default na folha (%)"); axs[1].set_title("Folha com 20% de default: intervalo de Wilson 95%", fontsize=9.5, loc="left"); fig.tight_layout(); salvar(fig, "conceito-c5-arvore")

# c6 · boosting: correções acumuladas
fig, ax = plt.subplots(figsize=(7, 3.4)); alvo = 8.0; F = [6.5]; res = []
for m in range(6): r = alvo - F[-1]; res.append(r); F.append(F[-1] + 0.5 * r)
ax.plot(range(len(F)), F, "-o", color=B, lw=2, ms=6, label="previsão acumulada F_m(x)"); ax.axhline(alvo, color=O, lw=1.5, ls="--", label="valor observado (8,0)")
for m, f in enumerate(F): ax.annotate(f"{f:.2f}", (m, f), xytext=(0, 7), textcoords="offset points", ha="center", fontsize=8.5, color=INK)
ax.set_xlabel("iteração m (cada uma ajusta uma árvore pequena ao resíduo)"); ax.set_ylabel("previsão"); ax.legend(loc="lower right"); ax.set_title("Palpite inicial 6,5; taxa de aprendizado 0,5; cada passo soma metade do resíduo", fontsize=9, color=MUT, loc="left"); salvar(fig, "conceito-c6-boosting")

# c7 · as quatro perguntas na janela fora do tempo do curso (dados reais de src/lib/capitulo7/base.json, logística)
import json
_b = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../src/lib/capitulo7/base.json")))
y = np.array(_b["oot"]["y"]) == 1; p_hat = np.array(_b["oot"]["pl"]); p_gb = np.array(_b["oot"]["pgr"]); ead = np.array(_b["oot"]["ead"]); n = len(y)
o = np.argsort(-p_hat, kind="stable"); ys = y[o]; tpr = np.concatenate([[0], np.cumsum(ys) / ys.sum()]); fpr = np.concatenate([[0], np.cumsum(~ys) / (~ys).sum()])
auc = ((p_hat[y][:, None] > p_hat[~y][None, :]).sum() + 0.5 * (p_hat[y][:, None] == p_hat[~y][None, :]).sum()) / (y.sum() * (~y).sum())
fig, axs = plt.subplots(2, 2, figsize=(8, 6.4))
a = axs[0, 0]; a.plot(fpr, tpr, color=B, lw=2); a.plot([0, 1], [0, 1], color=MUT, lw=1, ls=":"); a.set_title(f"Ordenação: ROC, AUC {auc:.4f}".replace(".", ","), fontsize=9.5, loc="left"); a.set_xlabel("adimplentes recusados (fração)"); a.set_ylabel("defaults recusados (fração)")
borda = [int(np.floor(j * n / 10 + 0.5)) for j in range(11)]; asc = np.argsort(p_hat, kind="stable")
pm = []; om = []; lo = []; hi = []
for k in range(10):
    ii = asc[borda[k]:borda[k + 1]]; m_ = len(ii); d_ = y[ii].sum(); ph = d_ / m_; z = 1.959964
    c = (ph + z * z / (2 * m_)) / (1 + z * z / m_); w = z * np.sqrt(ph * (1 - ph) / m_ + z * z / (4 * m_ * m_)) / (1 + z * z / m_)
    pm.append(p_hat[ii].mean()); om.append(ph); lo.append(ph - max(0, c - w)); hi.append(c + w - ph)
a = axs[0, 1]; a.plot([0, 0.32], [0, 0.32], color=MUT, lw=1, ls=":"); a.errorbar(pm, om, yerr=[lo, hi], fmt="o", color=A, ecolor=A, capsize=3); a.set_title("Probabilidade: decis, com intervalo de Wilson", fontsize=9.5, loc="left"); a.set_xlabel("PD média prevista"); a.set_ylabel("taxa observada")
cortes = np.arange(1, 81) * 0.005
def esperado(c):
    m_ = p_hat < c; return (0.28 * ead * (1 - p_hat) - 0.65 * ead * p_hat - 0.12 * ead - 120 - 0.02 * ead)[m_].sum()
res = np.array([esperado(c) for c in cortes]) / 1e3; c_ot = cortes[np.argmax(res)]; ks_i = np.argmax(tpr - fpr); c_ks = p_hat[o][ks_i - 1]
a = axs[1, 0]; a.plot(cortes * 100, res, color=O, lw=2); a.axvline(c_ot * 100, color=O, lw=1.2, ls="--"); a.axvline(c_ks * 100, color=B, lw=1.2, ls=":")
a.text(c_ot * 100 + 0.6, res.min() + 30, f"ótimo {c_ot*100:.1f}%".replace(".", ","), fontsize=8.5, color=O); a.text(c_ks * 100 - 0.6, res.min() + 120, f"KS {c_ks*100:.1f}%".replace(".", ","), fontsize=8.5, color=B, ha="right")
a.set_title("Decisão: resultado esperado por corte (R$ mil)", fontsize=9.5, loc="left"); a.set_xlabel("corte de PD (%): aprova abaixo")
def mb32(semente):
    st = [semente & 0xFFFFFFFF]
    def r():
        st[0] = (st[0] + 0x6D2B79F5) & 0xFFFFFFFF; t_ = st[0]
        t_ = ((t_ ^ (t_ >> 15)) * (t_ | 1)) & 0xFFFFFFFF; t_ ^= (t_ + ((t_ ^ (t_ >> 7)) * (t_ | 61) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t_ ^ (t_ >> 14)) & 0xFFFFFFFF) / 4294967296
    return r
def auc_(yy, pp):
    pos = pp[yy]; neg = pp[~yy]; srt = np.sort(neg); return (np.searchsorted(srt, pos, "left").sum() + 0.5 * (np.searchsorted(srt, pos, "right") - np.searchsorted(srt, pos, "left")).sum()) / (len(pos) * len(neg))
r_ = mb32(20260501); dif = []
for _ in range(1000):
    ii = np.array([int(np.floor(r_() * n)) for _ in range(n)]); dif.append(auc_(y[ii], p_hat[ii]) - auc_(y[ii], p_gb[ii]))
dif = np.array(dif); q1, q2 = np.quantile(dif, [0.025, 0.975])
a = axs[1, 1]; a.hist(dif, bins=np.arange(-0.04, 0.1001, 0.004), color=B, alpha=0.85); a.axvline(0, color=O, lw=1.5); a.axvspan(q1, q2, color=A, alpha=0.12)
a.set_title(f"Validação: diferença de AUC, bootstrap ({q1:.4f} a {q2:.4f})".replace(".", ","), fontsize=9.5, loc="left"); a.set_xlabel("AUC logística menos AUC boosting"); a.set_ylabel("réplicas")
fig.tight_layout(); salvar(fig, "conceito-c7-validacao")

# c8 · política: limiar, faixa manual e capacidade
fig, ax = plt.subplots(figsize=(7, 3.4)); pdg = np.linspace(0, 0.4, 400); dens = np.exp(-((pdg - 0.06) / 0.05) ** 2) * 1.0 + np.exp(-((pdg - 0.2) / 0.08) ** 2) * 0.25
ax.fill_between(pdg * 100, dens, color=B, alpha=0.25); ax.plot(pdg * 100, dens, color=B, lw=1.5)
ax.axvspan(0, 9, color=A, alpha=0.12); ax.axvspan(9, 16, color=Y, alpha=0.18); ax.axvspan(16, 40, color=O, alpha=0.12)
ax.text(4.5, 1.05, "aprovação automática", ha="center", fontsize=9, color=INK); ax.text(12.5, 1.05, "faixa manual\n(cabe na capacidade?)", ha="center", fontsize=9, color=INK); ax.text(28, 1.05, "recusa", ha="center", fontsize=9, color=INK)
ax.set_xlabel("PD calibrada (%)"); ax.set_ylabel("densidade de propostas"); ax.set_ylim(0, 1.25); ax.set_yticks([]); ax.set_title("O limiar vem da conta econômica; a largura da faixa manual vem da capacidade da operação", fontsize=9, color=MUT, loc="left"); salvar(fig, "conceito-c8-politica")

# c9 · monitoramento: PSI e AUC por safra com intervalo
fig, axs = plt.subplots(1, 2, figsize=(8, 3.2)); meses = ["jan", "fev", "mar", "abr", "mai", "jun"]; psi = [0.03, 0.04, 0.06, 0.09, 0.14, 0.27]
cores = [B if v < 0.1 else (Y if v < 0.25 else O) for v in psi]; axs[0].bar(meses, psi, color=cores, width=0.65); axs[0].axhline(0.1, color=MUT, lw=1, ls=":"); axs[0].axhline(0.25, color=MUT, lw=1, ls="--"); axs[0].text(5.4, 0.105, "atenção 0,10", fontsize=8, color=MUT, ha="right"); axs[0].text(5.4, 0.255, "ação 0,25", fontsize=8, color=MUT, ha="right"); axs[0].set_title("PSI da entrada por mês", fontsize=9.5, loc="left"); axs[0].set_ylabel("PSI")
safras = ["21T1", "21T3", "22T1", "22T3", "23T1", "23T3", "24T1"]; auc = [0.75, 0.75, 0.74, 0.745, 0.74, 0.735, 0.71]; ic = [0.012, 0.012, 0.011, 0.011, 0.011, 0.012, 0.02]
axs[1].errorbar(range(len(safras)), auc, yerr=ic, fmt="-o", color=B, ecolor=B, capsize=3, lw=1.5); axs[1].axhline(0.72, color=O, lw=1, ls="--"); axs[1].text(0, 0.7225, "limite de alerta 0,72", fontsize=8, color=O); axs[1].set_xticks(range(len(safras))); axs[1].set_xticklabels(safras, fontsize=8); axs[1].set_ylim(0.66, 0.78); axs[1].set_title("AUC por safra madura, com intervalo 95%", fontsize=9.5, loc="left"); fig.tight_layout(); salvar(fig, "conceito-c9-monitoramento")

# c10 · comitê: mapa das cinco dimensões (radar simples como barras)
fig, ax = plt.subplots(figsize=(7, 2.9)); dims = ["Problema e dados", "Modelo e testes", "Decisão econômica", "Governança e monitoramento", "Reprodução e defesa"]; notas = [3, 2, 2, 1, 3]
ax.barh(dims, notas, color=[B, B, B, O, B], height=0.55); ax.set_xlim(0, 3.3); ax.set_xticks([0, 1, 2, 3]); ax.invert_yaxis(); ax.set_title("Zero em qualquer dimensão reprova o memorando inteiro; a nota mínima manda", fontsize=9, color=MUT, loc="left")
for i, v in enumerate(notas): ax.text(v + 0.06, i, str(v), va="center", fontsize=9, color=INK)
salvar(fig, "conceito-c10-comite")

# c11 · o percurso das missões
fig, ax = plt.subplots(figsize=(8, 2.6)); ax.axis("off"); ax.set_xlim(0, 16); ax.set_ylim(0, 3)
blocos = [("Construir", 1, 7, B), ("Testar", 7, 11, A), ("Defender", 11, 16, O)]
for rot, x0, x1, c in blocos: ax.add_patch(FancyBboxPatch((x0, 1.7), x1 - x0 - 0.15, 0.9, boxstyle="round,pad=0,rounding_size=0.15", fc=c, ec="none")); ax.text((x0 + x1 - 0.15) / 2, 2.15, rot, ha="center", va="center", color="white", fontsize=10, fontweight="bold")
for m in range(1, 17): ax.add_patch(plt.Circle((m - 0.5 + 0.5, 1.0), 0.28, fc="white", ec=B if m <= 12 else O, lw=1.5)); ax.text(m, 1.0, str(m), ha="center", va="center", fontsize=8, color=INK)
ax.text(1, 0.35, "1 a 12: o modelo (pergunta, contrato, auditoria, calendário, régua, três famílias, discriminação, calibração, conta econômica, monitoramento, pacote congelado)", fontsize=8, color=MUT); ax.text(1, 0.05, "13 a 16: o blueprint da operação (fluxo, governança e três linhas de defesa, modelo integrado, monitoramento e Conselho)", fontsize=8, color=MUT); salvar(fig, "conceito-c11-missoes")
print("figuras conceituais geradas")
