# Slide 07 — O logit começa com uma soma ponderada

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** procurar explicação original de escore, coeficientes e intercepto.

## Objetivo e mensagem
O aluno deve reconhecer que cada característica contribui para um escore z. Mensagem: “O sinal e o tamanho de cada contribuição dependem do coeficiente e da unidade da variável.”

## Tela e composição
Título: **“Cada informação altera o escore do cliente”**. Visual dominante: waterfall horizontal ou vertical das contribuições de Bruno, começando no intercepto −3,50 e terminando em z=−2,025. Separar visualmente “perfil de referência” e “diferenças do cliente”. Uma ficha pequena mantém valores de Bruno disponíveis. Não converter ainda em PD na parte principal.

## Dados e números
Usar a fórmula manual. Bruno: comp +0,32; histórico +0,80; relacionamento +0,08; utilização +0,25; renda +0,025. A soma com o intercepto resulta em −2,025. Arredondar barras para três casas quando necessário e preservar precisão interna. Rotular o eixo “contribuição no escore z”, sem porcentagem.

## Interação
Seletor de cliente com Bruno como padrão. Ao trocar cliente, todas as contribuições e o total são recalculados pela mesma função. Botões “Uma contribuição por vez” e “Mostrar todas” permitem construir o waterfall. Hover/foco em cada barra apresenta a conta, como `0,04 × (38−30) = 0,32`. Não deixar o tooltip como único lugar onde se vê a unidade.

## Roteiro
Comece no perfil de referência. Acrescente comprometimento e histórico; pergunte qual teve maior contribuição neste cliente. Mostre que coeficiente pequeno pode produzir efeito relevante quando a variável muda muito. Revele z e pergunte se esse número já é uma probabilidade.

## Notas
A contribuição exibida é relativa à codificação de referência escolhida. Não é decomposição causal, nem uma medida universal de importância. Distinguir coeficiente de contribuição observada. Explique que centrar as variáveis facilita a interpretação do intercepto, sem mudar por si só a classe de funções.

## Transição
“O escore pode ser qualquer número. Como transformá-lo em algo entre zero e um?”

## Aceite específico
Soma de todas as contribuições e intercepto deve reproduzir os quatro z canônicos com tolerância numérica. Nenhuma barra é rotulada como pontos percentuais de PD. O material original reaproveitado deve estar registrado no mapa, ou sua ausência indicada.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
