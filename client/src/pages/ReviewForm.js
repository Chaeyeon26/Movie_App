import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ReviewForm.css";
import { createReview } from "../api/reviews";

function ReviewForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationId = location.state?.reservationId;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!reservationId) {
    return <div className="error-box">잘못된 접근입니다.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      return alert("리뷰 내용을 입력해주세요!");
    }

    try {
      const data = await createReview(reservationId, rating, comment);
      const movieId = data.movieId; 

      navigate(`/movies/${movieId}`);
    } catch (err) {
      console.error("리뷰 작성 실패:", err);
      // Axios 에러 응답 처리
      const errorMessage = err.response?.data?.message || "서버 오류 발생";
      alert(errorMessage);
    }
  };

  return (
    <div className="review-container">
      <h2 className="review-title">📝 리뷰 작성</h2>

      <form className="review-form" onSubmit={handleSubmit}>
        <label className="form-label">
          평점:
          <select
            className="rating-select"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          코멘트:
          <textarea
            className="comment-box"
            rows="5"
            placeholder="리뷰 내용을 입력하세요"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>

        <button className="submit-btn" type="submit">
          등록하기
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;