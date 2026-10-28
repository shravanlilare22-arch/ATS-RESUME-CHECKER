import axios from "axios";

const API_BASE_URL = "https://ats-resume-checker-kto8.onrender.com";

const TOKEN_KEY = "access_token";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Attach saved session token to protected requests.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Clear token only when the backend says the session is invalid.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

// RESUME ANALYSIS
export const analyzeResume = async (file, targetRole) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_role", targetRole);

  const response = await api.post("/analyze", formData, {
    timeout: 90000,
  });

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
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
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
export const getUsageStatus = async () => {
  const response = await api.get("/usage");
  return response.data;
};

// LOGOUT: call only when the user explicitly logs out.
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export default api;