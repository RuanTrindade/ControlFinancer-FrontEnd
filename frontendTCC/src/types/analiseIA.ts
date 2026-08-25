export type AlertaIA = {
    tipo: string;
    categoria: string;
    severidade:
        | "INFO"
        | "ATENCAO"
        | "CRITICO";
    mensagem: string;
};


export type RedistribuicaoIA = {
    origem: string;
    destino: string;
    valorSugerido: number;
    motivo: string;
};


export type SugestaoIA = {
    titulo: string;
    descricao: string;
    prioridade:
        | "BAIXA"
        | "MEDIA"
        | "ALTA";
};


export type IndicadoresIA = {
    saldo: number;
    receitaMes: number;
    despesaMes: number;
    investimentoMes: number;
    carteiraInvestimentos: number;
};


export type ComparacaoMensalIA = {
    receitaVariacao: number;
    despesaVariacao: number;
    investimentoVariacao: number;
    mensagem: string;
};


export type ObjetivoIA = {
    id: number;
    nome: string;
    valorObjetivo: number;
    valorAtual: number;
    percentual: number;
    dataFinal: string | null;
    recomendacao: string;
};


export type InvestimentoIA = {
    valorCarteira: number;
    aportesMes: number;
    resgatesMes: number;
    rendimentoAcumulado: number;
    investimentosAtivos: number;
    mensagem: string;
};


export type HistoricoIA = {
    mes: string;
    receita: number;
    despesa: number;
    investimento: number;
};


export type AnaliseIAResponse = {
    resumo: string;

    nivelFinanceiro:
        | "MUITO_BOM"
        | "BOM"
        | "ATENCAO"
        | "CRITICO"
        | "INDEFINIDO";

    indicadores: IndicadoresIA;

    comparacaoMensal: ComparacaoMensalIA;

    alertas: AlertaIA[];

    redistribuicoes: RedistribuicaoIA[];

    sugestoes: SugestaoIA[];

    objetivos: ObjetivoIA[];

    investimentos: InvestimentoIA;

    insights: string[];

    historico: HistoricoIA[];
};