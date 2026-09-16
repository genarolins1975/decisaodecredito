import { Empty } from "@/components/ui";

export default function SemTurmaPage() {
  return (
    <Empty title="Nenhuma turma ativa para este acesso">
      Sua conta existe, mas não há matrícula ativa vinculada ao seu e-mail. Se você foi convidado, use o link do e-mail para ativar; se a matrícula foi encerrada, fale com o professor.
    </Empty>
  );
}
