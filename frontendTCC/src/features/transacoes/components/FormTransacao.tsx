import { useEffect, useRef, useState, type FormEvent } from "react";

import {
    RiCloseLine,
    RiCalendarLine,
    RiPriceTag3Line,
    RiBankCardLine,
    RiFileTextLine,
    RiMoneyDollarCircleLine,
    RiAttachmentLine,
    RiCloseCircleLine,
    RiArrowDownSLine,
    RiCheckLine,
    RiArrowLeftRightLine,
} from "react-icons/ri";

import "../styles/formTransacao.css";

import { NumericFormat } from "react-number-format";

import useFecharComEsc from "../../../hooks/useFecharComEsc";
import { useAlert } from "../../../context/AlertContext";
import { useUsuarioLogado } from "../../../context/AuthContext";
import { renderizarIcone } from "../../../utils/renderizarIcone";

type TipoTransacao = "RECEITA" | "DESPESA";

type Categoria = {
    id: number;
    nome: string;
    tipo: TipoTransacao;
    cor: string | null;
    icone: string | null;
};

type TransacaoEdicao = {
    id: number;
    descricao: string;
    tipo: "RECEITA" | "DESPESA";

    categoriaId: number;
    categoria: string;
    corCategoria: string;
    iconeCategoria: string;

    valor: number;
    metodo: string;
    status: string;
    data: string;
    urlComprovante: string | null;
};

type FormTransacaoProps = {
    tipo: "RECEITA" | "DESPESA";

    transacao?: TransacaoEdicao | null;

    onClose: () => void;

    onSalvar: () => void;
};

type DadosFormulario = {
    descricao: string;
    valor: string;
    data: string;
    categoriaId: string;
    metodo: string;
    status: string;
};

type DadosComprovanteIA = {
    descricao: string;
    valor: number;
    data: string;
    metodoPagamento: string;
};

const dadosIniciais: DadosFormulario = {
    descricao: "",
    valor: "",
    data: new Date().toISOString().split("T")[0],
    categoriaId: "",
    metodo: "PIX",
    status: "PAGO",
};

const metodosPagamento = [
    {
        valor: "PIX",
        nome: "Pix",
        icone: <RiBankCardLine />,
    },
    {
        valor: "BOLETO",
        nome: "Boleto",
        icone: <RiFileTextLine />,
    },
    {
        valor: "CARTAO_CREDITO",
        nome: "Cartão de crédito",
        icone: <RiBankCardLine />,
    },
    {
        valor: "DEBITO",
        nome: "Cartão de débito",
        icone: <RiBankCardLine />,
    },
    {
        valor: "DINHEIRO",
        nome: "Dinheiro",
        icone: <RiMoneyDollarCircleLine />,
    },
    {
        valor: "TRANSFERENCIA",
        nome: "Transferência",
        icone: <RiArrowLeftRightLine />,
    },
];

const statusPagamento = [
    {
        valor: "PAGO",
        nome: "Pago",
    },
    {
        valor: "PENDENTE",
        nome: "Pendente",
    },
];

