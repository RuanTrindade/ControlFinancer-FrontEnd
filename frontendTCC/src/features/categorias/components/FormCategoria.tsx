import { useEffect, useState, type FormEvent } from "react";

import { RiCloseLine, RiPriceTag3Line } from "react-icons/ri";

import "../styles/formCategoria.css";

import ModalOverlay from "../../../shared/components/ModalOverlay";
import { iconesCategorias } from "../../../utils/iconesCategorias";

type TipoCategoria = "RECEITA" | "DESPESA";

export type DadosCategoria = {
    nome: string;
    cor: string;
    icone: string;
    tipo: TipoCategoria;
};

type FormCategoriaProps = {
    aberto: boolean;
    tipo: TipoCategoria;
    carregando?: boolean;
    dadosEdicao?: DadosCategoria | null;
    onFechar: () => void;
    onSalvar: (dados: DadosCategoria) => void | Promise<void>;
};

const coresPrincipais = [
    "#00e915",
    "#a3a3a3",
    "#ff7a2f",
    "#2dd4d7",
    "#0ea5e9",
    "#9333ea",
    "#ef4444",
    "#facc15",
    "#f000c8",
    "#34e7b1",
    "#c8f232",
    "#ffbd2e",
];

const coresExtras = [
    "#dc2626",
    "#ea580c",
    "#d97706",
    "#ca8a04",
    "#65a30d",
    "#16a34a",
    "#059669",
    "#0d9488",
    "#0891b2",
    "#0284c7",
    "#2563eb",
    "#4f46e5",
    "#7c3aed",
    "#a21caf",
    "#db2777",
    "#e11d48",
    "#6b7280",
    "#374151",
    "#171717",
    "#92400e",
];

const iconesPrincipais = iconesCategorias.slice(0, 10);

const iconesExtras = iconesCategorias.slice(10);

