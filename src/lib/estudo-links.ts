import type { Disciplina } from "@/types";
import type { ModoSessaoEstudo } from "@/lib/motor-ata";

export function hrefEstudoTopico(
  slug: string,
  disciplina?: Disciplina,
  opts?: { modo?: ModoSessaoEstudo },
): string {
  const params = new URLSearchParams({ topico: slug });
  if (disciplina) params.set("disciplina", disciplina);
  if (
    opts?.modo &&
    opts.modo !== "auto" &&
    opts.modo !== "normal"
  ) {
    params.set("modo", opts.modo);
  }
  return `/estudo?${params.toString()}`;
}

export function hrefEstudoErros(slug?: string): string {
  const params = new URLSearchParams({ modo: "erros" });
  if (slug) params.set("topico", slug);
  return `/estudo?${params.toString()}`;
}

export function hrefEstudoCatalogo(disciplina: Disciplina): string {
  return `/estudo/catalogo?disciplina=${disciplina}`;
}

export function hrefVitrineReais(): string {
  return "/estudo/reais";
}

export function hrefEstudoReaisIdecan(disciplina?: Disciplina): string {
  const params = new URLSearchParams({ modo: "reais_idecan" });
  if (disciplina) params.set("disciplina", disciplina);
  return `/estudo?${params.toString()}`;
}
