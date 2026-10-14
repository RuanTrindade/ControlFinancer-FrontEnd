import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../../layouts/DashboardLayout";

import { useAlert } from "../../../context/AlertContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import {
    RiArrowDownLine,
    RiArrowUpLine,
    RiAddLine,
    RiLineChartLine,
    RiEyeLine,
    RiArrowLeftLine,
    RiEditLine,
    RiDeleteBin6Line,
} from "react-icons/ri";

import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    buscarInvestimentoPorId,
    buscarResumoMensalInvestimento,
    deletarInvestimento,
} from "../services/investimentoService";

import FormInvestimento from "../components/FormInvestimento";

import {
    deletarMovimentacao,
    listarMovimentacoes,
} from "../services/investimentoMovimentacaoService";

import type { InvestimentoResumo, InvestimentoResumoMensal } from "../types/investimento";

import type { InvestimentoMovimentacao } from "../types/investimentoMovimentacao";

import FormMovimentacaoInvestimento from "../components/FormMovimentacaoInvestimento";

import { useMes } from "../../../context/MesContext";

import "../styles/investimentoDetalhe.css";

type FiltroHistorico = "TODOS" | "APORTE" | "RESGATE" | "RENDIMENTO";

type TipoModal = "APORTE" | "RESGATE" | "RENDIMENTO" | null;

