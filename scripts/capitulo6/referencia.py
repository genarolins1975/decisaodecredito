"""
Referência numérica do capítulo 6, calculada com bibliotecas de terceiros e não com o código da plataforma.

GradientBoostingClassifier do scikit-learn (loss="log_loss", subsample=1; o critério de corte é o de Friedman) sobre a amostra de
ajuste (src/lib/capitulo6/base.json), com as variáveis utilização, atraso máximo em 6 meses e score de bureau, nesta
ordem; log odds por estágio na própria amostra, na validação e na janela fora do tempo; estrutura das primeiras árvores;
contribuições do shap.TreeExplainer (tree_path_dependent, saída em log odds) para algumas propostas da janela; AUC e
log loss pelo scikit-learn.

Uso:  python3 scripts/capitulo6/referencia.py
Saída: tests/fixtures/capitulo6-referencia.json
"""
import json
import pathlib

import numpy as np
import shap
import sklearn
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import log_loss, roc_auc_score

RAIZ = pathlib.Path(__file__).resolve().parents[2]
B = json.loads((RAIZ / "src/lib/capitulo6/base.json").read_text())
X = lambda d: np.column_stack([d["util"], d["atr"], d["sc"]]).astype(float)
Xa, ya = X(B["ajuste"]), np.array(B["ajuste"]["y"])
Xv, yv = X(B["validacao"]), np.array(B["validacao"]["y"])
Xo, yo = X(B["oot"]), np.array(B["oot"]["y"])

CONFIGS = {
    "base": dict(learning_rate=0.1, n_estimators=60, max_depth=2, min_samples_leaf=40),
    "profunda": dict(learning_rate=0.1, n_estimators=60, max_depth=3, min_samples_leaf=20),
    "lenta": dict(learning_rate=0.05, n_estimators=40, max_depth=2, min_samples_leaf=40),
    "toco": dict(learning_rate=0.3, n_estimators=30, max_depth=1, min_samples_leaf=40),
}


def arvore(t):
    tr = t.tree_
    def no(i):
        if tr.children_left[i] == -1:
            return {"folha": True, "valor": float(tr.value[i][0][0]), "n": int(tr.n_node_samples[i])}
        return {"folha": False, "variavel": int(tr.feature[i]), "corte": float(tr.threshold[i]), "n": int(tr.n_node_samples[i]), "esq": no(tr.children_left[i]), "dir": no(tr.children_right[i])}
    return no(0)


ref = {"versoes": {"scikit-learn": sklearn.__version__, "numpy": np.__version__, "shap": shap.__version__}, "modelos": {}}
for nome, cfg in CONFIGS.items():
    m = GradientBoostingClassifier(loss="log_loss", subsample=1.0, random_state=0, **cfg).fit(Xa, ya)
    est = lambda Z: np.array(list(m.staged_decision_function(Z)))[:, :, 0]
    Sa, Sv, So = est(Xa), est(Xv), est(Xo)
    f0 = float(np.log(ya.mean() / (1 - ya.mean())))
    marcos = [1, 5, 10, 20, cfg["n_estimators"]]
    ref["modelos"][nome] = {
        "cfg": cfg, "f0": f0,
        "arvores": [arvore(m.estimators_[k, 0]) for k in range(3)],
        "marcos": marcos,
        "ajusteAmostra": {str(k): Sa[k - 1][:15].tolist() for k in marcos},
        "validacaoAmostra": {str(k): Sv[k - 1][:15].tolist() for k in marcos},
        "ootAmostra": {str(k): So[k - 1][:15].tolist() for k in marcos},
        "auc": {str(k): {"ajuste": roc_auc_score(ya, Sa[k - 1]), "validacao": roc_auc_score(yv, Sv[k - 1]), "oot": roc_auc_score(yo, So[k - 1])} for k in marcos},
        "logloss": {str(k): {"ajuste": log_loss(ya, 1 / (1 + np.exp(-Sa[k - 1]))), "validacao": log_loss(yv, 1 / (1 + np.exp(-Sv[k - 1]))), "oot": log_loss(yo, 1 / (1 + np.exp(-So[k - 1])))} for k in marcos},
    }
    ref["modelos"][nome]["importancia"] = m.feature_importances_.tolist()
    if nome == "base":
        ex = shap.TreeExplainer(m, feature_perturbation="tree_path_dependent", model_output="raw")
        sv = ex.shap_values(Xo[:10])
        ref["modelos"][nome]["shap"] = {"base": float(np.ravel(ex.expected_value)[0]), "phi": np.asarray(sv).tolist(), "escore": m.decision_function(Xo[:10]).tolist()}

# exemplo didático: as 16 propostas dos capítulos 4 e 5 (utilização e atraso), profundidade 2, taxa 0,4, quatro árvores
D = B["didatica"]; Xd = np.array([[d["util"], d["atraso"]] for d in D], dtype=float); yd = np.array([d["y"] for d in D])
md = GradientBoostingClassifier(loss="log_loss", subsample=1.0, random_state=0, learning_rate=0.4, n_estimators=4, max_depth=2, min_samples_leaf=2).fit(Xd, yd)
Sd = np.array(list(md.staged_decision_function(Xd)))[:, :, 0]
ref["didatica"] = {"cfg": dict(learning_rate=0.4, n_estimators=4, max_depth=2, min_samples_leaf=2), "f0": float(np.log(yd.mean() / (1 - yd.mean()))),
                   "arvores": [arvore(md.estimators_[k, 0]) for k in range(4)], "estagios": Sd.tolist(), "logloss": [log_loss(yd, 1 / (1 + np.exp(-s))) for s in Sd]}

# referência linear: logística sem penalidade nas três variáveis, ajustada na amostra de ajuste (statsmodels)
import statsmodels.api as sm
lg = sm.Logit(ya, sm.add_constant(Xa)).fit(disp=0, tol=1e-12, maxiter=200)
za = sm.add_constant(Xa) @ lg.params; zv = sm.add_constant(Xv) @ lg.params; zo = sm.add_constant(Xo) @ lg.params
ref["logistica"] = {"coef": lg.params.tolist(), "auc": {"ajuste": roc_auc_score(ya, za), "validacao": roc_auc_score(yv, zv), "oot": roc_auc_score(yo, zo)},
                    "logloss": {"ajuste": log_loss(ya, 1 / (1 + np.exp(-za))), "validacao": log_loss(yv, 1 / (1 + np.exp(-zv))), "oot": log_loss(yo, 1 / (1 + np.exp(-zo)))}}
ref["versoes"]["statsmodels"] = sm.__version__ if hasattr(sm, "__version__") else __import__("statsmodels").__version__

saida = RAIZ / "tests/fixtures/capitulo6-referencia.json"
saida.write_text(json.dumps(ref, indent=1))
print("ok", saida, {k: round(v["auc"][str(v["cfg"]["n_estimators"])]["validacao"], 4) for k, v in ref["modelos"].items()})
