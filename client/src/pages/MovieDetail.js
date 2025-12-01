import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./MovieDetail.css";
import { getMovieDetail, getScreensByMovie, getRecommendedMovies } from "../api/movies";
import { getReviewsByMovie, getReviewDistribution, updateReview, deleteReview } from "../api/reviews";
import { getReservedSeatsByScreen } from "../api/reservations";

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const initialScreenId = location.state?.screenId || "";
  const [distribution, setDistribution] = useState([]);
  const [recommended, setRecommended] = useState([]);

  // 인원수 state
  const [personCount, setPersonCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // 정렬 상태(최신순이 기본)
  const [sort, setSort] = useState("latest");

  // 날짜 선택
  const [selectedDate, setSelectedDate] = useState("");

  // 수정 모드
  const [editMode, setEditMode] = useState(null);
  const [updatedRating, setUpdatedRating] = useState(0);
  const [updatedComment, setUpdatedComment] = useState("");

  const filteredScreens = screens.filter((s) => {
    if (!selectedDate) return false;

    const localDate = new Date(s.start_time);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const screenDate = `${year}-${month}-${day}`;

    return screenDate === selectedDate;
  });

  // 배열 기반 좌석 선택 로직
  const toggleSeat = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
      return;
    }

    // 선택 가능 인원 초과 막기
    if (selectedSeats.length >= personCount) {
      alert(`인원수(${personCount}명) 만큼만 선택할 수 있습니다.`);
      return;
    }

    setSelectedSeats([...selectedSeats, seat]);
  };


  const startEdit = (review) => {
    setEditMode(review.review_id);
    setUpdatedRating(review.rating);
    setUpdatedComment(review.comment);
  };

  const fetchReviews = async () => {
    try {
      const data = await getReviewsByMovie(id, sort);
      setReviews(data);
    } catch (err) {
      console.error("리뷰 새로 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    setReviews([]);  // 영화 바뀔 때 기존 리뷰 비우기
  }, [id]);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const movieData = await getMovieDetail(id);
        console.log("🎬 현재 영화 상세:", movieData);
        setMovie(movieData);
      } catch (err) {
        console.error("영화 상세 불러오기 실패:", err);
      }

      try {
        const screensData = await getScreensByMovie(id);
        setScreens(screensData);
      } catch (err) {
        console.error("상영정보 불러오기 실패:", err);
      }

      try {
        const recommendedData = await getRecommendedMovies(id);
        setRecommended(recommendedData);
      } catch (err) {
        console.error("추천 영화 불러오기 실패:", err);
      }
    };
    
    fetchMovieData();

    fetchReviews();

  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [sort]);

  useEffect(() => {
    if (initialScreenId) {
      setSelectedScreenId(initialScreenId);
      fetchReservedSeats(initialScreenId);
    }
  }, [initialScreenId]);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const data = await getReviewDistribution(id);
        
        const actualData = data && data.data ? data.data : data;

        const safeData = Array.isArray(actualData) ? actualData : [];
        
        console.log("평점 분포:", safeData);
        setDistribution(safeData);
        
      } catch (err) {
        console.error("평점 분포 불러오기 실패:", err);
        setDistribution([]);
      }
    };
    fetchDistribution();
}, [id]);

  const fetchReservedSeats = async (screenId) => {
    try {
      const data = await getReservedSeatsByScreen(screenId);
      const seats = data.map((r) => r.seat_number);
      setReservedSeats(seats);
    } catch (error) {
      console.error("예약된 좌석 불러오기 실패:", error);
    }
  };

  const handleScreenChange = (e) => {
    const screenId = e.target.value;
    setSelectedScreenId(screenId);
    setSelectedSeat("");
    if (screenId) fetchReservedSeats(screenId);
  };

  const handleGoToPayment = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("로그인이 필요합니다!");

    if (!selectedScreenId)
      return alert("상영 시간을 선택해주세요!");

    if (selectedSeats.length !== personCount)
      return alert("좌석 선택 수와 인원수가 일치해야 합니다!");

    const selectedScreen = screens.find(
      (s) => s.screen_id == selectedScreenId
    );

    if (!selectedScreen)
      return alert("상영 정보를 가져오지 못했습니다.");

    // 결제 페이지로 이동
    navigate("/payment", {
      state: {
        userId: user.id,
        movie,
        screen: selectedScreen,
        seats: selectedSeats,
        personCount,
        totalPrice: selectedSeats.length * 9000,
      },
    });
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말로 리뷰를 삭제하시겠습니까?")) return;

    try {
      await deleteReview(reviewId);

      setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
      alert("리뷰가 삭제되었습니다!");
    } catch (error) {
      console.error("리뷰 삭제 오류:", error);
      alert("삭제 실패");
    }
  };

  const handleUpdate = async (reviewId) => {
    const data = {
      rating: updatedRating,
      comment: updatedComment,
    };
    
    try {
      await updateReview(reviewId, data);
      
      fetchReviews();
      setEditMode(null);
    } catch (error) {
      console.error("리뷰 수정 오류:", error);
      alert("수정 실패");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : 0;

  const maskUsername = (name) => {
    if (!name) return "익명";
    if (name.length <= 3) return name;
    return name.slice(0, 3) + "*".repeat(name.length - 3);
  };

  const renderSeats = () => {
    const rows = ["A", "B", "C", "D", "E"];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);

    return (
      <div className="seat-section">
        <div className="screen-header">SCREEN</div>

        <div className="seat-grid">
          {rows.map((row) =>
            cols.map((col) => {
              const seat = `${row}${col}`;
              const reserved = reservedSeats.includes(seat);
              const selected = selectedSeats.includes(seat);

              return (
                <button
                  key={seat}
                  className={`seat-btn ${
                    reserved ? "reserved" : selected ? "selected" : ""
                  }`}
                  disabled={reserved}
                  onClick={() => {
                    if (selectedSeats.includes(seat)) {
                      setSelectedSeats(selectedSeats.filter(s => s !== seat));
                    } else {
                      setSelectedSeats([...selectedSeats, seat]);
                    }
                  }}
                >
                  {seat}
                </button>
              );
            })
          )}
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#4caf50" }} />
            선택한 좌석
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#fff" }} />
            선택 가능
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "#ccc" }} />
            예매 완료
          </div>
        </div>
      </div>
    );
  };
  console.log("Review list data:", reviews);

  if (!movie) return <div>로딩 중...</div>;

  return (
    <>
      {/* 전체 화면 폭을 쓰는 상단 배너 */}
      <div
        className="movie-banner"
        style={{ backgroundImage: `url(${movie.poster_url})` }}
      >
        <div className="movie-banner-overlay"></div>

        <div className="movie-banner-content">
          <h2>{movie.title}</h2>
          <p>{movie.description}</p>
        </div>
      </div>

      {/* 줄거리 영역 */}
      <div className="movie-summary-section">
        <h3>📘 줄거리</h3>
        <p>{movie.summary || "줄거리 정보가 없습니다."}</p>
      </div>

      {/* 아래부터는 중앙 정렬된 내용 영역 */}
      <div className="movie-detail">

      <div className="movie-rating-summary">
        <div className="avg-stars">
          {"⭐".repeat(Math.round(avgRating))}
        </div>
        <span className="summary-score">{avgRating} / 5</span>
        <span className="summary-count">({reviews.length}개의 리뷰)</span>
      </div>

      <div className="section">
        <h3>📅 상영 날짜</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedScreenId("");
            setSelectedSeat("");
          }}
          min={new Date().toISOString().split("T")[0]}
          className="select-date"
        />
      </div>

      <div className="section">
        <h3>🎬 상영 시간</h3>

        {!selectedDate ? (
          <p style={{ color: "#888" }}>상영 날짜를 먼저 선택해주세요.</p>
        ) : filteredScreens.length === 0 ? (
          <p>해당 날짜에 상영 정보가 없습니다.</p>
        ) : (
          <select
            value={selectedScreenId}
            onChange={handleScreenChange}
            className="select-screen"
          >
            <option value="">상영 시간 선택</option>
            {filteredScreens.map((s) => (
              <option key={s.screen_id} value={s.screen_id}>
                {s.theater_name} / {new Date(s.start_time).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, })} ~ {new Date(s.end_time).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false, })}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="section">
        <h3>👥 인원수</h3>
        <select
          value={personCount}
          onChange={(e) => {
            setPersonCount(Number(e.target.value));
            setSelectedSeats([]); // 인원수가 바뀌면 선택 좌석 초기화
          }}
          className="select-person"
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n}명
            </option>
          ))}
        </select>
      </div>

      {selectedScreenId && (
        <div className="section">
          <h4>🎟 좌석 선택</h4>
          {renderSeats()}
          <button
            className={`reserve-btn ${selectedSeats.length !== personCount ? "disabled" : ""}`}
            disabled={selectedSeats.length !== personCount}
            onClick={handleGoToPayment}
          >
            결제하기
          </button>
        </div>
      )}

      <div className="rating-distribution">
        <h3>평점 분포</h3>

        {distribution.map((d) => {
          const maxCount = Math.max(...distribution.map((x) => x.count)); // 가장 많은 개수 기준
          const barWidth = maxCount ? (d.count / maxCount) * 100 : 0;

          return (
            <div className="rating-row" key={d.rating}>
              <div className="rating-label">{d.rating}점</div>

              <div className="rating-bar-container">
                <div
                  className="rating-bar"
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>

              <div className="rating-count">{d.count}개</div>
            </div>
          );
        })}
      </div>
      
      <div className="review-header">
        <h3> 리뷰 <span className="review-count">({reviews.length}개)</span></h3>
        
        <div style={{ marginBottom: "10px" }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="review-sort-select"
          >
            <option value="latest">최신순</option>
            <option value="rating_desc">평점 높은 순</option>
            <option value="rating_asc">평점 낮은 순</option>
          </select>
        </div>
      </div>

      <div className="avg-rating">
        ⭐ 평균 {avgRating}점 / 5점
      </div>
        
        {reviews.length === 0 ? (
          <p>아직 등록된 리뷰가 없습니다.</p>
        ) : (
          <ul className="review-list">
            {reviews.map((review) => {
              console.log("💬 리뷰 객체:", review);
              console.log("🆔 review_id:", review.review_id);
              console.log("Review → Reservation:", review.Reservation);


              return (
                <li key={review.review_id} className="review-card">
                  {/* 일반 모드 */}
                  {editMode !== review.review_id ? (
                    <>
                      <div className="review-header">
                        <strong>{maskUsername(review.Reservation?.User?.username)}</strong>
                        <span className="review-stars">
                          {"⭐".repeat(review.rating)}
                        </span>
                      </div>

                      <div className="review-comment">{review.comment}</div>

                      {review.Reservation?.user_id ===
                        JSON.parse(localStorage.getItem("user"))?.id && (
                        <div className="review-actions">
                          <button
                            className="edit-btn"
                            onClick={() => startEdit(review)}
                          >
                            수정
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(review.review_id)}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    /* 수정 모드 */
                    <div className="edit-mode">
                      <div className="edit-row">
                        <label>평점</label>
                        <select
                          className="edit-rating"
                          value={updatedRating}
                          onChange={(e) => setUpdatedRating(Number(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        className="edit-comment"
                        value={updatedComment}
                        onChange={(e) => setUpdatedComment(e.target.value)}
                        rows="3"
                      />

                      <div className="edit-actions">
                        <button
                          className="save-btn"
                          onClick={() => handleUpdate(review.review_id)}
                        >
                          저장
                        </button>
                        <button
                          className="md-cancel-btn"
                          onClick={() => setEditMode(null)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* 추천 영화 영역 */}
        <div className="recommend-section">
          <h3>🎥 추천 영화</h3>

          {recommended.length === 0 ? (
            <p>추천 영화가 없습니다.</p>
          ) : (
            <div className="recommend-carousel">
              {recommended.map((m, index) => {
                // 장르별 기본 포스터 매핑
                const genrePoster = {
                  로맨스: "/posters/romance.jpg",
                  액션: "/posters/action.jpg",
                  코미디: "/posters/comedy.jpg",
                  스릴러: "/posters/thriller.jpg",
                };

                const poster = m.poster_url || genrePoster[m.genre] || "/posters/default.jpg"; 

                return (
                  <div
                    key={m.movie_id}
                    className="recommend-card"
                    onClick={() => navigate(`/movies/${m.movie_id}`)}
                  >
                    <img
                      src={poster}
                      alt={m.title}
                      className="recommend-poster"
                    />
                    <div className="recommend-title">{m.title}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>  
    </>
  );
}

export default MovieDetail;