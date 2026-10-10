import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeResume, chatAboutResume } from "../services/api";
import "../App.css";

// ================= GAUGE =================
const GAUGE_R = 80;
const GAUGE_LEN = Math.PI * GAUGE_R;
const GAUGE_ARC = "M 20 100 A 80 80 0 0 1 180 100";

function getScoreMeta(score) {
  if (score >= 70) return { label: "Strong match", color: "#22c55e" };
  if (score >= 40) return { label: "Moderate match", color: "#f59e0b" };
  return { label: "Needs work", color: "#ef4444" };
}

function GaugeScore({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const meta = getScoreMeta(display);
  const progress = Math.min(Math.max(display, 0), 100) / 100;

  // knob ki position (arc ke end pe)
  const theta = Math.PI * (1 - progress);
  const knobX = 100 + GAUGE_R * Math.cos(theta);
  const knobY = 100 - GAUGE_R * Math.sin(theta);

  // ticks: 0 se 100 tak, har 10 pe
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = Math.PI * (1 - i / 10);
    const outer = i % 5 === 0 ? 99 : 96;
    return {
      key: i,
      x1: 100 + 91 * Math.cos(a),
      y1: 100 - 91 * Math.sin(a),
      x2: 100 + outer * Math.cos(a),
      y2: 100 - outer * Math.sin(a),
      major: i % 5 === 0,
    };
  });

  return (
    <div className="gx-block">
      <div className="gx">
        <svg viewBox="0 0 200 118" className="gx-svg">
          {ticks.map((t) => (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.major ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)"}
              strokeWidth={t.major ? 1.6 : 1}
              strokeLinecap="round"
            />
          ))}

          {/* track */}
          <path
            d={GAUGE_ARC}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />

          {/* progress */}
          {progress > 0 && (
            <path
              d={GAUGE_ARC}
              stroke={meta.color}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={GAUGE_LEN}
              strokeDashoffset={GAUGE_LEN * (1 - progress)}
              style={{ filter: `drop-shadow(0 0 6px ${meta.color}80)` }}
            />
          )}

          {/* knob */}
          {progress > 0 && (
            <circle
              cx={knobX}
              cy={knobY}
              r="7"
              fill="#f1f0fb"
              stroke={meta.color}
              strokeWidth="3"
            />
          )}

          <text x="20" y="114" textAnchor="middle" className="gx-end">0</text>
          <text x="180" y="114" textAnchor="middle" className="gx-end">100</text>
        </svg>

        <div className="gx-value">
          <span className="gx-number">{display}</span>
          <span className="gx-outof">/100</span>
        </div>
      </div>

      <span
        className="gx-badge"
        style={{
          color: meta.color,
          background: `${meta.color}1f`,
          borderColor: `${meta.color}55`,
        }}
      >
        {meta.label}
      </span>
    </div>
  );
}


