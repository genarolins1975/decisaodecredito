"""Monta e executa experimento.ipynb a partir de experimento.py.

O notebook não recalcula nada por conta própria: ele chama as mesmas funções do
script e confere os números que a aula exibe. Executar com

    python3 experimento/gerar_notebook.py

deixa o arquivo com as saídas gravadas.
"""
from __future__ import annotations

from pathlib import Path

import nbformat
from nbclient import NotebookClient
from nbformat.v4 import new_code_cell, new_markdown_cell, new_notebook

PASTA = Path(__file__).resolve().parent
DESTINO = PASTA / "experimento.ipynb"

MD = [
    """# Experimento da aula de decisão de crédito

Base sintética, nenhum dado real de cliente. O notebook executa `experimento.py`,
confere os números que a apresentação exibe e grava `saida/resultados.json`,
`saida/metadados.json` e `saida/base_sintetica.csv.gz`.

O protocolo é temporal: treino em 2018 e 2019, validação no primeiro semestre de
2021, calibração e política no segundo semestre de 2022 e teste entre fevereiro e
julho de 2024. Cada partição só entra depois que o alvo de 12 meses maturou.""",

    """## 1. Execução completa

`executar()` gera a base, ajusta os três modelos, calibra por Platt na partição de
calibração e avalia uma única vez no teste. Nenhum hiperparâmetro é escolhido
olhando o teste.""",

    "## 2. Protocolo e partições",

    "## 3. Seleção de cada modelo, decidida na validação",

    """## 4. Resultado no teste

Os três modelos ficam próximos. A aula não tem vencedor predeterminado: a
diferença entre o maior e o menor AUC é menor que a variabilidade de uma amostra
única deste tamanho.""",

    """## 5. Calibração

A calibração de Platt é ajustada na partição de calibração e aplicada ao teste sem
reajuste. Por ser monótona, ela não altera a ordenação nem a AUC: a igualdade
abaixo é exata.""",

    """## 6. Explicação local: Shapley interventional exato

Seis grupos semânticos de características, 64 coalizões, valor exato. A propriedade
de eficiência exige que a base somada às contribuições reproduza o escore do
cliente.""",

    """## 7. Política congelada

Margem de R$ 1.200, LGD de 60% e EAD de R$ 10.000 dão ponto de equilíbrio em PD de
20%. O corte é congelado antes do teste e aplicado igualmente aos três modelos.""",

    """## 8. Reprodutibilidade

Semente, versões e resumo criptográfico dos arquivos gerados.""",
]

