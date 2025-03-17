from fastapi import FastAPI, UploadFile, File, Form
import base64
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# 設定 Google Gemini API Key
API_KEY = "AIzaSyBwtK_eN18NdgCXe2COQVcNCMVr16shQZg"
genai.configure(api_key=API_KEY)

# 初始化 FastAPI
app = FastAPI()

# 允許跨來源請求 (CORS)
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
    output_language: str = Form("zh")  # 使用者選擇的輸出語言（預設為中文）
):
    # 設定不同語言的 Prompt
    if output_language == "zh":
        prompt = "請將以下內容轉換為 Markdown 格式，並用中文回答："
    else:
        prompt = "Please convert the following content into Markdown format and respond in English:"

    # 準備請求內容
    if file:
        image_data = await file.read()
        encoded_image = base64.b64encode(image_data).decode("utf-8")
        prompt += f"\n\n這是圖片內容：{encoded_image}"

    if text:
        prompt += f"\n\n這是使用者提供的文字內容：{text}"

    # 發送至 Gemini API
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([prompt])

    return {
        "markdown_raw": response.text,
        "markdown_preview": response.text
    }
