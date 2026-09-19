import { apiRequest } from "./api";

export const loginAdmin = async (username, password) => {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
};

export const logoutAdmin = () => {
  localStorage.removeItem("access_token");
};