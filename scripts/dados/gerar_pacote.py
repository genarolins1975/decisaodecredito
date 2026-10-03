"""
Gera o pacote de bases do trabalho final (capítulo 11): dez bases sintéticas, uma por produto do catálogo, com
1.000.000 de propostas cada (cerca de 750 mil de treino, 150 mil de validação e 100.000 IDs no OOT), o dicionário,
o OOT sem desfecho, os rótulos do OOT (só o professor), o zip do aluno, o zip do professor, os materiais comuns e o
manifesto.json no formato de scripts/dados/publicar.ts. Determinístico: a mesma semente gera os mesmos arquivos,
com os mesmos sha256, em qualquer máquina com as mesmas versões de NumPy e pandas.

Uso:  python3 scripts/dados/gerar_pacote.py <saida> [--versao 2026.1] [--somente 01,02] [--n 1000000]
Depois: npx tsx --tsconfig scripts/tsconfig.json scripts/dados/publicar.ts <saida>   (exige as credenciais S3_* do bucket)

Desenho comum às dez bases (ver content/trabalho-final/*.md, entregues ao aluno):
  evento      default_12m: 90+ dias de atraso em 12 meses após a concessão; só nas aprovadas, maduras e não cedidas;
  partições   treino jan/21 a jun/23, validação jul/23 a dez/23, OOT jan/24 a jun/24 (sem desfecho);
  política    a política histórica aprova cerca de 70% por um escore próprio: o rótulo tem viés de seleção;
  armadilhas  IDs duplicados, clientes que repetem entre partições, bureau posterior à proposta, valores fora do
              domínio, faltantes que crescem no canal digital, três campos posteriores à decisão (vazamento);
  tempo       na validação a prevalência sobe levemente; no OOT sobe mais, o canal digital ganha peso e cada
              produto tem a sua mudança própria (ver enfase no catálogo).
"""
import argparse
import hashlib
import io
import json
import math
import pathlib
import shutil
import zipfile
from datetime import date

import numpy as np
import pandas as pd

RAIZ = pathlib.Path(__file__).resolve().parents[2]
COMUM = RAIZ / "content" / "trabalho-final"
CORTE = date(2025, 1, 31)
SEMENTE = 20261003

UFS = ["SP", "MG", "RJ", "BA", "PR", "RS", "PE", "CE", "PA", "SC", "GO", "MA", "AM", "ES", "PB", "RN", "MT", "AL", "PI", "DF", "MS", "SE", "RO", "TO", "AC", "AP", "RR"]
PESO_UF = np.array([22, 10, 8, 7, 6, 6, 4.5, 4.3, 4, 3.6, 3.4, 3.3, 2, 2, 1.9, 1.7, 1.7, 1.6, 1.6, 1.5, 1.4, 1.1, 0.9, 0.8, 0.4, 0.4, 0.3])
FAIXAS = ["18-24", "25-34", "35-44", "45-59", "60+"]

# produto: (codigo, slug, nome, prevalência alvo no treino aprovado, renda mediana, valor mediano, prazo, taxa mensal, LGD, receita, população)
PRODUTOS = [
    ("01", "pessoal", "Crédito pessoal", 0.075, 4200, 9000, [12, 24, 36, 48], 0.039, 0.70, "PF assalariados e autônomos"),
    ("02", "cartao", "Cartão de crédito", 0.11, 3800, 6000, [12], 0.085, 0.80, "PF com histórico de uso de cartão"),
    ("03", "consignado", "Consignado privado", 0.04, 3600, 15000, [24, 36, 48, 60, 72], 0.022, 0.45, "Empregados de empresas privadas"),
    ("04", "veiculos", "Financiamento de veículos", 0.055, 6500, 45000, [36, 48, 60], 0.019, 0.40, "Compradores de veículos usados"),
    ("05", "habitacional", "Financiamento habitacional", 0.018, 11000, 280000, [240, 300, 360], 0.009, 0.20, "Compradores do primeiro imóvel"),
    ("06", "microcredito", "Microcrédito produtivo", 0.14, 3000, 5000, [6, 12, 18], 0.035, 0.75, "Microempreendedores individuais"),
    ("07", "capital_giro", "Capital de giro", 0.085, 60000, 80000, [12, 18, 24], 0.024, 0.60, "Micro e pequenas empresas varejistas"),
    ("08", "recebiveis", "Antecipação de recebíveis", 0.065, 90000, 50000, [1, 2, 3, 6], 0.019, 0.55, "Pequenos prestadores B2B"),
    ("09", "rural", "Custeio rural", 0.095, 15000, 60000, [12], 0.012, 0.50, "Pequenos produtores agrícolas"),
    ("10", "equipamentos", "Financiamento de equipamentos", 0.05, 120000, 250000, [36, 48, 60], 0.016, 0.35, "PMEs industriais e de serviços"),
]
ENFASE = {
    "01": "Estabilidade do vínculo e busca recente de crédito; efeito predominantemente aditivo.",
    "02": "Utilização elevada com pagamento parcial; interação e efeito de limiar.",
    "03": "Folga de renda consignável, estabilidade de emprego e quebra temporal controlada.",
    "04": "Comprometimento, garantia e idade do veículo; não confundir PD com LGD.",
    "05": "Entrada, reserva e capacidade de pagamento; poucos eventos e maior incerteza.",
    "06": "Volatilidade de entradas, maturidade do negócio e histórico irregular.",
    "07": "Sazonalidade, estoque e margem; necessidade de variáveis de tendência.",
    "08": "Concentração de sacados, prazo, interação não linear e mudança de composição.",
    "09": "Sazonalidade de caixa e choque comum; cenário sintético, sem extrapolação setorial.",
    "10": "Cobertura de pedidos, alavancagem e estabilidade dos fluxos.",
}


