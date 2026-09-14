import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useMes } from "../../../context/MesContext";

import DashboardLayout from "../../../layouts/DashboardLayout";

import {
    RiAddLine,
    RiArrowDownLine,
    RiArrowUpLine,
    RiBankLine,
    RiCoinsLine,
    RiErrorWarningLine,
    RiLineChartLine,
    RiCheckLine,
    RiArrowRightSLine,
} from "react-icons/ri";

import { buscarResumoCarteira, listarInvestimentos } from "../services/investimentoService";

import type { CarteiraInvestimentoResumo, InvestimentoCard } from "../types/investimento";

import FormInvestimento from "../components/FormInvestimento";

import "../styles/investimentos.css";

type AbaInvestimento = "ATIVOS" | "ENCERRADOS";

function Investimentos() {
    /* ===================================================
       NAVEGAÇÃO
    =================================================== */

    const navigate = useNavigate();

    /* ===================================================
       USUÁRIO
    =================================================== */

    /*
     * TEMPORÁRIO.
     *
     * Depois pegaremos o ID do usuário
     * autenticado.
     */
    const USUARIO_ID = 1;

    /* ===================================================
       PERÍODO
    =================================================== */

    const { referenciaAtual, mes: mesSelecionado, ano: anoSelecionado } = useMes();

    /* ===================================================
       ESTADOS
    =================================================== */

    const [aba, setAba] = useState<AbaInvestimento>("ATIVOS");

    /*
     * IMPORTANTE:
     *
     * Spring começa a paginação em 0.
     */
    const [pagina, setPagina] = useState(0);

    const [investimentos, setInvestimentos] = useState<InvestimentoCard[]>([]);

    const [modalNovoInvestimento, setModalNovoInvestimento] = useState(false);

    const [resumoCarteira, setResumoCarteira] = useState<CarteiraInvestimentoResumo | null>(null);

    const [totalPaginas, setTotalPaginas] = useState(0);

    const [carregando, setCarregando] = useState(true);

    const [erro, setErro] = useState<string | null>(null);

    async function carregarDados() {
        try {
            setCarregando(true);
            setErro(null);

            const encerrado = aba === "ENCERRADOS";

            const [paginaInvestimentos, resumo] = await Promise.all([
                listarInvestimentos(
                    USUARIO_ID,
                    encerrado,
                    mesSelecionado,
                    anoSelecionado,
                    pagina,
                    2,
                ),

                buscarResumoCarteira(USUARIO_ID, mesSelecionado, anoSelecionado),
            ]);

            setInvestimentos(paginaInvestimentos.content);

            setTotalPaginas(paginaInvestimentos.totalPages);

            setResumoCarteira(resumo);
        } catch (error) {
            console.error("Erro ao carregar investimentos:", error);

            setErro("Não foi possível carregar os investimentos.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, [aba, pagina, referenciaAtual]);

    useEffect(() => {
        setPagina(0);
    }, [referenciaAtual]);

    /* ===================================================
       FORMATAR MOEDA
    =================================================== */

    function formatarMoeda(valor: number) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    /* ===================================================
       TROCAR ABA
    =================================================== */

    function trocarAba(novaAba: AbaInvestimento) {
        setAba(novaAba);

        /*
         * Ao trocar entre ativos e encerrados,
         * voltamos para a primeira página.
         */
        setPagina(0);
    }

    /* ===================================================
       RENDER
    =================================================== */

    return (
        <DashboardLayout>
            <div className="pagina-investimentos">
                {/* ==========================
                    CABEÇALHO
                ========================== */}

                <div className="topo-investimentos">
                    <div className="titulo-investimentos">
                        <h1>Investimentos</h1>

                        <p>Acompanhe sua carteira e seus rendimentos</p>
                    </div>

                    <button
                        type="button"
                        className="botao-novo-investimento"
                        onClick={() => setModalNovoInvestimento(true)}
                    >
                        <RiAddLine />
                        Novo investimento
                    </button>
                </div>

                {/* ==========================
                    ERRO
                ========================== */}

                {erro && (
                    <div className="mensagem-erro-investimentos">
                        <RiErrorWarningLine />

                        {erro}
                    </div>
                )}

                {/* ==========================
                    RESUMO DA CARTEIRA
                ========================== */}

                <section className="resumo-investimentos">
                    <div className="fundo-resumo-investimentos">
                        <div className="texto-resumo-investimentos">
                            <span>Visão geral</span>

                            <h2>Sua carteira de investimentos</h2>
                        </div>
                    </div>

                    <div className="linha-cards-carteira">
                        {/* ==========================
                            APORTE
                        ========================== */}

                        <div className="card-lateral-carteira">
                            <div className="topo-card-lateral">
                                <div className="icone-resumo aporte">
                                    <RiArrowUpLine />
                                </div>

                                <span>Este mês</span>
                            </div>

                            <div className="conteudo-card-lateral">
                                <span>Aportes</span>

                                <strong>{formatarMoeda(resumoCarteira?.aportesMes ?? 0)}</strong>
                            </div>
                        </div>

                        {/* ==========================
                            SALDO PRINCIPAL
                        ========================== */}

                        <div className="card-saldo-carteira">
                            <div className="topo-saldo-carteira">
                                <div className="icone-saldo-carteira">
                                    <RiCoinsLine />
                                </div>

                                <div className="texto-saldo-carteira">
                                    <span>Valor de referência da carteira</span>

                                    <strong>
                                        {formatarMoeda(resumoCarteira?.valorCarteiraNoMes ?? 0)}
                                    </strong>

                                    <small>Com base nos últimos valores informados</small>
                                </div>
                            </div>

                            <div className="divisor-saldo-carteira" />

                            <div className="rendimento-saldo-carteira">
                                <div>
                                    <span>Rendimento no mês</span>

                                    <strong>
                                        + {formatarMoeda(resumoCarteira?.rendimentoMes ?? 0)}
                                    </strong>
                                </div>

                                <div className="icone-rendimento-carteira">
                                    <RiLineChartLine />
                                </div>
                            </div>
                        </div>

                        {/* ==========================
                            RESGATE
                        ========================== */}

                        <div className="card-lateral-carteira">
                            <div className="topo-card-lateral">
                                <div className="icone-resumo resgate">
                                    <RiArrowDownLine />
                                </div>

                                <span>Este mês</span>
                            </div>

                            <div className="conteudo-card-lateral">
                                <span>Resgates</span>

                                <strong>{formatarMoeda(resumoCarteira?.resgatesMes ?? 0)}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==========================
                    MEUS INVESTIMENTOS
                ========================== */}

                <section className="secao-meus-investimentos">
                    <div className="cabecalho-meus-investimentos">
                        <div className="abas-investimentos">
                            <button
                                type="button"
                                className={
                                    aba === "ATIVOS" ? "aba-investimento ativa" : "aba-investimento"
                                }
                                onClick={() => trocarAba("ATIVOS")}
                            >
                                Em andamento
                            </button>

                            <button
                                type="button"
                                className={
                                    aba === "ENCERRADOS"
                                        ? "aba-investimento ativa"
                                        : "aba-investimento"
                                }
                                onClick={() => trocarAba("ENCERRADOS")}
                            >
                                Encerrados
                            </button>
                        </div>
                    </div>

                    {/* ==========================
                        CARREGANDO
                    ========================== */}

                    {carregando && (
                        <div className="mensagem-investimentos">Carregando investimentos...</div>
                    )}

                    {/* ==========================
                        SEM INVESTIMENTOS
                    ========================== */}

                    {!carregando && !erro && investimentos.length === 0 && (
                        <div className="mensagem-investimentos">
                            {aba === "ATIVOS"
                                ? "Você ainda não possui investimentos em andamento."
                                : "Você ainda não possui investimentos encerrados."}
                        </div>
                    )}

                    {/* ==========================
                        CARDS
                    ========================== */}

                    {!carregando && !erro && (
                        <div className="grid-investimentos">
                            {investimentos.map((investimento) => (
                                <button
                                    type="button"
                                    className={
                                        investimento.encerrado
                                            ? "card-investimento-novo encerrado"
                                            : "card-investimento-novo"
                                    }
                                    key={investimento.id}
                                    onClick={() => navigate(`/investimentos/${investimento.id}`)}
                                >
                                    {/* TOPO */}

                                    <div className="topo-card-investimento">
                                        <div className="identificacao-investimento">
                                            <div className="icone-investimento-novo">
                                                <RiBankLine />
                                            </div>

                                            <div>
                                                <strong>{investimento.nome}</strong>

                                                <span>
                                                    {investimento.tipo.replaceAll("_", " ")}
                                                </span>
                                            </div>
                                        </div>

                                        <RiArrowRightSLine className="seta-investimento" />
                                    </div>

                                    {/* SALDO */}

                                    <div className="saldo-investimento">
                                        <span>
                                            {investimento.pendenteAtualizacao
                                                ? "Último valor conhecido"
                                                : "Valor no mês"}
                                        </span>

                                        <strong>
                                            {investimento.valorNoMes !== null
                                                ? formatarMoeda(investimento.valorNoMes)
                                                : "—"}
                                        </strong>
                                    </div>

                                    {/* INFORMAÇÕES */}

                                    <div className="informacoes-investimento">
                                        {/* RENDIMENTO */}

                                        <div>
                                            <span>Rendimento no mês</span>

                                            {investimento.rendimentoMes !== null ? (
                                                <strong className="rendimento-investimento">
                                                    + {formatarMoeda(investimento.rendimentoMes)}
                                                </strong>
                                            ) : (
                                                <strong className="sem-rendimento">—</strong>
                                            )}
                                        </div>

                                        {/* STATUS */}

                                        <div className="status-investimento">
                                            {investimento.encerrado ? (
                                                <span className="status-encerrado">
                                                    <RiCheckLine />
                                                    Encerrado
                                                </span>
                                            ) : !investimento.pendenteAtualizacao ? (
                                                <span className="status-atualizado">
                                                    <RiCheckLine />
                                                    Atualizado
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="status-pendente botao-atualizar-card"
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        navigate(
                                                            `/investimentos/${investimento.id}?acao=atualizar`,
                                                        );
                                                    }}
                                                >
                                                    <RiErrorWarningLine />
                                                    Atualizar valor
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ==========================
                        PAGINAÇÃO
                    ========================== */}

                    {!carregando && !erro && totalPaginas > 1 && (
                        <div className="paginacao-investimentos">
                            {/* ANTERIOR */}

                            <button
                                type="button"
                                className="botao-paginacao-investimento"
                                disabled={pagina === 0}
                                onClick={() => setPagina(pagina - 1)}
                            >
                                Anterior
                            </button>

                            {/* NÚMEROS */}

                            {Array.from(
                                {
                                    length: totalPaginas,
                                },
                                (_, index) => {
                                    const numeroPagina = index + 1;

                                    return (
                                        <button
                                            type="button"
                                            key={numeroPagina}
                                            className={
                                                pagina === index
                                                    ? "numero-pagina-investimento ativo"
                                                    : "numero-pagina-investimento"
                                            }
                                            onClick={() => setPagina(index)}
                                        >
                                            {numeroPagina}
                                        </button>
                                    );
                                },
                            )}

                            {/* PRÓXIMA */}

                            <button
                                type="button"
                                className="botao-paginacao-investimento"
                                disabled={pagina >= totalPaginas - 1}
                                onClick={() => setPagina(pagina + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {modalNovoInvestimento && (
                <FormInvestimento
                    usuarioId={USUARIO_ID}

                    onClose={() => setModalNovoInvestimento(false)}

                    onSalvar={async () => {
                        /*
                         * Depois de criar, queremos
                         * visualizar os investimentos ativos.
                         */
                        setAba("ATIVOS");

                        /*
                         * Voltamos para a primeira página.
                         */
                        if (pagina !== 0) {
                            setPagina(0);
                        } else {
                            /*
                             * Se já estivermos na primeira
                             * página, nenhum estado mudaria.
                             *
                             * Então atualizamos os dados
                             * diretamente.
                             */
                            await carregarDados();
                        }
                    }}
                />
            )}
        </DashboardLayout>
    );
}

export default Investimentos;