function InvestimentoDetalhe() {
    const navigate = useNavigate();

    const { showAlert } = useAlert();

    const { id } = useParams();

    const investimentoId = Number(id);

    const { mes: mesSelecionado, ano: anoSelecionado } = useMes();

    const [paginaAtual, setPaginaAtual] = useState(0);

    const [totalPaginas, setTotalPaginas] = useState(0);

    const [carregandoHistorico, setCarregandoHistorico] = useState(false);

    const [modalEditarInvestimento, setModalEditarInvestimento] = useState(false);

    const [modalExcluirInvestimento, setModalExcluirInvestimento] = useState(false);

    const [excluindoInvestimento, setExcluindoInvestimento] = useState(false);

    const { id: USUARIO_ID } = useUsuarioLogado();

    const [investimento, setInvestimento] = useState<InvestimentoResumo | null>(null);

    const [resumoMensal, setResumoMensal] = useState<InvestimentoResumoMensal | null>(null);

    const [movimentacoes, setMovimentacoes] = useState<InvestimentoMovimentacao[]>([]);

    const [modalMovimentacao, setModalMovimentacao] = useState<TipoModal>(null);

    const [movimentacoesHistorico, setMovimentacoesHistorico] = useState<
        InvestimentoMovimentacao[]
    >([]);

    const [movimentacaoEdicao, setMovimentacaoEdicao] = useState<InvestimentoMovimentacao | null>(
        null,
    );

    const [movimentacaoExcluir, setMovimentacaoExcluir] = useState<InvestimentoMovimentacao | null>(
        null,
    );

    const [filtro, setFiltro] = useState<FiltroHistorico>("TODOS");

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState<string | null>(null);

    async function carregarDados(mostrarCarregamento = true) {
        if (!investimentoId || Number.isNaN(investimentoId)) {
            setErro("Investimento inválido.");

            setCarregando(false);

            return;
        }

        try {
            if (mostrarCarregamento) {
                setCarregando(true);
            }

            setErro(null);

            const [respostaInvestimento, respostaResumo, respostaMovimentacoes] = await Promise.all(
                [
                    buscarInvestimentoPorId(investimentoId),

                    buscarResumoMensalInvestimento(
                        investimentoId,

                        mesSelecionado,

                        anoSelecionado,
                    ),

                    listarMovimentacoes(
                        investimentoId,

                        undefined,

                        undefined,

                        undefined,

                        0,

                        500,
                    ),
                ],
            );

            setInvestimento(respostaInvestimento);

            setResumoMensal(respostaResumo);

            setMovimentacoes(respostaMovimentacoes.content);
        } catch (error) {
            console.error("Erro ao carregar investimento:", error);

            setErro("Não foi possível carregar os dados do investimento.");
        } finally {
            if (mostrarCarregamento) {
                setCarregando(false);
            }
        }
    }

    async function carregarHistorico(pagina: number = paginaAtual) {
        try {
            setCarregandoHistorico(true);

            const resposta = await listarMovimentacoes(
                investimentoId,

                mesSelecionado,

                anoSelecionado,

                filtro === "TODOS" ? undefined : filtro,

                pagina,

                5,
            );

            setMovimentacoesHistorico(resposta.content);

            setTotalPaginas(resposta.totalPages);

            setPaginaAtual(resposta.number);
        } catch (error) {
            console.error("Erro ao carregar histórico:", error);

            showAlert({
                type: "error",
                title: "Erro ao carregar histórico",
                message: "Não foi possível carregar as movimentações.",
            });
        } finally {
            setCarregandoHistorico(false);
        }
    }

    useEffect(() => {
        setPaginaAtual(0);

        carregarHistorico(0);
    }, [investimentoId, mesSelecionado, anoSelecionado, filtro]);

    useEffect(() => {
        carregarDados();
    }, [investimentoId, mesSelecionado, anoSelecionado]);

    function formatarMoeda(valor: number) {
        return Number(valor || 0).toLocaleString(
            "pt-BR",

            {
                style: "currency",
                currency: "BRL",
            },
        );
    }

    function formatarData(data: string) {
        const dataConvertida = new Date(data);

        return dataConvertida.toLocaleDateString("pt-BR");
    }

    const nomeMes = useMemo(() => {
        const data = new Date(
            anoSelecionado,

            mesSelecionado - 1,

            1,
        );

        const nome = data.toLocaleDateString(
            "pt-BR",

            {
                month: "long",
                year: "numeric",
            },
        );

        return nome.charAt(0).toUpperCase() + nome.slice(1);
    }, [mesSelecionado, anoSelecionado]);

    const movimentacoesAteMes = useMemo(() => {
        const limite = new Date(
            anoSelecionado,

            mesSelecionado,

            1,
        );

        return movimentacoes
            .filter((movimentacao) => {
                const data = new Date(movimentacao.data);

                return data < limite;
            })
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    }, [movimentacoes, mesSelecionado, anoSelecionado]);

    const totais = useMemo(() => {
        let aportes = 0;

        let resgates = 0;

        let rendimentos = 0;

        movimentacoesAteMes.forEach((movimentacao) => {
            if (movimentacao.tipo === "APORTE") {
                aportes += Number(movimentacao.valor);
            } else if (movimentacao.tipo === "RESGATE") {
                resgates += Number(movimentacao.valor);
            } else if (movimentacao.tipo === "RENDIMENTO") {
                rendimentos += Number(movimentacao.valor);
            }
        });

        const saldo = aportes - resgates + rendimentos;

        return {
            aportes,

            resgates,

            rendimentos,

            saldo,
        };
    }, [movimentacoesAteMes]);

    const dadosGrafico = useMemo(() => {
        const mapa = new Map<
            string,
            {
                ano: number;
                mes: number;
                valor: number;
            }
        >();

        let saldo = 0;

        movimentacoesAteMes.forEach((movimentacao) => {
            const data = new Date(movimentacao.data);

            if (movimentacao.tipo === "APORTE") {
                saldo += Number(movimentacao.valor);
            } else if (movimentacao.tipo === "RESGATE") {
                saldo -= Number(movimentacao.valor);
            } else if (movimentacao.tipo === "RENDIMENTO") {
                saldo += Number(movimentacao.valor);
            }

            const chave = `${data.getFullYear()}-${data.getMonth()}`;

            mapa.set(chave, {
                ano: data.getFullYear(),

                mes: data.getMonth(),

                valor: saldo,
            });
        });

        return Array.from(mapa.values()).map((item) => {
            const data = new Date(
                item.ano,

                item.mes,

                1,
            );

            return {
                mes: data.toLocaleDateString(
                    "pt-BR",

                    {
                        month: "short",
                        year: "2-digit",
                    },
                ),

                valor: item.valor,
            };
        });
    }, [movimentacoesAteMes]);

    const historicoFiltrado = movimentacoesHistorico;

    function abrirEdicao(movimentacao: InvestimentoMovimentacao) {
        setMovimentacaoEdicao(movimentacao);

        setModalMovimentacao(movimentacao.tipo);
    }

    async function excluirMovimentacao() {
        if (!movimentacaoExcluir) {
            return;
        }

        try {
            setErro(null);

            await deletarMovimentacao(movimentacaoExcluir.id);

            setMovimentacaoExcluir(null);

            await Promise.all([carregarDados(false), carregarHistorico(paginaAtual)]);
        } catch (error) {
            console.error("Erro ao excluir movimentação:", error);

            const mensagem =
                error instanceof Error ? error.message : "Não foi possível excluir a movimentação.";

            showAlert({
                type: "error",
                title: "Não foi possível excluir",
                message: mensagem,
            });
        }
    }

    async function confirmarExclusaoInvestimento() {
        if (!investimento || excluindoInvestimento) {
            return;
        }

        try {
            setExcluindoInvestimento(true);

            await deletarInvestimento(
                investimento.id,

                USUARIO_ID,
            );

            showAlert({
                type: "success",
                title: "Investimento excluído",
                message: "O investimento foi excluído com sucesso.",
            });

            navigate("/investimentos");
        } catch (error) {
            console.error("Erro ao excluir investimento:", error);

            showAlert({
                type: "error",
                title: "Não foi possível excluir",
                message:
                    error instanceof Error
                        ? error.message
                        : "Não foi possível excluir o investimento.",
            });
        } finally {
            setExcluindoInvestimento(false);
        }
    }

    return (
        <DashboardLayout mostrarMeses={true}>
            <div className="pagina-investimento-detalhe">
                <div className="topo-investimento-detalhe">
                    <button
                        type="button"

                        className="botao-voltar-investimentos"

                        onClick={() => navigate("/investimentos")}
                    >
                        <RiArrowLeftLine />
                        Voltar para investimentos
                    </button>

                    {!investimento?.encerrado && (
                        <div className="acoes-topo-investimento">
                            <button
                                type="button"
                                className="botao-editar-investimento"
                                onClick={() => setModalEditarInvestimento(true)}
                            >
                                <RiEditLine />
                                Editar
                            </button>

                            <button
                                type="button"
                                className="botao-excluir-investimento"
                                onClick={() => setModalExcluirInvestimento(true)}
                            >
                                <RiDeleteBin6Line />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>

                {erro && <div className="mensagem-erro-investimento-detalhe">{erro}</div>}

                {carregando && (
                    <div className="mensagem-investimento-detalhe">Carregando investimento...</div>
                )}

                {!carregando && !erro && investimento && resumoMensal && (
                    <>
                        <section className="painel-superior-investimento">
                            <div className="card-investimento-principal">
                                <div className="cabecalho-carteira-investimento">
                                    <div>
                                        <h2>{investimento.nome}</h2>

                                        <span className="tipo-investimento-detalhe">
                                            {investimento.tipo.replaceAll("_", " ")}
                                        </span>
                                    </div>
                                </div>

                                <div className="valor-principal-investimento">
                                    <span>VALOR DA CARTEIRA ATÉ {nomeMes.toUpperCase()}</span>

                                    <strong>{formatarMoeda(totais.saldo)}</strong>

                                    <small>
                                        + {formatarMoeda(totais.rendimentos)} DE RENDIMENTO
                                    </small>
                                </div>

                                <button
                                    type="button"

                                    className="botao-visualizar-investimento"
                                >
                                    <RiEyeLine />
                                </button>
                            </div>

                            <div className="separador-investimento" />

                            <div className="area-grafico-investimento">
                                <div className="cabecalho-grafico-investimento">
                                    <div className="titulo-grafico-investimento">
                                        <h3>Evolução do investimento</h3>

                                        <span>Saldo acumulado até {nomeMes}</span>
                                    </div>

                                    <div className="resumo-grafico-investimento">
                                        <span>Rendimento acumulado</span>

                                        <strong>+ {formatarMoeda(totais.rendimentos)}</strong>
                                    </div>
                                </div>

                                <div className="grafico-linha-investimento">
                                    {dadosGrafico.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={dadosGrafico}>
                                                <CartesianGrid
                                                    strokeDasharray="4 4"

                                                    vertical={false}

                                                    stroke="#e5e7eb"
                                                />

                                                <XAxis
                                                    dataKey="mes"

                                                    axisLine={false}

                                                    tickLine={false}

                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#9ca3af",
                                                    }}
                                                />

                                                <YAxis
                                                    axisLine={false}

                                                    tickLine={false}

                                                    width={70}

                                                    tick={{
                                                        fontSize: 11,
                                                        fill: "#9ca3af",
                                                    }}

                                                    tickFormatter={(valor) =>
                                                        `R$ ${Number(valor).toLocaleString(
                                                            "pt-BR",
                                                        )}`
                                                    }
                                                />

                                                <Tooltip
                                                    formatter={(valor) => [
                                                        formatarMoeda(Number(valor)),

                                                        "Valor da carteira",
                                                    ]}
                                                />

                                                <Line
                                                    type="monotone"

                                                    dataKey="valor"

                                                    stroke="#22c55e"

                                                    strokeWidth={3}

                                                    dot={{
                                                        r: 4,

                                                        fill: "#22c55e",

                                                        stroke: "#ffffff",

                                                        strokeWidth: 2,
                                                    }}

                                                    activeDot={{
                                                        r: 6,
                                                    }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="grafico-investimento-vazio">
                                            Nenhuma movimentação registrada até este mês.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {!investimento.encerrado && (
                            <div className="acoes-detalhe-investimento">
                                <button
                                    type="button"

                                    className="acao-investimento aporte"

                                    onClick={() => setModalMovimentacao("APORTE")}
                                >
                                    <RiAddLine />
                                    Fazer aporte
                                </button>

                                <button
                                    type="button"

                                    className="acao-investimento resgate"

                                    onClick={() => setModalMovimentacao("RESGATE")}
                                >
                                    <RiArrowDownLine />
                                    Fazer resgate
                                </button>

                                <button
                                    type="button"

                                    className="acao-investimento atualizar"

                                    onClick={() => setModalMovimentacao("RENDIMENTO")}
                                >
                                    <RiLineChartLine />
                                    Registrar rendimento
                                </button>
                            </div>
                        )}

                        <section className="historico-investimento">
                            <div className="cabecalho-historico-investimento">
                                <div>
                                    <h2>Histórico do investimento</h2>
                                </div>

                                <div className="filtros-historico-investimento">
                                    <button
                                        type="button"

                                        className={filtro === "TODOS" ? "ativo" : ""}

                                        onClick={() => setFiltro("TODOS")}
                                    >
                                        Todos
                                    </button>

                                    <button
                                        type="button"

                                        className={filtro === "APORTE" ? "ativo" : ""}

                                        onClick={() => setFiltro("APORTE")}
                                    >
                                        Aportes
                                    </button>

                                    <button
                                        type="button"

                                        className={filtro === "RESGATE" ? "ativo" : ""}

                                        onClick={() => setFiltro("RESGATE")}
                                    >
                                        Resgates
                                    </button>

                                    <button
                                        type="button"

                                        className={filtro === "RENDIMENTO" ? "ativo" : ""}

                                        onClick={() => setFiltro("RENDIMENTO")}
                                    >
                                        Rendimentos
                                    </button>
                                </div>
                            </div>

                            <div className="lista-historico-investimento">
                                {historicoFiltrado.length === 0 ? (
                                    <div className="historico-investimento-vazio">
                                        <div className="icone-historico-vazio">
                                            <RiLineChartLine />
                                        </div>

                                        <strong>Nenhuma movimentação neste período</strong>

                                        <span>
                                            Não encontramos movimentações registradas em {nomeMes}.
                                        </span>
                                    </div>
                                ) : (
                                    historicoFiltrado.map((movimentacao) => (
                                        <div
                                            className="item-historico-investimento"
                                            key={movimentacao.id}
                                        >
                                            <div
                                                className={`icone-historico-investimento ${movimentacao.tipo.toLowerCase()}`}
                                            >
                                                {movimentacao.tipo === "APORTE" && (
                                                    <RiArrowUpLine />
                                                )}

                                                {movimentacao.tipo === "RESGATE" && (
                                                    <RiArrowDownLine />
                                                )}

                                                {movimentacao.tipo === "RENDIMENTO" && (
                                                    <RiLineChartLine />
                                                )}
                                            </div>

                                            <div className="descricao-historico-investimento">
                                                <strong>
                                                    {movimentacao.tipo === "APORTE"
                                                        ? "Aporte realizado"
                                                        : movimentacao.tipo === "RESGATE"
                                                          ? "Resgate realizado"
                                                          : "Rendimento registrado"}
                                                </strong>

                                                <span>
                                                    {movimentacao.tipo === "APORTE"
                                                        ? "Valor adicionado ao investimento"
                                                        : movimentacao.tipo === "RESGATE"
                                                          ? "Valor retirado do investimento"
                                                          : "Rendimento informado para o mês"}
                                                </span>
                                            </div>

                                            <div className="data-historico-investimento">
                                                {formatarData(movimentacao.data)}
                                            </div>

                                            <div
                                                className={
                                                    movimentacao.tipo === "RESGATE"
                                                        ? "valor-historico negativo"
                                                        : movimentacao.tipo === "RENDIMENTO"
                                                          ? "valor-historico rendimento"
                                                          : "valor-historico positivo"
                                                }
                                            >
                                                {movimentacao.tipo === "RESGATE" ? "- " : "+ "}

                                                {formatarMoeda(movimentacao.valor)}
                                            </div>

                                            <div className="acoes-item-historico">
                                                <button
                                                    type="button"
                                                    className="botao-editar-historico"
                                                    onClick={() => abrirEdicao(movimentacao)}
                                                >
                                                    <RiEditLine />
                                                    Editar
                                                </button>

                                                <button
                                                    type="button"
                                                    className="botao-excluir-historico"
                                                    onClick={() =>
                                                        setMovimentacaoExcluir(movimentacao)
                                                    }
                                                >
                                                    <RiDeleteBin6Line />
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {totalPaginas > 1 && (
                                <div className="paginacao-historico-investimento">
                                    <button
                                        type="button"
                                        disabled={paginaAtual === 0 || carregandoHistorico}
                                        onClick={() => carregarHistorico(paginaAtual - 1)}
                                    >
                                        ‹
                                    </button>

                                    {Array.from(
                                        {
                                            length: totalPaginas,
                                        },
                                        (_, index) => index,
                                    ).map((pagina) => (
                                        <button
                                            key={pagina}
                                            type="button"
                                            className={pagina === paginaAtual ? "ativo" : ""}
                                            disabled={carregandoHistorico}
                                            onClick={() => carregarHistorico(pagina)}
                                        >
                                            {pagina + 1}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        disabled={
                                            paginaAtual >= totalPaginas - 1 || carregandoHistorico
                                        }
                                        onClick={() => carregarHistorico(paginaAtual + 1)}
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>

            {modalMovimentacao && (
                <FormMovimentacaoInvestimento
                    investimentoId={investimentoId}

                    tipo={modalMovimentacao}

                    movimentacaoEdicao={movimentacaoEdicao}

                    onClose={() => {
                        setModalMovimentacao(null);

                        setMovimentacaoEdicao(null);
                    }}

                    onSalvar={async () => {
                        setModalMovimentacao(null);

                        setMovimentacaoEdicao(null);

                        await Promise.all([carregarDados(false), carregarHistorico(paginaAtual)]);
                    }}
                />
            )}

            {movimentacaoExcluir && (
                <div
                    className="overlay-movimentacao-investimento"
                    onClick={() => setMovimentacaoExcluir(null)}
                >
                    <div
                        className="modal-movimentacao-investimento"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="cabecalho-modal-movimentacao">
                            <div className="titulo-modal-movimentacao">
                                <div className="icone-modal-movimentacao resgate">
                                    <RiDeleteBin6Line />
                                </div>

                                <div>
                                    <h2>Excluir movimentação</h2>

                                    <p>Esta ação não poderá ser desfeita.</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="fechar-modal-movimentacao"
                                onClick={() => setMovimentacaoExcluir(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="conteudo-modal-movimentacao">
                            <div className="aviso-modal-movimentacao resgate">
                                Deseja realmente excluir este{" "}
                                {movimentacaoExcluir.tipo === "APORTE"
                                    ? "aporte"
                                    : movimentacaoExcluir.tipo === "RESGATE"
                                      ? "resgate"
                                      : "rendimento"}{" "}
                                de <strong>{formatarMoeda(movimentacaoExcluir.valor)}</strong>?
                            </div>

                            <div className="acoes-modal-movimentacao">
                                <button
                                    type="button"
                                    className="cancelar-modal-movimentacao"
                                    onClick={() => setMovimentacaoExcluir(null)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="salvar-modal-movimentacao resgate"
                                    onClick={excluirMovimentacao}
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalEditarInvestimento && investimento && (
                <FormInvestimento
                    usuarioId={USUARIO_ID}

                    investimento={investimento}

                    onClose={() => setModalEditarInvestimento(false)}

                    onSalvar={async () => {
                        await carregarDados(false);

                        setModalEditarInvestimento(false);
                    }}
                />
            )}

            {modalExcluirInvestimento && investimento && (
                <div
                    className="overlay-excluir-investimento"
                    onClick={() => {
                        if (!excluindoInvestimento) {
                            setModalExcluirInvestimento(false);
                        }
                    }}
                >
                    <div
                        className="modal-excluir-investimento"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="icone-excluir-investimento">
                            <RiDeleteBin6Line />
                        </div>

                        <h2>Excluir investimento?</h2>

                        <p>
                            Tem certeza que deseja excluir <strong>{investimento.nome}</strong>?
                        </p>

                        <div className="aviso-excluir-investimento">
                            Só é possível excluir investimentos que ainda não possuem aportes,
                            resgates ou rendimentos.
                        </div>

                        <div className="acoes-excluir-investimento">
                            <button
                                type="button"
                                className="cancelar-excluir-investimento"
                                disabled={excluindoInvestimento}
                                onClick={() => setModalExcluirInvestimento(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className="confirmar-excluir-investimento"
                                disabled={excluindoInvestimento}
                                onClick={confirmarExclusaoInvestimento}
                            >
                                {excluindoInvestimento ? "Excluindo..." : "Excluir investimento"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default InvestimentoDetalhe;
