"""Experimento sintético da aula de modelagem de crédito.

Gera a base sintética, treina logit regularizado, logit flexível, árvore e boosting,
avalia fora do tempo, calibra, define política e exporta os resultados consumidos
pelos slides 18, 27 a 29, 31, 37 a 41 e 43 a 49.

Nada aqui descreve uma carteira real. Semente, versões e parâmetros ficam em
saida/metadados.json e o resultado agregado em saida/resultados.json.
"""

from __future__ import annotations

import hashlib
import json
import platform
import sys
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import sklearn
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.tree import DecisionTreeClassifier

SEED = 20260920
PASTA = Path(__file__).resolve().parent
SAIDA = PASTA / "saida"

# Economia didática do slide 47, usada para a política congelada.
MARGEM = 1200.0
LGD = 0.60
EAD = 10000.0
CORTE_EQUILIBRIO = MARGEM / (LGD * EAD)  # 0,20

CANAIS = ["agencia", "digital", "parceiro"]
NUMERICAS = ["renda", "comp", "rel", "util"]
COLUNAS = ["renda", "comp", "rel", "util", "hist", "canal_digital", "canal_parceiro",
           "renda_ausente", "util_ausente"]
# Agrupamento semântico usado nas explicações locais: canal e indicadores de ausência
# acompanham a variável de origem.
GRUPOS = {
    "renda": ["renda", "renda_ausente"],
    "comp": ["comp"],
    "rel": ["rel"],
    "util": ["util", "util_ausente"],
    "hist": ["hist"],
    "canal": ["canal_digital", "canal_parceiro"],
}

PARTICOES = [
    ("treino", date(2018, 1, 1), date(2019, 12, 31), 16000),
    ("validacao", date(2021, 1, 1), date(2021, 6, 30), 4000),
    ("calibracao", date(2022, 8, 1), date(2022, 12, 31), 3000),
    ("teste", date(2024, 2, 1), date(2024, 7, 31), 5000),
]

CLIENTES = [
    {"nome": "Ana", "renda": 7000.0, "comp": 22.0, "rel": 36.0, "util": 30.0, "hist": 0, "canal": "agencia"},
    {"nome": "Bruno", "renda": 4500.0, "comp": 38.0, "rel": 8.0, "util": 65.0, "hist": 1, "canal": "digital"},
    {"nome": "Carla", "renda": 10000.0, "comp": 48.0, "rel": 60.0, "util": 85.0, "hist": 0, "canal": "digital"},
    {"nome": "Diego", "renda": 3500.0, "comp": 55.0, "rel": 4.0, "util": 90.0, "hist": 1, "canal": "parceiro"},
]


# ---------------------------------------------------------------- utilidades


def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))


def logito(p, eps=1e-12):
    p = np.clip(p, eps, 1 - eps)
    return np.log(p / (1 - p))


def log_loss_bin(y, p, eps=1e-6):
    p = np.clip(p, eps, 1 - eps)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))


def brier(y, p):
    return float(np.mean((p - y) ** 2))


def ks_stat(y, p, pontos=200):
    """Maior distância entre as acumuladas de escore dos dois desfechos.

    Orientação declarada: escore maior significa maior risco, e as acumuladas
    percorrem o escore do menor para o maior.
    """
    grade = np.linspace(0.0, 1.0, pontos)
    limites = np.quantile(p, grade)
    limites = np.unique(np.round(limites, 6))
    pos = p[y == 1]
    neg = p[y == 0]
    f_pos = np.array([np.mean(pos <= t) for t in limites])
    f_neg = np.array([np.mean(neg <= t) for t in limites])
    d = f_neg - f_pos
    i = int(np.argmax(d))
    return {
        "ks": float(d[i]),
        "corte": float(limites[i]),
        "limites": [round(float(x), 6) for x in limites],
        "acum_adimplentes": [round(float(x), 6) for x in f_neg],
        "acum_inadimplentes": [round(float(x), 6) for x in f_pos],
    }


def curva_roc(y, p, pontos=160):
    ordem = np.argsort(-p)
    y = y[ordem]
    tp = np.cumsum(y)
    fp = np.cumsum(1 - y)
    tpr = tp / max(tp[-1], 1)
    fpr = fp / max(fp[-1], 1)
    idx = np.unique(np.linspace(0, len(y) - 1, pontos).astype(int))
    return {
        "fpr": [0.0] + [round(float(fpr[i]), 5) for i in idx],
        "tpr": [0.0] + [round(float(tpr[i]), 5) for i in idx],
    }


def bins_calibracao(y, p, k=10):
    """Faixas por quantis da previsão, com média prevista e frequência observada."""
    bordas = np.unique(np.quantile(p, np.linspace(0, 1, k + 1)))
    bordas[0] -= 1e-9
    idx = np.clip(np.digitize(p, bordas[1:-1], right=True), 0, len(bordas) - 2)
    faixas = []
    for b in range(len(bordas) - 1):
        m = idx == b
        n = int(m.sum())
        if n == 0:
            continue
        ev = int(y[m].sum())
        faixas.append({
            "n": n,
            "eventos": ev,
            "prev_media": round(float(p[m].mean()), 6),
            "obs": round(ev / n, 6),
            "wilson": wilson(ev, n),
            "limite_inf": round(float(max(bordas[b], 0.0)), 6),
            "limite_sup": round(float(bordas[b + 1]), 6),
        })
    return faixas


def wilson(d, n, z=1.96):
    if n == 0:
        return [0.0, 1.0]
    p = d / n
    den = 1 + z * z / n
    centro = (p + z * z / (2 * n)) / den
    meio = z * np.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [round(float(max(0.0, centro - meio)), 6), round(float(min(1.0, centro + meio)), 6)]


