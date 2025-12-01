import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { register } from "../api/users";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!username || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (password !== confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await register(username, password);
      
      alert("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      
      const errorMessage = err.response?.data?.message || "서버 오류가 발생했습니다.";
      alert(errorMessage);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">📝 회원가입</h2>

        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="signup-input"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="signup-input"
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="signup-input"
        />

        <button className="signup-btn" onClick={handleSignup}>
          회원가입
        </button>

        <p className="signup-bottom-text">
          이미 계정이 있으신가요?
          <span className="signup-link" onClick={() => navigate("/login")}>
            로그인 하기
          </span>
        </p>
      </div>
    </div>
  );
}