function FormTransacao({ tipo, transacao, onClose, onSalvar }: FormTransacaoProps) {
    const { showAlert } = useAlert();

    const { id: USUARIO_ID } = useUsuarioLogado();

    const [dados, setDados] = useState<DadosFormulario>(dadosIniciais);

    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const [salvando, setSalvando] = useState(false);

    const [carregandoCategorias, setCarregandoCategorias] = useState(false);

    const [erro, setErro] = useState("");

    const [arquivo, setArquivo] = useState<File | null>(null);

    const [removerComprovante, setRemoverComprovante] = useState(false);

    const [categoriaAberta, setCategoriaAberta] = useState(false);

    const categoriaRef = useRef<HTMLDivElement>(null);

    const categoriaSelecionada = categorias.find(
        (categoria) => categoria.id.toString() === dados.categoriaId,
    );

    const metodoRef = useRef<HTMLDivElement>(null);

    const statusRef = useRef<HTMLDivElement>(null);

    const [metodoAberto, setMetodoAberto] = useState(false);

    const [statusAberto, setStatusAberto] = useState(false);

    const metodoSelecionado = metodosPagamento.find((metodo) => metodo.valor === dados.metodo);

    const statusSelecionado = statusPagamento.find((status) => status.valor === dados.status);

    const inputIARef = useRef<HTMLInputElement>(null);

    const [analisandoIA, setAnalisandoIA] = useState(false);

    useEffect(() => {
        function fecharAoClicarFora(evento: MouseEvent) {
            if (categoriaRef.current && !categoriaRef.current.contains(evento.target as Node)) {
                setCategoriaAberta(false);
            }
        }

        document.addEventListener("mousedown", fecharAoClicarFora);

        return () => {
            document.removeEventListener("mousedown", fecharAoClicarFora);
        };
    }, []);

    async function buscarCategorias() {
        try {
            setCarregandoCategorias(true);
            setErro("");

            const response = await fetch(
                `http://localhost:8080/categorias/usuario/${USUARIO_ID}/todas`,
            );

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(mensagem || "Não foi possível carregar as categorias.");
            }

            const resposta: Categoria[] = await response.json();

            const categoriasDoTipo = resposta.filter((categoria) => categoria.tipo === tipo);

            setCategorias(categoriasDoTipo);

            if (!transacao) {
                setDados((dadosAtuais) => ({
                    ...dadosAtuais,
                    categoriaId: "",
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);

            setCategorias([]);

            setErro("Não foi possível carregar as categorias.");
        } finally {
            setCarregandoCategorias(false);
        }
    }

    useEffect(() => {
        buscarCategorias();
    }, [tipo]);

    useFecharComEsc({
        travarScroll: true,
        onFechar: onClose,
    });

    function atualizarCampo(campo: keyof DadosFormulario, valor: string) {
        setDados((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor,
        }));

        if (erro) {
            setErro("");
        }
    }

    function formularioValido() {
        const valorNumerico = Number(dados.valor);

        return (
            dados.descricao.trim().length >= 2 &&
            valorNumerico > 0 &&
            Boolean(dados.data) &&
            Boolean(dados.categoriaId) &&
            Boolean(dados.metodo) &&
            Boolean(dados.status)
        );
    }

    async function salvarTransacao(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        if (!formularioValido()) {
            setErro("Preencha corretamente todos os campos obrigatórios.");

            return;
        }

        try {
            setSalvando(true);
            setErro("");

            const dadosTransacao = {
                usuarioId: USUARIO_ID,
                categoriaId: Number(dados.categoriaId),
                descricao: dados.descricao.trim(),
                valor: Number(dados.valor),
                metodo: dados.metodo,
                status: dados.status,
                data: dados.data,
                removerComprovante,
            };

            const formData = new FormData();

            formData.append(
                "dados",
                new Blob([JSON.stringify(dadosTransacao)], {
                    type: "application/json",
                }),
            );

            if (arquivo) {
                formData.append("comprovante", arquivo);
            }

            const editando = Boolean(transacao);

            const url = editando
                ? `http://localhost:8080/transacoes/${transacao!.id}?usuarioId=${USUARIO_ID}`
                : "http://localhost:8080/transacoes";

            const metodoHttp = editando ? "PUT" : "POST";

            const response = await fetch(url, {
                method: metodoHttp,
                body: formData,
            });

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(
                    mensagem ||
                        (editando
                            ? "Não foi possível atualizar a transação."
                            : "Não foi possível cadastrar a transação."),
                );
            }

            await onSalvar();

            onClose();
        } catch (error) {
            console.error("Erro ao salvar transação:", error);

            setErro(
                error instanceof Error
                    ? error.message
                    : transacao
                      ? "Erro ao atualizar a transação."
                      : "Erro ao cadastrar a transação.",
            );
        } finally {
            setSalvando(false);
        }
    }

    function clicarNoFundo(evento: React.MouseEvent<HTMLDivElement>) {
        if (evento.target === evento.currentTarget && !salvando) {
            onClose();
        }
    }

    useEffect(() => {
        if (transacao) {
            setDados({
                descricao: transacao.descricao,

                categoriaId: String(transacao.categoriaId),

                valor: String(transacao.valor),

                metodo: transacao.metodo,

                status: transacao.status,

                data: transacao.data,
            });

            setArquivo(null);

            setRemoverComprovante(false);

            return;
        }

        setDados(dadosIniciais);

        setArquivo(null);

        setRemoverComprovante(false);
    }, [transacao]);

    async function analisarComprovanteIA(arquivo: File) {
        try {
            setAnalisandoIA(true);

            const formData = new FormData();

            formData.append("comprovante", arquivo);

            const resposta = await fetch("http://localhost:8080/comprovantes/analisar-arquivo", {
                method: "POST",
                body: formData,
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível analisar o comprovante.");
            }

            const resultado: DadosComprovanteIA = await resposta.json();

            setDados((atual) => ({
                ...atual,

                descricao: resultado.descricao || atual.descricao,

                valor: resultado.valor ? String(resultado.valor) : atual.valor,

                data: resultado.data || atual.data,

                metodo: resultado.metodoPagamento || atual.metodo,
            }));

            setArquivo(arquivo);
        } catch (erro) {
            console.error(erro);

            showAlert({
                type: "error",
                title: "Não foi possível analisar",
                message: "Não foi possível analisar o comprovante.",
            });
        } finally {
            setAnalisandoIA(false);

            if (inputIARef.current) {
                inputIARef.current.value = "";
            }
        }
    }

    return (
        <div className="form-transacao-overlay" onMouseDown={clicarNoFundo}>
            <section
                className={`form-transacao-modal ${
                    tipo === "RECEITA" ? "form-receita" : "form-despesa"
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="titulo-form-transacao"
            >
                <header className="form-transacao-cabecalho">
                    <div>
                        <span className="form-transacao-subtitulo">Adicionar movimentação</span>

                        <h2 id="titulo-form-transacao">
                            {tipo === "RECEITA" ? "Nova receita" : "Nova despesa"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className="form-transacao-fechar"
                        onClick={onClose}
                        disabled={salvando}
                        aria-label="Fechar formulário"
                    >
                        <RiCloseLine />
                    </button>
                </header>

                <form className="form-transacao-conteudo" onSubmit={salvarTransacao}>
                    {!transacao && (
                        <div className="acao-ia-transacao">
                            <button
                                type="button"
                                className="botao-transacao-ia"
                                disabled={analisandoIA}
                                onClick={() => inputIARef.current?.click()}
                            >
                                {analisandoIA
                                    ? "Analisando comprovante..."
                                    : "Analisar comprovante com IA"}
                            </button>

                            <input
                                ref={inputIARef}
                                type="file"
                                hidden
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(event) => {
                                    const arquivo = event.target.files?.[0];

                                    if (arquivo) {
                                        analisarComprovanteIA(arquivo);
                                    }
                                }}
                            />
                        </div>
                    )}

                    {erro && <div className="form-transacao-erro">{erro}</div>}

                    <div className="form-transacao-campo campo-largo">
                        <label htmlFor="descricao">Descrição</label>

                        <div className="form-transacao-input">
                            <RiFileTextLine />

                            <input
                                id="descricao"
                                type="text"
                                value={dados.descricao}
                                onChange={(evento) =>
                                    atualizarCampo("descricao", evento.target.value)
                                }
                                placeholder={
                                    tipo === "RECEITA"
                                        ? "Ex.: Salário mensal"
                                        : "Ex.: Compra no mercado"
                                }
                                maxLength={100}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-transacao-campo campo-largo">
                        <label htmlFor="valor">Valor</label>

                        <div className="form-transacao-input input-valor">
                            <span>R$</span>

                            <NumericFormat
                                id="valor"
                                thousandSeparator="."
                                decimalSeparator=","
                                decimalScale={2}
                                fixedDecimalScale
                                allowNegative={false}
                                value={dados.valor}
                                onValueChange={(valores) => atualizarCampo("valor", valores.value)}
                                placeholder="0,00"
                            />
                        </div>
                    </div>

                    <div className="form-transacao-grade">
                        <div className="form-transacao-campo">
                            <label htmlFor="data">Data</label>

                            <div className="form-transacao-input">
                                <RiCalendarLine />

                                <input
                                    id="data"
                                    type="date"
                                    value={dados.data}
                                    onChange={(evento) =>
                                        atualizarCampo("data", evento.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-transacao-campo" ref={categoriaRef}>
                            <label>Categoria</label>

                            <div className="categoria-select-personalizado">
                                <button
                                    type="button"
                                    className={`categoria-select-botao ${
                                        categoriaAberta ? "aberto" : ""
                                    }`}
                                    onClick={() => setCategoriaAberta((aberta) => !aberta)}
                                    disabled={carregandoCategorias}
                                >
                                    <div className="categoria-select-conteudo">
                                        {categoriaSelecionada ? (
                                            <>
                                                <span
                                                    className="categoria-select-icone"
                                                    style={{
                                                        color:
                                                            categoriaSelecionada.cor ?? "#16a34a",
                                                        backgroundColor: `${
                                                            categoriaSelecionada.cor ?? "#16a34a"
                                                        }18`,
                                                    }}
                                                >
                                                    {renderizarIcone(categoriaSelecionada.icone)}
                                                </span>

                                                <span className="categoria-select-nome">
                                                    {categoriaSelecionada.nome}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="categoria-select-icone sem-categoria">
                                                    <RiPriceTag3Line />
                                                </span>

                                                <span className="categoria-select-placeholder">
                                                    {carregandoCategorias
                                                        ? "Carregando..."
                                                        : "Selecione"}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <RiArrowDownSLine
                                        className={`categoria-select-seta ${
                                            categoriaAberta ? "girada" : ""
                                        }`}
                                    />
                                </button>

                                {categoriaAberta && (
                                    <div className="categoria-select-opcoes">
                                        {categorias.length === 0 ? (
                                            <div className="categoria-select-vazio">
                                                Nenhuma categoria encontrada
                                            </div>
                                        ) : (
                                            categorias.map((categoria) => {
                                                const selecionada =
                                                    dados.categoriaId === categoria.id.toString();

                                                const cor = categoria.cor ?? "#16a34a";

                                                return (
                                                    <button
                                                        key={categoria.id}
                                                        type="button"
                                                        className={`categoria-select-opcao ${
                                                            selecionada ? "selecionada" : ""
                                                        }`}
                                                        onClick={() => {
                                                            atualizarCampo(
                                                                "categoriaId",
                                                                categoria.id.toString(),
                                                            );

                                                            setCategoriaAberta(false);
                                                        }}
                                                    >
                                                        <span
                                                            className="categoria-select-icone"
                                                            style={{
                                                                color: cor,
                                                                backgroundColor: `${cor}18`,
                                                            }}
                                                        >
                                                            {renderizarIcone(categoria.icone)}
                                                        </span>

                                                        <span className="categoria-select-nome">
                                                            {categoria.nome}
                                                        </span>

                                                        {selecionada && (
                                                            <RiCheckLine className="categoria-select-check" />
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-transacao-campo" ref={metodoRef}>
                            <label>Método de pagamento</label>

                            <div className="select-personalizado">
                                <button
                                    type="button"
                                    className={`select-personalizado-botao ${
                                        metodoAberto ? "aberto" : ""
                                    }`}
                                    onClick={() => {
                                        setMetodoAberto((aberto) => !aberto);
                                        setStatusAberto(false);
                                        setCategoriaAberta(false);
                                    }}
                                >
                                    <div className="select-personalizado-conteudo">
                                        {metodoSelecionado ? (
                                            <>
                                                <span className="select-personalizado-icone">
                                                    {metodoSelecionado.icone}
                                                </span>

                                                <span>{metodoSelecionado.nome}</span>
                                            </>
                                        ) : (
                                            <span className="select-personalizado-placeholder">
                                                Selecione
                                            </span>
                                        )}
                                    </div>

                                    <RiArrowDownSLine
                                        className={`select-personalizado-seta ${
                                            metodoAberto ? "girada" : ""
                                        }`}
                                    />
                                </button>

                                {metodoAberto && (
                                    <div className="select-personalizado-opcoes">
                                        {metodosPagamento.map((metodo) => {
                                            const selecionado = dados.metodo === metodo.valor;

                                            return (
                                                <button
                                                    key={metodo.valor}
                                                    type="button"
                                                    className={`select-personalizado-opcao ${
                                                        selecionado ? "selecionada" : ""
                                                    }`}
                                                    onClick={() => {
                                                        atualizarCampo("metodo", metodo.valor);

                                                        setMetodoAberto(false);
                                                    }}
                                                >
                                                    <span className="select-personalizado-icone">
                                                        {metodo.icone}
                                                    </span>

                                                    <span className="select-personalizado-nome">
                                                        {metodo.nome}
                                                    </span>

                                                    {selecionado && (
                                                        <RiCheckLine className="select-personalizado-check" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-transacao-campo" ref={statusRef}>
                            <label>Status</label>

                            <div className="select-personalizado">
                                <button
                                    type="button"
                                    className={`select-personalizado-botao ${
                                        statusAberto ? "aberto" : ""
                                    }`}
                                    onClick={() => {
                                        setStatusAberto((aberto) => !aberto);
                                        setMetodoAberto(false);
                                        setCategoriaAberta(false);
                                    }}
                                >
                                    <div className="select-personalizado-conteudo">
                                        <span
                                            className={`status-select-indicador ${
                                                dados.status === "PAGO" ? "pago" : "pendente"
                                            }`}
                                        />

                                        <span>{statusSelecionado?.nome}</span>
                                    </div>

                                    <RiArrowDownSLine
                                        className={`select-personalizado-seta ${
                                            statusAberto ? "girada" : ""
                                        }`}
                                    />
                                </button>

                                {statusAberto && (
                                    <div className="select-personalizado-opcoes">
                                        {statusPagamento.map((status) => {
                                            const selecionado = dados.status === status.valor;

                                            return (
                                                <button
                                                    key={status.valor}
                                                    type="button"
                                                    className={`select-personalizado-opcao ${
                                                        selecionado ? "selecionada" : ""
                                                    }`}
                                                    onClick={() => {
                                                        atualizarCampo("status", status.valor);

                                                        setStatusAberto(false);
                                                    }}
                                                >
                                                    <span
                                                        className={`status-select-indicador ${
                                                            status.valor === "PAGO"
                                                                ? "pago"
                                                                : "pendente"
                                                        }`}
                                                    />

                                                    <span className="select-personalizado-nome">
                                                        {status.nome}
                                                    </span>

                                                    {selecionado && (
                                                        <RiCheckLine className="select-personalizado-check" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-transacao-campo campo-largo">
                        <label>Comprovante (opcional)</label>

                        <label htmlFor="comprovante" className="upload-comprovante">
                            <RiAttachmentLine />

                            <span>
                                {arquivo
                                    ? arquivo.name
                                    : transacao?.urlComprovante && !removerComprovante
                                      ? "Comprovante anexado"
                                      : "Selecionar comprovante"}
                            </span>

                            <input
                                id="comprovante"
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(evento) => {
                                    const novoArquivo = evento.target.files?.[0];

                                    if (novoArquivo) {
                                        setArquivo(novoArquivo);

                                        setRemoverComprovante(false);
                                    }
                                }}
                            />
                        </label>

                        {transacao?.urlComprovante && !arquivo && !removerComprovante && (
                            <a
                                href={transacao.urlComprovante}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="visualizar-comprovante"
                            >
                                <RiFileTextLine />
                                Visualizar comprovante anexado
                            </a>
                        )}

                        {(arquivo || (transacao?.urlComprovante && !removerComprovante)) && (
                            <button
                                type="button"
                                className="remover-comprovante"
                                onClick={() => {
                                    if (arquivo) {
                                        setArquivo(null);
                                        return;
                                    }

                                    setRemoverComprovante(true);
                                }}
                            >
                                <RiCloseCircleLine />
                                Remover comprovante
                            </button>
                        )}

                        {removerComprovante && !arquivo && (
                            <div className="comprovante-removido">
                                O comprovante será removido ao salvar.
                            </div>
                        )}
                    </div>

                    <footer className="form-transacao-acoes">
                        <button
                            type="button"
                            className="form-transacao-cancelar"
                            onClick={onClose}
                            disabled={salvando}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="form-transacao-salvar"
                            disabled={salvando || !formularioValido()}
                        >
                            {salvando
                                ? "Salvando..."
                                : tipo === "RECEITA"
                                  ? "Salvar receita"
                                  : "Salvar despesa"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}

export default FormTransacao;
