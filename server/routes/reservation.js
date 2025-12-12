import express from "express";
import Reservation from "../models/Reservation.js";
import Movie from "../models/Movie.js";
import Screen from "../models/Screen.js";
import { Op } from "sequelize";

const router = express.Router();

// 예매 등록
router.post("/", async (req, res) => {
  try {
    const { user_id, screen_id, seat_number } = req.body;

    console.log("예매 요청:", req.body);

    // 1) 상영정보 조회
    const screen = await Screen.findByPk(screen_id);
    if (!screen) {
      return res.status(404).json({ message: "상영 정보를 찾을 수 없습니다." });
    }

    const now = new Date();
    const startTime = new Date(screen.start_time);

    // 2) 상영 시작 이후에는 예매 불가
    if (now > startTime) {
      return res.status(400).json({
        message: "상영이 이미 시작된 이후에는 예매할 수 없습니다.",
      });
    }

    // 3) 좌석 중복 확인
    const existing = await Reservation.findOne({
      where: { screen_id, seat_number }
    });

    if (existing) {
      if (existing.status === "cancelled") {
        await existing.update({ 
          status: "reserved",
          user_id
        });

        return res.json({
          message: "취소된 좌석을 다시 예매했습니다.",
          reservation: existing
        });
      }

      return res.status(400).json({ message: "이미 예매된 좌석입니다." });
    }

    // 4) 예매 생성
    const reservation = await Reservation.create({
      user_id,
      screen_id,
      seat_number,
    });

    res.json({ message: "예매 완료!", reservation });

  } catch (error) {
    console.error("예매 오류:", error);
    res.status(500).json({
      message: "예매 실패",
      error: error.message,
    });
  }
});

// 여러 좌석 예매
router.post("/multi", async (req, res) => {
  try {
    const { user_id, screen_id, seat_numbers } = req.body; // 배열

    // 0) seat_numbers 검증
    if (!Array.isArray(seat_numbers) || seat_numbers.length === 0) {
      return res.status(400).json({ message: "좌석이 선택되지 않았습니다." });
    }

    // 1) 상영정보 조회
    const screen = await Screen.findByPk(screen_id);
    if (!screen) {
      return res.status(404).json({ message: "상영 정보를 찾을 수 없습니다." });
    }

    const now = new Date();
    const startTime = new Date(screen.start_time);

    // 2) 상영 시작 이후 예매 금지
    if (now > startTime) {
      return res.status(400).json({
        message: "상영이 이미 시작된 이후에는 예매할 수 없습니다.",
      });
    }

    /* 3) 각 좌석 중복 체크
    const revived = [];
    const toInsert = []; 

    for (const seat of seat_numbers) {
      const exists = await Reservation.findOne({
        where: { screen_id, seat_number: seat }
      });

      if (exists) {
        if (exists.status === "cancelled") {
          await exists.update({
            status: "reserved",
            user_id
          });
          revived.push(exists);
          continue; 
        }

        return res.status(400).json({ message: `이미 예매된 좌석: ${seat}` });
      }

      toInsert.push(seat);
    }

    // 4) 좌석 여러 개 생성
    const created = [];

    for (const seat of toInsert) {
      const r = await Reservation.create({
        user_id,
        screen_id,
        seat_number,
      });
      created.push(r);
    }*/
   const reservations = await Reservation.findAll({
      where: { 
        screen_id,
        status: "reserved",
      },
    });

    for (const r of reservations) {
      const reservedSeats = r.seat_number.split(","); // "A1,A2" → ["A1", "A2"]

      for (const seat of seat_numbers) {
        if (reservedSeats.includes(seat)) {
          return res.status(400).json({
            message: `${seat} 좌석은 이미 예매되었습니다.`,
          });
        }
      }
    }

    // 3) 예매 1건만 생성
    const seat_number = seat_numbers.join(","); // "A1,A2,A3"

    const reservation = await Reservation.create({
      user_id,
      screen_id,
      seat_number, // 그대로 사용
    });


    return res.json({
      message: "좌석 예매 완료",
      /*revived,
      created,*/
      reservation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "예매 실패" });
  }
});

// 사용자별 예매 내역 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, date } = req.query;

    const where = {
      user_id: userId,
      status: "reserved", 
    };

    // Screen 날짜 필터링
    let screenFilter = {};
    if (date) {
      const start = new Date(`${date} 00:00:00`);
      const end = new Date(`${date} 23:59:59`);
      screenFilter.start_time = { [Op.between]: [start, end] };
    }


    // Movie 제목 필터링
    let movieFilter = {};
    if (title) {
      movieFilter.title = { [Op.like]: `%${title}%` };
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        {
          model: Screen,
          required: Object.keys(screenFilter).length > 0,
          ...(Object.keys(screenFilter).length > 0 && { where: screenFilter }),
          include: [
            {
              model: Movie,
              required: Object.keys(movieFilter).length > 0,
              ...(Object.keys(movieFilter).length > 0 && { where: movieFilter }),
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]],
    });

    // null 제거
    const result = reservations.filter(
      r => r.Screen && r.Screen.Movie
    );

    res.json(result);
  } catch (error) {
    console.error("예매내역 조회 실패:", error);
    res.status(500).json({ message: "예매내역 조회 실패" });
  }
});

// 예매 취소 (상영 시작 후 취소 불가)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1) 예약 정보 조회
    const reservation = await Reservation.findOne({
      where: { reservation_id: id },
      include: [
        {
          model: Screen,
          attributes: ["screen_id", "start_time"],
        },
      ],
    });

    console.log("=== DEBUG LOG ===");
    console.log("reservation:", reservation);
    console.log("Screen:", reservation?.Screen);

    if (!reservation) {
      return res.status(404).json({ message: "예매를 찾을 수 없습니다." });
    }
    
    // 2) 상영 시작 시간 확인
    const startTime = new Date(reservation.Screen.start_time);
    const now = new Date();

    // 상영 시작 30분 전 경계
    const cancelLimit = new Date(startTime.getTime() - 30 * 60 * 1000);

    // 3) 시간이 이미 지남 → 취소 불가
    if (now > cancelLimit) {
      return res.status(400).json({
        message: "상영이 이미 시작된 예매는 취소할 수 없습니다.",
      });
    }

    await Reservation.update(
      { status: "cancelled" }, 
      { where: { reservation_id: id } }
    );

    res.json({ message: "예매가 정상적으로 취소되었습니다." });
  } catch (error) {
    console.error("예매 취소 오류:", error);
    res.status(500).json({ message: "예매 취소 실패" });
  }
});

// 특정 상영관(screen_id)의 예매 좌석 조회
router.get("/screen/:screenId", async (req, res) => {
  try {
    const { screenId } = req.params;
    const reservations = await Reservation.findAll({
      where: { 
        screen_id: screenId,
        status: "reserved", 
      },
      attributes: ["seat_number"],
    });
    res.json(reservations);
  } catch (error) {
    console.error("좌석 조회 오류:", error);
    res.status(500).json({ message: "좌석 정보를 불러오지 못했습니다." });
  }
});

export default router;
