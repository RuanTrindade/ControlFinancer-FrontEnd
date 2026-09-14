import type { RelatorioResponse } from "../types/relatorio";
import { apiFetch } from "../../../shared/services/api";

export async function buscarRelatorio(
    usuarioId: number,
    mes: number,
    ano: number,
): Promise<RelatorioResponse> {
    const parametros = new URLSearchParams({
        usuarioId: String(usuarioId),
        mes: String(mes),
        ano: String(ano),
    });

    return apiFetch<RelatorioResponse>(
        `/relatorio?${parametros.toString()}`,
        {},
        "Não foi possível carregar o relatório.",
    );
}
