import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import DashboardLayout from "../../../layouts/DashboardLayout";

import { useUsuarioLogado } from "../../../context/AuthContext";

import { NumericFormat } from "react-number-format";

import {
    RiAddLine,
    RiDeleteBin6Line,
    RiEdit2Line,
    RiAttachmentLine,
    RiFilter3Fill,
    RiSubtractLine,
    RiCloseLine,
    RiLock2Line,
    RiInformationLine,
} from "react-icons/ri";

import "../styles/transacoes.css";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";

import FormTransacao from "../components/FormTransacao";

import type { Transacao } from "../types/Transacao";

import { renderizarIcone } from "../../../utils/renderizarIcone";
import { useMes } from "../../../context/MesContext";

type FiltrosTransacao = {
    tipo: string;
    descricao: string;
    categoriaId: string;
    status: string;
    metodoPagamento: string;
    dataInicio: string;
    dataFim: string;
    valorMin: string;
    valorMax: string;
};

type CategoriaFiltro = {
    id: number;
    nome: string;
};

function Transacoes() {
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalElementos, setTotalElementos] = useState(0);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const tamanhoPagina = 7;

    const [transacaoEditando, setTransacaoEditando] = useState<Transacao | null>(null);

    const [transacaoParaExcluir, setTransacaoParaExcluir] = useState<Transacao | null>(null);

    const [transacaoProtegida, setTransacaoProtegida] = useState<Transacao | null>(null);

    const [excluindo, setExcluindo] = useState(false);

    const [comprovanteSelecionado, setComprovanteSelecionado] = useState<string | null>(null);

    const [transacoes, setTransacoes] = useState<Transacao[]>([]);

    const [loading, setLoading] = useState(false);

    const [formularioAberto, setFormularioAberto] = useState(false);

    const [tipoFormulario, setTipoFormulario] = useState<"RECEITA" | "DESPESA">("RECEITA");

    const { referenciaAtual, mes: mesSelecionado, ano: anoSelecionado } = useMes();

    const { id: USUARIO_ID } = useUsuarioLogado();

    function formatarDataInput(data: Date) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }

    function obterPeriodoMes() {
        const primeiroDia = new Date(anoSelecionado, mesSelecionado - 1, 1);

        const ultimoDia = new Date(anoSelecionado, mesSelecionado, 0);

        return {
            dataInicio: formatarDataInput(primeiroDia),
            dataFim: formatarDataInput(ultimoDia),
        };
    }

    const [filtroAberto, setFiltroAberto] = useState(false);

    const filtrosVazios: FiltrosTransacao = {
        tipo: "",
        descricao: "",
        categoriaId: "",
        status: "",
        metodoPagamento: "",
        dataInicio: "",
        dataFim: "",
        valorMin: "",
        valorMax: "",
    };

    const [categoriasFiltro, setCategoriasFiltro] = useState<CategoriaFiltro[]>([]);

    const [filtros, setFiltros] = useState<FiltrosTransacao>(filtrosVazios);

    const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosTransacao | null>(null);

    const [aplicandoFiltro, setAplicandoFiltro] = useState(false);
    function abrirFormulario(tipo: "RECEITA" | "DESPESA") {
        setTipoFormulario(tipo);
        setFormularioAberto(true);
    }

    function corIcone(background: string | null) {
        if (!background) return "#000000";

        let hex = background.replace("#", "").trim();

        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((caractere) => caractere + caractere)
                .join("");
        }

        if (hex.length !== 6) {
            return "#000000";
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;

        return luminancia > 186 ? "#000000" : "#ffffff";
    }

    function formatarMetodo(metodo: string) {
        const metodos: Record<string, string> = {
            PIX: "Pix",
            BOLETO: "Boleto",
            CARTAO_CREDITO: "Cartão de crédito",
            CARTAO_DEBITO: "Cartão de débito",
            DINHEIRO: "Dinheiro",
            TRANSFERENCIA: "Transferência",
        };

        return metodos[metodo] ?? metodo;
    }

    function formatarData(data: string) {
        if (!data) {
            return "-";
        }

        return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    async function buscarTransacoes(pagina = paginaAtual) {
        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:8080/transacoes/usuario/${USUARIO_ID}?mes=${mesSelecionado}&ano=${anoSelecionado}&page=${pagina}&size=${tamanhoPagina}`,
            );

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(`Erro ${response.status}: ${mensagem}`);
            }

            const data = await response.json();

            setTransacoes(data.content);
            setTotalPaginas(data.totalPages);
            setTotalElementos(data.totalElements);
            setPaginaAtual(data.number);

            console.log(data);

            setTransacoes(data.content);
        } catch (erro) {
            console.error("Erro ao buscar transações:", erro);
        } finally {
            setLoading(false);
        }
    }

    async function buscarTransacoesFiltradas(pagina = paginaAtual, filtrosBusca = filtros) {
        try {
            setLoading(true);

            const parametros = new URLSearchParams();

            parametros.append("usuarioId", USUARIO_ID.toString());
            parametros.append("page", pagina.toString());
            parametros.append("size", tamanhoPagina.toString());

            if (filtrosBusca.tipo) {
                parametros.append("tipo", filtrosBusca.tipo);
            }

            if (filtrosBusca.descricao.trim()) {
                parametros.append("descricao", filtrosBusca.descricao.trim());
            }

            if (filtrosBusca.categoriaId) {
                parametros.append("categoriaId", filtrosBusca.categoriaId);
            }

            if (filtrosBusca.status) {
                parametros.append("status", filtrosBusca.status);
            }

            if (filtrosBusca.metodoPagamento) {
                parametros.append("metodoPagamento", filtrosBusca.metodoPagamento);
            }

            if (filtrosBusca.dataInicio) {
                parametros.append("dataInicio", filtrosBusca.dataInicio);
            }

            if (filtrosBusca.dataFim) {
                parametros.append("dataFim", filtrosBusca.dataFim);
            }

            if (filtrosBusca.valorMin) {
                parametros.append("valorMin", filtrosBusca.valorMin);
            }

            if (filtrosBusca.valorMax) {
                parametros.append("valorMax", filtrosBusca.valorMax);
            }

            const url = `http://localhost:8080/transacoes/filtrar?${parametros.toString()}`;

            console.log(url);

            const response = await fetch(url);

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(`Erro ${response.status}: ${mensagem}`);
            }

            const data = await response.json();

            setTransacoes(data.content);
            setTotalPaginas(data.totalPages);
            setTotalElementos(data.totalElements);
            setPaginaAtual(data.number);
        } catch (erro) {
            console.error("Erro ao filtrar:", erro);
        } finally {
            setLoading(false);
        }
    }

    async function aplicarFiltros() {
        setAplicandoFiltro(true);

        try {
            const filtrosSelecionados = {
                ...filtros,
            };

            setFiltrosAplicados(filtrosSelecionados);
            setPaginaAtual(0);

            await buscarTransacoesFiltradas(0, filtrosSelecionados);

            setFiltroAberto(false);
        } finally {
            setAplicandoFiltro(false);
        }
    }

    async function limparFiltros() {
        setFiltros(filtrosVazios);
        setFiltrosAplicados(null);
        setPaginaAtual(0);

        await buscarTransacoes(0);

        setFiltroAberto(false);
    }

    async function buscarCategoriasFiltro() {
        try {
            const response = await fetch(
                `http://localhost:8080/categorias/usuario/${USUARIO_ID}/todas`,
            );

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(mensagem || "Erro ao buscar categorias");
            }

            const data: CategoriaFiltro[] = await response.json();

            setCategoriasFiltro(Array.isArray(data) ? data : []);
        } catch (erro) {
            console.error("Erro ao buscar categorias do filtro:", erro);

            setCategoriasFiltro([]);
        }
    }

    async function confirmarExclusao() {
        if (!transacaoParaExcluir) {
            return;
        }

        try {
            setExcluindo(true);

            const response = await fetch(
                `http://localhost:8080/transacoes/${transacaoParaExcluir.id}?usuarioId=${USUARIO_ID}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(`Erro ${response.status}: ${mensagem}`);
            }

            setTransacaoParaExcluir(null);

            await buscarTransacoes();
        } catch (erro) {
            console.error("Erro ao excluir transação:", erro);
        } finally {
            setExcluindo(false);
        }
    }

    useEffect(() => {
        async function carregarTransacoes() {
            setPaginaAtual(0);

            const tipoUrl = searchParams.get("tipo");

            if (tipoUrl === "RECEITA" || tipoUrl === "DESPESA") {
                const periodoMes = obterPeriodoMes();

                const filtrosDashboard: FiltrosTransacao = {
                    ...filtrosVazios,

                    tipo: tipoUrl,

                    dataInicio: periodoMes.dataInicio,

                    dataFim: periodoMes.dataFim,
                };

                setFiltros(filtrosDashboard);

                setFiltrosAplicados(filtrosDashboard);

                await buscarTransacoesFiltradas(0, filtrosDashboard);

                return;
            }

            setFiltros(filtrosVazios);

            setFiltrosAplicados(null);

            await buscarTransacoes(0);
        }

        carregarTransacoes();
    }, [referenciaAtual, searchParams]);

    async function mudarPagina(novaPagina: number) {
        if (novaPagina < 0 || novaPagina >= totalPaginas || novaPagina === paginaAtual || loading) {
            return;
        }

        if (filtrosAplicados) {
            await buscarTransacoesFiltradas(novaPagina, filtrosAplicados);
        } else {
            await buscarTransacoes(novaPagina);
        }
    }

    return (
        <DashboardLayout>
            {loading && <LoadingOverlay />}

            <div
                className="
                pagina-transacoes
            "
            >
                <div
                    className="
    topo-transacoes
"
                >
                    <div className="acoes-transacoes">
                        <button
                            type="button"
                            className={`botao-filtro ${filtrosAplicados ? "filtro-ativo" : ""}`}
                            onClick={() => {
                                if (!filtroAberto) {
                                    buscarCategoriasFiltro();

                                    if (!filtrosAplicados) {
                                        const periodoMes = obterPeriodoMes();

                                        setFiltros({
                                            ...filtrosVazios,
                                            dataInicio: periodoMes.dataInicio,
                                            dataFim: periodoMes.dataFim,
                                        });
                                    }
                                }

                                setFiltroAberto(!filtroAberto);
                            }}
                            title="Filtrar transações"
                        >
                            <RiFilter3Fill />

                            {filtrosAplicados && <span className="indicador-filtro-ativo" />}
                        </button>

                        <button
                            className="botao-nova-receita"
                            onClick={() => abrirFormulario("RECEITA")}
                        >
                            <RiAddLine />
                            Nova receita
                        </button>

                        <button
                            className="botao-nova-despesa"
                            onClick={() => abrirFormulario("DESPESA")}
                        >
                            <RiSubtractLine />
                            Nova despesa
                        </button>
                    </div>
                </div>

                <div
                    className="
                    tabela-transacoes
                "
                >
                    <div
                        className="
                        tabela-header
                    "
                    >
                        <span>Pago?</span>

                        <span>Nome</span>

                        <span>Tipo</span>

                        <span>Categoria</span>

                        <span>Método</span>

                        <span>Data</span>

                        <span>Valor</span>

                        <span>Arquivo</span>

                        <span>Ações</span>
                    </div>

                    {transacoes.map(
                        (transacao) => (
                            console.log(transacao),
                            (
                                <div
                                    key={transacao.id}

                                    className="
                    linha-transacao
                "
                                >
                                    <div
                                        className="
                    status-transacao
                "
                                    >
                                        <div
                                            className={`
    bolinha-status

    ${transacao.status === "PAGO" ? "pago" : "pendente"}
`}
                                        ></div>
                                    </div>

                                    <div className="nome-transacao">
                                        <div
                                            className="avatar-transacao"
                                            style={{
                                                backgroundColor: transacao.corCategoria,
                                                color: corIcone(transacao.corCategoria),
                                            }}
                                        >
                                            {renderizarIcone(transacao.iconeCategoria)}
                                        </div>

                                        <strong>{transacao.descricao}</strong>
                                    </div>

                                    <div>
                                        <span
                                            className={`
                        badge-tipo

                        ${transacao.tipo === "RECEITA" ? "receita" : "despesa"}
                    `}
                                        >
                                            {transacao.tipo === "RECEITA" ? "Receita" : "Despesa"}
                                        </span>
                                    </div>

                                    <div className="categoria-transacao">{transacao.categoria}</div>

                                    <div
                                        className="
                    texto-transacao
                "
                                    >
                                        {formatarMetodo(transacao.metodo)}
                                    </div>

                                    <div
                                        className="
                    texto-transacao
                "
                                    >
                                        {formatarData(transacao.data)}
                                    </div>

                                    <div
                                        className={`
                                        valor-transacao

                                        ${transacao.tipo === "RECEITA" ? "positivo" : "negativo"}
                                    `}
                                    >
                                        R${" "}
                                        {Number(transacao.valor).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </div>

                                    <div
                                        className={`arquivo-transacao ${
                                            transacao.urlComprovante
                                                ? "arquivo-anexado"
                                                : "arquivo-sem-anexo"
                                        }`}
                                        onClick={() => {
                                            if (transacao.urlComprovante) {
                                                setComprovanteSelecionado(transacao.urlComprovante);
                                            }
                                        }}
                                        title={
                                            transacao.urlComprovante
                                                ? "Visualizar comprovante"
                                                : "Sem comprovante"
                                        }
                                    >
                                        <RiAttachmentLine
                                            style={{
                                                cursor: transacao.urlComprovante
                                                    ? "pointer"
                                                    : "default",
                                            }}
                                        />
                                    </div>

                                    <div className="acoes-transacao">
                                        {transacao.objetivoId !== null ||
                                        transacao.bloqueadaSistema ? (
                                            <button
                                                type="button"
                                                className="botao-transacao-protegida"
                                                onClick={() => setTransacaoProtegida(transacao)}
                                                title="Transação protegida"
                                            >
                                                <RiLock2Line />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setTipoFormulario(transacao.tipo);

                                                        setTransacaoEditando(transacao);

                                                        setFormularioAberto(true);
                                                    }}
                                                    title="Editar transação"
                                                >
                                                    <RiEdit2Line />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setTransacaoParaExcluir(transacao)
                                                    }
                                                    title="Excluir transação"
                                                >
                                                    <RiDeleteBin6Line />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        ),
                    )}

                    {!loading && filtrosAplicados && transacoes.length === 0 && (
                        <div className="nenhuma-transacao">
                            <RiFilter3Fill />

                            <div className="texto-nenhuma-transacao">
                                <strong>Nenhuma transação encontrada</strong>

                                <span>Nenhum resultado corresponde aos filtros aplicados.</span>
                            </div>

                            <button type="button" onClick={limparFiltros}>
                                Limpar filtros
                            </button>
                        </div>
                    )}

                    {totalPaginas > 1 && (
                        <div className="paginacao-transacoes">
                            <button
                                type="button"
                                className="botao-paginacao-transacao"
                                disabled={paginaAtual === 0 || loading}
                                onClick={() => mudarPagina(paginaAtual - 1)}
                            >
                                Anterior
                            </button>

                            <div className="numeros-paginacao-transacoes">
                                {Array.from({
                                    length: totalPaginas,
                                }).map((_, indice) => (
                                    <button
                                        type="button"
                                        key={indice}
                                        className={`
                        numero-pagina-transacao

                        ${paginaAtual === indice ? "ativo" : ""}
                    `}
                                        disabled={loading}
                                        onClick={() => mudarPagina(indice)}
                                    >
                                        {indice + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="botao-paginacao-transacao"
                                disabled={paginaAtual >= totalPaginas - 1 || loading}
                                onClick={() => mudarPagina(paginaAtual + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    )}

                    {totalElementos > 0 && (
                        <div className="total-transacoes-paginacao">
                            {totalElementos} {totalElementos === 1 ? "transação" : "transações"}
                        </div>
                    )}
                </div>

                {comprovanteSelecionado && (
                    <div
                        className="overlay-comprovante"
                        onClick={() => setComprovanteSelecionado(null)}
                    >
                        <div
                            className="modal-comprovante"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="cabecalho-modal-comprovante">
                                <h3>Comprovante</h3>

                                <button
                                    type="button"
                                    className="botao-fechar-comprovante"
                                    onClick={() => setComprovanteSelecionado(null)}
                                    aria-label="Fechar comprovante"
                                >
                                    ×
                                </button>
                            </div>

                            <iframe
                                src={`http://localhost:8080/${comprovanteSelecionado}`}
                                title="Visualização do comprovante"
                                className="visualizador-comprovante"
                            />
                        </div>
                    </div>
                )}
            </div>

            {filtroAberto && (
                <div className="overlay-filtro" onClick={() => setFiltroAberto(false)}>
                    <div className="painel-filtro" onClick={(e) => e.stopPropagation()}>
                        <div className="cabecalho-filtro">
                            <h2>Filtro de transações</h2>

                            <button
                                type="button"
                                className="botao-fechar-filtro"
                                onClick={() => setFiltroAberto(false)}
                                aria-label="Fechar filtro"
                            >
                                <RiCloseLine />
                            </button>
                        </div>

                        <div className="conteudo-filtro">
                            <div className="campo-filtro">
                                <label htmlFor="filtro-descricao">Descrição</label>

                                <input
                                    id="filtro-descricao"
                                    type="text"
                                    placeholder="Buscar pela descrição"
                                    value={filtros.descricao}
                                    onChange={(event) =>
                                        setFiltros({
                                            ...filtros,
                                            descricao: event.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grupo-periodo-filtro">
                                <div className="campo-filtro">
                                    <label htmlFor="filtro-data-inicio">Data inicial</label>

                                    <input
                                        id="filtro-data-inicio"
                                        type="date"
                                        value={filtros.dataInicio}
                                        onChange={(event) =>
                                            setFiltros({
                                                ...filtros,
                                                dataInicio: event.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="campo-filtro">
                                    <label htmlFor="filtro-data-fim">Data final</label>

                                    <input
                                        id="filtro-data-fim"
                                        type="date"
                                        value={filtros.dataFim}
                                        onChange={(event) =>
                                            setFiltros({
                                                ...filtros,
                                                dataFim: event.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="campo-filtro">
                                <label htmlFor="filtro-categoria">Categoria</label>

                                <select
                                    id="filtro-categoria"
                                    value={filtros.categoriaId}
                                    onChange={(event) =>
                                        setFiltros({
                                            ...filtros,
                                            categoriaId: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todas as categorias</option>

                                    {categoriasFiltro.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="campo-filtro">
                                <label htmlFor="filtro-tipo">Tipo</label>

                                <select
                                    id="filtro-tipo"
                                    value={filtros.tipo}
                                    onChange={(event) =>
                                        setFiltros({
                                            ...filtros,
                                            tipo: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todos os tipos</option>

                                    <option value="RECEITA">Receita</option>

                                    <option value="DESPESA">Despesa</option>
                                </select>
                            </div>

                            <div className="campo-filtro">
                                <label htmlFor="filtro-status">Status</label>

                                <select
                                    id="filtro-status"
                                    value={filtros.status}
                                    onChange={(event) =>
                                        setFiltros({
                                            ...filtros,
                                            status: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todos os status</option>

                                    <option value="PAGO">Pago</option>

                                    <option value="PENDENTE">Pendente</option>
                                </select>
                            </div>

                            <div className="campo-filtro">
                                <label htmlFor="filtro-metodo">Método de pagamento</label>

                                <select
                                    id="filtro-metodo"
                                    value={filtros.metodoPagamento}
                                    onChange={(event) =>
                                        setFiltros({
                                            ...filtros,
                                            metodoPagamento: event.target.value,
                                        })
                                    }
                                >
                                    <option value="">Todos os métodos</option>

                                    <option value="PIX">Pix</option>

                                    <option value="BOLETO">Boleto</option>

                                    <option value="CARTAO_CREDITO">Cartão de crédito</option>

                                    <option value="DEBITO">Débito</option>

                                    <option value="DINHEIRO">Dinheiro</option>

                                    <option value="TRANSFERENCIA">Transferência</option>
                                </select>
                            </div>

                            <div className="grupo-valores-filtro">
                                <div className="campo-filtro">
                                    <label htmlFor="filtro-valor-minimo">Valor mínimo</label>

                                    <NumericFormat
                                        id="filtro-valor-minimo"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        prefix="R$ "
                                        placeholder="R$ 0,00"
                                        value={filtros.valorMin}
                                        onValueChange={(valores) =>
                                            setFiltros({
                                                ...filtros,
                                                valorMin: valores.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="campo-filtro">
                                    <label htmlFor="filtro-valor-maximo">Valor máximo</label>

                                    <NumericFormat
                                        id="filtro-valor-maximo"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale
                                        allowNegative={false}
                                        prefix="R$ "
                                        placeholder="R$ 0,00"
                                        value={filtros.valorMax}
                                        onValueChange={(valores) =>
                                            setFiltros({
                                                ...filtros,
                                                valorMax: valores.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rodape-filtro">
                            <button
                                type="button"
                                className="botao-limpar-filtro"
                                onClick={limparFiltros}
                                disabled={aplicandoFiltro}
                            >
                                Limpar
                            </button>

                            <button
                                type="button"
                                className="botao-aplicar-filtro"
                                onClick={aplicarFiltros}
                                disabled={aplicandoFiltro}
                            >
                                {aplicandoFiltro ? "Aplicando..." : "Aplicar filtros"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {transacaoParaExcluir && (
                <div
                    className="overlay-exclusao"
                    onClick={() => {
                        if (!excluindo) {
                            setTransacaoParaExcluir(null);
                        }
                    }}
                >
                    <div className="modal-exclusao" onClick={(event) => event.stopPropagation()}>
                        <div className="icone-modal-exclusao">
                            <RiDeleteBin6Line />
                        </div>

                        <div className="conteudo-modal-exclusao">
                            <h3>Excluir transação?</h3>

                            <p>Tem certeza de que deseja excluir esta transação?</p>

                            <div className="resumo-transacao-exclusao">
                                <div
                                    className="icone-transacao-exclusao"
                                    style={{
                                        backgroundColor: transacaoParaExcluir.corCategoria,
                                        color: corIcone(transacaoParaExcluir.corCategoria),
                                    }}
                                >
                                    {renderizarIcone(transacaoParaExcluir.iconeCategoria)}
                                </div>

                                <div className="dados-transacao-exclusao">
                                    <strong>{transacaoParaExcluir.descricao}</strong>

                                    <span>{transacaoParaExcluir.categoria}</span>
                                </div>

                                <strong
                                    className={
                                        transacaoParaExcluir.tipo === "RECEITA"
                                            ? "valor-exclusao receita"
                                            : "valor-exclusao despesa"
                                    }
                                >
                                    {transacaoParaExcluir.tipo === "RECEITA" ? "+" : "-"} R${" "}
                                    {Number(transacaoParaExcluir.valor).toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </strong>
                            </div>

                            <div className="aviso-modal-exclusao">
                                Essa ação não poderá ser desfeita.
                            </div>
                        </div>

                        <div className="acoes-modal-exclusao">
                            <button
                                type="button"
                                className="botao-cancelar-exclusao"
                                onClick={() => setTransacaoParaExcluir(null)}
                                disabled={excluindo}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="botao-confirmar-exclusao"
                                onClick={confirmarExclusao}
                                disabled={excluindo}
                            >
                                {excluindo ? (
                                    <>
                                        <span className="spinner-exclusao" />
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <RiDeleteBin6Line />
                                        Excluir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {transacaoProtegida && (
                <div
                    className="overlay-transacao-protegida"
                    onClick={() => setTransacaoProtegida(null)}
                >
                    <div
                        className="modal-transacao-protegida"
                        onClick={(evento) => evento.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="fechar-transacao-protegida"
                            onClick={() => setTransacaoProtegida(null)}
                        >
                            <RiCloseLine />
                        </button>

                        <div className="icone-transacao-protegida">
                            <RiLock2Line />
                        </div>

                        {transacaoProtegida.objetivoId !== null &&
                        !transacaoProtegida.objetivoFinalizado ? (
                            <>
                                <h3>Movimentação de objetivo</h3>

                                <p className="texto-transacao-protegida">
                                    Esta transação pertence ao objetivo{" "}
                                    <strong>{transacaoProtegida.objetivoNome}</strong>.
                                </p>

                                <div className="aviso-transacao-protegida">
                                    <RiInformationLine />

                                    <span>
                                        Para editar ou excluir esta movimentação, acesse diretamente
                                        o objetivo.
                                    </span>
                                </div>

                                <div className="acoes-transacao-protegida">
                                    <button
                                        type="button"
                                        className="btn-fechar-transacao-protegida"
                                        onClick={() => setTransacaoProtegida(null)}
                                    >
                                        Fechar
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-ir-objetivo"
                                        onClick={() => {
                                            const objetivoId = transacaoProtegida.objetivoId;

                                            if (objetivoId === null) {
                                                return;
                                            }

                                            setTransacaoProtegida(null);

                                            navigate(`/objetivos/${objetivoId}`);
                                        }}
                                    >
                                        Ir para o objetivo
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Transação protegida</h3>

                                <p className="texto-transacao-protegida">
                                    Esta transação faz parte do histórico de um objetivo concluído.
                                </p>

                                <div className="resumo-transacao-protegida">
                                    <span>{transacaoProtegida.descricao}</span>

                                    <strong>
                                        R${" "}
                                        {Number(transacaoProtegida.valor).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </strong>
                                </div>

                                <div className="aviso-transacao-protegida">
                                    <RiInformationLine />

                                    <span>
                                        Para preservar o histórico financeiro, esta transação não
                                        pode ser editada ou excluída.
                                    </span>
                                </div>

                                <div className="acoes-transacao-protegida">
                                    <button
                                        type="button"
                                        className="btn-entendi-transacao-protegida"
                                        onClick={() => setTransacaoProtegida(null)}
                                    >
                                        Entendi
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {formularioAberto && (
                <FormTransacao
                    tipo={tipoFormulario}
                    transacao={transacaoEditando}

                    onClose={() => {
                        setFormularioAberto(false);

                        setTransacaoEditando(null);
                    }}

                    onSalvar={() => {
                        buscarTransacoes();

                        setTransacaoEditando(null);
                    }}
                />
            )}
        </DashboardLayout>
    );
}

export default Transacoes;
