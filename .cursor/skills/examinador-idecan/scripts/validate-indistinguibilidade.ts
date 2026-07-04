/**
 * Heurísticas automáticas da rubrica de indistinguibilidade IDECAN.
 * Complementa validate-questao.ts (schema + citações).
 *
 * Uso:
 *   npx tsx .cursor/skills/examinador-idecan/scripts/validate-indistinguibilidade.ts content/questoes/.../lote.json
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { questoesFileSchema, type QuestaoSeedInput } from "../../../../src/lib/validations/questao";

type Disciplina = QuestaoSeedInput["disciplina"];

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

function validarQuestao(q: QuestaoSeedInput, index: number): Achado[] {
  const achados: Achado[] = [];
  const n = index + 1;
  const push = (nivel: Nivel, codigo: string, mensagem: string) => {
    achados.push({ questao: n, topico: q.topico, nivel, codigo, mensagem });
  };

  const keys = Object.keys(q.alternativas).sort();
  if (keys.length !== 4 || !keys.every((k) => ["A", "B", "C", "D"].includes(k))) {
    push("erro", "A4", `Esperadas exatamente 4 alternativas A–D; encontrado: ${keys.join(", ")}`);
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

  if (q.dificuldade >= 3) {
    if (!q.comentario.pegadinha?.trim() || q.comentario.pegadinha.length < 15) {
      push("erro", "D2", "dificuldade ≥ 3 exige comentario.pegadinha substantivo");
    }
    if (!q.estilo_idecan?.startsWith("pegadinha_") && q.estilo_idecan !== "assertivas" && q.estilo_idecan !== "incorreta") {
      push("aviso", "B2", "dificuldade ≥ 3: preferir estilo_idecan de pegadinha ou assertivas");
    }
  }

  if (q.dificuldade >= 4) {
    const passos = q.comentario.passo_a_passo?.length ?? 0;
    if (passos < 3) {
      push("aviso", "D3", "dificuldade 4–5: passo_a_passo deveria ter ≥ 3 etapas");
    }
  }

  if (!temComandoExplicito(q.enunciado) && q.disciplina !== "legislacao_transito") {
    push("aviso", "B3", "Sem comando explícito detectado (aceitável em ~40% do trânsito; gerais preferem comando)");
  }

  if (q.estilo_idecan === "incorreta" && !/incorreta/i.test(q.enunciado)) {
    push("aviso", "B3", "estilo incorreta mas enunciado não menciona INCORRETA");
  }

  return achados;
}

function validarLote(questoes: QuestaoSeedInput[]): Achado[] {
  const achados: Achado[] = [];
  if (questoes.length < 8) return achados;

  const gabaritos: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  let comComando = 0;

  for (const q of questoes) {
    gabaritos[q.gabarito] = (gabaritos[q.gabarito] ?? 0) + 1;
    if (temComandoExplicito(q.enunciado)) comComando++;
  }

  const total = questoes.length;
  for (const [letra, count] of Object.entries(gabaritos)) {
    const pct = (count / total) * 100;
    if (pct < 10 || pct > 40) {
      achados.push({
        questao: 0,
        topico: "LOTE",
        nivel: "aviso",
        codigo: "GAB",
        mensagem: `Gabarito ${letra} com ${pct.toFixed(0)}% (meta ~25% por letra)`,
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
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Uso: npx tsx validate-indistinguibilidade.ts <arquivo.json>");
    process.exit(1);
  }

  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const json = JSON.parse(raw) as unknown;
  const result = questoesFileSchema.safeParse(json);

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
