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
    text: Optional[str] = Form(None)
):
    """
    處理圖片或文字，並發送至 Google Gemini API 轉換為 Markdown。
    """
    # 確保至少有一種輸入
    if not file and not text:
        return {"error": "請提供圖片或文字"}

    # 🔹 設定 Prompt
    prompt = "  "

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
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(request_content)

        return {
            "markdown_raw": response.text,
            "markdown_preview": response.text
        }

    except Exception as e:
        return {"error": f"AI 產生錯誤：{str(e)}"}
