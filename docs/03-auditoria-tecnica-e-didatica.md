# Auditoria técnica e didática do material migrado

Separação usada em todo o documento: **evidência** (o que o arquivo ou o teste mostra), **inferência** (o que se conclui) e **recomendação** (o que fazer). Todos os números vêm de `content/generated/dados.json` (objeto `DADOS` do HTML original, seed 20260501, base sintética de 5.000 propostas) e foram recalculados por `tests/nucleo-reconciliacao.test.ts`.

## 1. Reconciliação numérica (executada)

| Grandeza | Valor no material | Recalculado | Situação |
|---|---|---|---|
| Janela OOT | 737 propostas, 81 defaults | 737, 81 | confere |
| Logística OOT: AUC, KS, Brier, log loss | 0,7257; 0,3621; 0,09128; 0,31487 | iguais a 3 ou 4 casas | confere |
| Boosting bruto OOT: AUC, KS, Brier, log loss, PD média | 0,6958; 0,3328; 0,09516; 0,32822; 0,09769 | iguais | confere (vetor `oot.pgr`) |
| Boosting recalibrado (Platt) OOT | AUC 0,6958; Brier 0,09491; PD média 0,13208 | iguais | confere (vetor `oot.pg`) |
| Platt: a = −0,1976; b = 0,7366 | p_cal = σ(a + b·logit(p_bruta)) | erro máximo < 2·10⁻⁴ | confere |
| Diferença de AUC (DeLong) | 0,0299 | 0,0299 | diferença confere; erro padrão 0,0152, z e p-valor **não recalculados** (DeLong não portado) |
| Calibração por decis da logística | 10 faixas com 74,74,73,74,74,73,74,73,74,74 casos | iguais, com faixas por quantil do valor previsto (convenção pandas.qcut) | confere |
| Ganho acumulado por decil | tabela pré-calculada | difere em um default no 5º decil (0,7778 contra 0,7901) | ver achado A2 |
| PSI do escore | 0,0136 | 0,0136 | confere |
| Prevalências: treino 9,558%, OOT aprovados 10,991%, OOT população 17,918% | | Wilson recalculado para OOT | confere |

### Achados

**A1. Nomes trocados nos vetores do boosting (evidência).** Em `DADOS.oot`, o vetor `pgr` tem média 0,09769 e Brier 0,09516, valores que `DADOS.res.gbm_raw_oot` atribui ao boosting bruto; o vetor `pg` tem média 0,13208, atribuída ao boosting recalibrado. A transformação de Platt mapeia exatamente `pgr` → `pg`. Inferência: `pg` é o modelo recalibrado e `pgr` o bruto, ao contrário do que os nomes sugerem; o código do material usa essa convenção de forma consistente (AUC "bruta" calculada sobre `pgr`; capítulo 8 usa `pgr` como PD bruta). Recomendação: nenhum número exibido muda; ao editar o material, tratar `pg` como calibrado. Registrado nos testes.

**A2. Duas convenções de faixa (evidência).** As tabelas pré-calculadas (calibração e ganho) usam faixas por quantil do valor previsto; a função `gains` do núcleo JS original usa contagem com fronteiras arredondadas e a função `calibracao` usa piso. No ganho acumulado, isso desloca um default entre o 5º e o 6º decil (0,7778 na tabela exibida contra 0,7901 por contagem). Inferência: as páginas exibem as tabelas pré-calculadas, então o aluno vê números consistentes entre si; a divergência só apareceria se as funções JS fossem usadas para o mesmo gráfico. Recomendação: o núcleo portado (`src/lib/nucleo/metrics.ts`) adota a convenção das tabelas exibidas para calibração e a de contagem para ganho, com comentário; ao criar novos exemplos, declarar a convenção de faixa junto ao gráfico.

**A3. Recalibração que piora o nível (evidência).** A PD média recalibrada por Platt (13,21%) fica mais distante da taxa observada (10,99%) do que a bruta (9,77%), com Brier levemente melhor (0,09491 contra 0,09516). Inferência: o material usa isso deliberadamente para mostrar que Platt ajusta nível sem alterar ordenação e que "calibrar" não garante compatibilidade com a janela OOT (deslocamento entre validação e OOT). Recomendação: manter; explicitar na página 13 do capítulo 7 que o ajuste foi estimado na validação (13,16% observado) e aplicado fora do tempo.

**A5. Gabarito incoerente na pergunta de retomada de c3p7 (evidência, auditoria de 17/09/2026).** A alternativa 0 da questão c3p7q abria a pergunta "latência de 45 dias, decisão em 10 de agosto: qual o mês mais recente utilizável?" com gabarito "junho". Junho fecha em 30 de junho e, com 45 dias, só fica disponível em 14 de agosto, depois da decisão; o correto seria maio, ausente das alternativas, e a própria explicação aplicava a regra fechamento mais latência para julho. Inferência: erro de redação do exemplo, não do conceito. Correção aplicada: a decisão passa a 20 de agosto, e a explicação registra as datas de disponibilidade de junho e julho; `content/generated/extract.json` foi corrigido para novas importações e `scripts/import-content.ts` cria uma nova versão da questão em bancos já importados (idempotente). O HTML original em `content/original` fica preservado como fonte, com o defeito registrado aqui.

**A4. Comparação de AUCs (evidência).** A página cita DeLong com IC 95% [0,0001; 0,0596] e p = 0,0492. O erro padrão não foi recalculado nesta sessão. Recomendação: portar DeLong para o núcleo antes de reutilizar o teste em novas bases; até lá, o valor é "informado pelo material, não verificado".

## 2. Auditoria conceitual (por tema do briefing)

