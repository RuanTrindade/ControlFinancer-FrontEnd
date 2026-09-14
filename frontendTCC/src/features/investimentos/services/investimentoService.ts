import type {
    CarteiraInvestimentoResumo,
    InvestimentoAtualizar,
    InvestimentoCriar,
    InvestimentoEstatistica,
    InvestimentoResumo,
    InvestimentoResumoMensal,
    PaginaInvestimentos,
} from "../types/investimento";
import { apiFetch } from "../../../shared/services/api";

export async function listarInvestimentos(
    usuarioId: number,
    encerrado: boolean,
    mes: number,
    ano: number,
    pagina: number = 0,
    tamanho: number = 2,
): Promise<PaginaInvestimentos> {
    return apiFetch<PaginaInvestimentos>(
        `/investimentos/usuario/${usuarioId}?encerrado=${encerrado}&mes=${mes}&ano=${ano}&page=${pagina}&size=${tamanho}`,
        {},
        "Erro ao listar investimentos",
    );
}

export async function buscarResumoCarteira(
    usuarioId: number,
    mes: number,
    ano: number,
): Promise<CarteiraInvestimentoResumo> {
    return apiFetch<CarteiraInvestimentoResumo>(
        `/investimentos/usuario/${usuarioId}/resumo?mes=${mes}&ano=${ano}`,
        {},
        "Erro ao buscar resumo da carteira",
    );
}

export async function buscarEstatisticasInvestimento(
    investimentoId: number,
): Promise<InvestimentoEstatistica> {
    return apiFetch<InvestimentoEstatistica>(
        `/investimentos/${investimentoId}/estatisticas`,
        {},
        "Erro ao buscar estatísticas do investimento",
    );
}

export async function buscarResumoMensalInvestimento(
    investimentoId: number,
    mes: number,
    ano: number,
): Promise<InvestimentoResumoMensal> {
    return apiFetch<InvestimentoResumoMensal>(
        `/investimentos/${investimentoId}/resumo-mensal?mes=${mes}&ano=${ano}`,
        {},
        "Erro ao buscar resumo mensal do investimento",
    );
}

export async function buscarInvestimentoPorId(investimentoId: number): Promise<InvestimentoResumo> {
    return apiFetch<InvestimentoResumo>(
        `/investimentos/${investimentoId}`,
        {},
        "Erro ao buscar investimento",
    );
}

export async function criarInvestimento(dados: InvestimentoCriar): Promise<InvestimentoResumo> {
    return apiFetch<InvestimentoResumo>(
        "/investimentos",
        { method: "POST", body: JSON.stringify(dados) },
        "Erro ao criar investimento",
    );
}

export async function atualizarInvestimento(
    investimentoId: number,
    usuarioId: number,
    dados: InvestimentoAtualizar,
): Promise<InvestimentoResumo> {
    return apiFetch<InvestimentoResumo>(
        `/investimentos/${investimentoId}?usuarioId=${usuarioId}`,
        { method: "PUT", body: JSON.stringify(dados) },
        "Erro ao atualizar investimento",
    );
}

export async function deletarInvestimento(
    investimentoId: number,
    usuarioId: number,
): Promise<void> {
    return apiFetch<void>(
        `/investimentos/${investimentoId}?usuarioId=${usuarioId}`,
        { method: "DELETE" },
        "Erro ao excluir investimento",
    );
}
