import type {
    CategoriaResumo
} from "../types/categoria";

const API_URL =
    "http://localhost:8080";


async function tratarResposta<T>(
    resposta: Response
): Promise<T> {

    if (!resposta.ok) {

        let mensagemErro =
            "Não foi possível realizar a operação.";

        try {

            const erro =
                await resposta.json();

            mensagemErro =
                erro.message ||
                erro.mensagem ||
                erro.erro ||
                mensagemErro;

        } catch {

            const texto =
                await resposta.text();

            if (texto) {
                mensagemErro = texto;
            }

        }

        throw new Error(
            mensagemErro
        );

    }

    return resposta.json() as Promise<T>;

}


export async function listarCategoriasUsuario(
    usuarioId: number
): Promise<CategoriaResumo[]> {

    const resposta =
        await fetch(
            `${API_URL}/categorias/usuario/${usuarioId}/todas`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    return tratarResposta<CategoriaResumo[]>(
        resposta
    );

}