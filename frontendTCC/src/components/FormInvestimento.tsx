import {
    useEffect,
    useState
} from "react";

import {
    RiCloseLine,
    RiBankLine,
    RiArrowDownSLine,
    RiMoneyDollarCircleLine,
    RiStockLine,
    RiBuilding2Line,
    RiBtcLine,
    RiMoreLine,
    RiCheckLine
} from "react-icons/ri";

import {
    criarInvestimento,
    atualizarInvestimento
} from "../services/investimentoService";

import type {
    InvestimentoResumo,
    TipoAtivo
} from "../types/investimento";

import "../styles/formInvestimento.css";


type Props = {

    usuarioId: number;

    investimento?: InvestimentoResumo | null;

    onClose: () => void;

    onSalvar: () => Promise<void> | void;

};


function FormInvestimento({

    usuarioId,
    investimento = null,
    onClose,
    onSalvar

}: Props) {


    const editando =
        investimento !== null;


    const [
        nome,
        setNome
    ] =
        useState("");


    const [
        tipo,
        setTipo
    ] =
        useState<TipoAtivo>(
            "RENDA_FIXA"
        );


    const [
        dropdownTipoAberto,
        setDropdownTipoAberto
    ] =
        useState(false);


    const [
        salvando,
        setSalvando
    ] =
        useState(false);


    const [
        erro,
        setErro
    ] =
        useState<string | null>(
            null
        );


    const tiposInvestimento = [

        {
            valor: "RENDA_FIXA" as const,
            nome: "Renda fixa",
            descricao: "CDB, Tesouro, LCI, LCA...",
            icone: <RiMoneyDollarCircleLine />
        },

        {
            valor: "ACAO" as const,
            nome: "Ações",
            descricao: "Ações negociadas em bolsa",
            icone: <RiStockLine />
        },

        {
            valor: "FII" as const,
            nome: "Fundo imobiliário",
            descricao: "Fundos de investimento imobiliário",
            icone: <RiBuilding2Line />
        },

        {
            valor: "CRIPTOMOEDA" as const,
            nome: "Criptomoeda",
            descricao: "Bitcoin, Ethereum e outras",
            icone: <RiBtcLine />
        },

        {
            valor: "OUTRO" as const,
            nome: "Outro",
            descricao: "Outro tipo de investimento",
            icone: <RiMoreLine />
        }

    ];


    /* ===================================================
       CARREGAR DADOS NA EDIÇÃO
    =================================================== */

    useEffect(
        () => {

            if (!investimento) {

                setNome("");
                setTipo("RENDA_FIXA");

                return;

            }


            setNome(
                investimento.nome
            );


            setTipo(
                investimento.tipo
            );

        },
        [
            investimento
        ]
    );


    const tipoSelecionado =
        tiposInvestimento.find(
            opcao =>
                opcao.valor === tipo
        );


    /* ===================================================
       SALVAR
    =================================================== */

    async function salvarInvestimento() {

        if (salvando) {
            return;
        }


        if (!nome.trim()) {

            setErro(
                "Informe o nome do investimento."
            );

            return;

        }


        try {

            setSalvando(true);

            setErro(null);


            if (
                editando &&
                investimento
            ) {

                await atualizarInvestimento(

                    investimento.id,

                    usuarioId,

                    {
                        nome:
                            nome.trim(),

                        tipo
                    }

                );

            }
            else {

                await criarInvestimento({

                    usuarioId,

                    nome:
                        nome.trim(),

                    tipo

                });

            }


            await onSalvar();


            onClose();

        }
        catch (error) {

            console.error(
                editando
                    ? "Erro ao atualizar investimento:"
                    : "Erro ao criar investimento:",
                error
            );


            setErro(
                error instanceof Error
                    ? error.message
                    : editando
                        ? "Não foi possível atualizar o investimento."
                        : "Não foi possível criar o investimento."
            );

        }
        finally {

            setSalvando(false);

        }

    }


    function enviarFormulario(
        event: React.FormEvent
    ) {

        event.preventDefault();

        salvarInvestimento();

    }


    return (

        <div
            className="overlay-form-investimento"
            onClick={
                salvando
                    ? undefined
                    : onClose
            }
        >

            <div
                className="modal-form-investimento"
                onClick={
                    event =>
                        event.stopPropagation()
                }
            >


                <div className="cabecalho-form-investimento">


                    <div className="titulo-form-investimento">


                        <div className="icone-form-investimento">

                            <RiBankLine />

                        </div>


                        <div>

                            <h2>

                                {
                                    editando
                                        ? "Editar investimento"
                                        : "Novo investimento"
                                }

                            </h2>

                            <p>

                                {
                                    editando
                                        ? "Atualize o nome ou o tipo do investimento."
                                        : "Cadastre um investimento para acompanhar sua evolução."
                                }

                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        className="fechar-form-investimento"
                        onClick={
                            onClose
                        }
                        disabled={
                            salvando
                        }
                        aria-label="Fechar"
                    >

                        <RiCloseLine />

                    </button>

                </div>


                <form
                    className="conteudo-form-investimento"
                    onSubmit={
                        enviarFormulario
                    }
                >


                    {
                        erro && (

                            <div className="erro-form-investimento">

                                {erro}

                            </div>

                        )
                    }


                    <div className="campo-form-investimento">

                        <label htmlFor="nome-investimento">

                            Nome do investimento

                        </label>


                        <input
                            id="nome-investimento"
                            type="text"
                            value={
                                nome
                            }
                            onChange={
                                event =>
                                    setNome(
                                        event.target.value
                                    )
                            }
                            placeholder="Ex: CDB Nubank"
                            maxLength={100}
                            autoFocus
                            disabled={
                                salvando
                            }
                        />

                    </div>


                    <div className="campo-form-investimento">

                        <label>
                            Tipo do investimento
                        </label>


                        <div className="dropdown-tipo-investimento">

                            <button
                                type="button"
                                className={
                                    dropdownTipoAberto
                                        ? "dropdown-tipo-botao aberto"
                                        : "dropdown-tipo-botao"
                                }
                                onClick={() =>
                                    setDropdownTipoAberto(
                                        aberto => !aberto
                                    )
                                }
                                disabled={
                                    salvando
                                }
                            >

                                <div className="dropdown-tipo-selecionado">

                                    <div className="icone-tipo-investimento">

                                        {
                                            tipoSelecionado?.icone
                                        }

                                    </div>


                                    <div className="texto-tipo-investimento">

                                        <strong>
                                            {
                                                tipoSelecionado?.nome
                                            }
                                        </strong>

                                        <span>
                                            {
                                                tipoSelecionado?.descricao
                                            }
                                        </span>

                                    </div>

                                </div>


                                <RiArrowDownSLine
                                    className="seta-dropdown-investimento"
                                />

                            </button>


                            {
                                dropdownTipoAberto && (

                                    <div className="menu-tipos-investimento">

                                        {
                                            tiposInvestimento.map(
                                                opcao => {

                                                    const selecionado =
                                                        opcao.valor === tipo;


                                                    return (

                                                        <button
                                                            type="button"
                                                            key={
                                                                opcao.valor
                                                            }
                                                            className={
                                                                selecionado
                                                                    ? "opcao-tipo-investimento selecionada"
                                                                    : "opcao-tipo-investimento"
                                                            }
                                                            onClick={() => {

                                                                setTipo(
                                                                    opcao.valor
                                                                );

                                                                setDropdownTipoAberto(
                                                                    false
                                                                );

                                                            }}
                                                        >

                                                            <div className="icone-opcao-investimento">

                                                                {
                                                                    opcao.icone
                                                                }

                                                            </div>


                                                            <div className="texto-opcao-investimento">

                                                                <strong>
                                                                    {
                                                                        opcao.nome
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        opcao.descricao
                                                                    }
                                                                </span>

                                                            </div>


                                                            {
                                                                selecionado && (

                                                                    <RiCheckLine
                                                                        className="check-tipo-investimento"
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


                    <div className="acoes-form-investimento">


                        <button
                            type="button"
                            className="cancelar-form-investimento"
                            onClick={
                                onClose
                            }
                            disabled={
                                salvando
                            }
                        >

                            Cancelar

                        </button>


                        <button
                            type="submit"
                            className="salvar-form-investimento"
                            disabled={
                                salvando
                            }
                        >

                            {
                                salvando
                                    ? editando
                                        ? "Salvando..."
                                        : "Criando..."
                                    : editando
                                        ? "Salvar alterações"
                                        : "Criar investimento"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default FormInvestimento;