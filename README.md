# Image to Markdown Converter

This project is a **web-based tool** that converts **images and text** into **Markdown format** using Google Gemini API. The front end is deployed on **Vercel**, and the backend is deployed on **Render**.

🔗 **Link:** [img2markdown.vercel.app](https://img2markdown.vercel.app/)

---

## 🛠️ Tech Stack

### Frontend (React)
- React.js
- Axios (for API communication)
- ReactMarkdown (for Markdown rendering)
- Vercel (for deployment), update automatically

### Backend (FastAPI)
- FastAPI (API service)
- Google Generative AI (Gemini API integration)
- CORS Middleware (to handle cross-origin requests)
- Render (for deployment), click "Clear build cache & deploy" to update

## Planned Features:

* **Syntax Highlighting:**  Support for code blocks in various languages, including JavaScript (js) and Python (py).
* **Automatic Markdown Line Breaks:** Implementation of soft break handling for improved Markdown rendering.
* **Mathematical Formula Support:**  Support for LaTeX and KaTeX for rendering mathematical formulas.
* **One-Click Markdown Source Code Copy:**  Ability to easily copy the raw Markdown source code.
* **Download as .md or .pdf:**  Option to download notes as Markdown (.md) or PDF (.pdf) files.
* **Language Switching and Automated Prompting:** Support for switching between Chinese and English languages, along with automated downloading of Markdown files.
