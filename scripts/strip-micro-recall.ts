/**
 * Remove telas micro_recall de JSON de questões e exemplos ouro.
 * Uso: npx tsx scripts/strip-micro-recall.ts
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

type Tela = { id?: string; tipo?: string };

function stripVisual(visual: { telas?: Tela[] } | undefined) {
  if (!visual?.telas) return 0;
  const antes = visual.telas.length;
  visual.telas = visual.telas.filter((t) => t.tipo !== "micro_recall");
  return antes - visual.telas.length;
}

async function processJsonFile(path: string): Promise<number> {
  const raw = await readFile(path, "utf-8");
  const data = JSON.parse(raw) as unknown;
  let removidas = 0;

  if (Array.isArray(data)) {
    for (const q of data) {
      if (q && typeof q === "object") {
        const item = q as Record<string, unknown>;
        removidas += stripVisual(item.estudo_reverso_visual as { telas?: Tela[] });
        removidas += stripVisual(
          item.estudo_reverso_visual_completo as { telas?: Tela[] },
        );
      }
    }
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.telas)) {
      removidas += stripVisual(obj as { telas?: Tela[] });
    } else {
      removidas += stripVisual(obj.estudo_reverso_visual as { telas?: Tela[] });
      removidas += stripVisual(
        obj.estudo_reverso_visual_completo as { telas?: Tela[] },
      );
    }
  }

  if (removidas > 0) {
    await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
  }
  return removidas;
}

async function walkJson(dir: string): Promise<{ files: number; removidas: number }> {
  let files = 0;
  let removidas = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      const sub = await walkJson(full);
      files += sub.files;
      removidas += sub.removidas;
    } else if (e.name.endsWith(".json")) {
      const n = await processJsonFile(full);
      if (n > 0) {
        files++;
        removidas += n;
        console.log(`  ✓ ${full.replace(ROOT + "\\", "").replace(ROOT + "/", "")} (−${n} tela(s))`);
      }
    }
  }
  return { files, removidas };
}

async function stripManualTs(dir: string): Promise<number> {
  let count = 0;
  const entries = await readdir(dir);
  for (const file of entries) {
    if (!file.endsWith(".ts")) continue;
    const path = join(dir, file);
    let content = await readFile(path, "utf-8");
    const original = content;
    content = content.replace(/\n\s*recall:\s*\{[^\n]*\},/g, "");
    content = content.replace(/\n\s*recall:\s*\{[\s\S]*?\n\s*\},/g, "");
    if (content !== original) {
      await writeFile(path, content, "utf-8");
      count++;
      console.log(`  ✓ scripts/data/manual/${file}`);
    }
  }
  return count;
}

async function main() {
  console.log("Removendo micro_recall de content/questoes…");
  const q = await walkJson(join(ROOT, "content", "questoes"));

  console.log("\nRemovendo de exemplos ouro…");
  const e = await walkJson(
    join(ROOT, ".cursor", "skills", "estudo-reverso-visual", "exemplos-ouro"),
  );

  console.log("\nRemovendo recall: dos builders manuais…");
  const m = await stripManualTs(join(ROOT, "scripts", "data", "manual"));

  console.log(
    `\nConcluído: ${q.files + e.files} JSON(s), ${m} manual(is), ${q.removidas + e.removidas} tela(s) removida(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
