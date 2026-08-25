import type {

    ReactNode,
    MouseEvent

} from "react"

import {

    RiCloseLine

} from "react-icons/ri"

import "../styles/overlay.css"

type Props = {

    aberto: boolean

    fechar: () => void

    children: ReactNode

    titulo?: string

    largura?: number | string

    fecharAoClicarFora?: boolean
}

function Overlay({

    aberto,

    fechar,

    children,

    titulo,

    largura = 500,

    fecharAoClicarFora = true

}: Props) {

    if (!aberto)

        return null

    function clicarFora(

        e: MouseEvent<HTMLDivElement>

    ) {

        if (

            e.target ===
            e.currentTarget

            &&

            fecharAoClicarFora

        ) {

            fechar()

        }

    }

    return (

        <div

            className="
                overlay
            "

            onClick={
                clicarFora
            }

        >

            <div

                className="
                    overlay-card
                "

                style={{

                    width: largura

                }}

            >

                <div className="
                    overlay-topo
                ">

                    {

                        titulo &&

                        <h2>

                            {titulo}

                        </h2>

                    }

                    <button

                        className="
                            overlay-fechar
                        "

                        onClick={
                            fechar
                        }

                    >

                        <RiCloseLine />

                    </button>

                </div>

                <div className="
                    overlay-conteudo
                ">

                    {children}

                </div>

            </div>

        </div>

    )

}

export default Overlay