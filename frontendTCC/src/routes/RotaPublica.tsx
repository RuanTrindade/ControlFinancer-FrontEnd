import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";

function RotaPublica({ children }: { children: ReactNode }) {
    const { autenticado, verificando } = useAuth();

    if (verificando) {
        return <LoadingOverlay />;
    }

    if (autenticado) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default RotaPublica;
