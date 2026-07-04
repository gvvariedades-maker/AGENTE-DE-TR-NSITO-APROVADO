#!/usr/bin/env python3
"""
Extrai padrões IDECAN dos PDFs em conteúdo/questões reais/ (export Tec Concursos).
Uso: python .cursor/skills/examinador-idecan/scripts/analisar-pdfs-idecan.py
"""
from __future__ import annotations

import json
import re
import statistics
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[4]
PDF_DIR = ROOT / "conteúdo" / "questões reais"
OUT_JSON = Path(__file__).resolve().parent / "corpus-idecan-stats.json"

DISCIPLINA_MAP = {
    "CTB": "legislacao_transito",
    "CONTRAN": "legislacao_transito",
    "CONSTITUCIONAL": "direito_constitucional",
    "DIREITO ADMINISTRATIVO": "direito_administrativo",
    "INFORM": "informatica",
    "PORTUGUES": "portugues",
    "LGPD": "legislacao_etica_sp",
    "TICA": "legislacao_etica_sp",  # ética
    "ETICA": "legislacao_etica_sp",
}


@dataclass
class Questao:
    disciplina: str
    arquivo: str
    enunciado: str
    alternativas: dict[str, str]
    gabarito: str
    comando: str
    num_alternativas: int


def inferir_disciplina(nome_arquivo: str) -> str:
    upper = nome_arquivo.upper()
    for key, slug in DISCIPLINA_MAP.items():
        if key in upper:
            return slug
    return "desconhecida"


def extrair_texto_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    parts: list[str] = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def classificar_comando(texto: str) -> str:
    t = texto.lower()
    if re.search(r"incorreta|errad[ao]|fals[ao]|não se aplica|nao se aplica", t):
        return "incorreta"
    if re.search(r"assertiva|afirmativa|itens?\s+[ivx]+|está correto|esta correto|estão corret", t):
        return "assertivas"
    if re.search(r"associe|relacione|correspondência|correspondencia|coluna", t):
        return "correspondencia"
    if re.search(r"analise as afirmativas|julgue os itens", t):
        return "analise_afirmativas"
    if re.search(r"correta|certo|verdadeir", t):
        return "correta"
    return "outros"


def parsear_blocos(texto: str) -> list[str]:
    texto = re.sub(r"\s+", " ", texto)
    partes = re.split(r"(?=www\.tecconcursos\.com\.br/questoes/\d+)", texto)
    return [p.strip() for p in partes if len(p.strip()) > 80]


def parsear_questao(bloco: str, disciplina: str, arquivo: str) -> Questao | None:
    gab = re.search(r"Gabarito:\s*([A-Ea-e])\b", bloco)
    if not gab:
        return None
    gabarito = gab.group(1).upper()
    corpo = bloco[: gab.start()].strip()

    # alternativas a) b) c) ...
    alt_pattern = re.compile(
        r"\b([a-e])\)\s*(.*?)(?=\b[a-e]\)\s*|$)",
        re.IGNORECASE | re.DOTALL,
    )
    matches = list(alt_pattern.finditer(corpo))
    if len(matches) < 4:
        return None

    primeiro_alt = matches[0].start()
    enunciado = corpo[:primeiro_alt].strip()
    # limpar cabeçalho tec concursos
    enunciado = re.sub(
        r"^.*?IDECAN\s*-\s*",
        "",
        enunciado,
        count=1,
        flags=re.IGNORECASE | re.DOTALL,
    )
    enunciado = re.sub(r"https?://\S+", "", enunciado)
    enunciado = re.sub(r"Ordenação:.*?(?=\d{4}|No |De |Quanto |Sobre |Em |A |O )", "", enunciado, flags=re.IGNORECASE)
    enunciado = enunciado.strip()

    alternativas: dict[str, str] = {}
    for m in matches:
        letra = m.group(1).upper()
        texto_alt = re.sub(r"\s+", " ", m.group(2)).strip()
        if texto_alt:
            alternativas[letra] = texto_alt

    if gabarito not in alternativas:
        return None

    return Questao(
        disciplina=disciplina,
        arquivo=arquivo,
        enunciado=enunciado,
        alternativas=alternativas,
        gabarito=gabarito,
        comando=classificar_comando(enunciado),
        num_alternativas=len(alternativas),
    )


