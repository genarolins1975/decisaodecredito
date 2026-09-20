# Slide 03 — Uma PD precisa de evento, horizonte e população

**Bloco:** problema. **Tempo:** 4 min. **Origem:** exemplo de contratos fictícios.

## Objetivo e mensagem
O aluno deve classificar corretamente exemplos como evento, não evento ou desfecho ainda desconhecido. Mensagem: “Sem a mesma definição de inadimplência, duas PDs não são comparáveis.”

## Tela e composição
Título: **“Probabilidade de quê, para quem e até quando?”** Mostre uma linha do tempo de contratação até 12 meses. Acima, a definição exata: “Atraso superior a 90 dias em qualquer momento dos 12 meses após a contratação”. Abaixo, três trajetórias pequenas com atraso em dias no eixo vertical e meses no horizontal. Marque 90 dias por linha tracejada e o horizonte por faixa suave.

## Exemplos e cálculos
Contrato A atinge 95 dias no mês 8: y=1. B termina 12 meses sem superar 90: y=0. C tem apenas seis meses observados e nenhum evento: alvo incompleto. Acrescente em uma explicação que chegar exatamente a 90 não satisfaz “superior a 90”. Use trajetórias explicitamente ilustrativas, sem aparência de série real extraída.

## Interação
Um controle “Data até a qual conhecemos os dados” varia do mês 3 ao 12, passo 1. A área posterior fica hachurada e marcada “ainda não observado”. Cada contrato recebe status atualizado: evento identificado, janela completa sem evento ou janela incompleta. Em A, o evento pode tornar-se conhecido no mês 8, mas a inclusão na comparação segue o protocolo comum de maturação completa.

Não permitir mudar simultaneamente limite de atraso e horizonte na tela principal, pois isso distrai. Um aprofundamento opcional compara 6 e 12 meses e adverte que se trata de outro alvo.

## Sequência didática
Peça a classificação de C antes de mostrar o status. Revele a diferença entre “ainda não aconteceu” e “não acontecerá dentro da janela”. Depois leve o controle até 12 e consolide os três elementos: população elegível, evento e horizonte. Defina y=1 uma única vez e mantenha essa convenção nos demais slides.

## Notas e transição
Explique que a aula usa uma definição operacional didática, sem alegar equivalência integral a um conceito regulatório. “Agora sabemos o que prever. Precisamos garantir que os dados usados para prever existiam antes do resultado.”

## Aceite específico
Status de C nunca vira y=0 enquanto incompleto. Um pico de exatamente 90 deve ser classificado corretamente. Máscara temporal não esconde o eixo. Estados do controle e texto devem concordar. A impressão mostra a janela completa e um exemplo de observação incompleta identificado.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
