import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import History from "./components/History";
import "./App.css"; // 🔹 Make sure to load CSS

// 根據環境設定 API 基礎 URL
const API_BASE_URL = 'https://img2markdown.onrender.com';
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
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
    <div className="min-h-screen w-full bg-white">
      {/* 導航欄 */}
      <nav className="navbar">
        <div className="navbar-container px-4">
          <div className="navbar-content">
            {/* 左側：Logo 和標題 */}
            <div className="navbar-brand">
              <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-600 rounded">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                  <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                  <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM5 5C5 4.44772 5.44772 4 6 4H14C16.7614 4 19 6.23858 19 9V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5Z" fill="currentColor" />
                </svg>
              </div>
              <h1 className="text-2xl font-mono text-gray-800 relative">
                Markdown Converter
              </h1>
            </div>

            {/* 右側：用戶信息和控制項 */}
            {user && (
              <div className="navbar-menu h-full">
              <span className="flex-grow h-full flex items-center px-4 text-gray-700">
                Welcome, {user.username}
              </span>
            
              {/* History */}
              <div className="navbar-menu h-full">
                <Link to="/history" className="navbar-item">
                  <svg className="navbar-icon w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>History</span>
                </Link>
                <button onClick={logout} className="navbar-item">
                  <svg className="navbar-icon h-full" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zM2 4a2 2 0 012-2h6.586a1 1 0 01.707.293l6.414 6.414a1 1 0 01.293.707V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="w-full">
        <div className="bg-white p-4 md:p-6">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Output Language:</label>
            <select 
              value={outputLanguage} 
              onChange={handleOutputLanguageChange}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
            > 
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8" onPaste={handlePaste}>
            {/* Left: Text input area */}
            <div>
              <textarea
                placeholder="Type text or paste an image using Ctrl + V..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Right: Image preview area */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Image Preview:</h3>
              <div className="h-48 flex justify-center items-center bg-gray-50 rounded-lg">
                {imagePreview ? (
                  <img src={imagePreview} alt="Uploaded preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <p className="text-gray-500">No image selected</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors">
              <span className="mr-2">Select Image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleUpload} 
              disabled={loading}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Convert"}
            </button>
          </div>

          {markdownRaw && (
            <div className="mt-10 bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-4">Markdown Source Code</h2>
              <pre className="bg-white p-4 rounded-lg overflow-x-auto border border-gray-200">{markdownRaw}</pre>
            </div>
          )}

          {markdown && (
            <div className="mt-10 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-4">Markdown Preview</h2>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
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
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
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
