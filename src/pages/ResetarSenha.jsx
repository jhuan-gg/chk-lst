import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function ResetarSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");

  useEffect(() => {
    // Valida o código e obtém o e-mail do usuário
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => setEmailUsuario(email))
      .catch(() => setErro("Link inválido ou expirado."));
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      // Atualiza a senha no Firebase Auth
      await confirmPasswordReset(auth, oobCode, novaSenha);

      // Atualiza a senha também no Firestore
      const q = query(collection(db, "usuarios"), where("email", "==", emailUsuario));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, { senha: novaSenha });
      }

      setMensagem("Senha redefinida com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setErro("Erro ao redefinir a senha.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">Nova senha</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <input
            className="login-input"
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">Salvar senha</button>
        </form>
        {mensagem && <div className="login-success">{mensagem}</div>}
        {erro && <div className="login-erro">{erro}</div>}
      </div>
    </div>
  );
}
