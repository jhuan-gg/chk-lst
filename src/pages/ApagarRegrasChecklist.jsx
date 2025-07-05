import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./criarusuario.css";
import { FaTrash } from "react-icons/fa";

export default function ApagarRegrasChecklist() {
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function carregarRegras() {
    setLoading(true);
    setMsg("");
    setErro("");
    try {
      const snapshot = await getDocs(collection(db, "regras_checklist"));
      setRegras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch {
      setErro("Erro ao carregar regras.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarRegras();
  }, []);

  async function apagarRegra(id) {
    setMsg("");
    setErro("");
    try {
      await deleteDoc(doc(db, "regras_checklist", id));
      setMsg("Regra apagada com sucesso!");
      setRegras(regras.filter(r => r.id !== id));
    } catch {
      setErro("Erro ao apagar regra.");
    }
  }

  return (
    <div className="criarusuario-container">
      <div className="criarusuario-box" style={{ maxWidth: 500, width: "100%" }}>
        <div className="criarusuario-title">Apagar Regras de Checklist</div>
        {loading && <div style={{ textAlign: "center", margin: "1.5rem 0" }}>Carregando...</div>}
        {erro && <div className="criarusuario-erro">{erro}</div>}
        {msg && <div className="criarusuario-msg">{msg}</div>}
        {!loading && regras.length === 0 && (
          <div className="text-gray-500" style={{ textAlign: "center", margin: "1.5rem 0" }}>
            Nenhuma regra cadastrada.
          </div>
        )}
        <ul style={{
          marginTop: 12,
          padding: 0,
          listStyle: "none",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.7rem"
        }}>
          {regras.map(regra => (
            <li
              key={regra.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f9fafb",
                borderRadius: 8,
                boxShadow: "0 1px 4px #0001",
                padding: "0.7rem 1rem",
                transition: "background 0.2s",
                gap: 10
              }}
            >
              <span style={{
                fontWeight: 500,
                fontSize: "1rem",
                color: "#3730a3",
                wordBreak: "break-word",
                flex: 1
              }}>
                {regra.titulo}
              </span>
              <button
                className="criarusuario-btn"
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  minWidth: 32,
                  minHeight: 32,
                  fontSize: "",
                  padding: "0.1rem 0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  width: 32,
                  height: 32,
                }}
                onClick={() => apagarRegra(regra.id)}
                type="button"
                title="Apagar"
              >
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}