import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css";
import { getUserReservations, cancelReservation } from "../api/reservations";
import { getUserReviews, deleteReview } from "../api/reviews";


function MyPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [reviews, setReviews] = useState([]);

  // 필터 state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

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
      console.error("❌ 예매 내역 오류:", err);
    }
  };

  // 초기 로딩 (예약 및 리뷰 동시 조회)
  useEffect(() => {
    fetchReservations(); 
    
    // 리뷰 조회 함수
    const fetchReviews = async () => {
        if (!user) return;
        try {
            const data = await getUserReviews(user.id);
            setReviews(data);
        } catch (err) {
            console.error("❌ 리뷰 조회 오류:", err);
        }
    }
    fetchReviews();

  }, []); 

  // 예매 취소
  const handleCancel = async (reservationId) => {
    if (!window.confirm("정말 예매를 취소하시겠습니까?")) return;

    try {
        await cancelReservation(reservationId);

        alert("예매가 취소되었습니다.");

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

        alert("리뷰가 삭제되었습니다.");

        setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
    } catch (err) {
        console.error(err);
        const errorMessage = err.response?.data?.message || "오류가 발생했습니다.";
        alert(errorMessage);
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
                  src={movie.poster_url || "/default-poster.png"}
                  alt="poster"
                />
              </div>

              <div className="review-right">
                <div className="review-title">
                  {movie.title} ({movie.release_year})
                </div>

                <div className="mypage-review-rating">⭐ {rv.rating} / 5</div>

                <div className="mypage-review-comment">{rv.comment}</div>

                <div className="mypage-review-bottom-row">
                  <div className="review-date">
                    작성일: {new Date(rv.created_at).toLocaleDateString("ko-KR")}
                  </div>

                  <div className="review-actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/review", {
                          state: {
                            reservationId: rv.reservation_id,
                            reviewId: rv.review_id,
                            mode: "edit",
                            previousComment: rv.comment,
                            previousRating: rv.rating,
                          },
                        });
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
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default MyPage;