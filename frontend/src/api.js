import axios from "axios";

const api = axios.create({
  baseURL: "https://capstone-project-ronh.onrender.com",
  withCredentials: true,
});

export default api;
