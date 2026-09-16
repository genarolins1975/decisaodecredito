# Inventário do material e mapa de cobertura da migração

Fonte: `content/original/apresentacao-curso-pd.html` (sha256 `94d94be0bcbb815fa5896286436aa29ffe7fa0a22bd19bf2ae5dacdb51483fcf`), extraída em 2026-09-16T21:05:47.204Z a partir do **estado final renderizado** (após as revisões internas v6, v10 e v13 do próprio arquivo). Destino: edição **2026** no banco da plataforma.

## Resumo

| Item | Quantidade |
|---|---|
| Páginas (slides) | 180 |
| Capítulos | 11 |
| Unidades (4 aulas + trabalho final) | 5 |
| Questões com gabarito (alternativa única) | 29 |
| Widgets de previsão (antes de ver o resultado) | 13 |
| Perguntas de checagem (do guia, uma por página) | 180 |
| Guia do professor (privado) | 180 páginas |
| Páginas com fórmulas (KaTeX + MathML) | 44 |
| Gráficos SVG | 69 |
| Tabelas | 112 |
| Rubricas extraídas | 2 (comite de c10p10; trabalho-final de c11p18) |
| Bases catalogadas (referenciadas, não fornecidas) | 10 |
| Renderização: nativa / estática / visual legado isolado | 21 / 75 / 84 |

## Como cada tipo de conteúdo foi migrado

- **Nativa**: abertura de capítulo (episódio) e síntese de fechamento viraram componentes React com abas acessíveis.
- **Estática**: HTML renderizado capturado do estado final, sanitizado (DOMPurify, sem scripts), com fórmulas convertidas em KaTeX/MathML e SVGs preservados.
- **Visual legado isolado**: páginas com simuladores (controles deslizantes, iterações, cenários) usam o motor original em iframe `sandbox` com CSP, servido só a matriculados, **sem guia nem gabaritos no código** (verificado por script). Cada uma tem versão estática alternativa. A retirada gradual está descrita em `docs/03-auditoria-tecnica-e-didatica.md`.
- **Questões**: extraídas para a tabela de questões versionadas; gabarito, explicações e recuperação ficam apenas no servidor e só saem após a resposta ou liberação.
- **Widgets de previsão**: viram questões do tipo `predict`; o conteúdo revelado fica como feedback servido após a resposta (e sincronizado com o visual legado quando existe).
- **Pergunta de checagem**: a pergunta e a resposta esperada do guia viraram questão de texto curto por página (resposta esperada exibida após o envio).

## Lacunas e pendências explícitas

