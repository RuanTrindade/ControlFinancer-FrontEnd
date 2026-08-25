import {
    excluirPlanejamento
} from "../services/planejamentoService";

import ConfirmarExclusaoModal
    from "./ConfirmarExclusaoModal";


type Props = {

    planejamentoId: number;

    usuarioId: number;

    valorPlanejado: number;

    onClose: () => void;

    onExcluir: () => Promise<void>;

};


/**
 * Wrapper fino sobre o ConfirmarExclusaoModal genérico.
 * Mantém a mesma API (props) de antes — nenhuma tela que
 * usa este componente precisa ser alterada.
 */
function ConfirmarExclusaoPlanejamento({
    planejamentoId,
    usuarioId,
    valorPlanejado,
    onClose,
    onExcluir
}: Props) {

    return (

        <ConfirmarExclusaoModal
            aberto={true}
            titulo="Excluir planejamento?"
            descricao="Você está prestes a excluir o planejamento deste mês."
            resumo={{
                label: "Gastos planejados",
                valor:
                    "R$ " +
                    valorPlanejado.toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )
            }}
            aviso={
                <>
                    As categorias e as transações
                    não serão excluídas.

                    <br />

                    Apenas o planejamento deste mês
                    e os limites definidos para suas
                    categorias serão removidos.
                </>
            }
            confirmarLabel="Excluir planejamento"
            confirmandoLabel="Excluindo..."
            erroPadrao="Não foi possível excluir o planejamento."
            onClose={onClose}
            onConfirmar={async () => {

                await excluirPlanejamento(
                    planejamentoId,
                    usuarioId
                );

                await onExcluir();

            }}
        />

    );

}


export default ConfirmarExclusaoPlanejamento;
