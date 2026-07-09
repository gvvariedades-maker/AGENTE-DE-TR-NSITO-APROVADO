/**
 * Relatório de monitoramento do estudo reverso (eficácia).
 * Uso: npx tsx scripts/monitor-estudo-reverso.ts [userId]
 *
 * Sem userId, imprime apenas instruções (dados são por usuário autenticado).
 */
import "dotenv/config";

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.log("Monitor estudo reverso visual");
    console.log("Uso: npx tsx scripts/monitor-estudo-reverso.ts <userId>");
    console.log(
      "\nMétricas também disponíveis em /desempenho (card Estudo reverso visual).",
    );
    return;
  }

  const { getEstudoReversoResumo } = await import("../src/lib/retencao");

  const resumo = await getEstudoReversoResumo(userId);

  console.log("=== Monitor estudo reverso ===\n");
  console.log(`Sessões: ${resumo.sessoesTotal}`);
  console.log(`Conclusão: ${resumo.taxaConclusao}%`);

  if (resumo.amostrasPosVisual > 0) {
    console.log(`\nEficácia (n=${resumo.amostrasPosVisual} reattempts):`);
    console.log(`  Pré-visual: ${resumo.taxaAcertoPreVisual}%`);
    console.log(`  Pós-visual:  ${resumo.taxaAcertoPosVisual}%`);
    console.log(`  Delta:       ${resumo.deltaAcerto ?? "—"} pp`);
  } else {
    console.log("\nEficácia: aguardando reattempts após aula completa concluída.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
