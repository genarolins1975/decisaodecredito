/**
 * Dados do Trabalho 2 por entrega, gerados a partir da avaliação do professor (17/10/2026, consolidada em 19/10/2026).
 * Pontos por critério de 0 a 2; o critério 4 fica em 1,6 para todos por decisão do professor em 19/10/2026.
 * Textos ajustados para a devolutiva: frases que só valiam antes do recebimento do código foram atualizadas e
 * nenhuma entrega cita outra. Cálculo e régua em trabalho-2.ts.
 */
import type { EntregaT2 } from "./trabalho-2";

export const ENTREGAS_T2: EntregaT2[] = [
  {
    "id": "consignado-tomaz",
    "titulo": "Consignado privado · base 03",
    "modalidade": "grupo",
    "base": "03_consignado v1 (consignado privado)",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "Trabalho2_Dossie_Modelo_V1.pdf (85 p., remessa de 10/10). Errata do email não incorporada ao PDF."
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "credito-pd-consignado-congelado-v1.zip, sha256 387fa624 confere; base fora do zip por ser restrita. Código de Tomaz (remessa de 06/10) não entregue, ficou em link externo."
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "docs/MANIFESTO-MODELO.md no zip (sha256 6ed10f44 confere) e Anexo C do dossiê. O 1_manifesto_modelo_v1.0.pdf de 06/10 descreve outro modelo."
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "presente",
        "texto": "previsoes_oot.csv, 100.000 IDs únicos, sem faltantes nem extras contra o OOT oficial, sha256 3065c719 confere com email e Anexo D."
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "Trabalho2_Blueprint_V1.pdf (18 p.), com fluxograma, alçadas, comitês, RAS, normas e painel."
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "População, unidade, instante, evento 90+, horizonte 12m e uso explícitos; Anexo B do dossiê e docs/problema_negocio no zip."
      },
      {
        "id": "M2",
        "status": "cumprida",
        "texto": "Contrato de dados em CSV com 30 campos, tipo, domínio, disponibilidade, papel, uso no modelo e teste associado."
      },
      {
        "id": "M3",
        "status": "cumprida",
        "texto": "Relatório do roteiro com regra, contagem, até 5 IDs e ação por teste; 91 funções de teste no zip; Anexo A."
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "Classificação de todos os campos por data de nascimento e experimento honesto contra proibidos (AUC 0,748 contra 0,887 com score reconsultado e 1,000 com campos do horizonte); Anexo B."
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "Partição só por data, prova de maturação linha a linha (669.436 de 669.436), default por safra e IC; Anexo B."
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "Baseline de 5,00% aprendido só no treino, AUC 0,5 e log loss 0,20969 na validação; Anexo B."
      },
      {
        "id": "M7",
        "status": "parcial",
        "texto": "Logística, árvore, boosting, random forest e votação com as mesmas 8 variáveis, CV temporal no treino e explicação local de 3 casos; o arquivo de previsões de validação não foi entregue, só código e teste 20."
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "AUC com IC de DeLong, ROC, KS, Gini, ganho por decil, DeLong e bootstrap pareado, novos contra recorrentes; Anexo B."
      },
      {
        "id": "M9",
        "status": "cumprida",
        "texto": "Calibração por decil com n e IC de Wilson, Brier e log loss, teste honesto jul a set contra out a dez; calibrador final na validação, OOT intocado."
      },
      {
        "id": "M10",
        "status": "cumprida",
        "texto": "PD x LGD x EAD, receita, custo de R$ 40, limiar 17,84% com custo de capital, faixa manual, estresse isolado e conjunto, ponte que fecha; CSV por proposta só por hash, não entregue."
      },
      {
        "id": "M11",
        "status": "cumprida",
        "texto": "AUC e O/P por prazo, canal, região, UF, porte, setor, faixa etária e emprego; choques de prevalência, ausência e mix de canal; painel de 14 sinais com limite, frequência, responsável e ação."
      },
      {
        "id": "M12",
        "status": "parcial",
        "texto": "Manifesto com versões, semente 20260927, uv.lock e 13 hashes que conferem; mas tag, manifesto e execução do OOT no mesmo minuto (07/10 20:49), pré registro de 05/10 refere outro modelo, e o teste 1 do OOT registrou falhou sem interromper."
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "Jornada em 11 pontos com campo, momento, decisor, prazo e ferramenta; fluxograma na p. 3 do blueprint; cobrança desenhada sobre a Lei 10.820."
      },
      {
        "id": "E14",
        "status": "cumprida",
        "texto": "Três linhas, política escrita, matriz de alçadas sem corte por valor, segregação, comitês e RAS com a conta de cada limite a partir da M10."
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar, faixa manual, exceções por alçada, ausência e categoria nova com WoE, LGPD e 13 normas citadas por artigo; justificativa da logística contra o boosting."
      },
      {
        "id": "E16",
        "status": "cumprida",
        "texto": "Painel ligado à RAS, gatilhos em quatro níveis com dono, rito por comitê e sumário executivo de uma página com três decisões para o Conselho."
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada com os seis elementos. Contrato de dados por campo. Regra de data do bureau anula 36.001 linhas. Score reconsultado bloqueado com prova de vazamento (AUC 0,887). Maturação provada em todas as linhas.",
        "lacunas": "A entrada do setor na etapa 7 da seleção foi motivada por achado na validação; declarado, mas é uso indireto da validação na escolha de variáveis."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Cinco modelos com mesmos IDs, variáveis e validação; hiperparâmetros por CV temporal em três rodadas no treino; DeLong e bootstrap pareado; teste honesto da calibração; trava de código que exige a tag para rodar o OOT.",
        "lacunas": "Preservação do OOT não demonstrável para o modelo entregue: tag, manifesto e execução do OOT no mesmo minuto; o pré registro e o manifesto de 06/10 são de outro modelo v1.0 (Tomaz). O teste 1 do OOT acusou divergência em consultas_bureau_3m em 135 IDs, marcou falhou e a entrega seguiu com o primeiro registro."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Uso delimitado ao consignado privado no regime da Lei 15.179/2025, com risco de mudança de regime monitorado. Painel de 14 sinais com métrica, limite, frequência, responsável e ação, testado no histórico. Gatilhos recalibrar, rever política, retreinar e suspender com dono.",
        "lacunas": "Limites de PSI declarados como convenção sem fonte. O/P fora da faixa em 16 de 36 meses no histórico sugere alerta ruidoso."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "Zip da tag com Makefile, README passo a passo, uv.lock com versões iguais às do manifesto, semente única e 13 hashes que conferem com o SHA256SUMS. Decisões datadas e atribuídas com evidência; resposta da IA recusada documentada (1.038 defaults mantidos).",
        "lacunas": "Apropriação documentada só de Roberto; Diana sem contribuição rastreável e Tomaz com modelo próprio divergente, cujo código não foi entregue. Arquivo de hashes da base citado no README não está no zip.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 2 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 2,
        "evidencia": "Blueprint gerado pelo mesmo código do dossiê, com tabela de conferência e testes 22 a 27. Corte de 17,84%, faixa manual de 3.363 em 14.988, 14 sinais e regra do OOT batem entre dossiê, blueprint, manifesto e apresentação.",
        "lacunas": "No fluxograma a proposta incompleta só chega à faixa manual depois do losango de PD, a fila manual não tem saída de recusa e a contraproposta aceita vai direto à formalização sem o recálculo de PD descrito no texto."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "Treze normas com dispositivos e vigência conferida: Lei 10.820 e 15.179, LGPD arts. 5, 6, 7 X, 11, 16, 18, 20 e 41, Res. CMN 4.557, 4.553, 4.958, 4.966, 4.968, 4.879, 4.595, 4.935, 4.949 e 4.893.",
        "lacunas": "Prazos de retenção, de averbação e de arrependimento declarados como não conferidos. Lei 12.414 e regras do SCR não citadas."
      },
      "bp_viabilidade": {
        "pontos": 2,
        "evidencia": "Uso da faixa manual de 22% da capacidade, dimensionado em 2 analistas para o uso atual e 7 para a capacidade cheia; prazos por etapa; sistemas listados; cenário de volume em dobro identifica capital e concentração como limites.",
        "lacunas": "Tempos por caso e prazos de formalização são premissas do assistente, sem medição."
      },
      "bp_conselho": {
        "pontos": 2,
        "evidencia": "Sumário de uma página diz o que se decide, risco assumido (PD 4,52%, perda 19,4% da receita, R$ 84,20 mi no pior estresse), quem responde por linha, o que dispara ação e três decisões a ratificar.",
        "lacunas": "Densidade numérica alta para leitura de conselheiro; sem visual único de síntese."
      }
    },
    "verificacoes": [
      "SHA256 calculado: zip 387fa624, MANIFESTO 6ed10f44, protocolo.toml fc0c35cc e uv.lock fa0c36b3 conferem com o SHA256SUMS de congelamento.",
      "As 13 entradas de artefatos do SHA256SUMS aparecem idênticas no manifesto; 11 delas (dados e saídas) não foram entregues e não puderam ser recalculadas.",
      "Hash da base de desenvolvimento d7db160c é o mesmo no manifesto de Tomaz e no de Roberto.",
      "previsoes_oot.csv: sha256 3065c719 confere; 100.000 linhas e IDs únicos; 71.958 aprova, 1.747 manual, 26.295 recusa; PD de 0,00397 a 0,74456, média 0,08295; versão v1.0; nenhum aprova com PD acima de 17,84%.",
      "Anexo D informa OOT com 100.389 linhas e 100.000 IDs, igual à checagem objetiva do OOT oficial da base 03.",
      "Versões do uv.lock (numpy 2.5.3, pandas 3.0.6, scikit learn 1.9.1, scipy 1.18.1, statsmodels 0.15.0) iguais às declaradas no manifesto.",
      "Contradição de ordem: manifesto gerado em 07/10 20:49, zip da tag com arquivos de 07/10 20:49 e relatório do OOT gerado em 07/10 20:49; o pré registro de 05/10 e o manifesto de 06/10 descrevem o logit com splines de Tomaz, 15 variáveis, limiares 13,79% e 19,64%, semente 20261003.",
      "Contradição entre membros: Tomaz recodifica os 1.038 defaults com atraso abaixo de 90 para 0; Roberto os mantém como 1. Treino de 533.581 com 4,85% contra 529.984 com 5,00%.",
      "Pré registro previa cerca de 82% aprova, 5% manual e 12% recusa; o arquivo entregue tem 72,0%, 1,7% e 26,3%, porque é de outro modelo e outra política.",
      "Errata do email não incorporada: Anexo B ainda traz 0 propostas e PD até nan% na seção da árvore; Anexo D ainda cita a regra maior_atraso e status falhou com a instrução INTERROMPER.",
      "Manifesto reporta Brier 0,04764 e log loss 0,18609 do modelo escolhido, que são os valores antes da calibração segundo a Missão 9.",
      "Calibrador estimado na validação, divergente do README da base; divergência declarada e sem resposta registrada.",
      "Conta econômica: decisões da validação somam 187.352 e as do OOT somam 100.000 por motivo; ponte da M10 fecha com folga de R$ 0."
    ],
    "fortes": [
      "Pipeline reproduzível de ponta a ponta, com lockfile, semente, travas de congelamento e hashes que conferem.",
      "Conta econômica com custo de capital, contraproposta em escada e estresse que deriva corte e limites da RAS.",
      "Painel de monitoramento completo, calibrado no histórico e ligado a gatilhos com dono."
    ],
    "fracos": [
      "Ordem congelar antes do OOT não demonstrável para o modelo entregue; pré registro e manifesto anteriores são de outro modelo.",
      "Trabalho de grupo não consolidado: duas versões v1.0 divergentes, apropriação só de Roberto, Diana sem contribuição visível.",
      "Teste 1 do OOT falhou sem interromper a entrega e a errata do email não foi aplicada aos PDFs."
    ]
  },
  {
    "id": "habitacional-renata",
    "titulo": "Crédito habitacional · base 05",
    "modalidade": "grupo",
    "base": "05 habitacional (versão 1, gerada em 17/09/2026; 904.809 linhas no arquivo de desenvolvimento)",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "dossie_modelo_habitacional_v1.0.pdf, 13 páginas, gerado em 08/10 após o OOT; cobre problema, modelos, economia, governança, reprodução e três correções da IA"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "codigo_reproduzivel_habitacional_v1.0.zip, 53 arquivos, 12 scripts, LEIA-ME.txt com a sequência de 11 comandos; propostas_desenvolvimento.csv e base_limpa.pkl fora por tamanho, com hash declarado"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "MANIFESTO-MODELO-v1.0.md enviado em 07/10, byte a byte igual ao de 10/10; declara versões, semente 42, dependências fixadas, comando e 17 hashes; errata posterior só no LEIA-ME.txt"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "presente",
        "texto": "previsoes_oot.csv, 100.000 linhas, IDs únicos, 4 colunas obrigatórias, versão v1.0, sha256 07e9824b confere com o LEIA-ME.txt e com execucao_oot.log; aderência ao OOT oficial não conferida"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "blueprint_operacao_habitacional.pdf, 30 páginas, com sumário executivo no início; mais Rotas da Proposta Habitacional.html (fluxo interativo) e blueprint-habitacional.html; no PDF a tabela do RAS e os diagramas da jornada e da integração saem cortados na margem direita"
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "População, unidade, instante, evento 90+, horizonte 12 meses no manifesto e no dossiê seção 1; uso e limites de uso no dossiê seção 4; sem arquivo 01 separado"
      },
      {
        "id": "M2",
        "status": "parcial",
        "texto": "dicionario_dados.csv traz campo, tipo, unidade, disponibilidade e papel, mas não tem coluna de uso permitido nem contagens por campo; o bloqueio está só em pipeline_comum.py e no manifesto"
      },
      {
        "id": "M3",
        "status": "cumprida",
        "texto": "auditoria_missao3.csv com 38 regras, quantidade, até 5 IDs e ação, gerado por m03_auditoria.py; asserts F17, F18, G20 e G21 no código fazem o papel de suíte"
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "Os 31 campos do dicionário estão classificados (14 usados, 17 bloqueados com motivo); vazamento provado por AUC isolada de taxa_juros_am 0,64 e score_bureau_atualizado 0,85 (relatorio_apoio_numeros.txt E4); bureau consultado após a proposta anulado (B5)"
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "particoes_missao5.csv com treino jan/2021 a jun/2023 e validação jul a dez/2023, assert de maturação contra 31/01/2025, último rótulo 30/01/2025; hiperparâmetros em validação interna do treino"
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "PD única 1,5546% aprendida no treino, Brier 0,01633 e log loss 0,08455 na validação (relatorio_m05_m07.txt); sem arquivo 06 em json"
      },
      {
        "id": "M7",
        "status": "cumprida",
        "texto": "Logit, árvore e random forest no mesmo pipeline, mesmos 116.116 IDs (teste G20), explicação local da proposta P050818580 nas três famílias; previsoes_missao7.csv.gz com proposta, partição, modelo, PD, versão e horário; terceira família é random forest e não boosting, desvio atribuído a orientação do professor, a confirmar"
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "AUC 0,690 com IC bootstrap 0,679 a 0,702, KS 0,279, ganho por decil, grafico_roc.png e diferença pareada logit contra RF de 0,002 com IC cruzando zero (discriminacao_missao8.csv)"
      },
      {
        "id": "M9",
        "status": "cumprida",
        "texto": "10 faixas com n e IC de Wilson, Brier, log loss, Platt ajustado em jan a jun/2023 dentro do treino, antes 9 de 10 e depois 10 de 10 faixas no IC (calibracao_missao9.csv); o calibrador foi ajustado sobre escores do modelo de 2021 a 2022 e aplicado ao modelo final"
      },
      {
        "id": "M10",
        "status": "cumprida",
        "texto": "Equilíbrio 23,1% base e 11,03% estresse, faixa manual de 7% (13.100), choques separados e combinados, reconciliação esperado 91,0 mi contra realizado 89,7 mi e quebra por decisão (relatorio_m10.txt); arquivo por proposta da reconciliação não entregue"
      },
      {
        "id": "M11",
        "status": "cumprida",
        "texto": "AUC e real sobre previsto por canal, região, idade, mês e faixa de PD, PSI, regra dos 4/5 (relatorio_m11.txt); painel_missao11.csv com limite, frequência, responsável e ação; o indicador de atraso 30+ aos 6 meses ficou com limite a definir"
      },
      {
        "id": "M12",
        "status": "cumprida",
        "texto": "15 de 15 hashes presentes conferem nas duas remessas; os 20 arquivos comuns são idênticos exceto LEIA-ME.txt; pickle registra scikit learn 1.9.1, igual ao requirements.txt; OOT rodado uma vez em 08/10 15:58 UTC com hash do arquivo de entrada no log"
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "Jornada em três fases com decisões D1 a D12, origem de cada dado e entrada do modelo na D7 (blueprint Etapas 3, 4 e 14); fluxo visual em Rotas da Proposta Habitacional.html"
      },
      {
        "id": "E14",
        "status": "cumprida",
        "texto": "Três linhas, quatro comitês com frequência e voto, matriz de alçadas valor contra PD, RAS com meta, alerta e limite derivados da M10 (2,72%, 19,6%, 5,1%) e limites de concentração (ras_missao14.csv)"
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar 4,68%, faixa manual até 11,03%, exceções só no comitê com teto de 0,5%, canal novo tratado como desconhecido, ausência com indicador, 12 normas com link e vigência, justificativa do logit por empate e explicabilidade"
      },
      {
        "id": "E16",
        "status": "cumprida",
        "texto": "Sumário executivo com decisões, risco base e estresse, responsáveis, gatilhos e três decisões para o Conselho; painel ligado ao RAS; sumário ocupa o equivalente a uma página, quebrado entre as páginas 1 e 2 do PDF"
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada com os cinco elementos. Todos os 31 campos classificados por disponibilidade. Vazamento provado por AUC isolada e bloqueado. Bureau posterior à proposta anulado em 35.954 linhas. Auditoria com 38 regras, contagem, IDs e ação. Teste automático de disponibilidade em m14_coerencia.py.",
        "lacunas": "Dicionário sem coluna de uso permitido e sem contagens. Manifesto falava em proposta formal e 37 testes; corrigido só por errata no LEIA-ME.txt."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Três famílias nos mesmos 116.116 IDs, hiperparâmetros escolhidos dentro do treino, comparação pareada por bootstrap com IC, checagem de sobreajuste. OOT preservado: hashes idênticos entre 07/10 e 10/10, execução única registrada, decisões do CSV batem com os limiares da política (manual entre 0,0468 e 0,1102; aprova até 0,046799).",
        "lacunas": "Terceira família é random forest, não boosting. Calibrador ajustado sobre escores do modelo de 2021 a 2022 e aplicado ao modelo treinado até jun/2023, sem discussão explícita. Versão interna do pickle é v0.1 dev, enquanto a entrega é v1.0.",
        "ajuste": "Regra comum a todas as entregas: a missão 7 exige logit, árvore e boosting nas mesmas propostas. O grupo usou random forest no lugar do boosting e atribuiu o desvio a uma orientação do professor; o professor confirmou que não houve orientação nesse sentido. O critério fica em 1."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Dossiê seção 4 define quando usar e quando não usar. painel_missao11.csv e ras_missao14.csv trazem limite, frequência, responsável e ação para cada indicador. Segmento sem UF fora da faixa ganhou indicador próprio. Fairness pela regra dos 4/5 e PSI.",
        "lacunas": "Limite de perda sobre receita de 19,6% não morde: com LGD de 20% e receita de 6%, só seria rompido com PD média perto de 5,5%, bem acima do limite de 2,72%. Atraso 30+ aos 6 meses sem limite."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "LEIA-ME.txt com a ordem de execução, requirements.txt fixado, semente 42 declarada e presente no código, 17 hashes com 15 conferidos, base e base limpa identificadas por hash. Decisões documentadas com três respostas da IA corrigidas (idade, custo do RF, ordem do fluxo).",
        "lacunas": "matplotlib sem versão. Teste F19 citado sem teste explícito no código. previsoes_calibradas.csv.gz não entregue. Scripts m16 escritos após o congelamento, declarados.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 2 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 1,
        "evidencia": "Limiar, faixa manual, teto de 50% e limites do RAS idênticos no dossiê, blueprint, JSON da política, RAS, painel e m12_entrega.py; m14_coerencia.py confere 13 itens.",
        "lacunas": "Default de 7,98% na faixa manual contra 1,61% no automático, usado no dossiê e no blueprint como prova do valor do modelo, vem da política preliminar (teto 80%, limiar 6,54%); na política C a faixa 4,7% a 11% tem 6,29% (relatorio_m11.txt). Blueprint exige consulta válida ao bureau para o pedido completo e diz que sem bureau nada é aprovado às cegas, mas m12_entrega.py imputa e decide automaticamente as 3.941 propostas do OOT com bureau anulado. Comitê de crédito é semanal na Etapa 11 e mensal na Etapa 16."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "regulacao_missao15.csv e Etapa 12 com 12 normas, número, data, vigência conferida e link oficial: LGPD arts. 6, 7 X, 20 e 46, Res. CMN 4.557, 4.966, 4.968, 4.879, 5.037 (SCR), 4.949, 4.676 e 5.197, Circular 3.978, Leis 9.514, 12.414 e 10.741. Cada norma ligada a um ponto do fluxo; motivo de recusa e revisão humana previstos.",
        "lacunas": "Afirma comitê de riscos obrigatório para S5 pela Res. 4.557; o S5 tem estrutura simplificada, a conferir. Res. 5.255/2025 declarada como não analisada. Sem relatório de impacto à proteção de dados."
      },
      "bp_viabilidade": {
        "pontos": 2,
        "evidencia": "Faixa manual de 13.100 casos (7%) dentro dos 8%, cerca de 104 por dia útil e 7 analistas sob premissa declarada. Cenário de volume dobrado com ordem do que quebra, regra de capacidade já codificada em m12_entrega.py e gatilho de contratação no RAS. Volumes por alçada estimados no HTML de rotas.",
        "lacunas": "Prazos por etapa e capacidade de laudo só ilustrativos. Limiar efetivo de 5,96% no volume dobrado sem artefato que o reproduza. Confirmação por analista sênior acima de R$ 650 mil (cerca de 1.330 casos) fora da conta de capacidade."
      },
      "bp_conselho": {
        "pontos": 2,
        "evidencia": "Sumário no início do blueprint diz o que se decide, o risco no base e no estresse (PD média 2,18% e 2,72%, perda 153,5 e 287,9 mi), quem responde por linha e o que dispara ação, e pede três decisões ao Conselho, incluindo ratificar a regra de 50% como principal controle.",
        "lacunas": "No PDF a tabela do RAS perde as colunas de limite e ação, e os diagramas da jornada e da integração saem cortados; o conteúdo completo só aparece no HTML e no CSV. Etapa 15 ainda marca a submissão como pendente."
      }
    },
    "verificacoes": [
      "sha256sum dos 15 artefatos presentes do pacote de 07/10 confere com SHA256SUMS.txt (15 de 15); propostas_desenvolvimento.csv e base_limpa.pkl ausentes por tamanho",
      "SHA256SUMS.txt de 10/10 idêntico ao de 07/10; os 15 artefatos conferem também no zip de código",
      "20 arquivos comuns entre as remessas: 19 idênticos byte a byte, inclusive MANIFESTO-MODELO-v1.0.md, modelos_v01.pkl, calibradores_v01.pkl, politica_missao10.json e m12_entrega.py; só LEIA-ME.txt difere (comandos e errata)",
      "pickle inspecionado sem desserializar: Pipeline com LogisticRegression, DecisionTree e RandomForest, _sklearn_version 1.9.1, igual ao requirements.txt",
      "previsoes_oot.csv: sha256 07e9824b3ca3e065 igual na raiz e em teste_cego, igual ao LEIA-ME.txt e ao log; 100.000 IDs únicos; aprova 71.625, manual 6.687, recusa 21.688; PD média 0,0381",
      "decisões do OOT batem com politica_missao10.json: manual entre 0,0468 e 0,1102, maior PD aprovada 0,046799, nenhuma proposta movida pela regra de capacidade",
      "execucao_oot.log em 08/10/2026 15:58 UTC, depois do envio de 07/10 21:55; hash do OOT de entrada 7b374cf3 registrado; PDFs gerados depois da execução",
      "previsoes_missao7.csv.gz: colunas proposta_id, particao, modelo, pd, versao, executado_em; 440.752 IDs de treino e 116.116 de validação em cada família",
      "baseline e todos os pré processamentos aprendidos no treino conforme m05_m07_modelos.py (assert F17 sobre medianas); calibrador em jan a jun/2023, sem uso da validação nem do OOT",
      "contas reconciliadas: 440.752 mais 116.116 igual a 556.868; 6.852 mais 1.928 igual a 8.780; 132.960 mais 13.100 mais 39.952 mais 1.138 igual a 187.150; 4.155 sobre 116.185 igual a 3,6%",
      "inconsistências menores: aprovadas 146.060 (m10) contra 146.058 (m16) por arredondamento do corte; financiado mediano 227 mil em fontes_dos_numeros.csv contra 192 mil no E2 citado como fonte",
      "comparacao_etapa16.csv: com a regra de 50%, o modelo acrescenta 6,2 mi no base e 13,8 mi no estresse sobre a régua mínima; sem regra e sem modelo o base dá 1.652,9 mi, acima dos 1.647,9 mi da política"
    ],
    "fortes": [
      "Congelamento verificável de ponta a ponta: hashes conferem, artefatos idênticos entre remessas, execução única do OOT registrada com hash de entrada e saída.",
      "Conta econômica honesta: o grupo mostra que a regra de 50% faz quase toda a proteção e que o modelo acrescenta pouco, e leva isso ao Conselho como decisão explícita.",
      "Rastreabilidade numérica rara: fontes_dos_numeros.csv classifica a origem de cada número e m14_coerencia.py testa a igualdade entre política, RAS, painel e blueprint."
    ],
    "fracos": [
      "Prova central do valor do modelo (7,98% contra 1,61%) foi calculada na política preliminar e não na política C adotada.",
      "Fluxo e modelo divergem no tratamento de bureau ausente, e a frequência do comitê de crédito muda entre etapas.",
      "Decisão dominada pela regra dura: 21,2% do OOT recusado pela regra e só 0,5% pela PD; limite de perda sobre receita do RAS não é vinculante diante do limite de PD média."
    ]
  },
  {
    "id": "consignado-jader",
    "titulo": "Consignado privado · base 03",
    "modalidade": "individual",
    "base": "03 consignado",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "3_dossie/DOSSIE_MODELO.pdf (25 páginas) e .md, missões 1 a 12 com fontes por número; anexos missao03_auditoria.csv e REFERENCIAS_REGULATORIAS"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "4_codigo/codigo_reproduzivel.zip com 25 scripts, requirements.txt com versões fixas, README_EXECUCAO.md, modelo congelado em joblib e metadata.json; dados brutos e missao07_previsoes.csv (175 MB) fora do zip por tamanho"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "Manifesto enviado em 2_manifesto, idêntico ao enviado em 08/10 (sha256 5d3a0025 nos dois); ADENDO_POS_CONGELAMENTO separado corrige 12 declarações"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "presente",
        "texto": "Válido: 1_arquivo_teste_cego/previsoes_oot.csv, 100.000 IDs únicos, 0 faltantes, 0 extras, 4 colunas obrigatórias, PD com 6 casas, 3,29 MB; igual byte a byte a outputs/previsoes_oot.csv do código"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "5_blueprint/BLUEPRINT.pdf (19 páginas) e .md, fluxograma SVG, RACI, matriz de alçadas, comitês, RAS derivado da M10, painel com 20 sinais, sumário de uma página, normas anexadas no COMPLEMENTO"
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "Dossiê M1 isola população, unidade, instante, evento 90+, horizonte 12m e uso; taxa de aprovação 75,04% declarada como viés de seleção"
      },
      {
        "id": "M2",
        "status": "cumprida",
        "texto": "Tabela de 30 campos com chave, unidade, disponibilidade, papel e teste obrigatório no dossiê M2; sem arquivo 02 contrato em CSV separado, dicionário com hash no manifesto"
      },
      {
        "id": "M3",
        "status": "cumprida",
        "texto": "missao03_auditoria.csv com 72 regras, contagem, até 5 IDs, ação e status; script executável missao03_auditoria.py; correção do próprio script documentada"
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "7 campos bloqueados com motivo, score_bureau_atualizado bloqueado por vazamento medido (99,89%), bloco de bureau anulado linha a linha em 27.037 casos; classificação dos 30 campos só no dossiê, sem CSV 04"
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "missao05_calendario.json com janelas, maturação provada em 100% da população, 0 IDs cruzando partição; limitação as of medida (49,3% dos rótulos de treino maduros após 01/07/2023, AUC 0,7447 contra 0,7497)"
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "PD fixa 26.821/536.715 do treino, Brier 0,05086 e log loss 0,2095 na validação, quatro perguntas mapeadas; sem 06 baseline.json próprio, valor está em missao17b"
      },
      {
        "id": "M7",
        "status": "cumprida",
        "texto": "Três famílias nas mesmas 140.399 propostas de validação (conferido no csv.gz do COMPLEMENTO: 421.197 linhas, 3 conjuntos de IDs idênticos, colunas proposta_id, particao, modelo, pd_modelo, versao_modelo, executado_em); explicação local por família e Shapley"
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "AUC com IC95 bootstrap, KS, lift por decil, bootstrap pareado nos 3 pares; sensibilidade aos sentinelas e logística com binning"
      },
      {
        "id": "M9",
        "status": "cumprida",
        "texto": "Calibração por decil com n e IC, Brier e log loss antes e depois do Platt ajustado na validação, OOT intocado; Platt validado no tempo (jul a set aplicado a out a dez)"
      },
      {
        "id": "M10",
        "status": "cumprida",
        "texto": "PD x LGD x EAD, break even 19,64%, capacidade 8%, estresse isolado e combinado, reconciliação por proposta (R$ 144.815.623,38); erro de EAD sentinela da v1.0 (R$ 833,4 M) corrigido no adendo"
      },
      {
        "id": "M11",
        "status": "cumprida",
        "texto": "AUC por canal, faixa etária, UF e cliente visto, PSI treino para validação e validação para OOT, tabela de 7 alertas com métrica, limite, frequência, responsável e ação"
      },
      {
        "id": "M12",
        "status": "parcial",
        "texto": "Pacote congelado com versões, sementes e hashes que conferem, mas o X da política foi recalculado com as PDs do OOT (12,04% contra 10,00% congelado), o OOT foi pontuado mais de uma vez e o hash do script de M7 no manifesto não é o do código que rodou (5 folds contra 3)"
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "BLUEPRINT seção 2, fluxograma ASCII e SVG da captação ao pós concessão, tabela de pontos de decisão com informação disponível, responsável, tempo e ferramenta, ponto de entrada do modelo"
      },
      {
        "id": "E14",
        "status": "cumprida",
        "texto": "RACI único, três linhas com segregação, Comitê de Riscos e Comitê de Crédito com composição e frequência, RAS com PD média 5,38%, perda sobre receita 36,7% e aprovação abaixo de 75,5% derivados do estresse combinado da M10"
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar Y, faixa manual, regra dura de sanidade, exceções com alçada, categoria nova (canal correspondente), ausência informativa, LGPD arts. 7, 16 e 20, Res. CMN 4.557 e Portaria MTE 435 com artigos, justificativa do boosting"
      },
      {
        "id": "E16",
        "status": "cumprida",
        "texto": "Painel de 20 sinais com limite, frequência, responsável e ação ligados ao RAS, gatilhos em 3 níveis, sumário executivo de uma página na abertura do BLUEPRINT.pdf"
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada com os cinco componentes no dossiê M1 e no manifesto. Vazamento tratado por evidência medida: score_bureau_atualizado com 237.335 de 237.586 reconsultas posteriores à proposta, bloco de bureau anulado em 27.037 linhas, 7 campos pós decisão bloqueados. Maturação conferida em 100% da população; partição por data sem IDs cruzados.",
        "lacunas": "A auditoria mandou converter renda em formato BR, tratar sentinelas e pseudo nulos, e nada disso entrou no pipeline congelado: 86.825 rendas viraram ausente, sentinelas em 4 campos entram crus no StandardScaler. Rótulo default_12m mantido em 1.046 casos com atraso de 31 a 89 dias, contra o dicionário."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Três famílias nos mesmos IDs, features e validação, conferido no csv.gz da M7. AUC 0,7494 contra 0,7211 e 0,7147, bootstrap pareado com IC excluindo zero; sensibilidade com sentinelas tratados (0,0221) e logística com binning (0,018, IC [0,015; 0,020]). PD do OOT reproduz os joblib congelados, hashes conferem e o manifesto de 08/10 antecede o envio do OOT.",
        "lacunas": "O X do CSV foi calculado com as PDs do OOT para caber em 8.000 manuais, e o OOT foi pontuado várias vezes; declarado, com contrafactual ex ante de 12,31%. Desvio entre treino e pontuação: grafia não normalizada no OOT em 7.373 linhas (132 decisões). Busca de hiperparâmetro rodou com 3 folds e o manifesto declara 5.",
        "ajuste": "Regra comum a todas as entregas: o parâmetro X da política foi recalculado com as PDs do OOT e o OOT foi pontuado mais de uma vez. A M12 veda qualquer volta ao arquivo cego; pela regra aplicada a todos, modelo e testes fica em 1."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Dossiê, seção Limitações e condições de uso: quando usar e quando não usar (sentinela, canal novo, mudança de política). Tabela de 7 alertas na M11 e painel de 20 sinais no BLUEPRINT seção 5, cada um com métrica, limite, frequência, responsável e ação; limite binomial por safra justificado com dados da validação; gatilhos em 3 níveis com quem decide.",
        "lacunas": "Indicadores antecedentes (30+ e 60+), desempenho da faixa manual e perda realizada ficam propostos sem instrumentação; o CSV entregue não aplica as condições de uso descritas (aprova 2.039 pedidos com dado inválido e 4.672 do canal novo)."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "requirements.txt com versões fixas, semente 20260501, ordem de execução no README_EXECUCAO e no adendo, 31 hashes do adendo conferidos com sha256sum, os 7 do manifesto também. Script de conferência do COMPLEMENTO executado de forma independente: 48 de 48 números do texto batem com os JSON. Caderno de processo e 65 KB de prompts literais com horário.",
        "lacunas": "O script de M7 em disco não é o que gerou os hiperparâmetros congelados; reprodução do modelo só por hash. Caderno escrito pela IA em primeira pessoa, com várias etapas autônomas e a regra do X atribuída à IA pelo próprio dossiê.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 1 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 2,
        "evidencia": "Fluxograma SVG, tabela de pontos de decisão, matriz de alçadas e política de decisão usam os mesmos Y 19,64%, X 13,17% e contagens 79.514 / 7.600 / 12.886. Anexo H.22 a H.27 cruza blueprint e dossiê; os 7 alertas da M11 reaparecem iguais no painel. Conferência automática 48 de 48.",
        "lacunas": "Convivem sete valores de X (10,00; 10,55; 12,04; 12,31; 12,85; 13,17; 13,47) e duas políticas (arquivo e produção); todos reconciliados no texto, mas a carga de leitura é alta e o CSV entregue não é a política de produção."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "Res. CMN 4.557 citada por artigo (5, 7, 9, 23, 43 a 45, 48, 50, 52, 59, 65) com dispensas por segmento S3; LGPD arts. 7, 16, 18 e 20 com o veto da revisão humana; Lei 10.820 e Portaria MTE 435 com margem, Termo de Autorização, biometria, desistência em 7 dias, retenção de 5 anos. Textos originais anexados no COMPLEMENTO com sha256 conferidos.",
        "lacunas": "Res. CMN 4.966 só por fonte secundária; Res. 4.935, Res. 4.968, Circular 3.978 e cadastro positivo declarados como não lidos. Uso de dados do vínculo (eSocial) no retreino fica pendente de parecer jurídico (H.25 parcial)."
      },
      "bp_viabilidade": {
        "pontos": 2,
        "evidencia": "Faixa manual de 7.600 com folga de 5% sob teto de 8.000; carga diária de 63,5 casos, pico com razão 1,44 medida na base, 13 analistas a 80% de ocupação, carga por alçada de valor (1.227 entre p90 e p99), sistemas listados, análise do volume dobrado e do volume histórico de 150 mil por semestre. Errata do salário recalcula e mantém 13.",
        "lacunas": "Piloto do perfil antes recusado (11.857 pedidos) e modos sombra sem capacidade nem custo; prazos de formalização e desembolso a definir; suspensão do modelo supõe processo legado não descrito."
      },
      "bp_conselho": {
        "pontos": 2,
        "evidencia": "Página 1 do BLUEPRINT.pdf: o que se decide, tabela previsto contra limite do RAS, resultado base e sob estresse, quem responde (Conselho, Diretoria de Crédito, CRO, Comitê de Riscos), o que dispara ação, risco de reject inference e três decisões para o Conselho.",
        "lacunas": "Texto denso, com ressalvas jurídicas (desenho, enquadramento nosso) e siglas X, Y e RAS que um conselheiro não especialista teria dificuldade de ler em uma página."
      }
    },
    "verificacoes": [
      "sha256sum do zip principal: 18 de 18 arquivos OK contra SHA256SUMS.txt; COMPLEMENTO: 19 de 19 OK",
      "sha256 do zip principal 67bea0e1 confere com o valor declarado no leia me do COMPLEMENTO",
      "Manifesto de 08/10 (pasta do email) e cópia em 2_manifesto idênticos, sha256 5d3a0025, como declarado no leia me e no adendo",
      "Os 7 hashes de scripts do manifesto e os 31 hashes do adendo seção 10 conferem com os arquivos do código (scripts, joblib, metadata, requirements, previsoes_oot.csv)",
      "Hash do dicionario_dados.csv no zip confere com o manifesto (2a56ffc2)",
      "previsoes_oot.csv: 100.000 linhas, 100.000 IDs únicos, colunas obrigatórias presentes, PD de 0,003581 a 0,819446 com 6 casas, 3,29 MB; idêntico ao outputs/previsoes_oot.csv; coerente com checagem_oot.txt (0 faltam, 0 extras)",
      "Decisões do CSV: aprova abaixo de 0,120379, manual de 0,120379 a 0,196426, recusa a partir de 0,19643; com o X congelado do metadata.json (0,100049) a faixa manual teria 11.846 casos, como o adendo declara; o metadata.json congelado não contém o X efetivamente usado",
      "Previsões de validação da M7 (csv.gz do COMPLEMENTO): 421.197 linhas, 140.399 IDs por família, conjuntos idênticos, 0 pares duplicados, colunas de partição, versão e horário presentes",
      "Recontagem da política do manifesto sobre a PD do boosting na validação: 125.569 / 11.232 / 3.598, igual ao manifesto; o adendo corrige para 124.467 / 11.232 / 4.700 na escala recalibrada",
      "Código: medianas, encoders e busca de hiperparâmetro filtrados por particao == treino; Platt ajustado só na validação; script de entrega só carrega joblib; baseline fixo 26.821/536.715 do treino",
      "Script conferencia_texto_dados.py executado de forma independente sobre o código entregue: 48 de 48 OK",
      "Contradições numéricas entre documentos, todas reconhecidas no adendo: 5 folds no manifesto contra 3 no log; resultado base R$ 833,4 M no manifesto e no relatório de 08/10 contra R$ 144,8 M corrigido; 16 preditoras contra 20 colunas; ausência de renda de 4,8 a 12,2% contra 20,46%; prevalência da validação 5,38% contra 5,37%; salário do analista R$ 4.106,28 contra R$ 4.241,82 (errata)",
      "Linha do tempo: manifesto enviado 08/10 16:48, OOT recebido 16:49, CSV gerado 17:15 (mtime 08/10 17:15 preservado no zip); caderno e prompts com horário UTC coerentes com os emails de 10/10"
    ],
    "fortes": [
      "Rastreabilidade excepcional: cada número cita script e JSON, hashes conferem e a conferência automática texto contra dado fecha 48 de 48",
      "Autocrítica medida: erros de EAD sentinela, escala do X, folds e sentinelas foram encontrados, quantificados e corrigidos em adendo sem reescrever o objeto congelado",
      "Blueprint integrado à conta econômica, com RAS derivado do estresse combinado, RACI ancorado em artigos da Res. 4.557 e normas originais anexadas"
    ],
    "fracos": [
      "Problemas de dado apontados pela própria auditoria (renda BR, sentinelas, grafia no caminho do OOT) não entraram no pipeline congelado",
      "Parâmetro X da política definido com as PDs do OOT e manifesto com hash de código que não foi o executado na busca de hiperparâmetros",
      "Autoria das decisões difusa: caderno redigido pela IA, onze rodadas de revisão por IA e a regra do X atribuída à IA no próprio dossiê"
    ]
  },
  {
    "id": "pessoal-stephan",
    "titulo": "Crédito pessoal · base 01",
    "modalidade": "grupo",
    "base": "01 crédito pessoal",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "Em docx, não em PDF: 1_documentos/Dossie_modelo_PD_credito_pessoal_v1.1.docx, cobre as 12 missões com fonte por número"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "2_notebooks (fase A v3, B, C v2, D), cópia congelada em 3_modelo_congelado_v1.1/codigo e scripts em 6_testes_e_verificacoes; sem requirements nem README; base de desenvolvimento não incluída"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "3_modelo_congelado_v1.1/manifesto_modelo_v1.1.md, congelamento.json e 4_entrega_OOT/hashes_para_registrar.csv; mesmo arquivo já enviado na remessa de 07/10"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "presente",
        "texto": "4_entrega_OOT/previsoes_oot_v1.1.csv, 100.000 IDs, conferido contra o OOT oficial sem faltantes, extras ou duplicados"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "Em docx, não em PDF: 1_documentos/Blueprint_operacao_credito_pessoal_v1.0_OOT_executado_definicoes_grupo.docx, com fluxograma_concessao_v1.0.png e Anexos_Blueprint_v1.0_RAS_Painel_OOT.xlsx"
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "Pergunta com população, unidade, instante, evento 90+, horizonte 12 meses e maturação em relatorio_faseA.md §1 e no manifesto"
      },
      {
        "id": "M2",
        "status": "cumprida",
        "texto": "Contrato de 29 campos com momento, uso, teste obrigatório e violações em relatorio_faseA.md §2 e FaseA_resultados.xlsx aba 2_contrato"
      },
      {
        "id": "M3",
        "status": "cumprida",
        "texto": "relatorio_auditoria.csv com 91 regras, quantidade, até 5 IDs, ação e status; funil 904.768 para 898.330 confere"
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "AUC 1,00 com tudo contra 0,7479 só com a proposta; 14 campos bloqueados com motivo e AUC univariada (aba 4_bloqueadas)"
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "Treino jan/21 a jun/23 dividido em ajuste e calibração, validação jul a dez/23; testes C1 a C11; rótulo mais tardio 30/01/2025"
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "B0 é a média de y no treino (0,08194) e B1 é logística do score ajustada no treino_ajuste (faseB célula 7; aba 6_baseline)"
      },
      {
        "id": "M7",
        "status": "parcial",
        "texto": "Três famílias na mesma matriz de 63 colunas, teste G1 de mesmos IDs e explicação local do caso P010850998; previsoes_faseB.csv.gz com as colunas exigidas não foi entregue, só o hash ad2d8cd3"
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "AUC com IC bootstrap e DeLong, KS, ROC, ganho e lift, AUC mensal e comparação pareada (FaseB_resultados.xlsx abas 8_*)"
      },
      {
        "id": "M9",
        "status": "cumprida",
        "texto": "Decis com n e IC de Wilson, Brier, log loss, Platt ajustado no treino_calib, antes e depois; escolha do calibrador usou log loss da validação"
      },
      {
        "id": "M10",
        "status": "cumprida",
        "texto": "Limiar 0,16/0,78 = 20,5128%, faixa manual, capacidade, estresse combinado e isolado, reconciliação mensal 7.616 contra 7.953 e conta de controle (relatorio_faseC.md §10)"
      },
      {
        "id": "M11",
        "status": "cumprida",
        "texto": "58 segmentos (canal, ocupação, UF, idade, renda, prazo, bureau), PSI, choques isolados, painel de 13 indicadores e 4 gatilhos com responsável e ação"
      },
      {
        "id": "M12",
        "status": "cumprida",
        "texto": "Manifesto v1.1 com 11 hashes conferidos, enviado em 07/10 antes da abertura do OOT em 08/10 14:19; artefatos idênticos na entrega final; abertura única registrada"
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "Fluxograma PNG e Mermaid, disponibilidade temporal por campo, 11 pontos de decisão com SLA, sistema e contingência; o fluxograma omite o ramo de alçada por valor"
      },
      {
        "id": "E14",
        "status": "cumprida",
        "texto": "Três linhas, comitês com composição e quórum, matriz de alçadas e RAS com limites derivados da M10 (base × 1,10 e estresse); alçada V3 incoerente com a capacidade"
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar, faixa manual, exceções, categoria nova e ausência, LGPD art. 7 e 20, nove normas citadas e justificativa logística contra boosting e árvore"
      },
      {
        "id": "E16",
        "status": "cumprida",
        "texto": "Painel ligado ao RAS com limite, frequência, responsável e ação; sumário executivo de uma página com três decisões para o Conselho"
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada e mantida do relatório da fase A ao manifesto. Contrato por campo com disponibilidade. Auditoria com IDs em relatorio_auditoria.csv. Vazamento demonstrado (AUC 1,00 contra 0,7479) e score_bureau_atualizado bloqueado. Bloco de bureau anulado quando a consulta é posterior (36.070 linhas). Maturação testada.",
        "lacunas": "Arquivos com nomes diferentes dos previstos no capítulo 11. Registro da decisão DE2 em decisoes_grupo.csv mostra 0% alterado, pouco legível para a exclusão de 1.711 linhas."
      },
      "modelo_testes": {
        "pontos": 2,
        "evidencia": "Logit, árvore e boosting na mesma matriz e nos mesmos IDs (G1). DeLong e bootstrap: logit empata com boosting (p 0,8956) e supera árvore. Calibrador no treino_calib. OOT preservado: hashes do pacote idênticos entre 07/10 e 09/10, OOT oficial com sha256 conferido, abertura única, 100.000 IDs exatos.",
        "lacunas": "Previsões de validação por família não entregues. Escolha entre Platt e isotônica pelo log loss da validação, em tensão com a declaração de que a validação só compara."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Painel de 13 indicadores com verde, amarelo, vermelho, frequência, responsável e ação. Quatro gatilhos com quem decide. Desempenho por canal, UF, ocupação, idade e renda. Leitura do OOT sem rótulo separa composição de mudança real e trata o swap set como extrapolação.",
        "lacunas": "Bases do RAS medidas só com aprovadas; o próprio grupo admite que a população completa deixa indicadores no vermelho sem deterioração."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "Manifesto com versões de Python, pandas, numpy, scikit learn e joblib, semente 20260926, ordem de execução e 11 hashes que conferem. Testes EQ1 e EQ2 de equivalência do pipeline de produção. Decisões numeradas com justificativa e três respostas da IA recusadas ou corrigidas.",
        "lacunas": "Sem arquivo de dependências nem README. Notebook da fase D entregue com ABRIR_OOT True mas saídas da execução anterior.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 2 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 1,
        "evidencia": "Limiar, faixa manual, capacidade e painel idênticos entre dossiê, blueprint e politica_faseC.json, conferidos pelo teste_H automatizado (H1, H3 a H5 OK).",
        "lacunas": "Matriz de alçadas exige analista para PD abaixo de 18,5349% com valor acima de R$ 15.161,52, mas o fluxograma manda toda essa faixa para aprovação automática. Indicador taxa de aprovação automática usa PD abaixo de 20,5128%, não a regra automática."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "Nove normas com número e data aplicadas ao fluxo: CMN 4.557, 4.966, 2.682 revogada, 4.968, 4.949, 5.037, LGPD art. 6, 7 e 20, Cadastro Positivo e Estatuto da Pessoa Idosa. Revisão humana, base legal, retenção, minimização e veto a idade máxima.",
        "lacunas": "Vigência não verificada em quatro normas. Texto remete a um Anexo G de links oficiais que não existe."
      },
      "bp_viabilidade": {
        "pontos": 1,
        "evidencia": "SLA por etapa, sistemas, contingências, dimensionamento de 4 analistas a 30 análises por dia e teste de volume dobrado sobre a faixa manual (66,4% de uso).",
        "lacunas": "Capacidade ignora as aprovações V3 que a alçada manda ao analista. No OOT seriam 11.553 propostas além das 4.967 da faixa: 16.520 contra 14.952, uso de 110%, vermelho. A conta de analistas não fecha."
      },
      "bp_conselho": {
        "pontos": 2,
        "evidencia": "Sumário de uma página: o que se decide, volume, risco e retorno, tabela de limites com quem responde, quatro gatilhos e três decisões explícitas para o Conselho, incluindo rebase do RAS.",
        "lacunas": "Denso em números; herda a definição ambígua da taxa de aprovação."
      }
    },
    "verificacoes": [
      "sha256 calculado dos 11 artefatos do manifesto confere com o declarado, nas duas remessas.",
      "O manifesto da remessa de 07/10 já era v1.1 (sha256 3c521897), não v1.0. Nenhum manifesto v1.0 foi enviado; a v1.0 de 26/09 só é citada no dossiê.",
      "Os 19 arquivos da remessa de 07/10 são idênticos aos da entrega final. Única diferença: no notebook faseD de 2_notebooks, ABRIR_OOT passou de False para True. Não há alteração de modelo após o OOT; M12 respeitada.",
      "sha256 do OOT declarado (88053120) igual ao arquivo oficial 01_pessoal; 100.397 linhas brutas.",
      "Previsões: 100.000 linhas e IDs únicos, 0 faltantes e 0 extras contra o oficial, versao_modelo v1.1 em 100%, decisões 77.961, 4.967 e 17.072 reproduzidas pelas faixas do politica_faseC.json congelado sem divergência.",
      "Cronologia: congelamento 07/10 17:44, remessa ao professor 07/10 20:57, abertura do OOT e CSV em 08/10 14:19; scripts de diagnóstico posteriores são só leitura.",
      "Baseline: B0 = média de y no treino_ajuste e treino_calib; B1 ajustado só no treino_ajuste (faseB célula 7).",
      "Partições somam 609.070 e defaults do treino somam 39.523, iguais à fase A.",
      "Conta econômica fecha: receita 158.963.723 menos perda 45.925.429 menos custo 4.597.145 = 108.441.149; custo = 35 × 131.347.",
      "IC inferior da AUC: 0,7441 no manifesto e 0,7444 no painel; divergência declarada como D02.",
      "Alçada V3 no OOT: 11.553 aprovações automáticas (14,8%) com valor acima de R$ 15.161,52 exigiriam analista; fluxograma e capacidade não as contam.",
      "Blueprint cita Anexo G inexistente; fluxograma PNG ainda rotula regras duras e revisão humana como Premissa.",
      "Planilhas FaseB e FaseC de saída editadas em 09/10, após o OOT; fora do pacote congelado e com números iguais ao manifesto."
    ],
    "fortes": [
      "Protocolo de congelamento verificável de ponta a ponta: hashes conferem, pacote idêntico entre remessas, abertura única do OOT oficial.",
      "RAS derivado da conta econômica (base × 1,10 e estresse) com reconciliação mensal esperado contra realizado.",
      "Leitura honesta do OOT sem rótulo: nenhuma métrica inventada, decomposição por decisão histórica e swap set tratado como extrapolação."
    ],
    "fracos": [
      "Alçada por valor contradiz o fluxograma e estoura a capacidade da análise manual.",
      "Previsões de validação das três famílias não entregues; calibrador escolhido com a validação.",
      "Documentos em docx, sem arquivo de dependências, com anexo citado inexistente e indicador de aprovação automática mal definido."
    ]
  },
  {
    "id": "recebiveis-asa",
    "titulo": "Recebíveis · base 08",
    "modalidade": "grupo",
    "base": "08 recebíveis",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "Dossie-modelo-08_recebiveis-v1.1.pdf, 68 páginas, gerado em 09/10 18:21, já com a seção de congelamento e teste cego"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "codigo-reproduzivel-v1.1-08_recebiveis.zip, sha256 3f6f2363175b confere com o declarado; 26 scripts R, RODAR_TUDO.R, guia de reprodução, pacote congelado .rds; base de desenvolvimento fora do zip por tamanho"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "MANIFESTO-MODELO.md v1.1, sha256 bb7285bb6552 idêntico nas remessas 11:28, 13:03 e no zip das 18:41; versões, sementes, dependências e 15 hashes de artefatos"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "presente",
        "texto": "previsoes_oot.csv, sha256 b0679ee05bce confere; 100.000 IDs, sem faltantes, extras ou duplicados contra o OOT oficial; versao_modelo v1.1; 0 decisões incoerentes com os limiares"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "Blueprint-da-Operacao-08_recebiveis (final corrigido).pdf, 9 páginas; anexos 1 a 5 anunciados na seção 7 e não incluídos"
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "01-especificacao-modelo.md com os seis elementos; ressalva: o texto ainda chama de censura os 23.537 casos que o manifesto reclassifica como liquidados"
      },
      {
        "id": "M2",
        "status": "parcial",
        "texto": "02-contrato-dados.csv tem tipo, unidade, disponibilidade e papel dos 30 campos com teste de cobertura; faltam contagens por campo e coluna de uso permitido, que só aparece em 04-auditoria-vazamento.csv"
      },
      {
        "id": "M3",
        "status": "cumprida",
        "texto": "03-auditoria-qualidade.md com 27 regras, contagem, até 5 IDs e ação; scripts 01 e 13 a 13c executáveis"
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "04-auditoria-vazamento.csv classifica os 30 campos; demonstração com status_contrato leva a AUC de 0,7531 a 0,9991; regra B5 anula bureau posterior à proposta"
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "05-particoes-e-maturacao.md, treino jan/21 a jun/23 e validação jul a dez/23, 0 rótulos após 31/01/2025, medianas só no treino; risco de 82.059 clientes nas duas partições testado"
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "06-baseline.json, p0 de 0,067322 aprendido no treino e aplicado sem recálculo na validação"
      },
      {
        "id": "M7",
        "status": "parcial",
        "texto": "07-previsoes-validacao.csv com logística, árvore e boosting nos mesmos 131.261 IDs (conferido); explicação local só para logística e árvore; no boosting adotado há só influência global e o texto diz zero títulos atrasados quando o caso tem 0,02"
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "08-discriminacao.md, AUC com IC DeLong, KS, ROC, ganho por decil, DeLong pareado e bootstrap"
      },
      {
        "id": "M9",
        "status": "cumprida",
        "texto": "09-calibracao.md, decis com n e IC, Brier, log loss, Platt em partes disjuntas da validação, antes e depois, não adotado; OOT intocado"
      },
      {
        "id": "M10",
        "status": "parcial",
        "texto": "10-politica-economica.md com p* de 0,05/0,55, capacidade, estresse e equilíbrio sob estresse; a conferência por proposta em 10_politica_economica.R compara a soma com ela mesma e nenhum arquivo por proposta foi entregue"
      },
      {
        "id": "M11",
        "status": "cumprida",
        "texto": "11-equidade-estresse-monitoramento.md com canal, UF, anos de atividade, quatro choques, CSI e dez gatilhos com limite, frequência, responsável e ação"
      },
      {
        "id": "M12",
        "status": "cumprida",
        "texto": "Manifesto v1.1 enviado às 11:28 antes do pedido do OOT; log registra execução única às 15:38 UTC; hashes do pacote e do 12b batem com o manifesto; previsões das 13:03 idênticas às do zip"
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "Figura 1 do blueprint com sete etapas e a informação disponível em cada uma; prazos por etapa; faltam no desenho os caminhos de retenção, exceção e revisão do art. 20"
      },
      {
        "id": "E14",
        "status": "parcial",
        "texto": "Três linhas, três comitês com quórum, alçadas e segregação; PD máxima e subordinação de 5,2% derivam da conta da M10; PD média recusada como limite e concentração por devedor deixada a definir"
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar, faixa manual, exceção com garantia, categoria nova, ausência, justificativa do boosting contra logística e árvore, LGPD art. 20"
      },
      {
        "id": "E16",
        "status": "parcial",
        "texto": "Indicadores idênticos aos da M11 com escalonamento ligado à subordinação; o sumário da página 1 não diz o que dispara ação e os anexos prometidos não vieram"
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada com os seis elementos. Alvo recalculado de dias_atraso_max_12m, com efeito medido. Auditoria com IDs em 27 regras. Bloqueio de 13 campos imposto por código. Regra B5 aplicada no treino, na validação e no script de produção. Maturação provada por contagem.",
        "lacunas": "Contrato sem contagens por campo. Divergências não reconciliadas: 82.826 clientes em mais de uma partição na auditoria contra 82.059 na M5; 23.537 casos de censura na M1 contra 23.332 liquidados no manifesto."
      },
      "modelo_testes": {
        "pontos": 2,
        "evidencia": "Três famílias nos mesmos 131.261 IDs com mesmas variáveis. Hiperparâmetros fixados sem busca. DeLong pareado: boosting menos logística 0,0125, Z 11,92. Régua mínima só no treino. Platt em partes disjuntas da validação. OOT pontuado uma vez com o pacote cujo hash consta do manifesto enviado antes do arquivo.",
        "lacunas": "Explicação local ausente para o boosting adotado. O boosting subestima a faixa de 8% a 9% (8,75% contra 9,26%), onde está o limiar. O piso de 7,2881% foi ajustado na população da validação."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Dez gatilhos com métrica, limite, frequência, responsável e ação. CSI do indicador de ausência mensal. Regra de contingência de bureau medida em três cenários. Escalonamento com parada imediata pelo Diretor de Risco. Uso restrito à decisão de concessão, não à precificação.",
        "lacunas": "Modelo treinado só em aprovadas e aplicado a toda a população sem inferência de rejeitados: 29.839 recusadas históricas no OOT com PD média de 17,85%. Não há validação independente de modelos separada do dono do modelo."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "Três sha256 declarados conferem. 13 dos 15 artefatos do manifesto batem no zip, mais o dicionário. RODAR_TUDO.R com 23 etapas, sementes 20261004, 90125, 1101 a 1103, versões de R e pacotes. Decisões atribuídas por autor, três correções de IA registradas, dois pipelines independentes.",
        "lacunas": "_res_boosting.rds e _prep_missao7.rds têm hash no manifesto mas não vieram no zip. Teste de reprodução de Souza é relato do grupo. Resíduo de texto de IA em 03-auditoria-qualidade.md.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 2 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 1,
        "evidencia": "Limiares, capacidade de 8%, transbordo e os dez gatilhos são idênticos no dossiê, no manifesto e no blueprint. Fluxograma, alçadas e política descrevem o mesmo motor.",
        "lacunas": "Volumes e banda de aprovação de 75,08% mais ou menos 10 pontos medidos só em aprovadas; no OOT, população completa, a aprovação é 61,51% e a banda estoura no primeiro mês. Decisão automática de 92% contra 93,27%. Subordinação marcada como proposta na abertura e ratificada na tabela. Monitoramento manda ligar a contingência quando o próprio texto suspende a retenção no nível de ação."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "Enquadramento como securitizadora fundamentado na Lei 14.430 arts. 18, 20, 25 a 27. Res. CVM 60 e 194 com art. 43 B. Res. CMN 4.815 e BCB 339 com aplicabilidade analisada. LGPD com base legal, minimização, art. 5º II e art. 20 com rito de revisão de 5 dias úteis.",
        "lacunas": "Base legal de proteção do crédito, art. 7º X da LGPD, não usada. PLD/FT sem norma citada. Anexo de referências com links anunciado e ausente. Dispensa das normas prudenciais do Bacen depende da estrutura escolhida e deve ser defendida."
      },
      "bp_viabilidade": {
        "pontos": 1,
        "evidencia": "Faixa manual de 7.680 no OOT contra teto de 8.000, transbordo testado em arquivo sintético. Prazos por etapa. Sistemas críticos e o primeiro gargalo ao dobrar o volume identificados.",
        "lacunas": "Sem dimensionamento de analistas para 2.501 casos por mês em 1 dia útil. Pedidos de revisão do art. 20 fora da capacidade e sem volume estimado, com 30.813 recusas no OOT. Retenção de até 60 dias, mediana de 31, num título com prazo médio de 44,3 dias."
      },
      "bp_conselho": {
        "pontos": 1,
        "evidencia": "Página 1 traz o que se decide, o risco com resultado base e estressado, quem responde nas três linhas e as três decisões a ratificar.",
        "lacunas": "O que dispara ação não está na página 1. PD média de 6,64% chamada de população total, quando é a das aprovadas; no OOT a PD média é 10,0%. Texto denso, com caixa de leitura que contradiz a marcação da subordinação."
      }
    },
    "verificacoes": [
      "sha256 do zip das 18:41: 3f6f2363175b, confere com o declarado.",
      "sha256 do manifesto: bb7285bb6552, idêntico nas remessas 11:28, 13:03 e dentro do zip. O manifesto congelado já é v1.1, a mesma versão das previsões.",
      "sha256 de previsoes_oot.csv: b0679ee05bce, idêntico na remessa 13:03 e no zip.",
      "Ordem confirmada: manifesto às 11:28, 14:28 UTC; OOT gravado às 15:35 UTC; execução única às 15:38 UTC pelo log; envio às 13:03. Sem mudança de modelo após o OOT.",
      "Hashes no zip contra o manifesto: _pacote_congelado.rds, 12b, 12a, 00, _07a, _07c, _07d, 10, 10b, 11c, 11d, RODAR_TUDO e 07-previsoes-validacao.csv conferem; dicionário confere; _res_boosting.rds e _prep_missao7.rds ausentes.",
      "previsoes_oot.csv: 100.000 linhas e IDs únicos, 0 faltantes e 0 extras contra o OOT oficial, PD de 0,00893 a 0,96662, média 0,09999, 61.507 aprovar, 7.680 revisar, 30.813 recusar, v1.1 em todas.",
      "Recalculei a regra nas PDs publicadas: 0 decisões incoerentes com 0,072881 e 0,090909.",
      "07-previsoes-validacao.csv: 393.783 linhas, três famílias com 131.261 cada e o mesmo conjunto de IDs; coluna se chama versao e marca v1.0, como o manifesto declara.",
      "Zip de congelamento citado no email das 11:28 (b0c4aad71254) não está na remessa recebida; a integridade do pacote foi conferida pelos hashes do manifesto.",
      "Aceite de Sebastião cita manifesto de 29.809 bytes; o enviado tem 30.289. Nota do grupo atribui a diferença só à tabela de aprovação; não verificável.",
      "Envio do OOT declarado às 12:50 no dossiê contra 13:03 na remessa; log citado em scripts/_scratch, entregue em registros/.",
      "10_politica_economica.R: a conferência da soma por proposta compara o total com ele mesmo; a diferença de R$ 0,00 é tautológica.",
      "Simulacao_Missao10_cenarios.xlsx citada na M9 e no manifesto não foi entregue.",
      "Blueprint gerado às 07:48 de 09/10, antes do OOT; já traz as correções pedidas no aceite (17 variáveis, 3,51%, banda p20 a p80)."
    ],
    "fortes": [
      "Cadeia de custódia verificável: manifesto v1.1 congelado antes do OOT, hashes do pacote e do script de produção conferidos, previsões idênticas em duas remessas.",
      "Auditoria de dados profunda, com alvo recalculado, sentinela de valor_solicitado que derrubou o resultado de R$ 434,1 mi para R$ 224,5 mi e expectativas declaradas antes do teste cego.",
      "Choque de ausência de bureau medido no realizado, que revela imputação otimista invisível no PSI e gera regra de contingência quantificada."
    ],
    "fracos": [
      "Blueprint dimensionado na população de aprovadas: com a população completa do OOT a aprovação automática cai para 61,51% e a banda de 75,08% mais ou menos 10 pontos estoura de saída.",
      "Modelo calibrado mal exatamente na região do limiar e aplicado a recusadas históricas sem inferência de rejeitados.",
      "Explicação local ausente para o boosting adotado, o que fragiliza o atendimento ao art. 20 da LGPD que o próprio blueprint invoca."
    ]
  },
  {
    "id": "consignado-guilherme",
    "titulo": "Consignado privado · base 03",
    "modalidade": "individual",
    "base": "03_consignado (consignado privado) v1",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "Dossie_Modelo_PD_03_consignado.pdf (34 páginas, também .docx no zip)"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "Trabalho_Final_Codigo_e_Resultados.zip (145 arquivos; 23 scripts em src, executar_tudo.py, requirements.txt, modelos joblib, 77 tabelas); sem a pasta saida/previsoes declarada no manifesto"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "MANIFESTO-MODELO.md e saida/manifesto.json (111 hashes, congelado em 09/10/2026 20:42:03)"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "ausente",
        "texto": "Nenhum arquivo com proposta_id, pd_modelo, decisao_politica, versao_modelo para os 100.000 IDs; oot_uma_vez.py pronto, nunca executado sobre o OOT real; roteiro A3 e G21 pendentes"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "Blueprint_Consignado_Privado.pdf (14 páginas), Sumario_Executivo_Conselho.pdf (1 página), Apresentacao_Conselho_Blueprint.pptx e .pdf (16 slides)"
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "Pergunta congelada com população, unidade, instante, evento 90+, horizonte 12 meses e uso (dossiê p3; MANIFESTO-MODELO.md)"
      },
      {
        "id": "M2",
        "status": "cumprida",
        "texto": "contrato_variaveis.csv com 39 linhas (campo, tipo, disponível quando, papel, uso, motivo, teste obrigatório); falta coluna explícita de unidade"
      },
      {
        "id": "M3",
        "status": "cumprida",
        "texto": "auditoria.csv com 49 regras, contagem, até 5 IDs e ação; tratamentos.csv com linhas afetadas; ROTEIRO-DE-TESTES-preenchido.md"
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "14 campos bloqueados com motivo; B5 anula bureau consultado após a proposta (36.001 linhas); B7 bloqueia score_bureau_atualizado; vazamento_demonstracao.csv (AUC 0,72 honesto, 0,87 e 0,9999 com vazamento)"
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "particoes.csv por data (treino jan/2021 a jun/2023; validação jul a dez/2023), maturacao.csv com 100% maduro até 31/01/2025, sub partição temporal para hiperparâmetros, contaminacao_teste.csv"
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "baseline.json com p0 = 26.690/533.563 = 0,0500 do treino (particoes.py usa só tr)"
      },
      {
        "id": "M7",
        "status": "parcial",
        "texto": "Três famílias sobre os mesmos 140.396 IDs (conferido no 07-previsoes-validacao.csv.gz) e explicação local de 3 casos; o arquivo entregue é largo e não traz partição, modelo, versão e horário; o arquivo longo obrigatório não foi entregue"
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "discriminacao.csv e delong.csv; AUC com IC bootstrap, ROC, KS, ganho e DeLong; recalculei AUC, KS, Brier e log loss e conferem"
      },
      {
        "id": "M9",
        "status": "cumprida",
        "texto": "Calibração por faixa com n e Wilson, Brier, log loss; Platt conferido fora da amostra (jul a set ajusta, out a dez confere); OOT intocado (recalibracao.csv)"
      },
      {
        "id": "M10",
        "status": "cumprida",
        "texto": "economia_reconciliacao_logit.csv, limiar por contrato, faixa manual por valor da informação, estresse com 4 cenários; reconciliação por proposta só demonstrada em verificacao_independente.csv; linha total não fecha coluna a coluna"
      },
      {
        "id": "M11",
        "status": "cumprida",
        "texto": "Subgrupos por canal, porte, faixa etária, cliente, bureau, renda e UF com AUC e IC; choques.csv; alertas.csv com 10 sinais, limite, frequência, responsável e ação"
      },
      {
        "id": "M12",
        "status": "parcial",
        "texto": "Manifesto com versões, semente 20260927, dependências e 111 hashes congelado antes do OOT; previsões OOT não entregues, OOT não medido"
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "Fluxograma de 7 etapas com informação disponível, decisor, prazo e ferramenta (Blueprint p3 e anexo A)"
      },
      {
        "id": "E14",
        "status": "cumprida",
        "texto": "Três linhas, 4 comitês com composição e quórum, matriz de alçadas, segregação, RAS com 10 limites e origem na M10 (ras.csv; Blueprint p5 a p6)"
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar, faixa manual, exceções com alçada, categorias novas e ausência, LGPD e 9 normas com artigo e vigência, justificativa logística versus boosting (Blueprint seção 4)"
      },
      {
        "id": "E16",
        "status": "cumprida",
        "texto": "Painel de 10 indicadores ligado ao RAS, gatilhos de recalibrar, rever e suspender, sumário executivo de uma página (Sumario_Executivo_Conselho.pdf)"
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada em uma frase com os seis elementos. Contrato com data de disponibilidade por campo. Bureau consultado após a proposta anulado em 36.001 linhas; reconsulta bloqueada; vazamento demonstrado. Maturação provada para 100% das linhas com rótulo. Auditoria com 49 regras, IDs e ação.",
        "lacunas": "Contrato sem coluna de unidade. Contagens divergentes sem denominador declarado entre roteiro e dossiê (C9 111.296 contra 110.504; B4 DD/MM 27.011 contra 26.856)."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Três famílias sobre os mesmos 140.396 IDs, conferido. Recalculei AUC 0,7457, 0,7347 e 0,7543, KS, Brier e log loss: idênticos ao dossiê. Hiperparâmetros escolhidos em sub partição do treino. DeLong entre os três pares. Calibrador ajustado na validação e conferido fora da amostra. Manifesto congelado antes da liberação do OOT; OOT preservado.",
        "lacunas": "Entregável 4 ausente: nenhuma previsão OOT dos 100.000 IDs; pelo enunciado a execução fica sem validade e o teste cego não foi medido. Arquivo de validação entregue sem partição, modelo, versão e horário. Faixas compatíveis na conferência fora da amostra: 6 para 9 no dossiê, 3 para 9 no manifesto."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Memorando de cinco campos com validade, condições e melhor argumento contra. alertas.csv com 10 sinais, todos com limite, frequência, responsável e ação. Regras escritas para recalibrar, rever política e suspender o modelo. Boosting como challenger sem poder de decisão.",
        "lacunas": "Gatilho de prevalência madura citado no sumário executivo com intervalo errado (4,21% a 5,27% em vez de 5,26% a 5,49%)."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "README com ordem de execução, requirements.txt com versões fixas, semente única, manifesto com 111 hashes: 102 conferem por sha256, nenhum diverge. verificacao_independente.csv com 33 itens. Caderno de processo com cronologia, decisões, erros corrigidos e episódio de escopo corrigido pelo aluno.",
        "lacunas": "7 arquivos de previsões hasheados não estão no zip, embora o dossiê diga que estão. Caderno declara que código, tabelas e textos foram produzidos pelo assistente e que as decisões técnicas aguardam ratificação; o manifesto diz modelo de produção a ratificar e não há ratificação registrada. Prompts literais retidos.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 1 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 2,
        "evidencia": "Blueprint, dossiê e deck leem os mesmos arquivos (blueprint_numeros.json, economia_cabecalho.json, ras.csv, alertas.csv); limiar 0,1903, faixa 14,3% a 26,5% e capacidade 14.988 iguais nos três. Fluxograma, alçadas e política de decisão descrevem a mesma operação.",
        "lacunas": "Renda ausente aparece como 12% no blueprint, 8% no deck e 7,6% ou 8,2% no dossiê. Prazo da faixa manual de 2 dias úteis contra gatilho de fila de 5 dias. Aprovação automática com limite RAS 84% a 99% e alerta 89% a 99%."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "normas.csv com 9 normas, número, data, artigo, efeito na operação e vigência verificada: Lei 10.820, Lei 15.179, Res. CMN 4.557, 4.966, 4.968, 4.571, LGPD, Lei 14.181, Circ. 3.978. Bases legais LGPD por finalidade, art. 20 com revisão humana, retenção, minimização e idade fora do modelo.",
        "lacunas": "Res. CMN 4.966 e 4.968 citadas por fontes secundárias (Deloitte, Grant Thornton) e não pelo normativo do BCB."
      },
      "bp_viabilidade": {
        "pontos": 1,
        "evidencia": "Capacidade declarada: 14.988 casos por semestre, 120 por dia, 6 analistas, prazo, sistemas e o que quebra se o volume dobrar. Faixa por valor da informação usa 6.530 casos.",
        "lacunas": "A capacidade só conta a faixa por valor da informação. O blueprint também envia à faixa manual propostas sem renda confirmada, sem bureau e com sentinelas; só na validação aprovada há 11.564 sem renda e 5.765 sem bureau, sem dimensionamento. A produção inclui os 25% recusados historicamente, o que muda aprovação e fila; o efeito não foi quantificado."
      },
      "bp_conselho": {
        "pontos": 2,
        "evidencia": "Sumário de uma página com o que se decide, volume, risco em PD, perda e estresse, responsáveis por linha, gatilhos e três decisões para o Conselho; deck de 16 slides coerente.",
        "lacunas": "O gatilho de prevalência madura no sumário usa o intervalo do RAS de PD média; erro de rótulo no ponto que dispara ação."
      }
    },
    "verificacoes": [
      "Manifesto: 111 hashes declarados; 102 conferem por sha256 com os arquivos do zip; 0 divergentes; 9 ausentes (2 dados da plataforma, não redistribuíveis, e 7 arquivos de saida/previsoes).",
      "07-previsoes-validacao.csv.gz: sha256 do conteúdo descompactado 6f92dd6c igual ao manifesto; 140.396 linhas, IDs únicos, sem nulos, datas de 01/07/2023 a 31/12/2023, 7.544 defaults; colunas pd_logit, pd_arvore e pd_boosting sobre os mesmos IDs; faltam partição, modelo, versão e horário.",
      "Recalculo independente na validação: AUC 0,7457, 0,7347, 0,7543; KS 0,3604, 0,3492, 0,3795; Brier 0,0478, 0,0482, 0,0474; log loss 0,1874, 0,1899, 0,1855. Todos iguais ao dossiê.",
      "Platt a 1,0215 e b 0,1389 aplicado a pd_logit: PD média 0,053738 e máximo 0,7793, iguais a recalibracao.csv e ao teto da faixa recusar.",
      "OOT: nenhum arquivo de previsões OOT nos 12 anexos nem no zip. OOT oficial tem 100.389 linhas e 100.000 IDs; oot_uma_vez.py deduplica e exige 100.000, compatível, mas não foi executado.",
      "Baseline: p0 = 26.690/533.563 = 0,050022, calculado em particoes.py só com o treino.",
      "Partições e maturação: treino até 30/06/2023, validação até 31/12/2023, último rótulo em 30/01/2025, anterior à referência 31/01/2025; 711.280 + 187.352 = 898.632 propostas, igual ao total pós auditoria.",
      "Reconciliação: soma das faixas 143,79 + 2,15 menos 0,09 = 145,85 mi confere; na linha total, receita menos perda menos custo dá 143,44 mi, não 145,85 mi; a diferença de 2,41 mi é o valor da revisão lançado sem receita e perda. A afirmação de que as parcelas somam sem folga não vale coluna a coluna. Arquivo de decisões por proposta não entregue.",
      "RAS: 4 limites derivados da M10 por fator 1,25 conferem (4,21% para 5,27%; 2,06% para 2,57%); 10 linhas com origem e responsável.",
      "Contradições: dossiê cita 108 hashes (p2 e p30) e manifesto 111; conferência do calibrador com faixas 6 para 9 no dossiê e 3 para 9 no manifesto; renda ausente 12% no blueprint e 8% no deck; intervalo de prevalência do sumário diferente de alertas.csv.",
      "Capacidade: 14.988 = 8% de 187.352; 6 analistas = 120 casos por dia sobre 24, mais 1; não inclui as rotas para faixa manual por ausência de renda, bureau ou sentinela.",
      "Ensaio do script OOT em arquivo simulado teve o registro apagado; o bloqueio de segunda execução depende de arquivo local removível."
    ],
    "fortes": [
      "Métricas e calibração reproduzidas exatamente a partir do arquivo de validação entregue; manifesto com hashes que conferem.",
      "Tratamento temporal rigoroso: bureau pós proposta anulado, reconsulta bloqueada, vazamento demonstrado, hiperparâmetros em sub partição do treino.",
      "Blueprint, dossiê e deck alimentados pelos mesmos arquivos, com RAS derivado da conta econômica e 10 alertas completos."
    ],
    "fracos": [
      "Previsões OOT não entregues: entregável 4 ausente e teste cego não medido.",
      "Apropriação das decisões técnicas não documentada: caderno atribui as decisões ao assistente e deixa a ratificação em aberto.",
      "Capacidade da faixa manual não considera as rotas por ausência de renda, bureau e população de produção com recusados históricos."
    ]
  },
  {
    "id": "pessoal-michelle",
    "titulo": "Crédito pessoal · base 01",
    "modalidade": "individual",
    "base": "01 crédito pessoal",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "Dossiê md (06/10, 23 KB) e dossiê pdf (10/10, 6 páginas); o pdf só acrescenta o registro da pontuação OOT e uma frase sobre os choques de estresse"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "Desde 17/10: pipeline_pd.py (465 linhas, enviado como pipeline_pd.txt), sha256 confere com o manifesto de 06/10; o notebook de 11 KB não tem código de modelagem"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "Manifesto md de 06/10 e de 10/10; diff restrito à data de congelamento e a uma seção nova de pontuação OOT; o hash do pipeline declarado confere com o código recebido em 17/10"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "presente",
        "texto": "previsoes_oot.csv (10/10), 100.000 IDs, sem duplicados, faltantes ou extras, 4 colunas obrigatórias, sha256 c48262bc confere com o manifesto"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "Blueprint md (06/10) e blueprint pdf (10/10, texto idêntico), fluxograma.png, apresentação pptx de 8 slides"
      }
    ],
    "missoes": [
      {
        "id": "M1",
        "status": "cumprida",
        "texto": "Pergunta com população, unidade, instante, evento 90+, horizonte 12m e restrição de informação (dossiê 1.1, manifesto)"
      },
      {
        "id": "M2",
        "status": "parcial",
        "texto": "Dicionário citado como contrato (dossiê 1.2), mas o contrato de dados por campo com contagens não foi entregue"
      },
      {
        "id": "M3",
        "status": "parcial",
        "texto": "22 regras com contagem e ação (dossiê 1.3); os até 5 IDs por regra estão em saida/M3_auditoria.csv, não entregue; pptx fala em 43 regras"
      },
      {
        "id": "M4",
        "status": "cumprida",
        "texto": "15 campos bloqueados com motivo e 14 usados somam as 29 colunas do arquivo OOT oficial; score_bureau_atualizado e bureau com data posterior tratados (dossiê 1.4, manifesto)"
      },
      {
        "id": "M5",
        "status": "cumprida",
        "texto": "Partições por data com n, defaults e rótulo maduro máximo 30/01/2025 para validação até 31/12/2023 (dossiê 1.5)"
      },
      {
        "id": "M6",
        "status": "cumprida",
        "texto": "Régua mínima é a prevalência do treino 8,46%; Brier da régua 0,0798 reconcilia com prevalência de validação 8,74% (recalculado)"
      },
      {
        "id": "M7",
        "status": "parcial",
        "texto": "Três famílias com as mesmas 69 variáveis e explicação local da proposta P010726698 (dossiê 2.5); arquivo de previsões de validação não entregue"
      },
      {
        "id": "M8",
        "status": "cumprida",
        "texto": "AUC com IC bootstrap, ROC, KS, ganho por decil e comparação pareada nos mesmos IDs (dossiê 2.2 e 2.3)"
      },
      {
        "id": "M9",
        "status": "parcial",
        "texto": "Brier e log loss contra a régua; tabela por faixa com n não aparece no dossiê; a figura mostra a faixa de PD perto de 17% com taxa observada perto de 19% e IC que não cobre a diagonal, contra a afirmação de que todas as faixas estão dentro; sem recalibração nem antes e depois"
      },
      {
        "id": "M10",
        "status": "cumprida",
        "texto": "Fórmula, limiar dependente da EAD, faixa manual de 8%, quatro choques e reconciliação esperado contra realizado (109,2 contra 106,7 milhões); limiares recalculados conferem; reconciliação proposta a proposta não entregue"
      },
      {
        "id": "M11",
        "status": "parcial",
        "texto": "AUC e calibração por canal e ocupação, PSI, painel com limite, frequência, responsável e ação; faltam geografia e faixa etária; choques só econômicos"
      },
      {
        "id": "M12",
        "status": "cumprida",
        "texto": "Manifesto de 06/10 com hash do pipeline, que confere com o código recebido em 17/10; manifesto gravado antes da leitura do OOT; pontuação única com registro de hash"
      },
      {
        "id": "E13",
        "status": "cumprida",
        "texto": "Fluxograma de 10 etapas e tabela com informação disponível, decisor, prazo e ferramenta em cada ponto (blueprint seção 2, fluxograma.png)"
      },
      {
        "id": "E14",
        "status": "parcial",
        "texto": "Três linhas, segregação, matriz de alçadas, dois comitês com quórum e periodicidade, RAS com origem de cada limite; porém limite de perda esperada sobre receita 35% fica abaixo do estresse combinado 36,6% embora o texto diga igual; limite de canal 40% já violado (app 47% na validação)"
      },
      {
        "id": "E15",
        "status": "cumprida",
        "texto": "Limiar, faixa manual, exceções por alçada, ausência e categorias novas, LGPD com artigos e Bacen com número e data, justificativa da logística (blueprint seção 4); contradição sobre restritivos registrada no critério 5"
      },
      {
        "id": "E16",
        "status": "cumprida",
        "texto": "Painel de 8 indicadores com limite, frequência, responsável e ação ligados ao RAS, gatilhos de recalibrar, rever e suspender, sumário executivo de uma página (blueprint seções 1 e 5)"
      }
    ],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Pergunta congelada completa. Classificação de todas as 29 colunas (14 usadas, 15 bloqueadas com motivo). Anomalias plantadas identificadas com contagem: bureau ausente mai a jul/2022, renda em milhares no parceiro, 36.083 consultas com data posterior, 213.722 reconsultas pós decisão. Deduplicação de 397 linhas no OOT confere com a checagem oficial.",
        "lacunas": "Contrato de dados por campo e IDs afetados por regra não entregues. Dossiê diz que corrigiu a normalização que rebaixava UF para minúsculas, mas a tabela de auditoria ainda registra ação de normalizar para minúsculas."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Logit, árvore e boosting nas mesmas 69 variáveis, AUC com IC, diferença pareada bootstrap de 0,0017 com IC contendo zero, sobreajuste do boosting medido. OOT preservado: política congelada em 06/10, OOT recebido em 08/10, e as 100.000 decisões reproduzem exatamente PD contra limiar(EAD) e os 8% mais próximos do limiar.",
        "lacunas": "A regra de escolha é apresentada como declarada antes do resultado, mas a própria aluna relata que a reescreveu depois de ver o boosting vencer. Afirmação de que todas as faixas de calibração estão dentro do IC é contrariada pela figura na faixa perto de 17%. Previsões de validação das três famílias não entregues. Código recebido em 17/10 mostra divergência entre treino e pontuação: no desenvolvimento a UF é padronizada em maiúsculas (linha 133), no OOT em minúsculas (linha 448). Como 97,7% das UFs do OOT oficial estão em maiúsculas, praticamente todo o OOT foi pontuado com UF na categoria desconhecida. A correção de UF que o dossiê declara foi aplicada só no caminho de desenvolvimento. A profundidade da árvore foi escolhida pela AUC da validação (linhas 241 a 245)."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Dossiê 4.3: sete indicadores com métrica, limite, frequência, responsável e ação; seção Limites diz que o modelo não serve para recusadas e não substitui regras duras; gatilho de recalibração por safra.",
        "lacunas": "Subgrupos sem geografia e faixa etária. Alerta de aprovação calibrado em 86,7% da população aprovada; no OOT a aprovação é 76% e o alerta dispararia no primeiro dia. Canal correspondente (5,9% do OOT) é categoria nova e dispararia o alerta de 1%, sem menção."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "pipeline_pd.py recebido em 17/10 (enviado como .txt): sha256 dbf702197f39… idêntico ao declarado no manifesto congelado de 06/10, o que prova ser o código congelado. Script único com as missões 1 a 12, semente 20261002, ambiente declarado no manifesto, comando python pipeline_pd.py, gravação do manifesto antes da leitura do OOT, testes F18 e G20 por assert e pontuação do OOT uma única vez. Decisões e correções da IA documentadas no dossiê.",
        "lacunas": "Sem arquivo de dependências; saídas saida/ e fig/ não enviadas (regeneráveis com a base). Código chegou depois do prazo, por obstáculo documentado.",
        "ajuste": "O código chegou em 17/10, conferiu com o hash do manifesto e levou a reprodução de 0 para 2. Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 2 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 1,
        "evidencia": "Limiar, faixa manual, alçadas e painel do blueprint batem com o dossiê; fluxograma mostra onde o modelo entra e as três saídas.",
        "lacunas": "Restritivos: fluxograma e sumário dizem recusa automática; seção 4 manda restritivos acima de R$ 5 mil para a faixa manual. RAS de aprovação 80% a 92% e PD esperada derivados só de aprovadas históricas; a população de produção aprova 76% no OOT. Limite de perda sobre receita 35% dito igual ao estresse de 36,6%."
      },
      "bp_regulatorio": {
        "pontos": 2,
        "evidencia": "LGPD com art. 7º V e X, art. 20, art. 5º II, finalidade, minimização e retenção; Resolução CMN 4.557/2017, Resolução CMN 4.966/2021 e Lei 12.414/2011 com número, data e papel no desenho.",
        "lacunas": "Revisão de decisão automatizada (art. 20) atribuída à faixa manual, que só recebe propostas perto do limiar; recusado fora dela não tem canal de revisão. Retenção de recusadas sem prazo. Vigência declarada sem evidência."
      },
      "bp_viabilidade": {
        "pontos": 1,
        "evidencia": "Dimensionamento: 25 mil propostas por mês, 2.000 manuais, 5 analistas a 20 por dia, prazos por etapa, plano se o volume dobrar.",
        "lacunas": "Faixa manual é por construção exatamente 8%, o teto da capacidade (8.000 no OOT); restritivos acima de R$ 5 mil, contingência de bureau (60% das propostas na pane de 2022) e exceções somam fila sem capacidade. Exceções acima de R$ 50 mil vão a comitê quinzenal, incompatível com o prazo de 24 h."
      },
      "bp_conselho": {
        "pontos": 2,
        "evidencia": "Sumário de uma página no blueprint pdf: o que decide, volume, risco assumido, limites do RAS, quem responde, gatilhos e três decisões para ratificar; pptx de 8 slides repete a mensagem.",
        "lacunas": "Números de risco do sumário (aprovação 86,7%, PD 6,0%) são da população aprovada e não da população de produção."
      }
    },
    "verificacoes": [
      "sha256 de previsoes_oot.csv calculado c48262bc01f873ad...5a8b66 confere com o manifesto de 10/10 e com a checagem oficial",
      "sha256 do OOT de entrada declarado 88053120...236481 confere com 01_pessoal_oot_sem_desfecho_v1.csv oficial; 100.397 linhas e 100.000 IDs conferem",
      "sha256 de pipeline_pd.py (dbf70219) confere com o manifesto desde o recebimento do código em 17/10; os arquivos de desenvolvimento não foram enviados e não puderam ser conferidos",
      "Previsões OOT: 100.000 IDs iguais ao oficial, PD entre 0,000191 e 0,987646, média 0,1311; aprovar 76.009, recusar 15.991, manual 8.000, versão v1.0",
      "Política no OOT reproduzida: com EAD igual a valor_solicitado, toda aprovada tem PD abaixo de limiar(EAD), toda recusada acima, e a faixa manual são exatamente os 8% com menor distância ao limiar (corte 0,02965); 686 propostas com sentinela de valor decididas por EAD imputada",
      "Limiares recalculados conferem: 19,9% base, 17,7% LGD, 16,5% receita, 14,6% combinado para EAD mediana",
      "Brier da régua mínima 0,0798 recalculado a partir das prevalências de treino e validação",
      "Diff dos manifestos: só data de congelamento e seção de pontuação OOT; modelo, variáveis, hiperparâmetros, métricas e política idênticos: mudança de documentação",
      "Diff dossiê md 06/10 contra pdf 10/10: acréscimo do registro OOT e de uma frase sobre os choques; nenhum número de modelo mudou",
      "Blueprint pdf 10/10 tem texto idêntico ao md de 06/10 e data de criação 03/10",
      "Notebook só chegou em 10/10, não em 06/10; 34 células sem saída, sem código de modelagem; não reproduz o modelo nem gera previsões sozinho",
      "Contradições pptx contra dossiê: E14 817 contra 815; 43 regras contra 22; KS do boosting 0,369 contra 0,3656; árvore AUC treino 0,735 contra 0,7364, KS 0,330 contra 0,3341, Brier 0,0740 contra 0,0743",
      "Dossiê pdf criado em 08/10 07:17 BRT descreve pontuação OOT feita em 08/10 10:06: coerente só se 10:06 for UTC",
      "Canal correspondente aparece em 5,9% do OOT e não existe no treino; blueprint descreve quatro canais"
    ],
    "fortes": [
      "Política aplicada no OOT reproduz exatamente a regra congelada antes do arquivo cego",
      "Tratamento de vazamento e das anomalias plantadas com contagem e regra",
      "Blueprint completo com sumário de uma página, alçadas, comitês, RAS com origem e referências Bacen e LGPD"
    ],
    "fracos": [
      "Divergência de pré processamento entre treino e OOT na UF: o teste cego foi pontuado com UF desconhecida para quase todas as propostas",
      "Regra de escolha do modelo reescrita depois do resultado e calibração afirmada além do que a figura mostra",
      "RAS e capacidade manual calibrados na população aprovada, incompatíveis com a população de produção do OOT"
    ]
  },
  {
    "id": "habitacional-carlos",
    "titulo": "Crédito habitacional · base 05",
    "modalidade": "individual",
    "base": "05 habitacional",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "presente",
        "texto": "Desde 19/10: Dossie_Habitacional_Carlos_Campos.pdf, 43 páginas, gerado em 15/10, missões 1 a 12 e blueprint"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "presente",
        "texto": "Desde 19/10: trabalho_final_habitacional_v4.zip (29 MB, 104 arquivos), baixado do link enviado; 23 dos 24 hashes do manifesto conferem, e o 24º é a base de desenvolvimento, fora do zip por tamanho"
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "presente",
        "texto": "Desde 19/10: Manifesto_congelamento.md, versão hab05 v1, congelado em 15/10 08:38, semente 20260917, dependências e 24 hashes"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "ausente",
        "texto": "Dossiê registra o teste cego como pendente, a cargo do aluno"
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "presente",
        "texto": "No dossiê (seção 13): esteira de 8 etapas, três linhas, três comitês com frequência, alçadas por quantis da EAD, RAS com origem, limite, frequência, responsável e ação; sem dimensionamento de equipe; regulação só LGPD art. 20"
      }
    ],
    "missoes": [],
    "criterios": {
      "problema_dados": {
        "pontos": 2,
        "evidencia": "Dossiê, seções 1 a 5: pergunta congelada, contrato com papel, disponibilidade e uso por campo, auditoria com regra, contagem e IDs, vazamento demonstrado e bloqueado, partição por data e maturação.",
        "lacunas": "Nenhuma relevante para o critério.",
        "ajuste": "Reavaliado em 19/10 com o dossiê e o manifesto recebidos: de 1 para 2."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Três famílias nas mesmas propostas e variáveis, DeLong pareado, calibração por faixa com IC de Wilson, regra de escolha registrada.",
        "lacunas": "Teste cego não executado: previsões OOT ausentes. Modelo recongelado em 15/10 por mudança de código, antes de abrir o OOT."
      },
      "uso_responsavel": {
        "pontos": 2,
        "evidencia": "Slides 15 e 17: alertas com limite, frequência, responsável e ação; resposta pré registrada para cada resultado do teste cego.",
        "lacunas": "Nenhuma relevante para o critério."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "Zip trabalho_final_habitacional_v4.zip (29 MB, 104 arquivos) baixado do link em 19/10: 23 dos 24 hashes do manifesto conferem; o 24º é a base de desenvolvimento, fora do zip por tamanho. README, requirements, parametros.yaml, rodar_tudo.py, src por missão, rodar_oot.py com trava de execução única, caderno de processo com prompts e erros da IA corrigidos.",
        "lacunas": "Teste cego nunca executado (sem trava OOT_EXECUTADO nem previsões). Requirements com versões mínimas, não fixas (as exatas estão no manifesto).",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 2 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 2,
        "evidencia": "Seção 13: esteira de 8 etapas com três pontos de decisão, alçadas por quantis da EAD, comitês e RAS usam os mesmos cortes (6,61% e 23,08%) e a mesma capacidade de 8% do modelo e da política.",
        "lacunas": "Esteira descrita em texto, sem fluxograma com a informação disponível em cada ponto; gatilho de atenção da faixa manual igual à referência (7%).",
        "ajuste": "Reavaliado em 19/10 com o dossiê e o manifesto recebidos: de 1 para 2."
      },
      "bp_regulatorio": {
        "pontos": 1,
        "evidencia": "LGPD art. 20 citada com revisão humana da recusa automática e motivo ao cliente.",
        "lacunas": "Nenhuma norma do Bacen ou do CMN citada (gestão de risco, crédito habitacional, SCR).",
        "ajuste": "Reavaliado em 19/10 com o dossiê e o manifesto recebidos: de 0 para 1."
      },
      "bp_viabilidade": {
        "pontos": 1,
        "evidencia": "Faixa manual de 7,0% (13.103 propostas) dentro da capacidade de 8%, analista em 24 h, regra congelada de capacidade.",
        "lacunas": "Sem dimensionamento de analistas, prazos de ponta a ponta ou sistemas."
      },
      "bp_conselho": {
        "pontos": 1,
        "evidencia": "Resumo do dossiê e slides 2 e 19 dizem o que se decide e com que risco.",
        "lacunas": "Sem sumário de uma página com quem responde e o que dispara ação."
      }
    },
    "verificacoes": [],
    "fortes": [
      "Dossiê completo das 12 missões com calibração e conta econômica bem fundamentadas",
      "RAS com origem de cada limite e plano de monitoramento com responsável e ação",
      "Resposta à validação independente registrada antes do teste cego"
    ],
    "fracos": [
      "Teste cego não executado: previsões OOT ausentes",
      "Requirements com versões mínimas, não fixas; as exatas estão só no manifesto",
      "Regulação restrita à LGPD; nenhuma norma do Bacen"
    ]
  },
  {
    "id": "rural-agrogalaxy",
    "titulo": "Custeio rural · base 09",
    "modalidade": "grupo",
    "base": "09 rural",
    "entregaveis": [
      {
        "chave": "dossie",
        "nome": "Dossiê do modelo (PDF)",
        "status": "ausente",
        "texto": "Só apresentação de 8 slides (Custeio rural · Base 09)"
      },
      {
        "chave": "codigo",
        "nome": "Código reproduzível (ZIP)",
        "status": "ausente",
        "texto": ""
      },
      {
        "chave": "manifesto",
        "nome": "Manifesto do modelo congelado",
        "status": "ausente",
        "texto": "Slide 1 cita modelo congelado r09_v1.0"
      },
      {
        "chave": "previsoes_oot",
        "nome": "Previsões OOT (CSV)",
        "status": "ausente",
        "texto": ""
      },
      {
        "chave": "blueprint",
        "nome": "Blueprint da operação (PDF)",
        "status": "parcial",
        "texto": "Esteira de 7 etapas; sem alçadas, comitês, três linhas, RAS, Bacen e LGPD"
      }
    ],
    "missoes": [],
    "criterios": {
      "problema_dados": {
        "pontos": 1,
        "evidencia": "Slides 2 a 4: auditoria com contagens e tratamento, demonstração de vazamento (AUC 0,814 para 0,759), bureau posterior anulado também no OOT.",
        "lacunas": "Pergunta congelada não explicitada; nenhum arquivo de suporte."
      },
      "modelo_testes": {
        "pontos": 1,
        "evidencia": "Slide 5: WoE logit contra LightGBM monotônico, diferença de AUC por bootstrap com IC.",
        "lacunas": "Só duas famílias (falta a árvore); previsões OOT não entregues."
      },
      "uso_responsavel": {
        "pontos": 1,
        "evidencia": "Slide 7: gatilhos pré registrados (default/PD acima de 1,10 recalibrar; AUC abaixo de 0,72 retreinar); piloto com teto de exposição.",
        "lacunas": "Sem responsável, frequência e plano de monitoramento."
      },
      "reproducao_defesa": {
        "pontos": 1.6,
        "evidencia": "Nenhum código ou manifesto entregue.",
        "lacunas": "Reprodução impossível sem código e manifesto.",
        "ajuste": "Decisão do professor em 19/10/2026: a defesa oral recebeu nota 8 de 10 para todos e essa nota vale para o critério inteiro, que fica em 1,6 de 2. A reprodução avaliada nos documentos, antes dessa decisão, foi 0 de 2 e fica só como registro."
      },
      "bp_coerencia": {
        "pontos": 0,
        "evidencia": "Esteira coerente com o modelo e a política.",
        "lacunas": "Governança inexistente: sem alçadas, comitês e três linhas, a coerência fluxo, governança e modelo não pode ser demonstrada."
      },
      "bp_regulatorio": {
        "pontos": 0,
        "evidencia": "Nenhuma referência a Bacen ou LGPD.",
        "lacunas": "Critério não demonstrado."
      },
      "bp_viabilidade": {
        "pontos": 1,
        "evidencia": "Faixa cinzenta com teto de 8% e EAD acima de R$ 112 mil para análise manual.",
        "lacunas": "Sem capacidade, prazos ou sistemas."
      },
      "bp_conselho": {
        "pontos": 1,
        "evidencia": "Slide 1 com AUC, KS, calibração e escopo.",
        "lacunas": "Não diz quem responde nem o que dispara ação; capa com campos de grupo, nomes e data não preenchidos."
      }
    },
    "verificacoes": [],
    "fortes": [
      "Diagnóstico de vazamento quantificado",
      "Auditoria de dados com contagens",
      "Estresse e política com minimax de arrependimento"
    ],
    "fracos": [
      "Só apresentação: faltam dossiê, código, manifesto e previsões OOT",
      "Governança do blueprint ausente",
      "Capa com grupo e nomes em branco"
    ],
    "observacao": "A avaliação usa a apresentação de 8 slides enviada por João Pedro, a única entrega do Trabalho 2 recebida do grupo. Por decisão do professor em 21/10/2026, a nota vale para os três integrantes e é definitiva."
  }
];
