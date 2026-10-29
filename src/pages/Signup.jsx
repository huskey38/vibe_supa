import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { isSupabaseConfigured } from '../supabaseClient.js'
import { koreanAuthError } from '../authErrors.js'

export default function Signup() {
  const { user, signUp } = useAuth()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/members" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured) {
      setError('Supabase 환경변수가 설정되지 않았습니다. README 를 확인해 주세요.')
      return
    }
    if (password.length < 6) return setError('비밀번호는 6자 이상이어야 합니다.')
    if (password !== confirm) return setError('비밀번호 확인이 일치하지 않습니다.')

    setBusy(true)
    const { data, error: err } = await signUp(email.trim(), password, nickname.trim())
    setBusy(false)
    if (err) return setError(koreanAuthError(err))
    // 이메일 확인이 꺼져 있으면 세션이 바로 생기고(App 이 /members 로 이동),
    // 켜져 있으면 세션이 없으므로 안내 문구를 보여 준다.
    if (!data.session) setDone(true)
  }

  if (done) {
    return (
      <section className="auth">
        <div className="auth-box">
          <h2>메일을 확인해 주세요 ✉️</h2>
          <p><strong>{email}</strong> 로 인증 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.</p>
          <Link to="/login" className="btn btn-primary">로그인으로 이동</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="auth">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>회원가입</h2>
        {!isSupabaseConfigured && <p className="error">Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.</p>}
        <label>
          닉네임
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} required maxLength={20} autoComplete="nickname" />
        </label>
        <label>
          이메일
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          비밀번호 (6자 이상)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        <label>
          비밀번호 확인
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={busy}>{busy ? '가입 중…' : '가입하기'}</button>
        <p className="alt-link">이미 계정이 있나요? <Link to="/login">로그인</Link></p>
      </form>
    </section>
  )
}
