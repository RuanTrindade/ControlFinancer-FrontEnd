import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const CHAVE_USUARIO = "usuario-logado";

export type Usuario = {
    id: number;
    nome: string;
    email: string;
};

type AuthContextType = {
    usuario: Usuario | null;

    autenticado: boolean;

    verificando: boolean;

    login: (usuario: Usuario) => void;

    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function lerUsuarioSalvo(): Usuario | null {
    const bruto = localStorage.getItem(CHAVE_USUARIO);

    if (!bruto) {
        return null;
    }

    try {
        return JSON.parse(bruto) as Usuario;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(lerUsuarioSalvo);

    const [verificando, setVerificando] = useState(usuario === null);

    function login(usuario: Usuario) {
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));

        setUsuario(usuario);
    }

    function logout() {
        localStorage.removeItem(CHAVE_USUARIO);

        setUsuario(null);

        fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            credentials: "include",
        }).catch(() => {});
    }

    useEffect(() => {
        if (usuario) {
            setVerificando(false);

            return;
        }

        fetch("http://localhost:8080/auth/me", {
            credentials: "include",
        })
            .then((resposta) => (resposta.ok ? resposta.json() : null))
            .then((dados) => {
                if (dados) {
                    login({
                        id: dados.id,
                        nome: dados.nome,
                        email: dados.email,
                    });
                }
            })
            .catch(() => {})
            .finally(() => setVerificando(false));
    }, []);

    return (
        <AuthContext.Provider
            value={{
                usuario,
                autenticado: usuario !== null,
                verificando,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro do AuthProvider.");
    }

    return context;
}

export function useUsuarioLogado(): Usuario {
    const { usuario } = useAuth();

    if (!usuario) {
        throw new Error(
            "useUsuarioLogado só pode ser usado dentro de uma rota protegida (usuário logado).",
        );
    }

    return usuario;
}
