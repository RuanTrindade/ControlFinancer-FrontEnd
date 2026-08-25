import type {

    InvestimentoMovimentacao,
    InvestimentoMovimentacaoRequest,
    PaginaMovimentacao

} from "../types/investimentoMovimentacao";


const API_URL =
    "http://localhost:8080/investimentos";


/* ===================================================
   LISTAR MOVIMENTAÇÕES
=================================================== */

export async function listarMovimentacoes(

    investimentoId: number,

    mes?: number,

    ano?: number,

    tipo?: "APORTE" | "RESGATE" | "RENDIMENTO",

    pagina: number = 0,

    tamanho: number = 10

): Promise<PaginaMovimentacao> {


    const parametros =
        new URLSearchParams();


    parametros.set(
        "page",
        String(pagina)
    );


    parametros.set(
        "size",
        String(tamanho)
    );


    parametros.set(
        "sort",
        "data,desc"
    );


    if (
        mes !== undefined
    ) {

        parametros.set(
            "mes",
            String(mes)
        );

    }


    if (
        ano !== undefined
    ) {

        parametros.set(
            "ano",
            String(ano)
        );

    }


    if (tipo) {

        parametros.set(
            "tipo",
            tipo
        );

    }


    const resposta =
        await fetch(

            `${API_URL}/${investimentoId}/movimentacoes?${parametros.toString()}`

        );


    if (!resposta.ok) {

        throw new Error(
            "Não foi possível carregar as movimentações."
        );

    }


    return resposta.json();

}

/* ===================================================
   REGISTRAR MOVIMENTAÇÃO
=================================================== */

export async function registrarMovimentacao(

    investimentoId: number,

    dados: InvestimentoMovimentacaoRequest

): Promise<InvestimentoMovimentacao> {


    const resposta =
        await fetch(

            `${API_URL}/${investimentoId}/movimentacoes`,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        dados
                    )

            }

        );


    if (!resposta.ok) {

        const mensagem =
            await obterMensagemErro(
                resposta,
                "Não foi possível registrar a movimentação."
            );


        throw new Error(
            mensagem
        );

    }


    return resposta.json();

}


/* ===================================================
   EDITAR MOVIMENTAÇÃO
=================================================== */

export async function editarMovimentacao(

    movimentacaoId: number,

    dados: InvestimentoMovimentacaoRequest

): Promise<InvestimentoMovimentacao> {


    const resposta =
        await fetch(

            `${API_URL}/movimentacoes/${movimentacaoId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        dados
                    )

            }

        );


    if (!resposta.ok) {

        const mensagem =
            await obterMensagemErro(
                resposta,
                "Não foi possível editar a movimentação."
            );


        throw new Error(
            mensagem
        );

    }


    return resposta.json();

}


/* ===================================================
   EXCLUIR MOVIMENTAÇÃO
=================================================== */

export async function deletarMovimentacao(

    movimentacaoId: number

): Promise<void> {


    const resposta =
        await fetch(

            `${API_URL}/movimentacoes/${movimentacaoId}`,

            {
                method: "DELETE"
            }

        );


    if (!resposta.ok) {

        const mensagem =
            await obterMensagemErro(
                resposta,
                "Não foi possível excluir a movimentação."
            );


        throw new Error(
            mensagem
        );

    }

}


/* ===================================================
   MENSAGEM DE ERRO
=================================================== */

async function obterMensagemErro(

    resposta: Response,

    mensagemPadrao: string

): Promise<string> {


    try {

        const dados =
            await resposta.json();


        return (
            dados.message ||
            dados.mensagem ||
            dados.erro ||
            mensagemPadrao
        );

    }
    catch {

        return mensagemPadrao;

    }

}

export async function criarMovimentacao(
    investimentoId: number,
    dados: {
        valor: number;
        tipo: "APORTE" | "RESGATE";
    }
): Promise<InvestimentoMovimentacao> {

    const response =
        await fetch(
            `${API_URL}/${investimentoId}/movimentacoes`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(
                    dados
                )
            }
        );


    if (!response.ok) {

        const mensagem =
            await response.text();

        throw new Error(
            mensagem ||
            "Erro ao registrar movimentação."
        );

    }


    return response.json();

}