import { RiAddLine, RiFileCopyLine } from "react-icons/ri";

type Props = {
    abrirModal: () => void;
    copiarMesAnterior: () => void;
};

function PlanejamentoVazio({ abrirModal, copiarMesAnterior }: Props) {
    return (
        <div className="planejamento-vazio">
            <div className="planejamento-card">
                <div className="planejamento-centro">
                    <div className="icone-planejamento-vazio">
                        <RiFileCopyLine />
                    </div>

                    <h2>Nenhum planejamento definido</h2>

                    <p>
                        Crie um planejamento para organizar seus limites e acompanhar melhor seus
                        gastos neste mês.
                    </p>

                    <button type="button" className="btn-planejamento" onClick={abrirModal}>
                        <RiAddLine />
                        Definir novo planejamento
                    </button>

                    <button type="button" className="btn-copiar" onClick={copiarMesAnterior}>
                        <RiFileCopyLine />
                        Copiar mês anterior
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlanejamentoVazio;
