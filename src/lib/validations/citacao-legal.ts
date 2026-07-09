import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export type CitacaoTipo =
  | "ctb"
  | "cf"
  | "lei"
  | "contran"
  | "senatran"
  | "sumula"
  | "ignorada";

export interface CitacaoExtraida {
  raw: string;
  tipo: CitacaoTipo;
  artigo?: string;
  leiNumero?: string;
  resolucaoNumero?: string;
  portariaNumero?: string;
}

export interface CitacaoValidacao {
  citacao: CitacaoExtraida;
  valido: boolean;
  nivel: "erro" | "aviso";
  motivo: string;
}

interface LeiFonte {
  numeros: string[];
  arquivo: string;
  rotulo: string;
}

const LEIS: LeiFonte[] = [
  {
    numeros: ["9503", "9.503"],
    arquivo: "legislação federal/lei-9503-ctb.html",
    rotulo: "CTB",
  },
  {
    numeros: ["8112", "8.112"],
    arquivo: "legislação federal/lei-8112-servidores.html",
    rotulo: "Lei 8.112/90",
  },
  {
    numeros: ["8429", "8.429"],
    arquivo: "legislação federal/lei-8429-improbidade.html",
    rotulo: "Lei 8.429/92",
  },
  {
    numeros: ["12527", "12.527"],
    arquivo: "legislação federal/lei-12527-lai.html",
    rotulo: "LAI",
  },
  {
    numeros: ["13709", "13.709"],
    arquivo: "legislação federal/lei-13709-lgpd.html",
    rotulo: "LGPD",
  },
  {
    numeros: ["9784", "9.784"],
    arquivo: "legislação federal/lei-9784-processo-administrativo.html",
    rotulo: "Lei 9.784/99",
  },
  {
    numeros: ["14133", "14.133"],
    arquivo: "legislação federal/lei-14133-licitacoes.html",
    rotulo: "Lei 14.133/21",
  },
];

const CF_ARQUIVO = "legislação federal/cf-1988.html";

const ARTIGO_RE =
  /art(?:igo)?\.?\s*(\d+(?:[-–][A-Za-z0-9]+)?)(?:\s*,\s*§\s*(\d+)(?:º|°)?)?/gi;

const LEI_RE =
  /lei\s*(?:federal\s*)?(?:n[º°.]?\s*)?(\d{1,2}\.?\d{3})(?:\/\d{2,4})?/gi;

const CONTRAN_RE =
  /(?:res(?:olução)?\.?\s*)?contran\s*n[º°.]?\s*(\d{1,4})(?:\/(\d{4}))?/gi;

const SENATRAN_RE =
  /portaria\s+senatran\s*n[º°.]?\s*(\d{1,4})(?:\/(\d{4}))?/gi;

const SUMULA_RE = /s[úu]mula\s*(\d+)/gi;

function normalizarNumeroLei(n: string): string {
  return n.replace(/\./g, "");
}

function chaveArtigo(artigo: string): string {
  return artigo.replace(/[–—]/g, "-").toLowerCase();
}

function artigoExisteNoTexto(texto: string, artigo: string): boolean {
  const norm = chaveArtigo(artigo);
  const match = norm.match(/^(\d+)(?:-([a-z0-9]+))?$/i);
  if (!match) return false;

  const [, num, sufixo] = match;
  const sufixoPattern = sufixo
    ? `(?:[-\u2013–]?${sufixo})?`
    : "(?:[-\u2013–][A-Za-z0-9]+)?";

  const padroes = [
    new RegExp(`Art\\.\\s*${num}${sufixoPattern}\\b`, "i"),
    new RegExp(`name=["']art${num}${sufixo ?? ""}["']`, "i"),
    new RegExp(`name=["']art${num}\\.`, "i"),
    new RegExp(`name=["']art${num}${sufixo ?? ""}\\.`, "i"),
  ];

  return padroes.some((p) => p.test(texto));
}

function paragrafoExisteNoTexto(
  texto: string,
  artigo: string,
  paragrafo: string,
): boolean {
  if (!artigoExisteNoTexto(texto, artigo)) return false;

  const norm = chaveArtigo(artigo);
  const match = norm.match(/^(\d+)(?:-([a-z0-9]+))?$/i);
  if (!match) return false;

  const [, num, sufixo] = match;

  // Planalto: âncoras como name="art130§2" ou art130ï¿½2 (§ em latin1/mojibake)
  const anchorRe = new RegExp(
    `name=["']art${num}${sufixo ? `[-\u2013–]?${sufixo}` : ""}(?:[^a-z\\d"'])+${paragrafo}["']`,
    "i",
  );
  if (anchorRe.test(texto)) return true;

  const artPattern = `Art\\.\\s*${num}${sufixo ? `[-\u2013–]?${sufixo}` : ""}`;
  const chunkRe = new RegExp(`${artPattern}[\\s\\S]{0,2500}`, "i");
  const chunk = texto.match(chunkRe)?.[0];
  if (!chunk) return true;

  const parRe = new RegExp(`§\\s*${paragrafo}\\s*(?:º|°)?`, "i");
  if (parRe.test(chunk)) return true;

  // Corpo do artigo com § corrompido no HTML do Planalto
  const parMojibakeRe = new RegExp(
    `(?:§|\\u00a7|ï¿½)\\s*${paragrafo}\\s*(?:º|°|ï¿½)?`,
    "i",
  );
  return parMojibakeRe.test(chunk);
}

