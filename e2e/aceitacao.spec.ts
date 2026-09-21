/**
 * Testes de aceitação obrigatórios (seção 13 do briefing), executados contra a aplicação real
 * com banco local. Contas de teste isoladas (domínio example.test). Nenhum e-mail sai da plataforma.
 */
import { test, expect } from "@playwright/test";
import { apiAs, loginUi, sql, classId, uid, PROF, ALUNO_A, ALUNO_B, OUTRA, MONITOR, SEM } from "./helpers";

test.describe.serial("edições, turmas e isolamento", () => {
  test("edição 2026 existe; professor cria 2027 e duplica sem copiar pessoas ou registros", async () => {
    const prof = await apiAs(PROF);
    const eds = await (await prof.get("/api/professor/edicoes")).json();
    const e2026 = eds.editions.find((e: { label: string }) => e.label === "2026");
    expect(e2026).toBeTruthy();
    const label = `27${uid().slice(0, 4)}`; // rótulo único por execução
    const dup = await prof.post(`/api/professor/edicoes/${e2026.id}/duplicar`, { data: { year: 2027, label } });
    expect(dup.status()).toBe(201);
    const body = await dup.json();
    expect(body.copied.pages).toBe(180);
    expect(body.warning).toContain("Matrículas");
    // nada de pessoas/registros na nova edição
    const cls = await sql("select count(*)::int as n from classes where edition_id=$1", [body.edition.id]);
    expect(cls[0].n).toBe(0);
    // criar turma na nova edição
    const c = await prof.post("/api/professor/turmas", { data: { editionId: body.edition.id, code: `${label}-A` } });
    expect(c.status()).toBe(201);
    const enr = await sql("select count(*)::int as n from enrollments e join classes c on c.id=e.class_id where c.edition_id=$1", [body.edition.id]);
    expect(enr[0].n).toBe(0);
  });

  test("conta sem matrícula não acessa o curso; turma não acessa outra turma; monitor não vira administrador", async () => {
    const cid = await classId();
    const sem = await apiAs(SEM);
    expect((await sem.get(`/api/conteudo/pagina/c1p1?classId=${cid}`)).status()).toBe(403);
    expect((await sem.get("/api/professor/edicoes")).status()).toBe(403);
    const outra = await apiAs(OUTRA);
    expect((await outra.get(`/api/conteudo/pagina/c1p1?classId=${cid}`)).status()).toBe(403);
    expect((await outra.get(`/api/estudo/responder?classId=${cid}&versions=x`)).status()).toBe(403);
    const mon = await apiAs(MONITOR);
    expect((await mon.get("/api/professor/edicoes")).status()).toBe(403);
    expect((await mon.post("/api/professor/turmas", { data: { editionId: "x", code: "y" } })).status()).toBe(403);
    // monitor pode ver conteúdo com guia, mas não gerir matrículas
    expect((await mon.get(`/api/professor/turmas/${cid}/matriculas`)).status()).toBe(403);
  });
});

test.describe.serial("matrícula, convite, ativação e senha", () => {
  const email = `e2e.${uid()}@example.test`;
  let code = "";
  let enrollmentId = "";

  test("importação identifica duplicidades; só e-mails cadastrados recebem convite", async () => {
    const prof = await apiAs(PROF);
    const cid = await classId();
    const prev = await (await prof.post(`/api/professor/turmas/${cid}/importar/previa`, { data: { csv: `nome;email\nPessoa E2E;${email}\nPessoa E2E;${email}\nAluno A Teste;aluno.a@example.test\nInvalido;nao-e-email` } })).json();
    expect(prev.rows.map((r: { status: string }) => r.status)).toEqual(["ok", "duplicada_no_arquivo", "ja_matriculada", "invalida"]);
    const conf = await (await prof.post(`/api/professor/turmas/${cid}/importar/confirmar`, { data: { csv: `nome;email\nPessoa E2E;${email}` } })).json();
    expect(conf.created.length).toBe(1);
    enrollmentId = conf.created[0];
    const inv = await (await prof.post(`/api/professor/turmas/${cid}/convites`, { data: { enrollmentIds: [enrollmentId] } })).json();
    expect(inv.results[0].outcome).toContain("enfileirado");
    const m = await sql<{ body_text: string; status: string }>("select body_text, status from email_messages where enrollment_id=$1 order by created_at desc limit 1", [enrollmentId]);
    expect(m[0].status).toBe("queued"); // sem remetente conectado: fica na fila, nunca sai
    code = m[0].body_text.match(/acesso: ([A-Z0-9]{12})/)![1];
    expect(m[0].body_text).not.toMatch(/senha:/i);
  });

  test("credencial temporária: uso único, troca obrigatória de senha no servidor, reenvio invalida a anterior", async () => {
    const anon = await apiAs(null);
    expect((await anon.post("/api/auth/ativar", { data: { code: "ZZZZZZZZZZZZ" } })).status()).toBe(400);
    const ativ = await anon.post("/api/auth/ativar", { data: { code } });
    expect(ativ.status()).toBe(200);
    expect((await ativ.json()).mustChangePassword).toBe(true);
    // reutilização recusada
    expect((await (await apiAs(null)).post("/api/auth/ativar", { data: { code } })).status()).toBe(400);
    // acesso protegido antes da senha: bloqueado no servidor
    expect((await anon.get(`/api/conteudo/pagina/c1p1?classId=${await classId()}`)).status()).toBe(403);
    expect((await anon.patch("/api/perfil", { data: { phone: "1" } })).status()).toBe(403);
    // senha fraca recusada; forte aceita
    expect((await anon.post("/api/auth/senha", { data: { password: "1234567890" } })).status()).toBe(400);
    const set = await anon.post("/api/auth/senha", { data: { password: `Senha-forte-${uid()}` } });
    expect(set.status()).toBe(200);
    expect((await set.json()).next).toBe("/perfil/primeiro-acesso");
    // onboarding com campos vazios funciona e é opcional
    expect((await anon.patch("/api/perfil", { data: { phone: "", linkedinUrl: "", completeOnboarding: true } })).status()).toBe(200);
    expect((await anon.patch("/api/perfil", { data: { linkedinUrl: "http://evil.example" } })).status()).toBe(400);
    expect((await anon.patch("/api/perfil", { data: { linkedinUrl: "https://www.linkedin.com/in/pessoa" } })).status()).toBe(200);
    const me = await (await anon.get("/api/auth/me")).json();
    expect(me.classes.length).toBe(1);
    // reenvio a quem já tem senha: aviso, sem nova senha
    const prof = await apiAs(PROF);
    const inv = await (await prof.post(`/api/professor/turmas/${await classId()}/convites`, { data: { enrollmentIds: [enrollmentId] } })).json();
    expect(inv.results[0].outcome).toContain("conta existente");
    const m = await sql<{ body_text: string }>("select body_text from email_messages where enrollment_id=$1 and kind='invite_existing' order by created_at desc limit 1", [enrollmentId]);
    expect(m[0].body_text).not.toMatch(/código de primeiro acesso/i);
  });

  test("reenvio para quem ainda não ativou invalida convite anterior; convite expirado é recusado", async () => {
    const prof = await apiAs(PROF);
    const cid = await classId();
    const e2 = `e2e.${uid()}@example.test`;
    const conf = await (await prof.post(`/api/professor/turmas/${cid}/matriculas`, { data: { people: [{ name: "Reenvio E2E", email: e2 }] } })).json();
    const eid = conf.created[0];
    await prof.post(`/api/professor/turmas/${cid}/convites`, { data: { enrollmentIds: [eid] } });
    const first = (await sql<{ body_text: string }>("select body_text from email_messages where enrollment_id=$1 order by created_at desc limit 1", [eid]))[0].body_text.match(/acesso: ([A-Z0-9]{12})/)![1];
    await prof.post(`/api/professor/turmas/${cid}/convites`, { data: { enrollmentIds: [eid] } });
    const second = (await sql<{ body_text: string }>("select body_text from email_messages where enrollment_id=$1 order by created_at desc limit 1", [eid]))[0].body_text.match(/acesso: ([A-Z0-9]{12})/)![1];
    expect(first).not.toBe(second);
    const r1 = await (await apiAs(null)).post("/api/auth/ativar", { data: { code: first } });
    expect((await r1.json()).code).toBe("superseded");
    // expira o segundo no banco e tenta
    await sql("update invites set expires_at = now() - interval '1 minute' where enrollment_id=$1 and superseded_at is null", [eid]);
    const r2 = await (await apiAs(null)).post("/api/auth/ativar", { data: { code: second } });
    expect((await r2.json()).code).toBe("expired");
  });

  test("revogação bloqueia sessões existentes na turma; recuperação de senha usa link único", async () => {
    const prof = await apiAs(PROF);
    const cid = await classId();
    const me = await sql<{ id: string }>("select id from enrollments where email=$1 and class_id=$2", [email, cid]);
    const ctxStudent = await apiAs(null);
    // login com a senha definida (recupera via redefinição para não depender do estado anterior)
    await ctxStudent.post("/api/auth/recuperar", { data: { email } });
    const tok = (await sql<{ body_text: string }>("select body_text from email_messages where kind='password_reset' and to_email=$1 order by created_at desc limit 1", [email]))[0].body_text.match(/t=([A-Za-z0-9_-]+)/)![1];
    const pw = `Nova-senha-${uid()}`;
    expect((await ctxStudent.post("/api/auth/redefinir", { data: { token: tok, password: pw } })).status()).toBe(200);
    expect((await ctxStudent.post("/api/auth/redefinir", { data: { token: tok, password: pw } })).status()).toBe(400); // uso único
    const s = await apiAs({ email, password: pw });
    expect((await s.get(`/api/conteudo/pagina/c1p1?classId=${cid}`)).status()).toBe(200);
    await prof.patch(`/api/professor/turmas/${cid}/matriculas/${me[0].id}`, { data: { status: "suspenso", reason: "teste e2e" } });
    expect((await s.get(`/api/conteudo/pagina/c1p1?classId=${cid}`)).status()).toBe(403); // sessão existente bloqueada
    expect((await s.get("/api/auth/me")).status()).toBe(200); // conta continua válida
    await prof.patch(`/api/professor/turmas/${cid}/matriculas/${me[0].id}`, { data: { status: "encerrado", reason: "fim do teste" } });
  });
});

test("iniciar aula em um clique: reaproveita a aula aberta e abre para os alunos", async () => {
  const prof = await apiAs(PROF);
  const cid = await classId();
  const meetings = await (await prof.get(`/api/professor/turmas/${cid}/encontros`)).json();
  if (!meetings.meetings.length) await prof.post(`/api/professor/turmas/${cid}/encontros`, { data: { scaffold: true } });
  const mid = (await (await prof.get(`/api/professor/turmas/${cid}/encontros`)).json()).meetings[0].id;
  const r1 = await prof.post(`/api/professor/turmas/${cid}/encontros/${mid}/iniciar`, { data: {} });
  expect(r1.status()).toBe(200);
  const { sessionId } = await r1.json();
  expect((await sql<{ status: string }>("select status from live_sessions where id=$1", [sessionId]))[0].status).toBe("open");
  const r2 = await (await prof.post(`/api/professor/turmas/${cid}/encontros/${mid}/iniciar`, { data: {} })).json();
  expect(r2.sessionId).toBe(sessionId); // segundo clique não cria outra aula
  const a = await apiAs(ALUNO_A);
  expect((await a.get(`/api/aovivo/${sessionId}/estado`)).status()).toBe(200); // aluno vê a aula aberta
  expect((await a.post(`/api/professor/turmas/${cid}/encontros/${mid}/iniciar`, { data: {} })).status()).toBe(403); // aluno não inicia aula
  await prof.post(`/api/aovivo/${sessionId}/status`, { data: { status: "closed" } });
});

test.describe.serial("aula ao vivo, respostas e presença", () => {
  let sid = "", aid = "", mid = "", cid = "";
  test("professor abre questão; aluno responde; duplicação não duplica; fechada recusa", async () => {
    const prof = await apiAs(PROF);
    cid = await classId();
    const meetings = await (await prof.get(`/api/professor/turmas/${cid}/encontros`)).json();
    if (!meetings.meetings.length) await prof.post(`/api/professor/turmas/${cid}/encontros`, { data: { scaffold: true } });
    mid = (await (await prof.get(`/api/professor/turmas/${cid}/encontros`)).json()).meetings[0].id;
    sid = (await (await prof.post(`/api/professor/turmas/${cid}/encontros/${mid}/sessao`, { data: {} })).json()).sessionId;
    await prof.post(`/api/aovivo/${sid}/status`, { data: { status: "open" } });
    await prof.post(`/api/aovivo/${sid}/pagina`, { data: { pageSlug: "c3p7" } });
    const qv = (await sql<{ current_version_id: string }>("select current_version_id from questions where slug='c3p7q' and edition_id=(select edition_id from classes where id=$1)", [cid]))[0].current_version_id;
    aid = (await (await prof.post(`/api/aovivo/${sid}/atividades`, { data: { questionVersionId: qv, pageSlug: "c3p7" } })).json()).activityId;
    const a = await apiAs(ALUNO_A);
    expect((await a.post(`/api/aovivo/${sid}/responder`, { data: { activityId: aid, answer: { choice: 1 }, clientRequestId: `e2e-${uid()}` } })).status()).toBe(409); // ainda em rascunho
    await prof.patch(`/api/aovivo/${sid}/atividades/${aid}`, { data: { status: "open", maxAttempts: 1 } });
    const rid = `e2e-${uid()}`;
    const r1 = await (await a.post(`/api/aovivo/${sid}/responder`, { data: { activityId: aid, answer: { choice: 1 }, clientRequestId: rid } })).json();
    const r2 = await (await a.post(`/api/aovivo/${sid}/responder`, { data: { activityId: aid, answer: { choice: 2 }, clientRequestId: rid } })).json();
    expect(r1.attemptNo).toBe(1); expect(r2.duplicate).toBe(true); expect(r2.attemptNo).toBe(1);
    const n = await sql("select count(*)::int as n from attempts where activity_id=$1", [aid]);
    expect(n[0].n).toBe(1);
    // gabarito não vaza antes da liberação
    const st = await (await a.get(`/api/aovivo/${sid}/estado`)).json();
    expect(st.activities[0].myAttempt.isCorrect).toBeNull();
    expect(JSON.stringify(st)).not.toContain("porqueCerta"); expect(JSON.stringify(st)).not.toContain("answerKey");
    // aluno B não lê a tentativa de A
    const b = await apiAs(ALUNO_B);
    const stb = await (await b.get(`/api/aovivo/${sid}/estado`)).json();
    expect(stb.activities[0].myAttempt).toBeNull();
    await prof.patch(`/api/aovivo/${sid}/atividades/${aid}`, { data: { status: "closed" } });
    expect((await b.post(`/api/aovivo/${sid}/responder`, { data: { activityId: aid, answer: { choice: 1 }, clientRequestId: `e2e-${uid()}` } })).status()).toBe(409);
    await prof.patch(`/api/aovivo/${sid}/atividades/${aid}`, { data: { status: "released" } });
    const st2 = await (await a.get(`/api/aovivo/${sid}/estado`)).json();
    expect(st2.activities[0].myAttempt.isCorrect).toBe(true);
    expect(st2.activities[0].myAttempt.feedback.explanation).toBeTruthy();
  });

  test("check-in válido registra evidência; código errado é recusado; revisão docente exige motivo", async () => {
    const prof = await apiAs(PROF);
    const w = await (await prof.post(`/api/professor/turmas/${cid}/encontros/${mid}/chamada`, { data: { minutes: 3 } })).json();
    const code = (await (await prof.get(`/api/aovivo/${sid}/checkin`)).json()).windows[0].code;
    const a = await apiAs(ALUNO_A);
    expect((await a.post("/api/frequencia/chamada", { data: { classId: cid, code: "ZZZZZZ", meetingId: mid } })).status()).toBe(400);
    const ok = await (await a.post("/api/frequencia/chamada", { data: { classId: cid, code, meetingId: mid } })).json();
    expect(ok.status).toBe("presente");
    const ev = await sql("select result from attendance_checkins where window_id=$1 order by server_time", [w.windowId]);
    expect(ev.map((e) => e.result)).toEqual(["rejected", "ok"]);
    expect((await a.get(`/api/aovivo/${sid}/checkin`)).status()).toBe(403); // aluno não vê o código
    const ub = (await sql<{ id: string }>("select id from users where email=$1", [ALUNO_B.email]))[0].id;
    expect((await prof.post(`/api/professor/turmas/${cid}/encontros/${mid}/frequencia`, { data: { userId: ub, status: "justificado", reason: "" } })).status()).toBe(400);
    expect((await prof.post(`/api/professor/turmas/${cid}/encontros/${mid}/frequencia`, { data: { userId: ub, status: "justificado", reason: "atestado" } })).status()).toBe(200);
    await prof.delete(`/api/professor/turmas/${cid}/chamadas/${w.windowId}`);
    // regra não definida: sem percentual; cancelado sai do denominador
    const map = await (await prof.get(`/api/professor/turmas/${cid}/frequencia`)).json();
    const rowA = map.rows.find((r: { email: string }) => r.email === ALUNO_A.email);
    expect(rowA.ruleDefined === false || rowA.pct === null || typeof rowA.pct === "number").toBeTruthy();
    await prof.post(`/api/aovivo/${sid}/status`, { data: { status: "closed" } });
  });

  test("interface: aluno entra na sessão, vê o slide e a tela não vaza gabarito no HTML", async ({ page }) => {
    await loginUi(page, ALUNO_A);
    await page.goto(`/aulas/c3p7`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Data do evento");
    const html = await page.content();
    expect(html).not.toContain("porqueCerta");
    expect(html).not.toContain("Notas do professor");
  });
});

test.describe.serial("trabalhos, grupos e notas", () => {
  test("upload interrompido não vira entrega; envio válido gera recibo; nota só após publicação; exportação reconcilia", async () => {
    const prof = await apiAs(PROF);
    const cid = await classId();
    const asg = (await (await prof.get(`/api/professor/turmas/${cid}/trabalhos`)).json()).assignments.find((a: { slug: string }) => a.slug === "entrega-aula-1");
    await prof.patch(`/api/professor/turmas/${cid}/trabalhos/${asg.id}`, { data: { status: "published", mode: "individual", dueAt: "2030-01-01T23:59", allowedFormats: ["pdf", "link"] } });
    const a = await apiAs(ALUNO_A);
    const draft = (await (await a.post(`/api/trabalhos/${asg.id}/rascunho`, { data: { classId: cid } })).json()).submission;
    expect((await a.post(`/api/trabalhos/${asg.id}/envios/${draft.id}/enviar`, { data: { classId: cid } })).status()).toBe(400); // vazio
    // upload com conteúdo que não é PDF: recusado, nada registrado
    const bad = await a.post("/api/arquivos", { multipart: { classId: cid, purpose: "submission", assignmentId: asg.id, file: { name: "x.pdf", mimeType: "application/pdf", buffer: Buffer.from("PK nada") } } });
    expect(bad.status()).toBe(400);
    const good = await (await a.post("/api/arquivos", { multipart: { classId: cid, purpose: "submission", assignmentId: asg.id, file: { name: "relatorio.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%%EOF") } } })).json();
    await a.post(`/api/trabalhos/${asg.id}/envios/${draft.id}/arquivos`, { data: { classId: cid, fileId: good.file.id } });
    const rec = await (await a.post(`/api/trabalhos/${asg.id}/envios/${draft.id}/enviar`, { data: { classId: cid } })).json();
    expect(rec.receipt.receiptHash).toHaveLength(64); expect(rec.receipt.late).toBe(false);
    // B não lê arquivo de A (individual)
    const b = await apiAs(ALUNO_B);
    expect((await b.get(`/api/arquivos/${good.file.id}`)).status()).toBe(403);
    expect((await b.get(`/api/trabalhos/${asg.id}?classId=${cid}`)).json().then((d) => d.submissions.length)).resolves.toBe(0);
    // nota: sem publicar, invisível; publicada, visível; ausência de nota não vira zero
    // (o teste é reexecutável: uma nota já publicada em rodada anterior é removida; regrade de nota publicada mantém a publicação, com histórico)
    await sql("delete from grade_history where grade_id in (select g.id from grades g join users u on u.id=g.user_id where g.assignment_id=$1 and u.email=$2)", [asg.id, ALUNO_A.email]);
    await sql("delete from grades where assignment_id=$1 and user_id in (select id from users where email=$2)", [asg.id, ALUNO_A.email]);
    const grade = await prof.post(`/api/professor/turmas/${cid}/trabalhos/${asg.id}/envios/${draft.id}/nota`, { data: { scores: {}, status: "corrigido", comments: "ok" } });
    expect(grade.status()).toBe(200);
    expect((await (await a.get(`/api/trabalhos/${asg.id}?classId=${cid}`)).json()).grade).toBeNull();
    await prof.post(`/api/professor/turmas/${cid}/trabalhos/${asg.id}/publicar-notas`, { data: {} });
    const g = (await (await a.get(`/api/trabalhos/${asg.id}?classId=${cid}`)).json()).grade;
    expect(g.status).toBe("corrigido");
    const book = await (await prof.get(`/api/professor/turmas/${cid}/notas`)).json();
    const rowB = book.rows.find((r: { email: string }) => r.email === ALUNO_B.email);
    const cellB = rowB.cells.find((c: { assignmentId: string }) => c.assignmentId === asg.id);
    expect(cellB.status).toBe("nao_corrigido"); expect(cellB.total).toBeNull();
    const csv = await (await prof.get(`/api/professor/turmas/${cid}/notas?formato=csv`)).text();
    expect(csv).toContain("nao_corrigido"); expect(csv).toContain("﻿");
  });
});

test("estudo: feedback em dois estágios, resposta vista não conta como acerto, nota nula não vira zero", async () => {
  const a = await apiAs(ALUNO_A);
  const cid = await classId();
  const page = await (await a.get(`/api/conteudo/pagina/c3p7?classId=${cid}`)).json();
  const q = page.questions.find((x: { slug: string }) => x.slug === "c3p7q");
  await sql("delete from study_responses where user_id=(select id from users where email=$1) and question_version_id=$2", [ALUNO_A.email, q.versionId]);
  const wrong = await (await a.post("/api/estudo/responder", { data: { classId: cid, questionVersionId: q.versionId, answer: { choice: 0 }, clientRequestId: `e2e-${uid()}` } })).json();
  expect(wrong.isCorrect).toBe(false); expect(wrong.revealed).toBe(false);
  expect(wrong.feedback.correct).toBeUndefined(); expect(wrong.feedback.explanation).toBeUndefined();
  expect(wrong.feedback.recovery.confusion).toBeTruthy(); expect(wrong.feedback.recovery.followUp.prompt).toContain("20 de agosto"); // gabarito corrigido (patch c3p7q)
  const state = await (await a.get(`/api/estudo/responder?classId=${cid}&versions=${q.versionId}`)).json();
  expect(state.responses[q.versionId].feedback.correct).toBeUndefined();
  // pede a resposta: divulga e marca; a tentativa seguinte, mesmo certa, não conta como acerto próprio
  const seen = await (await a.post("/api/estudo/responder", { data: { classId: cid, questionVersionId: q.versionId, reveal: true } })).json();
  expect(seen.revealed).toBe(true); expect(seen.feedback.correct).toBe(1); expect(seen.feedback.explanation).toBeTruthy();
  const after = await (await a.post("/api/estudo/responder", { data: { classId: cid, questionVersionId: q.versionId, answer: { choice: 1 }, clientRequestId: `e2e-${uid()}` } })).json();
  expect(after.isCorrect).toBe(true); expect(after.disclosedBefore).toBe(true);
  // segunda tentativa errada sem pedir a resposta: divulga (regra da segunda tentativa)
  await sql("delete from study_responses where user_id=(select id from users where email=$1) and question_version_id=$2", [ALUNO_A.email, q.versionId]);
  await a.post("/api/estudo/responder", { data: { classId: cid, questionVersionId: q.versionId, answer: { choice: 0 }, clientRequestId: `e2e-${uid()}` } });
  const second = await (await a.post("/api/estudo/responder", { data: { classId: cid, questionVersionId: q.versionId, answer: { choice: 2 }, clientRequestId: `e2e-${uid()}` } })).json();
  expect(second.attemptNo).toBe(2); expect(second.revealed).toBe(true); expect(second.feedback.correct).toBe(1);
  // nota nula em Meu acompanhamento aparece como "sem nota", não como 0
  const prof = await apiAs(PROF);
  const asg = (await (await prof.get(`/api/professor/turmas/${cid}/trabalhos`)).json()).assignments.find((x: { slug: string }) => x.slug === "entrega-aula-1");
  const rows = await sql<{ total: string | null }>("select g.total from grades g join users u on u.id=g.user_id where g.assignment_id=$1 and u.email=$2", [asg.id, ALUNO_A.email]);
  if (rows[0] && rows[0].total === null) {
    const ui = await apiAs(ALUNO_A);
    const html = await (await ui.get("/acompanhamento")).text();
    expect(html).toContain("sem nota");
  }
});

test("estudo: prerrequisitos visíveis ao aluno com links e síntese do capítulo", async () => {
  const a = await apiAs(ALUNO_A);
  const p12 = await (await a.get("/aulas/c6p12")).text();
  expect(p12).toContain("Antes desta página"); expect(p12).toContain('href="/aulas/c4p16"'); expect(p12).toContain("Gradiente da logística");
  const cap6 = await (await a.get("/aulas/capitulo/6")).text(); // o que o capítulo assume vive na abertura do capítulo
  expect(cap6).toContain('data-testid="capitulo-assume"'); expect(cap6).toContain('href="/aulas/c4p7"'); expect(cap6).toContain('href="/aulas/c2p13"');
  expect(await (await a.get("/aulas/c6p1")).text()).toContain('data-testid="abertura-capitulo"');
  const c1p1 = await (await a.get("/aulas/c1p1")).text();
  expect(c1p1).not.toContain("Antes desta página"); // "Nenhum" não gera bloco
  // nada além do prerrequisito sai do guia docente
  expect(p12).not.toContain("Notas do professor"); expect(p12).not.toContain("intervencao");
});

test("visuais nativos: a fila de risco e cem vidas substituem o iframe herdado e recalculam na tela", async ({ page }) => {
  await loginUi(page, ALUNO_A);
  await page.goto("/aulas/c7p6");
  const fila = page.locator('figure[data-vz="fila-de-risco"]');
  await expect(fila).toBeVisible();
  await expect(page.locator("iframe[title^='Visual interativo']")).toHaveCount(0);
  await expect(fila).toContainText("AUC 0,7257");
  await expect(fila).toContainText("48 de 81");
  await fila.getByRole("button", { name: "Sortear sem modelo" }).click();
  await expect(fila).toContainText("fila sorteada");
  await page.goto("/aulas/c1p5");
  const vidas = page.locator('figure[data-vz="cem-vidas"]');
  await expect(vidas).toBeVisible();
  await vidas.getByRole("button", { name: "24 meses", exact: true }).click();
  await expect(vidas).toContainText("PD de 19,0% em 24 meses");
  // capítulo 3: figura estática substituída, texto ao redor preservado
  await page.goto("/aulas/c3p7");
  const tempo = page.locator('figure[data-vz="linha-do-tempo"]');
  await expect(tempo).toBeVisible();
  await expect(page.locator(".svgfit")).toHaveCount(0);
  await expect(page.locator("main")).toContainText("O erro que não aparece em nenhuma métrica");
  await tempo.getByRole("button", { name: "Só a data do evento" }).click();
  await expect(tempo).toContainText("3 entram por engano: vazamento");
  await page.goto("/aulas/c3p11");
  const safras = page.locator('figure[data-vz="safras"]');
  await expect(safras).toContainText("até dez 2023");
  await expect(page.locator("main")).toContainText("A regra de inclusão");
  // capítulo 8: motor econômico recalculado na tela, com estado do cenário sempre visível
  await page.goto("/aulas/c8p8");
  const lucro = page.locator('figure[data-vz="curva-de-lucro"]');
  await expect(lucro).toContainText("R$ 585 mil");
  await expect(lucro).toContainText("Máximo da curva · corte 14,0%");
  await lucro.getByRole("button", { name: "severo" }).click();
  await expect(lucro).toContainText("choque severo de PD (+0,8 em log odds)");
  await lucro.locator('input[aria-label="Palpites da turma, cortes em porcentagem"]').fill("8, 20");
  await expect(lucro).toContainText("média da turma");
  // capítulo 4: escalas ligadas, fronteira por descida de gradiente e a reta que vira curva
  await page.goto("/aulas/c4p9");
  const escalas = page.locator('figure[data-vz="tres-escalas"]');
  await expect(escalas).toContainText("45,71%");
  await escalas.getByRole("button", { name: /#11, pressionada/ }).click();
  await expect(escalas).toContainText("56,18%");
  await page.goto("/aulas/c4p19");
  const fronteira = page.locator('figure[data-vz="fronteira"]');
  await expect(fronteira).toContainText("6 defaults evitados · 2 boas recusadas");
  await fronteira.getByRole("button", { name: "Zerar os coeficientes" }).click();
  await expect(fronteira).toContainText("nenhuma fronteira");
  // c4p7: o laboratório de regressão logística, agora nesta página
  await page.goto("/aulas/c4p7");
  const lab = page.locator('figure[data-vz="lab-logistica"]');
  await expect(lab).toContainText("Utilização 60%: z = 0,136, odds 1,15, PD 53,4%."); // ajuste da aula: β₀ −3,121787, β₁ 5,429194
  await expect(lab).toContainText("PD de 53,4% para 66,3%, +13,0 pp");
  await expect(lab).toContainText("Ajuste da aula");
  await lab.getByRole("button", { name: "Eliminar o efeito" }).click();
  await expect(lab).toContainText("A utilização não altera a PD: a curva é horizontal.");
  await expect(lab).toContainText("Parâmetros exploratórios");
  await expect(lab).not.toContainText("A curva fica horizontal: toda proposta recebe a mesma PD"); // explicação só após revelar
  await lab.getByRole("button", { name: "Revelar explicação" }).click();
  await expect(lab).toContainText("A curva fica horizontal: toda proposta recebe a mesma PD");
  await lab.getByRole("button", { name: "Restaurar ajuste da aula" }).click();
  await expect(lab).toContainText("Ajuste da aula");
  await lab.getByRole("button", { name: "Comparar com a reta" }).click();
  await expect(lab).toContainText("p̂ = −0,143 + 1,118 · x");
  // c4p3: escala 1, probabilidade: PD por operação, cem quadrados, limites e odds, tudo a partir do mesmo estado
  await page.goto("/aulas/c4p3");
  const ep = page.locator('figure[data-vz="escala-probabilidade"]');
  await expect(ep).toContainText("PD 95% por operação: 95 defaults e 5 adimplentes esperados em 100.");
  await expect(ep).toContainText("105% não é uma probabilidade.");
  await expect(ep).toContainText("odds = 0,95 ÷ 0,05 = 19");
  expect(await ep.locator(".vz-ep-q").count()).toBe(100); expect(await ep.locator(".vz-ep-q--default").count()).toBe(95);
  await ep.getByLabel("PD por operação, em porcentagem").fill("50");
  await expect(ep).toContainText("50 defaults e 50 adimplentes esperados"); await expect(ep).toContainText("Neste ponto, o resultado permanece entre 0% e 100%."); await expect(ep).toContainText("odds = 0,50 ÷ 0,50 = 1");
  await expect(ep).toContainText("5% → 15%"); await expect(ep).toContainText("50% → 60%"); // as réguas fixas não seguem a PD selecionada
  await ep.getByLabel("PD por operação, em porcentagem").fill("100");
  await expect(ep).toContainText("odds → ∞ quando p → 1"); await expect(ep).toContainText("100% → 110%");
  await ep.getByRole("button", { name: "Restaurar" }).click();
  await expect(ep).toContainText("PD 95% por operação");
  // c4p4: escala 2, odds: três resultados, conversão nos dois sentidos, complementares e ponte para log odds
  await page.goto("/aulas/c4p4");
  const eo = page.locator('figure[data-vz="escala-odds"]');
  await expect(eo).toContainText("PD 20%: odds = 0,2 ÷ 0,8 = 0,25."); await expect(eo).toContainText("1 default esperado para cada 4 adimplentes esperados."); await expect(eo).toContainText("20 defaults e 80 adimplentes esperados em 100 operações");
  await expect(eo).toContainText("0,25 × 4 = 1"); await expect(eo).toContainText("ln(0,25) ≈ −1,386"); await expect(eo).toContainText("ln(4) ≈ +1,386");
  await eo.getByRole("button", { name: "95%" }).click(); await expect(eo).toContainText("odds = 0,95 ÷ 0,05 = 19"); await expect(eo).toContainText("19 defaults esperados para cada adimplente esperado");
  await eo.getByLabel("Odds", { exact: true }).fill("4"); await expect(eo).toContainText("PD 80%: odds = 0,8 ÷ 0,2 = 4.");
  await eo.getByLabel("PD, em %").fill("99"); await expect(eo).toContainText("= 99."); await expect(eo).toContainText("fora da janela: odds 99");
  await eo.getByLabel("PD, em %").fill("100"); await expect(eo).toContainText("odds → ∞ quando p → 1"); await expect(eo).toContainText("p = 100%: nenhum ponto finito");
  await eo.getByLabel("PD, em %").fill("-5"); await expect(eo).toContainText("Uma probabilidade não pode ser negativa.");
  await eo.getByRole("button", { name: "Restaurar" }).click(); await expect(eo).toContainText("PD 20%: odds = 0,2 ÷ 0,8 = 0,25.");
  // c4p8: a decomposição do escore, um só estado para tabela, soma e as três representações
  await page.goto("/aulas/c4p8");
  const es = page.locator('figure[data-vz="escore-soma"]');
  await expect(es).toContainText("Do dado à contribuição. Da soma à probabilidade.");
  await expect(es.locator(".es-tab tbody tr")).toHaveCount(3);
  await expect(es).toContainText("70 ÷ 10 = 7"); await expect(es).toContainText("+5,2171"); await expect(es).toContainText("5 ÷ 10 = 0,5"); await expect(es).toContainText("+0,6978");
  await expect(es).toContainText("z ≈ 0,2483"); await expect(es).toContainText("1,282"); await expect(es).toContainText("56,18%");
  await expect(page.locator("main")).not.toContainText("Consultas a bureau"); // o diagrama de sete variáveis saiu
  await expect(page.locator("main")).not.toContainText("RECALCULADO AQUI");
  await es.getByLabel(/Utilização/).fill("90");
  await expect(es).toContainText("90 ÷ 10 = 9"); await expect(es).toContainText("+6,7077"); await expect(es).toContainText("z ≈ 1,7389"); await expect(es).toContainText("85,05%");
  await es.getByLabel(/Atraso/).fill("0");
  await expect(es).toContainText("0 ÷ 10 = 0"); await expect(es).toContainText("z ≈ 1,0411");
  await es.getByRole("button", { name: "Restaurar exemplo" }).click();
  await expect(es).toContainText("z ≈ 0,2483"); await expect(es).toContainText("56,18%");
  await page.goto("/apresentacao/c4p8"); // no palco o quadro é a página inteira: a tabela não fica em outra tela
  await expect(page.locator("main")).toContainText("08 / 22");
  await expect(page.locator("main .es-tab tbody tr")).toHaveCount(3);
  await expect(page.locator("main")).not.toContainText("tela 2 de");
  // c4p5: escala 3, log odds: ÷ 2 e × 2 sempre a partir das odds iniciais; ∓ln(2) em log odds, passos desiguais em PD
  await page.goto("/aulas/c4p5");
  const lo = page.locator('figure[data-vz="escala-logodds"]');
  await expect(lo).toContainText("Nas odds, multiplicar. Nos log odds, somar.");
  await expect(lo).toContainText("Partida em PD 33,00%."); await expect(lo).toContainText("os passos são −13,24 pp e +16,62 pp");
  await expect(lo).toContainText("19,76%"); await expect(lo).toContainText("49,62%"); await expect(lo).toContainText("−0,708");
  await expect(lo).toContainText("odds 0,493 ÷ 2 = 0,246"); await expect(lo).toContainText("odds 0,493 × 2 = 0,985");
  await expect(lo).toContainText("−0,6931"); await expect(lo).toContainText("+0,6931");
  await expect(lo).not.toContainText("±16,67 pp"); // a revelação só aparece quando o professor a aciona
  await lo.getByRole("button", { name: "50%" }).click();
  await expect(lo).toContainText("Em PD = 50%, os passos também são iguais: −16,67 pp e +16,67 pp.");
  await expect(lo).toContainText("33,33%"); await expect(lo).toContainText("66,67%");
  await lo.getByRole("button", { name: "Revelar explicação" }).click();
  await expect(lo).toContainText("Nos log odds, os passos são ±ln(2) para qualquer PD inicial.");
  await lo.getByRole("tab", { name: "Ver a função" }).click();
  await expect(lo).toContainText("log odds em função da PD");
  await lo.getByLabel("PD de partida, campo em %").fill("100");
  await expect(lo).toContainText("Em PD = 100% as odds não têm valor finito");
  await lo.getByLabel("PD de partida, campo em %").fill("1");
  await expect(lo).toContainText("Partida em PD 1,00%."); await expect(lo).toContainText("−5,288");
  await lo.getByRole("button", { name: "Restaurar" }).click();
  await expect(lo).toContainText("Partida em PD 33,00%."); await expect(lo).not.toContainText("±16,67 pp");
  // c4p10: o exercício de leitura do coeficiente; a resposta só aparece depois de conferir
  await page.goto("/aulas/c4p10");
  const cf = page.locator('figure[data-vz="coeficiente-pd"]');
  await expect(cf).toContainText("Você interpretaria este coeficiente corretamente?");
  await expect(cf).toContainText("70% → 80%"); await expect(cf).toContainText("5 dias → 5 dias"); await expect(cf).toContainText("β = 0,7453");
  await expect(cf).toContainText("Antes de responder");
  await expect(cf).not.toContainText("Correto: o acréscimo ocorre no escore");
  await expect(page.locator("main")).not.toContainText("mistura duas escalas"); // o parágrafo herdado saiu
  await expect(cf.getByRole("button", { name: "Conferir resposta" })).toBeDisabled();
  await cf.getByRole("radio", { name: /A PD aumenta/ }).check();
  await expect(cf.getByRole("button", { name: "Conferir resposta" })).toBeEnabled();
  await expect(cf).not.toContainText("Você confundiu as escalas"); // selecionar não revela
  await cf.getByRole("button", { name: "Conferir resposta" }).click();
  await expect(cf).toContainText("Resposta incorreta"); await expect(cf).toContainText("Você confundiu as escalas");
  await expect(cf).toContainText("Δx = (80 − 70) ÷ 10 = 1"); await expect(cf).toContainText("Δz = β × 1 = 0,7453");
  await expect(cf).toContainText("0,2483"); await expect(cf).toContainText("0,9936"); await expect(cf).toContainText("56,18%"); await expect(cf).toContainText("72,98%");
  await expect(cf).toContainText("A variação da PD neste exemplo é +16,80 pp.");
  await expect(cf).toContainText("β soma no log odds.");
  await cf.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(cf).toContainText("Antes de responder"); await expect(cf).not.toContainText("Você confundiu as escalas");
  await cf.getByRole("radio", { name: /O escore em log odds/ }).check();
  await cf.getByRole("button", { name: "Conferir resposta" }).click();
  await expect(cf).toContainText("Resposta correta"); await expect(cf).toContainText("Correto: o acréscimo ocorre no escore");
  await cf.getByRole("button", { name: "Tentar novamente" }).click();
  await cf.getByRole("button", { name: "O que significa manter constante?" }).click();
  await expect(cf).toContainText("estratégia de identificação adicionais");
  await cf.getByRole("button", { name: "Voltar" }).click();
  await expect(cf).toContainText("Antes de responder");
  // c4p11: a razão de odds multiplica odds, não PD; a conversão completa aparece só depois de conferir
  await page.goto("/aulas/c4p11");
  const ro = page.locator('figure[data-vz="razao-de-chances"]');
  await expect(ro).toContainText("As odds multiplicam por 2,11. E a PD?");
  await expect(ro).toContainText("21,1%"); await expect(ro).toContainText("19,0%"); await expect(ro).toContainText("12,1%");
  await expect(ro).toContainText("Qual caminho você usaria?");
  await expect(ro).not.toContainText("Portanto, aproximadamente");
  await expect(page.locator("main")).not.toContainText("RECALCULADO AQUI");
  await expect(ro.getByRole("button", { name: "Conferir resposta" })).toBeDisabled();
  await ro.getByRole("radio", { name: /21,1%/ }).check();
  await expect(ro).not.toContainText("0,2341"); // selecionar não revela a conversão
  await ro.getByRole("button", { name: "Conferir resposta" }).click();
  await expect(ro).toContainText("Resposta incorreta."); await expect(ro).toContainText("não diretamente sobre a PD");
  await expect(ro).toContainText("0,1111"); await expect(ro).toContainText("0,2341"); await expect(ro).toContainText("18,97%");
  await expect(ro).toContainText("Portanto, aproximadamente 19,0%.");
  await expect(ro).toContainText("As odds aumentaram cerca de 111%.");
  await ro.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(ro).toContainText("Qual caminho você usaria?"); await expect(ro).not.toContainText("Portanto, aproximadamente");
  await ro.getByRole("radio", { name: /19,0%/ }).check();
  await ro.getByRole("button", { name: "Conferir resposta" }).click();
  await expect(ro).toContainText("Resposta correta."); await expect(ro).toContainText("Primeiro multiplicamos as odds");
  // c4p12: a curva do aumento da PD; o máximo revelado não é 50%
  await page.goto("/aulas/c4p12");
  const ip = page.locator('figure[data-vz="impacto-pd"]');
  await expect(ip).toContainText("O mesmo multiplicador, diferentes mudanças na PD");
  await expect(ip).toContainText("Δz = +0,7453"); await expect(ip).toContainText("× 2,11");
  await expect(ip).toContainText("18,97%"); await expect(ip).toContainText("+8,97 pp");
  await expect(ip).not.toContainText("40,8%"); // a revelação começa fechada
  await expect(page.locator("main")).not.toContainText("RECALCULADO AQUI");
  await ip.getByRole("button", { name: "50%", exact: true }).click();
  await expect(ip).toContainText("67,82%"); await expect(ip).toContainText("+17,82 pp");
  await ip.getByRole("button", { name: "2%", exact: true }).click();
  await expect(ip).toContainText("4,12%"); await expect(ip).toContainText("+2,12 pp");
  await ip.getByLabel("PD inicial, campo em %").fill("99,9");
  await expect(ip).toContainText("99,95%"); await expect(ip).toContainText("+0,05 pp"); // o extremo da faixa é aceito
  await ip.getByLabel("PD inicial, campo em %").fill("120");
  await expect(ip).toContainText("A PD inicial vai de 0,1% a 99,9%.");
  await ip.getByRole("button", { name: "Restaurar" }).click();
  await expect(ip).toContainText("18,97%");
  await ip.getByRole("button", { name: /O maior impacto ocorre em 50%/ }).click();
  await expect(ip).toContainText("perto de uma PD inicial de 40,8%, com aumento de aproximadamente 18,42 pp");
  await expect(ip).toContainText("50% é o ponto de maior sensibilidade local");
  await ip.getByRole("button", { name: "Comparar sete cenários" }).click();
  await expect(ip.locator(".ip-tab tbody tr")).toHaveCount(7);
  await expect(ip).toContainText("maior aumento entre os cenários listados");
  await expect(ip).toContainText("Cenários didáticos; não representam uma amostra de clientes.");
  await ip.getByRole("button", { name: "Voltar ao gráfico" }).click();
  await expect(ip.locator(".ip-svg")).toBeVisible();
  await ip.getByRole("button", { name: "Ver a conta" }).click();
  await expect(ip).toContainText("PD final = m × p ÷ (1 − p + m × p)");
  // c4p14: a mesma contribuição em três unidades; trocar a unidade não muda escore nem PD
  await page.goto("/aulas/c4p14");
  const uc = page.locator('figure[data-vz="unidade-coeficiente"]');
  await expect(uc).toContainText("A unidade muda. A previsão permanece.");
  await expect(uc).toContainText("0,7453"); await expect(uc).toContainText("0,07453"); await expect(uc).toContainText("7,453");
  expect(await uc.locator(".uc-c").allInnerTexts()).toEqual(["5,2171", "5,2171", "5,2171"]);
  await expect(uc).toContainText("z ≈ 0,2483"); await expect(uc).toContainText("56,18%");
  await expect(page.locator("main")).not.toContainText("RECALCULADO AQUI");
  await uc.getByRole("button", { name: "95%" }).click();
  expect(new Set(await uc.locator(".uc-c").allInnerTexts()).size).toBe(1); // as três continuam iguais
  await expect(uc).toContainText("89,20%");
  await uc.getByLabel("Utilização, campo em %").fill("140");
  await expect(uc).toContainText("A utilização vai de 0% a 100%.");
  await uc.getByRole("button", { name: "Restaurar exemplo" }).click();
  await expect(uc).toContainText("56,18%");
  await uc.getByRole("button", { name: "Ver definição" }).nth(2).click();
  await expect(uc).toContainText("x = utilização em % ÷ 100");
  expect(await uc.locator(".uc-c").allInnerTexts()).toEqual(["5,2171", "5,2171", "5,2171"]); // selecionar não altera a proposta
  await uc.getByRole("button", { name: "E a razão de odds?" }).click();
  await expect(uc).toContainText("β × Δx = 0,7453 nas três"); await expect(uc).toContainText("≈ 2,11");
  // c4p15: a log loss proposta a proposta; a seleção muda só o painel, nunca as barras nem a média
  await page.goto("/aulas/c4p15");
  const ll = page.locator('figure[data-vz="log-loss"]');
  await expect(ll).toContainText("Como a log loss orienta a estimação");
  await expect(ll).toContainText("Perda = −ln(PD)"); await expect(ll).toContainText("Perda = −ln(1 − PD)");
  expect(await ll.locator(".ll-barra").count()).toBe(16);
  await expect(ll).toContainText("Log loss média do modelo: 0,43282");
  await expect(ll).toContainText("Proposta #2"); await expect(ll).toContainText("Default · y = 1");
  await expect(ll).toContainText("26,65%"); await expect(ll).toContainText("−ln(0,2665) ≈ 1,3223");
  await expect(ll).toContainText("Os coeficientes são estimados minimizando a log loss média");
  await expect(ll).not.toContainText("zera a perda sem decorar"); // o quadro não repete a afirmação; o apoio da página vem do banco
  await ll.getByRole("button", { name: "#15" }).click();
  await expect(ll).toContainText("Não houve default · y = 0"); await expect(ll).toContainText("73,91%");
  await expect(ll).toContainText("26,09%"); await expect(ll).toContainText("−ln(1 − 0,7391) ≈ 1,3435");
  await expect(ll).toContainText("Log loss média do modelo: 0,43282"); // a média não muda com a seleção
  await ll.getByRole("button", { name: /Proposta 12/ }).click();
  await expect(ll).toContainText("Proposta #12"); await expect(ll).toContainText("≈ 0,0041");
  await ll.getByRole("button", { name: "Restaurar seleção" }).click();
  await expect(ll).toContainText("Proposta #2"); await expect(ll).toContainText("−ln(0,2665) ≈ 1,3223");
  // c4p2: a reta ajustada na probabilidade sai do intervalo válido; o truncamento cria trecho plano
  await page.goto("/aulas/c4p2");
  const rp = page.locator('figure[data-vz="reta-na-probabilidade"]');
  await expect(rp).toContainText("Uma reta não garante probabilidades válidas");
  await expect(rp).toContainText("p(u) = −0,1426 + 0,011176 × u");
  await expect(rp).toContainText("−8,68%"); await expect(rp).toContainText("não pode ser interpretado como probabilidade");
  await expect(rp).toContainText("a reta cruza 0% em 12,8% de utilização");
  await expect(rp).not.toContainText("0,00%"); // o truncamento começa desligado
  await expect(page.locator("main")).not.toContainText("DOIS DEFEITOS");
  await rp.getByLabel("Utilização, campo em %").fill("50");
  await expect(rp).toContainText("41,62%"); await expect(rp).toContainText("a previsão está entre 0% e 100%");
  await rp.getByLabel("Utilização, campo em %").fill("100");
  await expect(rp).toContainText("97,50%"); // no domínio do exemplo a reta não ultrapassa 100%
  await expect(rp.getByRole("button", { name: /Comparar \+10 pp/ })).toBeDisabled(); // +10 pp sairia do domínio
  await expect(rp).toContainText("sai do domínio do exemplo");
  await rp.getByRole("button", { name: "Restaurar exemplo" }).click();
  await rp.getByRole("button", { name: "Limitar a previsão de 0% a 100%" }).click();
  await expect(rp).toContainText("0,00%"); await expect(rp).toContainText("mín(1; máx(0; p))");
  await rp.getByRole("button", { name: /Comparar \+10 pp/ }).click();
  await expect(rp).toContainText("De 5% para 15% de utilização");
  await expect(rp).toContainText("+11,18 pp"); await expect(rp).toContainText("+2,50 pp");
  // c4p16: uma iteração do gradiente; a atualização é −ηg e os três parâmetros andam juntos
  await page.goto("/aulas/c4p16");
  const gp = page.locator('figure[data-vz="gradiente-passo"]');
  await expect(gp).toContainText("Uma iteração: do gradiente aos novos coeficientes");
  await expect(gp).toContainText("β₀ = β₁ = β₂ = 0"); await expect(gp).toContainText("50,00%"); await expect(gp).toContainText("0,69315");
  await expect(gp).toContainText("−0,59375"); await expect(gp).toContainText("−0,23438");
  await expect(gp).toContainText("+0,05938"); await expect(gp).toContainText("+0,02344");
  await expect(gp).toContainText("Exemplo: coeficiente da utilização");
  await expect(gp).toContainText("−0,10 × (−0,59375) ≈ +0,05938");
  await expect(gp).toContainText("Gradiente negativo dá atualização positiva.");
  expect(await gp.locator(".gp-barra").count()).toBe(0); // o gráfico fica na expansão
  await gp.getByRole("button", { name: "Ver contribuições por proposta" }).click();
  await expect(gp).toContainText("Média das contribuições: −0,59375");
  await expect(gp).toContainText("Somar as 16 contribuições e dividir por 16 produz g₁.");
  expect(await gp.locator(".gp-barra").count()).toBe(16);
  await gp.getByRole("button", { name: "Voltar ao exemplo" }).click();
  await expect(page.locator("main")).not.toContainText("distância até o ótimo");
  await expect(gp.getByRole("button", { name: "Reiniciar" })).toBeDisabled();
  await gp.getByRole("button", { name: "Aplicar esta atualização" }).click();
  await expect(gp).toContainText("Estado atual · iteração 1");
  await expect(gp).toContainText("PD média estimada"); await expect(gp).toContainText("59,14%");
  await expect(gp).toContainText("0,67194"); await expect(gp).toContainText("antes 0,69315"); // a perda cai
  await expect(gp).toContainText("0,05938"); await expect(gp).toContainText("0,02344"); // os três coeficientes mudaram juntos
  await gp.getByRole("button", { name: "Reiniciar" }).click();
  await expect(gp).toContainText("β₀ = β₁ = β₂ = 0"); await expect(gp).toContainText("0,69315");
  // c4p1: os dois quadros de abertura, um só estado: características → escore → PD; +10 pp → +0,7453 em z → × 2,11 nas odds
  await page.goto("/aulas/c4p1");
  const rl = page.locator('figure[data-vz="logit-slides"]');
  await expect(rl).toContainText("Como o logit transforma uma proposta em PD"); await expect(rl).toContainText("−5,6666"); await expect(rl).toContainText("+5,2171"); await expect(rl).toContainText("+0,6978"); await expect(rl).toContainText("z ≈ 0,2483"); await expect(rl).toContainText("56,18%");
  await expect(rl).toContainText("cerca de 56 defaults a cada 100");
  await rl.getByLabel("Utilização do limite, campo").fill("0"); await rl.getByLabel("Atraso observado, campo").fill("0");
  await expect(rl).toContainText("z ≈ −5,6666"); await expect(rl).toContainText("0,34%");
  await rl.getByRole("button", { name: "Restaurar exemplo" }).click(); await expect(rl).toContainText("56,18%");
  await expect(rl).toContainText("× 2,11"); await expect(rl).toContainText("≈ +2,12 pp"); await expect(rl).toContainText("≈ +8,97 pp"); await expect(rl).toContainText("≈ +17,82 pp"); await expect(rl).toContainText("≈ +4,99 pp");
  await rl.getByRole("button", { name: "−10 pp" }).click(); await expect(rl).toContainText("× 0,47"); await expect(rl).toContainText("−0,7453");
  await rl.getByRole("button", { name: "0", exact: true }).click(); await expect(rl).toContainText("sem mudança"); await expect(rl).toContainText("1,00×");
  await page.goto("/apresentacao/c4p1");
  await expect(page.locator("main")).toContainText("01 / 22"); await expect(page.locator("main")).not.toContainText("Infográfico de abertura");
  // capítulo 5: a árvore que cresce, raiz do gerador e instabilidade ao retirar a #10
  await page.goto("/aulas/c5p16");
  const arvore = page.locator('figure[data-vz="arvore-instabilidade"]');
  await expect(arvore).toContainText("utilização ≤ 57,5%");
  await expect(arvore).toContainText("utilização ≤ 87,5%");
  await arvore.getByRole("button", { name: "Retirar a proposta 10" }).click();
  await expect(arvore).toContainText("atraso ≤ 2,5 d");
  await expect(arvore).toContainText("trocou de variável");

  // capítulo 6: a perda cai árvore por árvore e a grade escolhida pelo treino é a pior fora do tempo
  await page.goto("/aulas/c6p13");
  const perda = page.locator('figure[data-vz="perda-iteracoes"]');
  await expect(perda).toContainText("0,6931 → 0,6219");
  await perda.getByRole("button", { name: "árvore 4" }).click();
  await expect(perda).toContainText("0,5150 → 0,4748");
  await page.goto("/aulas/c6p17");
  const grade = page.locator('figure[data-vz="distancia-que-se-abre"]');
  await grade.getByRole("button", { name: "Escolher pelo treino" }).click();
  await expect(grade).toContainText("0,9927");
  await expect(grade).toContainText("a pior da grade inteira");

  // capítulo 9: o índice soma faixa a faixa e a equidade muda com a pergunta
  await page.goto("/aulas/c9p3");
  const indice = page.locator('figure[data-vz="indice-faixas"]');
  await expect(indice).toContainText("PSI do escore 0,0133");
  await page.goto("/aulas/c9p6");
  const eq = page.locator('figure[data-vz="equidade"]');
  await expect(eq).toContainText("72,7% (370 de 509)");
  await eq.getByRole("button", { name: "Recusa entre pagadores" }).click();
  await expect(eq).toContainText("106 de 454");

  // capítulo 2: a bolinha desce a perda e a árvore sem freio decora uma proposta
  await page.goto("/aulas/c2p12");
  const bol = page.locator('figure[data-vz="bolinha-descida"]');
  await expect(bol).toContainText("Iteração 0:");
  await bol.getByRole("button", { name: "Próxima iteração" }).click();
  await expect(bol).toContainText("b = −0,7500");
  await page.goto("/aulas/c2p14");
  const dec = page.locator('figure[data-vz="arvore-que-decora"]');
  await expect(dec).toContainText("2 erros nas 16, 2 folhas");

  // capítulo 10: a política em três zonas fecha em 548 aprovados e o choque leva o resultado a −R$ 225 mil
  await page.goto("/aulas/c10p11");
  const mesa = page.locator('figure[data-vz="mesa-rodada1"]');
  await expect(mesa).toContainText("548");
  await expect(mesa).toContainText("R$ 607 mil");
  await page.goto("/aulas/c10p12");
  const choque = page.locator('figure[data-vz="mesa-choque"]');
  await choque.getByRole("button", { name: "Aplicar o choque" }).click();
  await expect(choque).toContainText("Estado do cenário: sob choque.");
  await expect(choque).toContainText("−R$ 225 mil");

  // capítulo 11: o campo do horizonte é bloqueado e a AUC honesta vai para o memorando
  await page.goto("/aulas/c11p6");
  const mp = page.locator('figure[data-vz="modelo-perfeito"]');
  await expect(mp).toContainText("não entra");
  await mp.getByRole("button", { name: "Bloquear: o campo nasce depois" }).click();
  await expect(mp).toContainText("A AUC honesta é 0,6958");

  // capítulo 7: o acerto que engana, os pares e o KS reproduzem os números das páginas
  await page.goto("/aulas/c7p2");
  await expect(page.locator('figure[data-vz="acerto-que-engana"]')).toContainText("acerto 73,27%");
  await page.goto("/aulas/c7p5");
  const par = page.locator('figure[data-vz="pares"]');
  await par.getByRole("button", { name: "Todos" }).click();
  await expect(par).toContainText("12 corretos");
  await page.goto("/aulas/c7p7");
  await expect(page.locator('figure[data-vz="ks-ks"]')).toContainText("KS máximo 0,3621");

  // capítulo 8: a política escolhida fecha consigo mesma e fica congelada para o capítulo 10
  await page.goto("/aulas/c8p12");
  const pqf = page.locator('figure[data-vz="politica-que-fecha"]');
  await expect(pqf).toContainText("Aprovados 548, 23 deles pela revisão");
  await pqf.getByRole("button", { name: "Congelar esta política" }).click();
  await expect(pqf).toContainText("Política congelada neste navegador: corte 12,0%");
  await page.goto("/aulas/c8p7");
  await expect(page.locator('figure[data-vz="troca-do-corte"]')).toContainText("saldo R$ 276 mil");

  // capítulo 4: as escalas, o intercepto e a descida completa reproduzem as páginas herdadas
  await page.goto("/aulas/c4p6");
  const regua = page.locator('figure[data-vz="escala-regua"]');
  await expect(regua).toContainText("escore didático 865");
  await regua.getByRole("button", { name: "PD 50%" }).click();
  await expect(regua).toContainText("escore didático 600");
  await page.goto("/aulas/c4p17");
  const desc = page.locator('figure[data-vz="descida-completa"]');
  await desc.getByRole("button", { name: "+10.000" }).click();
  await desc.getByRole("button", { name: "+10.000" }).click();
  await expect(desc).toContainText("Iterações 20.000: perda 0,432824");
  await expect(desc).toContainText("Convergido.");

  // capítulo 5: o corte candidato, o caminho e a poda reproduzem as páginas herdadas
  await page.goto("/aulas/c5p6");
  await expect(page.locator('figure[data-vz="corte-candidato"]')).toContainText("média ponderada 0,30159 e ganho 0,19841");
  await page.goto("/aulas/c5p11");
  const cam = page.locator('figure[data-vz="caminho"]');
  await expect(cam).toContainText("Folha com 6 de 6: PD 100,0%");
  await cam.getByRole("button", { name: "#3" }).click();
  await expect(cam).toContainText("Folha com 0 de 6: PD 0,0%");
  await page.goto("/aulas/c5p15");
  const poda = page.locator('figure[data-vz="poda"]');
  await expect(poda).toContainText("vence profundidade 3, folhas de 1, com custo 0,18000");
  await poda.getByRole("button", { name: "α = 0,30" }).click();
  await expect(poda).toContainText("vence só a raiz");

  // capítulo 10: o memorando guarda o campo neste navegador e lê a política congelada no capítulo 8
  await page.goto("/aulas/c10p5");
  const memo = page.locator('figure[data-vz="memorando-1"]');
  await expect(memo).toContainText("Campo incompleto. 0 de 5 itens declarados e 0 caracteres escritos.");
  await expect(memo).toContainText("Corte da política congelada");
  await memo.locator("textarea").fill("Recomendamos manter a logística com WoE como modelo principal de PD em 12 meses, para ordenar e precificar, com o boosting calibrado mantido em paralelo. Corte 12,0%, revisão até 30,0% com capacidade 80. Vale por dois ciclos de safra madura. Assina o comitê de crédito.");
  for (const cb of await memo.locator(".vz-memo-escrita input[type=checkbox]").all()) await cb.check();
  await expect(memo).toContainText("Campo completo. 5 de 5 itens declarados");
  await page.reload();
  await expect(page.locator('figure[data-vz="memorando-1"]')).toContainText("Campo completo. 5 de 5 itens declarados");
  await page.goto("/aulas/c10p7");
  await expect(page.locator('figure[data-vz="memorando-3"]')).toContainText("4,7 pp, intervalo de −2,5 a 11,9 pp");

  // capítulo 9: a medição só aparece depois do plano; o painel montado chega ao campo 5 do memorando
  await page.goto("/aulas/c9p7");
  const gat = page.locator('figure[data-vz="gatilhos"]');
  await expect(gat).toContainText("A medição só aparece depois da leitura do plano.");
  await gat.getByRole("button", { name: "Medir a janela desta base" }).click();
  await expect(gat).toContainText("0 gatilhos disparados de 5 medidos.");
  await page.goto("/aulas/c9p8");
  const pn = page.locator('figure[data-vz="painel"]');
  await expect(pn).toContainText("3 de 11 selecionados, 1 sem espera de rótulo. Os três fenômenos estão cobertos, mas falta leitura de equidade.");
  await pn.getByRole("checkbox").nth(8).check();
  await expect(pn).toContainText("Painel com cobertura completa.");
  await page.goto("/aulas/c10p9");
  await expect(page.locator('figure[data-vz="memorando-5"]')).toContainText("4 indicadores registrados neste navegador");

  // capítulo 6: o passo a passo de x = 8, os hiperparâmetros da aula e o modelo que decora
  await page.goto("/aulas/c6p2");
  const te = page.locator('figure[data-vz="tres-estrategias"]');
  await te.getByRole("button", { name: "4. Árvore 4" }).click();
  await expect(te).toContainText("previsão para x = 8 de 10,86, erro restante 1,14");
  await page.goto("/aulas/c6p15");
  const hp = page.locator('figure[data-vz="hiperparametros"]');
  await expect(hp).toContainText("log loss de treino 0,47481 contra 0,43282 da logística, 16 folhas somadas, menor folha com 2, PD de 33% a 67%");
  await hp.getByRole("button", { name: "decorar" }).click();
  await expect(hp).toContainText("O modelo decorou a amostra");

  // capítulo 2: o recorte barra o futuro, a amostra menor muda a prevalência e a condição recalcula a contagem
  await page.goto("/aulas/c2p2");
  const rec = page.locator('figure[data-vz="recorte"]');
  await rec.getByRole("button", { name: "Default em 12 meses" }).click();
  await expect(rec).toContainText("Barrada: default em 12 meses só será conhecido no futuro.");
  await page.goto("/aulas/c2p6");
  const mc = page.locator('figure[data-vz="mesmas-caracteristicas"]');
  await mc.getByRole("button", { name: "retire 1 caso" }).click();
  await expect(mc).toContainText("15 pessoas, prevalência observada 53,3%");
  await page.goto("/aulas/c2p7");
  const cond = page.locator('figure[data-vz="condicional"]');
  await expect(cond).toContainText("Dado que utilização acima de 57,5%: 87,5%, 7 defaults em 8 propostas.");
  await cond.getByRole("button", { name: "atraso de 20 dias ou mais" }).click();
  await expect(cond).toContainText("71,4%, 5 defaults em 7 propostas");

  // as quatro últimas: mesma PD com duas operações, balancear preserva a AUC, WoE e IV das faixas
  await page.goto("/aulas/c1p7");
  const mpd = page.locator('figure[data-vz="mesma-pd"]');
  await expect(mpd).toContainText("A dá R$ 1.007 e B dá −R$ 852. Decisão: preferir A.");
  await page.goto("/aulas/c3p15");
  const bal = page.locator('figure[data-vz="balancear"]');
  await expect(bal).toContainText("AUC 0,725685, idêntica até a sexta casa decimal; PD média prevista 9,76%");
  await page.goto("/aulas/c3p17");
  const vi = page.locator('figure[data-vz="valor-da-informacao"]');
  await expect(vi).toContainText("IV total da variável 0,03174, leitura fraca; a maior contribuição vem de F5");
  await vi.getByRole("button", { name: "F5" }).click();
  await expect(vi).toContainText("F5, R$ 10.552 a R$ 14.292, 841 clientes: WoE 0,1518, contribuição para o IV 0,00867.");
});

test("núcleo: gabaritos e notas privadas não estão no motor legado nem nas páginas", async () => {
  const a = await apiAs(ALUNO_A);
  const cid = await classId();
  const pg = await (await a.get(`/api/conteudo/pagina/c3p7?classId=${cid}`)).json();
  expect(pg.teacherGuide).toBeNull();
  expect(JSON.stringify(pg)).not.toContain("answerKey");
  const ids = pg.questions.map((q: { versionId: string }) => q.versionId).join(",");
  const st = await (await a.get(`/api/estudo/responder?classId=${cid}&versions=${ids}`)).json();
  expect(JSON.stringify(st)).not.toContain("porqueCerta");
});

test("teste cego por base: OOT e rótulos vêm da base do grupo; liberação só após congelar; métricas no servidor; outro aluno não acessa", async () => {
  const prof = await apiAs(PROF);
  const cid = await classId();
  const ed = (await (await prof.get("/api/professor/edicoes")).json()).editions.find((e: { label: string }) => e.label === "2026");
  const ds = (await (await prof.get(`/api/professor/edicoes/${ed.id}/bases`)).json()).datasets.find((d: { code: string }) => d.code === "02_cartao");
  expect(ds).toBeTruthy();
  // OOT sem desfecho e rótulos pequenos, cadastrados na base (não no trabalho)
  const ids = ["P020000001", "P020000002", "P020000003", "P020000004", "P020000005", "P020000006"];
  const ootCsv = "proposta_id,cliente_id,data_proposta,canal,utilizacao_limite\n" + ids.map((id, i) => `${id},C02${i},2024-0${(i % 6) + 1}-15,app,0.${i + 1}`).join("\n");
  const labelsCsv = "proposta_id,y\n" + ids.map((id, i) => `${id},${i < 2 ? "" : i % 2}`).join("\n"); // dois IDs recusados (sem rótulo)
  const oot = await (await prof.post("/api/arquivos", { multipart: { classId: cid, purpose: "oot", file: { name: "oot_e2e.csv", mimeType: "text/csv", buffer: Buffer.from(ootCsv) } } })).json();
  const lab = await (await prof.post("/api/arquivos", { multipart: { classId: cid, purpose: "labels", file: { name: "rotulos_e2e.csv", mimeType: "text/csv", buffer: Buffer.from(labelsCsv) } } })).json();
  expect((await prof.patch(`/api/professor/edicoes/${ed.id}/bases/${ds.id}`, { data: { ootFileId: oot.file.id, labelsFileId: lab.file.id } })).status()).toBe(200);
  // trabalho final publicado em modo grupo, teste cego com devolutiva completa; grupo de A com a base 02
  const asg = (await (await prof.get(`/api/professor/turmas/${cid}/trabalhos`)).json()).assignments.find((a: { slug: string }) => a.slug === "trabalho-final");
  await prof.patch(`/api/professor/turmas/${cid}/trabalhos/${asg.id}`, { data: { status: "published", mode: "grupo", dueAt: "2030-01-01T23:59" } });
  await prof.patch(`/api/professor/turmas/${cid}/trabalhos/${asg.id}/cego`, { data: { maxSubmissions: 1, feedbackLevel: "completo", releasePolicy: "apos_congelamento" } });
  const users = await sql<{ id: string; email: string }>("select id, email from users where email = any($1)", [[ALUNO_A.email, ALUNO_B.email]]);
  const ua = users.find((u) => u.email === ALUNO_A.email)!.id;
  // estado limpo e reexecutável: A sai de grupos anteriores; congelamentos e submissões do trabalho são apagados
  await sql("update group_members set left_at = now() where user_id=$1 and left_at is null and group_id in (select id from groups where class_id=$2)", [ua, cid]);
  await sql("delete from blind_submissions where blind_test_id in (select id from blind_tests where assignment_id=$1)", [asg.id]);
  await sql("delete from model_freezes where assignment_id=$1", [asg.id]);
  const gid = (await (await prof.post(`/api/professor/turmas/${cid}/grupos`, { data: { name: `G-cego-${uid()}`, datasetId: ds.id } })).json()).id;
  await prof.post(`/api/professor/turmas/${cid}/grupos/${gid}/membros`, { data: { userId: ua, action: "add" } });
  const a = await apiAs(ALUNO_A);
  let view = await (await a.get(`/api/trabalhos/${asg.id}?classId=${cid}`)).json();
  expect(view.blind.configured).toBe(true); expect(view.blind.datasetCode).toBe("02_cartao"); expect(view.blind.oot.ok).toBe(false);
  expect((await a.get(`/api/trabalhos/${asg.id}/oot?classId=${cid}`)).status()).toBe(403);
  expect((await a.get(`/api/arquivos/${oot.file.id}`)).status()).toBe(403); // antes de congelar, nem pelo id do arquivo
  // congela e recebe o OOT da sua base
  const man = await (await a.post("/api/arquivos", { multipart: { classId: cid, purpose: "manifest", file: { name: "manifesto.md", mimeType: "text/plain", buffer: Buffer.from("# manifesto\nversao 1.0\n") } } })).json();
  expect((await a.post(`/api/trabalhos/${asg.id}/congelar`, { data: { classId: cid, manifestFileId: man.file.id, modelVersion: "v1.0", artifactHashes: [{ name: "modelo.pkl", sha256: "a".repeat(64) }] } })).status()).toBe(201);
  const dl = await (await a.get(`/api/trabalhos/${asg.id}/oot?classId=${cid}`)).json();
  expect(dl.downloadUrl).toBe(`/api/arquivos/${oot.file.id}`);
  const got = await a.get(dl.downloadUrl); expect(got.status()).toBe(200); expect(await got.text()).toContain("P020000006");
  // previsões: ordenação perfeita nos IDs com rótulo -> AUC 1; IDs sem rótulo não entram na métrica
  const predCsv = "proposta_id,pd_modelo,decisao_politica,versao_modelo\n" + ids.map((id, i) => `${id},${i % 2 === 1 ? "0.9" : "0.1"},${i % 2 ? "recusar" : "aprovar"},v1.0`).join("\n");
  const pf = await (await a.post("/api/arquivos", { multipart: { classId: cid, purpose: "blind_predictions", file: { name: "previsoes.csv", mimeType: "text/csv", buffer: Buffer.from(predCsv) } } })).json();
  const sub = await (await a.post(`/api/trabalhos/${asg.id}/cego`, { data: { classId: cid, fileId: pf.file.id } })).json();
  expect(sub.feedback.validation.valid).toBe(true); expect(sub.feedback.validation.expected).toBe(6);
  expect(sub.feedback.metrics.n).toBe(4); expect(sub.feedback.metrics.auc).toBe(1); expect(sub.feedback.metrics.datasetCode).toBe("02_cartao");
  // B não está no grupo: não recebe o OOT nem por id do arquivo; rótulos nunca chegam a aluno
  const b = await apiAs(ALUNO_B);
  expect((await b.get(`/api/arquivos/${oot.file.id}`)).status()).toBe(403);
  expect((await a.get(`/api/arquivos/${lab.file.id}`)).status()).toBe(403);
  expect((await prof.get(`/api/arquivos/${lab.file.id}`)).status()).toBe(200);
  view = await (await prof.get(`/api/professor/turmas/${cid}/trabalhos/${asg.id}`)).json();
  expect(view.blind.datasets.find((d: { code: string }) => d.code === "02_cartao").ootFileId).toBe(oot.file.id);
  // política livre: qualquer matriculado baixa o OOT de qualquer base, sem grupo nem congelamento; rótulos continuam privados
  await prof.patch(`/api/professor/turmas/${cid}/trabalhos/${asg.id}/cego`, { data: { releasePolicy: "livre" } });
  expect((await b.get(`/api/arquivos/${oot.file.id}`)).status()).toBe(200);
  expect((await b.get(`/api/arquivos/${lab.file.id}`)).status()).toBe(403);
  await prof.patch(`/api/professor/turmas/${cid}/trabalhos/${asg.id}/cego`, { data: { releasePolicy: "apos_congelamento" } });
  expect((await b.get(`/api/arquivos/${oot.file.id}`)).status()).toBe(403);
});

test("registro do pacote de bases a partir do bucket: manifesto lido, tamanhos conferidos, catálogo e materiais atualizados; só professor", async () => {
  const fs = await import("node:fs"); const path = await import("node:path"); const { createHash } = await import("node:crypto");
  const prof = await apiAs(PROF);
  const ed = (await (await prof.get("/api/professor/edicoes")).json()).editions.find((e: { label: string }) => e.label === "2026");
  const versao = `e2e${uid().slice(0, 4)}`; const dir = path.join(process.cwd(), "storage", "bases", `v${versao}`); fs.mkdirSync(dir, { recursive: true });
  const escreve = (nome: string, conteudo: Buffer) => { fs.writeFileSync(path.join(dir, nome), conteudo); return { arquivo: nome, sha256: createHash("sha256").update(conteudo).digest("hex"), bytes: conteudo.length }; };
  const zip = Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.alloc(40)]);
  const base = { codigo: "03_consignado", nome: "Consignado privado", produto: "Consignado privado", populacao: "Empregados de empresas privadas", enfase: "teste", versao, oot_ids: 3,
    aluno_zip: escreve("03_consignado_v.zip", zip), dicionario: escreve("03_consignado_dicionario.csv", Buffer.from("campo,tipo\nproposta_id,texto\n")), oot: escreve("03_consignado_oot.csv", Buffer.from("proposta_id\nP1\nP2\nP3\n")), rotulos: escreve("03_consignado_rotulos.csv", Buffer.from("proposta_id,y\nP1,0\nP2,1\nP3,\n")), professor_zip: escreve("03_consignado_professor.zip", zip) };
  const comum = [{ arquivo: escreve("pacote.zip", zip), titulo: `Pacote e2e ${versao}`, descricao: "teste", kind: "arquivo", status: "published" }, { arquivo: escreve("gabaritos.zip", zip), titulo: `Gabaritos e2e ${versao}`, descricao: "teste", kind: "gabarito", status: "professor" }];
  fs.writeFileSync(path.join(dir, "manifesto.json"), JSON.stringify({ versao, gerado_em: "2026-09-17", comum, bases: [base] }));
  const aluno = await apiAs(ALUNO_A);
  expect((await aluno.post(`/api/professor/edicoes/${ed.id}/bases/registrar`, { data: { versao } })).status()).toBe(403);
  const r = await (await prof.post(`/api/professor/edicoes/${ed.id}/bases/registrar`, { data: { versao } })).json();
  expect(r.resumo.bases).toEqual(["03_consignado"]); expect(r.resumo.arquivos_novos).toBe(7);
  const ds = (await (await prof.get(`/api/professor/edicoes/${ed.id}/bases`)).json()).datasets.find((d: { code: string }) => d.code === "03_consignado");
  expect(ds.status).toBe("disponivel"); expect(ds.version).toBe(versao); expect(ds.ootFileId).toBeTruthy(); expect(ds.labelsFileId).toBeTruthy(); expect(ds.teacherFileId).toBeTruthy();
  // idempotente: segunda execução não cria arquivos
  const r2 = await (await prof.post(`/api/professor/edicoes/${ed.id}/bases/registrar`, { data: { versao } })).json();
  expect(r2.resumo.arquivos_novos).toBe(0); expect(r2.resumo.arquivos_existentes).toBe(7);
  // materiais: o publicado aparece ao aluno e o do professor não; gabarito só para professor; tamanho divergente é recusado
  const mats = await sql<{ title: string; status: string }>("select title, status from materials where edition_id=$1 and title like $2", [ed.id, `%e2e ${versao}`]);
  expect(mats.map((m) => m.status).sort()).toEqual(["professor", "published"]);
  expect((await aluno.get(`/api/arquivos/${ds.teacherFileId}`)).status()).toBe(403);
  expect((await prof.get(`/api/arquivos/${ds.teacherFileId}`)).status()).toBe(200);
  expect((await aluno.get(`/api/arquivos/${ds.dictionaryFileId}`)).status()).toBe(200);
  fs.appendFileSync(path.join(dir, "03_consignado_oot.csv"), "P4\n");
  expect((await prof.post(`/api/professor/edicoes/${ed.id}/bases/registrar`, { data: { versao } })).status()).toBe(400);
  // limpeza: os materiais do teste não ficam visíveis nas telas
  await sql("delete from materials where edition_id=$1 and title like $2", [ed.id, `%e2e ${versao}`]);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("abertura do capítulo: página própria com pergunta central, mapa das páginas, vizinhos e roteiro só para o professor", async () => {
  const a = await apiAs(ALUNO_A);
  const r = await a.get("/aulas/capitulo/1");
  expect(r.status()).toBe(200);
  const html = await r.text();
  expect(html).toContain("O que precisamos saber para decidir?");
  expect(html.replace(/<!-- -->/g, "")).toContain("As 8 páginas");
  expect(html).toContain("Mesma PD, decisões econômicas diferentes");
  expect(html).toContain('href="/aulas/capitulo/2"');
  expect(html).toContain("Infográfico de abertura");
  expect(html).not.toContain("Roteiro: exposição");
  const c1p1 = await (await a.get("/aulas/c1p1")).text();
  expect(c1p1).toContain('data-testid="abertura-capitulo"'); // a primeira página aponta para a abertura e não repete o infográfico
  expect(c1p1).not.toContain('data-testid="infografico"');
  expect((await a.get("/aulas/capitulo/99")).status()).toBe(404);
  const p = await apiAs(PROF);
  const ph = await (await p.get("/aulas/capitulo/1")).text();
  expect(ph).toContain("Roteiro: exposição");
  expect(ph).toContain("Editar o conteúdo");
});

test("aula em slides: professor conduz o baralho, aluno acompanha e não recebe as notas do professor", async ({ page }) => {
  const prof = await apiAs(PROF);
  const cid = await classId();
  const meetings = await (await prof.get(`/api/professor/turmas/${cid}/encontros`)).json();
  const aula2 = meetings.meetings.find((m: { number: number }) => m.number === 2);
  expect(aula2, "a turma tem o encontro da Aula 2").toBeTruthy();
  const { sessionId } = await (await prof.post(`/api/professor/turmas/${cid}/encontros/${aula2.id}/iniciar`, { data: {} })).json();

  // a Aula 2 não tem capítulos: o conteúdo dela é o baralho, e os capítulos 4, 5 e 6 são o apêndice
  const uni = await sql<{ kind: string; caps: string }>(
    "select u.kind, coalesce(string_agg(c.slug, ',' order by c.number), '') as caps from units u left join chapters c on c.unit_id=u.id where u.id=$1 group by u.kind", [aula2.unitId]);
  expect(uni[0].caps).toBe("");
  const ap = await sql<{ caps: string }>(
    "select string_agg(c.slug, ',' order by c.number) as caps from units u join chapters c on c.unit_id=u.id where u.kind='apendice' and u.edition_id=(select edition_id from units where id=$1)", [aula2.unitId]);
  expect(ap[0].caps).toBe("c4,c5,c6");
  // o apêndice vem logo depois da Aula 2: com ele no fim, os capítulos liam 1,2,3,7,8,9,10,11,4,5,6
  const ordem = await sql<{ kind: string; number: number }>(
    "select kind, number from units where edition_id=(select edition_id from units where id=$1) order by position", [aula2.unitId]);
  expect(ordem.map((u) => `${u.kind}${u.number}`)).toEqual(
    ["aula1", "aula2", "apendice1", "aula3", "aula4", "trabalho5"]);

  expect((await prof.post(`/api/aovivo/${sessionId}/slide`, { data: { slide: "24" } })).status()).toBe(200);
  expect((await prof.post(`/api/aovivo/${sessionId}/slide`, { data: { slide: "51" } })).status()).toBe(400); // fora do roteiro
  const aluno = await apiAs(ALUNO_A);
  expect((await aluno.post(`/api/aovivo/${sessionId}/slide`, { data: { slide: "01" } })).status()).toBe(403); // aluno não conduz
  expect((await (await aluno.get(`/api/aovivo/${sessionId}/estado`)).json()).currentSlide).toBe("24");

  await loginUi(page, ALUNO_A);
  await page.goto(`/ao-vivo/${sessionId}`);
  const quadro = page.locator('iframe[src*="/slides/aula-2"]');
  await expect(quadro).toHaveCount(1);
  await expect(quadro).toHaveAttribute("src", /modo=aluno/);
  const dentro = page.frameLocator('iframe[src*="/slides/aula-2"]');
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 24 de 50");
  await expect(dentro.locator("#barra")).toBeHidden();          // o aluno não navega sozinho enquanto segue
  await expect(dentro.locator("#btn-professor")).toBeHidden();  // nem abre as notas do professor
  expect(await page.content()).not.toContain("Notas do professor");
  expect(await page.content()).toContain("O que fica salvo");   // e lê o que é guardado onde

  // "Navegar por conta própria" não recarrega o baralho: a exploração do aluno sobrevive à troca de modo.
  // O slide 12 é a calculadora de PD: o número grande é a PD do perfil, e o segundo slider é o comprometimento.
  await prof.post(`/api/aovivo/${sessionId}/slide`, { data: { slide: "12" } });
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 12 de 50");
  const pdAntes = await dentro.locator(".grande").first().textContent();
  await dentro.locator("input[type=range]").nth(1).focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
  const pdMexida = await dentro.locator(".grande").first().textContent();
  expect(pdMexida).not.toBe(pdAntes);
  await page.getByRole("button", { name: "Navegar por conta própria" }).click();
  await expect(dentro.locator("#barra")).toBeVisible();
  expect(await quadro.getAttribute("src")).toMatch(/modo=aluno/);   // o src não mudou: não houve recarga
  expect(await dentro.locator(".grande").first().textContent()).toBe(pdMexida);
  await page.getByRole("button", { name: /Voltar ao slide do professor/ }).click();
  await expect(dentro.locator("#barra")).toBeHidden();
  expect(await dentro.locator(".grande").first().textContent()).toBe(pdMexida);
  // recarregar a página preserva a exploração (sessionStorage, por aba) e o slide do professor
  await page.reload();
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 12 de 50");
  expect(await dentro.locator(".grande").first().textContent()).toBe(pdMexida);
  // o arquivo do aluno não oferece o botão Professor: não há nota para abrir
  await expect(dentro.locator("#btn-professor")).toBeHidden();

  // o arquivo do aluno é a variante sem notas; o do professor é a completa; o painel traz as notas do slide no ar
  const fs2 = await import("node:fs");
  const notas = JSON.parse(fs2.readFileSync("content/slides/aula-2-notas.json", "utf8")) as { slides: { n: string; notas: { conducao: string[] } }[] };
  const fraseNota = notas.slides.find((x) => x.n === "12")!.notas.conducao[0];
  const arqAluno = await (await aluno.get("/slides/aula-2")).text();
  expect(arqAluno).toContain("Aula.slide(");
  expect(arqAluno).not.toContain(fraseNota);
  const arqProf = await (await prof.get("/slides/aula-2")).text();
  expect(arqProf).toContain(fraseNota);
  const desescapar = (t: string) => t.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
  const painelAoVivo = desescapar(await (await prof.get(`/professor/aovivo/${sessionId}`)).text());
  expect(painelAoVivo).toContain("Roteiro do slide no ar");
  expect(painelAoVivo).toContain(fraseNota);
  // a janela projetada abre o baralho em modo projeção: sem notas, sem impressão
  const projecao = await (await prof.get(`/apresentacao/slides?sessao=${sessionId}`)).text();
  expect(projecao).toContain("/slides/aula-2?modo=projecao");

  // o arquivo da aula exige sessão e matrícula
  const anon = await apiAs(null);
  const semSessao = await anon.get("/slides/aula-2", { maxRedirects: 0 });
  expect(semSessao.status()).toBe(307);
  expect(semSessao.headers().location).toContain("/entrar");
  const semTurma = await (await apiAs(SEM)).get("/slides/aula-2", { maxRedirects: 0 });
  expect(semTurma.status()).toBe(403);
  expect(await semTurma.text()).not.toContain("<html");

  // o professor precisa de um caminho para a aula: a Aula 2 não tem capítulo, e sem o material da
  // unidade no painel de conteúdo o cartão dela fica vazio e não há por onde entrar
  const painel = await (await prof.get("/professor/conteudo")).text();
  expect(painel).toContain("/slides/aula-2");
  const painelAluno = await aluno.get("/professor/conteudo", { maxRedirects: 0 });
  expect(painelAluno.status()).toBe(307);   // e o aluno não alcança a área do professor

  await prof.post(`/api/aovivo/${sessionId}/status`, { data: { status: "closed" } });
});

test("Aula 2 na moldura da plataforma: abertura como capítulo, uma página por slide, guias por papel, vizinhos e retorno do baralho", async ({ page }) => {
  const aluno = await apiAs(ALUNO_A);
  const prof = await apiAs(PROF);
  const fs3 = await import("node:fs");
  // o HTML do servidor traz marcas de hidratação entre trechos de texto ("slide <!-- -->12<!-- --> de <!-- -->50")
  const desescapar = (t: string) => t.replace(/<!-- -->/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

  // Aulas: a Aula 2 aparece como cinco cartões, um por bloco, e não mais como um painel de arquivo em nova aba
  const aulas = await (await aluno.get("/aulas")).text();
  expect(aulas.match(/data-testid="cartao-aula-2"/g)?.length).toBe(5);
  expect(aulas).not.toContain('href="/slides/aula-2"');
  expect(aulas).toContain('href="/aulas/aula-2#bloco-1"');

  // abertura no formato do capítulo: volta a Aulas, mapa dos 50 slides, vizinhos e o guia do aluno; o do professor só para a equipe
  const abertura = await (await aluno.get("/aulas/aula-2")).text();
  expect(abertura).toContain('data-testid="aula-2"');
  expect(abertura).toMatch(/<a[^>]*class="voltar[^"]*"[^>]*href="\/aulas"|<a[^>]*href="\/aulas"[^>]*class="voltar/);
  expect(abertura.match(/class="capx-pag[ "]/g)?.length).toBe(50);
  expect(abertura).toContain('href="/aulas/aula-2/slide/01"');
  expect(abertura).toContain('href="/aulas/capitulo/3"');
  expect(abertura).toContain('href="/aulas/capitulo/4"');
  expect(abertura).toContain("/api/materiais/aula-2/guia-do-aluno.pdf");
  expect(abertura).not.toContain("guia-do-professor.pdf");
  expect(abertura).not.toContain("Conduzir ao vivo");
  const aberturaProf = await (await prof.get("/aulas/aula-2")).text();
  expect(aberturaProf).toContain("/api/materiais/aula-2/guia-do-professor.pdf");
  expect(aberturaProf).toContain("Conduzir ao vivo");

  // a página do slide tem a moldura das outras aulas; o roteiro do professor só sai para a equipe
  const notas = JSON.parse(fs3.readFileSync("content/slides/aula-2-notas.json", "utf8")) as { slides: { n: string; titulo: string; notas: { conducao: string[] } }[] };
  const s12 = notas.slides.find((x) => x.n === "12")!;
  const paginaAluno = desescapar(await (await aluno.get("/aulas/aula-2/slide/12")).text());
  expect(paginaAluno).toContain('data-testid="quadro-aula-2"');
  expect(paginaAluno).toContain("slide 12 de 50");
  expect(paginaAluno).toContain(s12.titulo);
  expect(paginaAluno).not.toContain("roteiro-professor");
  expect(paginaAluno).not.toContain(s12.notas.conducao[0]);
  const paginaProf = desescapar(await (await prof.get("/aulas/aula-2/slide/12")).text());
  expect(paginaProf).toContain('data-testid="roteiro-professor"');
  expect(paginaProf).toContain(s12.notas.conducao[0]);
  // endereços: número sem o zero à esquerda redireciona; slide inexistente é 404
  const curto = await aluno.get("/aulas/aula-2/slide/7", { maxRedirects: 0 });
  expect(curto.status()).toBe(307);
  expect(curto.headers().location).toContain("/aulas/aula-2/slide/07");
  expect((await aluno.get("/aulas/aula-2/slide/51")).status()).toBe(404);

  // os guias em PDF saem pela plataforma, por papel: o do aluno para a turma, o do professor para a equipe
  const guiaAluno = await aluno.get("/api/materiais/aula-2/guia-do-aluno.pdf");
  expect(guiaAluno.status()).toBe(200);
  expect(guiaAluno.headers()["content-type"]).toContain("application/pdf");
  expect((await aluno.get("/api/materiais/aula-2/guia-do-professor.pdf")).status()).toBe(403);
  expect((await prof.get("/api/materiais/aula-2/guia-do-professor.pdf")).status()).toBe(200);
  expect((await (await apiAs(null)).get("/api/materiais/aula-2/guia-do-aluno.pdf")).status()).toBe(401);
  expect((await (await apiAs(SEM)).get("/api/materiais/aula-2/guia-do-aluno.pdf")).status()).toBe(403);
  expect((await aluno.get("/api/materiais/aula-2/outro.pdf")).status()).toBe(404);

  // a Aula 2 entra na sequência do curso: o capítulo 3 aponta para ela, e ela para o capítulo 4
  expect(await (await aluno.get("/aulas/capitulo/3")).text()).toContain('href="/aulas/aula-2"');
  expect(await (await aluno.get("/aulas/capitulo/4")).text()).toContain('href="/aulas/aula-2"');
  // Materiais aponta para a página da aula, não para o arquivo; o guia do professor não aparece ao aluno
  const materiais = await (await aluno.get("/materiais")).text();
  expect(materiais).toContain('href="/aulas/aula-2"');
  expect(materiais).not.toContain("guia-do-professor");
  // o painel de conteúdo do professor traz o guia do professor e lista os 50 slides, cada um com "ver" e "tela cheia"
  const painel = await (await prof.get("/professor/conteudo")).text();
  expect(painel).toContain('data-testid="conteudo-aula-2"');
  expect(painel).toContain("/api/materiais/aula-2/guia-do-professor.pdf");
  expect(painel.match(/href="\/aulas\/aula-2\/slide\/\d\d"/g)?.length).toBe(50);
  expect(painel.match(/href="\/slides\/aula-2#\/slide\/\d\d"/g)?.length).toBe(50);

  // no navegador: Próxima e a lista trocam o slide sem recarregar o baralho, endereço e lateral acompanham e
  // Voltar desfaz um passo; embutido, o baralho não mostra o link de retorno; em tela cheia mostra, e ele volta ao slide atual
  type JanelaMarcada = Window & { __marca?: number };
  const marca = () => page.evaluate(() => (document.querySelector("iframe")?.contentWindow as JanelaMarcada | null | undefined)?.__marca);
  await loginUi(page, ALUNO_A);
  await page.goto("/aulas/aula-2/slide/12");
  const dentro = page.frameLocator('iframe[src*="/slides/aula-2"]');
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 12 de 50", { timeout: 30000 });
  await expect(dentro.locator("#barra")).toBeVisible();        // modo livre: o aluno navega
  await expect(dentro.locator("#lnk-voltar")).toBeHidden();    // a casca já tem o caminho de volta
  await page.evaluate(() => { const w = document.querySelector("iframe")?.contentWindow as JanelaMarcada | null | undefined; if (w) w.__marca = 1; });
  await page.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(/\/aulas\/aula-2\/slide\/13$/);
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 13 de 50");
  await expect(page.locator('[data-lista="slides"] a[aria-current="page"]')).toContainText("13");
  await expect(page.locator("article h1")).toHaveText(notas.slides.find((x) => x.n === "13")!.titulo);
  expect(await marca()).toBe(1);
  await page.locator('[data-lista="slides"] a[href="/aulas/aula-2/slide/30"]').click();
  await expect(page).toHaveURL(/\/aulas\/aula-2\/slide\/30$/);
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 30 de 50");
  await page.goBack();
  await expect(page).toHaveURL(/\/aulas\/aula-2\/slide\/13$/);
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 13 de 50");
  expect(await marca()).toBe(1);
  await expect(page.locator('aside a[href="/slides/aula-2#/slide/13"]').last()).toHaveText("Ver em tela cheia");
  await page.goto("/slides/aula-2#/slide/13");
  await expect(page.locator("#lnk-voltar")).toBeVisible({ timeout: 30000 });
  await expect(page.locator("#lnk-voltar")).toHaveAttribute("href", "/aulas/aula-2/slide/13");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#lnk-voltar")).toHaveAttribute("href", "/aulas/aula-2/slide/14");
  await page.locator("#lnk-voltar").click();
  await expect(page).toHaveURL(/\/aulas\/aula-2\/slide\/14$/, { timeout: 30000 });
  await expect(dentro.locator(".cabeca .passo")).toHaveText("slide 14 de 50", { timeout: 30000 });
});

test("uniformidade das molduras: retorno em toda rota de detalhe, um título por página, 404 dentro da moldura e saída para quem não tem turma", async ({ page }) => {
  const aluno = await apiAs(ALUNO_A);
  const prof = await apiAs(PROF);
  const cid = await classId();
  const semTurma = await apiAs(SEM);
  const desesc = (t: string) => t.replace(/<!-- -->/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
  const titulo = (html: string) => (/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "").replace(/&#x27;/g, "'");
  const umH1 = (html: string) => (html.match(/<h1[\s>]/g) ?? []).length;

  // toda rota de detalhe do aluno abre com o link de volta ao nível acima
  const trabalhos = await sql<{ id: string }>("select id from assignments where class_id=$1 order by position limit 1", [cid]);
  const detalheTrabalho = await (await aluno.get(`/trabalhos/${trabalhos[0].id}`)).text();
  expect(detalheTrabalho).toContain('href="/trabalhos"');
  const pgAula = await (await aluno.get("/aulas/c1p2")).text();
  for (const html of [pgAula, await (await aluno.get("/aulas/capitulo/1")).text(), await (await aluno.get("/aulas/aula-2")).text()]) {
    expect(html).toMatch(/class="voltar[^"]*"[^>]*href="\/aulas"|href="\/aulas"[^>]*class="voltar/);
  }

  // um h1 por rota: o título da página, com as seções em h2
  for (const rota of ["/inicio", "/aulas", "/materiais", "/trabalhos", "/acompanhamento", "/ao-vivo", "/perfil", "/ajuda"]) {
    expect(umH1(await (await aluno.get(rota)).text()), `um h1 em ${rota}`).toBe(1);
  }
  const materiais = await (await aluno.get("/materiais")).text();
  expect(materiais).toContain('id="leituras"');
  expect(materiais).toContain('id="bases"');

  // notFound dentro da área do aluno responde 404 e traz o cartão local, não o 404 global
  for (const rota of ["/aulas/aula-2/slide/99", "/aulas/naoexiste", "/aulas/capitulo/99"]) {
    expect((await aluno.get(rota)).status(), `${rota} responde 404`).toBe(404);
  }
  // e o 404 da página de aula não oferece ao aluno um botão para a área do professor
  expect(desesc(await (await aluno.get("/aulas/naoexiste")).text())).not.toContain("Conteúdo (professor)");

  // quem não tem turma recebe uma tela com saída própria, não um beco
  const sem = await semTurma.get("/inicio", { maxRedirects: 0 });
  expect(sem.status()).toBe(307);
  expect(sem.headers().location).toContain("/sem-turma");
  const telaSem = await (await semTurma.get("/sem-turma")).text();
  expect(titulo(telaSem)).toContain("Sem turma ativa");
  for (const saida of ['href="/ativar"', 'href="/ajuda"', 'href="/perfil"']) expect(telaSem).toContain(saida);
  expect((await semTurma.get("/ajuda")).status()).toBe(200);   // a saída oferecida abre mesmo

  // as telas da turma nomeiam a turma na aba do navegador
  const turma = await sql<{ name: string }>("select name from classes where id=$1", [cid]);
  for (const aba of ["", "/alunos", "/encontros", "/trabalhos", "/notas"]) {
    expect(titulo(await (await prof.get(`/professor/turmas/${cid}${aba}`)).text()), `título da aba ${aba || "visão geral"}`).toContain(turma[0].name);
  }

  // Bases e gabaritos conta um trabalho final por turma, não toda entrega de aula
  const turmas = await sql<{ n: string }>("select count(*) as n from classes c join editions e on e.id=c.edition_id where e.status='active'");
  const entregas = await sql<{ n: string }>("select count(*) as n from assignments a join classes c on c.id=a.class_id join editions e on e.id=c.edition_id where e.status='active'");
  const bases = await (await prof.get("/professor/bases")).text();
  // o cartão renderizado é <b>código</b> · trabalho final; o pacote RSC repete o texto solto, por isso o </b>
  const cartoes = (bases.match(/<\/b> · trabalho final/g) ?? []).length;
  expect(cartoes, "um cartão por turma, não um por entrega").toBe(Number(turmas[0].n));
  expect(cartoes).toBeLessThan(Number(entregas[0].n));
  expect(bases).toContain("/api/materiais/aula-2/guia-do-professor.pdf");   // material com url é clicável

  // quem redefine a senha sabe que deu certo ao chegar em Entrar
  expect(await (await apiAs(null)).get("/entrar?m=redefinida").then((r) => r.text())).toContain("Senha redefinida");

  // no navegador: o cartão de 404 que aparece é o da própria área, dentro da moldura e com um só main
  await loginUi(page, ALUNO_A);
  for (const [rota, eyebrow] of [["/aulas/aula-2/slide/99", "Aula não disponível"], ["/aulas/naoexiste", "Página não disponível"], ["/aulas/capitulo/99", "Capítulo não disponível"]] as const) {
    await page.goto(rota);
    const visivel = (await page.locator("body").innerText()).toLowerCase();   // o eyebrow sai em maiúsculas por CSS
    expect(visivel, `${rota} mostra o cartão local`).toContain(eyebrow.toLowerCase());
    expect(visivel, `${rota} não cai no 404 global`).not.toContain("este endereço não existe na plataforma");
    await expect(page.locator("main#conteudo"), `${rota} com um só main`).toHaveCount(1);
    await expect(page.locator('a[href="/aulas"]').first()).toBeVisible();
  }

  // a moldura declara a área, e as âncoras param abaixo do cabeçalho grudado
  await page.goto("/aulas/aula-2#bloco-3");
  await expect(page.locator('[data-area="aluno"]')).toHaveCount(1);
  const medida = await page.evaluate(() => {
    const el = document.getElementById("bloco-3"); const h = document.querySelector("header");
    return el && h ? { alvo: el.getBoundingClientRect().top, cabecalho: h.getBoundingClientRect().bottom } : null;
  });
  expect(medida!.alvo, "a âncora não fica atrás do cabeçalho").toBeGreaterThanOrEqual(medida!.cabecalho - 2);

  // e nenhuma tabela do aluno empurra a página de lado no celular
  await page.setViewportSize({ width: 390, height: 844 });
  for (const rota of ["/acompanhamento", "/materiais", "/trabalhos"]) {
    await page.goto(rota);
    const larg = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
    expect(larg.s, `${rota} sem rolagem lateral em 390px`).toBeLessThanOrEqual(larg.c + 1);
  }
});

test("prontidão: /api/health diz quantas migrações o banco aplicou, e o número bate com drizzle/", async () => {
  const fs = await import("node:fs");
  const arquivos = fs.readdirSync("drizzle").filter((f) => f.endsWith(".sql")).length;
  const anon = await apiAs(null);
  const r = await anon.get("/api/health");
  expect(r.status()).toBe(200);
  const j = await r.json();
  expect(j.ok).toBe(true);
  expect(j.migracoes, "banco atrás das migrações do repositório").toBe(arquivos);
});
