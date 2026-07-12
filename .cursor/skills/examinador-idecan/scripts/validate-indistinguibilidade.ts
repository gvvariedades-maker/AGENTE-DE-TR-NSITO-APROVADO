/**
 * Heurísticas automáticas da rubrica de indistinguibilidade IDECAN.
 * Complementa validate-questao.ts (schema + citações).
 *
 * Uso:
 *   npx tsx .cursor/skills/examinador-idecan/scripts/validate-indistinguibilidade.ts content/questoes/.../lote.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DIFICULDADE_MINIMA_BANCO } from "../../../../src/lib/validations/dificuldade-banco";
import { listarAchadosDistratorOnCase } from "../../../../src/lib/validations/questao-mecanismo";
import { questoesImportFileSchema, type QuestaoSeedImportInput } from "../../../../src/lib/validations/questao";

type Disciplina = QuestaoSeedImportInput["disciplina"];

const FAIXAS_ENUNCIADO: Partial<Record<Disciplina, { min: number; max: number }>> = {
  legislacao_transito: { min: 250, max: 500 },
  direito_administrativo: { min: 200, max: 450 },
  direito_constitucional: { min: 300, max: 550 },
  legislacao_etica_sp: { min: 250, max: 500 },
  informatica: { min: 300, max: 550 },
  historia_cg_pb: { min: 200, max: 450 },
  portugues: { min: 80, max: 200 },
};

const FAIXAS_ALTERNATIVA: Partial<Record<Disciplina, { min: number; max: number }>> = {
  legislacao_transito: { min: 70, max: 130 },
  direito_administrativo: { min: 70, max: 130 },
  direito_constitucional: { min: 80, max: 140 },
  legislacao_etica_sp: { min: 80, max: 140 },
  informatica: { min: 40, max: 80 },
  historia_cg_pb: { min: 60, max: 120 },
  portugues: { min: 50, max: 90 },
};

const PORTUGUES_TEXTO_BASE_MIN = 800;

const VICIOS_LLM = [
  /é importante (ressaltar|notar|destacar)/i,
  /conforme (a )?doutrina/i,
  /obviamente/i,
  /veja (que|como)/i,
  /conforme vimos/i,
  /neste sentido/i,
  /vale (ressaltar|destacar)/i,
];

const COMANDOS_IDECAN = [
  /assinale a alternativa correta/i,
  /assinale a alternativa incorreta/i,
  /assinale a (opção|alternativa) (correta|incorreta)/i,
  /estão corretas?/i,
  /estão incorretas?/i,
  /analise as afirmativas/i,
  /associe/i,
  /correspondência/i,
  /assertivas?/i,
  /afirmativas?/i,
  /\bI[\s\.\)]/,
];

const ESTILOS_VALIDOS = new Set([
  "pegadinha_pode_deve",
  "pegadinha_prazo",
  "pegadinha_percentual",
  "assertivas",
  "correspondencia",
  "incorreta",
  "caso_pratico",
  "lei_seca",
  "interpretacao_texto",
  "conceito_informatica",
]);

const MECANISMO_SLUGS = [
  "numero_vizinho",
  "competencia_snt",
  "gravidade",
  "regra_excecao",
  "termo_unico",
] as const;

type Nivel = "erro" | "aviso" | "ok";

interface Achado {
  questao: number;
  topico: string;
  nivel: Nivel;
  codigo: string;
  mensagem: string;
}

function ratioMaxMin(lengths: number[]): number {
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  if (min === 0) return max > 0 ? Infinity : 1;
  return max / min;
}

function temComandoExplicito(enunciado: string): boolean {
  return COMANDOS_IDECAN.some((re) => re.test(enunciado));
}

function validarQuestao(q: QuestaoSeedImportInput, index: number): Achado[] {
  const achados: Achado[] = [];
  const n = index + 1;
  const push = (nivel: Nivel, codigo: string, mensagem: string) => {
    achados.push({ questao: n, topico: q.topico, nivel, codigo, mensagem });
  };

  const keys = Object.keys(q.alternativas).sort();
  const letrasValidas =
    keys.length === 5 ? (["A", "B", "C", "D", "E"] as const) : (["A", "B", "C", "D"] as const);
  if (
    keys.length !== letrasValidas.length ||
    !keys.every((k) => (letrasValidas as readonly string[]).includes(k))
  ) {
    push(
      "erro",
      "A4",
      `Esperadas exatamente ${letrasValidas.length} alternativas ${letrasValidas[0]}–${letrasValidas[letrasValidas.length - 1]}; encontrado: ${keys.join(", ")}`,
    );
  }

  const altLens = keys.map((k) => q.alternativas[k]?.length ?? 0);
  const altRatio = ratioMaxMin(altLens);
  if (altRatio > 2.2) {
    push("erro", "A3", `Alternativas desbalanceadas (razão máx/mín = ${altRatio.toFixed(2)}; meta ≤ 1,8)`);
  } else if (altRatio > 1.8) {
    push("aviso", "A3", `Alternativas levemente desbalanceadas (razão = ${altRatio.toFixed(2)})`);
  }

  const faixaAlt = FAIXAS_ALTERNATIVA[q.disciplina];
  if (faixaAlt) {
    for (const k of keys) {
      const len = q.alternativas[k]?.length ?? 0;
      if (len < faixaAlt.min * 0.7 || len > faixaAlt.max * 1.3) {
        push("aviso", "A2", `Alternativa ${k} com ${len} chars (faixa ~${faixaAlt.min}–${faixaAlt.max})`);
      }
    }
  }

  const enunciadoLen = q.enunciado.length;
  if (q.disciplina === "portugues" && enunciadoLen >= PORTUGUES_TEXTO_BASE_MIN) {
    if (enunciadoLen < PORTUGUES_TEXTO_BASE_MIN || enunciadoLen > 1800) {
      push("aviso", "A2", `Português com texto-base: ${enunciadoLen} chars (meta 800–1.500 + pergunta)`);
    }
  } else {
    const faixaEn = FAIXAS_ENUNCIADO[q.disciplina];
    if (faixaEn && (enunciadoLen < faixaEn.min * 0.7 || enunciadoLen > faixaEn.max * 1.3)) {
      push("aviso", "A2", `Enunciado com ${enunciadoLen} chars (faixa ~${faixaEn.min}–${faixaEn.max})`);
    }
  }

  for (const re of VICIOS_LLM) {
    if (re.test(q.enunciado)) {
      push("erro", "TOM", `Enunciado com vício de tom LLM: ${re.source}`);
      break;
    }
  }
  for (const k of keys) {
    for (const re of VICIOS_LLM) {
      if (re.test(q.alternativas[k] ?? "")) {
        push("aviso", "TOM", `Alternativa ${k} com tom atípico IDECAN`);
        break;
      }
    }
  }

  if (/[\u{1F300}-\u{1FAFF}]/u.test(q.enunciado)) {
    push("erro", "TOM", "Enunciado contém emoji");
  }

  if (!q.estilo_idecan?.trim()) {
    push("erro", "B2", "Campo estilo_idecan ausente");
  } else if (!ESTILOS_VALIDOS.has(q.estilo_idecan)) {
    push("aviso", "B2", `estilo_idecan não catalogado: ${q.estilo_idecan}`);
  }

  if (q.dificuldade < DIFICULDADE_MINIMA_BANCO) {
    push(
      "erro",
      "D1",
      `dificuldade ${q.dificuldade} abaixo do mínimo do banco (${DIFICULDADE_MINIMA_BANCO}) — use dificuldade_operacional nível 4+`,
    );
  }

  if (q.dificuldade >= 3) {
    if (!q.comentario.pegadinha?.trim() || q.comentario.pegadinha.length < 15) {
      push("erro", "D2", "dificuldade ≥ 3 exige comentario.pegadinha substantivo");
    }
    if (
      q.dificuldade < DIFICULDADE_MINIMA_BANCO &&
      !q.estilo_idecan?.startsWith("pegadinha_") &&
      q.estilo_idecan !== "assertivas" &&
      q.estilo_idecan !== "incorreta"
    ) {
      push("aviso", "B2", "dificuldade ≥ 3: preferir estilo_idecan de pegadinha ou assertivas");
    }
  }

  if (q.dificuldade >= DIFICULDADE_MINIMA_BANCO) {
    const passos = q.comentario.passo_a_passo?.length ?? 0;
    if (passos < 3) {
      push(
        "erro",
        "D3",
        `dificuldade ${q.dificuldade}: passo_a_passo exige ≥ 3 etapas`,
      );
    }
    if (
      !q.estilo_idecan?.startsWith("pegadinha_") &&
      q.estilo_idecan !== "assertivas" &&
      q.estilo_idecan !== "incorreta"
    ) {
      push(
        "erro",
        "B2",
        `dificuldade ≥ ${DIFICULDADE_MINIMA_BANCO}: estilo_idecan deve ser pegadinha_*, assertivas ou incorreta`,
      );
    }
  }

  if (!temComandoExplicito(q.enunciado) && q.disciplina !== "legislacao_transito") {
    push("aviso", "B3", "Sem comando explícito detectado (aceitável em ~40% do trânsito; gerais preferem comando)");
  }

  if (q.estilo_idecan === "incorreta" && !/incorreta/i.test(q.enunciado)) {
    push("aviso", "B3", "estilo incorreta mas enunciado não menciona INCORRETA");
  }

  const passo2 = q.comentario.passo_a_passo?.[1] ?? "";
  const erradas = keys.filter((k) => k !== q.gabarito);
  const slugsNoPasso2 = MECANISMO_SLUGS.filter((s) => passo2.includes(s));
  if (slugsNoPasso2.length === 0) {
    push("aviso", "C5", "passo_a_passo[1] sem slug de mecanismo (numero_vizinho, competencia_snt, gravidade, regra_excecao, termo_unico)");
  } else if (slugsNoPasso2.length < erradas.length) {
    push("aviso", "C5", `passo_a_passo[1] cita ${slugsNoPasso2.length} mecanismo(s); esperado ≥ ${erradas.length} para as erradas`);
  }
  if (q.dificuldade >= DIFICULDADE_MINIMA_BANCO && slugsNoPasso2.length < 2) {
    push(
      "erro",
      "D4",
      `dificuldade ${q.dificuldade}: passo_a_passo[1] deve citar ≥ 2 mecanismos distintos (nível 4+ cruzado)`,
    );
  }

  for (const achado of listarAchadosDistratorOnCase({
    gabarito: q.gabarito,
    enunciado: q.enunciado,
    alternativas: q.alternativas,
    passo_a_passo: q.comentario.passo_a_passo,
    dificuldade: q.dificuldade,
  })) {
    if (achado.onCase) continue;
    push(
      q.dificuldade >= DIFICULDADE_MINIMA_BANCO ? "erro" : "aviso",
      "C6",
      `alternativa ${achado.letra} off-case (${achado.mecanismo ?? "sem mecanismo"} não deriva do enunciado)`,
    );
  }

  if (q.estilo_idecan === "pegadinha_prazo" && !passo2.includes("numero_vizinho")) {
    push(
      "aviso",
      "B4",
      "estilo_idecan pegadinha_prazo mas passo 2 não cita numero_vizinho",
    );
  }
  const mecanismosCruzados = MECANISMO_SLUGS.filter((s) => passo2.includes(s));
  if (
    mecanismosCruzados.length >= 2 &&
    q.estilo_idecan?.startsWith("pegadinha_") &&
    !mecanismosCruzados.some((s) => q.estilo_idecan?.includes(s.replace("pegadinha_", "")))
  ) {
    push(
      "aviso",
      "B4",
      `estilo_idecan "${q.estilo_idecan}" não reflete todos os eixos do passo 2 — use meta.eixos_mecanismo: [${mecanismosCruzados.map((s) => `"${s}"`).join(", ")}]`,
    );
  }

  return achados;
}

function validarLote(questoes: QuestaoSeedImportInput[]): Achado[] {
  const achados: Achado[] = [];
  if (questoes.length < 8) return achados;

  const gabaritos: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  let comComando = 0;
  const porTopico: Record<string, number> = {};

  for (const q of questoes) {
    gabaritos[q.gabarito] = (gabaritos[q.gabarito] ?? 0) + 1;
    if (temComandoExplicito(q.enunciado)) comComando++;
    porTopico[q.topico] = (porTopico[q.topico] ?? 0) + 1;
  }

  const total = questoes.length;
  for (const [letra, count] of Object.entries(gabaritos)) {
    const pct = (count / total) * 100;
    if (pct < 15 || pct > 35) {
      achados.push({
        questao: 0,
        topico: "LOTE",
        nivel: "erro",
        codigo: "GAB",
        mensagem: `Gabarito ${letra} com ${pct.toFixed(0)}% (meta 15–35% por letra)`,
      });
    }
  }

  let consecutivos = 1;
  for (let i = 1; i < questoes.length; i++) {
    if (questoes[i]?.gabarito === questoes[i - 1]?.gabarito) {
      consecutivos++;
      if (consecutivos > 2) {
        achados.push({
          questao: 0,
          topico: "LOTE",
          nivel: "erro",
          codigo: "GAB",
          mensagem: `Mais de 2 gabaritos "${questoes[i]?.gabarito}" consecutivos (Q${i}–Q${i + 1})`,
        });
        break;
      }
    } else {
      consecutivos = 1;
    }
  }

  for (const [topico, count] of Object.entries(porTopico)) {
    if (count > 3) {
      achados.push({
        questao: 0,
        topico: "LOTE",
        nivel: "erro",
        codigo: "COB",
        mensagem: `Microtópico "${topico}" com ${count} questões (máx. 3 por lote)`,
      });
    }
  }

  const pctComando = (comComando / total) * 100;
  const disciplina = questoes[0]?.disciplina;
  const metaComando = disciplina === "legislacao_transito" ? 40 : 50;
  if (pctComando < metaComando - 15) {
    achados.push({
      questao: 0,
      topico: "LOTE",
      nivel: "aviso",
      codigo: "B3",
      mensagem: `Apenas ${pctComando.toFixed(0)}% com comando explícito (meta ≥ ${metaComando}%)`,
    });
  }

  return achados;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--legacy-transferencia")) {
    process.env.TRANSFERENCIA_LEGACY = "1";
  }
  const filePath = args.find((a) => !a.startsWith("--"));
  if (!filePath) {
    console.error(
      "Uso: npx tsx validate-indistinguibilidade.ts <arquivo.json> [--legacy-transferencia]",
    );
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const questoesInput = Array.isArray(json) ? json : [json];
  const result = questoesImportFileSchema.safeParse(questoesInput);

  if (!result.success) {
    console.error(`❌ Schema inválido — rode validate:questoes primeiro.\n`);
    console.error(result.error.flatten());
    process.exit(1);
  }

  const questoes = result.data;
  const todos: Achado[] = [];

  for (const [i, q] of questoes.entries()) {
    todos.push(...validarQuestao(q, i));
  }
  todos.push(...validarLote(questoes));

  const erros = todos.filter((a) => a.nivel === "erro");
  const avisos = todos.filter((a) => a.nivel === "aviso");

  console.log(`\n🔍 Indistinguibilidade — ${filePath} (${questoes.length} questões)\n`);

  for (const a of todos) {
    const prefix = a.nivel === "erro" ? "❌" : "⚠";
    const qLabel = a.questao === 0 ? "LOTE" : `Q${a.questao}`;
    console.log(`${prefix} [${a.codigo}] ${qLabel} [${a.topico}] ${a.mensagem}`);
  }

  console.log(`\nResumo: ${erros.length} erro(s), ${avisos.length} aviso(s)`);
  console.log("Rubrica manual + teste cego: ver rubrica-indistinguibilidade.md e teste-cego.md\n");

  if (erros.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
