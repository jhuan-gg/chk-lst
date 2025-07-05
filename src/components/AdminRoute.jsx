import { Navigate } from "react-router-dom";
import { isAdminUser } from "../auth";

export default function AdminRoute({ children }) {
  if (!isAdminUser()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}