import User from "./User.js";
import Review from "./Review.js";
import Movie from "./Movie.js";
import Screen from "./Screen.js";
import Reservation from "./Reservation.js";

// ⭐ Movie - Screen
Movie.hasMany(Screen, { foreignKey: "movie_id" });
Screen.belongsTo(Movie, { foreignKey: "movie_id" });

// ⭐ Screen - Reservation
Screen.hasMany(Reservation, { foreignKey: "screen_id" });
Reservation.belongsTo(Screen, { foreignKey: "screen_id" });

// ⭐ User - Reservation
User.hasMany(Reservation, { foreignKey: "user_id" });
Reservation.belongsTo(User, { foreignKey: "user_id" });

// Review - Reservation
Review.belongsTo(Reservation, { foreignKey: "reservation_id" });
Reservation.hasOne(Review, { foreignKey: "reservation_id" });

export { User, Review, Movie, Screen, Reservation };
