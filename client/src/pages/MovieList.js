import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MovieList.css";
import { getMovies, getMovieGenres, searchMoviesApi } from "../api/movies";

function MovieList() {
  const [movies, setMovies] = useState([]);

  // 검색 입력값
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");

  // 장르 불러오기
  const [genreList, setGenreList] = useState([]);

  // 기본 영화 리스트 불러오기
  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        console.error("영화 목록 불러오기 실패:", err);
      }
    };
    fetchAllMovies();
  }, []);

  // 장르 목록 불러오기
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getMovieGenres();
        setGenreList(data);
      } catch (err) {
        console.error("장르 불러오기 실패:", err);
      }
    };
    fetchGenres();
  }, []);

  // 검색 함수
  const searchMovies = async () => {
    const params = {};

    // 빈 값이 아닌 경우에만 파라미터 객체에 추가
    if (title) params.title = title;
    if (genre) params.genre = genre;
    if (year) params.year = year;

    try {
      const data = await searchMoviesApi(params);
      setMovies(data);
    } catch (err) {
      console.error("영화 검색 실패:", err);
      setMovies([]);
    }
  };

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

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
      <h1>🎬 영화 목록</h1>

      {/* 검색 UI */}
      <div className="movie-search-container">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 검색"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="">장르 전체</option>

          {genreList.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="개봉연도"
        style={{ width: "100px" }}
        />

        <button className="movie-search-button" onClick={searchMovies}>
          검색
        </button>
      </div>

      {/* 영화 카드 그리드 */}
      <div className="movie-grid">
        {movies.map((movie) => (
          <div
            key={movie.movie_id}
            className="movie-card"
          >
            <Link
              to={`/movies/${movie.movie_id}`}
              className="movie-card-link"
            >
              <img
                src={getPosterUrl(movie.poster_url, movie.genre)} 
                alt={movie.title}
                className="movie-poster"
              />

              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-sub">
                  {movie.genre} · {movie.release_year}
                </p>
                <p className="movie-rating">
                  평점:{" "}
                  {movie.avg_rating == null
                    ? "리뷰 없음"
                    : Number(movie.avg_rating).toFixed(2)}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieList;