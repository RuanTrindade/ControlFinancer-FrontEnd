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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/transacoes" element={<Transacoes />} />

                <Route path="/categorias" element={<Categorias />} />
                <Route path="/objetivos" element={<Objetivos />} />
                <Route path="/objetivos/:id" element={<ObjetivoDetalhe />} />
                <Route path="/planejamento" element={<Planejamento />} />
                <Route path="/investimentos" element={<Investimentos />} />

                <Route path="/investimentos/:id" element={<InvestimentoDetalhe />} />

                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
