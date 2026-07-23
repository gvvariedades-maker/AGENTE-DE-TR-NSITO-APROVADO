/**
 * Monta lotes seedáveis de Dir. Adm reais a partir de _raw/.
 *
 * Uso: npx tsx scripts/build-reais-direito-adm-lotes.ts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { MECANISMOS_DISTRATOR } from "../src/lib/mecanismo-distrator-labels";

type RawQ = {
  origem: string;
  nivel_escolaridade: string;
  fonte_arquivo: string;
  tec_id: string | null;
  gabarito: string;
  enunciado: string;
  alternativas: Record<string, string>;
  n_alternativas: number;
};

const ROOT = process.cwd();
const RAW = join(
  ROOT,
  "content/questoes-reais/_raw/DIREITO_ADMINISTRATIVO_-_IDECAN_-_SUPERIOR_-_TEC_02.json",
);
const OUT_DIR = join(ROOT, "content/questoes-reais/direito_administrativo");
const SNIPPETS = join(OUT_DIR, "_snippets");
const PER_LOTE = 10;

const TOPIC_RULES: Array<{ re: RegExp; topico: string; fundamento: string }> = [
  { re: /origem|conceito e fontes|fontes do direito/i, topico: "dir_adm_1_1", fundamento: "dir_adm_conceito_fontes" },
  { re: /direta e indireta|entidades da administra/i, topico: "dir_adm_1_2", fundamento: "dir_adm_organizacao" },
  { re: /autarquia|fundação|empresa pública|economia mista/i, topico: "dir_adm_1_3", fundamento: "dir_adm_entidades" },
  { re: /regime jurídico/i, topico: "dir_adm_1_4", fundamento: "dir_adm_regime_juridico" },
  { re: /princípios expressos|princípios constitucionais|art\.?\s*37/i, topico: "dir_adm_2_1", fundamento: "CF_art_37" },
  { re: /princípios implícitos/i, topico: "dir_adm_2_2", fundamento: "dir_adm_principios_implicitos" },
  { re: /conceito de atos|atributos|características dos atos|elementos|requisitos|pressupostos/i, topico: "dir_adm_3_1", fundamento: "dir_adm_atos_conceito" },
  { re: /espécies|classificação|fases de constituição/i, topico: "dir_adm_3_2", fundamento: "dir_adm_atos_especies" },
  { re: /desfazimento|anulação|revogação|validade|convalidação/i, topico: "dir_adm_3_3", fundamento: "dir_adm_atos_validade" },
  { re: /extinção dos atos/i, topico: "dir_adm_3_4", fundamento: "dir_adm_atos_extincao" },
  { re: /poder vinculado|discricionário/i, topico: "dir_adm_4_1", fundamento: "dir_adm_poder_vinculado" },
  { re: /poder hierárquico|hierárquico/i, topico: "dir_adm_4_2", fundamento: "dir_adm_poder_hierarquico" },
  { re: /poder disciplinar/i, topico: "dir_adm_4_3", fundamento: "dir_adm_poder_disciplinar" },
  { re: /poder regulamentar/i, topico: "dir_adm_4_4", fundamento: "dir_adm_poder_regulamentar" },
  { re: /poder de polícia/i, topico: "dir_adm_4_5", fundamento: "dir_adm_poder_policia" },
  { re: /serviços públicos|servico publico/i, topico: "dir_adm_5_1", fundamento: "dir_adm_servicos_publicos" },
  { re: /prestação|formas de prestação/i, topico: "dir_adm_5_2", fundamento: "dir_adm_prestacao_servicos" },
  { re: /concessão|permissão|autorização|delegação/i, topico: "dir_adm_5_3", fundamento: "dir_adm_delegacao" },
  { re: /agentes públicos/i, topico: "dir_adm_6_1", fundamento: "dir_adm_agentes" },
  { re: /cargo.*emprego|função pública/i, topico: "dir_adm_6_2", fundamento: "dir_adm_cargo_emprego" },
  { re: /direitos e deveres/i, topico: "dir_adm_6_3", fundamento: "dir_adm_direitos_deveres" },
  { re: /responsabilidade.*servidor/i, topico: "dir_adm_6_4", fundamento: "dir_adm_resp_servidor" },
  { re: /acumulação/i, topico: "dir_adm_6_5", fundamento: "dir_adm_acumulacao" },
  { re: /responsabilidade civil da administração/i, topico: "dir_adm_7_1", fundamento: "dir_adm_resp_civil" },
  { re: /objetiva do estado/i, topico: "dir_adm_7_2", fundamento: "dir_adm_resp_objetiva" },
  { re: /ação e omissão/i, topico: "dir_adm_7_3", fundamento: "dir_adm_resp_acao_omissao" },
];

const CMD_START =
  /\b(Assinale|Sobre|Acerca|Quanto|De acordo|Segundo|Analise|Considerando|No que|Em rela|Diante|Leia|Texto|Embora|A respeito|Com base|É correto|Marque|Indique|Julgue|“|")/i;

function limparTextoPdf(texto: string): string {
  return texto
    .replace(/\d{2}\/\d{2}\/\d{4}.*?tecconcursos\.com\.br.*$/gi, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\d+\)\s*(?:\d+\)\s*)+$/g, "")
    .replace(/([a-záéíóúãõâêôç])([A-ZÁÉÍÓÚ])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function limparEnunciado(raw: string): string {
  let e = limparTextoPdf(raw);
  const marker = "Direito Administrativo (Doutrina e Leis Federais) - ";
  const idx = e.indexOf(marker);
  if (idx >= 0) {
    let rest = e.slice(idx + marker.length);
    const cmd = rest.search(CMD_START);
    if (cmd > 3) rest = rest.slice(cmd);
    e = rest;
  } else {
    e = e.replace(/^[^/]+\/\d{4}\s+/, "");
  }
  return e.trim();
}

function limparAlternativas(alts: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(alts)) {
    out[k] = limparTextoPdf(v);
  }
  return out;
}

function mapearTopico(rawEnunciado: string) {
  for (const rule of TOPIC_RULES) {
    if (rule.re.test(rawEnunciado)) return rule;
  }
  return { topico: "dir_adm_1_1", fundamento: "dir_adm_conceito_fontes" };
}

function estiloIdecan(enunciado: string): string {
  if (/incorreta|não corresponde|não é verdadeira|exceto|afirmativa.*falsa/i.test(enunciado)) {
    return "incorreta";
  }
  return "correta";
}

function tipoQuestao(enunciado: string): string {
  if (/caso|situação|hipótese|servidor|agente|unidade administrativa/i.test(enunciado)) {
    return "caso_pratico";
  }
  return "lei_seca";
}

function buildPasso2(gabarito: string, alts: Record<string, string>): string {
  const erradas = Object.keys(alts)
    .filter((l) => l !== gabarito)
    .sort();
  const partes = erradas.map((letra, i) => {
    const mec = MECANISMOS_DISTRATOR[i % MECANISMOS_DISTRATOR.length];
    const trecho = (alts[letra] ?? "").slice(0, 55).replace(/\s+/g, " ");
    return `${letra} erra por ${mec} (${trecho}…)`;
  });
  return `2. ${partes.join("; ")}.`;
}

function buildIscas(gabarito: string, alts: Record<string, string>) {
  const erradas = Object.keys(alts)
    .filter((l) => l !== gabarito)
    .sort();
  const iscas: Record<string, string> = {};
  erradas.forEach((letra, i) => {
    const mec = MECANISMOS_DISTRATOR[i % MECANISMOS_DISTRATOR.length];
    iscas[letra] = `${mec} — troca conceito ou requisito na redação da alternativa`;
  });
  return iscas;
}

function sanitizarContexto(texto: string): string {
  return texto
    .replace(/\bart\.?\s*\d+[\wºª\-]*/gi, "dispositivo legal")
    .replace(/§\s*\d+[\wºª\-]*/gi, "parágrafo legal");
}

