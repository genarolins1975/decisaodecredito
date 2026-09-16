import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const gen = customAlphabet(alphabet, 21);
/** Identificador opaco, seguro para URL. */
export const newId = () => gen();

/** Código humano curto, sem caracteres ambíguos (para chamada e credenciais). */
const humanAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const humanCode = (n = 6) => customAlphabet(humanAlphabet, n)();
