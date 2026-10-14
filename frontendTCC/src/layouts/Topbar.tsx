import { RiMoonClearLine, RiSunLine, RiMenuLine } from "react-icons/ri";

import { useMes } from "../context/MesContext";

import "./topbar.css";

type Props = {
    darkMode: boolean;

    setDarkMode: (valor: boolean) => void;

    mostrarMeses?: boolean;

    fechado: boolean;

    setFechado: (valor: boolean) => void;
};

function Topbar({ darkMode, setDarkMode, mostrarMeses = true, fechado, setFechado }: Props) {
    const { referenciaAtual, setReferenciaAtual } = useMes();

    function alterarMes(quantidade: number) {
        const novaReferencia = new Date(
            referenciaAtual.getFullYear(),
            referenciaAtual.getMonth() + quantidade,
            1,
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
            "Dez",
        ];

        return `${meses[data.getMonth()]}/${data.getFullYear()}`;
    }

    const mesAnterior = new Date(referenciaAtual.getFullYear(), referenciaAtual.getMonth() - 1, 1);

    const proximoMes = new Date(referenciaAtual.getFullYear(), referenciaAtual.getMonth() + 1, 1);

    return (
        <header className="topbar">
            <button
                type="button"
                className="topbar-btn-menu"
                onClick={() => setFechado(!fechado)}
                aria-label="Abrir menu"
            >
                <RiMenuLine />
            </button>

            {mostrarMeses ? (
                <div className="topbar-meses">
                    <button type="button" onClick={() => alterarMes(-1)}>
                        {formatarMes(mesAnterior)}
                    </button>

                    <button type="button" className="ativo">
                        {formatarMes(referenciaAtual)}
                    </button>

                    <button type="button" onClick={() => alterarMes(1)}>
                        {formatarMes(proximoMes)}
                    </button>
                </div>
            ) : (
                <div
                    className="topbar-meses"
                    style={{
                        visibility: "hidden",
                    }}
                >
                    <button type="button">Mês anterior</button>

                    <button type="button">Mês atual</button>

                    <button type="button">Próximo mês</button>
                </div>
            )}

            <div className="topbar-acoes">
                <div className="topbar-notificacao-placeholder"></div>

                <button type="button" className="topbar-btn" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <RiSunLine /> : <RiMoonClearLine />}
                </button>
            </div>
        </header>
    );
}

export default Topbar;