def auc_pares(y, p):
    return float(roc_auc_score(y, p))


# ------------------------------------------------------------ geração da base


@dataclass
class Base:
    X: np.ndarray            # matriz de características já codificada
    y: np.ndarray
    particao: np.ndarray
    data: np.ndarray         # ordinal da data de contratação
    bruto: dict              # colunas originais, com ausentes como NaN


def _gerar_bloco(rng, n, inicio, fim, deriva):
    dias = (fim - inicio).days
    data = np.array([inicio.toordinal() + int(d) for d in rng.integers(0, dias + 1, n)])

    z_renda = rng.normal(0, 1, n)
    renda = np.clip(np.exp(8.42 + 0.52 * z_renda), 1200, 30000)
    z_renda_pad = (np.log(renda) - 8.42) / 0.52

    u = rng.normal(0, 1, n)
    util = np.clip(100 * sigmoid(-0.25 + 0.95 * u - 0.30 * z_renda_pad + 0.03 * deriva), 0, 100)

    rel = np.clip(np.round(np.exp(2.55 + 0.30 * z_renda_pad + 0.75 * rng.normal(0, 1, n))), 0, 120)

    p_hist = sigmoid(-1.55 - 0.30 * z_renda_pad + 0.020 * (util - 45))
    hist = (rng.random(n) < p_hist).astype(int)

    comp = np.clip(
        33.0 - 5.5 * z_renda_pad + 0.10 * (util - 45) + 2.5 * hist + rng.normal(0, 7.0, n) + 1.2 * deriva,
        3, 85)

    escala = np.array([0.0, 0.0, 0.0])
    escala[0] = 1.0
    p_canal = np.stack([
        sigmoid(0.15 + 0.55 * z_renda_pad + 0.010 * (rel - 20)),
        np.full(n, 0.85),
        sigmoid(0.10 - 0.65 * z_renda_pad - 0.010 * (rel - 20)),
    ], axis=1)
    p_canal = p_canal / p_canal.sum(axis=1, keepdims=True)
    canal_idx = np.array([rng.choice(3, p=linha) for linha in p_canal])

    efeito_canal = np.array([0.0, 0.12, 0.34])[canal_idx]
    eta = (-2.62
           + 0.035 * (comp - 30)
           + 0.030 * np.maximum(comp - 45, 0)
           + 0.85 * hist
           + 0.020 * (comp - 30) * hist
           - 0.010 * (rel - 12)
           + 0.012 * (util - 40)
           - 0.00004 * (renda - 5000)
           + efeito_canal)
    p_verdadeiro = sigmoid(eta)
    y = (rng.random(n) < p_verdadeiro).astype(int)

    # Ausentes: utilização mais ausente em parceiro, renda ausente esporádica.
    p_falta_util = 0.025 + 0.06 * (canal_idx == 2)
    util_obs = util.copy()
    util_obs[rng.random(n) < p_falta_util] = np.nan
    renda_obs = renda.copy()
    renda_obs[rng.random(n) < 0.012] = np.nan

    return {
        "data": data, "renda": renda_obs, "comp": comp, "rel": rel, "util": util_obs,
        "hist": hist, "canal": canal_idx, "y": y, "p_verdadeiro": p_verdadeiro,
    }


def gerar_base(seed=SEED):
    rng = np.random.default_rng(seed)
    blocos, particoes = [], []
    for i, (nome, inicio, fim, n) in enumerate(PARTICOES):
        # Deriva suave de composição a partir de 2022: solicitantes um pouco mais
        # comprometidos e com utilização maior. Serve ao slide 48 e não é ajustada
        # depois de observar o teste.
        deriva = 0.0 if i < 2 else (1.0 if i == 2 else 1.6)
        b = _gerar_bloco(rng, n, inicio, fim, deriva)
        blocos.append(b)
        particoes.append(np.full(n, nome))
    bruto = {k: np.concatenate([b[k] for b in blocos]) for k in blocos[0]}
    particao = np.concatenate(particoes)
    return bruto, particao


def codificar(bruto, medianas=None):
    canal = bruto["canal"]
    renda = bruto["renda"].copy()
    util = bruto["util"].copy()
    renda_aus = np.isnan(renda).astype(float)
    util_aus = np.isnan(util).astype(float)
    if medianas is None:
        medianas = {"renda": float(np.nanmedian(renda)), "util": float(np.nanmedian(util))}
    renda[np.isnan(renda)] = medianas["renda"]
    util[np.isnan(util)] = medianas["util"]
    X = np.column_stack([
        renda, bruto["comp"], bruto["rel"], util, bruto["hist"].astype(float),
        (canal == 1).astype(float), (canal == 2).astype(float), renda_aus, util_aus,
    ])
    return X, medianas


def codificar_clientes(medianas):
    linhas = []
    for c in CLIENTES:
        idx = CANAIS.index(c["canal"])
        linhas.append([c["renda"], c["comp"], c["rel"], c["util"], float(c["hist"]),
                       1.0 if idx == 1 else 0.0, 1.0 if idx == 2 else 0.0, 0.0, 0.0])
    return np.array(linhas)


# ------------------------------------------------------------------- modelos


def padronizar(X, mu=None, sd=None):
    if mu is None:
        mu = X.mean(axis=0)
        sd = X.std(axis=0)
        sd[sd == 0] = 1.0
    return (X - mu) / sd, mu, sd


