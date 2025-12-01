import React, { useEffect, useState } from "react";
import "./AdminScreens.css";
import AdminScreenEditModal from "../components/AdminScreenEditModal.js";
import AdminScreenAddModal from "../components/AdminScreenAddModal";
import { getAllScreens, deleteScreen, updateScreen, createScreen } from "../api/screens";


function AdminScreens() {
  const [screens, setScreens] = useState([]);
  const [editScreen, setEditScreen] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const fetchScreens = async () => {
    try {
      const data = await getAllScreens();
      setScreens(data);
    } catch (e) {
      console.error("상영 정보 조회 실패:", e);
    }
  };

  const handleDelete = async (screenId) => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await deleteScreen(screenId, token);

      alert("삭제 완료!");
      fetchScreens();
    } catch (e) {
      console.error("삭제 오류:", e);
      const errorMessage = e.response?.data?.message || "삭제 실패";
      alert(errorMessage);
    }
  };

  const handleEditSave = async (updated) => {
    try {
      const token = localStorage.getItem("token");

      await updateScreen(updated.screen_id, updated, token);

      setEditScreen(null);
      fetchScreens();
    } catch (e) {
      const errorMessage = e.response?.data?.message || "수정 실패";
      alert(errorMessage);
    }
  };

  const handleCreate = async (newScreen) => {
    try {
      const token = localStorage.getItem("token");

      await createScreen(newScreen, token);

      setIsAddModalOpen(false);
      fetchScreens();
    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.message || "추가 실패";
      alert(errorMessage);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  return (
    <div className="admin-container">
      <h2 className="admin-title">📽 상영 정보 관리</h2>

      <button
        className="admin-add-btn"
        onClick={() => setIsAddModalOpen(true)}
      >
        + 상영 추가
      </button>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>영화 ID</th>
            <th>상영관</th>
            <th>시작</th>
            <th>종료</th>
            <th>관리</th>
          </tr>
        </thead>

        <tbody>
          {screens.map((s) => (
            <tr key={s.screen_id}>
              <td>{s.screen_id}</td>
              <td>{s.movie_id}</td>
              <td>{s.theater_name}</td>
              <td>{formatDateTime(s.start_time)}</td>
              <td>{formatDateTime(s.end_time)}</td>

              <td>
                <button
                  className="admin-action-btn"
                  onClick={() => setEditScreen(s)}
                >
                  수정
                </button>

                <button
                  className="admin-action-btn admin-delete-btn"
                  onClick={() => handleDelete(s.screen_id)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editScreen && (
        <AdminScreenEditModal
          screen={editScreen}
          onClose={() => setEditScreen(null)}
          onSave={handleEditSave}
        />
      )}

      {isAddModalOpen && (
        <AdminScreenAddModal
          onClose={() => setIsAddModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

    </div>
  );
}

export default AdminScreens;