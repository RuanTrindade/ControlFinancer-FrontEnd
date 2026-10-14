import {
    RiDashboardLine,
    RiExchangeDollarLine,
    RiPriceTag3Line,
    RiFlagLine,
    RiBarChartBoxLine,
    RiWallet3Line,
    RiFileChartLine,
    RiLogoutBoxRLine,
} from "react-icons/ri";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import "./sidebar.css";

type Props = {
    fechado: boolean;

    setFechado: (valor: boolean) => void;
};

function Sidebar({
    fechado,

    setFechado,
}: Props) {
    const location = useLocation();

    const navigate = useNavigate();

    const { logout } = useAuth();

    function sair() {
        logout();

        navigate("/");
    }

    return (
        <aside
            className={`
                sidebar
                ${fechado ? "close" : ""}
            `}
        >
            <div className="logo" onClick={() => setFechado(!fechado)}>
                <div
                    className="
        logo-circle
    "
                ></div>

                {!fechado && (
                    <div
                        className="
                    logo-name
                "
                    >
                        <span>Fin</span>
                        Control
                    </div>
                )}
            </div>

            <ul className="side-menu">
                <li className={location.pathname === "/dashboard" ? "active" : ""}>
                    <Link to="/dashboard">
                        <RiDashboardLine />

                        <span>Dashboard</span>
                    </Link>
                </li>

                <li className={location.pathname === "/transacoes" ? "active" : ""}>
                    <Link to="/transacoes">
                        <RiExchangeDollarLine />

                        <span>Transações</span>
                    </Link>
                </li>

                <li className={location.pathname === "/categorias" ? "active" : ""}>
                    <Link to="/categorias">
                        <RiPriceTag3Line />

                        <span>Categorias</span>
                    </Link>
                </li>

                <li className={location.pathname.startsWith("/objetivos") ? "active" : ""}>
                    <Link to="/objetivos">
                        <RiFlagLine />

                        <span>Objetivos</span>
                    </Link>
                </li>

                <li className={location.pathname === "/planejamento" ? "active" : ""}>
                    <Link to="/planejamento">
                        <RiBarChartBoxLine />

                        <span>Planejamento</span>
                    </Link>
                </li>

                <li className={location.pathname === "/investimentos" ? "active" : ""}>
                    <Link to="/investimentos">
                        <RiWallet3Line />

                        <span>Investimentos</span>
                    </Link>
                </li>

                <li className={location.pathname === "/relatorios" ? "active" : ""}>
                    <Link to="/relatorios">
                        <RiFileChartLine />

                        <span>Relatórios</span>
                    </Link>
                </li>
            </ul>

            <ul className="side-menu">
                <li>
                    <a
                        href="#"
                        className="logout"
                        onClick={(evento) => {
                            evento.preventDefault();

                            sair();
                        }}
                    >
                        <RiLogoutBoxRLine />

                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
