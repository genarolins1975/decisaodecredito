/**
 * Roteiro do capítulo 12, classificação e ensembles: a ordem, a pergunta de cada slide, o título (afirmação ou pergunta
 * útil), o nível e o tempo. Os quadros leem daqui e a camada capitulo12V20 do material de origem usa os mesmos títulos.
 *
 * Arco (a mesma lógica da aula do professor, em quatro blocos):
 *   gancho    um detector de 5 acerta 95,7% das imagens. Ele é bom? (a turma guarda a resposta);
 *   pergunta  como um modelo vira rótulo, como medir os erros que importam, por que combinar modelos reduz o erro e
 *             como o modelo vira decisão de corte;
 *   tensão    o modelo que nunca diz 5 acerta 91,0%; o limiar troca um erro pelo outro; um modelo isolado tem limite;
 *   virada    modelos medianos, combinados, superam o melhor deles, desde que errem de formas diferentes; e fora do
 *             tempo todo modelo perde discriminação;
 *   decisão   no caso de crédito, a regra de corte se escolhe por precisão, recall, volume recusado e estabilidade.
 * Caso: MNIST (60.000 imagens de treino) para as métricas; duas luas (500 pontos) para os ensembles; o caso de crédito
 * do material da aula (82.458 contratos no curto prazo) para a decisão. Números de src/lib/capitulo12/dados.ts.
 */
import type { Nivel, Pergunta, Slide } from "@/lib/capitulo7/roteiro";
import { int, num, pct } from "../capitulo7/formato";
import { CORTE, IRIS, LUAS, M_SGD, M_TRIVIAL, N_TREINO_LUAS } from "./dados";
import { acertoDaMaioria } from "./metricas";

/** Sem declaração de base comum: cada fonte diz de onde vem (MNIST, luas, Iris ou o caso de crédito). */
export const BASE_C12 = "";
const PETALA = IRIS.importancia[2] + IRIS.importancia[3];
const MIL = acertoDaMaioria(1001, 0.51);

export const PERGUNTAS: { id: Exclude<Pergunta, "todas" | "apoio">; nome: string; frase: string }[] = [
  { id: "ordenacao", nome: "Classificação", frase: "Como um modelo transforma dados em um rótulo?" },
  { id: "probabilidade", nome: "Desempenho", frase: "Como medir os erros que importam?" },
  { id: "decisao", nome: "Ensembles", frase: "Por que combinar modelos reduz o erro?" },
  { id: "validacao", nome: "Crédito", frase: "Como o modelo vira uma decisão de corte?" },
];

