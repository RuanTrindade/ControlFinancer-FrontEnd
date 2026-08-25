import {
    createContext,
    useContext,
    useState,
    type ReactNode
} from "react";

type MesContextType = {
    referenciaAtual: Date;

    setReferenciaAtual: (
        data: Date
    ) => void;
};

const MesContext = createContext<
    MesContextType | undefined
>(undefined);

export function MesProvider({
    children
}: {
    children: ReactNode;
}) {

    const [
        referenciaAtual,
        setReferenciaAtual
    ] = useState(() => {
        const hoje = new Date();

        return new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            1
        );
    });

    return (
        <MesContext.Provider
            value={{
                referenciaAtual,
                setReferenciaAtual
            }}
        >
            {children}
        </MesContext.Provider>
    );
}

export function useMes() {
    const context =
        useContext(MesContext);

    if (!context) {
        throw new Error(
            "useMes deve ser usado dentro do MesProvider."
        );
    }

    return context;
}