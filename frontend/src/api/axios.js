import axios from "axios";

const api = axios.create({
  baseURL: "https://capstone-backend-c557.onrender.com",
  withCredentials: true, // ✅ REQUIRED
});

export default api;
