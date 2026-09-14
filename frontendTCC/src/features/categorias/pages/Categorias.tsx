import { useEffect, useState } from "react";

import DashboardLayout from "../../../layouts/DashboardLayout";

import LoadingOverlay from "../../../shared/components/LoadingOverlay";

import { useAlert } from "../../../context/AlertContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import { mapaIconesCategorias } from "../../../utils/iconesCategorias";

import {
    RiAddLine,
    RiDeleteBin6Line,
    RiEdit2Line,
    RiRefreshLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
} from "react-icons/ri";

import "../styles/categorias.css";

import FormCategoria from "../components/FormCategoria";

import type { DadosCategoria } from "../components/FormCategoria";

type TipoCategoria = "RECEITA" | "DESPESA";

type Categoria = {
    id: number;
    nome: string;
    icone: string;
    cor: string;
    tipo: TipoCategoria;
    padraoSistema: boolean;
};

function Categorias() {
    const { showAlert } = useAlert();

    const { id: USUARIO_ID } = useUsuarioLogado();

    const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);

    const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

    const [salvandoCategoria, setSalvandoCategoria] = useState(false);

    const [loading, setLoading] = useState(false);

    const [tipoSelecionado, setTipoSelecionado] = useState<TipoCategoria>("DESPESA");

    const [categorias, setCategorias] = useState<Categoria[]>([]);

    /* ===================================================
       PAGINAÇÃO
    =================================================== */

    const [paginaAtual, setPaginaAtual] = useState(0);

    const [totalPaginas, setTotalPaginas] = useState(0);

    const [totalCategorias, setTotalCategorias] = useState(0);

    const tamanhoPagina = 8;

    /* ===================================================
       BUSCAR
    =================================================== */

    async function buscarCategorias(pagina = paginaAtual) {
        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:8080/categorias/usuario/${USUARIO_ID}?tipo=${tipoSelecionado}&page=${pagina}&size=${tamanhoPagina}`,
            );

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(mensagem || "Não foi possível carregar as categorias.");
            }

            const resposta = await response.json();

            console.log("RESPOSTA CATEGORIAS:", resposta);

            /*
             * BACKEND PAGINADO
             */
            if (resposta && Array.isArray(resposta.content)) {
                setCategorias(resposta.content);

                setPaginaAtual(resposta.number ?? 0);

                setTotalPaginas(resposta.totalPages ?? 0);

                setTotalCategorias(resposta.totalElements ?? 0);

                return;
            }

            /*
             * PROTEÇÃO:
             * caso o backend ainda esteja
             * retornando List
             */
            if (Array.isArray(resposta)) {
                setCategorias(resposta);

                setPaginaAtual(0);

                setTotalPaginas(1);

                setTotalCategorias(resposta.length);

                return;
            }

            /*
             * Nunca deixa categorias virar undefined
             */
            setCategorias([]);

            setPaginaAtual(0);

            setTotalPaginas(0);

            setTotalCategorias(0);
        } catch (erro) {
            console.error("Erro ao buscar categorias:", erro);

            setCategorias([]);
        } finally {
            setLoading(false);
        }
    }

    /* ===================================================
       SALVAR
    =================================================== */

    async function salvarCategoria(dados: DadosCategoria) {
        try {
            setSalvandoCategoria(true);

            const editando = categoriaEditando !== null;

            const url = editando
                ? `http://localhost:8080/categorias/${categoriaEditando.id}?usuarioId=${USUARIO_ID}`
                : "http://localhost:8080/categorias";

            const corpo = editando
                ? {
                      nome: dados.nome,

                      cor: dados.cor,

                      icone: dados.icone,

                      tipo: dados.tipo,
                  }
                : {
                      usuarioId: USUARIO_ID,

                      nome: dados.nome,

                      cor: dados.cor,

                      icone: dados.icone,

                      tipo: dados.tipo,
                  };

            const response = await fetch(url, {
                method: editando ? "PUT" : "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(corpo),
            });

            if (!response.ok) {
                const mensagem = await response.text();

                throw new Error(
                    mensagem ||
                        (editando
                            ? "Não foi possível atualizar a categoria."
                            : "Não foi possível criar a categoria."),
                );
            }

            await buscarCategorias(paginaAtual);

            setModalCategoriaAberto(false);

            setCategoriaEditando(null);
        } catch (erro) {
            console.error("Erro ao salvar categoria:", erro);

            showAlert({
                type: "error",
                title: "Não foi possível salvar",
                message: erro instanceof Error ? erro.message : "Erro ao salvar categoria.",
            });
        } finally {
            setSalvandoCategoria(false);
        }
    }

    /* ===================================================
       DELETE
    =================================================== */

    async function deletarCategoria(id: number) {
        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:8080/categorias/${id}?usuarioId=${USUARIO_ID}`,
                {
                    method: "DELETE",
                },
            );

            if (!response.ok) {
                const texto = await response.text();

                let mensagem = "Não foi possível excluir a categoria.";

                try {
                    const erro = JSON.parse(texto);

                    mensagem = erro.mensagem ?? mensagem;
                } catch {
                    if (texto) {
                        mensagem = texto;
                    }
                }

                throw new Error(mensagem);
            }

            /*
             * Caso a exclusão deixe a página atual vazia,
             * voltamos uma página.
             */
            const paginaDepoisExclusao =
                categorias.length === 1 && paginaAtual > 0 ? paginaAtual - 1 : paginaAtual;

            await buscarCategorias(paginaDepoisExclusao);
        } catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : "Erro ao excluir categoria.";

            showAlert({
                type: "error",
                title: "Não foi possível excluir",
                message: mensagem,
            });
        } finally {
            setLoading(false);
        }
    }

    /* ===================================================
       INIT
    =================================================== */

    useEffect(() => {
        setPaginaAtual(0);

        buscarCategorias(0);
    }, [tipoSelecionado]);

    const categoriasFiltradas = categorias;

    /* ===================================================
       TROCAR TIPO
    =================================================== */

    function trocarTipo() {
        setTipoSelecionado(tipoSelecionado === "DESPESA" ? "RECEITA" : "DESPESA");
    }

    /* ===================================================
       PAGINAÇÃO
    =================================================== */

    function paginaAnterior() {
        if (paginaAtual <= 0) {
            return;
        }

        buscarCategorias(paginaAtual - 1);
    }

    function proximaPagina() {
        if (paginaAtual >= totalPaginas - 1) {
            return;
        }

        buscarCategorias(paginaAtual + 1);
    }

    return (
        <DashboardLayout mostrarMeses={false}>
            {loading && <LoadingOverlay />}

            <div className="pagina-categorias">
                {/* ===================================================
                    TOPO
                =================================================== */}

                <div className="topo-categorias">
                    {/* TOGGLE */}

                    <button
                        type="button"
                        className={`
                            toggle-tipo

                            ${tipoSelecionado === "RECEITA" ? "receita" : "despesa"}
                        `}
                        onClick={trocarTipo}
                    >
                        <span>{tipoSelecionado === "DESPESA" ? "Despesa" : "Receita"}</span>

                        <RiRefreshLine
                            className={`
                                icone-toggle

                                ${tipoSelecionado === "RECEITA" ? "girado" : ""}
                            `}
                        />
                    </button>

                    {/* CRIAR */}

                    <button
                        type="button"
                        className={`
                            botao-criar-categoria

                            ${tipoSelecionado === "RECEITA" ? "receita" : "despesa"}
                        `}
                        onClick={() => {
                            setCategoriaEditando(null);

                            setModalCategoriaAberto(true);
                        }}
                    >
                        Criar categoria
                        <RiAddLine />
                    </button>
                </div>

                {/* ===================================================
                    TABELA
                =================================================== */}

                <div
                    key={`${tipoSelecionado}-${paginaAtual}`}
                    className={`
                        tabela-categorias

                        ${tipoSelecionado === "RECEITA" ? "receita" : "despesa"}
                    `}
                >
                    {/* HEADER */}

                    <div
                        className={`
                            tabela-header-categorias

                            ${tipoSelecionado === "RECEITA" ? "receita" : "despesa"}
                        `}
                    >
                        <span>Nome</span>

                        <span>Ícone</span>

                        <span>Cor</span>

                        <span>Ações</span>
                    </div>

                    {/* ===================================================
                        LINHAS
                    =================================================== */}

                    {categoriasFiltradas.length > 0 ? (
                        categoriasFiltradas.map((categoria) => (
                            <div key={categoria.id} className="linha-categoria">
                                {/* NOME */}

                                <strong>
                                    {categoria.nome}

                                    {categoria.padraoSistema && (
                                        <span className="categoria-padrao-selo">Padrão</span>
                                    )}
                                </strong>

                                {/* ÍCONE */}

                                <div className="icone-categoria">
                                    {mapaIconesCategorias[categoria.icone] ??
                                        mapaIconesCategorias.BiCategory}
                                </div>

                                {/* COR */}

                                <div className="cor-categoria">
                                    <div
                                        className="bolinha-cor"
                                        style={{
                                            background: categoria.cor,
                                        }}
                                    />
                                </div>

                                {/* AÇÕES */}

                                <div className="acoes-categoria">
                                    {/* EDITAR */}

                                    <button
                                        type="button"
                                        className={
                                            categoria.padraoSistema
                                                ? "acao-categoria-bloqueada"
                                                : ""
                                        }
                                        title={
                                            categoria.padraoSistema
                                                ? "Categoria padrão do sistema"
                                                : "Editar categoria"
                                        }
                                        onClick={() => {
                                            if (categoria.padraoSistema) {
                                                showAlert({
                                                    type: "warning",
                                                    title: "Categoria padrão do sistema",
                                                    message:
                                                        "Esta é uma categoria padrão do sistema e não pode ser editada.",
                                                });

                                                return;
                                            }

                                            setCategoriaEditando(categoria);

                                            setModalCategoriaAberto(true);
                                        }}
                                    >
                                        <RiEdit2Line />
                                    </button>

                                    {/* EXCLUIR */}

                                    <button
                                        type="button"
                                        className={
                                            categoria.padraoSistema
                                                ? "acao-categoria-bloqueada"
                                                : ""
                                        }
                                        title={
                                            categoria.padraoSistema
                                                ? "Categoria padrão do sistema"
                                                : "Excluir categoria"
                                        }
                                        onClick={() => {
                                            if (categoria.padraoSistema) {
                                                showAlert({
                                                    type: "warning",
                                                    title: "Categoria padrão do sistema",
                                                    message:
                                                        "Esta é uma categoria padrão do sistema e não pode ser excluída.",
                                                });

                                                return;
                                            }

                                            deletarCategoria(categoria.id);
                                        }}
                                    >
                                        <RiDeleteBin6Line />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="categorias-vazio">
                            Nenhuma categoria de{" "}
                            {tipoSelecionado === "DESPESA" ? "despesa" : "receita"} nesta página.
                        </div>
                    )}
                </div>

                {/* ===================================================
                    PAGINAÇÃO
                =================================================== */}

                {totalPaginas > 1 && (
                    <div className="paginacao-categorias">
                        <button
                            type="button"
                            className="botao-paginacao-categoria"
                            disabled={paginaAtual === 0}
                            onClick={paginaAnterior}
                        >
                            <RiArrowLeftSLine />
                            Anterior
                        </button>

                        <div className="numeros-paginacao-categorias">
                            {Array.from(
                                {
                                    length: totalPaginas,
                                },
                                (_, indice) => (
                                    <button
                                        type="button"
                                        key={indice}
                                        className={`
                                                    numero-pagina-categoria

                                                    ${paginaAtual === indice ? "ativo" : ""}
                                                `}
                                        onClick={() => buscarCategorias(indice)}
                                    >
                                        {indice + 1}
                                    </button>
                                ),
                            )}
                        </div>

                        <button
                            type="button"
                            className="botao-paginacao-categoria"
                            disabled={paginaAtual >= totalPaginas - 1}
                            onClick={proximaPagina}
                        >
                            Próxima
                            <RiArrowRightSLine />
                        </button>
                    </div>
                )}

                <div className="total-categorias">{totalCategorias} categorias cadastradas</div>
            </div>

            {/* ===================================================
                FORM
            =================================================== */}

            <FormCategoria
                aberto={modalCategoriaAberto}
                tipo={categoriaEditando ? categoriaEditando.tipo : tipoSelecionado}
                carregando={salvandoCategoria}
                dadosEdicao={
                    categoriaEditando
                        ? {
                              nome: categoriaEditando.nome,

                              cor: categoriaEditando.cor,

                              icone: categoriaEditando.icone,

                              tipo: categoriaEditando.tipo,
                          }
                        : null
                }
                onFechar={() => {
                    if (salvandoCategoria) {
                        return;
                    }

                    setModalCategoriaAberto(false);

                    setCategoriaEditando(null);
                }}
                onSalvar={salvarCategoria}
            />
        </DashboardLayout>
    );
}

export default Categorias;
