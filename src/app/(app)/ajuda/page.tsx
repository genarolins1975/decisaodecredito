import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
export const metadata: Metadata = { title: "Ajuda" };
export default function AjudaPage() {
  return (
    <div className="max-w-[760px]">
      <PageHeader eyebrow="Guia do aluno" title="Como usar a plataforma" />
      <div className="card conteudo text-[15px] grid gap-3">
        <p><b>Ativar o acesso.</b> Você recebe por e-mail um link e um código de primeiro acesso, individuais e de uso único. Ao validá-los, define a sua senha pessoal. A senha nunca é enviada por e-mail nem vista pelo professor.</p>
        <p><b>Telefone e LinkedIn.</b> São opcionais; você pode preencher depois, editar ou remover em Meus dados (clique no seu nome, no alto). Só você e o professor veem esses dados.</p>
        <p><b>Turmas.</b> Se você tiver mais de uma matrícula autorizada, escolha a turma no seletor do topo. O histórico de cada edição fica separado.</p>
        <p><b>Aulas.</b> Cada página tem objetivo, apoio, visual, atividades e uma pergunta de checagem. Anterior e Próxima ficam no fim da página; Alt+← e Alt+→ também funcionam. “Ver em tela cheia” mostra a página como slide.</p>
        <p><b>Ao vivo.</b> Quando o professor inicia a aula, entre por Ao vivo (ou pelo aviso em Início). Você pode seguir o professor ou navegar por conta própria e voltar. As perguntas dele aparecem ao lado; a resposta fica salva e um reenvio não duplica. Registre presença com o código mostrado em sala.</p>
        <p><b>Trabalhos.</b> Inicie a entrega, anexe arquivos ou links e clique em Enviar: só então há entrega, com recibo (versão, hashes e horário do servidor). Nova versão substitui a vigente sem apagar o histórico. Prazos seguem o horário de Brasília.</p>
        <p><b>Teste cego.</b> Congele o modelo (manifesto, versão e hashes) antes de baixar o arquivo OOT; as previsões são enviadas uma única vez.</p>
        <p><b>Notas.</b> Notas e comentários aparecem em Trabalhos e em Notas e presença quando o professor publica.</p>
        <p><b>Problemas de acesso.</b> Use “Esqueci minha senha” na tela de entrada. Se o convite expirou, peça um novo ao professor.</p>
      </div>
    </div>
  );
}
