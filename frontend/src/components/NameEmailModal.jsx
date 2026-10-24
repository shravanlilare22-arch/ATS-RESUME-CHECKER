import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendOTP, verifyOTP } from "../services/api";
import { getFriendlyError, validateEmail } from "../utils/validation";

function NameEmailModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // NEW: email verify ho chuka ho par aage ka step fail hua ho, to dobara OTP nahi chahiye
  const [verifiedUser, setVerifiedUser] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      await sendOTP(name.trim(), email.trim().toLowerCase());

      setOtpSent(true);
      setSuccess("OTP sent successfully to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);

      setError(getFriendlyError(err, "Unable to send OTP. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: verification ke baad parent ka flow (visitor save + aage badhna) chalao.
  // Ye khud error pakadta hai, isliye galat "Invalid OTP" message nahi aata.
  const continueAfterVerification = async (user) => {
    try {
      await onSubmit(user.name, user.email);
    } catch (err) {
      console.error("Continue after verification error:", err);

      setSuccess("");
      setError(
        `Your email is verified, but we couldn't continue. ${getFriendlyError(
          err,
          "Please try again."
        )} Press Continue to try again.`
      );
    }
  };

  // VERIFY OTP AND SAVE SESSION TOKEN
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // NEW: email pehle hi verify ho chuka hai, sirf aage ka step dobara chalao
    if (verifiedUser) {
      setVerifying(true);
      await continueAfterVerification(verifiedUser);
      setVerifying(false);
      return;
    }

    const enteredOTP = otp.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!enteredOTP) {
      setError("Please enter the 6-digit OTP we sent to your email.");
      return;
    }

    if (!/^\d{6}$/.test(enteredOTP)) {
      setError("The OTP must be exactly 6 digits.");
      return;
    }

    setVerifying(true);

    try {
      let user;

      try {
        const verification = await verifyOTP(
          normalizedEmail,
          enteredOTP
        );

        if (
          !verification?.verified ||
          !verification?.access_token
        ) {
          setError(
            "Verification failed. Please request a new OTP."
          );
          return;
        }

        // Store the verified session token.
        // api.js also stores this token; setting it here is intentional.
        sessionStorage.setItem(
          "access_token",
          verification.access_token
        );

        user = {
          name: verification.name || name.trim(),
          email: verification.email || normalizedEmail,
        };
      } catch (err) {
        console.error("Verify OTP error:", err);

        setError(
          getFriendlyError(err, "Invalid or expired OTP. Please try again.")
        );
        return;
      }

      setVerifiedUser(user);
      setSuccess("Email verified successfully! 🎉");

      // Save visitor and continue the existing parent flow.
      await continueAfterVerification(user);
    } finally {
      setVerifying(false);
    }
  };

  // BACK TO NAME AND EMAIL FORM
  const handleBack = () => {
    setOtp("");
    setOtpSent(false);
    setVerifiedUser(null);
    setError("");
    setSuccess("");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-box"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
        >
          {!otpSent ? (
            <>
              <h3>Before we start</h3>

              <p className="modal-subtext">
                Enter your name and email to continue. We'll send you a
                verification code.
              </p>

              <form onSubmit={handleSendOTP} noValidate>
                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    className="text-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    className="text-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                {error && <p className="error" role="alert">{error}</p>}

                {success && (
                  <p className="success">{success}</p>
                )}

                <div className="button-row">
                  <button type="submit" disabled={submitting}>
                    {submitting ? (
                      <span className="spinner"></span>
                    ) : (
                      "Send OTP"
                    )}
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h3>Verify Your Email</h3>

              <p className="modal-subtext">
                We've sent a 6-digit verification code to:
              </p>

              <p
                style={{
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                {email}
              </p>

              <form onSubmit={handleVerifyOTP} noValidate>
                <div className="form-group">
                  <label>Enter OTP</label>

                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    disabled={verifying || Boolean(verifiedUser)}
                    required
                  />
                </div>

                {error && <p className="error" role="alert">{error}</p>}

                {success && (
                  <p className="success">{success}</p>
                )}

                <div className="button-row">
                  <button type="submit" disabled={verifying}>
                    {verifying ? (
                      <span className="spinner"></span>
                    ) : verifiedUser ? (
                      "Continue"
                    ) : (
                      "Verify OTP"
                    )}
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={handleBack}
                    disabled={verifying}
                  >
                    Back
                  </button>
                </div>
              </form>

              <p
                style={{
                  textAlign: "center",
                  marginTop: "15px",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                OTP is valid for 15 minutes.
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NameEmailModal;