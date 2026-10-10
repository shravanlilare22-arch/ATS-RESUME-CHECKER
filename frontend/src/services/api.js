import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; //http://localhost:8000   https://ats-resume-checker-kto8.onrender.com

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Attach verified session token to protected requests.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESUME ANALYSIS
export const analyzeResume = async (file, targetRole) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_role", targetRole);

  const response = await api.post("/analyze", formData);
  return response.data;
};

// CHAT ABOUT RESUME
export const chatAboutResume = async (
  resumeText,
  targetRole,
  chatHistory,
  newMessage
) => {
  const response = await api.post("/chat", {
    resume_text: resumeText,
    target_role: targetRole,
    chat_history: chatHistory,
    new_message: newMessage,
  });

  return response.data;
};

// SEND OTP
export const sendOTP = async (name, email) => {
  const response = await api.post("/send-otp", {
    name,
    email,
  });

  return response.data;
};

// VERIFY OTP
export const verifyOTP = async (email, otp) => {
  const response = await api.post("/verify-otp", {
    email,
    otp,
  });

  if (response.data?.access_token) {
    sessionStorage.setItem(
      "access_token",
      response.data.access_token
    );
  }

  return response.data;
};

// SAVE VISITOR
export const saveVisitor = async (name, email) => {
  const response = await api.post("/visitor", {
    name,
    email,
  });

  return response.data;
};

// GET DAILY FREE USAGE STATUS
// Backend endpoint must be implemented as GET /usage.
export const getUsageStatus = async () => {
  const response = await api.get("/usage");
  return response.data;
};

// LOGOUT
export const logout = () => {
  sessionStorage.removeItem("access_token");
};

export default api;