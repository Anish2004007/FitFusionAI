# ai_coach/gemini_service.py

import os
import time
import logging

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ---------------------------------------------------------
# ENVIRONMENT
# ---------------------------------------------------------

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured. "
        "Please add GEMINI_API_KEY to your .env file."
    )


# ---------------------------------------------------------
# LOGGING
# ---------------------------------------------------------

logger = logging.getLogger(__name__)


# ---------------------------------------------------------
# GEMINI CLIENT
# ---------------------------------------------------------

client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        timeout=30000  # 30 seconds
    )
)


# ---------------------------------------------------------
# MODEL
# ---------------------------------------------------------

GEMINI_MODEL = "gemini-3.6-flash"


# ---------------------------------------------------------
# GEMINI REQUEST
# ---------------------------------------------------------

def ask_gemini(prompt, max_attempts=2):
    """
    Send a prompt to Gemini.

    Features:
    - 30 second timeout
    - automatic retry
    - limited output size
    - proper error handling
    - no API key exposed in logs
    """

    if not prompt or not str(prompt).strip():
        raise ValueError("Gemini prompt cannot be empty.")

    last_error = None

    for attempt in range(1, max_attempts + 1):

        try:
            logger.info(
                "Sending request to Gemini. Attempt %s/%s",
                attempt,
                max_attempts
            )

            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=800,
                    temperature=0.7,
                ),
            )

            # ---------------------------------------------
            # Validate response
            # ---------------------------------------------

            if not response:
                raise RuntimeError("Gemini returned an empty response.")

            text = getattr(response, "text", None)

            if not text or not text.strip():
                raise RuntimeError("Gemini returned no usable text.")

            logger.info("Gemini response received successfully.")

            return text.strip()

        except Exception as exc:

            last_error = exc

            logger.exception(
                "Gemini request failed on attempt %s/%s",
                attempt,
                max_attempts
            )

            # Retry only once
            if attempt < max_attempts:
                time.sleep(1)

    # -----------------------------------------------------
    # All attempts failed
    # -----------------------------------------------------

    raise RuntimeError(
        f"Gemini request failed after {max_attempts} attempts."
    ) from last_error