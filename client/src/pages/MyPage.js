import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import { getUserReservations, cancelReservation } from "../api/reservations";
import { getUserReviews, deleteReview, updateReview } from "../api/reviews";

function MyPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);

  // 리뷰 수정용 state
  const [editMode, setEditMode] = useState(null);
  const [updatedRating, setUpdatedRating] = useState(5);
  const [updatedComment, setUpdatedComment] = useState("");

  const fetchReviews = async () => {
        if (!user) return;
        try {
            const data = await getUserReviews(user.id);
            setReviews(data);
        } catch (err) {
            console.error("리뷰 조회 오류:", err);
        }
    };

  // 필터 state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  const getPosterUrl = (oldUrl, genre) => {
    if (!oldUrl || !genre) return oldUrl;

    const genreMap = {
      '로맨스': 'romance',
      '스릴러': 'thriller',
      '액션': 'action',
      '코미디': 'comedy',
    };
    
    const genreFolder = genreMap[genre]; 

    if (!genreFolder) {
        return oldUrl; 
    }

    try {
      const fileName = oldUrl.substring(oldUrl.lastIndexOf('/') + 1);
      return `/posters/${genreFolder}/${fileName}`;
    } catch (e) {
      console.error("포스터 URL 재구성 실패:", e);
      return oldUrl;
    }
  };

  // 예약 조회 함수 (필터 적용)
  const fetchReservations = async () => {
    if (!user) return;

    const params = {};
    if (title) params.title = title;
    if (date) params.date = date;

    try {
      const data = await getUserReservations(user.id, params);
      setReservations(data);
    } catch (err) {
      console.error("예매 내역 오류:", err);
    }
  };

  // 초기 로딩 (예약 및 리뷰 동시 조회)
  useEffect(() => {
    fetchReservations(); 
    fetchReviews();
  }, []); 

  // 예매 취소
  const handleCancel = async (reservationId) => {
    if (!window.confirm("정말 예매를 취소하시겠습니까?")) return;

    try {
        await cancelReservation(reservationId);

        setReservations((prev) =>
          prev.filter((r) => r.reservation_id !== reservationId)
        );
    } catch (error) {
        const errorMessage = error.response?.data?.message || "취소 실패";
        alert(errorMessage);
    }
  };

  // 리뷰 작성으로 이동
  const goToReviewForm = (reservationId) => {
    navigate("/review", { state: { reservationId } });
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;

    try {
        await deleteReview(reviewId);

        setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
    } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || "오류가 발생했습니다.";
        alert(errorMessage);
    }
  };
  // 리뷰 수정 시작 함수 추가됨
  const startEdit = (rv) => {
    setEditMode(rv.review_id);
    setUpdatedRating(rv.rating);
    setUpdatedComment(rv.comment);
  };

  // 리뷰 업데이트 함수
  const handleUpdate = async (reviewId) => {
    try {
      await updateReview(reviewId, {
        rating: updatedRating,
        comment: updatedComment,
      });

      await fetchReviews();
      setEditMode(null);

    } catch (err) {
      console.error("리뷰 수정 실패:", err);
      alert("리뷰 수정 실패");
    }
  };

  // 상영 종료 여부
  const isScreenEnded = (endTime) => {
    return new Date(endTime) < new Date();
  };

  const filteredReservations = reservations.filter(
    (r) => r.Screen && r.Screen.Movie
  );


  return (
    <div className="mypage-container">
      <h2 className="mypage-title">마이페이지</h2>

      {/* 필터 UI 추가 */}
      <div className="filter-box">
        <input
          type="text"
          placeholder="영화 제목 검색"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button onClick={fetchReservations}>검색</button>
      </div>

      <h3 className="section-title">🎟 나의 예매 내역</h3>

      {(() => {
        const filteredReservations = reservations.filter(
          (r) => r.Screen && r.Screen.Movie
        );

        // 예매 자체가 없을 때
        if (reservations.length === 0) {
          return <p className="empty-text">예매 내역이 없습니다.</p>;
        }

        // 예매는 있는데 검색 조건과 불일치
        if (filteredReservations.length === 0) {
          return <p className="empty-text">검색 결과가 없습니다.</p>;
        }

        // 필터링된 예매 내역 출력
        return filteredReservations.map((r) => {
          const ended = isScreenEnded(r.Screen.end_time);

          // 상영 시작 30분 전 제한 로직
          const startTime = new Date(r.Screen.start_time);
          const now = new Date();
          const cancelLimit = new Date(startTime.getTime() - 30 * 60 * 1000);
          const cancelDisabled = now > cancelLimit;

          return (
            <div key={r.reservation_id} className="card">
              <strong className="movie-title">{r.Screen.Movie.title}</strong>

              <div>상영관: {r.Screen.theater_name}</div>
              <div>
                상영 시간:{" "}
                {new Date(r.Screen.start_time).toLocaleString("ko-KR")} ~{" "}
                {new Date(r.Screen.end_time).toLocaleString("ko-KR")}
              </div>
              <div>좌석 번호: {r.seat_number}</div>
              <div>
                예매일: {new Date(r.created_at).toLocaleString("ko-KR")}
              </div>

              <div className="btn-row">
                {/* 상영 30분 전 후로 취소 버튼 비활성화 */}
                <button
                  className={`cancel-btn ${cancelDisabled ? "disabled" : ""}`}
                  onClick={() => {
                    if (cancelDisabled) {
                      alert("상영 시작 30분 전부터는 예매를 취소할 수 없습니다.");
                      return;
                    }
                    handleCancel(r.reservation_id);
                  }}
                >
                  예매 취소
                </button>

                {ended ? (
                  <button
                    className="review-btn"
                    onClick={() => goToReviewForm(r.reservation_id)}
                  >
                    리뷰 작성하기
                  </button>
                ) : (
                  <button className="review-btn disabled" disabled>
                    리뷰 작성하기
                  </button>
                )}
              </div>
            </div>
          );
        });
      })()}


      <h3 className="section-title">📝 내가 작성한 리뷰</h3>

      {reviews.length === 0 ? (
        <p className="empty-text">작성한 리뷰가 없습니다.</p>
      ) : (
        reviews.map((rv) => {
          const movie = rv.Reservation.Screen.Movie;

          return (
            <div
              key={rv.review_id}
              className="mypage-review-card"
              onClick={() => navigate(`/movies/${movie.movie_id}`)}
            >
              <div className="review-left">
                <img
                  className="review-poster"
                  src={getPosterUrl(movie.poster_url, movie.genre)}
                  alt="poster"
                />
              </div>

              <div className="review-right">
                <div className="review-title">
                  {movie.title} ({movie.release_year})
                </div>

                {editMode === rv.review_id ? (
                  <div className="edit-area"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      className="edit-rating"
                      value={updatedRating}
                      onChange={(e) => setUpdatedRating(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>

                    <textarea
                      className="edit-comment"
                      value={updatedComment}
                      onChange={(e) => setUpdatedComment(e.target.value)}
                      rows="3"
                    />

                    <div className="review-actions">
                      <button
                        className="my-save-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(rv.review_id);
                        }}
                      >
                        저장
                      </button>

                      <button
                        className="my-cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditMode(null);
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mypage-review-rating">⭐ {rv.rating} / 5</div>
                    <div className="mypage-review-comment">{rv.comment}</div>

                    <div className="review-actions">
                      <button
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(rv);
                        }}
                      >
                        수정
                      </button>

                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(rv.review_id);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyPage;  