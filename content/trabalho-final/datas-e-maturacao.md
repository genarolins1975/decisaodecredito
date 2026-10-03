# Datas e maturação

## Datas de cada campo

| Campo | Quando o valor existe |
|---|---|
| `data_proposta` | no instante da proposta: é o instante da decisão |
| cadastro (`canal`, `uf`, `faixa_etaria`, `renda_mensal`, `idade_relacionamento_meses`) e condições (`valor_solicitado`, `prazo_meses`, `taxa_juros_mensal`, `parcela_estimada`) | na proposta |
| bureau (`score_bureau`, `utilizacao_limite`, `consultas_bureau_90d`, `atraso_max_bureau_6m`) | na `data_bureau`, que deveria ser anterior ou igual à `data_proposta` |
| variáveis próprias do produto | na proposta (ver `dicionario_dados.csv`) |
| `aprovada` | na decisão; descreve a política histórica, não é preditor |
| `default_12m`, `dias_atraso_max_12m`, `fl_renegociacao_pos_concessao` | depois da concessão, só a partir de `data_rotulo_disponivel` |

Uma consulta de bureau com `data_bureau` posterior à `data_proposta` não estava disponível na decisão. A missão 3 conta esses casos e decide o tratamento (bloquear a variável, recuperar a consulta anterior ou excluir o caso, com o efeito de cada opção).

## Maturação

`data_rotulo_disponivel = data_proposta + 12 meses + 30 dias`. Com a data de corte do pacote em 31/01/2025, todas as safras de desenvolvimento (jan/21 a dez/23) estão maduras; o grupo precisa demonstrar isso com a contagem, não supor.

## Partição recomendada

| Partição | Safras | Uso |
|---|---|---|
| treino | jan/21 a jun/23 | ajustar modelos, imputação, codificação, seleção de variáveis |
| validação | jul/23 a dez/23 | escolher hiperparâmetros, calibrador, limiar e comparar famílias |
| OOT cego | jan/24 a jun/24 | medir uma única vez, depois do congelamento |

A coluna `particao_sugerida` do desenvolvimento traz essa divisão. O grupo pode propor outra, desde que seja temporal, que o OOT fique intocado e que a missão 5 mostre por que ela é válida.

## Clientes que repetem

A chave é a proposta (`proposta_id`); o mesmo `cliente_id` pode aparecer em várias propostas, inclusive em partições diferentes. A missão 3 conta quantos clientes cruzam partições e a missão 5 decide se a validação precisa agrupar por cliente.
