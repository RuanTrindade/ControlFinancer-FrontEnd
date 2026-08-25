import type {
    RelatorioResponse
} from "../types/relatorio";


const API_URL =
    "http://localhost:8080/relatorio";


export async function buscarRelatorio(

    usuarioId: number,

    mes: number,

    ano: number

): Promise<RelatorioResponse> {


    const parametros =
        new URLSearchParams();


    parametros.set(
        "usuarioId",
        String(usuarioId)
    );


    parametros.set(
        "mes",
        String(mes)
    );


    parametros.set(
        "ano",
        String(ano)
    );


    const resposta =
        await fetch(
            `${API_URL}?${parametros.toString()}`
        );


    if (!resposta.ok) {

        throw new Error(
            "Não foi possível carregar o relatório."
        );

    }


    return resposta.json();

}