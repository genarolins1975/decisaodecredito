# Roteiro de testes

Cada teste é executável: um script ou célula que imprime a contagem e falha quando o critério não é atendido. "Parece ok" não é evidência. Os resultados entram no arquivo de entrega da missão.

| Missão | Teste | Critério de aceite | Evidência no arquivo |
|---|---|---|---|
| 1 | a pergunta tem população, unidade, instante, evento, horizonte e uso | os seis itens preenchidos e coerentes com `definicao-default.md` | `01-especificacao-modelo.md` |
| 2 | todo campo da base está no contrato | campos da base = campos do contrato; nenhum campo sem papel ou sem data de disponibilidade | `02-contrato-dados.csv` |
| 3 | unicidade de `proposta_id` | duplicados contados, até 5 IDs listados, decisão registrada | `03-auditoria-qualidade.md` |
| 3 | clientes entre partições | contagem de clientes em mais de uma partição e decisão de agrupamento | `03-auditoria-qualidade.md` |
| 3 | bureau posterior à proposta | contagem, até 5 IDs, decisão (bloquear, recuperar ou excluir) | `03-auditoria-qualidade.md` |
| 3 | domínio | proporções fora de 0 a 1, rendas negativas e extremos contados por campo | `03-auditoria-qualidade.md` |
| 3 | faltantes | taxa geral e por período, canal e desfecho | `03-auditoria-qualidade.md` |
| 4 | vazamento | cada campo classificado como disponível ou não na decisão; AUC com e sem os campos posteriores, mostrando a diferença | `04-auditoria-vazamento.csv` |
| 5 | maturação | nenhuma proposta com rótulo e `data_rotulo_disponivel` posterior a 31/01/2025 | `05-particoes-e-maturacao.md` |
| 5 | contaminação | imputação, escala, codificação, seleção e hiperparâmetros aprendidos só nas amostras autorizadas (mostrar o código) | `05-particoes-e-maturacao.md` |
| 6 | régua mínima | p̂₀ = defaults ÷ aprovadas com rótulo no treino; log loss e Brier dessa régua na validação | `06-baseline.json` |
| 7 | mesmos casos | as três famílias com previsões para exatamente os mesmos IDs da validação (aprovadas com rótulo) | `07-previsoes-validacao.csv` |
| 8 | discriminação | AUC com intervalo, ROC, KS com a PD do ponto, ganho por decil e comparação pareada (DeLong ou bootstrap) | `08-discriminacao.md` |
| 9 | calibração | PD média contra observado por faixa, com n e intervalo; Brier e log loss; recalibração só em amostra própria | `09-calibracao.md` |
| 10 | economia | resultado por proposta que soma ao total apresentado; limiar de equilíbrio; capacidade da revisão; estresse | `10-politica-economica.md` |
| 11 | subgrupos e gatilhos | desempenho e calibração por produto ou canal, UF e faixa etária, com n; três choques; tabela de gatilhos com limite, frequência, responsável e ação | `11-equidade-estresse-monitoramento.md` |
| 12 | congelamento | manifesto completo; sha256 dos dados e do código; modelo congelado na plataforma antes do download do OOT | `MANIFESTO-MODELO.md` |
| 12 | arquivo OOT | uma linha por `proposta_id` do OOT, sem faltantes, duplicados ou extras; colunas `proposta_id,pd_modelo,decisao_politica,versao_modelo` | `previsoes_oot.csv` |

## Teste de reprodução (defesa)

Outra pessoa, com o repositório e os dados, executa um único comando e obtém os mesmos arquivos de entrega, com os mesmos sha256 nas previsões.
