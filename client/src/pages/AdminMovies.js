import React, { useEffect, useState } from "react";
import "./AdminMovies.css";
import AdminMovieEditModal from "../components/AdminMovieEditModal.js";
import AdminMovieAddModal from "../components/AdminMovieAddModal.js";
import { getMovies, deleteMovie, updateMovie, createMovie } from "../api/movies"; 

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [editMovie, setEditMovie] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchMovies = async () => {
    try {
      const data = await getMovies(); 
      setMovies(data);
    } catch (e) {
      console.error("영화 조회 실패:", e);
    }
  };

  const openEditModal = (movie) => {
    setEditMovie(movie); // 수정할 영화 저장
  };

  const closeEditModal = () => {
    setEditMovie(null);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleDelete = async (movieId) => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await deleteMovie(movieId, token); 

      alert("삭제 완료!");
      fetchMovies();
    } catch (e) {
      console.error("삭제 오류:", e);
      // Axios 에러 응답 처리
      const errorMessage = e.response?.data?.message || "삭제 실패";
      alert(errorMessage);
    }
  };

  const handleEditSave = async (updatedMovie) => {
    try {
      const token = localStorage.getItem("token");

      await updateMovie(updatedMovie.movie_id, updatedMovie, token); 

      closeEditModal();
      fetchMovies();
    } catch (e) {
      console.error("수정 오류:", e);
      // Axios 에러 응답 처리
      const errorMessage = e.response?.data?.message || "수정 실패";
      alert(errorMessage);
    }
  };

  const handleCreateMovie = async (newMovie) => {
    try {
      const token = localStorage.getItem("token");

      await createMovie(newMovie, token);

      alert("추가 완료!");
      closeAddModal();
      fetchMovies();
    } catch (e) {
      console.error("추가 오류:", e);
      // Axios 에러 응답 처리
      const errorMessage = e.response?.data?.message || "추가 실패";
      alert(errorMessage);
    }
  };


  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="admin-container">
      <h2 className="admin-title">🎬 영화 관리</h2>

      <button className="admin-add-btn"
        onClick={() => setIsAddModalOpen(true)}
      >
        + 영화 추가
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>제목</th>
            <th>장르</th>
            <th>개봉연도</th>
            <th>평균 평점</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {movies.map((m) => (
            <tr key={m.movie_id}>
              <td>{m.movie_id}</td>
              <td>{m.title}</td>
              <td>{m.genre}</td>
              <td>{m.release_year}</td>
              <td>{m.avg_rating ?? "-"}</td>

              <td>
                <button className="admin-action-btn"
                  onClick={() => openEditModal(m)}
                >
                  수정
                </button>

                <button
                  className="admin-action-btn admin-delete-btn"
                  onClick={() => handleDelete(m.movie_id)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editMovie && (
        <AdminMovieEditModal
          movie={editMovie}
          onClose={closeEditModal}
          onSave={handleEditSave}
        />
      )}

      {isAddModalOpen && (
        <AdminMovieAddModal
          onClose={closeAddModal}
          onCreate={handleCreateMovie}
        />
      )}
    </div>
  );
}

export default AdminMovies;