import { useMemo } from "react";

import { RiMoneyDollarCircleLine, RiArrowRightLine } from "react-icons/ri";

import { NumericFormat } from "react-number-format";

import { useAlert } from "../../../context/AlertContext";

import "../styles/formPlanejamento.css";

type Props = {
    renda: string;

    setRenda: React.Dispatch<React.SetStateAction<string>>;

    percentualEconomia: string;

    setPercentualEconomia: React.Dispatch<React.SetStateAction<string>>;

    avancar: () => void;
};

function FormPlanejamento({
    renda,
    setRenda,
    percentualEconomia,
    setPercentualEconomia,
    avancar,
}: Props) {
    const { showAlert } = useAlert();

    const resumo = useMemo(() => {
        const rendaNumero = Number(renda) || 0;

        const porcentagem = Number(percentualEconomia) || 0;

        const valorEconomia = (rendaNumero * porcentagem) / 100;

        const orcamento = rendaNumero - valorEconomia;

        return {
            valorEconomia,
            orcamento,
        };
    }, [renda, percentualEconomia]);

    function validarEAvancar() {
        const rendaNumero = Number(renda);

        const economiaNumero = Number(percentualEconomia);

        if (!rendaNumero || rendaNumero <= 0) {
            showAlert({
                type: "warning",
                title: "Renda inválida",
                message: "Informe uma renda mensal válida.",
            });

            return;
        }

        if (economiaNumero < 0 || economiaNumero > 100) {
            showAlert({
                type: "warning",
                title: "Percentual inválido",
                message: "O percentual de economia deve estar entre 0 e 100.",
            });

            return;
        }

        avancar();
    }

    return (
        <div className="form-planejamento">
            <h2>Criar Planejamento</h2>

            <span className="subtitulo-planejamento">Insira as informações abaixo</span>

            <div className="campo-planejamento">
                <label>Quanto você ganha por mês?</label>

                <NumericFormat
                    thousandSeparator="."
                    decimalSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                    allowNegative={false}
                    prefix="R$ "
                    placeholder="R$ 0,00"
                    value={renda}
                    onValueChange={(valores) => setRenda(valores.value)}
                />
            </div>

            <div className="campo-planejamento">
                <label>Quanto deseja economizar por mês?</label>

                <NumericFormat
                    decimalSeparator=","
                    decimalScale={2}
                    allowNegative={false}
                    suffix=" %"
                    placeholder="0 %"
                    value={percentualEconomia}
                    isAllowed={(valores) => (valores.floatValue ?? 0) <= 100}
                    onValueChange={(valores) => setPercentualEconomia(valores.value)}
                />

                <small>Essa porcentagem será utilizada para calcular seu orçamento mensal.</small>
            </div>

            <div className="resumo-planejamento">
                <RiMoneyDollarCircleLine />

                <p>Seu orçamento mensal será:</p>

                <strong>
                    {resumo.orcamento.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                </strong>

                <p>Você economizará mensalmente:</p>

                <span>
                    {resumo.valorEconomia.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                </span>
            </div>

            <button type="button" className="btn-avancar-planejamento" onClick={validarEAvancar}>
                <RiArrowRightLine />
            </button>
        </div>
    );
}

export default FormPlanejamento;
