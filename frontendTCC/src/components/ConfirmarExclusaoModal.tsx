import {
    useEffect,
    useState,
    type ReactNode
} from "react";

import {
    RiCloseLine,
    RiDeleteBin6Line
} from "react-icons/ri";

import "../styles/confirmarExclusao.css";


/**
 * Modal genérico de confirmação de exclusão.
 *
 * Reúne em um único componente o padrão visual e de
 * comportamento repetido em:
 *   - ConfirmarExclusaoObjetivo
 *   - ConfirmarExclusaoPlanejamento
 *   - ConfirmarExclusaoCategoriaPlanejamento
 *   - ConfirmarExclusaoMovimentacaoObjetivo
 *
 * Cada um desses componentes agora é apenas um wrapper
 * fino em cima deste, mantendo a própria API (props)
 * para não exigir nenhuma mudança nas telas que os usam.
 */
type Props = {

    aberto: boolean;

    titulo: string;

    descricao: ReactNode;

    resumo?: {
        label: string;
        valor: string;
        tom?: "neutro" | "positivo";
    };

    aviso: ReactNode;

    confirmarLabel: string;

    confirmandoLabel: string;

    confirmarDesabilitado?: boolean;

    erroPadrao: string;

    onClose: () => void;

    onConfirmar: () => Promise<void>;

};


function ConfirmarExclusaoModal({
    aberto,
    titulo,
    descricao,
    resumo,
    aviso,
    confirmarLabel,
    confirmandoLabel,
    confirmarDesabilitado = false,
    erroPadrao,
    onClose,
    onConfirmar
}: Props) {

    const [
        excluindo,
        setExcluindo
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState("");


    async function confirmar() {

        if (
            excluindo ||
            confirmarDesabilitado
        ) {
            return;
        }

        try {

            setExcluindo(true);
            setErro("");

            await onConfirmar();

            onClose();

        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : erroPadrao
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


    if (!aberto) {
        return null;
    }


    return (

        <div
            className="confirmar-exclusao-overlay"
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
                className="confirmar-exclusao-modal"
                role="dialog"
                aria-modal="true"
            >

                <header>

                    <div className="confirmar-exclusao-icone">
                        <RiDeleteBin6Line />
                    </div>

                    <button
                        type="button"
                        className="confirmar-exclusao-fechar"
                        onClick={onClose}
                        disabled={excluindo}
                    >
                        <RiCloseLine />
                    </button>

                </header>


                <div className="confirmar-exclusao-conteudo">

                    <h2>
                        {titulo}
                    </h2>

                    <p>
                        {descricao}
                    </p>


                    {resumo && (

                        <div
                            className={
                                resumo.tom === "positivo"
                                    ? "confirmar-exclusao-resumo confirmar-exclusao-resumo--positivo"
                                    : "confirmar-exclusao-resumo"
                            }
                        >

                            <span>
                                {resumo.label}
                            </span>

                            <strong>
                                {resumo.valor}
                            </strong>

                        </div>

                    )}


                    <div className="confirmar-exclusao-aviso">
                        {aviso}
                    </div>


                    {erro && (

                        <div className="confirmar-exclusao-erro">
                            {erro}
                        </div>

                    )}


                    <footer>

                        <button
                            type="button"
                            className="confirmar-exclusao-cancelar"
                            onClick={onClose}
                            disabled={excluindo}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="confirmar-exclusao-confirmar"
                            onClick={confirmar}
                            disabled={
                                excluindo ||
                                confirmarDesabilitado
                            }
                        >

                            {
                                excluindo
                                    ? confirmandoLabel
                                    : confirmarLabel
                            }

                        </button>

                    </footer>

                </div>

            </section>

        </div>

    );

}


export default ConfirmarExclusaoModal;
