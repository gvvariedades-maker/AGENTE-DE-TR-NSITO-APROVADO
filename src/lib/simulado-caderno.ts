import type { Disciplina } from "@/types";
import { SIMULADO_ESPELHO_DISTRIBUICAO } from "@/types";

export type BucketDificuldade = "facil" | "medio" | "dificil";

export interface CotasDificuldade {
  facil: number;
  medio: number;
  dificil: number;
}

export interface CandidatoCaderno {
  id: string;
  topicId: string;
  disciplina: Disciplina;
  dificuldade: number;
  estiloIdecan: string | null;
  tags: string[];
  isReal: boolean;
}

export interface MixDificuldade {
  facil: number;
  medio: number;
  dificil: number;
}

export interface MetaCadernoEspelho {
  mixDificuldade: MixDificuldade;
  reaisCount: number;
  ineditasCount: number;
  reusoCount: number;
  porDisciplina: Partial<Record<Disciplina, number>>;
}

export interface MontarCadernoInput {
  porDisciplina: Partial<Record<Disciplina, CandidatoCaderno[]>>;
  excluirIds?: Set<string>;
  lruRank?: Map<string, number>;
  rng?: () => number;
}

export interface MontarCadernoResult {
  ids: string[];
  meta: MetaCadernoEspelho;
}

const ESTILOS_PEGADINHA = ["pegadinha", "incorreta", "assertivas"] as const;
const CAP_ESTILO_PEGADINHA = 0.4;

/** Cotas 20% fácil · 50% médio · 30% difícil (arredondamento por maior resto). */
export function distribuirCotasDificuldade(n: number): CotasDificuldade {
  if (n <= 0) return { facil: 0, medio: 0, dificil: 0 };

  const props = [0.2, 0.5, 0.3] as const;
  const exact = props.map((p) => n * p);
  const floors = exact.map(Math.floor);
  const restante = n - floors.reduce((a, b) => a + b, 0);
  const frac = exact
    .map((e, i) => ({ i, frac: e - floors[i] }))
    .sort((a, b) => b.frac - a.frac);

  for (let k = 0; k < restante; k++) {
    floors[frac[k % frac.length].i] += 1;
  }

  return { facil: floors[0], medio: floors[1], dificil: floors[2] };
}

export function classificarBucket(dificuldade: number): BucketDificuldade {
  if (dificuldade <= 2) return "facil";
  if (dificuldade === 3) return "medio";
  return "dificil";
}

function isEstiloPegadinha(estiloIdecan: string | null): boolean {
  if (!estiloIdecan) return false;
  const lower = estiloIdecan.toLowerCase();
  return ESTILOS_PEGADINHA.some((e) => lower.includes(e));
}

function embaralhar<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function maxPorTopic(uniqueTopics: number): number {
  return uniqueTopics < 8 ? 3 : 2;
}

function agruparPorBucket(
  candidatos: CandidatoCaderno[],
): Record<BucketDificuldade, CandidatoCaderno[]> {
  const buckets: Record<BucketDificuldade, CandidatoCaderno[]> = {
    facil: [],
    medio: [],
    dificil: [],
  };
  for (const c of candidatos) {
    buckets[classificarBucket(c.dificuldade)].push(c);
  }
  return buckets;
}

/** Tercis relativos da disciplina quando buckets absolutos não cobrem o estoque. */
function classificarBucketRelativo(
  candidatos: CandidatoCaderno[],
  candidato: CandidatoCaderno,
): BucketDificuldade {
  const ordenados = [...candidatos].sort((a, b) => a.dificuldade - b.dificuldade);
  const idx = ordenados.findIndex((c) => c.id === candidato.id);
  if (idx < 0 || ordenados.length === 0) return "medio";

  const tercil = Math.floor((idx / ordenados.length) * 3);
  if (tercil <= 0) return "facil";
  if (tercil >= 2) return "dificil";
  return "medio";
}

