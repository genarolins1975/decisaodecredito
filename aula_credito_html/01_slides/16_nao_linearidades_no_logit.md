# Slide 16 — O logit pode representar relações não lineares

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** priorizar transformações já presentes no original.

## Objetivo e mensagem
Desfazer a ideia de que logit só gera uma reta de risco. Mensagem: “A linearidade é nos parâmetros; a forma das variáveis pode ser flexível.”

## Tela e composição
Título: **“O efeito pode se intensificar depois de um limite”**. Dois gráficos alinhados: contribuição para z por comprometimento e PD resultante. Mostrar linha-base `0,04×(comp−30)` e extensão `+0,04×max(comp−40,0)`. Marcar o nó em 40%. Não chamar uma quebra escolhida para ilustração de achado empírico.

## Dados
Perfil de referência com as outras contribuições zeradas e intercepto −3,50. Comp varia 10–70%. Uma alternância “linear / com mudança de inclinação” mantém os mesmos eixos e o mesmo perfil. A função transformada pertence a um cenário separado; não substitui o logit manual canônico. O exemplo é uma base linear por partes, não uma spline cúbica.

## Interação
Slider do comprometimento move pontos nos dois gráficos. Toggle compara formas; um botão “Ver como entra na equação” destaca x e a nova variável `max(x−40,0)`, com dois coeficientes. Oferecer spline suave como imagem/resultado calculado apenas em aprofundamento, para não acumular três mecanismos na tela.

## Sequência
Primeiro mostre a relação em z. Ative a nova transformação e peça que identifiquem onde a inclinação muda. Em seguida acompanhe a tradução para PD. Termine perguntando como decidir se a flexibilidade ajudou: a resposta deve citar validação, não a beleza da curva.

## Notas
Nós e transformações escolhidos com conhecimento do teste vazam informação. Flexibilidade custa parâmetros e exige controle de complexidade. WOE e agrupamento supervisionado podem ser mencionados nas notas como técnicas de crédito, mas não abrir um minicurso paralelo nem apresentá-los como obrigatórios.

## Ponte
“Além de mudar a forma de um efeito, podemos permitir que ele dependa de outra característica.”

## Aceite específico
A função é contínua no nó e tem inclinação correta antes/depois. Os dois gráficos correspondem à mesma fórmula. Eixos não mudam silenciosamente. Não afirmar que árvores são necessárias para toda não linearidade.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
