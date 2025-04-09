# Image to Markdown Converter

一個強大的工具，可以將圖片轉換為 Markdown 格式，支援多種輸入方式和輸出語言。

![Logo](frontend/public/favicon.ico)

## 功能特點

- 🖼️ **多種輸入方式**
  - 直接貼上圖片 (Ctrl + V)
  - 上傳圖片檔案
  - 輸入文字描述

- 🌐 **多語言支援**
  - 支援英文和中文輸出
  - 自動識別圖片內容

- 📝 **即時預覽**
  - Markdown 原始碼預覽
  - 渲染後的 Markdown 預覽

- 📚 **歷史記錄**
  - 自動保存轉換歷史
  - 可查看歷史記錄
  - 支援刪除歷史記錄

- 🔒 **用戶認證**
  - 用戶註冊和登入
  - 安全的身份驗證
  - 個人化的歷史記錄

## 技術棧

### 前端
- React.js
- Tailwind CSS
- Axios
- React Markdown
- React Router

### 後端
- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- OpenAI API

## 安裝說明

### 前端設置

1. 進入前端目錄：
```bash
cd frontend
```

2. 安裝依賴：
```bash
npm install
```

3. 啟動開發伺服器：
```bash
npm start
```

### 後端設置

1. 進入後端目錄：
```bash
cd backend
```

2. 創建虛擬環境：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安裝依賴：
```bash
pip install -r requirements.txt
```

4. 設置環境變數：
創建 `.env` 文件並設置以下變數：
```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

5. 啟動後端伺服器：
```bash
uvicorn main:app --reload
```

## 使用方法

1. **註冊/登入**
   - 訪問應用程式並註冊新帳號
   - 使用註冊的帳號登入

2. **轉換圖片**
   - 使用 Ctrl + V 貼上圖片
   - 或點擊 "Select Image" 上傳圖片
   - 選擇輸出語言（英文/中文）
   - 點擊 "Convert" 開始轉換

3. **查看結果**
   - 查看轉換後的 Markdown 原始碼
   - 預覽渲染後的 Markdown 效果
   - 複製 Markdown 內容

4. **管理歷史記錄**
   - 在歷史記錄頁面查看所有轉換記錄
   - 展開/收起原始碼和預覽
   - 刪除不需要的記錄

## 貢獻指南

歡迎提交 Pull Request 或創建 Issue 來幫助改進這個專案。

## 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件
