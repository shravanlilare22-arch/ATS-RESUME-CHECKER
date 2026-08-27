import { useState } from "react";
import { analyzeResume } from "./services/api";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (selectedFile) setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError("");
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "score-high";
    if (score >= 40) return "score-mid";
    return "score-low";
  };

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <h1>ATS Resume Checker</h1>
          <p className="subtitle">
            See how well your resume matches a job description before you apply.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="card">
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

          <div className="form-group">
            <label>Job description</label>
            <textarea
              rows="7"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="button-row">
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Check match score"}
            </button>
            {(file || jobDescription || result) && (
              <button type="button" className="secondary" onClick={handleReset}>
                Reset
              </button>
            )}
          </div>

          {error && <p className="error">{error}</p>}
        </form>

        {result && (
          <div className="card result">
            <div className="score-block">
              <div className={`score-circle ${getScoreColor(result.match_score)}`}>
                <span>{result.match_score}%</span>
              </div>
              <p className="score-label">Match score</p>
            </div>

            <div className="keywords-section">
              <h3><span className="dot success"></span>Matched keywords</h3>
              <div className="keyword-tags matched">
                {result.matched_keywords?.length ? (
                  result.matched_keywords.map((kw) => (
                    <span key={kw} className="tag">{kw}</span>
                  ))
                ) : (
                  <p className="empty-note">No matches found</p>
                )}
              </div>
            </div>

            <div className="keywords-section">
              <h3><span className="dot danger"></span>Missing keywords</h3>
              <div className="keyword-tags missing">
                {result.missing_keywords?.length ? (
                  result.missing_keywords.map((kw) => (
                    <span key={kw} className="tag">{kw}</span>
                  ))
                ) : (
                  <p className="empty-note">Great — nothing missing!</p>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="footer">
          Built with FastAPI + React
        </footer>
      </div>
    </div>
  );
}

export default App;