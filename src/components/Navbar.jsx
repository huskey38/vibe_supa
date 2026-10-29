import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="nav">
      <Link to="/" className="brand">🌊 제주 바라기</Link>
      <nav className="nav-links">
        <a href="/#spots">명소</a>
        <a href="/#foods">먹거리</a>
        {user ? (
          <>
            <NavLink to="/members">내 프로필</NavLink>
            <button type="button" className="btn btn-ghost" onClick={handleSignOut}>로그아웃</button>
          </>
        ) : (
          <>
            <NavLink to="/login">로그인</NavLink>
            <Link to="/signup" className="btn btn-primary">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  )
}
