import express from "express";
import Screen from "../models/Screen.js";
import Movie from "../models/Movie.js";
import Reservation from "../models/Reservation.js";
import { verifyToken, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// 상영 정보 추가 (관리자만)
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { movie_id, theater_name, start_time, end_time } = req.body;

    // 1) 영화 존재 확인
    const movie = await Movie.findByPk(movie_id);
    if (!movie) {
      return res.status(404).json({ message: "해당 영화가 존재하지 않습니다." });
    }

    // 2) 상영 등록
    const screen = await Screen.create({
      movie_id,
      theater_name,
      start_time,
      end_time,
    });

    res.status(201).json({
      message: "상영 정보 등록 성공",
      screen,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "상영 정보 등록 실패" });
  }
});

// 상영 정보 수정 (관리자만)
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const screenId = req.params.id;

    // 1) 상영정보 존재 확인
    const screen = await Screen.findByPk(screenId);
    if (!screen) {
      return res.status(404).json({ message: "상영 정보를 찾을 수 없습니다." });
    }

    // 2) 수정 처리
    await screen.update(req.body);

    res.json({
      message: "상영 정보 수정 성공",
      screen,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "상영 정보 수정 실패" });
  }
});

// 상영 정보 삭제 (관리자만)
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const screenId = req.params.id;

    // 1) 상영 정보 존재 확인
    const screen = await Screen.findByPk(screenId);
    if (!screen) {
      return res.status(404).json({ message: "상영 정보를 찾을 수 없습니다." });
    }

    // 2) 예매 존재 여부 확인
    const reservation = await Reservation.findOne({
      where: { screen_id: screenId }
    });

    if (reservation) {
      return res.status(400).json({
        message: "이 상영 정보에 예매가 존재하여 삭제할 수 없습니다."
      });
    }

    // 3. 삭제 수행
    await screen.destroy();

    res.json({ message: "상영 정보 삭제 성공" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "상영 정보 삭제 실패" });
  }
});

// 전체 상영 정보 조회
router.get("/", async (req, res) => {
  try {
    const screens = await Screen.findAll();
    res.json(screens);
  } catch (err) {
    console.error("상영 정보 조회 실패:", err);
    res.status(500).json({ message: "상영 정보 조회 실패" });
  }
});

// 영화별 상영 정보 조회
router.get("/movie/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;

    // 1) 영화 존재 확인 (선택사항)
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: "영화를 찾을 수 없습니다." });
    }

    // 2) 상영정보 조회 (정렬 추가)
    const screens = await Screen.findAll({
      where: { movie_id: movieId },
      order: [["start_time", "ASC"]],
    });

    res.json(screens);

  } catch (err) {
    console.error("상영정보 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});


export default router;
