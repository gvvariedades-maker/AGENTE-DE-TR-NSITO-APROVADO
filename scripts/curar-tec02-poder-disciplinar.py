#!/usr/bin/env python3
"""Curadoria do PDF TEC-02 para fila de aula completa (por assunto Tec)."""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "content/questoes-reais/_raw/DIREITO_ADMINISTRATIVO_-_IDECAN_-_SUPERIOR_-_TEC_02_-_PODER_DISCIPLINAR.json"
LOTES_DIR = ROOT / "content/questoes-reais/direito_administrativo"
FILA = ROOT / "content/questoes-reais/_fila/direito_administrativo"

SUBJECT_MARKER = "Direito Administrativo (Doutrina e Leis Federais) - "

# Assunto Tec (prefixo) → slug Anexo I
TOPICO_MAP: list[tuple[re.Pattern[str], str, str]] = [
    (re.compile(r"^Poder Disciplinar", re.I), "dir_adm_4_3", "Poder disciplinar"),
    (re.compile(r"^Poder de Pol[ií]cia", re.I), "dir_adm_4_5", "Poder de polícia"),
    (re.compile(r"^Poder Hier[aá]rquico", re.I), "dir_adm_4_2", "Poder hierárquico"),
    (re.compile(r"^Poder Regulamentar", re.I), "dir_adm_4_4", "Poder regulamentar"),
    (re.compile(r"^Poder vinculado|discricion", re.I), "dir_adm_4_1", "Poder vinculado/discricionário"),
    (re.compile(r"Mesclados de Poderes", re.I), "dir_adm_4_3", "Poderes (mesclados)"),
    (re.compile(r"Administra[cç][aã]o Direta", re.I), "dir_adm_1_2", "Administração direta"),
    (re.compile(r"Administra[cç][aã]o Indireta", re.I), "dir_adm_1_2", "Administração indireta"),
    (re.compile(r"Desconcentra", re.I), "dir_adm_1_2", "Desconcentração/descentralização"),
    (re.compile(r"Abuso de Poder", re.I), "dir_adm_4_1", "Abuso de poder"),
    (re.compile(r"Responsabilidade dos Agentes", re.I), "dir_adm_6_4", "Responsabilidade do servidor"),
    (re.compile(r"Terceiro Setor", re.I), "dir_adm_1_3", "Terceiro setor"),
    (re.compile(r"Mesclados de Organiza", re.I), "dir_adm_1_2", "Organização administrativa"),
]

CASO_RE = re.compile(
    r"caso|situação|hipótese|servidor|agente|aluno|escola|unidade|flagrad|processo administrativo|joana|maria|pedro",
    re.I,
)
COMPARACAO_PODERES_RE = re.compile(
    r"poder (disciplinar|hierárquico|de polícia|regulamentar|normativo)",
    re.I,
)
INCORRETA_RE = re.compile(r"incorreta|exceto|não corresponde|afirmativa.*falsa", re.I)

# Prioridade de lacunas no acervo atual (após TEC-01)
LACUNA_PRIORIDADE = {
    "dir_adm_4_3": 10,
    "dir_adm_4_5": 9,
    "dir_adm_4_2": 8,
    "dir_adm_4_4": 8,
    "dir_adm_4_1": 7,
    "dir_adm_6_4": 6,
    "dir_adm_1_2": 5,
    "dir_adm_1_3": 4,
}


def load_imported_tec_ids() -> set[str]:
    ids: set[str] = set()
    for path in LOTES_DIR.glob("lote-*.json"):
        for q in json.loads(path.read_text(encoding="utf-8")):
            tid = (q.get("meta") or {}).get("tec_id")
            if tid:
                ids.add(str(tid))
    return ids


def extrair_assunto(enunciado: str) -> str:
    i = enunciado.find(SUBJECT_MARKER)
    if i < 0:
        return "Outros"
    rest = enunciado[i + len(SUBJECT_MARKER) :]
    # assunto = até próximo trecho que parece início do enunciado (maiúscula após ponto curto)
    m = re.match(r"^([^A-ZÁÉÍÓÚ\"“]{3,80}?)(?:\s+[A-ZÁÉÍÓÚ\"“]|\s+Em\s|\s+Sobre\s|\s+Assinale)", rest)
    if m:
        return m.group(1).strip().rstrip(",.;:")
    return rest[:60].strip()


def mapear_topico(assunto: str) -> tuple[str, str]:
    for pat, slug, label in TOPICO_MAP:
        if pat.search(assunto):
            return slug, label
    return "dir_adm_1_1", assunto[:40]


def score(q: dict) -> tuple[int, list[str]]:
    pts = 0
    tags: list[str] = []
    enu = q.get("enunciado", "")
    if CASO_RE.search(enu):
        pts += 3
        tags.append("caso_pratico")
    if COMPARACAO_PODERES_RE.search(enu):
        pts += 2
        tags.append("comparacao_poderes")
    if INCORRETA_RE.search(enu):
        pts += 1
        tags.append("comando_incorreta")
    if len(enu) > 200:
        pts += 1
        tags.append("enunciado_medio")
    slug, _ = mapear_topico(extrair_assunto(enu))
    pts += LACUNA_PRIORIDADE.get(slug, 1)
    return pts, tags


