import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";
import User from "./User.js";
import Screen from "./Screen.js";

const Reservation = sequelize.define(
  "Reservation",
  {
    reservation_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    screen_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Screen,
        key: "screen_id",
      },
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("reserved", "cancelled"),
      defaultValue: "reserved",
    },
  },
  {
    tableName: "reservations",
    timestamps: true,        // created_at 자동 생성
    createdAt: "created_at", // 필드명 지정
    updatedAt: false,        // updated_at 생성 X
    underscored: true, // DB 컬럼명 user_id, movie_id 형태로 자동 매핑
    /*indexes: [
      {
        unique: true,
        fields: ["screen_id", "seat_number"], // 같은 상영 내 좌석 중복 방지
      },
    ],*/
  }
);

export default Reservation;
