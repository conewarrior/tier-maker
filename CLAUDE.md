# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sisiduck(시시덕)** - 재미있는 콘텐츠 플랫폼. 첫 번째 기능으로 티어메이커를 제공.
- 도메인: sisiduck.com
- 타겟: 한국 사용자
- 핵심 차별점: 소분류별 공유 아이템 풀 (위키 방식), 토픽 기반 다양한 티어 생성

## Commands

```bash
pnpm dev        # 개발 서버 (Turbopack)
pnpm build      # 프로덕션 빌드
pnpm start      # 프로덕션 서버
pnpm lint       # ESLint
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript, React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style, CSS variables)
- **Icons**: lucide-react (이모지 사용 금지)
- **Backend/Auth/Storage**: Supabase (PostgreSQL, Auth, Storage) + @supabase/ssr
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Image Export**: html-to-image
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Key Architecture

- 플랫폼 구조: `/` (플랫폼 홈) → `/tier` (티어메이커) → 향후 확장 가능
- URL 패턴: `/tier/{category}/{subcategory}/{topic}`
- 콘텐츠 계층: 대분류(고정) > 소분류(사용자 생성) > 토픽 > 티어리스트
- 소분류에 공유 아이템 풀 귀속, 토픽은 풀에서 아이템 참조
- Path alias: `@/*` → `src/*`

### Layout Hierarchy

TopNav(fixed, z-50, 전체 너비) → Sidebar(fixed, TopNav 아래 좌측) → Main content → Footer(콘텐츠 하단 가운데)

CSS 변수로 레이아웃 크기 관리: `--nav-height: 56px`, `--sidebar-width: 256px`

### Supabase Client 패턴

- `src/lib/supabase/client.ts` — 브라우저용 (createBrowserClient)
- `src/lib/supabase/server.ts` — 서버 컴포넌트/Server Action용 (createServerClient + cookies)
- `src/lib/supabase/middleware.ts` — Auth 세션 갱신 (middleware에서 호출)

### Component 규칙

- page.tsx에 하드코딩 금지. 모든 UI는 `src/components/` 하위 컴포넌트로 분리
- 레이아웃 컴포넌트: `src/components/layout/` (TopNav, Sidebar, Footer, SearchBar)
- shadcn/ui 컴포넌트: `src/components/ui/`
- Client Component에 `"use client"` 명시, 서버 컴포넌트가 기본

### Styling

- 흰 배경 기반, 컴포넌트에 별도 배경색 불필요
- 구분은 border, hover 상태, 그림자로 처리
- 디자인 토큰은 `globals.css`의 CSS 변수로 관리 (shadcn 토큰 체계)
- 레딧 스타일 클린 UI 지향
- `cn()` 유틸 (`src/lib/utils.ts`)로 Tailwind 클래스 병합

## 작업 방식: 에이전트 팀 활용

`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`가 활성화되어 있다 (`.claude/settings.local.json`).

**큰 작업(Development Guide 작성, 다중 PRD 분석, 병렬 구현 등)은 Task tool로 에이전트를 구성해서 처리한다:**

- 분석/조사가 필요하면 Explore 에이전트를 병렬로 띄워 동시에 수집
- 설계가 필요하면 Plan 에이전트로 구조 잡기
- 구현이 필요하면 general-purpose 에이전트로 병렬 개발
- 상황에 맞게 에이전트를 조합하되, 커스텀 스킬에 의존하지 말고 Task tool로 직접 구성

## Environment Variables

`.env.local`에 필요:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## External Services

- Supabase MCP server is configured in `.claude/settings.local.json`

## Docs

- `docs/information-architecture.md` - IA 문서
- `docs/ia-sitemap.html` - IA 시각화 (브라우저에서 열기)
- `docs/prd.md` - 제품 요구사항
- `docs/development-guide.md` - 개발 가이드 (DB 스키마, API, 프로젝트 구조)
