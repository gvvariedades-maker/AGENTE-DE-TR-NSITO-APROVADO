import type { Disciplina } from "@/types";

export function hrefEstudoTopico(
  slug: string,
  disciplina?: Disciplina,
): string {
  const params = new URLSearchParams({ topico: slug });
  if (disciplina) params.set("disciplina", disciplina);
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
