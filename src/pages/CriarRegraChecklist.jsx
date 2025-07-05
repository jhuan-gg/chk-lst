import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CriarRegraChecklist() {
  const [titulo, setTitulo] = useState("");
  const [pontuacao, setPontuacao] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCriar = async (e) => {
    e.preventDefault();
    setMsg("");
    setErro("");
    setLoading(true);

    if (!titulo || !pontuacao) {
      setErro("Preencha o título e a pontuação.");
      setLoading(false);
      return;
    }
    if (isNaN(Number(pontuacao)) || Number(pontuacao) <= 0) {
      setErro("Pontuação deve ser um número positivo.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "regras_checklist"), {
        titulo,
        pontuacao: Number(pontuacao),
        criadoPor: sessionStorage.getItem("userName") || "",
        dataCriacao: serverTimestamp(),
      });
      setMsg("Regra de checklist criada!");
      setTitulo("");
      setPontuacao("");
    } catch (err) {
      setErro("Erro ao criar regra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="criarusuario-container">
      <form className="criarusuario-box" onSubmit={handleCriar}>
        <div className="criarusuario-title">Criar Regra de Checklist</div>
        <input
          className="criarusuario-input"
          placeholder="Título"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
        <input
          className="criarusuario-input"
          placeholder="Pontuação"
          type="number"
          min="1"
          value={pontuacao}
          onChange={e => setPontuacao(e.target.value)}
        />
        <button
          className="criarusuario-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? "Criando..." : "Criar regra"}
        </button>
        {msg && <div className="criarusuario-msg">{msg}</div>}
        {erro && <div className="criarusuario-erro">{erro}</div>}
      </form>
    </div>
  );
}