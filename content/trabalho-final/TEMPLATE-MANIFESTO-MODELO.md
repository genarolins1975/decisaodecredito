# Manifesto do modelo congelado

Preencha antes de abrir `propostas_oot_sem_desfecho.csv`. Depois do congelamento na plataforma, nada neste arquivo muda. Copie como `MANIFESTO-MODELO.md` na raiz do repositório do grupo.

## 1. Identificação

| Item | Valor |
|---|---|
| Grupo | |
| Base (código e produto) | |
| Versão do modelo (`versao_modelo`) | |
| Data e hora do congelamento (UTC) | |
| Responsável pelo congelamento | |

## 2. Pergunta congelada (missão 1)

> Entre propostas historicamente aprovadas, qual é a probabilidade de atingir 90+ dias de atraso nos 12 meses seguintes, usando somente informação disponível na proposta?

Adaptações para o produto, se houver, e o motivo:

## 3. Dados

| Arquivo | Linhas | sha256 |
|---|---|---|
| `dados/propostas_desenvolvimento.csv` | | |
| `dados/dicionario_dados.csv` | | |

Tratamento de cada armadilha encontrada na auditoria (missão 3), com contagem e decisão:

| Regra | Casos | Decisão |
|---|---|---|
| proposta_id duplicado | | |
| cliente em mais de uma partição | | |
| bureau posterior à proposta | | |
| valores fora do domínio | | |

Campos bloqueados por vazamento (missão 4):

## 4. Partições (missão 5)

| Partição | Período | Propostas | Aprovadas com rótulo | Defaults |
|---|---|---|---|---|
| treino | | | | |
| validação | | | | |
| OOT | jan/24 a jun/24 | | não se aplica | não se aplica |

## 5. Pipeline e modelo (missões 6 e 7)

- Variáveis de entrada (lista fechada):
- Imputação (parâmetros aprendidos no treino):
- Codificação e categorias desconhecidas:
- Família escolhida e por quê (logística, árvore ou boosting):
- Hiperparâmetros finais e como foram escolhidos (só validação):
- Régua mínima do treino (p̂₀):

## 6. Calibração (missão 9)

- Método (nenhum, intercepto, Platt, isotônica):
- Amostra em que o calibrador foi ajustado:
- Brier e log loss antes e depois, na validação:

## 7. Política (missão 10)

| Item | Valor |
|---|---|
| Limiar de recusa (PD) | |
| Faixa de revisão manual | |
| Capacidade da revisão por mês | |
| Regra de desempate | |
| Hipóteses de EAD, LGD, receita e custo | |

## 8. Reprodução

| Item | Valor |
|---|---|
| Linguagem e versão | |
| Bibliotecas e versões (ou arquivo de lock com sha256) | |
| Sementes | |
| Commit do repositório | |
| sha256 do código de previsão | |
| Comando que gera `previsoes_oot.csv` | |

## 9. Compromisso

O grupo declara que nenhuma escolha registrada acima usou o arquivo OOT e que as previsões OOT serão geradas uma única vez, a partir deste manifesto.

Assinaturas:
