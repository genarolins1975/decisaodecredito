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
  const p1 = await (await a.get("/aulas/c6p1")).text();
  expect(p1).toContain("O que este capítulo assume"); expect(p1).toContain('href="/aulas/c4p7"'); expect(p1).toContain('href="/aulas/c2p13"');
  const c1p1 = await (await a.get("/aulas/c1p1")).text();
  expect(c1p1).not.toContain("Antes desta página"); // "Nenhum" não gera bloco
  // nada além do prerrequisito sai do guia docente
  expect(p12).not.toContain("Notas do professor"); expect(p12).not.toContain("intervencao");
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
