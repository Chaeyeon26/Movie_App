import React, { useState } from "react";
import "./AdminScreenAddModal.css";

function AdminScreenAddModal({ onClose, onCreate }) {
  const [movieId, setMovieId] = useState("");
  const [theater, setTheater] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const toKST = (value) => {
    return new Date(new Date(value).getTime() + 9 * 60 * 60 * 1000);
  };

  const handleSubmit = () => {
    if (!movieId || !theater || !start || !end)
      return alert("모든 항목을 입력해주세요.");

    onCreate({
      movie_id: movieId,
      theater_name: theater,
      start_time: start,
      end_time: end,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>상영 추가</h2>

        <label>영화 ID</label>
        <input
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
        />

        <label>상영관 이름</label>
        <input
          value={theater}
          onChange={(e) => setTheater(e.target.value)}
        />

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
          <button onClick={handleSubmit}>등록</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default AdminScreenAddModal;
