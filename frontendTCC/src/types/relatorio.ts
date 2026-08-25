export type RelatorioMensalBackend = {
    mes: string;
    receita: number;
    despesa: number;
    investimento: number;
};


export type RelatorioCategoriaBackend = {
    categoriaId: number;
    nome: string;
    icone: string;
    cor: string;
    limite: number;
    utilizado: number;
    percentualUtilizado: number;
};


export type RelatorioResponse = {
    historico: RelatorioMensalBackend[];
    categoriasPlanejamento: RelatorioCategoriaBackend[];
    receitaTotal: number;
    despesaTotal: number;
    investimentoTotal: number;
};