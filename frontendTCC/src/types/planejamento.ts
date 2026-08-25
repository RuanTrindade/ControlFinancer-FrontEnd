export interface PlanejamentoCategoriaResumo {
    id: number;
    categoriaId: number;
    categoria: string;
    icone: string;
    cor: string;

    limite: number;

    pago: number;
    pendente: number;

    pagoUltrapassado: number;
    pendenteUltrapassado: number;

    restante: number;
    percentualUtilizado: number;
    status: string;
}

export interface PlanejamentoMensalResumo {
    id?: number;
    referencia: string;

    rendaMensal: number;
    receitasMes: number;

    percentualEconomia: number;

    metaEconomia: number;
    valorDisponivel: number;

    gastoTotal: number;
    saldoRestante: number;

    percentualGasto: number;
}

export interface PlanejamentoDashboard {
    resumoMensal: PlanejamentoMensalResumo;
    categorias: PlanejamentoCategoriaResumo[];
}

export interface PlanejamentoMensal {
    id: number;
    referencia: string;
    rendaMensal: number;
    percentualEconomia: number;
    usuarioId?: number;
}


export interface AtualizarPlanejamentoRequest {
    referencia: string;
    rendaMensal: number;
    percentualEconomia: number;
}

export interface PlanejamentoCategoriaRequest {
    categoriaId: number;
    limite: number;
}

export interface PlanejamentoCriar {
    usuarioId: number;
    referencia: string;
    rendaMensal: number;
    percentualEconomia: number;

}


export interface PlanejamentoResumo {
    id: number;
    referencia: string;
    rendaMensal: number;
    percentualEconomia: number;
}

export interface CopiarPlanejamentoRequest {
    novaReferencia: string;
}