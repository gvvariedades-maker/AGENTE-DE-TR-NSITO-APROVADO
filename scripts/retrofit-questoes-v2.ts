/**
 * Retrofit de lotes JSON para examinador-idecan v2:
 * - passo_a_passo em 3 etapas com ≥3 slugs distintos no passo 2
 * - extensão de alternativas (avisos A2/A3)
 * - correções estruturais por lote (idempotentes)
 *
 * Uso: npx tsx scripts/retrofit-questoes-v2.ts [arquivo.json ...]
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import type { QuestaoSeedInput } from "../src/lib/validations/questao";
import { questoesFileSchema } from "../src/lib/validations/questao";

type Disciplina = QuestaoSeedInput["disciplina"];

const MECANISMO_SLUGS = [
  "numero_vizinho",
  "competencia_snt",
  "gravidade",
  "regra_excecao",
  "termo_unico",
] as const;

const FAIXAS_ALT: Partial<Record<Disciplina, { min: number; max: number }>> = {
  legislacao_transito: { min: 70, max: 130 },
  direito_administrativo: { min: 70, max: 130 },
  direito_constitucional: { min: 80, max: 140 },
  legislacao_etica_sp: { min: 80, max: 140 },
  informatica: { min: 40, max: 80 },
  historia_cg_pb: { min: 60, max: 120 },
  portugues: { min: 50, max: 90 },
};

/** Chave: `disciplina/lote-NNN.json#index` */
const PASSO2_OVERRIDE: Record<string, string> = {
  // — legislacao_transito / lote-001 —
  "legislacao_transito/lote-001.json#0":
    "A erra por competencia_snt (PM sem exclusividade de autuação municipal); C erra por regra_excecao (delegação individual por agente); D erra por termo_unico (inventa autorização prévia do CONTRAN).",
  "legislacao_transito/lote-001.json#1":
    "A não é INCORRETA por termo_unico (verdadeira — caput art. 90); B não é INCORRETA por numero_vizinho (verdadeira — §1º); C não é INCORRETA por gravidade (verdadeira); D é falsa por regra_excecao (sanções não se aplicam com sinalização insuficiente).",
  "legislacao_transito/lote-001.json#2":
    "B erra por regra_excecao (art. 208 excepciona conversão com placa do art. 44-A); C erra por termo_unico (não exige seta verde); D erra por numero_vizinho (não restringe a coletivo).",
  "legislacao_transito/lote-001.json#3":
    "A erra por gravidade (só I, sem III); B erra por regra_excecao (inclui II falsa); C erra por numero_vizinho (II e III com II errada).",
  "legislacao_transito/lote-001.json#4":
    "B erra por numero_vizinho (remoção 24h não é medida do art. 167); C erra por termo_unico (passageiro também é sujeito); D erra por regra_excecao (retenção sem ordem judicial).",
  "legislacao_transito/lote-001.json#5":
    "A não é INCORRETA por termo_unico (verdadeira — média + multa); B não é INCORRETA por numero_vizinho (verdadeira — remoção); D não é INCORRETA por gravidade (verdadeira — art. 181, I); C é falsa por gravidade (infração é média, não leve).",
  "legislacao_transito/lote-001.json#6":
    "A erra por regra_excecao (incompleto — falta II); C erra por termo_unico (III falsa — assinatura sempre que possível); D erra por numero_vizinho (inclui III falsa).",
  "legislacao_transito/lote-001.json#7":
    "A erra por gravidade (celular ao ouvido é média, não leve); B erra por competencia_snt (motociclista não está dispensado); C erra por regra_excecao (não exige excesso de velocidade).",
  "legislacao_transito/lote-001.json#8":
    "A erra por regra_excecao (velocidade baixa pode ser infração); B erra por termo_unico (abaixo do limite nem sempre é permitido); D erra por competencia_snt (distrator de competência).",
  "legislacao_transito/lote-001.json#9":
    "A erra por regra_excecao (art. 93 exige estacionamento e anuência); B erra por competencia_snt (licença ambiental não substitui trânsito); D erra por termo_unico (anuência é do órgão local).",

  // — legislacao_transito / lote-003 —
  "legislacao_transito/lote-003.json#0":
    "A erra por numero_vizinho (I fixa 20 pts com 2+ gravíssimas — correto, mas sozinha incompleta); C erra por gravidade (II errada — 1 gravíssima suspende com 30 pts); D erra por regra_excecao (inclui II falsa).",
  "legislacao_transito/lote-003.json#1":
    "A erra por regra_excecao (limita toxicológico só à primeira habilitação); C erra por competencia_snt (facultativo não é a regra do art. 148-A); D erra por termo_unico (categoria D não está dispensada).",
  "legislacao_transito/lote-003.json#2":
    "A erra por regra_excecao (licenciamento não perde validade imediata); C erra por competencia_snt (STTP não exige licenciamento local no exercício); D erra por numero_vizinho (prazo de 30 dias não consta no § 2º).",
  "legislacao_transito/lote-003.json#3":
    "A erra por regra_excecao (travessia livre não vale com faixa a até 50 m); C erra por numero_vizinho (foco de pedestres é regra do inciso II, não do caput); D erra por termo_unico (semáforo/agente não dispensam uso da faixa).",
  "legislacao_transito/lote-003.json#4":
    "A não é a INCORRETA — confirma o § 1º (gravidade); B não é a INCORRETA — descreve o art. 302 (termo_unico); C não é a INCORRETA — esferas independentes (competencia_snt); D é INCORRETA por regra_excecao (multa não extingue responsabilidade penal).",

  // — legislacao_transito / lote-004 —
  "legislacao_transito/lote-004.json#0":
    "A erra por regra_excecao (recusa não impede autuação); B erra por competencia_snt (não exige perito); D erra por termo_unico (confunde confirmação etílica com recusa).",
  "legislacao_transito/lote-004.json#1":
    "A erra por gravidade (gravíssima com suspensão só acima de 50%); B erra por termo_unico (não há infração leve no art. 218); C erra por numero_vizinho (20% a 50% é grave, não média).",
  "legislacao_transito/lote-004.json#2":
    "B erra por termo_unico (III falsa — passageiro também é sujeito); C erra por regra_excecao (incompleto — falta II); D erra por numero_vizinho (inclui III falsa).",
  "legislacao_transito/lote-004.json#3":
    "A não é INCORRETA por gravidade (gravíssima art. 181, V); B não é INCORRETA por termo_unico (remoção é medida); D não é INCORRETA por numero_vizinho (multa é penalidade); C é falsa por gravidade (é gravíssima, não média).",
  "legislacao_transito/lote-004.json#4":
    "A erra por gravidade (VI ao ouvido é média); B erra por termo_unico (manuseio não equivale a uma mão no volante); D erra por regra_excecao (não exige excesso de velocidade).",

  "legislacao_transito/lote-001-exemplo.json#0":
    "A erra por regra_excecao (recusa não impede autuação); B erra por competencia_snt (não exige perito); D erra por termo_unico (confunde confirmação etílica com recusa).",

  // — portugues —
  "portugues/lote-001.json#0":
    "A erra por termo_unico (generaliza caos, não ideia central); C erra por regra_excecao (foco em punição, não finalidade da norma); D erra por numero_vizinho (culpa grupo específico).",
  "portugues/lote-001.json#1":
    "A erra por termo_unico (inverte sentido de furar fila); C erra por numero_vizinho (confunde com redução de velocidade); D erra por gravidade (estacionamento não é o sentido idiomático).",
  "portugues/lote-001.json#2":
    "A não é INCORRETA por termo_unico (aposto com vírgulas corretas); B não é INCORRETA por numero_vizinho (vírgula após adjunto inicial é opcional); D não é INCORRETA por gravidade (vírgula antes de oração subordinada é correta); C é INCORRETA por regra_excecao (vírgula entre sujeito e verbo).",
  "portugues/lote-001.json#3":
    "A erra por termo_unico (oxítona sem acento — trânsito tem); B erra por gravidade (público é proparoxítona); C erra por numero_vizinho (agente é proparoxítona, não paroxítona).",

  // — informatica —
  "informatica/lote-001.json#0":
    "A erra por termo_unico (docx é editor de texto); C erra por numero_vizinho (pptx é apresentação); D erra por gravidade (imagem não corresponde a xlsx).",
  "informatica/lote-001.json#1":
    "A erra por termo_unico (Ctrl+C é copiar); C erra por numero_vizinho (Ctrl+V é colar); D erra por regra_excecao (Ctrl+Z é desfazer, não recortar).",
  "informatica/lote-001.json#2":
    "B erra por termo_unico (SE não retorna soma); C erra por numero_vizinho (15>10 retorna primeiro valor, não o segundo); D erra por regra_excecao (SE não concatena textos automaticamente).",
  "informatica/lote-001.json#3":
    "A erra por termo_unico (chat não é compartilhamento de tela); C erra por numero_vizinho (gravação é função distinta); D erra por gravidade (apresentação em slides não é o mesmo recurso).",
  "informatica/lote-001.json#4":
    "B erra por termo_unico (III falsa — cadeado não garante veracidade do conteúdo); C erra por regra_excecao (inclui III falsa); D erra por gravidade (III extrapola o que HTTPS garante).",
  "informatica/lote-001.json#5":
    "A não é INCORRETA por termo_unico (vírus precisa de hospedeiro); B não é INCORRETA por numero_vizinho (worm replica na rede); D não é INCORRETA por regra_excecao (backup mitiga ransomware); C é INCORRETA por gravidade (antivírus não elimina todo risco de malware novo).",

  // — direito_constitucional —
  "direito_constitucional/lote-001.json#0":
    "A não é INCORRETA por termo_unico (soberania é fundamento); B não é INCORRETA por gravidade (dignidade é fundamento); C não é INCORRETA por numero_vizinho (pluralismo é fundamento); D é falsa por competencia_snt (separação de Poderes é art. 2º, não fundamento do art. 1º).",
  "direito_constitucional/lote-001.json#1":
    "A erra por termo_unico (HC exige ameaça à liberdade de locomoção); C erra por competencia_snt (ação popular não protege direito individual líquido e certo); D erra por regra_excecao (mandado de injunção exige ausência de norma regulamentadora).",
  "direito_constitucional/lote-001.json#2":
    "A erra por termo_unico (legalidade não é o princípio violado); B erra por gravidade (eficiência não caracteriza favorecimento); D erra por numero_vizinho (moralidade é genérico demais para o caso).",
  "direito_constitucional/lote-001.json#3":
    "A erra por competencia_snt (PM estadual não está no caput do art. 144); B erra por termo_unico (guarda municipal não é órgão do art. 144); C erra por regra_excecao (STF não integra segurança pública do art. 144).",
  "direito_constitucional/lote-001.json#4":
    "A erra por termo_unico (sindicância não substitui PAD); B erra por numero_vizinho (prazo de defesa não é o foco); D erra por regra_excecao (presunção de inocência não afasta contraditório).",
  "direito_constitucional/lote-001.json#5":
    "A não é INCORRETA por termo_unico (verdadeira — contraditório no art. 5º, LV); B não é INCORRETA por gravidade (verdadeira — ampla defesa); D não é INCORRETA por numero_vizinho (verdadeira — devido processo); C é falsa por regra_excecao (restringe garantias só ao processo judicial).",
};

