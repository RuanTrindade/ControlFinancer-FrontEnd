import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";

import { useMes } from "../../../context/MesContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import { buscarRelatorio } from "../services/relatorioService";

import type { RelatorioResponse } from "../types/relatorio";

import ModalAnaliseIA from "../components/ModalAnaliseIA";

import { renderizarIcone } from "../../../utils/renderizarIcone";

import {
    RiRobot2Line,
    RiBarChartGroupedLine,
    RiLineChartLine,
    RiPieChart2Line,
} from "react-icons/ri";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import "../styles/relatorios.css";

type TipoGrafico = "barra" | "linha" | "pizza";

type RelatorioMensal = {
    mes: string;

    mesCompleto: string;

    receita: number;

    despesa: number;

    investimento: number;
};

type CategoriaRelatorio = {
    id: number;

    nome: string;

    valor: number;

    limite: number;

    percentual: number;

    cor: string;

    iconeNome: string;
};

function Relatorios() {
    const { id: USUARIO_ID } = useUsuarioLogado();

    const { mes: mesSelecionado, ano: anoSelecionado } = useMes();

    const [loading, setLoading] = useState(true);

    const [erro, setErro] = useState("");

    const [modalIAAberto, setModalIAAberto] = useState(false);

    const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("barra");

    const [dadosBackend, setDadosBackend] = useState<RelatorioResponse | null>(null);

    useEffect(() => {
        async function carregarRelatorio() {
            try {
                setLoading(true);

                setErro("");

                const resposta = await buscarRelatorio(
                    USUARIO_ID,

                    mesSelecionado,

                    anoSelecionado,
                );

                setDadosBackend(resposta);
            } catch (error) {
                console.error("Erro ao carregar relatório:", error);

                setDadosBackend(null);

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar o relatório.",
                );
            } finally {
                setLoading(false);
            }
        }

        carregarRelatorio();
    }, [mesSelecionado, anoSelecionado]);

    const relatorio = useMemo<RelatorioMensal[]>(() => {
        return (dadosBackend?.historico ?? []).map((item) => {
            const [mes, ano] = item.mes.split("/");

            return {
                mes: obterMesAbreviado(Number(mes)),

                mesCompleto: `${obterMesCompleto(Number(mes))} ${ano}`,

                receita: item.receita,

                despesa: item.despesa,

                investimento: item.investimento,
            };
        });
    }, [dadosBackend]);

    const mesesBalanco = useMemo(() => {
        return relatorio.slice(-3).reverse();
    }, [relatorio]);

    const categorias = useMemo<CategoriaRelatorio[]>(() => {
        return (dadosBackend?.categoriasPlanejamento ?? []).map((categoria) => ({
            id: categoria.categoriaId,

            nome: categoria.nome,

            valor: categoria.utilizado,

            limite: categoria.limite,

            percentual: categoria.percentualUtilizado,

            cor: categoria.cor,

            iconeNome: categoria.icone,
        }));
    }, [dadosBackend]);

    const totalCategorias = useMemo(() => {
        return categorias.reduce(
            (total, categoria) => total + categoria.valor,

            0,
        );
    }, [categorias]);

    const dadosPizza = useMemo(() => {
        return categorias.map((categoria) => ({
            ...categoria,

            percentualDonut: totalCategorias > 0 ? (categoria.valor / totalCategorias) * 100 : 0,
        }));
    }, [categorias, totalCategorias]);

    const dadosPizzaExibicao = useMemo(() => {
        if (totalCategorias === 0) {
            return [
                {
                    id: -1,
                    nome: "Sem dados",
                    valor: 1,
                    limite: 0,
                    percentual: 0,
                    percentualDonut: 0,
                    cor: "#e5e7eb",
                    iconeNome: "",
                },
            ];
        }

        return dadosPizza;
    }, [dadosPizza, totalCategorias]);

    const maiorValorGrafico = useMemo(() => {
        const valores = relatorio.flatMap((item) => [
            item.receita,

            item.despesa,

            item.investimento,
        ]);

        const maior = Math.max(...valores, 0);

        if (maior <= 0) {
            return 1000;
        }

        return Math.ceil(maior / 500) * 500;
    }, [relatorio]);

    function formatarMoeda(valor: number) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",

            currency: "BRL",
        });
    }

    function obterMesAbreviado(mes: number) {
        const meses = [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
        ];

        return meses[mes - 1] ?? "";
    }

    function obterMesCompleto(mes: number) {
        const meses = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
        ];

        return meses[mes - 1] ?? "";
    }

    return (
        <DashboardLayout>
            {loading && <LoadingOverlay />}

            {erro && <div className="mensagem-erro-relatorio">{erro}</div>}

            <div className="pagina-relatorios">
                <div className="topo-relatorios">
                    <button className="botao-ia" onClick={() => setModalIAAberto(true)}>
                        <RiRobot2Line />
                        Relatório IA
                    </button>

                    <div className="troca-grafico">
                        <button
                            className={tipoGrafico === "barra" ? "ativo" : ""}
                            onClick={() => setTipoGrafico("barra")}
                        >
                            <RiBarChartGroupedLine />
                        </button>

                        <button
                            className={tipoGrafico === "linha" ? "ativo" : ""}
                            onClick={() => setTipoGrafico("linha")}
                        >
                            <RiLineChartLine />
                        </button>

                        <button
                            className={tipoGrafico === "pizza" ? "ativo" : ""}
                            onClick={() => setTipoGrafico("pizza")}
                        >
                            <RiPieChart2Line />
                        </button>
                    </div>

                    <div className="acoes-relatorio"></div>
                </div>

                <div className="card-relatorio">
                    <div className="conteudo-relatorio">
                        {tipoGrafico === "barra" && (
                            <>
                                <div className="area-grafico-relatorio">
                                    <div className="titulo-grafico-relatorio">
                                        Resultados nos últimos 6 meses
                                    </div>

                                    <div className="grafico-relatorio">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={relatorio}
                                                margin={{
                                                    top: 20,
                                                    right: 20,
                                                    left: 10,
                                                    bottom: 10,
                                                }}
                                                barGap={5}
                                                barCategoryGap="32%"
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="0"
                                                    vertical={false}
                                                    stroke="#e5e7eb"
                                                />

                                                <XAxis
                                                    dataKey="mes"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fill: "#9ca3af",
                                                        fontSize: 13,
                                                    }}
                                                />

                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={80}
                                                    domain={[0, maiorValorGrafico]}
                                                    tick={{
                                                        fill: "#9ca3af",
                                                        fontSize: 12,
                                                    }}
                                                    tickFormatter={(valor) =>
                                                        `R$ ${Number(valor).toLocaleString(
                                                            "pt-BR",
                                                        )}`
                                                    }
                                                />

                                                <Tooltip
                                                    formatter={(valor) =>
                                                        formatarMoeda(Number(valor))
                                                    }
                                                    labelFormatter={(mes) => `Mês: ${mes}`}
                                                    contentStyle={{
                                                        borderRadius: "12px",

                                                        border: "1px solid #e5e7eb",

                                                        boxShadow:
                                                            "0 10px 30px rgba(15, 23, 42, .12)",
                                                    }}
                                                />

                                                <Legend
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    iconType="circle"
                                                    iconSize={8}
                                                    wrapperStyle={{
                                                        paddingTop: "18px",

                                                        fontSize: "13px",

                                                        fontWeight: 600,
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="receita"
                                                    name="Receita"
                                                    fill="#00ef17"
                                                    radius={[8, 8, 0, 0]}
                                                    maxBarSize={18}
                                                />

                                                <Bar
                                                    dataKey="despesa"
                                                    name="Despesa"
                                                    fill="#ff1717"
                                                    radius={[8, 8, 0, 0]}
                                                    maxBarSize={18}
                                                />

                                                <Bar
                                                    dataKey="investimento"
                                                    name="Investimento"
                                                    fill="#10b8f5"
                                                    radius={[8, 8, 0, 0]}
                                                    maxBarSize={18}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <aside className="balanco-mensal">
                                    <h3>Balanço Mensal</h3>

                                    {mesesBalanco.map((mes) => (
                                        <div key={mes.mesCompleto} className="bloco-balanco">
                                            <strong className="titulo-mes">
                                                {mes.mesCompleto}
                                            </strong>

                                            <div className="linha-balanco">
                                                <span>Receita</span>

                                                <strong>{formatarMoeda(mes.receita)}</strong>
                                            </div>

                                            <div className="linha-balanco">
                                                <span>Despesa</span>

                                                <strong>{formatarMoeda(mes.despesa)}</strong>
                                            </div>

                                            <div className="linha-balanco">
                                                <span>Investimento</span>

                                                <strong>{formatarMoeda(mes.investimento)}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </aside>
                            </>
                        )}

                        {tipoGrafico === "linha" && (
                            <div className="area-grafico-linha">
                                <div className="titulo-grafico-relatorio">
                                    Resultados nos últimos 6 meses
                                </div>

                                <div className="grafico-linha-relatorio">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={relatorio}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 10,
                                                bottom: 10,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} stroke="#e5e7eb" />

                                            <XAxis
                                                dataKey="mes"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#9ca3af",
                                                    fontSize: 13,
                                                }}
                                            />

                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                width={80}
                                                domain={[0, maiorValorGrafico]}
                                                tick={{
                                                    fill: "#9ca3af",
                                                    fontSize: 12,
                                                }}
                                                tickFormatter={(valor) =>
                                                    `R$ ${Number(valor).toLocaleString("pt-BR")}`
                                                }
                                            />

                                            <Tooltip
                                                formatter={(valor) => formatarMoeda(Number(valor))}
                                                labelFormatter={(mes) => `Mês: ${mes}`}
                                                contentStyle={{
                                                    borderRadius: "12px",

                                                    border: "1px solid #e5e7eb",

                                                    boxShadow: "0 10px 30px rgba(15, 23, 42, .12)",
                                                }}
                                            />

                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                iconType="plainline"
                                                wrapperStyle={{
                                                    paddingTop: "18px",

                                                    fontSize: "13px",

                                                    fontWeight: 600,
                                                }}
                                            />

                                            <Line
                                                type="linear"
                                                dataKey="receita"
                                                name="Receita"
                                                stroke="#00ef17"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 5,
                                                    fill: "#00ef17",
                                                    strokeWidth: 0,
                                                }}
                                                activeDot={{
                                                    r: 7,
                                                }}
                                            />

                                            <Line
                                                type="linear"
                                                dataKey="despesa"
                                                name="Despesa"
                                                stroke="#ff1717"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 5,
                                                    fill: "#ff1717",
                                                    strokeWidth: 0,
                                                }}
                                                activeDot={{
                                                    r: 7,
                                                }}
                                            />

                                            <Line
                                                type="linear"
                                                dataKey="investimento"
                                                name="Investimento"
                                                stroke="#10b8f5"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 5,
                                                    fill: "#10b8f5",
                                                    strokeWidth: 0,
                                                }}
                                                activeDot={{
                                                    r: 7,
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {tipoGrafico === "pizza" && (
                            <div className="area-pizza-relatorio">
                                <div className="grafico-donut">
                                    <ResponsiveContainer width={430} height={430}>
                                        <PieChart>
                                            <Pie
                                                data={dadosPizzaExibicao}
                                                dataKey="valor"
                                                nameKey="nome"
                                                innerRadius={110}
                                                outerRadius={160}
                                                paddingAngle={0}
                                                stroke="none"
                                            >
                                                {dadosPizzaExibicao.map((item) => (
                                                    <Cell key={item.id} fill={item.cor} />
                                                ))}
                                            </Pie>

                                            {totalCategorias > 0 && (
                                                <Tooltip
                                                    formatter={(valor) =>
                                                        formatarMoeda(Number(valor ?? 0))
                                                    }
                                                />
                                            )}
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="centro-donut">
                                        <small>Utilizado</small>

                                        <strong>{formatarMoeda(totalCategorias)}</strong>
                                    </div>
                                </div>

                                <div className="categorias-relatorio">
                                    <h2>Categorias</h2>

                                    {categorias.length === 0 ? (
                                        <div className="categorias-relatorio-vazio">
                                            Nenhum planejamento criado neste mês.
                                        </div>
                                    ) : (
                                        dadosPizza.map((categoria) => (
                                            <div key={categoria.id} className="item-categoria-R">
                                                <div
                                                    className="icone-categoria"
                                                    style={{
                                                        background: categoria.cor,
                                                    }}
                                                >
                                                    {renderizarIcone(categoria.iconeNome)}
                                                </div>

                                                <div className="info-categoria-R">
                                                    <span>{categoria.nome}</span>

                                                    <small>
                                                        {categoria.percentual.toFixed(0)}%
                                                    </small>
                                                </div>

                                                <strong>{formatarMoeda(categoria.valor)}</strong>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ModalAnaliseIA
                aberto={modalIAAberto}
                onClose={() => setModalIAAberto(false)}
                usuarioId={USUARIO_ID}
                mes={mesSelecionado}
                ano={anoSelecionado}
            />
        </DashboardLayout>
    );
}

export default Relatorios;
