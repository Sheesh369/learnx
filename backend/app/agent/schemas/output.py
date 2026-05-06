from pydantic import BaseModel
from typing import Optional


class GlossaryWord(BaseModel):
    word: str
    definition: str
    synonym: Optional[str] = None


class ChapterContentOutput(BaseModel):
    simplified_text: str
    youtube_urls: list[str]
    image_urls: list[str]       # GCS URLs (uploaded by image_gen_tool)
    glossary_words: list[GlossaryWord]
