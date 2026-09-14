import { useEffect, useMemo, useState } from "react";

import { RiArrowRightLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import "../styles/formPlanejamentoCategorias.css";

import ModalCategorias, { type CategoriaDisponivel } from "./ModalCategorias";

import { useAlert } from "../../../context/AlertContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import { renderizarIcone } from "../../../utils/renderizarIcone";

/* ===================================================
   CATEGORIA UTILIZADA NO PLANEJAMENTO
=================================================== */

type Categoria = {
    id: number;
    nome: string;
    cor: string;
    valor: number;
    icone: React.ReactNode;
};

/* ===================================================
   CATEGORIA RECEBIDA DO BACKEND
=================================================== */

type CategoriaBackend = {
    id: number;
    nome: string;

    tipo: "RECEITA" | "DESPESA";

    cor: string | null;
    icone: string | null;
};

/* ===================================================
   PROPS
=================================================== */

type Props = {
    voltar: () => void;

    finalizar: () => void;

    limite: number;

    categorias: Categoria[];

    setCategorias: React.Dispatch<React.SetStateAction<Categoria[]>>;
};

function FormPlanejamentoCategorias({ finalizar, limite, categorias, setCategorias }: Props) {
    const { showAlert } = useAlert();

    const { id: USUARIO_ID } = useUsuarioLogado();

    /* ===================================================
       MODAL
    =================================================== */

    const [modalCategorias, setModalCategorias] = useState(false);

    /* ===================================================
       TODAS AS CATEGORIAS DISPONÍVEIS
    =================================================== */

    const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<CategoriaDisponivel[]>([]);

    const [carregandoCategorias, setCarregandoCategorias] = useState(true);

    const [erroCategorias, setErroCategorias] = useState("");

    /* ===================================================
       BUSCAR CATEGORIAS DO BACKEND
    =================================================== */

    useEffect(() => {
        async function buscarCategorias() {
            try {
                setCarregandoCategorias(true);

                setErroCategorias("");

                /*
                 * IMPORTANTE:
                 *
                 * Aqui usamos /todas porque o endpoint
                 * normal agora é paginado.
                 *
                 * Para montar o planejamento precisamos
                 * conhecer todas as categorias disponíveis.
                 */
                const response = await fetch(
                    `http://localhost:8080/categorias/usuario/${USUARIO_ID}/todas`,
                );

                if (!response.ok) {
                    const mensagem = await response.text();

                    throw new Error(mensagem || "Não foi possível carregar as categorias.");
                }

                const resultado: CategoriaBackend[] = await response.json();

                /*
                 * Planejamento só trabalha com
                 * categorias de DESPESA.
                 */
                const categoriasDespesa = resultado.filter(
                    (categoria) => categoria.tipo === "DESPESA",
                );

                /*
                 * Converte os ícones vindos do banco
                 * para componentes React.
                 */
                const categoriasFormatadas: CategoriaDisponivel[] = categoriasDespesa.map(
                    (categoria) => ({
                        id: categoria.id,

                        nome: categoria.nome,

                        cor: categoria.cor ?? "#16a34a",

                        icone: renderizarIcone(categoria.icone),
                    }),
                );

                /*
                 * Guarda TODAS para podermos usar
                 * as restantes no modal.
                 */
                setCategoriasDisponiveis(categoriasFormatadas);

                /*
                 * Se estamos criando um planejamento
                 * e ainda não existem categorias,
                 * colocamos APENAS AS 4 PRIMEIRAS
                 * na tela principal.
                 */
                setCategorias((categoriasAtuais) => {
                    /*
                     * Se já existem categorias,
                     * não mexemos nelas.
                     *
                     * Isso é importante principalmente
                     * para edição/cópia de planejamento.
                     */
                    if (categoriasAtuais.length > 0) {
                        return categoriasAtuais;
                    }

                    /*
                     * Só as quatro primeiras aparecem
                     * inicialmente.
                     */
                    return categoriasFormatadas.slice(0, 4).map((categoria) => ({
                        id: categoria.id,

                        nome: categoria.nome,

                        cor: categoria.cor,

                        icone: categoria.icone,

                        valor: 0,
                    }));
                });
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);

                setErroCategorias("Não foi possível carregar as categorias disponíveis.");
            } finally {
                setCarregandoCategorias(false);
            }
        }

        buscarCategorias();
    }, [setCategorias]);

    /* ===================================================
       CATEGORIAS QUE AINDA NÃO ESTÃO NA TELA
    =================================================== */

    const categoriasRestantes = useMemo(() => {
        const idsSelecionados = new Set(categorias.map((categoria) => categoria.id));

        return categoriasDisponiveis.filter((categoria) => !idsSelecionados.has(categoria.id));
    }, [categoriasDisponiveis, categorias]);

    /* ===================================================
       ADICIONAR CATEGORIA
    =================================================== */

    function adicionarCategoria(categoria: CategoriaDisponivel) {
        setCategorias((categoriasAtuais) => {
            const jaExiste = categoriasAtuais.some((atual) => atual.id === categoria.id);

            if (jaExiste) {
                return categoriasAtuais;
            }

            return [
                ...categoriasAtuais,

                {
                    id: categoria.id,

                    nome: categoria.nome,

                    cor: categoria.cor,

                    icone: categoria.icone,

                    valor: 0,
                },
            ];
        });
    }

    /* ===================================================
       ALTERAR VALOR
    =================================================== */

    function alterarValor(id: number, valor: number) {
        const valorSeguro = Number.isNaN(valor) ? 0 : Math.max(valor, 0);

        setCategorias((categoriasAtuais) =>
            categoriasAtuais.map((categoria) =>
                categoria.id === id
                    ? {
                          ...categoria,

                          valor: valorSeguro,
                      }
                    : categoria,
            ),
        );
    }

    /* ===================================================
       TOTAL
    =================================================== */

    const total = useMemo(() => {
        return categorias.reduce(
            (acumulado, categoria) => acumulado + categoria.valor,

            0,
        );
    }, [categorias]);

    /* ===================================================
       RESTANTE
    =================================================== */

    const restante = Math.max(limite - total, 0);

    /* ===================================================
       ULTRAPASSADO
    =================================================== */

    const ultrapassado = Math.max(total - limite, 0);

    /* ===================================================
       PORCENTAGEM
    =================================================== */

    const porcentagem = limite > 0 ? Math.min((total / limite) * 100, 100) : 0;

    /* ===================================================
       FINALIZAR
    =================================================== */

    function validarEFinalizar() {
        if (categorias.length === 0) {
            showAlert({
                type: "warning",
                title: "Nenhuma categoria adicionada",
                message: "Adicione pelo menos uma categoria ao planejamento.",
            });

            return;
        }

        finalizar();
    }

    /* ===================================================
       RENDER
    =================================================== */

    return (
        <div className="planejamento-categorias">
            {/* ===================================================
                TÍTULO
            =================================================== */}

            <div className="planejamento-titulo">
                <h2>Hora de planejar!</h2>

                <span>Defina quanto deseja gastar em cada categoria</span>
            </div>

            {/* ===================================================
                ERRO
            =================================================== */}

            {erroCategorias && <div className="erro-categorias-planejamento">{erroCategorias}</div>}

            {/* ===================================================
                CARREGANDO
            =================================================== */}

            {carregandoCategorias && categorias.length === 0 && (
                <div className="carregando-categorias-planejamento">Carregando categorias...</div>
            )}

            {/* ===================================================
                CATEGORIAS DA TELA PRINCIPAL
            =================================================== */}

            {!carregandoCategorias && (
                <div className="categorias-grid">
                    {Array.from({
                        length: Math.ceil(categorias.length / 2),
                    }).map((_, linha) => (
                        <div className="linha-categorias" key={linha}>
                            {categorias.slice(linha * 2, linha * 2 + 2).map((categoria) => (
                                <div key={categoria.id} className="categoria">
                                    {/* CATEGORIA */}

                                    <div className="categoria-info">
                                        <div
                                            className="categoria-icon"
                                            style={{
                                                backgroundColor: categoria.cor,
                                            }}
                                        >
                                            {categoria.icone}
                                        </div>

                                        <span>{categoria.nome}</span>
                                    </div>

                                    {/* VALOR */}

                                    <div className="categoria-valor">
                                        <span>R$</span>

                                        <NumericFormat
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            decimalScale={2}
                                            fixedDecimalScale
                                            allowNegative={false}
                                            value={categoria.valor}
                                            onValueChange={(valores) =>
                                                alterarValor(categoria.id, valores.floatValue ?? 0)
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* ===================================================
                DIVISOR
            =================================================== */}

            <div className="linha-divisoria" />

            {/* ===================================================
                ADICIONAR CATEGORIA
            =================================================== */}

            <div className="adicionar-categoria">
                <button
                    type="button"

                    disabled={carregandoCategorias || categoriasRestantes.length === 0}

                    onClick={() => setModalCategorias(true)}
                >
                    {categoriasRestantes.length === 0
                        ? "Todas as categorias adicionadas"
                        : `+ Adicionar categoria (${categoriasRestantes.length})`}
                </button>
            </div>

            {/* ===================================================
                RESUMO
            =================================================== */}

            <div className="resumo">
                <h3>Total categorizado</h3>

                <div className="barra">
                    <div
                        className="barra-preenchida"
                        style={{
                            width: `${porcentagem}%`,

                            backgroundColor: total > limite ? "#ef4444" : "#22c55e",
                        }}
                    />
                </div>

                <div className="informacoes">
                    {/* CATEGORIZADO */}

                    <div className="info-item">
                        <div className="info-titulo">
                            <span className="bolinha verde" />

                            <small>Categorizado</small>
                        </div>

                        <strong>
                            {total.toLocaleString("pt-BR", {
                                style: "currency",

                                currency: "BRL",
                            })}
                        </strong>
                    </div>

                    {/* NÃO CATEGORIZADO */}

                    <div className="info-item">
                        <div className="info-titulo">
                            <span className="bolinha cinza" />

                            <small>Não categorizado</small>
                        </div>

                        <strong>
                            {restante.toLocaleString("pt-BR", {
                                style: "currency",

                                currency: "BRL",
                            })}
                        </strong>
                    </div>

                    {/* ULTRAPASSADO */}

                    <div className="info-item">
                        <div className="info-titulo">
                            <span className="bolinha vermelho" />

                            <small>Ultrapassado</small>
                        </div>

                        <strong>
                            {ultrapassado.toLocaleString("pt-BR", {
                                style: "currency",

                                currency: "BRL",
                            })}
                        </strong>
                    </div>
                </div>
            </div>

            {/* ===================================================
                FINALIZAR
            =================================================== */}

            <div className="rodape">
                <button type="button" className="btn-salvar" onClick={validarEFinalizar}>
                    Finalizar
                    <RiArrowRightLine />
                </button>
            </div>

            {/* ===================================================
                MODAL DAS CATEGORIAS RESTANTES
            =================================================== */}

            <ModalCategorias
                aberto={modalCategorias}

                fechar={() => setModalCategorias(false)}

                /*
                 * IMPORTANTE:
                 *
                 * Agora o modal recebe SOMENTE
                 * categorias que ainda não aparecem
                 * na tela principal.
                 */
                categorias={categoriasRestantes}

                categoriasSelecionadas={[]}

                adicionarCategoria={adicionarCategoria}
            />
        </div>
    );
}

export default FormPlanejamentoCategorias;
