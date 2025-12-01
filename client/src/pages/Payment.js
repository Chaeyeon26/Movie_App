import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import { createMultiReservation } from "../api/reservations";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>잘못된 접근입니다.</p>;

  const { movie, screen, seats, personCount, totalPrice } = state;

  const handlePaymentConfirm = async () => {
    try {
      await createMultiReservation(
        state.userId,
        state.screen.screen_id,
        state.seats
      );

      navigate("/payment/success", {
        state: {
          movie,
          screen,
          seats,
          personCount,
          totalPrice,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "결제 처리 중 오류가 발생했습니다.";
      alert(errorMessage);
    }
  };

  // 날짜 + 시간 포맷
  function formatDate(dateString) {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatTime(dateString) {
    const d = new Date(dateString);
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${min}`;
  }

  return (
    <div className="payment-container">
      <h2>💳 결제 페이지</h2>

      <div className="summary-box">
        <p>🎬 영화: {movie.title}</p>
        <p>🕒 시간: {formatDate(screen.start_time)} {formatTime(screen.start_time)} ~ {formatTime(screen.end_time)}</p>
        <p>🏢 상영관: {screen.theater_name}</p>
        <p>💺 좌석: {seats.join(", ")}</p>
        <p>👥 인원: {personCount}명</p>
        <p>💰 금액: {totalPrice.toLocaleString()}원</p>
      </div>

      <button
        className="pay-btn"
        onClick={handlePaymentConfirm}>
        결제하기
      </button>
    </div>
  );
}