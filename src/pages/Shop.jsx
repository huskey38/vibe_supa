import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../AuthContext.jsx'
import { useCart, koreanDbError } from '../CartContext.jsx'

export const won = (n) => n.toLocaleString('ko-KR') + '원'

export default function Shop() {
  const { user } = useAuth()
  const { addToCart, error: cartError } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase 환경변수가 설정되지 않았습니다.')
      setLoading(false)
      return
    }
    supabase
      .from('products')
      .select('*')
      .order('id')
      .then(({ data, error: err }) => {
        if (err) setError(koreanDbError(err))
        else setProducts(data)
        setLoading(false)
      })
  }, [])

  async function handleAdd(id) {
    if (!user) {
      navigate('/login', { state: { from: location.pathname, needLogin: true } })
      return
    }
    const ok = await addToCart(id)
    if (ok) {
      setAdded(id)
      setTimeout(() => setAdded(null), 1200)
    }
  }

  return (
    <section className="section">
      <h2>제주 특산품 상점</h2>
      <p className="lead">마음에 드는 상품을 장바구니에 담아 보세요. (장바구니는 로그인 후 이용)</p>
      {loading && <p>불러오는 중…</p>}
      {(error || cartError) && <p className="error" role="alert">{error || cartError}</p>}
      <div className="grid">
        {products.map((p) => (
          <article className="card" key={p.id}>
            <div
              className={`card-img ${p.image_url ? '' : 'fallback sea'}`}
              style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined}
              role="img"
              aria-label={p.name}
            />
            <div className="card-body">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="price">{won(p.price)}</p>
              <button type="button" className="btn btn-primary" onClick={() => handleAdd(p.id)}>
                {added === p.id ? '담았어요 ✓' : '장바구니 담기'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
