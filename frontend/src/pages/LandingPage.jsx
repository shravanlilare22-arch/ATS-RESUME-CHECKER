import { useState } from "react";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NameEmailModal from "../components/NameEmailModal";
import { saveVisitor } from "../services/api";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  const handleCheckResumeClick = () => {
    const alreadySubmitted = sessionStorage.getItem("visitorSubmitted");
    if (alreadySubmitted) {
      navigate("/ats-score");
    } else {
      setShowVisitorModal(true);
    }
  };

  const handleVisitorSubmit = async (name, email) => {
    await saveVisitor(name, email);
    sessionStorage.setItem("visitorSubmitted", "true");
    setShowVisitorModal(false);
    navigate("/ats-score");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="logo">
          <img src={logo} alt="ATS Resume Checker" className="logo-img" />
          ATS Resume Checker
        </span>

        <div className="nav-links">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Home
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("features")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("how-it-works")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            How It Works
          </a>
          <button className="nav-login-btn" onClick={() => setShowVisitorModal(true)}>
            👤 Get Started
          </button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </motion.nav>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
                setMenuOpen(false);
              }}
            >
              Home
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                setMenuOpen(false);
              }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("how-it-works")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                setMenuOpen(false);
              }}
            >
              How It Works
            </a>
            <a
              href="#get-started"
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(false);
                setShowVisitorModal(true);
              }}
            >
              👤 Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HERO SECTION ================= */}
      <section className="hero" id="home">
        <motion.div
          className="hero-badge"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          ✨ Smarter Resume Insights
        </motion.div>

        <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          Know if your resume passes the ATS
          <br />
          <span className="gradient-text">before you hit apply.</span>
        </motion.h1>

        <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          Upload your resume, tell us the role you're targeting, and get an
          AI-powered analysis with a real ATS-style score, honest feedback,
          and concrete suggestions to improve.
        </motion.p>

        <motion.button
          className="cta-button"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(59,130,246,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCheckResumeClick}
        >
          Check my resume →
        </motion.button>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="features" id="features">
        {[
          {
            icon: "🎯",
            title: "Role-Specific",
            desc: "Analysis tailored to the specific role and field you're targeting — not generic keyword matching.",
          },
          {
            icon: "🤖",
            title: "AI-Powered",
            desc: "Powered by AI that reads and understands your resume like a real recruiter would.",
          },
          {
            icon: "💡",
            title: "Actionable Suggestions",
            desc: "Not just a score — clear, specific suggestions on what to fix and improve.",
          },
        ].map((f) => (
          <motion.div
            key={f.title}
            className="feature-card"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works" id="how-it-works">
        <h2>How It Works</h2>

        <div className="steps-row">
          {[
            { num: "1", title: "Upload Resume", desc: "Upload your resume in PDF or DOCX format." },
            { num: "2", title: "Enter Target Role", desc: "Tell us the job role you're applying for." },
            { num: "3", title: "Get AI Analysis", desc: "Receive your ATS score, strengths, weaknesses, and suggestions instantly." },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              className="step-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <motion.footer
        className="landing-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Built with FastAPI, React, and Google Gemini
      </motion.footer>

      {showVisitorModal && (
        <NameEmailModal
          onSubmit={handleVisitorSubmit}
          onClose={() => setShowVisitorModal(false)}
        />
      )}
    </>
  );
}

export default LandingPage;