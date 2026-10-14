import { useEffect, useMemo, useState } from "react";

import { RiArrowRightLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import "../styles/formPlanejamentoCategorias.css";

import ModalCategorias, { type CategoriaDisponivel } from "./ModalCategorias";

import { useAlert } from "../../../context/AlertContext";
import { useUsuarioLogado } from "../../../context/AuthContext";

import { renderizarIcone } from "../../../utils/renderizarIcone";

type Categoria = {
    id: number;
    nome: string;
    cor: string;
    valor: number;
    icone: React.ReactNode;
};

type CategoriaBackend = {
    id: number;
    nome: string;

    tipo: "RECEITA" | "DESPESA";

    cor: string | null;
    icone: string | null;
};

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

    const [modalCategorias, setModalCategorias] = useState(false);

    const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<CategoriaDisponivel[]>([]);

    const [carregandoCategorias, setCarregandoCategorias] = useState(true);

    const [erroCategorias, setErroCategorias] = useState("");

    useEffect(() => {
        async function buscarCategorias() {
            try {
                setCarregandoCategorias(true);

                setErroCategorias("");

                const response = await fetch(
                    `http://localhost:8080/categorias/usuario/${USUARIO_ID}/todas`,
                );

                if (!response.ok) {
                    const mensagem = await response.text();

                    throw new Error(mensagem || "Não foi possível carregar as categorias.");
                }

                const resultado: CategoriaBackend[] = await response.json();

                const categoriasDespesa = resultado.filter(
                    (categoria) => categoria.tipo === "DESPESA",
                );

                const categoriasFormatadas: CategoriaDisponivel[] = categoriasDespesa.map(
                    (categoria) => ({
                        id: categoria.id,

                        nome: categoria.nome,

                        cor: categoria.cor ?? "#16a34a",

                        icone: renderizarIcone(categoria.icone),
                    }),
                );

                setCategoriasDisponiveis(categoriasFormatadas);

                setCategorias((categoriasAtuais) => {
                    if (categoriasAtuais.length > 0) {
                        return categoriasAtuais;
                    }

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

    const categoriasRestantes = useMemo(() => {
        const idsSelecionados = new Set(categorias.map((categoria) => categoria.id));

        return categoriasDisponiveis.filter((categoria) => !idsSelecionados.has(categoria.id));
    }, [categoriasDisponiveis, categorias]);

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

    const total = useMemo(() => {
        return categorias.reduce(
            (acumulado, categoria) => acumulado + categoria.valor,

            0,
        );
    }, [categorias]);

    const restante = Math.max(limite - total, 0);

    const ultrapassado = Math.max(total - limite, 0);

    const porcentagem = limite > 0 ? Math.min((total / limite) * 100, 100) : 0;

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

    return (
        <div className="planejamento-categorias">
            <div className="planejamento-titulo">
                <h2>Hora de planejar!</h2>

                <span>Defina quanto deseja gastar em cada categoria</span>
            </div>

            {erroCategorias && <div className="erro-categorias-planejamento">{erroCategorias}</div>}

            {carregandoCategorias && categorias.length === 0 && (
                <div className="carregando-categorias-planejamento">Carregando categorias...</div>
            )}

            {!carregandoCategorias && (
                <div className="categorias-grid">
                    {Array.from({
                        length: Math.ceil(categorias.length / 2),
                    }).map((_, linha) => (
                        <div className="linha-categorias" key={linha}>
                            {categorias.slice(linha * 2, linha * 2 + 2).map((categoria) => (
                                <div key={categoria.id} className="categoria">
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

            <div className="linha-divisoria" />

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

            <div className="rodape">
                <button type="button" className="btn-salvar" onClick={validarEFinalizar}>
                    Finalizar
                    <RiArrowRightLine />
                </button>
            </div>

            <ModalCategorias
                aberto={modalCategorias}

                fechar={() => setModalCategorias(false)}

                categorias={categoriasRestantes}

                categoriasSelecionadas={[]}

                adicionarCategoria={adicionarCategoria}
            />
        </div>
    );
}

export default FormPlanejamentoCategorias;
