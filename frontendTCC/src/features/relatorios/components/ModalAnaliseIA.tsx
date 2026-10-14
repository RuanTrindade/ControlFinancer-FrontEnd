import { useEffect, useMemo, useState } from "react";

import {
    RiCloseLine,
    RiRobot2Line,
    RiAlertLine,
    RiLightbulbLine,
    RiArrowLeftRightLine,
    RiSparklingLine,
    RiWallet3Line,
    RiArrowUpCircleLine,
    RiArrowDownCircleLine,
    RiLineChartLine,
} from "react-icons/ri";

import { BiTargetLock } from "react-icons/bi";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { buscarAnaliseIA } from "../services/analiseIAService";

import type { AnaliseIAResponse } from "../types/analiseIA";

import "../styles/modalAnaliseIA.css";

type ModalAnaliseIAProps = {
    aberto: boolean;

    onClose: () => void;

    usuarioId: number;

    mes: number;

    ano: number;
};

function ModalAnaliseIA({
    aberto,

    onClose,

    usuarioId,

    mes,

    ano,
}: ModalAnaliseIAProps) {
    const [loading, setLoading] = useState(false);

    const [erro, setErro] = useState("");

    const [analise, setAnalise] = useState<AnaliseIAResponse | null>(null);

    useEffect(() => {
        if (!aberto) {
            return;
        }

        async function carregar() {
            try {
                setLoading(true);

                setErro("");

                const resposta = await buscarAnaliseIA(
                    usuarioId,

                    mes,

                    ano,
                );

                setAnalise(resposta);
            } catch (error) {
                console.error("Erro ao gerar análise IA:", error);

                setErro(
                    error instanceof Error ? error.message : "Não foi possível gerar a análise.",
                );
            } finally {
                setLoading(false);
            }
        }

        carregar();
    }, [aberto, usuarioId, mes, ano]);

    useEffect(() => {
        if (!aberto) {
            return;
        }

        function fecharComEsc(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener("keydown", fecharComEsc);

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", fecharComEsc);

            document.body.style.overflow = "";
        };
    }, [aberto, onClose]);

    const alertas = useMemo(() => {
        return (analise?.alertas ?? []).filter((item) => item.mensagem?.trim());
    }, [analise]);

    const sugestoes = useMemo(() => {
        return (analise?.sugestoes ?? []).filter(
            (item) => item.titulo?.trim() || item.descricao?.trim(),
        );
    }, [analise]);

    const redistribuicoes = useMemo(() => {
        return (analise?.redistribuicoes ?? []).filter(
            (item) => item.origem?.trim() && item.destino?.trim(),
        );
    }, [analise]);

    const insights = useMemo(() => {
        return (analise?.insights ?? []).filter((item) => item?.trim());
    }, [analise]);

    const maiorValorGrafico = useMemo(() => {
        if (!analise) {
            return 1000;
        }

        const valores = analise.historico.flatMap((item) => [
            item.receita,

            item.despesa,

            item.investimento,
        ]);

        const maior = Math.max(...valores, 0);

        if (maior <= 0) {
            return 1000;
        }

        return Math.ceil(maior / 500) * 500;
    }, [analise]);

    function formatarMoeda(valor: number) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",

            currency: "BRL",
        });
    }

    function formatarPercentual(valor: number) {
        const numero = Number(valor || 0);

        if (numero > 0) {
            return `+${numero.toFixed(2)}%`;
        }

        return `${numero.toFixed(2)}%`;
    }

    function nomeMes(referencia: string) {
        const [mesReferencia] = referencia.split("/");

        const meses = [
            "",
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

        return meses[Number(mesReferencia)] ?? referencia;
    }

    function nivelTexto(nivel: string) {
        switch (nivel) {
            case "MUITO_BOM":
                return "Muito bom";

            case "BOM":
                return "Bom";

            case "ATENCAO":
                return "Atenção";

            case "CRITICO":
                return "Crítico";

            default:
                return "Indefinido";
        }
    }

    if (!aberto) {
        return null;
    }

    return (
        <div
            className="overlay-modal-ia"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="modal-analise-ia">
                <div className="topo-modal-ia">
                    <div className="titulo-modal-ia">
                        <div className="icone-titulo-modal-ia">
                            <RiRobot2Line />
                        </div>

                        <div>
                            <span>Análise inteligente</span>

                            <h2>Relatório Financeiro IA</h2>

                            <p>
                                Análise referente a {String(mes).padStart(2, "0")}/{ano}
                            </p>
                        </div>
                    </div>

                    <button type="button" className="fechar-modal-ia" onClick={onClose}>
                        <RiCloseLine />
                    </button>
                </div>

                {loading && (
                    <div className="loading-modal-ia">
                        <div className="robo-loading-ia">
                            <RiRobot2Line />
                        </div>

                        <strong>Analisando suas finanças...</strong>

                        <p>A inteligência artificial está avaliando seus dados financeiros.</p>

                        <div className="barra-loading-ia">
                            <span />
                        </div>
                    </div>
                )}

                {!loading && erro && (
                    <div className="erro-modal-ia">
                        <RiAlertLine />

                        <strong>Não foi possível gerar a análise</strong>

                        <p>{erro}</p>
                    </div>
                )}

                {!loading && !erro && analise && (
                    <div className="conteudo-modal-ia">
                        <section className="resumo-principal-ia">
                            <div className="resumo-principal-topo">
                                <div>
                                    <span>Situação financeira</span>

                                    <strong>{nivelTexto(analise.nivelFinanceiro)}</strong>
                                </div>

                                <div
                                    className={`
                                            nivel-financeiro-ia
                                            nivel-${analise.nivelFinanceiro.toLowerCase()}
                                        `}
                                >
                                    {nivelTexto(analise.nivelFinanceiro)}
                                </div>
                            </div>

                            <p className="texto-resumo-ia">{analise.resumo}</p>
                        </section>

                        <section className="grade-indicadores-ia">
                            <div className="card-indicador-ia">
                                <div className="icone-indicador-ia saldo">
                                    <RiWallet3Line />
                                </div>

                                <span>Saldo acumulado</span>

                                <strong>{formatarMoeda(analise.indicadores.saldo)}</strong>
                            </div>

                            <div className="card-indicador-ia">
                                <div className="icone-indicador-ia receita">
                                    <RiArrowUpCircleLine />
                                </div>

                                <span>Receita</span>

                                <strong>{formatarMoeda(analise.indicadores.receitaMes)}</strong>
                            </div>

                            <div className="card-indicador-ia">
                                <div className="icone-indicador-ia despesa">
                                    <RiArrowDownCircleLine />
                                </div>

                                <span>Despesa</span>

                                <strong>{formatarMoeda(analise.indicadores.despesaMes)}</strong>
                            </div>

                            <div className="card-indicador-ia">
                                <div className="icone-indicador-ia investimento">
                                    <RiLineChartLine />
                                </div>

                                <span>Investido no mês</span>

                                <strong>
                                    {formatarMoeda(analise.indicadores.investimentoMes)}
                                </strong>
                            </div>
                        </section>

                        <section className="grade-historico-ia">
                            <div className="card-secao-ia grafico-historico-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Evolução financeira</span>

                                        <h3>Últimos 6 meses</h3>
                                    </div>
                                </div>

                                <div className="grafico-modal-ia">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={analise.historico}
                                            margin={{
                                                top: 15,
                                                right: 15,
                                                left: 5,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} stroke="#e5e7eb" />

                                            <XAxis
                                                dataKey="mes"
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={nomeMes}
                                                tick={{
                                                    fill: "#9ca3af",
                                                    fontSize: 12,
                                                }}
                                            />

                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                width={70}
                                                domain={[0, maiorValorGrafico]}
                                                tick={{
                                                    fill: "#9ca3af",
                                                    fontSize: 11,
                                                }}
                                                tickFormatter={(valor) =>
                                                    `R$ ${Number(valor).toLocaleString("pt-BR")}`
                                                }
                                            />

                                            <Tooltip
                                                formatter={(valor) => formatarMoeda(Number(valor))}
                                                labelFormatter={(referencia) =>
                                                    `Mês: ${referencia}`
                                                }
                                            />

                                            <Legend iconType="circle" iconSize={7} />

                                            <Line
                                                type="monotone"
                                                dataKey="receita"
                                                name="Receita"
                                                stroke="#22c55e"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    strokeWidth: 0,
                                                    fill: "#22c55e",
                                                }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="despesa"
                                                name="Despesa"
                                                stroke="#ef4444"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    strokeWidth: 0,
                                                    fill: "#ef4444",
                                                }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="investimento"
                                                name="Investimento"
                                                stroke="#0ea5e9"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    strokeWidth: 0,
                                                    fill: "#0ea5e9",
                                                }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card-secao-ia comparacao-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Comparação</span>

                                        <h3>Mês anterior</h3>
                                    </div>
                                </div>

                                <div className="item-comparacao-ia">
                                    <span>Receita</span>

                                    <strong>
                                        {formatarPercentual(
                                            analise.comparacaoMensal.receitaVariacao,
                                        )}
                                    </strong>
                                </div>

                                <div className="item-comparacao-ia">
                                    <span>Despesa</span>

                                    <strong>
                                        {formatarPercentual(
                                            analise.comparacaoMensal.despesaVariacao,
                                        )}
                                    </strong>
                                </div>

                                <div className="item-comparacao-ia">
                                    <span>Investimento</span>

                                    <strong>
                                        {formatarPercentual(
                                            analise.comparacaoMensal.investimentoVariacao,
                                        )}
                                    </strong>
                                </div>

                                {analise.comparacaoMensal.mensagem?.trim() && (
                                    <p className="texto-comparacao-ia">
                                        {analise.comparacaoMensal.mensagem}
                                    </p>
                                )}
                            </div>
                        </section>

                        {alertas.length > 0 && (
                            <section className="card-secao-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Atenção</span>

                                        <h3>Alertas financeiros</h3>
                                    </div>

                                    <RiAlertLine />
                                </div>

                                <div className="lista-alertas-ia">
                                    {alertas.map((alerta, index) => (
                                        <div
                                            key={`${alerta.tipo}-${index}`}
                                            className={`
                                                                item-alerta-ia
                                                                alerta-${alerta.severidade.toLowerCase()}
                                                            `}
                                        >
                                            <div>
                                                <strong>
                                                    {alerta.categoria?.trim() || alerta.tipo}
                                                </strong>

                                                <p>{alerta.mensagem}</p>
                                            </div>

                                            <span>{alerta.severidade}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {redistribuicoes.length > 0 && (
                            <section className="card-secao-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Planejamento</span>

                                        <h3>Redistribuição sugerida</h3>
                                    </div>

                                    <RiArrowLeftRightLine />
                                </div>

                                <div className="lista-redistribuicoes-ia">
                                    {redistribuicoes.map((item, index) => (
                                        <div key={index} className="item-redistribuicao-ia">
                                            <div className="fluxo-redistribuicao-ia">
                                                <strong>{item.origem}</strong>

                                                <div>
                                                    <span>{formatarMoeda(item.valorSugerido)}</span>

                                                    <RiArrowLeftRightLine />
                                                </div>

                                                <strong>{item.destino}</strong>
                                            </div>

                                            {item.motivo?.trim() && <p>{item.motivo}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {sugestoes.length > 0 && (
                            <section className="card-secao-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Recomendações</span>

                                        <h3>Sugestões da IA</h3>
                                    </div>

                                    <RiLightbulbLine />
                                </div>

                                <div className="grade-sugestoes-ia">
                                    {sugestoes.map((sugestao, index) => (
                                        <div key={index} className="item-sugestao-ia">
                                            <div className="topo-sugestao-ia">
                                                <strong>{sugestao.titulo || "Sugestão"}</strong>

                                                <span
                                                    className={`
                                                                        prioridade-ia
                                                                        prioridade-${sugestao.prioridade.toLowerCase()}
                                                                    `}
                                                >
                                                    {sugestao.prioridade}
                                                </span>
                                            </div>

                                            {sugestao.descricao?.trim() && (
                                                <p>{sugestao.descricao}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {analise.objetivos.length > 0 && (
                            <section className="card-secao-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Metas</span>

                                        <h3>Objetivos financeiros</h3>
                                    </div>

                                    <BiTargetLock />
                                </div>

                                <div className="lista-objetivos-ia">
                                    {analise.objetivos.map((objetivo) => (
                                        <div key={objetivo.id} className="item-objetivo-ia">
                                            <div className="topo-objetivo-ia">
                                                <strong>{objetivo.nome}</strong>

                                                <span>{objetivo.percentual.toFixed(0)}%</span>
                                            </div>

                                            <div className="barra-objetivo-ia">
                                                <span
                                                    style={{
                                                        width: `${Math.min(
                                                            objetivo.percentual,
                                                            100,
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <div className="valores-objetivo-ia">
                                                <span>{formatarMoeda(objetivo.valorAtual)}</span>

                                                <strong>
                                                    {formatarMoeda(objetivo.valorObjetivo)}
                                                </strong>
                                            </div>

                                            {objetivo.recomendacao?.trim() && (
                                                <p>{objetivo.recomendacao}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="card-secao-ia">
                            <div className="cabecalho-secao-ia">
                                <div>
                                    <span>Patrimônio</span>

                                    <h3>Investimentos</h3>
                                </div>

                                <RiLineChartLine />
                            </div>

                            <div className="grade-investimentos-ia">
                                <div>
                                    <span>Carteira</span>

                                    <strong>
                                        {formatarMoeda(analise.investimentos.valorCarteira)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Aportes</span>

                                    <strong>
                                        {formatarMoeda(analise.investimentos.aportesMes)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Resgates</span>

                                    <strong>
                                        {formatarMoeda(analise.investimentos.resgatesMes)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Rendimentos</span>

                                    <strong>
                                        {formatarMoeda(analise.investimentos.rendimentoAcumulado)}
                                    </strong>
                                </div>
                            </div>

                            {analise.investimentos.mensagem?.trim() && (
                                <p className="mensagem-investimentos-ia">
                                    {analise.investimentos.mensagem}
                                </p>
                            )}
                        </section>

                        {insights.length > 0 && (
                            <section className="card-secao-ia">
                                <div className="cabecalho-secao-ia">
                                    <div>
                                        <span>Inteligência financeira</span>

                                        <h3>Insights</h3>
                                    </div>

                                    <RiSparklingLine />
                                </div>

                                <div className="lista-insights-ia">
                                    {insights.map((insight, index) => (
                                        <div key={index} className="item-insight-ia">
                                            <RiSparklingLine />

                                            <p>{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ModalAnaliseIA;
