import type {
    PlanejamentoResumo,
    PlanejamentoCriar,
    PlanejamentoDashboard,
    PlanejamentoMensal,
    CopiarPlanejamentoRequest
} from "../types/planejamento";

const API_URL = "http://localhost:8080";

async function tratarResposta<T>(
    resposta: Response
): Promise<T> {

    if (!resposta.ok) {

        let mensagemErro =
            "Não foi possível realizar a operação.";

        try {

            const erro = await resposta.json();

            mensagemErro =
                erro.message ||
                erro.mensagem ||
                erro.erro ||
                mensagemErro;

        } catch {

            const texto = await resposta.text();

            if (texto) {
                mensagemErro = texto;
            }

        }

        throw new Error(mensagemErro);

    }

    return resposta.json() as Promise<T>;

}

export async function buscarDashboardPlanejamento(
    planejamentoId: number
): Promise<PlanejamentoDashboard> {

    const resposta = await fetch(
        `${API_URL}/planejamentos/${planejamentoId}/dashboard`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return tratarResposta<PlanejamentoDashboard>(
        resposta
    );

}


export async function listarPlanejamentosUsuario(
    usuarioId: number
): Promise<PlanejamentoMensal[]> {

    const resposta = await fetch(
        `${API_URL}/planejamentos/usuario/${usuarioId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    return tratarResposta<PlanejamentoMensal[]>(
        resposta
    );

}


export async function criarPlanejamento(

    dados: PlanejamentoCriar

): Promise<PlanejamentoResumo> {

    const resposta = await fetch(

        `${API_URL}/planejamentos`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        }

    );

    return tratarResposta<PlanejamentoResumo>(

        resposta

    );

}

export async function copiarPlanejamento(
    planejamentoId: number,
    dados: CopiarPlanejamentoRequest
): Promise<PlanejamentoResumo> {

    const resposta = await fetch(
        `${API_URL}/planejamentos/${planejamentoId}/copiar`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(dados)
        }
    );

    return tratarResposta<PlanejamentoResumo>(
        resposta
    );
}


export async function atualizarValorPlanejado(
    planejamentoId: number,
    usuarioId: number,
    valorPlanejado: number
) {

    const resposta = await fetch(
        `http://localhost:8080/planejamentos/${planejamentoId}/valor-planejado`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                usuarioId,
                valorPlanejado
            })
        }
    );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível atualizar o planejamento."
        );
    }

    return resposta.json();
}


export async function excluirPlanejamento(
    planejamentoId: number,
    usuarioId: number
) {

    const resposta = await fetch(
        `http://localhost:8080/planejamentos/${planejamentoId}?usuarioId=${usuarioId}`,
        {
            method: "DELETE"
        }
    );

    if (!resposta.ok) {

        const mensagem =
            await resposta.text();

        throw new Error(
            mensagem ||
            "Não foi possível excluir o planejamento."
        );

    }

}