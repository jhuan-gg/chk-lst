import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminUser } from "../auth";

export default function FuncionarioRoute({ children }) {
  // Se for admin, redireciona para /checklist ou outra rota de admin
  if (isAdminUser()) {
    return <Navigate to="/checklist" replace />;
  }
  // Se não estiver logado, redireciona para login
  if (!sessionStorage.getItem("userName")) {
    return <Navigate to="/login" replace />;
  }
  // Se for funcionário, permite acesso
  return children;
}