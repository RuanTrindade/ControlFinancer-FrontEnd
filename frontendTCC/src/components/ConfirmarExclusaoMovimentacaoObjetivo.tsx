import {
    useState
} from "react";

import {
    RiCloseLine,
    RiDeleteBin6Line
} from "react-icons/ri";

import {
    excluirMovimentacaoObjetivo
} from "../services/objetivoService";

import type {
    ObjetivoMovimentacao
} from "../types/objetivo";

import "../styles/confirmarExclusaoMovimentacaoObjetivo.css";


type Props = {

    movimentacao:
        ObjetivoMovimentacao | null;

    aberto: boolean;

    onClose: () => void;

    onExcluir: () => Promise<void>;
};


function ConfirmarExclusaoMovimentacaoObjetivo({
    movimentacao,
    aberto,
    onClose,
    onExcluir
}: Props) {

    const [
        excluindo,
        setExcluindo
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState("");


    async function excluir() {

        if (
            !movimentacao ||
            excluindo
        ) {
            return;
        }

        try {

            setExcluindo(true);
            setErro("");


            await excluirMovimentacaoObjetivo(
                movimentacao.id
            );


            await onExcluir();

            onClose();


        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir a movimentação."
            );

        } finally {

            setExcluindo(false);

        }

    }


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

        <div
            className="
                excluir-movimentacao-objetivo-overlay
            "
            onMouseDown={evento => {

                if (
                    evento.target ===
                    evento.currentTarget &&
                    !excluindo
                ) {

                    onClose();

                }

            }}
        >

            <section
                className="
                    excluir-movimentacao-objetivo-modal
                "
            >

                <header>

                    <div
                        className="
                            excluir-movimentacao-icone
                        "
                    >
                        <RiDeleteBin6Line />
                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        disabled={excluindo}
                    >
                        <RiCloseLine />
                    </button>

                </header>


                <div
                    className="
                        excluir-movimentacao-conteudo
                    "
                >

                    <h2>
                        Excluir movimentação?
                    </h2>


                    <p>

                        Você está prestes a excluir
                        esta{" "}

                        <strong>
                            {
                                deposito
                                    ? "movimentação de depósito"
                                    : "movimentação de retirada"
                            }
                        </strong>.

                    </p>


                    <div
                        className="
                            excluir-movimentacao-resumo
                        "
                    >

                        <span>
                            Valor
                        </span>

                        <strong>

                            {
                                deposito
                                    ? "+ "
                                    : "- "
                            }

                            R$ {
                                movimentacao.valor
                                    .toLocaleString(
                                        "pt-BR",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    )
                            }

                        </strong>

                    </div>


                    <div
                        className="
                            excluir-movimentacao-aviso
                        "
                    >

                        A movimentação e a transação
                        financeira vinculada a ela
                        também serão removidas.

                    </div>


                    {erro && (

                        <div
                            className="
                                excluir-movimentacao-erro
                            "
                        >
                            {erro}
                        </div>

                    )}


                    <footer>

                        <button
                            type="button"
                            className="
                                excluir-movimentacao-cancelar
                            "
                            onClick={onClose}
                            disabled={excluindo}
                        >
                            Cancelar
                        </button>


                        <button
                            type="button"
                            className="
                                excluir-movimentacao-confirmar
                            "
                            onClick={excluir}
                            disabled={excluindo}
                        >

                            {
                                excluindo
                                    ? "Excluindo..."
                                    : "Excluir movimentação"
                            }

                        </button>

                    </footer>

                </div>

            </section>

        </div>

    );

}

export default
ConfirmarExclusaoMovimentacaoObjetivo;