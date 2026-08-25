import {
    RiMoonClearLine,
    RiSunLine,
} from "react-icons/ri";

import { useMes } from "../context/MesContext";

import "../styles/topbar.css";

type Props = {
    darkMode: boolean;

    setDarkMode: (
        valor: boolean
    ) => void;

    mostrarMeses?: boolean;
};

function Topbar({
    darkMode,
    setDarkMode,
    mostrarMeses = true
}: Props) {

    const {
        referenciaAtual,
        setReferenciaAtual
    } = useMes();

    function alterarMes(
        quantidade: number
    ) {
        const novaReferencia = new Date(
            referenciaAtual.getFullYear(),
            referenciaAtual.getMonth() + quantidade,
            1
        );

        setReferenciaAtual(novaReferencia);
    }

    function formatarMes(data: Date) {

        const meses = [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez"
        ];

        return `${meses[data.getMonth()]}/${data.getFullYear()}`;
    }

    const mesAnterior = new Date(
        referenciaAtual.getFullYear(),
        referenciaAtual.getMonth() - 1,
        1
    );

    const proximoMes = new Date(
        referenciaAtual.getFullYear(),
        referenciaAtual.getMonth() + 1,
        1
    );

    return (
        <header className="topbar">

            {mostrarMeses ? (
                <div className="topbar-meses">

                    <button
                        type="button"
                        onClick={() =>
                            alterarMes(-1)
                        }
                    >
                        {formatarMes(mesAnterior)}
                    </button>

                    <button
                        type="button"
                        className="ativo"
                    >
                        {formatarMes(referenciaAtual)}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            alterarMes(1)
                        }
                    >
                        {formatarMes(proximoMes)}
                    </button>

                </div>
            ) : (
                <div
                    className="topbar-meses"
                    style={{
                        visibility: "hidden"
                    }}
                >
                    <button type="button">
                        Mês anterior
                    </button>

                    <button type="button">
                        Mês atual
                    </button>

                    <button type="button">
                        Próximo mês
                    </button>
                </div>
            )}

            <div className="topbar-acoes">

                {/* NOTIFICAÇÕES TEMPORARIAMENTE DESATIVADAS */}

                <div className="topbar-notificacao-placeholder">

                    {/*
        <button
            type="button"
            className="topbar-btn"
        >
            <RiNotification3Line />

            <span>
                3
            </span>
        </button>
        */}

                </div>


                <button
                    type="button"
                    className="topbar-btn"
                    onClick={() =>
                        setDarkMode(!darkMode)
                    }
                >
                    {
                        darkMode
                            ? <RiSunLine />
                            : <RiMoonClearLine />
                    }
                </button>

            </div>

        </header>
    );
}

export default Topbar;