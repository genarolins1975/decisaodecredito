/** Templates em português. Nunca incluem notas, trabalhos ou dados acadêmicos sensíveis. */

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#F5F4F0;font-family:Georgia,'Times New Roman',serif;color:#333">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" style="max-width:560px;background:#fff;border:1px solid #E2DFD6;border-radius:6px"><tr><td style="padding:28px 32px">
<p style="margin:0 0 6px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5B6475;font-family:Arial,sans-serif">Prof. Genaro Dueire Lins</p>
<h1 style="margin:0 0 18px;font-size:22px;color:#00205B">${esc(title)}</h1>
${bodyHtml}
<p style="margin:24px 0 0;font-size:12px;color:#5B6475;font-family:Arial,sans-serif">Se você não esperava esta mensagem, ignore-a. Nenhuma ação será tomada sem o seu acesso.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function inviteTemplate(p: { studentName: string; courseName: string; classLabel: string; link: string; code: string; expiresAtText: string }) {
  const subject = `Acesso ao curso ${p.courseName} · ${p.classLabel}`;
  const text = `Olá, ${p.studentName}.

Você foi autorizado(a) a acessar a plataforma do curso ${p.courseName} (${p.classLabel}).

Primeiro acesso:
1. Abra o link: ${p.link}
2. Se for solicitado, informe o código de primeiro acesso: ${p.code}
3. Defina a sua senha pessoal. Ela nunca será enviada por e-mail.

Esta credencial é individual, de uso único e vale até ${p.expiresAtText}. Depois disso, peça um novo convite ao professor.

Ao entrar, você poderá preencher telefone e LinkedIn (opcionais) ou pular esta etapa.

Prof. Genaro Dueire Lins`;
  const html = layout("Seu acesso ao curso", `
<p style="font-size:15px;line-height:1.5">Olá, <b>${esc(p.studentName)}</b>. Você foi autorizado(a) a acessar a plataforma do curso <b>${esc(p.courseName)}</b> (${esc(p.classLabel)}).</p>
<p style="font-size:15px;line-height:1.5">Para o primeiro acesso, abra o link abaixo e defina a sua senha pessoal. A senha nunca será enviada por e-mail.</p>
<p style="margin:20px 0"><a href="${esc(p.link)}" style="display:inline-block;background:#00205B;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-family:Arial,sans-serif;font-weight:bold">Ativar meu acesso</a></p>
<p style="font-size:14px;line-height:1.5">Se o link não abrir, acesse <a href="${esc(p.link.split("?")[0])}">${esc(p.link.split("?")[0])}</a> e informe o código de primeiro acesso: <b style="font-family:Consolas,monospace;font-size:16px;letter-spacing:.08em">${esc(p.code)}</b></p>
<p style="font-size:13px;color:#5B6475">Credencial individual, de uso único, válida até ${esc(p.expiresAtText)}. Depois disso, peça um novo convite ao professor.</p>`);
  return { subject, text, html };
}

export function existingUserTemplate(p: { studentName: string; courseName: string; classLabel: string; loginLink: string }) {
  const subject = `Nova matrícula: ${p.courseName} · ${p.classLabel}`;
  const text = `Olá, ${p.studentName}.

Sua conta na plataforma do curso ${p.courseName} recebeu uma nova matrícula: ${p.classLabel}.

Entre com o seu e-mail e a senha que você já definiu: ${p.loginLink}
Se esqueceu a senha, use "Esqueci minha senha" na tela de entrada. Nenhuma senha é enviada por e-mail.

Prof. Genaro Dueire Lins`;
  const html = layout("Nova matrícula", `
<p style="font-size:15px;line-height:1.5">Olá, <b>${esc(p.studentName)}</b>. Sua conta recebeu uma nova matrícula: <b>${esc(p.classLabel)}</b> do curso ${esc(p.courseName)}.</p>
<p style="margin:20px 0"><a href="${esc(p.loginLink)}" style="display:inline-block;background:#00205B;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-family:Arial,sans-serif;font-weight:bold">Entrar na plataforma</a></p>
<p style="font-size:13px;color:#5B6475">Use a senha que você já definiu. Se esqueceu, use "Esqueci minha senha" na tela de entrada.</p>`);
  return { subject, text, html };
}

export function resetTemplate(p: { name: string; link: string; expiresAtText: string }) {
  const subject = "Redefinição de senha";
  const text = `Olá, ${p.name}.

Recebemos um pedido para redefinir a sua senha. Abra o link abaixo para escolher uma nova senha:
${p.link}

O link vale até ${p.expiresAtText} e só pode ser usado uma vez. Se você não pediu, ignore esta mensagem.`;
  const html = layout("Redefinição de senha", `
<p style="font-size:15px;line-height:1.5">Olá, <b>${esc(p.name)}</b>. Recebemos um pedido para redefinir a sua senha.</p>
<p style="margin:20px 0"><a href="${esc(p.link)}" style="display:inline-block;background:#00205B;color:#fff;text-decoration:none;padding:12px 20px;border-radius:4px;font-family:Arial,sans-serif;font-weight:bold">Escolher nova senha</a></p>
<p style="font-size:13px;color:#5B6475">Válido até ${esc(p.expiresAtText)}, uso único. Se você não pediu, ignore esta mensagem.</p>`);
  return { subject, text, html };
}

export function testTemplate(p: { sender: string }) {
  return {
    subject: "Teste de envio da plataforma do curso",
    text: `Esta é uma mensagem de teste enviada pela plataforma do curso a partir da conta ${p.sender}. Nenhum aluno recebeu esta mensagem.`,
    html: layout("Teste de envio", `<p style="font-size:15px">Mensagem de teste enviada a partir da conta <b>${esc(p.sender)}</b>. Nenhum aluno recebeu esta mensagem.</p>`),
  };
}
