import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [image, setImage] = useState(null); // 存圖片檔案
  const [text, setText] = useState(""); // 存輸入的文字
  const [markdown, setMarkdown] = useState(""); // 存回傳的 Markdown 預覽
  const [markdownRaw, setMarkdownRaw] = useState(""); // 存回傳的 Markdown 原始碼
  const [loading, setLoading] = useState(false); // 控制 "處理中" 按鈕

  // 🔹 處理 Ctrl + V 貼上圖片
  const handlePaste = (event) => {
    const items = event.clipboardData.items; // 取得剪貼簿的內容
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile(); // 取得圖片檔案
        setImage(file); // 設定圖片狀態
        alert("已貼上圖片 📸"); // 提示用戶
        break; // 只處理第一張圖片
      }
    }
  };

  // 🔹 上傳圖片或文字到後端
  const handleUpload = async () => {
    if (!image && !text.trim()) {
      return alert("請選擇一張圖片或輸入文字！");
    }

    const formData = new FormData();

    if (image) {
      formData.append("file", image);
    }
    if (text.trim()) {
      formData.append("text", text);
    }

    setLoading(true);
    setMarkdown("");
    setMarkdownRaw("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }} onPaste={handlePaste}>
      <h1>AI Markdown 產生器</h1>

      {/* 🔹 文字輸入框 */}
      <textarea
        placeholder="輸入文字，或 Ctrl + V 貼上圖片..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: "100px", marginBottom: "10px" }}
      />

      {/* 🔹 圖片上傳按鈕 */}
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      
      {/* 🔹 上傳按鈕 */}
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "處理中..." : "上傳圖片 / 文字"}
      </button>

      {/* 🔹 顯示 AI 生成的 Markdown 原始碼 */}
      {markdownRaw && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#e8e8e8", borderRadius: "5px" }}>
          <h2>Markdown 原始碼</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>{markdownRaw}</pre>
        </div>
      )}

      {/* 🔹 顯示 AI 生成的 Markdown 預覽 */}
      {markdown && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#f4f4f4", borderRadius: "5px" }}>
          <h2>Markdown 預覽</h2>
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default App;