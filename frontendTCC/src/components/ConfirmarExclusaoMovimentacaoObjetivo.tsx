import {
    excluirMovimentacaoObjetivo
} from "../services/objetivoService";

import type {
    ObjetivoMovimentacao
} from "../types/objetivo";

import ConfirmarExclusaoModal
    from "./ConfirmarExclusaoModal";


type Props = {

    movimentacao:
        ObjetivoMovimentacao | null;

    aberto: boolean;

    onClose: () => void;

    onExcluir: () => Promise<void>;
};


/**
 * Wrapper fino sobre o ConfirmarExclusaoModal genérico.
 * Mantém a mesma API (props) de antes — nenhuma tela que
 * usa este componente precisa ser alterada.
 */
function ConfirmarExclusaoMovimentacaoObjetivo({
    movimentacao,
    aberto,
    onClose,
    onExcluir
}: Props) {

    if (
        !aberto ||
        !movimentacao
    ) {
        return null;
    }


    const deposito =
        movimentacao.tipo ===
        "DEPOSITO";

    return (

        <ConfirmarExclusaoModal
            aberto={aberto}
            titulo="Excluir movimentação?"
            descricao={
                <>
                    Você está prestes a excluir
                    esta{" "}
                    <strong>
                        {
                            deposito
                                ? "movimentação de depósito"
                                : "movimentação de retirada"
                        }
                    </strong>.
                </>
            }
            resumo={{
                label: "Valor",
                valor:
                    (deposito ? "+ " : "- ") +
                    "R$ " +
                    movimentacao.valor.toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )
            }}
            aviso="A movimentação e a transação financeira vinculada a ela também serão removidas."
            confirmarLabel="Excluir movimentação"
            confirmandoLabel="Excluindo..."
            erroPadrao="Não foi possível excluir a movimentação."
            onClose={onClose}
            onConfirmar={async () => {

                await excluirMovimentacaoObjetivo(
                    movimentacao.id
                );

                await onExcluir();

            }}
        />

    );

}


export default
ConfirmarExclusaoMovimentacaoObjetivo;
