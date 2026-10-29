// Vercel 서버리스 함수: 공공데이터포털(odcloud) 대표경관 API 프록시.
// 인증키는 서버 환경변수 DATA_GO_KR_KEY 에만 두고 브라우저에는 절대 노출하지 않는다. (VITE_ 접두사 금지)
const DATASET = '/api/15125100/v1/uddi:32a1b877-af20-4505-a76a-fd389ebd30ca'

export default async function handler(req, res) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) {
    res.status(500).json({ error: 'DATA_GO_KR_KEY 환경변수가 설정되지 않았습니다.' })
    return
  }
  // Encoding/Decoding 키 어느 쪽을 넣어도 한 번만 인코딩되도록 정규화
  let safeKey
  try {
    safeKey = encodeURIComponent(decodeURIComponent(key))
  } catch {
    safeKey = encodeURIComponent(key)
  }
  const url = `https://api.odcloud.kr${DATASET}?page=1&perPage=100&returnType=JSON&serviceKey=${safeKey}`
  try {
    const r = await fetch(url)
    const text = await r.text()
    res.status(r.status).setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.send(text)
  } catch {
    res.status(502).json({ error: '공공데이터 서버에 연결하지 못했습니다.' })
  }
}
