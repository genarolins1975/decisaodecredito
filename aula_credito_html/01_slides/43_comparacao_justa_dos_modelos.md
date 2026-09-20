# Slide 43 — Uma comparação justa começa pelo protocolo

**Bloco:** avaliação e decisão. **Tempo:** 4 min. **Origem:** experimento sintético executado pelo Claude.

## Objetivo e mensagem
Reconhecer que diferenças de dados ou seleção podem ser confundidas com diferenças de algoritmo. Mensagem: “Mesmo alvo, mesma informação e teste preservado são condições da comparação.”

## Tela e composição
Título: **“Estamos comparando modelos ou comparando condições diferentes?”**. Tabela de três colunas de modelos e cinco linhas: amostra/alvo; informação disponível; pré-processamento; escolha de complexidade; avaliação final. Elementos comuns aparecem como uma faixa compartilhada, evitando repetir texto. Uma tira inferior mostra os quatro períodos do protocolo.

## Conteúdo
Logit regularizado, árvore com complexidade controlada e boosting ajustado. Permitir tratamentos próprios de categorias/ausentes, mas com o mesmo conjunto informacional e sem vantagem por vazamento. Incluir sensibilidade com logit transformado/interações, para não utilizar baseline deliberadamente fraco. Orçamento de busca razoável e documentado, sem exigir número idêntico de parâmetros entre métodos.

## Interação
Botão “Detectar comparação injusta” apresenta três erros, um por vez: boosting com variável futura; logit sem tratamento enquanto outros receberam engenharia; escolha de configuração pela métrica do teste. O usuário identifica o erro e revela como corrigi-lo. “Ver protocolo executado” mostra metadados reais de partições, seed, parâmetros e versão.

## Sequência
Recupere o slide 05 em miniatura. Pergunte por que usar todos os registros em todos os modelos ainda não basta para garantir justiça. Revele processamento e seleção. Só depois habilite “abrir resultados”, que leva ao slide 44, sem alterar o teste.

## Notas
Se múltiplos modelos pré-especificados são comparados no teste, resultados podem ser relatados, mas ajustes posteriores motivados por esse teste exigem nova avaliação independente. A exploração em aula não deve produzir um campeão otimizado retroativamente. Ajustar calibradores e cortes pertence às partições definidas.

## Ponte
“A primeira pergunta é se o modelo ordena corretamente os clientes de maior e menor risco.”

## Aceite específico
As condições da tabela devem corresponder ao notebook. Sem métricas antes da execução. Metadados e número de linhas por partição conferidos. O protocolo do logit flexível fica identificado como sensibilidade, não uma quarta técnica principal desconectada.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
