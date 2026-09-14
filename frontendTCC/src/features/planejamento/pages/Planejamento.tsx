import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import PlanejamentoVazio from "../components/PlanejamentoVazio";
import Overlay from "../../../shared/components/Overlay";
import FormPlanejamento from "../components/FormPlanejamento";
import FormPlanejamentoCategorias from "../components/FormPlanejamentoCategorias";
import FormAdicionarCategoriaPlanejamento from "../components/FormAdicionarCategoriaPlanejamento";
import FormEditarCategoriaPlanejamento from "../components/FormEditarCategoriaPlanejamento";
import ConfirmarExclusaoCategoriaPlanejamento from "../components/ConfirmarExclusaoCategoriaPlanejamento";
import FormEditarPlanejamento from "../components/FormEditarPlanejamento";
import ConfirmarExclusaoPlanejamento from "../components/ConfirmarExclusaoPlanejamento";
import type { PlanejamentoDashboard } from "../types/planejamento";
import { renderizarIcone } from "../../../utils/renderizarIcone";
import {
    listarPlanejamentosUsuario,
    buscarDashboardPlanejamento,
    criarPlanejamento,
    copiarPlanejamento,
} from "../services/planejamentoService";

import {
    salvarCategoriaPlanejamento,
    buscarResumoCategoriasPaginado,
} from "../services/planejamentoCategoriaService";

import { useMes } from "../../../context/MesContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import {
    RiAddLine,
    RiMore2Fill,
    RiEdit2Line,
    RiDeleteBin6Line,
    RiNotification3Line,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiArrowUpLine,
    RiArrowDownLine,
    RiScales3Line,
    RiWallet3Line,
} from "react-icons/ri";

import "../styles/planejamento.css";
import "../styles/planejamentoVazio.css";

type CategoriaPlanejamento = {
    id: number | null;

    nome: string;

    icone: React.ReactNode;

    cor: string;

    meta: number;

    pago: number;

    previsto: number;

    categoriaRestante?: boolean;
};

type CategoriaFormulario = {
    id: number;

    nome: string;

    cor: string;

    valor: number;

    icone: React.ReactNode;
};

function referenciaPertenceAoMes(referencia: string, mes: number, ano: number): boolean {
    const [anoReferencia, mesReferencia] = referencia.split("-");

    return Number(anoReferencia) === ano && Number(mesReferencia) === mes;
}

function obterMesAnterior(referencia: Date): Date {
    return new Date(referencia.getFullYear(), referencia.getMonth() - 1, 1);
}

function formatarReferenciaBackend(data: Date): string {
    const ano = data.getFullYear();

    const mes = String(data.getMonth() + 1).padStart(2, "0");

    return `${ano}-${mes}-01`;
}

function Planejamento() {
    const [etapa, setEtapa] = useState(1);

    const [loading, setLoading] = useState(false);

    const [possuiPlanejamento, setPossuiPlanejamento] = useState(false);

    const [modalPlanejamento, setModalPlanejamento] = useState(false);

    const [modalAdicionarCategoria, setModalAdicionarCategoria] = useState(false);

    const [categoriaEditando, setCategoriaEditando] = useState<CategoriaPlanejamento | null>(null);

    const [categoriaExcluindo, setCategoriaExcluindo] = useState<CategoriaPlanejamento | null>(
        null,
    );

    const [menuPlanejamentoAberto, setMenuPlanejamentoAberto] = useState(false);

    const [modalEditarPlanejamento, setModalEditarPlanejamento] = useState(false);

    const [modalExcluirPlanejamento, setModalExcluirPlanejamento] = useState(false);

    const [dashboard, setDashboard] = useState<PlanejamentoDashboard | null>(null);

    const [erro, setErro] = useState("");

    const [salvandoPlanejamento, setSalvandoPlanejamento] = useState(false);

    const [pagina, setPagina] = useState(1);

    const [categoriasPagina, setCategoriasPagina] = useState<CategoriaPlanejamento[]>([]);

    const [totalPaginas, setTotalPaginas] = useState(0);

    const { id: USUARIO_ID } = useUsuarioLogado();

    const { referenciaAtual, mes: mesSelecionado, ano: anoSelecionado } = useMes();

    const [copiandoPlanejamento, setCopiandoPlanejamento] = useState(false);

    const [renda, setRenda] = useState("");

    const [percentualEconomia, setPercentualEconomia] = useState("");

    const [categoriasFormulario, setCategoriasFormulario] = useState<CategoriaFormulario[]>([]);

    const rendaNumero = Number(renda) || 0;

    const economiaNumero = Number(percentualEconomia) || 0;

    const limitePlanejamento = rendaNumero - (rendaNumero * economiaNumero) / 100;

    async function carregarPaginaCategorias(planejamentoId: number, paginaFrontend: number) {
        try {
            const paginaBackend = paginaFrontend - 1;

            const resposta = await buscarResumoCategoriasPaginado(planejamentoId, paginaBackend);

            const categoriasMapeadas: CategoriaPlanejamento[] = resposta.content.map(
                (categoria: PlanejamentoDashboard["categorias"][number]) => {
                    const categoriaRestante = categoria.categoria === "Categorias restantes";

                    return {
                        id: categoria.id,

                        nome: categoria.categoria,

                        icone: categoriaRestante ? (
                            <RiMore2Fill />
                        ) : (
                            renderizarIcone(categoria.icone)
                        ),

                        cor: categoriaRestante ? "#9ca3af" : categoria.cor,

                        meta: categoria.limite,

                        pago: categoria.pago + categoria.pagoUltrapassado,

                        previsto: categoria.pendente + categoria.pendenteUltrapassado,

                        categoriaRestante,
                    };
                },
            );

            setCategoriasPagina(categoriasMapeadas);

            setTotalPaginas(resposta.totalPages);
        } catch (error) {
            console.error("Erro ao carregar página das categorias:", error);

            setCategoriasPagina([]);
        }
    }

    const carregarDashboard = async () => {
        setLoading(true);
        setErro("");

        try {
            const planejamentos = await listarPlanejamentosUsuario(USUARIO_ID);

            const planejamentoDoMes = planejamentos.find((planejamento) =>
                referenciaPertenceAoMes(planejamento.referencia, mesSelecionado, anoSelecionado),
            );

            if (!planejamentoDoMes) {
                setDashboard(null);
                setPossuiPlanejamento(false);

                return;
            }

            const resposta = await buscarDashboardPlanejamento(planejamentoDoMes.id);

            setDashboard(resposta);
            setPossuiPlanejamento(true);

            setPagina(1);

            await carregarPaginaCategorias(planejamentoDoMes.id, 1);
        } catch (error) {
            console.error("Erro ao carregar planejamento:", error);

            setDashboard(null);
            setPossuiPlanejamento(false);

            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível carregar o planejamento.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPagina(1);

        carregarDashboard();
    }, [referenciaAtual]);

    const categoriasExibidas = useMemo(() => {
        if (!dashboard) {
            return [];
        }
        const lista = dashboard.categorias.map((categoria) => {
            const categoriaRestante = categoria.categoria === "Categorias restantes";

            return {
                id: categoria.id,

                nome: categoria.categoria,

                icone: categoriaRestante ? <RiMore2Fill /> : renderizarIcone(categoria.icone),

                cor: categoriaRestante ? "#9ca3af" : categoria.cor,

                meta: categoria.limite,

                pago: categoria.pago + categoria.pagoUltrapassado,

                previsto: categoria.pendente + categoria.pendenteUltrapassado,

                categoriaRestante,
            };
        });

        return lista.sort((a, b) => {
            if (a.categoriaRestante) {
                return 1;
            }

            if (b.categoriaRestante) {
                return -1;
            }

            return 0;
        });
    }, [dashboard]);

    const resumo = dashboard?.resumoMensal;

    const totalCategoriasPlanejadas =
        dashboard?.categorias
            .filter((categoria) => categoria.categoria !== "Categorias restantes")
            .reduce((total, categoria) => total + categoria.limite, 0) ?? 0;

    const categoriasPlanejadasIds =
        dashboard?.categorias
            .filter((categoria) => categoria.categoria !== "Categorias restantes")
            .map((categoria) => categoria.categoriaId)
            .filter((id): id is number => id !== null) ?? [];

    const valorDisponivelPlanejamento = resumo?.valorDisponivel ?? 0;

    const receitasMes = resumo?.receitasMes ?? 0;

    const somaCategoriasPlanejadas =
        dashboard?.categorias
            .filter((categoria) => categoria.categoria !== "Categorias restantes")
            .reduce((total, categoria) => total + categoria.limite, 0) ?? 0;

    const valorDisponivelOriginal = dashboard?.resumoMensal.valorDisponivel ?? 0;

    const gastosPlanejados = Math.max(valorDisponivelOriginal, somaCategoriasPlanejadas);

    const balancoPlanejado = receitasMes - gastosPlanejados;

    const economiaPlanejada = receitasMes > 0 ? (balancoPlanejado / receitasMes) * 100 : 0;

    /*
     * O total usado pelo resumo superior será:
     *
     * - o valor disponível originalmente
     *
     * OU
     *
     * - a soma das categorias planejadas,
     *   caso o usuário tenha ultrapassado
     *   o valor originalmente disponível.
     */
    const totalMeta = Math.max(valorDisponivelOriginal, totalCategoriasPlanejadas);

    const totalPagoGeral = categoriasExibidas.reduce(
        (total, categoria) => total + categoria.pago,
        0,
    );

    const totalPendenteGeral = categoriasExibidas.reduce(
        (total, categoria) => total + categoria.previsto,
        0,
    );

    const totalComprometidoGeral = totalPagoGeral + totalPendenteGeral;

    const ultrapassouGeral = totalComprometidoGeral > totalMeta;

    /* =========================
       PARTE NORMAL
    ========================= */

    const pagoDentroLimiteGeral = Math.min(totalPagoGeral, totalMeta);

    const restanteAposPagoGeral = Math.max(totalMeta - pagoDentroLimiteGeral, 0);

    const pendenteDentroLimiteGeral = Math.min(totalPendenteGeral, restanteAposPagoGeral);

    const percentualPagoGeral = totalMeta > 0 ? (pagoDentroLimiteGeral / totalMeta) * 100 : 0;

    const percentualPendenteGeral =
        totalMeta > 0 ? (pendenteDentroLimiteGeral / totalMeta) * 100 : 0;

    const percentualComprometidoGeral = Math.min(
        percentualPagoGeral + percentualPendenteGeral,
        100,
    );

    /* =========================
       PARTE ULTRAPASSADA
    ========================= */

    const pagoUltrapassadoGeral = Math.max(totalPagoGeral - totalMeta, 0);

    const limiteRestanteDepoisPagoGeral = Math.max(totalMeta - totalPagoGeral, 0);

    const pendenteUltrapassadoGeral = Math.max(
        totalPendenteGeral - limiteRestanteDepoisPagoGeral,
        0,
    );

    const percentualPagoUltrapassadoGeral =
        totalMeta > 0 ? (pagoUltrapassadoGeral / totalMeta) * 100 : 0;

    const percentualPendenteUltrapassadoGeral =
        totalMeta > 0 ? (pendenteUltrapassadoGeral / totalMeta) * 100 : 0;

    const percentualExcedenteComprometidoGeral = Math.min(
        percentualPagoUltrapassadoGeral + percentualPendenteUltrapassadoGeral,
        100,
    );

    const totalPago = resumo?.gastoTotal ?? 0;

    const restante = totalMeta - totalPago;

    async function finalizarPlanejamento() {
        if (salvandoPlanejamento) {
            return;
        }

        const rendaNumero = Number(renda);

        const percentualNumero = Number(percentualEconomia);

        if (!rendaNumero || rendaNumero <= 0) {
            setErro("Informe uma renda mensal válida.");

            return;
        }

        if (percentualNumero < 0 || percentualNumero > 100) {
            setErro("O percentual de economia deve estar entre 0 e 100.");

            return;
        }

        setSalvandoPlanejamento(true);
        setErro("");

        try {
            const planejamentoCriado = await criarPlanejamento({
                usuarioId: USUARIO_ID,
                referencia: formatarReferenciaBackend(referenciaAtual),
                rendaMensal: rendaNumero,
                percentualEconomia: percentualNumero,
            });

            const categoriasParaSalvar = categoriasFormulario.filter(
                (categoria) => categoria.valor > 0,
            );

            await Promise.all(
                categoriasParaSalvar.map((categoria) =>
                    salvarCategoriaPlanejamento({
                        planejamentoId: planejamentoCriado.id,

                        categoriaId: categoria.id,

                        limite: categoria.valor,
                    }),
                ),
            );

            await carregarDashboard();

            setModalPlanejamento(false);

            setEtapa(1);

            setRenda("");

            setPercentualEconomia("");

            setCategoriasFormulario([]);

            /*
             * Não fechamos o modal ainda.
             *
             * No próximo passo, usaremos:
             *
             * planejamentoCriado.id
             *
             * para salvar os limites das categorias.
             */
        } catch (erro) {
            const mensagem =
                erro instanceof Error ? erro.message : "Não foi possível criar o planejamento.";

            setErro(mensagem);
        } finally {
            setSalvandoPlanejamento(false);
        }
    }

    async function copiarMesAnterior() {
        if (copiandoPlanejamento) {
            return;
        }

        setCopiandoPlanejamento(true);
        setErro("");

        try {
            const planejamentos = await listarPlanejamentosUsuario(USUARIO_ID);

            const mesAnterior = obterMesAnterior(referenciaAtual);

            const mesAnteriorNumero = mesAnterior.getMonth() + 1;

            const anoMesAnterior = mesAnterior.getFullYear();

            const planejamentoAnterior = planejamentos.find((planejamento) =>
                referenciaPertenceAoMes(planejamento.referencia, mesAnteriorNumero, anoMesAnterior),
            );

            if (!planejamentoAnterior) {
                setErro("Não existe planejamento no mês anterior para copiar.");

                return;
            }

            await copiarPlanejamento(planejamentoAnterior.id, {
                novaReferencia: formatarReferenciaBackend(referenciaAtual),
            });

            await carregarDashboard();
        } catch (error) {
            console.error("Erro ao copiar planejamento:", error);

            if (error instanceof Error) {
                setErro(error.message);
            } else {
                setErro("Não foi possível copiar o planejamento do mês anterior.");
            }
        } finally {
            setCopiandoPlanejamento(false);
        }
    }

    return (
        <DashboardLayout>
            {(loading || salvandoPlanejamento || copiandoPlanejamento) && <LoadingOverlay />}

            <div className="pagina-planejamento">
                {erro && <div className="mensagem-erro-planejamento">{erro}</div>}

                {!possuiPlanejamento ? (
                    <PlanejamentoVazio
                        abrirModal={() => {
                            setCategoriasFormulario([]);

                            setModalPlanejamento(true);

                            setEtapa(1);
                        }}

                        copiarMesAnterior={copiarMesAnterior}
                    />
                ) : (
                    <div className="dashboard-planejamento">
                        {/* ===============================
        TOPO
    =============================== */}

                        <div className="resumo-financeiro-planejamento">
                            {/* RECEITAS */}
                            <div className="card-resumo-financeiro">
                                <div className="conteudo-card-resumo">
                                    <span>Receitas do mês</span>

                                    <strong>
                                        R${" "}
                                        {receitasMes.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </strong>
                                </div>

                                <div className="icone-resumo icone-receita">
                                    <RiArrowUpLine />
                                </div>
                            </div>

                            {/* GASTOS */}
                            <div className="card-resumo-financeiro">
                                <div className="conteudo-card-resumo">
                                    <span>Gastos planejados</span>

                                    <strong>
                                        R${" "}
                                        {gastosPlanejados.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </strong>
                                </div>

                                <div className="icone-resumo icone-gasto">
                                    <RiArrowDownLine />
                                </div>
                            </div>

                            {/* BALANÇO */}
                            <div
                                className={`
            card-resumo-financeiro
            ${balancoPlanejado < 0 ? "resumo-negativo" : ""}
        `}
                            >
                                <div className="conteudo-card-resumo">
                                    <span>Balanço planejado</span>

                                    <strong>
                                        {balancoPlanejado < 0 ? "- " : ""}
                                        R${" "}
                                        {Math.abs(balancoPlanejado).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </strong>
                                </div>

                                <div className="icone-resumo icone-balanco">
                                    <RiScales3Line />
                                </div>
                            </div>

                            {/* ECONOMIA */}
                            <div
                                className={`
            card-resumo-financeiro
            ${economiaPlanejada < 0 ? "resumo-negativo" : ""}
        `}
                            >
                                <div className="conteudo-card-resumo">
                                    <span>Economia planejada</span>

                                    <strong>
                                        {economiaPlanejada.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                        %
                                    </strong>
                                </div>

                                <div className="icone-resumo icone-economia">
                                    <RiWallet3Line />
                                </div>
                            </div>
                        </div>

                        <div className="card-superior">
                            <div className="topo-planejamento">
                                <div className="novo-orcamento">
                                    <button
                                        type="button"
                                        className="btn-novo-orcamento"
                                        onClick={() => setModalAdicionarCategoria(true)}
                                    >
                                        <RiAddLine />
                                        Adicionar categoria
                                    </button>
                                </div>

                                <div className="meio-planejamento">
                                    <div className="resumo-planejamento-dashboard">
                                        <span>Restam</span>

                                        <h2>
                                            R$
                                            {restante.toLocaleString(
                                                "pt-BR",

                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                        </h2>

                                        <small>
                                            R$
                                            {totalPago.toLocaleString(
                                                "pt-BR",

                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                            {" de R$ "}
                                            {totalMeta.toLocaleString(
                                                "pt-BR",

                                                {
                                                    minimumFractionDigits: 2,
                                                },
                                            )}
                                            {" gastos"}
                                        </small>
                                    </div>

                                    <div className="progresso-geral-dashboard">
                                        <div className="barra-geral">
                                            {!ultrapassouGeral ? (
                                                <>
                                                    <div
                                                        className="
                        barra-geral-camada
                        barra-geral-comprometido
                    "
                                                        style={{
                                                            width: `${percentualComprometidoGeral}%`,
                                                        }}
                                                    />

                                                    <div
                                                        className="
                        barra-geral-camada
                        barra-geral-pago
                    "
                                                        style={{
                                                            width: `${percentualPagoGeral}%`,
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <div
                                                        className="
                        barra-geral-camada
                        barra-geral-excedente-comprometido
                    "
                                                        style={{
                                                            width: `${percentualExcedenteComprometidoGeral}%`,
                                                        }}
                                                    />

                                                    <div
                                                        className="
                        barra-geral-camada
                        barra-geral-excedente-pago
                    "
                                                        style={{
                                                            width: `${Math.min(
                                                                percentualPagoUltrapassadoGeral,
                                                                100,
                                                            )}%`,
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <div className="dados-barra">
                                            {!ultrapassouGeral ? (
                                                <>
                                                    <div className="indicador-barra">
                                                        <span className="bolinha verde" />

                                                        <small>
                                                            {Math.round(percentualPagoGeral)}%
                                                        </small>
                                                    </div>

                                                    <div className="indicador-barra">
                                                        <span className="bolinha verde-claro" />

                                                        <small>
                                                            {Math.round(percentualPendenteGeral)}%
                                                        </small>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="indicador-barra">
                                                        <span className="bolinha vermelho-escuro" />

                                                        <small>
                                                            {Math.round(
                                                                percentualPagoUltrapassadoGeral,
                                                            )}
                                                            %
                                                        </small>
                                                    </div>

                                                    <div className="indicador-barra">
                                                        <span className="bolinha vermelho-claro" />

                                                        <small>
                                                            {Math.round(
                                                                percentualPendenteUltrapassadoGeral,
                                                            )}
                                                            %
                                                        </small>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="menu-planejamento-container">
                                    <button
                                        type="button"
                                        className="btn-menu-dashboard"
                                        onClick={() =>
                                            setMenuPlanejamentoAberto((aberto) => !aberto)
                                        }
                                    >
                                        <RiMore2Fill />
                                    </button>

                                    {menuPlanejamentoAberto && (
                                        <div className="menu-planejamento-opcoes">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenuPlanejamentoAberto(false);

                                                    setModalEditarPlanejamento(true);
                                                }}
                                            >
                                                <RiEdit2Line />
                                                Editar planejamento
                                            </button>

                                            <button
                                                type="button"
                                                className="opcao-excluir"
                                                onClick={() => {
                                                    setMenuPlanejamentoAberto(false);

                                                    setModalExcluirPlanejamento(true);
                                                }}
                                            >
                                                <RiDeleteBin6Line />
                                                Excluir planejamento
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="cabecalho-dashboard">
                                <span>Categoria</span>

                                <span>Meta</span>

                                <span>Pagos</span>

                                <span>Previstos</span>

                                <span>Total gasto</span>

                                <span>Ações</span>
                            </div>
                        </div>

                        {/* ===============================
        LISTAGEM
    =============================== */}

                        <div className="lista-planejamento">
                            <div className="lista-dashboard">
                                {categoriasPagina.map((categoria) => {
                                    const totalGasto = categoria.pago + categoria.previsto;

                                    const restanteCategoria = categoria.meta - totalGasto;

                                    const ultrapassou = restanteCategoria < 0;

                                    /* =========================
   PARTE NORMAL
========================= */

                                    const pagoDentroLimite = Math.min(
                                        categoria.pago,
                                        categoria.meta,
                                    );

                                    const restanteAposPago = Math.max(
                                        categoria.meta - pagoDentroLimite,
                                        0,
                                    );

                                    const pendenteDentroLimite = Math.min(
                                        categoria.previsto,
                                        restanteAposPago,
                                    );

                                    const percentualPago =
                                        categoria.meta > 0
                                            ? (pagoDentroLimite / categoria.meta) * 100
                                            : 0;

                                    const percentualPendente =
                                        categoria.meta > 0
                                            ? (pendenteDentroLimite / categoria.meta) * 100
                                            : 0;

                                    const percentualComprometido = Math.min(
                                        percentualPago + percentualPendente,
                                        100,
                                    );

                                    /* =========================
                                                   PARTE ULTRAPASSADA
                                                ========================= */

                                    const pagoUltrapassado = Math.max(
                                        categoria.pago - categoria.meta,
                                        0,
                                    );

                                    const limiteRestanteDepoisPago = Math.max(
                                        categoria.meta - categoria.pago,
                                        0,
                                    );

                                    const pendenteUltrapassado = Math.max(
                                        categoria.previsto - limiteRestanteDepoisPago,
                                        0,
                                    );

                                    const percentualPagoUltrapassado =
                                        categoria.meta > 0
                                            ? (pagoUltrapassado / categoria.meta) * 100
                                            : 0;

                                    const percentualPendenteUltrapassado =
                                        categoria.meta > 0
                                            ? (pendenteUltrapassado / categoria.meta) * 100
                                            : 0;

                                    const percentualExcedenteComprometido = Math.min(
                                        percentualPagoUltrapassado + percentualPendenteUltrapassado,
                                        100,
                                    );

                                    return (
                                        <div
                                            key={
                                                categoria.categoriaRestante
                                                    ? "categorias-restantes"
                                                    : categoria.id
                                            }
                                            className={`
        card-categoria
        ${categoria.categoriaRestante ? "card-categorias-restantes" : ""}
    `}
                                        >
                                            <div className="col-categoria">
                                                <div
                                                    className="icone-categoria-P"

                                                    style={{
                                                        background: categoria.cor,
                                                    }}
                                                >
                                                    {categoria.icone}
                                                </div>

                                                <span>{categoria.nome}</span>
                                            </div>

                                            <div className="col-valor">
                                                R$
                                                {categoria.meta.toLocaleString(
                                                    "pt-BR",

                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </div>

                                            <div className="col-valor">
                                                R$
                                                {categoria.pago.toLocaleString(
                                                    "pt-BR",

                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </div>

                                            <div className="col-valor">
                                                R$
                                                {categoria.previsto.toLocaleString(
                                                    "pt-BR",

                                                    {
                                                        minimumFractionDigits: 2,
                                                    },
                                                )}
                                            </div>

                                            <div className="col-status">
                                                <small>
                                                    {ultrapassou ? "Excederam" : "Restam"}{" "}
                                                    <strong>
                                                        R$
                                                        {Math.abs(restanteCategoria)

                                                            .toLocaleString(
                                                                "pt-BR",

                                                                {
                                                                    minimumFractionDigits: 2,
                                                                },
                                                            )}
                                                    </strong>
                                                </small>

                                                <div className="barra-status">
                                                    {!ultrapassou ? (
                                                        <>
                                                            <div
                                                                className="
                    barra-geral-camada
                    barra-geral-comprometido
                "
                                                                style={{
                                                                    width: `${percentualComprometido}%`,
                                                                }}
                                                            />

                                                            <div
                                                                className="
                    barra-geral-camada
                    barra-geral-pago
                "
                                                                style={{
                                                                    width: `${percentualPago}%`,
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div
                                                                className="
                    barra-geral-camada
                    barra-geral-excedente-comprometido
                "
                                                                style={{
                                                                    width: `${percentualExcedenteComprometido}%`,
                                                                }}
                                                            />

                                                            <div
                                                                className="
                    barra-geral-camada
                    barra-geral-excedente-pago
                "
                                                                style={{
                                                                    width: `${Math.min(
                                                                        percentualPagoUltrapassado,
                                                                        100,
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </>
                                                    )}
                                                </div>

                                                <div className="status-info">
                                                    {!ultrapassou ? (
                                                        <>
                                                            <div className="indicador-status">
                                                                <span className="bolinha verde" />

                                                                <small>
                                                                    {Math.round(percentualPago)}%
                                                                </small>
                                                            </div>

                                                            <div className="indicador-status">
                                                                <span className="bolinha verde-claro" />

                                                                <small>
                                                                    {Math.round(percentualPendente)}
                                                                    %
                                                                </small>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="indicador-status">
                                                                <span className="bolinha vermelho-escuro" />

                                                                <small>
                                                                    {Math.round(
                                                                        percentualPagoUltrapassado,
                                                                    )}
                                                                    %
                                                                </small>
                                                            </div>

                                                            <div className="indicador-status">
                                                                <span className="bolinha vermelho-claro" />

                                                                <small>
                                                                    {Math.round(
                                                                        percentualPendenteUltrapassado,
                                                                    )}
                                                                    %
                                                                </small>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="acoes-dashboard">
                                                {!categoria.categoriaRestante && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCategoriaEditando(categoria)
                                                            }
                                                        >
                                                            <RiEdit2Line />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCategoriaExcluindo(categoria)
                                                            }
                                                        >
                                                            <RiDeleteBin6Line />
                                                        </button>

                                                        <button>
                                                            <RiNotification3Line />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ===============================
    RODAPÉ
=============================== */}

                        <div className="rodape-planejamento-card">
                            <div className="card-legenda">
                                <div>
                                    <span className="verde" />
                                    Despesas pagas
                                </div>

                                <div>
                                    <span className="verde-claro" />
                                    Despesas não pagas
                                </div>

                                <div>
                                    <span className="vermelho" />
                                    Despesas pagas ultrapassadas
                                </div>

                                <div>
                                    <span className="vinho" />
                                    Despesas não pagas ultrapassadas
                                </div>
                            </div>
                        </div>

                        <div className="paginacao-dashboard">
                            {/* VOLTAR */}
                            <button
                                disabled={pagina === 1}
                                onClick={async () => {
                                    if (!dashboard) {
                                        return;
                                    }

                                    const novaPagina = pagina - 1;

                                    setPagina(novaPagina);

                                    await carregarPaginaCategorias(
                                        dashboard.resumoMensal.id!,
                                        novaPagina,
                                    );
                                }}
                            >
                                <RiArrowLeftSLine />
                            </button>

                            {/* NÚMEROS DAS PÁGINAS */}
                            {Array.from({
                                length: totalPaginas,
                            }).map((_, index) => {
                                const numeroPagina = index + 1;

                                return (
                                    <button
                                        key={numeroPagina}
                                        className={
                                            pagina === numeroPagina ? "pagina ativa" : "pagina"
                                        }
                                        onClick={async () => {
                                            if (!dashboard) {
                                                return;
                                            }

                                            setPagina(numeroPagina);

                                            await carregarPaginaCategorias(
                                                dashboard.resumoMensal.id!,
                                                numeroPagina,
                                            );
                                        }}
                                    >
                                        {numeroPagina}
                                    </button>
                                );
                            })}

                            {/* AVANÇAR */}
                            <button
                                disabled={pagina === totalPaginas || totalPaginas === 0}
                                onClick={async () => {
                                    if (!dashboard) {
                                        return;
                                    }

                                    const novaPagina = pagina + 1;

                                    setPagina(novaPagina);

                                    await carregarPaginaCategorias(
                                        dashboard.resumoMensal.id!,
                                        novaPagina,
                                    );
                                }}
                            >
                                <RiArrowRightSLine />
                            </button>
                        </div>
                    </div>
                )}

                {modalAdicionarCategoria &&
                    dashboard &&
                    dashboard.resumoMensal.id !== undefined && (
                        <FormAdicionarCategoriaPlanejamento
                            categoriasPlanejadasIds={categoriasPlanejadasIds}

                            valorDisponivel={valorDisponivelPlanejamento}

                            totalCategoriasPlanejadas={totalCategoriasPlanejadas}

                            planejamentoId={dashboard.resumoMensal.id}

                            onClose={() => setModalAdicionarCategoria(false)}

                            onSalvar={async () => {
                                await carregarDashboard();
                            }}
                        />
                    )}

                {categoriaEditando && categoriaEditando.id !== null && (
                    <FormEditarCategoriaPlanejamento
                        id={categoriaEditando.id}

                        nome={categoriaEditando.nome}

                        limite={categoriaEditando.meta}

                        usuarioId={USUARIO_ID}

                        valorDisponivel={valorDisponivelPlanejamento}

                        totalCategoriasPlanejadas={totalCategoriasPlanejadas}

                        onClose={() => setCategoriaEditando(null)}

                        onSalvar={async () => {
                            await carregarDashboard();
                        }}
                    />
                )}

                {categoriaExcluindo && categoriaExcluindo.id !== null && (
                    <ConfirmarExclusaoCategoriaPlanejamento
                        id={categoriaExcluindo.id}

                        nome={categoriaExcluindo.nome}

                        limite={categoriaExcluindo.meta}

                        usuarioId={USUARIO_ID}

                        onClose={() => setCategoriaExcluindo(null)}

                        onExcluir={async () => {
                            await carregarDashboard();

                            setPagina(1);
                        }}
                    />
                )}

                {modalEditarPlanejamento &&
                    dashboard &&
                    dashboard.resumoMensal.id !== undefined && (
                        <FormEditarPlanejamento
                            planejamentoId={dashboard.resumoMensal.id}

                            usuarioId={USUARIO_ID}

                            valorAtual={valorDisponivelPlanejamento}

                            minimoPermitido={totalCategoriasPlanejadas}

                            onClose={() => setModalEditarPlanejamento(false)}

                            onSalvar={async () => {
                                await carregarDashboard();
                            }}
                        />
                    )}
                {modalExcluirPlanejamento &&
                    dashboard &&
                    dashboard.resumoMensal.id !== undefined && (
                        <ConfirmarExclusaoPlanejamento
                            planejamentoId={dashboard.resumoMensal.id}

                            usuarioId={USUARIO_ID}

                            valorPlanejado={valorDisponivelPlanejamento}

                            onClose={() => setModalExcluirPlanejamento(false)}

                            onExcluir={async () => {
                                setDashboard(null);

                                setPossuiPlanejamento(false);

                                setCategoriasPagina([]);

                                setTotalPaginas(0);

                                setPagina(1);
                            }}
                        />
                    )}
                <Overlay
                    aberto={modalPlanejamento}

                    fechar={() => {
                        setModalPlanejamento(false);

                        setEtapa(1);
                    }}

                    largura={680}
                >
                    {etapa === 1 ? (
                        <FormPlanejamento
                            renda={renda}

                            setRenda={setRenda}

                            percentualEconomia={percentualEconomia}

                            setPercentualEconomia={setPercentualEconomia}

                            avancar={() => setEtapa(2)}
                        />
                    ) : (
                        <FormPlanejamentoCategorias
                            limite={limitePlanejamento}

                            categorias={categoriasFormulario}

                            setCategorias={setCategoriasFormulario}

                            voltar={() => setEtapa(1)}

                            finalizar={finalizarPlanejamento}
                        />
                    )}
                </Overlay>
            </div>
        </DashboardLayout>
    );
}

export default Planejamento;
