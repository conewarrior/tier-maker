# Development Guide - sisiduck

## 1. 기술 스택

| 영역 | 기술 | 버전/비고 |
|------|------|----------|
| 프레임워크 | Next.js (App Router) | TypeScript |
| 스타일링 | Tailwind CSS | |
| DB / Auth / Storage | Supabase | PostgreSQL, Auth, Storage |
| 드래그앤드롭 | @dnd-kit/core + @dnd-kit/sortable | |
| 이미지 내보내기 | html-to-image | 티어 → PNG |
| 패키지 매니저 | pnpm | |
| 배포 | Vercel | |

## 2. 프로젝트 구조

```
sisiduck/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 루트 레이아웃 (탑 내비 + 사이드바)
│   │   ├── page.tsx                  # 플랫폼 홈 (/)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── tier/
│   │   │   ├── page.tsx              # 티어메이커 홈 (/tier)
│   │   │   ├── create/page.tsx       # 토픽 만들기 (/tier/create)
│   │   │   └── [category]/
│   │   │       └── [subcategory]/
│   │   │           ├── page.tsx      # 소분류 페이지
│   │   │           └── [topic]/
│   │   │               ├── page.tsx  # 토픽 상세
│   │   │               ├── create/page.tsx  # 티어 에디터
│   │   │               └── [tierId]/page.tsx  # 티어리스트 상세
│   │   └── mypage/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── tier/
│   │   │   ├── TierBoard.tsx         # 티어 보드 (S/A/B/C/D/F 행)
│   │   │   ├── TierRow.tsx           # 단일 티어 행
│   │   │   ├── DraggableItem.tsx     # 드래그 가능한 아이템
│   │   │   ├── UnplacedItems.tsx     # 미배치 아이템 영역
│   │   │   └── TierListPreview.tsx   # 피드용 축약 미리보기
│   │   ├── topic/
│   │   │   ├── TopicCard.tsx
│   │   │   ├── TopicCreateForm.tsx
│   │   │   └── ItemSelector.tsx      # 아이템 풀에서 선택 UI
│   │   ├── item/
│   │   │   ├── ItemGrid.tsx
│   │   │   ├── ItemUploadForm.tsx
│   │   │   └── ImageReplaceModal.tsx
│   │   ├── social/
│   │   │   ├── LikeButton.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── ShareButton.tsx
│   │   └── ui/                       # 공통 UI 컴포넌트
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Dropdown.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # 브라우저 클라이언트
│   │   │   ├── server.ts             # 서버 클라이언트
│   │   │   └── middleware.ts         # Auth 미들웨어
│   │   ├── utils/
│   │   │   ├── normalize.ts          # 텍스트 정규화 (중복 방지)
│   │   │   ├── slug.ts               # 슬러그 생성
│   │   │   └── image.ts              # 이미지 리사이즈/압축
│   │   └── constants.ts              # 티어 기본값, 색상 등
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTierEditor.ts          # 티어 에디터 상태 관리
│   │   └── useSearch.ts
│   └── types/
│       ├── database.ts               # Supabase 타입 (자동 생성)
│       └── tier.ts                   # 티어 관련 타입
├── supabase/
│   ├── migrations/                   # DB 마이그레이션
│   └── seed.sql                      # 초기 대분류 카테고리 시드
├── public/
├── docs/                             # 프로젝트 문서
├── CLAUDE.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 3. DB 스키마 & 마이그레이션

### 초기 마이그레이션 (Phase 1)

```sql
-- 사용자 (Supabase Auth 연동)
-- auth.users는 Supabase가 자동 관리
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nickname text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 대분류 카테고리
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  icon text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 소분류 카테고리
create table public.subcategories (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories on delete cascade not null,
  name text not null,
  slug text not null,
  normalized_name text not null,
  created_by uuid references public.profiles,
  created_at timestamptz default now(),
  unique(category_id, slug)
);

-- 소분류 별칭
create table public.subcategory_aliases (
  id uuid default gen_random_uuid() primary key,
  subcategory_id uuid references public.subcategories on delete cascade not null,
  alias text not null,
  normalized_alias text not null
);

-- 공유 아이템 풀
create table public.items (
  id uuid default gen_random_uuid() primary key,
  subcategory_id uuid references public.subcategories on delete cascade not null,
  name text not null,
  image_url text not null,
  created_by uuid references public.profiles,
  created_at timestamptz default now()
);

-- 아이템 이미지 변경 히스토리
create table public.item_image_history (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.items on delete cascade not null,
  image_url text not null,
  changed_by uuid references public.profiles,
  changed_at timestamptz default now()
);

