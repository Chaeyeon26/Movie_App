import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user", // 기본 일반 사용자
    },
  }, {
    tableName: "users",
    timestamps: false,
  }
);

export default User;