PEGADINHA_PATTERNS = {
    "pode_deve": r"\b(pode|deve|poderá|deverá|facultativo|obrigatório|obrigatorio|vedado)\b",
    "prazo": r"\b(\d+)\s*(dias?|horas?|meses?|anos?)\b",
    "percentual": r"\b\d+\s*%|\b\d+\s*por cento\b",
    "competencia_orgao": r"\b(CONTRAN|CETRAN|DENATRAN|SENATRAN|PRF|DETRAN|municipal|estadual|federal)\b",
    "gravidade": r"\b(leve|média|media|grave|gravíssima|gravissima)\b",
    "excecao": r"\b(salvo|exceto|somente|apenas|nunca|sempre|vedad)\b",
}


def detectar_pegadinhas(enunciado: str, alternativas: dict[str, str]) -> list[str]:
    blob = (enunciado + " " + " ".join(alternativas.values())).lower()
    found = []
    for nome, pat in PEGADINHA_PATTERNS.items():
        if re.search(pat, blob, re.IGNORECASE):
            found.append(nome)
    return found


def pct(n: int, total: int) -> float:
    return round(100 * n / total, 1) if total else 0.0


def main() -> None:
    todas: list[Questao] = []
    por_arquivo: dict[str, int] = {}

    for pdf in sorted(PDF_DIR.glob("*.pdf")):
        disciplina = inferir_disciplina(pdf.name)
        texto = extrair_texto_pdf(pdf)
        blocos = parsear_blocos(texto)
        count = 0
        for bloco in blocos:
            q = parsear_questao(bloco, disciplina, pdf.name)
            if q:
                todas.append(q)
                count += 1
        por_arquivo[pdf.name] = count

    por_disc: dict[str, list[Questao]] = defaultdict(list)
    for q in todas:
        por_disc[q.disciplina].append(q)

    stats: dict = {
        "data_analise": date.today().isoformat(),
        "total_questoes": len(todas),
        "por_arquivo": por_arquivo,
        "global": {},
        "por_disciplina": {},
    }

    # global
    cmd_global = Counter(q.comando for q in todas)
    stats["global"]["comandos"] = {k: {"n": v, "pct": pct(v, len(todas))} for k, v in cmd_global.most_common()}
    stats["global"]["media_chars_enunciado"] = round(statistics.mean(len(q.enunciado) for q in todas))
    stats["global"]["media_chars_alternativa"] = round(
        statistics.mean(len(a) for q in todas for a in q.alternativas.values())
    )
    stats["global"]["dist_alternativas"] = dict(Counter(q.num_alternativas for q in todas))
    stats["global"]["gabaritos"] = dict(Counter(q.gabarito for q in todas))

    peg_global = Counter()
    for q in todas:
        peg_global.update(detectar_pegadinhas(q.enunciado, q.alternativas))
    stats["global"]["pegadinhas_tags"] = peg_global.most_common(10)

    for disc, qs in sorted(por_disc.items()):
        cmd = Counter(q.comando for q in qs)
        peg = Counter()
        for q in qs:
            peg.update(detectar_pegadinhas(q.enunciado, q.alternativas))

        # exemplos representativos (enunciado mais longo = caso prático)
        exemplos_idx = sorted(range(len(qs)), key=lambda i: len(qs[i].enunciado), reverse=True)[:3]

        stats["por_disciplina"][disc] = {
            "total": len(qs),
            "comandos": {k: {"n": v, "pct": pct(v, len(qs))} for k, v in cmd.most_common()},
            "media_chars_enunciado": round(statistics.mean(len(q.enunciado) for q in qs)),
            "media_chars_alternativa": round(statistics.mean(len(a) for q in qs for a in q.alternativas.values())),
            "dist_alternativas": dict(Counter(q.num_alternativas for q in qs)),
            "gabaritos": dict(Counter(q.gabarito for q in qs)),
            "pegadinhas_tags": peg.most_common(8),
            "exemplos_enunciado": [
                {
                    "comando": qs[i].comando,
                    "chars": len(qs[i].enunciado),
                    "trecho": qs[i].enunciado[:280] + ("..." if len(qs[i].enunciado) > 280 else ""),
                    "gabarito": qs[i].gabarito,
                    "arquivo": qs[i].arquivo,
                }
                for i in exemplos_idx
            ],
        }

    OUT_JSON.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"total": len(todas), "arquivos": por_arquivo, "out": str(OUT_JSON)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
