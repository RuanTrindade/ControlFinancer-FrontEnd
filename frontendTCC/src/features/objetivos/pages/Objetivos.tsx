import { useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";
import CardObjetivo from "../components/CardObjetivo";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import type { Objetivo } from "../types/objetivo";
import FormCriarObjetivo, { type DadosNovoObjetivo } from "../components/FormCriarObjetivo";

import { listarObjetivosUsuario, criarObjetivo } from "../services/objetivoService";

import { RiAddLine, RiArrowLeftSLine, RiArrowRightSLine, RiTrophyLine } from "react-icons/ri";

import "../styles/objetivos.css";

function Objetivos() {
    const [loading, setLoading] = useState(false);

    const [filtro, setFiltro] = useState("ANDAMENTO");

    const [modalCriarObjetivo, setModalCriarObjetivo] = useState(false);

    const [salvandoObjetivo, setSalvandoObjetivo] = useState(false);

    const [erro, setErro] = useState("");

    const USUARIO_ID = 1;

    const [objetivos, setObjetivos] = useState<Objetivo[]>([]);

    const [paginaAtual, setPaginaAtual] = useState(0);

    const [totalPaginas, setTotalPaginas] = useState(0);

    const TAMANHO_PAGINA = 5;

    async function carregarObjetivos(pagina: number = paginaAtual) {
        const finalizado = filtro === "CONCLUIDO";

        try {
            setLoading(true);
            setErro("");

            const resposta = await listarObjetivosUsuario(
                USUARIO_ID,
                finalizado,
                pagina,
                TAMANHO_PAGINA,
            );

            setObjetivos(resposta.content);

            setPaginaAtual(resposta.number);

            setTotalPaginas(resposta.totalPages);
        } catch (error) {
            console.error("Erro ao carregar objetivos:", error);

            setObjetivos([]);

            setErro(
                error instanceof Error ? error.message : "Não foi possível carregar os objetivos.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function salvarNovoObjetivo(dados: DadosNovoObjetivo) {
        if (salvandoObjetivo) {
            return;
        }

        try {
            setSalvandoObjetivo(true);
            setErro("");

            await criarObjetivo({
                usuarioId: USUARIO_ID,

                nome: dados.nome,

                valorObjetivo: dados.valorObjetivo,

                dataFinal: dados.dataFinal,

                cor: dados.cor,

                icone: dados.icone,

                imagem: dados.imagem,
            });

            /*
             * Depois de criar,
             * mostramos automaticamente
             * a aba Em andamento.
             */
            setFiltro("ANDAMENTO");
            setPaginaAtual(0);

            setModalCriarObjetivo(false);
        } catch (error) {
            console.error("Erro ao criar objetivo:", error);

            setErro(error instanceof Error ? error.message : "Não foi possível criar o objetivo.");
        } finally {
            setSalvandoObjetivo(false);
        }
    }

    useEffect(() => {
        carregarObjetivos(paginaAtual);
    }, [filtro, paginaAtual]);

    return (
        <DashboardLayout mostrarMeses={false}>
            {loading && <LoadingOverlay />}

            <div
                className="
                pagina-objetivos
            "
            >
                <h1
                    className="
                    titulo-objetivos
                "
                >
                    Objetivos
                </h1>

                <div
                    className="
                    objetivo-filtros
                "
                >
                    <div
                        className="
                        objetivo-tabs
                    "
                    >
                        <button
                            className={filtro === "ANDAMENTO" ? "ativo" : ""}
                            onClick={() => {
                                setFiltro("ANDAMENTO");

                                setPaginaAtual(0);
                            }}
                        >
                            Em andamento
                        </button>

                        <button
                            className={filtro === "CONCLUIDO" ? "ativo" : ""}
                            onClick={() => {
                                setFiltro("CONCLUIDO");

                                setPaginaAtual(0);
                            }}
                        >
                            Concluídos
                        </button>
                    </div>

                    <button
                        type="button"
                        className="btn-criar-objetivo"
                        onClick={() => {
                            setErro("");

                            setModalCriarObjetivo(true);
                        }}
                    >
                        <RiAddLine />
                        Criar Objetivo
                    </button>
                </div>

                {objetivos.length === 0 ? (
                    <div className="objetivos-vazio">
                        <div className="objetivos-vazio-icone">
                            <RiTrophyLine />
                        </div>

                        <h2>
                            {filtro === "ANDAMENTO"
                                ? "Você ainda não possui objetivos"
                                : "Nenhum objetivo concluído ainda"}
                        </h2>

                        <p>
                            {filtro === "ANDAMENTO"
                                ? "Crie seu primeiro objetivo e comece a transformar seus planos em conquistas."
                                : "Continue avançando nas suas metas. Seus objetivos concluídos aparecerão aqui."}
                        </p>

                        {filtro === "ANDAMENTO" && (
                            <button
                                className="btn-objetivo-vazio"
                                onClick={() => {
                                    setErro("");

                                    setModalCriarObjetivo(true);
                                }}
                            >
                                <RiAddLine />
                                Criar meu primeiro objetivo
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="objetivos-grid">
                        {objetivos.map((objetivo) => (
                            <CardObjetivo key={objetivo.id} objetivo={objetivo} />
                        ))}
                    </div>
                )}

                {totalPaginas > 1 && (
                    <div className="paginacao-objetivos">
                        {/* VOLTAR */}

                        <button
                            type="button"
                            disabled={paginaAtual === 0}
                            onClick={() => setPaginaAtual(paginaAtual - 1)}
                        >
                            <RiArrowLeftSLine />
                        </button>

                        {/* PÁGINAS */}

                        {Array.from({
                            length: totalPaginas,
                        }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                className={
                                    paginaAtual === index
                                        ? "pagina-objetivo ativa"
                                        : "pagina-objetivo"
                                }
                                onClick={() => setPaginaAtual(index)}
                            >
                                {index + 1}
                            </button>
                        ))}

                        {/* AVANÇAR */}

                        <button
                            type="button"
                            disabled={paginaAtual >= totalPaginas - 1}
                            onClick={() => setPaginaAtual(paginaAtual + 1)}
                        >
                            <RiArrowRightSLine />
                        </button>
                    </div>
                )}
            </div>

            <FormCriarObjetivo
                aberto={modalCriarObjetivo}

                carregando={salvandoObjetivo}

                onFechar={() => setModalCriarObjetivo(false)}

                onSalvar={salvarNovoObjetivo}
            />

            {erro && <div className="mensagem-erro-objetivo">{erro}</div>}
        </DashboardLayout>
    );
}

export default Objetivos;
