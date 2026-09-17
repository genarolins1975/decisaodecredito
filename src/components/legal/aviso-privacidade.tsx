/** Texto do aviso de privacidade, compartilhado pela página pública (exigida pelo Google para o cliente OAuth) e pela página interna. */
export function AvisoPrivacidade() {
  return (
    <div className="card conteudo text-[15px] grid gap-3 mt-4">
      <p><b>Quem trata.</b> Prof. Genaro Dueire Lins, responsável pelo curso, por meio desta plataforma (decisaodecredito.com).</p>
      <p><b>Quais dados.</b> Nome e e-mail (cadastro autorizado); telefone e LinkedIn (opcionais, fornecidos por você); registros acadêmicos (respostas, presença, entregas, notas, devolutivas); registros técnicos mínimos (hash do endereço IP e navegador em eventos de segurança e presença).</p>
      <p><b>Para quê.</b> Autorizar o acesso, conduzir as aulas, registrar frequência, receber e avaliar trabalhos e manter o histórico acadêmico da edição.</p>
      <p><b>Quem vê.</b> Você vê os seus registros e os trabalhos do seu grupo. O professor e monitores autorizados veem os registros da turma. Telefone e LinkedIn não aparecem em diretórios nem em relatórios acadêmicos. Nada é enviado a serviços de inteligência artificial externos.</p>
      <p><b>E-mails.</b> Convites e avisos são enviados pela conta Gmail do professor, conectada por OAuth com a permissão exclusiva de envio (gmail.send). A plataforma não lê a caixa de entrada nem outros dados da conta Google; o token fica cifrado no servidor e pode ser revogado a qualquer momento pelo professor, na plataforma ou na conta Google.</p>
      <p><b>Por quanto tempo.</b> Pela duração da edição e pelo período de retenção definido na política acadêmica (a definir pela instituição). Turmas arquivadas mantêm o histórico e bloqueiam novas interações.</p>
      <p><b>Seus direitos.</b> Solicitar ao professor exportação, correção ou exclusão dos seus dados pessoais, respeitados os registros acadêmicos que precisem ser mantidos. Contato: pelo e-mail do professor informado no convite.</p>
      <p><b>Segurança.</b> Senhas armazenadas apenas como hash (argon2id); sessões revogáveis; arquivos privados com download autorizado; trilha de auditoria das ações relevantes.</p>
    </div>
  );
}
