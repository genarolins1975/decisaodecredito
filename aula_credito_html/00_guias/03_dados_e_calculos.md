# Dados, cálculos e exemplos canônicos

## 1. Separação obrigatória das fontes

Há quatro universos. Identifique-os na tela: **exemplo manual de logit**, **exemplo de árvore com 1.000 contratos**, **miniatura de boosting com 10 registros** e **experimento sintético treinado**. Os três primeiros explicam mecanismos; somente o último sustenta a comparação de desempenho. Não faça parecer que seus parâmetros foram estimados juntos.

Todos os resultados empíricos permanecem por calcular no momento deste briefing. Claude deverá gerar dados, treinar, avaliar e exportar os resultados. Nenhum roteiro fornece um vencedor antecipado.

## 2. Alvo e dicionário

Unidade: contrato de crédito pessoal, com um cliente único por registro no experimento didático. `y=1` se ocorrer atraso **superior a 90 dias** em qualquer momento dos 12 meses seguintes à contratação. Uma observação positiva pode ser identificada antes do fim; para formar as coortes comparáveis, use maturação completa da janela, evitando seleção pelo tempo de observação. Ausência de evento em janela incompleta não equivale a `y=0`.

| Campo | Unidade e significado | Disponibilidade |
|---|---|---|
| `renda` | R$/mês, renda verificada na proposta | Até a decisão |
| `comp` | %, comprometimento mensal após incluir a parcela proposta | Calculável na decisão |
| `rel` | Meses de relacionamento concluídos | Até a decisão |
| `util` | %, utilização de limites existentes | Último dado disponível até a decisão |
| `hist` | 0/1, presença de atraso de 15–89 dias nos 12 meses anteriores | Histórico conhecido na decisão |
| `canal` | Agência, digital ou parceiro | Na proposta; variável preditiva não causal |
| `origination_date` | Data da contratação | Define coorte |
| `target_available_date` | Contratação + 12 meses | Impede antecipação de rótulos |

Excluir solicitantes com inadimplência corrente segundo a elegibilidade didática. Todos os clientes do exemplo satisfazem essa condição. Valores ausentes, elegibilidade e seleção de aprovados são discutidos, sem abrir frentes de inferência de rejeitados ou modelagem regulatória.

## 3. Clientes recorrentes

| Cliente | Renda R$/mês | Comp. % | Rel. meses | Util. % | Hist. | Canal |
|---|---:|---:|---:|---:|---:|---|
| Ana | 7.000 | 22 | 36 | 30 | 0 | Agência |
| Bruno | 4.500 | 38 | 8 | 65 | 1 | Digital |
| Carla | 10.000 | 48 | 60 | 85 | 0 | Digital |
| Diego | 3.500 | 55 | 4 | 90 | 1 | Parceiro |

Perfis são fictícios. Identificadores, nomes e características permanecem fixos. Alterações por sliders criam uma simulação local, explicitamente identificada. Não atribua características comportamentais ou morais aos nomes.

## 4. Logit manual

Use o escore abaixo exclusivamente para demonstrar o mecanismo:

```text
z = -3,50
    + 0,04 × (comp - 30)
    + 0,80 × hist
    - 0,02 × (rel - 12)
    + 0,01 × (util - 40)
    - 0,00005 × (renda - 5.000)
p = 1 / (1 + exp(-z))
```

Coeficientes escolhidos para ensino, não estimados. O intercepto corresponde ao perfil de referência, com `hist=0`. Canal só entra nos exercícios adicionais de codificação e no modelo empírico; não altera esta fórmula-base silenciosamente.

| Cliente | z | PD exata aproximada | Exibição |
|---|---:|---:|---:|
| Ana | −4,500 | 0,0109869426 | 1,10% |
| Bruno | −2,025 | 0,1166029692 | 11,66% |
| Carla | −3,540 | 0,0281952880 | 2,82% |
| Diego | −0,965 | 0,2758782292 | 27,59% |

Comprometimento entra em pontos percentuais: subir de 30% para 40% aumenta z em 0,40 e multiplica as odds por exp(0,40). Aumento de R$ 1.000 reduz z em 0,05. Meses e reais não podem ser trocados por anos e milhares sem alterar os coeficientes.

Para um aumento Δz, a probabilidade nova é `p' = exp(Δz) × p / (1 - p + exp(Δz) × p)`. Para duplicação de odds, 2% vira aproximadamente 3,92%, 10% vira 18,18% e 40% vira 57,14%. O efeito marginal local de `comp` é `0,04 × p × (1-p)` em unidades de probabilidade por ponto percentual de comprometimento.

