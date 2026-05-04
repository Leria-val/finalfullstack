import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

/* ── Request interceptor: inject JWT ── */
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem("euphonica_auth");
    if (raw) {
      try {
        const { token } = JSON.parse(raw);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        /* ignore malformed json */
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor: handle 401 ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("euphonica_auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;