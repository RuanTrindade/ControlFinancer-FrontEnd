import { useMemo, useState } from "react";

import {

    RiSearchLine,
    RiCheckLine,
    RiCloseLine

} from "react-icons/ri";

import "../styles/modalCategorias.css";

export type CategoriaDisponivel = {

    id: number;

    nome: string;

    cor: string;

    icone: React.ReactNode;

}

type Props = {

    aberto: boolean;

    categorias: CategoriaDisponivel[];

    categoriasSelecionadas: number[];

    fechar: () => void;

    adicionarCategoria: (

        categoria: CategoriaDisponivel

    ) => void;

}

function ModalCategorias({

    aberto,

    categorias,

    categoriasSelecionadas,

    fechar,

    adicionarCategoria

}: Props) {

    const [

        pesquisa,

        setPesquisa

    ] = useState("");

    const categoriasFiltradas =

        useMemo(() => {

            return categorias.filter(

                categoria =>

                    !categoriasSelecionadas.includes(

                        categoria.id

                    )

                    &&

                    categoria.nome

                        .toLowerCase()

                        .includes(

                            pesquisa.toLowerCase()

                        )

            );

        }, [

            pesquisa,

            categorias,

            categoriasSelecionadas

        ]);

    if (!aberto)

        return null;

    return (

        <div className="modal-categorias-backdrop">

            <div className="modal-categorias">

                <div className="modal-categorias-topo">

                    <h2>

                        Adicionar categoria

                    </h2>

                    <button

    className="btn-fechar-modal"

    onClick={fechar}

>

    <RiCloseLine />

</button>

                </div>

                <div className="pesquisa-categoria">

                    <RiSearchLine />

                    <input

                        placeholder="Pesquisar categoria..."

                        value={pesquisa}

                        onChange={

                            e =>

                                setPesquisa(

                                    e.target.value

                                )

                        }

                    />

                </div>

                <div className="lista-categorias">

                    {

                        categoriasFiltradas.map(

                            categoria => (

                                <button

                                    key={categoria.id}

                                    className="categoria-lista"

                                    onClick={() => {

                                        adicionarCategoria(categoria);

                                        setPesquisa("");

                                        fechar();

                                    }}

                                >

                                    <div

                                        className="categoria-icone"

                                        style={{

                                            background:

                                                categoria.cor

                                        }}

                                    >

                                        {

                                            categoria.icone

                                        }

                                    </div>

                                    <span>

                                        {

                                            categoria.nome

                                        }

                                    </span>

                                    <RiCheckLine />

                                </button>

                            )

                        )

                    }

                </div>

            </div>

        </div>

    );

}

export default ModalCategorias;