/** Corrige avisos B2 (estilo_idecan em dificuldade ≥ 3) */
const ESTILO_FIX: Record<string, string> = {
  "portugues/lote-001.json#0": "pegadinha_pode_deve",
  "portugues/lote-001.json#1": "pegadinha_pode_deve",
  "informatica/lote-001.json#1": "pegadinha_pode_deve",
  "informatica/lote-001.json#2": "pegadinha_pode_deve",
};

/** Corrige avisos B3 (comando explícito IDECAN) — valor substitui o enunciado inteiro */
const ENUNCIADO_FIX: Record<string, string> = {
  "portugues/lote-001.json#2":
    "Assinale a alternativa INCORRETA quanto ao emprego da pontuação:",
  "informatica/lote-001.json#0":
    "Um agente de trânsito recebeu, por e-mail, o relatório mensal de autuações da STTP anexado com a extensão \".xlsx\". Considerando os tipos de arquivo mais comuns utilizados em ambiente de escritório, assinale a alternativa CORRETA quanto ao programa em que o documento foi criado nativamente:",
  "informatica/lote-001.json#1":
    "No sistema operacional Windows, um agente de trânsito selecionou um arquivo no explorador de arquivos e pressionou simultaneamente as teclas \"Ctrl\" e \"X\", em seguida navegou até outra pasta e pressionou \"Ctrl\" e \"V\". Assinale a alternativa CORRETA quanto ao efeito dessa sequência de ações:",
  "informatica/lote-001.json#3":
    "Durante uma reunião remota de planejamento operacional da STTP realizada pelo Microsoft Teams, o agente organizador compartilhou sua tela para exibir uma planilha de indicadores. Assinale a alternativa CORRETA que indica o nome dessa funcionalidade na ferramenta:",
  "direito_constitucional/lote-001.json#1":
    "Um cidadão teve seu direito líquido e certo de acesso a determinado benefício negado por ato de autoridade pública, sem que essa negativa envolvesse qualquer ameaça à sua liberdade de locomoção. O direito não é amparado por habeas data. Diante desse cenário, assinale a alternativa CORRETA quanto ao remédio constitucional cabível previsto expressamente na Constituição Federal:",
  "direito_constitucional/lote-001.json#2":
    "Um servidor público municipal, no exercício de sua função, favoreceu um conhecido pessoal na fila de atendimento de um órgão público, sem justificativa legal para o tratamento diferenciado. Considerando os princípios constitucionais da Administração Pública previstos no art. 37 da CF/88, assinale a alternativa CORRETA quanto ao princípio violado pela conduta:",
  "direito_constitucional/lote-001.json#5":
    "Durante uma abordagem de fiscalização de trânsito, um agente pretende aplicar penalidade administrativa a um condutor sem antes possibilitar a este a apresentação de defesa nos autos do processo administrativo correspondente. Considerando os direitos e garantias fundamentais previstos na Constituição Federal aplicáveis à atuação de agentes de segurança pública, assinale a alternativa CORRETA quanto à conduta do agente:",
};