def expandir_flex(X):
    """Logit de sensibilidade: mesmas informações, forma funcional mais rica."""
    renda, comp, rel, util, hist = X[:, 0], X[:, 1], X[:, 2], X[:, 3], X[:, 4]
    extras = np.column_stack([
        np.maximum(comp - 45, 0),
        np.maximum(util - 60, 0),
        (comp - 30) * hist,
        np.log(np.maximum(renda, 1.0)),
        np.sqrt(np.maximum(rel, 0.0)),
    ])
    return np.hstack([X, extras])


def treinar_logit(Xtr, ytr, Xva, yva, grade_c, expandir=False):
    if expandir:
        Xtr, Xva = expandir_flex(Xtr), expandir_flex(Xva)
    Xtr_p, mu, sd = padronizar(Xtr)
    Xva_p, _, _ = padronizar(Xva, mu, sd)
    cenarios = []
    melhor = None
    for C in grade_c:
        m = LogisticRegression(C=C, max_iter=5000, solver="lbfgs")
        m.fit(Xtr_p, ytr)
        p_tr = m.predict_proba(Xtr_p)[:, 1]
        p_va = m.predict_proba(Xva_p)[:, 1]
        item = {
            "C": C,
            "forca": round(float(1.0 / C), 6),
            "perda_treino": round(log_loss_bin(ytr, p_tr), 6),
            "perda_validacao": round(log_loss_bin(yva, p_va), 6),
            "auc_validacao": round(auc_pares(yva, p_va), 6),
            "coeficientes": [round(float(c), 6) for c in m.coef_[0]],
            "intercepto": round(float(m.intercept_[0]), 6),
        }
        cenarios.append(item)
        if melhor is None or item["perda_validacao"] < melhor[1]["perda_validacao"]:
            melhor = (m, item, (mu, sd))
    return melhor[0], melhor[1], melhor[2], cenarios


def prever_logit(modelo, escala, X, expandir=False):
    if expandir:
        X = expandir_flex(X)
    mu, sd = escala
    return modelo.predict_proba((X - mu) / sd)[:, 1]


def treinar_arvore(Xtr, ytr, Xva, yva):
    cenarios = []
    melhor = None
    for prof in [1, 2, 3, 4, 6, 8, 12, None]:
        for folha in [20, 50, 100, 300]:
            m = DecisionTreeClassifier(max_depth=prof, min_samples_leaf=folha,
                                       criterion="gini", random_state=SEED)
            m.fit(Xtr, ytr)
            p_tr = m.predict_proba(Xtr)[:, 1]
            p_va = m.predict_proba(Xva)[:, 1]
            folhas = int(m.get_n_leaves())
            n_por_folha = np.bincount(m.apply(Xtr), minlength=m.tree_.node_count)
            n_por_folha = n_por_folha[n_por_folha > 0]
            item = {
                "profundidade": -1 if prof is None else prof,
                "min_folha": folha,
                "folhas": folhas,
                "mediana_n_folha": int(np.median(n_por_folha)),
                "perda_treino": round(log_loss_bin(ytr, p_tr), 6),
                "perda_validacao": round(log_loss_bin(yva, p_va), 6),
                "brier_treino": round(brier(ytr, p_tr), 6),
                "brier_validacao": round(brier(yva, p_va), 6),
                "auc_validacao": round(auc_pares(yva, p_va), 6),
            }
            cenarios.append(item)
            if melhor is None or item["perda_validacao"] < melhor[1]["perda_validacao"]:
                melhor = (m, item)
    return melhor[0], melhor[1], cenarios


def caminho_poda(Xtr, ytr, Xva, yva, prof, folha, quantos=5):
    base = DecisionTreeClassifier(max_depth=prof, min_samples_leaf=folha, random_state=SEED)
    caminho = base.cost_complexity_pruning_path(Xtr, ytr)
    alphas = np.unique(np.round(caminho.ccp_alphas, 10))
    alphas = alphas[alphas >= 0]
    escolhidos = np.unique(np.quantile(alphas, np.linspace(0, 0.995, quantos)))
    saida = []
    for a in escolhidos:
        m = DecisionTreeClassifier(max_depth=prof, min_samples_leaf=folha,
                                   ccp_alpha=float(a), random_state=SEED)
        m.fit(Xtr, ytr)
        p_va = m.predict_proba(Xva)[:, 1]
        saida.append({
            "alpha": round(float(a), 9),
            "folhas": int(m.get_n_leaves()),
            "perda_validacao": round(log_loss_bin(yva, p_va), 6),
            "auc_validacao": round(auc_pares(yva, p_va), 6),
        })
    return saida


def resumir_arvore(modelo, X, y, nomes, profundidade_max=3):
    """Estrutura compacta para desenho: nós com regra, n, eventos e PD."""
    t = modelo.tree_
    no_de = modelo.apply(X)

    def contar(no):
        # contagem real dos registros de treino que passam pelo nó
        return int(t.n_node_samples[no]), int(round(t.value[no][0][1] * t.n_node_samples[no]))

    def construir(no, nivel):
        n = int(t.n_node_samples[no])
        prop = float(t.value[no][0][1])
        # value normalizado em versões recentes do sklearn
        eventos = int(round(prop * n)) if prop <= 1.0 else int(prop)
        item = {"n": n, "eventos": eventos, "pd": round(prop if prop <= 1.0 else prop / n, 6)}
        esq, dir_ = int(t.children_left[no]), int(t.children_right[no])
        if esq == -1 or nivel >= profundidade_max:
            item["folha"] = True
            if esq != -1:
                item["resumido"] = True
            return item
        item["folha"] = False
        item["variavel"] = nomes[int(t.feature[no])]
        item["limite"] = round(float(t.threshold[no]), 4)
        item["esq"] = construir(esq, nivel + 1)
        item["dir"] = construir(dir_, nivel + 1)
        return item

    return construir(0, 0)


