export type DashboardCategoria = {
    categoriaId: number;
    nome: string;
    icone: string;
    limite: number;
    utilizado: number;
    percentualUtilizado: number;
    status: "OK" | "ATENÇÃO" | "ESTOUROU";
};


export type DashboardTransacao = {
    id: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: "RECEITA" | "DESPESA";
    categoria: string;
    icone: string;
};


export type DashboardResponse = {
    saldo: number;
    receita: number;
    despesa: number;
    investimento: number;
    categoriasCriticas: DashboardCategoria[];
    ultimasTransacoes: DashboardTransacao[];
};