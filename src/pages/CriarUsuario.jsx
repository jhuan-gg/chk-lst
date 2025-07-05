import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./criarusuario.css";

export default function CriarUsuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("funcionario");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCriar = async (e) => {
    e.preventDefault();
    setMsg("");
    setErro("");
    setLoading(true);

    if (!nome || !email || !senha) {
      setErro("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      // 1. Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. Salva os dados no Firestore
      await addDoc(collection(db, "usuarios"), {
        uid: user.uid,      // salva o UID também, útil para referência futura
        nome,
        email,
        tipo,
        senha,              // opcional: pode remover isso no futuro por segurança
      });

      setMsg("Usuário criado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setTipo("funcionario");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setErro("E-mail já está em uso.");
      } else {
        setErro("Erro ao criar usuário.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="criarusuario-container">
      <form className="criarusuario-box" onSubmit={handleCriar}>
        <div className="criarusuario-title">Criar Usuário</div>
        <input
          className="criarusuario-input"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <input
          className="criarusuario-input"
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="criarusuario-input"
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />
        <select
          className="criarusuario-select"
          value={tipo}
          onChange={e => setTipo(e.target.value)}
        >
          <option value="funcionario">Funcionário</option>
          <option value="gestor">Gestor</option>
        </select>
        <button
          className="criarusuario-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar usuário"}
        </button>
        {msg && <div className="criarusuario-msg">{msg}</div>}
        {erro && <div className="criarusuario-erro">{erro}</div>}
      </form>
    </div>
  );
}
