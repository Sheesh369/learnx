import asyncio
import logging
import traceback
from typing import Literal
from pydantic import BaseModel
from sqlalchemy.orm import Session
from google import genai
from google.genai import types as genai_types

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL
from app.core.processing_state import question_generating
from app.db.database import SessionLocal
from app.models.question import Question, DifficultyLevel

logger = logging.getLogger(__name__)

_RETRY_DELAYS = [5, 10]


class QuestionItem(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: Literal["A", "B", "C", "D"]
    difficulty: Literal["easy", "medium", "hard"]


class QuestionListOutput(BaseModel):
    questions: list[QuestionItem]


async def generate_questions_for_chapter(
    chapter_id: str,
    simplified_text: str,
    subject_name: str,
    grade_standard: int,
) -> int:
    """
    Generate 10 MCQ questions using direct Gemini API (no ADK).
    Distribution: 3 easy, 5 medium, 2 hard.
    Retries up to 3 times. Returns count of saved questions.
    """
    question_generating.add(chapter_id)
    try:
        return await _run_with_retry(chapter_id, simplified_text, subject_name, grade_standard)
    finally:
        question_generating.discard(chapter_id)


async def _run_with_retry(
    chapter_id: str,
    simplified_text: str,
    subject_name: str,
    grade_standard: int,
) -> int:
    prompt = (
        f"Subject: {subject_name}\n"
        f"Grade: {grade_standard}\n\n"
        f"Chapter Content:\n{simplified_text}\n\n"
        f"Generate exactly 10 multiple-choice questions based strictly on the content above.\n"
        f"Distribution: 3 easy, 5 medium, 2 hard.\n"
        f"Each question must have exactly 4 distinct options (A, B, C, D).\n"
        f"correct_option must be exactly one of: A, B, C, or D.\n"
        f"Do not reference content not present in the chapter."
    )

    client = genai.Client(api_key=GEMINI_API_KEY)

    for attempt in range(3):
        try:
            response = await asyncio.to_thread(
                client.models.generate_content,
                model=GEMINI_MODEL,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=QuestionListOutput,
                ),
            )

            output: QuestionListOutput = response.parsed
            if not output or not output.questions:
                raise ValueError("Empty question list in response")

            logger.info(f"[QUESTIONS] Got {len(output.questions)} questions on attempt {attempt + 1}")
            return await asyncio.to_thread(_persist_questions, chapter_id, output.questions)

        except Exception as exc:
            logger.warning(
                f"[QUESTIONS] Attempt {attempt + 1}/3 failed for chapter {chapter_id}: {exc}"
            )
            if attempt < 2:
                await asyncio.sleep(_RETRY_DELAYS[attempt])

    logger.error(f"[QUESTIONS] All 3 attempts failed for chapter {chapter_id}")
    return 0


def _persist_questions(chapter_id: str, questions: list[QuestionItem]) -> int:
    db: Session = SessionLocal()
    try:
        db.query(Question).filter(
            Question.chapter_id == chapter_id,
            Question.created_by.is_(None),
        ).delete(synchronize_session=False)
        db.flush()

        saved = 0
        for q in questions:
            try:
                db.add(
                    Question(
                        question_text=q.question_text,
                        option_a=q.option_a,
                        option_b=q.option_b,
                        option_c=q.option_c,
                        option_d=q.option_d,
                        correct_option=q.correct_option.upper(),
                        difficulty=DifficultyLevel(q.difficulty.lower()),
                        chapter_id=chapter_id,
                        created_by=None,
                    )
                )
                saved += 1
            except Exception as exc:
                logger.warning(f"[QUESTIONS] Skipping invalid question: {exc}")

        db.commit()
        logger.info(f"[QUESTIONS] Saved {saved} questions for chapter {chapter_id}")
        return saved

    except Exception:
        logger.error(f"[QUESTIONS] DB error\n{traceback.format_exc()}")
        db.rollback()
        raise
    finally:
        db.close()
