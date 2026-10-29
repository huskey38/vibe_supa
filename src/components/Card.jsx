// 이미지가 없으면(null) 푸른 그라데이션 배경으로 대체한다.
export default function Card({ name, desc, image, tone }) {
  return (
    <article className="card">
      <div
        className={`card-img ${image ? '' : 'fallback ' + (tone || '')}`}
        style={image ? { backgroundImage: `url(${image})` } : undefined}
        role="img"
        aria-label={name}
      />
      <div className="card-body">
        <h3>{name}</h3>
        <p>{desc}</p>
      </div>
    </article>
  )
}
