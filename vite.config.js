import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DATASET = '/api/15125100/v1/uddi:32a1b877-af20-4505-a76a-fd389ebd30ca'

export default defineConfig(({ mode }) => {
  // VITE_ 접두사 없는 DATA_GO_KR_KEY 도 읽는다. (개발 서버 프록시에서만 사용, 번들에는 들어가지 않음)
  const env = loadEnv(mode, process.cwd(), '')
  const key = env.DATA_GO_KR_KEY || ''
  let safeKey = key
  try {
    safeKey = encodeURIComponent(decodeURIComponent(key))
  } catch {
    safeKey = encodeURIComponent(key)
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        // 로컬 개발: /api/landscape -> odcloud (키는 서버 쪽에서 붙임). 배포 환경은 api/landscape.js 가 담당.
        '/api/landscape': {
          target: 'https://api.odcloud.kr',
          changeOrigin: true,
          rewrite: () => `${DATASET}?page=1&perPage=100&returnType=JSON&serviceKey=${safeKey}`,
        },
      },
    },
  }
})
