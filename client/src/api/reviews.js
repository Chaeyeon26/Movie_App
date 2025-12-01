import { api } from "./instance";

// 특정 영화의 리뷰 목록 조회
export const getReviewsByMovie = (movieId, sort = "latest") =>
  api.get(`/reviews/movie/${movieId}`, { params: { sort } });

// 리뷰 평점 분포 조회
export const getReviewDistribution = (movieId) =>
  api.get(`/reviews/movie/${movieId}/distribution`);

// 리뷰 수정
export const updateReview = (reviewId, data) =>
  api.put(`/reviews/${reviewId}`, data);

// 리뷰 삭제
export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`);

// 사용자 작성 리뷰 조회 
export const getUserReviews = (userId) => {
  return api.get(`/reviews/user/${userId}`);
};

// 리뷰 생성 (ReviewForm)
export const createReview = (reservationId, rating, comment) => {
  return api.post("/reviews", {
    reservation_id: reservationId,
    rating,
    comment,
  });
};

// 전체 리뷰 목록 조회 (ReviewList)
export const getAllReviews = () => {
  return api.get("/reviews");
};