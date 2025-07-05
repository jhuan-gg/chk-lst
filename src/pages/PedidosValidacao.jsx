import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { FaHourglassHalf, FaSearch, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const statusInfo = {
  "em análise": {
    label: "Em análise",
    color: "#2563eb",
    icon: <FaSearch style={{ marginRight: 4 }} />,
  },
  "pedido aceito": {
    label: "Aprovado",
    color: "#22c55e",
    icon: <FaCheckCircle style={{ marginRight: 4 }} />,
  },
  "pedido recusado": {
    label: "Recusado",
    color: "#dc2626",
    icon: <FaTimesCircle style={{ marginRight: 4 }} />,
  },
};


export default function PedidosValidacao() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = sessionStorage.getItem("userName") || "";

  useEffect(() => {
    setLoading(true);
    const pedidosQuery = query(
      collection(db, "pedidos_de_validacao"),
      orderBy("data", "desc")
    );
    const unsubscribe = onSnapshot(
      pedidosQuery,
      (snapshot) => {
        // Filtra apenas os pedidos do usuário logado
        const pedidosData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.nomeUsuario === userName);
        setPedidos(pedidosData);
        setLoading(false);
      },
      () => {
        setPedidos([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userName]);

  return (
    <div className="criarusuario-container" style={{ minHeight: "100vh" }}>
      <div className="criarusuario-box" style={{ minWidth: 370, maxWidth: 700, width: "100%" }}>
        <div className="criarusuario-title" style={{ textAlign: "center" }}>
          Histórico de Pedidos de Validação
        </div>
        {loading && <div style={{ textAlign: "center", margin: "1.5rem 0" }}>Carregando...</div>}
        {!loading && pedidos.length === 0 && (
          <div className="text-gray-500" style={{ textAlign: "center", margin: "1.5rem 0" }}>
            Nenhum pedido encontrado.
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
                <span style={{ fontSize: "0.95rem", color: "#6b7280" }}>
                  Data: {pedido.data?.toDate ? pedido.data.toDate().toLocaleString() : ""}
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                fontSize: "1rem",
                color: statusInfo[pedido.status]?.color || "#374151"
              }}>
                {statusInfo[pedido.status]?.icon}
                <span>{statusInfo[pedido.status]?.label || pedido.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}