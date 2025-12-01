import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const Movie = sequelize.define("Movie", {
  movie_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  genre: { type: DataTypes.STRING(50) },
  release_year: { type: DataTypes.INTEGER },
  avg_rating: { type: DataTypes.FLOAT, defaultValue: 0.0 }, 
  poster_url: { type: DataTypes.STRING },
  summary: { type: DataTypes.TEXT, allowNull: true }
}, {
  timestamps: false,
});

export default Movie;
