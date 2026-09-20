# Slide 25 — A mesma taxa pode ter incerteza muito diferente

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** pares binomiais ilustrativos.

## Objetivo e mensagem
Reconhecer que a taxa de uma folha depende da evidência disponível. Mensagem: “10% em 20 contratos não oferece a mesma precisão que 10% em 1.000.”

## Tela e composição
Título: **“Duas folhas com PD de 10%. A evidência é igual?”**. Duas linhas de dot-and-whisker em eixo comum de 0–40%: 2/20 e 100/1.000. Mostrar ponto em 10%, barra do intervalo e contagens. Uma terceira linha opcional exibe 0/20, desafiando a interpretação de risco zero. Não usar barras de altura para representar incerteza.

## Cálculo
Intervalo de Wilson nominal de 95%, z=1,96. Calcular limites no notebook e na função compartilhada, comparar numericamente. Fórmula completa nas notas; no slide, “intervalo binomial descritivo”. Ressalva visível curta: “Não incorpora a escolha adaptativa das folhas”. Não dizer que a PD individual tem 95% de chance de cair naquele intervalo.

## Interação
Slider n em [20,50,100,200,500,1000], mantendo taxa 10% por contagens inteiras. O ponto permanece e a faixa varia. Toggle “zero eventos” define d=0 para observar limite superior positivo. O dado exibido precisa mudar de acordo com n; não desenhar largura de forma arbitrária. Reiniciar volta à comparação 2/20 versus 100/1.000.

## Condução
Pergunte qual folha transmitiria mais confiança e por quê. Aumente n e faça o aluno narrar o que mudou. Depois mostre 0/20 e pergunte se o gestor poderia tratar risco como impossível. Conecte o exemplo ao parâmetro de tamanho mínimo de folha.

## Notas
A incerteza real da árvore inclui seleção de splits, população, dependência e mudança temporal. Wilson aqui demonstra a dimensão binomial, não oferece uma validação completa do modelo. Não é preciso ensinar inferência de intervalos em profundidade; a interpretação deve ser correta.

## Ponte
“Folhas maiores estabilizam estimativas, mas a árvore também precisa capturar diferenças relevantes entre clientes.”

## Aceite específico
Intervalos ficam em [0,1], largura geralmente diminui com n no cenário fixo e 0/20 tem limite superior positivo. Contagens, ponto e intervalo concordam. A ressalva de seleção adaptativa está disponível sem hover.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
