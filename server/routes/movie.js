import express from "express";
import sequelize from "../sequelize.js";
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import { verifyToken, adminOnly } from "../middleware/auth.js";
import { Op } from "sequelize";

const router = express.Router();

// 영화 등록 (관리자만)
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { title, genre, release_year, poster_url } = req.body;
    
    const movie = await Movie.create({ title, genre, release_year, poster_url });
    return res.status(201).json({ message: "영화 등록 성공", movie });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "영화 등록 실패" });
  }
});

// 영화 수정 (관리자만)
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "영화를 찾을 수 없습니다." });

    await movie.update(req.body);
    return res.json({ message: "영화 수정 성공", movie });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "영화 수정 실패" });
  }
});

// 영화 삭제 (관리자만)
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const movieId = req.params.id;

    // 1) 해당 영화의 스크린이 존재하는지 확인
    const hasScreen = await Screen.findOne({ where: { movie_id: movieId } });

    if (hasScreen) {
      return res.status(400).json({
        message: "이 영화는 상영 정보가 있어 삭제할 수 없습니다."
      });
    }

    // 2) 영화 존재 여부 확인
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "영화를 찾을 수 없습니다." });
    }

    // 3) 삭제
    await movie.destroy();
    return res.json({ message: "영화 삭제 성공" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "영화 삭제 실패" });
  }
});

// 장르 목록 조회 (중복 제거)
router.get("/genres", async (req, res) => {
  try {
    const genres = await Movie.aggregate("genre", "DISTINCT", {
      plain: false
    });

    // Sequelize는 [{ DISTINCT: "SF" }, ... ] 이런 구조로 줌 → 값만 꺼내기
    const genreList = genres.map((g) => g.DISTINCT);

    res.json(genreList);
  } catch (error) {
    console.error("장르 조회 오류:", error);
    res.status(500).json({ message: "장르 조회 실패" });
  }
});

// 장르별 영화 검색
router.get("/search", async (req, res) => {
  try {
    const { title, genre, year } = req.query;

    const where = {};

    if (title) where.title = { [Op.like]: `%${title}%` };
    if (genre) where.genre = genre;
    if (year) where.release_year = year;

    const movies = await Movie.findAll({ where });

    res.json(movies);
  } catch (error) {
    console.error("영화 검색 오류:", error);
    res.status(500).json({ message: "영화 검색 실패" });
  }
});

// 영화 목록 조회 API (평점 포함)
router.get("/", async (req, res) => {
  try {
    const movies = await sequelize.query(
      `
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.release_year,
        m.poster_url,
        m.summary,
        v.avg_rating,
        v.review_count
      FROM movies m
      LEFT JOIN movie_avg_rating v 
        ON m.movie_id = v.movie_id
      ORDER BY m.movie_id;
      `,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(movies);
  } catch (error) {
    console.error("❌ 영화 조회 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 영화 평균평점 View 조회
router.get("/avg-rating", async (req, res) => {
  try {
    const [rows] = await sequelize.query("SELECT * FROM movie_avg_rating");
    res.json(rows);
  } catch (error) {
    console.error("평균 평점 뷰 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 영화 상세 조회 API
router.get("/:id", async (req, res) => {
  try {
    const movieId = req.params.id;

    const [rows] = await sequelize.query(
      `
      SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.release_year,
        m.poster_url,
        m.summary,
        v.avg_rating,
        v.review_count
      FROM movies m
      LEFT JOIN movie_avg_rating v 
        ON m.movie_id = v.movie_id
      WHERE m.movie_id = ?
      `,
      { replacements: [movieId] }
    );

    if (!rows) {
      return res.status(404).json({ error: "영화를 찾을 수 없습니다." });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("영화 상세 조회 실패:", error);
    res.status(500).json({ error: "서버 오류" });
  }
});

// 추천 영화 조회 API
router.get("/:id/recommend", async (req, res) => {
  try {
    const movieId = req.params.id;

    // 현재 영화 조회
    const currentMovie = await Movie.findByPk(movieId);
    if (!currentMovie) {
      return res.status(404).json({ message: "영화를 찾을 수 없습니다." });
    }

    // 동일 장르 영화 3개 조회 (본인은 제외)
    const recommended = await Movie.findAll({
      where: {
        genre: currentMovie.genre,
        movie_id: { [Op.ne]: movieId }
      },
      order: [["release_year", "DESC"]], 
      limit: 3
    });

    return res.json(recommended);

  } catch (error) {
    console.error("추천 영화 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
