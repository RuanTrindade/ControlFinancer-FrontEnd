import {

    RiDeleteBinLine,
    RiEditLine,
    RiArrowDownCircleLine,
    RiArrowUpCircleLine

} from "react-icons/ri"
type Props = {

    movimentacao: {
        id: number;
        tipo: string;
        valor: number;
        data: string;
    };

    objetivoFinalizado: boolean;

    onEditar: () => void;

    onExcluir: () => void;
};

function ObjetivoMovimentacaoItem({

    movimentacao,
    objetivoFinalizado,
    onEditar,
    onExcluir

}: Props) {

    const deposito =

        movimentacao.tipo ===
        "DEPOSITO"

    return (

        <div className="movimentacao-item">

            <div className="movimentacao-info">

                <div

                    className={

                        deposito

                            ? "movimentacao-tipo deposito"

                            : "movimentacao-tipo saque"
                    }
                >

                    {

                        deposito

                            ? <RiArrowDownCircleLine />

                            : <RiArrowUpCircleLine />
                    }

                </div>

                <div className="movimentacao-dados">

                    <strong>

                        {

                            deposito
                                ? "Depósito"
                                : "Retirada"
                        }

                    </strong>

                    <span>

                        {
                            movimentacao.data
                        }

                    </span>

                </div>

            </div>

            <div

                className={

                    deposito

                        ? "valor-movimentacao deposito"

                        : "valor-movimentacao saque"
                }
            >

                {

                    deposito

                        ? "+ "

                        : "- "
                }

                R$ {

                    movimentacao.valor.toLocaleString(
                        "pt-BR",
                        {

                            minimumFractionDigits: 2
                        }
                    )
                }

            </div>

            {!objetivoFinalizado && (

                <div className="movimentacao-acoes">

                    <button
                        type="button"
                        title="Editar movimentação"
                        onClick={onEditar}
                    >
                        <RiEditLine />
                    </button>


                    <button
                        type="button"
                        title="Excluir movimentação"
                        onClick={onExcluir}
                    >
                        <RiDeleteBinLine />
                    </button>

                </div>

            )}

        </div>

    )

}

export default ObjetivoMovimentacaoItem