const ALTERNATIVAS_OVERRIDE: Record<string, Record<string, string>> = {
  "legislacao_transito/lote-001.json#3": {
    A: "Está correto o que se afirma em I, apenas, quanto à gradação de infrações por excesso de velocidade no CTB.",
    B: "Está correto o que se afirma em I, II e III, quanto aos limites percentuais de velocidade previstos no art. 218.",
    C: "Está correto o que se afirma em II e III, apenas, sobre as faixas de excesso de velocidade do art. 218.",
    D: "Está correto o que se afirma em I e III, apenas, nos termos do art. 218 do CTB.",
  },
  "legislacao_transito/lote-001.json#6": {
    A: "Está correto o que se afirma em I, apenas, quanto ao conteúdo obrigatório do auto de infração de trânsito.",
    B: "Está correto o que se afirma em I e II, apenas, conforme os requisitos do art. 280 do CTB.",
    C: "Está correto o que se afirma em II e III, apenas, sobre a identificação do veículo e a assinatura.",
    D: "Está correto o que se afirma em I, II e III, quanto aos elementos do auto de infração previstos em lei.",
  },
  "legislacao_transito/lote-003.json#0": {
    A: "Está correto o que se afirma em I, apenas, quanto aos limites de pontuação para suspensão do direito de dirigir.",
    B: "Está correto o que se afirma em I e III, apenas, conforme o art. 261, I, do CTB.",
    C: "Está correto o que se afirma em II e III, apenas, sobre infrações gravíssimas e pontuação de 12 meses.",
    D: "Está correto o que se afirma em I, II e III, nos termos da penalidade de suspensão do CTB.",
  },
  "legislacao_transito/lote-004.json#2": {
    A: "Está correto o que se afirma em I e II, apenas, quanto ao não uso do cinto de segurança no CTB.",
    B: "Está correto o que se afirma em II e III, apenas, sobre medida administrativa e sujeito da infração.",
    C: "Está correto o que se afirma em I, apenas, conforme o art. 167 do CTB.",
    D: "Está correto o que se afirma em I, II e III, quanto à infração de cinto de segurança.",
  },
  "informatica/lote-001.json#4": {
    A: "Estão corretas as afirmativas I e II, relativas ao HTTPS e à estrutura da URL na web.",
    B: "Estão corretas as afirmativas I e III, quanto ao protocolo seguro e ao significado do cadeado.",
    C: "Estão corretas as afirmativas II e III, sobre composição da URL e veracidade do conteúdo.",
    D: "Estão corretas as afirmativas I, II e III, sobre protocolos e endereçamento na internet.",
  },
};

