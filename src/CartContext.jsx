import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

function koreanDbError(error) {
  if (!error) return ''
  const code = error.code || ''
  const msg = (error.message || '').toLowerCase()
  if (code === '42P01' || code === 'PGRST205' || msg.includes('could not find the table'))
    return '데이터베이스 테이블이 없습니다. supabase/schema.sql 을 SQL Editor 에서 실행해 주세요.'
  if (code === '42501' || msg.includes('row-level security'))
    return '권한이 없습니다. 다시 로그인해 주세요.'
  if (msg.includes('failed to fetch') || msg.includes('network'))
    return '네트워크 오류가 발생했습니다. 연결을 확인해 주세요.'
  return '장바구니 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!supabase || !user) {
      setItems([])
      return
    }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('cart_items')
      .select('id, quantity, product_id, products(id, name, price, image_url)')
      .order('created_at', { ascending: true })
    setLoading(false)
    if (err) {
      setError(koreanDbError(err))
      return
    }
    setError('')
    setItems(data)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  async function addToCart(productId) {
    setError('')
    const existing = items.find((i) => i.product_id === productId)
    const { error: err } = existing
      ? await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
      : await supabase.from('cart_items').insert({ product_id: productId, quantity: 1 })
    if (err) {
      setError(koreanDbError(err))
      return false
    }
    await load()
    return true
  }

  async function setQuantity(itemId, quantity) {
    if (quantity < 1) return removeItem(itemId)
    setError('')
    const { error: err } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId)
    if (err) setError(koreanDbError(err))
    else await load()
  }

  async function removeItem(itemId) {
    setError('')
    const { error: err } = await supabase.from('cart_items').delete().eq('id', itemId)
    if (err) setError(koreanDbError(err))
    else await load()
  }

  async function clearCart() {
    setError('')
    const { error: err } = await supabase.from('cart_items').delete().gt('id', 0)
    if (err) setError(koreanDbError(err))
    else await load()
  }

  const count = items.reduce((n, i) => n + i.quantity, 0)
  const total = items.reduce((n, i) => n + i.quantity * (i.products?.price ?? 0), 0)

  const value = { items, count, total, loading, error, setError, addToCart, setQuantity, removeItem, clearCart, koreanDbError }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
export { koreanDbError }
