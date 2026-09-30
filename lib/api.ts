// lib/api.ts
import axios from "axios";

export const ADMIN_TOKEN_KEY = "admin_token";

// Fired so the AuthProvider can react (with the Next router) instead of
// this file doing a hard redirect.
export const ADMIN_UNAUTHORIZED_EVENT = "admin:unauthorized";
export const ADMIN_PASSWORD_CHANGE_EVENT = "admin:password-change-required";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Attach the admin token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// A 401 anywhere except the public auth calls means the session is gone
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response) {
      const url: string = error.config?.url ?? "";
      const isPublicAuthCall =
        url.includes("/login") ||
        url.includes("/forgot-password") ||
        url.includes("/reset-password");

      if (error.response.status === 401 && !isPublicAuthCall) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
      }

      if (
        error.response.status === 403 &&
        error.response.data?.code === "PASSWORD_CHANGE_REQUIRED"
      ) {
        window.dispatchEvent(new Event(ADMIN_PASSWORD_CHANGE_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export default api;