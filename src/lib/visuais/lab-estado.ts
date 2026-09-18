/**
 * Estado do laboratório gravado no navegador e compartilhado entre páginas: política congelada (capítulo 8 e rodada 1
 * do capítulo 10), choque aplicado e rodada 2. Lido como fonte externa (useSyncExternalStore) para não divergir.
 */
export type EstadoLab = { rodada1?: { corte: number; teto: number; capacidade: number }; choque?: boolean; rodada2?: { corte: number; capacidade: number } };
export const CHAVE_LAB = "lab10.estado";
export const lerLab = (): string => { try { return localStorage.getItem(CHAVE_LAB) || "{}"; } catch { return "{}"; } };
export const gravarLab = (e: EstadoLab) => { try { localStorage.setItem(CHAVE_LAB, JSON.stringify(e)); } catch { /* sem armazenamento */ } window.dispatchEvent(new Event("lab10")); };
export const assinarLab = (cb: () => void) => { window.addEventListener("storage", cb); window.addEventListener("lab10", cb); return () => { window.removeEventListener("storage", cb); window.removeEventListener("lab10", cb); }; };
export const decodificarLab = (bruto: string): EstadoLab => { try { return JSON.parse(bruto); } catch { return {}; } };
