import {
    useEffect,
    useState
} from "react";

import {
    RiCloseLine,
    RiDeleteBin6Line
} from "react-icons/ri";

import {
    excluirPlanejamento
} from "../services/planejamentoService";

import "../styles/confirmarExclusaoPlanejamento.css";


type Props = {

    planejamentoId: number;

    usuarioId: number;

    valorPlanejado: number;

    onClose: () => void;

    onExcluir: () => Promise<void>;

};


function ConfirmarExclusaoPlanejamento({
    planejamentoId,
    usuarioId,
    valorPlanejado,
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

        if (excluindo) {
            return;
        }

        try {

            setExcluindo(true);
            setErro("");

            await excluirPlanejamento(
                planejamentoId,
                usuarioId
            );

            await onExcluir();

            onClose();

        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o planejamento."
            );

        } finally {

            setExcluindo(false);

        }

    }


    useEffect(() => {

        function fecharComEsc(
            evento: KeyboardEvent
        ) {

            if (
                evento.key === "Escape" &&
                !excluindo
            ) {

                onClose();

            }

        }

        document.addEventListener(
            "keydown",
            fecharComEsc
        );

        return () =>
            document.removeEventListener(
                "keydown",
                fecharComEsc
            );

    }, [
        onClose,
        excluindo
    ]);


    return (

        <div
            className="excluir-planejamento-overlay"
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
                className="excluir-planejamento-modal"
                role="dialog"
                aria-modal="true"
            >

                <header>

                    <div className="excluir-planejamento-icone">
                        <RiDeleteBin6Line />
                    </div>

                    <button
                        type="button"
                        className="excluir-planejamento-fechar"
                        onClick={onClose}
                        disabled={excluindo}
                    >
                        <RiCloseLine />
                    </button>

                </header>


                <div className="excluir-planejamento-conteudo">

                    <h2>
                        Excluir planejamento?
                    </h2>

                    <p>
                        Você está prestes a excluir
                        o planejamento deste mês.
                    </p>


                    <div className="excluir-planejamento-resumo">

                        <span>
                            Gastos planejados
                        </span>

                        <strong>
                            R$ {valorPlanejado.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>


                    <div className="excluir-planejamento-aviso">

                        As categorias e as transações
                        não serão excluídas.

                        <br />

                        Apenas o planejamento deste mês
                        e os limites definidos para suas
                        categorias serão removidos.

                    </div>


                    {erro && (

                        <div className="excluir-planejamento-erro">
                            {erro}
                        </div>

                    )}


                    <footer>

                        <button
                            type="button"
                            className="excluir-planejamento-cancelar"
                            onClick={onClose}
                            disabled={excluindo}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="excluir-planejamento-confirmar"
                            onClick={excluir}
                            disabled={excluindo}
                        >
                            {
                                excluindo
                                    ? "Excluindo..."
                                    : "Excluir planejamento"
                            }
                        </button>

                    </footer>

                </div>

            </section>

        </div>

    );

}

export default ConfirmarExclusaoPlanejamento;