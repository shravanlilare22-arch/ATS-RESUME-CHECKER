export const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export function validateResumeFile(file) {
  if (!file) return "Please upload your resume.";

  const name = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "Only PDF, DOCX or TXT files are supported.";
  }
  if (file.size === 0) return "This file is empty. Please choose another one.";
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File is too large. Please upload a resume under ${MAX_FILE_SIZE_MB} MB.`;
  }
  return "";
}

export function validateTargetRole(role) {
  const value = role.trim();
  if (value.length < 2) return "Please enter your target role (e.g. Frontend Developer).";
  if (value.length > 60) return "Target role is too long. Please keep it under 60 characters.";
  return "";
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getFriendlyError(err, fallback = "Something went wrong. Please try again.") {
  // Request server tak pahunchi hi nahi (internet band ya server so raha hai)
  if (!err?.response) {
    if (err?.code === "ECONNABORTED" || err?.code === "ETIMEDOUT") {
      return "The request took too long. The server may be waking up, please try again in a minute.";
    }
    return "Can't reach the server right now. Please check your internet connection or try again in a minute.";
  }

  const status = err.response.status;
  const data = err.response.data;

  // FastAPI HTTPException ka format: { detail: "message" } (purana { error: "message" } bhi chalega)
  if (typeof data?.detail === "string" && data.detail.trim()) return data.detail;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;

  if (status === 401) return "Your session has expired. Please verify your email again.";
  if (status === 413) return "That file is too large. Please upload a smaller resume.";
  if (status === 422) return "Some details look invalid. Please check your inputs and try again.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "The server ran into a problem. Please try again in a moment.";

  return fallback;
}

// "Try again" button sirf tab dikhao jab dobara try karne se fayda ho (server, AI ya network problem)
export function isRetryableError(err) {
  if (!err?.response) return true;
  return err.response.status >= 500;
}