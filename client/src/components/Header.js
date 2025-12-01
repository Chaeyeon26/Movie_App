import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdmin } from "../utils/auth";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 로그인/회원가입 페이지인지 체크
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <header
      className={`header ${
        location.pathname.startsWith("/movies/") ? "header-transparent" : ""
      }`}
    >
      {/* 로고는 항상 표시 */}
      <h2 className="header-title" onClick={() => navigate("/")}>
        🎬 Movie App
      </h2>

      {/* 로그인/회원가입 페이지에서는 오른쪽 헤더 숨김 */}
      {!isAuthPage && (
        <div className="header-right">
          {/* 관리자 메뉴 */}
          {isAdmin() && (
            <>
              <button
                className="header-btn admin-btn"
                onClick={() => navigate("/admin/movies")}
              >
                영화 관리
              </button>

              <button
                className="header-btn admin-btn"
                onClick={() => navigate("/admin/screens")}
              >
                상영 관리
              </button>
            </>
          )}

          {/* 로그인 여부 */}
          {user ? (
            <>
              <span>
                안녕하세요, <strong>{user.username}</strong> 님 👋
              </span>

              <button className="header-btn" onClick={() => navigate("/mypage")}>
                마이페이지
              </button>

              <button className="header-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button className="header-btn" onClick={() => navigate("/login")}>
                로그인
              </button>

              <button className="header-btn" onClick={() => navigate("/register")}>
                회원가입
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
