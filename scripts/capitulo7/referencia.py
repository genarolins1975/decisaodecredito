"""
Referência numérica do capítulo 7, calculada com bibliotecas de terceiros e não com o código da plataforma.

Bibliotecas: scikit-learn (roc_auc_score, roc_curve, average_precision_score, precision_score, recall_score,
confusion_matrix, brier_score_loss, log_loss, calibration_curve, IsotonicRegression), statsmodels (GLM binomial para
intercepto e slope de calibração, intercepto com offset e Platt; proportion_confint pelo método de Wilson) e NumPy.
O DeLong não tem implementação nessas bibliotecas: aqui ele é feito pelo algoritmo rápido de Sun e Xu (2014), escrito
de forma independente do código TypeScript, e conferido contra o resultado do gerador do curso
(DADOS.res.comparacao_auc). A reamostragem usa a mesma sequência pseudoaleatória (mulberry32) do TypeScript, portada
abaixo, para que as duas implementações sorteiem as mesmas réplicas.

Uso:  python3 scripts/capitulo7/referencia.py
Saída: tests/fixtures/capitulo7-referencia.json (versões das bibliotecas gravadas no próprio arquivo)

A mini-base de 20 propostas foi sorteada assim (registro do procedimento, não reexecutado pelos testes):
    rng = numpy.random.default_rng(3)
    d = rng.choice(índices com y = 1, 5, replace=False); g = rng.choice(índices com y = 0, 15, replace=False)
e ordenada pela PD da logística, decrescente: os índices estão em src/lib/capitulo7/dados.ts (MINI_IDS).
"""
import json
import math
import pathlib

import numpy as np
import scipy
import sklearn
import statsmodels
import statsmodels.api as sm
from scipy.stats import norm
from sklearn.calibration import calibration_curve
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import (average_precision_score, brier_score_loss, confusion_matrix, log_loss, precision_score,
                             recall_score, roc_auc_score, roc_curve)
from statsmodels.stats.proportion import proportion_confint

RAIZ = pathlib.Path(__file__).resolve().parents[2]
B = json.loads((RAIZ / "src/lib/capitulo7/base.json").read_text())
O = B["oot"]
y = np.array(O["y"], dtype=int)
MOD = {"pl": np.array(O["pl"]), "pgr": np.array(O["pgr"]), "pg": np.array(O["pg"]), "pt": np.array(O["pt"])}
lg = lambda p: np.log(p / (1 - p))
sig = lambda z: 1 / (1 + np.exp(-z))


def glm(yv, X, offset=None):
    return sm.GLM(yv, X, family=sm.families.Binomial(), offset=offset).fit(tol=1e-14, maxiter=200)


def faixas_quantis(yv, p, k):
    asc = np.argsort(p, kind="stable")
    n = len(p)
    out = []
    for j in range(k):
        ids = asc[math.floor(j * n / k + 0.5):math.floor((j + 1) * n / k + 0.5)]  # mesma regra declarada no TypeScript
        d = int(yv[ids].sum()); m = len(ids)
        lo, hi = proportion_confint(d, m, alpha=0.05, method="wilson")
        out.append({"n": m, "d": d, "pdMedia": float(p[ids].mean()), "obs": d / m, "lo": float(lo), "hi": float(hi)})
    return out


def arred4(p):
    """Meio para cima, em inteiros (as PDs têm seis casas): a mesma regra declarada no TypeScript."""
    return np.floor((np.round(p * 1e6) + 50) / 100) / 1e4


def ks(yv, p):
    fpr, tpr, thr = roc_curve(yv, p, drop_intermediate=False)
    k = int(np.argmax(tpr - fpr))
    return {"ks": float((tpr - fpr)[k]), "limiar": float(thr[k]), "pontos": len(fpr)}


def ganho(yv, p, q):
    ordem = sorted(range(len(p)), key=lambda i: (-p[i], i))
    k = math.floor(q * len(p) + 0.5)
    c = int(sum(yv[i] for i in ordem[:k]))
    return {"examinados": k, "capturados": c, "ganho": c / yv.sum(), "lift": (c / k) / yv.mean()}


