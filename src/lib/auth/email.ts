/**
 * Normalização de e-mail: remove espaços, aplica minúsculas ao domínio e à parte local.
 * Não remove pontos nem sufixos "+": endereços diferentes permanecem diferentes.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().replace(/\s+/g, "").toLowerCase();
}

export function isValidEmail(e: string): boolean {
  if (e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}
