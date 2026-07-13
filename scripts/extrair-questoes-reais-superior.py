#!/usr/bin/env python3
"""Extrai questões reais IDECAN nível SUPERIOR dos PDFs Tec Concursos.

Uso:
  python scripts/extrair-questoes-reais-superior.py
  python scripts/extrair-questoes-reais-superior.py --pdf "CTB - IDECAN - SUPERIOR - TEC.pdf" --limit 10
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "conteúdo" / "questões reais"
OUT_DIR = ROOT / "content" / "questoes-reais" / "_raw"


def extrair_texto(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join((p.extract_text() or "") for p in reader.pages)


def parsear_blocos(texto: str) -> list[str]:
    texto = re.sub(r"\s+", " ", texto)
    partes = re.split(r"(?=www\.tecconcursos\.com\.br/questoes/\d+)", texto)
    return [p.strip() for p in partes if len(p.strip()) > 80]


def parsear_questao(bloco: str, arquivo: str) -> dict | None:
    gab = re.search(r"Gabarito:\s*([A-Ea-e])\b", bloco)
    if not gab:
        return None
    gabarito = gab.group(1).upper()
    tec = re.search(r"tecconcursos\.com\.br/questoes/(\d+)", bloco)
    corpo = bloco[: gab.start()].strip()
    alt_pattern = re.compile(
        r"\b([a-e])\)\s*(.*?)(?=\b[a-e]\)\s*|$)",
        re.IGNORECASE | re.DOTALL,
    )
    matches = list(alt_pattern.finditer(corpo))
    if len(matches) < 4:
        return None

    enunciado = corpo[: matches[0].start()].strip()
    enunciado = re.sub(
        r"^.*?IDECAN\s*-\s*",
        "",
        enunciado,
        count=1,
        flags=re.IGNORECASE | re.DOTALL,
    )
    enunciado = re.sub(r"https?://\S+", "", enunciado)
    enunciado = re.sub(
        r"Ordenação:.*?(?=\d{4}|No |De |Quanto |Sobre |Em |A |O |Com |Segundo |Analise |Assinale )",
        "",
        enunciado,
        flags=re.IGNORECASE,
    )
    enunciado = enunciado.strip()

    alternativas: dict[str, str] = {}
    for m in matches:
        letra = m.group(1).upper()
        texto_alt = re.sub(r"\s+", " ", m.group(2)).strip()
        if texto_alt:
            alternativas[letra] = texto_alt

    if gabarito not in alternativas:
        return None

    return {
        "origem": "real_idecan",
        "nivel_escolaridade": "superior",
        "fonte_arquivo": arquivo,
        "tec_id": tec.group(1) if tec else None,
        "gabarito": gabarito,
        "enunciado": enunciado,
        "alternativas": alternativas,
        "n_alternativas": len(alternativas),
    }


def listar_pdfs_superior(nome: str | None) -> list[Path]:
    if not PDF_DIR.is_dir():
        raise SystemExit(f"Pasta não encontrada: {PDF_DIR}")
    if nome:
        matches = list(PDF_DIR.glob(nome))
        if not matches:
            matches = [p for p in PDF_DIR.iterdir() if nome.lower() in p.name.lower()]
        if not matches:
            raise SystemExit(f"PDF não encontrado: {nome}")
        return matches
    return sorted(
        p
        for p in PDF_DIR.iterdir()
        if p.suffix.lower() == ".pdf" and "SUPERIOR" in p.name.upper()
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", help="Nome ou glob do PDF (deve ser SUPERIOR)")
    parser.add_argument("--limit", type=int, default=0, help="Máximo por arquivo (0 = todos)")
    parser.add_argument("--preview", type=int, default=8, help="Quantas imprimir no stdout")
    args = parser.parse_args()

    pdfs = listar_pdfs_superior(args.pdf)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for pdf in pdfs:
        if "SUPERIOR" not in pdf.name.upper():
            print(f"SKIP (não superior): {pdf.name}", file=sys.stderr)
            continue

        print(f"\n=== {pdf.name} ===")
        texto = extrair_texto(pdf)
        blocos = parsear_blocos(texto)
        qs: list[dict] = []
        for b in blocos:
            q = parsear_questao(b, pdf.name)
            if q:
                qs.append(q)
            if args.limit and len(qs) >= args.limit:
                break

        q4 = [
            q
            for q in qs
            if q["n_alternativas"] == 4 and set(q["alternativas"].keys()) <= set("ABCD")
        ]
        stem = re.sub(r"[^\w\-]+", "_", pdf.stem)[:80]
        out_path = OUT_DIR / f"{stem}.json"
        out_path.write_text(json.dumps(qs, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"parseadas={len(qs)} | A-D x4={len(q4)} | -> {out_path.relative_to(ROOT)}")

        for i, q in enumerate(qs[: args.preview]):
            enu = q["enunciado"][:160].replace("\n", " ")
            print(f"  {i+1:02d} tec={q['tec_id']} gab={q['gabarito']} n={q['n_alternativas']} | {enu}")


if __name__ == "__main__":
    main()
