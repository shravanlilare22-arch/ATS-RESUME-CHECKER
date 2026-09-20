import axios from "axios";

const API_BASE_URL = "https://ats-resume-checker-aoq9.onrender.com";

export const analyzeResume = async (file, targetRole) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("target_role", targetRole);

  const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const chatAboutResume = async (resumeText, targetRole, chatHistory, newMessage) => {
  const response = await axios.post(`${API_BASE_URL}/chat`, {
    resume_text: resumeText,
    target_role: targetRole,
    chat_history: chatHistory,
    new_message: newMessage,
  });

  return response.data;
};