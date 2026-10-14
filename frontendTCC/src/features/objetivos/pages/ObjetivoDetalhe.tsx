import { useEffect, useState } from "react";

import {
    RiAddLine,
    RiArrowLeftLine,
    RiCalendarLine,
    RiFlagLine,
    RiLightbulbLine,
    RiSubtractLine,
    RiMore2Fill,
    RiEditLine,
    RiDeleteBinLine,
    RiArrowRightSLine,
    RiArrowLeftSLine,
} from "react-icons/ri";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../../layouts/DashboardLayout";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";

import { useUsuarioLogado } from "../../../context/AuthContext";

import ObjetivoMovimentacaoItem from "../components/ObjetivoMovimentacaoItem";

import type { Objetivo, ObjetivoMovimentacao } from "../types/objetivo";

import { buscarObjetivoPorId, listarMovimentacoesObjetivo } from "../services/objetivoService";

import type { TipoMovimentacaoObjetivo } from "../services/objetivoService";

import "../styles/objetivoDetalhe.css";

import FormMovimentacaoObjetivo from "../components/FormMovimentacaoObjetivo";

import FormEditarMovimentacaoObjetivo from "../components/FormEditarMovimentacaoObjetivo";

import ConfirmarExclusaoMovimentacaoObjetivo from "../components/ConfirmarExclusaoMovimentacaoObjetivo";

import { buscarSaldoUsuario } from "../../transacoes/services/transacaoService";

import FormEditarObjetivo from "../components/FormEditarObjetivo";

import ConfirmarExclusaoObjetivo from "../components/ConfirmarExclusaoObjetivo";

