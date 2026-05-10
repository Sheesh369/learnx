# Module-level sets to track in-progress content and question generation per chapter
# Safe in asyncio: check+add in sync endpoint handler has no await between them

chapter_processing: set[str] = set()    # AI content generation in progress
question_generating: set[str] = set()   # Question generation in progress
chapter_cancelled: set[str] = set()     # chapters where cancel was requested
