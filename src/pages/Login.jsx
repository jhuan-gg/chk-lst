import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../login.css";
import { FaSpinner } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Só mostra o popup se for mobile
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        setShowInstall(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      setShowInstall(false);
      // Mostra o prompt nativo do navegador
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      let emailParaLogin = usuario.trim();
      let userFirestore = null;

      // Verifica se é e-mail (contém @ e .) ou nome de usuário
      const isEmail = emailParaLogin.includes("@") && emailParaLogin.includes(".");

      if (!isEmail) {
        // Buscar usuário pelo nome no Firestore
        const q = query(collection(db, "usuarios"), where("nome", "==", emailParaLogin));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setErro("Usuário não encontrado.");
          setLoading(false);
          return;
        }

        userFirestore = snapshot.docs[0].data();
        if (!userFirestore.email) {
          setErro("Usuário sem e-mail cadastrado.");
          setLoading(false);
          return;
        }
        emailParaLogin = userFirestore.email;
      }

      // Login com Firebase Auth usando o e-mail encontrado ou digitado
      const userCredential = await signInWithEmailAndPassword(auth, emailParaLogin, senha);
      const userAuth = userCredential.user;

      // Busca dados adicionais no Firestore se ainda não buscou
      if (!userFirestore) {
        const q = query(collection(db, "usuarios"), where("email", "==", userAuth.email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setErro("Usuário autenticado, mas dados adicionais não encontrados.");
          setLoading(false);
          return;
        }
        userFirestore = snapshot.docs[0].data();
      }

      // Confere se o e-mail do Firestore bate com o do Auth (extra por segurança)
      if (userFirestore.email !== userAuth.email) {
        setErro("Dados inconsistentes. Contate o administrador.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("devUser", userFirestore.tipo === "gestor" ? "admin" : "funcionario");
      sessionStorage.setItem("userName", userFirestore.nome);
      navigate("/checklist");
    } catch (err) {
      setErro("Usuário ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">
          Check<span className="login-title-accent">!</span>
        </h1>
        <p className="login-desc">
          Acesse sua conta para continuar
        </p>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            className="login-input"
            type="text"
            placeholder="Digite seu E-mail ou Usuário"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            inputMode="email"
            style={{ marginBottom: 10, minHeight: 20, fontSize: "1rem" }}
          />
          <input
            className="login-input"
            type={showSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            autoComplete="current-password"
            style={{ marginBottom: 4, minHeight: 20, fontSize: "1rem" }}
          />
          <label className="show-password-checkbox" style={{ marginBottom: 2 }}>
            <input
              type="checkbox"
              checked={showSenha}
              onChange={() => setShowSenha((v) => !v)}
              style={{ marginRight: 8, width: 16, height: 16, marginTop: 10, }}
            />
            Exibir senha
          </label>
          <button
            type="submit"
            disabled={loading}
            className="login-btn flex items-center justify-center gap-2"
            style={{ minHeight: 38, fontSize: "1rem" }}
          >
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {erro && <div className="login-erro">{erro}</div>}
        </form>
        {showInstall && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.35)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 16px #0002",
                padding: "2rem 1.2rem",
                maxWidth: 320,
                width: "90vw",
                textAlign: "center"
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#312e81", marginBottom: 12 }}>
                Instalar aplicativo?
              </div>
              <div style={{ color: "#444", fontSize: "0.98rem", marginBottom: 18 }}>
                Você gostaria de instalar o Check! como aplicativo no seu dispositivo?
              </div>
              <button
                className="login-btn"
                style={{ width: "100%", marginBottom: 10 }}
                onClick={handleInstall}
              >
                Instalar agora
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#7c3aed",
                  fontWeight: 500,
                  fontSize: "1rem",
                  cursor: "pointer",
                  width: "100%"
                }}
                onClick={() => setShowInstall(false)}
              >
                Não, obrigado
              </button>
            </div>
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <a href="/redefinir-senha" style={{ color: "purple", textDecoration: "none", fontSize: "14px" }}>Esqueceu a Senha?</a>
        </div>
        <div className="login-footer">
          © {new Date().getFullYear()} Check!. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
}