import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="navbar">
        <span className="logo">ATS Resume Checker</span>
      </nav>

      <section className="hero">
        <h1>Know if your resume passes the ATS — before you hit apply.</h1>
        <p>
          Upload your resume, tell us the role you're targeting, and get an
          AI-powered analysis with a real ATS-style score, honest feedback,
          and concrete suggestions to improve.
        </p>
        <button className="cta-button" onClick={() => navigate("/ats-score")}>
          Check my resume →
        </button>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>🎯 Niche-Aware</h3>
          <p>Analysis tailored to the specific role and field you're targeting — not generic keyword matching.</p>
        </div>
        <div className="feature-card">
          <h3>🤖 AI-Powered</h3>
          <p>Powered by AI that reads and understands your resume like a real recruiter would.</p>
        </div>
        <div className="feature-card">
          <h3>💡 Actionable Suggestions</h3>
          <p>Not just a score — clear, specific suggestions on what to fix and improve.</p>
        </div>
      </section>

      <footer className="landing-footer">
        Built with FastAPI, React, and Google Gemini
      </footer>
    </div>
  );
}

export default LandingPage;