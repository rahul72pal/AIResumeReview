import os
# Force pure-Python protobuf BEFORE any google imports (fixes Python 3.14 C-extension crash)
os.environ.setdefault("PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION", "python")

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import io
from dotenv import load_dotenv
from PyPDF2 import PdfReader
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Setup GenAI exactly matching the sanitized API key logic from Node
api_key = os.getenv("GEMINI_API_KEY", "")
api_key = "".join(api_key.split()) # strip all whitespace/newlines

genai.configure(api_key=api_key)

app = FastAPI()

# Enable CORS for all origins, matched with Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type"],
)

def review_resume_and_score(resume_text: str, role: str, experience: str, skills: list, industry: str):
    industry_text = industry if industry else 'Not specified'
    skills_text = ", ".join(skills)
    prompt = f"""
You are a professional resume evaluator with expertise in Applicant Tracking Systems (ATS), HR practices, and technical recruitment.

Please analyze the following resume for the role of **"{role}"**, considering the provided candidate background.

### Candidate Profile:
- Role: {role}
- Experience: {experience}
- Key Skills: {skills_text}
- Industry: {industry_text}

### Resume Content:
```
{resume_text}
```

Now provide a detailed, structured resume review **in HTML format**, styled using semantic tags and optional class names for CSS styling. Avoid Markdown or plain text. Format the review into the following structured sections:

1. 📊 **ATS Score** (e.g., out of 100) – Display this prominently using a heading.
2. 🌟 **Appreciation** – Use bullet points or <ul> to highlight positive aspects like formatting, keyword usage, relevance, etc.
3. 🔧 **Fields to Improve** – Use bullet points or a list to describe missing or weak areas in the resume.
4. ❌ **Wrong or Weak Sentences** – List original weak/vague sentences.
5. ✏️ **Corrected Versions** – Provide better alternatives for the sentences above.
6. 🧩 **Missing Keywords** – List any important job-related keywords not found in the resume.
7. ✅ **Final Suggestions** – Add practical recommendations for improving ATS compatibility and recruiter appeal.

Use <div>, <h2>, <p>, <ul>, <li>, etc., also apply the inline css on these HTML Tag and text-color is white, and two br tag after each section to improve the layour of html as appropriate.

Keep the tone professional, constructive, and actionable.
make sure do not give this "html" in response, add css in haeding to show bigger and some emojies in the response"""

    model = genai.GenerativeModel('gemini-2.5-flash-lite')
    result = model.generate_content(prompt)
    return result.text


@app.post("/review-resume")
async def process_resume_review(
    role: str = Form(...),
    experience: str = Form(...),
    skills: str = Form(...),
    industry: Optional[str] = Form(""),
    resume: UploadFile = File(...)
):
    if not resume:
        raise HTTPException(status_code=400, detail="Resume file is required")

    try:
        # Read file concurrently into memory
        file_bytes = await resume.read()
        
        resume_text = ""
        try:
            # Parse PDF using PyPDF2
            pdf_reader = PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                resume_text += page.extract_text() or ""
        except Exception:
            # Fallback to reading as a regular text file
            resume_text = file_bytes.decode('utf-8', errors='ignore')
            
        skills_list = [s.strip() for s in skills.split(",")]

        ats_review = review_resume_and_score(
            resume_text=resume_text,
            role=role,
            experience=experience,
            skills=skills_list,
            industry=industry
        )

        return {"success": True, "atsReview": ats_review}
        
    except Exception as e:
        error_msg = str(e)
        print('Error processing resume:', error_msg)
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {error_msg}")

# The equivalent of app.listen is uvicorn.run(app, host="0.0.0.0", port=3000) which we will call from CLI or bottom block.
if __name__ == "__main__":
    import uvicorn
    print("Server running on port 5000")
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
