import {
    excluirCategoriaPlanejamento
} from "../services/planejamentoCategoriaService";

import ConfirmarExclusaoModal
    from "./ConfirmarExclusaoModal";


type Props = {

    id: number;

    nome: string;

    limite: number;

    usuarioId: number;

    onClose: () => void;

    onExcluir: () => Promise<void>;
};


/**
 * Wrapper fino sobre o ConfirmarExclusaoModal genérico.
 * Mantém a mesma API (props) de antes — nenhuma tela que
 * usa este componente precisa ser alterada.
 */
function ConfirmarExclusaoCategoriaPlanejamento({
    id,
    nome,
    limite,
    usuarioId,
    onClose,
    onExcluir
}: Props) {

    return (

        <ConfirmarExclusaoModal
            aberto={true}
            titulo="Excluir categoria do planejamento?"
            descricao={
                <>
                    Você está prestes a remover{" "}
                    <strong>{nome}</strong>{" "}
                    deste planejamento.
                </>
            }
            resumo={{
                label: "Valor planejado",
                valor:
                    "R$ " +
                    limite.toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )
            }}
            aviso={
                <>
                    As transações dessa categoria
                    não serão excluídas.

                    <br />

                    Elas passarão a ser consideradas
                    em <strong>Categorias restantes</strong>
                    enquanto a categoria não fizer parte
                    do planejamento.
                </>
            }
            confirmarLabel="Excluir categoria"
            confirmandoLabel="Excluindo..."
            erroPadrao="Não foi possível excluir a categoria."
            onClose={onClose}
            onConfirmar={async () => {

                await excluirCategoriaPlanejamento(
                    id,
                    usuarioId
                );

                await onExcluir();

            }}
        />

    );

}


export default
ConfirmarExclusaoCategoriaPlanejamento;
