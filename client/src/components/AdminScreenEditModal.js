import React, { useState } from "react";
import "./AdminScreenEditModal.css";

function AdminScreenEditModal({ screen, onClose, onSave }) {

  // datetime-local에 맞는 ISO-local 변환 (timezone 보정 포함)
  const toLocalInputValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().slice(0, 16);
  };

  const [movieId, setMovieId] = useState(screen.movie_id);
  const [theater, setTheater] = useState(screen.theater_name);

  const [start, setStart] = useState(toLocalInputValue(screen.start_time));
  const [end, setEnd] = useState(toLocalInputValue(screen.end_time));

  const handleSubmit = () => {
    if (!movieId || !theater || !start || !end) {
      return alert("모든 항목을 입력해주세요.");
    }

    // datetime-local은 그대로 서버로 전달해야 함
    onSave({
      screen_id: screen.screen_id,
      movie_id: movieId,
      theater_name: theater,
      start_time: start,     // 여기 보정 필요 없음
      end_time: end,         // 여기 보정 필요 없음
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>상영 정보 수정</h2>

        <label>영화 ID</label>
        <input value={movieId} onChange={(e) => setMovieId(e.target.value)} />

        <label>상영관 이름</label>
        <input value={theater} onChange={(e) => setTheater(e.target.value)} />

        <label>시작 시간</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label>종료 시간</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <div className="modal-buttons">
          <button onClick={handleSubmit}>저장</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default AdminScreenEditModal;
