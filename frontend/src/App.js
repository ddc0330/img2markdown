import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css"; // 🔹 Make sure to load CSS

// 根據環境設定 API 基礎 URL
const API_BASE_URL = 'http://localhost:8000';
  // 'https://img2markdown.onrender.com' 
  // 'http://localhost:8000';  

/*
function MyComponent() {
  // 🔹 1. 狀態宣告（useState）
  // 🔹 2. 資料處理（計算、整理）
  // 🔹 3. 事件函式（onClick, onChange 等）
  // 🔹 4. API 請求（useEffect、axios）

  return (
    // 🔸 JSX：畫面要顯示的內容
  );
}
*/
function MainContent() {
  const [image, setImage] = useState(null);                 // 原始圖片檔案
  const [imagePreview, setImagePreview] = useState(null);   // 圖片預覽用的 URL
  const [text, setText] = useState("");                     // 使用者輸入的文字
  const [markdown, setMarkdown] = useState("");             // 預覽用 Markdown（HTML）
  const [markdownRaw, setMarkdownRaw] = useState("");       // 原始 markdown 原始碼
  const [loading, setLoading] = useState(false);            // 是否正在處理
  const [outputLanguage, setOutputLanguage] = useState("en"); // 輸出語言
  const { user, logout } = useAuth();                       // 從 context 拿登入資訊

  // 語言切換
  const handleOutputLanguageChange = (event) => {
    setOutputLanguage(event.target.value);
  };
  // Ctrl + V 處理貼上圖片
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        break;
      }
    }
  };
  // 選擇圖片檔案事件
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  // 上傳圖片/文字 → 呼叫 AI API
  const handleUpload = async () => {
    if (!image && !text.trim()) {
      return alert("Please upload an image or enter some text.");
    }

    const formData = new FormData();

    if (image) formData.append("file", image);
    if (text.trim()) formData.append("text", text);
    formData.append("lang", outputLanguage);

    setLoading(true);
    setMarkdown("");
    setMarkdownRaw("");

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        alert(`Error: ${response.data.error}`);
        return;
      }

      setMarkdown(response.data.markdown_preview);
      setMarkdownRaw(response.data.markdown_raw);
    } catch (error) {
      console.error("Upload failed", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  // 回傳一段 JSX 語法(要顯示的畫面內容)，REACT 再幫我轉 HTML
  return (
    <div className="container" onPaste={handlePaste}>
      <div className="header">
        <h1>Image/Text to Markdown Converter</h1>
        {user && (
          <div className="user-info">
            <span>歡迎, {user.username}</span>
            <button onClick={logout} className="logout-btn">登出</button>
          </div>
        )}
      </div>
      
      <label>Select Output Language:</label>
      <select value={outputLanguage} onChange={handleOutputLanguageChange}> 
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>

      <div className="input-container">
        {/* 🔹 Left: Text input area */}
        <textarea
          placeholder="Type text or paste an image using Ctrl + V..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 🔹 Right: Image preview area */}
        <div className="image-preview-container">
          <h3 className="preview-title">Image Preview:</h3>
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Uploaded preview" />
            ) : (
              <p className="no-image-text">No image selected</p>
            )}
          </div>
        </div>
      </div>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Convert"}
      </button>

      {markdownRaw && (
        <div className="markdown-raw">
          <h2>Markdown Source Code</h2>
          <pre>{markdownRaw}</pre>
        </div>
      )}

      {markdown && (
        <div className="markdown-preview">
          <h2>Markdown Preview</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
// 開始定義有哪些網址（路由規則）
// 使用私有路由包起來，必須登入才能進到主網頁
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute> 
                <MainContent />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// 私有路由組件
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) { // 還在載入使用者（例如 token 驗證中）→ 顯示 Loading 畫面
    return <div>Loading...</div>;
  }
  //如果 user 存在（已登入）顯示包在 PrivateRoute 裡的畫面，否則（沒登入）導向 /login 頁面
  return user ? children : <Navigate to="/login" />;
}

export default App;
