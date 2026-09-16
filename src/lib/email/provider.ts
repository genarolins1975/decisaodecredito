import "server-only";

export type OutgoingEmail = {
  to: string; toName?: string; subject: string; text: string; html?: string;
};
export type SendResult = { providerMessageId: string };

export interface EmailProvider {
  readonly name: "gmail" | "outbox";
  /** Verifica se há remetente configurado e pronto (Gmail conectado). */
  ready(): Promise<{ ok: boolean; sender?: string; reason?: string }>;
  /** Entrega ao provedor. "Aceito" não significa entregue ao destinatário. */
  send(msg: OutgoingEmail): Promise<SendResult>;
}

export class EmailProviderError extends Error {
  constructor(message: string, public retryable: boolean, public code?: string) { super(message); }
}