function redistribuirCotasVazias(
  cotas: CotasDificuldade,
  estoque: Record<BucketDificuldade, CandidatoCaderno[]>,
): CotasDificuldade {
  const result = { ...cotas };
  const buckets: BucketDificuldade[] = ["facil", "medio", "dificil"];

  for (const bucket of buckets) {
    if (result[bucket] > 0 && estoque[bucket].length === 0) {
      const sobra = result[bucket];
      result[bucket] = 0;
      const destinos = buckets.filter(
        (b) => b !== bucket && estoque[b].length > 0,
      );
      if (destinos.length === 0) continue;

      const pesos: Partial<Record<BucketDificuldade, number>> =
        bucket === "facil"
          ? { medio: 0.5, dificil: 0.3 }
          : bucket === "dificil"
            ? { facil: 0.2, medio: 0.5 }
            : { facil: 0.2, dificil: 0.3 };

      let alocado = 0;
      for (const dest of destinos) {
        const peso = pesos[dest] ?? 1 / destinos.length;
        const parte = Math.floor(sobra * peso);
        result[dest] += parte;
        alocado += parte;
      }
      const rest = sobra - alocado;
      if (rest > 0) {
        result[destinos[0]] += rest;
      }
    }
  }

  return result;
}

interface EstadoSelecao {
  idsNoCaderno: Set<string>;
  topicCounts: Map<string, number>;
  pegadinhaCount: number;
  totalSelecionado: number;
  reusoCount: number;
  selecionados: CandidatoCaderno[];
}

function ordenarPool(
  pool: CandidatoCaderno[],
  estado: EstadoSelecao,
  rng: () => number,
  lruRank: Map<string, number>,
  permitirReuso: boolean,
  excluirIds: Set<string>,
): CandidatoCaderno[] {
  const capPegadinha = Math.floor(
    (estado.totalSelecionado + pool.length) * CAP_ESTILO_PEGADINHA,
  );

  const real = pool.filter((c) => c.isReal);
  const ineditas = pool.filter((c) => !c.isReal);

  const ordenarGrupo = (grupo: CandidatoCaderno[]) => {
    const comScore = grupo.map((c) => {
      let score = rng();
      if (isEstiloPegadinha(c.estiloIdecan)) {
        if (estado.pegadinhaCount >= capPegadinha) score += 10;
      }
      if (permitirReuso && excluirIds.has(c.id)) {
        score += (lruRank.get(c.id) ?? 0) * 0.001;
      }
      return { c, score };
    });
    comScore.sort((a, b) => a.score - b.score);
    return comScore.map((x) => x.c);
  };

  return [...ordenarGrupo(real), ...ordenarGrupo(ineditas)];
}

function tentarSelecionar(
  pool: CandidatoCaderno[],
  n: number,
  estado: EstadoSelecao,
  maxTopic: number,
  rng: () => number,
  lruRank: Map<string, number>,
  permitirReuso: boolean,
  excluirIds: Set<string>,
  classificar: (c: CandidatoCaderno) => BucketDificuldade,
  bucketAlvo: BucketDificuldade,
): number {
  const filtrado = pool.filter((c) => classificar(c) === bucketAlvo);
  const ordenado = ordenarPool(
    filtrado,
    estado,
    rng,
    lruRank,
    permitirReuso,
    excluirIds,
  );

  let pegou = 0;
  for (const c of ordenado) {
    if (pegou >= n) break;
    if (estado.idsNoCaderno.has(c.id)) continue;

    if (excluirIds.has(c.id) && !permitirReuso) continue;

    const tc = estado.topicCounts.get(c.topicId) ?? 0;
    if (tc >= maxTopic) continue;

    estado.selecionados.push(c);
    estado.idsNoCaderno.add(c.id);
    estado.topicCounts.set(c.topicId, tc + 1);
    estado.totalSelecionado += 1;
    if (isEstiloPegadinha(c.estiloIdecan)) estado.pegadinhaCount += 1;
    if (permitirReuso && excluirIds.has(c.id)) estado.reusoCount += 1;
    pegou += 1;
  }
  return pegou;
}

