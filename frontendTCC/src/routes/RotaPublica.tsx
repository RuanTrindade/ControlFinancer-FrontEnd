import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";

/**
 * Envolve a tela de login: quem já está autenticado é mandado
 * direto para o dashboard, em vez de ver o formulário de novo.
 *
 * Também espera a checagem de sessão do Google terminar antes de
 * decidir, para não mostrar o formulário de login por uma fração de
 * segundo para quem acabou de voltar do login do Google.
 */
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
