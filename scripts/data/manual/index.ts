import { informaticaAulas } from "./informatica";
import { portuguesAulas } from "./portugues";
import { direitoAulas } from "./direito-constitucional";
import { legislacaoLote001 } from "./legislacao-transito-lote001";
import { legislacaoLote001b } from "./legislacao-transito-lote001b";
import { legislacaoLote003 } from "./legislacao-transito-lote003";
import { legislacaoLote004, legislacaoExemplo } from "./legislacao-transito-lote004";

/** Mapa completo: `${disciplina}/${arquivo}.json:${index}` → aula v2 curada */
export const aulasCompletoManual = {
  ...informaticaAulas,
  ...portuguesAulas,
  ...direitoAulas,
  ...legislacaoLote001,
  ...legislacaoLote001b,
  ...legislacaoLote003,
  ...legislacaoLote004,
  ...legislacaoExemplo,
};

export const AULAS_MANUAL_COUNT = Object.keys(aulasCompletoManual).length;
