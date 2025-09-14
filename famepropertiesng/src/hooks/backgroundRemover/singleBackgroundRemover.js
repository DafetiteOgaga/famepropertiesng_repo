// SingleImageUploader.jsx
import React, { useState } from "react";
import { getBaseURL } from "../fetchAPIs";

// const baseURL = 'http://127.0.0.1:8001';
const baseURL = 'https://background-remover-682g.onrender.com'

export function SingleImageUploader() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("u2netp"); // default model
  const [bgMode, setBgMode] = useState(''); // default background mode

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch(`${baseURL}/background-remover/?model=${model}&bg_color=${bgMode}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setDownloadUrl(url);
      setProcessedImage(url);
      console.log("background removed successfully", blob);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // function to trigger download
  const handleDownload = () => {
    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "output.png";  // or output.jpg depending on server response
    a.click();
    a.remove();
  };
  console.log({processedImage})

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-lg font-bold mb-2">Single Image Background Removal</h2>

      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border p-1 mb-2"
      >
        <option value="u2netp">u2netp (small, fast)</option>
        <option value="silueta">silueta (medium)</option>
        <option value="u2net">u2net (large, accurate)</option>
      </select>

      <select
        value={bgMode}
        onChange={(e) => setBgMode(e.target.value)}
        className="border p-1 mb-2"
      >
        <option value="">Default</option>
        <option value="transparent">Transparent</option>
        <option value="white">White</option>
        <option value="black">Black</option>
      </select>

      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button
        style={{backgroundColor: 'black', color: 'white'}}
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        {loading ? "Processing..." : "Upload"}
      </button>

      {processedImage && (
        <div className="mt-4">
          <h3>Result:</h3>
          <img src={processedImage} alt="Processed" className="border mt-2" />
          <button onClick={handleDownload}>Download</button>
        </div>
      )}
    </div>
  );
}