function ObjetivoDetalhe() {
    const navigate = useNavigate();

    const { id } = useParams();

    const [objetivo, setObjetivo] = useState<Objetivo | null>(null);

    const [movimentacoes, setMovimentacoes] = useState<ObjetivoMovimentacao[]>([]);

    const [paginaMovimentacoes, setPaginaMovimentacoes] = useState(0);

    const [totalPaginasMovimentacoes, setTotalPaginasMovimentacoes] = useState(0);

    const TAMANHO_PAGINA_MOVIMENTACOES = 4;

    const [modalMovimentacao, setModalMovimentacao] = useState(false);

    const [tipoMovimentacao, setTipoMovimentacao] = useState<TipoMovimentacaoObjetivo>("DEPOSITO");

    const [movimentacaoEditando, setMovimentacaoEditando] = useState<ObjetivoMovimentacao | null>(
        null,
    );

    const [movimentacaoExcluindo, setMovimentacaoExcluindo] = useState<ObjetivoMovimentacao | null>(
        null,
    );

    const [menuObjetivoAberto, setMenuObjetivoAberto] = useState(false);

    const [modalEditarObjetivo, setModalEditarObjetivo] = useState(false);

    const [modalExcluirObjetivo, setModalExcluirObjetivo] = useState(false);

    const { id: USUARIO_ID } = useUsuarioLogado();

    const [saldoConta, setSaldoConta] = useState(0);

    const [loading, setLoading] = useState(true);

    async function carregarDados() {
        if (!id) {
            return;
        }

        try {
            setLoading(true);

            const objetivoId = Number(id);

            const [dadosObjetivo, dadosMovimentacoes, saldoUsuario] = await Promise.all([
                buscarObjetivoPorId(objetivoId),

                listarMovimentacoesObjetivo(
                    objetivoId,
                    paginaMovimentacoes,
                    TAMANHO_PAGINA_MOVIMENTACOES,
                ),

                buscarSaldoUsuario(USUARIO_ID),
            ]);

            setObjetivo(dadosObjetivo);

            setMovimentacoes(dadosMovimentacoes.content);

            setPaginaMovimentacoes(dadosMovimentacoes.number);

            setTotalPaginasMovimentacoes(dadosMovimentacoes.totalPages);
            setSaldoConta(saldoUsuario);
        } catch (error) {
            console.error("Erro ao carregar objetivo:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarDados();
    }, [id, paginaMovimentacoes]);

    if (!objetivo) {
        return (
            <DashboardLayout mostrarMeses={false}>{loading && <LoadingOverlay />}</DashboardLayout>
        );
    }

    const valorAtualSeguro = Math.max(
        objetivo.valorAtual,

        0,
    );

    const valorObjetivoSeguro = Math.max(
        objetivo.valorObjetivo,

        0,
    );

    const valorGuardado = Math.min(
        valorAtualSeguro,

        valorObjetivoSeguro,
    );

    const valorRestante = Math.max(
        valorObjetivoSeguro - valorAtualSeguro,

        0,
    );

    const metaConcluida = valorAtualSeguro >= valorObjetivoSeguro;

    const porcentagem =
        valorObjetivoSeguro > 0
            ? Math.min(
                  (valorAtualSeguro / valorObjetivoSeguro) * 100,

                  100,
              )
            : 0;

    const dadosGrafico = [
        {
            nome: "Guardado",

            valor: valorGuardado,

            cor: metaConcluida ? "#22c55e" : (objetivo.cor ?? "#8b5cf6"),
        },

        {
            nome: "Restante",

            valor: valorRestante,

            cor: "#e5e7eb",
        },
    ];

    function formatarMoeda(valor: number) {
        return valor.toLocaleString(
            "pt-BR",

            {
                style: "currency",

                currency: "BRL",
            },
        );
    }

    return (
        <DashboardLayout mostrarMeses={false}>
            {loading && <LoadingOverlay />}

            <div className="pagina-objetivo-detalhe">
                <div className="objetivo-detalhe-topo">
                    <button
                        type="button"
                        className="titulo-detalhe"
                        onClick={() => navigate("/objetivos")}
                    >
                        <RiArrowLeftLine />

                        <span>{objetivo.nome}</span>
                    </button>

                    {!objetivo.finalizado && (
                        <div className="menu-objetivo-container">
                            <button
                                type="button"
                                className="btn-menu-objetivo"
                                onClick={() => setMenuObjetivoAberto((aberto) => !aberto)}
                            >
                                <RiMore2Fill />
                            </button>

                            {menuObjetivoAberto && (
                                <div className="menu-objetivo-opcoes">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuObjetivoAberto(false);

                                            setModalEditarObjetivo(true);
                                        }}
                                    >
                                        <RiEditLine />
                                        Editar objetivo
                                    </button>

                                    <button
                                        type="button"
                                        className="opcao-excluir"
                                        onClick={() => {
                                            setMenuObjetivoAberto(false);

                                            setModalExcluirObjetivo(true);
                                        }}
                                    >
                                        <RiDeleteBinLine />
                                        Excluir objetivo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="detalhe-grid">
                    <div className="resumo-card">
                        <h2>Resumo da meta</h2>

                        <div className="resumo-info">
                            <span>
                                <RiFlagLine />

                                {formatarMoeda(valorObjetivoSeguro)}
                            </span>

                            <span>
                                <RiCalendarLine />

                                {objetivo.dataFinal}
                            </span>
                        </div>

                        <div className="progresso-circular">
                            <ResponsiveContainer
                                width="100%"

                                height="100%"
                            >
                                <PieChart>
                                    <Pie
                                        data={dadosGrafico}

                                        dataKey="valor"

                                        nameKey="nome"

                                        innerRadius={72}

                                        outerRadius={105}

                                        startAngle={90}

                                        endAngle={-270}

                                        stroke="none"

                                        paddingAngle={0}

                                        isAnimationActive={true}

                                        animationDuration={700}
                                    >
                                        {dadosGrafico.map((item) => (
                                            <Cell
                                                key={item.nome}

                                                fill={item.cor}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(valor) => formatarMoeda(Number(valor ?? 0))}

                                        contentStyle={{
                                            borderRadius: "12px",

                                            border: "1px solid #e5e7eb",

                                            boxShadow: "0 10px 24px rgba(15,23,42,.12)",
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="progresso-centro">{porcentagem.toFixed(0)}%</div>
                        </div>

                        <div className="valor-atual">
                            {formatarMoeda(valorAtualSeguro)}

                            <span>Valor guardado</span>
                        </div>

                        <div className="objetivo-dica">
                            <RiLightbulbLine />

                            <div>
                                {metaConcluida ? (
                                    <>
                                        <strong>Meta concluída!</strong>

                                        <p>Você já alcançou o valor definido para este objetivo.</p>
                                    </>
                                ) : (
                                    <>
                                        <strong>Faltam {formatarMoeda(valorRestante)}</strong>

                                        <p>
                                            Continue realizando depósitos para alcançar sua meta até{" "}
                                            {objetivo.dataFinal}.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="movimentacoes-card">
                        <div className="movimentacoes-topo">
                            <h2>Depósitos</h2>

                            {!objetivo.finalizado && (
                                <div className="movimentacoes-acoes">
                                    <button
                                        type="button"
                                        className="btn-deposito"
                                        title="Adicionar depósito"
                                        onClick={() => {
                                            setTipoMovimentacao("DEPOSITO");

                                            setModalMovimentacao(true);
                                        }}
                                    >
                                        <RiAddLine />
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-saque"
                                        title="Registrar retirada"
                                        disabled={valorAtualSeguro <= 0}
                                        onClick={() => {
                                            setTipoMovimentacao("RETIRADA");

                                            setModalMovimentacao(true);
                                        }}
                                    >
                                        <RiSubtractLine />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="lista-movimentacoes">
                            {movimentacoes.map((movimentacao) => (
                                <ObjetivoMovimentacaoItem
                                    key={movimentacao.id}

                                    movimentacao={movimentacao}

                                    objetivoFinalizado={objetivo.finalizado}

                                    onEditar={() => setMovimentacaoEditando(movimentacao)}

                                    onExcluir={() => setMovimentacaoExcluindo(movimentacao)}
                                />
                            ))}
                        </div>

                        {totalPaginasMovimentacoes > 1 && (
                            <div className="paginacao-movimentacoes">
                                <button
                                    type="button"
                                    disabled={paginaMovimentacoes === 0}
                                    onClick={() => setPaginaMovimentacoes(paginaMovimentacoes - 1)}
                                >
                                    <RiArrowLeftSLine />
                                </button>

                                {Array.from({
                                    length: totalPaginasMovimentacoes,
                                }).map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={
                                            paginaMovimentacoes === index
                                                ? "pagina-movimentacao ativa"
                                                : "pagina-movimentacao"
                                        }
                                        onClick={() => setPaginaMovimentacoes(index)}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={paginaMovimentacoes >= totalPaginasMovimentacoes - 1}
                                    onClick={() => setPaginaMovimentacoes(paginaMovimentacoes + 1)}
                                >
                                    <RiArrowRightSLine />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FormMovimentacaoObjetivo
                aberto={modalMovimentacao}

                objetivoId={objetivo.id}

                nomeObjetivo={objetivo.nome}

                tipo={tipoMovimentacao}

                saldoObjetivo={objetivo.valorAtual}

                saldoConta={saldoConta}

                onClose={() => setModalMovimentacao(false)}

                onSalvar={carregarDados}
            />

            <FormEditarMovimentacaoObjetivo
                aberto={movimentacaoEditando !== null}

                movimentacao={movimentacaoEditando}

                onClose={() => setMovimentacaoEditando(null)}

                onSalvar={carregarDados}
            />

            <ConfirmarExclusaoMovimentacaoObjetivo
                aberto={movimentacaoExcluindo !== null}

                movimentacao={movimentacaoExcluindo}

                onClose={() => setMovimentacaoExcluindo(null)}

                onExcluir={async () => {
                    if (movimentacoes.length === 1 && paginaMovimentacoes > 0) {
                        setPaginaMovimentacoes(paginaMovimentacoes - 1);

                        return;
                    }

                    await carregarDados();
                }}
            />

            <FormEditarObjetivo
                aberto={modalEditarObjetivo}

                objetivo={objetivo}

                usuarioId={USUARIO_ID}

                onClose={() => setModalEditarObjetivo(false)}

                onSalvar={carregarDados}
            />

            <ConfirmarExclusaoObjetivo
                aberto={modalExcluirObjetivo}

                objetivo={objetivo}

                usuarioId={USUARIO_ID}

                onClose={() => setModalExcluirObjetivo(false)}

                onExcluir={async () => {
                    navigate("/objetivos");
                }}
            />
        </DashboardLayout>
    );
}

export default ObjetivoDetalhe;