Log-loss individual: `−[y ln(p) + (1-y) ln(1-p)]`. Calcular com logaritmo natural, proteção numérica próxima de 0 e 1 e legenda para o arredondamento visual. Não confundir proteção numérica com alteração do dado observado.

## 5. Árvore manual

População de 1.000 contratos, 100 inadimplentes. Primeira divisão por `hist`:

| Nó/folha | n | Inadimplentes | PD empírica |
|---|---:|---:|---:|
| Raiz | 1.000 | 100 | 10% |
| hist=0 | 800 | 40 | 5% |
| hist=1 | 200 | 60 | 30% |
| hist=0 e comp≤40 | 600 | 18 | 3% |
| hist=0 e comp>40 | 200 | 22 | 11% |
| hist=1 e comp≤40 | 80 | 12 | 15% |
| hist=1 e comp>40 | 120 | 48 | 40% |

Logo, Ana percorre a folha de 3%, Bruno a de 15%, Carla a de 11% e Diego a de 40%. Esse contraste com o logit é de **mecanismo ilustrativo**, não uma comparação estimada de desempenho.

Gini binário = `2p(1-p)`. Raiz: 0,18. Primeira divisão por histórico: Gini ponderado 0,160, ganho 0,020. Candidato alternativo `comp≤40`: esquerda n=680/d=30, direita n=320/d=70. Calcule os valores com precisão integral e mostre por que o ganho por histórico é maior neste exemplo.

Não use esses quatro totais agregados para inventar resultados de qualquer limiar contínuo. No slide 23, para varrer limiares, gere registros compatíveis com todas as contagens, congele a semente e recalcule. Sem registros, restrinja a exploração aos dois candidatos definidos.

Para incerteza de folha, use Wilson nominal 95%, com z=1,96. Os pares 2/20 e 100/1.000 têm a mesma proporção, mas amplitudes diferentes. Mostre o cálculo e ressalve que o intervalo binomial descritivo não incorpora a seleção adaptativa da árvore. Folha com 0 eventos não prova risco zero.

## 6. Boosting manual: primeira ordem, sem passo de Newton

Dez registros, duas inadimplências. Grupo A com `comp=30`: cinco registros, todos y=0. Grupo B com `comp=50`: cinco registros, y=[0,0,0,1,1]. Nesta miniatura, a única entrada disponível ao stump é `comp`; existem apenas esses dois valores, logo o único corte entre valores distintos é 40. Isso impede que a árvore isole artificialmente os dois eventos com outro limiar não especificado. Os dois grupos são uma miniatura própria. Não são a árvore de 1.000 contratos nem os quatro clientes.

Comece com `p0=0,20`, `F0=ln(0,20/0,80)=−1,3862943611`. A perda é logística. O gradiente negativo em relação ao escore é `r=y-p`. Ajuste um stump por mínimos quadrados aos r. Seu valor em cada folha é a média dos resíduos. Use `η=1` apenas no exemplo de duas iterações, para facilitar leitura.

```text
r_im = y_i - sigmoid(F_(m-1)(x_i))
h_m = árvore de regressão ajustada aos r_im
F_m(x) = F_(m-1)(x) + η × h_m(x)
p_m(x) = sigmoid(F_m(x))
```

| Iteração | h no grupo A | h no grupo B | F em A | F em B | p em A | p em B |
|---|---:|---:|---:|---:|---:|---:|
| 0 | — | — | −1,386294 | −1,386294 | 20,0000% | 20,0000% |
| 1 | −0,200000 | +0,200000 | −1,586294 | −1,186294 | 16,9906% | 23,3922% |
| 2 | −0,169906 | +0,166078 | −1,756200 | −1,020217 | 14,7267% | 26,4985% |

A primeira árvore aumenta a previsão de todos os integrantes de B, inclusive seus três y=0. Ela aprende uma regularidade do grupo e não consulta o rótulo de uma pessoa nova. Na segunda iteração, os resíduos individuais mudam: em B, y=0 tem r=−0,233922 e y=1 tem r=+0,766078. A média é +0,166078.

Esta é uma versão didática válida de descida por gradiente funcional, com passo fixo e folhas ajustadas ao gradiente negativo. Implementações comerciais/bibliotecas podem usar otimização das folhas e informação de segunda ordem. **Não alegue que esses números reproduzem `GradientBoostingClassifier`, XGBoost ou LightGBM.** No experimento principal, use uma implementação documentada e exporte suas contribuições reais.

