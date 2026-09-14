import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "../shared/components/LoadingOverlay";

/**
 * Envolve uma página que exige login. Quem não estiver autenticado
 * é mandado de volta para a tela de login.
 *
 * Enquanto ainda estamos checando se existe uma sessão do Google
 * ativa (ver AuthContext), mostra um carregando em vez de já mandar
 * pra tela de login — senão quem loga pelo Google veria um "flash"
 * da tela de login antes de cair no dashboard.
 */
function RotaProtegida({ children }: { children: ReactNode }) {
    const { autenticado, verificando } = useAuth();

    if (verificando) {
        return <LoadingOverlay />;
    }

    if (!autenticado) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RotaProtegida;
