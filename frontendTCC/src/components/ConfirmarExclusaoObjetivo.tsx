import {
    useState
} from "react";

import {
    RiCloseLine,
    RiDeleteBin6Line
} from "react-icons/ri";

import {
    excluirObjetivo
} from "../services/objetivoService";

import type {
    Objetivo
} from "../types/objetivo";

import "../styles/confirmarExclusaoObjetivo.css";


type Props = {

    aberto: boolean;

    objetivo: Objetivo;

    usuarioId: number;

    onClose: () => void;

    onExcluir: () => Promise<void>;

};


function ConfirmarExclusaoObjetivo({
    aberto,
    objetivo,
    usuarioId,
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
            excluindo ||
            objetivo.finalizado
        ) {
            return;
        }

        try {

            setExcluindo(true);
            setErro("");


            await excluirObjetivo(
                objetivo.id,
                usuarioId
            );


            await onExcluir();

            onClose();


        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o objetivo."
            );

        } finally {

            setExcluindo(false);

        }

    }


    if (!aberto) {
        return null;
    }


    return (

        <div
            className="excluir-objetivo-overlay"
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

            <section className="excluir-objetivo-modal">

                <header>

                    <div className="excluir-objetivo-icone">
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


                <div className="excluir-objetivo-conteudo">

                    <h2>
                        Excluir objetivo?
                    </h2>

                    <p>

                        Você está prestes a excluir o objetivo{" "}

                        <strong>
                            {objetivo.nome}
                        </strong>.

                    </p>


                    {
                        objetivo.valorAtual > 0 && (

                            <div className="excluir-objetivo-saldo">

                                <span>
                                    Valor que será devolvido para sua conta
                                </span>

                                <strong>

                                    R$ {
                                        objetivo.valorAtual
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

                        )
                    }


                    <div className="excluir-objetivo-aviso">

                        {
                            objetivo.valorAtual > 0
                                ? (
                                    <>
                                        O dinheiro guardado será devolvido ao seu saldo antes da exclusão.
                                    </>
                                )
                                : (
                                    <>
                                        Este objetivo será removido permanentemente.
                                    </>
                                )
                        }

                    </div>


                    {erro && (

                        <div className="excluir-objetivo-erro">
                            {erro}
                        </div>

                    )}


                    <footer>

                        <button
                            type="button"
                            className="excluir-objetivo-cancelar"
                            onClick={onClose}
                            disabled={excluindo}
                        >
                            Cancelar
                        </button>


                        <button
                            type="button"
                            className="excluir-objetivo-confirmar"
                            onClick={excluir}
                            disabled={
                                excluindo ||
                                objetivo.finalizado
                            }
                        >

                            {
                                excluindo
                                    ? "Excluindo..."
                                    : "Excluir objetivo"
                            }

                        </button>

                    </footer>

                </div>

            </section>

        </div>

    );

}


export default ConfirmarExclusaoObjetivo;