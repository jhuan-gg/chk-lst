import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaChartLine } from "react-icons/fa";
import "./criarusuario.css";

export default function DashboardFuncionario() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = sessionStorage.getItem("userName") || "";

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "pedidos_de_validacao"));
        const pedidosData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.nomeUsuario === userName);
        setPedidos(pedidosData);
      } catch {
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, [userName]);

  const total = pedidos.length;
  const aprovados = pedidos.filter(p => p.status === "pedido aceito").length;
  const recusados = pedidos.filter(p => p.status === "pedido recusado").length;
  const emAnalise = pedidos.filter(p => p.status === "em análise").length;
  const pontuacao = pedidos
    .filter(p => p.status === "pedido aceito")
    .reduce((acc, p) => acc + Number(p.pontuacao || 0), 0);

  return (
      <div className="criarusuario-box" style={{ maxWidth: 420, width: "100%" }}>
        <div className="criarusuario-title" style={{ textAlign: "center" }}>
          <FaChartLine style={{ color: "#6366f1", marginRight: 8 }} />
          Meu Desempenho
        </div>
        {loading && <div style={{ textAlign: "center", margin: "2rem 0" }}>Carregando...</div>}
        {!loading && (
          <>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              marginBottom: "1.5rem"
            }}>
              <ResumoCard icon={<FaCheckCircle />} label="Aprovados" value={aprovados} color="#22c55e" />
              <ResumoCard icon={<FaTimesCircle />} label="Recusados" value={recusados} color="#dc2626" />
              <ResumoCard icon={<FaChartLine />} label="Em análise" value={emAnalise} color="#2563eb" />
              <ResumoCard icon={<FaChartLine />} label="Pontuação total" value={pontuacao} color="#f59e42" />
              <ResumoCard icon={<FaChartLine />} label="Total de pedidos" value={total} color="#6366f1" />
            </div>
            <div style={{ marginTop: 10 }}>
              <h4 style={{ color: "#6366f1", marginBottom: 8, fontSize: "1.08rem", fontWeight: 700, letterSpacing: "-0.5px" }}>Últimos pedidos</h4>
              <ul className="dashboardfuncionario-list">
                {pedidos.slice(0, 5).map(p => (
                  <li key={p.id}>
                    <span className="dashboardfuncionario-label">{p.nomeRegra}</span>
                    <span className={
                      "dashboardfuncionario-status " +
                      (p.status === "pedido aceito"
                        ? "aprovado"
                        : p.status === "pedido recusado"
                        ? "recusado"
                        : "analise")
                    }>
                      {p.status}
                    </span>
                  </li>
                ))}
                {pedidos.length === 0 && (
                  <li style={{ textAlign: "center", color: "#888", margin: "1rem 0" }}>
                    Nenhum pedido enviado ainda.
                  </li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
  );
}

function ResumoCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "#f3f4f6",
      borderRadius: 8,
      padding: "0.7rem 1rem",
      display: "flex",
      alignItems: "center",
      gap: 10
    }}>
      <span style={{ color, fontSize: 22 }}>{icon}</span>
      <span style={{ fontWeight: 600, fontSize: "1rem", color: "#3730a3", flex: 1 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: "1.1rem", color }}>{value}</span>
    </div>
  );
}