import { api } from "./instance";

// 특정 상영의 예약된 좌석 조회
export const getReservedSeatsByScreen = (screenId) =>
  api.get(`/reservations/screen/${screenId}`);

// 사용자 예매 내역 조회 (필터 포함)
export const getUserReservations = (userId, params) => {
  return api.get(`/reservations/user/${userId}`, { params });
};

// 예매 취소
export const cancelReservation = (reservationId) => {
  return api.delete(`/reservations/${reservationId}`);
};

// 다중 좌석 예약 생성 추가 (Payment)
export const createMultiReservation = (userId, screenId, seatNumbers) => {
  return api.post("/reservations/multi", {
    user_id: userId,
    screen_id: screenId,
    seat_numbers: seatNumbers,
  });
};