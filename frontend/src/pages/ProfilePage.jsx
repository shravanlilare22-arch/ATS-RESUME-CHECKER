import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

// ================= ICONS =================
const ICONS = {
  back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 012-2h9" />
    </>
  ),
  tick: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  home: (
    <>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
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

function ProfilePage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);

  // Saved visitor profile
  const [user] = useState(() => {
    try {
      const saved = localStorage.getItem("visitorProfile");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load visitor profile:", error);
      return null;
    }
  });

  // Profile nahi hai to landing page pe wapas
  useEffect(() => {
    if (!user) navigate("/", { replace: true });
  }, [user, navigate]);

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

  if (!user) return null;

  const fullName = user.name || "User";
  const firstName = fullName.trim().split(" ")[0];
  const displayFirst =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const initial = fullName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("visitorProfile");
    sessionStorage.removeItem("visitorSubmitted");
    navigate("/");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.email || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const details = [
    { icon: "user", label: "Full name", value: fullName },
    { icon: "mail", label: "Email address", value: user.email, copy: true },
    { icon: "file", label: "Service", value: "ATS Resume Analyzer" },
    { icon: "check", label: "Profile status", value: "Active", ok: true },
  ];

  return (
    <div className="pf-page">
      {/* ================= TOP BAR ================= */}
      <header className="pf-topbar">
        <button className="pf-back" onClick={() => navigate("/ats-score")}>
          <Icon name="back" size={18} />
          ATS Checker
        </button>

        {/* Logo pe click -> bada preview */}
        <button
          className="pf-brand"
          onClick={() => setLogoOpen(true)}
          aria-label="View logo"
        >
          <img src={logo} alt="ATS Resume Checker" />
          <span>ATS Resume Checker</span>
        </button>
      </header>

      <main className="pf-main">
        {/* ================= WELCOME ================= */}
        <motion.div
          className="pf-welcome"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          <span className="pf-badge">MY PROFILE</span>
          <h1>
            Welcome, {displayFirst} <span className="pf-wave">👋</span>
          </h1>
          <p>Your ATS Resume Checker profile</p>
        </motion.div>

        {/* ================= PROFILE CARD ================= */}
        <motion.section
          className="pf-card"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          <div className="pf-cover" />

          <div className="pf-identity">
            <div className="pf-avatar">{initial}</div>

            <div className="pf-who">
              <h2>{fullName}</h2>
              <span className="pf-email-line">{user.email}</span>
              <span className="pf-active">
                <i /> Active Profile
              </span>
            </div>
          </div>

          <div className="pf-grid">
            {details.map((d) => (
              <div className="pf-item" key={d.label}>
                <div className="pf-item-icon">
                  <Icon name={d.icon} size={20} />
                </div>

                <div className="pf-item-body">
                  <span className="pf-item-label">{d.label}</span>
                  <span className={`pf-item-value ${d.ok ? "ok" : ""}`}>
                    {d.value}
                  </span>
                </div>

                {d.copy && (
                  <button
                    className="pf-copy"
                    onClick={handleCopy}
                    aria-label="Copy email"
                    title={copied ? "Copied" : "Copy email"}
                  >
                    <Icon name={copied ? "tick" : "copy"} size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pf-actions">
            <button
              className="pf-btn primary"
              onClick={() => navigate("/ats-score")}
            >
              <Icon name="file" size={18} />
              Analyze My Resume
            </button>

            <button className="pf-btn danger" onClick={handleLogout}>
              <Icon name="logout" size={18} />
              Logout
            </button>
          </div>
        </motion.section>
      </main>

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
                className="pf-lightbox-home"
                onClick={() => navigate("/")}
              >
                <Icon name="home" size={18} />
                Go to Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfilePage;