import { Link } from 'react-router-dom'
import { useCart } from '../CartContext.jsx'
import { won } from './Shop.jsx'

// 이 페이지는 App.jsx 의 ProtectedRoute 로 보호된다.
export default function Cart() {
  const { items, total, loading, error, setQuantity, removeItem, clearCart } = useCart()

  return (
    <section className="section">
      <h2>🛒 장바구니</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {loading && items.length === 0 && <p>불러오는 중…</p>}

      {!loading && items.length === 0 && !error && (
        <p>장바구니가 비어 있습니다. <Link to="/shop">상점 둘러보기</Link></p>
      )}

      {items.length > 0 && (
        <>
          <ul className="cart-list">
            {items.map((it) => (
              <li key={it.id} className="cart-row">
                <div
                  className={`cart-thumb ${it.products?.image_url ? '' : 'fallback sea'}`}
                  style={it.products?.image_url ? { backgroundImage: `url(${it.products.image_url})` } : undefined}
                />
                <div className="cart-info">
                  <strong>{it.products?.name}</strong>
                  <span>{won(it.products?.price ?? 0)}</span>
                </div>
                <div className="qty">
                  <button type="button" aria-label="수량 감소" onClick={() => setQuantity(it.id, it.quantity - 1)}>−</button>
                  <span>{it.quantity}</span>
                  <button type="button" aria-label="수량 증가" onClick={() => setQuantity(it.id, it.quantity + 1)}>+</button>
                </div>
                <div className="line-total">{won(it.quantity * (it.products?.price ?? 0))}</div>
                <button type="button" className="btn btn-ghost" onClick={() => removeItem(it.id)}>삭제</button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <button type="button" className="btn btn-ghost" onClick={clearCart}>모두 비우기</button>
            <div className="cart-total">합계 <strong>{won(total)}</strong></div>
          </div>
          <p className="lead">※ 학습용 프로젝트라 결제 기능은 포함되어 있지 않습니다.</p>
        </>
      )}
    </section>
  )
}
