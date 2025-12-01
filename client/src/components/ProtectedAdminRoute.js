import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 1) 로그인 안 함
  if (!token) {
    alert("로그인이 필요합니다!");
    return <Navigate to="/login" replace />;
  }

  // 2) 관리자 아님
  if (user.role !== "admin") {
    alert("관리자만 접근할 수 있습니다.");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
