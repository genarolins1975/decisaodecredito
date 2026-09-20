# Slide 08 — Um escore livre precisa de uma transformação

**Bloco:** logit. **Tempo:** 3 min. **Reaproveitamento:** gráfico original da restrição de probabilidade, se existir.

## Objetivo e mensagem
Demonstrar por que uma previsão numérica sem restrição pode sair do intervalo [0,1]. Mensagem: “A PD precisa permanecer entre 0% e 100%, qualquer que seja o escore.”

## Tela e composição
Título: **“−2,025 não é uma probabilidade”**. À esquerda, uma reta numérica com z de −8 a +4 e os quatro clientes posicionados. À direita, uma régua de probabilidade de 0 a 100%, ainda sem correspondência estabelecida. Uma área de comparação mostra uma reta ilustrativa `p_linear = 0,10 + 0,03×(comp−30)` com faixas inválidas hachuradas.

## Exemplo
Com comp=20, a reta dá −0,20; com comp=70, dá 1,30. Identificar “exemplo para mostrar o problema, não modelo estimado”. Não afirmar que todo modelo linear de probabilidade é inútil. A mensagem limita-se à dificuldade de garantir limites e à motivação do link logístico.

## Interação
Slider de comprometimento 10–80%, passo 1, padrão 30%. O ponto percorre a reta e o valor previsto se atualiza. Quando sair de [0,1], o rótulo diz “fora dos limites de probabilidade”. Um botão “Precisamos de uma transformação” revela um espaço curvo entre escore e régua, com chamada ao próximo slide; não execute aqui uma segunda simulação completa.

## Sequência
Peça que o aluno calcule 20% na reta simplificada. Revele o resultado negativo, leve até 70% e mostre o excesso. Retorne a Bruno e lembre que seu z não foi definido como p. A solução é modelar uma escala livre e convertê-la, não truncar previsões arbitrariamente em 0 e 1.

## Notas do professor
Se mencionar truncamento, explique que ele altera a função de forma ad hoc e não substitui o modelo probabilístico proposto. Não sobrecarregue com econometria do modelo linear de probabilidade; mantenha essa discussão nas notas opcionais.

## Transição
“A função logística faz exatamente essa conversão, preservando a ordem dos escores.”

## Aceite específico
Faixas inválidas devem ser inequívocas. Cálculos extremos corretos e unidades consistentes. A régua de PD não atribui números arbitrários a z. A conclusão não deve depreciar genericamente modelos lineares.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
