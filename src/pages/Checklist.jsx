import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { FaClipboardCheck } from "react-icons/fa";

export default function Checklist() {
  const [regras, setRegras] = useState([]);
  const [enviando, setEnviando] = useState({});
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [pedidosHoje, setPedidosHoje] = useState([]);

  // Verifica se é a mesma data de hoje
  const isSameDay = (timestamp) => {
    const hoje = new Date();
    const dataEnvio = timestamp.toDate();
    return (
      hoje.getDate() === dataEnvio.getDate() &&
      hoje.getMonth() === dataEnvio.getMonth() &&
      hoje.getFullYear() === dataEnvio.getFullYear()
    );
  };

  useEffect(() => {
    // Ordena as regras pelo campo 'titulo' (alfabético)
    const regrasQuery = query(
      collection(db, "regras_checklist"),
      orderBy("titulo")
    );
    const unsubscribeRegras = onSnapshot(
      regrasQuery,
      (snapshot) => {
        const regrasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRegras(regrasData);
      }
    );

    const unsubscribePedidos = onSnapshot(
      collection(db, "pedidos_de_validacao"),
      (snapshot) => {
        const nomeUsuario = sessionStorage.getItem("userName") || "";
        const pedidos = snapshot.docs.filter((doc) => {
          const data = doc.data();
          return (
            data.nomeUsuario === nomeUsuario &&
            data.data &&
            isSameDay(data.data)
          );
        });
        setPedidosHoje(pedidos.map((p) => p.data().nomeRegra));
      }
    );

    return () => {
      unsubscribeRegras();
      unsubscribePedidos();
    };
  }, []);

  const handleEnviar = async (regra) => {
    setMsg("");
    setErro("");
    setEnviando((prev) => ({ ...prev, [regra.id]: true }));
    try {
      await addDoc(collection(db, "pedidos_de_validacao"), {
        data: serverTimestamp(),
        nomeUsuario: sessionStorage.getItem("userName") || "",
        nomeRegra: regra.titulo,
        pontuacao: regra.pontuacao || 0,
        status: "em análise",
      });
      setMsg("Pedido de validação enviado!");
    } catch {
      setErro("Erro ao enviar pedido.");
    } finally {
      setEnviando((prev) => ({ ...prev, [regra.id]: false }));
    }
  };

  return (
      <div
        className="criarusuario-box"
        style={{ minWidth: 370, maxWidth: 600, width: "100%" }}
      >
        <div
          className="criarusuario-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <FaClipboardCheck style={{ color: "#6366f1", fontSize: 28 }} />
          Regras
        </div>
        {msg && <div className="criarusuario-msg">{msg}</div>}
        {erro && <div className="criarusuario-erro">{erro}</div>}
        {regras.length === 0 && (
          <div
            className="text-gray-500"
            style={{ textAlign: "center", margin: "1.5rem 0" }}
          >
            Nenhuma checklist disponível.
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            marginTop: 18,
            width: "100%",
          }}
        >
          {regras.map((regra) => {
            const enviadoHoje = pedidosHoje.includes(regra.titulo);
            return (
              <div
                key={regra.id}
                style={{
                  borderRadius: 10,
                  background: "#f3f4f6",
                  boxShadow: "0 1px 4px #0001",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem 1.2rem",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <FaClipboardCheck
                    style={{ color: "#6366f1", fontSize: 20, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      color: "#3730a3",
                      wordBreak: "break-word",
                      flex: 1,
                    }}
                  >
                    {regra.titulo}
                  </span>
                  <span
                    style={{
                      fontSize: "0.98rem",
                      color: "#6366f1",
                      marginLeft: 10,
                      fontWeight: 500,
                    }}
                  >
                    Pontuação: {regra.pontuacao || 0}
                  </span>
                </div>
                <button
                  className="criarusuario-btn"
                  style={{
                    padding: "0.4rem 1rem",
                    fontSize: "0.95rem",
                    minWidth: 140,
                    background: enviadoHoje ? "#22c55e" : "#6366f1",
                    color: "#fff",
                    cursor: enviadoHoje ? "default" : "pointer",
                  }}
                  disabled={enviando[regra.id] || enviadoHoje}
                  onClick={() => handleEnviar(regra)}
                  type="button"
                >
                  {enviadoHoje
                    ? "Pedido enviado"
                    : enviando[regra.id]
                    ? "Enviando..."
                    : "Enviar validação"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
  );
}
