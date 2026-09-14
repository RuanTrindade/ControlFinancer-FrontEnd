import type { AnaliseIAResponse } from "../types/analiseIA";
import { apiFetch } from "../../../shared/services/api";

export async function buscarAnaliseIA(
    usuarioId: number,
    mes: number,
    ano: number,
): Promise<AnaliseIAResponse> {
    const parametros = new URLSearchParams({
        usuarioId: String(usuarioId),
        mes: String(mes),
        ano: String(ano),
    });

    return apiFetch<AnaliseIAResponse>(
        `/ia?${parametros.toString()}`,
        {},
        "Não foi possível gerar a análise financeira.",
    );
}
