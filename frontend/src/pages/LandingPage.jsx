import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="landing">
      <motion.nav
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="logo">
          <span className="logo-dot"></span>
          ATS Resume Checker
        </span>
      </motion.nav>

      <section className="hero">
        <motion.div
          className="hero-badge"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          ✨ Powered by AI
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          Know if your resume passes the ATS
          <br />
          <span className="gradient-text">before you hit apply.</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
        >
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
          onClick={() => navigate("/ats-score")}
        >
          Check my resume →
        </motion.button>
      </section>

      <section className="features">
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
        ].map((f, i) => (
          <motion.div
            key={f.title}
            className="feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            whileHover={{ y: -6 }}
          >
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <motion.footer
        className="landing-footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Built with FastAPI, React, and Google Gemini
      </motion.footer>
    </div>
  );
}

export default LandingPage;