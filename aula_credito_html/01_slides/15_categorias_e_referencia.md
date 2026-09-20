# Slide 15 — Categorias entram por comparação com uma referência

**Bloco:** logit. **Tempo:** 3 min. **Reaproveitamento:** adaptar exemplo original de dummy ou categoria-base.

## Objetivo e mensagem
O aluno deve montar a codificação de uma categoria e interpretar seu coeficiente relativo. Mensagem: “O número atribuído a uma categoria não deve inventar uma ordem econômica.”

## Tela e composição
Título: **“Canal digital não significa ‘duas vezes agência’”**. À esquerda, três categorias nomeadas; ao centro, tabela de duas colunas indicadoras; à direita, contribuição adicional ao escore. Agência é a referência: [0,0], digital [1,0], parceiro [0,1]. Um alerta curto mostra a codificação 1/2/3 como escolha que imporia uma estrutura não justificada.

## Exemplo separado
Rotular “extensão pedagógica da fórmula”. Definir β_digital=0,30 e β_parceiro=0,60, apenas para demonstrar codificação. Usar um perfil de referência z_base=−3,50; agência mantém esse valor, digital gera −3,20 e parceiro −2,90. Converter em PD pela função comum. Não adicionar esses coeficientes à fórmula canônica dos slides 07–14 nem mudar as PDs dos quatro clientes.

## Interação
Selecionar canal atualiza indicadores, soma e PD. Botão “Trocar referência para digital” reexpressa intercepto e coeficientes preservando exatamente as previsões: novo intercepto −3,20, agência −0,30 e parceiro +0,30. A transição deve mostrar que rótulos e parâmetros mudam, mas a PD por categoria permanece igual.

## Condução
Pergunte o que seria implícito ao usar canal=1,2,3 diretamente. Mostre a tabela e depois altere a referência. Use esse momento para distinguir interpretação de coeficientes e previsão do modelo.

## Notas e ponte
Categoria omitida não é categoria ausente. Uma categoria nova na produção requer tratamento definido na codificação; não inventar coeficiente. Canal pode refletir seleção e não causalidade. Ponte: “A codificação determina a forma que o modelo enxerga a informação. Podemos também flexibilizar a forma das variáveis numéricas.”

## Aceite específico
Após trocar referência, diferenças de PD devem ser inferiores à tolerância numérica. Rótulo de exemplo separado visível. O intercepto deve mudar junto com a referência. Não manter todas as dummies e intercepto sem explicar a redundância.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