def treinar_boosting(Xtr, ytr, Xva, yva, taxas, profundidades, n_arv=300,
                     paciencia=20, tolerancia=1e-4, Xcli=None, passo_cli=5):
    cenarios = []
    melhor = None
    for lr in taxas:
        for prof in profundidades:
            m = GradientBoostingClassifier(learning_rate=lr, max_depth=prof,
                                           n_estimators=n_arv, random_state=SEED)
            m.fit(Xtr, ytr)
            perdas_tr, perdas_va = [], []
            for f_tr in m.staged_decision_function(Xtr):
                perdas_tr.append(log_loss_bin(ytr, sigmoid(f_tr.ravel())))
            aucs_va = []
            for f_va in m.staged_decision_function(Xva):
                p_va = sigmoid(f_va.ravel())
                perdas_va.append(log_loss_bin(yva, p_va))
                aucs_va.append(auc_pares(yva, p_va))
            perdas_va = np.array(perdas_va)
            melhor_iter = int(np.argmin(perdas_va)) + 1
            # Parada por paciência e tolerância, percorrida na ordem do treinamento.
            parada, referencia, espera = len(perdas_va), np.inf, 0
            for i, v in enumerate(perdas_va, start=1):
                if v < referencia - tolerancia:
                    referencia, espera = v, 0
                else:
                    espera += 1
                    if espera >= paciencia:
                        parada = i
                        break
            # Previsão dos quatro clientes ao longo das iterações, para o slide 37.
            trajetoria_cli = []
            if Xcli is not None:
                for i, f_cli in enumerate(m.staged_decision_function(Xcli), start=1):
                    if i % passo_cli == 0 or i == 1:
                        trajetoria_cli.append({
                            "iteracao": i,
                            "pd": [round(float(v), 6) for v in sigmoid(f_cli.ravel())],
                        })
            item = {
                "taxa": lr,
                "profundidade": prof,
                "clientes_por_iteracao": trajetoria_cli,
                "melhor_iteracao": melhor_iter,
                "iteracao_parada": parada,
                "perda_validacao": round(float(perdas_va[melhor_iter - 1]), 6),
                "auc_validacao": round(float(aucs_va[melhor_iter - 1]), 6),
                "perdas_treino": [round(float(x), 6) for x in perdas_tr],
                "perdas_validacao": [round(float(x), 6) for x in perdas_va],
            }
            cenarios.append(item)
            if melhor is None or item["perda_validacao"] < melhor[1]["perda_validacao"]:
                melhor = (m, item)
    return melhor[0], melhor[1], cenarios


class BoostingCortado:
    """Boosting congelado na melhor iteração observada na validação."""

    def __init__(self, modelo, n_iter):
        self.modelo = modelo
        self.n_iter = n_iter

    def escore(self, X):
        for i, f in enumerate(self.modelo.staged_decision_function(X), start=1):
            if i == self.n_iter:
                return f.ravel()
        return self.modelo.decision_function(X).ravel()

    def prever(self, X):
        return sigmoid(self.escore(X))


# ------------------------------------------------------- explicações locais


def shapley_intervencional(func_escore, x, fundo, grupos, nomes_cols):
    """Valores de Shapley exatos sobre o escore, com expectativa intervencional.

    Com seis grupos de variáveis, as 64 coalizões são enumeradas sem amostragem.
    A propriedade de eficiência garante base + soma(phi) = F(x); isso é conferido
    numericamente no exportador.
    """
    nomes = list(grupos)
    k = len(nomes)
    idx = {g: [nomes_cols.index(c) for c in grupos[g]] for g in nomes}
    cache = {}

    def v(S):
        chave = tuple(sorted(S))
        if chave in cache:
            return cache[chave]
        Z = fundo.copy()
        for g in chave:
            for j in idx[g]:
                Z[:, j] = x[j]
        val = float(np.mean(func_escore(Z)))
        cache[chave] = val
        return val

    from itertools import combinations
    from math import factorial

    phi = {}
    for g in nomes:
        total = 0.0
        outros = [o for o in nomes if o != g]
        for tam in range(len(outros) + 1):
            peso = factorial(tam) * factorial(k - tam - 1) / factorial(k)
            for S in combinations(outros, tam):
                total += peso * (v(list(S) + [g]) - v(list(S)))
        phi[g] = total
    return phi, v([]), v(nomes)


def importancia_permutacao(func_prob, X, y, grupos, nomes_cols, rng, repeticoes=5):
    base = auc_pares(y, func_prob(X))
    saida = []
    for g, cols in grupos.items():
        js = [nomes_cols.index(c) for c in cols]
        quedas = []
        for _ in range(repeticoes):
            Z = X.copy()
            ordem = rng.permutation(len(Z))
            for j in js:
                Z[:, j] = X[ordem, j]
            quedas.append(base - auc_pares(y, func_prob(Z)))
        saida.append({"variavel": g, "queda_auc": round(float(np.mean(quedas)), 6),
                      "desvio": round(float(np.std(quedas)), 6)})
    saida.sort(key=lambda d: -d["queda_auc"])
    return base, saida


# ------------------------------------------------------------------ política


