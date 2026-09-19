import { createContext, useContext, useState } from "react";
import { loginAdmin, logoutAdmin } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("access_token")
  );

  const login = async (username, password) => {
    const data = await loginAdmin(username, password);

    localStorage.setItem("access_token", data.access_token);
    setToken(data.access_token);

    return data;
  };

  const logout = () => {
    logoutAdmin();
    setToken(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};