import type { Objetivo, PaginaObjetivo, PaginaObjetivoMovimentacao } from "../types/objetivo";
import { apiFetch } from "../../../shared/services/api";

export type ObjetivoCriar = {
    usuarioId: number;
    nome: string;
    valorObjetivo: number;
    dataFinal: string;
    cor: string;
    icone: string;
    imagem: string | null;
};

export type TipoMovimentacaoObjetivo = "DEPOSITO" | "RETIRADA";

export type ObjetivoAtualizar = {
    nome: string;
    valorObjetivo: number;
    dataFinal: string;
    cor: string;
    icone: string;
    imagem: string | null;
};

export async function listarObjetivosUsuario(
    usuarioId: number,
    finalizado: boolean,
    pagina: number = 0,
    tamanho: number = 5,
): Promise<PaginaObjetivo> {
    return apiFetch<PaginaObjetivo>(
        `/objetivos/usuario/${usuarioId}?finalizado=${finalizado}&page=${pagina}&size=${tamanho}`,
        {},
        "Não foi possível carregar os objetivos.",
    );
}

export async function criarObjetivo(dados: ObjetivoCriar): Promise<Objetivo> {
    return apiFetch<Objetivo>(
        "/objetivos",
        { method: "POST", body: JSON.stringify(dados) },
        "Não foi possível criar o objetivo.",
    );
}

export async function buscarObjetivoPorId(objetivoId: number): Promise<Objetivo> {
    return apiFetch<Objetivo>(`/objetivos/${objetivoId}`, {}, "Erro ao buscar objetivo.");
}

export async function listarMovimentacoesObjetivo(
    objetivoId: number,
    pagina: number = 0,
    tamanho: number = 5,
): Promise<PaginaObjetivoMovimentacao> {
    return apiFetch<PaginaObjetivoMovimentacao>(
        `/objetivos/${objetivoId}/movimentacoes?page=${pagina}&size=${tamanho}`,
        {},
        "Não foi possível carregar as movimentações.",
    );
}

export async function movimentarObjetivo(
    objetivoId: number,
    valor: number,
    tipo: TipoMovimentacaoObjetivo,
) {
    return apiFetch(
        `/objetivos/${objetivoId}/movimentar`,
        { method: "POST", body: JSON.stringify({ valor, tipo }) },
        "Não foi possível realizar a movimentação.",
    );
}

export async function editarMovimentacaoObjetivo(movimentacaoId: number, valor: number) {
    return apiFetch(
        `/objetivos/movimentacoes/${movimentacaoId}`,
        { method: "PUT", body: JSON.stringify({ valor }) },
        "Não foi possível editar a movimentação.",
    );
}

export async function excluirMovimentacaoObjetivo(movimentacaoId: number) {
    return apiFetch(
        `/objetivos/movimentacoes/${movimentacaoId}`,
        { method: "DELETE" },
        "Não foi possível excluir a movimentação.",
    );
}

export async function atualizarObjetivo(
    objetivoId: number,
    usuarioId: number,
    dados: ObjetivoAtualizar,
): Promise<Objetivo> {
    return apiFetch<Objetivo>(
        `/objetivos/${objetivoId}?usuarioId=${usuarioId}`,
        { method: "PUT", body: JSON.stringify(dados) },
        "Não foi possível atualizar o objetivo.",
    );
}

export async function excluirObjetivo(objetivoId: number, usuarioId: number) {
    return apiFetch(
        `/objetivos/${objetivoId}?usuarioId=${usuarioId}`,
        { method: "DELETE" },
        "Não foi possível excluir o objetivo.",
    );
}
