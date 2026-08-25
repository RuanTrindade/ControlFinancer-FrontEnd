import type {
    CarteiraInvestimentoResumo,
    InvestimentoAtualizar,
    InvestimentoCriar,
    InvestimentoEstatistica,
    InvestimentoResumo,
    InvestimentoResumoMensal,
    PaginaInvestimentos
} from "../types/investimento";


const API_URL =
    "http://localhost:8080";


/* ===================================================
   LISTAR INVESTIMENTOS
=================================================== */

export async function listarInvestimentos(

    usuarioId: number,

    encerrado: boolean,

    mes: number,

    ano: number,

    pagina: number = 0,

    tamanho: number = 2

): Promise<PaginaInvestimentos> {


    const response =
        await fetch(

            `${API_URL}/investimentos/usuario/${usuarioId}` +
            `?encerrado=${encerrado}` +
            `&mes=${mes}` +
            `&ano=${ano}` +
            `&page=${pagina}` +
            `&size=${tamanho}`

        );


    if (!response.ok) {

        throw new Error(
            "Erro ao listar investimentos"
        );

    }


    return response.json();
}


/* ===================================================
   RESUMO DA CARTEIRA
=================================================== */

export async function buscarResumoCarteira(

    usuarioId: number,

    mes: number,

    ano: number

): Promise<CarteiraInvestimentoResumo> {


    const response =
        await fetch(

            `${API_URL}/investimentos/usuario/${usuarioId}/resumo` +
            `?mes=${mes}` +
            `&ano=${ano}`

        );


    if (!response.ok) {

        throw new Error(
            "Erro ao buscar resumo da carteira"
        );

    }


    return response.json();
}


/* ===================================================
   ESTATÍSTICAS DO INVESTIMENTO
=================================================== */

export async function buscarEstatisticasInvestimento(

    investimentoId: number

): Promise<InvestimentoEstatistica> {


    const response =
        await fetch(

            `${API_URL}/investimentos/${investimentoId}/estatisticas`

        );


    if (!response.ok) {

        throw new Error(
            "Erro ao buscar estatísticas do investimento"
        );

    }


    return response.json();
}


/* ===================================================
   RESUMO MENSAL DO INVESTIMENTO
=================================================== */

export async function buscarResumoMensalInvestimento(

    investimentoId: number,

    mes: number,

    ano: number

): Promise<InvestimentoResumoMensal> {


    const response =
        await fetch(

            `${API_URL}/investimentos/${investimentoId}/resumo-mensal` +
            `?mes=${mes}` +
            `&ano=${ano}`

        );


    if (!response.ok) {

        throw new Error(
            "Erro ao buscar resumo mensal do investimento"
        );

    }


    return response.json();
}


/* ===================================================
   BUSCAR INVESTIMENTO POR ID
=================================================== */

export async function buscarInvestimentoPorId(

    investimentoId: number

): Promise<InvestimentoResumo> {


    const response =
        await fetch(

            `${API_URL}/investimentos/${investimentoId}`

        );


    if (!response.ok) {

        throw new Error(
            "Erro ao buscar investimento"
        );

    }


    return response.json();
}


/* ===================================================
   CRIAR INVESTIMENTO
=================================================== */

export async function criarInvestimento(

    dados: InvestimentoCriar

): Promise<InvestimentoResumo> {


    const response =
        await fetch(

            `${API_URL}/investimentos`,

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


    if (!response.ok) {

        throw new Error(
            "Erro ao criar investimento"
        );

    }


    return response.json();
}


/* ===================================================
   ATUALIZAR INVESTIMENTO
=================================================== */

export async function atualizarInvestimento(

    investimentoId: number,

    usuarioId: number,

    dados: InvestimentoAtualizar

): Promise<InvestimentoResumo> {


    const response =
        await fetch(

            `${API_URL}/investimentos/${investimentoId}` +
            `?usuarioId=${usuarioId}`,

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


    if (!response.ok) {

        const mensagem =
            await response.text();

        throw new Error(
            mensagem ||
            "Erro ao atualizar investimento"
        );

    }


    return response.json();
}


/* ===================================================
   DELETAR INVESTIMENTO
=================================================== */

export async function deletarInvestimento(

    investimentoId: number,

    usuarioId: number

): Promise<void> {


    const response =
        await fetch(

            `${API_URL}/investimentos/${investimentoId}` +
            `?usuarioId=${usuarioId}`,

            {
                method: "DELETE"
            }

        );


    if (!response.ok) {

        const mensagem =
            await response.text();


        throw new Error(
            mensagem ||
            "Erro ao excluir investimento"
        );

    }

}


/* ===================================================
   EXPORTAÇÃO AGRUPADA
=================================================== */

const investimentoService = {

    listarInvestimentos,

    buscarResumoCarteira,

    buscarEstatisticasInvestimento,

    buscarResumoMensalInvestimento,

    buscarInvestimentoPorId,

    criarInvestimento,

    atualizarInvestimento,

    deletarInvestimento

};


export default investimentoService;