import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { isSupabaseConfigured } from '../supabaseClient.js'
import { koreanAuthError } from '../authErrors.js'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/members'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured) {
      setError('Supabase 환경변수가 설정되지 않았습니다. README 를 확인해 주세요.')
      return
    }
    setBusy(true)
    const { error: err } = await signIn(email.trim(), password)
    setBusy(false)
    if (err) setError(koreanAuthError(err))
    else navigate(from, { replace: true })
  }

  return (
    <section className="auth">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>로그인</h2>
        {location.state?.needLogin && <p className="notice">회원 전용 페이지입니다. 먼저 로그인해 주세요.</p>}
        {!isSupabaseConfigured && <p className="error">Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.</p>}
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          비밀번호
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? '로그인 중…' : '로그인'}</button>
        <p className="alt-link">아직 계정이 없나요? <Link to="/signup">회원가입</Link></p>
      </form>
    </section>
  )
}