- Bases dos 10 casos (aluno/casos/*.zip) referenciadas e não fornecidas: catálogo criado com status pendente.
- Pacote do trabalho final (README.md, guia de dados, propostas_desenvolvimento.csv, propostas_oot_sem_desfecho.csv, dicionario_dados.csv, TEMPLATE-MANIFESTO-MODELO.md, ROTEIRO-DE-TESTES.md, notebook-guiado.ipynb) referenciado e não fornecido.
- Rótulos verdadeiros do OOT (teste cego) não fornecidos: o teste cego fica configurável e inativo até o upload pelo professor.
- Interações específicas dos simuladores (ex.: descida de gradiente iterativa, escolha de política, memorando do comitê) não são persistidas como respostas do aluno; o professor pode publicar questões equivalentes (decisão de crédito, numérica, texto) na sessão ao vivo.
- Arquivos PDF adicionais: nenhum foi anexado a esta sessão.

## Mapa origem → destino por página

Legenda de renderização: N = nativa, E = estática, L = visual legado isolado. Q = questões com gabarito; P = previsões; ✔ = verificada no navegador sem erro (desktop, celular e projeção).

### Aula 1: Formular o problema e compreender a base

Entrega indicada: Especificação do modelo, inventário dos dados e proposta de divisão temporal

**Capítulo 1: O problema da decisão de crédito**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c1p1` | `/aulas/c1p1` | O problema da decisão de crédito | essencial | 6 | N | 0 | 0 | ✔ |
| `#/c1p2` | `/aulas/c1p2` | Crédito começa com uma decisão sob incerteza | essencial | 6 | S | 0 | 1 | ✔ |
| `#/c1p3` | `/aulas/c1p3` | Mais informação pode inverter uma decisão | essencial | 5 | S | 0 | 1 | ✔ |
| `#/c1p4` | `/aulas/c1p4` | Perfil igual, desfecho diferente | essencial | 6 | S | 0 | 1 | ✔ |
| `#/c1p5` | `/aulas/c1p5` | PD é probabilidade num horizonte declarado | essencial | 6 | L | 0 | 1 | ✔ |
| `#/c1p6` | `/aulas/c1p6` | O horizonte faz parte da estimativa | essencial | 5 | S | 0 | 1 | ✔ |
| `#/c1p7` | `/aulas/c1p7` | Mesma PD, decisões econômicas diferentes | essencial | 7 | L | 0 | 0 | ✔ |
| `#/c1p8` | `/aulas/c1p8` | Síntese: uma PD responde uma pergunta definida | essencial | 5 | N | 0 | 0 | ✔ |

**Capítulo 2: Fundamentos de modelagem estatística**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c2p1` | `/aulas/c2p1` | Fundamentos de modelagem estatística | complementar | 4 | N | 0 | 0 | ✔ |
| `#/c2p2` | `/aulas/c2p2` | O recorte do modelo na data da decisão | essencial | 5 | L | 0 | 0 | ✔ |
| `#/c2p3` | `/aulas/c2p3` | Unidade de observação: o que é uma linha da base | essencial | 7 | S | 1 | 0 | ✔ |
| `#/c2p4` | `/aulas/c2p4` | População, amostra e a base que de fato existe | complementar | 5 | S | 0 | 0 | ✔ |
| `#/c2p5` | `/aulas/c2p5` | Alvo, preditoras e tipos de variável | essencial | 6 | L | 0 | 0 | ✔ |
| `#/c2p6` | `/aulas/c2p6` | Mesmas características, desfechos diferentes | complementar | 6 | L | 0 | 0 | ✔ |
| `#/c2p7` | `/aulas/c2p7` | Probabilidade condicional: estimar dentro de um grupo | complementar | 8 | L | 0 | 0 | ✔ |
| `#/c2p8` | `/aulas/c2p8` | A forma da relação precisa ser escolhida antes de ser estimada | complementar | 7 | S | 0 | 0 | ✔ |
| `#/c2p9` | `/aulas/c2p9` | Parâmetro, estatística e hiperparâmetro | essencial | 7 | S | 1 | 0 | ✔ |
| `#/c2p10` | `/aulas/c2p10` | Estimar é escolher o valor que um critério prefere | complementar | 5 | S | 0 | 0 | ✔ |
| `#/c2p11` | `/aulas/c2p11` | A perda encontra a frequência do grupo | essencial | 9 | L | 0 | 0 | ✔ |
| `#/c2p12` | `/aulas/c2p12` | Descida de gradiente: descer a perda um passo por vez | complementar | 8 | L | 0 | 0 | ✔ |
| `#/c2p13` | `/aulas/c2p13` | Treino, validação e teste | essencial | 7 | S | 0 | 0 | ✔ |
| `#/c2p14` | `/aulas/c2p14` | Sobreajuste: quando o modelo decora a amostra | essencial | 9 | L | 0 | 0 | ✔ |
| `#/c2p15` | `/aulas/c2p15` | Viés e variância: os dois modos de errar | complementar | 5 | S | 0 | 0 | ✔ |
| `#/c2p16` | `/aulas/c2p16` | Toda estimativa vem com incerteza, e ela se calcula | complementar | 8 | L | 0 | 0 | ✔ |
| `#/c2p17` | `/aulas/c2p17` | O que a inferência não entrega, por mais dados que existam | complementar | 8 | S | 1 | 0 | ✔ |
| `#/c2p18` | `/aulas/c2p18` | Síntese: o vocabulário da modelagem | complementar | 5 | N | 0 | 0 | ✔ |

**Capítulo 3: Construção da base e das variáveis**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c3p1` | `/aulas/c3p1` | Dados disponíveis na data da decisão | essencial | 5 | N | 0 | 0 | ✔ |
| `#/c3p2` | `/aulas/c3p2` | Uma linha da base representa uma unidade econômica de decisão | complementar | 8 | S | 1 | 0 | ✔ |
| `#/c3p3` | `/aulas/c3p3` | Cada fonte enxerga uma parte diferente do cliente | complementar | 7 | S | 0 | 1 | ✔ |
| `#/c3p4` | `/aulas/c3p4` | Valor absoluto e razão respondem a perguntas diferentes | complementar | 7 | S | 0 | 1 | ✔ |
| `#/c3p5` | `/aulas/c3p5` | O mesmo nível pode esconder trajetórias opostas | complementar | 8 | S | 0 | 1 | ✔ |
| `#/c3p6` | `/aulas/c3p6` | Toda variável precisa de uma hipótese econômica declarada | complementar | 8 | S | 0 | 1 | ✔ |
| `#/c3p7` | `/aulas/c3p7` | Data do evento e data de disponibilidade são coisas diferentes | essencial | 10 | S | 1 | 0 | ✔ |
| `#/c3p8` | `/aulas/c3p8` | A janela de observação é tudo o que o modelo pode ver | essencial | 7 | S | 0 | 0 | ✔ |
| `#/c3p9` | `/aulas/c3p9` | A janela de performance é o que se quer prever | essencial | 7 | S | 0 | 0 | ✔ |
| `#/c3p10` | `/aulas/c3p10` | Mudar a definição do alvo muda a pergunta que se prevê | essencial | 9 | S | 0 | 1 | ✔ |
| `#/c3p11` | `/aulas/c3p11` | Uma safra só entra na base depois de maturar | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c3p12` | `/aulas/c3p12` | Safra incompleta não é safra adimplente | complementar | 9 | S | 1 | 0 | ✔ |
| `#/c3p13` | `/aulas/c3p13` | Informação do futuro torna o teste enganoso | essencial | 11 | S | 0 | 1 | ✔ |
| `#/c3p14` | `/aulas/c3p14` | A política anterior seleciona quem aparece na base | complementar | 10 | S | 0 | 1 | ✔ |
| `#/c3p15` | `/aulas/c3p15` | Balancear a amostra não muda o mundo | complementar | 9 | L | 1 | 0 | ✔ |
| `#/c3p16` | `/aulas/c3p16` | WoE: a faixa vista pelos dois desfechos | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c3p17` | `/aulas/c3p17` | Valor da informação por faixa | complementar | 8 | L | 0 | 0 | ✔ |
| `#/c3p18` | `/aulas/c3p18` | O desenho temporal desta base é cronológico e declarado | complementar | 7 | S | 0 | 0 | ✔ |
| `#/c3p19` | `/aulas/c3p19` | Escolha o desenho de base que sustenta a decisão | essencial | 12 | S | 1 | 0 | ✔ |
| `#/c3p20` | `/aulas/c3p20` | Síntese: a base respeita o tempo da decisão | complementar | 6 | N | 0 | 0 | ✔ |

### Aula 2: Entender as três técnicas

Entrega indicada: Comparação fundamentada dos modelos e exercícios de interpretação

**Capítulo 4: Regressão logística**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c4p1` | `/aulas/c4p1` | Regressão logística | essencial | 4 | N | 0 | 0 | ✔ |
| `#/c4p2` | `/aulas/c4p2` | A reta na probabilidade quebra por construção | complementar | 9 | S | 0 | 0 | ✔ |
| `#/c4p3` | `/aulas/c4p3` | Escala 1, probabilidade: o que ela é e onde ela aperta | essencial | 7 | L | 0 | 0 | ✔ |
| `#/c4p4` | `/aulas/c4p4` | Escala 2, odds: quantos defaults para cada adimplente | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c4p5` | `/aulas/c4p5` | Escala 3, log odds: onde somar faz sentido | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c4p6` | `/aulas/c4p6` | Probabilidade, odds, log odds e escore | complementar | 8 | L | 0 | 0 | ✔ |
| `#/c4p7` | `/aulas/c4p7` | A curva logística faz o caminho de volta | essencial | 7 | L | 0 | 0 | ✔ |
| `#/c4p8` | `/aulas/c4p8` | O escore é uma soma ponderada, e nada além disso | essencial | 7 | S | 0 | 0 | ✔ |
| `#/c4p9` | `/aulas/c4p9` | As três representações sincronizadas | complementar | 11 | L | 0 | 0 | ✔ |
| `#/c4p10` | `/aulas/c4p10` | O que um coeficiente significa, em log odds | essencial | 8 | S | 1 | 0 | ✔ |
| `#/c4p11` | `/aulas/c4p11` | Razão de chances: o coeficiente traduzido para multiplicação | complementar | 9 | S | 1 | 0 | ✔ |
| `#/c4p12` | `/aulas/c4p12` | Efeito constante em odds significa efeito variável em PD | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c4p13` | `/aulas/c4p13` | O intercepto é a âncora do nível, não um coeficiente comum | complementar | 7 | L | 0 | 0 | ✔ |
| `#/c4p14` | `/aulas/c4p14` | Trocar a unidade muda o coeficiente e não muda o modelo | complementar | 7 | S | 0 | 0 | ✔ |
| `#/c4p15` | `/aulas/c4p15` | A perda que determina os coeficientes | complementar | 7 | L | 0 | 0 | ✔ |
| `#/c4p16` | `/aulas/c4p16` | O gradiente com três parâmetros, uma iteração de cada vez | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c4p17` | `/aulas/c4p17` | A descida completa: os coeficientes aparecem | complementar | 9 | L | 1 | 0 | ✔ |
| `#/c4p18` | `/aulas/c4p18` | Conferência: três implementações, o mesmo resultado | complementar | 7 | S | 0 | 0 | ✔ |
| `#/c4p19` | `/aulas/c4p19` | A fronteira é uma reta no plano das variáveis | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c4p20` | `/aulas/c4p20` | O limite da família: linearidade em log odds | complementar | 10 | S | 0 | 0 | ✔ |
| `#/c4p21` | `/aulas/c4p21` | Laboratório: faixas devolvem flexibilidade sem trocar de família | complementar | 7 | L | 0 | 0 | ✔ |
| `#/c4p22` | `/aulas/c4p22` | Síntese: a lógica da regressão logística | complementar | 6 | N | 0 | 0 | ✔ |

**Capítulo 5: Árvores de decisão**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c5p1` | `/aulas/c5p1` | Árvores de decisão | essencial | 4 | N | 0 | 0 | ✔ |
| `#/c5p2` | `/aulas/c5p2` | A pergunta condicionada resolve o que a soma não resolve | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c5p3` | `/aulas/c5p3` | Anatomia: nó, regra, ramo, folha, profundidade | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c5p4` | `/aulas/c5p4` | Impureza: uma medida de quanto o grupo está misturado | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c5p5` | `/aulas/c5p5` | Impureza na raiz | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c5p6` | `/aulas/c5p6` | Avaliar um corte candidato | complementar | 10 | L | 1 | 0 | ✔ |
| `#/c5p7` | `/aulas/c5p7` | A disputa entre os cortes da raiz | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c5p8` | `/aulas/c5p8` | A raiz escolhida, e o que ela já resolve | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c5p9` | `/aulas/c5p9` | Recursão: a busca recomeça em cada lado | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c5p10` | `/aulas/c5p10` | Uma proposta dentro da árvore | essencial | 9 | S | 0 | 0 | ✔ |
| `#/c5p11` | `/aulas/c5p11` | Percorrer a árvore: a explicação completa de uma decisão | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c5p12` | `/aulas/c5p12` | A previsão da folha é a frequência da folha, e isso não é convenção | complementar | 9 | S | 0 | 0 | ✔ |
| `#/c5p13` | `/aulas/c5p13` | A confiabilidade de cada folha, calculada | complementar | 10 | S | 1 | 0 | ✔ |
| `#/c5p14` | `/aulas/c5p14` | Os dois freios: profundidade e mínimo de casos por folha | complementar | 10 | L | 0 | 0 | ✔ |
| `#/c5p15` | `/aulas/c5p15` | Poda: crescer primeiro, cortar depois, com um preço por folha | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c5p16` | `/aulas/c5p16` | Instabilidade: uma observação pode trocar a estrutura | complementar | 8 | L | 1 | 0 | ✔ |
| `#/c5p17` | `/aulas/c5p17` | Gini ou entropia: o critério não muda a conclusão aqui | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c5p18` | `/aulas/c5p18` | Logística e árvore nos mesmos casos | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c5p19` | `/aulas/c5p19` | Síntese: regras locais e controle de variância | complementar | 9 | N | 0 | 0 | ✔ |

**Capítulo 6: Gradient boosting com árvores**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c6p1` | `/aulas/c6p1` | Gradient boosting com árvores | essencial | 4 | N | 0 | 0 | ✔ |
| `#/c6p2` | `/aulas/c6p2` | A divisão de trabalho entre modelos | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c6p3` | `/aulas/c6p3` | Oito pontos, uma tendência e erros locais | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c6p4` | `/aulas/c6p4` | F₀: o melhor palpite sem usar nenhuma variável | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c6p5` | `/aulas/c6p5` | O erro como novo alvo | essencial | 9 | S | 0 | 0 | ✔ |
| `#/c6p6` | `/aulas/c6p6` | A primeira árvore de correção | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c6p7` | `/aulas/c6p7` | Taxa de aprendizagem: somar só um pedaço da correção | essencial | 9 | L | 0 | 0 | ✔ |
| `#/c6p8` | `/aulas/c6p8` | O que cada árvore acrescentou | complementar | 11 | L | 1 | 0 | ✔ |
| `#/c6p9` | `/aulas/c6p9` | Quatro correções, uma previsão | complementar | 10 | L | 0 | 0 | ✔ |
| `#/c6p10` | `/aulas/c6p10` | A fórmula depois da história | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c6p11` | `/aulas/c6p11` | Voltando ao crédito: onde a soma acontece | complementar | 9 | S | 0 | 0 | ✔ |
| `#/c6p12` | `/aulas/c6p12` | O resíduo y − p vira o alvo da próxima árvore | complementar | 10 | L | 1 | 0 | ✔ |
| `#/c6p13` | `/aulas/c6p13` | Boosting de classificação, iteração por iteração | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c6p14` | `/aulas/c6p14` | O que cada árvore acrescentou, em log odds | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c6p15` | `/aulas/c6p15` | Os quatro hiperparâmetros e o que cada um controla | complementar | 10 | L | 0 | 0 | ✔ |
| `#/c6p16` | `/aulas/c6p16` | η e M são acoplados, e por isso não se escolhem separadamente | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c6p17` | `/aulas/c6p17` | Fora da amostra: onde o boosting realmente é decidido | essencial | 9 | S | 1 | 0 | ✔ |
| `#/c6p18` | `/aulas/c6p18` | Três limites do boosting — e como responder | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c6p19` | `/aulas/c6p19` | Síntese: pequenas correções formam o boosting | complementar | 6 | N | 0 | 0 | ✔ |

### Aula 3: Validar e transformar previsão em decisão

Entrega indicada: Relatório de validação e recomendação de política

**Capítulo 7: Avaliação e calibração**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c7p1` | `/aulas/c7p1` | Validação, calibração e teste fora do tempo | essencial | 5 | N | 0 | 0 | ✔ |
| `#/c7p2` | `/aulas/c7p2` | Acerto de classificação mede a prevalência, não o modelo | complementar | 10 | L | 1 | 0 | ✔ |
| `#/c7p3` | `/aulas/c7p3` | Ordenação e nível de risco | essencial | 7 | S | 0 | 0 | ✔ |
| `#/c7p4` | `/aulas/c7p4` | Ordenar é montar uma fila de risco antes de qualquer métrica | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c7p5` | `/aulas/c7p5` | AUC é uma contagem de pares | essencial | 11 | L | 0 | 0 | ✔ |
| `#/c7p6` | `/aulas/c7p6` | A curva ROC é a consequência de percorrer todos os cortes | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c7p7` | `/aulas/c7p7` | KS é uma distância, e é preciso declarar onde ela foi medida | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c7p8` | `/aulas/c7p8` | Ganho e alavancagem traduzem a fila em capacidade de trabalho | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c7p9` | `/aulas/c7p9` | Calibração só pode ser verificada em grupos | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c7p10` | `/aulas/c7p10` | Compatibilidade entre previsão e frequência, faixa por faixa | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c7p11` | `/aulas/c7p11` | Brier e log loss resumem tudo num número e por isso não isolam nada | essencial | 10 | L | 1 | 0 | ✔ |
| `#/c7p12` | `/aulas/c7p12` | Recalibração e reestimação | complementar | 7 | L | 0 | 0 | ✔ |
| `#/c7p13` | `/aulas/c7p13` | Platt corrige o nível e não pode alterar a ordenação | complementar | 10 | S | 1 | 0 | ✔ |
| `#/c7p14` | `/aulas/c7p14` | A métrica também é uma estatística e também tem incerteza | complementar | 8 | S | 0 | 0 | ✔ |
| `#/c7p15` | `/aulas/c7p15` | Comparar duas AUCs na mesma amostra exige o teste de DeLong | complementar | 10 | S | 1 | 0 | ✔ |
| `#/c7p16` | `/aulas/c7p16` | Treino, validação e OOT têm papéis diferentes | complementar | 10 | L | 0 | 0 | ✔ |
| `#/c7p17` | `/aulas/c7p17` | O protocolo completo antes de abrir o OOT | essencial | 9 | S | 0 | 0 | ✔ |
| `#/c7p18` | `/aulas/c7p18` | Cada decisão pede uma evidência diferente | essencial | 7 | L | 0 | 0 | ✔ |
| `#/c7p19` | `/aulas/c7p19` | Métricas que este curso não usa, e o motivo de cada uma | complementar | 5 | S | 0 | 0 | ✔ |
| `#/c7p20` | `/aulas/c7p20` | Síntese: três perguntas de validação | essencial | 5 | N | 0 | 0 | ✔ |

**Capítulo 8: Da previsão à decisão econômica**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c8p1` | `/aulas/c8p1` | Da previsão à decisão econômica | complementar | 4 | N | 0 | 0 | ✔ |
| `#/c8p2` | `/aulas/c8p2` | Exposição é o valor em risco no instante do default | essencial | 6 | S | 0 | 1 | ✔ |
| `#/c8p3` | `/aulas/c8p3` | Default não é perder tudo, e a fração perdida é estimativa da operação | complementar | 6 | L | 0 | 0 | ✔ |
| `#/c8p4` | `/aulas/c8p4` | A perda esperada multiplica três fatores, e a mesma PD pode terminar em lados opostos | essencial | 9 | S | 1 | 0 | ✔ |
| `#/c8p5` | `/aulas/c8p5` | Resultado econômico por proposta | essencial | 9 | L | 0 | 0 | ✔ |
| `#/c8p6` | `/aulas/c8p6` | O ponto de equilíbrio em PD sai de uma equação resolvida, não de um palpite | essencial | 9 | L | 1 | 0 | ✔ |
| `#/c8p7` | `/aulas/c8p7` | Apertar o corte troca defaults evitados por bons recusados, e a troca se conta em reais | essencial | 9 | L | 0 | 0 | ✔ |
| `#/c8p8` | `/aulas/c8p8` | A curva de resultado por corte tem um máximo, e o corte intuitivo raramente cai nele | complementar | 8 | L | 1 | 0 | ✔ |
| `#/c8p9` | `/aulas/c8p9` | Revisão manual é compra de informação, e informação ruim infla o número que o banco reporta | complementar | 11 | L | 1 | 0 | ✔ |
| `#/c8p10` | `/aulas/c8p10` | Reconciliação é condição de aceite, não formalidade de anexo | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c8p11` | `/aulas/c8p11` | A política ótima se move com a fração perdida e com um choque de PD | complementar | 8 | L | 0 | 0 | ✔ |
| `#/c8p12` | `/aulas/c8p12` | Escolha a política e prove que ela fecha consigo mesma | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c8p13` | `/aulas/c8p13` | Síntese: risco, valor e política | essencial | 3 | N | 0 | 0 | ✔ |

### Aula 4: Defender, reproduzir e monitorar

Entrega indicada: Plano de monitoramento e decisão integrada de comitê

**Capítulo 9: Monitoramento e governança**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c9p1` | `/aulas/c9p1` | Monitoramento e governança | essencial | 4 | N | 0 | 0 | ✔ |
| `#/c9p2` | `/aulas/c9p2` | Três formas de um modelo mudar em produção | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c9p3` | `/aulas/c9p3` | O índice de estabilidade soma, faixa a faixa, o quanto a entrada se deslocou | essencial | 9 | L | 1 | 0 | ✔ |
| `#/c9p4` | `/aulas/c9p4` | PSI: localizar onde a entrada mudou | essencial | 6 | L | 0 | 0 | ✔ |
| `#/c9p5` | `/aulas/c9p5` | Diagnóstico antes da ação | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c9p6` | `/aulas/c9p6` | Equidade depende da pergunta e da incerteza | complementar | 9 | L | 0 | 0 | ✔ |
| `#/c9p7` | `/aulas/c9p7` | Um gatilho tem limiar, janela, responsável e ação, declarados antes da medição | essencial | 8 | L | 1 | 0 | ✔ |
| `#/c9p8` | `/aulas/c9p8` | Monte um painel que leva a uma decisão | essencial | 8 | L | 0 | 0 | ✔ |
| `#/c9p9` | `/aulas/c9p9` | Síntese: monitoramento que leva a uma ação | essencial | 4 | N | 0 | 0 | ✔ |

**Capítulo 10: Laboratório integrado**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c10p1` | `/aulas/c10p1` | Laboratório integrado | essencial | 5 | N | 0 | 0 | ✔ |
| `#/c10p2` | `/aulas/c10p2` | Três clientes, três zonas da política | complementar | 11 | L | 0 | 0 | ✔ |
| `#/c10p3` | `/aulas/c10p3` | O quadro de decisão do comitê | complementar | 14 | L | 0 | 0 | ✔ |
| `#/c10p4` | `/aulas/c10p4` | O que a evidência não diz, escrito antes que alguém pergunte | essencial | 11 | S | 1 | 0 | ✔ |
| `#/c10p5` | `/aulas/c10p5` | Campo 1: a recomendação diz o que fazer, com números e com prazo | essencial | 11 | L | 0 | 0 | ✔ |
| `#/c10p6` | `/aulas/c10p6` | Campo 2: cada número com amostra, denominador e origem | essencial | 11 | L | 0 | 0 | ✔ |
| `#/c10p7` | `/aulas/c10p7` | Campo 3: a incerteza é declarada com número, não com adjetivo | essencial | 11 | L | 0 | 0 | ✔ |
| `#/c10p8` | `/aulas/c10p8` | Campo 4: as condições dizem o que precisa existir antes da produção | complementar | 11 | L | 0 | 0 | ✔ |
| `#/c10p9` | `/aulas/c10p9` | Campo 5: o plano de acompanhamento vem pronto do capítulo 9 | complementar | 11 | L | 0 | 0 | ✔ |
| `#/c10p10` | `/aulas/c10p10` | A rubrica é declarada antes da rodada, e ela precisa poder reprovar | essencial | 8 | S | 1 | 0 | ✔ |
| `#/c10p11` | `/aulas/c10p11` | Rodada 1: defesa e contra-argumento, com a política na tela | essencial | 22 | L | 0 | 0 | ✔ |
| `#/c10p12` | `/aulas/c10p12` | O choque entra na mesa, e o estado dele fica visível daqui em diante | essencial | 13 | L | 0 | 0 | ✔ |
| `#/c10p13` | `/aulas/c10p13` | Rodada 2: o que mudou, o que não mudou e qual premissa caiu | essencial | 19 | L | 0 | 0 | ✔ |
| `#/c10p14` | `/aulas/c10p14` | Síntese: uma decisão que resiste a perguntas | essencial | 7 | N | 0 | 0 | ✔ |

### Trabalho final: Construir, testar e defender o modelo de PD

Entrega indicada: Dossiê final, código reproduzível, teste OOT e defesa individual

**Capítulo 11: Trabalho final de conclusão de curso**

| Origem | Destino | Título | Nível | Min | Rend. | Q | P | Verif. |
|---|---|---|---|---|---|---|---|---|
| `#/c11p1` | `/aulas/c11p1` | Trabalho final de conclusão de curso | essencial | 5 | N | 0 | 0 | ✔ |
| `#/c11p2` | `/aulas/c11p2` | A base foi desenhada para exigir decisões reais | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p3` | `/aulas/c11p3` | Missão 1 · A pergunta congelada antes dos dados | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p4` | `/aulas/c11p4` | Missão 2 · O dicionário como contrato | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p5` | `/aulas/c11p5` | Missão 3 · Auditoria com IDs afetados | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c11p6` | `/aulas/c11p6` | Missão 4 · O modelo perfeito que está errado | essencial | 10 | L | 0 | 0 | ✔ |
| `#/c11p7` | `/aulas/c11p7` | Missão 5 · O calendário como protocolo | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c11p8` | `/aulas/c11p8` | Missão 6 · A régua mínima | essencial | 12 | S | 0 | 0 | ✔ |
| `#/c11p9` | `/aulas/c11p9` | Missão 7 · Pré-processamento dentro do experimento | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p10` | `/aulas/c11p10` | Missão 7 · Três famílias, três modos de errar | essencial | 12 | S | 0 | 0 | ✔ |
| `#/c11p11` | `/aulas/c11p11` | Missão 7 · Explicação de uma previsão | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c11p12` | `/aulas/c11p12` | Missão 8 · Roteiro de discriminação | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p13` | `/aulas/c11p13` | Missão 9 · Calibração: quando 10% significa 10 em 100 | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c11p14` | `/aulas/c11p14` | Missão 10 · A conta econômica da PD | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c11p15` | `/aulas/c11p15` | Missão 11 · A falha escondida pela média | essencial | 10 | S | 0 | 0 | ✔ |
| `#/c11p16` | `/aulas/c11p16` | Missão 11 · Alertas com responsável e ação | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p17` | `/aulas/c11p17` | Missão 12 · Pacote congelado antes do arquivo cego | essencial | 8 | S | 0 | 0 | ✔ |
| `#/c11p18` | `/aulas/c11p18` | Avaliação final: quatro perguntas simples | essencial | 10 | L | 0 | 0 | ✔ |
