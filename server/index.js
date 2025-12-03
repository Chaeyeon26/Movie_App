import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./sequelize.js";
import "./models/index.js";

// 모델 등록
import "./models/User.js";
import "./models/Movie.js";
import "./models/Screen.js";
import "./models/Reservation.js";
import "./models/Review.js";

// 라우터 import
import movieRouter from "./routes/movie.js";
import reviewRouter from "./routes/review.js";
import userRouter from "./routes/user.js";
import reservationRouter from "./routes/reservation.js";
import screenRouter from "./routes/screen.js";

// 초기 영화 데이터 추가 (없을 때만)
import Movie from "./models/Movie.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 라우터 등록
app.use("/movies", movieRouter);
app.use("/reviews", reviewRouter);
app.use("/users", userRouter);
app.use("/reservations", reservationRouter);
app.use("/screens", screenRouter);

// 기본 라우트
app.get("/", (req, res) => {
  res.send("🎬 영화 예매/리뷰 시스템 서버 작동 중!");
});

// DB 연결 및 테이블 생성
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL DB 연결 성공!");
    await sequelize.sync();

    async function initDatabase() {
      try {
        // DB 연결 확인
        await sequelize.authenticate();
        console.log("DB 연결 성공!");

        // 테이블 싱크
        await sequelize.sync({ alter: false });

        // 뷰 자동 생성
        await sequelize.query(`
          CREATE OR REPLACE VIEW movie_avg_rating AS
          SELECT 
              s.movie_id,
              AVG(r.rating) AS avg_rating,
              COUNT(*) AS review_count
          FROM reviews r
          JOIN reservations res ON r.reservation_id = res.reservation_id
          JOIN screens s ON res.screen_id = s.screen_id
          GROUP BY s.movie_id;
        `);

        console.log("movie_avg_rating 뷰 자동 생성 완료!");

      } catch (error) {
        console.error("❌ DB 초기화 오류:", error);
      }
    }

    initDatabase();

    (async () => {
      try {
        await sequelize.authenticate();
        console.log("✅ MySQL DB 연결 성공!");
        await sequelize.sync();
        console.log("✅ 모든 테이블 동기화 완료!");

        // ✅ 영화 더미데이터 추가
        const movieCount = await Movie.count();
        if (movieCount === 0) {
          await Movie.bulkCreate([
            { title: "Inception", genre: "SF", release_year: 2010, avg_rating: 4.8 },
            { title: "Interstellar", genre: "SF", release_year: 2014, avg_rating: 4.7 },
            { title: "Parasite", genre: "Thriller", release_year: 2019, avg_rating: 4.6 },
            { title: "Your Name", genre: "Animation", release_year: 2016, avg_rating: 4.5 },
          ]);
          console.log("🎬 기본 영화 데이터 등록 완료!");
        }
      } catch (error) {
        console.error("❌ DB 연결 실패:", error);
      }
    })();
    console.log("✅ 모든 테이블 동기화 완료!");
  } catch (error) {
    console.error("❌ DB 연결 실패:", error);
  }
})();

app.listen(process.env.PORT || 4000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 4000}`);
});
