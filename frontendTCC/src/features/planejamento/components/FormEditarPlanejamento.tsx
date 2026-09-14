import { useState } from "react";

import { RiCloseLine, RiMoneyDollarCircleLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import { atualizarValorPlanejado } from "../services/planejamentoService";

import "../styles/formEditarPlanejamento.css";

import ModalOverlay from "../../../shared/components/ModalOverlay";

type Props = {
    planejamentoId: number;

    usuarioId: number;

    valorAtual: number;

    minimoPermitido: number;

    onClose: () => void;

    onSalvar: () => Promise<void>;
};

function FormEditarPlanejamento({
    planejamentoId,
    usuarioId,
    valorAtual,
    minimoPermitido,
    onClose,
    onSalvar,
}: Props) {
    const [valor, setValor] = useState(valorAtual.toFixed(2));

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");

    const valorNumerico = Number(valor) || 0;

    const valorValido = valorNumerico >= minimoPermitido;

    async function salvar() {
        if (!valorValido || salvando) {
            return;
        }

        try {
            setSalvando(true);
            setErro("");

            await atualizarValorPlanejado(planejamentoId, usuarioId, valorNumerico);

            await onSalvar();

            onClose();
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o planejamento.",
            );
        } finally {
            setSalvando(false);
        }
    }

    function fecharModal() {
        if (!salvando) {
            onClose();
        }
    }

    return (
        <ModalOverlay
            overlayClassName="editar-planejamento-overlay"
            modalClassName="editar-planejamento-modal"
            onClose={fecharModal}
            bloqueado={salvando}
        >
                <header>
                    <h2>Editar planejamento</h2>

                    <button type="button" onClick={onClose} disabled={salvando}>
                        <RiCloseLine />
                    </button>
                </header>

                <div className="editar-planejamento-conteudo">
                    <div className="editar-planejamento-linha">
                        <div className="editar-planejamento-total">
                            <span className="editar-planejamento-icone">
                                <RiMoneyDollarCircleLine />
                            </span>

                            <strong>Total</strong>
                        </div>

                        <div className="editar-planejamento-campo">
                            <label>Valor</label>

                            <div className="editar-planejamento-input">
                                <NumericFormat
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    fixedDecimalScale
                                    allowNegative={false}
                                    prefix="R$ "
                                    value={valor}
                                    onValueChange={(valores) => {
                                        setValor(valores.value);

                                        setErro("");
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {!valorValido && (
                        <div className="editar-planejamento-aviso">
                            O total não pode ser inferior a{" "}
                            <strong>
                                R${" "}
                                {minimoPermitido.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </strong>
                            , que é o valor já distribuído nas categorias.
                        </div>
                    )}

                    {erro && <div className="editar-planejamento-erro">{erro}</div>}

                    <footer>
                        <button
                            type="button"
                            className="editar-planejamento-cancelar"
                            onClick={onClose}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="editar-planejamento-salvar"
                            onClick={salvar}
                            disabled={salvando || !valorValido}
                        >
                            {salvando ? "Salvando..." : "Salvar"}
                        </button>
                    </footer>
                </div>
        </ModalOverlay>
    );
}

export default FormEditarPlanejamento;
