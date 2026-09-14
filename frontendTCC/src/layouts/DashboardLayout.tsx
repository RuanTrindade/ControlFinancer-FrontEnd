import { useState, useEffect } from "react";

import Sidebar from "./Sidebar";

import Topbar from "./Topbar.tsx";

import "./dashboard-shell.css";

type Props = {
    children: React.ReactNode;

    mostrarMeses?: boolean;
};

function DashboardLayout({
    children,

    mostrarMeses = true,
}: Props) {
    const [fechado, setFechado] = useState(() => {
        return localStorage.getItem("sidebar-fechada") === "true";
    });

    useEffect(() => {
        localStorage.setItem(
            "sidebar-fechada",

            String(fechado),
        );
    }, [fechado]);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("dark-mode") === "true";
    });

    useEffect(() => {
        localStorage.setItem(
            "dark-mode",

            String(darkMode),
        );
    }, [darkMode]);

    return (
        <div className={darkMode ? "dark" : ""}>
            <Sidebar fechado={fechado} setFechado={setFechado} />

            <div
                className={"sidebar-backdrop" + (fechado ? "" : " visivel")}
                onClick={() => setFechado(true)}
            />

            <div className="conteudo">
                <Topbar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    mostrarMeses={mostrarMeses}
                    fechado={fechado}
                    setFechado={setFechado}
                />

                <main className="principal">{children}</main>
            </div>
        </div>
    );
}

export default DashboardLayout;
