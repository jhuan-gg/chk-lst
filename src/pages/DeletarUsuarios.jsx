import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FaTrash, FaUser } from "react-icons/fa";
import "./criarusuario.css";

export default function DeletarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function carregarUsuarios() {
    setLoading(true);
    setMsg("");
    setErro("");
    try {
      const snapshot = await getDocs(collection(db, "usuarios"));
      setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch {
      setErro("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function apagarUsuario(id) {
    setMsg("");
    setErro("");
    try {
      await deleteDoc(doc(db, "usuarios", id));
      setMsg("Usuário apagado com sucesso!");
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch {
      setErro("Erro ao apagar usuário.");
    }
  }

  return (
    <div className="criarusuario-container">
      <div className="criarusuario-box" style={{ maxWidth: 500, width: "100%" }}>
        <div className="criarusuario-title">Deletar Usuários</div>
        {loading && <div style={{ textAlign: "center", margin: "1.5rem 0" }}>Carregando...</div>}
        {erro && <div className="criarusuario-erro">{erro}</div>}
        {msg && <div className="criarusuario-msg">{msg}</div>}
        {!loading && usuarios.length === 0 && (
          <div className="text-gray-500" style={{ textAlign: "center", margin: "1.5rem 0" }}>
            Nenhum usuário cadastrado.
          </div>
        )}
        <ul style={{
          marginTop: 12,
          padding: 0,
          listStyle: "none",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem"
        }}>
          {usuarios.map(usuario => (
            <li
              key={usuario.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f9fafb",
                borderRadius: 8,
                boxShadow: "0 1px 4px #0001",
                padding: "0.5rem 0.8rem",
                gap: 10,
                maxWidth: "100%"
              }}
            >
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 500,
                fontSize: "1rem",
                color: "#3730a3",
                wordBreak: "break-all",
                flex: 1,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                <FaUser style={{ color: "#6366f1" }} />
                {usuario.nome} {usuario.tipo === "gestor" && <span style={{ color: "#6366f1", fontWeight: 700, marginLeft: 4 }}>(Gestor)</span>}
              </span>
              <button
                className="criarusuario-btn"
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  minWidth: 28,
                  minHeight: 28,
                  fontSize: "0.95rem",
                  padding: "0.2rem 0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 5,
                  width: 40,
                  height: 28,
                }}
                onClick={() => apagarUsuario(usuario.id)}
                type="button"
                title="Apagar"
                disabled={usuario.tipo === "gestor"}
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