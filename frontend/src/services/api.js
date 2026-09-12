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