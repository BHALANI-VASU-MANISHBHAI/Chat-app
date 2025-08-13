import { createContext } from "react";
import { useContext, useState } from "react";
import { GlobalContext } from "./GlobalContext.jsx";
export const MessageContext = createContext();

export const MessageContextProvider = ({ children }) => {
  const { backendUrl, token } = useContext(GlobalContext);

  const [ForwardingMessage, setForwardingMessage] = useState(null);

  const value = {
    ForwardingMessage,
    setForwardingMessage,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};
