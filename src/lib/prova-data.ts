import { PROVA_DATA } from "@/types";

/** Dias até a prova objetiva (mínimo 0). */
export function diasParaProva(now: Date = new Date()): number {
  const diff = PROVA_DATA.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export { PROVA_DATA };
