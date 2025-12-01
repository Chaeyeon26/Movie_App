import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// 회원가입
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 이미 존재하는 사용자 검사
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "이미 존재하는 사용자입니다." });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 새 사용자 생성
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "회원가입 성공", user: newUser });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "회원가입 실패" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(400).json({ message: "존재하지 않는 사용자입니다." });
    }

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 토큰 발급 (role 추가)
    const token = jwt.sign(
      {
        id: user.user_id,
        username: user.username,
        role: user.role, 
      },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "로그인 성공",
      token,
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "로그인 실패" });
  }
});


export default router;
