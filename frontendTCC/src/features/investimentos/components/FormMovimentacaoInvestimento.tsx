import { useEffect, useState } from "react";

import { RiAddLine, RiArrowDownLine, RiCloseLine, RiLineChartLine } from "react-icons/ri";

import {
    editarMovimentacao,
    registrarMovimentacao,
} from "../services/investimentoMovimentacaoService";

import type { InvestimentoMovimentacao, TipoInvestimento } from "../types/investimentoMovimentacao";

import { useMes } from "../../../context/MesContext";

import ModalOverlay from "../../../shared/components/ModalOverlay";

import "../styles/formMovimentacaoInvestimento.css";

type Props = {
    investimentoId: number;

    tipo: TipoInvestimento;

    movimentacaoEdicao?: InvestimentoMovimentacao | null;

    onClose: () => void;

    onSalvar: () => Promise<void> | void;
};

function FormMovimentacaoInvestimento({
    investimentoId,
    tipo,
    movimentacaoEdicao = null,
    onClose,
    onSalvar,
}: Props) {
    const { referenciaAtual } = useMes();

    const editando = movimentacaoEdicao !== null;

    const aporte = tipo === "APORTE";

    const resgate = tipo === "RESGATE";

    const rendimento = tipo === "RENDIMENTO";

    /* ===================================================
       ESTADOS
    =================================================== */

    const [valor, setValor] = useState("");

    const [referencia, setReferencia] = useState("");

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState<string | null>(null);

    /* ===================================================
       PREENCHER DADOS
    =================================================== */

    useEffect(() => {
        /*
         * EDIÇÃO
         */
        if (movimentacaoEdicao) {
            setValor(String(movimentacaoEdicao.valor).replace(".", ","));

            if (movimentacaoEdicao.tipo === "RENDIMENTO") {
                const data = new Date(movimentacaoEdicao.data);

                const ano = data.getFullYear();

                const mes = String(data.getMonth() + 1).padStart(2, "0");

                setReferencia(`${ano}-${mes}`);
            }

            return;
        }

        /*
         * NOVO RENDIMENTO
         *
         * Abre automaticamente
         * no mês selecionado na Topbar.
         */
        if (rendimento) {
            const ano = referenciaAtual.getFullYear();

            const mes = String(referenciaAtual.getMonth() + 1).padStart(2, "0");

            setReferencia(`${ano}-${mes}`);
        }
    }, [movimentacaoEdicao, rendimento, referenciaAtual]);

    /* ===================================================
       TEXTOS
    =================================================== */

    const titulo = editando
        ? aporte
            ? "Editar aporte"
            : resgate
              ? "Editar resgate"
              : "Editar rendimento"
        : aporte
          ? "Fazer aporte"
          : resgate
            ? "Fazer resgate"
            : "Registrar rendimento";

    const descricao = editando
        ? aporte
            ? "Altere o valor deste aporte."
            : resgate
              ? "Altere o valor deste resgate."
              : "Altere o valor ou o mês deste rendimento."
        : aporte
          ? "Informe o valor que será adicionado ao investimento."
          : resgate
            ? "Informe o valor que será retirado do investimento."
            : "Informe quanto este investimento rendeu no mês selecionado.";

    const labelValor = aporte
        ? "Valor do aporte"
        : resgate
          ? "Valor do resgate"
          : "Valor do rendimento";

    const classeTipo = aporte ? "aporte" : resgate ? "resgate" : "rendimento";

    const textoAviso = aporte
        ? editando
            ? "Se o aporte for aumentado, será necessário possuir saldo disponível para pagar a diferença."
            : "O aporte será retirado do saldo disponível e adicionado ao investimento."
        : resgate
          ? editando
              ? "O novo valor não poderá ser maior que o saldo disponível no investimento."
              : "O resgate será descontado do investimento e devolvido ao saldo disponível."
          : "O rendimento será somado ao investimento e afetará este mês e todos os meses seguintes.";

    const textoBotao = editando
        ? "Salvar alterações"
        : aporte
          ? "Confirmar aporte"
          : resgate
            ? "Confirmar resgate"
            : "Registrar rendimento";

    /* ===================================================
       SALVAR
    =================================================== */

    async function salvarMovimentacao() {
        if (salvando) {
            return;
        }

        const valorNumero = Number(valor.replace(",", "."));

        if (!valor.trim() || Number.isNaN(valorNumero) || valorNumero <= 0) {
            setErro("Informe um valor válido.");

            return;
        }

        if (rendimento && !referencia) {
            setErro("Informe o mês de referência do rendimento.");

            return;
        }

        const dados = {
            valor: valorNumero,

            tipo,

            referencia: rendimento ? `${referencia}-01` : null,
        };

        try {
            setSalvando(true);

            setErro(null);

            /* ===================================================
               EDIÇÃO
            =================================================== */

            if (editando && movimentacaoEdicao) {
                await editarMovimentacao(
                    movimentacaoEdicao.id,

                    dados,
                );
            }

            /* ===================================================
               CRIAÇÃO
            =================================================== */
            else {
                await registrarMovimentacao(
                    investimentoId,

                    dados,
                );
            }

            await onSalvar();

            onClose();
        } catch (error) {
            console.error("Erro ao salvar movimentação:", error);

            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível salvar a movimentação.");
            }
        } finally {
            setSalvando(false);
        }
    }

    function enviarFormulario(event: React.FormEvent) {
        event.preventDefault();

        salvarMovimentacao();
    }

    return (
        <ModalOverlay
            overlayClassName="overlay-movimentacao-investimento"
            modalClassName="modal-movimentacao-investimento"
            onClose={onClose}
            bloqueado={salvando}
            fecharAoClicarFora={!salvando}
        >
                {/* CABEÇALHO */}

                <div className="cabecalho-modal-movimentacao">
                    <div className="titulo-modal-movimentacao">
                        <div className={`icone-modal-movimentacao ${classeTipo}`}>
                            {aporte ? (
                                <RiAddLine />
                            ) : resgate ? (
                                <RiArrowDownLine />
                            ) : (
                                <RiLineChartLine />
                            )}
                        </div>

                        <div>
                            <h2>{titulo}</h2>

                            <p>{descricao}</p>
                        </div>
                    </div>

                    <button
                        type="button"

                        className="fechar-modal-movimentacao"

                        onClick={onClose}

                        disabled={salvando}
                    >
                        <RiCloseLine />
                    </button>
                </div>

                {/* FORM */}

                <form
                    className="conteudo-modal-movimentacao"

                    onSubmit={enviarFormulario}
                >
                    {erro && <div className="erro-modal-movimentacao">{erro}</div>}

                    {/* VALOR */}

                    <div className="campo-modal-movimentacao">
                        <label htmlFor="valor-movimentacao">{labelValor}</label>

                        <div className="input-moeda-movimentacao">
                            <span>R$</span>

                            <input
                                id="valor-movimentacao"

                                type="text"

                                inputMode="decimal"

                                placeholder="0,00"

                                value={valor}

                                onChange={(event) => setValor(event.target.value)}

                                autoFocus

                                disabled={salvando}
                            />
                        </div>
                    </div>

                    {/* REFERÊNCIA DO RENDIMENTO */}

                    {rendimento && (
                        <div className="campo-modal-movimentacao">
                            <label htmlFor="referencia-rendimento">Mês de referência</label>

                            <input
                                id="referencia-rendimento"

                                type="month"

                                value={referencia}

                                onChange={(event) => setReferencia(event.target.value)}

                                disabled={salvando}
                            />
                        </div>
                    )}

                    {/* AVISO */}

                    <div className={`aviso-modal-movimentacao ${classeTipo}`}>{textoAviso}</div>

                    {/* BOTÕES */}

                    <div className="acoes-modal-movimentacao">
                        <button
                            type="button"

                            className="cancelar-modal-movimentacao"

                            onClick={onClose}

                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"

                            className={`salvar-modal-movimentacao ${classeTipo}`}

                            disabled={salvando}
                        >
                            {salvando ? "Salvando..." : textoBotao}
                        </button>
                    </div>
                </form>
        </ModalOverlay>
    );
}

export default FormMovimentacaoInvestimento;