export function extrairCitacoes(texto: string): CitacaoExtraida[] {
  const encontradas: CitacaoExtraida[] = [];
  const vistos = new Set<string>();

  const registrar = (citacao: CitacaoExtraida) => {
    const chave = JSON.stringify(citacao);
    if (vistos.has(chave)) return;
    vistos.add(chave);
    encontradas.push(citacao);
  };

  const contextoCtb =
    /\b(?:ctb|c[oó]digo de tr[aâ]nsito brasileiro)\b/i.test(texto);

  for (const match of texto.matchAll(ARTIGO_RE)) {
    const raw = match[0];
    const artigo = match[1];
    const paragrafo = match[2];

    if (/\b(?:cf|constitui[cç][aã]o)\b/i.test(texto.slice(Math.max(0, match.index! - 40), match.index! + raw.length + 20))) {
      registrar({ raw, tipo: "cf", artigo });
      continue;
    }

    if (contextoCtb || /\bctb\b/i.test(texto)) {
      registrar({ raw, tipo: "ctb", artigo: paragrafo ? `${artigo}§${paragrafo}` : artigo });
      continue;
    }

    registrar({ raw, tipo: "lei", artigo });
  }

  for (const match of texto.matchAll(LEI_RE)) {
    registrar({
      raw: match[0],
      tipo: "lei",
      leiNumero: normalizarNumeroLei(match[1]),
    });
  }

  for (const match of texto.matchAll(CONTRAN_RE)) {
    registrar({
      raw: match[0],
      tipo: "contran",
      resolucaoNumero: match[1].replace(/^0+/, "") || match[1],
    });
  }

  for (const match of texto.matchAll(SENATRAN_RE)) {
    registrar({
      raw: match[0],
      tipo: "senatran",
      portariaNumero: match[1].replace(/^0+/, "") || match[1],
    });
  }

  for (const match of texto.matchAll(SUMULA_RE)) {
    registrar({
      raw: match[0],
      tipo: "sumula",
    });
  }

  return encontradas;
}

export class CorpusLegal {
  private readonly leiTextos = new Map<string, string>();
  private readonly contranNumeros = new Set<string>();
  private readonly senatranNumeros = new Set<string>();

  static async carregar(conteudoDir: string): Promise<CorpusLegal> {
    const corpus = new CorpusLegal();

    for (const lei of LEIS) {
      const path = join(conteudoDir, lei.arquivo);
      try {
        const html = await readFile(path, "latin1");
        for (const n of lei.numeros) {
          corpus.leiTextos.set(normalizarNumeroLei(n), html);
        }
      } catch {
        // fonte ausente — validações dessa lei falharão com mensagem clara
      }
    }

    try {
      const cf = await readFile(join(conteudoDir, CF_ARQUIVO), "latin1");
      corpus.leiTextos.set("cf", cf);
    } catch {
      // CF ausente
    }

    try {
      const contranDir = join(conteudoDir, "resoluções CONTRAN");
      const files = await readdir(contranDir);
      for (const file of files) {
        for (const m of file.matchAll(/(\d{1,4})/g)) {
          const n = m[1].replace(/^0+/, "") || m[1];
          if (n.length >= 2) corpus.contranNumeros.add(n);
        }
      }
    } catch {
      // pasta ausente
    }

    try {
      const senatranDir = join(conteudoDir, "senatran");
      const files = await readdir(senatranDir);
      for (const file of files) {
        for (const m of file.matchAll(/(\d{2,4})/g)) {
          const n = m[1].replace(/^0+/, "") || m[1];
          corpus.senatranNumeros.add(n);
        }
      }
    } catch {
      // pasta ausente
    }

    return corpus;
  }

  private textoLei(numero?: string): string | undefined {
    if (!numero) return undefined;
    return this.leiTextos.get(normalizarNumeroLei(numero));
  }

