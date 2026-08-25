import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

import { MesProvider } from "./context/MesContext";
import { AlertProvider } from "./context/AlertContext";

import GlobalAlert from "./components/GlobalAlert";


createRoot(
    document.getElementById("root")!
).render(

    <StrictMode>

        <AlertProvider>

            <MesProvider>

                <App />

                <GlobalAlert />

            </MesProvider>

        </AlertProvider>

    </StrictMode>

);