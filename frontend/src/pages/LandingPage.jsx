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
  tips: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0012 3z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
      <path d="M16 4.5a3.5 3.5 0 010 7M18 14c2.5.6 4 2.5 4 5" />
    </>
  ),
  trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  checkc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M8.5 12l2.5 2.5L16 9.5" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  heart: <path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 10c0 6-8 11-8 11z" />,
  doc: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  tick: <path d="M5 12.5l4.5 4.5L19 7.5" />,
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
  { label: "Tips", icon: "tips", target: "tips" },
];

// ================= PAGE CONTENT (yahan se text badal sakte ho) =================

// "Built for Job Seekers" ke 4 stats (sab tumhare app ke asli facts)
const STATS = [
  { icon: "users", value: "3", title: "Free Analyses Daily", desc: "Check your resume every day at no cost." },
  { icon: "trend", value: "10 MB", title: "Max File Size", desc: "Upload PDF, DOCX or TXT files up to 10 MB." },
  { icon: "checkc", value: "AI", title: "Role-Specific Score", desc: "Scored for the exact role you are targeting." },
  { icon: "clock", value: "1 Report", title: "Score + Fixes", desc: "Strengths, gaps and suggestions in one place." },
];

const HOW_STEPS = [
  {
    art: "upload",
    title: "1. Upload your resume",
    desc: "Upload your resume (PDF, DOCX or TXT) to the resume score checker, enter your target role, and view your score.",
  },
  {
    art: "review",
    title: "2. Review checker report",
    desc: "Look at your resume review report to see the areas the resume checker recommends fixing.",
  },
  {
    art: "optimize",
    title: "3. Optimize using our suggestions",
    desc: "Use the suggestions and the AI chat to make the recommended changes and improve your resume score.",
  },
  {
    art: "download",
    title: "4. Download and send",
    desc: "Save your improved resume in your desired format, run the check again, and send it with confidence.",
  },
];

const TRUST = [
  { icon: "shield", title: "Secure Email Verification", desc: "Verify your email with a one-time code before you analyze." },
  { icon: "award", title: "AI-Powered Accuracy", desc: "Analysis powered by Google Gemini, tailored to the role you choose." },
  { icon: "bolt", title: "Lightning Fast Analysis", desc: "Upload, pick a role and get your full report in moments." },
  { icon: "heart", title: "Free to Use", desc: "3 free analyses every day. No credit card required." },
];

const CHECK_GROUPS = [
  {
    icon: "doc",
    title: "Content",
    items: [
      "ATS parse rate",
      "Repetition of words and phrases",
      "Spelling and grammar",
      "Quantifying impact in experience section with examples",
    ],
  },
  { icon: "tips", title: "Skills suggestion", items: ["Hard skills", "Soft skills"] },
  {
    letter: "A",
    title: "Style",
    items: [
      "Resume design",
      "Email address",
      "Usage of active voice",
      "Usage of buzzwords and cliches",
    ],
  },
];

const CHECK_EXTRA = ["Resume length", "Long bullet points with suggestions on how to shorten"];

const TIPS = [
  { title: "Use standard section headings", desc: "Stick to names like Experience, Education and Skills so the ATS can find each section." },
  { title: "Mirror the job's keywords", desc: "Use the exact skills and tools from the job post, but only the ones you really have." },
  { title: "Keep the layout simple", desc: "Use one column. Avoid tables, text boxes, icons and images for important details." },
  { title: "Quantify your impact", desc: "Numbers stand out. Write \"reduced load time by 40%\" instead of \"improved performance\"." },
  { title: "Start bullets with action verbs", desc: "Use short, active bullet points such as Built, Led or Reduced. Keep each to one or two lines." },
  { title: "Save it the right way", desc: "Upload a PDF or DOCX with a clear name like FirstName_LastName_Role.pdf." },
];

const COMPARE = [
  { label: "ATS Compatibility Check", others: false },
  { label: "Real-time Analysis", others: false },
  { label: "Detailed Score Breakdown", others: true },
  { label: "Job Description Matching", others: false, soon: true },
  { label: "Keyword Optimization", others: true },
  { label: "Grammar & Spelling Check", others: true },
  { label: "Style Recommendations", others: false },
  { label: "Role-Specific Scoring", others: false },
  { label: "AI Chat About Your Resume", others: false },
];

