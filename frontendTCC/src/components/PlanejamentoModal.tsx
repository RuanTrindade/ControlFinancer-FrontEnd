import type { ReactNode } from "react";

import { RiCloseLine } from "react-icons/ri";

import "../styles/planejamentoModal.css";

type Props = {

    aberto: boolean;

    fechar: () => void;

    children: ReactNode;

}

function PlanejamentoModal({

    aberto,

    fechar,

    children

}: Props){

    if(!aberto)

        return null;

    return(

        <div className="planejamento-overlay">

            <div className="planejamento-modal">

                <button

                    className="planejamento-fechar"

                    onClick={fechar}

                >

                    <RiCloseLine/>

                </button>

                {children}

            </div>

        </div>

    );

}

export default PlanejamentoModal;