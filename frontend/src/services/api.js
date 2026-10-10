import axios from "axios";

const API_BASE_URL = "https://ats-resume-checker-kto8.onrender.com";


// ======================================================
// RESUME ANALYSIS
// ======================================================

export const analyzeResume = async (file, targetRole) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_role", targetRole);

  const response = await axios.post(
    `${API_BASE_URL}/analyze`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


// ======================================================
// CHAT ABOUT RESUME
// ======================================================

export const chatAboutResume = async (
  resumeText,
  targetRole,
  chatHistory,
  newMessage
) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat`,
    {
      resume_text: resumeText,
      target_role: targetRole,
      chat_history: chatHistory,
      new_message: newMessage,
    }
  );

  return response.data;
};


// ======================================================
// SEND OTP
// ======================================================

export const sendOTP = async (name, email) => {
  const response = await axios.post(
    `${API_BASE_URL}/send-otp`,
    {
      name,
      email,
    }
  );

  return response.data;
};


// ======================================================
// VERIFY OTP
// ======================================================

export const verifyOTP = async (email, otp) => {
  const response = await axios.post(
    `${API_BASE_URL}/verify-otp`,
    {
      email,
      otp,
    }
  );

  return response.data;
};


// ======================================================
// SAVE VISITOR
// ======================================================

export const saveVisitor = async (name, email) => {
  const response = await axios.post(
    `${API_BASE_URL}/visitor`,
    {
      name,
      email,
    }
  );

  return response.data;
};