export const ROTEIRO: Slide[] = [
  { slug: "c12p1", n: 1, pergunta: "todas", titulo: `Um modelo acerta ${pct(M_SGD.acuracia, 1)} das previsões. Ele é bom?`, sub: "Guarde sua resposta. Voltamos a ela no fim com três critérios: o modelo trivial, o limiar e a estabilidade no tempo.", nivel: "essencial", min: 4 },
  { slug: "c12p2", n: 2, pergunta: "ordenacao", titulo: "Uma imagem entra, um rótulo sai: como o modelo aprende essa função?", sub: "Dados, rótulo binário, treino e teste, classificador: os quatro passos deste bloco.", nivel: "essencial", min: 2 },
  { slug: "c12p3", n: 3, pergunta: "ordenacao", titulo: "Quatro termos que usaremos a aula inteira", sub: "Instância, característica, rótulo e classe positiva, no MNIST e no crédito.", nivel: "essencial", min: 3 },
  { slug: "c12p4", n: 4, pergunta: "ordenacao", titulo: "MNIST: 70 mil algarismos escritos à mão", sub: "Cada imagem tem 28 × 28 = 784 pixels. A escrita varia; o rótulo permanece.", nivel: "essencial", min: 3 },
  { slug: "c12p5", n: 5, pergunta: "ordenacao", titulo: "A base em código: 70 mil linhas, 784 colunas", sub: "Uma imagem por linha, um pixel por coluna, e um vetor de rótulos ao lado.", nivel: "essencial", min: 3 },
  { slug: "c12p6", n: 6, pergunta: "ordenacao", titulo: "Simplificamos para duas classes: 5 ou não 5", sub: "O mesmo formato aparece em inadimplência, fraude, doença e intenção de compra.", nivel: "essencial", min: 3 },
  { slug: "c12p7", n: 7, pergunta: "ordenacao", titulo: "Treino com 60 mil imagens, teste com 10 mil", sub: "O teste fica guardado até o fim: medir a qualidade nos dados de treino superestima o desempenho.", nivel: "essencial", min: 3 },
  { slug: "c12p8", n: 8, pergunta: "ordenacao", titulo: "O primeiro classificador: linear, ajustado por SGD", sub: "Um score por imagem; acima de zero, o modelo diz 5. Quanto podemos confiar nessas previsões?", nivel: "essencial", min: 4 },
  { slug: "c12p9", n: 9, pergunta: "probabilidade", titulo: "Como medir os erros que importam?", sub: "A matriz de confusão mostra os erros; o limiar decide quais deles a operação aceita.", nivel: "essencial", min: 2 },
  { slug: "c12p10", n: 10, pergunta: "probabilidade", titulo: "A acurácia esconde quem errou", sub: `Só ${pct(M_SGD.prevalencia, 1)} das imagens de treino são 5. Quanto acerta um modelo que nunca diz 5?`, nivel: "essencial", min: 4 },
  { slug: "c12p11", n: 11, pergunta: "probabilidade", titulo: "A matriz de confusão separa acertos e dois tipos de erro", sub: "Linhas: a classe real. Colunas: a classe prevista. Os erros têm rosto.", nivel: "essencial", min: 4 },
  { slug: "c12p12", n: 12, pergunta: "probabilidade", titulo: "Precisão: quando o modelo diz 5, quanto acerta?", sub: "Mede a confiabilidade das previsões positivas.", nivel: "essencial", min: 3 },
  { slug: "c12p13", n: 13, pergunta: "probabilidade", titulo: "Recall: dos 5 que existem, quantos o modelo encontra?", sub: "Também chamado de sensibilidade ou taxa de verdadeiros positivos (TPR).", nivel: "essencial", min: 3 },
  { slug: "c12p14", n: 14, pergunta: "probabilidade", titulo: "F1 resume precisão e recall pela média harmônica", sub: "F1 alto exige os dois altos ao mesmo tempo: a média harmônica pune o desequilíbrio.", nivel: "essencial", min: 3 },
  { slug: "c12p15", n: 15, pergunta: "probabilidade", titulo: "Uma métrica sozinha faz o modelo trivial parecer razoável", sub: "Cada métrica responde a uma pergunta diferente sobre os mesmos erros.", nivel: "essencial", min: 3 },
  { slug: "c12p16", n: 16, pergunta: "probabilidade", titulo: "Em crédito, os dois erros têm custos diferentes", sub: "A classe positiva é o mau pagador. Qual erro custa mais: o falso positivo ou o falso negativo?", nivel: "essencial", min: 4 },
  { slug: "c12p17", n: 17, pergunta: "probabilidade", titulo: "O score vira decisão quando cruza o limiar", sub: "Doze dígitos ordenados pelo score: acima do limiar, o modelo prevê 5.", nivel: "essencial", min: 3 },
  { slug: "c12p18", n: 18, pergunta: "probabilidade", titulo: "Subir o limiar troca recall por precisão", sub: "O recall só pode cair; a precisão tende a subir, mas pode oscilar em amostras finitas.", nivel: "essencial", min: 4 },
  { slug: "c12p19", n: 19, pergunta: "probabilidade", titulo: "Cada limiar é um ponto; o conjunto forma a curva ROC", sub: "TPR contra FPR em todos os limiares: compara modelos sem escolher um corte.", nivel: "essencial", min: 4 },
  { slug: "c12p20", n: 20, pergunta: "probabilidade", titulo: "Quando as curvas se cruzam, a região de operação decide", sub: "Se uma curva domina a outra, a escolha é imediata; se elas se cruzam, depende da FPR que se tolera.", nivel: "aprofundamento", min: 3 },
  { slug: "c12p21", n: 21, pergunta: "probabilidade", titulo: "AUC resume a curva; o Gini reescala a mesma informação", sub: "Gini = 2 × AUC − 1. Um modelo isolado tem limites. E se combinarmos vários?", nivel: "essencial", min: 3 },
  { slug: "c12p22", n: 22, pergunta: "decisao", titulo: "Por que a combinação de modelos medianos pode superar o melhor deles?", sub: "Votação, bagging, florestas aleatórias e boosting: quatro formas de combinar.", nivel: "essencial", min: 2 },
  { slug: "c12p53", n: 23, pergunta: "decisao", titulo: "A sabedoria das multidões", sub: "Pergunta para assistir ao vídeo: em que condições a resposta do grupo erra menos do que a dos indivíduos?", nivel: "essencial", min: 6 },
  { slug: "c12p23", n: 24, pergunta: "decisao", titulo: "Votação: vários algoritmos, vence a maioria", sub: "Algoritmos diferentes, treinados nos mesmos dados, votam na classe de cada nova instância.", nivel: "essencial", min: 3 },
  { slug: "c12p24", n: 25, pergunta: "decisao", titulo: `Mil classificadores de 51% acertam ${pct(MIL, 1)} por maioria`, sub: "Duas condições: muitos aprendizes fracos e erros diferentes entre si.", nivel: "essencial", min: 4 },
  { slug: "c12p25", n: 26, pergunta: "decisao", titulo: "Quatro formas de produzir erros diferentes", sub: "Quanto menos correlacionados os erros, maior o ganho de combinar: três formas em paralelo, uma em sequência.", nivel: "essencial", min: 2 },
  { slug: "c12p26", n: 27, pergunta: "decisao", titulo: "Um problema de teste: duas luas entrelaçadas", sub: `500 observações com ruído de 0,30: ${int(N_TREINO_LUAS)} para treino e ${int(500 - N_TREINO_LUAS)} para teste.`, nivel: "essencial", min: 3 },
  { slug: "c12p27", n: 28, pergunta: "decisao", titulo: "Votação em código: três algoritmos, um voto", sub: "Hard voting conta as classes previstas; soft voting faz a média das probabilidades.", nivel: "essencial", min: 3 },
  { slug: "c12p28", n: 29, pergunta: "decisao", titulo: "O voto vence os modelos isolados, por poucos acertos", sub: `Cada observação de teste vale ${num(100 / (500 - N_TREINO_LUAS), 1)} ponto percentual.`, nivel: "essencial", min: 4 },
  { slug: "c12p29", n: 30, pergunta: "decisao", titulo: "Bagging: o mesmo algoritmo em amostras diferentes", sub: "Sorteio com reposição: uma instância pode aparecer mais de uma vez na amostra de um preditor.", nivel: "essencial", min: 3 },
  { slug: "c12p30", n: 31, pergunta: "decisao", titulo: `Bagging com 500 árvores acerta ${int(LUAS.modelos.bag500.acertos - LUAS.modelos.arvore.acertos)} pontos de teste a mais que a árvore única, em ${int(500 - N_TREINO_LUAS)}`, sub: "Cada árvore vê 100 das 375 instâncias de treino; o conjunto vota.", nivel: "essencial", min: 3 },
  { slug: "c12p31", n: 32, pergunta: "decisao", titulo: "O ensemble suaviza a fronteira de decisão", sub: "Viés semelhante, variância menor: a árvore isolada recorta o plano para acertar pontos do treino.", nivel: "essencial", min: 4 },
  { slug: "c12p32", n: 33, pergunta: "decisao", titulo: "Com amostras do tamanho do treino, cada árvore deixa de fora cerca de 37%", sub: "Em m sorteios com reposição, uma instância escapa com probabilidade (1 − 1/m)ᵐ.", nivel: "aprofundamento", min: 3 },
  { slug: "c12p33", n: 34, pergunta: "decisao", titulo: "A validação out of bag antecipa o teste?", sub: "Cada instância é avaliada só pelas árvores que não a usaram no treino, sem custo adicional.", nivel: "essencial", min: 3 },
  { slug: "c12p34", n: 35, pergunta: "decisao", titulo: "Floresta aleatória: amostras e características sorteadas", sub: "A cada divisão, só um subconjunto aleatório de características é considerado: árvores menos correlacionadas.", nivel: "essencial", min: 3 },
  { slug: "c12p35", n: 36, pergunta: "decisao", titulo: `Na Iris, as medidas da pétala somam ${pct(PETALA, 0)} da importância`, sub: "Importância: quanto cada característica reduz, em média, a impureza das árvores.", nivel: "essencial", min: 3 },
  { slug: "c12p36", n: 37, pergunta: "decisao", titulo: "Gradient boosting em três árvores", sub: "Treino sequencial: a árvore 1 ajusta os dados; as árvores 2 e 3 ajustam o resíduo.", nivel: "essencial", min: 3 },
  { slug: "c12p37", n: 38, pergunta: "decisao", titulo: "Gradient boosting: cada árvore ajusta o resíduo", sub: "A cada etapa, o resíduo encolhe e a previsão acompanha melhor a curva.", nivel: "essencial", min: 4 },
  { slug: "c12p38", n: 39, pergunta: "decisao", titulo: "Síntese: quatro formas de produzir diversidade", sub: "Como esses modelos viram decisão em uma carteira de crédito?", nivel: "essencial", min: 2 },
  { slug: "c12p39", n: 40, pergunta: "validacao", titulo: "Como um classificador vira uma decisão de corte?", sub: "A decisão combina discriminação, estabilidade no tempo e volume de recusas.", nivel: "essencial", min: 2 },
  { slug: "c12p40", n: 41, pergunta: "validacao", titulo: "O caso: identificar quem não paga nenhuma parcela", sub: "Concentrar o corte no maior risco, removendo menos de 10% da população.", nivel: "essencial", min: 3 },
  { slug: "c12p41", n: 42, pergunta: "validacao", titulo: "Fora do tempo: treinar no passado, testar no futuro", sub: "Treino em safras antigas; validação em safras posteriores, que o modelo nunca viu.", nivel: "essencial", min: 3 },
  { slug: "c12p42", n: 43, pergunta: "validacao", titulo: "Fora do tempo, os três modelos do caso perdem discriminação", sub: "AUC e Gini no treino e na validação fora do tempo, nos três modelos do caso.", nivel: "essencial", min: 3 },
  { slug: "c12p43", n: 44, pergunta: "validacao", titulo: "Fora do tempo, as faixas de score se aproximam", sub: "No treino, a taxa de maus sobe em escada; na validação, a escada achata.", nivel: "essencial", min: 4 },
  { slug: "c12p44", n: 45, pergunta: "validacao", titulo: "Sobreajuste ou mudança na população? Que evidência separa as hipóteses?", sub: "O material classifica o caso como sobreajuste. A queda também pode refletir mudança de perfil, de período ou de política.", nivel: "aprofundamento", min: 3 },
  { slug: "c12p45", n: 46, pergunta: "validacao", titulo: "Três regras de corte: onde ficam os maus", sub: "Todas concentram os maus no grupo removido. A questão é quanto da base cada uma recusa.", nivel: "essencial", min: 3 },
  { slug: "c12p46", n: 47, pergunta: "validacao", titulo: "Cada métrica da aula responde a uma pergunta do comitê", sub: "Com o mau pagador como classe positiva.", nivel: "essencial", min: 3 },
  { slug: "c12p47", n: 48, pergunta: "validacao", titulo: "Política, modelo ou os dois: qual regra você levaria ao comitê?", sub: `Use precisão, recall e volume do corte. A meta: remover menos de 10% da população.`, nivel: "essencial", min: 5 },
  { slug: "c12p48", n: 49, pergunta: "todas", titulo: "Síntese da aula: quatro perguntas, quatro respostas", sub: "Do rótulo à decisão de corte, com os números da aula.", nivel: "essencial", min: 3 },
  { slug: "c12p49", n: 50, pergunta: "todas", titulo: "De volta à pergunta de abertura", sub: `${pct(M_SGD.acuracia, 1)} de acurácia só é bom resultado se superar o trivial (${pct(M_TRIVIAL.acuracia, 1)}), se o limiar refletir o custo de cada erro e se a ordenação sobreviver ao tempo.`, nivel: "essencial", min: 3 },
  { slug: "c12p50", n: 51, pergunta: "apoio", titulo: "Apêndice: dados do caso no curto e no longo prazo", sub: `Contagens por regra e grupo, com volume, precisão, recall, peso de evidência e IV. No longo prazo, ${int(CORTE.longo.politica.semClassificacao)} contratos não são bons nem maus.`, nivel: "apendice", min: 3 },
  { slug: "c12p51", n: 52, pergunta: "apoio", titulo: "Apêndice: volume e taxa de maus por safra no exemplo de sobreajuste", sub: "A linha azul delimita o período fora do tempo; depois dela, as taxas de maus das faixas se aproximam.", nivel: "apendice", min: 2 },
  { slug: "c12p52", n: 53, pergunta: "apoio", titulo: "Apêndice: referências e métodos além da aula", sub: "A fonte primária de cada método da aula e o que a prática atual acrescenta: importância por permutação, SHAP, boosting por histograma e stacking.", nivel: "apendice", min: 3 },
];

