import {
    RiArrowLeftSLine,
    RiArrowRightSLine
} from "react-icons/ri";

import "../styles/paginacao.css";

type PaginacaoProps = {
    paginaAtual: number;
    totalPaginas: number;
    totalElementos: number;
    tamanhoPagina: number;
    loading?: boolean;
    nomeItem?: string;
    onPageChange: (pagina: number) => void;
};

function Paginacao({
    paginaAtual,
    totalPaginas,
    totalElementos,
    tamanhoPagina,
    loading = false,
    nomeItem = "registro",
    onPageChange
}: PaginacaoProps) {

    if (totalElementos === 0 || totalPaginas === 0) {
        return null;
    }

    const primeiroRegistro =
        paginaAtual * tamanhoPagina + 1;

    const ultimoRegistro = Math.min(
        (paginaAtual + 1) * tamanhoPagina,
        totalElementos
    );

    function gerarPaginas() {
        const paginas: Array<number | string> = [];

        if (totalPaginas <= 7) {
            for (
                let pagina = 0;
                pagina < totalPaginas;
                pagina++
            ) {
                paginas.push(pagina);
            }

            return paginas;
        }

        paginas.push(0);

        if (paginaAtual > 3) {
            paginas.push("inicio-reticencias");
        }

        const inicio = Math.max(
            1,
            paginaAtual - 1
        );

        const fim = Math.min(
            totalPaginas - 2,
            paginaAtual + 1
        );

        for (
            let pagina = inicio;
            pagina <= fim;
            pagina++
        ) {
            paginas.push(pagina);
        }

        if (paginaAtual < totalPaginas - 4) {
            paginas.push("fim-reticencias");
        }

        paginas.push(totalPaginas - 1);

        return paginas;
    }

    const paginas = gerarPaginas();

    const nomePlural =
        totalElementos === 1
            ? nomeItem
            : `${nomeItem}s`;

    return (
        <div className="paginacao">

            <div className="paginacao-informacoes">
                Mostrando{" "}
                <strong>
                    {primeiroRegistro}
                </strong>
                {" "}até{" "}
                <strong>
                    {ultimoRegistro}
                </strong>
                {" "}de{" "}
                <strong>
                    {totalElementos}
                </strong>
                {" "}
                {nomePlural}
            </div>

            <div className="paginacao-controles">

                <button
                    type="button"
                    className="paginacao-botao-navegacao"
                    onClick={() =>
                        onPageChange(paginaAtual - 1)
                    }
                    disabled={
                        paginaAtual === 0 ||
                        loading
                    }
                    aria-label="Página anterior"
                >
                    <RiArrowLeftSLine />

                    <span>
                        Anterior
                    </span>
                </button>

                <div className="paginacao-paginas">

                    {paginas.map((pagina) => {

                        if (typeof pagina === "string") {
                            return (
                                <span
                                    key={pagina}
                                    className="paginacao-reticencias"
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={pagina}
                                type="button"
                                className={
                                    pagina === paginaAtual
                                        ? "paginacao-numero ativo"
                                        : "paginacao-numero"
                                }
                                onClick={() =>
                                    onPageChange(pagina)
                                }
                                disabled={loading}
                                aria-label={`Ir para a página ${pagina + 1}`}
                                aria-current={
                                    pagina === paginaAtual
                                        ? "page"
                                        : undefined
                                }
                            >
                                {pagina + 1}
                            </button>
                        );
                    })}

                </div>

                <button
                    type="button"
                    className="paginacao-botao-navegacao"
                    onClick={() =>
                        onPageChange(paginaAtual + 1)
                    }
                    disabled={
                        paginaAtual + 1 >= totalPaginas ||
                        loading
                    }
                    aria-label="Próxima página"
                >
                    <span>
                        Próxima
                    </span>

                    <RiArrowRightSLine />
                </button>

            </div>

        </div>
    );
}

export default Paginacao;