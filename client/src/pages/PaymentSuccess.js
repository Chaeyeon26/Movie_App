import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>잘못된 접근입니다.</p>;

  const { movie, screen, seats, personCount, totalPrice } = state;

  return (
    <div className="ticket-wrapper">

      <h2 className="ticket-title">🎉 결제가 완료되었습니다!</h2>

      <div className="ticket">
        <div className="ticket-left">
          <h3 className="movie-name">{movie.title}</h3>

          <p className="info"><span>📅 날짜</span> {screen.start_time.slice(0, 10)}</p>
          <p className="info">
            <span>⏱ 시간</span> {screen.start_time.slice(11, 16)} ~{" "}
            {screen.end_time.slice(11, 16)}
          </p>
          <p className="info"><span>🏢 상영관</span> {screen.theater_name}</p>
          <p className="info"><span>💺 좌석</span> {seats.join(", ")}</p>
          <p className="info"><span>👥 인원</span> {personCount}명</p>
          <p className="info"><span>💰 금액</span> {totalPrice.toLocaleString()}원</p>
        </div>

        {/* 바코드 영역 */}
        <div className="ticket-right">
          <div className="barcode"></div>
          <p className="barcode-number">A{Math.floor(Math.random() * 900000 + 100000)}</p>
        </div>
      </div>

      <button className="ticket-btn" onClick={() => navigate("/mypage")}>
        마이페이지로 이동
      </button>

    </div>
  );
}
