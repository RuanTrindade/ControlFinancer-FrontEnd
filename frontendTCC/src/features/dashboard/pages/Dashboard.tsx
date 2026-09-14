import { useEffect, useMemo, useState } from "react";

import {
    BsWallet2,
    BsArrowUpRight,
    BsArrowDownRight,
    BsPiggyBank,
    BsGraphUpArrow,
} from "react-icons/bs";

import { useNavigate } from "react-router-dom";

import { renderizarIcone } from "../../../utils/renderizarIcone";

import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import DashboardLayout from "../../../layouts/DashboardLayout";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";

import { useMes } from "../../../context/MesContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import { buscarDashboard } from "../services/dashboardService";

import type { DashboardResponse } from "../types/dashboard";

import "../styles/dashboard.css";

/* ===================================================
   TIPOS INTERNOS
=================================================== */

type ResumoDashboard = {
    nome: "Receita" | "Despesa" | "Investimento";

    valor: number;

    cor: string;
};

type CategoriaDashboard = {
    nome: string;

    valor: number;

    percentual: number;

    cor: string;

    icone: string;
};

type TransacaoDashboard = {
    id: number;

    nome: string;

    data: string;

    valor: number;

    tipo: "RECEITA" | "DESPESA";

    categoria: string;

    icone: string;
};

/* ===================================================
   COMPONENTE
=================================================== */

