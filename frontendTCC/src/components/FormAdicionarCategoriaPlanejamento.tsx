import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    RiArrowDownSLine,
    RiCheckLine,
    RiCloseLine,
    RiMoneyDollarCircleLine,
    RiPriceTag3Line
} from "react-icons/ri";

import { renderizarIcone }
    from "../utils/renderizarIcone";

import "../styles/formAdicionarCategoriaPlanejamento.css";

import useFecharComEsc from "../hooks/useFecharComEsc";

import {
    salvarCategoriaPlanejamento
} from "../services/planejamentoCategoriaService";


type Categoria = {
    id: number;
    nome: string;
    tipo: "RECEITA" | "DESPESA";
    cor: string | null;
    icone: string | null;
};


type Props = {

    /*
     * IDs das categorias que já fazem
     * parte do planejamento.
     */
    categoriasPlanejadasIds: number[];

    /*
     * Valor atual total do planejamento.
     *
     * Vem do valorPlanejado persistido
     * no backend.
     *
     * Inicialmente é:
     *
     * renda - economia desejada
     *
     * Mas pode aumentar posteriormente
     * caso as categorias ultrapassem
     * esse valor.
     */
    valorDisponivel: number;
    /*
     * Soma SOMENTE das categorias
     * realmente planejadas.
     *
     * Não inclui "Categorias restantes".
     */
    totalCategoriasPlanejadas: number;

    planejamentoId: number;
    onClose: () => void;
    onSalvar: () => Promise<void>;
};


