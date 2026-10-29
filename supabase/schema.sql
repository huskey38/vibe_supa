-- 제주 바라기: 상품(products) + 장바구니(cart_items) 테이블
-- 사용법: Supabase 대시보드 > SQL Editor > New query 에 이 파일 전체를 붙여 넣고 Run.
-- 여러 번 실행해도 안전하도록 작성되어 있습니다.

-- 1) 상품 테이블 ------------------------------------------------------------
create table if not exists public.products (
  id          bigint generated always as identity primary key,
  name        text    not null unique,
  description text,
  price       integer not null check (price >= 0),   -- 원 단위
  image_url   text,
  created_at  timestamptz not null default now()
);

-- 2) 장바구니 테이블 ---------------------------------------------------------
create table if not exists public.cart_items (
  id          bigint generated always as identity primary key,
  user_id     uuid    not null default auth.uid()
              references auth.users (id) on delete cascade,
  product_id  bigint  not null references public.products (id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)                        -- 같은 상품은 한 줄, 수량만 증가
);

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);

-- 3) RLS(행 단위 보안) --------------------------------------------------------
alter table public.products   enable row level security;
alter table public.cart_items enable row level security;

-- 상품: 누구나 읽기만 가능 (쓰기 정책 없음 = 대시보드/서비스 키로만 수정)
drop policy if exists "products are readable by everyone" on public.products;
create policy "products are readable by everyone"
  on public.products for select
  to anon, authenticated
  using (true);

-- 장바구니: 로그인한 사용자가 "자기 것만" 조회/추가/수정/삭제
drop policy if exists "cart: select own" on public.cart_items;
create policy "cart: select own"
  on public.cart_items for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "cart: insert own" on public.cart_items;
create policy "cart: insert own"
  on public.cart_items for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "cart: update own" on public.cart_items;
create policy "cart: update own"
  on public.cart_items for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "cart: delete own" on public.cart_items;
create policy "cart: delete own"
  on public.cart_items for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- 4) 샘플 상품 ---------------------------------------------------------------
insert into public.products (name, description, price, image_url) values
  ('제주 한라봉 3kg',     '새콤달콤 제주 한라봉 선물세트',        28000, 'https://cdn.pixabay.com/photo/2021/12/23/10/41/jeju-island-6889156_640.jpg'),
  ('제주 녹차 티백 세트', '푸른 차밭에서 자란 향긋한 녹차 20입',  15000, 'https://cdn.pixabay.com/photo/2019/10/23/12/49/tea-4571536_640.jpg'),
  ('제주 흑돼지 오겹살 500g', '냉동 흑돼지 구이용 오겹살',        24000, null),
  ('제주 옥돔 2마리',     '손질해 급랭한 제주 옥돔',              38000, null),
  ('제주 돌하르방 미니어처', '현무암 느낌의 돌하르방 기념품',      12000, null),
  ('제주 유채꿀 250g',    '봄 유채꽃에서 딴 꿀',                  16000, null)
on conflict (name) do nothing;
