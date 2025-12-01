import { api } from "./instance";

// 회원가입
export const register = async (username, password) => {
  const response = await api.post("/users/register", {
    username,
    password,
  });
  return response;
};

// 로그인
export const login = async (username, password) => {
  const response = await api.post("/users/login", {
    username,
    password,
  });

  return response; 
};