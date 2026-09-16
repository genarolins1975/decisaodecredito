import type { Metadata } from "next";
import { PageHeader, Callout } from "@/components/ui";
export const metadata: Metadata = { title: "Privacidade" };
export default function PrivacidadePage() {
  return (
    <div className="max-w-[760px]">
      <PageHeader eyebrow="Aviso de privacidade" title="Dados tratados nesta plataforma" />
      <Callout tone="warn" title="Rascunho para revisão institucional">Este aviso é uma minuta preparada pelo professor e ainda não foi validada juridicamente. Não constitui declaração de conformidade certificada.</Callout>
      <div className="card conteudo text-[15px] grid gap-3 mt-4">
        <p><b>Quem trata.</b> Prof. Genaro Dueire Lins, responsável pelo curso, por meio desta plataforma.</p>
        <p><b>Quais dados.</b> Nome e e-mail (cadastro autorizado); telefone e LinkedIn (opcionais, fornecidos por você); registros acadêmicos (respostas, presença, entregas, notas, devolutivas); registros técnicos mínimos (hash do endereço IP e navegador em eventos de segurança e presença).</p>
        <p><b>Para quê.</b> Autorizar o acesso, conduzir as aulas, registrar frequência, receber e avaliar trabalhos e manter o histórico acadêmico da edição.</p>
        <p><b>Quem vê.</b> Você vê os seus registros e os trabalhos do seu grupo. O professor e monitores autorizados veem os registros da turma. Telefone e LinkedIn não aparecem em diretórios nem em relatórios acadêmicos. Nada é enviado a serviços de inteligência artificial externos.</p>
        <p><b>Por quanto tempo.</b> Pela duração da edição e pelo período de retenção definido na política acadêmica (a definir pela instituição). Turmas arquivadas mantêm o histórico e bloqueiam novas interações.</p>
        <p><b>Seus direitos.</b> Solicitar ao professor exportação, correção ou exclusão dos seus dados pessoais, respeitados os registros acadêmicos que precisem ser mantidos.</p>
        <p><b>Segurança.</b> Senhas armazenadas apenas como hash (argon2id); sessões revogáveis; arquivos privados com download autorizado; trilha de auditoria das ações relevantes.</p>
      </div>
    </div>
  );
}
