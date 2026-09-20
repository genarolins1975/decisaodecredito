# Aula de decisão de crédito: como abrir e como conduzir

Apresentação interativa de 50 slides sobre regressão logística, árvore de decisão e
gradient boosting aplicados à probabilidade de inadimplência, com o caminho completo da
previsão à decisão de crédito.

## Abrir a aula

Abra `dist/aula_credito.html` com duplo clique. É um arquivo único, funciona sem
internet e sem servidor, e não faz nenhuma requisição externa.

Na plataforma, a mesma aula fica em `/aula_credito.html`. O `build.mjs` copia o
arquivo para `public/` da aplicação Next a cada compilação, então os dois são
sempre idênticos. Essa rota passa pelo `src/proxy.ts`, que redireciona para
`/entrar` quem não tiver cookie de sessão. É conveniência de navegação, não
controle de acesso: arquivo em `public/` não passa por `guard.ts`.

Para trabalhar no código, abra `app/index.html`, que carrega os mesmos arquivos soltos.

## Conduzir

| Ação | Como |
|---|---|
| Avançar e voltar | setas, PageUp e PageDown, ou os botões Anterior e Próximo |
| Primeiro e último slide | Home e End |
| Índice dos 50 slides | tecla `i` ou o botão Índice |
| Notas do professor | tecla `p` ou o botão Professor |
| Modo estudo | tecla `e` ou o botão Estudo |
| Tela cheia | tecla `f` ou o botão Tela cheia |
| Imprimir | botão Imprimir, ou Ctrl+P |
| Ir a um slide pelo endereço | `#/slide/27` no fim da URL |

As notas do professor ficam ocultas por padrão. Elas trazem condução em aula, respostas
dos exercícios, cuidados e limites, a transição para o slide seguinte e, no bloco de
logit, aprofundamentos vindos do material original do curso.

O modo estudo reorganiza o slide em coluna, mostra as notas na própria página e dispensa
o mouse. Abaixo de 1100px de largura ele entra sozinho, de modo que a aula também se lê
no celular.

A impressão gera uma folha por slide, em A4 paisagem, com os controles ocultos e os
estados didáticos já escolhidos. As notas e as respostas saem em apêndice, depois das 50
folhas.

## Os quatro clientes

Ana, Bruno, Carla e Diego aparecem no slide 01, antes de qualquer modelo, e voltam no
slide 50 com as três técnicas e a política aplicadas. As seis características de cada um
são as mesmas do começo ao fim.

## De onde vêm os números

| Origem | O que sustenta |
|---|---|
| Logit manual de seis características | slides 07 a 20, com conta aberta e conferível a mão |
| Árvore didática de 1.000 contratos | slides 21 a 30 |
| Miniatura de 10 registros | slides 31 a 36 e 42 |
| Experimento sintético de 28.000 contratos | slides 05, 18, 27 a 29, 37 a 41 e 43 a 49 |
| Economia declarada na tela | slide 47 |

O experimento está em `experimento/experimento.py`, com semente 20260920. Ele gera
`experimento/saida/resultados.json`, `metadados.json` e `base_sintetica.csv.gz`, e o
notebook `experimento/experimento.ipynb` refaz as conferências com as saídas gravadas.

Todos os dados são sintéticos. Nenhum número descreve carteira real.

## Refazer tudo

```
python3 -m pip install -r experimento/requisitos.txt
python3 experimento/experimento.py        # refaz o experimento
python3 experimento/gerar_notebook.py     # remonta e executa o notebook
node build.mjs                            # regenera app/index.html e dist/aula_credito.html
node qa.mjs                               # verifica os 50 slides
node imprimir.mjs                         # gera o PDF de impressão
```

## Onde está o resto

| Arquivo | O que traz |
|---|---|
| `02_controle/STATUS_SLIDES.md` | estado e evidência de cada um dos 50 slides |
| `02_controle/REVISAO_FINAL.md` | entregáveis, conferências numéricas e limitações |
| `02_controle/MAPA_REAPROVEITAMENTO.md` | o que foi aproveitado do material original |
| `02_controle/RETOMADA.md` | comandos, decisões globais e o que não reverter |
| `MAPA_DOS_50_SLIDES.md` | índice dos roteiros |
| `01_slides/` | roteiro de cada slide |
| `00_guias/` | narrativa, design, dados, reaproveitamento e critérios de aceite |
