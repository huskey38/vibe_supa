# 제주 바라기 (jeju-site)

제주도 소개 사이트. **Vite + React + Supabase Auth**(이메일/비밀번호 회원가입·로그인)로 만들었고 **Vercel** 배포를 전제로 합니다.

- `/` 홈 (히어로, 명소, 먹거리)
- `/login`, `/signup` 로그인 · 회원가입 (오류 메시지 한국어)
- `/members` 내 프로필 · 회원 전용 팁 — **로그인해야만** 접근 가능 (`ProtectedRoute`, 비로그인 시 `/login` 으로 이동)
- 세션은 Supabase 가 localStorage 에 저장하여 새로고침해도 유지됩니다.

> ⚠️ **절대 금지**: Supabase 의 `service_role`(secret) 키는 프런트엔드 코드, `.env`, Vercel 의 `VITE_` 변수 어디에도 넣지 마세요.
> `VITE_` 로 시작하는 값은 빌드 시 브라우저 번들에 그대로 들어가 누구나 볼 수 있습니다. 이 프로젝트는 **anon(publishable) 키만** 사용합니다.

---

## 0. 준비물

Node.js 18 이상(LTS 권장)이 필요합니다. 설치되어 있지 않다면 <https://nodejs.org> 에서 LTS 를 설치하거나, PowerShell 에서:

```powershell
winget install OpenJS.NodeJS.LTS
```

설치 후 **터미널을 새로 열고** `node -v`, `npm -v` 로 확인합니다.

## 1. Supabase 에서 URL 과 anon key 찾기

1. <https://supabase.com/dashboard> 에서 프로젝트를 엽니다.
2. 프로젝트 홈의 상단 초록색 **Connect** 버튼, 또는 왼쪽 아래 톱니바퀴 **Project Settings → API Keys** 로 이동합니다.
3. **Project URL** (`https://xxxxxxxx.supabase.co`) 을 복사합니다. 프로젝트 홈 화면의 `Copy` 버튼 옆 주소와 같습니다.
4. **anon** 키(`eyJ...` 로 시작하는 legacy anon key) 또는 **publishable** 키(`sb_publishable_...`)를 복사합니다.
   - ❌ `service_role` / `secret` 키는 복사하지 마세요.

## 2. 로컬 `.env` 만들기

`jeju-site` 폴더에서:

```powershell
Copy-Item .env.example .env
```

`.env` 를 열어 값을 채웁니다. (`.env` 는 `.gitignore` 에 포함되어 있어 git 에 올라가지 않습니다.)

```
VITE_SUPABASE_URL=https://내프로젝트.supabase.co
VITE_SUPABASE_ANON_KEY=복사한-anon-또는-publishable-키
```

```powershell
npm install
npm run dev      # http://localhost:5173
```

`.env` 를 수정한 뒤에는 개발 서버를 **재시작**해야 적용됩니다.

## 3. Supabase Authentication 설정

대시보드 **Authentication** 메뉴에서:

### (a) 이메일 확인 켜기/끄기
**Authentication → Sign In / Providers → Email**
- **Confirm email 켜짐(기본)**: 가입 후 인증 메일의 링크를 눌러야 로그인됩니다. 앱은 "메일을 확인해 주세요" 화면을 보여 줍니다. 무료 플랜은 기본 메일 발송 한도가 낮습니다(시간당 몇 통).
- **Confirm email 꺼짐**: 가입 즉시 로그인되어 `/members` 로 이동합니다. 개발·수업용으로 편합니다.

### (b) Site URL / Redirect URLs
**Authentication → URL Configuration**
- **Site URL**: 배포 주소 (예: `https://내사이트.vercel.app`). 개발만 할 때는 `http://localhost:5173`.
- **Redirect URLs** 에 둘 다 추가:
  - `http://localhost:5173/**`
  - `https://내사이트.vercel.app/**`
  - (Vercel 프리뷰 배포도 쓴다면) `https://*-내팀.vercel.app/**`

인증 메일 링크가 등록되지 않은 주소로 돌아오면 Site URL 로 대체되거나 오류가 납니다. Vercel 배포 주소가 정해지면 **반드시 다시 와서 추가**하세요.

## 4. Vercel 배포

