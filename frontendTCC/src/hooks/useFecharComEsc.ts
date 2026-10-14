import { useEffect } from "react";

type Opcoes = {
    ativo?: boolean;

    bloqueado?: boolean;

    travarScroll?: boolean;

    onFechar: () => void;
};

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
