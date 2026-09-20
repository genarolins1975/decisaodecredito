# Slide 19 — Quando o logit é uma boa escolha?

**Bloco:** logit. **Tempo:** 3 min. **Origem:** síntese conceitual aplicada.

## Objetivo e mensagem
Avaliar adequação sem reduzir a discussão a “simples versus moderno”. Mensagem: “O logit oferece uma estrutura explícita, mas a qualidade depende da especificação e da validação.”

## Tela e composição
Título: **“Explicar a estrutura é uma vantagem; especificá-la é uma responsabilidade”**. Visual central: o mecanismo já conhecido de escore e sigmoide. Ao redor, três situações práticas, apresentadas uma por vez: sinal predominantemente aditivo, interação importante omitida e amostra pequena/instável. Em cada situação, mostrar o que examinar e uma ação possível. Evite tabela genérica com checks absolutos.

## Conteúdo
Forças: função compacta, interpretação condicionada à codificação, rapidez de previsão, possibilidade de regularização e transformações. Limites: forma funcional escolhida, variáveis ausentes/mal medidas, extrapolação, correlação entre atributos e instabilidade sob mudança de população. Não garantir calibração apenas porque a saída é uma probabilidade.

## Interação
Três botões de caso. Cada um destaca a parte relevante do mecanismo e revela “pergunta de diagnóstico” antes da resposta. Exemplo interação omitida: “As curvas por grupo diferem além do que a especificação permite?” Resposta: testar termo plausível ou método mais flexível usando validação. Um quarto estado resume critérios de escolha sem eleger vencedor.

## Roteiro
Peça uma razão para manter logit mesmo se outro algoritmo tiver AUC um pouco maior. Aceite manutenção, clareza de especificação e estabilidade, condicionadas a evidência. Depois peça uma situação em que insistir em um logit mal especificado seria prejudicial. Faça a síntese equilibrada.

## Notas
“Interpretável” depende de quantidade de termos, transformações, interações e público. Um logit com centenas de variáveis não é automaticamente fácil de explicar. Não confundir coeficiente com causa nem desempenho de uma formulação simples com limite de toda a classe.

## Ponte
“Antes de mudar de técnica, vamos verificar se conseguimos usar o que aprendemos em uma decisão de interpretação.”

## Aceite específico
Cada situação deve conduzir a uma ação de diagnóstico concreta. Não usar nota arbitrária de interpretabilidade ou acurácia. A síntese reconhece logit flexível, calibrabilidade e necessidade de validação.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
