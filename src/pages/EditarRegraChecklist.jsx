import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function EditarRegraChecklist() {
  const [regras, setRegras] = useState([]);
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarRegras() {
      try {
        const snapshot = await getDocs(collection(db, "regras_checklist"));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRegras(lista);
      } catch (err) {
        setErro("Erro ao carregar regras.");
      }
    }

    carregarRegras();
  }, []);

  const handleEditar = async (id, novoTitulo, novaPontuacao) => {
    setErro("");
    setMsg("");

    if (!novoTitulo || isNaN(Number(novaPontuacao)) || Number(novaPontuacao) <= 0) {
      setErro("Preencha corretamente os campos.");
      return;
    }

    try {
      setLoading(true);
      const regraRef = doc(db, "regras_checklist", id);
      await updateDoc(regraRef, {
        titulo: novoTitulo,
        pontuacao: Number(novaPontuacao),
      });

      setRegras((prev) =>
        prev.map((regra) =>
          regra.id === id
            ? { ...regra, titulo: novoTitulo, pontuacao: Number(novaPontuacao) }
            : regra
        )
      );

      setMsg("Regra atualizada com sucesso!");
    } catch (err) {
      setErro("Erro ao atualizar regra.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMsg("");
        setErro("");
      }, 3000);
    }
  };

  return (
    <div className="criarusuario-container">
      <div className="criarusuario-box">
        <h2 className="criarusuario-title">Editar Regras de Checklist</h2>

        {erro && <div className="criarusuario-erro">{erro}</div>}
        {msg && <div className="criarusuario-msg">{msg}</div>}

        {regras.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text)" }}>
            Nenhuma regra encontrada.
          </p>
        ) : (
          regras.map((regra) => (
            <div
              key={regra.id}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "1rem",
                marginTop: "1rem",
              }}
            >
              <label style={{ fontWeight: 600, marginBottom: "0.3rem", color: "var(--text)" }}>
                Título da Regra:
              </label>
              <input
                type="text"
                value={regra.titulo}
                onChange={(e) =>
                  setRegras((prev) =>
                    prev.map((r) =>
                      r.id === regra.id ? { ...r, titulo: e.target.value } : r
                    )
                  )
                }
                className="criarusuario-input"
              />

              <label style={{ fontWeight: 600, margin: "1rem 0 0.3rem", color: "var(--text)" }}>
                Pontuação:
              </label>
              <input
                type="number"
                value={regra.pontuacao}
                onChange={(e) =>
                  setRegras((prev) =>
                    prev.map((r) =>
                      r.id === regra.id
                        ? { ...r, pontuacao: e.target.value }
                        : r
                    )
                  )
                }
                className="criarusuario-input"
              />

              <button
                onClick={() =>
                  handleEditar(regra.id, regra.titulo, regra.pontuacao)
                }
                disabled={loading}
                className="criarusuario-btn"
                style={{ marginTop: "1rem" }}
              >
                Salvar Alterações
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
