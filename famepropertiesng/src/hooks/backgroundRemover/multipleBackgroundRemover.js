// BulkImageUploader.jsx
import React, { useState } from "react";
import { getBaseURL } from "../fetchAPIs";

const baseURL = 'http://127.0.0.1:8001';

export function BulkImageUploader() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("u2netp");
  const [bgMode, setBgMode] = useState('');

  const handleUpload = async () => {
    if (!images.length) return;

    setLoading(true);
    const formData = new FormData();
    images.forEach((file) => formData.append("images", file));

    try {
      const response = await fetch(`${baseURL}/background-remover/bulk/?model=${model}&bg_color=${bgMode}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      console.error("Bulk upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-lg font-bold mb-2">Bulk Background Removal</h2>

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
        <option value="transparent">Transparent</option>
        <option value="white">White</option>
        <option value="black">Black</option>
      </select>

      <input type="file" multiple onChange={(e) => setImages([...e.target.files])} />
      <button
        style={{backgroundColor: 'black', color: 'white'}}
        onClick={handleUpload}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded mt-2"
      >
        {loading ? "Processing..." : "Upload All"}
      </button>

      {results.length > 0 && (
        <div className="mt-4">
          <h3>Results:</h3>
          <ul>
            {results.map((res, idx) => (
              <li key={idx} className="mb-2">
                {res.error ? (
                  <span className="text-red-500">❌ {res.original}: {res.error}</span>
                ) : (
                  <div>
                    <p className="font-medium">{res.original}</p>
                    <img
                      src={res.processed_url}
                      alt="Processed"
                      className="border mt-1 max-w-full"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