// Asli feedback aaye to yahan jodo, section apne aap dikhne lagega.
// Format: { name: "Name", role: "Student", text: "Their feedback" }
const FEEDBACK = [];

// ================= STEP ILLUSTRATIONS =================
function StepArt({ kind }) {
  const skin = "#fcd5b5";
  const shadow = <ellipse cx="130" cy="160" rx="104" ry="6" fill="rgba(255,255,255,0.06)" />;

  if (kind === "upload") {
    return (
      <svg viewBox="0 0 260 170" aria-hidden="true">
        {shadow}
        <rect x="128" y="48" width="108" height="72" rx="8" fill="#1e1b3a" stroke="#60a5fa" strokeWidth="2" />
        <rect x="140" y="62" width="60" height="6" rx="3" fill="#8b7aff" />
        <rect x="140" y="76" width="80" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
        <rect x="140" y="90" width="48" height="6" rx="3" fill="rgba(255,255,255,0.18)" />
        <rect x="175" y="120" width="14" height="14" fill="#60a5fa" />
        <rect x="150" y="134" width="64" height="6" rx="3" fill="#60a5fa" />
        <circle cx="64" cy="48" r="24" fill="none" stroke="#8b7aff" strokeWidth="3" />
        <path d="M64 58V38M55 46l9-9 9 9" fill="none" stroke="#f1f0fb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="76" cy="104" r="14" fill={skin} />
        <path d="M62 102a14 14 0 0128 0c-6-4-20-4-28 0z" fill="#3b2a6b" />
        <rect x="54" y="120" width="44" height="40" rx="16" fill="#8b7aff" />
        <path d="M98 132l32-14" stroke="#8b7aff" strokeWidth="9" strokeLinecap="round" />
        <rect x="206" y="28" width="38" height="22" rx="6" fill="#fb923c" />
        <path d="M214 38h22M214 44h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "review") {
    return (
      <svg viewBox="0 0 260 170" aria-hidden="true">
        {shadow}
        <rect x="148" y="22" width="88" height="114" rx="8" fill="#1e1b3a" stroke="#60a5fa" strokeWidth="2" />
        <rect x="160" y="40" width="46" height="6" rx="3" fill="#8b7aff" />
        <rect x="160" y="56" width="64" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="160" y="68" width="56" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="160" y="80" width="64" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="160" y="96" width="40" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <circle cx="222" cy="30" r="14" fill="#4ade80" />
        <path d="M215 30l5 5 9-10" fill="none" stroke="#0d0b1f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="84" cy="80" r="15" fill={skin} />
        <path d="M69 78a15 15 0 0130 0c-8-5-22-5-30 0z" fill="#ef6a3c" />
        <rect x="62" y="98" width="44" height="62" rx="16" fill="#60a5fa" />
        <path d="M104 118c14-4 22-12 26-24" fill="none" stroke="#60a5fa" strokeWidth="9" strokeLinecap="round" />
        <path d="M30 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fb923c" />
      </svg>
    );
  }

  if (kind === "optimize") {
    return (
      <svg viewBox="0 0 260 170" aria-hidden="true">
        {shadow}
        <rect x="26" y="24" width="88" height="52" rx="8" fill="#1e1b3a" stroke="#8b7aff" strokeWidth="2" />
        <rect x="38" y="38" width="44" height="6" rx="3" fill="#8b7aff" />
        <rect x="38" y="52" width="64" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="130" y="80" width="106" height="60" rx="8" fill="#1e1b3a" stroke="#60a5fa" strokeWidth="2" />
        <rect x="142" y="94" width="50" height="6" rx="3" fill="#4ade80" />
        <rect x="142" y="108" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="142" y="120" width="60" height="5" rx="2.5" fill="rgba(255,255,255,0.18)" />
        <rect x="118" y="140" width="130" height="8" rx="4" fill="#60a5fa" />
        <circle cx="72" cy="104" r="14" fill={skin} />
        <path d="M58 102a14 14 0 0128 0c-6-4-20-4-28 0z" fill="#1f2a44" />
        <rect x="50" y="120" width="44" height="40" rx="16" fill="#fb923c" />
        <path d="M92 130l30-34" fill="none" stroke="#fb923c" strokeWidth="9" strokeLinecap="round" />
        <path d="M196 44q10-12 20 0t20 0" fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 260 170" aria-hidden="true">
      {shadow}
      <rect x="140" y="66" width="96" height="62" rx="8" fill="#1e1b3a" stroke="#60a5fa" strokeWidth="2" />
      <path d="M188 80v22M178 94l10 10 10-10" fill="none" stroke="#f1f0fb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="181" y="128" width="14" height="12" fill="#60a5fa" />
      <rect x="158" y="140" width="60" height="6" rx="3" fill="#60a5fa" />
      <rect x="176" y="20" width="46" height="16" rx="3" fill="#ef4444" />
      <text x="199" y="32" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">PDF</text>
      <rect x="196" y="40" width="46" height="16" rx="3" fill="#2563eb" />
      <text x="219" y="52" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">WORD</text>
      <rect x="150" y="40" width="40" height="16" rx="3" fill="#fb923c" />
      <text x="170" y="52" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">TXT</text>
      <circle cx="70" cy="96" r="14" fill={skin} />
      <path d="M56 94a14 14 0 0128 0c-6-4-20-4-28 0z" fill="#3b2a6b" />
      <path d="M56 100c-12-10-6-26 6-26M84 100c12-10 6-26-6-26" fill="none" stroke={skin} strokeWidth="7" strokeLinecap="round" />
      <rect x="48" y="112" width="44" height="48" rx="16" fill="#34d399" />
    </svg>
  );
}

function Mark({ ok }) {
  return (
    <span
      className={`lp-mark ${ok ? "yes" : "no"}`}
      role="img"
      aria-label={ok ? "Yes" : "No"}
    >
      <Icon name={ok ? "tick" : "close"} size={14} />
    </span>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);

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

  // Logo preview khula ho to: Esc se band + page scroll band
  useEffect(() => {
    if (!logoOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setLogoOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [logoOpen]);

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
        {/* Logo pe click -> bada preview */}
        <button
          type="button"
          className="lp-brand"
          onClick={() => setLogoOpen(true)}
          aria-label="View logo"
        >
          <img src={logo} alt="ATS Resume Checker" />
          <span>ATS Resume Checker</span>
        </button>

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
                <button
                  type="button"
                  className="lp-brand"
                  onClick={() => {
                    setMenuOpen(false);
                    setLogoOpen(true);
                  }}
                  aria-label="View logo"
                >
                  <img src={logo} alt="ATS Resume Checker" />
                  <span>ATS Resume Checker</span>
                </button>
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

      {/* ================= BUILT FOR JOB SEEKERS (stats) ================= */}
      <section className="lp-sec">
        <motion.div
          className="lp-panel"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="lp-sec-h">Built for Job Seekers</h2>
          <p className="lp-sec-sub">
            Our ATS checker helps you improve your resume with an AI-powered,
            role-specific analysis.
          </p>

          <div className="lp-stats">
            {STATS.map((s) => (
              <div className="lp-stat" key={s.title}>
                <span className="lp-round">
                  <Icon name={s.icon} size={24} />
                </span>
                <b>{s.value}</b>
                <strong>{s.title}</strong>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= HOW OUR FREE RESUME SCANNER WORKS ================= */}
      <section className="lp-sec" id="how-it-works">
        <h2 className="lp-sec-h">How our free resume scanner works</h2>
        <p className="lp-sec-sub">
          Our resume ATS checker will automatically scan your resume's
          structure, grammar, spelling, and wording to provide actionable steps
          for improvement.
        </p>

        <div className="lp-how-grid">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              className="lp-how-item"
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: (i % 2) * 0.12, duration: 0.5 }}
            >
              <div className="lp-how-art">
                <StepArt kind={step.art} />
              </div>
              <div className="lp-how-card">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= WHY PROFESSIONALS TRUST US ================= */}
      <section className="lp-sec">
        <motion.div
          className="lp-panel"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="lp-sec-h">Why Professionals Trust Us</h2>
          <p className="lp-sec-sub">
            We're committed to providing the most reliable, secure, and
            effective resume analysis tool available.
          </p>

          <div className="lp-trust">
            {TRUST.map((t) => (
              <div className="lp-trust-item" key={t.title}>
                <span className="lp-round soft">
                  <Icon name={t.icon} size={24} />
                </span>
                <strong>{t.title}</strong>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= LIST OF THE CHECKS ================= */}
      <section className="lp-sec">
        <motion.div
          className="lp-checks"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="lp-sec-h">List of the checks you'll receive:</h2>

          <div className="lp-check-grid">
            {CHECK_GROUPS.map((g) => (
              <div className="lp-check-card" key={g.title}>
                <div className="lp-check-head">
                  <span className="lp-round sm">
                    {g.letter ? g.letter : <Icon name={g.icon} size={20} />}
                  </span>
                  <h3>{g.title}</h3>
                </div>
                <ul>
                  {g.items.map((item) => (
                    <li key={item}>
                      <Icon name="checkc" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lp-check-extra">
            {CHECK_EXTRA.map((item) => (
              <div className="lp-check-card" key={item}>
                <ul>
                  <li>
                    <Icon name="checkc" size={18} />
                    <strong>{item}</strong>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= TIPS ================= */}
      <section className="lp-sec" id="tips">
        <h2 className="lp-sec-h">Resume tips that help you pass the ATS</h2>
        <p className="lp-sec-sub">
          Small changes make a big difference. Follow these before you upload
          your resume.
        </p>

        <div className="lp-tips">
          {TIPS.map((tip, i) => (
            <motion.div
              className="lp-tip"
              key={tip.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.45 }}
              whileHover={{ y: -4 }}
            >
              <span className="lp-tip-num">{i + 1}</span>
              <h3>{tip.title}</h3>
              <p>{tip.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= WHY CHOOSE OUR ATS CHECKER ================= */}
      <section className="lp-sec lp-sec-narrow">
        <h2 className="lp-sec-h">Why Choose Our ATS Checker?</h2>
        <p className="lp-sec-sub">
          Compare our comprehensive tool with other resume checkers in the
          market.
        </p>

        <div className="lp-table-wrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th scope="col">Features</th>
                <th scope="col" className="lp-ours">Our ATS Checker</th>
                <th scope="col">Other Tools</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.label}>
                  <td>
                    {row.label}
                    {row.soon && <span className="lp-soon">Soon</span>}
                  </td>
                  <td className="lp-ours">
                    <Mark ok />
                  </td>
                  <td>
                    <Mark ok={row.others} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="lp-table-note">
          Get 3 free analyses every day - no hidden costs, no subscriptions!
        </p>
        <button className="lp-btn2" onClick={handleCheckResumeClick}>
          Try It Now
        </button>
      </section>

      {/* ================= WHAT OUR USERS SAY (sirf tab dikhega jab FEEDBACK me data ho) ================= */}
      {FEEDBACK.length > 0 && (
        <section className="lp-sec">
          <h2 className="lp-sec-h">What our users say</h2>
          <p className="lp-sec-sub">Real feedback from people who tried the checker.</p>

          <div className="lp-feedback">
            {FEEDBACK.map((f) => (
              <div className="lp-fb" key={f.name}>
                <p>"{f.text}"</p>
                <div className="lp-fb-who">
                  <span className="lp-avatar">{f.name.charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{f.name}</strong>
                    <small>{f.role}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= READY TO LAND YOUR DREAM JOB ================= */}
      <section className="lp-sec">
        <motion.div
          className="lp-cta2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to Land Your Dream Job?</h2>
          <p>
            Check your resume against the role you want and get clear fixes
            before you apply.
          </p>
          <button className="lp-cta2-btn" onClick={handleCheckResumeClick}>
            Start Free Analysis Now →
          </button>
          <div className="lp-cta2-points">
            <span>3 free analyses every day</span>
            <span>Role-specific report</span>
            <span>AI follow-up chat</span>
          </div>
        </motion.div>
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

      {/* ================= LOGO PREVIEW ================= */}
      <AnimatePresence>
        {logoOpen && (
          <motion.div
            className="pf-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLogoOpen(false)}
          >
            <motion.div
              className="pf-lightbox-box"
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="pf-lightbox-close"
                onClick={() => setLogoOpen(false)}
                aria-label="Close"
              >
                <Icon name="close" size={20} />
              </button>

              <img
                className="pf-lightbox-img"
                src={logo}
                alt="ATS Resume Checker logo"
              />

              <h3>ATS Resume Checker</h3>
              <p>Know if your resume passes the ATS before you hit apply.</p>

              <button
                type="button"
                className="pf-lightbox-home"
                onClick={() => {
                  setLogoOpen(false);
                  handleCheckResumeClick();
                }}
              >
                Check my resume →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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