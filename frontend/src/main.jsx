import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GlobalContextProvider from "./contexts/GlobalContext.jsx";
import { BrowserRouter } from "react-router-dom";
import UserContextProvider from "./contexts/UserContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageContextProvider } from "./contexts/messageContext.jsx";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GlobalContextProvider>
            <UserContextProvider>
              <MessageContextProvider>
                {/* Wrap the App component with UserContextProvider */}
                <App />
              </MessageContextProvider>
            </UserContextProvider>
          </GlobalContextProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
