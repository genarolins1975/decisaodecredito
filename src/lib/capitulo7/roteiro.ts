/**
 * Roteiro do capítulo 7: a ordem, a pergunta de cada slide, o título (uma afirmação ou pergunta útil), a mensagem
 * principal, o nível e o tempo. Os quadros leem daqui; a camada capitulo7ReconstruidoV18 do material de origem usa os
 * mesmos títulos (conferido em tests/capitulo7-roteiro.test.ts) para que página, palco e guia digam a mesma coisa.
 */
export type Pergunta = "ordenacao" | "probabilidade" | "decisao" | "validacao" | "todas" | "apoio";
export type Nivel = "essencial" | "aprofundamento" | "apendice";
export type Slide = { slug: string; n: number; pergunta: Pergunta; titulo: string; sub: string; nivel: Nivel; min: number };

export const PERGUNTAS: { id: Exclude<Pergunta, "todas" | "apoio">; nome: string; frase: string }[] = [
  { id: "ordenacao", nome: "Ordenação", frase: "O modelo põe os clientes mais arriscados antes dos menos arriscados?" },
  { id: "probabilidade", nome: "Probabilidade", frase: "Entre clientes com PD de 10%, cerca de 10% dão default no horizonte?" },
  { id: "decisao", nome: "Decisão", frase: "Como a PD vira ação, com perdas, receita, capacidade e política?" },
  { id: "validacao", nome: "Validação", frase: "O resultado se sustenta fora da amostra, no tempo e nos segmentos?" },
];

