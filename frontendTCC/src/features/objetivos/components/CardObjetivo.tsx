import { RiArrowRightSLine, RiCalendarLine, RiTrophyLine } from "react-icons/ri";

import { useNavigate } from "react-router-dom";

import type { Objetivo } from "../types/objetivo";

import { renderizarIcone } from "../../../utils/renderizarIcone";

type Props = {
    objetivo: Objetivo;
};

function CardObjetivo({ objetivo }: Props) {
    const navigate = useNavigate();

    const percentual = Math.min(objetivo.percentual ?? 0, 100);

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const dataFinalObjetivo = new Date(`${objetivo.dataFinal}T00:00:00`);

    const objetivoVencido = !objetivo.finalizado && dataFinalObjetivo < hoje;

    function formatarData(data: string) {
        const [ano, mes, dia] = data.split("-");

        return `${dia}/${mes}/${ano}`;
    }

    return (
        <div
            className="card-objetivo"
            onClick={() => navigate(`/objetivos/${objetivo.id}`)}
            style={{
                cursor: "pointer",
            }}
        >
            <div className="card-topo">
                <div className="objetivo-info">
                    <div
                        className="objetivo-icone"
                        style={{
                            background: objetivo.cor ?? "#8b5cf6",
                        }}
                    >
                        {renderizarIcone(objetivo.icone)}
                    </div>

                    <div className="objetivo-titulo-container">
                        <h3>{objetivo.nome}</h3>

                        {objetivoVencido && (
                            <span className="objetivo-vencido">Prazo encerrado</span>
                        )}
                    </div>
                </div>

                <RiArrowRightSLine />
            </div>

            <img
                src={objetivo.imagem ?? "/images/objetivo-placeholder.jpg"}
                alt={objetivo.nome}
                className="objetivo-imagem"
            />

            <div className="objetivo-progresso">
                <div
                    className="barra"
                    style={{
                        width: `${percentual}%`,

                        background: objetivo.cor ?? "#8b5cf6",
                    }}
                />
            </div>

            <div className="objetivo-valores">
                <span>
                    R${" "}
                    {objetivo.valorAtual.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>

                <span>
                    {percentual.toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                    })}
                    %
                </span>
            </div>

            <div className="objetivo-footer">
                <span>
                    <RiTrophyLine />
                    R${" "}
                    {objetivo.valorObjetivo.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>

                <span className={objetivoVencido ? "data-objetivo-vencida" : ""}>
                    <RiCalendarLine />

                    {formatarData(objetivo.dataFinal)}
                </span>
            </div>
        </div>
    );
}

export default CardObjetivo;
