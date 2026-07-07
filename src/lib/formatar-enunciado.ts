export interface EnunciadoAssertivas {
  tipo: "assertivas";
  intro: string;
  assertivas: string[];
  comando?: string;
}

export interface EnunciadoSimples {
  tipo: "simples";
  texto: string;
}

export type EnunciadoPartes = EnunciadoAssertivas | EnunciadoSimples;

const ROMAN_MARKER = /^(I{1,3}|IV|V)\.\s+/;

const COMANDO_FIM =
  /(\n\n|\s+)(Está CORRETO o que se afirma em:|Está INCORRETO o que se afirma em:|Está correto o que se afirma em:|Está incorreto o que se afirma em:|assinale a alternativa CORRETA:?|assinale a alternativa INCORRETA:?)\s*$/i;

/** Detecta e separa intro + assertivas I–V + comando final (IDECAN). */
export function parseEnunciado(enunciado: string): EnunciadoPartes {
  const texto = enunciado.replace(/\r\n/g, "\n").trim();
  const partes = texto.split(/\s+(?=(?:I{1,3}|IV|V)\.\s)/);

  if (partes.length < 3) {
    return { tipo: "simples", texto };
  }

  const intro = partes[0].trim();
  const assertivas: string[] = [];
  let comando = "";

  for (let i = 1; i < partes.length; i++) {
    const part = partes[i].trim();
    const isUltima = i === partes.length - 1;

    if (isUltima) {
      const match = part.match(COMANDO_FIM);
      if (match && match.index !== undefined && match.index > 0) {
        assertivas.push(part.slice(0, match.index).trim());
        comando = (match[2] ?? "").trim();
      } else {
        assertivas.push(part);
      }
    } else {
      assertivas.push(part);
    }
  }

  const validas =
    assertivas.length >= 2 &&
    assertivas.every((a) => ROMAN_MARKER.test(a));

  if (!validas) {
    return { tipo: "simples", texto };
  }

  return { tipo: "assertivas", intro, assertivas, comando: comando || undefined };
}
