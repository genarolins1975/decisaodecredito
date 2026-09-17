/**
 * Modelo de dados da plataforma.
 * Convenções: instantes em timestamptz (UTC no banco, America/Sao_Paulo na interface);
 * identificadores textuais gerados por nanoid; chaves estrangeiras explícitas;
 * o contexto de turma (class_id) acompanha todo registro acadêmico.
 */
import {
  pgTable, text, timestamp, integer, boolean, jsonb, numeric, uniqueIndex, index, primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const id = () => text("id").primaryKey();
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const createdAt = () => ts("created_at").notNull().defaultNow();

/* ------------------------------------------------------------------ */
/* Identidade, autenticação e sessões                                   */
/* ------------------------------------------------------------------ */
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull(),            // normalizado (trim + lower); pontos e "+" preservados
  name: text("name").notNull(),
  passwordHash: text("password_hash"),        // nulo até o primeiro acesso; argon2id
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  isStaff: boolean("is_staff").notNull().default(false), // professor/administrador global
  emailVerifiedAt: ts("email_verified_at"),
  disabledAt: ts("disabled_at"),
  lastLoginAt: ts("last_login_at"),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  phone: text("phone"),
  linkedinUrl: text("linkedin_url"),
  onboardingCompletedAt: ts("onboarding_completed_at"),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: id(),                                   // hash sha256 do token entregue no cookie
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  expiresAt: ts("expires_at").notNull(),
  lastSeenAt: ts("last_seen_at").notNull().defaultNow(),
  revokedAt: ts("revoked_at"),
  revokedReason: text("revoked_reason"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: ts("expires_at").notNull(),
  usedAt: ts("used_at"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("prt_hash_uq").on(t.tokenHash)]);

/** Limitação de abuso por chave (ip, e-mail, ação). Janela fixa. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: ts("window_start").notNull(),
  count: integer("count").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* Curso → edição/ano letivo → turma → matrícula                        */
/* ------------------------------------------------------------------ */
export const courses = pgTable("courses", {
  id: id(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  professorName: text("professor_name").notNull(),
  institution: text("institution"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("courses_slug_uq").on(t.slug)]);

export const editions = pgTable("editions", {
  id: id(),
  courseId: text("course_id").notNull().references(() => courses.id),
  year: integer("year").notNull(),            // ano letivo explícito
  label: text("label").notNull(),             // "2026"
  status: text("status").notNull().default("draft"), // draft | active | archived
  contentVersionNote: text("content_version_note"),
  config: jsonb("config").notNull().default(sql`'{}'::jsonb`),
  archivedAt: ts("archived_at"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("editions_course_label_uq").on(t.courseId, t.label)]);

export const classes = pgTable("classes", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  code: text("code").notNull(),               // "2026-A"; único na edição, não apenas o ano
  name: text("name").notNull(),               // "Turma 2026"
  status: text("status").notNull().default("active"), // active | archived
  archivePolicy: text("archive_policy").notNull().default("read_only"), // read_only | closed
  timezone: text("timezone").notNull().default("America/Sao_Paulo"),
  /** regras configuráveis: frequência mínima, atraso, justificativa, etc. Vazio = "regra não definida" */
  config: jsonb("config").notNull().default(sql`'{}'::jsonb`),
  archivedAt: ts("archived_at"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("classes_edition_code_uq").on(t.editionId, t.code)]);

/**
 * Matrícula = autorização. Estados: autorizado | convidado | ativo | suspenso | encerrado.
 * userId fica nulo até a pessoa ter conta; e-mail é a chave de autorização.
 */
export const enrollments = pgTable("enrollments", {
  id: id(),
  classId: text("class_id").notNull().references(() => classes.id),
  userId: text("user_id").references(() => users.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("aluno"), // aluno | monitor | professor
  status: text("status").notNull().default("autorizado"),
  activatedAt: ts("activated_at"),
  suspendedAt: ts("suspended_at"),
  endedAt: ts("ended_at"),
  statusReason: text("status_reason"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("enrollments_class_email_uq").on(t.classId, t.email),
  index("enrollments_user_idx").on(t.userId),
]);

/** Credencial temporária de primeiro acesso: aleatória, curta validade, uso único. */
export const invites = pgTable("invites", {
  id: id(),
  enrollmentId: text("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  kind: text("kind").notNull().default("activation"), // activation | existing_user_notice
  expiresAt: ts("expires_at").notNull(),
  usedAt: ts("used_at"),
  supersededAt: ts("superseded_at"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("invites_hash_uq").on(t.tokenHash), index("invites_enrollment_idx").on(t.enrollmentId)]);

/* ------------------------------------------------------------------ */
/* E-mail: conexão Gmail e fila com tentativas                          */
/* ------------------------------------------------------------------ */
export const gmailConnections = pgTable("gmail_connections", {
  id: id(),
  ownerUserId: text("owner_user_id").notNull().references(() => users.id),
  emailAddress: text("email_address").notNull(),
  refreshTokenEnc: text("refresh_token_enc").notNull(), // cifrado com APP_SECRET (AES-256-GCM)
  accessTokenEnc: text("access_token_enc"),
  accessTokenExpiresAt: ts("access_token_expires_at"),
  scopes: text("scopes").notNull(),
  connectedAt: createdAt(),
  revokedAt: ts("revoked_at"),
  lastError: text("last_error"),
  lastErrorAt: ts("last_error_at"),
});

export const emailMessages = pgTable("email_messages", {
  id: id(),
  kind: text("kind").notNull(), // invite | invite_existing | password_reset | test | notice
  toEmail: text("to_email").notNull(),
  toUserId: text("to_user_id").references(() => users.id),
  enrollmentId: text("enrollment_id").references(() => enrollments.id),
  inviteId: text("invite_id").references(() => invites.id),
  classId: text("class_id").references(() => classes.id),
  subject: text("subject").notNull(),
  bodyText: text("body_text").notNull(),
  bodyHtml: text("body_html"),
  /** queued | sending | accepted | failed | cancelled.  "accepted" = aceito pelo Gmail, não entrega comprovada */
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  nextAttemptAt: ts("next_attempt_at").notNull().defaultNow(),
  lastError: text("last_error"),
  providerMessageId: text("provider_message_id"),
  acceptedAt: ts("accepted_at"),
  dedupeKey: text("dedupe_key"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("email_dedupe_uq").on(t.dedupeKey), index("email_status_idx").on(t.status, t.nextAttemptAt)]);

/* ------------------------------------------------------------------ */
/* Conteúdo: unidades (aulas) → capítulos → páginas versionadas         */
/* ------------------------------------------------------------------ */
export const units = pgTable("units", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  kind: text("kind").notNull().default("aula"), // aula | trabalho
  number: integer("number").notNull(),
  title: text("title").notNull(),
  deliverable: text("deliverable"),
  plannedMinutes: integer("planned_minutes").notNull().default(180),
  breakMinutes: integer("break_minutes").notNull().default(15),
  position: integer("position").notNull(),
  status: text("status").notNull().default("published"), // draft | published | archived
  createdAt: createdAt(),
}, (t) => [uniqueIndex("units_edition_number_uq").on(t.editionId, t.kind, t.number)]);

export const chapters = pgTable("chapters", {
  id: id(),
  unitId: text("unit_id").notNull().references(() => units.id),
  number: integer("number").notNull(),
  slug: text("slug").notNull(),               // c1..c11
  title: text("title").notNull(),
  centralQuestion: text("central_question"),
  prerequisites: text("prerequisites"),
  learn: text("learn"),
  motivation: text("motivation"),
  activity: text("activity"),
  uses: text("uses"),
  themeColor: text("theme_color"),
  themeSoft: text("theme_soft"),
  position: integer("position").notNull(),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("chapters_unit_slug_uq").on(t.unitId, t.slug)]);

export const pages = pgTable("pages", {
  id: id(),
  chapterId: text("chapter_id").notNull().references(() => chapters.id),
  slug: text("slug").notNull(),               // identificador original preservado, ex. c3p7
  number: integer("number").notNull(),
  position: integer("position").notNull(),
  level: text("level").notNull().default("essencial"), // essencial | complementar
  level120: text("level_120").default("assincrono"),   // essencial | assincrono (versão de 120 min)
  minutes: integer("minutes").notNull().default(0),
  origin: text("origin"),                     // sint | obs | doc | esq | rec
  status: text("status").notNull().default("published"), // draft | published
  publishedVersionId: text("published_version_id"),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("pages_chapter_slug_uq").on(t.chapterId, t.slug)]);

/**
 * Conteúdo versionado. `blocks` é público para matriculados; `teacherGuide` é privado
 * (nunca serializado para alunos). Uma versão publicada não é editada: cria-se outra.
 */
export const pageVersions = pgTable("page_versions", {
  id: id(),
  pageId: text("page_id").notNull().references(() => pages.id, { onDelete: "cascade" }),
  versionNo: integer("version_no").notNull(),
  title: text("title").notNull(),
  objective: text("objective"),
  support: text("support"),
  connection: text("connection"),
  timeBudget: jsonb("time_budget").notNull().default(sql`'{}'::jsonb`), // {exp, ex, prat, disc}
  blocks: jsonb("blocks").notNull().default(sql`'[]'::jsonb`),
  teacherGuide: jsonb("teacher_guide"),
  changeNote: text("change_note"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
  publishedAt: ts("published_at"),
}, (t) => [uniqueIndex("page_versions_uq").on(t.pageId, t.versionNo)]);

/** Registro de origem → destino da migração (rastreabilidade). */
export const contentImports = pgTable("content_imports", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  sourceFile: text("source_file").notNull(),
  sourceSha256: text("source_sha256").notNull(),
  summary: jsonb("summary").notNull(),
  createdAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/* Questões versionadas, com gabarito privado                           */
/* ------------------------------------------------------------------ */
export const questions = pgTable("questions", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  pageId: text("page_id").references(() => pages.id),
  slug: text("slug").notNull(),               // ex. c3p7q, c1p2 (prever), c3p7-checagem
  /** single | multi | numeric | short_text | credit_decision | simulator_output | predict */
  kind: text("kind").notNull(),
  currentVersionId: text("current_version_id"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("questions_edition_slug_uq").on(t.editionId, t.slug)]);

export const questionVersions = pgTable("question_versions", {
  id: id(),
  questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  versionNo: integer("version_no").notNull(),
  label: text("label"),
  prompt: text("prompt").notNull(),
  /** alternativas, unidade, tolerância, campos do simulador etc. (público) */
  options: jsonb("options").notNull().default(sql`'{}'::jsonb`),
  /** PRIVADO: índice correto, valor esperado, explicação por alternativa, recuperação */
  answerKey: jsonb("answer_key"),
  /** conteúdo revelado após a resposta (prever) ou após liberação (feedback) */
  feedback: jsonb("feedback"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("question_versions_uq").on(t.questionId, t.versionNo)]);

/** Resposta formativa em estudo (fora de sessão ao vivo). Idempotente por client_request_id. */
export const studyResponses = pgTable("study_responses", {
  id: id(),
  classId: text("class_id").notNull().references(() => classes.id),
  userId: text("user_id").notNull().references(() => users.id),
  questionVersionId: text("question_version_id").notNull().references(() => questionVersions.id),
  answer: jsonb("answer").notNull(),
  isCorrect: boolean("is_correct"),
  attemptNo: integer("attempt_no").notNull().default(1),
  clientRequestId: text("client_request_id").notNull(),
  serverTime: ts("server_time").notNull().defaultNow(),
  /** quando o gabarito (alternativa correta e explicação) foi divulgado ao aluno nesta tentativa; nulo = ainda não */
  revealedAt: ts("revealed_at"),
  /** o gabarito já havia sido divulgado ao aluno antes desta tentativa (não conta como acerto próprio) */
  disclosedBefore: boolean("disclosed_before").notNull().default(false),
}, (t) => [
  uniqueIndex("study_responses_req_uq").on(t.userId, t.clientRequestId),
  index("study_responses_user_q_idx").on(t.userId, t.questionVersionId),
]);

/* ------------------------------------------------------------------ */
/* Encontros, sessão ao vivo e atividades                               */
/* ------------------------------------------------------------------ */
export const meetings = pgTable("meetings", {
  id: id(),
  classId: text("class_id").notNull().references(() => classes.id),
  unitId: text("unit_id").references(() => units.id),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  scheduledAt: ts("scheduled_at"),
  endsAt: ts("ends_at"),
  location: text("location"),
  videoUrl: text("video_url"),
  status: text("status").notNull().default("planned"), // planned | done | cancelled
  countsForAttendance: boolean("counts_for_attendance").notNull().default(true),
  replacementOfId: text("replacement_of_id"),
  preparation: text("preparation"),
  createdAt: createdAt(),
}, (t) => [index("meetings_class_idx").on(t.classId)]);

export const liveSessions = pgTable("live_sessions", {
  id: id(),
  meetingId: text("meeting_id").notNull().references(() => meetings.id),
  classId: text("class_id").notNull().references(() => classes.id),
  status: text("status").notNull().default("draft"), // draft | open | closed
  currentPageId: text("current_page_id").references(() => pages.id),
  stateVersion: integer("state_version").notNull().default(0),
  openedAt: ts("opened_at"),
  closedAt: ts("closed_at"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

export const sessionActivities = pgTable("session_activities", {
  id: id(),
  liveSessionId: text("live_session_id").notNull().references(() => liveSessions.id, { onDelete: "cascade" }),
  questionVersionId: text("question_version_id").notNull().references(() => questionVersions.id),
  pageId: text("page_id").references(() => pages.id),
  round: text("round").notNull().default("unica"), // unica | antes | depois
  status: text("status").notNull().default("draft"), // draft | open | closed | released
  timeLimitS: integer("time_limit_s"),
  maxAttempts: integer("max_attempts").notNull().default(1),
  position: integer("position").notNull().default(0),
  openedAt: ts("opened_at"),
  closesAt: ts("closes_at"),
  closedAt: ts("closed_at"),
  releasedAt: ts("released_at"),
  createdAt: createdAt(),
}, (t) => [index("session_activities_session_idx").on(t.liveSessionId)]);

export const attempts = pgTable("attempts", {
  id: id(),
  activityId: text("activity_id").notNull().references(() => sessionActivities.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  attemptNo: integer("attempt_no").notNull().default(1),
  clientRequestId: text("client_request_id").notNull(),
  answer: jsonb("answer").notNull(),
  status: text("status").notNull().default("draft"), // draft | submitted
  isCorrect: boolean("is_correct"),
  savedAt: ts("saved_at").notNull().defaultNow(),
  submittedAt: ts("submitted_at"),
  serverTime: ts("server_time").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("attempts_user_attempt_uq").on(t.activityId, t.userId, t.attemptNo),
  uniqueIndex("attempts_req_uq").on(t.userId, t.clientRequestId),
]);

/* ------------------------------------------------------------------ */
/* Frequência: evidência separada da decisão                            */
/* ------------------------------------------------------------------ */
export const attendanceWindows = pgTable("attendance_windows", {
  id: id(),
  meetingId: text("meeting_id").notNull().references(() => meetings.id),
  kind: text("kind").notNull().default("checkin"), // checkin | checkout | confirmacao
  opensAt: ts("opens_at").notNull(),
  closesAt: ts("closes_at").notNull(),
  lateAfter: ts("late_after"),
  codeSecret: text("code_secret").notNull(),   // semente do código rotativo (nunca exposta)
  rotationSeconds: integer("rotation_seconds").notNull().default(60),
  maxAttempts: integer("max_attempts").notNull().default(10),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

export const attendanceCheckins = pgTable("attendance_checkins", {
  id: id(),
  windowId: text("window_id").notNull().references(() => attendanceWindows.id),
  userId: text("user_id").notNull().references(() => users.id),
  codeUsed: text("code_used"),
  result: text("result").notNull(),            // ok | rejected
  reason: text("reason"),
  serverTime: ts("server_time").notNull().defaultNow(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
}, (t) => [index("checkins_window_user_idx").on(t.windowId, t.userId)]);

export const attendanceRecords = pgTable("attendance_records", {
  id: id(),
  meetingId: text("meeting_id").notNull().references(() => meetings.id),
  userId: text("user_id").notNull().references(() => users.id),
  /** presente | ausente | atrasado | justificado | pendente */
  status: text("status").notNull(),
  source: text("source").notNull().default("checkin"), // checkin | manual | regra
  reason: text("reason"),
  decidedBy: text("decided_by").references(() => users.id),
  decidedAt: ts("decided_at").notNull().defaultNow(),
  reviewRequested: text("review_requested"),
  reviewRequestedAt: ts("review_requested_at"),
}, (t) => [uniqueIndex("attendance_records_uq").on(t.meetingId, t.userId)]);

export const attendanceHistory = pgTable("attendance_history", {
  id: id(),
  recordId: text("record_id").notNull().references(() => attendanceRecords.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  reason: text("reason").notNull(),
  changedBy: text("changed_by").references(() => users.id),
  changedAt: createdAt(),
});

/* ------------------------------------------------------------------ */
/* Arquivos (privados), bases, grupos, trabalhos, submissões, notas     */
/* ------------------------------------------------------------------ */
export const files = pgTable("files", {
  id: id(),
  storageKey: text("storage_key").notNull(),
  originalName: text("original_name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull().default(0),
  sha256: text("sha256"),
  ownerUserId: text("owner_user_id").references(() => users.id),
  classId: text("class_id").references(() => classes.id),
  purpose: text("purpose").notNull(),          // submission | feedback | dataset | material | manifest | oot | labels
  status: text("status").notNull().default("pending"), // pending | complete | orphan
  createdAt: createdAt(),
  completedAt: ts("completed_at"),
}, (t) => [index("files_class_idx").on(t.classId)]);

export const datasets = pgTable("datasets", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  code: text("code").notNull(),                // 01_pessoal
  name: text("name").notNull(),
  product: text("product"),
  population: text("population"),
  emphasis: text("emphasis"),
  version: text("version").notNull().default("1"),
  status: text("status").notNull().default("pendente"), // pendente | disponivel
  fileId: text("file_id").references(() => files.id),                    // pacote do aluno (zip: desenvolvimento, dicionário, README)
  dictionaryFileId: text("dictionary_file_id").references(() => files.id),
  ootFileId: text("oot_file_id").references(() => files.id),             // OOT sem desfecho desta base (liberado após congelamento)
  labelsFileId: text("labels_file_id").references(() => files.id),       // rótulos verdadeiros do OOT: somente professor
  teacherFileId: text("teacher_file_id").references(() => files.id),     // gabarito e verdade da base: somente professor
  notes: text("notes"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("datasets_edition_code_uq").on(t.editionId, t.code)]);

export const materials = pgTable("materials", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  unitId: text("unit_id").references(() => units.id),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("leitura"), // leitura | referencia | arquivo | link
  description: text("description"),
  url: text("url"),
  fileId: text("file_id").references(() => files.id),
  citation: text("citation"),
  status: text("status").notNull().default("published"),
  position: integer("position").notNull().default(0),
  createdAt: createdAt(),
});

export const groups = pgTable("groups", {
  id: id(),
  classId: text("class_id").notNull().references(() => classes.id),
  name: text("name").notNull(),
  datasetId: text("dataset_id").references(() => datasets.id),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("groups_class_name_uq").on(t.classId, t.name)]);

export const groupMembers = pgTable("group_members", {
  groupId: text("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  joinedAt: createdAt(),
  leftAt: ts("left_at"),
}, (t) => [primaryKey({ columns: [t.groupId, t.userId] })]);

export const rubrics = pgTable("rubrics", {
  id: id(),
  editionId: text("edition_id").notNull().references(() => editions.id),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  currentVersionId: text("current_version_id"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("rubrics_edition_slug_uq").on(t.editionId, t.slug)]);

export const rubricVersions = pgTable("rubric_versions", {
  id: id(),
  rubricId: text("rubric_id").notNull().references(() => rubrics.id, { onDelete: "cascade" }),
  versionNo: integer("version_no").notNull(),
  /** {criteria:[{key,name,weight,levels:[{score,label,description}]}], rounding:{decimals}, cutoffRule, maxScore} */
  definition: jsonb("definition").notNull(),
  changeNote: text("change_note"),
  createdAt: createdAt(),
}, (t) => [uniqueIndex("rubric_versions_uq").on(t.rubricId, t.versionNo)]);

export const assignments = pgTable("assignments", {
  id: id(),
  classId: text("class_id").notNull().references(() => classes.id),
  unitId: text("unit_id").references(() => units.id),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  objectives: text("objectives"),
  prerequisites: text("prerequisites"),
  materials: text("materials"),
  deliverables: jsonb("deliverables").notNull().default(sql`'[]'::jsonb`),
  allowedFormats: jsonb("allowed_formats").notNull().default(sql`'["pdf","zip","csv","ipynb","md","link"]'::jsonb`),
  maxFileMb: integer("max_file_mb").notNull().default(50),
  mode: text("mode").notNull().default("individual"), // individual | grupo
  dueAt: ts("due_at"),
  /** {acceptLate:boolean, penaltyPerDayPct:number, hardDeadlineAt?:string, startedBeforeDeadlineCounts:boolean} */
  latePolicy: jsonb("late_policy").notNull().default(sql`'{"acceptLate":true,"penaltyPerDayPct":0,"startedBeforeDeadlineCounts":false}'::jsonb`),
  rubricVersionId: text("rubric_version_id").references(() => rubricVersions.id),
  weight: numeric("weight", { precision: 6, scale: 3 }),
  status: text("status").notNull().default("draft"), // draft | published | closed
  blindTestEnabled: boolean("blind_test_enabled").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("assignments_class_slug_uq").on(t.classId, t.slug)]);

/** Etapas acompanháveis (as 12 missões do trabalho final). Nem toda etapa tem nota ou prazo próprio. */
export const assignmentSteps = pgTable("assignment_steps", {
  id: id(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  pageSlug: text("page_slug"),
  expectedOutputs: jsonb("expected_outputs").notNull().default(sql`'[]'::jsonb`),
  requiresDelivery: boolean("requires_delivery").notNull().default(false),
  dueAt: ts("due_at"),
  position: integer("position").notNull(),
}, (t) => [uniqueIndex("assignment_steps_uq").on(t.assignmentId, t.number)]);

export const stepProgress = pgTable("step_progress", {
  id: id(),
  stepId: text("step_id").notNull().references(() => assignmentSteps.id, { onDelete: "cascade" }),
  groupId: text("group_id").references(() => groups.id),
  userId: text("user_id").references(() => users.id),
  status: text("status").notNull().default("pendente"), // pendente | em_andamento | concluida | validada
  note: text("note"),
  updatedBy: text("updated_by").references(() => users.id),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const assignmentExtensions = pgTable("assignment_extensions", {
  id: id(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  groupId: text("group_id").references(() => groups.id),
  dueAt: ts("due_at").notNull(),
  reason: text("reason").notNull(),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

export const submissions = pgTable("submissions", {
  id: id(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id),
  classId: text("class_id").notNull().references(() => classes.id),
  groupId: text("group_id").references(() => groups.id),
  submitterUserId: text("submitter_user_id").notNull().references(() => users.id),
  versionNo: integer("version_no").notNull().default(1),
  /** rascunho | enviado | atrasado | devolvido | reenviado | corrigido | publicado */
  status: text("status").notNull().default("rascunho"),
  isCurrent: boolean("is_current").notNull().default(true),
  startedAt: ts("started_at").notNull().defaultNow(),
  submittedAt: ts("submitted_at"),
  late: boolean("late").notNull().default(false),
  effectiveDueAt: ts("effective_due_at"),
  /** composição congelada no envio: [{userId,name,email}] */
  membersSnapshot: jsonb("members_snapshot").notNull().default(sql`'[]'::jsonb`),
  links: jsonb("links").notNull().default(sql`'[]'::jsonb`),
  note: text("note"),
  receiptHash: text("receipt_hash"),
  returnedReason: text("returned_reason"),
  createdAt: createdAt(),
}, (t) => [index("submissions_assignment_idx").on(t.assignmentId), index("submissions_group_idx").on(t.groupId)]);

export const submissionFiles = pgTable("submission_files", {
  submissionId: text("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  fileId: text("file_id").notNull().references(() => files.id),
  addedAt: createdAt(),
}, (t) => [primaryKey({ columns: [t.submissionId, t.fileId] })]);

export const grades = pgTable("grades", {
  id: id(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id),
  classId: text("class_id").notNull().references(() => classes.id),
  submissionId: text("submission_id").references(() => submissions.id),
  userId: text("user_id").notNull().references(() => users.id),
  rubricVersionId: text("rubric_version_id").references(() => rubricVersions.id),
  /** {criterionKey: score} */
  scores: jsonb("scores").notNull().default(sql`'{}'::jsonb`),
  total: numeric("total", { precision: 8, scale: 3 }),
  /** nao_corrigido | corrigido | dispensado | nao_entregue | zero */
  status: text("status").notNull().default("nao_corrigido"),
  comments: text("comments"),
  feedbackFileId: text("feedback_file_id").references(() => files.id),
  /** defesa individual: {score, notes} registrado separadamente da entrega coletiva */
  individualDefense: jsonb("individual_defense"),
  gradedBy: text("graded_by").references(() => users.id),
  gradedAt: ts("graded_at"),
  publishedAt: ts("published_at"),
  publishedBy: text("published_by").references(() => users.id),
  createdAt: createdAt(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("grades_assignment_user_uq").on(t.assignmentId, t.userId)]);

export const gradeHistory = pgTable("grade_history", {
  id: id(),
  gradeId: text("grade_id").notNull().references(() => grades.id, { onDelete: "cascade" }),
  snapshot: jsonb("snapshot").notNull(),
  reason: text("reason").notNull(),
  changedBy: text("changed_by").references(() => users.id),
  changedAt: createdAt(),
});

/* Teste cego: congelamento e liberação OOT */
export const modelFreezes = pgTable("model_freezes", {
  id: id(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id),
  groupId: text("group_id").references(() => groups.id),
  userId: text("user_id").references(() => users.id),
  manifestFileId: text("manifest_file_id").references(() => files.id),
  manifestSha256: text("manifest_sha256").notNull(),
  artifactHashes: jsonb("artifact_hashes").notNull().default(sql`'[]'::jsonb`),
  modelVersion: text("model_version").notNull(),
  frozenAt: ts("frozen_at").notNull().defaultNow(),
  frozenBy: text("frozen_by").references(() => users.id),
  notes: text("notes"),
});

export const blindTests = pgTable("blind_tests", {
  id: id(),
  assignmentId: text("assignment_id").notNull().references(() => assignments.id),
  datasetId: text("dataset_id").references(() => datasets.id),
  ootFileId: text("oot_file_id").references(() => files.id),       // sem desfecho, liberado após congelamento
  labelsFileId: text("labels_file_id").references(() => files.id), // rótulos verdadeiros: somente professor
  releasePolicy: text("release_policy").notNull().default("apos_congelamento"),
  maxSubmissions: integer("max_submissions").notNull().default(1),
  feedbackLevel: text("feedback_level").notNull().default("recibo"), // recibo | agregado | completo
  expectedIds: integer("expected_ids"),
  createdAt: createdAt(),
});

export const blindSubmissions = pgTable("blind_submissions", {
  id: id(),
  blindTestId: text("blind_test_id").notNull().references(() => blindTests.id),
  groupId: text("group_id").references(() => groups.id),
  userId: text("user_id").notNull().references(() => users.id),
  fileId: text("file_id").notNull().references(() => files.id),
  freezeId: text("freeze_id").references(() => modelFreezes.id),
  submissionNo: integer("submission_no").notNull(),
  validation: jsonb("validation"),            // contagem de ids, duplicados, ausentes (público)
  metrics: jsonb("metrics"),                  // PRIVADO até publicação
  isException: boolean("is_exception").notNull().default(false),
  exceptionReason: text("exception_reason"),
  submittedAt: ts("submitted_at").notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Avisos, notificações e auditoria                                     */
/* ------------------------------------------------------------------ */
export const notices = pgTable("notices", {
  id: id(),
  classId: text("class_id").notNull().references(() => classes.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: ts("published_at"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: createdAt(),
});

export const notifications = pgTable("notifications", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  classId: text("class_id").references(() => classes.id),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  link: text("link"),
  readAt: ts("read_at"),
  createdAt: createdAt(),
}, (t) => [index("notifications_user_idx").on(t.userId, t.readAt)]);

export const auditLog = pgTable("audit_log", {
  id: id(),
  actorUserId: text("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  classId: text("class_id"),
  details: jsonb("details"),
  ipHash: text("ip_hash"),
  createdAt: createdAt(),
}, (t) => [index("audit_entity_idx").on(t.entity, t.entityId), index("audit_class_idx").on(t.classId, t.createdAt)]);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});
