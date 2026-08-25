export type TipoAtivo =
    | "RENDA_FIXA"
    | "ACAO"
    | "FII"
    | "CRIPTOMOEDA"
    | "OUTRO";


export type InvestimentoResumo = {
    id: number;
    nome: string;
    tipo: TipoAtivo;
    dataCriacao: string;
    encerrado: boolean;
    pendenteAtualizacao: boolean;
};


export type InvestimentoEstatistica = {
    id: number;
    nome: string;
    totalAportado: number;
    totalResgatado: number;
    rendimento: number;
    saldoAtual: number;
};


export type InvestimentoResumoMensal = {
    investimentoId: number;
    nomeInvestimento: string;
    referencia: string;
    valorNoMes: number;
    totalAportesMes: number;
    totalResgatesMes: number;
    rendimentoMes: number;
    variacaoDesdeUltimaAtualizacao:
        number | null;
    atualizadoNoMes: boolean;
    referenciaUltimaAtualizacaoAnterior:
        string | null;
};

export type CarteiraInvestimentoResumo = {
    valorCarteiraNoMes: number;
    aportesMes: number;
    resgatesMes: number;
    rendimentoMes: number;
    investimentosAtivos: number;
    investimentosPendentesAtualizacao:
    number;

};


export type InvestimentoCard = {
    id: number;
    nome: string;
    tipo: TipoAtivo;
    dataCriacao: string;
    encerrado: boolean;
    pendenteAtualizacao: boolean;
    valorNoMes: number | null;
    rendimentoMes: number | null;

};


export type InvestimentoCriar = {
    usuarioId: number;
    nome: string;
    tipo: TipoAtivo;

};


export type InvestimentoAtualizar = {
    nome: string;
    tipo: TipoAtivo;

};


export type PaginaInvestimentos = {
    content: InvestimentoCard[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;

};