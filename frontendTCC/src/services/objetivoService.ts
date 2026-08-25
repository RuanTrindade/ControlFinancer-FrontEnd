import type {
    Objetivo,
    PaginaObjetivo,
    PaginaObjetivoMovimentacao
} from "../types/objetivo";



const API_URL =
    "http://localhost:8080";




export type ObjetivoCriar = {
    usuarioId: number;
    nome: string;
    valorObjetivo: number;
    dataFinal: string;
    cor: string;
    icone: string;
    imagem: string | null;
};


export type TipoMovimentacaoObjetivo =
    | "DEPOSITO"
    | "RETIRADA";


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
    tamanho: number = 5
): Promise<PaginaObjetivo> {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/usuario/${usuarioId}` +
            `?finalizado=${finalizado}` +
            `&page=${pagina}` +
            `&size=${tamanho}`
        );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível carregar os objetivos."
        );
    }

    return resposta.json();
}



export async function criarObjetivo(
    dados: ObjetivoCriar
): Promise<Objetivo> {

    const resposta =
        await fetch(
            `${API_URL}/objetivos`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    dados
                )
            }
        );


    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível criar o objetivo."
        );

    }


    return resposta.json();
}


export async function buscarObjetivoPorId(
    objetivoId: number
): Promise<Objetivo> {

    const response =
        await fetch(
            `http://localhost:8080/objetivos/${objetivoId}`
        );

    if (!response.ok) {

        const mensagem =
            await response.text();

        throw new Error(
            mensagem ||
            "Erro ao buscar objetivo."
        );

    }

    return response.json();
}


export async function listarMovimentacoesObjetivo(
    objetivoId: number,
    pagina: number = 0,
    tamanho: number = 5
): Promise<PaginaObjetivoMovimentacao> {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/${objetivoId}/movimentacoes` +
            `?page=${pagina}` +
            `&size=${tamanho}`
        );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível carregar as movimentações."
        );

    }

    return resposta.json();
}






export async function movimentarObjetivo(
    objetivoId: number,
    valor: number,
    tipo: TipoMovimentacaoObjetivo
) {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/${objetivoId}/movimentar`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    valor,
                    tipo
                })
            }
        );


    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível realizar a movimentação."
        );

    }


    return resposta.json();
}


export async function editarMovimentacaoObjetivo(
    movimentacaoId: number,
    valor: number
) {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/movimentacoes/${movimentacaoId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    valor
                })
            }
        );


    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível editar a movimentação."
        );

    }


    return resposta.json();
}


export async function excluirMovimentacaoObjetivo(
    movimentacaoId: number
) {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/movimentacoes/${movimentacaoId}`,
            {
                method: "DELETE"
            }
        );


    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível excluir a movimentação."
        );

    }

}






export async function atualizarObjetivo(
    objetivoId: number,
    usuarioId: number,
    dados: ObjetivoAtualizar
): Promise<Objetivo> {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/${objetivoId}?usuarioId=${usuarioId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(
                    dados
                )
            }
        );


    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível atualizar o objetivo."
        );

    }


    return resposta.json();
}


export async function excluirObjetivo(
    objetivoId: number,
    usuarioId: number
) {

    const resposta =
        await fetch(
            `${API_URL}/objetivos/${objetivoId}?usuarioId=${usuarioId}`,
            {
                method: "DELETE"
            }
        );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível excluir o objetivo."
        );

    }

}

