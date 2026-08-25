import type {
    AnaliseIAResponse
} from "../types/analiseIA";


const API_URL =
    "http://localhost:8080/ia";


export async function buscarAnaliseIA(

    usuarioId: number,

    mes: number,

    ano: number

): Promise<AnaliseIAResponse> {


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
            "Não foi possível gerar a análise financeira."
        );

    }


    return resposta.json();
}