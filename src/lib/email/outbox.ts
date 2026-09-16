import "server-only";
import { EmailProviderError, type EmailProvider } from "./provider";

/**
 * Provedor "outbox": as mensagens ficam na fila do banco, visíveis no painel,
 * e NUNCA são enviadas. Serve para desenvolvimento, homologação e testes.
 * Em produção o envio exige a conta Gmail conectada pelo professor.
 */
export const outboxProvider: EmailProvider = {
  name: "outbox",
  async ready() {
    return { ok: false, reason: "Modo fila sem envio (EMAIL_PROVIDER=outbox): nenhuma mensagem sai da plataforma" };
  },
  async send() {
    throw new EmailProviderError("Envio desativado neste ambiente (fila sem remetente)", false, "outbox");
  },
};
