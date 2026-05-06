from sqlalchemy.orm import Session
from app.models.glossary import GlossaryEntry


def get_for_chapter(chapter_id: str, subject_id: str, db: Session) -> list[GlossaryEntry]:
    """Fetch chapter-scoped + subject-scoped + global entries, deduplicated by word."""
    rows = (
        db.query(GlossaryEntry)
        .filter(
            (GlossaryEntry.chapter_id == chapter_id)
            | (
                (GlossaryEntry.subject_id == subject_id)
                & (GlossaryEntry.chapter_id == None)
            )
            | (
                (GlossaryEntry.subject_id == None)
                & (GlossaryEntry.chapter_id == None)
            )
        )
        .all()
    )
    # Deduplicate: chapter-scope wins over subject-scope over global
    seen: dict[str, GlossaryEntry] = {}
    priority = {
        (True, False): 0,   # chapter scoped
        (False, True): 1,   # subject scoped
        (False, False): 2,  # global
    }
    for entry in rows:
        key = entry.word.lower()
        p = priority.get((entry.chapter_id is not None, entry.subject_id is not None), 2)
        if key not in seen or p < priority.get(
            (seen[key].chapter_id is not None, seen[key].subject_id is not None), 2
        ):
            seen[key] = entry
    return list(seen.values())


def upsert_word(
    word: str,
    definition: str,
    synonym: str | None,
    chapter_id: str | None,
    subject_id: str | None,
    is_ai_generated: bool,
    db: Session,
) -> GlossaryEntry:
    """Insert or update a glossary word for the given scope."""
    existing = (
        db.query(GlossaryEntry)
        .filter(
            GlossaryEntry.word == word,
            GlossaryEntry.chapter_id == chapter_id,
            GlossaryEntry.subject_id == subject_id,
        )
        .first()
    )
    if existing:
        existing.definition = definition
        if synonym is not None:
            existing.synonym = synonym
        db.flush()
        return existing

    entry = GlossaryEntry(
        word=word,
        definition=definition,
        synonym=synonym,
        chapter_id=chapter_id,
        subject_id=subject_id,
        is_ai_generated=is_ai_generated,
    )
    db.add(entry)
    db.flush()
    return entry
