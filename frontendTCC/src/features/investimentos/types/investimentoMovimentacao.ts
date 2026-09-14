import type { Pagina } from "../../../shared/types/pagina";

export type TipoInvestimento = "APORTE" | "RESGATE" | "RENDIMENTO";

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

export type PaginaMovimentacao = Pagina<InvestimentoMovimentacao>;
