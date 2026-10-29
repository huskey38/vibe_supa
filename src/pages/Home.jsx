import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import Card from '../components/Card.jsx'
import { HERO_IMAGE, SPOTS, FOODS } from '../data/content.js'

export default function Home() {
  const { user } = useAuth()
  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(rgba(6,60,110,.45), rgba(6,60,110,.65)), url(${HERO_IMAGE.url})` }}>
        <h1>푸른 바다, 검은 돌담,<br />노란 유채꽃의 섬</h1>
        <p>한라산부터 성산일출봉까지, 제주의 매력을 한곳에서 만나 보세요.</p>
        <div className="hero-cta">
          <a href="#spots" className="btn btn-primary">명소 둘러보기</a>
          {user ? (
            <Link to="/members" className="btn btn-light">회원 전용 페이지</Link>
          ) : (
            <Link to="/signup" className="btn btn-light">회원가입하고 시작하기</Link>
          )}
        </div>
      </section>

      <section id="spots" className="section">
        <h2>제주 명소</h2>
        <p className="lead">자연이 빚은 섬, 꼭 가봐야 할 여섯 곳.</p>
        <div className="grid">
          {SPOTS.map((s) => (
            <Card key={s.id} {...s} tone="stone" />
          ))}
        </div>
      </section>

      <section id="foods" className="section alt">
        <h2>제주 먹거리</h2>
        <p className="lead">바다와 땅이 키운 제주의 맛.</p>
        <div className="grid">
          {FOODS.map((f) => (
            <Card key={f.name} {...f} tone="sea" />
          ))}
        </div>
      </section>
    </>
  )
}
