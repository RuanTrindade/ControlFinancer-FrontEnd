import {
    useEffect,
    useState,
    type FormEvent
} from "react";

import {
    RiAddCircleLine,
    RiCloseLine,
    RiMoneyDollarCircleLine,
    RiSubtractLine
} from "react-icons/ri";

import {
    movimentarObjetivo,
    type TipoMovimentacaoObjetivo
} from "../services/objetivoService";

import "../styles/formMovimentacaoObjetivo.css";


type Props = {

    aberto: boolean;

    objetivoId: number;

    nomeObjetivo: string;

    tipo: TipoMovimentacaoObjetivo;

    saldoObjetivo: number;

    saldoConta: number;

    onClose: () => void;

    onSalvar: () => Promise<void>;
};


function FormMovimentacaoObjetivo({
    aberto,
    objetivoId,
    nomeObjetivo,
    tipo,
    saldoObjetivo,
    saldoConta,
    onClose,
    onSalvar
}: Props) {

    const [
        valor,
        setValor
    ] = useState("");

    const [
        salvando,
        setSalvando
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState("");


    const deposito =
        tipo === "DEPOSITO";


    const valorNumerico =
        Number(
            valor.replace(",", ".")
        ) || 0;


    const valorValido =
        valorNumerico > 0 &&
        (
            deposito
                ? valorNumerico <= saldoConta
                : valorNumerico <= saldoObjetivo
        );


    useEffect(() => {

        if (!aberto) {
            return;
        }

        setValor("");
        setErro("");

    }, [
        aberto,
        tipo
    ]);


    useEffect(() => {

        if (!aberto) {
            return;
        }


        function fecharComEscape(
            evento: KeyboardEvent
        ) {

            if (
                evento.key === "Escape" &&
                !salvando
            ) {

                onClose();

            }

        }


        document.addEventListener(
            "keydown",
            fecharComEscape
        );

        document.body.style.overflow =
            "hidden";


        return () => {

            document.removeEventListener(
                "keydown",
                fecharComEscape
            );

            document.body.style.overflow =
                "";

        };

    }, [
        aberto,
        salvando,
        onClose
    ]);


    async function salvar(
        evento: FormEvent<HTMLFormElement>
    ) {

        evento.preventDefault();


        if (
            valorNumerico <= 0
        ) {

            setErro(
                "Informe um valor maior que zero."
            );

            return;

        }


        if (
            !deposito &&
            valorNumerico > saldoObjetivo
        ) {

            setErro(
                "O valor da retirada não pode ser maior que o saldo guardado."
            );

            return;

        }

        if (
            deposito &&
            valorNumerico > saldoConta
        ) {

            setErro(
                "Você não possui saldo suficiente para realizar este depósito."
            );

            return;
        }

        if (salvando) {
            return;
        }


        try {

            setSalvando(true);
            setErro("");


            await movimentarObjetivo(
                objetivoId,
                valorNumerico,
                tipo
            );


            await onSalvar();

            onClose();


        } catch (error) {

            console.error(
                "Erro ao movimentar objetivo:",
                error
            );


            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível realizar a movimentação."
            );


        } finally {


            setSalvando(false);

        }

    }


    if (!aberto) {
        return null;
    }


    return (

        <div
            className="
                form-movimentacao-objetivo-overlay
            "
            onMouseDown={
                evento => {

                    if (
                        evento.target ===
                        evento.currentTarget &&
                        !salvando
                    ) {

                        onClose();

                    }

                }
            }
        >

            <section
                className={`
                    form-movimentacao-objetivo-modal

                    ${deposito
                        ? "deposito"
                        : "retirada"
                    }
                `}
                role="dialog"
                aria-modal="true"
            >

                {/* CABEÇALHO */}

                <header
                    className="
                        form-movimentacao-objetivo-cabecalho
                    "
                >

                    <div>

                        <span
                            className="
                                form-movimentacao-objetivo-subtitulo
                            "
                        >
                            {nomeObjetivo}
                        </span>

                        <h2>

                            {
                                deposito
                                    ? "Adicionar valor"
                                    : "Retirar valor"
                            }

                        </h2>

                    </div>


                    <button
                        type="button"
                        className="
                            form-movimentacao-objetivo-fechar
                        "
                        onClick={
                            onClose
                        }
                        disabled={
                            salvando
                        }
                    >

                        <RiCloseLine />

                    </button>

                </header>


                <form
                    className="
                        form-movimentacao-objetivo-conteudo
                    "
                    onSubmit={
                        salvar
                    }
                >

                    {/* ÍCONE */}

                    <div
                        className={`
                            form-movimentacao-objetivo-destaque

                            ${deposito
                                ? "deposito"
                                : "retirada"
                            }
                        `}
                    >

                        <span>

                            {
                                deposito
                                    ? <RiAddCircleLine />
                                    : <RiSubtractLine />
                            }

                        </span>


                        <div>

                            <strong>

                                {
                                    deposito
                                        ? "Depósito no objetivo"
                                        : "Retirada do objetivo"
                                }

                            </strong>


                            <small>

                                {
                                    deposito
                                        ? "O valor será reservado para esta meta."
                                        : "O valor será devolvido ao seu saldo."
                                }

                            </small>

                        </div>

                    </div>


                    {/* SALDO */}

                    <div className="form-movimentacao-objetivo-saldo">

                        <span>

                            {
                                deposito
                                    ? "Saldo disponível na conta"
                                    : "Saldo disponível no objetivo"
                            }

                        </span>

                        <strong>

                            R$ {
                                (
                                    deposito
                                        ? saldoConta
                                        : saldoObjetivo
                                ).toLocaleString(
                                    "pt-BR",
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }
                                )
                            }

                        </strong>

                    </div>


                    {
                        deposito &&
                        valorNumerico > saldoConta && (

                            <div className="form-movimentacao-objetivo-aviso">

                                Saldo insuficiente. Você possui{" "}

                                <strong>
                                    R$ {
                                        saldoConta.toLocaleString(
                                            "pt-BR",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )
                                    }
                                </strong>

                                {" "}disponíveis na conta.

                            </div>

                        )
                    }

                    {
                        deposito &&
                        valorNumerico > 0 &&
                        valorNumerico <= saldoConta && (

                            <div className="form-movimentacao-objetivo-pos">

                                <span>
                                    Saldo após o depósito
                                </span>

                                <strong>

                                    R$ {
                                        (
                                            saldoConta -
                                            valorNumerico
                                        ).toLocaleString(
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

                    {/* INPUT */}

                    <div
                        className="
                            form-movimentacao-objetivo-campo
                        "
                    >

                        <label htmlFor="valor-movimentacao-objetivo">
                            Valor
                        </label>


                        <div
                            className="
                                form-movimentacao-objetivo-input
                            "
                        >

                            <RiMoneyDollarCircleLine />

                            <span>
                                R$
                            </span>


                            <input
                                id="valor-movimentacao-objetivo"
                                type="text"
                                inputMode="decimal"
                                value={
                                    valor
                                }
                                placeholder="0,00"
                                autoFocus
                                disabled={
                                    salvando
                                }
                                onChange={
                                    evento => {

                                        const novoValor =
                                            evento.target.value;


                                        if (
                                            /^\d*[.,]?\d{0,2}$/
                                                .test(
                                                    novoValor
                                                )
                                        ) {

                                            setValor(
                                                novoValor
                                            );

                                            setErro("");

                                        }

                                    }
                                }
                            />

                        </div>

                    </div>


                    {
                        !deposito &&
                        valorNumerico > saldoObjetivo && (

                            <div
                                className="
                                    form-movimentacao-objetivo-aviso
                                "
                            >

                                Você possui apenas{" "}

                                <strong>

                                    R$ {
                                        saldoObjetivo
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )
                                    }

                                </strong>

                                {" "}guardados neste objetivo.

                            </div>

                        )
                    }


                    {
                        erro && (

                            <div
                                className="
                                    form-movimentacao-objetivo-erro
                                "
                            >

                                {erro}

                            </div>

                        )
                    }


                    {/* AÇÕES */}

                    <footer
                        className="
                            form-movimentacao-objetivo-acoes
                        "
                    >

                        <button
                            type="button"
                            className="
                                form-movimentacao-objetivo-cancelar
                            "
                            onClick={
                                onClose
                            }
                            disabled={
                                salvando
                            }
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="
                                form-movimentacao-objetivo-salvar
                            "
                            disabled={
                                salvando ||
                                !valorValido
                            }
                        >

                            {
                                salvando
                                    ? "Salvando..."
                                    : deposito
                                        ? "Adicionar valor"
                                        : "Retirar valor"
                            }

                        </button>

                    </footer>

                </form>

            </section>

        </div>

    );

}


export default FormMovimentacaoObjetivo;