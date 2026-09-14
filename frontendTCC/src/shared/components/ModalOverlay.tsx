import type { MouseEvent, ReactNode } from "react";

import useFecharComEsc from "../../hooks/useFecharComEsc";

type ModalOverlayProps = {
    /** Classe do fundo escurecido (mantém o CSS que o modal já tinha). */
    overlayClassName: string;

    /** Classe do cartão do modal (mantém o CSS que o modal já tinha). */
    modalClassName: string;

    onClose: () => void;

    children: ReactNode;

    /** Repassado ao useFecharComEsc: ignora a tecla Esc (ex.: enquanto salva/exclui). */
    bloqueado?: boolean;

    /** Repassado ao useFecharComEsc: trava o scroll da página enquanto o modal está aberto. */
    travarScroll?: boolean;

    /** Se falso, clicar fora do cartão não fecha o modal. */
    fecharAoClicarFora?: boolean;

    /** Id do elemento (geralmente o `<h2>`) que descreve o modal para leitores de tela. */
    ariaLabelledBy?: string;
};

/**
 * Casca comum dos modais de formulário (`Form*.tsx`).
 *
 * Antes, cada formulário copiava a mesma estrutura (overlay + clique-fora-fecha +
 * `role="dialog"`) e vários nem fechavam com Esc. Este componente concentra essa
 * estrutura e o comportamento de fechar (clique fora / Esc), enquanto cada
 * formulário continua responsável pelo próprio conteúdo (cabeçalho, corpo, rodapé)
 * e pelo próprio CSS — só passa as classes que já usava.
 */
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
