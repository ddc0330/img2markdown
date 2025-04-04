import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css"; // 🔹 Make sure to load CSS

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [text, setText] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [markdownRaw, setMarkdownRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState("en");

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
      const API_BASE_URL = "https://img2markdown.onrender.com";
      // const API_BASE_URL = "http://localhost:8000";

      const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Check for errors in the API response
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

  return (
    <div className="container" onPaste={handlePaste}>
      <h1>Image/Text to Markdown Converter</h1>

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

export default App;
