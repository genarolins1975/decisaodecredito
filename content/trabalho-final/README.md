# Trabalho final: o modelo de PD e o blueprint da operação

Laboratório de Decisão de Crédito · Prof. Genaro Dueire Lins · edição 2026

Este pacote traz tudo o que o grupo precisa para cumprir as doze missões do capítulo 11. Leia este arquivo inteiro antes de abrir os dados.

## 1. O que o grupo recebe

| Arquivo | Para que serve | Missões |
|---|---|---|
| `README.md` (este arquivo) | ordem de trabalho, entregas e regras do teste cego | todas |
| `problema-negocio.md` | o produto, a população, a política histórica e os parâmetros econômicos da sua base | 1, 10 |
| `definicao-default.md` | o evento, o horizonte, a população com rótulo e o que fica fora | 1, 5 |
| `datas-e-maturacao.md` | as datas de cada campo, a maturação e a partição recomendada | 4, 5 |
| `dados/dicionario_dados.csv` | o contrato de dados: tipo, unidade, quando o valor existe, papel e uso permitido de cada campo | 2, 3, 4 |
| `dados/propostas_desenvolvimento.csv` | treino e validação (jan/21 a dez/23), com rótulo só nas aprovadas e maduras | 3 a 11 |
| `dados/propostas_oot_sem_desfecho.csv` | o teste fora do tempo (jan/24 a jun/24), sem desfecho: só se abre depois do congelamento | 12 |
| `dados/amostra_leitura.csv` | as primeiras 1.000 linhas do desenvolvimento, para ler antes de carregar a base inteira | 1, 2 |
| `TEMPLATE-MANIFESTO-MODELO.md` | o modelo do manifesto que congela o pacote antes do OOT | 12 |
| `ROTEIRO-DE-TESTES.md` | os testes que cada missão precisa passar, com o critério de aceite | todas |
| `guia-dados-e-missoes.xlsx` | as doze missões numa planilha: entrada, saída, arquivo de entrega e página da plataforma | todas |

A base é sintética, gerada para o curso com semente fixa. Ela imita uma carteira real e contém **armadilhas deliberadas**: IDs duplicados, clientes que repetem, datas de bureau posteriores à proposta, valores fora do domínio, campos que só existem depois da decisão e mudança de comportamento no tempo. Encontrá-las e decidir o que fazer com cada uma faz parte da nota.

## 2. A ordem de trabalho

1. **Construir (missões 1 a 7).** Congele a pergunta, escreva o contrato de dados, audite a base, bloqueie o vazamento, monte as partições, calcule a régua mínima e compare logística, árvore e boosting com o mesmo pipeline.
2. **Testar (missões 8 a 11).** Discriminação, calibração, conta econômica, subgrupos, estresse e gatilhos de monitoramento, todos na validação.
3. **Congelar e medir (missão 12).** Preencha o manifesto, congele o modelo na plataforma (Trabalhos → seu trabalho → Congelar modelo), baixe o OOT, gere as previsões uma única vez e envie.
4. **Defender.** Dossiê, código reproduzível, blueprint da operação e defesa individual.

## 3. Entregas do componente 1 (modelo)

Cada missão produz um arquivo com nome fixo, na pasta `entregas/` do repositório do grupo:

| Missão | Arquivo |
|---|---|
| 1 | `01-especificacao-modelo.md` |
| 2 | `02-contrato-dados.csv` |
| 3 | `03-auditoria-qualidade.md` |
| 4 | `04-auditoria-vazamento.csv` |
| 5 | `05-particoes-e-maturacao.md` |
| 6 | `06-baseline.json` |
| 7 | `07-previsoes-validacao.csv` (proposta_id, particao, modelo, pd, versao, executado_em) |
| 8 | `08-discriminacao.md` |
| 9 | `09-calibracao.md` |
| 10 | `10-politica-economica.md` |
| 11 | `11-equidade-estresse-monitoramento.md` |
| 12 | `MANIFESTO-MODELO.md` e `previsoes_oot.csv` |

O arquivo do teste cego tem exatamente estas colunas, com uma linha por `proposta_id` do arquivo OOT, sem faltantes, duplicados ou extras:

```
proposta_id,pd_modelo,decisao_politica,versao_modelo
```

`pd_modelo` entre 0 e 1, com ponto ou vírgula decimal; `decisao_politica` em {aprovar, revisar, recusar}; `versao_modelo` igual à do manifesto. A plataforma recusa o arquivo inválido sem consumir a tentativa e mostra o diagnóstico.

## 4. Regras do teste cego

- O OOT só se abre depois do congelamento do modelo na plataforma. O manifesto registra versões, sementes, dependências e o sha256 do código e dos dados.
- Nenhuma escolha (variável, hiperparâmetro, calibrador, limiar) pode usar o OOT. Abrir o OOT para escolher transforma o teste em validação, e isso é verificado na defesa.
- O número de envios é limitado pelo professor. O desfecho do OOT nunca é entregue ao grupo.

## 5. Uso de IA

A IA pode ajudar a escrever código e texto. O grupo responde pela decisão: cada escolha tem de ser defendida com evidência, e a pergunta individual da avaliação pede uma resposta da IA que o aluno recusou ou corrigiu.
