import type { MouseEvent, ReactNode } from "react";

import useFecharComEsc from "../../hooks/useFecharComEsc";

type ModalOverlayProps = {
    overlayClassName: string;

    modalClassName: string;

    onClose: () => void;

    children: ReactNode;

    bloqueado?: boolean;

    travarScroll?: boolean;

    fecharAoClicarFora?: boolean;

    ariaLabelledBy?: string;
};

function ModalOverlay({
    overlayClassName,
    modalClassName,
    onClose,
    children,
    bloqueado = false,
    travarScroll = false,
    fecharAoClicarFora = true,
    ariaLabelledBy,
}: ModalOverlayProps) {
    useFecharComEsc({
        bloqueado,
        travarScroll,
        onFechar: onClose,
    });

    function clicarNoFundo(evento: MouseEvent<HTMLDivElement>) {
        if (fecharAoClicarFora && evento.target === evento.currentTarget) {
            onClose();
        }
    }

    return (
        <div className={overlayClassName} onMouseDown={clicarNoFundo}>
            <section
                className={modalClassName}
                role="dialog"
                aria-modal="true"
                aria-labelledby={ariaLabelledBy}
            >
                {children}
            </section>
        </div>
    );
}

export default ModalOverlay;
