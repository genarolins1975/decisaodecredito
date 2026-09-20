# Mapa de reaproveitamento do material original

**Material localizado e lido.** `content/original/apresentacao-curso-pd.html`, 1,4 MB,
sha256 `94d94be0bcbb815fa5896286436aa29ffe7fa0a22bd19bf2ae5dacdb51483fcf`, extraído em
`content/generated/extract.json` (180 páginas, 11 capítulos). O capítulo 4, "Regressão
logística", tem 22 páginas e foi comparado página a página com os slides 07 a 20.

As 22 páginas do capítulo 4 foram lidas pelo título, pelo texto extraído e pelos
controles e tabelas registrados no extrato. Seis delas, c4p6, c4p11, c4p13, c4p14,
c4p19 e c4p21, foram lidas na íntegra, porque delas saíram os aprofundamentos
transcritos com números.

## Correspondência de blocos

A tabela abaixo é observação de assunto, não cadeia de derivação: os 50 slides foram
implementados a partir dos roteiros de `01_slides/`, e a comparação com o original
serve para localizar o que existia e o que foi aproveitado. Fora do capítulo 4, a
leitura foi por título e metadados de capítulo, não página a página.

| Capítulo original | Páginas | Bloco desta aula | Slides |
|---|---:|---|---|
| 1 O problema da decisão de crédito | 8 | Problema de crédito | 01 a 05 |
| 2 Fundamentos de modelagem estatística | 18 | diluído em 05, 13, 25, 45 | — |
| 3 Construção da base e das variáveis | 20 | Problema de crédito | 02 a 05 |
| 4 Regressão logística | 22 | Regressão logística | 07 a 20 |
| 5 Árvores de decisão | 19 | Árvore de decisão | 21 a 30 |
| 6 Gradient boosting com árvores | 19 | Gradient boosting | 31 a 42 |
| 7 Avaliação e calibração | 20 | Avaliação e decisão | 43 a 45 |
| 8 Da previsão à decisão econômica | 13 | Avaliação e decisão | 46, 47 |
| 9 Monitoramento e governança | 9 | Avaliação e decisão | 48 |
| 10 Laboratório integrado | 14 | Avaliação e decisão | 49, 50 |
| 11 Trabalho final | 18 | fora do escopo dos 50 slides | — |

## Capítulo 4, página a página

| Página original | Conteúdo útil | Destino | Decisão | Alteração e justificativa | Conferido |
|---|---|---|---|---|---|
| c4p1 Abertura do capítulo | Pergunta "como uma soma de evidências vira probabilidade" e a tríade soma, curva, limite | 06 e 07 | Adaptar | A abertura virou o slide 06, que compara os três mecanismos com a mesma ficha, e a pergunta passou a conduzir 07 a 12 | Sim |
| c4p2 A reta na probabilidade quebra | PD de −8,7% e 108,7% com reta ajustada na probabilidade | 08 | Manter o argumento, adaptar a interação | Mesmo defeito, agora com faixas hachuradas fora de 0% e 100% e controle de comprometimento que leva a previsão para fora dos limites | Sim |
| c4p3 Escala 1, probabilidade | O que a escala permite e o que não permite | 10 | Manter | Passou a ser um dos três blocos sincronizados do slide 10 | Sim |
| c4p4 Escala 2, odds | Leitura "quantos defaults para cada adimplente" | 10 | Manter | Leitura preservada literalmente na coluna de odds | Sim |
| c4p5 Escala 3, log odds | Onde somar faz sentido, variação em log odds | 10 e 11 | Dividir | O slide 10 mostra as três escalas do mesmo risco e o 11 usa a razão de odds constante | Sim |
| c4p6 Probabilidade, odds, log odds e escore | Quatro réguas preservam a mesma ordem, escore didático 865 | 09 (aprofundamento) | Complementar | Não cabia na sequência principal sem repetir o slide 10; foi para as notas de aprofundamento do slide 09, com os números do original | Sim |
| c4p7 A curva logística faz o caminho de volta | Inclinação máxima em z igual a zero e variação de 19,51 pontos | 09 e 14 | Manter e dividir | A curva ficou no 09 e o efeito variável do mesmo deslocamento virou o slide 14, com exploração própria | Sim |
| c4p8 O escore é uma soma ponderada | Tabela parcela a parcela, intercepto mais contribuições | 07 e 12 | Adaptar visual | A tabela virou waterfall com revelação por característica no 07, e a conferência em duas etapas ficou no 12 | Sim |
| c4p9 As três representações sincronizadas | Característica, escore e probabilidade no mesmo painel | 12 | Adaptar | Sincronia preservada, com o cliente canônico desta aula no lugar das propostas numeradas | Sim |
| c4p10 O que um coeficiente significa | Δz constante e ΔPD variável ao longo da faixa | 11 e 14 | Manter | A tabela de Δz constante com ΔPD crescente é a mensagem central do 14 | Sim |
| c4p11 Razão de chances | Coeficiente traduzido para multiplicação das chances | 11 (aprofundamento) | Manter, sem correção | A leitura do original já é "multiplica as chances", não risco relativo nem efeito causal. Os valores 2,1071 e 4,0370 foram para as notas do slide 11, identificados como do exemplo original | Sim |
| c4p12 Efeito constante em odds, efeito variável em PD | Tabela de PD inicial contra variação em pontos percentuais | 11 | Manter | Virou o gráfico de barras com três PDs iniciais e a tabela de conversão exata | Sim |
| c4p13 O intercepto é âncora de nível | Trocar o intercepto desloca todas as PDs e preserva a ordem | 07 (aprofundamento) | Complementar | Sem slide próprio na sequência de 50; foi para as notas do 07, ligado à recalibração do slide 45 | Sim |
| c4p14 Trocar a unidade muda o coeficiente | 0,74530 por dezena, 0,07453 por ponto, 7,45300 por fração, mesma PD | 11 (aprofundamento) | Complementar | Ponto importante para comparar variáveis; foi para as notas do 11, ligado aos coeficientes padronizados do slide 18 | Sim |
| c4p15 A perda que determina os coeficientes | Perda individual e por que ela custa | 13 | Manter | É exatamente o slide 13, com a curva da perda e o ponto móvel | Sim |
| c4p16 O gradiente com três parâmetros | Uma iteração por vez, com gradiente e passo | 32 a 35 | Reordenar | A descida aparece uma vez só nesta aula, no bloco de boosting, onde ela também é o mecanismo. Registrado nas notas do 13 | Sim |
| c4p17 A descida completa | Coeficientes convergindo | 32 a 35 | Reordenar | Mesma justificativa da página anterior | Sim |
| c4p18 Conferência de três implementações | Navegador, Python e sklearn com diferença máxima de 0,000327 | 43 (aprofundamento) | Adaptar | A conferência equivalente aqui é a do experimento: semente, versões e resumo criptográfico. Registrada nas notas do 13 e nos metadados do 43 | Sim |
| c4p19 A fronteira é uma reta no plano | Fronteira linear, corte desloca e coeficiente gira | 19 (aprofundamento) e 26 | Complementar | O contraste com as regiões retangulares da árvore ficou explícito nas notas do 19 | Sim |
| c4p20 O limite da família | Padrão não monótono não representável sem transformar | 16 e 19 | Manter | O slide 16 oferece a transformação e o 19 declara o limite | Sim |
| c4p21 Faixas devolvem flexibilidade | Regras de faixa, volume mínimo, monotonicidade, estabilidade e WoE | 16 (aprofundamento) | Adaptar | A sequência principal usa mudança de inclinação, com um parâmetro adicional em vez de um por faixa. As regras de faixa e a relação com o WoE foram para as notas do 16 | Sim |
| c4p22 Síntese do capítulo | Soma, curva e limite | 19 e 50 | Adaptar | A tríade está distribuída em 07, 09 e 19, e a síntese final ficou no 50, agora com os três modelos | Sim |

