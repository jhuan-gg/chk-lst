import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaClipboardList, FaInbox, FaChartBar, FaChartLine, FaUserPlus, FaTrash, FaClipboardCheck, FaSignOutAlt, FaTimes, FaUserMinus } from "react-icons/fa";
import { TbChecklist } from "react-icons/tb";
import { RiEditFill } from "react-icons/ri";
import { isAdminUser } from "../auth";
import "./sidebar.css";

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState(sessionStorage.getItem("userName") || "");

  // Atualiza userName do sessionStorage ao montar
  React.useEffect(() => {
    setUserName(sessionStorage.getItem("userName") || "");
  }, []);

  // Fecha o sidebar ao clicar fora (mobile)
  React.useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (e.target.closest(".sidebar")) return;
      onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Sidebar sempre visível em desktop, drawer em mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 900;

  // Verifica se é admin
  const isAdmin = isAdminUser();

  // Menus para gestor e funcionário
  const menu = isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard", icon: <FaChartBar /> },
        { to: "/criar-regra-checklist", label: "Criar Regra de Checklist", icon: <FaClipboardList /> },
        { to: "/editar-regra-checklist", label: "Editar Regra de Checklist", icon: <RiEditFill /> },
        { to: "/apagar-regras-checklist", label: "Apagar Regras de Checklist", icon: <FaTrash /> },
        { to: "/validar-pedidos", label: "Validar Pedidos", icon: <FaClipboardCheck /> },
        { to: "/criar-usuario", label: "Criar Usuário", icon: <FaUserPlus /> },
        { to: "/deletar-usuarios", label: "Deletar Usuários", icon: <FaUserMinus /> },
        { to: "/checklist", label: "Checklist", icon: <TbChecklist /> },
      ]
    : [
        { to: "/meu-dashboard", label: "Meu Desempenho", icon: <FaChartLine /> },
        { to: "/checklist", label: "Checklist", icon: <FaClipboardList /> },
        { to: "/pedidos", label: "Pedidos", icon: <FaInbox /> },
      ];

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay só em mobile */}
      {isMobile && open && (
        <div
          className="sidebar-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 49,
            transition: "opacity 0.2s",
          }}
          onClick={onClose}
          aria-label="Fechar menu"
        />
      )}
      <nav
        className={`sidebar ${isMobile ? "sidebar-mobile" : "sidebar-desktop"} ${open ? "open" : ""}`}
        style={{
          transform: isMobile
            ? open
              ? "translateX(0)"
              : "translateX(-100%)"
            : "none",
          transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
          zIndex: 50,
          height: "100vh",
          overflowY: "auto", // <-- Adicione esta linha
        }}
        aria-label="Menu lateral"
      >
        {/* Botão fechar só em mobile */}

        {/* Nome do usuário no topo */}
        <div className="sidebar-user-label">
          {userName
            ? <>Olá, <span style={{ color: "#a78bfa" }}>{userName}!</span></>
            : "Olá!"}
        </div>
        <div className="sidebar-links">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
              onClick={() => {
                if (isMobile) onClose();
              }}
              tabIndex={open || !isMobile ? 0 : -1}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div
          style={{
            marginTop: "2.5rem",
            marginBottom: "1.5rem",
            padding: "0.5rem 0.5rem 0.5rem 0.5rem",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleLogout}
            className="logout-btn"
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.6rem 1.2rem",
              fontWeight: 600,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              width: "100%",
              maxWidth: 180,
              justifyContent: "center",
              boxShadow: "0 2px 8px #0001",
            }}
            title="Sair"
          >
            <FaSignOutAlt />
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </>
  );
}