| Tema | Evidência no material | Inferência | Recomendação |
|---|---|---|---|
| Definição de default, unidade, população, horizonte | Cap. 1 e 11: evento 90+ dias, uma proposta por cliente, 12 meses, um único período sem amortização (`meta.horizonte`) | consistente e declarado antes da modelagem | manter |
| Maturação e censura | Cap. 3 (pp. 11 e 12): "safra incompleta não é safra adimplente", calendário de safras | tratado corretamente | manter |
| Datas de disponibilidade e leakage | Cap. 3 p. 7 com regra "data do evento + latência ≤ data da decisão"; cap. 11 missão 4; `res.gbm_com_leakage` (AUC 1,0) e `gbm_leak_suave` (0,9676) | exemplo forte e reproduzível | manter; os dois cenários de vazamento têm métricas gravadas |
| Viés de seleção | `res.logit_populacao_completa_oot` (AUC 0,7548, prevalência 17,9%) contra aprovados (0,7257, 11,0%); cap. 3 p. 14 | inferência de rejeitados apresentada como limite, não como solução | manter |
| Separação temporal; pré-processamento e tuning fora do teste | `meta`: treino jan/22 a fev/23, validação mar a jul/23, OOT ago a dez/23; `gbm_hp.auc_val` como critério | protocolo correto (cap. 7 p. 17) | manter |
| WoE/IV | Cap. 3 pp. 16 e 17 com `woe_bins`, `coef` e escore 600 − 90·logit | convenção declarada (WoE = ln(maus/bons) por faixa) | explicitar o sinal da convenção no dicionário do aluno |
| Interpretação da logística | Cap. 4 pp. 10 a 14 (log odds, razão de chances, intercepto, unidade) | correta, com demonstração por descida de gradiente na base didática de 16 casos | manter |
| Árvores e boosting | Caps. 5 e 6 com `nucleo_did` (Gini, entropia, resíduo = negativo do gradiente) | correta; hiperparâmetros do GBM real em `meta.gbm_hp` | manter |
| Métricas e calibração | Cap. 7; ver seção 1 | conferem | achados A1 a A4 |
| Incerteza | Wilson em toda proporção; DeLong na comparação | coerente | portar DeLong |
| PD, LGD e EAD; rentabilidade | Cap. 8: LGD 65%, receita 28%, funding 12%, custo operacional R$ 120, capital 2% (`C8PAR`), ponte de reconciliação | hipóteses rotuladas como parâmetros da operação | manter; são hipóteses, não dados de mercado |
| PSI e monitoramento | Cap. 9 com PSI 0,0136 e gatilhos com responsável | correto; limiares 0,10 e 0,25 aparecem como convenção de mercado sem fonte primária | citar a origem convencional (não há norma) ao editar |
| Equidade | Cap. 9 p. 6: `fair` por grupo com intervalos | limites de inferência explicitados | manter |
| Regulação | Referências a Basileia III (BIS, dez/2017) e Res. CMN 4.966/2021 cadastradas em Materiais com aviso "verificar vigência" | o material não afirma regra regulatória específica | confirmar vigência antes de publicar afirmações normativas |

## 3. Rótulos de origem dos exemplos

Cada página carrega o selo original (`origem`): sintético (28 páginas), observado (2), documento institucional (22), esquema sem escala (38) e reconstrução didática (90). Nenhum resultado calculado na base sintética é apresentado como evidência empírica de mercado; o rótulo aparece no cabeçalho de cada página.

## 4. Revisão didática por unidade (pergunta central → intuição → exemplo → formalização → aplicação → checagem → conexão)

Evidência: cada capítulo tem pergunta central (`CAPITULOS.pergunta`), abertura em episódio com desafio e três etapas, páginas com objetivo único e frase de apoio, exemplo antes da fórmula (ex.: cap. 6 p. 10 "A fórmula depois da história"), questões com recuperação por alternativa, pergunta de checagem por página e "a seguir" como conexão. Inferência: a estrutura pedida já é a do material; a migração a preservou e tornou a pergunta de checagem respondível e registrada. Recomendação de revelação progressiva: o modo apresentação revela título → objetivo e apoio → corpo; demonstrações extensas (páginas complementares, 81 de 180) ficam fora da apresentação e acessíveis no estudo, sem redução de conteúdo.

Minutagem essencial por aula (calculada das páginas essenciais): aula 1 = 165 min, aula 2 = 165, aula 3 = 165, aula 4 = 165, trabalho final = 165; 180 − 15 de intervalo = 165. Confere.

## 5. Segurança de gabaritos e notas (executado)

Evidência: `scripts/content/build-legacy.mjs` remove do motor legado as propriedades `guia`, `certa`, `porqueCerta`, `erros` e `novaQuestao`, zera argumentos de guia das missões e limpa literais que reproduzam texto privado; a verificação final compara 40 caracteres de cada texto privado contra o bundle (0 vazamentos em 962 KB). Os testes de aceitação confirmam que páginas, estado da sessão e respostas de estudo não contêm `answerKey`, `porqueCerta` nem "Notas do professor" para alunos.

## 6. Pendências de revisão didática

- Portar os 84 visuais legados para componentes nativos em ordem de valor: c8p7 e c8p12 (política de corte), c4p16 e c4p17 (descida de gradiente), c5p6 e c5p7 (corte da raiz), c6p8 e c6p13 (boosting passo a passo), c7p9 e c7p10 (calibração), c9p3 e c9p4 (PSI). O núcleo numérico já está portado; falta a camada visual.
- Registrar respostas dos simuladores de decisão (c10p11 e c10p13, memorando do comitê) como questões do tipo decisão de crédito na sessão ao vivo.
- Confirmar edições e vigência das referências cadastradas em Materiais antes de publicá-las aos alunos.
