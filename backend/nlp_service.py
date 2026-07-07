import os
import google.generativeai as genai
import json

# Load API key
api_key = os.environ.get('GEMINI_API_KEY')
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-1.5-flash')

def analyze_symptoms(text):
    prompt = f"""
    Analyze the following patient symptoms and provide a potential health assessment:
    "{text}"
    
    Provide the response in the following JSON format:
    {{
        "assessment": "...",
        "suggested_actions": ["...", "..."],
        "urgency_level": "low|medium|high"
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Parse the response, assuming it's JSON
        text_content = response.text
        if text_content.startswith("```json"):
            text_content = text_content[7:-3]
        elif text_content.startswith("```"):
            text_content = text_content[3:-3]
        return json.loads(text_content.strip())
    except Exception as e:
        return {"error": "Failed to analyze symptoms", "details": str(e)}
