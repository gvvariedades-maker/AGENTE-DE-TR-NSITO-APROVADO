/**
 * Injeta estudo_reverso_visual nas questões dos lotes gerais (português, informática, constitucional).
 * Uso: npx tsx scripts/patch-estudo-reverso-lotes-gerais.ts
 *
 * OBS: obsoleto desde 2026-07. Preferir content/questoes/ curado.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { EstudoReversoVisualInput } from "../src/lib/validations/estudo-reverso-visual";
import { estudoReversoVisualSchema } from "../src/lib/validations/estudo-reverso-visual";
import { questoesFileSchema } from "../src/lib/validations/questao";

const VISUAIS: Record<string, EstudoReversoVisualInput> = {
  leitura_interpretacao_textual: {
    versao: 1,
    arquetipo: "comparacao",
    arquetipo_secundario: "texto_destaque",
    duracao_estimada_seg: 75,
    fundamento_slug: "portugues_ideia_central",
    macete_visual: "Ideia central = frase-síntese do texto, não detalhe isolado",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Identificar a ideia central do texto, não um detalhe ou culpa de um grupo.",
          destaques: ["ideia central", "detalhe"],
        },
      },
      {
        id: "mapa",
        titulo: "Central vs secundário",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Detalhe do texto", "Ideia central"],
          linhas: [
            ["Motoristas, ciclistas e pedestres no caos", "Norma existe para preservar vidas"],
            ["Punição com rigor a infratores", "Cada faixa respeitada = vida preservada"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [
            ["Culpar um grupo específico", "Norma protege a segurança de todos"],
          ],
        },
      },
      {
        id: "frase",
        titulo: "Frase-síntese",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Procure a fala do personagem ou o fecho: 'a norma existe para que ninguém precise se arriscar duas vezes'.",
          destaques: ["frase-síntese", "fecho"],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Perguntou ideia central? Ache a frase que resume o porquê de tudo no texto.",
          destaques: ["ideia central"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa", path: "conteúdo/edital/" }],
  },

  significacao_contextual_palavras_expressoes: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 70,
    fundamento_slug: "portugues_significacao_contextual",
    macete_visual: "Expressão idiomática = sentido figurado, nunca literal",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Sentido figurado de 'furar a fila' no contexto do trânsito.",
          destaques: ["furar a fila", "figurado"],
        },
      },
      {
        id: "sentidos",
        titulo: "Literal vs figurado",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Sentido errado", "Sentido certo"],
          linhas: [
            ["Respeitar a ordem", "Avançar sem obedecer à sequência"],
            ["Reduzir velocidade", "Pular posição na fila"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Ação física parecida", "Sentido idiomático da expressão"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Expressão em destaque no enunciado = sentido figurado no contexto.",
          destaques: ["figurado"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa, item 1.4", path: "conteúdo/edital/" }],
  },

  pontuacao: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 75,
    fundamento_slug: "portugues_pontuacao_virgula",
    macete_visual: "Nunca vírgula entre sujeito e verbo, nem verbo e complemento",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Vírgula indevida separando verbo do complemento direto.",
          destaques: ["vírgula", "verbo", "complemento"],
        },
      },
      {
        id: "regra",
        titulo: "Uso correto vs erro",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Correto", "Incorreto"],
          linhas: [
            ["Aposto: Severino, o agente, chegou", "Verbo + complemento: atravessaram, a rua,"],
            ["Oração subordinada anteposta", "Sujeito, verbo separados"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Parece natural na leitura em voz alta", "Fere a norma-padrão"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Sem vírgula entre sujeito↔verbo e verbo↔complemento — regra sem exceção.",
          destaques: ["sujeito", "verbo", "complemento"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa, item 2.3", path: "conteúdo/edital/" }],
  },

  acentuacao_grafica: {
    versao: 1,
    arquetipo: "tabela_gradacao",
    duracao_estimada_seg: 65,
    fundamento_slug: "portugues_acentuacao",
    macete_visual: "Proparoxítona sempre acenta; paroxítona em ditongo também",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Regras de acentuação: proparoxítonas e paroxítonas em ditongo.",
          destaques: ["proparoxítona", "ditongo"],
        },
      },
      {
        id: "tabela",
        titulo: "Regras-chave",
        tipo: "tabela_gradacao",
        conteudo: {
          titulo_colunas: ["Palavra", "Regra"],
          linhas: [
            { faixa: "trânsito, público", classificacao: "Proparoxítona → acento obrigatório", destaque: true },
            { faixa: "veículo, próprio", classificacao: "Paroxítona + ditongo → acento" },
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Uma palavra certa, outra errada na mesma alternativa", "Conferir cada palavra"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Proparoxítona sempre acenta. Paroxítona terminada em ditongo também acenta.",
          destaques: ["proparoxítona", "ditongo"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa, itens 4.1 e 4.2", path: "conteúdo/edital/" }],
  },

  extensoes_arquivos: {
    versao: 1,
    arquetipo: "tabela_gradacao",
    duracao_estimada_seg: 60,
    fundamento_slug: "info_extensoes_arquivo",
    macete_visual: "xlsx=Excel | docx=Word | pptx=PowerPoint",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Associar extensão .xlsx ao programa de planilha eletrônica.",
          destaques: [".xlsx", "planilha"],
        },
      },
      {
        id: "tabela",
        titulo: "Extensões Office",
        tipo: "tabela_gradacao",
        conteudo: {
          titulo_colunas: ["Extensão", "Programa"],
          linhas: [
            { faixa: ".docx", classificacao: "Editor de texto (Word)" },
            { faixa: ".xlsx", classificacao: "Planilha eletrônica (Excel)", destaque: true },
            { faixa: ".pptx", classificacao: "Apresentação (PowerPoint)" },
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Trocar extensão do mesmo pacote Office", "Decorar cada par extensão-programa"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "X de xlsx = eXcel. Doc = documento. Ppt = apresentação.",
          destaques: ["xlsx", "docx", "pptx"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Informática, item 1.2", path: "conteúdo/edital/" }],
  },

  manipulacao_arquivos_pastas: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 70,
    fundamento_slug: "info_atalhos_windows",
    macete_visual: "Ctrl+X corta e some | Ctrl+C clona | Ctrl+V cola",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Diferença entre recortar (Ctrl+X) e copiar (Ctrl+C) no Windows.",
          destaques: ["Ctrl+X", "Ctrl+C"],
        },
      },
      {
        id: "atalhos",
        titulo: "Atalhos comparados",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Atalho", "Efeito"],
          linhas: [
            ["Ctrl+X", "Recorta: remove da origem"],
            ["Ctrl+C", "Copia: mantém na origem"],
            ["Ctrl+V", "Cola da área de transferência"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Ctrl+X = copiar", "Ctrl+X = recortar e mover"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "X corta e some da origem. C clona e mantém. V sempre cola.",
          destaques: ["X", "C", "V"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Informática, item 2.3", path: "conteúdo/edital/" }],
  },

  planilhas_formulas: {
    versao: 1,
    arquetipo: "fluxograma_decisao",
    duracao_estimada_seg: 80,
    fundamento_slug: "info_funcao_se",
    macete_visual: "SE(condição; se verdadeiro; se falso) — avalie a condição",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Resultado da função SE quando B2=15 e a condição é B2>10.",
          destaques: ["SE", "B2>10", "15"],
        },
      },
      {
        id: "fluxo",
        titulo: "Fluxo da função SE",
        tipo: "fluxograma",
        conteudo: {
          nos: [
            { id: "inicio", label: "B2 = 15", tipo: "pergunta" },
            { id: "teste", label: "15 > 10?", tipo: "pergunta" },
            { id: "sim", label: "Retorna Multa alta", tipo: "resultado" },
            { id: "nao", label: "Retorna Multa baixa", tipo: "resultado" },
          ],
          arestas: [
            { de: "inicio", para: "teste" },
            { de: "teste", para: "sim", rotulo: "Sim" },
            { de: "teste", para: "nao", rotulo: "Não" },
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Inverte verdadeiro/falso", "15>10 é verdadeiro → Multa alta"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Leia SE como pergunta: condição verdadeira? Primeiro texto. Falsa? Segundo.",
          destaques: ["verdadeira", "falsa"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Informática, item 4.2", path: "conteúdo/edital/" }],
  },

  ferramentas_comunicacao_online: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 65,
    fundamento_slug: "info_teams",
    macete_visual: "Compartilhar tela=mostrar | Gravar=registrar | Sala=dividir",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Nome da funcionalidade de exibir a própria tela no Microsoft Teams.",
          destaques: ["compartilhamento de tela", "Teams"],
        },
      },
      {
        id: "funcoes",
        titulo: "Funções do Teams",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Função", "O que faz"],
          linhas: [
            ["Compartilhamento de tela", "Exibe sua tela aos participantes"],
            ["Gravação", "Registra a reunião em vídeo"],
            ["Sala de descanso", "Divide participantes em grupos"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Misturar gravar com compartilhar", "Cada função tem nome próprio"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Compartilhar=mostrar tela. Gravar=registrar. Sala=dividir grupo.",
          destaques: ["mostrar", "registrar", "dividir"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Informática, item 6.1", path: "conteúdo/edital/" }],
  },

  internet_protocolos_url: {
    versao: 1,
    arquetipo: "matriz_assertivas",
    duracao_estimada_seg: 85,
    fundamento_slug: "info_https_url",
    macete_visual: "Cadeado = conexão segura, não verdade do conteúdo",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "HTTPS criptografa tráfego; cadeado não garante site confiável.",
          destaques: ["HTTPS", "cadeado"],
        },
      },
      {
        id: "assertivas",
        titulo: "Mapa I–II–III",
        tipo: "matriz_assertivas",
        conteudo: {
          itens: [
            { id: "I", texto: "HTTPS usa criptografia", correto: true },
            { id: "II", texto: "URL tem protocolo, domínio e caminho", correto: true },
            { id: "III", texto: "Cadeado garante conteúdo verdadeiro", correto: false },
          ],
          gabarito_resumo: "I e II corretas → alternativa A",
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Cadeado = site confiável", "Cadeado = conexão criptografada"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Cadeado garante COMO os dados trafegam, não O QUE o site diz.",
          destaques: ["COMO", "O QUE"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Informática, item 7.4", path: "conteúdo/edital/" }],
  },

  seguranca_informacao_malwares: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 80,
    fundamento_slug: "info_malware_antivirus",
    macete_visual: "Desconfie de 'sempre', 'nunca' e '100%' em segurança",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Limites do antivírus: não elimina 100% do risco de malware novo.",
          destaques: ["antivírus", "100%"],
        },
      },
      {
        id: "tipos",
        titulo: "Vírus vs worm",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Malware", "Característica"],
          linhas: [
            ["Vírus", "Precisa de arquivo hospedeiro"],
            ["Worm", "Replica-se sozinho na rede"],
            ["Antivírus", "Não elimina todo risco (zero-day)"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Elimina por completo qualquer risco", "Afirmação absoluta = errada"]],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Em segurança da informação, 'sempre/nunca/100%' quase sempre é pegadinha.",
          destaques: ["sempre", "nunca", "100%"],
        },
      },
    ],
    links_fonte: [{ rotulo: "Anexo I — Informática, item 8.5", path: "conteúdo/edital/" }],
  },

  cf_art1_fundamentos_republica: {
    versao: 1,
    arquetipo: "trecho_legal",
    arquetipo_secundario: "comparacao",
    duracao_estimada_seg: 80,
    fundamento_slug: "CF_art1",
    macete_visual: "Art.1º = SCDVP | Separação dos Poderes é art. 2º",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Fundamentos do art. 1º vs separação dos Poderes (art. 2º).",
          destaques: ["art. 1º", "art. 2º"],
        },
      },
      {
        id: "lista",
        titulo: "Os 5 fundamentos",
        tipo: "tabela_gradacao",
        conteudo: {
          titulo_colunas: ["Fundamento", "Inciso"],
          linhas: [
            { faixa: "Soberania", classificacao: "I" },
            { faixa: "Cidadania", classificacao: "II" },
            { faixa: "Dignidade da pessoa humana", classificacao: "III", destaque: true },
            { faixa: "Valores sociais do trabalho", classificacao: "IV" },
            { faixa: "Pluralismo político", classificacao: "V" },
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Separação dos Poderes no art. 1º", "Separação dos Poderes no art. 2º"]],
        },
      },
      {
        id: "lei",
        titulo: "Lei seca",
        tipo: "trecho_legal",
        conteudo: {
          fonte: "CF/88, art. 1º",
          texto: "São fundamentos da República Federativa do Brasil a soberania, a cidadania, a dignidade da pessoa humana, os valores sociais do trabalho e da livre iniciativa e o pluralismo político.",
          trechos_grifados: [{ inicio: 0, fim: 50, motivo: "lista taxativa" }],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "SCDVP no art. 1º. Separação dos Poderes = art. 2º, não é fundamento.",
          destaques: ["SCDVP", "art. 2º"],
        },
      },
    ],
    links_fonte: [{ rotulo: "CF/88, art. 1º", path: "conteúdo/legislação federal/cf-1988.html" }],
  },

  cf_remedios_constitucionais_hc_ms: {
    versao: 1,
    arquetipo: "fluxograma_decisao",
    duracao_estimada_seg: 90,
    fundamento_slug: "CF_art5_LXVIII_LXIX",
    macete_visual: "Locomoção=HC | Direito líquido e certo=MS | Sem norma=MI",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Direito líquido e certo negado, sem ameaça à locomoção → mandado de segurança.",
          destaques: ["direito líquido e certo", "mandado de segurança"],
        },
      },
      {
        id: "fluxo",
        titulo: "Qual remédio cabe?",
        tipo: "fluxograma",
        conteudo: {
          nos: [
            { id: "q1", label: "Ameaça à locomoção?", tipo: "pergunta" },
            { id: "hc", label: "Habeas corpus (LXVIII)", tipo: "resultado", ref: "CF art. 5º, LXVIII" },
            { id: "q2", label: "Direito líquido e certo?", tipo: "pergunta" },
            { id: "ms", label: "Mandado de segurança (LXIX)", tipo: "resultado", ref: "CF art. 5º, LXIX" },
          ],
          arestas: [
            { de: "q1", para: "hc", rotulo: "Sim" },
            { de: "q1", para: "q2", rotulo: "Não" },
            { de: "q2", para: "ms", rotulo: "Sim" },
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["HC para qualquer ato ilegal", "HC só para locomoção"]],
        },
      },
      {
        id: "lei",
        titulo: "Lei seca",
        tipo: "trecho_legal",
        conteudo: {
          fonte: "CF/88, art. 5º, LXIX",
          texto: "Conceder-se-á mandado de segurança para proteger direito líquido e certo, não amparado por habeas corpus ou habeas data.",
          trechos_grifados: [{ inicio: 0, fim: 40, motivo: "remédio residual" }],
        },
      },
    ],
    links_fonte: [{ rotulo: "CF/88, art. 5º, LXIX", path: "conteúdo/legislação federal/cf-1988.html" }],
  },

  cf_art37_principios_administracao: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 75,
    fundamento_slug: "CF_art37_LIMPE",
    macete_visual: "Favoritismo pessoal = impessoalidade (art. 37)",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Favorecimento pessoal na fila viola impessoalidade, não legalidade.",
          destaques: ["impessoalidade", "favorecimento"],
        },
      },
      {
        id: "principios",
        titulo: "LIMPE aplicado",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Princípio", "Caso típico"],
          linhas: [
            ["Legalidade", "Atuar sem previsão legal"],
            ["Impessoalidade", "Favoritismo pessoal na fila"],
            ["Publicidade", "Ocultar ato administrativo"],
            ["Moralidade", "Conduta antiética"],
            ["Eficiência", "Serviço lento ou mal feito"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["Legalidade (soa genérico)", "Impessoalidade (tratamento desigual)"]],
        },
      },
      {
        id: "lei",
        titulo: "Lei seca",
        tipo: "trecho_legal",
        conteudo: {
          fonte: "CF/88, art. 37, caput",
          texto: "A administração pública obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência.",
          trechos_grifados: [{ inicio: 52, fim: 68, motivo: "impessoalidade" }],
        },
      },
    ],
    links_fonte: [{ rotulo: "CF/88, art. 37", path: "conteúdo/legislação federal/cf-1988.html" }],
  },

  cf_art144_orgaos_seguranca_publica: {
    versao: 1,
    arquetipo: "diagrama_competencia",
    duracao_estimada_seg: 90,
    fundamento_slug: "CF_art144_caput",
    macete_visual: "Caput art.144 = 6 órgãos fixos | Guarda municipal = §8º",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Rol taxativo do caput do art. 144: PF e PRF estão na lista; guarda municipal não.",
          destaques: ["caput", "taxativo", "PF", "PRF"],
        },
      },
      {
        id: "diagrama",
        titulo: "Órgãos do caput",
        tipo: "diagrama_competencia",
        conteudo: {
          nos: [
            { id: "caput", label: "Art. 144 caput", nivel: 0 },
            { id: "pf", label: "Polícia Federal (I)", nivel: 1 },
            { id: "prf", label: "Polícia Rodoviária Federal (II)", nivel: 1 },
            { id: "guarda", label: "Guarda municipal (§8º — fora do caput)", nivel: 2 },
          ],
          arestas: [
            { de: "caput", para: "pf" },
            { de: "caput", para: "prf" },
            { de: "caput", para: "guarda", rotulo: "Não integra caput" },
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [
            ["Guarda municipal no caput", "Guarda municipal no §8º"],
            ["Rol exemplificativo", "Rol taxativo — alteração por EC"],
          ],
        },
      },
      {
        id: "lei",
        titulo: "Lei seca",
        tipo: "trecho_legal",
        conteudo: {
          fonte: "CF/88, art. 144, I e II",
          texto: "A segurança pública é exercida através dos seguintes órgãos: I - polícia federal; II - polícia rodoviária federal.",
          trechos_grifados: [{ inicio: 0, fim: 30, motivo: "rol taxativo" }],
        },
      },
    ],
    links_fonte: [{ rotulo: "CF/88, art. 144", path: "conteúdo/legislação federal/cf-1988.html" }],
  },

  cf_art18_organizacao_politico_administrativa: {
    versao: 1,
    arquetipo: "trecho_legal",
    duracao_estimada_seg: 75,
    fundamento_slug: "CF_art18_art32",
    macete_visual: "DF nunca pode ser dividido em Municípios (art. 32)",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Vedação expressa: Distrito Federal não pode ser dividido em Municípios.",
          destaques: ["Distrito Federal", "Municípios", "vedação"],
        },
      },
      {
        id: "entes",
        titulo: "Entes autônomos",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Ente", "Autonomia"],
          linhas: [
            ["União, Estados, DF, Municípios", "Autônomos (art. 18)"],
            ["Territórios Federais", "Integram a União"],
            ["DF dividido em Municípios", "Vedado (art. 32)"],
          ],
        },
      },
      {
        id: "pegadinha",
        titulo: "Armadilha",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [["DF pode virar Municípios", "Art. 32 veda expressamente"]],
        },
      },
      {
        id: "lei",
        titulo: "Lei seca",
        tipo: "trecho_legal",
        conteudo: {
          fonte: "CF/88, art. 32, caput",
          texto: "O Distrito Federal não poderá ser dividido em Municípios.",
          trechos_grifados: [{ inicio: 0, fim: 55, motivo: "vedação expressa" }],
        },
      },
    ],
    links_fonte: [{ rotulo: "CF/88, art. 32", path: "conteúdo/legislação federal/cf-1988.html" }],
  },

  cf_devido_processo_legal_seguranca_publica: {
    versao: 1,
    arquetipo: "comparacao",
    duracao_estimada_seg: 80,
    fundamento_slug: "CF_art5_LV",
    macete_visual: "Contraditório e ampla defesa valem também no administrativo",
    telas: [
      {
        id: "contexto",
        titulo: "O que a IDECAN testou",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Negar defesa em processo administrativo de trânsito viola art. 5º, LV.",
          destaques: ["contraditório", "ampla defesa", "administrativo"],
        },
      },
      {
        id: "comparacao",
        titulo: "Judicial vs administrativo",
        tipo: "comparacao",
        conteudo: {
          colunas: ["Pegadinha", "Correto"],
          linhas: [
            ["Só vale no processo judicial", "Vale em judicial E administrativo"],
            ["Comunicação verbal basta", "Defesa formal com meios e recursos"],
          ],
        },
      },
      {
        id: "lei",
        titulo: "Lei seca",
        tipo: "trecho_legal",
        conteudo: {
          fonte: "CF/88, art. 5º, LV",
          texto: "Aos litigantes, em processo judicial ou administrativo, são assegurados o contraditório e ampla defesa, com os meios e recursos a ela inerentes.",
          trechos_grifados: [{ inicio: 30, fim: 60, motivo: "processo administrativo" }],
        },
      },
      {
        id: "macete",
        titulo: "Macete",
        tipo: "texto_destaque",
        conteudo: {
          texto: "Processo administrativo + defesa = art. 5º, LV. Não é só do Judiciário.",
          destaques: ["administrativo", "art. 5º, LV"],
        },
      },
    ],
    links_fonte: [{ rotulo: "CF/88, art. 5º, LV", path: "conteúdo/legislação federal/cf-1988.html" }],
  },
};

const ARQUIVOS = [
  "content/questoes/portugues/lote-001.json",
  "content/questoes/informatica/lote-001.json",
  "content/questoes/direito_constitucional/lote-001.json",
];

async function main() {
  let patched = 0;
  let erros = 0;

  for (const arquivo of ARQUIVOS) {
    const path = join(process.cwd(), arquivo);
    const raw = await readFile(path, "utf-8");
    const questoes = questoesFileSchema.parse(JSON.parse(raw));

    for (const q of questoes) {
      const visual = VISUAIS[q.topico];
      if (!visual) {
        console.error(`❌ Sem visual para topico: ${q.topico}`);
        erros++;
        continue;
      }

      const parsed = estudoReversoVisualSchema.safeParse(visual);
      if (!parsed.success) {
        console.error(`❌ Schema visual inválido [${q.topico}]:`, parsed.error.flatten());
        erros++;
        continue;
      }

      (q as { estudo_reverso_visual?: unknown }).estudo_reverso_visual = parsed.data;
      patched++;
    }

    await writeFile(path, `${JSON.stringify(questoes, null, 2)}\n`, "utf-8");
    console.log(`✓ ${arquivo} — ${questoes.length} questão(ões) atualizadas`);
  }

  console.log(`\nTotal: ${patched} visuais injetados | Erros: ${erros}`);
  if (erros > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