function FormAdicionarCategoriaPlanejamento({
    categoriasPlanejadasIds,
    valorDisponivel,
    totalCategoriasPlanejadas,
    planejamentoId,
    onClose,
    onSalvar
}: Props) {

    const [
        categorias,
        setCategorias
    ] = useState<Categoria[]>([]);

    const [
        categoriaId,
        setCategoriaId
    ] = useState("");

    const [
        valor,
        setValor
    ] = useState("");

    const [
        categoriaAberta,
        setCategoriaAberta
    ] = useState(false);

    const [
        carregandoCategorias,
        setCarregandoCategorias
    ] = useState(false);

    const [
        erro,
        setErro
    ] = useState("");

    const [
        salvando,
        setSalvando
    ] = useState(false);

    const categoriaRef =
        useRef<HTMLDivElement>(null);



    const categoriaSelecionada =
        categorias.find(
            categoria =>
                categoria.id.toString() ===
                categoriaId
        );

    const valorNumerico =
        Number(
            valor.replace(",", ".")
        ) || 0;


    /*
     * Quanto ainda existe em
     * Categorias restantes antes
     * de adicionar a nova categoria.
     */
    const categoriasRestantesAntes =
        Math.max(
            valorDisponivel -
            totalCategoriasPlanejadas,
            0
        );



    /*
     * Só esta parte realmente aumenta
     * o planejamento.
     */
    const valorQueAumentaPlanejamento =
        Math.max(
            valorNumerico -
            categoriasRestantesAntes,
            0
        );


    /*
     * Quanto sobra depois do valor digitado.
     */
    const categoriasRestantes =
        Math.max(
            categoriasRestantesAntes -
            valorNumerico,
            0
        );


    /*
     * O total atual já vem do backend
     * como valorPlanejado.
     */
    const totalPlanejamentoAtual =
        valorDisponivel;


    /*
     * Preview do novo total.
     */
    const novoTotalPlanejamento =
        totalPlanejamentoAtual +
        valorQueAumentaPlanejamento;




    function formatarDinheiro(
        valor: number
    ) {

        return valor.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }




    async function buscarCategorias() {

        try {

            setCarregandoCategorias(true);
            setErro("");

            const response =
                await fetch(
                    "http://localhost:8080/categorias/usuario/1/todas"
                );

            if (!response.ok) {

                const mensagem =
                    await response.text();

                throw new Error(
                    mensagem ||
                    "Não foi possível carregar as categorias."
                );

            }

            const resposta: Categoria[] =
                await response.json();


            /*
             * Apenas:
             *
             * - categorias de DESPESA
             * - que ainda NÃO pertencem
             *   ao planejamento
             */
            const categoriasDisponiveis =
                resposta.filter(
                    categoria =>
                        categoria.tipo ===
                        "DESPESA"
                        &&
                        !categoriasPlanejadasIds.includes(
                            categoria.id
                        )
                );


            setCategorias(
                categoriasDisponiveis
            );

        } catch (error) {

            console.error(
                "Erro ao carregar categorias:",
                error
            );

            setCategorias([]);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar as categorias."
            );

        } finally {

            setCarregandoCategorias(false);

        }

    }


    async function adicionarCategoria() {

        if (
            !formularioValido() ||
            salvando
        ) {
            return;
        }

        try {

            setSalvando(true);
            setErro("");

            await salvarCategoriaPlanejamento({
                planejamentoId,
                categoriaId: Number(categoriaId),
                limite: valorNumerico
            });

            await onSalvar();

            onClose();

        } catch (error) {

            console.error(
                "Erro ao adicionar categoria:",
                error
            );

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível adicionar a categoria."
            );

        } finally {

            setSalvando(false);

        }

    }

    /* =========================================
       CARREGAR AO ABRIR
    ========================================= */

    useEffect(() => {

        buscarCategorias();

    }, []);


    /* =========================================
       FECHAR SELECT AO CLICAR FORA
    ========================================= */

    useEffect(() => {

        function fecharAoClicarFora(
            evento: MouseEvent
        ) {

            if (
                categoriaRef.current &&
                !categoriaRef.current.contains(
                    evento.target as Node
                )
            ) {

                setCategoriaAberta(false);

            }

        }


        document.addEventListener(
            "mousedown",
            fecharAoClicarFora
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                fecharAoClicarFora
            );

        };

    }, []);


    useFecharComEsc({
        travarScroll: true,
        onFechar: onClose
    });


    /* =========================================
       VALIDAÇÃO
    ========================================= */

    function formularioValido() {

        return (
            Boolean(categoriaId) &&
            valorNumerico > 0
        );

    }


    /* =========================================
       FUNDO
    ========================================= */

    function clicarNoFundo(
        evento:
            React.MouseEvent<HTMLDivElement>
    ) {

        if (
            evento.target ===
            evento.currentTarget
        ) {

            onClose();

        }

    }


    return (

        <div
            className="
                form-adicionar-categoria-overlay
            "
            onMouseDown={
                clicarNoFundo
            }
        >

            <section
                className="
                    form-adicionar-categoria-modal
                "
                role="dialog"
                aria-modal="true"
            >

                {/* =============================
                    CABEÇALHO
                ============================= */}

                <header
                    className="
                        form-adicionar-categoria-cabecalho
                    "
                >

                    <div>

                        <span
                            className="
                                form-adicionar-categoria-subtitulo
                            "
                        >
                            Planejamento mensal
                        </span>

                        <h2>
                            Novo orçamento
                        </h2>

                    </div>


                    <button
                        type="button"
                        className="
                            form-adicionar-categoria-fechar
                        "
                        onClick={onClose}
                        aria-label="Fechar"
                    >

                        <RiCloseLine />

                    </button>

                </header>


                {/* =============================
                    CONTEÚDO
                ============================= */}

                <div
                    className="
                        form-adicionar-categoria-conteudo
                    "
                >

                    {erro && (

                        <div
                            className="
                                form-adicionar-categoria-erro
                            "
                        >
                            {erro}
                        </div>

                    )}


                    {/* =========================
                        SELECT CATEGORIA
                    ========================= */}

                    <div
                        className="
                            form-adicionar-categoria-campo
                        "
                        ref={categoriaRef}
                    >

                        <label>
                            Categoria
                        </label>


                        <div
                            className="
                                planejamento-categoria-select
                            "
                        >

                            <button
                                type="button"
                                className={`
                                    planejamento-categoria-select-botao

                                    ${categoriaAberta
                                        ? "aberto"
                                        : ""
                                    }
                                `}
                                onClick={() =>
                                    setCategoriaAberta(
                                        aberta =>
                                            !aberta
                                    )
                                }
                                disabled={
                                    carregandoCategorias
                                }
                            >

                                <div
                                    className="
                                        planejamento-categoria-select-conteudo
                                    "
                                >

                                    {
                                        categoriaSelecionada
                                            ?

                                            (
                                                <>

                                                    <span
                                                        className="
                                                            planejamento-categoria-select-icone
                                                        "
                                                        style={{

                                                            color:
                                                                categoriaSelecionada.cor
                                                                ??
                                                                "#16a34a",

                                                            backgroundColor:
                                                                `${categoriaSelecionada.cor
                                                                ??
                                                                "#16a34a"
                                                                }18`

                                                        }}
                                                    >

                                                        {
                                                            renderizarIcone(
                                                                categoriaSelecionada.icone
                                                            )
                                                        }

                                                    </span>


                                                    <span
                                                        className="
                                                            planejamento-categoria-select-nome
                                                        "
                                                    >
                                                        {
                                                            categoriaSelecionada.nome
                                                        }
                                                    </span>

                                                </>
                                            )

                                            :

                                            (
                                                <>

                                                    <span
                                                        className="
                                                            planejamento-categoria-select-icone
                                                            sem-categoria
                                                        "
                                                    >

                                                        <RiPriceTag3Line />

                                                    </span>


                                                    <span
                                                        className="
                                                            planejamento-categoria-select-placeholder
                                                        "
                                                    >

                                                        {
                                                            carregandoCategorias
                                                                ? "Carregando..."
                                                                : "Selecione uma categoria"
                                                        }

                                                    </span>

                                                </>
                                            )
                                    }

                                </div>


                                <RiArrowDownSLine
                                    className={`
                                        planejamento-categoria-select-seta

                                        ${categoriaAberta
                                            ? "girada"
                                            : ""
                                        }
                                    `}
                                />

                            </button>


                            {
                                categoriaAberta && (

                                    <div
                                        className="
                                            planejamento-categoria-select-opcoes
                                        "
                                    >

                                        {
                                            categorias.length === 0
                                                ?

                                                (
                                                    <div
                                                        className="
                                                            planejamento-categoria-select-vazio
                                                        "
                                                    >

                                                        Nenhuma categoria disponível

                                                    </div>
                                                )

                                                :

                                                categorias.map(
                                                    categoria => {

                                                        const selecionada =
                                                            categoriaId ===
                                                            categoria.id.toString();


                                                        const cor =
                                                            categoria.cor ??
                                                            "#16a34a";


                                                        return (

                                                            <button
                                                                key={
                                                                    categoria.id
                                                                }
                                                                type="button"
                                                                className={`
                                                                    planejamento-categoria-select-opcao

                                                                    ${selecionada
                                                                        ? "selecionada"
                                                                        : ""
                                                                    }
                                                                `}
                                                                onClick={() => {

                                                                    setCategoriaId(
                                                                        categoria.id.toString()
                                                                    );

                                                                    setCategoriaAberta(
                                                                        false
                                                                    );

                                                                    setErro("");

                                                                }}
                                                            >

                                                                <span
                                                                    className="
                                                                        planejamento-categoria-select-icone
                                                                    "
                                                                    style={{

                                                                        color:
                                                                            cor,

                                                                        backgroundColor:
                                                                            `${cor}18`

                                                                    }}
                                                                >

                                                                    {
                                                                        renderizarIcone(
                                                                            categoria.icone
                                                                        )
                                                                    }

                                                                </span>


                                                                <span
                                                                    className="
                                                                        planejamento-categoria-select-nome
                                                                    "
                                                                >

                                                                    {
                                                                        categoria.nome
                                                                    }

                                                                </span>


                                                                {
                                                                    selecionada && (

                                                                        <RiCheckLine
                                                                            className="
                                                                                planejamento-categoria-select-check
                                                                            "
                                                                        />

                                                                    )
                                                                }

                                                            </button>

                                                        );

                                                    }
                                                )
                                        }

                                    </div>

                                )
                            }

                        </div>

                    </div>


                    {/* =========================
                        TOTAL
                    ========================= */}

                    <div className="planejamento-total">

                        <span>
                            Total
                        </span>

                        <div className="planejamento-total-valores">

                            <strong>
                                R${" "}
                                {
                                    formatarDinheiro(
                                        totalPlanejamentoAtual
                                    )
                                }
                            </strong>


                            {
                                valorQueAumentaPlanejamento > 0 && (

                                    <strong
                                        className="
                        planejamento-total-excedente
                    "
                                    >
                                        + R${" "}

                                        {
                                            formatarDinheiro(
                                                valorQueAumentaPlanejamento
                                            )
                                        }
                                    </strong>

                                )
                            }

                        </div>

                    </div>


                    {/* =========================
                        CATEGORIA + VALOR
                    ========================= */}

                    {
                        categoriaSelecionada && (

                            <div
                                className="
                                    planejamento-categoria-valor
                                "
                            >

                                <div
                                    className="
                                        planejamento-categoria-identidade
                                    "
                                >

                                    <span
                                        className="
                                            planejamento-categoria-icone-grande
                                        "
                                        style={{

                                            color:
                                                categoriaSelecionada.cor
                                                ??
                                                "#16a34a",

                                            backgroundColor:
                                                `${categoriaSelecionada.cor
                                                ??
                                                "#16a34a"
                                                }18`

                                        }}
                                    >

                                        {
                                            renderizarIcone(
                                                categoriaSelecionada.icone
                                            )
                                        }

                                    </span>


                                    <div>

                                        <strong>
                                            {
                                                categoriaSelecionada.nome
                                            }
                                        </strong>

                                        <small>
                                            Novo limite planejado
                                        </small>

                                    </div>

                                </div>


                                <div
                                    className="
                                        planejamento-input-valor
                                    "
                                >

                                    <RiMoneyDollarCircleLine />

                                    <span>
                                        R$
                                    </span>

                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={valor}
                                        placeholder="0,00"
                                        autoFocus
                                        onChange={
                                            evento => {

                                                const novoValor =
                                                    evento.target.value;


                                                if (
                                                    /^\d*[.,]?\d{0,2}$/
                                                        .test(
                                                            novoValor
                                                        )
                                                ) {

                                                    setValor(
                                                        novoValor
                                                    );

                                                    setErro("");

                                                }

                                            }
                                        }
                                    />

                                </div>

                            </div>

                        )
                    }


                    {/* =========================
                        CATEGORIAS RESTANTES
                    ========================= */}

                    <div
                        className="
                            planejamento-categorias-restantes
                        "
                    >

                        <div
                            className="
                                planejamento-categorias-restantes-info
                            "
                        >

                            <span
                                className="
                                    planejamento-categorias-restantes-icone
                                "
                            >

                                <RiPriceTag3Line />

                            </span>


                            <div>

                                <strong>
                                    Categorias restantes
                                </strong>

                                <small>
                                    Valor ainda não distribuído
                                </small>

                            </div>

                        </div>


                        <strong
                            className="
                                planejamento-categorias-restantes-valor
                            "
                        >

                            R${" "}

                            {
                                formatarDinheiro(
                                    categoriasRestantes
                                )
                            }

                        </strong>

                    </div>


                    {/* =========================
                        EXCEDENTE
                    ========================= */}

                    {
                        valorQueAumentaPlanejamento > 0 && (

                            <div
                                className="
                planejamento-aviso-excedente
            "
                            >

                                O planejamento passará de{" "}

                                <strong>
                                    R${" "}
                                    {
                                        formatarDinheiro(
                                            totalPlanejamentoAtual
                                        )
                                    }
                                </strong>

                                {" "}para{" "}

                                <strong>
                                    R${" "}
                                    {
                                        formatarDinheiro(
                                            novoTotalPlanejamento
                                        )
                                    }
                                </strong>.

                            </div>

                        )
                    }


                    {/* =========================
                        BOTÕES
                    ========================= */}

                    <footer
                        className="
                            form-adicionar-categoria-acoes
                        "
                    >

                        <button
                            type="button"
                            className="
                                form-adicionar-categoria-cancelar
                            "
                            onClick={onClose}
                        >
                            Cancelar
                        </button>


                        <button
                            type="button"
                            className="
        form-adicionar-categoria-salvar
    "
                            onClick={
                                adicionarCategoria
                            }
                            disabled={
                                salvando ||
                                !formularioValido()
                            }
                        >
                            {
                                salvando
                                    ? "Adicionando..."
                                    : "Adicionar categoria"
                            }
                        </button>

                    </footer>

                </div>

            </section>

        </div>

    );

}


export default
    FormAdicionarCategoriaPlanejamento;