-- 토픽
create table public.topics (
  id uuid default gen_random_uuid() primary key,
  subcategory_id uuid references public.subcategories on delete cascade not null,
  title text not null,
  slug text not null,
  description text,
  created_by uuid references public.profiles,
  created_at timestamptz default now(),
  unique(subcategory_id, slug)
);

-- 토픽-아이템 연결
create table public.topic_items (
  topic_id uuid references public.topics on delete cascade not null,
  item_id uuid references public.items on delete cascade not null,
  primary key (topic_id, item_id)
);

-- 티어리스트
create table public.tier_lists (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references public.topics on delete cascade not null,
  user_id uuid references public.profiles not null,
  created_at timestamptz default now()
);

-- 티어 배치 정보
create table public.tier_rankings (
  id uuid default gen_random_uuid() primary key,
  tier_list_id uuid references public.tier_lists on delete cascade not null,
  item_id uuid references public.items on delete cascade not null,
  tier text not null,        -- 'S', 'A', 'B', 'C', 'D', 'F'
  position int not null      -- 같은 티어 내 순서
);

-- 좋아요
create table public.likes (
  user_id uuid references public.profiles on delete cascade not null,
  tier_list_id uuid references public.tier_lists on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, tier_list_id)
);

-- 댓글
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  tier_list_id uuid references public.tier_lists on delete cascade not null,
  user_id uuid references public.profiles not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS 활성화
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.subcategory_aliases enable row level security;
alter table public.items enable row level security;
alter table public.item_image_history enable row level security;
alter table public.topics enable row level security;
alter table public.topic_items enable row level security;
alter table public.tier_lists enable row level security;
alter table public.tier_rankings enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- 읽기: 모든 사용자 (비로그인 포함)
create policy "Public read" on public.categories for select using (true);
create policy "Public read" on public.subcategories for select using (true);
create policy "Public read" on public.subcategory_aliases for select using (true);
create policy "Public read" on public.items for select using (true);
create policy "Public read" on public.topics for select using (true);
create policy "Public read" on public.topic_items for select using (true);
create policy "Public read" on public.tier_lists for select using (true);
create policy "Public read" on public.tier_rankings for select using (true);
create policy "Public read" on public.likes for select using (true);
create policy "Public read" on public.comments for select using (true);
create policy "Public read" on public.profiles for select using (true);

-- 쓰기: 로그인 사용자만
create policy "Auth insert" on public.subcategories for insert with check (auth.uid() = created_by);
create policy "Auth insert" on public.items for insert with check (auth.uid() = created_by);
create policy "Auth insert" on public.topics for insert with check (auth.uid() = created_by);
create policy "Auth insert" on public.topic_items for insert with check (
  exists (select 1 from public.topics where id = topic_id and created_by = auth.uid())
);
create policy "Auth insert" on public.tier_lists for insert with check (auth.uid() = user_id);
create policy "Auth insert" on public.tier_rankings for insert with check (
  exists (select 1 from public.tier_lists where id = tier_list_id and user_id = auth.uid())
);
create policy "Auth insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "Auth insert" on public.comments for insert with check (auth.uid() = user_id);

-- 삭제: 본인 것만
create policy "Owner delete" on public.tier_lists for delete using (auth.uid() = user_id);
create policy "Owner delete" on public.likes for delete using (auth.uid() = user_id);
create policy "Owner delete" on public.comments for delete using (auth.uid() = user_id);
```

### 시드 데이터 (대분류 카테고리)

```sql
insert into public.categories (name, slug, icon, sort_order) values
  ('만화/애니', 'manga', '🎬', 1),
  ('게임', 'game', '🎮', 2),
  ('영화/드라마', 'movie', '🎥', 3),
  ('음식', 'food', '🍔', 4),
  ('스포츠', 'sports', '⚽', 5),
  ('음악', 'music', '🎵', 6),
  ('기타', 'etc', '📦', 99);
