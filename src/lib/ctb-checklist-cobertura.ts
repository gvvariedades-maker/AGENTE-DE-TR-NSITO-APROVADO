import {
  CONTRAN_CLUSTERS,
  CTB_CLUSTERS,
  ORDEM_ESTUDO_CTB,
  type ContranClusterDef,
  type CtbClusterDef,
  type PrioridadeCluster,
} from "@/data/ctb-clusters";
import { labelTopicoEdital } from "@/lib/edital-topicos";
import type { CoberturaIndex, QuestaoCoberturaEntry } from "@/lib/questoes-cobertura";

export const CTB_CHECKLIST_PATH = "content/questoes/_index/ctb-checklist.json";

export type StatusCluster = "coberto" | "lacuna";

export interface ClusterCheckResult {
  id: string;
  microtopico: string;
  titulo: string;
  arts: string;
  prioridade: PrioridadeCluster;
  status: StatusCluster;
  questoes: QuestaoMatchRef[];
}

export interface ContranCheckResult {
  id: string;
  microtopico: string;
  titulo: string;
  resolucao: string;
  prioridade: PrioridadeCluster;
  status: StatusCluster;
  questoes: QuestaoMatchRef[];
}

export interface QuestaoMatchRef {
  lote: string;
  indice_lote: number;
  fundamento_slug: string;
  chave_eixo: string;
  topico: string;
}

export interface MicrotopicoResumo {
  slug: string;
  label: string;
  clusters_cobertos: number;
  clusters_total: number;
  prioridade_edital: boolean;
}

export interface ProximoEstudo {
  cluster_id: string;
  microtopico: string;
  arts: string;
  titulo: string;
  prioridade: PrioridadeCluster;
  motivo: string;
}

export interface CtbChecklistIndex {
  gerado_em: string;
  fonte_cobertura_gerado_em: string;
  resumo: {
    questoes_transito: number;
    clusters_ctb_total: number;
    clusters_ctb_cobertos: number;
    clusters_contran_total: number;
    clusters_contran_cobertos: number;
    prioridade_A_lacunas: number;
  };
  microtopicos: MicrotopicoResumo[];
  clusters_ctb: ClusterCheckResult[];
  clusters_contran: ContranCheckResult[];
  proximos_estudos: ProximoEstudo[];
}

const PRIORIDADE_EDITAL = new Set([
  "CTB_engenharia_fiscalizacao",
  "CTB_infracoes",
  "CTB_processo_administrativo",
  "CONTRAN_985_mbft",
  "CONTRAN_432_alcoolemia",
  "SENATRAN_966_curso_agente",
]);

/** Evita falso positivo (ex.: CTB_art_16 em CTB_art_165). */
export function slugMatchesPrefix(slug: string, prefix: string): boolean {
  if (slug === prefix) return true;
  if (slug.startsWith(`${prefix}_`)) return true;
  if (!slug.startsWith(prefix)) return false;
  const rest = slug.slice(prefix.length);
  return rest.startsWith("-");
}

function dispositivoMatches(dispositivos: string[], patterns: string[] | undefined): boolean {
  if (!patterns?.length) return false;
  return dispositivos.some((d) =>
    patterns.some((p) => d.toLowerCase().includes(p.toLowerCase())),
  );
}

function slugMatchesPrefixes(slug: string, prefixes: string[]): boolean {
  return prefixes.some((p) => slugMatchesPrefix(slug, p));
}

function questaoMatchesCluster(
  q: QuestaoCoberturaEntry,
  cluster: CtbClusterDef | ContranClusterDef,
): boolean {
  if (q.disciplina !== "legislacao_transito") return false;

  if (slugMatchesPrefixes(q.fundamento_slug, cluster.slug_prefixes)) return true;

  if ("dispositivo_contains" in cluster && cluster.dispositivo_contains) {
    if (dispositivoMatches(q.dispositivos, cluster.dispositivo_contains)) return true;
  }

  return false;
}

function toQuestaoRef(q: QuestaoCoberturaEntry): QuestaoMatchRef {
  return {
    lote: q.lote,
    indice_lote: q.indice_lote,
    fundamento_slug: q.fundamento_slug,
    chave_eixo: q.chave_eixo,
    topico: q.topico,
  };
}

function avaliarClusterCtb(
  cluster: CtbClusterDef,
  questoes: QuestaoCoberturaEntry[],
): ClusterCheckResult {
  const matched = questoes.filter((q) => questaoMatchesCluster(q, cluster));
  const unique = dedupeQuestoes(matched);

  return {
    id: cluster.id,
    microtopico: cluster.microtopico,
    titulo: cluster.titulo,
    arts: cluster.arts,
    prioridade: cluster.prioridade,
    status: unique.length > 0 ? "coberto" : "lacuna",
    questoes: unique.map(toQuestaoRef),
  };
}

function avaliarClusterContran(
  cluster: ContranClusterDef,
  questoes: QuestaoCoberturaEntry[],
): ContranCheckResult {
  const matched = questoes.filter((q) => questaoMatchesCluster(q, cluster));
  const unique = dedupeQuestoes(matched);

  return {
    id: cluster.id,
    microtopico: cluster.microtopico,
    titulo: cluster.titulo,
    resolucao: cluster.resolucao,
    prioridade: cluster.prioridade,
    status: unique.length > 0 ? "coberto" : "lacuna",
    questoes: unique.map(toQuestaoRef),
  };
}

