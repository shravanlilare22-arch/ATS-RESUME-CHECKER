import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AtsCheckerPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (selectedFile) setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <button className="back-link" onClick={() => navigate("/")}>← Back</button>
          <h1>ATS Resume Checker</h1>
          <p className="subtitle">
            Upload your resume and tell us your target role.
          </p>
        </header>

        <div className="card">
          <div className="form-group">
            <label>Resume</label>
            <div
              className={`dropzone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => handleFile(e.target.files[0])}
                hidden
              />
              {file ? (
                <p className="file-name">📄 {file.name}</p>
              ) : (
                <p>Drag & drop your resume, or click to browse (PDF/DOCX)</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AtsCheckerPage;