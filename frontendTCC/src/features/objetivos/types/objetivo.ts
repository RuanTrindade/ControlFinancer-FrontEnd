import type { Pagina } from "../../../shared/types/pagina";

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

export type PaginaObjetivo = Pagina<Objetivo>;

export type PaginaObjetivoMovimentacao = Pagina<ObjetivoMovimentacao>;