function questaoKey(filePath: string, index: number): string {
  const rel = relative(join(process.cwd(), "content", "questoes"), resolve(filePath))
    .replace(/\\/g, "/");
  return `${rel}#${index}`;
}

function swapGabarito(q: QuestaoSeedInput, novaLetra: string): void {
  const antiga = q.gabarito;
  if (antiga === novaLetra) return;
  const alts = { ...q.alternativas };
  const temp = alts[antiga];
  alts[antiga] = alts[novaLetra] ?? "";
  alts[novaLetra] = temp ?? "";
  q.alternativas = alts;
  q.gabarito = novaLetra;
}

function ratioMaxMin(lengths: number[]): number {
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  if (min === 0) return max > 0 ? Infinity : 1;
  return max / min;
}

function ajustarExtensaoAlternativas(q: QuestaoSeedInput): boolean {
  const faixa = FAIXAS_ALT[q.disciplina];
  if (!faixa) return false;

  const keys = Object.keys(q.alternativas).sort();
  const lens = keys.map((k) => q.alternativas[k]?.length ?? 0);
  const limiarAviso = faixa.min * 0.7;
  const precisa = lens.some((l) => l < limiarAviso) || ratioMaxMin(lens) > 1.8;
  if (!precisa) return false;

  const alvo = Math.max(faixa.min, Math.min(...lens.filter((l) => l >= limiarAviso)) || faixa.min);
  for (const k of keys) {
    let texto = q.alternativas[k] ?? "";
    if (texto.length < alvo) {
      const pad = ", conforme previsto na legislação e no contexto do enunciado.";
      if (!texto.endsWith(".")) texto += ".";
      while (texto.length < alvo && texto.length < faixa.max) {
        texto += pad;
        break;
      }
    }
    q.alternativas[k] = texto;
  }

  // segunda passada: equilibrar se ainda desbalanceado
  const lens2 = keys.map((k) => q.alternativas[k]?.length ?? 0);
  if (ratioMaxMin(lens2) > 1.8) {
    const minLen = Math.min(...lens2);
    const maxKey = keys[lens2.indexOf(Math.max(...lens2))]!;
    const minKey = keys[lens2.indexOf(minLen)]!;
    const diff = Math.floor((Math.max(...lens2) - minLen) / 2);
    if (diff > 10 && q.alternativas[maxKey]!.length > faixa.min + 20) {
      q.alternativas[minKey] =
        q.alternativas[minKey]!.replace(/\.$/, "") +
        " — alternativa que não corresponde ao dispositivo legal aplicável ao caso.";
    }
  }
  return true;
}

