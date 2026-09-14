/**
 * Helper único de acesso à API.
 *
 * Antes, cada arquivo de service tinha sua própria cópia de "fetch + checar
 * resposta.ok + extrair mensagem de erro + json()". Este arquivo concentra
 * isso num só lugar, mantendo o mesmo comportamento que já existia:
 *
 * - Tenta ler a mensagem de erro do corpo JSON (`message`/`mensagem`/`erro`).
 * - Se o corpo não for JSON, cai para o texto puro da resposta.
 * - Corpos vazios (204, ou 200 sem conteúdo) retornam `undefined`.
 */

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
