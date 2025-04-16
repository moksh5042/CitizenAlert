from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

# ✅ Load environment variables from .env
load_dotenv()

# ✅ Get the key safely
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

# ✅ Setup Gemini
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")
chat = model.start_chat()

# Emergency helper prompt
emergency_prompt = """
You are a calm and supportive emergency assistant. Your goal is to help someone in a stressful or emergency situation. 
Give clear, step-by-step instructions that are easy to follow, using simple language. Keep your tone calm, reassuring, and focused. 
Avoid technical jargon. Break everything down into small steps and check in often to make sure the person is okay and able to follow along.

Example situation format:
Situation: [brief description of the emergency]

Response style: Step-by-step instructions, very clear, calm, and supportive, no questions

Tone: Gentle, non-alarming, empathetic
"""

@app.route('/chat', methods=['POST'])
def chat_with_gemini():
    user_input = request.json.get("message", "")
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    full_prompt = f"{emergency_prompt}\n\nSituation: {user_input}"
    response = chat.send_message(full_prompt)
    return jsonify({"response": response.text})

if __name__ == "__main__":
    app.run(debug=True)
