import type {

    PlanejamentoCategoriaCriar,
    PlanejamentoCategoriaResponse

} from "../types/planejamentoCategoria";

const API_URL =
    "http://localhost:8080";

async function tratarResposta<T>(
    resposta: Response
): Promise<T> {

    if (!resposta.ok) {

        let mensagem =
            "Erro ao salvar categoria.";

        try {

            const erro =
                await resposta.json();

            mensagem =
                erro.message ??
                erro.mensagem ??
                erro.erro ??
                mensagem;

        } catch {

            const texto =
                await resposta.text();

            if (texto) {

                mensagem = texto;

            }

        }

        throw new Error(mensagem);

    }

    return resposta.json() as Promise<T>;

}

export async function salvarCategoriaPlanejamento(

    dados: PlanejamentoCategoriaCriar

): Promise<PlanejamentoCategoriaResponse> {

    const resposta = await fetch(

        `${API_URL}/planejamento-categorias`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        }

    );

    return tratarResposta(resposta);

}


export async function editarCategoriaPlanejamento(
    id: number,
    usuarioId: number,
    limite: number
) {

    const resposta = await fetch(
        `http://localhost:8080/planejamento-categorias/${id}?usuarioId=${usuarioId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                limite
            })
        }
    );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível editar a categoria."
        );
    }

    return resposta.json();
}


export async function excluirCategoriaPlanejamento(
    id: number,
    usuarioId: number
) {

    const resposta = await fetch(
        `http://localhost:8080/planejamento-categorias/${id}?usuarioId=${usuarioId}`,
        {
            method: "DELETE"
        }
    );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível excluir a categoria."
        );
    }
}

export async function buscarResumoCategoriasPaginado(
    planejamentoId: number,
    pagina: number
) {

    const resposta = await fetch(
        `http://localhost:8080/planejamento-categorias/${planejamentoId}/resumo/pagina/${pagina}`
    );

    if (!resposta.ok) {
        throw new Error(
            "Não foi possível carregar as categorias do planejamento."
        );
    }

    return resposta.json();
}