def curva_politica(p, y, cortes):
    linhas = []
    n = len(y)
    for c in cortes:
        m = p <= c
        n_ap = int(m.sum())
        ev = int(y[m].sum()) if n_ap else 0
        if n_ap == 0:
            linhas.append({"corte": round(float(c), 4), "aprovados": 0, "eventos": 0,
                           "aprovacao": 0.0, "inadimplencia": None,
                           "resultado_total": 0.0, "resultado_medio": None})
            continue
        # Resultado observado sob a simplificação do slide 47: margem em todo
        # contrato aprovado e perda LGD×EAD nos que viraram evento.
        resultado = n_ap * MARGEM - ev * LGD * EAD
        linhas.append({
            "corte": round(float(c), 4),
            "aprovados": n_ap,
            "eventos": ev,
            "aprovacao": round(n_ap / n, 6),
            "inadimplencia": round(ev / n_ap, 6),
            "pd_media_aprovados": round(float(p[m].mean()), 6),
            "resultado_total": round(float(resultado), 2),
            "resultado_medio": round(float(resultado / n_ap), 4),
        })
    return linhas


def histograma(p, bins=40, limite=0.6):
    bordas = np.linspace(0, limite, bins + 1)
    idx = np.clip(np.digitize(p, bordas[1:-1], right=True), 0, bins - 1)
    return {"bordas": [round(float(b), 4) for b in bordas],
            "contagens": [int((idx == b).sum()) for b in range(bins)]}


# ------------------------------------------------- experimento auxiliar 2D


def experimento_auxiliar(seed=SEED + 7, n=6000):
    rng = np.random.default_rng(seed)
    comp = rng.uniform(5, 80, n)
    util = rng.uniform(0, 100, n)
    eta = (-3.1 + 0.030 * (comp - 40) + 0.018 * (util - 50)
           + 0.0022 * np.maximum(comp - 40, 0) * np.maximum(util - 50, 0))
    p = sigmoid(eta)
    y = (rng.random(n) < p).astype(int)
    X = np.column_stack([comp, util])
    corte = int(n * 0.6)
    return X[:corte], y[:corte], X[corte:], y[corte:], p[:corte]


def malha(modelo, passos=40):
    cs = np.linspace(5, 80, passos)
    us = np.linspace(0, 100, passos)
    G = np.array([[c, u] for u in us for c in cs])
    p = modelo.predict_proba(G)[:, 1]
    return {"comp": [round(float(c), 3) for c in cs],
            "util": [round(float(u), 3) for u in us],
            "pd": [round(float(v), 5) for v in p]}


# ----------------------------------------------------------------- execução


