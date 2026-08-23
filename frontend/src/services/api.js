import axios from "axios";

const API_BASE_URL = "https://ats-resume-checker-aoq9.onrender.com";

export const analyzeResume = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);

  const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};