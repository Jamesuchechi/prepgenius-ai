import asyncio
import edge_tts
import tempfile
import os

async def _generate_audio_async(text, output_file, voice="en-US-ChristopherNeural"):
    """
    Async helper to generate audio using edge-tts.
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

def generate_speech(text, voice="en-US-ChristopherNeural"):
    """
    Generates speech from text using edge-tts (Microsoft Edge's free neural TTS).
    
    Args:
        text (str): The text to convert to speech.
        voice (str): The voice model to use. Defaults to "en-US-ChristopherNeural".
        
    Returns:
        str: Path to the generated temporary audio file.
    """
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
            output_file = temp_file.name
            
        # Run async function in a sync context
        asyncio.run(_generate_audio_async(text, output_file, voice))
        
        return output_file
    except Exception as e:
        print(f"Error generating speech: {e}")
        if os.path.exists(output_file):
            os.remove(output_file)
        raise
