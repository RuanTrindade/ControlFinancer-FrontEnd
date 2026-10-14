import { createContext, useContext, useState, type ReactNode } from "react";

export type AlertType = "success" | "warning" | "error" | "info";

interface AlertData {
    type: AlertType;

    title: string;

    message: string;
}

interface AlertContextType {
    alert: AlertData | null;

    showAlert: (data: AlertData) => void;

    closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
    children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
    const [alert, setAlert] = useState<AlertData | null>(null);

    function showAlert(data: AlertData) {
        setAlert(data);
    }

    function closeAlert() {
        setAlert(null);
    }

    return (
        <AlertContext.Provider
            value={{
                alert,
                showAlert,
                closeAlert,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error("useAlert deve ser utilizado dentro de um AlertProvider.");
    }

    return context;
}
