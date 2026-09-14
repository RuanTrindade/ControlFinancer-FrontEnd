import type { DashboardResponse } from "../types/dashboard";
import { apiFetch } from "../../../shared/services/api";

export async function buscarDashboard(
    usuarioId: number,
    mes: number,
    ano: number,
): Promise<DashboardResponse> {
    const parametros = new URLSearchParams({
        usuarioId: String(usuarioId),
        mes: String(mes),
        ano: String(ano),
    });

    return apiFetch<DashboardResponse>(
        `/dashboard?${parametros.toString()}`,
        {},
        "Não foi possível carregar o dashboard.",
    );
}
