export type ModoSessaoEstudo =
  | "auto"
  | "normal"
  | "erros"
  | "pegadinha"
  | "reais_idecan";

export function parseModoSessao(raw?: string): ModoSessaoEstudo {
  const valid: ModoSessaoEstudo[] = [
    "auto",
    "normal",
    "erros",
    "pegadinha",
    "reais_idecan",
  ];
  if (raw && valid.includes(raw as ModoSessaoEstudo)) {
    return raw as ModoSessaoEstudo;
  }
  // anti_zerar removido — redireciona para o motor auto (já prioriza lacunas)
  if (raw === "anti_zerar") return "auto";
  return "auto";
}

export function labelModoSessao(modo: ModoSessaoEstudo): string {
  switch (modo) {
    case "auto":
      return "Motor ATA";
    case "pegadinha":
      return "Pegadinha IDECAN";
    case "reais_idecan":
      return "Questões reais IDECAN";
    case "erros":
      return "Caderno de erros";
    default:
      return "Prática livre";
  }
}
