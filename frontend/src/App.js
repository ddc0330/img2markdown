import React, { useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [text, setText] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [markdownRaw, setMarkdownRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState("en");

  const fileInputRef = useRef();

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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container" onPaste={handlePaste}>
      <h1>Image/Text to Markdown Converter</h1>

      <label>Select Output Language:</label>
      <select value={outputLanguage} onChange={handleOutputLanguageChange}>
        <option value="en">English</option>
        <option value="zh">Chinese</option>
      </select>

      <div className="input-container">
        {/* Text Input */}
        <textarea
          placeholder="Type text or paste an image using Ctrl + V..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Right Panel */}
        <div className="right-panel">
          <h3 className="preview-title">Image Preview:</h3>
          <div className="image-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Uploaded preview" />
            ) : (
              <p className="no-image-text">No image selected</p>
            )}
          </div>

          {/* Horizontal Button Row */}
          <div className="button-group-row">
            <button onClick={triggerFileInput}>Upload Image</button>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="convert-button"
            >
              {loading ? "Processing..." : "Convert"}
            </button>
          </div>

          {/* Hidden input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: "none" }}
          />

          {image && (
            <p className="file-name">Selected file: {image.name}</p>
          )}
        </div>
      </div>

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
