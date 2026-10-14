export const BASE_URL = "http://localhost:8080";

async function extrairMensagemErro(resposta: Response, mensagemPadrao: string): Promise<string> {
    try {
        const erro = await resposta.clone().json();
        return erro.message || erro.mensagem || erro.erro || mensagemPadrao;
    } catch {
        try {
            const texto = await resposta.text();
            return texto || mensagemPadrao;
        } catch {
            return mensagemPadrao;
        }
    }
}

export async function apiFetch<T>(
    caminho: string,
    opcoes: RequestInit = {},
    mensagemErroPadrao = "Não foi possível realizar a operação.",
): Promise<T> {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
        ...opcoes,
        headers:
            opcoes.body !== undefined
                ? { "Content-Type": "application/json", ...opcoes.headers }
                : opcoes.headers,
    });

    if (!resposta.ok) {
        throw new Error(await extrairMensagemErro(resposta, mensagemErroPadrao));
    }

    if (resposta.status === 204) {
        return undefined as T;
    }

    const texto = await resposta.text();

    return (texto ? JSON.parse(texto) : undefined) as T;
}