Se alterar η e continuar treinando, recalcule também as árvores seguintes. Escalar árvores já treinadas sem reajustar os resíduos é uma perturbação de um ensemble fixo, não o treinamento com outro learning rate.

## 7. Experimento sintético reproduzível

Gerar aproximadamente 28.000 contratos, seed fixa, com distribuições plausíveis, ruído Bernoulli, correlações moderadas entre variáveis, alguns ausentes e sinal linear mais não linearidade/interação moderada. Não ajuste o gerador depois de olhar o teste para favorecer um algoritmo. A equação geradora completa pertence ao notebook e ao apêndice, não às features disponíveis ao modelo.

Uma divisão ilustrativa que respeita disponibilidade de alvo:

| Partição | Contratações | n sugerido | Janela totalmente conhecida | Uso |
|---|---|---:|---|---|
| Treino | jan/2018–dez/2019 | 16.000 | dez/2020 | Ajustar parâmetros e pré-processamento |
| Validação de ajuste | jan–jun/2021 | 4.000 | jun/2022 | Hiperparâmetros e número de árvores |
| Calibração/política | ago–dez/2022 | 3.000 | dez/2023 | Calibrar e definir corte com modelo-base congelado |
| Teste final | fev–jul/2024 | 5.000 | jul/2025 | Avaliação final com regras congeladas antes de fev/2024 |

Datas e espaços entre coortes são pedagógicos: tornam visível o atraso de 12 meses para conhecer resultados. Não ensine que uma simples divisão por data de contratação elimina vazamento. Ao refazer um modelo-base em jul/2022, use apenas registros com alvo então disponível. Depois não reajuste o modelo-base com dados de calibração antes de testar, pois isso mudaria o objeto calibrado.

Na partição de calibração/política, separe subamostras ou use procedimento cruzado para que a escolha do corte não dependa apenas do ajuste aparente do calibrador. Documente o uso de cada observação. O teste final não seleciona transformações, hiperparâmetros, calibrador ou corte.

Treinar: logit regularizado com tratamento adequado de categorias/ausentes; árvore com controle de tamanho; boosting documentado. Incluir como sensibilidade um logit com transformações/interações para evitar baseline artificialmente fraco. Padronização e codificação são ajustadas apenas no treino apropriado. Não impor pré-processamento idêntico quando os métodos exigem tratamentos diferentes, mas manter o mesmo conjunto de informação e protocolo comparável.

Exportar previsões por registro, partição, versão e modelo; métricas agregadas; calibração por faixas; curvas ROC/KS; histórico de perda; cenários de hiperparâmetros; importâncias/explicações selecionadas; métricas da política. Se uma grade discreta sustentar um slider, mostre apenas valores realmente calculados. Registre semente, versões, parâmetros e hashes dos arquivos.

## 8. Ranking, calibração e economia

AUC = proporção de pares inadimplente/adimplente ordenados corretamente, com meio crédito para empate. KS usa a maior distância entre distribuições acumuladas de escores nas duas classes, com orientação declarada. Calibration plot compara média prevista e frequência observada na mesma faixa, mostrando n e eventos. Brier/log-loss combinam propriedades de previsão e não devem ser descritos como medidas puras de calibração.

Mecanismo econômico didático: receita líquida antes da perda por operação aprovada `m=R$1.200`, EAD=`R$10.000`, LGD=`60%`. Assuma m fixo independentemente do desfecho apenas para essa aproximação. Então `resultado esperado = m − PD×LGD×EAD`; equilíbrio em 20%. Declare que m já desconta os custos definidos e não é receita recebida em todos os cenários do mundo real. Perda esperada sozinha não é lucro.

Versão alternativa, separada e identificada: margem condicional ao adimplemento `m_good`, custo `c` e perda `L=LGD×EAD`. `E[resultado]=(1-p)m_good−pL−c`; corte `(m_good−c)/(m_good+L)`, quando aplicável. Não misture esse corte com 20% da aproximação anterior.

Na avaliação de políticas, use corte escolhido antes do teste. Um slider exploratório sobre o teste é análise retrospectiva e precisa desse rótulo, sem reposicionar o vencedor. Calcular taxa de aprovação, inadimplência entre aprovados, perdas observadas sob a simplificação e resultado esperado separadamente. Contratos rejeitados na simulação têm resultado zero e não entram no denominador da inadimplência dos aprovados. Se ninguém for aprovado, exiba “não definido”, não 0%.