def executar(verbose=True):
    def log(*a):
        if verbose:
            print(*a)

    bruto, particao = gerar_base()
    y_todos = bruto["y"]
    sel = {nome: particao == nome for nome, *_ in PARTICOES}

    # As medianas de imputação vêm apenas do treino e valem para todas as partições.
    Xtr, medianas = codificar({k: v[sel["treino"]] for k, v in bruto.items()})
    ytr = y_todos[sel["treino"]]
    X_todos, _ = codificar(bruto, medianas)
    Xva, _ = codificar({k: v[sel["validacao"]] for k, v in bruto.items()}, medianas)
    Xca, _ = codificar({k: v[sel["calibracao"]] for k, v in bruto.items()}, medianas)
    Xte, _ = codificar({k: v[sel["teste"]] for k, v in bruto.items()}, medianas)
    yva, yca, yte = y_todos[sel["validacao"]], y_todos[sel["calibracao"]], y_todos[sel["teste"]]

    log(f"base: {len(y_todos)} contratos, evento médio {y_todos.mean():.4f}")
    for nome, ini, fim, n in PARTICOES:
        m = sel[nome]
        log(f"  {nome:11s} n={int(m.sum()):5d}  eventos={int(y_todos[m].sum()):4d} "
            f"({y_todos[m].mean()*100:.2f}%)  {ini} a {fim}")

    grade_c = [0.0003, 0.001, 0.003, 0.01, 0.03, 0.1, 0.3, 1.0, 3.0, 10.0, 100.0]
    logit, logit_info, logit_escala, logit_cenarios = treinar_logit(Xtr, ytr, Xva, yva, grade_c)
    log(f"logit L2: C={logit_info['C']} perda_val={logit_info['perda_validacao']:.5f} "
        f"auc_val={logit_info['auc_validacao']:.4f}")

    flex, flex_info, flex_escala, flex_cenarios = treinar_logit(Xtr, ytr, Xva, yva, grade_c, expandir=True)
    log(f"logit flexível: C={flex_info['C']} perda_val={flex_info['perda_validacao']:.5f} "
        f"auc_val={flex_info['auc_validacao']:.4f}")

    # Amostra reduzida do treino: torna visível o efeito da penalização que a amostra
    # completa não mostra. Rotulada como cenário próprio, nunca como o modelo principal.
    rng_peq = np.random.default_rng(SEED + 5)
    idx_peq = rng_peq.choice(len(ytr), size=600, replace=False)
    _, peq_info, _, peq_cenarios = treinar_logit(
        Xtr[idx_peq], ytr[idx_peq], Xva, yva, grade_c, expandir=True)
    log(f"logit em 600 contratos do treino: C={peq_info['C']} "
        f"perda_val={peq_info['perda_validacao']:.5f}")

    arvore, arvore_info, arvore_cenarios = treinar_arvore(Xtr, ytr, Xva, yva)
    log(f"árvore: profundidade={arvore_info['profundidade']} min_folha={arvore_info['min_folha']} "
        f"folhas={arvore_info['folhas']} perda_val={arvore_info['perda_validacao']:.5f}")

    poda = caminho_poda(Xtr, ytr, Xva, yva, None if arvore_info["profundidade"] < 0
                        else arvore_info["profundidade"], arvore_info["min_folha"])

    Xcli_pre = codificar_clientes(medianas)
    boost, boost_info, boost_cenarios = treinar_boosting(
        Xtr, ytr, Xva, yva, taxas=[0.03, 0.10, 0.30], profundidades=[1, 2, 3],
        Xcli=Xcli_pre)
    log(f"boosting: taxa={boost_info['taxa']} profundidade={boost_info['profundidade']} "
        f"melhor_iteração={boost_info['melhor_iteracao']} perda_val={boost_info['perda_validacao']:.5f}")
    boost_final = BoostingCortado(boost, boost_info["melhor_iteracao"])

    modelos = {
        "logit": lambda X: prever_logit(logit, logit_escala, X),
        "logit_flex": lambda X: prever_logit(flex, flex_escala, X, expandir=True),
        "arvore": lambda X: arvore.predict_proba(X)[:, 1],
        "boosting": boost_final.prever,
    }

    # Calibração de Platt ajustada na partição de calibração e aplicada ao teste,
    # sem reajuste do modelo-base.
    calibradores = {}
    for nome, f in modelos.items():
        p_ca = f(Xca)
        cal = LogisticRegression(max_iter=1000)
        cal.fit(logito(p_ca).reshape(-1, 1), yca)
        calibradores[nome] = cal

    def calibrada(nome, X):
        p = modelos[nome](X)
        return calibradores[nome].predict_proba(logito(p).reshape(-1, 1))[:, 1]

    avaliacao = {}
    for nome, f in modelos.items():
        item = {}
        for parte, (Xp, yp) in {"validacao": (Xva, yva), "calibracao": (Xca, yca),
                                "teste": (Xte, yte)}.items():
            p = f(Xp)
            pc = calibrada(nome, Xp)
            item[parte] = {
                "n": int(len(yp)),
                "eventos": int(yp.sum()),
                "auc": round(auc_pares(yp, p), 6),
                "ks": round(ks_stat(yp, p)["ks"], 6),
                "brier": round(brier(yp, p), 6),
                "log_loss": round(log_loss_bin(yp, p), 6),
                "pd_media": round(float(p.mean()), 6),
                "auc_calibrada": round(auc_pares(yp, pc), 6),
                "brier_calibrada": round(brier(yp, pc), 6),
                "log_loss_calibrada": round(log_loss_bin(yp, pc), 6),
                "pd_media_calibrada": round(float(pc.mean()), 6),
            }
        p_te = f(Xte)
        pc_te = calibrada(nome, Xte)
        item["roc_teste"] = curva_roc(yte, p_te)
        item["ks_teste"] = ks_stat(yte, p_te)
        item["calibracao_teste"] = bins_calibracao(yte, p_te)
        item["calibracao_teste_calibrada"] = bins_calibracao(yte, pc_te)
        # Perturbação ilustrativa do slide 45: odds multiplicadas por dois.
        p_odds2 = sigmoid(logito(p_te) + np.log(2))
        item["calibracao_teste_odds2"] = bins_calibracao(yte, p_odds2)
        item["auc_odds2"] = round(auc_pares(yte, p_odds2), 6)
        item["brier_odds2"] = round(brier(yte, p_odds2), 6)
        item["log_loss_odds2"] = round(log_loss_bin(yte, p_odds2), 6)
        item["histograma_teste"] = histograma(pc_te)
        avaliacao[nome] = item
        log(f"  {nome:11s} teste AUC={item['teste']['auc']:.4f} KS={item['teste']['ks']:.4f} "
            f"Brier={item['teste']['brier']:.5f} logloss={item['teste']['log_loss']:.5f}")

    cortes = np.round(np.arange(0.01, 0.5001, 0.005), 4)
    politica = {}
    for nome in modelos:
        p_ca = calibrada(nome, Xca)
        p_te = calibrada(nome, Xte)
        linhas_ca = curva_politica(p_ca, yca, cortes)
        melhor_ca = max([l for l in linhas_ca if l["aprovados"] > 0],
                        key=lambda l: l["resultado_total"])
        politica[nome] = {
            "calibracao": linhas_ca,
            "teste": curva_politica(p_te, yte, cortes),
            "corte_otimo_calibracao": melhor_ca["corte"],
            "corte_congelado": round(CORTE_EQUILIBRIO, 4),
        }

    # Explicações do modelo empírico de boosting.
    rng = np.random.default_rng(SEED + 3)
    auc_base, importancia = importancia_permutacao(
        modelos["boosting"], Xva, yva, GRUPOS, COLUNAS, rng)
    fundo_idx = rng.choice(len(Xca), size=300, replace=False)
    fundo = Xca[fundo_idx]
    Xcli = Xcli_pre
    locais = []
    for i, c in enumerate(CLIENTES):
        phi, base_v, total_v = shapley_intervencional(
            boost_final.escore, Xcli[i], fundo, GRUPOS, COLUNAS)
        soma = base_v + sum(phi.values())
        locais.append({
            "cliente": c["nome"],
            "base": round(float(base_v), 6),
            "contribuicoes": {k: round(float(v), 6) for k, v in phi.items()},
            "escore": round(float(total_v), 6),
            "conferencia_soma": round(float(soma), 6),
            "erro_soma": round(float(abs(soma - total_v)), 9),
            "pd": round(float(sigmoid(total_v)), 6),
            "pd_calibrada": round(float(calibrada("boosting", Xcli[i:i + 1])[0]), 6),
        })
        log(f"  Shapley {c['nome']}: F={total_v:.4f} soma={soma:.4f} "
            f"erro={abs(soma-total_v):.2e} PD={sigmoid(total_v)*100:.2f}%")

    pd_clientes = {nome: [round(float(v), 6) for v in f(Xcli)] for nome, f in modelos.items()}
    pd_clientes_calibrada = {nome: [round(float(v), 6) for v in calibrada(nome, Xcli)]
                             for nome in modelos}

    # Réplicas bootstrap da árvore, com hiperparâmetros fixos (slide 29).
    replicas = []
    rng_b = np.random.default_rng(SEED + 11)
    prof_rep = 3
    folha_rep = max(arvore_info["min_folha"], 100)
    for r in range(20):
        idx = rng_b.integers(0, len(ytr), len(ytr))
        m = DecisionTreeClassifier(max_depth=prof_rep, min_samples_leaf=folha_rep,
                                   random_state=SEED + r)
        m.fit(Xtr[idx], ytr[idx])
        raiz_var = COLUNAS[int(m.tree_.feature[0])]
        replicas.append({
            "replica": r + 1,
            "semente": SEED + r,
            "raiz_variavel": raiz_var,
            "raiz_limite": round(float(m.tree_.threshold[0]), 4),
            "folhas": int(m.get_n_leaves()),
            "pd_clientes": [round(float(v), 6) for v in m.predict_proba(Xcli)[:, 1]],
            "auc_validacao": round(auc_pares(yva, m.predict_proba(Xva)[:, 1]), 6),
            "estrutura": resumir_arvore(m, Xtr[idx], ytr[idx], COLUNAS, 2),
        })
    raizes = {}
    for r in replicas:
        raizes[r["raiz_variavel"]] = raizes.get(r["raiz_variavel"], 0) + 1
    log(f"  réplicas bootstrap: raízes {raizes}")

    # Monitoramento: coortes mensais e cenários (slide 48).
    datas = bruto["data"]
    meses = np.array([date.fromordinal(int(d)).strftime("%Y-%m") for d in datas])
    p_boost_todos = calibrada("boosting", X_todos)
    coortes = []
    for mes in sorted(set(meses)):
        m = meses == mes
        if m.sum() < 30:
            continue
        coortes.append({
            "mes": mes,
            "n": int(m.sum()),
            "pd_media": round(float(p_boost_todos[m].mean()), 6),
            "comp_medio": round(float(np.nanmean(bruto["comp"][m])), 4),
            "util_medio": round(float(np.nanmean(bruto["util"][m])), 4),
            "ausentes_util": round(float(np.mean(np.isnan(bruto["util"][m]))), 6),
            "aprovacao": round(float(np.mean(p_boost_todos[m] <= CORTE_EQUILIBRIO)), 6),
            "inadimplencia": round(float(y_todos[m].mean()), 6),
        })

    cenarios_monitor = []
    rng_m = np.random.default_rng(SEED + 23)
    base_cen = _gerar_bloco(rng_m, 2500, date(2025, 1, 1), date(2025, 6, 30), 1.6)
    for nome_cen, transformar in [
        ("composicao", lambda b: {**b, "comp": np.clip(b["comp"] + 7, 3, 85),
                                  "util": np.clip(b["util"] + 9, 0, 100)}),
        ("ausentes", lambda b: {**b, "util": np.where(
            rng_m.random(len(b["util"])) < 0.22, np.nan, b["util"])}),
        ("relacao", lambda b: b),
    ]:
        b = transformar({k: v.copy() for k, v in base_cen.items()})
        Xc, _ = codificar(b, medianas)
        pc = calibrada("boosting", Xc)
        yc = b["y"]
        if nome_cen == "relacao":
            # Choque ilustrativo: as odds verdadeiras de quem tem histórico dobram.
            eta = logito(b["p_verdadeiro"]) + np.log(2.0) * b["hist"]
            yc = (rng_m.random(len(eta)) < sigmoid(eta)).astype(int)
        cenarios_monitor.append({
            "cenario": nome_cen,
            "n": int(len(yc)),
            "pd_media": round(float(pc.mean()), 6),
            "aprovacao": round(float(np.mean(pc <= CORTE_EQUILIBRIO)), 6),
            "ausentes_util": round(float(np.mean(np.isnan(b["util"]))), 6),
            "comp_medio": round(float(np.nanmean(b["comp"])), 4),
            "inadimplencia": round(float(yc.mean()), 6),
            "auc": round(auc_pares(yc, pc), 6),
            "inadimplencia_aprovados": round(float(yc[pc <= CORTE_EQUILIBRIO].mean()), 6),
        })
        log(f"  cenário {nome_cen}: PD média {pc.mean():.4f} inadimplência {yc.mean():.4f} "
            f"AUC {auc_pares(yc, pc):.4f}")

    # Experimento auxiliar bidimensional (slides 27, 31 e 38).
    Ax, Ay, Avx, Avy, Ap = experimento_auxiliar()
    aux_arvores = {}
    for prof in [2, 4, 8]:
        m = DecisionTreeClassifier(max_depth=prof, min_samples_leaf=20, random_state=SEED)
        m.fit(Ax, Ay)
        aux_arvores[str(prof)] = {
            "malha": malha(m),
            "folhas": int(m.get_n_leaves()),
            "perda_treino": round(log_loss_bin(Ay, m.predict_proba(Ax)[:, 1]), 6),
            "perda_validacao": round(log_loss_bin(Avy, m.predict_proba(Avx)[:, 1]), 6),
        }
    arv_rasa = DecisionTreeClassifier(max_depth=2, min_samples_leaf=20, random_state=SEED).fit(Ax, Ay)
    p_rasa = arv_rasa.predict_proba(Ax)[:, 1]
    res = Ay - p_rasa
    bx = np.clip(np.digitize(Ax[:, 0], np.linspace(5, 80, 7)[1:-1]), 0, 5)
    by = np.clip(np.digitize(Ax[:, 1], np.linspace(0, 100, 7)[1:-1]), 0, 5)
    residuos = []
    for j in range(6):
        for i in range(6):
            m = (bx == i) & (by == j)
            if m.sum() == 0:
                continue
            residuos.append({"i": i, "j": j, "n": int(m.sum()),
                             "residuo_medio": round(float(res[m].mean()), 6),
                             "pd_prevista": round(float(p_rasa[m].mean()), 6),
                             "obs": round(float(Ay[m].mean()), 6)})
    aux_boost = {}
    for prof in [1, 2, 3]:
        m = GradientBoostingClassifier(learning_rate=0.1, max_depth=prof,
                                       n_estimators=150, random_state=SEED)
        m.fit(Ax, Ay)
        aux_boost[str(prof)] = {
            "malha": malha(m),
            "perda_treino": round(log_loss_bin(Ay, m.predict_proba(Ax)[:, 1]), 6),
            "perda_validacao": round(log_loss_bin(Avy, m.predict_proba(Avx)[:, 1]), 6),
        }

    resultados = {
        "protocolo": {
            "semente": SEED,
            "n_total": int(len(y_todos)),
            "particoes": [
                {"nome": nome, "inicio": ini.isoformat(), "fim": fim.isoformat(),
                 "n": int(sel[nome].sum()), "eventos": int(y_todos[sel[nome]].sum()),
                 "taxa": round(float(y_todos[sel[nome]].mean()), 6),
                 "alvo_conhecido": (fim + timedelta(days=365)).isoformat()}
                for nome, ini, fim, n in PARTICOES],
            "medianas_imputacao": {k: round(v, 4) for k, v in medianas.items()},
            "economia": {"margem": MARGEM, "lgd": LGD, "ead": EAD,
                         "corte_equilibrio": round(CORTE_EQUILIBRIO, 6)},
        },
        "modelos": {
            "logit": {"C": logit_info["C"], "coeficientes_padronizados": logit_info["coeficientes"],
                      "intercepto": logit_info["intercepto"], "colunas": COLUNAS,
                      "grade": logit_cenarios},
            "logit_flex": {"C": flex_info["C"], "grade": flex_cenarios},
            "logit_amostra_pequena": {"C": peq_info["C"], "n": 600, "grade": peq_cenarios,
                                      "colunas": COLUNAS + ["comp_acima_45", "util_acima_60",
                                                            "comp_x_hist", "log_renda", "raiz_rel"]},
            "arvore": {"profundidade": arvore_info["profundidade"],
                       "min_folha": arvore_info["min_folha"],
                       "folhas": arvore_info["folhas"],
                       "cenarios": arvore_cenarios, "poda": poda,
                       "estrutura": resumir_arvore(arvore, Xtr, ytr, COLUNAS, 3)},
            "boosting": {"taxa": boost_info["taxa"], "profundidade": boost_info["profundidade"],
                         "melhor_iteracao": boost_info["melhor_iteracao"],
                         "iteracao_parada": boost_info["iteracao_parada"],
                         "paciencia": 20, "tolerancia": 1e-4, "n_estimators": 300,
                         "cenarios": [{k: v for k, v in c.items()} for c in boost_cenarios]},
        },
        "avaliacao": avaliacao,
        "politica": politica,
        "explicacao": {
            "auc_base_validacao": round(auc_base, 6),
            "global_permutacao": importancia,
            "amostra_global": "validação, jan a jun de 2021",
            "locais": locais,
            "fundo": {"n": 300, "particao": "calibração"},
        },
        "clientes": {
            "pd_modelos": pd_clientes,
            "pd_modelos_calibrada": pd_clientes_calibrada,
            "nomes": [c["nome"] for c in CLIENTES],
        },
        "replicas_arvore": {"profundidade": prof_rep, "min_folha": folha_rep,
                            "replicas": replicas, "raizes": raizes},
        "monitoramento": {"coortes": coortes, "cenarios": cenarios_monitor},
        "auxiliar_2d": {"arvores": aux_arvores, "boosting": aux_boost,
                        "residuos_arvore_rasa": residuos,
                        "n_treino": int(len(Ay)), "n_validacao": int(len(Avy)),
                        "descricao": "experimento auxiliar de duas variáveis, separado da base principal"},
    }

    SAIDA.mkdir(parents=True, exist_ok=True)
    caminho = SAIDA / "resultados.json"
    caminho.write_text(json.dumps(resultados, ensure_ascii=False, separators=(",", ":")),
                       encoding="utf-8")

    metadados = {
        "gerado_por": "experimento.py",
        "semente": SEED,
        "python": sys.version.split()[0],
        "plataforma": platform.platform(),
        "numpy": np.__version__,
        "scikit_learn": sklearn.__version__,
        "arquivo_resultados": "saida/resultados.json",
        "sha256_resultados": hashlib.sha256(caminho.read_bytes()).hexdigest(),
        "bytes_resultados": caminho.stat().st_size,
        "observacao": ("Base sintética. Nenhum dado real de cliente. Os modelos são ajustados "
                       "no treino, selecionados na validação, calibrados na partição de "
                       "calibração e avaliados uma única vez no teste."),
    }
    (SAIDA / "metadados.json").write_text(
        json.dumps(metadados, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"\nresultados: {caminho} ({caminho.stat().st_size/1024:.0f} KB)")
    log(f"sha256: {metadados['sha256_resultados'][:16]}...")
    return resultados, metadados


if __name__ == "__main__":
    executar()
