import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./App.css"; // 🔹 確保載入 CSS

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [text, setText] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [markdownRaw, setMarkdownRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState("zh");

  const handleOutputLanguageChange = (event) => {
    setOutputLanguage(event.target.value);
  };

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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image && !text.trim()) {
      return alert("請選擇一張圖片或輸入文字！");
    }
  
    const formData = new FormData();
  
    if (image) formData.append("file", image);
    if (text.trim()) formData.append("text", text);
  
    setLoading(true);
    setMarkdown("");
    setMarkdownRaw("");
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // ✅ 檢查 API 回傳內容，避免錯誤
      if (response.data.error) {
        alert(`錯誤: ${response.data.error}`);
        return;
      }
  
      setMarkdown(response.data.markdown_preview);
      setMarkdownRaw(response.data.markdown_raw);
    } catch (error) {
      console.error("上傳失敗", error);
      alert("發生錯誤，請稍後再試！");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" onPaste={handlePaste}>
      <h1>Markdown產生器</h1>

      <label>選擇輸出語言：</label>
      <select value={outputLanguage} onChange={handleOutputLanguageChange}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>

      <div className="input-container">
        {/* 🔹 左側：文字輸入框 */}
        <textarea
          placeholder="輸入文字或 Ctrl + V 貼上圖片..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 🔹 右側：圖片預覽區 */}
        <div className="image-preview-container">
          <h3 className="preview-title">圖片預覽：</h3>
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="上傳的圖片" />
            ) : (
              <p className="no-image-text">尚未選擇圖片</p>
            )}
          </div>
        </div>
      </div>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "處理中..." : "上傳圖片 / 文字"}
      </button>

      {markdownRaw && (
        <div className="markdown-raw">
          <h2>Markdown 原始碼</h2>
          <pre>{markdownRaw}</pre>
        </div>
      )}

      {markdown && (
        <div className="markdown-preview">
          <h2>Markdown 預覽</h2>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;
