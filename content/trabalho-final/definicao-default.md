# Definição de default

Vale para as dez bases do trabalho final.

## Evento

`default_12m = 1` quando o contrato atinge **90 dias ou mais de atraso** em qualquer momento dos **12 meses seguintes à concessão**. Caso contrário, `default_12m = 0`.

## População com rótulo

Só existe rótulo para propostas que cumprem as três condições:

1. `aprovada = 1`: a política histórica aprovou a proposta e o contrato foi concedido;
2. `data_rotulo_disponivel` anterior à data de corte do pacote (**31/01/2025**): os 12 meses de observação terminaram e passaram mais 30 dias de processamento;
3. o contrato não foi cedido nem liquidado antecipadamente na primeira semana (cerca de 1,5% das aprovadas ficam sem rótulo por esse motivo, com `default_12m` vazio).

Propostas recusadas não têm desfecho. Isso é viés de seleção: o modelo aprende sobre quem a política aprovou. A especificação (missão 1) precisa dizer como o grupo trata essa limitação e o que ela impede de afirmar.

## O que não é evento

- atraso de 1 a 89 dias, mesmo repetido;
- renegociação sem atraso de 90 dias;
- atraso que começa depois do 12º mês.

## Campos que só existem depois da decisão

`dias_atraso_max_12m`, `fl_renegociacao_pos_concessao` e `default_12m` nascem depois da concessão. Usar qualquer um deles como preditor produz um modelo quase perfeito no desenvolvimento e inútil em produção (missão 4).
