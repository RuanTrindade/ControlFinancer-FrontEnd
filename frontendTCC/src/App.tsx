import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom"

import Login from "./pages/Login"

import Dashboard from "./pages/Dashboard"
import Transacoes from "./pages/Transacoes"
import Categorias from "./pages/Categorias"
import Objetivos from "./pages/Objetivos"
import ObjetivoDetalhe from "./pages/ObjetivoDetalhe"
import Planejamento from "./pages/Planejamento"
import Investimentos from "./pages/Investimentos"
import Relatorios from "./pages/Relatorios"

import RedefinirSenha
    from "./pages/RedefinirSenha"
import InvestimentoDetalhe from "./pages/InvestimentoDetalhe"


function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/transacoes"
                    element={<Transacoes />}
                />

                <Route
                    path="/categorias"
                    element={<Categorias />}
                />
                <Route
                    path="/objetivos"
                    element={<Objetivos />}
                />
                <Route
                    path="/objetivos/:id"
                    element={<ObjetivoDetalhe />}
                />
                <Route
                    path="/planejamento"
                    element={<Planejamento />}
                />
                <Route
                    path="/investimentos"
                    element={<Investimentos />}
                />

                <Route
                    path="/investimentos/:id"
                    element={<InvestimentoDetalhe />}
                />

                <Route
                    path="/relatorios"
                    element={<Relatorios />}
                />
                <Route
                    path="/redefinir-senha"
                    element={<RedefinirSenha />}
                />

            </Routes>

        </BrowserRouter>

    )

}

export default App