// 이미지는 Pixabay 페이지(pixabay.com/photos/...)에서 직접 확인한 cdn.pixabay.com 주소만 사용합니다.
// `image` 가 null 이면 그라데이션 배경으로 대체됩니다. (돌담 등 확인된 이미지가 없는 항목)
const cdn = 'https://cdn.pixabay.com/photo/'

export const HERO_IMAGE = {
  url: cdn + '2016/02/11/08/48/jeju-island-1193280_640.jpg',
  page: 'https://pixabay.com/photos/jeju-island-landscape-ocean-jeju-1193280/',
}

export const SPOTS = [
  {
    id: 'hallasan',
    name: '한라산',
    desc: '해발 1,947m, 대한민국에서 가장 높은 산. 사계절 다른 얼굴로 여행자를 맞이합니다.',
    image: cdn + '2020/03/13/00/16/halla-4926473_640.jpg',
    page: 'https://pixabay.com/photos/mt-hanlla-winter-snow-scene-4926473/',
  },
  {
    id: 'seongsan',
    name: '성산일출봉',
    desc: '바다 위로 솟은 분화구. 새벽 해돋이를 보러 오르는 제주 대표 명소입니다.',
    image: cdn + '2019/06/11/07/36/shiroyama-hiji-peak-4266254_640.jpg',
    page: 'https://pixabay.com/photos/seongsan-sunrise-peak-ocean-island-4266254/',
  },
  {
    id: 'canola',
    name: '유채꽃',
    desc: '봄이면 노란 물결이 일렁이는 제주의 들판. 푸른 바다와 어우러진 풍경이 일품입니다.',
    image: cdn + '2018/05/19/19/17/jeju-island-3414079_640.jpg',
    page: 'https://pixabay.com/photos/jeju-island-rape-flowers-3414079/',
  },
  {
    id: 'stonewall',
    name: '돌담',
    desc: '바람 많은 섬이 만든 검은 현무암 돌담. 틈새로 바람이 지나가도 무너지지 않습니다.',
    image: null,
    page: null,
  },
  {
    id: 'jusangjeolli',
    name: '주상절리',
    desc: '용암이 식으며 만든 육각 기둥 절벽. 파도가 부서지는 해안 절경입니다.',
    image: cdn + '2020/02/01/16/42/jusangjeolli-cliff-4810725_640.jpg',
    page: 'https://pixabay.com/photos/jusangjeolli-cliff-coast-sea-ocean-4810725/',
  },
  {
    id: 'cheonjiyeon',
    name: '천지연폭포',
    desc: '울창한 난대림 사이로 떨어지는 서귀포의 폭포입니다.',
    image: cdn + '2016/08/15/06/05/jeju-island-cheonjiyeon-waterfall-1594590_640.jpg',
    page: 'https://pixabay.com/photos/cheonjiyeon-falls-jeju-island-1594590/',
  },
]

export const FOODS = [
  {
    name: '감귤 · 한라봉',
    desc: '겨울 제주의 달콤한 상징. 껍질째 향까지 즐겨 보세요.',
    image: cdn + '2021/12/23/10/41/jeju-island-6889156_640.jpg',
    page: 'https://pixabay.com/photos/jeju-island-mandarin-fruit-6889156/',
  },
  {
    name: '녹차 · 오설록',
    desc: '푸른 차밭에서 맛보는 향긋한 제주 녹차 디저트.',
    image: cdn + '2019/10/23/12/49/tea-4571536_640.jpg',
    page: 'https://pixabay.com/photos/green-tea-green-tea-plantation-4571536/',
  },
  { name: '흑돼지', desc: '제주 흑돼지 구이. 멸젓과 함께 먹는 고소한 맛.', image: null, page: null },
  { name: '해산물 · 물회', desc: '갈치조림, 성게미역국, 한치물회까지 바다의 맛.', image: null, page: null },
]

// 푸터 출처 표기용 (이미지가 있는 항목만 자동 수집)
export const CREDITS = [
  { label: '히어로', page: HERO_IMAGE.page },
  ...SPOTS.filter((s) => s.page).map((s) => ({ label: s.name, page: s.page })),
  ...FOODS.filter((f) => f.page).map((f) => ({ label: f.name, page: f.page })),
]