export const ROTEIRO: Slide[] = [
  { slug: "c7p1", n: 1, pergunta: "todas", titulo: "Da PD à decisão: quatro perguntas para confiar no modelo", sub: "O comitê decide no slide 36; cada métrica responde a uma destas perguntas.", nivel: "essencial", min: 4 },
  { slug: "c7p21", n: 2, pergunta: "todas", titulo: "Estamos prevendo qual evento, para quem e em quanto tempo?", sub: "Métricas só se comparam quando a pergunta e a amostra são as mesmas.", nivel: "essencial", min: 3 },
  { slug: "c7p2", n: 3, pergunta: "ordenacao", titulo: "Aprovar todos pode produzir alta acurácia", sub: "Com evento raro, a regra que ignora o risco acerta quase tudo e não separa ninguém.", nivel: "essencial", min: 4 },
  { slug: "c7p3", n: 4, pergunta: "ordenacao", titulo: "Ordenar, prever e decidir são tarefas distintas", sub: "Os mesmos quatro clientes numa fila, numa escala de PD e diante de um corte.", nivel: "essencial", min: 4 },
  { slug: "c7p4", n: 5, pergunta: "ordenacao", titulo: "A fila de risco é o que as métricas de ordenação leem", sub: "Vinte propostas da janela, do maior risco estimado para o menor.", nivel: "essencial", min: 3 },
  { slug: "c7p5", n: 6, pergunta: "ordenacao", titulo: "AUC é uma disputa entre um default e um adimplente", sub: "Sorteie um de cada lado: com que frequência o default recebe a PD maior?", nivel: "essencial", min: 4 },
  { slug: "c7p22", n: 7, pergunta: "ordenacao", titulo: "A AUC exata conta todos os pares, com meio ponto por empate", sub: "Cinco defaults e quinze adimplentes formam 75 pares; nenhum sorteio é preciso.", nivel: "aprofundamento", min: 4 },
  { slug: "c7p23", n: 8, pergunta: "ordenacao", titulo: "Cada corte transforma a fila numa matriz de confusão", sub: "Recusar quando a PD passa do corte: quatro contagens, quatro consequências.", nivel: "essencial", min: 4 },
  { slug: "c7p6", n: 9, pergunta: "ordenacao", titulo: "A ROC percorre todos os cortes da fila", sub: "Cada ponto é um corte; a curva inteira já estava decidida pela ordem.", nivel: "essencial", min: 4 },
  { slug: "c7p24", n: 10, pergunta: "ordenacao", titulo: "O que a AUC responde e o que deixa em aberto", sub: "Ela mede a ordem. Não diz o nível da PD, nem o corte, nem a perda.", nivel: "essencial", min: 4 },
  { slug: "c7p7", n: 11, pergunta: "ordenacao", titulo: "KS: onde as duas distribuições mais se separam?", sub: "A maior distância entre as acumuladas de defaults e de adimplentes.", nivel: "essencial", min: 3 },
  { slug: "c7p8", n: 12, pergunta: "ordenacao", titulo: "Que parcela dos defaults está nos 10% mais arriscados?", sub: "O ganho acumulado traduz a fila em capacidade de trabalho.", nivel: "essencial", min: 3 },
  { slug: "c7p25", n: 13, pergunta: "ordenacao", titulo: "Lift: quantas vezes melhor que escolher ao acaso?", sub: "A taxa de default do grupo examinado contra a taxa da carteira.", nivel: "aprofundamento", min: 3 },
  { slug: "c7p26", n: 14, pergunta: "ordenacao", titulo: "Com evento raro, precisão e recall contam outra história", sub: "Entre os sinalizados, quantos são default? Dos defaults, quantos foram sinalizados?", nivel: "aprofundamento", min: 4 },
  { slug: "c7p27", n: 15, pergunta: "ordenacao", titulo: "Laboratório de discriminação", sub: "Mude a qualidade da fila e antecipe o que acontece com AUC, KS, ganho e lift.", nivel: "essencial", min: 5 },
  { slug: "c7p28", n: 16, pergunta: "probabilidade", titulo: "Uma boa fila ainda pode cobrar o risco errado", sub: "Mesma ordem, PDs em outro nível: a provisão e o preço mudam.", nivel: "essencial", min: 3 },
  { slug: "c7p9", n: 17, pergunta: "probabilidade", titulo: "Uma PD de 10% fala de um grupo, não de uma pessoa", sub: "Entre muitas propostas parecidas, cerca de 10% dão default; quantas, exatamente, varia.", nivel: "essencial", min: 3 },
  { slug: "c7p29", n: 18, pergunta: "probabilidade", titulo: "Média prevista igual à observada não prova calibração", sub: "Erros de sinais opostos se compensam na média.", nivel: "essencial", min: 3 },
  { slug: "c7p10", n: 19, pergunta: "probabilidade", titulo: "A curva de confiabilidade, construída faixa a faixa", sub: "Cada ponto compara a PD média prevista com a frequência observada no mesmo grupo.", nivel: "essencial", min: 4 },
  { slug: "c7p30", n: 20, pergunta: "probabilidade", titulo: "As faixas escolhidas mudam a leitura da curva", sub: "O agrupamento muda o diagnóstico visual, não as PDs.", nivel: "aprofundamento", min: 3 },
  { slug: "c7p31", n: 21, pergunta: "probabilidade", titulo: "Cinco defaults em cem casos não são uma verdade exata", sub: "A frequência observada tem incerteza, e ela depende do número de casos.", nivel: "essencial", min: 3 },
  { slug: "c7p32", n: 22, pergunta: "probabilidade", titulo: "Erro de nível e erro de inclinação têm assinaturas diferentes", sub: "Quatro formas típicas de errar a probabilidade, e como cada uma aparece na curva.", nivel: "aprofundamento", min: 4 },
  { slug: "c7p33", n: 23, pergunta: "probabilidade", titulo: "Brier: o custo quadrático de errar a probabilidade", sub: "Menor é melhor; o valor só se lê ao lado de uma referência na mesma amostra.", nivel: "essencial", min: 3 },
  { slug: "c7p34", n: 24, pergunta: "probabilidade", titulo: "Log loss: confiança errada custa caro", sub: "A perda cresce sem limite quando se dá probabilidade quase nula ao que aconteceu.", nivel: "aprofundamento", min: 3 },
  { slug: "c7p11", n: 25, pergunta: "probabilidade", titulo: "Menor Brier não prova melhor calibração", sub: "O Brier mistura separação e nível; a curva por faixa mostra o nível.", nivel: "essencial", min: 3 },
  { slug: "c7p35", n: 26, pergunta: "probabilidade", titulo: "Laboratório: boa fila, probabilidades ruins", sub: "Mexa no nível e na inclinação das PDs; a ordem e a AUC ficam onde estão.", nivel: "essencial", min: 5 },
  { slug: "c7p16", n: 27, pergunta: "validacao", titulo: "Recalibrar exige uma amostra própria", sub: "O calibrador é ajustado numa amostra e avaliado em outra, que ele nunca viu.", nivel: "essencial", min: 3 },
  { slug: "c7p12", n: 28, pergunta: "probabilidade", titulo: "Correção de nível: um ajuste de intercepto", sub: "Um número somado em log odds, estimado na amostra de calibração.", nivel: "essencial", min: 3 },
  { slug: "c7p13", n: 29, pergunta: "probabilidade", titulo: "Platt corrige nível e inclinação sem mexer na fila", sub: "Dois parâmetros sobre o log odds do modelo; com b positivo, a ordem se preserva.", nivel: "essencial", min: 3 },
  { slug: "c7p36", n: 30, pergunta: "probabilidade", titulo: "Isotônica: flexível, com degraus e empates", sub: "Segue os dados sem impor forma; com poucos dados, segue também o ruído.", nivel: "aprofundamento", min: 3 },
  { slug: "c7p37", n: 31, pergunta: "decisao", titulo: "O que muda depois de recalibrar", sub: "A fila fica; o nível muda; com corte fixo de PD, a decisão também muda.", nivel: "essencial", min: 4 },
  { slug: "c7p18", n: 32, pergunta: "decisao", titulo: "A probabilidade não escolhe sozinha a política", sub: "O corte econômico depende de perda, receita e custo, e raramente coincide com o KS.", nivel: "essencial", min: 4 },
  { slug: "c7p14", n: 33, pergunta: "validacao", titulo: "A métrica também é uma estatística", sub: "Reamostrar a janela mostra quanto a AUC e a diferença entre modelos variam.", nivel: "aprofundamento", min: 3 },
  { slug: "c7p15", n: 34, pergunta: "validacao", titulo: "Comparação justa: mesmos casos, mesma pergunta", sub: "Os modelos na mesma janela, com a diferença e o seu intervalo.", nivel: "essencial", min: 4 },
  { slug: "c7p17", n: 35, pergunta: "validacao", titulo: "OOT: a prova depois de congelar as escolhas", sub: "Tudo é decidido antes de abrir a janela final; reabrir para escolher a transforma em validação.", nivel: "essencial", min: 4 },
  { slug: "c7p38", n: 36, pergunta: "todas", titulo: "Você colocaria este modelo em produção?", sub: "Um dossiê, quatro decisões possíveis e a evidência que cada uma exige.", nivel: "essencial", min: 6 },
  { slug: "c7p20", n: 37, pergunta: "todas", titulo: "Confiar no modelo exige quatro respostas", sub: "Ordenar bem, prever probabilidades adequadas, decidir com hipóteses claras e provar fora da amostra.", nivel: "essencial", min: 4 },
  { slug: "c7p19", n: 38, pergunta: "apoio", titulo: "Apêndice: fórmulas, métricas fora do protocolo e referências", sub: "Material de consulta; o percurso da aula termina no slide anterior.", nivel: "apendice", min: 3 },
];

