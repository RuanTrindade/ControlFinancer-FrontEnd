import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Autenticação do lado do frontend.
 *
 * Duas formas de login coexistem no backend:
 *
 * - Email/senha (`POST /auth/login`): não cria sessão nenhuma, só
 *   valida e devolve os dados do usuário. Por isso guardamos esses
 *   dados no localStorage assim que o login dá certo.
 *
 * - Google (`/oauth2/authorization/google`): é um redirect inteiro
 *   feito pelo backend, nunca passa pelo formulário/pela função
 *   `login()` daqui. Mas esse fluxo cria uma sessão de verdade no
 *   Spring Security. Por isso, ao carregar o app, se não achar nada
 *   salvo localmente, perguntamos pro backend (`GET /auth/me`, com
 *   cookie de sessão) se existe alguém logado por esse caminho.
 *
 * A rota `/auth/**` está liberada para qualquer um no SecurityConfig
 * (`anyRequest().permitAll()`), então isso é uma trava de navegação
 * no frontend, não uma proteção de API de verdade ainda.
 */

const CHAVE_USUARIO = "usuario-logado";

export type Usuario = {
    id: number;
    nome: string;
    email: string;
};

type AuthContextType = {
    usuario: Usuario | null;

    autenticado: boolean;

    /** Verdadeiro enquanto ainda estamos checando se há uma sessão do Google ativa. */
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

        /*
         * Se o login foi pelo Google, existe uma sessão no backend
         * (é ela que o /auth/me consulta). Só limpar o localStorage
         * não desfaz essa sessão — sem isso, ao acessar /dashboard
         * de novo o app te loga sozinho outra vez. Avisamos o
         * backend pra invalidar a sessão também.
         */
        fetch("http://localhost:8080/auth/logout", {
            method: "POST",
            credentials: "include",
        }).catch(() => {
            // já deslogou localmente; se essa chamada falhar, sem problema.
        });
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
            .catch(() => {
                // Sem sessão do Google ativa: segue como deslogado mesmo.
            })
            .finally(() => setVerificando(false));

        // Só precisa rodar uma vez, ao montar o app.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

/**
 * Atalho para usar dentro de páginas/componentes que só existem
 * depois do login (protegidas por `RotaProtegida`). Evita repetir
 * `usuario!.id` ou checagem de null em cada arquivo.
 */
export function useUsuarioLogado(): Usuario {
    const { usuario } = useAuth();

    if (!usuario) {
        throw new Error(
            "useUsuarioLogado só pode ser usado dentro de uma rota protegida (usuário logado).",
        );
    }

    return usuario;
}
