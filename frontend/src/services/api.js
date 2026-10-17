import axios from "axios";

const API_BASE_URL = "https://ats-resume-checker-kto8.onrender.com"; //http://localhost:8000   https://ats-resume-checker-kto8.onrender.com

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

// Session expire ho gaya ho (401) to purana token hata do, taaki baar-baar fail na ho.
// Error waise hi aage jaata hai, page apna message dikhayega.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("access_token");
    }

    return Promise.reject(error);
  }
);

// RESUME ANALYSIS
// Render free server so raha ho to pehli request mein zyada time lagta hai, isliye 90 second.
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