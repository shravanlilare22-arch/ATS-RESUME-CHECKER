import { useState, useEffect, useRef } from "react";
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
  edit: <path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  phone: (
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
    </>
  ),
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" />
    </>
  ),
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />,
  arrow: <path d="M7 17L17 7M9 7h8v8" />,
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

// ================= STORAGE HELPERS =================
// visitorProfile         -> naam + email (logout pe delete hota hai, jaise pehle)
// profileDetails:<email> -> baaki details (logout ke baad bhi bachi rehti hain)

const EMPTY_EXTRAS = {
  jobTitle: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  website: "",
  summary: "",
  photo: "",
};

function loadUser() {
  try {
    const saved = localStorage.getItem("visitorProfile");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load visitor profile:", error);
    return null;
  }
}

function extrasKey(email) {
  return `profileDetails:${(email || "").toLowerCase()}`;
}

function loadExtras(email) {
  if (!email) return { ...EMPTY_EXTRAS };
  try {
    const saved = localStorage.getItem(extrasKey(email));
    return saved ? { ...EMPTY_EXTRAS, ...JSON.parse(saved) } : { ...EMPTY_EXTRAS };
  } catch (error) {
    console.error("Failed to load profile details:", error);
    return { ...EMPTY_EXTRAS };
  }
}

function toDraft(user, extras) {
  return { name: user?.name || "", ...EMPTY_EXTRAS, ...extras };
}

// ================= VALIDATION HELPERS =================
function checkUrl(value, host) {
  const v = value.trim();
  if (!v) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!u.hostname.includes(".")) return "Enter a valid link.";
    if (host && !(u.hostname === host || u.hostname.endsWith(`.${host}`))) {
      return `Link must be from ${host}.`;
    }
    return "";
  } catch {
    return "Enter a valid link.";
  }
}

