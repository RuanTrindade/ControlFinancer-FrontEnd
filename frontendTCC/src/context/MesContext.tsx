import { createContext, useContext, useState, type ReactNode } from "react";

type MesContextType = {
    referenciaAtual: Date;

    setReferenciaAtual: (data: Date) => void;

    /** Mês (1-12) e ano já derivados de `referenciaAtual`, para não recalcular em cada página. */
    mes: number;
    ano: number;
};

const MesContext = createContext<MesContextType | undefined>(undefined);

export function MesProvider({ children }: { children: ReactNode }) {
    const [referenciaAtual, setReferenciaAtual] = useState(() => {
        const hoje = new Date();

        return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    });

    return (
        <MesContext.Provider
            value={{
                referenciaAtual,
                setReferenciaAtual,
                mes: referenciaAtual.getMonth() + 1,
                ano: referenciaAtual.getFullYear(),
            }}
        >
            {children}
        </MesContext.Provider>
    );
}

export function useMes() {
    const context = useContext(MesContext);

    if (!context) {
        throw new Error("useMes deve ser usado dentro do MesProvider.");
    }

    return context;
}
