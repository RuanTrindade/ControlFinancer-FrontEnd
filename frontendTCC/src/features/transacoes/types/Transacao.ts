export type Transacao = {
    id: number;
    descricao: string;
    tipo: "RECEITA" | "DESPESA";

    categoriaId: number;
    categoria: string;
    corCategoria: string;
    iconeCategoria: string;

    valor: number;
    metodo: string;
    status: string;
    data: string;
    urlComprovante: string | null;

    bloqueadaSistema: boolean;

    objetivoId: number | null;
    objetivoNome: string | null;
    objetivoFinalizado: boolean | null;
};