function normalizeUrl(value) {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function prettyUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

function validate(d) {
  const e = {};
  const name = d.name.trim();

  if (!name) e.name = "Name is required.";
  else if (name.length < 2) e.name = "Name must be at least 2 characters.";
  else if (name.length > 60) e.name = "Name is too long (max 60).";

  if (d.jobTitle.trim().length > 80) e.jobTitle = "Max 80 characters.";

  if (d.phone.trim() && !/^\+?[0-9][0-9\s\-()]{6,17}$/.test(d.phone.trim())) {
    e.phone = "Enter a valid number, e.g. +91 98765 43210.";
  }

  if (d.location.trim().length > 80) e.location = "Max 80 characters.";

  const li = checkUrl(d.linkedin, "linkedin.com");
  if (li) e.linkedin = li;

  const gh = checkUrl(d.github, "github.com");
  if (gh) e.github = gh;

  const web = checkUrl(d.website, "");
  if (web) e.website = web;

  return e;
}

// Photo ko 256x256 square me crop + compress karta hai (storage halka rahe)
function fileToAvatar(file, size = 256) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image"));
      img.onload = () => {
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const PHOTO_MAX_MB = 2;

// ================= FORM FIELD =================
function Field({ id, label, icon, error, hint, wide, children }) {
  return (
    <div className={`pf-field ${wide ? "wide" : ""}`}>
      <label className="pf-label" htmlFor={id}>
        {icon && <Icon name={icon} size={15} />}
        {label}
      </label>
      {children}
      {error ? (
        <p className="pf-err" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="pf-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [logoOpen, setLogoOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  // Saved visitor profile + extra details
  const [user, setUser] = useState(() => loadUser());
  const [extras, setExtras] = useState(() => loadExtras(loadUser()?.email));
  const [draft, setDraft] = useState(() => {
    const u = loadUser();
    return toDraft(u, loadExtras(u?.email));
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

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

  // Toast 2.5 sec baad hat jaye
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2500);
    return () => clearTimeout(t);
  }, [status]);

  if (!user) return null;

  const fullName = user.name || "User";
  const firstName = fullName.trim().split(" ")[0];
  const displayFirst =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Edit mode me upar ka avatar/naam live preview dikhata hai
  const shownName = editing ? draft.name.trim() || fullName : fullName;
  const shownInitial = shownName.charAt(0).toUpperCase();
  const shownPhoto = editing ? draft.photo : extras.photo;
  const shownJob = editing ? draft.jobTitle.trim() : extras.jobTitle;

  const savedDraft = toDraft(user, extras);
  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  const handleLogout = () => {
    // sirf visitorProfile delete hota hai, extra details email ke naam se bachi rehti hain
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

  // ================= EDIT MODE =================
  const startEdit = () => {
    setDraft(toDraft(user, extras));
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(savedDraft);
    setErrors({});
    setEditing(false);
  };

  const setField = (key) => (e) => {
    const value = e.target.value;
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // ================= PHOTO =================
  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photo: "Use a PNG, JPG or WebP image." }));
      return;
    }
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: `Image must be under ${PHOTO_MAX_MB} MB.` }));
      return;
    }

    try {
      const dataUrl = await fileToAvatar(file);
      setDraft((prev) => ({ ...prev, photo: dataUrl }));
      setErrors((prev) => ({ ...prev, photo: "" }));
    } catch (error) {
      console.error("Photo error:", error);
      setErrors((prev) => ({ ...prev, photo: "Could not read this image. Try another one." }));
    }
  };

  const removePhoto = () => {
    setDraft((prev) => ({ ...prev, photo: "" }));
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  // ================= SAVE =================
  const handleSave = (e) => {
    e.preventDefault();

    const errs = validate(draft);
    setErrors(errs);

    const firstBad = Object.keys(errs)[0];
    if (firstBad) {
      document.getElementById(`pf-${firstBad}`)?.focus();
      return;
    }

    const cleaned = {
      jobTitle: draft.jobTitle.trim(),
      phone: draft.phone.trim(),
      location: draft.location.trim(),
      linkedin: normalizeUrl(draft.linkedin),
      github: normalizeUrl(draft.github),
      website: normalizeUrl(draft.website),
      summary: draft.summary.trim(),
      photo: draft.photo,
    };
    const updatedUser = { ...user, name: draft.name.trim() };

    try {
      localStorage.setItem(extrasKey(user.email), JSON.stringify(cleaned));
      localStorage.setItem("visitorProfile", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Save failed:", error);
      setStatus({ type: "err", text: "Could not save. Try a smaller photo." });
      return;
    }

    setUser(updatedUser);
    setExtras(cleaned);
    setDraft(toDraft(updatedUser, cleaned));
    setEditing(false);
    setStatus({ type: "ok", text: "Profile updated" });
  };

  // ================= DISPLAY DATA =================
  const details = [
    { icon: "user", label: "Full name", value: fullName },
    { icon: "mail", label: "Email address", value: user.email, copy: true },
    { icon: "file", label: "Service", value: "ATS Resume Analyzer" },
    { icon: "check", label: "Profile status", value: "Active", ok: true },
  ];

  const contacts = [
    extras.phone && {
      icon: "phone",
      label: "Mobile",
      value: extras.phone,
      href: `tel:${extras.phone.replace(/[^\d+]/g, "")}`,
    },
    extras.location && { icon: "pin", label: "Location", value: extras.location },
    extras.linkedin && {
      icon: "link",
      label: "LinkedIn",
      value: prettyUrl(extras.linkedin),
      href: extras.linkedin,
    },
    extras.github && {
      icon: "code",
      label: "GitHub",
      value: prettyUrl(extras.github),
      href: extras.github,
    },
    extras.website && {
      icon: "globe",
      label: "Website",
      value: prettyUrl(extras.website),
      href: extras.website,
    },
  ].filter(Boolean);

  // Profile strength meter
  const checklist = [
    { label: "Photo", done: Boolean(extras.photo) },
    { label: "Job title", done: Boolean(extras.jobTitle) },
    { label: "Mobile number", done: Boolean(extras.phone) },
    { label: "Location", done: Boolean(extras.location) },
    { label: "LinkedIn", done: Boolean(extras.linkedin) },
    { label: "GitHub", done: Boolean(extras.github) },
    { label: "Summary", done: Boolean(extras.summary) },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);
  const missing = checklist.filter((c) => !c.done).map((c) => c.label);

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

          {!editing && (
            <button type="button" className="pf-edit" onClick={startEdit}>
              <Icon name="edit" size={16} />
              Edit profile
            </button>
          )}

          <div className="pf-identity">
            <div className="pf-avatar">
              {shownPhoto ? (
                <img src={shownPhoto} alt={`${shownName} profile`} />
              ) : (
                shownInitial
              )}
            </div>

            <div className="pf-who">
              <h2>{shownName}</h2>
              {shownJob && (
                <span className="pf-job">
                  <Icon name="briefcase" size={15} />
                  {shownJob}
                </span>
              )}
              <span className="pf-email-line">{user.email}</span>
              <span className="pf-active">
                <i /> Active Profile
              </span>
            </div>
          </div>

          {!editing ? (
            <>
              {/* ---------- VIEW MODE ---------- */}

              {/* Profile strength */}
              <div className="pf-block">
                <div className={`pf-strength ${percent === 100 ? "full" : ""}`}>
                  <div className="pf-strength-top">
                    <span>Profile strength</span>
                    <b>{percent}%</b>
                  </div>
                  <div
                    className="pf-meter"
                    role="progressbar"
                    aria-label="Profile strength"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                  >
                    <i style={{ width: `${percent}%` }} />
                  </div>

                  {missing.length > 0 ? (
                    <div className="pf-missing">
                      {missing.map((m) => (
                        <button
                          type="button"
                          key={m}
                          className="pf-miss"
                          onClick={startEdit}
                        >
                          + {m}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="pf-done">Your profile is complete.</p>
                  )}
                </div>
              </div>

              {/* About */}
              {extras.summary && (
                <div className="pf-block">
                  <h4 className="pf-sec-label">About</h4>
                  <p className="pf-summary">{extras.summary}</p>
                </div>
              )}

              {/* Contact & links */}
              {contacts.length > 0 && (
                <div className="pf-block">
                  <h4 className="pf-sec-label">Contact &amp; links</h4>
                  <div className="pf-contact-grid">
                    {contacts.map((c) => {
                      const isTel = c.href?.startsWith("tel:");
                      const inner = (
                        <>
                          <span className="pf-c-icon">
                            <Icon name={c.icon} size={18} />
                          </span>
                          <span className="pf-c-body">
                            <span className="pf-c-label">{c.label}</span>
                            <span className="pf-c-value">{c.value}</span>
                          </span>
                          {c.href && !isTel && (
                            <span className="pf-c-arrow">
                              <Icon name="arrow" size={16} />
                            </span>
                          )}
                        </>
                      );

                      return c.href ? (
                        <a
                          key={c.label}
                          className="pf-c-card link"
                          href={c.href}
                          target={isTel ? undefined : "_blank"}
                          rel="noreferrer"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div key={c.label} className="pf-c-card">
                          {inner}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Account */}
              <div className="pf-block">
                <h4 className="pf-sec-label">Account</h4>
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
            </>
          ) : (
            /* ---------- EDIT MODE (same card) ---------- */
            <form className="pf-form" onSubmit={handleSave} noValidate>
              <div className="pf-sec-head">
                <Icon name="user" size={20} />
                <h3>Personal Information</h3>
              </div>

              {/* Photo */}
              <div className="pf-photo-box">
                <div className="pf-photo-avatar">
                  {draft.photo ? (
                    <img src={draft.photo} alt="Profile preview" />
                  ) : (
                    <Icon name="camera" size={30} />
                  )}
                </div>

                <div className="pf-photo-info">
                  <div className="pf-photo-title">
                    PROFILE PHOTO
                    <span className={`pf-pill ${draft.photo ? "on" : ""}`}>
                      {draft.photo ? "Added" : "Not added"}
                    </span>
                  </div>
                  <p className="pf-hint">
                    Professional headshot recommended (PNG, JPG or WebP, up to{" "}
                    {PHOTO_MAX_MB} MB).
                  </p>

                  <div className="pf-photo-btns">
                    <button
                      type="button"
                      className="pf-small"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Icon name="upload" size={15} />
                      {draft.photo ? "Change Photo" : "Upload Photo"}
                    </button>

                    {draft.photo && (
                      <button
                        type="button"
                        className="pf-small danger"
                        onClick={removePhoto}
                      >
                        <Icon name="trash" size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  {errors.photo && (
                    <p className="pf-err" role="alert">
                      {errors.photo}
                    </p>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhoto}
                    hidden
                  />
                </div>
              </div>

              {/* Fields */}
              <div className="pf-form-grid">
                <Field id="pf-name" label="Full name" icon="user" error={errors.name}>
                  <input
                    id="pf-name"
                    className={`pf-input ${errors.name ? "bad" : ""}`}
                    value={draft.name}
                    onChange={setField("name")}
                    maxLength={60}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </Field>

                <Field
                  id="pf-jobTitle"
                  label="Job title / target role"
                  icon="briefcase"
                  error={errors.jobTitle}
                >
                  <input
                    id="pf-jobTitle"
                    className={`pf-input ${errors.jobTitle ? "bad" : ""}`}
                    value={draft.jobTitle}
                    onChange={setField("jobTitle")}
                    maxLength={80}
                    placeholder="e.g. Web Developer"
                  />
                </Field>

                <Field
                  id="pf-email"
                  label="Email"
                  icon="mail"
                  hint="Verified email, so it can't be changed."
                >
                  <div className="pf-lock">
                    <input
                      id="pf-email"
                      className="pf-input"
                      value={user.email || ""}
                      disabled
                      readOnly
                    />
                    <Icon name="lock" size={16} />
                  </div>
                </Field>

                <Field id="pf-phone" label="Mobile number" icon="phone" error={errors.phone}>
                  <input
                    id="pf-phone"
                    className={`pf-input ${errors.phone ? "bad" : ""}`}
                    type="tel"
                    inputMode="tel"
                    value={draft.phone}
                    onChange={setField("phone")}
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                  />
                </Field>

                <Field id="pf-location" label="Location" icon="pin" error={errors.location}>
                  <input
                    id="pf-location"
                    className={`pf-input ${errors.location ? "bad" : ""}`}
                    value={draft.location}
                    onChange={setField("location")}
                    maxLength={80}
                    placeholder="City, State"
                  />
                </Field>

                <Field
                  id="pf-website"
                  label="Portfolio / website"
                  icon="globe"
                  error={errors.website}
                >
                  <input
                    id="pf-website"
                    className={`pf-input ${errors.website ? "bad" : ""}`}
                    inputMode="url"
                    value={draft.website}
                    onChange={setField("website")}
                    placeholder="https://yourname.dev"
                  />
                </Field>

                <Field id="pf-linkedin" label="LinkedIn" icon="link" error={errors.linkedin}>
                  <input
                    id="pf-linkedin"
                    className={`pf-input ${errors.linkedin ? "bad" : ""}`}
                    inputMode="url"
                    value={draft.linkedin}
                    onChange={setField("linkedin")}
                    placeholder="linkedin.com/in/yourname"
                  />
                </Field>

                <Field id="pf-github" label="GitHub" icon="code" error={errors.github}>
                  <input
                    id="pf-github"
                    className={`pf-input ${errors.github ? "bad" : ""}`}
                    inputMode="url"
                    value={draft.github}
                    onChange={setField("github")}
                    placeholder="github.com/yourname"
                  />
                </Field>

                <Field
                  id="pf-summary"
                  label="Professional summary"
                  wide
                  hint={`${draft.summary.length}/500 characters`}
                >
                  <textarea
                    id="pf-summary"
                    className="pf-input pf-textarea"
                    rows={4}
                    maxLength={500}
                    value={draft.summary}
                    onChange={setField("summary")}
                    placeholder="2-3 lines about your skills, projects and the role you want."
                  />
                </Field>
              </div>

              <div className="pf-form-actions">
                <button type="button" className="pf-reset" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit" className="pf-save" disabled={!dirty}>
                  <Icon name="tick" size={18} />
                  Save changes
                </button>
              </div>
            </form>
          )}
        </motion.section>
      </main>

      {/* ================= TOAST ================= */}
      <AnimatePresence>
        {status && (
          <motion.div
            className={`pf-toast ${status.type}`}
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {status.text}
          </motion.div>
        )}
      </AnimatePresence>

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