# Slide 48 — O modelo precisa continuar útil depois da implantação

**Bloco:** governança prática. **Tempo:** 4 min. **Origem:** cenários sintéticos e resultados temporais, se executados.

## Objetivo e mensagem
Separar mudança dos dados, mudança de desempenho e atraso para observar desfechos. Mensagem: “Podemos observar a carteira entrando hoje, mas parte da qualidade do modelo só será conhecida depois.”

## Tela e composição
Título: **“O que conseguimos monitorar agora? O que exige esperar?”**. Duas faixas temporais: indicadores imediatos e indicadores com alvo maturado. Imediatos: distribuição de renda/comprometimento, ausentes, aprovação e PD média. Posteriores: inadimplência, calibração, discriminação e resultado. Um gráfico de coortes mostra explicitamente quais meses têm janela completa.

## Cenários
Três situações: mudança na composição dos solicitantes; maior ausência de uma variável; relação entre características e risco alterada. Se mostrar curvas numéricas, gerar cenários e calcular resultados. Mudança artificial de odds para estresse é hipótese ilustrativa, não previsão macroeconômica ou backtest real.

## Interação
Selecionar cenário destaca quais indicadores podem alertar cedo e quais ainda dependem de maturação. Slider de “data de observação” mascara métricas de desfecho incompletas. Um botão “Ação possível” revela investigar dados, revisar política ou avaliar recalibração/reestimativa conforme evidência, sem prescrever retreino automático a todo alerta.

## Roteiro
Pergunte se PD média crescente prova piora do modelo: pode ser mudança da população. Pergunte se ausência de inadimplência recente prova segurança: pode ser falta de maturação. Relacione à definição do alvo no slide 03. Termine com necessidade de versionar modelo, dados, regra e explicações.

## Notas
PSI, se citado, é indicador de mudança de distribuição e depende de bins/tamanho de amostra; não usar limiares universais como regra automática de aceitação. Mudança de distribuição não demonstra por si só perda de desempenho. A aula não pretende oferecer um manual regulatório completo.

## Ponte
“Temos desempenho, probabilidades, economia e condições de operação. Agora vamos tomar uma decisão de comitê.”

## Aceite específico
Métricas de y não aparecem como observadas para coortes incompletas. Cenários sintéticos identificados. Ações são condicionadas ao diagnóstico. Nenhum modelo recebe monitoramento dispensado por ser simples ou sofisticado.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