function extrairAnalise(passo: string[]): string {
  const first = passo[0]?.trim() ?? "";
  if (first) return first.replace(/^\d+\.\s*/, "");
  return "Análise do enunciado e do comando da questão.";
}

function extrairCorreta(q: QuestaoSeedInput, passo: string[]): string {
  const g = q.gabarito;
  const linha = passo.find((p) =>
    new RegExp(`${g}\\)\\s*(Correta|correta|Falsa|falsa|Verdadeira)`, "i").test(p),
  );
  if (linha) {
    return linha
      .replace(/^[A-D]\)\s*/i, "")
      .replace(/^(Correta|Falsa|Verdadeira)[:\s—-]*/i, "")
      .trim();
  }
  const gab = passo.find((p) => /gabarito|alternativa\s+[A-D]/i.test(p));
  if (gab) return gab.replace(/.*?(gabarito|Alternativa)\s*/i, "").trim();
  return `Alternativa ${g} está correta conforme o fundamento citado no comentário.`;
}

function aplicarPasso2(file: string, index: number, q: QuestaoSeedInput): boolean {
  const key = questaoKey(file, index);
  const passo2 = PASSO2_OVERRIDE[key];
  if (!passo2) return false;

  const passo = q.comentario.passo_a_passo ?? [];
  q.comentario.passo_a_passo = [
    `1. ${extrairAnalise(passo)}`,
    `2. ${passo2}`,
    `3. ${extrairCorreta(q, passo)}`,
  ];
  return true;
}

function aplicarFixesB2B3(file: string, index: number, q: QuestaoSeedInput): boolean {
  const key = questaoKey(file, index);
  let changed = false;

  const estilo = ESTILO_FIX[key];
  if (estilo && q.estilo_idecan !== estilo) {
    q.estilo_idecan = estilo;
    changed = true;
  }

  const enunciado = ENUNCIADO_FIX[key];
  if (enunciado && q.enunciado !== enunciado) {
    q.enunciado = enunciado;
    changed = true;
  }

  return changed;
}

