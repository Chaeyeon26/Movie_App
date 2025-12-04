import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./sequelize.js";
import "./models/index.js";

import movieRouter from "./routes/movie.js";
import reviewRouter from "./routes/review.js";
import userRouter from "./routes/user.js";
import reservationRouter from "./routes/reservation.js";
import screenRouter from "./routes/screen.js";

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

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB 연결 성공!");

    await sequelize.sync();
    console.log("테이블 동기화 완료!");

    // VIEW 생성
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
    console.log("VIEW 생성 완료!");

  } catch (error) {
    console.error("DB 초기화 실패:", error);
  }
})();

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});
