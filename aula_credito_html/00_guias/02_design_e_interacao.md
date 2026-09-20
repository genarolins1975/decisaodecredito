# Sistema visual e contrato de interação HTML

## Direção visual

Estética sóbria, acadêmica e contemporânea. Fundo claro `#F5F4F0`, texto `#24313D`, títulos azul-marinho `#00205B`. Identidade dos modelos: logit azul `#2457A6`, árvore verde-petróleo `#127C80`, boosting violeta `#6B4EA0`. Risco e perdas usam vermelho `#A42B3A`; destaques de pergunta podem usar âmbar escuro com contraste suficiente. Sempre associe cor a rótulo, forma ou padrão de linha.

Use fontes locais ou de sistema como Inter, Aptos, Arial ou Helvetica. Não dependa de download de fontes para abrir a aula. Em uma área de referência de 1600×900, títulos 44–56 px, corpo 26–32 px, rótulos essenciais 22–26 px, notas breves no mínimo 18 px. No viewport efetivo, evite que a redução torne o conteúdo principal menor que 20 px. Reduza a quantidade de elementos, não a legibilidade.

Reserve aproximadamente 10–14% da altura ao título, 70–76% à evidência e 10–14% a conclusão, navegação e fonte. Não aplique essas porcentagens rigidamente se isso piorar a composição. O visual deve ocupar a maior parte da área útil. Em muitos slides haverá 55–70% para o gráfico e 25–35% para a explicação ou controle.

## Variedade com consistência

Alterne gráficos cartesianos, árvores, decomposições, tabelas pequenas, linhas do tempo, mapas de partição e exercícios. Evite a repetição de quatro cartões em todos os slides. Prefira rótulos próximos dos elementos, alinhamento numérico e espaços em branco. Não use ilustrações de robôs, cérebros, moedas ou fotos genéricas como substitutos da explicação.

Gráficos, diagramas e equações devem ser renderizados a partir de dados/código, com SVG, HTML, Canvas ou biblioteca apropriada. Nunca use uma imagem gerada por IA para representar valores exatos, uma árvore calculada ou uma fórmula. Imagens do material original podem ser preservadas quando legíveis, corretas e sem impedir uma interação necessária.

## Navegação

- URLs estáveis como `#/slide/01` até `#/slide/50`.
- Setas ou PageUp/PageDown para slides; botão visível de anterior/próximo e índice por bloco.
- Home/End para primeiro/último, sem capturar atalhos enquanto o usuário edita um campo.
- Revelação local com botão “Próximo passo”. Separar explicitamente o passo da animação do próximo slide.
- Tela cheia acionada por controle visível, modo professor, modo estudo e impressão.
- Indicador discreto de slide, bloco e passos locais quando existirem.
- Persistir opcionalmente o slide atual; a abertura de uma URL explícita prevalece sobre estado salvo.

Ao voltar a um slide, preservar a exploração na sessão ou restaurar seu início conforme regra documentada e consistente. Sempre oferecer “Reiniciar exemplo”. Não permitir que experimentar um cliente altere silenciosamente o caso canônico dos demais slides. Use estados locais e cenários compartilhados somente onde explicitamente especificado.

## Interações que ensinam

Cada controle deve ter: pergunta didática, rótulo, unidade, domínio, passo, padrão inicial, resposta visual, resposta numérica e tratamento de extremos. Slider deve ter entrada numérica equivalente. Elementos arrastáveis precisam de seleção por teclado/toque. Tooltips repetem ou aprofundam dados, nunca escondem a conclusão principal.

Atualizações numéricas simples devem ocorrer imediatamente; operações pesadas podem usar cenários pré-calculados com rótulo “resultado pré-calculado”. Não exiba um efeito de treinamento ao vivo se apenas estiver trocando um arquivo. Para animações, prefira 200–450 ms, início manual e respeito a `prefers-reduced-motion`. Não use loop, autoplay ou transições que distraiam da fala.

Botões de quiz mostram a justificativa da alternativa escolhida. “Ver resposta” revela o raciocínio, não apenas a letra. Não simule porcentagens de votos. No modo professor, respostas ficam disponíveis sem contaminar a tela projetada.

## Arquitetura e funcionamento offline

Reaproveite a stack existente se adequada. Em projeto novo, use componentes por slide, funções matemáticas puras compartilhadas, um registro central dos 50 slides e dados identificados por cenário/modelo/partição. Pode usar React, Reveal.js ou HTML modular, desde que a complexidade seja justificada.

A saída final precisa abrir offline. Se oferecer um único HTML, incorpore JS, CSS e dados necessários; não dependa de `fetch` local bloqueado por `file://`. Inclua bibliotecas no pacote final e respeite licenças. Links de referências podem exigir internet, mas nenhum cálculo ou gráfico essencial deve depender de rede. Não use serviços de IA ou APIs em tempo de apresentação.

Um contrato de dados recomendado separa `toyLogit`, `toyTree`, `toyBoosting`, `experimentResults` e `policyScenario`. Valores calculados não devem ser duplicados em texto estático. O mesmo valor exibido em tabela, tooltip e gráfico precisa vir da mesma função ou objeto.

## Projeção, estudo e acessibilidade

Valide 1920×1080, 1366×768, 1024×768 e 390×844. Em desktop, uma tela corresponde a um slide sem rolagem principal. Em celular/modo estudo, reorganize a composição e permita rolagem vertical. A apresentação não deve ser apenas uma página longa em desktop.

Foco visível, botões semânticos, labels, contraste, resumo textual de gráficos e tabelas equivalentes. Valores não devem ser anunciados continuamente por leitores de tela durante um arraste. Evite hover exclusivo, canvas sem alternativa ou mudança sem indicação textual.

Impressão deve selecionar estados didáticos úteis, esconder controles e mostrar as respostas em seção própria. As 50 páginas principais permanecem distintas; notas e aprofundamentos podem aparecer em apêndice de estudo.