1. GitHub 에 이 코드가 push 되어 있어야 합니다. (저장소 `huskey38/day4`, 사이트는 `solar_system/jeju-site` 폴더)
2. <https://vercel.com> 로그인 → **Add New… → Project** → GitHub 저장소 `day4` 를 **Import**.
3. **Root Directory** 를 `solar_system/jeju-site` 로 지정(Edit 클릭). Framework Preset 은 **Vite** 로 자동 인식됩니다. (Build: `npm run build`, Output: `dist`)
4. **Environment Variables** 에 아래 두 개를 추가합니다 (Production / Preview / Development 모두 체크).

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | anon 또는 publishable 키 |

   ❌ `service_role` 키는 넣지 마세요.
5. **Deploy**. 배포된 주소(`https://….vercel.app`)를 위 3-(b) 의 Site URL / Redirect URLs 에 등록합니다.
6. **환경변수를 나중에 추가·수정했다면 재배포가 필요합니다.** Vite 는 빌드 시점에 값을 번들에 넣기 때문입니다:
   Vercel → 프로젝트 → **Deployments** → 최신 배포 우측 `⋯` → **Redeploy**.

## 5. SPA 라우팅 (`vercel.json`)

React Router 를 쓰므로 `/login`, `/members` 를 주소창에 직접 입력하거나 새로고침하면 404 가 날 수 있습니다. 이를 막기 위해 `vercel.json` 에 rewrites 가 이미 들어 있습니다.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 6. 장바구니 · DB 테이블 만들기 (SQL)

상점(`/shop`)과 장바구니(`/cart`)는 Supabase 테이블 `products`, `cart_items` 를 사용합니다.

1. Supabase 대시보드 → 왼쪽 **SQL Editor** → **New query**
2. [`supabase/schema.sql`](supabase/schema.sql) 내용을 전부 붙여 넣고 **Run**
3. **Table Editor** 에서 `products`(샘플 상품 6개), `cart_items` 가 생겼는지 확인

- `products`: 누구나 읽기만 가능 (RLS). 상품 추가·수정은 Table Editor 에서 직접 하세요.
- `cart_items`: RLS 로 **로그인한 사용자가 자기 장바구니만** 조회·추가·수정·삭제할 수 있습니다. (`user_id` 는 `auth.uid()` 가 자동으로 채움)
- 같은 SQL 을 다시 실행해도 안전합니다(`if not exists`, `on conflict do nothing`).
- 테이블을 만들기 전에는 상점 화면에 "테이블이 없습니다" 안내가 표시됩니다.

## 이미지 출처

모든 사진은 [Pixabay](https://pixabay.com) 의 이미지이며, 사용한 사진의 Pixabay 페이지 링크는 사이트 푸터에 표기됩니다. 이미지 목록은 `src/data/content.js` 에 있고, 직접 확인한 `cdn.pixabay.com` 주소만 사용합니다. 돌담·흑돼지·해산물은 확인된 이미지가 없어 그라데이션으로 대체했으니, Pixabay 에서 마음에 드는 사진을 찾아 `image`/`page` 값을 채우면 됩니다.

## 폴더 구조

```
jeju-site/
├─ index.html  vite.config.js  vercel.json  .env.example
└─ src/
   ├─ main.jsx  App.jsx  styles.css
   ├─ supabaseClient.js   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 읽기
   ├─ AuthContext.jsx     # 세션 상태, signUp / signIn / signOut
   ├─ authErrors.js       # 한국어 오류 메시지
   ├─ data/content.js     # 명소·먹거리·이미지 출처
   ├─ components/         # Navbar, Footer, Card
   └─ pages/              # Home, Login, Signup, Members(보호됨)
```

## 7. 3D 대표경관 지도 (`/map`) 와 공공데이터 API

- MapLibre GL 로 위성사진 + 고도 데이터를 입히는 입체 지형 지도입니다. 드래그로 이동, 오른쪽 드래그로 회전·기울기, 휠로 확대, 목록 클릭 시 해당 경관으로 날아갑니다. (키 없이 동작, 위성영상 © Esri · 지형 © AWS Terrain Tiles)
- 공공데이터포털 대표경관 API(`api.odcloud.kr`)는 **서버에서만** 호출합니다. 인증키가 브라우저에 노출되지 않도록 `/api/landscape` 프록시를 거칩니다.
  - 로컬: `.env` 에 `DATA_GO_KR_KEY=발급받은키` 추가(`VITE_` 붙이지 않음) 후 개발 서버 재시작
  - Vercel: Settings → Environment Variables 에 `DATA_GO_KR_KEY` 추가(이 변수는 Sensitive 로 설정 가능) → Redeploy
  - Encoding/Decoding 키 어느 쪽이든 동작합니다.
- 키가 없거나 API가 실패하면 기본 대표경관 10곳(`src/data/landmarks.js`)으로 계속 동작합니다.
