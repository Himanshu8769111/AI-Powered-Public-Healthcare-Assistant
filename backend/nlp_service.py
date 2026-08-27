import os
import json
import re

def rule_based_fallback(text):
    text_lower = text.lower()
    
    symptoms = []
    conditions = []
    
    symptom_map = {
        "Headache": ["headache", "head pain", "head throbbing", "migraine", "head ache"],
        "Fever": ["fever", "high temperature", "chills", "feverish", "hot", "body temperature"],
        "Cough": ["cough", "coughing", "dry cough", "phlegm"],
        "Chest pain": ["chest pain", "tightness in chest", "chest pressure"],
        "Fatigue": ["tired", "fatigue", "exhausted", "low energy", "weakness"],
        "Sore throat": ["sore throat", "throat pain", "swallowing pain"],
        "Shortness of breath": ["shortness of breath", "breathless", "hard to breathe", "difficulty breathing"],
        "Stomach pain": ["stomach pain", "abdominal pain", "belly ache", "stomach ache", "cramps"],
        "Nausea": ["nausea", "vomiting", "throwing up", "nauseous"],
        "Dizziness": ["dizzy", "dizziness", "lightheaded", "spinning"],
        "Joint pain": ["joint pain", "body ache", "muscle pain", "joint ache"]
    }
    
    for symptom, keywords in symptom_map.items():
        if any(kw in text_lower for kw in keywords):
            symptoms.append(symptom)
            
    if "Headache" in symptoms and "Fever" in symptoms:
        conditions.append({"disease": "Viral Infection / Influenza", "confidence": 85})
        conditions.append({"disease": "Tension Headache / Dehydration", "confidence": 65})
    elif "Cough" in symptoms or "Sore throat" in symptoms:
        conditions.append({"disease": "Upper Respiratory Tract Infection", "confidence": 80})
        conditions.append({"disease": "Common Cold", "confidence": 75})
    elif "Stomach pain" in symptoms or "Nausea" in symptoms:
        conditions.append({"disease": "Gastroenteritis / Indigestion", "confidence": 78})
        conditions.append({"disease": "Food Intolerance", "confidence": 60})
    elif "Chest pain" in symptoms or "Shortness of breath" in symptoms:
        conditions.append({"disease": "Cardiovascular / Respiratory Warning", "confidence": 90})
        conditions.append({"disease": "Acute Anxiety / Panic Response", "confidence": 65})
    else:
        conditions.append({"disease": "General Clinical Discomfort", "confidence": 70})
        conditions.append({"disease": "Mild Viral / Physical Exhaustion", "confidence": 55})
        
    if not symptoms:
        words = [w.capitalize() for w in re.findall(r'\b[a-zA-Z]{4,}\b', text) if w.lower() not in ['have', 'been', 'feeling', 'with', 'that', 'this', 'from', 'very', 'some', 'just', 'more', 'about']]
        symptoms = words[:3] if words else ["General Malaise"]

    symptom_str = ", ".join(symptoms)
    
    survivor_advice = f"Patients experiencing {symptom_str.lower()} recommend prioritizing bed rest, drinking plenty of warm fluids/electrolytes, monitoring body temperature regularly, and avoiding physical strain until symptoms improve."
    
    if "Chest pain" in symptoms or "Shortness of breath" in symptoms:
        advice = "CRITICAL TRIAGE: Chest pain or severe difficulty breathing requires immediate emergency evaluation. Please visit the nearest hospital or call emergency medical services immediately."
    else:
        advice = f"Based on identified symptoms ({symptom_str}), ensure adequate hydration, rest, and monitor your condition. If symptoms worsen, fever persists beyond 48 hours, or new severe symptoms develop, seek medical advice."

    return {
        "symptoms_found": symptoms,
        "possible_conditions": conditions,
        "survivor_advice": survivor_advice,
        "advice": advice,
        "assessment": f"Detected symptoms: {symptom_str}",
        "suggested_actions": ["Rest & Hydration", "Monitor Vitals", "Consult Doctor if severe"],
        "urgency_level": "high" if ("Chest pain" in symptoms or "Shortness of breath" in symptoms) else "medium"
    }

def analyze_symptoms(text):
    if not text or not text.strip():
        return rule_based_fallback("general feeling unwell")
        
    api_key = os.environ.get('GEMINI_API_KEY')
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            You are a clinical AI medical triage system. Analyze the following patient symptoms description:
            "{text}"

            Return ONLY a valid JSON object with EXACTLY this structure:
            {{
                "symptoms_found": ["Symptom 1", "Symptom 2"],
                "possible_conditions": [
                    {{"disease": "Condition Name 1", "confidence": 85}},
                    {{"disease": "Condition Name 2", "confidence": 60}}
                ],
                "survivor_advice": "Detailed practical advice on how patients manage this condition...",
                "advice": "AI Triage summary and recommended next steps or precautions..."
            }}
            """
            response = model.generate_content(prompt)
            text_content = response.text.strip()
            if text_content.startswith("```"):
                text_content = re.sub(r'^```(?:json)?\s*', '', text_content)
                text_content = re.sub(r'\s*```$', '', text_content)
            
            parsed = json.loads(text_content.strip())
            if isinstance(parsed, dict) and "symptoms_found" in parsed and "possible_conditions" in parsed:
                return parsed
        except Exception as e:
            print(f"[WARN] Gemini API analysis encountered issue: {e}. Utilizing fallback engine.", flush=True)

    return rule_based_fallback(text)
