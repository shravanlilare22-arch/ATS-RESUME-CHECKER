import { useState } from "react";
import { analyzeResume } from "./services/api";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description.");
      return;
    }

    setLoading(true);
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>ATS Resume Checker</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Upload Resume (PDF/DOCX)</label>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label>Job Description</label>
          <textarea
            rows="6"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Check Match Score"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h2
            style={{
              textAlign: "center",
              fontSize: "28px",
              color:
                result.match_score >= 70
                  ? "#166534"
                  : result.match_score >= 40
                  ? "#92400e"
                  : "#991b1b",
              marginBottom: "20px",
            }}
          >
            Match Score: {result.match_score}%
          </h2>

          <div className="keywords-section">
            <h3>✅ Matched Keywords</h3>
            <div className="keyword-tags matched">
              {result.matched_keywords?.map((kw) => (
                <span key={kw} className="tag">{kw}</span>
              ))}
            </div>
          </div>

          <div className="keywords-section">
            <h3>❌ Missing Keywords</h3>
            <div className="keyword-tags missing">
              {result.missing_keywords?.map((kw) => (
                <span key={kw} className="tag">{kw}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;