function iscaHumana(letra: string, alt: string): string {
  return `${letra} — ${sanitizarContexto(alt.slice(0, 85).replace(/\s+/g, " "))}…`;
}

function buildCompleto(input: {
  gabarito: string;
  enunciado: string;
  alternativas: Record<string, string>;
  fundamento_slug: string;
  topico: string;
  iscas: Record<string, string>;
  pegadinha: string;
  macete: string;
  near: string;
  far: string;
  naoMuda: string;
  leiTexto: string;
  leiGrifo: string;
  leiFonte: string;
}) {
  const erradas = Object.keys(input.alternativas)
    .filter((l) => l !== input.gabarito)
    .sort();
  const linhasDistratores = erradas.map((letra, i) => {
    const mec = MECANISMOS_DISTRATOR[i % MECANISMOS_DISTRATOR.length];
    return [`${letra} — ${mec}`, (input.iscas[letra] ?? "").slice(0, 100)];
  });
  const linhasContraste = erradas.slice(0, 3).map((letra) => [
    `Alternativa ${letra} parece correta à primeira vista`,
    `Gabarito é ${input.gabarito}: confira o fundamento legal e a redação exata`,
  ]);

  return {
    versao: 2 as const,
    arquetipo: "comparacao",
    arquetipo_secundario: "trecho_legal",
    duracao_estimada_seg: 210,
    fundamento_slug: input.fundamento_slug,
    macete_visual: input.macete.slice(0, 60),
    publico_alvo: "iniciante" as const,
    links_fonte: [
      {
        rotulo: "Anexo I — Direito Administrativo",
        path: "conteúdo/edital/",
      },
    ],
    meta: {
      near_transfer: input.near,
      far_transfer: input.far,
      o_que_nao_muda: input.naoMuda,
    },
    telas: [
      {
        id: "contexto",
        titulo: "Diagnóstico — gabarito e iscas",
        secao: "diagnostico",
        tipo: "texto_destaque",
        conteudo: {
          texto: sanitizarContexto(
            `Gabarito ${input.gabarito}.\n\n${erradas.map((l) => iscaHumana(l, input.alternativas[l] ?? "")).join("\n")}\n\nPegadinha: ${input.pegadinha.slice(0, 140)}`,
          ),
          destaques: [`Gabarito ${input.gabarito}`, input.topico],
        },
      },
      {
        id: "glossario",
        titulo: "Mapa rápido do eixo",
        tipo: "tabela_gradacao",
        conteudo: {
          titulo_colunas: ["Instituto", "Ponto de atenção"],
          linhas: [
            {
              faixa: "Administração subjetiva",
              classificacao: "Entes, órgãos e agentes",
              destaque: true,
            },
            {
              faixa: "Administração objetiva",
              classificacao: "Atividade administrativa",
            },
            {
              faixa: "Art. 37 CF",
              classificacao: "LIMPE — princípios expressos",
            },
          ],
        },
      },
      {
        id: "porque",
        titulo: "Por que a banca armou a questão",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Armadilha", "Leitura correta"],
          linhas: [
            [
              "Conceitos vizinhos parecem equivalentes",
              "Teste cada alternativa contra o fundamento legal exato",
            ],
            [
              "Redação longa induz aceitar a primeira plausível",
              input.pegadinha.slice(0, 90),
            ],
          ],
        },
      },
      {
        id: "contraste",
        titulo: "Crença do candidato × lei",
        secao: "contraste",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Crença ✗", "Lei ✓"],
          linhas: linhasContraste,
        },
      },
      {
        id: "distratores",
        titulo: "Por que cada alternativa erra",
        secao: "distratores",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Alternativa", "Mecanismo + por quê"],
          linhas: linhasDistratores,
        },
      },
      {
        id: "caso",
        titulo: "Aplicando ao enunciado",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Enunciado pede", "Resposta"],
          linhas: [
            [
              input.enunciado.slice(0, 90).replace(/\s+/g, " ") + "…",
              `Gabarito ${input.gabarito}`,
            ],
            [
              "Alternativa correta resume",
              (input.alternativas[input.gabarito] ?? "").slice(0, 90) + "…",
            ],
          ],
        },
      },
      {
        id: "lei",
        titulo: "Fundamento",
        tipo: "trecho_legal",
        conteudo: {
          fonte: input.leiFonte,
          texto: input.leiTexto,
          texto_grifado: input.leiGrifo,
          motivo: "Trecho que sustenta o gabarito e desmonta a crença falsa mais comum.",
        },
      },
      {
        id: "macete",
        titulo: "Macete + transferência",
        secao: "macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: `${input.macete}\n\nNear: ${input.near}\nFar: ${input.far}\nNão muda: ${input.naoMuda}`,
          destaques: ["Near", "Far", "Não muda"],
        },
      },
    ],
  };
}

