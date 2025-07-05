import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Checklist from "./pages/Checklist";
import Validacao from "./pages/Validacao";
import Login from "./pages/Login";
import PedidosValidacao from "./pages/PedidosValidacao";
import CriarUsuario from "./pages/CriarUsuario";
import CriarRegraChecklist from "./pages/CriarRegraChecklist";
import ApagarRegrasChecklist from "./pages/ApagarRegrasChecklist";
import ValidarPedidos from "./pages/ValidarPedidos";
import DashboardGestor from "./pages/DashboardGestor";
import DashboardFuncionario from "./pages/DashboardFuncionario";
import DeletarUsuarios from "./pages/DeletarUsuarios";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import FuncionarioRoute from "./components/FuncionarioRoute";
import EditarRegraChecklist from "./pages/EditarRegraChecklist";
import RedefinirSenha from "./pages/RedefinirSenha";
import ResetarSenha from "./pages/ResetarSenha"; 

function Layout({ children }) {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout flex">
      {!hideSidebar && sidebarOpen && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex-1 flex flex-col">
        {!hideSidebar && (
          <Header onMenuClick={() => setSidebarOpen(true)} />
        )}
        <div className="page-content flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal agora é o login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/resetar-senha" element={<ResetarSenha />} />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route
                  path="/checklist"
                  element={
                    <ProtectedRoute>
                      <Checklist />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/validacao/:tarefaId"
                  element={
                    <ProtectedRoute>
                      <Validacao />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pedidos"
                  element={
                    <FuncionarioRoute>
                      <PedidosValidacao /> {/* ou o componente da tela de pedidos */}
                    </FuncionarioRoute>
                  }
                />
                <Route
                  path="/criar-usuario"
                  element={
                    <AdminRoute>
                      <CriarUsuario />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/criar-regra-checklist"
                  element={
                    <AdminRoute>
                      <CriarRegraChecklist />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/editar-regra-checklist"
                  element={
                    <AdminRoute>
                      <EditarRegraChecklist />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/apagar-regras-checklist"
                  element={
                    <AdminRoute>
                      <ApagarRegrasChecklist />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/validar-pedidos"
                  element={
                    <AdminRoute>
                      <ValidarPedidos />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <AdminRoute>
                      <DashboardGestor />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/meu-dashboard"
                  element={
                    <FuncionarioRoute>
                      <DashboardFuncionario />
                    </FuncionarioRoute>
                  }
                />
                <Route
                  path="/deletar-usuarios"
                  element={
                    <AdminRoute>
                      <DeletarUsuarios />
                    </AdminRoute>
                  }
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}