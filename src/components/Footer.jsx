import { CREDITS } from '../data/content.js'

export default function Footer() {
  return (
    <footer className="footer">
      <p>© 제주 바라기 · 제주도 여행 소개 사이트 (학습용 프로젝트)</p>
      <p className="credits">
        이미지 출처:{' '}
        <a href="https://pixabay.com" target="_blank" rel="noreferrer">Pixabay</a>
        {' '}(Pixabay Content License)
      </p>
      <details className="credit-list">
        <summary>사진별 출처 보기</summary>
        <ul>
          {CREDITS.map((c) => (
            <li key={c.page}>
              {c.label} – <a href={c.page} target="_blank" rel="noreferrer">Pixabay</a>
            </li>
          ))}
        </ul>
      </details>
    </footer>
  )
}