def mulberry32(seed):
    t = seed & 0xFFFFFFFF

    def imul(a, b):
        return (a * b) & 0xFFFFFFFF

    def nxt():
        nonlocal t
        t = (t + 0x6D2B79F5) & 0xFFFFFFFF
        x = imul(t ^ (t >> 15), 1 | t)
        x = (x ^ ((x + imul(x ^ (x >> 7), 61 | x)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((x ^ (x >> 14)) & 0xFFFFFFFF) / 4294967296

    return nxt


def delong_rapido(yv, s1, s2):
    """Sun e Xu (2014): componentes por médias de postos."""
    from scipy.stats import rankdata
    pos, neg = s1[yv == 1], s1[yv == 0]
    m, n = len(pos), len(neg)
    def comp(s):
        p, q = s[yv == 1], s[yv == 0]
        tz = rankdata(np.concatenate([p, q]))
        tx, ty = rankdata(p), rankdata(q)
        auc = (tz[:m].sum() - m * (m + 1) / 2) / (m * n)
        v10 = (tz[:m] - tx) / n
        v01 = 1 - (tz[m:] - ty) / m
        return auc, v10, v01
    a1, v10a, v01a = comp(s1); a2, v10b, v01b = comp(s2)
    s10 = np.cov(np.vstack([v10a, v10b])); s01 = np.cov(np.vstack([v01a, v01b]))
    S = s10 / m + s01 / n
    dif = a1 - a2; ep = math.sqrt(S[0, 0] + S[1, 1] - 2 * S[0, 1]); z = dif / ep
    return {"auc1": a1, "auc2": a2, "dif": dif, "ep": ep, "z": z, "p": 2 * norm.sf(abs(z)), "ep1": math.sqrt(S[0, 0]), "ep2": math.sqrt(S[1, 1])}


ref = {"versoes": {"numpy": np.__version__, "scipy": scipy.__version__, "sklearn": sklearn.__version__, "statsmodels": statsmodels.__version__}}

modelos = {}
for nome, p in MOD.items():
    X = sm.add_constant(lg(p))
    r = glm(y, X)
    r1 = glm(y, np.ones((len(y), 1)), offset=lg(p))
    fx, fy = calibration_curve(y, p, n_bins=10, strategy="uniform")
    cm = confusion_matrix(y, (p >= 0.12).astype(int), labels=[0, 1])
    modelos[nome] = {
        "auc": roc_auc_score(y, p), "ap": average_precision_score(y, p), "brier": brier_score_loss(y, p), "logloss": log_loss(y, p),
        "pdMedia": float(p.mean()), "intercepto": float(r.params[0]), "slope": float(r.params[1]), "interceptoSlope1": float(r1.params[0]),
        "ks": ks(y, p), "faixasDecis": faixas_quantis(y, p, 10), "faixasUniformes": {"obs": fx.tolist(), "pdMedia": fy.tolist()},
        "corte12": {"vn": int(cm[0, 0]), "fp": int(cm[0, 1]), "fn": int(cm[1, 0]), "vp": int(cm[1, 1]),
                    "precisao": precision_score(y, (p >= 0.12).astype(int)), "recall": recall_score(y, (p >= 0.12).astype(int))},
        "ganho10": ganho(y, p, 0.1), "ganho20": ganho(y, p, 0.2),
        "valoresDistintos4casas": int(len(np.unique(arred4(p)))), "auc4casas": roc_auc_score(y, arred4(p)),
    }
ref["modelos"] = modelos

# mini-base: PD da logística arredondada a pontos percentuais inteiros
mini_ids = [85, 64, 179, 194, 536, 383, 736, 556, 80, 504, 137, 451, 22, 332, 284, 649, 312, 115, 239, 347]
my = y[mini_ids]; mp = np.round(MOD["pl"][mini_ids] * 100) / 100
pares = [(a, b) for a, ya in zip(mp, my) if ya == 1 for b, yb in zip(mp, my) if yb == 0]
ref["mini"] = {"auc": roc_auc_score(my, mp), "pares": len(pares), "corretos": sum(a > b for a, b in pares), "empates": sum(a == b for a, b in pares)}

# Wilson: exemplos fixos do slide 21
ref["wilson"] = {f"{d}/{n}": list(proportion_confint(d, n, alpha=0.05, method="wilson")) for d, n in [(5, 100), (50, 1000), (1, 74), (0, 20), (22, 74), (81, 737)]}

# amostra de calibração simulada e calibradores, avaliados na janela OOT
C = B["calibracao"]; ci = np.array(C["indices"]); cy = np.array(C["y"])
cal = {}
for nome in ("pgr", "pl"):
    pc = MOD[nome][ci]; po = MOD[nome]
    a0 = float(glm(cy, np.ones((len(cy), 1)), offset=lg(pc)).params[0])
    pl_ = glm(cy, sm.add_constant(lg(pc))).params
    iso = IsotonicRegression(out_of_bounds="clip", y_min=0, y_max=1).fit(pc, cy)
    iso_p = IsotonicRegression(out_of_bounds="clip", y_min=0, y_max=1).fit(pc[:C["nPequena"]], cy[:C["nPequena"]])
    def resumo(q):
        return {"auc": roc_auc_score(y, q), "brier": brier_score_loss(y, q), "logloss": log_loss(y, q), "pdMedia": float(q.mean()), "distintos": int(len(np.unique(q)))}
    cal[nome] = {
        "intercepto": a0, "plattA": float(pl_[0]), "plattB": float(pl_[1]),
        "apos": {"intercepto": resumo(sig(lg(po) + a0)), "platt": resumo(sig(pl_[0] + pl_[1] * lg(po))), "isotonica": resumo(iso.predict(po)), "isotonicaPequena": resumo(iso_p.predict(po))},
        "isotonicaBlocos": int(len(iso.X_thresholds_)), "isotonicaPequenaBlocos": int(len(iso_p.X_thresholds_)),
        "isotonicaAmostra": iso.predict(po[:12]).tolist(),
    }
ref["calibracao"] = cal

# reamostragem pareada, mesma sequência do TypeScript
r = mulberry32(20260501); n = len(y); dif = []; a1 = []
for b in range(1000):
    idx = [math.floor(r() * n) for _ in range(n)]
    yy = y[idx]
    if yy.min() == yy.max():
        continue
    u = roc_auc_score(yy, MOD["pl"][idx]); v = roc_auc_score(yy, MOD["pgr"][idx])
    a1.append(u); dif.append(u - v)
dif = np.sort(dif); a1 = np.sort(a1)
ref["bootstrap"] = {"replicas": len(dif), "semente": 20260501, "difQ025": float(np.quantile(dif, 0.025)), "difQ975": float(np.quantile(dif, 0.975)), "difMedia": float(dif.mean()),
                    "auc1Q025": float(np.quantile(a1, 0.025)), "auc1Q975": float(np.quantile(a1, 0.975))}

ref["delong"] = delong_rapido(y, MOD["pl"], MOD["pgr"])
ref["delongGerador"] = B["res"]["comparacao_auc"]

saida = RAIZ / "tests/fixtures/capitulo7-referencia.json"
saida.parent.mkdir(parents=True, exist_ok=True)
saida.write_text(json.dumps(ref, indent=1, default=float))
print("ok", saida, {k: round(v["auc"], 6) for k, v in modelos.items()}, ref["delong"])