function dedupeQuestoes(questoes: QuestaoCoberturaEntry[]): QuestaoCoberturaEntry[] {
  const seen = new Set<string>();
  return questoes.filter((q) => {
    const key = `${q.lote}#${q.indice_lote}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildMicrotopicoResumos(
  clustersCtb: ClusterCheckResult[],
  clustersContran: ContranCheckResult[],
): MicrotopicoResumo[] {
  const allSlugs = new Set([
    ...ORDEM_ESTUDO_CTB,
    ...CONTRAN_CLUSTERS.map((c) => c.microtopico),
  ]);

  const resumos: MicrotopicoResumo[] = [];

  for (const slug of allSlugs) {
    const ctb = clustersCtb.filter((c) => c.microtopico === slug);
    const contran = clustersContran.filter((c) => c.microtopico === slug);
    const all = [...ctb, ...contran];
    if (all.length === 0) continue;

    resumos.push({
      slug,
      label: labelTopicoEdital(slug),
      clusters_cobertos: all.filter((c) => c.status === "coberto").length,
      clusters_total: all.length,
      prioridade_edital: PRIORIDADE_EDITAL.has(slug),
    });
  }

  return resumos.sort((a, b) => {
    if (a.prioridade_edital !== b.prioridade_edital) return a.prioridade_edital ? -1 : 1;
    const ia = ORDEM_ESTUDO_CTB.indexOf(a.slug);
    const ib = ORDEM_ESTUDO_CTB.indexOf(b.slug);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

function buildProximosEstudos(
  clustersCtb: ClusterCheckResult[],
  clustersContran: ContranCheckResult[],
): ProximoEstudo[] {
  const lacunas: ProximoEstudo[] = [];

  for (const c of clustersCtb) {
    if (c.status !== "lacuna") continue;
    lacunas.push({
      cluster_id: c.id,
      microtopico: c.microtopico,
      arts: c.arts,
      titulo: c.titulo,
      prioridade: c.prioridade,
      motivo:
        c.prioridade === "A"
          ? "Prioridade A — sem questão no corpus"
          : `Prioridade ${c.prioridade} — lacuna de cobertura`,
    });
  }

  for (const c of clustersContran) {
    if (c.status !== "lacuna") continue;
    lacunas.push({
      cluster_id: c.id,
      microtopico: c.microtopico,
      arts: c.resolucao,
      titulo: c.titulo,
      prioridade: c.prioridade,
      motivo:
        c.prioridade === "A"
          ? "Prioridade A — sem questão no corpus"
          : `Prioridade ${c.prioridade} — lacuna de cobertura`,
    });
  }

  const ordemPrioridade: Record<PrioridadeCluster, number> = { A: 0, B: 1, C: 2 };

  return lacunas.sort((a, b) => {
    const pa = ordemPrioridade[a.prioridade] - ordemPrioridade[b.prioridade];
    if (pa !== 0) return pa;
    const ia = ORDEM_ESTUDO_CTB.indexOf(a.microtopico);
    const ib = ORDEM_ESTUDO_CTB.indexOf(b.microtopico);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.cluster_id.localeCompare(b.cluster_id);
  });
}

export function buildCtbChecklist(cobertura: CoberturaIndex): CtbChecklistIndex {
  const questoesTransito = cobertura.questoes.filter(
    (q) => q.disciplina === "legislacao_transito",
  );

  const clustersCtb = CTB_CLUSTERS.map((c) => avaliarClusterCtb(c, questoesTransito));
  const clustersContran = CONTRAN_CLUSTERS.map((c) => avaliarClusterContran(c, questoesTransito));

  const prioridade_A_lacunas = [...clustersCtb, ...clustersContran].filter(
    (c) => c.prioridade === "A" && c.status === "lacuna",
  ).length;

  return {
    gerado_em: new Date().toISOString(),
    fonte_cobertura_gerado_em: cobertura.gerado_em,
    resumo: {
      questoes_transito: questoesTransito.length,
      clusters_ctb_total: clustersCtb.length,
      clusters_ctb_cobertos: clustersCtb.filter((c) => c.status === "coberto").length,
      clusters_contran_total: clustersContran.length,
      clusters_contran_cobertos: clustersContran.filter((c) => c.status === "coberto").length,
      prioridade_A_lacunas,
    },
    microtopicos: buildMicrotopicoResumos(clustersCtb, clustersContran),
    clusters_ctb: clustersCtb,
    clusters_contran: clustersContran,
    proximos_estudos: buildProximosEstudos(clustersCtb, clustersContran),
  };
}

export function formatChecklistTerminal(checklist: CtbChecklistIndex): string {
  const { resumo } = checklist;
  const lines: string[] = [
    "═══ Checklist CTB × cobertura de questões ═══",
    "",
    `Questões trânsito no corpus: ${resumo.questoes_transito}`,
    `Clusters CTB: ${resumo.clusters_ctb_cobertos}/${resumo.clusters_ctb_total} cobertos`,
    `Clusters CONTRAN/SENATRAN: ${resumo.clusters_contran_cobertos}/${resumo.clusters_contran_total} cobertos`,
    `Lacunas prioridade A: ${resumo.prioridade_A_lacunas}`,
    "",
    "Microtópicos (clusters cobertos/total):",
  ];

  for (const m of checklist.microtopicos) {
    const flag = m.prioridade_edital ? " ★" : "";
    const pct =
      m.clusters_total > 0
        ? Math.round((m.clusters_cobertos / m.clusters_total) * 100)
        : 0;
    lines.push(
      `  ${m.clusters_cobertos}/${m.clusters_total} (${pct}%) — ${m.label}${flag}`,
    );
  }

  const lacunasA = checklist.proximos_estudos.filter((p) => p.prioridade === "A").slice(0, 12);
  if (lacunasA.length > 0) {
    lines.push("", "Próximos estudos sugeridos (prioridade A):");
    for (const p of lacunasA) {
      lines.push(`  · [${p.arts}] ${p.titulo} (${p.microtopico})`);
    }
  }

  return lines.join("\n");
}
