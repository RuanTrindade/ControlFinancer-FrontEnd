import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

import { MesProvider } from "./context/MesContext";
import { AlertProvider } from "./context/AlertContext";
import { AuthProvider } from "./context/AuthContext";

import GlobalAlert from "./shared/components/GlobalAlert";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider>
            <AlertProvider>
                <MesProvider>
                    <App />

                    <GlobalAlert />
                </MesProvider>
            </AlertProvider>
        </AuthProvider>
    </StrictMode>,
);
