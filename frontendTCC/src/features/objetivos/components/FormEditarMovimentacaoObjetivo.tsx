import { useEffect, useState, type FormEvent } from "react";

import { RiCloseLine, RiEditLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import { editarMovimentacaoObjetivo } from "../services/objetivoService";

import type { ObjetivoMovimentacao } from "../types/objetivo";

import ModalOverlay from "../../../shared/components/ModalOverlay";

import "../styles/formEditarMovimentacaoObjetivo.css";

type Props = {
    movimentacao: ObjetivoMovimentacao | null;

    aberto: boolean;

    onClose: () => void;

    onSalvar: () => Promise<void>;
};

function FormEditarMovimentacaoObjetivo({ movimentacao, aberto, onClose, onSalvar }: Props) {
    const [valor, setValor] = useState("");

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!aberto || !movimentacao) {
            return;
        }

        setValor(movimentacao.valor.toString());

        setErro("");
    }, [aberto, movimentacao]);

    const valorNumerico = Number(valor) || 0;

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (!movimentacao) {
            return;
        }

        if (valorNumerico <= 0) {
            setErro("Informe um valor maior que zero.");

            return;
        }

        try {
            setSalvando(true);
            setErro("");

            await editarMovimentacaoObjetivo(movimentacao.id, valorNumerico);

            await onSalvar();

            onClose();
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível editar a movimentação.",
            );
        } finally {
            setSalvando(false);
        }
    }

    if (!aberto || !movimentacao) {
        return null;
    }

    const deposito = movimentacao.tipo === "DEPOSITO";

    function fecharModal() {
        if (!salvando) {
            onClose();
        }
    }

    return (
        <ModalOverlay
            overlayClassName="editar-movimentacao-objetivo-overlay"
            modalClassName={`editar-movimentacao-objetivo-modal ${deposito ? "deposito" : "retirada"}`}
            onClose={fecharModal}
            bloqueado={salvando}
        >
                <header>
                    <div>
                        <span>{deposito ? "Depósito" : "Retirada"}</span>

                        <h2>Editar movimentação</h2>
                    </div>

                    <button type="button" onClick={onClose} disabled={salvando}>
                        <RiCloseLine />
                    </button>
                </header>

                <form onSubmit={salvar}>
                    <div className="editar-movimentacao-destaque">
                        <RiEditLine />

                        <span>Altere apenas o valor desta movimentação.</span>
                    </div>

                    <div className="editar-movimentacao-campo">
                        <label>Valor</label>

                        <div className="editar-movimentacao-input">
                            <NumericFormat
                                value={valor}
                                thousandSeparator="."
                                decimalSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                                allowNegative={false}
                                prefix="R$ "
                                disabled={salvando}
                                onValueChange={(valores) => {
                                    setValor(valores.value);

                                    setErro("");
                                }}
                            />
                        </div>
                    </div>

                    {erro && <div className="editar-movimentacao-erro">{erro}</div>}

                    <footer>
                        <button
                            type="button"
                            className="editar-movimentacao-cancelar"
                            onClick={onClose}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="editar-movimentacao-salvar"
                            disabled={salvando || valorNumerico <= 0}
                        >
                            {salvando ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </footer>
                </form>
        </ModalOverlay>
    );
}

export default FormEditarMovimentacaoObjetivo;
