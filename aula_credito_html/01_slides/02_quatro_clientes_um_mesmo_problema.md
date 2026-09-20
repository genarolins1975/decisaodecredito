# Slide 02 — Quatro clientes acompanharão os três modelos

**Bloco:** problema. **Tempo:** 3 min. **Origem:** perfis fictícios canônicos.

## Objetivo e mensagem
Permitir que o aluno explique diferenças entre capacidade de pagamento, histórico e uso de crédito. Mensagem: “Cada variável descreve uma dimensão do risco; nenhuma decide sozinha.”

## Tela e composição
Título: **“O que sabemos no momento da proposta?”** Use uma tabela central de quatro clientes por seis características. Colunas numéricas alinhadas, unidades no cabeçalho, nomes fixos à esquerda. À direita ou abaixo, um perfil selecionado ampliado e uma anotação curta sobre a característica destacada. Não use radar: ele esconderia unidades e criaria comparações arbitrárias.

## Dados
Renda, comprometimento, relacionamento, utilização, histórico e canal vêm do guia. Defina comprometimento como parcela total mensal, incluindo a nova operação, dividida pela renda verificada. Histórico registra atraso passado de 15–89 dias; não confundir com inadimplência corrente. Os perfis são elegíveis, fictícios e sem resultado futuro revelado.

## Interação
Estado inicial: Ana selecionada, todos os dados visíveis. Clicar no nome realça a linha e exibe a ficha. Clicar/focar um cabeçalho destaca a coluna e abre uma explicação com unidade e momento de observação. Um seletor “Comparar dois clientes” permite, por padrão, Carla e Bruno. A comparação mantém valores originais lado a lado e destaca diferenças, sem gerar um escore arbitrário.

Permita ordenar por uma coluna apenas se houver botão “Ordem original”. A identidade do cliente não pode depender da posição. Não permita editar os perfis neste slide: a edição ocorrerá no simulador do logit.

## Sequência e discussão
Primeiro compare renda de Carla e Bruno. Depois revele a relevância de comprometimento e utilização. Por fim contraste relacionamento e histórico. Pergunte: “Qual combinação parece mais informativa que uma variável isolada?” Aceite hipóteses diferentes. A finalidade é preparar interação e multivariabilidade, não descobrir um ranking correto antes de modelar.

## Notas do professor
Evite interpretar canal como efeito causal ou evidência de qualidade moral. Uma variável útil para previsão pode refletir seleção ou diferenças de população. Explique que as unidades serão preservadas em toda a aula, especialmente percentual versus fração. Não apresente as PDs manuais ainda.

## Transição
“Conhecer os atributos não basta: o que significa exatamente ‘risco’ nesta aula?”

## Aceite específico
Verificar as 24 células contra a tabela canônica. Tooltips devem abrir por foco e toque. O modo de comparação não deve alterar dados, criar ranking ou sugerir pesos. Impressão conserva a tabela completa e o dicionário resumido.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
