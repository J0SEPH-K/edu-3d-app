import React, { useState } from "react";
import "./App.css";
import ChemistryViewer from "./ChemistryViewer";

function App() {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("chemistry");
  const [gifUrl, setGifUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    alert(`Subject: ${subject}\nPrompt: ${prompt}`);
  };

  return (
    <div className="app-container">
      <h1>🧪 3D Educational Model Generator</h1>

      <label>
        Select Subject:
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="chemistry">Chemistry</option>
          <option value="physics">Physics</option>
          <option value="biology">Biology</option>
          
        </select>
      </label>

      {image && <img src={image} alt="Preview" className="preview-image" />}

      <textarea
        placeholder="Describe the object or provide context..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />

      {subject === "chemistry" && (
        <ChemistryViewer formula={prompt} onGifGenerated={setGifUrl} />
      )}

      {gifUrl && (
        <div style={{ marginTop: "2rem" }}>
          <h3>🎬 Generated GIF:</h3>
          <img src={gifUrl} alt="3D GIF" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
}

export default App;