export function selecionarParaDisciplina(options: {
  candidatos: CandidatoCaderno[];
  cotas: CotasDificuldade;
  excluirIds?: Set<string>;
  lruRank?: Map<string, number>;
  rng?: () => number;
}): { selecionados: CandidatoCaderno[]; reusoCount: number } {
  const {
    candidatos,
    cotas: cotasIniciais,
    excluirIds = new Set(),
    lruRank = new Map(),
    rng = Math.random,
  } = options;

  const uniqueTopics = new Set(candidatos.map((c) => c.topicId)).size;
  const limiteTopic = maxPorTopic(uniqueTopics);

  const estado: EstadoSelecao = {
    idsNoCaderno: new Set(),
    topicCounts: new Map(),
    pegadinhaCount: 0,
    totalSelecionado: 0,
    reusoCount: 0,
    selecionados: [],
  };

  const fases: Array<{ permitirReuso: boolean; usarRelativo: boolean }> = [
    { permitirReuso: false, usarRelativo: false },
    { permitirReuso: false, usarRelativo: true },
    { permitirReuso: true, usarRelativo: false },
  ];

  let cotasRestantes = { ...cotasIniciais };

  for (const fase of fases) {
    const pool = fase.permitirReuso
      ? candidatos
      : candidatos.filter((c) => !excluirIds.has(c.id));

    const estoque = agruparPorBucket(pool);
    cotasRestantes = redistribuirCotasVazias(cotasRestantes, estoque);

    const classificar = fase.usarRelativo
      ? (c: CandidatoCaderno) => classificarBucketRelativo(candidatos, c)
      : (c: CandidatoCaderno) => classificarBucket(c.dificuldade);

    const buckets: BucketDificuldade[] = ["facil", "medio", "dificil"];
    for (const bucket of buckets) {
      const falta = cotasRestantes[bucket];
      if (falta <= 0) continue;

      const pegou = tentarSelecionar(
        pool,
        falta,
        estado,
        limiteTopic,
        rng,
        lruRank,
        fase.permitirReuso,
        excluirIds,
        classificar,
        bucket,
      );
      cotasRestantes[bucket] -= pegou;
    }

    const totalFaltando =
      cotasRestantes.facil + cotasRestantes.medio + cotasRestantes.dificil;
    if (totalFaltando === 0) break;
  }

  return { selecionados: estado.selecionados, reusoCount: estado.reusoCount };
}

export function montarCadernoEspelho(
  input: MontarCadernoInput,
): MontarCadernoResult {
  const {
    porDisciplina,
    excluirIds = new Set(),
    lruRank = new Map(),
    rng = Math.random,
  } = input;

  const ids: string[] = [];
  const porDisciplinaCount: Partial<Record<Disciplina, number>> = {};
  let reaisCount = 0;
  let reusoCount = 0;
  const mix: MixDificuldade = { facil: 0, medio: 0, dificil: 0 };

  for (const disciplina of Object.keys(
    SIMULADO_ESPELHO_DISTRIBUICAO,
  ) as Disciplina[]) {
    const esperado = SIMULADO_ESPELHO_DISTRIBUICAO[disciplina];
    const candidatos = porDisciplina[disciplina] ?? [];
    const cotas = distribuirCotasDificuldade(esperado);

    const { selecionados, reusoCount: reusoDisc } = selecionarParaDisciplina({
      candidatos,
      cotas,
      excluirIds,
      lruRank,
      rng,
    });

    porDisciplinaCount[disciplina] = selecionados.length;
    reusoCount += reusoDisc;

    for (const c of selecionados) {
      ids.push(c.id);
      if (c.isReal) reaisCount += 1;
      const b = classificarBucket(c.dificuldade);
      mix[b] += 1;
    }
  }

  const meta: MetaCadernoEspelho = {
    mixDificuldade: mix,
    reaisCount,
    ineditasCount: ids.length - reaisCount,
    reusoCount,
    porDisciplina: porDisciplinaCount,
  };

  return { ids, meta };
}

export function embaralharCaderno<T>(
  questoes: T[],
  rng: () => number = Math.random,
): T[] {
  return embaralhar(questoes, rng);
}
