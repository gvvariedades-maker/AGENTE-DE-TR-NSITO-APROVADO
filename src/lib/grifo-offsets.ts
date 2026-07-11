/**
 * Utilitários de grifo legal — indexOf, Guardrail 2 (anti-corte) e Guardrail 3 (texto_grifado).
 */

export interface GrifoInput {
  inicio: number;
  fim: number;
  motivo: string;
  texto_grifado?: string;
}

export interface GrifoValidado {
  inicio: number;
  fim: number;
  motivo: string;
  texto_grifado: string;
}

export type CodigoErroGrifo = "G2" | "G3" | "bounds" | "overlap" | "G3_missing";

export interface ErroGrifo {
  codigo: CodigoErroGrifo;
  mensagem: string;
}

export function isAlfanumerico(c: string): boolean {
  return /[a-zA-Z0-9áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(c);
}

export function isWordBoundaryAt(texto: string, index: number): boolean {
  if (index <= 0 || index >= texto.length) return true;
  return !isAlfanumerico(texto[index - 1]!) || !isAlfanumerico(texto[index]!);
}

export function validarLimitesPalavra(
  texto: string,
  inicio: number,
  fim: number,
): ErroGrifo | null {
  if (
    inicio > 0 &&
    isAlfanumerico(texto[inicio - 1]!) &&
    isAlfanumerico(texto[inicio]!)
  ) {
    return {
      codigo: "G2",
      mensagem: `grifo corta início de palavra em ${inicio} (…${texto.slice(Math.max(0, inicio - 3), inicio + 5)}…)`,
    };
  }
  if (
    fim < texto.length &&
    isAlfanumerico(texto[fim - 1]!) &&
    isAlfanumerico(texto[fim]!)
  ) {
    return {
      codigo: "G2",
      mensagem: `grifo corta fim de palavra em ${fim} (…${texto.slice(Math.max(0, fim - 5), fim + 3)}…)`,
    };
  }
  return null;
}

export function sliceMatchesGrifo(texto: string, grifo: GrifoInput): boolean {
  if (!grifo.texto_grifado) return false;
  return texto.slice(grifo.inicio, grifo.fim) === grifo.texto_grifado;
}

export function countOccurrences(texto: string, substring: string): number {
  if (!substring) return 0;
  let count = 0;
  let from = 0;
  while (true) {
    const idx = texto.indexOf(substring, from);
    if (idx === -1) break;
    count++;
    from = idx + 1;
  }
  return count;
}

export function findSubstringIndex(
  texto: string,
  substring: string,
  occurrence = 0,
): number {
  let idx = -1;
  let from = 0;
  for (let i = 0; i <= occurrence; i++) {
    idx = texto.indexOf(substring, from);
    if (idx === -1) return -1;
    from = idx + 1;
  }
  return idx;
}

export function buildGrifoFromSubstring(
  texto: string,
  substring: string,
  motivo: string,
  occurrence?: number,
): GrifoValidado {
  const count = countOccurrences(texto, substring);
  if (count === 0) {
    throw new Error(`Substring não encontrada em texto: "${substring}"`);
  }
  if (occurrence === undefined && count > 1) {
    throw new Error(
      `Substring "${substring}" aparece ${count} vezes; informe occurrence (0..${count - 1})`,
    );
  }
  const occ = occurrence ?? 0;
  const inicio = findSubstringIndex(texto, substring, occ);
  const fim = inicio + substring.length;
  return { inicio, fim, texto_grifado: substring, motivo };
}

export interface ValidarGrifosOptions {
  legacyGrifos?: boolean;
  telaId?: string;
}

export function validarGrifosTrechoLegal(
  texto: string,
  grifos: GrifoInput[],
  opts: ValidarGrifosOptions = {},
): ErroGrifo[] {
  const erros: ErroGrifo[] = [];
  const sorted = [...grifos].sort((a, b) => a.inicio - b.inicio);
  const prefix = opts.telaId ? `Tela "${opts.telaId}": ` : "";

  for (let i = 0; i < sorted.length; i++) {
    const g = sorted[i]!;

    if (g.inicio < 0 || g.fim <= g.inicio || g.fim > texto.length) {
      erros.push({
        codigo: "bounds",
        mensagem: `${prefix}grifo fora dos limites [${g.inicio}:${g.fim}] (texto.length=${texto.length})`,
      });
      continue;
    }

    const g2 = validarLimitesPalavra(texto, g.inicio, g.fim);
    if (g2) {
      erros.push({ ...g2, mensagem: prefix + g2.mensagem });
    }

    if (!g.texto_grifado?.trim()) {
      if (!opts.legacyGrifos) {
        erros.push({
          codigo: "G3_missing",
          mensagem: `${prefix}texto_grifado obrigatório`,
        });
      }
      continue;
    }

    const slice = texto.slice(g.inicio, g.fim);
    if (slice !== g.texto_grifado) {
      erros.push({
        codigo: "G3",
        mensagem: `${prefix}texto_grifado "${g.texto_grifado}" ≠ slice "${slice}" em [${g.inicio}:${g.fim}] …${texto.slice(Math.max(0, g.inicio - 5), Math.min(texto.length, g.fim + 5))}…`,
      });
    }
    if (g.fim - g.inicio !== g.texto_grifado.length) {
      erros.push({
        codigo: "G3",
        mensagem: `${prefix}comprimento texto_grifado (${g.texto_grifado.length}) ≠ fim-inicio (${g.fim - g.inicio})`,
      });
    }

    if (i > 0) {
      const prev = sorted[i - 1]!;
      if (g.inicio < prev.fim) {
        erros.push({
          codigo: "overlap",
          mensagem: `${prefix}grifo [${g.inicio}:${g.fim}] sobrepõe [${prev.inicio}:${prev.fim}]`,
        });
      }
    }
  }

  return erros;
}

/** Preview textual de um grifo no contexto do trecho. */
export function formatarPreviewGrifo(
  texto: string,
  grifo: GrifoInput,
): string {
  const slice = texto.slice(grifo.inicio, grifo.fim);
  const antes = texto.slice(Math.max(0, grifo.inicio - 12), grifo.inicio);
  const depois = texto.slice(grifo.fim, Math.min(texto.length, grifo.fim + 12));
  return `  [${grifo.inicio}:${grifo.fim}] "${slice}" ← ${grifo.motivo}\n  …${antes}[${slice}]${depois}…`;
}
