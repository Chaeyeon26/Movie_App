import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { login } from "../api/users";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await login(username, password);

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      navigate("/");

    } catch (error) {
      console.error(error);
      
      const errorMessage = error.response?.data?.message || "서버 오류가 발생했습니다.";
      
      alert(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">🔐 로그인</h2>

        <input
          type="text"
          placeholder="아이디"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>
          로그인
        </button>

        <div className="signup-text">
          아직 회원이 아니신가요?
          <span
            className="signup-link"
            onClick={() => navigate("/register")}
          >
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}