import { useEffect } from "react";

type Opcoes = {
    /** Se falso, o hook nao faz nada (equivalente a um `if (!aberto) return;` no efeito original). */
    ativo?: boolean;

    /** Se verdadeiro, a tecla Esc e ignorada (ex: enquanto uma acao esta salvando/excluindo). */
    bloqueado?: boolean;

    /** Se verdadeiro, trava o scroll do body (`overflow: hidden`) enquanto o modal estiver ativo. */
    travarScroll?: boolean;

    onFechar: () => void;
};

/**
 * Fecha um modal/formulario ao pressionar Esc, com as mesmas
 * variacoes que existiam espalhadas (e duplicadas) em varios
 * componentes Form*: alguns bloqueiam o Esc durante o salvamento,
 * alguns travam o scroll da pagina, alguns so ficam ativos quando
 * o modal esta aberto. Cada chamada abaixo reproduz exatamente o
 * comportamento que o componente original tinha.
 */
function useFecharComEsc({
    ativo = true,
    bloqueado = false,
    travarScroll = false,
    onFechar,
}: Opcoes) {
    useEffect(() => {
        if (!ativo) {
            return;
        }

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === "Escape" && !bloqueado) {
                onFechar();
            }
        }

        document.addEventListener("keydown", fecharComEscape);

        if (travarScroll) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", fecharComEscape);

            if (travarScroll) {
                document.body.style.overflow = "";
            }
        };
    }, [ativo, bloqueado, travarScroll, onFechar]);
}

export default useFecharComEsc;