function Dashboard() {
    const navigate = useNavigate();
    /* ===================================================
       CONFIGURAÇÕES
    =================================================== */

    const { id: USUARIO_ID } = useUsuarioLogado();

    const { mes: mesSelecionado, ano: anoSelecionado } = useMes();

    /* ===================================================
       STATES
    =================================================== */

    const [loading, setLoading] = useState(true);

    const [erro, setErro] = useState("");

    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

    /* ===================================================
       CARREGAR DASHBOARD
    =================================================== */

    useEffect(() => {
        async function carregarDashboard() {
            try {
                setLoading(true);

                setErro("");

                const resposta = await buscarDashboard(
                    USUARIO_ID,

                    mesSelecionado,

                    anoSelecionado,
                );

                setDashboard(resposta);
            } catch (error) {
                console.error("Erro ao carregar dashboard:", error);

                setDashboard(null);

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar o dashboard.",
                );
            } finally {
                setLoading(false);
            }
        }

        carregarDashboard();
    }, [mesSelecionado, anoSelecionado]);

    /* ===================================================
       VALORES PRINCIPAIS
    =================================================== */

    const saldo = dashboard?.saldo ?? 0;

    const receita = dashboard?.receita ?? 0;

    const despesa = dashboard?.despesa ?? 0;

    const investimento = dashboard?.investimento ?? 0;

    /* ===================================================
       RESUMO

       Mantemos exatamente a estrutura que o JSX
       anterior utilizava.
    =================================================== */

    const resumo = useMemo<ResumoDashboard[]>(
        () => [
            {
                nome: "Receita",

                valor: receita,

                cor: "#22c55e",
            },

            {
                nome: "Despesa",

                valor: despesa,

                cor: "#ef4444",
            },

            {
                nome: "Investimento",

                valor: investimento,

                cor: "#0ea5e9",
            },
        ],
        [receita, despesa, investimento],
    );

    /* ===================================================
       CATEGORIAS CRÍTICAS

       O percentual já vem calculado corretamente
       pelo backend.

       NÃO recalculamos percentual em relação
       às outras categorias.
    =================================================== */

    const categorias = useMemo<CategoriaDashboard[]>(() => {
        return (dashboard?.categoriasCriticas ?? []).map((categoria) => ({
            nome: categoria.nome,

            valor: categoria.utilizado,

            percentual: categoria.percentualUtilizado,

            icone: categoria.icone,

            cor:
                categoria.status === "ESTOUROU"
                    ? "#ef4444"
                    : categoria.status === "ATENÇÃO"
                      ? "#f59e0b"
                      : "#22c55e",
        }));
    }, [dashboard]);

    /* ===================================================
       ÚLTIMAS TRANSAÇÕES
    =================================================== */

    const transacoes = useMemo<TransacaoDashboard[]>(() => {
        return (dashboard?.ultimasTransacoes ?? []).map((transacao) => ({
            id: transacao.id,

            nome: transacao.descricao,

            data: formatarData(transacao.data),

            valor: transacao.valor,

            tipo: transacao.tipo,

            categoria: transacao.categoria,

            icone: transacao.icone,
        }));
    }, [dashboard]);

    /* ===================================================
       DONUT
    =================================================== */

    const totalResumo = useMemo(() => {
        return resumo.reduce(
            (total, item) => total + item.valor,

            0,
        );
    }, [resumo]);

    const dadosPizza = useMemo(() => {
        return resumo.map((item) => ({
            ...item,

            percentual: totalResumo > 0 ? (item.valor / totalResumo) * 100 : 0,
        }));
    }, [resumo, totalResumo]);

    const dadosPizzaExibicao = useMemo(() => {
        if (totalResumo === 0) {
            return [
                {
                    nome: "Sem movimentações",
                    valor: 1,
                    percentual: 0,
                    cor: "#e5e7eb",
                },
            ];
        }

        return dadosPizza;
    }, [dadosPizza, totalResumo]);

    /* ===================================================
       CATEGORIAS PARA O GRÁFICO

       Aqui usamos o percentual verdadeiro
       do planejamento.
    =================================================== */

    const dadosCategorias = useMemo(() => {
        return categorias.map((categoria) => ({
            ...categoria,

            percentualGrafico: Math.max(0, Math.min(Number(categoria.percentual || 0), 100)),
        }));
    }, [categorias]);

    /* ===================================================
       FORMATAR MOEDA
    =================================================== */

    function formatarMoeda(valor: number) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",

            currency: "BRL",
        });
    }

    /* ===================================================
       FORMATAR DATA
    =================================================== */

    function formatarData(data: string) {
        /*
         * O T00:00:00 evita o JS interpretar
         * a data como UTC e voltar um dia.
         *
         * Isso NÃO resolve ainda a questão do
         * cadastro aparecendo no dia seguinte.
         * Aquilo vamos investigar depois.
         */

        return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
            day: "2-digit",

            month: "short",

            year: "numeric",
        });
    }

    /* ===================================================
       ÍCONE DO RESUMO
    =================================================== */

    function obterIconeResumo(nome: ResumoDashboard["nome"]) {
        switch (nome) {
            case "Receita":
                return <BsArrowUpRight />;

            case "Despesa":
                return <BsArrowDownRight />;

            case "Investimento":
                return <BsPiggyBank />;

            default:
                return <BsWallet2 />;
        }
    }

    /* ===================================================
       RENDER
    =================================================== */

    return (
        <DashboardLayout>
            {loading && <LoadingOverlay />}

            {erro && <div className="mensagem-erro-dashboard">{erro}</div>}

            <div className="grade-dashboard">
                {/* ===================================================
                    ESQUERDA
                =================================================== */}

                <div className="dashboard-esquerda">
                    {/* ===================================================
                        SALDO
                    =================================================== */}

                    <div className="cartao cartao-saldo">
                        <div>
                            <div className="topo-saldo">
                                <BsWallet2 />

                                <p>Saldo</p>
                            </div>

                            <h2>{formatarMoeda(saldo)}</h2>
                        </div>

                        <button
                            type="button"
                            className="botao-adicionar"
                            onClick={() => navigate("/transacoes")}
                        >
                            Adicionar transação
                            <BsGraphUpArrow />
                        </button>
                    </div>

                    {/* ===================================================
                        RESUMO
                    =================================================== */}

                    <div className="grade-resumo">
                        {resumo.map((item) => (
                            <div
                                key={item.nome}
                                className="cartao cartao-resumo cartao-dashboard-clicavel"
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    if (item.nome === "Receita") {
                                        navigate("/transacoes?tipo=RECEITA");

                                        return;
                                    }

                                    if (item.nome === "Despesa") {
                                        navigate("/transacoes?tipo=DESPESA");

                                        return;
                                    }

                                    if (item.nome === "Investimento") {
                                        navigate("/investimentos");
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();

                                        event.currentTarget.click();
                                    }
                                }}
                            >
                                <div className="topo-resumo">
                                    <span
                                        className="icone-resumo-dashboard"
                                        style={{
                                            color: item.cor,
                                        }}
                                    >
                                        {obterIconeResumo(item.nome)}
                                    </span>

                                    <p>{item.nome}</p>
                                </div>

                                <h3>{formatarMoeda(item.valor)}</h3>
                            </div>
                        ))}
                    </div>

                    {/* ===================================================
                        PARTE INFERIOR
                    =================================================== */}

                    <div className="dashboard-inferior">
                        {/* ===================================================
                            GRÁFICO DONUT
                        =================================================== */}

                        <div
                            className="cartao cartao-grafico cartao-dashboard-clicavel"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate("/relatorios")}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();

                                    navigate("/relatorios");
                                }
                            }}
                        >
                            <div className="grafico-dashboard-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dadosPizzaExibicao}
                                            dataKey="valor"
                                            nameKey="nome"
                                            innerRadius={55}
                                            outerRadius={92}
                                            paddingAngle={0}
                                            stroke="none"
                                        >
                                            {dadosPizzaExibicao.map((item) => (
                                                <Cell key={item.nome} fill={item.cor} />
                                            ))}
                                        </Pie>

                                        <Tooltip
                                            formatter={(valor) => formatarMoeda(Number(valor ?? 0))}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* ===================================================
                                LEGENDA
                            =================================================== */}

                            <div className="legenda-grafico">
                                {dadosPizza.map((item) => (
                                    <div key={item.nome} className="legenda-item">
                                        <span
                                            className="cor-legenda"
                                            style={{
                                                background: item.cor,
                                            }}
                                        />

                                        <div className="legenda-dashboard-info">
                                            <span>{item.nome}</span>

                                            <strong>{item.percentual.toFixed(0)}%</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ===================================================
                            GASTOS POR CATEGORIA
                        =================================================== */}

                        <div className="cartao cartao-categorias">
                            <h2>Gastos por categoria</h2>

                            {dadosCategorias.length === 0 ? (
                                <div className="categorias-placeholder-dashboard">
                                    <div className="categoria-placeholder-dashboard">
                                        <div className="topo-placeholder-dashboard">
                                            <span>Nenhuma categoria</span>

                                            <strong>0%</strong>
                                        </div>

                                        <div className="barra-placeholder-dashboard" />
                                    </div>

                                    <div className="categoria-placeholder-dashboard">
                                        <div className="topo-placeholder-dashboard">
                                            <span>Nenhuma categoria</span>

                                            <strong>0%</strong>
                                        </div>

                                        <div className="barra-placeholder-dashboard" />
                                    </div>

                                    <div className="categoria-placeholder-dashboard">
                                        <div className="topo-placeholder-dashboard">
                                            <span>Nenhuma categoria</span>

                                            <strong>0%</strong>
                                        </div>

                                        <div className="barra-placeholder-dashboard" />
                                    </div>
                                </div>
                            ) : (
                                <div className="grafico-categorias-dashboard">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={dadosCategorias}
                                            layout="vertical"
                                            margin={{
                                                top: 0,
                                                right: 8,
                                                bottom: 0,
                                                left: 0,
                                            }}
                                            barCategoryGap={24}
                                        >
                                            <XAxis type="number" domain={[0, 100]} hide />

                                            <YAxis type="category" dataKey="nome" hide />

                                            <Tooltip
                                                cursor={{
                                                    fill: "transparent",
                                                }}
                                                formatter={(_valor, _nome, item) => {
                                                    const categoria =
                                                        item.payload as CategoriaDashboard;

                                                    return [
                                                        formatarMoeda(categoria.valor),

                                                        categoria.nome,
                                                    ];
                                                }}
                                            />

                                            <Bar
                                                dataKey="percentualGrafico"
                                                radius={[999, 999, 999, 999]}
                                                barSize={12}
                                                minPointSize={0}
                                                background={{
                                                    fill: "#e5e7eb",
                                                    radius: 999,
                                                }}
                                            >
                                                {dadosCategorias.map((categoria) => (
                                                    <Cell
                                                        key={categoria.nome}
                                                        fill={categoria.cor}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>

                                    <div
                                        className="categorias-sobre-grafico"
                                        style={{
                                            gridTemplateRows: `repeat(${dadosCategorias.length}, 1fr)`,
                                        }}
                                    >
                                        {dadosCategorias.map((categoria) => (
                                            <div
                                                key={categoria.nome}
                                                className="categoria-dashboard-item"
                                            >
                                                <div className="info-categoria">
                                                    <span
                                                        style={{
                                                            color: categoria.cor,
                                                        }}
                                                    >
                                                        {renderizarIcone(categoria.icone)}
                                                    </span>

                                                    <span>{categoria.nome}</span>
                                                </div>

                                                <strong>{categoria.percentual.toFixed(0)}%</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="legenda-status-categorias">
                                <div className="status-categoria-item">
                                    <span className="status-bolinha status-verde" />
                                    <span>Dentro do limite</span>
                                </div>

                                <div className="status-categoria-item">
                                    <span className="status-bolinha status-amarelo" />
                                    <span>Próximo do limite</span>
                                </div>

                                <div className="status-categoria-item">
                                    <span className="status-bolinha status-vermelho" />
                                    <span>Limite excedido</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===================================================
                    ÚLTIMAS TRANSAÇÕES
                =================================================== */}

                <div
                    className="cartao cartao-transacoes cartao-dashboard-clicavel"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/transacoes")}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();

                            navigate("/transacoes");
                        }
                    }}
                >
                    <h2>Últimas transações</h2>

                    {transacoes.length === 0 ? (
                        <div className="transacoes-placeholder-dashboard">
                            <div className="transacao-placeholder-dashboard">
                                <div className="icone-placeholder-transacao" />

                                <div className="conteudo-placeholder-transacao">
                                    <div className="linha-placeholder-transacao maior" />

                                    <div className="linha-placeholder-transacao menor" />
                                </div>

                                <div className="valor-placeholder-transacao" />
                            </div>

                            <div className="transacao-placeholder-dashboard">
                                <div className="icone-placeholder-transacao" />

                                <div className="conteudo-placeholder-transacao">
                                    <div className="linha-placeholder-transacao maior" />

                                    <div className="linha-placeholder-transacao menor" />
                                </div>

                                <div className="valor-placeholder-transacao" />
                            </div>

                            <div className="transacao-placeholder-dashboard">
                                <div className="icone-placeholder-transacao" />

                                <div className="conteudo-placeholder-transacao">
                                    <div className="linha-placeholder-transacao maior" />

                                    <div className="linha-placeholder-transacao menor" />
                                </div>

                                <div className="valor-placeholder-transacao" />
                            </div>
                        </div>
                    ) : (
                        transacoes.map((transacao) => (
                            <div key={transacao.id} className="item-transacao">
                                <div className="transacao-esquerda">
                                    <div className="icone-transacao">
                                        {renderizarIcone(transacao.icone)}
                                    </div>

                                    <div>
                                        <strong>{transacao.nome}</strong>

                                        <p>{transacao.data}</p>
                                    </div>
                                </div>

                                <span
                                    className={
                                        transacao.tipo === "RECEITA"
                                            ? "valor-positivo"
                                            : "valor-negativo"
                                    }
                                >
                                    {transacao.tipo === "RECEITA" ? "+" : "-"}

                                    {formatarMoeda(transacao.valor)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;