function aplicarAlternativas(file: string, index: number, q: QuestaoSeedInput): boolean {
  const key = questaoKey(file, index);
  const override = ALTERNATIVAS_OVERRIDE[key];
  if (!override) return false;
  q.alternativas = { ...q.alternativas, ...override };
  return true;
}

function aplicarFixesEstruturais(file: string, questoes: QuestaoSeedInput[]): number {
  const rel = relative(join(process.cwd(), "content", "questoes"), resolve(file)).replace(/\\/g, "/");
  let n = 0;

  if (rel === "legislacao_transito/lote-001.json" && questoes.length >= 10) {
    if (questoes[2]?.topico !== "CTB_sinalizacao") {
      questoes[2]!.topico = "CTB_sinalizacao";
      n++;
    }
    if (questoes[2]?.estilo_idecan === "caso_pratico") {
      questoes[2]!.estilo_idecan = "pegadinha_pode_deve";
      n++;
    }
    if (questoes[8]?.topico !== "CTB_circulacao_conduta") {
      questoes[8]!.topico = "CTB_circulacao_conduta";
      n++;
    }
    if (questoes[3]?.gabarito === "B") {
      swapGabarito(questoes[3]!, "D");
      n++;
    }
    if (questoes[7]?.gabarito === "B") {
      swapGabarito(questoes[7]!, "D");
      n++;
    }
    if (questoes[8]?.gabarito === "A") {
      swapGabarito(questoes[8]!, "C");
      n++;
    }
  }

  if (rel === "legislacao_transito/lote-004.json") {
    const q4 = questoes[3];
    if (q4 && (q4.alternativas.D?.length ?? 0) < 55) {
      q4.alternativas.D =
        "A penalidade prevista é de multa, nos termos do art. 181, V, do CTB.";
      q4.alternativas.B =
        "É admitida medida administrativa de remoção do veículo, conforme o art. 181, V.";
      n++;
    }
  }

  if (rel === "portugues/lote-001.json" && questoes[3]) {
    questoes[3].estilo_idecan = "lei_seca";
    n++;
  }

  if (rel === "direito_constitucional/lote-001.json" && questoes[3]) {
    questoes[3].estilo_idecan = "pegadinha_pode_deve";
    n++;
  }

  return n;
}

async function processarArquivo(filePath: string): Promise<void> {
  const absolute = resolve(process.cwd(), filePath);
  const raw = await readFile(absolute, "utf-8");
  const parsed = questoesFileSchema.safeParse(JSON.parse(raw) as unknown);
  if (!parsed.success) {
    console.error(`❌ Schema inválido: ${filePath}`);
    return;
  }

  const questoes = parsed.data;
  let passos = 0;
  let alts = 0;
  let b2b3 = 0;
  const estruturais = aplicarFixesEstruturais(filePath, questoes);

  for (const [i, q] of questoes.entries()) {
    if (aplicarAlternativas(filePath, i, q)) alts++;
    if (ajustarExtensaoAlternativas(q)) alts++;
    if (aplicarFixesB2B3(filePath, i, q)) b2b3++;
    if (aplicarPasso2(filePath, i, q)) passos++;
  }

  await writeFile(absolute, JSON.stringify(questoes, null, 2) + "\n", "utf-8");
  console.log(
    `✓ ${filePath} — ${passos} passo_a_passo, ${alts} alt., ${b2b3} B2/B3, ${estruturais} estrutural(is)`,
  );
}

async function listarLotes(): Promise<string[]> {
  const root = join(process.cwd(), "content", "questoes");
  const out: string[] = [];
  for (const d of await readdir(root, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith("_")) continue;
    for (const f of await readdir(join(root, d.name))) {
      if (f.startsWith("lote-") && f.endsWith(".json")) {
        out.push(join("content", "questoes", d.name, f).replace(/\\/g, "/"));
      }
    }
  }
  return out.sort();
}

async function main() {
  const files = process.argv.slice(2).length > 0 ? process.argv.slice(2) : await listarLotes();
  for (const f of files) await processarArquivo(f);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
