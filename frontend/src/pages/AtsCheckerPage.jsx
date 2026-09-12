import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeResume } from "../services/api";
import "../App.css";

function AtsCheckerPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
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

    if (!file || !targetRole.trim()) {
      setError("Please upload a resume and enter your target role.");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeResume(file, targetRole);
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTargetRole("");
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
          <button className="back-link" onClick={() => navigate("/")}>← Back</button>
          <h1>ATS Resume Checker</h1>
          <p className="subtitle">
            Upload your resume and tell us your target role.
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
            <label>Target role</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. Frontend Developer, Data Analyst, Backend Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          <div className="button-row">
            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Analyze my resume"}
            </button>
            {(file || targetRole || result) && (
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
              <div className={`score-circle ${getScoreColor(result.ats_score)}`}>
                <span>{result.ats_score}%</span>
              </div>
              <p className="score-label">ATS Score for {result.target_role}</p>
              <p className="verdict">{result.overall_verdict}</p>
            </div>

            {result.category_scores && result.category_scores.length > 0 && (
              <div className="category-section">
                <h3>Score by category</h3>
                {result.category_scores.map((cat) => (
                  <div key={cat.category} className="category-row">
                    <div className="category-header">
                      <span className="category-name">{cat.category}</span>
                      <span className="category-score">{cat.score}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill ${
                          cat.score >= 70 ? "fill-high" : cat.score >= 40 ? "fill-mid" : "fill-low"
                        }`}
                        style={{ width: `${cat.score}%` }}
                      ></div>
                    </div>
                    <p className="category-reason">{cat.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {result.strengths && result.weaknesses && (
              <div className="balance-section">
                <h3>Overall Balance</h3>
                <div className="balance-bar-bg">
                  <div
                    className="balance-bar-fill"
                    style={{
                      width: `${Math.round(
                        (result.strengths.length /
                          (result.strengths.length + result.weaknesses.length)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="balance-labels">
                  <span className="balance-label-strength">
                    {result.strengths.length} Strengths
                  </span>
                  <span className="balance-label-weakness">
                    {result.weaknesses.length} Weaknesses
                  </span>
                </div>
              </div>
            )}

            <div className="ai-section">
              <h3><span className="dot success"></span>Strengths</h3>
              <ul className="ai-list">
                {result.strengths?.map((item, i) => (
                  <li key={i} className="strength-item">{item}</li>
                ))}
              </ul>
            </div>

            <div className="ai-section">
              <h3><span className="dot danger"></span>Weaknesses</h3>
              <ul className="ai-list">
                {result.weaknesses?.map((item, i) => (
                  <li key={i} className="weakness-item">{item}</li>
                ))}
              </ul>
            </div>

            <div className="ai-section">
              <h3>Missing skills</h3>
              <div className="keyword-tags missing">
                {result.missing_skills?.map((kw) => (
                  <span key={kw} className="tag">{kw}</span>
                ))}
              </div>
            </div>

            <div className="ai-section">
              <h3>💡 Suggestions</h3>
              <ul className="ai-list suggestions">
                {result.suggestions?.map((item, i) => (
                  <li key={i} className="suggestion-item">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AtsCheckerPage;