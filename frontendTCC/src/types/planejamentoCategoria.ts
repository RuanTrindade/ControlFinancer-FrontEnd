export interface PlanejamentoCategoriaCriar {
    planejamentoId: number;
    categoriaId: number;
    limite: number;

}

export interface PlanejamentoCategoriaResponse {
    id: number;
    categoria: string;
    limite: number;

}