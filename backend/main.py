import os
import base64
import google.generativeai as genai
from fastapi import FastAPI, UploadFile, File, Form, Depends
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

# 🔹 自訂 Prompt
PROMPT_TEMPLATE = "請將內容轉換為 Markdown 格式，並給出最佳的排版方式。"

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

    # 準備發送給 Gemini 的內容
    prompt_content = PROMPT_TEMPLATE

    # 如果有圖片，則讀取並轉換為 Base64
    if file:
        image_data = await file.read()
        encoded_image = base64.b64encode(image_data).decode("utf-8")
        prompt_content += f"\n\n請把圖片內容做成筆記，並以markdown輸出：{encoded_image}"

    # 如果有文字，則直接加入 Prompt
    if text:
        prompt_content += f"\n\n請把文字內容做成筆記，並以markdown輸出：{text}"

    # 🔹 發送至 Google Gemini API 進行處理
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([prompt_content])

    # 🔹 回傳 AI 生成的 Markdown
    return {
        "markdown_raw": response.text,  # Markdown 原始碼
        "markdown_preview": response.text  # 預覽內容（因為 ReactMarkdown 會解析）
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