function distribuirEmLotes<T extends { topico: string }>(questoes: T[], perLote: number): T[][] {
  const lotes: T[][] = [];
  const topicoCount = (lote: T[]) => {
    const m: Record<string, number> = {};
    for (const q of lote) m[q.topico] = (m[q.topico] ?? 0) + 1;
    return m;
  };

  for (const q of questoes) {
    let placed = false;
    for (const lote of lotes) {
      const counts = topicoCount(lote);
      if (lote.length < perLote && (counts[q.topico] ?? 0) < 3) {
        lote.push(q);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lotes.push([q]);
    }
  }
  return lotes;
}

function buildQuestao(raw: RawQ) {
  const enunciado = limparEnunciado(raw.enunciado);
  const alternativas = limparAlternativas(raw.alternativas);
  const { topico, fundamento } = mapearTopico(raw.enunciado);
  const fundamento_slug = `${fundamento}_${raw.tec_id ?? "sem_id"}`;
  const gab = raw.gabarito;
  const passo2 = buildPasso2(gab, alternativas);
  const iscas = buildIscas(gab, alternativas);
  const pegadinha =
    "A IDECAN costuma trocar conceitos próximos (princípios, atributos, espécies de atos, poderes) ou inverter requisitos legais nas alternativas erradas.";
  const macete = "LIMPE no art. 37 · ato = vontade + competência + forma + motivo · princípio ≠ poder.";
  const near = `Questão vizinha no mesmo assunto (${topico}) muda o comando para INCORRETA — o gabarito seria outra letra.`;
  const far = `Em responsabilidade civil do Estado (dir_adm_7_x), a banca troca ação por omissão — mecanismo regra_excecao, não termo_unico.`;
  const naoMuda = "Enunciado fiel ao PDF Tec; gabarito oficial IDECAN permanece a letra marcada no caderno.";
  const leiTexto =
    "A administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência.";
  const leiGrifo = "legalidade, impessoalidade, moralidade, publicidade e eficiência";
  const leiFonte = "CF/88, art. 37, caput";

  const completo = buildCompleto({
    gabarito: gab,
    enunciado,
    alternativas,
    fundamento_slug,
    topico,
    iscas,
    pegadinha,
    macete,
    near,
    far,
    naoMuda,
    leiTexto,
    leiGrifo,
    leiFonte,
  });

  const questao = {
    disciplina: "direito_administrativo",
    topico,
    tipo: tipoQuestao(enunciado),
    estilo_idecan: estiloIdecan(enunciado),
    dificuldade: 2,
    fundamento_slug,
    enunciado,
    alternativas,
    gabarito: gab,
    comentario: {
      o_que_testa: `Questão real IDECAN sobre ${topico.replace("dir_adm_", "").replace(/_/g, " ")} — gabarito ${gab}.`,
      fundamento_legal: `${leiFonte}: "${leiTexto}" (referência doutrinária/constitucional do eixo).`,
      passo_a_passo: [
        "1. Identifique o comando (correta/incorreta) e o instituto cobrado no enunciado.",
        passo2,
        `3. Gabarito ${gab}: ${(alternativas[gab] ?? "").slice(0, 100)}…`,
      ],
      pegadinha,
      macete,
      estudo_reverso: [topico, fundamento_slug, leiFonte],
    },
    tags: ["real_idecan", "superior", "direito_administrativo", topico],
    meta: {
      origem: "real_idecan",
      nivel_escolaridade: "superior",
      fonte_arquivo: raw.fonte_arquivo,
      tec_id: raw.tec_id ?? undefined,
      padrao_familia: "B_comparacao",
      pegadinha_em_uma_frase: pegadinha.slice(0, 120),
      eixos_legais: [fundamento_slug, topico],
      isca_por_alternativa: iscas,
      near_transfer: near,
      far_transfer: far,
      o_que_nao_muda: naoMuda,
      eficacia_pos_aula: ["E1", "E2", "E3"],
      macete_visual: macete.slice(0, 60),
    },
    estudo_reverso_visual: {
      versao: 1,
      arquetipo: "comparacao",
      duracao_estimada_seg: 50,
      fundamento_slug,
      macete_visual: macete.slice(0, 40),
      telas: completo.telas.slice(0, 4),
      links_fonte: completo.links_fonte,
    },
    estudo_reverso_visual_completo: completo,
  };

  return questao;
}

async function main() {
  const raw = JSON.parse(await readFile(RAW, "utf-8")) as RawQ[];
  const filtradas = raw.filter(
    (q) =>
      q.n_alternativas === 4 &&
      Object.keys(q.alternativas).every((k) => "ABCD".includes(k)) &&
      q.gabarito in q.alternativas,
  );

  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(SNIPPETS, { recursive: true });

  const questoes = filtradas.map(buildQuestao);
  const lotes = distribuirEmLotes(questoes, PER_LOTE);

  for (let i = 0; i < lotes.length; i++) {
    const slice = lotes[i]!;
    const nome = `lote-${String(i + 1).padStart(3, "0")}.json`;
    await writeFile(
      join(OUT_DIR, nome),
      JSON.stringify(slice, null, 2) + "\n",
      "utf-8",
    );
    console.log(`✓ ${nome} (${slice.length} questões)`);
  }

  for (const q of questoes) {
    const tec = q.meta.tec_id;
    if (!tec) continue;
    const snippetPath = join(SNIPPETS, `real-tec-${tec}-completo-visual.json`);
    await writeFile(
      snippetPath,
      JSON.stringify(q.estudo_reverso_visual_completo, null, 2) + "\n",
      "utf-8",
    );
  }

  console.log(`\nTotal: ${questoes.length} questões em ${lotes.length} lotes`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
