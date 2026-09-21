# Registro de retomada

**Estado: implementação concluída.** Os 50 slides estão construídos, verificados e
aceitos. Este arquivo registra onde as coisas estão e o que uma sessão seguinte precisa
saber antes de mexer em qualquer parte.

## Onde está cada coisa

| O quê | Onde |
|---|---|
| Apresentação para abrir | `dist/aula_credito.html`, arquivo único, abre por duplo clique |
| Variante do aluno, sem notas | `dist/aula_credito_aluno.html`, gerada por análise sintática dos fontes |
| Notas por slide para o painel | `dist/aula_credito_notas.json` |
| Marca da compilação | `app/dados/00-versao.js`, gerado |
| Fonte, um arquivo por slide | `app/slides/s01.js` a `app/slides/s50.js` |
| Registro, formatação e matemática | `app/nucleo/01-nucleo.js` |
| Desenho vetorial, eixos, árvores, waterfall | `app/nucleo/02-svg.js` |
| Controles de interface | `app/nucleo/03-ui.js` |
| Componentes compartilhados entre slides | `app/nucleo/04-comum.js` |
| Motor da apresentação, rotas, teclado, impressão | `app/nucleo/90-app.js` |
| Dados canônicos, quatro clientes, logit manual | `app/dados/10-dados.js` |
| Resultados do experimento, gerado | `app/dados/11-resultados.js` |
| Estilo | `app/estilo/aula.css` |
| Experimento em Python | `experimento/experimento.py` |
| Notebook executado | `experimento/experimento.ipynb` |
| Saídas do experimento | `experimento/saida/` |

## Comandos

```
node build.mjs                      # gera app/index.html, 00-versao.js, 11-resultados.js e as três saídas em dist/ e content/slides/
node qa.mjs                         # verifica os 50 slides em 1366x768
node qa.mjs --largura 390x844       # outra resolução
node qa.mjs --estados               # percorre também os estados interativos
node qa.mjs --aluno --estados       # a variante do aluno
node qa.mjs --shots 09 22           # salva capturas em qa/
node lint-tracos.mjs                # hífen ou travessão em todo texto declarado
node rotulos.mjs 05 48              # rótulos de SVG que saem do desenho
node apertado.mjs 07 43             # painéis cujo conteúdo não cabe
node medir.mjs 26                   # alturas dos blocos de um slide
node imprimir.mjs                   # gera e confere qa/aula_credito_impressao.pdf

python3 experimento/experimento.py        # refaz o experimento e as saídas
python3 experimento/gerar_notebook.py     # remonta e executa o notebook
```

Depois de qualquer alteração em `app/`, rodar `node build.mjs` antes de `node qa.mjs`:
o QA lê a distribuição, não os arquivos soltos.

## Decisões globais que não devem ser revertidas em silêncio

1. **Nenhum hífen nem travessão em texto exibido.** O sinal de menos é U+2212, aplicado
   por `F` em `app/nucleo/01-nucleo.js`. `node lint-tracos.mjs` cobra isso.
2. **Palco fixo de 1600 por 900,** escalado por `transform`. `#palco` tem
   `flex: 0 0 auto`: sem isso ele encolhe e a composição quebra.
3. **Script clássico, sem módulo e sem framework,** para a distribuição funcionar em
   `file://`.
4. **Nenhum número digitado duas vezes.** Tudo vem de `app/dados/`. Um valor escrito
   direto no slide é defeito.
5. **Sem vencedor predeterminado.** A amplitude de AUC entre os três modelos no teste é
   0,005392 e a aula diz isso. Nenhum gráfico foi ajustado para favorecer um método.
6. **Protocolo temporal congelado.** Hiperparâmetros na validação, calibrador e corte
   na partição de política, teste uma única vez.
7. **Rede de segurança do CSS.** `svg { max-width: 100% }` impede que um desenho maior
   que o painel escorra sobre o vizinho. Os desenhos são dimensionados para caber sem
   ela; a regra existe para o caso de alguém mudar uma largura.
8. **Modo estudo abaixo de 1100px.** `LARGURA_ESTUDO` em `app/nucleo/90-app.js`.
9. **Um bloco `notas` por slide, e só nele.** `build.mjs` remove essa propriedade para a
   variante do aluno pela árvore sintática e para se encontrar zero ou dois blocos; texto
   de nota fora de `notas` iria parar no arquivo do aluno.
10. **Estado local versionado.** `sessionStorage` por aba e por usuário com `Aula.versao`;
    versão diferente descarta. Nunca gravar exploração no servidor sem critério pedagógico.
11. **Modos `aluno`, `livre` e `projecao`** em `90-app.js`; a casca troca por
    `App.definirModo`, nunca por recarga do iframe.
12. **Gráfico sem resumo fica `aria-hidden`** (`Graf.acessivel`). Quem quiser o gráfico
    nomeado para leitor de tela passa `resumo`.
13. **Todo estado precisa caber nos 900 px.** `ajustarCorpo`, em `90-app.js`, reduz o corpo até
    caber (mínimo 0,6) e grava o fator em `data-zoom`; é rede de segurança, não licença. A QA
    falha abaixo de 80% e lista os slides que couberam reduzidos: o certo é rearranjar o slide.
14. **`node qa.mjs --estados` é a verificação que vale.** Ela clica todos os botões três vezes,
    sem "Reiniciar", e cobra fórmulas não montadas, estouro, corte e zoom depois de cada
    rodada. Um slide aceito só no estado inicial não está aceito.
15. **Texto dentro de fórmula passa por `Mat.t`**, que escapa `%`, `#`, `&` e `_`. Concatenar
    um rótulo cru em `\text{}` derruba a expressão inteira quando ele traz `%`.
16. **Os guias em PDF nascem do baralho, não de textos paralelos.** `material.mjs` captura
    cada slide do `dist/aula_credito.html` compilado, lê as notas do JSON de notas e calcula
    as tabelas de `Aula.resultados`; só o texto didático (`material/conteudo/`) é escrito à
    mão, e `tests/aula-2-material.test.ts` cobra que ele cubra os 50 slides sem traços. Mudou
    um slide: `node build.mjs` e depois `node material.mjs`, nunca editar o PDF.

## Se for preciso mexer

- **Mudar um slide:** editar `app/slides/sNN.js`, rodar `node build.mjs`, depois
  `node qa.mjs NN` e `node medir.mjs NN` se houver suspeita de altura.
- **Mudar um componente compartilhado** de `app/nucleo/`: rodar o QA completo nas quatro
  resoluções e a varredura de estados, porque o componente aparece em vários slides.
- **Mudar texto, número ou estado de um slide:** regenerar os guias com `node material.mjs`,
  porque a captura e as notas do slide entram nos dois PDFs de `content/materiais/`. Se o
  texto didático em `material/conteudo/` citar o número alterado, corrigir ali também.
- **Mudar o experimento:** rodar `experimento.py`, depois `gerar_notebook.py`, depois
  `build.mjs`. O `sha256` em `metadados.json` muda e precisa ser refletido em
  `02_controle/REVISAO_FINAL.md`.
- **Mudar a economia do slide 47:** os valores estão em `app/dados/10-dados.js`, campo
  `economia`, e o corte congelado de 20% também é usado pelo experimento em
  `experimento/experimento.py`. Os dois precisam mudar juntos.

## Pendências

Nenhuma pendência de implementação. As limitações da entrega, que não são pendências e
sim características declaradas, estão em `02_controle/REVISAO_FINAL.md`.
