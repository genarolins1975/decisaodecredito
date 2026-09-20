# Slide 26 — A árvore transforma o espaço em regiões

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** árvore manual.

## Objetivo e mensagem
Conectar regras textuais a uma função de previsão por regiões. Mensagem: “Os efeitos dependem do caminho; dentro de uma folha, a previsão é constante.”

## Tela e composição
Título: **“O mesmo aumento de comprometimento pode mudar de folha”**. Visual central com duas faixas empilhadas para hist=0 e hist=1, eixo horizontal comp de 0–80%. Cada faixa se divide em 40%, com PDs de 3%/11% e 15%/40%. À direita, a pequena árvore sincronizada. As faixas devem ser rotuladas como categorias de histórico, sem sugerir que hist varia continuamente.

## Dados
Usar exatamente a árvore de 1.000 contratos. Ana (22,0), Bruno (38,1), Carla (48,0), Diego (55,1) são marcadores. A altura/cor das regiões pode representar PD desde que a escala seja explícita e igual nas duas faixas. Repetir taxa em texto para leitura sem cor.

## Interação
Selecionar um cliente habilita slider comp 0–80%, passo 1; hist pode ser alternado em simulação local. Ponto percorre a faixa, ramo destacado e PD se atualizam. Ao cruzar de 40 para 41, mostrar a mudança discreta. No valor 40, ramo ≤40. “Perfil original” restaura atributos e remove a indicação de simulação.

## Roteiro
Mova Bruno de 38 para 41. Compare a mudança com a de Ana ao redor do mesmo limite: +25 p.p. versus +8 p.p. na árvore manual. Pergunte se uma mudança infinitesimal de risco verdadeiro deveria ser interpretada literalmente: a descontinuidade é da aproximação do modelo.

## Notas
Árvores podem capturar interações porque a pergunta feita em um ramo depende das decisões anteriores. Isso não dispensa validação. Uma folha define uma região constante, mas ensembles podem produzir funções mais detalhadas. Não extrapolar o exemplo como política de crédito de “40% permitido”.

## Ponte
“Se continuarmos dividindo o espaço, podemos criar regiões cada vez menores. Quando isso começa a prejudicar?”

## Aceite específico
Mapa e árvore devem refletir a mesma regra em todos os estados. Cruzamentos de limiar funcionam exatamente. Sem mistura entre variável categórica e contínua. Alterações não persistem nos perfis canônicos.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
