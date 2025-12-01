export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    headers: defaultHeaders,
    ...options,
  });

  // 토큰 만료 또는 인증 실패 감지
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("세션이 만료되어 로그아웃됩니다.");
    window.location.href = "/login";
    return; // 더 진행할 필요 없음
  }

  return res;
}