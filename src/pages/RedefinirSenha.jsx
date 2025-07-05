// src/pages/RedefinirSenha.jsx
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import "../login.css"; // para manter o estilo igual

export default function RedefinirSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem("Link de redefinição enviado para seu e-mail.");
    } catch (err) {
      setErro("Erro ao enviar e-mail de redefinição. Verifique o e-mail digitado.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">
          Redefinir<span className="login-title-accent"> Senha</span>
        </h1>
        <p className="login-desc">Informe seu e-mail para redefinir a senha</p>

        <form className="login-form" onSubmit={handleReset}>
          <input
            className="login-input"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">Enviar link</button>
          {mensagem && <div className="login-success">{mensagem}</div>}
          {erro && <div className="login-erro">{erro}</div>}
        </form>

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <a href="/" style={{ color: "purple", textDecoration: "none", fontSize: "14px" }}>Voltar ao login</a>
        </div>
      </div>
    </div>
  );
}
