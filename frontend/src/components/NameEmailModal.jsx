import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendOTP, verifyOTP } from "../services/api";

function NameEmailModal({ onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim()) {
      setError("Please enter both name and email.");
      return;
    }

    setSubmitting(true);

    try {
      await sendOTP(name.trim(), email.trim());

      setOtpSent(true);
      setSuccess("OTP sent successfully to your email.");
    } catch (err) {
      console.error("Send OTP error:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp.trim().length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setVerifying(true);

    try {
      await verifyOTP(email.trim(), otp.trim());

      setSuccess("Email verified successfully! 🎉");

      // Save visitor only after OTP verification
      await onSubmit(name.trim(), email.trim());
    } catch (err) {
      console.error("Verify OTP error:", err);

      setError(
        err?.response?.data?.detail ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleBack = () => {
    setOtp("");
    setOtpSent(false);
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

              <form onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    className="text-input"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
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
                  />
                </div>

                {error && <p className="error">{error}</p>}

                {success && (
                  <p className="success">
                    {success}
                  </p>
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

              <form onSubmit={handleVerifyOTP}>
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
                    disabled={verifying}
                  />
                </div>

                {error && <p className="error">{error}</p>}

                {success && (
                  <p className="success">
                    {success}
                  </p>
                )}

                <div className="button-row">
                  <button type="submit" disabled={verifying}>
                    {verifying ? (
                      <span className="spinner"></span>
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