## Controle do exemplo canônico

- **A fórmula manual deste pacote foi mantida.** O original usa um logit de duas
  variáveis, utilização e maior atraso em 6 meses, com intercepto −5,6666, coeficiente
  0,7453 por dezena de pontos de utilização e 1,3955 por dezena de dias de atraso,
  sobre 16 propostas. Esta aula usa o exemplo do pacote, com seis características e
  quatro clientes, porque ele sustenta os 50 slides, o experimento sintético de 28.000
  contratos e as comparações com árvore e boosting. Trocar o exemplo canônico exigiria
  reescrever roteiros, dados, experimento e exercícios dos três blocos.
- **Nenhum número dos dois exemplos foi misturado.** Onde o exemplo original aparece,
  ele está nas notas de aprofundamento e identificado como "material original,
  capítulo 4, página N".
- **Excedente útil transferido.** As páginas c4p6, c4p13, c4p14, c4p18, c4p19 e c4p21
  não tinham espaço na sequência principal e foram para o modo estudo e o apêndice de
  impressão, nas notas de aprofundamento dos slides 07, 09, 11, 13, 16 e 19.
- **Ativos do original.** Nenhuma figura do original foi copiada. Todos os desenhos
  desta aula são SVG gerado a partir dos dados, o que era necessário para a interação e
  para a legibilidade em projeção. As referências internas do original não foram
  reaproveitadas porque a numeração de páginas muda.

## Síntese ao professor

O capítulo de logit foi preservado em conteúdo e em ordem de raciocínio: soma ponderada,
escore sem limites, curva logística, três escalas, razão de odds, perda, forma funcional,
interação e limite da família aparecem todos, na mesma sequência lógica do original.

Três mudanças merecem destaque. A primeira é o exemplo canônico: as duas variáveis do
original deram lugar às seis características que percorrem os 50 slides, e o exemplo
original ficou preservado nas notas. A segunda é a descida de gradiente, que no original
aparecia no capítulo de logit e aqui aparece uma vez só, no bloco de boosting, onde
também é o mecanismo de ajuste. A terceira é o tratamento de forma funcional: o original
oferece faixas e esta aula oferece mudança de inclinação, com as regras de faixa
preservadas nas notas do slide 16.

Nada foi descartado por estilo. As páginas que não viraram slide principal estão
identificadas acima, com o destino de cada uma.
