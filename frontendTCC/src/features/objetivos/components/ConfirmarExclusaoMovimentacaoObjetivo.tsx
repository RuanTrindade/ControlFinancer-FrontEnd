import { excluirMovimentacaoObjetivo } from "../services/objetivoService";

import type { ObjetivoMovimentacao } from "../types/objetivo";

import ConfirmarExclusaoModal from "../../../shared/components/ConfirmarExclusaoModal";

type Props = {
    movimentacao: ObjetivoMovimentacao | null;

    aberto: boolean;

    onClose: () => void;

    onExcluir: () => Promise<void>;
};

function ConfirmarExclusaoMovimentacaoObjetivo({
    movimentacao,
    aberto,
    onClose,
    onExcluir,
}: Props) {
    if (!aberto || !movimentacao) {
        return null;
    }

    const deposito = movimentacao.tipo === "DEPOSITO";

    return (
        <ConfirmarExclusaoModal
            aberto={aberto}
            titulo="Excluir movimentação?"
            descricao={
                <>
                    Você está prestes a excluir esta{" "}
                    <strong>
                        {deposito ? "movimentação de depósito" : "movimentação de retirada"}
                    </strong>
                    .
                </>
            }
            resumo={{
                label: "Valor",
                valor:
                    (deposito ? "+ " : "- ") +
                    "R$ " +
                    movimentacao.valor.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
            }}
            aviso="A movimentação e a transação financeira vinculada a ela também serão removidas."
            confirmarLabel="Excluir movimentação"
            confirmandoLabel="Excluindo..."
            erroPadrao="Não foi possível excluir a movimentação."
            onClose={onClose}
            onConfirmar={async () => {
                await excluirMovimentacaoObjetivo(movimentacao.id);

                await onExcluir();
            }}
        />
    );
}

export default ConfirmarExclusaoMovimentacaoObjetivo;
