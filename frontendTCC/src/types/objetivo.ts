export type Objetivo = {
    id: number;
    nome: string;
    valorObjetivo: number;
    valorAtual: number;
    percentual: number;
    dataFinal: string;
    finalizado: boolean;
    cor: string | null;
    icone: string | null;
    imagem: string | null;
};

export type ObjetivoMovimentacao = {
    id: number;
    objetivo: string;
    tipo: "DEPOSITO" | "RETIRADA";
    valor: number;
    data: string;
};

export type PaginaObjetivo = {
    content: Objetivo[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
};

export type PaginaObjetivoMovimentacao = {
    content: ObjetivoMovimentacao[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
};