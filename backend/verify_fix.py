
import json
import re

def clean_json_response(text: str) -> str:
    """Extracts JSON content from the AI response string."""
    text = text.strip()
    
    # Remove markdown code blocks if present
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
    
    # If there's still extra text, find the first '[' and last ']'
    if not (text.startswith('[') and text.endswith(']')):
        start = text.find('[')
        end = text.rfind(']')
        if start != -1 and end != -1:
            text = text[start:end+1]
    
    return text.strip()

def fix_json_escaping(text: str) -> str:
    """Fix common JSON escaping issues (like unescaped backslashes in LaTeX)."""
    return re.sub(r'(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})', r'\\\\', text)

# Test cases
test_responses = [
    # Case 1: Markdown JSON
    "```json\n[{\"content\": \"test\"}]\n```",
    # Case 2: Conversational prefix
    "Sure, here are the questions:\n[{\"content\": \"test\"}]\nI hope these help!",
    # Case 3: Bad escaping (LaTeX)
    "[{\"content\": \"What is \\frac{1}{2}?\", \"options\": [\"0.5\", \"1\", \"2\", \"4\"], \"correct_option_index\": 0, \"explanation\": \"Basic math\"}]",
    # Case 4: Multiple backslashes already correct
    "[{\"content\": \"Line break\\\\nand LaTeX \\\\frac\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_option_index\": 0, \"explanation\": \"exp\"}]"
]

for i, resp in enumerate(test_responses):
    print(f"--- Test Case {i+1} ---")
    cleaned = clean_json_response(resp)
    print(f"Cleaned: {cleaned}")
    
    try:
        data = json.loads(cleaned)
        print("Initial Parse: SUCCESS")
    except json.JSONDecodeError as e:
        print(f"Initial Parse: FAILED ({e})")
        print("Attempting fix...")
        fixed = fix_json_escaping(cleaned)
        print(f"Fixed string: {fixed}")
        try:
            data = json.loads(fixed)
            print("Fixed Parse: SUCCESS")
        except Exception as e2:
            print(f"Fixed Parse: FAILED ({e2})")
    print("\n")
