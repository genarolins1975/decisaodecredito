"""
Referência numérica do capítulo 12 (Classificação e ensembles), calculada com scikit-learn, SciPy e NumPy.

Reproduz os experimentos da aula com o código dela e grava duas saídas:
  src/lib/capitulo12/base.json                 os dados que os quadros desenham (sem React, sem cálculo pesado)
  tests/fixtures/capitulo12-referencia.json    os números que os testes conferem contra o código TypeScript

Experimentos (sementes e versões gravadas no próprio arquivo):
  MNIST       fetch_openml("mnist_784", version=1); treino nas 60.000 primeiras, teste nas 10.000 últimas; detector de 5
              com SGDClassifier(loss="hinge", random_state=42) e cross_val_predict(cv=3), como na aula; floresta
              RandomForestClassifier(n_estimators=100, random_state=42) para a comparação de curvas ROC.
  Luas        make_moons(n_samples=500, noise=0.30, random_state=42); train_test_split(random_state=42).
              Votação (logística liblinear, floresta de 10 árvores, SVC gamma="auto"), bagging de 500 árvores com
              max_samples=100, árvore única, out of bag (random_state=40) e floresta de 500 árvores com 16 folhas.
  Iris        RandomForestClassifier(n_estimators=500, random_state=42), importância por redução de impureza.
  Boosting    np.random.seed(42); X = rand(100, 1) − 0,5; y = 3x² + 0,05·randn; três árvores de profundidade 2.
  Caso        tabelas do caso de crédito do material da aula (dados agregados, digitados da fonte e conferidos aqui).

Uso:  python3 scripts/capitulo12/referencia.py   (baixa o MNIST na primeira vez, para scripts/capitulo12/.cache)
"""
import json
import math
import pathlib

import numpy as np
import scipy
import sklearn
from scipy.stats import binom, norm
from sklearn.datasets import fetch_openml, load_iris, make_moons
from sklearn.ensemble import BaggingClassifier, GradientBoostingRegressor, RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import cross_val_predict, train_test_split
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor

RAIZ = pathlib.Path(__file__).resolve().parents[2]
CACHE = pathlib.Path(__file__).resolve().parent / ".cache"
r4 = lambda v: float(round(float(v), 6))


def hexpix(v):
    return "".join(f"{int(p):02x}" for p in v)


# ------------------------------------------------------------------------------------------------ MNIST
mnist = fetch_openml("mnist_784", version=1, as_frame=False, data_home=str(CACHE))
X, y = mnist["data"], mnist["target"].astype(np.uint8)
Xtr, Xte, ytr, yte = X[:60000], X[60000:], y[:60000], y[60000:]
y5, y5te = ytr == 5, yte == 5

sgd = SGDClassifier(loss="hinge", random_state=42)
pred_cv = cross_val_predict(sgd, Xtr, y5, cv=3)
score_cv = cross_val_predict(sgd, Xtr, y5, cv=3, method="decision_function")
assert np.array_equal(pred_cv, score_cv > 0), "a previsão do cv deve ser score > 0"
tn, fp, fn, tp = confusion_matrix(y5, pred_cv).ravel()

sgd_full = SGDClassifier(loss="hinge", random_state=42).fit(Xtr, y5)
acc_treino = accuracy_score(y5, sgd_full.predict(Xtr))
acc_teste = accuracy_score(y5te, sgd_full.predict(Xte))
cm_teste = confusion_matrix(y5te, sgd_full.predict(Xte)).ravel()

rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
proba_rf = cross_val_predict(rf, Xtr, y5, cv=3, method="predict_proba")[:, 1]


def histograma(score, rotulo, n=600, zero=True):
    """Bordas nos quantis do score (com 0 como borda quando zero=True); contagem de positivos e negativos com score
    em [borda_i, borda_i+1); a última faixa é fechada. Prever positivo quando score ≥ limiar."""
    q = np.quantile(score, np.linspace(0, 1, n + 1))
    if zero:
        q = np.append(q, 0.0)
    b = np.unique(np.round(q, 3))
    b[0] = min(b[0], score.min()) - 1e-6
    b[-1] = max(b[-1], score.max()) + 1e-6
    k = np.clip(np.searchsorted(b, score, side="right") - 1, 0, len(b) - 2)
    pos = np.bincount(k[rotulo], minlength=len(b) - 1)
    neg = np.bincount(k[~rotulo], minlength=len(b) - 1)
    return [r4(v) for v in b], pos.tolist(), neg.tolist()


bordas, hpos, hneg = histograma(score_cv, y5)
bordas_rf, hpos_rf, hneg_rf = histograma(proba_rf, y5, n=200, zero=False)

