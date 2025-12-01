import express from "express";
import Review from "../models/Review.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import Screen from "../models/Screen.js";
import Reservation from "../models/Reservation.js";
import sequelize from "../sequelize.js";

const router = express.Router();

// 공통 함수: 영화 평균 평점 갱신
async function updateMovieAvgRating(movieId) {
  const movieReviews = await Review.findAll({
    include: [
      {
        model: Reservation,
        include: [
          { model: Screen, where: { movie_id: movieId } }
        ]
      }
    ]
  });

  const avgRating =
    movieReviews.reduce((sum, r) => sum + r.rating, 0) / movieReviews.length;

  await Movie.update(
    { avg_rating: avgRating.toFixed(1) },
    { where: { movie_id: movieId } }
  );

  console.log(`🎬 평균 평점 갱신 완료: movie_id=${movieId}, avg=${avgRating.toFixed(1)}`);
}

// 리뷰 전체 조회 (영화별 + 정렬)
router.get("/movie/:movieId", async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const sort = req.query.sort || "latest";

    let order = [["created_at", "DESC"]];
    if (sort === "oldest") order = [["created_at", "ASC"]];
    if (sort === "rating_desc") order = [["rating", "DESC"]];
    if (sort === "rating_asc") order = [["rating", "ASC"]];

    const reviews = await Review.findAll({
      include: [
        {
          model: Reservation,
          required: true,  // 리뷰는 예약과 반드시 연결
          include: [
            {
              model: Screen,
              required: true, 
              where: { movie_id: movieId },
              include: [
                {
                  model: Movie,
                  required: false,
                }
              ],
            },
            {
              model: User,
              required: false,
              attributes: ["username"]
            },
          ],
        },
      ],
      order,
      subQuery: false,
    });

    res.json(reviews);
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});



// 리뷰 작성
router.post("/", async (req, res) => {
  try {
    const { reservation_id, rating, comment } = req.body;

    // 예약 정보 + Screen 포함
    const reservation = await Reservation.findByPk(reservation_id, {
      include: [{ model: Screen }],
    });

    if (!reservation)
      return res.status(400).json({ message: "존재하지 않는 예매입니다." });

    // 이미 리뷰 있는지 검사
    const exist = await Review.findOne({ where: { reservation_id } });
    if (exist)
      return res.status(400).json({ message: "이미 리뷰가 작성된 예매입니다." });

    // 상영 종료 후 리뷰 작성 검증 로직
    const now = new Date();
    const endTime = new Date(reservation.Screen.end_time);

    if (now < endTime) {
      return res.status(400).json({
        message: "상영이 종료된 후에만 리뷰를 작성할 수 있습니다.",
      });
    }

    // 🔥 리뷰 생성 (movie_id 추가!)
    const review = await Review.create({
      reservation_id,
      rating,
      comment,
      movie_id: reservation.Screen.movie_id
    });

    // 평균 평점 업데이트
    const movieId = reservation.Screen.movie_id;
    await updateMovieAvgRating(movieId);

    res.json({
      review,
      movieId: reservation.Screen.movie_id
    });
  } catch (error) {
    console.error("리뷰 등록 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 리뷰 삭제
router.delete("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId, {
      include: [
        {
          model: Reservation,
          include: [{ model: Screen }],
        },
      ],
    });

    if (!review)
      return res.status(404).json({ message: "리뷰가 존재하지 않습니다." });

    const movieId = review.Reservation.Screen.movie_id;

    await review.destroy();

    await updateMovieAvgRating(movieId);

    res.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

// 리뷰 수정
router.put("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(reviewId, {
      include: [
        {
          model: Reservation,
          include: [{ model: Screen }],
        },
      ],
    });

    if (!review)
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });

    review.rating = rating;
    review.comment = comment;
    await review.save();

    const movieId = review.Reservation.Screen.movie_id;
    await updateMovieAvgRating(movieId);

    res.json({ message: "리뷰 수정 완료", review });
  } catch (error) {
    console.error("리뷰 수정 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

/* 유저가 작성한 리뷰 조회
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.findAll({
      include: [
        {
          model: Reservation,
          where: { user_id: userId },
          include: [
            {
              model: Screen,
              include: [{ model: Movie, attributes: ["title"] }],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(reviews);
  } catch (error) {
    console.error("유저 리뷰 조회 실패:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});*/

// GET /reviews/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: Reservation,
          where: { user_id: req.params.userId },
          include: [
            {
              model: Screen,
              include: [ Movie ]
            }
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "리뷰 조회 오류" });
  }
});


// 평점 분포 조회 (1~5점 개수)
router.get("/movie/:movieId/distribution", async (req, res) => {
  try {
    const movieId = req.params.movieId;

    // 1) 해당 영화의 reservation_id들만 가져오기
    const reservations = await Reservation.findAll({
      include: [
        {
          model: Screen,
          where: { movie_id: movieId },
          attributes: []
        }
      ],
      attributes: ["reservation_id"],
      raw: true
    });

    const reservationIds = reservations.map(r => r.reservation_id);

    if (reservationIds.length === 0) {
      return res.json([
        { rating: 1, count: 0 },
        { rating: 2, count: 0 },
        { rating: 3, count: 0 },
        { rating: 4, count: 0 },
        { rating: 5, count: 0 }
      ]);
    }

    // 2) Review 테이블에서 그룹화해서 평점 분포 가져오기
    const distribution = await Review.findAll({
      where: { reservation_id: reservationIds },
      attributes: [
        "rating",
        [sequelize.fn("COUNT", sequelize.col("rating")), "count"]
      ],
      group: ["rating"],
      order: [["rating", "ASC"]],
      raw: true
    });

    // 3) 1~5점 모두 채워서 반환
    const normalized = [1,2,3,4,5].map(r => {
      const found = distribution.find(d => d.rating == r);
      return {
        rating: r,
        count: found ? Number(found.count) : 0
      };
    });

    res.json(normalized);

  } catch (error) {
    console.error("평점 분포 조회 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
