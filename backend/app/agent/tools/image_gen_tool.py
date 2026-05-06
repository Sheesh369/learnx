"""
Image generation tool using Gemini 2.5 Flash Image model.
Generates an educational illustration and uploads it to GCS.
"""
from app.core.config import GEMINI_API_KEY, GEMINI_IMAGE_MODEL
from app.core.gcs import upload_bytes


async def generate_image(
    prompt: str,
    style: str = "educational diagram",
) -> dict:
    """
    Generates an educational illustration using Gemini Flash Image.

    Args:
        prompt: What to draw (e.g. "diagram of photosynthesis process")
        style: Visual style hint (default: educational diagram)

    Returns:
        {"gcs_url": "https://storage.googleapis.com/..."}
    """
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=GEMINI_API_KEY)
    full_prompt = f"{style}: {prompt}"

    response = client.models.generate_content(
        model=GEMINI_IMAGE_MODEL,
        contents=full_prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"]
        ),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data:
            image_bytes = part.inline_data.data
            mime_type = part.inline_data.mime_type or "image/png"
            gcs_url = upload_bytes(image_bytes, mime_type, folder="ai-images")
            return {"gcs_url": gcs_url}

    raise ValueError("Gemini image model returned no image")
