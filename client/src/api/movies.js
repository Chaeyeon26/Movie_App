import { api } from "./instance";

// 영화 상세
export const getMovieDetail = (id) => api.get(`/movies/${id}`);

// 특정 영화의 상영 목록
export const getScreensByMovie = (id) => api.get(`/screens/movie/${id}`);

// 추천 영화
export const getRecommendedMovies = (id) => api.get(`/movies/${id}/recommend`);

// MovieList 관련
// 전체 영화 목록 조회
export const getMovies = () => api.get("/movies");

// 장르 목록 불러오기
export const getMovieGenres = () => api.get("/movies/genres");

// 영화 검색
export const searchMoviesApi = (params) => {
  return api.get("/movies/search", { params });
};

// 관리자 API
// 영화 삭제
export const deleteMovie = (movieId, token) => {
  return api.delete(`/movies/${movieId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 영화 수정
export const updateMovie = (movieId, updatedMovie, token) => {
  return api.put(`/movies/${movieId}`, updatedMovie, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

// 영화 생성
export const createMovie = (newMovie, token) => {
  return api.post("/movies", newMovie, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};