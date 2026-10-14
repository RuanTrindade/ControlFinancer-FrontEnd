import type {
    InvestimentoMovimentacao,
    InvestimentoMovimentacaoRequest,
    PaginaMovimentacao,
} from "../types/investimentoMovimentacao";
import { apiFetch } from "../../../shared/services/api";

const CAMINHO = "/investimentos";

export async function listarMovimentacoes(
    investimentoId: number,
    mes?: number,
    ano?: number,
    tipo?: "APORTE" | "RESGATE" | "RENDIMENTO",
    pagina: number = 0,
    tamanho: number = 10,
): Promise<PaginaMovimentacao> {
    const parametros = new URLSearchParams({
        page: String(pagina),
        size: String(tamanho),
        sort: "data,desc",
    });

    if (mes !== undefined) parametros.set("mes", String(mes));
    if (ano !== undefined) parametros.set("ano", String(ano));
    if (tipo) parametros.set("tipo", tipo);

    return apiFetch<PaginaMovimentacao>(
        `${CAMINHO}/${investimentoId}/movimentacoes?${parametros.toString()}`,
        {},
        "Não foi possível carregar as movimentações.",
    );
}

export async function registrarMovimentacao(
    investimentoId: number,
    dados: InvestimentoMovimentacaoRequest,
): Promise<InvestimentoMovimentacao> {
    return apiFetch<InvestimentoMovimentacao>(
        `${CAMINHO}/${investimentoId}/movimentacoes`,
        { method: "POST", body: JSON.stringify(dados) },
        "Não foi possível registrar a movimentação.",
    );
}

export async function editarMovimentacao(
    movimentacaoId: number,
    dados: InvestimentoMovimentacaoRequest,
): Promise<InvestimentoMovimentacao> {
    return apiFetch<InvestimentoMovimentacao>(
        `${CAMINHO}/movimentacoes/${movimentacaoId}`,
        { method: "PUT", body: JSON.stringify(dados) },
        "Não foi possível editar a movimentação.",
    );
}

export async function deletarMovimentacao(movimentacaoId: number): Promise<void> {
    return apiFetch<void>(
        `${CAMINHO}/movimentacoes/${movimentacaoId}`,
        { method: "DELETE" },
        "Não foi possível excluir a movimentação.",
    );
}
