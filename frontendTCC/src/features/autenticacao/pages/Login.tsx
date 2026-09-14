import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { RiMailLine, RiLock2Line } from "react-icons/ri";

import { BsCheckCircleFill, BsXCircleFill, BsCheckLg } from "react-icons/bs";

import "../styles/login.css";
import LoadingOverlay from "../../../shared/components/LoadingOverlay";
import { useAuth } from "../../../context/AuthContext";

function Login() {
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { login } = useAuth();

    const [modoCadastro, setModoCadastro] = useState(false);

    const [email, setEmail] = useState("");

    const [senha, setSenha] = useState("");

    const [nome, setNome] = useState("");

    const [popup, setPopup] = useState("");

    const [tipoPopup, setTipoPopup] = useState("");

    const [erroLogin, setErroLogin] = useState("");

    /* VALIDAÇÕES */

    const emailValido = email.includes("@") && email.includes(".");

    const possui8Caracteres = senha.length >= 8;

    const possuiMaiuscula = /[A-Z]/.test(senha);

    const possuiNumero = /[0-9]/.test(senha);

    const possuiSimbolo = /[^A-Za-z0-9]/.test(senha);

    const senhaValida = possui8Caracteres && possuiMaiuscula && possuiNumero && possuiSimbolo;

    /* POPUP */

    function mostrarPopup(mensagem: string, tipo: string) {
        setPopup(mensagem);

        setTipoPopup(tipo);

        setTimeout(() => {
            setPopup("");
        }, 3000);
    }

    /* LOGIN */

    async function fazerLogin() {
        setErroLogin("");

        if (!email || !senha) {
            setErroLogin("Preencha todos os campos");

            return;
        }

        setLoading(true);

        try {
            const resposta = await fetch(
                "http://localhost:8080/auth/login",

                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email,

                        senha,
                    }),
                },
            );

            if (!resposta.ok) {
                throw new Error();
            }

            const usuarioLogado = await resposta.json();

            login({
                id: usuarioLogado.id,
                nome: usuarioLogado.nome,
                email: usuarioLogado.email,
            });

            mostrarPopup("Login realizado!", "sucesso");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1200);
        } catch {
            setErroLogin("Email ou senha inválidos");
        } finally {
            setLoading(false);
        }
    }

    /* CADASTRO */

    async function cadastrarUsuario() {
        if (!nome || !email || !senha) {
            mostrarPopup("Preencha todos os campos", "erro");

            return;
        }

        if (!senhaValida) {
            mostrarPopup("Senha inválida", "erro");

            return;
        }

        try {
            const resposta = await fetch(
                "http://localhost:8080/auth/register",

                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        nome,

                        email,

                        senha,
                    }),
                },
            );

            if (!resposta.ok) {
                throw new Error();
            }

            mostrarPopup("Conta criada com sucesso!", "sucesso");

            setModoCadastro(false);

            setNome("");

            setEmail("");

            setSenha("");
        } catch {
            mostrarPopup("Erro ao cadastrar", "erro");
        }
    }

    /* RECUPERAR SENHA */

    async function recuperarSenha() {
        if (!email) {
            mostrarPopup("Digite seu email", "erro");

            return;
        }

        try {
            await fetch(
                "http://localhost:8080/auth/recuperar-senha",

                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email,
                    }),
                },
            );

            mostrarPopup("Email enviado!", "sucesso");
        } catch {
            mostrarPopup("Erro ao enviar email", "erro");
        }
    }

    return (
        <>
            <div className="pagina-login">
                {popup && (
                    <div
                        className={`
                            popup
                            ${tipoPopup}
                        `}
                    >
                        {popup}
                    </div>
                )}

                <div
                    className={`
                container-login
                ${modoCadastro ? "ativo" : ""}
            `}
                >
                    {/* LOGIN */}

                    <div
                        className="
                    container-formulario
                    entrar
                "
                    >
                        <form>
                            <h1>Entrar</h1>

                            {/* GOOGLE */}
                            <div
                                className="
                            icones-sociais
                        "
                            >
                                <a
                                    href="http://localhost:8080/oauth2/authorization/google"

                                    className="
                                    botao-google
                                "
                                >
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                                        alt="Google"
                                    />
                                </a>
                            </div>
                            <span>use seu email e senha</span>

                            {/* EMAIL */}

                            <div
                                className="
                            grupo-input
                        "
                            >
                                <RiMailLine />

                                <input
                                    type="email"

                                    placeholder="Email"

                                    value={email}

                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                {email && emailValido && (
                                    <BsCheckLg
                                        className="
                                            icone-valido
                                        "
                                    />
                                )}
                            </div>

                            {/* SENHA */}

                            <div
                                className="
                            grupo-input
                        "
                            >
                                <RiLock2Line />

                                <input
                                    type="password"

                                    placeholder="Senha"

                                    value={senha}

                                    onChange={(e) => setSenha(e.target.value)}
                                />
                            </div>

                            {erroLogin && (
                                <p
                                    className="
                                    mensagem-erro
                                "
                                >
                                    {erroLogin}
                                </p>
                            )}

                            {/* ESQUECEU SENHA */}

                            <a
                                href="#"

                                className="
                                esqueceu-senha
                            "

                                onClick={(e) => {
                                    e.preventDefault();

                                    recuperarSenha();
                                }}
                            >
                                Esqueceu sua senha?
                            </a>

                            {/* BOTÃO */}

                            <button
                                type="button"

                                onClick={fazerLogin}
                            >
                                Entrar
                            </button>

                            {/* MOBILE */}

                            <div
                                className="
                            link-mobile
                        "
                            >
                                Não possui conta?
                                <span onClick={() => setModoCadastro(true)}>Criar conta</span>
                            </div>
                        </form>
                    </div>

                    {/* CADASTRO */}

                    <div
                        className="
                    container-formulario
                    cadastro
                "
                    >
                        <form>
                            <h1>Criar Conta</h1>
                            {/* GOOGLE */}

                            <div
                                className="
                            icones-sociais
                        "
                            >
                                <a
                                    href="http://localhost:8080/login/oauth2/code/google"

                                    className="
                                    botao-google
                                "
                                >
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
                                        alt="Google"
                                    />
                                </a>
                            </div>
                            <span>cadastre-se para continuar</span>

                            {/* NOME */}

                            <div
                                className="
                            grupo-input
                        "
                            >
                                <input
                                    type="text"

                                    placeholder="Nome"

                                    value={nome}

                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            {/* EMAIL */}

                            <div
                                className="
                            grupo-input
                        "
                            >
                                <RiMailLine />

                                <input
                                    type="email"

                                    placeholder="Email"

                                    value={email}

                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                {email && emailValido && (
                                    <BsCheckLg
                                        className="
                                            icone-valido
                                        "
                                    />
                                )}
                            </div>

                            {/* SENHA */}

                            <div
                                className="
                            grupo-input
                        "
                            >
                                <RiLock2Line />

                                <input
                                    type="password"

                                    placeholder="Senha"

                                    value={senha}

                                    onChange={(e) => setSenha(e.target.value)}
                                />

                                {senha && senhaValida && (
                                    <BsCheckLg
                                        className="
                                            icone-valido
                                        "
                                    />
                                )}
                            </div>

                            {/* VALIDAÇÃO */}

                            {senha && !senhaValida && (
                                <div
                                    className="
                                    validacao-senha
                                "
                                >
                                    <p className={possui8Caracteres ? "valido" : "invalido"}>
                                        {possui8Caracteres ? (
                                            <BsCheckCircleFill />
                                        ) : (
                                            <BsXCircleFill />
                                        )}
                                        8 caracteres
                                    </p>

                                    <p className={possuiMaiuscula ? "valido" : "invalido"}>
                                        {possuiMaiuscula ? (
                                            <BsCheckCircleFill />
                                        ) : (
                                            <BsXCircleFill />
                                        )}
                                        Letra maiúscula
                                    </p>

                                    <p className={possuiNumero ? "valido" : "invalido"}>
                                        {possuiNumero ? <BsCheckCircleFill /> : <BsXCircleFill />}
                                        Número
                                    </p>

                                    <p className={possuiSimbolo ? "valido" : "invalido"}>
                                        {possuiSimbolo ? <BsCheckCircleFill /> : <BsXCircleFill />}
                                        Símbolo
                                    </p>
                                </div>
                            )}

                            {/* BOTÃO */}

                            <button
                                type="button"

                                onClick={cadastrarUsuario}
                            >
                                Criar conta
                            </button>

                            {/* MOBILE */}

                            <div
                                className="
                            link-mobile
                        "
                            >
                                Já possui conta?
                                <span onClick={() => setModoCadastro(false)}>Entrar</span>
                            </div>
                        </form>
                    </div>

                    {/* LATERAL */}

                    <div
                        className="
                    container-lateral
                "
                    >
                        <div
                            className="
                        painel-lateral
                    "
                        >
                            {/* ESQUERDA */}

                            <div
                                className="
                            conteudo-lateral
                            lateral-esquerda
                        "
                            >
                                <h1>Bem-vindo!</h1>

                                <p>Entre com seus dados para acessar seu controle financeiro.</p>

                                <button
                                    className="
                                    botao-lateral
                                "

                                    onClick={() => setModoCadastro(false)}
                                >
                                    Entrar
                                </button>
                            </div>

                            {/* DIREITA */}

                            <div
                                className="
                            conteudo-lateral
                            lateral-direita
                        "
                            >
                                <h1>Olá!</h1>

                                <p>Crie sua conta e comece a controlar suas finanças.</p>

                                <button
                                    className="
                                    botao-lateral
                                "

                                    onClick={() => setModoCadastro(true)}
                                >
                                    Criar conta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading && <LoadingOverlay />}
        </>
    );
}

export default Login;
