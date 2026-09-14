import type {
    PlanejamentoResumo,
    PlanejamentoCriar,
    PlanejamentoDashboard,
    PlanejamentoMensal,
    CopiarPlanejamentoRequest,
} from "../types/planejamento";
import { apiFetch } from "../../../shared/services/api";

export async function buscarDashboardPlanejamento(
    planejamentoId: number,
): Promise<PlanejamentoDashboard> {
    return apiFetch<PlanejamentoDashboard>(`/planejamentos/${planejamentoId}/dashboard`);
}

export async function listarPlanejamentosUsuario(usuarioId: number): Promise<PlanejamentoMensal[]> {
    return apiFetch<PlanejamentoMensal[]>(`/planejamentos/usuario/${usuarioId}`);
}

export async function criarPlanejamento(dados: PlanejamentoCriar): Promise<PlanejamentoResumo> {
    return apiFetch<PlanejamentoResumo>("/planejamentos", {
        method: "POST",
        body: JSON.stringify(dados),
    });
}

export async function copiarPlanejamento(
    planejamentoId: number,
    dados: CopiarPlanejamentoRequest,
): Promise<PlanejamentoResumo> {
    return apiFetch<PlanejamentoResumo>(`/planejamentos/${planejamentoId}/copiar`, {
        method: "POST",
        body: JSON.stringify(dados),
    });
}

export async function atualizarValorPlanejado(
    planejamentoId: number,
    usuarioId: number,
    valorPlanejado: number,
) {
    return apiFetch(
        `/planejamentos/${planejamentoId}/valor-planejado`,
        { method: "PUT", body: JSON.stringify({ usuarioId, valorPlanejado }) },
        "Não foi possível atualizar o planejamento.",
    );
}

export async function excluirPlanejamento(planejamentoId: number, usuarioId: number) {
    return apiFetch(
        `/planejamentos/${planejamentoId}?usuarioId=${usuarioId}`,
        { method: "DELETE" },
        "Não foi possível excluir o planejamento.",
    );
}