```

## 4. API 설계

Supabase 클라이언트를 직접 사용하되, 복잡한 로직은 Server Action으로 처리.

### Server Actions

```
src/app/actions/
├── category.ts       # 카테고리/소분류 조회
├── subcategory.ts    # 소분류 생성, 별칭 관리, 중복 체크
├── item.ts           # 아이템 추가, 이미지 교체
├── topic.ts          # 토픽 CRUD
├── tier.ts           # 티어리스트 저장/조회
├── social.ts         # 좋아요, 댓글
└── search.ts         # 통합 검색
```

### 주요 액션

| 액션 | 설명 |
|------|------|
| `getCategories()` | 대분류 + 소분류 전체 조회 (사이드바용) |
| `checkSubcategoryDuplicate(name)` | 정규화 후 기존 소분류 매칭 검색 |
| `createSubcategory(data)` | 소분류 생성 + normalized_name 자동 생성 |
| `getItems(subcategoryId)` | 소분류의 아이템 풀 조회 |
| `addItem(data)` | 아이템 추가 (이미지 Storage 업로드 포함) |
| `replaceItemImage(itemId, file)` | 이미지 교체 + 히스토리 기록 |
| `createTopic(data)` | 토픽 생성 + topic_items 연결 |
| `saveTierList(data)` | 티어리스트 + rankings 저장 |
| `getTierListFeed(topicId, sort)` | 토픽의 티어리스트 피드 (인기순/최신순) |

## 5. 핵심 구현 노트

### 5.1 텍스트 정규화 (소분류 중복 방지)

```typescript
// lib/utils/normalize.ts
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\-_\.]/g, '')  // 공백, 하이픈, 언더스코어, 점 제거
    .replace(/[^\w\uAC00-\uD7AF]/g, '')  // 특수문자 제거 (한글 유지)
}
// "ONE PIECE" → "onepiece"
// "원 피스" → "원피스"
```

### 5.2 티어 에디터 상태 관리

```typescript
// dnd-kit 기반
// 상태: { [tier: string]: string[] } → 각 티어에 아이템 ID 배열
// 미배치: 'unplaced' 키로 관리
type TierState = {
  [tier: string]: string[]  // tier name → item IDs
  unplaced: string[]
}
```

### 5.3 이미지 업로드 경로

```
Supabase Storage 버킷: items
경로: items/{subcategory_id}/{item_id}/{timestamp}.webp
```

업로드 시 클라이언트에서 리사이즈 (max 200x200) + WebP 변환 후 업로드.

## 6. 개발 단계별 작업 목록

### Phase 1: MVP

```
1. 프로젝트 초기화
   - Next.js + TypeScript + Tailwind + pnpm 세팅
   - Supabase 프로젝트 생성 & 연동
   - DB 마이그레이션 실행 + 시드 데이터

2. 레이아웃 & 내비게이션
   - 글로벌 레이아웃 (탑 내비 + 사이드바)
   - 카테고리 사이드바 (대분류 > 소분류 아코디언)
   - 검색바 UI

3. 인증
   - Supabase Auth 세팅 (Google, GitHub OAuth)
   - 로그인/회원가입 페이지
   - Auth 미들웨어 (보호 라우트)

4. 카테고리 & 소분류
   - 소분류 페이지 (아이템 풀 + 토픽 목록)
   - 소분류 생성 (정규화 중복 체크 포함)

5. 공유 아이템 풀
   - 아이템 목록 그리드
   - 아이템 추가 폼 (이름 + 이미지 업로드)
   - 이미지 교체 기능

6. 토픽
   - 토픽 만들기 폼 (대분류 → 소분류 → 제목 → 아이템 선택)
   - 토픽 상세 페이지

7. 티어 에디터 (핵심)
   - dnd-kit 기반 드래그앤드롭 보드
   - S/A/B/C/D/F 기본 행
   - 행 커스텀 (추가/삭제/이름/색상)
   - 저장 기능 (비로그인 → 로그인 유도)

8. 티어리스트 보기
   - 티어리스트 상세 페이지
   - 토픽 내 티어리스트 피드
```

### Phase 2: 소셜 & 탐색

```
9. 소셜 기능
   - 좋아요 토글
   - 댓글 CRUD
   - 피드 정렬 (인기순/최신순)

10. 마이페이지
    - 내 티어리스트 / 내 토픽 / 좋아요 목록
    - 프로필 편집

11. 검색
    - 통합 검색 (토픽 + 소분류)
    - 소분류 검색 (정규화 + 별칭)

12. 이미지 내보내기
    - html-to-image로 티어 → PNG 변환
    - 다운로드 기능
```

### Phase 3: 고도화

```
13. 별칭 시스템 강화
14. 아이템 이미지 히스토리 UI
15. OG Image 자동 생성 (티어리스트 공유 시)
16. 반응형 / 모바일 터치 드래그
17. 플랫폼 홈 랜딩 페이지
```

## 7. 개발 커맨드

```bash
# 설치
pnpm install

# 개발 서버
pnpm dev

# 빌드
pnpm build

# Supabase 타입 생성
pnpm supabase gen types typescript --local > src/types/database.ts

# Supabase 마이그레이션
pnpm supabase migration new <name>
pnpm supabase db push
```
