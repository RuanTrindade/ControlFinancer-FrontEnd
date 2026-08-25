import {
    excluirObjetivo
} from "../services/objetivoService";

import type {
    Objetivo
} from "../types/objetivo";

import ConfirmarExclusaoModal
    from "./ConfirmarExclusaoModal";


type Props = {

    aberto: boolean;

    objetivo: Objetivo;

    usuarioId: number;

    onClose: () => void;

    onExcluir: () => Promise<void>;

};


/**
 * Wrapper fino sobre o ConfirmarExclusaoModal genérico.
 * Mantém a mesma API (props) de antes — nenhuma tela que
 * usa este componente precisa ser alterada.
 */
function ConfirmarExclusaoObjetivo({
    aberto,
    objetivo,
    usuarioId,
    onClose,
    onExcluir
}: Props) {

    const temValorAtual =
        objetivo.valorAtual > 0;

    return (

        <ConfirmarExclusaoModal
            aberto={aberto}
            titulo="Excluir objetivo?"
            descricao={
                <>
                    Você está prestes a excluir o objetivo{" "}
                    <strong>{objetivo.nome}</strong>.
                </>
            }
            resumo={
                temValorAtual
                    ? {
                        label: "Valor que será devolvido para sua conta",
                        valor:
                            "R$ " +
                            objetivo.valorAtual.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            ),
                        tom: "positivo"
                    }
                    : undefined
            }
            aviso={
                temValorAtual
                    ? "O dinheiro guardado será devolvido ao seu saldo antes da exclusão."
                    : "Este objetivo será removido permanentemente."
            }
            confirmarLabel="Excluir objetivo"
            confirmandoLabel="Excluindo..."
            confirmarDesabilitado={objetivo.finalizado}
            erroPadrao="Não foi possível excluir o objetivo."
            onClose={onClose}
            onConfirmar={async () => {

                await excluirObjetivo(
                    objetivo.id,
                    usuarioId
                );

                await onExcluir();

            }}
        />

    );

}


export default ConfirmarExclusaoObjetivo;
