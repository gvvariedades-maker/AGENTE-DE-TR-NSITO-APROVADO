/** Nível de domínio por microtópico estudável (Anexo I com questão no banco). */
export type NivelDominio =
  | "nao_visto"
  | "aprendendo"
  | "formando"
  | "dominado";

export interface TentativaDominio {
  acertou: boolean;
  createdAt: Date;
}

export const DOMINIO_LABELS: Record<NivelDominio, string> = {
  nao_visto: "Não visto",
  aprendendo: "Aprendendo",
  formando: "Formando",
  dominado: "Dominado",
};

/** Intervalo mínimo entre os 2 últimos acertos (03-estudo-reverso.mdc). */
export const DOMINIO_INTERVALO_MS = 60 * 60 * 1000;

/**
 * Classifica domínio a partir do histórico de tentativas no microtópico.
 * Dominado = 2 acertos seguidos (mais recentes), espaçados ≥ 1h.
 */
export function classificarDominio(
  tentativas: readonly TentativaDominio[],
): NivelDominio {
  if (tentativas.length === 0) return "nao_visto";

  const ordenadas = [...tentativas].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  if (
    ordenadas.length >= 2 &&
    ordenadas[0].acertou &&
    ordenadas[1].acertou &&
    ordenadas[0].createdAt.getTime() - ordenadas[1].createdAt.getTime() >=
      DOMINIO_INTERVALO_MS
  ) {
    return "dominado";
  }

  if (!tentativas.some((t) => t.acertou)) return "aprendendo";
  return "formando";
}

/** Versão otimizada para agregação SQL (contagens + 2 últimas tentativas). */
export function classificarDominioAgregado(input: {
  tentativas: number;
  acertos: number;
  ultimasDuas: readonly TentativaDominio[];
}): NivelDominio {
  if (input.tentativas === 0) return "nao_visto";
  if (classificarDominio(input.ultimasDuas) === "dominado") return "dominado";
  if (input.acertos === 0) return "aprendendo";
  return "formando";
}

export interface ContagemDominio {
  total: number;
  nao_visto: number;
  aprendendo: number;
  formando: number;
  dominado: number;
}

export const CONTAGEM_DOMINIO_VAZIA: ContagemDominio = {
  total: 0,
  nao_visto: 0,
  aprendendo: 0,
  formando: 0,
  dominado: 0,
};

export function criarContagemDominio(): ContagemDominio {
  return { ...CONTAGEM_DOMINIO_VAZIA };
}

export function registrarNivelDominio(
  contagem: ContagemDominio,
  nivel: NivelDominio,
): void {
  contagem.total += 1;
  contagem[nivel] += 1;
}

/** Microtópicos estudáveis ainda sem domínio consolidado — base do débito diário. */
export function calcularBacklogDominio(contagem: ContagemDominio): number {
  return Math.max(0, contagem.total - contagem.dominado);
}
