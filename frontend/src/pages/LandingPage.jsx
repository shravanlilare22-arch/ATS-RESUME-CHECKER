import { useState, useEffect, useRef } from "react";
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

// ================= ICONS =================
const ICONS = {
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  features: <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />,
  how: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevron: <path d="M6 9l6 6 6-6" />,
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const NAV_LINKS = [
  { label: "Home", icon: "home", target: "home" },
  { label: "Features", icon: "features", target: "features" },
  { label: "How It Works", icon: "how", target: "how-it-works" },
];

function LandingPage() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Load saved visitor profile from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedProfile = localStorage.getItem("visitorProfile");
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (error) {
      console.error("Failed to load visitor profile:", error);
      return null;
    }
  });

  // Mobile menu khula ho to page scroll band
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Dropdown ke bahar click karne pe band
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ================= SCROLL =================
  const scrollToSection = (id) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleNavClick = (id) => {
    setMenuOpen(false);
    // drawer band hone ke baad scroll, taaki body overflow ka issue na ho
    setTimeout(() => scrollToSection(id), 50);
  };

  // ================= CHECK RESUME =================
  const handleCheckResumeClick = () => {
    const savedProfile = localStorage.getItem("visitorProfile");

    if (savedProfile) {
      navigate("/ats-score");
    } else {
      setShowVisitorModal(true);
    }
  };

  // ================= VISITOR SUBMIT =================
  const handleVisitorSubmit = async (name, email) => {
    try {
      const response = await saveVisitor(name, email);

      const profile = {
        name: name,
        email: email,
        visitorId: response?.visitor_id || null,
      };

      localStorage.setItem("visitorProfile", JSON.stringify(profile));
      sessionStorage.setItem("visitorSubmitted", "true");

      setUser(profile);
      setShowVisitorModal(false);
      navigate("/ats-score");
    } catch (error) {
      console.error("Visitor submission failed:", error);
      // NameEmailModal ko error dikhane ke liye wapas throw
      throw error;
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("visitorProfile");
    sessionStorage.removeItem("visitorSubmitted");

    setUser(null);
    setProfileOpen(false);
    setMenuOpen(false);

    navigate("/");
  };

  // ================= PROFILE =================
  const handleProfilePage = () => {
    setProfileOpen(false);
    setMenuOpen(false);
    navigate("/profile");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <motion.header
        className="lp-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="lp-brand" onClick={() => scrollToSection("home")}>
          <img src={logo} alt="ATS Resume Checker" />
          <span>ATS Resume Checker</span>
        </div>

        <nav className="lp-links">
          {NAV_LINKS.map((l) => (
            <button
              key={l.target}
              className="lp-link"
              onClick={() => scrollToSection(l.target)}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="lp-nav-right">
          {/* Desktop: user chip / Get Started */}
          <div className="lp-desktop-only">
            {user ? (
              <div className="lp-profile-wrap" ref={profileRef}>
                <button
                  className={`lp-chip ${profileOpen ? "open" : ""}`}
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  <span className="lp-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                  <Icon name="chevron" size={16} className="lp-chev" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="lp-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="lp-user-box">
                        <div className="lp-avatar big">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="lp-user-info">
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>

                      <div className="lp-sep" />

                      <button
                        className="lp-menu-item"
                        onClick={handleProfilePage}
                      >
                        <Icon name="user" />
                        Profile
                      </button>

                      <button
                        className="lp-menu-item danger"
                        onClick={handleLogout}
                      >
                        <Icon name="logout" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                className="lp-btn-main"
                onClick={() => setShowVisitorModal(true)}
              >
                <Icon name="user" size={18} />
                Get Started
              </button>
            )}
          </div>

          <button
            className="lp-burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={26} />
          </button>
        </div>
      </motion.header>

      {/* ================= MOBILE DRAWER ================= */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="lp-drawer-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="lp-overlay" onClick={() => setMenuOpen(false)} />

            <motion.aside
              className="lp-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
            >
              <div className="lp-drawer-head">
                <div className="lp-brand">
                  <img src={logo} alt="ATS Resume Checker" />
                  <span>ATS Resume Checker</span>
                </div>
                <button
                  className="lp-burger"
                  style={{ display: "block" }}
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <Icon name="close" size={26} />
                </button>
              </div>

              <div className="lp-drawer-links">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.target}
                    className="lp-drawer-item"
                    onClick={() => handleNavClick(l.target)}
                  >
                    <Icon name={l.icon} size={22} />
                    {l.label}
                  </button>
                ))}
              </div>

              {user ? (
                <>
                  <div className="lp-drawer-user">
                    <div className="lp-avatar big">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="lp-user-info">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>

                  <div className="lp-drawer-links">
                    <button
                      className="lp-drawer-item"
                      onClick={handleProfilePage}
                    >
                      <Icon name="user" size={22} />
                      Profile
                    </button>
                    <button
                      className="lp-drawer-item danger"
                      onClick={handleLogout}
                    >
                      <Icon name="logout" size={22} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="lp-drawer-cta">
                  <button
                    className="lp-btn-main"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowVisitorModal(true);
                    }}
                  >
                    <Icon name="user" size={20} />
                    Get Started
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HERO SECTION ================= */}
      <section className="lp-hero" id="home">
        <div className="lp-hero-text">
          <motion.span
            className="lp-badge"
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
          >
            ✨ Smarter Resume Insights
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
          >
            Know if your resume passes the ATS{" "}
            <span className="lp-grad">before you hit apply.</span>
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

          <motion.div
            className="lp-hero-btns"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
          >
            <motion.button
              className="lp-cta"
              whileHover={{
                scale: 1.04,
                boxShadow: "0 8px 30px rgba(59,130,246,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckResumeClick}
            >
              Check my resume →
            </motion.button>

            <button
              className="lp-ghost"
              onClick={() => scrollToSection("how-it-works")}
            >
              How it works
            </button>
          </motion.div>
        </div>

        {/* Sample report card (sirf demo ke liye) */}
        <motion.div
          className="lp-card"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
        >
          <div className="lp-card-top">
            <span className="lp-tag">Sample report</span>
            <span className="lp-tag ok">Good match</span>
          </div>

          <h3>Software Engineer Resume</h3>

          <div className="lp-score-row">
            <div className="lp-score">
              <b>78</b>
            </div>

            <div className="lp-bars">
              <div>
                <label>Keywords</label>
                <div className="lp-bar"><i style={{ width: "82%" }} /></div>
              </div>
              <div>
                <label>Formatting</label>
                <div className="lp-bar"><i style={{ width: "90%" }} /></div>
              </div>
              <div>
                <label>Experience</label>
                <div className="lp-bar"><i style={{ width: "65%" }} /></div>
              </div>
            </div>
          </div>

          <div className="lp-note">
            <b>Suggestion:</b> Add measurable results to your project bullet
            points.
          </div>
        </motion.div>
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
            {
              num: "1",
              title: "Upload Resume",
              desc: "Upload your resume in PDF or DOCX format.",
            },
            {
              num: "2",
              title: "Enter Target Role",
              desc: "Tell us the job role you're applying for.",
            },
            {
              num: "3",
              title: "Get AI Analysis",
              desc: "Receive your ATS score, strengths, weaknesses, and suggestions instantly.",
            },
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

      {/* ================= VISITOR MODAL ================= */}
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