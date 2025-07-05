import React from "react";
import { useLocation } from "react-router-dom";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../auth";
import { auth } from "../firebase";

const TITULOS = {
  "/checklist": "Check!",
  "/validacao": "Validação",
  "/pedidos": "Pedidos de Validação",
};

function getTitulo(pathname) {
  return (
    TITULOS[pathname] ||
    Object.entries(TITULOS).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Check!"
  );
}

export default function Header({ onMenuClick }) {
  const location = useLocation();

  const handleLogout = () => {
    logout(auth);
  };

  return (
    <header
      style={{
        width: "100%",
        minHeight: 56,
        background: "linear-gradient(135deg, #312e81 0%, #6d28d9 100%)",
        color: "#fff",
        boxShadow: "0 2px 16px #312e8133",
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
        flexWrap: "wrap", // permite quebrar em telas pequenas
        overflowX: "auto", // evita overflow
      }}
    >
      {/* Botão menu mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden"
        aria-label="Abrir menu"
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "1.7rem",
          marginRight: "0.5rem",
          cursor: "pointer",
        }}
      >
        <FaBars />
      </button>
      {/* Título centralizado */}
      <h1
        style={{
          flex: 1,
          textAlign: "center",
          fontWeight: 800,
          fontSize: "1.5rem",
          margin: 0,
          color: "#fff",
          letterSpacing: "-0.5px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {getTitulo(location.pathname)}
      </h1>
      {/* Botão sair */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2"
        aria-label="Sair"
        style={{
          background: "rgba(255,255,255,0.10)",
          border: "none",
          color: "#fff",
          borderRadius: "0.7rem",
          padding: "0.5rem 1rem",
          fontWeight: 700,
          fontSize: "1rem",
          marginLeft: "auto",
          marginRight: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 0,
          boxShadow: "0 1px 6px #312e8133",
          cursor: "pointer",
        }}
      >
        <FaSignOutAlt />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
}