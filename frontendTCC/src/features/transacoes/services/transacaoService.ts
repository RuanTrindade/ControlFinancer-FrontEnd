import { apiFetch } from "../../../shared/services/api";

export async function buscarSaldoUsuario(usuarioId: number): Promise<number> {
    return apiFetch<number>(
        `/transacoes/saldo/${usuarioId}`,
        {},
        "Não foi possível consultar o saldo da conta.",
    );
}
