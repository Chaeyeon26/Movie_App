import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import MovieList from "./pages/MovieList";
import MovieDetail from "./pages/MovieDetail";
import ReviewForm from "./pages/ReviewForm";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPage from "./pages/MyPage";
import ReviewList from "./components/ReviewList";
import Header from "./components/Header";
import AdminMovies from "./pages/AdminMovies";
import AdminScreens from "./pages/AdminScreens";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import PaymentPage from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

// ⭐ [STEP 1] movies.js에서 getMovies API 함수 임포트
import { getMovies } from "./api/movies"; 

function App() {
  // 참고: 이 movies state는 현재 App.js 내부에서만 설정되고 사용되지 않지만,
  // 기존 코드 구조를 유지하기 위해 남겨둡니다.
  const [movies, setMovies] = useState([]); 
  const location = useLocation();

  useEffect(() => {
    // ------------------------------------------------------------------
    // ⭐ [STEP 2] fetch 대신 getMovies API 함수 사용
    const fetchInitialMovies = async () => {
        try {
            const data = await getMovies(); 
            setMovies(data);
        } catch (err) {
            console.error("데이터 불러오기 실패:", err);
        }
    };
    fetchInitialMovies();
    // ------------------------------------------------------------------
  }, []);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MovieList />} />
        <Route path="/movies/:id" element={<MovieDetail />} />
        <Route path="/review" element={<ReviewForm />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* 마이페이지 라우팅: 로그인 여부에 따라 MyPage 또는 Login 렌더링 */}
        <Route path="/mypage" element={localStorage.getItem("user") ? <MyPage /> : <Login />} />
        
        {/* 관리자 라우팅 (ProtectedAdminRoute 사용) */}
        <Route path="/admin/movies" element={<ProtectedAdminRoute> <AdminMovies /> </ProtectedAdminRoute>} />
        <Route path="/admin/screens" element={<ProtectedAdminRoute> <AdminScreens /> </ProtectedAdminRoute>} />
        
        {/* 참고: 기존 코드에서 ProtectedAdminRoute를 사용하지 않는 중복 라우팅은 제거했습니다. */}
        {/* <Route path="/admin/movies" element={<AdminMovies />} /> */}
        {/* <Route path="/admin/screens" element={<AdminScreens />} /> */}
        
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </>
  );
}

export default App;