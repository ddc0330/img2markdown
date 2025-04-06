from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta
import models, auth
from database import engine, get_db
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()
# 設定 Google Gemini API Key
API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=API_KEY)
# 初始化 FastAPI
app = FastAPI()
# 設定 CORS，允許前端存取 API
# CORS 就是一種能讓特定來源來存取 API 的機制，如我的前端存取後端
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://img2markdown.vercel.app", 
        "http://localhost:3000",  
    ],  # 允許本地前端訪問
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# models.Base是在 models.py 中繼承的 Base 類
# metadata：一個資料表結構的定義
# create_all() 就會在資料庫中創建一個 users 表格
models.Base.metadata.create_all(bind=engine)

# Pydantic 模型，用於把資料轉換成python物件
# 設定註冊時的格式
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
# 登入成功後回傳一組 JWT token
class Token(BaseModel):
    access_token: str
    token_type: str
# 設定回傳資料的格式
class UserResponse(BaseModel):
    id: int
    email: str
    username: str

    class Config:
        orm_mode = True

# 註冊API
@app.post("/register", response_model=UserResponse) 
# 透過 FastAPI 的 Depends() (用來傳遞參數的)呼叫 get_db() 函式，取得 SQLAlchemy 的 DB session
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # 檢查用戶名是否已存在
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    # 檢查郵箱是否已存在
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    # 加密密碼存進去(auth.py定義)
    hashed_password = auth.get_password_hash(user.password)
    # 建立使用者
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    # 加入資料庫，再從中讀取
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 登入API
# 使用者提交帳號與密碼後：驗證身份、發給一個「JWT Token」
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 確認使用者名稱與密碼
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    # 調用 auth.py 的函式
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 登入成功後產生 JWT token，調用 auth.py
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# 若token有效，回傳使用者資訊
@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

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
