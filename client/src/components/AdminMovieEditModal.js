import React, { useState, useEffect } from "react";
import "./AdminMovieEditModal.css";

function AdminMovieEditModal({ movie, onClose, onSave }) {
  const [title, setTitle] = useState(movie.title);
  const [genre, setGenre] = useState(movie.genre);
  const [releaseYear, setReleaseYear] = useState(movie.release_year);
  const [summary, setSummary] = useState(movie.summary);

  const handleSubmit = () => {
    if (!title || !genre || !releaseYear) {
      return alert("제목, 장르, 개봉연도는 필수 항목입니다.");
    }

    onSave({
      movie_id: movie.movie_id,
      title,
      genre,
      release_year: Number(releaseYear),
      summary,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>영화 수정</h2>

        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>장르</label>
        <input value={genre} onChange={(e) => setGenre(e.target.value)} />

        <label>개봉연도</label>
        <input
          type="number"
          min="1900"
          max="2100"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
        />

        <label>요약</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />

        <div className="modal-buttons">
          <button onClick={handleSubmit}>저장</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default AdminMovieEditModal;
