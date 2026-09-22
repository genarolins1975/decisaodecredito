# Aula de decisão de crédito: como abrir e como conduzir

Apresentação interativa de 50 slides sobre regressão logística, árvore de decisão e
gradient boosting aplicados à probabilidade de inadimplência, com o caminho completo da
previsão à decisão de crédito.

## Abrir a aula

Abra `dist/aula_credito.html` com duplo clique. É um arquivo único, funciona sem
internet e sem servidor, e não faz nenhuma requisição externa.

## Situação: aposentado da plataforma em 22/09/2026

Este baralho foi a apresentação da **Aula 2** na plataforma até 22/09/2026. Desde então a
aula é uma só, a dos capítulos 4, 5 e 6 (61 páginas, 22 essenciais), conduzida pelas
próprias páginas, como as outras aulas. O que só existia aqui foi levado para as páginas:
o fio das mesmas 16 propostas, as pontes entre os capítulos e o fecho com as três PDs lado
a lado (`c6p20`, "Três modelos, as mesmas 16 propostas"). O registro completo está em
`docs/NARRATIVA_AULA_2.md`.

O que saiu da plataforma: o material "Aula 2 em 50 slides" e os dois guias em PDF deste
baralho (arquivados pelo importador, sem apagar a linha), o botão "Apresentar pelos slides"
dos capítulos, o modo ao vivo por slide e a rota `/slides/aula-2`. Os endereços antigos
redirecionam: `/slides/aula-2` e `/api/materiais/aula-2/*` levam ao capítulo 4,
`/aulas/aula-2/slide/NN` à página que o slide cobria (o slide 50 ao fecho `c6p20`) e a
janela de projeção ao painel da sessão. Os guias da aula passaram a ser um do aluno e um do
professor por capítulo, gerados por `scripts/apostila/gerar.mjs`: o do aluno publicado na
página de cada capítulo; o do professor, que traz gabaritos, pelo bucket privado.

A pasta continua no repositório como fonte de referência: o arquivo offline abre como
antes, e `build.mjs` e `material.mjs` geram as saídas em `dist/`, mas não copiam mais nada
para `content/`. O que está descrito abaixo vale para o arquivo offline.

Para trabalhar no código, abra `app/index.html`, que carrega os mesmos arquivos soltos.

## Conduzir

| Ação | Como |
|---|---|
| Avançar e voltar | setas, PageUp e PageDown, ou os botões Anterior e Próximo |
| Primeiro e último slide | Home e End |
| Índice dos 50 slides, com filtro por número, título ou bloco | tecla `i` ou o botão Índice; Enter abre o primeiro resultado |
| Notas do professor | tecla `p` ou o botão Professor |
| Modo estudo | tecla `e` ou o botão Estudo |
| Tela cheia | tecla `f` ou o botão Tela cheia |
| Imprimir | botão Imprimir, ou Ctrl+P |
| Ir a um slide pelo endereço | `#/slide/27` no fim da URL |

As notas do professor ficam ocultas por padrão no arquivo completo. Elas trazem condução
em aula, respostas dos exercícios, cuidados e limites, a transição para o slide seguinte e,
no bloco de logit, aprofundamentos vindos do material original do curso. No arquivo do
aluno elas não existem, e o botão Professor não aparece.

## Estado e modos

A exploração de cada slide (controles, exercícios, escolhas) fica em `sessionStorage`,
por aba, sob a chave `aula-credito-estado:<usuário>`, junto com a marca da compilação:
sobrevive a recarregar a página, some ao fechar a aba e é descartada quando a aula muda
de versão. "Reiniciar exemplo" devolve um slide ao início sem tocar os outros; "Limpar
minhas explorações", no índice, apaga tudo. Sem o parâmetro `estado`, a chave é a do
arquivo local.

Os modos, por parâmetro `?modo=`: `aluno` (segue o professor: sem barra e sem teclado),
`livre` (navega, sem notas e sem impressão), `projecao` (janela projetada: índice,
anterior, próximo e tela cheia, sem notas). A casca da plataforma troca o modo em tempo de
execução por `App.definirModo`, sem recarregar, e troca de slide por `App.trocar(id)`, que
usa `history.replaceState` dentro do próprio baralho: um `location.replace` feito de fora
do iframe recarrega o arquivo inteiro no Chromium, e atribuir `location.hash` de fora cria
uma entrada a mais no histórico do navegador.

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

## Guias em PDF

`node material.mjs` gera, a partir do baralho compilado, dois guias em A4:
`dist/material/aula-2-guia-do-professor.pdf` e `aula-2-guia-do-aluno.pdf`. Não são mais
servidos pela plataforma (ver "Situação", acima). Os dois seguem a ordem dos 50 slides, com uma página por slide: a
captura do slide feita no próprio Chromium (no estado revelado, que é o da impressão; na
edição do aluno, os exercícios dos slides 04, 20, 30, 42, 49 e 50 ficam no estado inicial),
mais o texto de `material/conteudo/`. O guia do professor traz as notas de
`dist/aula_credito_notas.json` (condução, respostas, cuidados, aprofundamentos e transição),
o ritmo proposto por bloco e a comparação dos três modelos no teste; o guia do aluno traz a
explicação de como ler cada slide, o que mexer na tela, as fórmulas renderizadas pelo KaTeX
embutido, os exercícios sem gabarito, a lista de verificação de saída e o glossário. As
tabelas de comparação são calculadas de `Aula.resultados`, nunca digitadas. O gerador faz
duas passagens para escrever no sumário, no mapa e nas aberturas de bloco a página real de
cada seção e de cada slide, lida do PDF com PyMuPDF (`pip install pymupdf`), e falha se
encontrar hífen ou travessão no texto, fórmula com erro, imagem ausente ou paginação
instável. As fontes (Source Serif 4 e Source Sans 3, SIL OFL) estão em `material/fontes/`.
O guia do professor contém gabaritos: nunca distribuir aos alunos.

## Refazer tudo

```
python3 -m pip install -r experimento/requisitos.txt
python3 experimento/experimento.py        # refaz o experimento
python3 experimento/gerar_notebook.py     # remonta e executa o notebook
node build.mjs                            # regenera app/index.html e dist/aula_credito.html
node qa.mjs                               # verifica os 50 slides
node qa.mjs --aluno                       # verifica a variante sem notas
node imprimir.mjs                         # gera o PDF de impressão
node material.mjs                         # gera os guias em PDF do professor e do aluno
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
| `material/conteudo/` | textos didáticos dos guias em PDF, por slide e por bloco |
| `00_guias/` | narrativa, design, dados, reaproveitamento e critérios de aceite |