  validar(citacao: CitacaoExtraida): CitacaoValidacao {
    switch (citacao.tipo) {
      case "ctb": {
        const texto = this.leiTextos.get("9503");
        if (!texto) {
          return {
            citacao,
            valido: false,
            nivel: "erro",
            motivo: "Fonte CTB não encontrada em conteúdo/legislação federal/",
          };
        }
        const artigo = citacao.artigo?.split("§")[0] ?? "";
        const paragrafo = citacao.artigo?.includes("§")
          ? citacao.artigo.split("§")[1]
          : undefined;

        if (!artigoExisteNoTexto(texto, artigo)) {
          return {
            citacao,
            valido: false,
            nivel: "erro",
            motivo: `Artigo ${artigo} não encontrado no CTB local`,
          };
        }

        if (paragrafo && !paragrafoExisteNoTexto(texto, artigo, paragrafo)) {
          return {
            citacao,
            valido: true,
            nivel: "aviso",
            motivo: `§ ${paragrafo} do art. ${artigo} não confirmado no trecho do CTB (revisar manualmente)`,
          };
        }

        return {
          citacao,
          valido: true,
          nivel: "erro",
          motivo: "CTB verificado",
        };
      }

      case "cf": {
        const texto = this.leiTextos.get("cf");
        if (!texto) {
          return {
            citacao,
            valido: false,
            nivel: "erro",
            motivo: "CF/88 não encontrada em conteúdo/legislação federal/",
          };
        }
        const artigo = citacao.artigo ?? "";
        if (!artigoExisteNoTexto(texto, artigo)) {
          return {
            citacao,
            valido: false,
            nivel: "erro",
            motivo: `Art. ${artigo} não encontrado na CF/88 local`,
          };
        }
        return {
          citacao,
          valido: true,
          nivel: "erro",
          motivo: "CF/88 verificada",
        };
      }

      case "lei": {
        if (citacao.leiNumero && !citacao.artigo) {
          const texto = this.textoLei(citacao.leiNumero);
          if (!texto) {
            return {
              citacao,
              valido: false,
              nivel: "aviso",
              motivo: `Lei ${citacao.leiNumero} sem arquivo local em conteúdo/`,
            };
          }
          return {
            citacao,
            valido: true,
            nivel: "erro",
            motivo: "Lei encontrada localmente",
          };
        }

        if (citacao.artigo) {
          for (const lei of LEIS) {
            const texto = this.textoLei(lei.numeros[0]);
            if (texto && artigoExisteNoTexto(texto, citacao.artigo)) {
              return {
                citacao,
                valido: true,
                nivel: "erro",
                motivo: `Art. ${citacao.artigo} encontrado em ${lei.rotulo}`,
              };
            }
          }
          return {
            citacao,
            valido: false,
            nivel: "erro",
            motivo: `Art. ${citacao.artigo} não encontrado nas leis indexadas localmente`,
          };
        }

        return {
          citacao,
          valido: true,
          nivel: "aviso",
          motivo: "Citação genérica de lei — sem artigo para verificar",
        };
      }

      case "contran": {
        const n = citacao.resolucaoNumero ?? "";
        if (this.contranNumeros.has(n)) {
          return {
            citacao,
            valido: true,
            nivel: "erro",
            motivo: `Resolução CONTRAN ${n} encontrada em conteúdo/resoluções CONTRAN/`,
          };
        }
        return {
          citacao,
          valido: false,
          nivel: "erro",
          motivo: `Resolução CONTRAN ${n} não encontrada em conteúdo/resoluções CONTRAN/`,
        };
      }

      case "senatran": {
        const n = citacao.portariaNumero ?? "";
        if (this.senatranNumeros.has(n)) {
          return {
            citacao,
            valido: true,
            nivel: "erro",
            motivo: `Portaria SENATRAN ${n} encontrada em conteúdo/senatran/`,
          };
        }
        return {
          citacao,
          valido: false,
          nivel: "erro",
          motivo: `Portaria SENATRAN ${n} não encontrada em conteúdo/senatran/`,
        };
      }

      case "sumula":
        return {
          citacao,
          valido: true,
          nivel: "aviso",
          motivo: "Súmula — verificação manual necessária",
        };

      default:
        return {
          citacao,
          valido: true,
          nivel: "aviso",
          motivo: "Tipo de citação não verificável automaticamente",
        };
    }
  }
}

export function validarTextosLegais(
  textos: string[],
  corpus: CorpusLegal,
): CitacaoValidacao[] {
  const resultados: CitacaoValidacao[] = [];
  const chaves = new Set<string>();

  for (const texto of textos) {
    if (!texto?.trim()) continue;
    for (const citacao of extrairCitacoes(texto)) {
      const chave = JSON.stringify(citacao);
      if (chaves.has(chave)) continue;
      chaves.add(chave);
      resultados.push(corpus.validar(citacao));
    }
  }

  return resultados;
}

export function validarQuestaoLegislacao(
  fundamentoLegal: string,
  estudoReverso: string[],
  corpus: CorpusLegal,
): CitacaoValidacao[] {
  return validarTextosLegais([fundamentoLegal, ...estudoReverso], corpus);
}
