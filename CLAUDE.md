# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sisiduck(시시덕)** - 재미있는 콘텐츠 플랫폼. 첫 번째 기능으로 티어메이커를 제공.
- 도메인: sisiduck.com
- 타겟: 한국 사용자
- 핵심 차별점: 소분류별 공유 아이템 풀 (위키 방식), 토픽 기반 다양한 티어 생성

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Backend/Auth/Storage**: Supabase (DB, Auth, Storage)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Image Export**: html-to-image
- **Package Manager**: pnpm
- **Deployment**: Vercel

## Key Architecture

- 플랫폼 구조: `/` (플랫폼 홈) → `/tier` (티어메이커) → 향후 확장 가능
- URL 패턴: `/tier/{category}/{subcategory}/{topic}`
- 콘텐츠 계층: 대분류(고정) > 소분류(사용자 생성) > 토픽 > 티어리스트
- 소분류에 공유 아이템 풀 귀속, 토픽은 풀에서 아이템 참조

## External Services

- Supabase MCP server is configured in `.claude/settings.local.json`

## Docs

- `docs/information-architecture.md` - IA 문서
- `docs/ia-sitemap.html` - IA 시각화 (브라우저에서 열기)
- `docs/prd.md` - 제품 요구사항
- `docs/development-guide.md` - 개발 가이드 (DB 스키마, API, 프로젝트 구조)
