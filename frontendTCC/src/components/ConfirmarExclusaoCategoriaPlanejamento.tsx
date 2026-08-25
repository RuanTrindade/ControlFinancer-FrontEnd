import {
    useEffect,
    useState
} from "react";

import {
    RiCloseLine,
    RiDeleteBin6Line
} from "react-icons/ri";

import {
    excluirCategoriaPlanejamento
} from "../services/planejamentoCategoriaService";

import "../styles/confirmarExclusaoCategoriaPlanejamento.css";


type Props = {

    id: number;

    nome: string;

    limite: number;

    usuarioId: number;

    onClose: () => void;

    onExcluir: () => Promise<void>;
};


function ConfirmarExclusaoCategoriaPlanejamento({
    id,
    nome,
    limite,
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

        if (excluindo) {
            return;
        }

        try {

            setExcluindo(true);
            setErro("");

            await excluirCategoriaPlanejamento(
                id,
                usuarioId
            );

            await onExcluir();

            onClose();

        } catch (error) {

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir a categoria."
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
            className="excluir-categoria-overlay"
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

            <section className="excluir-categoria-modal">

                <header>

                    <div className="excluir-categoria-icone">
                        <RiDeleteBin6Line />
                    </div>

                    <button
                        type="button"
                        className="excluir-categoria-fechar"
                        onClick={onClose}
                        disabled={excluindo}
                    >
                        <RiCloseLine />
                    </button>

                </header>


                <div className="excluir-categoria-conteudo">

                    <h2>
                        Excluir categoria do planejamento?
                    </h2>

                    <p>
                        Você está prestes a remover{" "}
                        <strong>
                            {nome}
                        </strong>{" "}
                        deste planejamento.
                    </p>


                    <div className="excluir-categoria-resumo">

                        <span>
                            Valor planejado
                        </span>

                        <strong>
                            R$ {limite.toLocaleString(
                                "pt-BR",
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>


                    <div className="excluir-categoria-aviso">

                        As transações dessa categoria
                        não serão excluídas.

                        <br />

                        Elas passarão a ser consideradas
                        em <strong>Categorias restantes</strong>
                        enquanto a categoria não fizer parte
                        do planejamento.

                    </div>


                    {erro && (

                        <div className="excluir-categoria-erro">
                            {erro}
                        </div>

                    )}


                    <footer>

                        <button
                            type="button"
                            className="excluir-categoria-cancelar"
                            onClick={onClose}
                            disabled={excluindo}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="excluir-categoria-confirmar"
                            onClick={excluir}
                            disabled={excluindo}
                        >
                            {
                                excluindo
                                    ? "Excluindo..."
                                    : "Excluir categoria"
                            }
                        </button>

                    </footer>

                </div>

            </section>

        </div>

    );

}

export default
ConfirmarExclusaoCategoriaPlanejamento;