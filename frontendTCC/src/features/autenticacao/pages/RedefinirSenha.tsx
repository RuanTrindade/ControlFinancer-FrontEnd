import { useState } from "react";

import { BsCheckCircleFill, BsXCircleFill, BsCheckLg } from "react-icons/bs";

import { useNavigate, useSearchParams } from "react-router-dom";

import "../styles/login.css";

function RedefinirSenha() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [senha, setSenha] = useState("");

    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [popup, setPopup] = useState("");

    const [tipoPopup, setTipoPopup] = useState("");

    /* VALIDAÇÕES */

    const possui8Caracteres = senha.length >= 8;

    const possuiMaiuscula = /[A-Z]/.test(senha);

    const possuiNumero = /[0-9]/.test(senha);

    const possuiSimbolo = /[^A-Za-z0-9]/.test(senha);

    function mostrarPopup(mensagem: string, tipo: string) {
        setPopup(mensagem);

        setTipoPopup(tipo);

        setTimeout(() => {
            setPopup("");
        }, 3000);
    }

    async function redefinirSenha() {
        if (!possui8Caracteres || !possuiMaiuscula || !possuiNumero || !possuiSimbolo) {
            mostrarPopup("Senha inválida", "erro");

            return;
        }

        if (senha !== confirmarSenha) {
            mostrarPopup("As senhas não coincidem", "erro");

            return;
        }

        try {
            const resposta = await fetch(
                "http://localhost:8080/auth/redefinir-senha",

                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        token,

                        novaSenha: senha,
                    }),
                },
            );

            if (!resposta.ok) {
                throw new Error();
            }

            mostrarPopup("Senha redefinida com sucesso!", "sucesso");

            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch {
            mostrarPopup("Erro ao redefinir senha", "erro");
        }
    }

    return (
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

            <div className="container-login">
                <div
                    className="
                container-formulario
                entrar
            "
                >
                    <form>
                        <h1>Redefinir senha</h1>

                        <span>Crie uma nova senha para sua conta</span>

                        <div className="grupo-input">
                            <input
                                type="password"
                                placeholder="Nova senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                            />

                            {senha &&
                                possui8Caracteres &&
                                possuiMaiuscula &&
                                possuiNumero &&
                                possuiSimbolo && (
                                    <BsCheckLg
                                        className="
                                        icone-valido
                                    "
                                    />
                                )}
                        </div>

                        <div className="grupo-input">
                            <input
                                type="password"
                                placeholder="Confirmar senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                            />

                            {confirmarSenha &&
                                (senha === confirmarSenha ? (
                                    <BsCheckLg
                                        className="
                            icone-valido
                        "
                                    />
                                ) : (
                                    <BsXCircleFill
                                        className="
                            icone-invalido
                        "
                                    />
                                ))}
                        </div>

                        {senha && (
                            <div
                                className="
                                validacao-senha
                            "
                            >
                                <p className={possui8Caracteres ? "valido" : "invalido"}>
                                    {possui8Caracteres ? <BsCheckCircleFill /> : <BsXCircleFill />}8
                                    caracteres
                                </p>

                                <p className={possuiMaiuscula ? "valido" : "invalido"}>
                                    {possuiMaiuscula ? <BsCheckCircleFill /> : <BsXCircleFill />}
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

                                {confirmarSenha && (
                                    <p className={senha === confirmarSenha ? "valido" : "invalido"}>
                                        {senha === confirmarSenha ? (
                                            <BsCheckCircleFill />
                                        ) : (
                                            <BsXCircleFill />
                                        )}

                                        {senha === confirmarSenha
                                            ? "As senhas coincidem"
                                            : "As senhas são diferentes"}
                                    </p>
                                )}
                            </div>
                        )}

                        <button type="button" onClick={redefinirSenha}>
                            Redefinir senha
                        </button>
                    </form>
                </div>

                <div className="container-lateral">
                    <div className="painel-lateral">
                        <div
                            className="
                        conteudo-lateral
                        lateral-direita
                    "
                        >
                            <h1>Segurança</h1>

                            <p>Sua nova senha deve ser forte e segura para proteger seus dados.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RedefinirSenha;