def selecionar(pool: list[dict], limite: int) -> list[dict]:
    ranked = sorted(pool, key=lambda q: score(q)[0], reverse=True)
    out: list[dict] = []
    gab: dict[str, int] = defaultdict(int)
    for q in ranked:
        if len(out) >= limite:
            break
        g = q["gabarito"]
        if gab[g] >= max(2, limite // 4):
            continue
        pts, tags = score(q)
        assunto = extrair_assunto(q["enunciado"])
        slug, label = mapear_topico(assunto)
        out.append(
            {
                **q,
                "assunto_tec": assunto,
                "topico_edital": slug,
                "topico_label": label,
                "prioridade_aula": pts,
                "tags_curadoria": tags,
                "status": "pendente_aula_completa",
            }
        )
        gab[g] += 1
    return out


def main() -> None:
    raw: list[dict] = json.loads(RAW.read_text(encoding="utf-8"))
    imported = load_imported_tec_ids()

    q4 = [
        q
        for q in raw
        if q.get("n_alternativas") == 4
        and set(q.get("alternativas", {}).keys()) <= set("ABCD")
        and q.get("gabarito") in q.get("alternativas", {})
        and q.get("tec_id") not in imported
    ]

    por_assunto: dict[str, list[dict]] = defaultdict(list)
    for q in q4:
        por_assunto[extrair_assunto(q["enunciado"])[:55]].append(q)

    # Seleção global priorizando lacunas
    selecionadas = selecionar(q4, 25)

    # Também pacote focado só poder disciplinar puro
    poder_disc = [
        q
        for q in q4
        if re.search(r"^Poder Disciplinar", extrair_assunto(q["enunciado"]), re.I)
        or re.search(r"Mesclados de Poderes", extrair_assunto(q["enunciado"]), re.I)
    ]
    selecionadas_pd = selecionar(poder_disc, 12)

    out_dir = FILA / "tec-02-curadoria"
    out_dir.mkdir(parents=True, exist_ok=True)

    assunto_stats = {k: len(v) for k, v in sorted(por_assunto.items(), key=lambda x: -len(x[1]))}

    manifest = {
        "fonte_pdf": "DIREITO ADMINISTRATIVO - IDECAN - SUPERIOR - TEC 02 - PODER DISCIPLINAR.pdf",
        "fonte_original": "QUESTÕES CURSOR VARIADAS - TEC - 02.pdf",
        "disciplina": "direito_administrativo",
        "nota": "Caderno Tec continua da Q201; não é só Poder Disciplinar — inclui poderes, organização, abuso de poder etc.",
        "estatisticas": {
            "parseadas_total": len(raw),
            "formato_abcd": len(q4) + len([q for q in raw if q.get("tec_id") in imported]),
            "novas_abcd": len(q4),
            "assuntos_distintos": len(por_assunto),
            "selecionadas_geral": len(selecionadas),
            "selecionadas_poder_disciplinar": len(selecionadas_pd),
        },
        "assuntos_no_pdf": assunto_stats,
        "tec_ids_geral": [q["tec_id"] for q in selecionadas],
        "tec_ids_poder_disciplinar": [q["tec_id"] for q in selecionadas_pd],
        "proximo_passo": "Aula completa nota 10 por questão → lote-013+ → validate:lote → db:seed:reais",
    }

    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8",
    )
    (out_dir / "selecionadas-geral.json").write_text(
        json.dumps(selecionadas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8",
    )
    (out_dir / "selecionadas-poder-disciplinar.json").write_text(
        json.dumps(selecionadas_pd, ensure_ascii=False, indent=2) + "\n", encoding="utf-8",
    )

    lines = [
        "# Fila TEC-02 — Dir. Administrativo",
        "",
        f"PDF com **{len(raw)}** questões parseadas; **{len(q4)}** novas em A–D (sem duplicar TEC-01).",
        "",
        "## Assuntos no PDF",
        "",
    ]
    for ass, n in list(assunto_stats.items())[:15]:
        lines.append(f"- {ass}: **{n}**")
    lines += [
        "",
        "## Seleção para aula completa",
        "",
        f"### Geral (lacunas do edital) — **{len(selecionadas)}** questões",
        f"Arquivo: `selecionadas-geral.json`",
        "",
        f"### Foco Poder Disciplinar (4.3) — **{len(selecionadas_pd)}** questões",
        f"Arquivo: `selecionadas-poder-disciplinar.json`",
        "",
        "## Top prioridade (geral)",
        "",
    ]
    for q in selecionadas[:12]:
        lines.append(
            f"- `{q['tec_id']}` | **{q['gabarito']}** | {q['topico_edital']} | {q['assunto_tec'][:45]}…"
        )

    (out_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Limpar pasta antiga com curadoria incorreta
    old = FILA / "poder-disciplinar-tec-02"
    if old.is_dir():
        for f in old.iterdir():
            f.unlink()
        old.rmdir()

    print(json.dumps(manifest["estatisticas"], indent=2))
    print(f"OK: {out_dir.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
