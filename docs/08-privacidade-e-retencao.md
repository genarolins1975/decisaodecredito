# Aviso de privacidade e política de retenção (minutas para revisão institucional)

Estas minutas foram preparadas para a plataforma e não constituem parecer jurídico nem declaração de conformidade certificada. Devem ser revisadas pela área responsável da instituição antes da publicação aos alunos.

## Minuta de aviso de privacidade (já exibida em /privacidade com o mesmo aviso)

- Controlador: o professor responsável pelo curso, por meio da plataforma.
- Dados tratados: nome e e-mail (cadastro autorizado); telefone e LinkedIn (opcionais, fornecidos pelo aluno); registros acadêmicos (respostas, presença, entregas, notas, devolutivas); registros técnicos mínimos (hash do endereço IP e navegador em eventos de autenticação e presença).
- Finalidades: autorizar o acesso, conduzir aulas, registrar frequência, receber e avaliar trabalhos, manter o histórico acadêmico.
- Compartilhamento: professor e monitores autorizados veem os registros da turma; alunos veem os próprios registros e os trabalhos do seu grupo; telefone e LinkedIn não aparecem em diretórios nem relatórios; nenhum dado é enviado a serviços de inteligência artificial externos; o e-mail de convite é enviado pela conta Gmail do professor por meio da Gmail API.
- Direitos: exportação, correção e exclusão mediante solicitação ao professor, respeitados os registros acadêmicos de guarda obrigatória.
- Segurança: senhas apenas como hash argon2id; sessões revogáveis; arquivos privados; auditoria.

## Minuta de política de retenção

| Dado | Retenção proposta | Ação ao fim |
|---|---|---|
| Convites e tokens de redefinição | expirados após uso ou validade; registros mantidos 12 meses para auditoria | exclusão |
| Fila de e-mail | 12 meses | exclusão do corpo, manutenção de metadados |
| Perfil opcional (telefone, LinkedIn) | enquanto a matrícula estiver ativa ou até remoção pelo aluno | exclusão |
| Registros acadêmicos (respostas, presença, entregas, notas) | prazo definido pela instituição (proposta: 5 anos após o fim da edição) | arquivamento e posterior exclusão |
| Arquivos de entrega | mesmo prazo dos registros acadêmicos | exclusão do armazenamento |
| Auditoria | 5 anos | exclusão |
| Contas sem matrícula ativa há mais de 24 meses | desativação | exclusão após aviso |

Procedimentos previstos na plataforma: exportação por aluno (CSV de frequência e notas por turma; arquivos por download autorizado), correção de nome e e-mail por fluxo administrativo com nova verificação (a implementar no painel; hoje por script), arquivamento de turma (somente leitura) e exclusão por script com registro em auditoria.