def sha256(p: pathlib.Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for bloco in iter(lambda: f.read(1 << 20), b""):
            h.update(bloco)
    return h.hexdigest()


def arquivo(p: pathlib.Path, raiz: pathlib.Path) -> dict:
    return {"arquivo": str(p.relative_to(raiz)), "sha256": sha256(p), "bytes": p.stat().st_size}


def sig(z):
    return 1.0 / (1.0 + np.exp(-z))


# ---------------------------------------------------------------- variáveis próprias de cada produto
def especificas(cod, n, rng, oot):
    """Devolve (dicionário de colunas, contribuição ao log odds, linhas do dicionário de dados)."""
    c, z, dic = {}, np.zeros(n), []
    def add(nome, valores, efeito, tipo, unidade, descricao):
        c[nome] = valores
        dic.append((nome, tipo, unidade, "na proposta", "preditora", "permitido", descricao))
        return efeito
    if cod == "01":
        tempo = rng.gamma(2.0, 30, n).round()
        vinc = rng.choice(["clt", "autonomo", "servidor", "informal"], n, p=[0.52, 0.25, 0.1, 0.13])
        z += add("tempo_emprego_meses", tempo, -0.012 * np.minimum(tempo, 120), "inteiro", "meses", "tempo no emprego ou na atividade atual")
        z += add("tipo_vinculo", vinc, np.select([vinc == "informal", vinc == "autonomo", vinc == "servidor"], [0.55, 0.25, -0.45], 0.0), "categoria", "clt/autonomo/servidor/informal", "vínculo de trabalho declarado")
    elif cod == "02":
        pagmin = rng.beta(1.6, 3.5, n)
        rot = rng.beta(2, 3, n)
        z += add("pct_faturas_pagamento_minimo_12m", pagmin.round(3), 2.2 * pagmin, "proporção", "0 a 1", "fração das faturas dos últimos 12 meses pagas no valor mínimo")
        z += add("rotativo_medio_pct_limite", rot.round(3), 0.0, "proporção", "0 a 1", "saldo médio no rotativo como fração do limite")
        # interação e limiar: rotativo só pesa com pagamento mínimo frequente
        z += 2.4 * np.where((pagmin > 0.5) & (rot > 0.55), 1.0, 0.0)
    elif cod == "03":
        margem = rng.beta(2.2, 2.8, n)
        tempo = rng.gamma(2.0, 40, n).round()
        porte = rng.choice(["micro", "pequena", "media", "grande"], n, p=[0.15, 0.3, 0.3, 0.25])
        # quebra temporal controlada: a folga consignável perde força em 2024
        ef_m = np.where(oot, -0.8, -2.0) * margem
        z += add("margem_consignavel_livre", margem.round(3), ef_m, "proporção", "0 a 1", "fração da margem consignável ainda livre na proposta")
        z += add("tempo_empresa_meses", tempo, -0.008 * np.minimum(tempo, 150), "inteiro", "meses", "tempo de vínculo com a empregadora conveniada")
        z += add("porte_empregadora", porte, np.select([porte == "micro", porte == "pequena", porte == "grande"], [0.5, 0.2, -0.3], 0.0), "categoria", "micro/pequena/media/grande", "porte da empresa conveniada")
    elif cod == "04":
        entrada = rng.beta(2, 5, n)
        idade_v = rng.gamma(2.2, 2.5, n).round()
        z += add("entrada_pct", entrada.round(3), -2.5 * entrada, "proporção", "0 a 1", "entrada como fração do valor do veículo")
        z += add("idade_veiculo_anos", idade_v, 0.06 * np.minimum(idade_v, 15), "inteiro", "anos", "idade do veículo na proposta")
        z += add("valor_veiculo", (rng.lognormal(math.log(60000), 0.4, n)).round(-2), 0.0, "real", "R$", "valor de avaliação do veículo (garantia; afeta LGD, não PD)")
    elif cod == "05":
        ltv = rng.beta(6, 3, n) * 0.9
        reserva = rng.gamma(1.5, 3, n).round(1)
        z += add("ltv", ltv.round(3), 3.0 * np.maximum(ltv - 0.6, 0), "proporção", "0 a 1", "valor financiado sobre valor do imóvel")
        z += add("reserva_meses", reserva, -0.12 * np.minimum(reserva, 12), "real", "meses de parcela", "reserva financeira declarada, em meses de parcela")
    elif cod == "06":
        vol = rng.gamma(2, 0.15, n)
        idade_n = rng.gamma(1.6, 18, n).round()
        z += add("volatilidade_receita", vol.round(3), 1.6 * vol, "real", "coeficiente de variação", "volatilidade mensal das entradas nos últimos 12 meses")
        z += add("idade_negocio_meses", idade_n, -0.45 * np.log1p(idade_n), "inteiro", "meses", "tempo de atividade do negócio")
        z += add("historico_irregular", (rng.random(n) < 0.22).astype(int), 0.0, "binária", "0/1", "houve mês sem movimentação nos últimos 12 meses")
    elif cod == "07":
        saz = rng.beta(2, 4, n)
        estoque = rng.gamma(3, 15, n).round()
        margem = rng.normal(0.32, 0.1, n).clip(0.02, 0.8)
        tend = rng.normal(0.02, 0.12, n)
        z += add("indice_sazonalidade", saz.round(3), 1.2 * saz, "proporção", "0 a 1", "amplitude sazonal do faturamento")
        z += add("giro_estoque_dias", estoque, 0.006 * np.minimum(estoque, 180), "inteiro", "dias", "dias de estoque")
        z += add("margem_bruta", margem.round(3), -2.0 * margem, "proporção", "0 a 1", "margem bruta dos últimos 12 meses")
        z += add("tendencia_faturamento_6m", tend.round(3), -3.0 * tend, "real", "variação relativa", "variação do faturamento médio dos últimos 6 meses contra os 6 anteriores")
    elif cod == "08":
        conc = rng.beta(2, 3, n)
        prazo_r = rng.gamma(4, 12, n).round()
        nsac = rng.poisson(8, n) + 1
        z += add("concentracao_top1_sacado", conc.round(3), 2.8 * np.maximum(conc - 0.45, 0) ** 1.5 * 3, "proporção", "0 a 1", "participação do maior sacado na carteira de recebíveis")
        z += add("prazo_medio_recebiveis_dias", prazo_r, 0.008 * prazo_r, "inteiro", "dias", "prazo médio ponderado dos recebíveis cedidos")
        z += add("n_sacados", nsac, -0.05 * np.minimum(nsac, 20), "inteiro", "contagem", "número de sacados distintos nos últimos 6 meses")
    elif cod == "09":
        area = rng.lognormal(math.log(40), 0.7, n).round(1)
        cultura = rng.choice(["soja", "milho", "cafe", "hortifruti"], n, p=[0.35, 0.3, 0.15, 0.2])
        seguro = (rng.random(n) < 0.55).astype(int)
        z += add("area_ha", area, -0.25 * np.log(area / 40), "real", "hectares", "área plantada financiada")
        z += add("cultura", cultura, np.select([cultura == "hortifruti", cultura == "cafe"], [0.35, -0.2], 0.0), "categoria", "soja/milho/cafe/hortifruti", "cultura financiada")
        z += add("seguro_rural", seguro, -0.6 * seguro, "binária", "0/1", "contratou seguro rural")
    elif cod == "10":
        cob = rng.gamma(2.5, 2, n).round(1)
        alav = rng.gamma(2, 0.8, n).round(2)
        z += add("cobertura_pedidos_meses", cob, -0.12 * np.minimum(cob, 15), "real", "meses", "pedidos firmes em carteira, em meses de faturamento")
        z += add("alavancagem", alav, 0.35 * np.minimum(alav, 6), "real", "dívida ÷ EBITDA", "dívida financeira sobre EBITDA")
        z += add("volatilidade_fluxo", rng.gamma(2, 0.1, n).round(3), 0.0, "real", "coeficiente de variação", "volatilidade do fluxo de caixa operacional")
    return c, z, dic


def datas_do_periodo(rng, ini, fim, n, cresce=0.0):
    dias = (fim - ini).days + 1
    u = rng.random(n)
    if cresce:  # mais propostas no fim do período
        u = (np.sqrt(1 + cresce * (2 + cresce) * u) - 1) / cresce if cresce > 0 else u
    return pd.to_datetime(ini) + pd.to_timedelta((u * dias).astype(int), unit="D")


def gerar_base(prod, n_total, raiz_saida, versao):
    cod, slug, nome, prev, renda_med, valor_med, prazos, taxa, lgd, pop = prod
    rng = np.random.default_rng(SEMENTE + int(cod))
    n_oot = 100_000 if n_total >= 1_000_000 else max(1000, n_total // 10)
    n_val = int(round((n_total - n_oot) * 0.1667))
    n_tr = n_total - n_oot - n_val
    part = np.array(["treino"] * n_tr + ["validacao"] * n_val + ["oot"] * n_oot)
    n = n_total
    dt = pd.DatetimeIndex(np.concatenate([
        datas_do_periodo(rng, date(2021, 1, 1), date(2023, 6, 30), n_tr, cresce=0.6),
        datas_do_periodo(rng, date(2023, 7, 1), date(2023, 12, 31), n_val),
        datas_do_periodo(rng, date(2024, 1, 1), date(2024, 6, 30), n_oot),
    ]))
    oot = part == "oot"; val = part == "validacao"

    # cadastro
    p_dig = np.where(oot, 0.55, np.where(val, 0.42, 0.35))
    u = rng.random(n)
    canal = np.where(u < p_dig, "digital", np.where(u < p_dig + 0.35, "agencia", "correspondente"))
    uf = rng.choice(UFS, n, p=PESO_UF / PESO_UF.sum())
    faixa = rng.choice(FAIXAS, n, p=[0.12, 0.3, 0.27, 0.22, 0.09])
    renda = rng.lognormal(math.log(renda_med), 0.55, n).round(2)
    relac = rng.exponential(36, n).round()

    # bureau
    score = rng.normal(620, 115, n).clip(0, 1000).round()
    util = rng.beta(2, 3, n)
    consultas = rng.poisson(1.4 + 0.6 * (canal == "digital"), n)
    atraso_b = np.where(rng.random(n) < 0.78, 0, rng.gamma(1.4, 18, n)).round()
    lat = rng.integers(0, 31, n)
    data_bureau = dt - pd.to_timedelta(lat, unit="D")

    # condições
    valor = rng.lognormal(math.log(valor_med), 0.6, n).round(-1)
    prazo = rng.choice(prazos, n)
    tx = (taxa * rng.lognormal(0, 0.15, n)).round(4)
    parcela = np.where(tx > 0, valor * tx / (1 - (1 + tx) ** (-prazo)), valor / prazo).round(2)
    comp = parcela / np.maximum(renda, 1)

    # risco latente
    z = (-0.0065 * (score - 620) + 1.6 * util + 0.16 * consultas + 0.018 * np.minimum(atraso_b, 90)
         - 0.30 * np.log(renda / renda_med) - 0.005 * np.minimum(relac, 120) + 1.8 * np.clip(comp - 0.25, -0.25, 1.0)
         + np.select([faixa == "18-24", faixa == "60+"], [0.35, 0.15], 0.0) + 0.15 * (canal == "digital") + 0.1 * (canal == "correspondente")
         + rng.normal(0, 0.35, n))
    esp, z_esp, dic_esp = especificas(cod, n, rng, oot)
    z = z + z_esp
    z += np.where(oot, 0.22, np.where(val, 0.06, 0.0))  # deriva de nível no tempo

    # política histórica: escore próprio com ruído, aprova cerca de 70%
    pol = -z + rng.normal(0, 0.9, n)
    aprov = (pol > np.quantile(pol[part == "treino"], 0.30)).astype(int)
    # intercepto para a prevalência alvo entre aprovadas do treino
    lo, hi = -12.0, 6.0
    m = (part == "treino") & (aprov == 1)
    for _ in range(60):
        b0 = (lo + hi) / 2
        if sig(b0 + z[m]).mean() > prev: hi = b0
        else: lo = b0
    pd_v = sig(b0 + z)
    y = (rng.random(n) < pd_v).astype(int)

    # rótulo: só aprovadas, maduras e não cedidas
    data_rot = dt + pd.DateOffset(months=12) + pd.Timedelta(days=30)
    cedida = rng.random(n) < 0.015
    tem = (aprov == 1) & (~cedida) & (data_rot <= pd.Timestamp(CORTE)) & (~oot)
    default = np.where(tem, y, -1)
    atraso12 = np.where(aprov == 1, np.where(y == 1, rng.integers(90, 361, n), np.where(rng.random(n) < 0.18, rng.integers(1, 90, n), 0)), -1)
    reneg = np.where(aprov == 1, (rng.random(n) < np.where(y == 1, 0.45, 0.04)).astype(int), -1)

    # armadilhas de qualidade
    falta_renda = rng.random(n) < (0.02 + 0.05 * (canal == "digital") + 0.04 * oot * (canal == "digital"))
    falta_score = rng.random(n) < 0.018
    bureau_depois = rng.random(n) < 0.004
    data_bureau = np.where(bureau_depois, dt + pd.to_timedelta(rng.integers(1, 25, n), unit="D"), data_bureau)
    util_fora = rng.random(n) < 0.0008
    renda_neg = rng.random(n) < 0.0003

    # clientes: 18% das propostas são de clientes que já pediram antes (podem cruzar partições)
    cli = np.arange(n) + 1
    rep = np.where(rng.random(n) < 0.18)[0]
    cli[rep] = np.maximum(1, cli[rep] - rng.integers(1, 120_000, rep.size))
    ids = np.array([f"{cod}P{i:07d}" for i in range(1, n + 1)])

    df = pd.DataFrame({
        "proposta_id": ids, "cliente_id": [f"{cod}C{c:07d}" for c in cli],
        "data_proposta": pd.Series(dt).dt.strftime("%Y-%m-%d"), "particao_sugerida": part,
        "canal": canal, "uf": uf, "faixa_etaria": faixa,
        "renda_mensal": np.where(falta_renda, np.nan, np.where(renda_neg, -renda, renda)),
        "idade_relacionamento_meses": relac,
        "score_bureau": np.where(falta_score, np.nan, score), "data_bureau": pd.Series(pd.to_datetime(data_bureau)).dt.strftime("%Y-%m-%d"),
        "utilizacao_limite": np.where(util_fora, (1 + rng.random(n) * 0.6), util).round(3),
        "consultas_bureau_90d": consultas, "atraso_max_bureau_6m": atraso_b,
        "valor_solicitado": valor, "prazo_meses": prazo, "taxa_juros_mensal": tx, "parcela_estimada": parcela,
        **esp,
        "aprovada": aprov,
        "data_rotulo_disponivel": pd.Series(data_rot).dt.strftime("%Y-%m-%d"),
        "default_12m": default, "dias_atraso_max_12m": atraso12, "fl_renegociacao_pos_concessao": reneg,
    })
    for col in ["default_12m", "dias_atraso_max_12m", "fl_renegociacao_pos_concessao"]:
        df[col] = df[col].astype("Int64").mask(df[col] < 0)
    dev = df[~oot].copy()
    # IDs duplicados: 37 linhas repetidas por inteiro no desenvolvimento
    dup = dev.sample(37, random_state=int(cod))
    dev = pd.concat([dev, dup]).sort_values(["data_proposta", "proposta_id"], kind="stable").reset_index(drop=True)
    cols_oot = [c for c in df.columns if c not in ("default_12m", "dias_atraso_max_12m", "fl_renegociacao_pos_concessao", "data_rotulo_disponivel", "particao_sugerida")]
    oot_df = df.loc[oot, cols_oot].reset_index(drop=True)
    rot = pd.DataFrame({"proposta_id": df.loc[oot, "proposta_id"].values,
                        "y": np.where((df.loc[oot, "aprovada"].values == 1) & (~cedida[oot]), y[oot], -1)})
    rot["y"] = rot["y"].astype("Int64").mask(rot["y"] < 0)

    # dicionário
    dic = [
        ("proposta_id", "texto", "chave artificial", "na proposta", "identificador", "não usar como preditora", "identificador da proposta; deveria ser único"),
        ("cliente_id", "texto", "chave artificial", "na proposta", "agrupamento", "não usar como preditora", "identificador do cliente; um cliente pode ter várias propostas"),
        ("data_proposta", "data", "AAAA-MM-DD", "na proposta", "tempo", "particionar; não usar como preditora", "data da proposta, instante da decisão"),
        ("particao_sugerida", "categoria", "treino/validacao", "definida pelo curso", "partição", "não usar como preditora", "partição temporal recomendada (só no desenvolvimento)"),
        ("canal", "categoria", "agencia/digital/correspondente", "na proposta", "preditora e subgrupo", "permitido", "canal de originação"),
        ("uf", "categoria", "sigla", "na proposta", "subgrupo", "permitido com análise de equidade", "unidade da federação do proponente"),
        ("faixa_etaria", "categoria", "anos", "na proposta", "subgrupo", "permitido com análise de equidade", "faixa etária do proponente"),
        ("renda_mensal", "real", "R$", "na proposta", "preditora", "permitido", "renda mensal declarada ou comprovada"),
        ("idade_relacionamento_meses", "inteiro", "meses", "na proposta", "preditora", "permitido", "tempo de relacionamento com a instituição"),
        ("score_bureau", "inteiro", "0 a 1000", "na data_bureau", "preditora", "permitido se data_bureau ≤ data_proposta", "escore de bureau"),
        ("data_bureau", "data", "AAAA-MM-DD", "na consulta", "tempo", "auditar", "data da consulta de bureau usada"),
        ("utilizacao_limite", "proporção", "0 a 1", "na data_bureau", "preditora", "permitido se data_bureau ≤ data_proposta", "utilização média do limite rotativo no mercado"),
        ("consultas_bureau_90d", "inteiro", "contagem", "na data_bureau", "preditora", "permitido se data_bureau ≤ data_proposta", "consultas de crédito nos 90 dias anteriores"),
        ("atraso_max_bureau_6m", "inteiro", "dias", "na data_bureau", "preditora", "permitido se data_bureau ≤ data_proposta", "maior atraso no mercado nos 6 meses anteriores"),
        ("valor_solicitado", "real", "R$", "na proposta", "preditora e EAD", "permitido", "valor solicitado; base da exposição na conta econômica"),
        ("prazo_meses", "inteiro", "meses", "na proposta", "preditora", "permitido", "prazo do contrato"),
        ("taxa_juros_mensal", "proporção", "ao mês", "na proposta", "preditora e receita", "permitido", "taxa de juros ofertada"),
        ("parcela_estimada", "real", "R$", "na proposta", "preditora", "permitido", "parcela pela tabela Price com valor, prazo e taxa"),
        *dic_esp,
        ("aprovada", "binária", "0/1", "na decisão", "política histórica", "não usar como preditora", "decisão da política histórica; só aprovadas têm desfecho"),
        ("data_rotulo_disponivel", "data", "AAAA-MM-DD", "após maturação", "tempo", "não usar como preditora", "data a partir da qual o desfecho de 12 meses existe"),
        ("default_12m", "binária anulável", "0/1", "após maturação", "alvo", "alvo", "90+ dias de atraso em 12 meses; vazio sem rótulo"),
        ("dias_atraso_max_12m", "inteiro anulável", "dias", "depois da decisão", "resultado", "bloquear: vazamento", "maior atraso do contrato nos 12 meses após a concessão"),
        ("fl_renegociacao_pos_concessao", "binária anulável", "0/1", "depois da decisão", "resultado", "bloquear: vazamento", "o contrato foi renegociado depois da concessão"),
    ]
    dic_df = pd.DataFrame(dic, columns=["campo", "tipo", "unidade", "disponivel_quando", "papel", "uso_permitido", "descricao"])

    # escrita
    pasta = raiz_saida / f"{cod}_{slug}"
    (pasta / "dados").mkdir(parents=True, exist_ok=True)
    dev.to_csv(pasta / "dados" / "propostas_desenvolvimento.csv", index=False)
    oot_df.to_csv(pasta / "dados" / "propostas_oot_sem_desfecho.csv", index=False)
    dic_df.to_csv(pasta / "dados" / "dicionario_dados.csv", index=False)
    dev.head(1000).to_csv(pasta / "dados" / "amostra_leitura.csv", index=False)

    tr_ok = (dev.particao_sugerida == "treino") & dev.default_12m.notna()
    va_ok = (dev.particao_sugerida == "validacao") & dev.default_12m.notna()
    resumo = {
        "codigo": cod, "produto": nome, "propostas_desenvolvimento": int(len(dev)), "linhas_duplicadas": 37,
        "treino": int((dev.particao_sugerida == "treino").sum()), "treino_rotulo": int(tr_ok.sum()), "treino_defaults": int(dev.default_12m[tr_ok].sum()),
        "validacao": int((dev.particao_sugerida == "validacao").sum()), "validacao_rotulo": int(va_ok.sum()), "validacao_defaults": int(dev.default_12m[va_ok].sum()),
        "oot_ids": int(len(oot_df)), "oot_rotulo": int(rot.y.notna().sum()), "oot_defaults": int(rot.y.sum()),
        "aprovacao_treino": float(aprov[part == "treino"].mean()), "lgd": lgd, "taxa_mensal_media": taxa,
    }
    (pasta / "problema-negocio.md").write_text(problema_negocio(prod, resumo), encoding="utf-8")
    for nome_md in ["README.md", "definicao-default.md", "datas-e-maturacao.md", "TEMPLATE-MANIFESTO-MODELO.md", "ROTEIRO-DE-TESTES.md"]:
        shutil.copy(COMUM / nome_md, pasta / nome_md)
    shutil.copy(raiz_saida / "guia-dados-e-missoes.xlsx", pasta / "guia-dados-e-missoes.xlsx")

    zip_aluno = raiz_saida / f"{cod}_{slug}.zip"
    with zipfile.ZipFile(zip_aluno, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for f in sorted(pasta.rglob("*")):
            if f.is_file():
                zi = zipfile.ZipInfo(f"{cod}_{slug}/{f.relative_to(pasta)}", date_time=(2025, 2, 1, 0, 0, 0))
                zi.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(zi, f.read_bytes())
    dic_arq = raiz_saida / f"{cod}_dicionario_dados.csv"; shutil.copy(pasta / "dados" / "dicionario_dados.csv", dic_arq)
    oot_arq = raiz_saida / f"{cod}_propostas_oot_sem_desfecho.csv"; shutil.copy(pasta / "dados" / "propostas_oot_sem_desfecho.csv", oot_arq)
    rot_arq = raiz_saida / f"{cod}_rotulos_oot.csv"; rot.to_csv(rot_arq, index=False)

    # zip do professor: rótulos, PD verdadeira, armadilhas e resumo
    from sklearn.metrics import roc_auc_score
    m_va = (part == "validacao") & tem
    m_oo = oot & (aprov == 1) & (~cedida)
    auc_va = float(roc_auc_score(y[m_va], pd_v[m_va])); auc_oo = float(roc_auc_score(y[m_oo], pd_v[m_oo]))
    armad = pd.concat([
        pd.DataFrame({"tipo": "proposta_id duplicado", "proposta_id": dup.proposta_id.values}),
        pd.DataFrame({"tipo": "bureau posterior à proposta", "proposta_id": ids[bureau_depois & ~oot]}),
        pd.DataFrame({"tipo": "utilizacao_limite acima de 1", "proposta_id": ids[util_fora & ~oot]}),
        pd.DataFrame({"tipo": "renda negativa", "proposta_id": ids[renda_neg & ~oot & ~falta_renda]}),
    ])
    prof = io.BytesIO()
    with zipfile.ZipFile(prof, "w", zipfile.ZIP_DEFLATED) as zf:
        def put(nome_arq, dados):
            zi = zipfile.ZipInfo(f"{cod}_{slug}_professor/{nome_arq}", date_time=(2025, 2, 1, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED
            zf.writestr(zi, dados)
        put("rotulos_oot.csv", rot.to_csv(index=False))
        put("pd_verdadeira.csv", pd.DataFrame({"proposta_id": ids, "pd_verdadeira": pd_v.round(6)}).to_csv(index=False))
        put("armadilhas.csv", armad.to_csv(index=False))
        put("RESUMO-PROFESSOR.md", resumo_professor(prod, resumo, auc_va, auc_oo, b0))
    prof_arq = raiz_saida / f"{cod}_{slug}_professor.zip"; prof_arq.write_bytes(prof.getvalue())
    shutil.rmtree(pasta)
    print(f"{cod} {nome}: {resumo['propostas_desenvolvimento']} linhas no desenvolvimento, treino {resumo['treino_rotulo']} com rótulo e {resumo['treino_defaults']} defaults ({resumo['treino_defaults']/resumo['treino_rotulo']:.2%}), OOT {resumo['oot_ids']} IDs; AUC da PD verdadeira {auc_va:.3f} na validação e {auc_oo:.3f} no OOT", flush=True)
    return {
        "codigo": f"{cod}_{slug}", "nome": nome, "produto": nome, "populacao": pop, "enfase": ENFASE[cod], "versao": versao,
        "notas": f"Base sintética, semente {SEMENTE + int(cod)}; {resumo['propostas_desenvolvimento']} linhas no desenvolvimento e {resumo['oot_ids']} IDs no OOT.",
        "oot_ids": resumo["oot_ids"],
        "aluno_zip": arquivo(zip_aluno, raiz_saida), "dicionario": arquivo(dic_arq, raiz_saida), "oot": arquivo(oot_arq, raiz_saida),
        "rotulos": arquivo(rot_arq, raiz_saida), "professor_zip": arquivo(prof_arq, raiz_saida),
    }


def mil(x):
    return f"{x:,}".replace(",", ".")


def problema_negocio(prod, r):
    cod, slug, nome, prev, renda_med, valor_med, prazos, taxa, lgd, pop = prod
    return f"""# Problema de negócio: {nome}

Base {cod}. População: {pop.lower()}. Ênfase do caso: {ENFASE[cod]}

## A decisão

A instituição decide, proposta a proposta, se aprova, recusa ou envia para revisão manual. Hoje a decisão usa uma política histórica (o campo `aprovada`), que aprovou cerca de {r['aprovacao_treino']:.0%} das propostas do treino. O comitê quer um modelo de PD que ordene o risco, produza probabilidades calibradas e sustente uma política econômica melhor que a atual.

## O que a base contém

| Partição | Propostas | Aprovadas com rótulo |
|---|---|---|
| treino (jan/21 a jun/23) | {mil(r['treino'])} | {mil(r['treino_rotulo'])} |
| validação (jul/23 a dez/23) | {mil(r['validacao'])} | {mil(r['validacao_rotulo'])} |
| OOT cego (jan/24 a jun/24) | {mil(r['oot_ids'])} | sem desfecho no pacote |

As contagens acima incluem as {r['linhas_duplicadas']} linhas duplicadas do desenvolvimento, que a missão 3 precisa encontrar e tratar. A prevalência de default você calcula na sua base.

## Parâmetros econômicos para a missão 10

| Parâmetro | Valor do cenário base | Observação |
|---|---|---|
| EAD | `valor_solicitado` | exposição no evento, sem amortização no cenário base |
| LGD | {lgd:.0%} | fração perdida no default; estresse de +10 pontos |
| Receita | `taxa_juros_mensal` × `prazo_meses` × `valor_solicitado` × 0,35 | margem líquida aproximada sobre o contrato que paga |
| Custo de revisão manual | R$ 45 por proposta | capacidade de 3.000 revisões por mês |
| Custo de originação | R$ 25 por contrato aprovado | |

Os valores são hipóteses do caso, não dados de mercado. A missão 10 declara cada uma e mostra a sensibilidade da política a LGD, prevalência e receita.
"""


def resumo_professor(prod, r, auc_va, auc_oo, b0):
    cod, slug, nome = prod[0], prod[1], prod[2]
    return f"""# Resumo do professor: base {cod}, {nome}

Não distribuir aos alunos.

| Item | Valor |
|---|---|
| Linhas do desenvolvimento (com 37 duplicadas) | {r['propostas_desenvolvimento']} |
| Treino: aprovadas com rótulo e defaults | {r['treino_rotulo']} e {r['treino_defaults']} ({r['treino_defaults']/r['treino_rotulo']:.4f}) |
| Validação: aprovadas com rótulo e defaults | {r['validacao_rotulo']} e {r['validacao_defaults']} ({r['validacao_defaults']/r['validacao_rotulo']:.4f}) |
| OOT: IDs, com rótulo e defaults | {r['oot_ids']}, {r['oot_rotulo']} e {r['oot_defaults']} ({r['oot_defaults']/r['oot_rotulo']:.4f}) |
| AUC da PD verdadeira (teto teórico) | {auc_va:.4f} na validação, {auc_oo:.4f} no OOT |
| Intercepto do gerador | {b0:.4f} |

## Mudanças no tempo

- Validação: +0,06 no log odds (prevalência levemente maior); canal digital de 35% para 42%.
- OOT: +0,22 no log odds; canal digital em 55%; faltantes de renda crescem no digital.
{"- Produto 03: a margem consignável livre perde força no OOT (efeito de −2,0 para −0,8 no log odds)." if cod == "03" else ""}

## Armadilhas (lista completa em armadilhas.csv)

37 IDs duplicados no desenvolvimento; cerca de 0,4% das consultas de bureau posteriores à proposta; utilização acima de 1 em cerca de 0,08%; renda negativa em cerca de 0,03%; 18% das propostas de clientes que repetem; três campos posteriores à decisão (dias_atraso_max_12m, fl_renegociacao_pos_concessao, default_12m); cerca de 1,5% das aprovadas sem rótulo (cedidas).
"""


def guia_xlsx(destino):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    wb = Workbook(); ws = wb.active; ws.title = "Missões"
    cab = ["Missão", "Pergunta", "Entrada", "Arquivo de entrega", "Página na plataforma"]
    linhas = [
        (1, "A pergunta congelada antes dos dados", "problema-negocio.md, definicao-default.md, amostra_leitura.csv", "01-especificacao-modelo.md", "/aulas/c11p3"),
        (2, "O dicionário como contrato", "dicionario_dados.csv, propostas_desenvolvimento.csv", "02-contrato-dados.csv", "/aulas/c11p4"),
        (3, "Auditoria com IDs afetados", "propostas_desenvolvimento.csv", "03-auditoria-qualidade.md", "/aulas/c11p5"),
        (4, "O modelo perfeito que está errado", "dicionario_dados.csv, datas-e-maturacao.md", "04-auditoria-vazamento.csv", "/aulas/c11p6"),
        (5, "O calendário como protocolo", "datas-e-maturacao.md, particao_sugerida", "05-particoes-e-maturacao.md", "/aulas/c11p7"),
        (6, "A régua mínima", "treino aprovado e maduro", "06-baseline.json", "/aulas/c11p8"),
        (7, "Pré-processamento, três famílias e explicação", "treino e validação", "07-previsoes-validacao.csv", "/aulas/c11p9 a c11p11"),
        (8, "Roteiro de discriminação", "07-previsoes-validacao.csv", "08-discriminacao.md", "/aulas/c11p12"),
        (9, "Calibração", "07-previsoes-validacao.csv", "09-calibracao.md", "/aulas/c11p13"),
        (10, "A conta econômica da PD", "problema-negocio.md, previsões calibradas", "10-politica-economica.md", "/aulas/c11p14"),
        (11, "Subgrupos, estresse e alertas", "validação com canal, uf e faixa_etaria", "11-equidade-estresse-monitoramento.md", "/aulas/c11p15 e c11p16"),
        (12, "Pacote congelado antes do arquivo cego", "TEMPLATE-MANIFESTO-MODELO.md, propostas_oot_sem_desfecho.csv", "MANIFESTO-MODELO.md e previsoes_oot.csv", "/aulas/c11p17"),
    ]
    ws.append(cab)
    for l in linhas: ws.append(list(l))
    for c in ws[1]: c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="00205B")
    for col, w in zip("ABCDE", [8, 42, 52, 40, 24]): ws.column_dimensions[col].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row: c.alignment = Alignment(wrap_text=True, vertical="top")
    ws2 = wb.create_sheet("Arquivos")
    ws2.append(["Arquivo", "Conteúdo"])
    for a, d in [("README.md", "ordem de trabalho, entregas e regras do teste cego"), ("problema-negocio.md", "produto, política histórica, contagens e parâmetros econômicos"),
                 ("definicao-default.md", "evento, horizonte e população com rótulo"), ("datas-e-maturacao.md", "datas dos campos, maturação e partição recomendada"),
                 ("dados/dicionario_dados.csv", "contrato de dados"), ("dados/propostas_desenvolvimento.csv", "treino e validação, com rótulo nas aprovadas maduras"),
                 ("dados/propostas_oot_sem_desfecho.csv", "OOT jan/24 a jun/24, 100.000 IDs, sem desfecho"), ("dados/amostra_leitura.csv", "1.000 linhas para leitura inicial"),
                 ("TEMPLATE-MANIFESTO-MODELO.md", "modelo do manifesto de congelamento"), ("ROTEIRO-DE-TESTES.md", "testes e critérios de aceite por missão")]:
        ws2.append([a, d])
    for c in ws2[1]: c.font = Font(bold=True, color="FFFFFF"); c.fill = PatternFill("solid", fgColor="00205B")
    ws2.column_dimensions["A"].width = 40; ws2.column_dimensions["B"].width = 70
    wb.save(destino)
    # data fixa nas propriedades para o arquivo ser reprodutível
    import zipfile as zf_
    buf = io.BytesIO()
    with zf_.ZipFile(destino) as zin, zf_.ZipFile(buf, "w", zf_.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            dados = zin.read(item.filename)
            if item.filename == "docProps/core.xml":
                import re
                dados = re.sub(rb"<dcterms:(created|modified)[^>]*>[^<]*</dcterms:\1>", lambda m: m.group(0).split(b">")[0] + b">2025-02-01T00:00:00Z</dcterms:" + m.group(1) + b">", dados)
            zi = zf_.ZipInfo(item.filename, date_time=(2025, 2, 1, 0, 0, 0)); zi.compress_type = zf_.ZIP_DEFLATED
            zout.writestr(zi, dados)
    pathlib.Path(destino).write_bytes(buf.getvalue())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("saida"); ap.add_argument("--versao", default="2026.1"); ap.add_argument("--somente", default=""); ap.add_argument("--n", type=int, default=1_000_000)
    a = ap.parse_args()
    raiz = pathlib.Path(a.saida).resolve(); raiz.mkdir(parents=True, exist_ok=True)
    guia_xlsx(raiz / "guia-dados-e-missoes.xlsx")
    comum = []
    for nome_md, titulo, desc in [
        ("README.md", "Capítulo 11 (trabalho final): README do pacote", "Ordem de trabalho, arquivos, entregas por missão e regras do teste cego."),
        ("TEMPLATE-MANIFESTO-MODELO.md", "Capítulo 11 (trabalho final): modelo do manifesto", "Preencher antes de abrir o OOT; congela dados, pipeline, calibrador, política e reprodução."),
        ("ROTEIRO-DE-TESTES.md", "Capítulo 11 (trabalho final): roteiro de testes", "Testes executáveis e critérios de aceite de cada missão."),
        ("definicao-default.md", "Capítulo 11 (trabalho final): definição de default", "Evento, horizonte, população com rótulo e campos posteriores à decisão."),
        ("datas-e-maturacao.md", "Capítulo 11 (trabalho final): datas e maturação", "Quando cada campo existe, maturação e partição recomendada."),
    ]:
        shutil.copy(COMUM / nome_md, raiz / nome_md)
        comum.append({"arquivo": arquivo(raiz / nome_md, raiz), "titulo": titulo, "descricao": desc, "kind": "arquivo", "status": "published"})
    comum.append({"arquivo": arquivo(raiz / "guia-dados-e-missoes.xlsx", raiz), "titulo": "Capítulo 11 (trabalho final): guia de dados e missões", "descricao": "As doze missões com entrada, arquivo de entrega e página da plataforma.", "kind": "arquivo", "status": "published"})
    somente = [s for s in a.somente.split(",") if s]
    bases = [gerar_base(p, a.n, raiz, a.versao) for p in PRODUTOS if not somente or p[0] in somente]
    man = {"versao": a.versao, "gerado_em": "2025-02-01", "comum": comum, "bases": bases}
    (raiz / "manifesto.json").write_text(json.dumps(man, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"manifesto.json: {len(comum)} materiais comuns, {len(bases)} bases em {raiz}")


if __name__ == "__main__":
    main()
