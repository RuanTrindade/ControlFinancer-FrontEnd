export type TipoInvestimento =
    | "APORTE"
    | "RESGATE"
    | "RENDIMENTO";


export interface InvestimentoMovimentacao {

    id: number;

    nomeInvestimento: string;

    tipo: TipoInvestimento;

    valor: number;

    data: string;

}


export interface InvestimentoMovimentacaoRequest {

    valor: number;

    tipo: TipoInvestimento;

    referencia?: string | null;

}


export interface PaginaMovimentacao {

    content: InvestimentoMovimentacao[];

    totalElements: number;

    totalPages: number;

    size: number;

    number: number;

    first: boolean;

    last: boolean;

    empty: boolean;

}