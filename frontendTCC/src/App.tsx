import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./features/autenticacao/pages/Login";

import Dashboard from "./features/dashboard/pages/Dashboard";
import Transacoes from "./features/transacoes/pages/Transacoes";
import Categorias from "./features/categorias/pages/Categorias";
import Objetivos from "./features/objetivos/pages/Objetivos";
import ObjetivoDetalhe from "./features/objetivos/pages/ObjetivoDetalhe";
import Planejamento from "./features/planejamento/pages/Planejamento";
import Investimentos from "./features/investimentos/pages/Investimentos";
import Relatorios from "./features/relatorios/pages/Relatorios";

import RedefinirSenha from "./features/autenticacao/pages/RedefinirSenha";
import InvestimentoDetalhe from "./features/investimentos/pages/InvestimentoDetalhe";

import RotaProtegida from "./routes/RotaProtegida";
import RotaPublica from "./routes/RotaPublica";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <RotaPublica>
                            <Login />
                        </RotaPublica>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <RotaProtegida>
                            <Dashboard />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/transacoes"
                    element={
                        <RotaProtegida>
                            <Transacoes />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/categorias"
                    element={
                        <RotaProtegida>
                            <Categorias />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/objetivos"
                    element={
                        <RotaProtegida>
                            <Objetivos />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/objetivos/:id"
                    element={
                        <RotaProtegida>
                            <ObjetivoDetalhe />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/planejamento"
                    element={
                        <RotaProtegida>
                            <Planejamento />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/investimentos"
                    element={
                        <RotaProtegida>
                            <Investimentos />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/investimentos/:id"
                    element={
                        <RotaProtegida>
                            <InvestimentoDetalhe />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/relatorios"
                    element={
                        <RotaProtegida>
                            <Relatorios />
                        </RotaProtegida>
                    }
                />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
