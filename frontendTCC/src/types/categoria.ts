export type TipoCategoria =
    | "RECEITA"
    | "DESPESA";

export interface CategoriaResumo {
    id: number;
    nome: string;
    cor: string;
    icone: string;
    tipo: TipoCategoria;
    padraoSistema: boolean;
}