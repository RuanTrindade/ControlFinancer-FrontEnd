import { useEffect, useState, type FormEvent } from "react";

import { RiCloseLine, RiFlagLine, RiMoneyDollarCircleLine, RiCalendarLine } from "react-icons/ri";

import "../styles/formCriarObjetivo.css";

import ModalOverlay from "../../../shared/components/ModalOverlay";
import { iconesObjetivos, mapaIconesCategorias } from "../../../utils/iconesCategorias";
import { BiCategory } from "react-icons/bi";

export type DadosNovoObjetivo = {
    nome: string;
    valorObjetivo: number;
    dataFinal: string;
    cor: string;
    icone: string;
    imagem: string | null;
};

type Props = {
    aberto: boolean;
    carregando?: boolean;

    onFechar: () => void;

    onSalvar: (dados: DadosNovoObjetivo) => void | Promise<void>;
};

const coresPrincipais = [
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

export function renderizarIcone(nome: string | null) {
    if (!nome) {
        return <BiCategory />;
    }

    return mapaIconesCategorias[nome] ?? <BiCategory />;
}

function FormCriarObjetivo({ aberto, carregando = false, onFechar, onSalvar }: Props) {
    const [nome, setNome] = useState("");

    const [valor, setValor] = useState("");

    const [dataFinal, setDataFinal] = useState("");

    const [corSelecionada, setCorSelecionada] = useState(coresPrincipais[0]);

    const [iconeSelecionado, setIconeSelecionado] = useState("");

    const [erro, setErro] = useState("");

    useEffect(() => {
        if (!aberto) {
            return;
        }

        setNome("");
        setValor("");
        setDataFinal("");

        setCorSelecionada(coresPrincipais[0]);

        setIconeSelecionado("");

        setErro("");
    }, [aberto]);

    function fecharModal() {
        if (carregando) {
            return;
        }

        onFechar();
    }

    const valorNumerico = Number(valor.replace(",", "."));

    function formularioValido() {
        return (
            nome.trim().length >= 2 &&
            valorNumerico > 0 &&
            Boolean(dataFinal) &&
            Boolean(corSelecionada) &&
            Boolean(iconeSelecionado)
        );
    }

    async function salvarObjetivo(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const nomeTratado = nome.trim();

        if (nomeTratado.length < 2) {
            setErro("Informe um nome com pelo menos 2 caracteres.");

            return;
        }

        if (!valorNumerico || valorNumerico <= 0) {
            setErro("Informe um valor válido para o objetivo.");

            return;
        }

        if (!dataFinal) {
            setErro("Informe a data final do objetivo.");

            return;
        }

        if (!iconeSelecionado) {
            setErro("Selecione um ícone para o objetivo.");

            return;
        }

        setErro("");

        await onSalvar({
            nome: nomeTratado,

            valorObjetivo: valorNumerico,

            dataFinal,

            cor: corSelecionada,

            icone: iconeSelecionado,

            imagem: imagemPorIcone[iconeSelecionado] ?? imagemPorIcone.RiMoneyDollarCircleLine,
        });
    }

    if (!aberto) {
        return null;
    }

    return (
        <ModalOverlay
            overlayClassName="form-objetivo-overlay"
            modalClassName="form-objetivo-modal"
            onClose={fecharModal}
            bloqueado={carregando}
            travarScroll
        >
            {/* CABEÇALHO */}

            <header className="form-objetivo-cabecalho">
                    <div>
                        <span className="form-objetivo-subtitulo">Novo objetivo</span>

                        <h2>Criar objetivo</h2>
                    </div>

                    <button
                        type="button"
                        className="form-objetivo-fechar"
                        onClick={fecharModal}
                        disabled={carregando}
                    >
                        <RiCloseLine />
                    </button>
                </header>

                <form className="form-objetivo-conteudo" onSubmit={salvarObjetivo}>
                    {erro && <div className="form-objetivo-erro">{erro}</div>}

                    {/* NOME */}

                    <div className="form-objetivo-campo">
                        <label htmlFor="nome-objetivo">Nome do objetivo</label>

                        <div className="form-objetivo-input">
                            <RiFlagLine />

                            <input
                                id="nome-objetivo"
                                type="text"
                                value={nome}
                                placeholder="Ex.: Novo carro"
                                maxLength={50}
                                autoFocus
                                disabled={carregando}
                                onChange={(evento) => {
                                    setNome(evento.target.value);

                                    setErro("");
                                }}
                            />
                        </div>
                    </div>

                    {/* VALOR + DATA */}

                    <div className="form-objetivo-linha">
                        <div className="form-objetivo-campo">
                            <label htmlFor="valor-objetivo">Valor da meta</label>

                            <div className="form-objetivo-input">
                                <RiMoneyDollarCircleLine />

                                <input
                                    id="valor-objetivo"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={valor}
                                    placeholder="0,00"
                                    disabled={carregando}
                                    onChange={(evento) => {
                                        setValor(evento.target.value);

                                        setErro("");
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-objetivo-campo">
                            <label htmlFor="data-objetivo">Data final</label>

                            <div className="form-objetivo-input">
                                <RiCalendarLine />

                                <input
                                    id="data-objetivo"
                                    type="date"
                                    value={dataFinal}
                                    disabled={carregando}
                                    onChange={(evento) => {
                                        setDataFinal(evento.target.value);

                                        setErro("");
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CORES */}

                    <div className="form-objetivo-campo">
                        <label>Cor do objetivo</label>

                        <div className="form-objetivo-cores">
                            {coresPrincipais.map((cor) => (
                                <button
                                    key={cor}
                                    type="button"
                                    className={`
                                                form-objetivo-cor
                                                ${corSelecionada === cor ? "selecionada" : ""}
                                            `}
                                    style={{
                                        backgroundColor: cor,
                                    }}
                                    onClick={() => setCorSelecionada(cor)}
                                    disabled={carregando}
                                >
                                    {corSelecionada === cor && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ÍCONES */}

                    <div className="form-objetivo-campo">
                        <label>Ícone do objetivo</label>

                        <div className="form-objetivo-icones">
                            {iconesObjetivos.map((item) => (
                                <button
                                    key={item.nome}
                                    type="button"
                                    className={`
                form-objetivo-icone
                ${iconeSelecionado === item.nome ? "selecionado" : ""}
            `}
                                    onClick={() => setIconeSelecionado(item.nome)}
                                    disabled={carregando}
                                >
                                    {item.componente}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AÇÕES */}

                    <footer className="form-objetivo-acoes">
                        <button
                            type="button"
                            className="form-objetivo-cancelar"
                            onClick={fecharModal}
                            disabled={carregando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="form-objetivo-salvar"
                            disabled={carregando || !formularioValido()}
                        >
                            {carregando ? "Criando..." : "Criar objetivo"}
                        </button>
                    </footer>
                </form>
        </ModalOverlay>
    );
}

export default FormCriarObjetivo;
