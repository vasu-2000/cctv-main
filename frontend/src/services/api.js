import axios from "axios"; // ✅ FIX

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

export default API; // ✅ IMPORTANT