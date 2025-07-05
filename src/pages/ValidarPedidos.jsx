import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ValidarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [atualizando, setAtualizando] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "pedidos_de_validacao"),
      (snapshot) => {
        const pedidosData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.status === "em análise");
        setPedidos(pedidosData);
        setLoading(false);
        setMsg("");
        setErro("");
      },
      (error) => {
        console.error("Erro ao escutar pedidos:", error);
        setErro("Erro ao carregar pedidos.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function atualizarStatus(id, novoStatus) {
    setAtualizando({ ...atualizando, [id]: true });
    setMsg("");
    setErro("");
    try {
      await updateDoc(doc(db, "pedidos_de_validacao", id), { status: novoStatus });
      // Aqui não precisa remover do estado manualmente pois onSnapshot atualiza automaticamente
      setMsg(`Pedido ${novoStatus === "pedido aceito" ? "aceito" : "recusado"} com sucesso!`);
    } catch {
      setErro("Erro ao atualizar pedido.");
    } finally {
      setAtualizando({ ...atualizando, [id]: false });
    }
  }

  return (
    <div className="criarusuario-container" style={{ }}>
      <div className="criarusuario-box" style={{ minWidth: 370, maxWidth: 700, width: "100%" }}>
        <div className="criarusuario-title" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <FaClipboardCheck style={{ color: "#6366f1", fontSize: 28 }} />
          Pedidos de Validação em Análise
        </div>
        {msg && <div className="criarusuario-msg">{msg}</div>}
        {erro && <div className="criarusuario-erro">{erro}</div>}
        {loading && <div style={{ textAlign: "center", margin: "1.5rem 0" }}>Carregando...</div>}
        {!loading && pedidos.length === 0 && (
          <div className="text-gray-500" style={{ textAlign: "center", margin: "1.5rem 0" }}>
            Nenhum pedido em análise.
          </div>
        )}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginTop: 18,
          width: "100%"
        }}>
          {pedidos.map(pedido => (
            <div
              key={pedido.id}
              style={{
                borderRadius: 10,
                background: "#f3f4f6",
                boxShadow: "0 1px 4px #0001",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.2rem",
                gap: 16,
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "#3730a3" }}>
                  {pedido.nomeRegra}
                </span>
                <span style={{ fontSize: "0.98rem", color: "#6366f1", fontWeight: 500 }}>
                  Pontuação: {pedido.pontuacao || 0}
                </span>
                <span style={{ fontSize: "0.97rem", color: "#374151" }}>
                  Usuário: <b>{pedido.nomeUsuario}</b>
                </span>
                <span style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                  Data: {pedido.data?.toDate ? pedido.data.toDate().toLocaleString() : ""}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="criarusuario-btn"
                  style={{
                    background: "#22c55e",
                    color: "#fff",
                    padding: "0.4rem 1rem",
                    fontSize: "0.95rem",
                    minWidth: 100,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                  disabled={atualizando[pedido.id]}
                  onClick={() => atualizarStatus(pedido.id, "pedido aceito")}
                  type="button"
                >
                  <FaCheckCircle /> Aceitar
                </button>
                <button
                  className="criarusuario-btn"
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    padding: "0.4rem 1rem",
                    fontSize: "0.95rem",
                    minWidth: 100,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                  disabled={atualizando[pedido.id]}
                  onClick={() => atualizarStatus(pedido.id, "pedido recusado")}
                  type="button"
                >
                  <FaTimesCircle /> Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