export const SLIDE = Object.fromEntries(ROTEIRO.map((s) => [s.slug, s])) as Record<string, Slide>;
export const TOTAL = ROTEIRO.length;
export const PRINCIPAL = ROTEIRO.filter((s) => s.nivel !== "apendice").length;
export const minutos = (nivel?: Nivel) => ROTEIRO.filter((s) => (nivel ? s.nivel === nivel : s.nivel !== "apendice")).reduce((a, s) => a + s.min, 0);

/** Rótulo curto de cada slide, para o mapa do slide 1 e a conclusão. */
export const CURTO: Record<string, string> = {
  c7p1: "Mapa", c7p21: "Evento, população e horizonte", c7p2: "Armadilha da acurácia", c7p3: "Ordenar, prever, decidir",
  c7p4: "Fila de risco", c7p5: "AUC como disputa", c7p22: "AUC exata", c7p23: "Matriz de confusão", c7p6: "ROC",
  c7p24: "Limites da AUC", c7p7: "KS", c7p8: "Ganho acumulado", c7p25: "Lift", c7p26: "Precisão e recall", c7p27: "Laboratório de ordenação",
  c7p28: "Boa fila, risco errado", c7p9: "PD de um grupo", c7p29: "Calibração global", c7p10: "Confiabilidade", c7p30: "Faixas",
  c7p31: "Wilson", c7p32: "Nível e inclinação", c7p33: "Brier", c7p34: "Log loss", c7p11: "Brier e calibração",
  c7p35: "Laboratório de calibração", c7p16: "Amostra própria", c7p12: "Intercepto", c7p13: "Platt", c7p36: "Isotônica",
  c7p37: "Depois de recalibrar", c7p18: "Corte econômico", c7p14: "Bootstrap", c7p15: "Comparação justa", c7p17: "OOT congelado",
  c7p38: "Caso integrador", c7p20: "Conclusão", c7p19: "Apêndice",
};