function ProfileMenu() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("visitorProfile");
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (error) {
      console.error("Failed to load visitor profile:", error);
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("visitorProfile");
    sessionStorage.removeItem("visitorSubmitted");
    setUser(null);
    setProfileOpen(false);
    navigate("/");
  };

  if (!user) {
    return (
      <button
        type="button"
        className="ats-profile-button"
        onClick={() => navigate("/")}
      >
        👤 Get Started
      </button>
    );
  }

  return (
    <div className="ats-profile-wrapper">
      <button
        type="button"
        className="ats-profile-button"
        onClick={() => setProfileOpen((prev) => !prev)}
      >
        <span className="ats-profile-avatar-small">
          {user.name?.charAt(0).toUpperCase() || "U"}
        </span>
        <span className="ats-profile-name">
          {user.name}
        </span>
        <span className="ats-profile-arrow">
          {profileOpen ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence>
        {profileOpen && (
          <motion.div
            className="ats-profile-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="ats-profile-dropdown-header">
              <div className="ats-profile-avatar-large">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="ats-profile-user-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="ats-profile-divider"></div>

            <button
              type="button"
              className="ats-profile-menu-item"
              onClick={() => {
                setProfileOpen(false);
                navigate("/profile");
              }}
            >
              👤 Profile
            </button>

            <button
              type="button"
              className="ats-profile-menu-item ats-logout-item"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AtsCheckerPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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
    setChatMessages([]);
    setChatOpen(false);
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
    setChatMessages([]);
    setChatInput("");
    setChatOpen(false);
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    const updatedHistory = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(updatedHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await chatAboutResume(
        result.resume_text,
        result.target_role,
        chatMessages,
        userMessage
      );
      if (data.reply) {
        setChatMessages([...updatedHistory, { role: "ai", content: data.reply }]);
      } else {
        setChatMessages([...updatedHistory, { role: "ai", content: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch (err) {
      setChatMessages([...updatedHistory, { role: "ai", content: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const getScoreColor = (score) => {
    if (score >= 70) return "score-high";
    if (score >= 40) return "score-mid";
    return "score-low";
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <div className="page">
      <div className="container">
        <motion.header
          className="header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="ats-header-topbar">
            <button
              className="back-link"
              onClick={() => navigate("/")}
            >
              ← Back
            </button>

            <ProfileMenu />
          </div>

          <h1>ATS Resume Checker</h1>

          <p className="subtitle">
            Upload your resume and tell us your target role.
          </p>
        </motion.header>

        <motion.form
          onSubmit={handleSubmit}
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="form-group">
            <label>Resume</label>
            <motion.div
              className={`dropzone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
            >
              <input
                id="fileInput"
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => handleFile(e.target.files[0])}
                hidden
              />
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.p
                    key="file"
                    className="file-name"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    📄 {file.name}
                  </motion.p>
                ) : (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Drag & drop your resume, or click to browse (PDF/DOCX)
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
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
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? <span className="spinner"></span> : "Analyze my resume"}
            </motion.button>
            {(file || targetRole || result) && (
              <motion.button
                type="button"
                className="secondary"
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                className="error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        <AnimatePresence>
          {result && (
            <motion.div
              className="card result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="score-block"
                initial="hidden"
                animate="visible"
                custom={0}
                variants={fadeUp}
              >
                <GaugeScore value={result.ats_score} />

                <p className="gx-role">
                  ATS score for <b>{result.target_role}</b>
                </p>

                <p className="verdict">{result.overall_verdict}</p>

                <div className="gx-stats">
                  <div className="gx-stat">
                    <b className="ok">{result.strengths?.length ?? 0}</b>
                    <span>Strengths</span>
                  </div>
                  <div className="gx-stat">
                    <b className="bad">{result.weaknesses?.length ?? 0}</b>
                    <span>Weaknesses</span>
                  </div>
                  <div className="gx-stat">
                    <b className="warn">{result.missing_skills?.length ?? 0}</b>
                    <span>Missing skills</span>
                  </div>
                </div>
              </motion.div>

              <div className="result-grid">
                {result.category_scores && result.category_scores.length > 0 && (
                  <motion.div
                    className="grid-box category-section"
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    variants={fadeUp}
                  >
                    <h3>Score by category</h3>
                    {result.category_scores.map((cat, i) => (
                      <div key={cat.category} className="accordion-item">
                        <div
                          className="accordion-header"
                          onClick={() => setExpandedCategory(expandedCategory === i ? null : i)}
                        >
                          <span className="category-name">{cat.category}</span>
                          <div className="accordion-right">
                            <span className={`mini-score ${cat.score >= 70 ? "fill-high" : cat.score >= 40 ? "fill-mid" : "fill-low"}`}>
                              {cat.score}%
                            </span>
                            <span className={`accordion-arrow ${expandedCategory === i ? "open" : ""}`}>▾</span>
                          </div>
                        </div>
                        <AnimatePresence>
                          {expandedCategory === i && (
                            <motion.div
                              className="accordion-body"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <p>{cat.reason}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}

                {result.strengths && result.weaknesses && (
                  <motion.div
                    className="grid-box balance-section"
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    variants={fadeUp}
                  >
                    <h3>Overall Balance</h3>
                    <div className="balance-bar-bg">
                      <motion.div
                        className="balance-bar-fill"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(
                            (result.strengths.length /
                              (result.strengths.length + result.weaknesses.length)) *
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                    <div className="balance-labels">
                      <span className="balance-label-strength">
                        {result.strengths.length} Strengths
                      </span>
                      <span className="balance-label-weakness">
                        {result.weaknesses.length} Weaknesses
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="result-grid">
                <motion.div
                  className="grid-box ai-section"
                  initial="hidden"
                  animate="visible"
                  custom={3}
                  variants={fadeUp}
                >
                  <h3><span className="dot success"></span>Strengths</h3>
                  <ul className="ai-list">
                    {result.strengths?.map((item, i) => (
                      <li key={i} className="strength-item">{item}</li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  className="grid-box ai-section"
                  initial="hidden"
                  animate="visible"
                  custom={4}
                  variants={fadeUp}
                >
                  <h3><span className="dot danger"></span>Weaknesses</h3>
                  <ul className="ai-list">
                    {result.weaknesses?.map((item, i) => (
                      <li key={i} className="weakness-item">{item}</li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              <motion.div
                className="ai-section"
                initial="hidden"
                animate="visible"
                custom={5}
                variants={fadeUp}
              >
                <h3>Missing skills</h3>
                <div className="keyword-tags missing">
                  {result.missing_skills?.map((kw) => (
                    <span key={kw} className="tag">{kw}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="ai-section"
                initial="hidden"
                animate="visible"
                custom={6}
                variants={fadeUp}
              >
                <h3>💡 Suggestions</h3>
                <ul className="ai-list suggestions">
                  {result.suggestions?.map((item, i) => (
                    <li key={i} className="suggestion-item">{item}</li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <>
          <motion.button
            className="chat-fab"
            onClick={() => setChatOpen(!chatOpen)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            {chatOpen ? "✕" : "💬"}
          </motion.button>

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                className="chat-panel"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <div className="chat-panel-header">
                  <span>💬 Ask AI about your resume</span>
                  <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
                </div>

                <div className="chat-box">
                  {chatMessages.length === 0 && (
                    <p className="chat-placeholder">
                      Ask a follow-up question — e.g. "How do I fix the formatting issue?" or "What project should I add?"
                    </p>
                  )}
                  <div className="chat-messages">
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        className={`chat-bubble ${msg.role === "user" ? "chat-user" : "chat-ai"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {msg.content}
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <motion.div
                        className="chat-bubble chat-ai chat-typing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </motion.div>
                    )}
                    <div ref={chatEndRef}></div>
                  </div>
                </div>

                <form className="chat-input-row" onSubmit={handleChatSend}>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Type your question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <motion.button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Send
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default AtsCheckerPage;