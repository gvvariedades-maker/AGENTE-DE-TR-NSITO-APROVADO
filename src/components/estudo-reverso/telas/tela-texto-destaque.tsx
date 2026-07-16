import type { ConteudoTextoDestaque } from "@/types/estudo-reverso-visual";
import { TelaConteudoShell } from "./tela-conteudo-shell";
import { TextoSegmentado } from "./texto-segmentado";

export function TelaTextoDestaque({
  conteudo,
}: {
  conteudo: ConteudoTextoDestaque;
}) {
  return (
    <TelaConteudoShell>
      <TextoSegmentado texto={conteudo.texto} destaques={conteudo.destaques} />
    </TelaConteudoShell>
  );
}
