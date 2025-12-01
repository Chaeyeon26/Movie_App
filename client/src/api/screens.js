import { api } from "./instance";

// 관리자 API
// 전체 상영 정보 조회
export const getAllScreens = () => {
  return api.get("/screens");
};

// 상영 정보 삭제
export const deleteScreen = (screenId, token) => {
  return api.delete(`/screens/${screenId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 상영 정보 수정
export const updateScreen = (screenId, updatedScreen, token) => {
  return api.put(`/screens/${screenId}`, updatedScreen, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

// 상영 정보 추가
export const createScreen = (newScreen, token) => {
  return api.post("/screens", newScreen, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};