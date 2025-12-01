import React, { useEffect, useState } from "react";
import { getAllReviews } from "../api/reviews"; 

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch (err) {
        console.error("리뷰 불러오기 실패:", err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>💬 리뷰 목록</h2>
      {reviews.length === 0 ? (
        <p>등록된 리뷰가 없습니다.</p>
      ) : (
        <ul>
          {reviews.map((r) => (
            <li key={r.review_id} style={{ marginBottom: "10px" }}>
              <strong>{r.Movie?.title}</strong> — 평점 {r.rating}/5
              <br />
              작성자: {r.User?.username}
              <br />
              내용: {r.comment}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReviewList;