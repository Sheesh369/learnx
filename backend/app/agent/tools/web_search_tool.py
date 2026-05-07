"""
Custom web search tool — wraps a direct Gemini call with Google Search grounding.
Returns results as plain text so the agent can extract YouTube URLs from it.
Being a plain Python callable, it does not conflict with other function-call tools
(unlike the ADK built-in google_search which cannot be mixed with function calls
on Gemini 2.5 Pro).
"""
from google import genai
from google.genai import types as genai_types
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL


def web_search(query: str) -> str:
    """Search the web for the given query and return relevant results including URLs.

    Args:
        query: The search query string.

    Returns:
        A text summary of the top search results with titles and URLs.
    """
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=(
            f"Search the web for: {query}\n"
            f"List the top 5 most relevant results. "
            f"For each result include the title and full URL."
        ),
        config=genai_types.GenerateContentConfig(
            tools=[genai_types.Tool(google_search=genai_types.GoogleSearch())],
        ),
    )
    return response.text or "No results found."