# limiares de conferência: precisão e recall em bordas do histograma, pela regra score ≥ limiar
conf_limiares = []
for t in [bordas[i] for i in range(10, len(bordas) - 1, 47)] + [0.0]:
    p = score_cv >= t
    conf_limiares.append({"t": t, "vp": int((p & y5).sum()), "fp": int((p & ~y5).sum()),
                          "precisao": r4(precision_score(y5, p, zero_division=0)), "recall": r4(recall_score(y5, p))})

# exemplos: o primeiro dígito da base (a "some_digit" da aula), doze para o slide do primeiro classificador e erros
ex_ids = []
rng = np.random.default_rng(12)
cincos = np.where(y5)[0]; outros = np.where(~y5)[0]
ex_ids += list(rng.choice(cincos[:3000], 6, replace=False)) + list(rng.choice(outros[:3000], 6, replace=False))
fp_ids = np.where(pred_cv & ~y5)[0]; fn_ids = np.where(~pred_cv & y5)[0]
fp_sel = fp_ids[np.argsort(-score_cv[fp_ids])][:4]   # os alarmes falsos mais confiantes
fn_sel = fn_ids[np.argsort(score_cv[fn_ids])][:4]    # os cincos que o modelo mais rejeitou
exemplos = []
for tipo, ids in [("primeiro", [0]), ("amostra", ex_ids), ("fp", fp_sel), ("fn", fn_sel)]:
    for i in ids:
        exemplos.append({"tipo": tipo, "i": int(i), "rotulo": int(ytr[i]), "score": r4(score_cv[i]), "pred": bool(pred_cv[i]), "px": hexpix(Xtr[i])})

contagem_digitos = np.bincount(ytr, minlength=10).tolist()

# ------------------------------------------------------------------------------------------------ luas
Xm, ym = make_moons(n_samples=500, noise=0.30, random_state=42)
Xa, Xb, ya, yb = train_test_split(Xm, ym, random_state=42)
ia, ib = train_test_split(np.arange(500), random_state=42)

GX = np.linspace(-1.5, 2.5, 96); GY = np.linspace(-1.0, 1.5, 60)
GG = np.array([[gx, gy] for gy in GY for gx in GX])


def grade(m):
    return "".join("1" if v else "0" for v in m.predict(GG))


log_clf = LogisticRegression(solver="liblinear", random_state=42)
rnd_clf = RandomForestClassifier(n_estimators=10, random_state=42)
svm_clf = SVC(gamma="auto", random_state=42)
modelos = {
    "lr": log_clf, "rf10": rnd_clf, "svc": svm_clf,
    "hard": VotingClassifier([("lr", log_clf), ("rf", rnd_clf), ("svc", svm_clf)], voting="hard"),
    "soft": VotingClassifier([("lr", LogisticRegression(solver="liblinear", random_state=42)), ("rf", RandomForestClassifier(n_estimators=10, random_state=42)),
                              ("svc", SVC(gamma="auto", probability=True, random_state=42))], voting="soft"),
    "arvore": DecisionTreeClassifier(random_state=42),
    "bag500": BaggingClassifier(DecisionTreeClassifier(random_state=42), n_estimators=500, max_samples=100, bootstrap=True, n_jobs=-1, random_state=42),
    "rf500": RandomForestClassifier(n_estimators=500, max_leaf_nodes=16, n_jobs=-1, random_state=42),
}
luas_modelos = {}
for k, m in modelos.items():
    m.fit(Xa, ya)
    pb = m.predict(Xb)
    luas_modelos[k] = {"acc": r4(accuracy_score(yb, pb)), "accTreino": r4(accuracy_score(ya, m.predict(Xa))), "acertos": int((pb == yb).sum()), "pred": "".join(str(int(v)) for v in pb), "grade": grade(m)}

# bagging com mais ou menos árvores: a fronteira suaviza com o número de árvores
bag_n = {}
for n in [1, 5, 25, 100, 500]:
    m = BaggingClassifier(DecisionTreeClassifier(random_state=42), n_estimators=n, max_samples=100, bootstrap=True, n_jobs=-1, random_state=42).fit(Xa, ya)
    pb = m.predict(Xb)
    bag_n[str(n)] = {"acc": r4(accuracy_score(yb, pb)), "acertos": int((pb == yb).sum()), "grade": grade(m)}

