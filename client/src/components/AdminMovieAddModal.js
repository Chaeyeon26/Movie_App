import React, { useState } from "react";
import "./AdminMovieAddModal.css";

function AdminMovieAddModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [summary, setSummary] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return alert("제목은 필수입니다.");

    onCreate({
      title,
      genre,
      release_year: releaseYear,
      summary,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>🎬 새 영화 추가</h2>

        <label>제목</label>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />

        <label>장르</label>
        <input 
          value={genre} 
          onChange={(e) => setGenre(e.target.value)} 
        />

        <label>개봉연도</label>
        <input 
          value={releaseYear} 
          onChange={(e) => setReleaseYear(e.target.value)} 
        />

        <label>요약</label>
        <textarea 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)} 
        />

        <div className="modal-buttons">
          <button onClick={handleSubmit}>추가</button>
          <button onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default AdminMovieAddModal;