function FormCategoria({
    aberto,
    tipo,
    carregando = false,
    dadosEdicao = null,
    onFechar,
    onSalvar,
}: FormCategoriaProps) {
    const [nome, setNome] = useState("");

    const [corSelecionada, setCorSelecionada] = useState(coresPrincipais[0]);

    const [iconeSelecionado, setIconeSelecionado] = useState(iconesPrincipais[0].nome);

    const [mostrarMaisCores, setMostrarMaisCores] = useState(false);

    const [mostrarMaisIcones, setMostrarMaisIcones] = useState(false);

    const [erro, setErro] = useState("");

    const editando = dadosEdicao !== null;

    useEffect(() => {
        if (!aberto) {
            return;
        }

        if (dadosEdicao) {
            setNome(dadosEdicao.nome);
            setCorSelecionada(dadosEdicao.cor);
            setIconeSelecionado(dadosEdicao.icone);
        } else {
            setNome("");
            setCorSelecionada(coresPrincipais[0]);
            setIconeSelecionado(iconesPrincipais[0].nome);
        }

        setErro("");
        setMostrarMaisCores(false);
        setMostrarMaisIcones(false);
    }, [aberto, dadosEdicao]);

    function fecharModal() {
        if (carregando) {
            return;
        }

        onFechar();
    }

    function selecionarCor(cor: string) {
        setCorSelecionada(cor);
        setMostrarMaisCores(false);
    }

    function selecionarIcone(nomeIcone: string) {
        setIconeSelecionado(nomeIcone);
        setMostrarMaisIcones(false);
    }

    function formularioValido() {
        return nome.trim().length >= 2 && Boolean(corSelecionada) && Boolean(iconeSelecionado);
    }

    async function salvarCategoria(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        const nomeTratado = nome.trim();

        if (nomeTratado.length < 2) {
            setErro("Informe um nome com pelo menos 2 caracteres.");

            return;
        }

        setErro("");

        await onSalvar({
            nome: nomeTratado,
            cor: corSelecionada,
            icone: iconeSelecionado,
            tipo,
        });
    }

    if (!aberto) {
        return null;
    }

    return (
        <ModalOverlay
            overlayClassName="form-categoria-overlay"
            modalClassName={`form-categoria-modal ${tipo === "RECEITA" ? "form-categoria-receita" : "form-categoria-despesa"}`}
            onClose={fecharModal}
            bloqueado={carregando}
            travarScroll
            ariaLabelledBy="titulo-form-categoria"
        >
            <header className="form-categoria-cabecalho">
                <div>
                    <span className="form-categoria-subtitulo">Gerenciar categoria</span>

                    <h2 id="titulo-form-categoria">
                        {editando ? "Editar categoria" : "Criar categoria"}
                    </h2>
                </div>

                <button
                    type="button"
                    className="form-categoria-fechar"
                    onClick={fecharModal}
                    disabled={carregando}
                    aria-label="Fechar formulário"
                >
                    <RiCloseLine />
                </button>
            </header>

            <form className="form-categoria-conteudo" onSubmit={salvarCategoria}>
                {erro && <div className="form-categoria-erro">{erro}</div>}

                <div className="form-categoria-campo">
                    <label htmlFor="nome-categoria">Nome da categoria</label>

                    <div className="form-categoria-input">
                        <RiPriceTag3Line />

                        <input
                            id="nome-categoria"
                            type="text"
                            value={nome}
                            placeholder="Ex.: Alimentação"
                            maxLength={50}
                            autoFocus
                            disabled={carregando}
                            onChange={(evento) => {
                                setNome(evento.target.value);

                                if (erro) {
                                    setErro("");
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="form-categoria-campo">
                    <label>Cor da categoria</label>

                    <div className="form-categoria-cores">
                        {coresPrincipais.map((cor) => (
                            <button
                                key={cor}
                                type="button"
                                className={`
                                        form-categoria-cor

                                        ${corSelecionada === cor ? "selecionada" : ""}
                                    `}
                                style={{
                                    backgroundColor: cor,
                                }}
                                onClick={() => selecionarCor(cor)}
                                disabled={carregando}
                                aria-label={`Selecionar cor ${cor}`}
                            >
                                {corSelecionada === cor && <span>✓</span>}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className={`
                                form-categoria-mais

                                ${mostrarMaisCores ? "aberto" : ""}
                            `}
                        onClick={() => {
                            setMostrarMaisCores((valor) => !valor);

                            setMostrarMaisIcones(false);
                        }}
                        disabled={carregando}
                    >
                        •••
                    </button>

                    {mostrarMaisCores && (
                        <div className="form-categoria-opcoes-extras form-categoria-cores-extras">
                            {coresExtras.map((cor) => (
                                <button
                                    key={cor}
                                    type="button"
                                    className={`
                                            form-categoria-cor

                                            ${corSelecionada === cor ? "selecionada" : ""}
                                        `}
                                    style={{
                                        backgroundColor: cor,
                                    }}
                                    onClick={() => selecionarCor(cor)}
                                    aria-label={`Selecionar cor ${cor}`}
                                >
                                    {corSelecionada === cor && <span>✓</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-categoria-campo">
                    <label>Ícone da categoria</label>

                    <div className="form-categoria-icones">
                        {iconesPrincipais.map((item) => (
                            <button
                                key={item.nome}
                                type="button"
                                className={`
                                        form-categoria-icone

                                        ${iconeSelecionado === item.nome ? "selecionado" : ""}
                                    `}
                                onClick={() => selecionarIcone(item.nome)}
                                disabled={carregando}
                                aria-label={`Selecionar ícone ${item.nome}`}
                            >
                                {item.componente}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className={`
                                form-categoria-mais

                                ${mostrarMaisIcones ? "aberto" : ""}
                            `}
                        onClick={() => {
                            setMostrarMaisIcones((valor) => !valor);

                            setMostrarMaisCores(false);
                        }}
                        disabled={carregando}
                    >
                        •••
                    </button>

                    {mostrarMaisIcones && (
                        <div className="form-categoria-opcoes-extras form-categoria-icones-extras">
                            {iconesExtras.map((item) => (
                                <button
                                    key={item.nome}
                                    type="button"
                                    className={`
                                            form-categoria-icone

                                            ${iconeSelecionado === item.nome ? "selecionado" : ""}
                                        `}
                                    onClick={() => selecionarIcone(item.nome)}
                                    aria-label={`Selecionar ícone ${item.nome}`}
                                >
                                    {item.componente}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="form-categoria-acoes">
                    <button
                        type="button"
                        className="form-categoria-cancelar"
                        onClick={fecharModal}
                        disabled={carregando}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="form-categoria-salvar"
                        disabled={carregando || !formularioValido()}
                    >
                        {carregando
                            ? "Salvando..."
                            : editando
                              ? "Salvar alterações"
                              : "Criar categoria"}
                    </button>
                </footer>
            </form>
        </ModalOverlay>
    );
}

export default FormCategoria;
