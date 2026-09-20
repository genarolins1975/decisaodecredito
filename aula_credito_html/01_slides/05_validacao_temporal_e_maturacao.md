# Slide 05 — O teste deve representar uma decisão no futuro

**Bloco:** problema. **Tempo:** 5 min. **Origem:** protocolo sintético definido no guia.

## Objetivo e mensagem
O aluno deve distinguir data de contratação, data em que o alvo fica conhecido e data de uso do modelo. Mensagem: “Separar por calendário só funciona se respeitarmos quando cada resultado estava disponível.”

## Tela e composição
Título: **“Aprender no passado, escolher sem olhar o teste”**. Use quatro faixas alinhadas em um único eixo temporal: treino, validação de ajuste, calibração/política e teste. Barras sólidas representam contratações; extensões claras representam os 12 meses de maturação. Um marcador vertical indica quando uma decisão de modelagem é tomada. Use agrupamento de anos para caber sem rótulos minúsculos.

## Dados
Copiar datas e funções do guia: treino 2018–2019; ajuste jan–jun/2021; calibração ago–dez/2022; teste fev–jul/2024. Mostrar em texto curto maturações dez/2020, jun/2022, dez/2023 e jul/2025. O modelo-base é congelado antes da calibração e a política antes do teste.

## Interação
Três botões de cenário: “Pronto para ajustar”, “Pronto para calibrar”, “Pronto para testar”. Cada um move a linha de decisão e destaca apenas os alvos já conhecidos. Uma opção “Erro comum” mostra um treino com contratos recentes cujo desfecho futuro ainda não estava disponível na data pretendida de uso. Corrigir restaura o protocolo.

Não desenhe uma divisão aleatória como sempre inválida: explique que ela não testa diretamente a generalização temporal buscada aqui. A contaminação discutida é concreta, não apenas escolha de cor.

## Condução
Faça o aluno apontar a diferença entre fim das contratações e fim da observação. Depois pergunte: “Podemos escolher o corte depois de ver os resultados finais?” Revele “O teste avalia escolhas congeladas”. Não use toda a granularidade do notebook na projeção; datas completas ficam nas notas.

## Notas e ponte
Explique que grandes espaços entre coortes tornam a maturação visível e não constituem uma recomendação universal de desenho operacional. Em aplicações reais, usam-se atualizações e backtests com disponibilidade adequada. Ponte: “Agora temos regras de comparação. Como cada técnica transforma os mesmos dados em uma PD?”

## Aceite específico
Nenhuma barra de rótulo conhecido ultrapassa a data de decisão ativa. O teste não escolhe parâmetros ou corte. Papéis das quatro partições permanecem distintos. Texto e datas coincidem com o guia e com o notebook a produzir.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
