import type {
    PlanejamentoCategoriaCriar,
    PlanejamentoCategoriaResponse,
} from "../types/planejamentoCategoria";
import type { PlanejamentoCategoriaResumo } from "../types/planejamento";
import type { Pagina } from "../../../shared/types/pagina";
import { apiFetch } from "../../../shared/services/api";

export async function salvarCategoriaPlanejamento(
    dados: PlanejamentoCategoriaCriar,
): Promise<PlanejamentoCategoriaResponse> {
    return apiFetch<PlanejamentoCategoriaResponse>(
        "/planejamento-categorias",
        { method: "POST", body: JSON.stringify(dados) },
        "Erro ao salvar categoria.",
    );
}

export async function editarCategoriaPlanejamento(id: number, usuarioId: number, limite: number) {
    return apiFetch(
        `/planejamento-categorias/${id}?usuarioId=${usuarioId}`,
        { method: "PUT", body: JSON.stringify({ limite }) },
        "Não foi possível editar a categoria.",
    );
}

export async function excluirCategoriaPlanejamento(id: number, usuarioId: number) {
    return apiFetch(
        `/planejamento-categorias/${id}?usuarioId=${usuarioId}`,
        { method: "DELETE" },
        "Não foi possível excluir a categoria.",
    );
}

export async function buscarResumoCategoriasPaginado(
    planejamentoId: number,
    pagina: number,
): Promise<Pagina<PlanejamentoCategoriaResumo>> {
    return apiFetch<Pagina<PlanejamentoCategoriaResumo>>(
        `/planejamento-categorias/${planejamentoId}/resumo/pagina/${pagina}`,
        {},
        "Não foi possível carregar as categorias do planejamento.",
    );
}