oob = BaggingClassifier(DecisionTreeClassifier(random_state=42), n_estimators=500, bootstrap=True, n_jobs=-1, oob_score=True, random_state=40).fit(Xa, ya)
oob_res = {"oob": r4(oob.oob_score_), "oob_acertos": int(round(oob.oob_score_ * len(ya))), "teste": r4(accuracy_score(yb, oob.predict(Xb))), "teste_acertos": int((oob.predict(Xb) == yb).sum())}

# ------------------------------------------------------------------------------------------------ Iris
iris = load_iris()
rf_iris = RandomForestClassifier(n_estimators=500, n_jobs=-1, random_state=42).fit(iris["data"], iris["target"])
iris_imp = [r4(v) for v in rf_iris.feature_importances_]

# ------------------------------------------------------------------------------------------------ boosting
np.random.seed(42)
X_reg = np.random.rand(100, 1) - 0.5
y_reg = 3 * X_reg[:, 0] ** 2 + 0.05 * np.random.randn(100)
t1 = DecisionTreeRegressor(max_depth=2).fit(X_reg, y_reg)
y2 = y_reg - t1.predict(X_reg)
t2 = DecisionTreeRegressor(max_depth=2).fit(X_reg, y2)
y3 = y2 - t2.predict(X_reg)
t3 = DecisionTreeRegressor(max_depth=2).fit(X_reg, y3)
xs = np.linspace(-0.5, 0.5, 201).reshape(-1, 1)
gb = GradientBoostingRegressor(max_depth=2, n_estimators=3, learning_rate=1.0, init="zero").fit(X_reg, y_reg)
gb_lr = GradientBoostingRegressor(max_depth=2, n_estimators=10, learning_rate=0.5, init="zero").fit(X_reg, y_reg)
boost = {
    "x": [r4(v) for v in X_reg[:, 0]], "y": [r4(v) for v in y_reg],
    "h": [[r4(v) for v in t.predict(xs)] for t in (t1, t2, t3)],
    "soma3": [r4(v) for v in t1.predict(xs) + t2.predict(xs) + t3.predict(xs)],
    "sklearn3": [r4(v) for v in gb.predict(xs)],
    "sklearn10_lr05": [r4(v) for v in gb_lr.predict(xs)],
    "mse": [r4(np.mean((y_reg - s) ** 2)) for s in (np.zeros(100), t1.predict(X_reg), t1.predict(X_reg) + t2.predict(X_reg), t1.predict(X_reg) + t2.predict(X_reg) + t3.predict(X_reg))],
}

# ------------------------------------------------------------------------------------------------ caso de crédito
# Fonte: quadros do caso no material da aula (apêndice). Contagens por regra e grupo; o grupo "corte" é o removido.
caso = {
    "curto": {"alvo": "target_never_paid", "regras": {
        "politica": {"corte": [5479, 4234, 1245], "resto": [76979, 72359, 4620], "iv": 0.24},
        "never_paid": {"corte": [9659, 7925, 1734], "resto": [72799, 68668, 4131], "iv": 0.248},
        "combinada": {"corte": [12840, 10559, 2281], "resto": [69618, 66034, 3584], "iv": 0.347}}},
    "longo": {"alvo": "target_60ever9p", "regras": {
        "politica": {"corte": [5130, 1966, 3151], "resto": [56433, 38316, 17705], "iv": 0.127},
        "never_paid": {"corte": [7407, 3393, 3966], "resto": [54156, 36889, 16890], "iv": 0.099},
        "combinada": {"corte": [10374, 4748, 5570], "resto": [51189, 35534, 15286], "iv": 0.15}}},
    "auc": [
        {"modelo": "Atraso curto, baixa renda", "treino": 0.688, "validacao": 0.627},
        {"modelo": "Atraso curto, alta renda", "treino": 0.707, "validacao": 0.665},
        {"modelo": "Exemplo de alta renda (BVS)", "treino": 0.832, "validacao": 0.645},
    ],
}
caso_ref = {}
for prazo, c in caso.items():
    if prazo == "auc":
        continue
    caso_ref[prazo] = {}
    for k, r in c["regras"].items():
        # rótulos por contrato classificado (bom ou mau); os sem classificação ficam fora de precisão e recall
        yv = np.r_[np.zeros(r["corte"][1]), np.ones(r["corte"][2]), np.zeros(r["resto"][1]), np.ones(r["resto"][2])].astype(bool)
        pv = np.r_[np.ones(r["corte"][1] + r["corte"][2]), np.zeros(r["resto"][1] + r["resto"][2])].astype(bool)
        g = np.array([r["corte"][1], r["resto"][1]]) / (r["corte"][1] + r["resto"][1])
        b = np.array([r["corte"][2], r["resto"][2]]) / (r["corte"][2] + r["resto"][2])
        woe = np.log(g / b)
        caso_ref[prazo][k] = {"precisao": r4(precision_score(yv, pv)), "recall": r4(recall_score(yv, pv)),
                              "volume": r4(r["corte"][0] / (r["corte"][0] + r["resto"][0])), "resto": r4(r["resto"][2] / (r["resto"][1] + r["resto"][2])),
                              "woe": [r4(v) for v in woe], "iv": r4(np.sum((g - b) * woe))}

