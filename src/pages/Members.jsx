import { useAuth } from '../AuthContext.jsx'

const TIPS = [
  '성산일출봉 일출은 겨울이 가장 선명해요. 입장은 일출 1시간 전부터 가능합니다.',
  '유채꽃은 3월 말~4월 중순이 절정입니다.',
  '한라산 정상(백록담) 등반은 사전 탐방 예약이 필요합니다.',
]

function fmt(iso) {
  return iso ? new Date(iso).toLocaleString('ko-KR') : '-'
}

// 이 페이지는 App.jsx 의 ProtectedRoute 로 보호된다 (로그인한 사용자만 접근).
export default function Members() {
  const { user } = useAuth()
  const nickname = user.user_metadata?.nickname || user.email.split('@')[0]

  return (
    <section className="section members">
      <h2>🌴 {nickname}님, 환영합니다</h2>
      <div className="profile">
        <dl>
          <dt>이메일</dt><dd>{user.email}</dd>
          <dt>닉네임</dt><dd>{nickname}</dd>
          <dt>가입일</dt><dd>{fmt(user.created_at)}</dd>
          <dt>마지막 로그인</dt><dd>{fmt(user.last_sign_in_at)}</dd>
        </dl>
      </div>
      <h3>회원 전용 여행 팁</h3>
      <ul className="tips">
        {TIPS.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  )
}