CODE = [
    """import json, sys
from pathlib import Path

sys.path.insert(0, str(Path.cwd()))
import experimento as exp

resultados, metadados = exp.executar(verbose=False)
print("partições:", [p["nome"] for p in resultados["protocolo"]["particoes"]])
print("modelos:", sorted(resultados["avaliacao"]))""",

    """P = resultados["protocolo"]
print(f'semente {P["semente"]}')
print(f'{"partição":12s} {"início":>10s} {"fim":>10s} {"n":>6s} {"eventos":>8s} '
      f'{"taxa":>7s} {"alvo completo":>14s}')
for p in P["particoes"]:
    print(f'{p["nome"]:12s} {p["inicio"]:>10s} {p["fim"]:>10s} {p["n"]:6d} '
          f'{p["eventos"]:8d} {p["taxa"]*100:6.2f}% {p["alvo_conhecido"]:>14s}')
print("\\nmedianas de imputação, calculadas só no treino:")
for k, v in P["medianas_imputacao"].items():
    print(f'  {k:8s} {v:,.4f}')""",

    """M = resultados["modelos"]

# Linha da grade que corresponde ao C selecionado na validação.
def escolhido(modelo):
    return min(modelo["grade"], key=lambda g: abs(g["C"] - modelo["C"]))

for nome in ["logit", "logit_flex"]:
    g = escolhido(M[nome])
    print(f'{nome:11s} C={M[nome]["C"]:<8g} perda de validação {g["perda_validacao"]:.5f} '
          f'AUC de validação {g["auc_validacao"]:.6f}')
a = M["arvore"]
print(f'árvore        profundidade {a["profundidade"]}, mínimo por folha '
      f'{a["min_folha"]}, {a["folhas"]} folhas')
b = M["boosting"]
print(f'boosting      taxa {b["taxa"]}, profundidade {b["profundidade"]}, '
      f'{b["n_estimators"]} árvores treinadas')
print(f'              melhor iteração na validação: {b["melhor_iteracao"]}, '
      f'usada no modelo final')
print(f'              a regra de paciência {b["paciencia"]} com tolerância '
      f'{b["tolerancia"]:g} encerraria em {b["iteracao_parada"]}')
print("\\ncoeficientes padronizados do logit:")
for nome, coef in zip(M["logit"]["colunas"], M["logit"]["coeficientes_padronizados"]):
    print(f'  {nome:16s} {coef:+.4f}')""",

    """A = resultados["avaliacao"]
print(f'{"modelo":12s} {"AUC":>9s} {"KS":>7s} {"Brier":>9s} {"log loss":>9s} '
      f'{"n":>6s} {"eventos":>8s}')
for k in ["logit", "logit_flex", "arvore", "boosting"]:
    t = A[k]["teste"]
    print(f'{k:12s} {t["auc"]:9.6f} {t["ks"]:7.4f} {t["brier_calibrada"]:9.5f} '
          f'{t["log_loss_calibrada"]:9.5f} {t["n"]:6d} {t["eventos"]:8d}')
aucs = [A[k]["teste"]["auc"] for k in ["logit", "arvore", "boosting"]]
print(f'\\namplitude entre os três modelos principais: {max(aucs)-min(aucs):.6f}')""",

    """for k in ["logit", "arvore", "boosting"]:
    t = A[k]["teste"]
    print(f'{k:10s} AUC bruta {t["auc"]:.6f}  AUC calibrada {t["auc_calibrada"]:.6f}  '
          f'iguais: {t["auc"] == t["auc_calibrada"]}')
print("\\nfaixas de calibração do boosting no teste, previsto contra observado:")
for i, f in enumerate(A["boosting"]["calibracao_teste_calibrada"], 1):
    print(f'  faixa {i:2d}  n={f["n"]:4d}  previsto {f["prev_media"]*100:6.2f}%  '
          f'observado {f["obs"]*100:6.2f}%  Wilson '
          f'[{f["wilson"][0]*100:5.2f}%, {f["wilson"][1]*100:5.2f}%]')""",

    """E = resultados["explicacao"]
print(f'referência do fundo: F = {E["locais"][0]["base"]:.6f}')
for loc in E["locais"]:
    print(f'{loc["cliente"]:6s} escore {loc["escore"]:+.6f}  '
          f'base + contribuições {loc["conferencia_soma"]:+.6f}  '
          f'erro {loc["erro_soma"]:.2e}  PD calibrada {loc["pd_calibrada"]*100:.2f}%')
print("\\ncontribuições de Bruno, em escore:")
for g, v in sorted(E["locais"][1]["contribuicoes"].items(), key=lambda x: -abs(x[1])):
    print(f'  {g:8s} {v:+.6f}')""",

    """pol = resultados["politica"]
corte = pol["logit"]["corte_congelado"]
eco = resultados["protocolo"]["economia"]
# Formatação em português: milhar com ponto e decimal com vírgula.
def reais(v, casas=2):
    txt = f'{abs(v):,.{casas}f}'.replace(",", "@").replace(".", ",").replace("@", ".")
    return ("−R$ " if v < 0 else "R$ ") + txt

print(f'margem {reais(eco["margem"], 0)} · LGD {eco["lgd"]*100:.0f}% · '
      f'EAD {reais(eco["ead"], 0)} · equilíbrio {eco["corte_equilibrio"]*100:.1f}%')
print(f'\\ncorte congelado {corte*100:.0f}%')
print(f'{"modelo":10s} {"aprovação":>10s} {"inadimplência":>14s} {"por aprovado":>14s} '
      f'{"total":>14s}')
for k in ["logit", "arvore", "boosting"]:
    linha = min(pol[k]["teste"], key=lambda l: abs(l["corte"] - corte))
    print(f'{k:10s} {linha["aprovacao"]*100:9.2f}% {linha["inadimplencia"]*100:13.2f}% '
          f'{reais(linha["resultado_medio"]):>16s} '
          f'{reais(linha["resultado_total"], 0):>18s}')""",

    """import hashlib

for k, v in metadados.items():
    print(f'{k:20s} {v}')

# Conferência independente: os resumos gravados batem com os arquivos em disco.
base = Path("saida")
for arquivo, chave in [("resultados.json", "sha256_resultados"),
                       ("base_sintetica.csv.gz", "sha256_base")]:
    atual = hashlib.sha256((base / arquivo).read_bytes()).hexdigest()
    print(f'\\n{arquivo}: {"confere" if atual == metadados[chave] else "DIVERGE"}')
    print(f'  gravado {metadados[chave]}')
    print(f'  disco   {atual}')""",
]


def montar():
    celulas = []
    for i, md in enumerate(MD):
        celulas.append(new_markdown_cell(md))
        if i < len(CODE):
            celulas.append(new_code_cell(CODE[i]))
    nb = new_notebook(cells=celulas, metadata={
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python"},
    })
    cliente = NotebookClient(nb, timeout=900, kernel_name="python3",
                             resources={"metadata": {"path": str(PASTA)}})
    cliente.execute()
    nbformat.write(nb, DESTINO)
    vazias = [i for i, c in enumerate(nb.cells)
              if c.cell_type == "code" and not c.get("outputs")]
    print(f"notebook gravado: {DESTINO}")
    print(f"células de código: {sum(1 for c in nb.cells if c.cell_type == 'code')}")
    print(f"células sem saída: {vazias if vazias else 'nenhuma'}")


if __name__ == "__main__":
    montar()
