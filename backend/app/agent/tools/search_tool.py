"""
Google Search tool wrapper for the ADK agent.
The GoogleSearchTool from google-adk handles this natively;
this module provides a lightweight fallback if needed.
"""
from google.adk.tools import google_search  # noqa: F401 — re-export for agent

__all__ = ["google_search"]
