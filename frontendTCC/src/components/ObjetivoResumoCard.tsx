import {

    RiCalendarLine,
    RiRoadMapLine,
    RiTrophyLine

} from "react-icons/ri"

type Props = {

    objetivo: {

        nome: string

        valorAtual: number

        valorObjetivo: number

        porcentagem: number

        dataFinal: string

        cor: string
    }
}

function ObjetivoResumoCard({

    objetivo

}: Props) {

    const valorMensal = Math.round(

        (objetivo.valorObjetivo -
            objetivo.valorAtual)

        / 25
    )

    return (

        <div className="
            resumo-card
        ">

            {/* TÍTULO */}

            <h2>

                {
                    objetivo.nome
                }

            </h2>

            {/* META E DATA */}

            <div className="
                resumo-info
            ">

                <span>

                    <RiTrophyLine />

                    R$ {

                        objetivo.valorObjetivo.toLocaleString(
                            "pt-BR",
                            {

                                minimumFractionDigits: 2
                            }
                        )
                    }

                </span>

                <span>

                    <RiCalendarLine />

                    {
                        objetivo.dataFinal
                    }

                </span>

            </div>

            {/* GRÁFICO */}

            <div

                className="
                    progresso-circular
                "

                style={{

                    background:

                        `conic-gradient(
                            ${objetivo.cor}
                            0%
                            ${objetivo.porcentagem}%,

                            #e5e7eb
                            ${objetivo.porcentagem}%
                            100%
                        )`
                }}
            >

                <div className="
                    progresso-centro
                ">

                    {
                        objetivo.porcentagem
                    }%

                </div>

            </div>

            {/* VALOR GUARDADO */}

            <div className="
                valor-atual
            ">

                R$ {

                    objetivo.valorAtual.toLocaleString(
                        "pt-BR",
                        {

                            minimumFractionDigits: 2
                        }
                    )
                }

                <span>

                    guardados

                </span>

            </div>

            {/* TEXTO INFERIOR */}

            <div className="
                objetivo-dica
            ">

                <RiRoadMapLine />

                <div>

                    Para atingir seu objetivo
                    no prazo, você precisa
                    guardar aproximadamente

                    <strong>

                        {" "}R$ {

                            valorMensal.toLocaleString(
                                "pt-BR",
                                {

                                    minimumFractionDigits: 2
                                }
                            )
                        }

                    </strong>

                    {" "}por mês.

                </div>

            </div>

        </div>

    )

}

export default ObjetivoResumoCard