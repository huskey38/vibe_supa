import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LANDMARKS } from '../data/landmarks.js'

const JEJU_CENTER = [126.55, 33.38]
const INITIAL_VIEW = { center: JEJU_CENTER, zoom: 9.4, pitch: 62, bearing: -18 }

// 위성사진(Esri) + 고도 타일(AWS Terrain Tiles, Terrarium 인코딩)로 키 없이 입체 지형을 만든다.
const MAP_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 18,
      attribution: '위성영상 © Esri, Maxar, Earthstar Geographics',
    },
    dem: {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 14,
      attribution: '지형 © Mapzen / AWS Terrain Tiles',
    },
  },
  layers: [
    { id: 'satellite', type: 'raster', source: 'satellite' },
    {
      id: 'hillshade',
      type: 'hillshade',
      source: 'dem',
      paint: { 'hillshade-exaggeration': 0.35, 'hillshade-shadow-color': '#0b2a3f' },
    },
  ],
  terrain: { source: 'dem', exaggeration: 1.7 },
}

// ---- 공공데이터 API 응답(컬럼명을 미리 알 수 없어 이름으로 추정) -------------------
const findKey = (row, re) => Object.keys(row).find((k) => re.test(k))

function rowToPlace(row, i) {
  const latKey = findKey(row, /위도|lat/i)
  const lngKey = findKey(row, /경도|lon|lng/i)
  const nameKey =
    findKey(row, /경관명|명칭|관광지명|장소명|^명$|name|title/i) ||
    Object.keys(row).find((k) => typeof row[k] === 'string' && row[k].trim())
  const name = nameKey ? String(row[nameKey]) : `항목 ${i + 1}`
  const lat = latKey ? parseFloat(row[latKey]) : NaN
  const lng = lngKey ? parseFloat(row[lngKey]) : NaN
  const inJeju = lat > 32.9 && lat < 34.2 && lng > 126.0 && lng < 127.1
  return { name, lngLat: inJeju ? [lng, lat] : null, row }
}

function buildPopup(place) {
  const box = document.createElement('div')
  box.className = 'popup'
  const h = document.createElement('strong')
  h.textContent = place.name
  box.appendChild(h)
  if (place.desc) {
    const p = document.createElement('p')
    p.textContent = place.desc
    box.appendChild(p)
  }
  if (place.row) {
    const dl = document.createElement('dl')
    Object.entries(place.row)
      .filter(([, v]) => v !== null && v !== '' && v !== undefined)
      .slice(0, 8)
      .forEach(([k, v]) => {
        const dt = document.createElement('dt')
        dt.textContent = k
        const dd = document.createElement('dd')
        dd.textContent = String(v)
        dl.append(dt, dd)
      })
    box.appendChild(dl)
  }
  return box
}

export default function Map3D() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const [places, setPlaces] = useState(LANDMARKS)
  const [apiState, setApiState] = useState('loading') // loading | ok | fail
  const [active, setActive] = useState(null)
  const [mapError, setMapError] = useState('')

  // 1) 공공데이터 불러오기 (실패해도 기본 경관 목록으로 계속 동작)
  useEffect(() => {
    let cancelled = false
    fetch('/api/landscape')
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        const rows = Array.isArray(json.data) ? json.data : []
        const fromApi = rows.map(rowToPlace)
        const merged = LANDMARKS.map((base) => {
          const hit = fromApi.find((p) => p.name.includes(base.name) || base.name.includes(p.name))
          return hit ? { ...base, row: hit.row } : base
        })
        // 좌표가 있는 API 항목은 새 지점으로 추가
        fromApi.forEach((p, i) => {
          const dup = merged.some((m) => m.name === p.name || (m.row && m.row === p.row))
          if (p.lngLat && !dup) merged.push({ id: `api-${i}`, name: p.name, lngLat: p.lngLat, row: p.row })
        })
        setPlaces(merged)
        setApiState('ok')
      })
      .catch(() => !cancelled && setApiState('fail'))
    return () => {
      cancelled = true
    }
  }, [])

  // 2) 지도 생성
  useEffect(() => {
    let map
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        ...INITIAL_VIEW,
        maxPitch: 80,
        minZoom: 8,
        maxZoom: 16,
        maxBounds: [[125.4, 32.6], [127.6, 34.1]],
      })
    } catch {
      setMapError('이 브라우저에서는 3D 지도(WebGL)를 사용할 수 없습니다.')
      return undefined
    }
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    map.addControl(new maplibregl.FullscreenControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    map.on('error', (e) => {
      if (e?.error?.message?.includes('WebGL')) setMapError('이 브라우저에서는 3D 지도(WebGL)를 사용할 수 없습니다.')
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, [])

  // 3) 마커 갱신
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}
    places.forEach((p) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'pin'
      el.setAttribute('aria-label', p.name)
      el.innerHTML = '<span></span>'
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        focusPlace(p)
      })
      const label = document.createElement('em')
      label.textContent = p.name
      el.appendChild(label)
      const popup = new maplibregl.Popup({ offset: 22, maxWidth: '280px' }).setDOMContent(buildPopup(p))
      popup.on('close', () => setActive((cur) => (cur === p.id ? null : cur)))
      markersRef.current[p.id] = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(p.lngLat)
        .setPopup(popup)
        .addTo(map)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places])

  function focusPlace(p) {
    const map = mapRef.current
    if (!map) return
    setActive(p.id)
    Object.values(markersRef.current).forEach((m) => m.getPopup().isOpen() && m.togglePopup())
    map.flyTo({ center: p.lngLat, zoom: 13.2, pitch: 68, bearing: map.getBearing() + 25, duration: 2400, essential: true })
    map.once('moveend', () => {
      const m = markersRef.current[p.id]
      if (m && !m.getPopup().isOpen()) m.togglePopup()
    })
  }

  function resetView() {
    Object.values(markersRef.current).forEach((m) => m.getPopup().isOpen() && m.togglePopup())
    setActive(null)
    mapRef.current?.flyTo({ ...INITIAL_VIEW, duration: 2000 })
  }

  return (
    <section className="map-page">
      <aside className="map-side">
        <h2>제주 3D 대표경관 지도</h2>
        <p className="map-help">
          마우스 <b>왼쪽 드래그</b> 이동 · <b>오른쪽 드래그</b>(또는 Ctrl+드래그) 회전·기울기 · <b>휠</b> 확대/축소.
          터치는 두 손가락으로 회전·확대합니다.
        </p>
        {apiState === 'ok' && <p className="notice ok">공공데이터 대표경관 정보를 불러왔습니다.</p>}
        {apiState === 'fail' && (
          <p className="notice">공공데이터 API에 연결하지 못해 기본 대표경관 {LANDMARKS.length}곳을 보여 드립니다.</p>
        )}
        <ul className="place-list">
          {places.map((p) => (
            <li key={p.id}>
              <button type="button" className={active === p.id ? 'on' : ''} onClick={() => focusPlace(p)}>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost" onClick={resetView}>제주 전체 보기</button>
      </aside>
      <div className="map-wrap">
        <div ref={containerRef} className="map-canvas" />
        {mapError && <p className="error map-error">{mapError}</p>}
      </div>
    </section>
  )
}
