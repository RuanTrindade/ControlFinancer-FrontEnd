import type {
    DashboardResponse
} from "../types/dashboard";


const API_URL =
    "http://localhost:8080/dashboard";


export async function buscarDashboard(

    usuarioId: number,

    mes: number,

    ano: number

): Promise<DashboardResponse> {


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
            "Não foi possível carregar o dashboard."
        );

    }


    return resposta.json();

}