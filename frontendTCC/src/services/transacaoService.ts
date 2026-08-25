export async function buscarSaldoUsuario(
    usuarioId: number
): Promise<number> {

    const resposta =
        await fetch(
            `http://localhost:8080/transacoes/saldo/${usuarioId}`
        );

    if (!resposta.ok) {

        throw new Error(
            "Não foi possível consultar o saldo da conta."
        );

    }

    return resposta.json();
}