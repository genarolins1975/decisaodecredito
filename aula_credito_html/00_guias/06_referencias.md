# Referências técnicas e uso de fontes

As referências abaixo orientam o implementador. As páginas oficiais de modelos, árvores, boosting e calibração foram consultadas na preparação deste briefing em 20/09/2026. As APIs podem mudar: use a documentação da versão efetivamente instalada e registre a versão no notebook. Esta lista não substitui a validação dos cálculos do próprio exemplo.

| Assunto | Fonte primária/oficial | Uso sugerido |
|---|---|---|
| Regressão logística e regularização | [scikit-learn: modelos lineares](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression) | Slides 07–20, implementação do logit |
| Árvores e critérios de divisão | [scikit-learn: decision trees](https://scikit-learn.org/stable/modules/tree.html) | Slides 21–30 |
| Boosting e função aditiva | [scikit-learn: ensembles](https://scikit-learn.org/stable/modules/ensemble.html#gradient-tree-boosting) | Slides 31–40, diferença entre primeira e segunda ordem |
| Calibração de probabilidades | [scikit-learn: probability calibration](https://scikit-learn.org/stable/modules/calibration.html) | Slides 43–47 |

Para aprofundamentos, localizar e verificar as fontes originais antes de citar: Friedman (2001), “Greedy Function Approximation: A Gradient Boosting Machine”; Hastie, Tibshirani e Friedman, *The Elements of Statistical Learning*; Wilson (1927), “Probable Inference, the Law of Succession, and Statistical Inference”; Lundberg e Lee (2017), “A Unified Approach to Interpreting Model Predictions”. Não inserir DOI, link ou número de página de memória.

Os roteiros são uma composição didática original, com exemplos numéricos próprios. Não copiar extensos trechos de documentação ou livros. Quando incorporar figura de terceiro, verificar licença, autoria e correspondência entre figura e explicação.

No rodapé dos slides, preferir “Exemplo didático; cálculo próprio” ou “Experimento sintético; seed e versão no notebook”, conforme a origem. A referência metodológica completa fica nas notas. Não usar uma referência científica como se ela fosse a fonte dos dados fictícios.

Não tratar a definição didática de atraso superior a 90 dias como transcrição de norma bancária. Esta aula não exige um bloco regulatório. Se acrescentar afirmação sobre regra vigente, verificar em fonte oficial e distinguir regra, prática de mercado e opção pedagógica.
