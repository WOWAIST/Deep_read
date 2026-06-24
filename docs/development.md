# Technical Architecture

## 기술 스택

### Framework

* Next.js 15
* React
* TypeScript

### UI

* TailwindCSS
* shadcn/ui

### Chrome Extension

* Manifest V3
* Content Script
* Background Service Worker
* Side Panel

### AI

* OpenAI API
* GPT-5
* GPT-5-mini

### Storage

MVP

* Chrome Storage

Future

* Supabase
* PostgreSQL

---

# 프로젝트 구조

```text
project-root

├── extension
│
│   ├── manifest.json
│
│   ├── background
│   │   └── index.ts
│
│   ├── content
│   │   └── index.ts
│
│   └── sidepanel
│       ├── page.tsx
│       ├── components
│       └── hooks
│
├── src
│
│   ├── app
│   │
│   ├── api
│   │   ├── analyze
│   │   │   └── route.ts
│   │   │
│   │   ├── question
│   │   │   └── route.ts
│   │   │
│   │   ├── evaluate
│   │   │   └── route.ts
│   │   │
│   │   └── summary
│   │       └── route.ts
│
│   ├── features
│   │
│   │   ├── document
│   │   ├── vocabulary
│   │   ├── learning
│   │   ├── evaluation
│   │   └── progress
│
│   ├── lib
│   │
│   │   ├── parser
│   │   ├── chunker
│   │   ├── openai
│   │   └── prompts
│
│   ├── shared
│   │
│   │   ├── types
│   │   ├── constants
│   │   └── utils
│
│   └── components
│
└── package.json
```

---

# 주요 도메인

## Document

```ts
interface Document {
  url: string;
  title: string;
  content: string;
}
```

## DocumentChunk

```ts
interface DocumentChunk {
  id: string;
  order: number;
  content: string;
}
```

## Vocabulary

```ts
interface Vocabulary {
  term: string;
  meaning: string;
  practicalExample: string;
}
```

## LearningQuestion

```ts
interface LearningQuestion {
  question: string;
  intent: string;
  difficulty: number;
}
```

## EvaluationResult

```ts
interface EvaluationResult {
  understood: boolean;
  feedback: string;
  nextQuestion?: string;
}
```

---

# API

## POST /api/analyze

문서 분석

```text
문서 추출
↓
문서 분할
↓
용어 추출
```

---

## POST /api/question

질문 생성

```text
Chunk
↓
질문 생성
```

---

## POST /api/evaluate

답변 평가

```text
질문
+
답변
↓
이해도 평가
```

---

## POST /api/summary

학습 완료 요약

```text
전체 Chunk
↓
최종 정리
```

---

# AI 모듈 구조

```text
src/lib/prompts

├── analyze.ts
├── vocabulary.ts
├── question.ts
├── evaluate.ts
└── summary.ts
```

각 프롬프트는 독립적으로 관리한다.

절대로 하나의 거대한 Prompt로 합치지 않는다.

---

# 문서 처리 플로우

```text
사용자

↓

공식문서 접속

↓

Chrome Extension

↓

본문 추출

↓

/api/analyze

↓

Chunk 생성

↓

용어 추출

↓

질문 생성

↓

학습 진행

↓

답변 제출

↓

/api/evaluate

↓

통과 여부 판단

↓

다음 Chunk
```

---

# 담당자 분업

## 개발자 A

### 담당 폴더

```text
src/lib

src/api

src/features/document

src/features/vocabulary

src/features/evaluation
```

### 담당 기능

문서 분석 엔진

```text
parser

chunker

openai

prompt
```

---

질문 생성

```text
/api/question
```

---

이해도 평가

```text
/ api/evaluate
```

---

최종 요약

```text
/ api/summary
```

---

### 책임

AI가 얼마나 잘 가르치는가

---

## 개발자 B

### 담당 폴더

```text
extension

src/features/learning

src/features/progress

src/components
```

### 담당 기능

Chrome Extension

```text
content script

background

side panel
```

---

학습 화면

```text
영어 원문

기술 용어

질문

답변 입력
```

---

진행률

```text
1/10

2/10

3/10
```

---

로컬 저장

```text
Chrome Storage
```

---

### 책임

사용자가 얼마나 편하게 학습하는가

---

# 공통 작업

```text
src/shared/types
```

### 우선 작성

```ts
Document
DocumentChunk
Vocabulary
LearningQuestion
EvaluationResult
```

이 타입을 먼저 확정한 뒤 개발을 시작한다.

이 타입이 API 계약서 역할을 한다.