# ------------------------------------------------------------------------------------------------ conferências de fórmula
binomial = []
for n in [1, 11, 101, 501, 1001, 3001, 10001]:
    for p in [0.51, 0.55, 0.6]:
        binomial.append({"n": n, "p": p, "maioria": r4(binom.sf(n // 2, n, p))})
binormal = [{"a": a, "b": b, "auc": r4(norm.cdf(a / math.sqrt(1 + b * b))), "tpr": [r4(norm.cdf(a + b * norm.ppf(f))) for f in (0.01, 0.1, 0.29, 0.5, 0.9)]}
            for a, b in [(0.9815, 0.5), (1.588, 1.6)]]
fora = [{"m": m, "fora": r4((1 - 1 / m) ** m)} for m in [1, 2, 3, 5, 10, 40, 375, 10000]]

versoes = {"scikit-learn": sklearn.__version__, "scipy": scipy.__version__, "numpy": np.__version__}
base = {
    "versoes": versoes,
    "mnist": {"n": 70000, "nTreino": 60000, "nTeste": 10000, "pixels": 784, "lado": 28, "contagemDigitos": contagem_digitos,
              "cv": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
              "auc": r4(roc_auc_score(y5, score_cv)), "aucFloresta": r4(roc_auc_score(y5, proba_rf)),
              "treinoAjustado": {"acc": r4(acc_treino)}, "teste": {"acc": r4(acc_teste), "tn": int(cm_teste[0]), "fp": int(cm_teste[1]), "fn": int(cm_teste[2]), "tp": int(cm_teste[3])},
              "hist": {"bordas": bordas, "pos": hpos, "neg": hneg}, "histFloresta": {"bordas": bordas_rf, "pos": hpos_rf, "neg": hneg_rf},
              "exemplos": exemplos},
    "luas": {"treino": {"x": [[r4(a), r4(b)] for a, b in Xa], "y": ya.tolist()}, "teste": {"x": [[r4(a), r4(b)] for a, b in Xb], "y": yb.tolist()},
             "grade": {"x": [r4(GX[0]), r4(GX[-1]), len(GX)], "y": [r4(GY[0]), r4(GY[-1]), len(GY)]},
             "modelos": luas_modelos, "baggingN": bag_n, "oob": oob_res},
    "iris": {"nomes": ["Comprimento da sépala", "Largura da sépala", "Comprimento da pétala", "Largura da pétala"], "importancia": iris_imp},
    "boosting": boost,
    "caso": caso,
}
(RAIZ / "src/lib/capitulo12").mkdir(parents=True, exist_ok=True)
(RAIZ / "src/lib/capitulo12/base.json").write_text(json.dumps(base, ensure_ascii=False, separators=(",", ":")))
ref = {
    "versoes": versoes,
    "mnist": {"acuracia": r4(accuracy_score(y5, pred_cv)), "precisao": r4(precision_score(y5, pred_cv)), "recall": r4(recall_score(y5, pred_cv)), "f1": r4(f1_score(y5, pred_cv)),
              "trivial": r4(accuracy_score(y5, np.zeros(60000, bool))), "auc": r4(roc_auc_score(y5, score_cv)), "aucFloresta": r4(roc_auc_score(y5, proba_rf)), "limiares": conf_limiares},
    "luas": {k: v["acc"] for k, v in luas_modelos.items()},
    "binomial": binomial, "binormal": binormal, "fora": fora, "caso": caso_ref,
    "boosting": {"mse": boost["mse"]},
}
(RAIZ / "tests/fixtures/capitulo12-referencia.json").write_text(json.dumps(ref, ensure_ascii=False, indent=1))
print(json.dumps({"cv": base["mnist"]["cv"], "acc": ref["mnist"]["acuracia"], "auc": ref["mnist"]["auc"], "aucRF": ref["mnist"]["aucFloresta"], "teste": base["mnist"]["teste"],
                  "treino": acc_treino, "luas": ref["luas"], "bag": {k: v["acc"] for k, v in bag_n.items()}, "oob": oob_res, "iris": iris_imp, "mse": boost["mse"],
                  "caso": caso_ref, "bins": len(bordas)}, ensure_ascii=False))
