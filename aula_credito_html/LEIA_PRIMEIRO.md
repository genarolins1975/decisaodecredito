# Aula de decisão de crédito: como abrir e como conduzir

Apresentação interativa de 50 slides sobre regressão logística, árvore de decisão e
gradient boosting aplicados à probabilidade de inadimplência, com o caminho completo da
previsão à decisão de crédito.

## Abrir a aula

Abra `dist/aula_credito.html` com duplo clique. É um arquivo único, funciona sem
internet e sem servidor, e não faz nenhuma requisição externa.

Na plataforma, esta é a **Aula 2**. As unidades do curso ficam em `/aulas`, montadas
pelo importador a partir de `content/original`. A Aula 2, "Entender as três
técnicas", é conduzida por estes 50 slides e por isso não tem capítulos; as 60
páginas dos capítulos 4, 5 e 6 formam o **apêndice** de estudo, que aparece depois
do trabalho final.

A aula é servida em `/slides/aula-2`. O `build.mjs` produz três saídas e as copia para
`content/slides/`: `aula-2.html` (o arquivo completo, com as notas, para professor e
monitor), `aula-2-aluno.html` (a mesma aula sem as notas do professor, removidas dos
fontes pela árvore sintática e conferidas frase a frase) e `aula-2-notas.json` (as notas
por slide, que o painel da aula mostra ao professor). A rota valida a sessão no servidor,
exige turma acessível, a mesma regra dos materiais, e escolhe o arquivo pelo papel. As três
saídas carregam a mesma marca de compilação (`Aula.versao`), gravada em
`app/dados/00-versao.js`. O arquivo não fica em `public/` de propósito: arquivo em `public/` é
servido antes de qualquer verificação, e o `src/proxy.ts` só confere se existe um
cookie chamado `sessao`, o que é conveniência de navegação e não controle de acesso.

O link aparece no cartão da Aula 2 em `/aulas` e em `/materiais`, cadastrado como
material da unidade pelo `scripts/import-content.ts`.

## Aula ao vivo

A Aula 2 é conduzida pelo baralho, e o aluno acompanha na plataforma. No painel da
aula, em `/professor/aovivo/<sessão>`, o bloco "Conduzir pelos slides" escolhe o
slide, e "Projetar os slides" abre a janela de projeção. Nessa janela você navega
com as setas, como sempre; a casca lê o `#/slide/NN` do baralho e publica na sessão,
e a tela do aluno troca de slide sem recarregar o arquivo. A janela projetada abre o
baralho em `?modo=projecao`: sem notas, sem impressão e sem modo estudo, porque é o que
a turma vê. As notas do slide no ar ficam no painel, no bloco "Roteiro do slide no ar". O baralho continua um
arquivo único e offline: quem fala com a API é a casca, não ele.

O roteiro em `src/lib/content/roteiro-aula-2.ts` liga cada slide às páginas do
apêndice que ele cobre. No painel, escolher uma dessas páginas carrega as perguntas
dela, que você publica para a turma enquanto projeta o slide. As 59 páginas do
apêndice estão cobertas; só `c5p17`, "Gini ou entropia", não tem slide.

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
execução por `App.definirModo`, sem recarregar.

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
node qa.mjs --aluno                       # verifica a variante sem notas
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
