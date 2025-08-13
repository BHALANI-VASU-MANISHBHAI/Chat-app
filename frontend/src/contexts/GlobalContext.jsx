import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const GlobalContext = createContext();

// 2. Create provider component
const GlobalContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const navigate = useNavigate();

  const value = {
    backendUrl,
    token,
    setToken,
    navigate,
  };

  useEffect(() => {
    if (token) {
      console.log("Token set in GlobalContext:", token);
      setToken(localStorage.getItem("token"));
    }
  }, [token]);
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
