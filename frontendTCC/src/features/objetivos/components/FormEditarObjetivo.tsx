import { useEffect, useState, type FormEvent } from "react";

import { RiCalendarLine, RiCloseLine, RiFlagLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import type { Objetivo } from "../types/objetivo";

import { atualizarObjetivo } from "../services/objetivoService";

import { iconesObjetivos } from "../../../utils/iconesCategorias";

import ModalOverlay from "../../../shared/components/ModalOverlay";

import "../styles/formEditarObjetivo.css";

type Props = {
    aberto: boolean;

    objetivo: Objetivo;

    usuarioId: number;

    onClose: () => void;

    onSalvar: () => Promise<void>;
};

const coresObjetivos = [
    "#22c55e",
    "#16a34a",
    "#0ea5e9",
    "#2563eb",
    "#6366f1",
    "#8b5cf6",
    "#9333ea",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#14b8a6",
    "#06b6d4",
    "#64748b",
    "#374151",
];

const imagemPorIcone: Record<string, string> = {
    RiCarLine:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",

    RiHome4Line:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",

    RiPlaneLine:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",

    RiBookOpenLine:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",

    RiComputerLine:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=900&q=80",

    RiMoneyDollarCircleLine:
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=900&q=80",

    RiTrophyLine:
        "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",

    RiHeartLine:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
};

function FormEditarObjetivo({ aberto, objetivo, usuarioId, onClose, onSalvar }: Props) {
    const [nome, setNome] = useState("");

    const [valor, setValor] = useState("");

    const [dataFinal, setDataFinal] = useState("");

    const [corSelecionada, setCorSelecionada] = useState("");

    const [iconeSelecionado, setIconeSelecionado] = useState("");

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!aberto) {
            return;
        }

        setNome(objetivo.nome);

        setValor(objetivo.valorObjetivo.toString());

        setDataFinal(objetivo.dataFinal);

        setCorSelecionada(objetivo.cor ?? coresObjetivos[0]);

        setIconeSelecionado(objetivo.icone ?? "");

        setErro("");
    }, [aberto, objetivo]);

    const valorNumerico = Number(valor) || 0;

    const valorMinimo = objetivo.valorAtual;

    const formularioValido =
        nome.trim().length >= 2 &&
        valorNumerico >= valorMinimo &&
        valorNumerico > 0 &&
        Boolean(dataFinal) &&
        Boolean(corSelecionada) &&
        Boolean(iconeSelecionado);

    async function salvar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (valorNumerico < valorMinimo) {
            setErro(
                `A meta não pode ser menor que o valor já guardado de R$ ${valorMinimo.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    },
                )}.`,
            );

            return;
        }

        if (!iconeSelecionado) {
            setErro("Selecione um ícone para o objetivo.");

            return;
        }

        try {
            setSalvando(true);
            setErro("");

            await atualizarObjetivo(objetivo.id, usuarioId, {
                nome: nome.trim(),

                valorObjetivo: valorNumerico,

                dataFinal,

                cor: corSelecionada,

                icone: iconeSelecionado,

                imagem: imagemPorIcone[iconeSelecionado] ?? objetivo.imagem,
            });

            await onSalvar();

            onClose();
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível atualizar o objetivo.",
            );
        } finally {
            setSalvando(false);
        }
    }

    if (!aberto) {
        return null;
    }

    function fecharModal() {
        if (!salvando) {
            onClose();
        }
    }

    return (
        <ModalOverlay
            overlayClassName="form-editar-objetivo-overlay"
            modalClassName="form-editar-objetivo-modal"
            onClose={fecharModal}
            bloqueado={salvando}
        >
            <header className="form-editar-objetivo-cabecalho">
                    <div>
                        <span>Gerenciar objetivo</span>

                        <h2>Editar objetivo</h2>
                    </div>

                    <button type="button" onClick={onClose} disabled={salvando}>
                        <RiCloseLine />
                    </button>
                </header>

                <form className="form-editar-objetivo-conteudo" onSubmit={salvar}>
                    {erro && <div className="form-editar-objetivo-erro">{erro}</div>}

                    <div className="form-editar-objetivo-campo">
                        <label>Nome do objetivo</label>

                        <div className="form-editar-objetivo-input">
                            <RiFlagLine />

                            <input
                                value={nome}
                                maxLength={50}
                                disabled={salvando}
                                onChange={(evento) => setNome(evento.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-editar-objetivo-linha">
                        <div className="form-editar-objetivo-campo">
                            <label>Valor da meta</label>

                            <div className="form-editar-objetivo-input">
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

                            <small className="form-editar-objetivo-minimo">
                                Mínimo permitido:{" "}
                                <strong>
                                    R${" "}
                                    {valorMinimo.toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </strong>
                            </small>
                        </div>

                        <div className="form-editar-objetivo-campo">
                            <label>Data final</label>

                            <div className="form-editar-objetivo-input">
                                <RiCalendarLine />

                                <input
                                    type="date"
                                    value={dataFinal}
                                    disabled={salvando}
                                    onChange={(evento) => setDataFinal(evento.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-editar-objetivo-campo">
                        <label>Cor do objetivo</label>

                        <div className="form-editar-objetivo-cores">
                            {coresObjetivos.map((cor) => (
                                <button
                                    key={cor}
                                    type="button"
                                    className={`
                                            form-editar-objetivo-cor
                                            ${corSelecionada === cor ? "selecionada" : ""}
                                        `}
                                    style={{
                                        backgroundColor: cor,
                                    }}
                                    onClick={() => setCorSelecionada(cor)}
                                    disabled={salvando}
                                >
                                    {corSelecionada === cor && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-editar-objetivo-campo">
                        <label>Ícone do objetivo</label>

                        <div className="form-editar-objetivo-icones">
                            {iconesObjetivos.map((item) => (
                                <button
                                    key={item.nome}
                                    type="button"
                                    className={`
                                            form-editar-objetivo-icone
                                            ${iconeSelecionado === item.nome ? "selecionado" : ""}
                                        `}
                                    onClick={() => setIconeSelecionado(item.nome)}
                                    disabled={salvando}
                                >
                                    {item.componente}
                                </button>
                            ))}
                        </div>
                    </div>

                    <footer>
                        <button
                            type="button"
                            className="form-editar-objetivo-cancelar"
                            onClick={onClose}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="form-editar-objetivo-salvar"
                            disabled={salvando || !formularioValido}
                        >
                            {salvando ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </footer>
                </form>
        </ModalOverlay>
    );
}

export default FormEditarObjetivo;