export const SLIDE = Object.fromEntries(ROTEIRO.map((s) => [s.slug, s])) as Record<string, Slide>;
export const TOTAL = ROTEIRO.length;
export const minutos = (nivel?: Nivel) => ROTEIRO.filter((s) => (nivel ? s.nivel === nivel : s.nivel !== "apendice")).reduce((a, s) => a + s.min, 0);

/** Rótulo curto de cada slide, para o mapa do slide 1 e a síntese. */
export const CURTO: Record<string, string> = {
  c12p1: "Abertura", c12p2: "Bloco 1", c12p3: "Quatro termos", c12p4: "MNIST", c12p5: "Base em código", c12p6: "5 ou não 5", c12p7: "Treino e teste", c12p8: "Primeiro classificador",
  c12p9: "Bloco 2", c12p10: "Acurácia", c12p11: "Matriz de confusão", c12p12: "Precisão", c12p13: "Recall", c12p14: "F1", c12p15: "Quatro métricas", c12p16: "Custo dos erros",
  c12p17: "Limiar", c12p18: "Precisão contra recall", c12p19: "Curva ROC", c12p20: "Curvas que se cruzam", c12p21: "AUC e Gini",
  c12p22: "Bloco 3", c12p53: "Sabedoria das multidões", c12p23: "Votação", c12p24: "Lei dos Grandes Números", c12p25: "Quatro formas", c12p26: "Duas luas", c12p27: "Votação em código", c12p28: "Voto contra isolados",
  c12p29: "Bagging", c12p30: "500 árvores", c12p31: "Fronteira", c12p32: "37% de fora", c12p33: "Out of bag", c12p34: "Floresta aleatória", c12p35: "Importância", c12p36: "Boosting em código", c12p37: "Resíduo", c12p38: "Síntese dos ensembles",
  c12p39: "Bloco 4", c12p40: "O caso", c12p41: "Fora do tempo", c12p42: "AUC fora do tempo", c12p43: "Sobreajuste", c12p44: "Sobreajuste ou população", c12p45: "Regras de corte", c12p46: "Métricas do comitê", c12p47: "Exercício do comitê",
  c12p48: "Síntese", c12p49: "Pergunta de abertura", c12p50: "Apêndice: dados do caso", c12p51: "Apêndice: safras", c12p52: "Apêndice: referências",
};

/** Blocos da aula: a pergunta, o slide de abertura e os passos (rótulo e slide) do "Neste bloco". */
export const BLOCOS: { pergunta: Exclude<Pergunta, "todas" | "apoio">; abre: string; passos: [string, string][] }[] = [
  { pergunta: "ordenacao", abre: "c12p2", passos: [["Dados", "c12p4"], ["Rótulo binário", "c12p6"], ["Treino e teste", "c12p7"], ["Classificador", "c12p8"]] },
  { pergunta: "probabilidade", abre: "c12p9", passos: [["Acurácia", "c12p10"], ["Matriz de confusão", "c12p11"], ["Precisão e recall", "c12p12"], ["Limiar", "c12p17"], ["ROC, AUC e Gini", "c12p19"]] },
  { pergunta: "decisao", abre: "c12p22", passos: [["Multidões", "c12p53"], ["Votação", "c12p23"], ["Bagging", "c12p29"], ["Florestas aleatórias", "c12p34"], ["Boosting", "c12p36"]] },
  { pergunta: "validacao", abre: "c12p39", passos: [["Objetivo do caso", "c12p40"], ["Validação no tempo", "c12p41"], ["Regras de corte", "c12p45"], ["Métricas do corte", "c12p46"]] },
];
