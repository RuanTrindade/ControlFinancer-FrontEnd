import { useState } from "react";

import { RiCloseLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import { editarCategoriaPlanejamento } from "../services/planejamentoCategoriaService";

import "../styles/formEditarCategoriaPlanejamento.css";

import ModalOverlay from "../../../shared/components/ModalOverlay";

type Props = {
    id: number;

    nome: string;

    limite: number;

    usuarioId: number;

    valorDisponivel: number;

    totalCategoriasPlanejadas: number;

    onClose: () => void;

    onSalvar: () => Promise<void>;
};

function FormEditarCategoriaPlanejamento({
    id,
    nome,
    limite,
    usuarioId,
    valorDisponivel,
    totalCategoriasPlanejadas,
    onClose,
    onSalvar,
}: Props) {
    const [valor, setValor] = useState(limite.toFixed(2));

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");

    const valorNumerico = Number(valor) || 0;

    /*
     * Total das OUTRAS categorias.
     *
     * Tiramos o valor antigo desta categoria,
     * porque ela está sendo substituída.
     */
    const totalOutrasCategorias = totalCategoriasPlanejadas - limite;

    /*
     * Novo total das categorias,
     * usando o novo valor digitado.
     */
    const novoTotalCategorias = totalOutrasCategorias + valorNumerico;

    /*
     * O total real do planejamento.
     *
     * Nunca fica abaixo do valor disponível
     * originalmente.
     */
    const novoTotalPlanejamento = Math.max(valorDisponivel, novoTotalCategorias);

    /*
     * Quanto ainda sobra sem categoria.
     */
    const categoriasRestantes = Math.max(valorDisponivel - novoTotalCategorias, 0);

    /*
     * Quanto passou do orçamento original.
     */
    const valorExcedente = Math.max(novoTotalCategorias - valorDisponivel, 0);

    async function salvar() {
        if (valorNumerico <= 0 || salvando) {
            return;
        }

        try {
            setSalvando(true);
            setErro("");

            await editarCategoriaPlanejamento(id, usuarioId, valorNumerico);

            await onSalvar();

            onClose();
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível editar a categoria.",
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <ModalOverlay
            overlayClassName="editar-categoria-overlay"
            modalClassName="editar-categoria-modal"
            onClose={onClose}
        >
                <header>
                    <div>
                        <span>Planejamento mensal</span>

                        <h2>Editar categoria</h2>
                    </div>

                    <button type="button" onClick={onClose}>
                        <RiCloseLine />
                    </button>
                </header>

                <div className="editar-categoria-conteudo">
                    <div className="editar-categoria-nome">
                        <span>Categoria</span>

                        <strong>{nome}</strong>
                    </div>

                    <label>Valor planejado</label>

                    <div className="editar-categoria-input">
                        <NumericFormat
                            thousandSeparator="."
                            decimalSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                            allowNegative={false}
                            prefix="R$ "
                            value={valor}
                            onValueChange={(valores) => setValor(valores.value)}
                        />
                    </div>

                    <div className="editar-categoria-resumo">
                        <div>
                            <span>Novo total planejado</span>

                            <strong>
                                R${" "}
                                {novoTotalPlanejamento.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </strong>
                        </div>

                        <div>
                            <span>Categorias restantes</span>

                            <strong>
                                R${" "}
                                {categoriasRestantes.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </strong>
                        </div>
                    </div>

                    {valorExcedente > 0 && (
                        <div className="editar-categoria-aviso">
                            O planejamento ficará{" "}
                            <strong>
                                R${" "}
                                {valorExcedente.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </strong>{" "}
                            acima do valor disponível.
                        </div>
                    )}

                    {erro && <div className="editar-categoria-erro">{erro}</div>}

                    <footer>
                        <button
                            type="button"
                            className="editar-categoria-cancelar"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="editar-categoria-salvar"
                            disabled={salvando || valorNumerico <= 0}
                            onClick={salvar}
                        >
                            {salvando ? "Salvando..." : "Salvar"}
                        </button>
                    </footer>
                </div>
        </ModalOverlay>
    );
}

export default FormEditarCategoriaPlanejamento;
