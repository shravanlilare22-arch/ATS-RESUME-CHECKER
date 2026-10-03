import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      const saved = localStorage.getItem("visitorProfile");

      if (!saved) {
        return null;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error("Profile loading error:", error);
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("visitorProfile");
    sessionStorage.removeItem("visitorSubmitted");

    navigate("/");
  };

  // ================= NO PROFILE =================

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0b20",
          color: "white",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#6366f1",
            color: "white",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back Home
        </button>

        <div
          style={{
            maxWidth: "700px",
            margin: "100px auto",
            textAlign: "center",
          }}
        >
          <h1>Profile Not Found</h1>

          <p
            style={{
              color: "#aaa",
              marginTop: "15px",
            }}
          >
            Please go back to the home page and enter your name and email.
          </p>
        </div>
      </div>
    );
  }

  // ================= PROFILE =================

  const firstLetter =
    user.name?.charAt(0).toUpperCase() || "U";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(99,102,241,0.18), transparent 35%), #0d0b20",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "30px",
      }}
    >
      {/* ================= TOP BAR ================= */}

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "60px",
        }}
      >
        <button
          onClick={() => navigate("/ats-score")}
          style={{
            padding: "11px 18px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          ← ATS Checker
        </button>

        {/* Profile button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "9px 16px",
            borderRadius: "12px",
            background:
              "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            boxShadow:
              "0 8px 25px rgba(99,102,241,0.25)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
            }}
          >
            {firstLetter}
          </div>

          <span
            style={{
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {user.name}
          </span>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Heading */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: "20px",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#c4b5fd",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
            }}
          >
            MY PROFILE
          </span>

          <h1
            style={{
              fontSize: "38px",
              margin: "14px 0 8px",
              fontWeight: "700",
            }}
          >
            Welcome, {user.name.split(" ")[0]} 👋
          </h1>

          <p
            style={{
              color: "#aaa8c5",
              fontSize: "15px",
              margin: 0,
            }}
          >
            Your ATS Resume Checker profile
          </p>
        </div>

        {/* ================= MAIN CARD ================= */}

        <div
          style={{
            background: "rgba(255,255,255,0.055)",
            border:
              "1px solid rgba(255,255,255,0.10)",
            borderRadius: "24px",
            padding: "35px",
            boxShadow:
              "0 25px 70px rgba(0,0,0,0.30)",
          }}
        >
          {/* User Header */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              paddingBottom: "30px",
              borderBottom:
                "1px solid rgba(255,255,255,0.09)",
            }}
          >
            {/* Avatar */}

            <div
              style={{
                width: "82px",
                height: "82px",
                minWidth: "82px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "700",
                boxShadow:
                  "0 12px 35px rgba(99,102,241,0.30)",
              }}
            >
              {firstLetter}
            </div>

            <div>
              <h2
                style={{
                  margin: "0 0 7px",
                  fontSize: "25px",
                }}
              >
                {user.name}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#aaa8c5",
                  fontSize: "14px",
                }}
              >
                {user.email}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  background: "rgba(34,197,94,0.10)",
                  color: "#6ee7a0",
                  fontSize: "11px",
                  fontWeight: "700",
                }}
              >
                ● Active Profile
              </span>
            </div>
          </div>

          {/* ================= DETAILS ================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
              marginTop: "30px",
            }}
          >
            {/* Name */}

            <div
              style={{
                padding: "20px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.045)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "12px",
                }}
              >
                👤
              </div>

              <div
                style={{
                  color: "#8885a5",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                Full Name
              </div>

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {user.name}
              </div>
            </div>

            {/* Email */}

            <div
              style={{
                padding: "20px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.045)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "12px",
                }}
              >
                📧
              </div>

              <div
                style={{
                  color: "#8885a5",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                Email Address
              </div>

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  wordBreak: "break-word",
                }}
              >
                {user.email}
              </div>
            </div>

            {/* Service */}

            <div
              style={{
                padding: "20px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.045)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "12px",
                }}
              >
                📄
              </div>

              <div
                style={{
                  color: "#8885a5",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                Service
              </div>

              <div
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                ATS Resume Analyzer
              </div>
            </div>

            {/* Status */}

            <div
              style={{
                padding: "20px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.045)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "12px",
                }}
              >
                ✓
              </div>

              <div
                style={{
                  color: "#8885a5",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                Profile Status
              </div>

              <div
                style={{
                  color: "#6ee7a0",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                Active
              </div>
            </div>
          </div>

          {/* ================= BUTTONS ================= */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
            }}
          >
            <button
              onClick={() => navigate("/ats-score")}
              style={{
                padding: "13px 20px",
                border: "none",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow:
                  "0 8px 22px rgba(59,130,246,0.20)",
              }}
            >
              📄 Analyze My Resume
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: "13px 20px",
                borderRadius: "11px",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                background:
                  "rgba(239,68,68,0.10)",
                color: "#ff9b9b",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;