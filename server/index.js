const express = require('express');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}))
app.use(express.json());

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function reviewResumeAndScore({ resumeText, role, experience, skills, industry }) {
  try {
    const prompt = `
You are a professional resume evaluator with expertise in Applicant Tracking Systems (ATS), HR practices, and technical recruitment.

Please analyze the following resume for the role of **"${role}"**, considering the provided candidate background.

### Candidate Profile:
- Role: ${role}
- Experience: ${experience}
- Key Skills: ${skills.join(', ')}
- Industry: ${industry || 'Not specified'}

### Resume Content:
\`\`\`
${resumeText}
\`\`\`

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
make sure do not give this "html" in response, add css in haeding to show bigger and some emojies in the response`


    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const atsReview = response.text();

    return atsReview;
  } catch (err) {
    console.error('Error generating ATS review:', err);
    return null;
  }
}

// API Route
app.post('/review-resume', upload.single('resume'), async (req, res) => {
  const { role, experience, skills, industry } = req.body;
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: 'Resume file is required' });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(fileBuffer);
    const resumeText = parsed.text;

    const atsReview = await reviewResumeAndScore({
      resumeText,
      role,
      experience,
      skills: skills.split(',').map(s => s.trim()),
      industry
    });

    fs.unlinkSync(filePath); // Cleanup uploaded file

    return res.json({ success: true, atsReview });
  } catch (err) {
    console.error('Error processing resume:', err);
    return res.status(500).json({ success: false, error: 'Failed to analyze resume' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

