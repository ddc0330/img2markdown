from fastapi import FastAPI, UploadFile, File, Form
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# 🔹 設定 Google Gemini API Key
API_KEY = "AIzaSyBwtK_eN18NdgCXe2COQVcNCMVr16shQZg"
genai.configure(api_key=API_KEY)

# 🔹 初始化 FastAPI
app = FastAPI()

# 🔹 設定 CORS，允許前端存取 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/")
async def upload_content(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    lang: Optional[str] = Form("zh")
):
    
    # 確保至少有一種輸入
    if not file and not text:
        return {"error": "請提供圖片或文字"}

    # 🔹 設定 Prompt
    prompt = (
        "你是一位整理資料的筆記助手。請仔細閱讀以下圖片或文字內容，並將其**原始資訊**以清晰、結構良好的 Markdown 筆記形式呈現。"
        "請使用**繁體中文**回覆，不要加入額外延伸或臆測的內容，只根據輸入的實際資訊進行整理。"
        "筆記應包含適當的標題、條列清單、段落與粗體，讓內容容易閱讀與複習。"
        if lang == "zh"
        else
        "You are a note-taking assistant. Please read the following image or text carefully and convert the **original content only** into a well-structured Markdown note."
        "Use **English** in your response. Do not add any additional analysis, assumptions, or creative content—just extract what's in the image or text."
        "The note should include appropriate headings, bullet points, paragraphs, and bold text for readability."
    )

    # 🔹 準備 Gemini API 參數
    request_content = [{"text": prompt}]  # 讓 Prompt 變成 JSON 內容

    # 若有圖片，應該轉換為 `Blob` 格式
    if file:
        image_data = await file.read()
        request_content.append({
            "inline_data": {
                "mime_type": file.content_type,  # ✅ 指定圖片格式
                "data": image_data  # ✅ 正確傳遞圖片數據
            }
        })

    # 若有文字，則加入請求內容
    if text:
        request_content.append({"text": text})

    # 🔹 發送請求到 Gemini API
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=(
                "所有回覆請使用繁體中文，並使用 Markdown 語法表達內容。"
                if lang == "zh"
                else
                "All responses must be in English and use Markdown formatting."
            )
        )
        response = model.generate_content(request_content)

        return {
            "markdown_raw": response.text,
            "markdown_preview": response.text
        }

    except Exception as e:
        return {"error": f"AI 產生錯誤：{str(e)}"}
