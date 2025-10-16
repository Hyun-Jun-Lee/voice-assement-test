# 심리검사 음성 인터페이스 (Psychological Assessment Voice Interface)

음성 명령을 통해 심리검사를 진행할 수 있는 웹 애플리케이션입니다. SvelteKit과 OpenRouter API를 활용하여 자연어 명령을 처리하고, TTS(Text-to-Speech) 기능을 통해 접근성을 향상시켰습니다.

## 주요 기능

- 🎤 **음성 명령 처리**: 자연어로 검사 진행 ("C를 체크해줘", "다음 문항으로 가줘")
- 🤖 **LLM Tool Calling**: OpenRouter API를 통한 지능형 명령 해석
- 🔊 **TTS 지원**: 문항 및 응답 자동 읽기 (Phase 3 준비 완료)
- 📊 **실시간 진행률**: 답변 완료 상황 실시간 표시
- 🎯 **스마트 네비게이션**: 미답변 문항 자동 탐색 및 이동
- 🐛 **디버그 패널**: 개발 중 상태 모니터링

## 기술 스택

- **Frontend**: SvelteKit, Svelte 5
- **State Management**: Svelte Stores (writable, derived)
- **LLM Integration**: OpenRouter API (Tool Calling)
- **Styling**: Custom CSS with CSS Variables
- **Build Tool**: Vite

## 프로젝트 구조

```
voice-pasych-test/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── assessment/        # 검사 관련 UI 컴포넌트
│   │   │   │   ├── AnswerSelector.svelte
│   │   │   │   ├── CommandInput.svelte
│   │   │   │   ├── CommandHistory.svelte
│   │   │   │   ├── ProgressBar.svelte
│   │   │   │   ├── QuestionCard.svelte
│   │   │   │   └── VoiceButton.svelte
│   │   │   ├── ui/                # 공통 UI 컴포넌트
│   │   │   │   ├── Button.svelte
│   │   │   │   └── StatusMessage.svelte
│   │   │   └── debug/             # 디버그 패널
│   │   │       └── DebugPanel.svelte
│   │   ├── data/                  # 데이터 레이어
│   │   │   ├── questions.js       # 문항 데이터
│   │   │   └── constants.js       # 상수 정의
│   │   ├── services/              # 비즈니스 로직 레이어
│   │   │   ├── commandProcessor.js    # 명령 처리 (OpenRouter)
│   │   │   ├── questionService.js     # 문항 데이터 관리
│   │   │   └── ttsService.js          # TTS 서비스 (Phase 3 준비)
│   │   ├── stores/                # 상태 관리
│   │   │   ├── testStore.js       # 검사 진행 상태
│   │   │   ├── commandStore.js    # 명령 처리 상태
│   │   │   └── uiStore.js         # UI 상태
│   │   └── assets/
│   │       └── favicon.svg
│   ├── routes/
│   │   ├── +layout.svelte         # 전역 레이아웃
│   │   ├── +page.svelte           # 홈페이지
│   │   └── assessment/
│   │       └── +page.svelte       # 검사 페이지 (메인)
│   ├── app.html                   # HTML 템플릿
│   └── app.css                    # 전역 스타일
├── static/                        # 정적 파일
├── docs/                          # 프로젝트 문서
│   ├── project.md                 # 프로젝트 개요
│   └── DSL.md                     # 도메인 언어 정의
├── .env.example                   # 환경 변수 템플릿
├── package.json
└── README.md
```

## 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────┐
│        Pages (Routes)               │  ← 사용자 인터페이스
├─────────────────────────────────────┤
│     Components (UI Layer)           │  ← 재사용 가능한 UI
├─────────────────────────────────────┤
│      Stores (State Layer)           │  ← 전역 상태 관리
├─────────────────────────────────────┤
│    Services (Business Logic)        │  ← API 호출, 데이터 처리
├─────────────────────────────────────┤
│       Data (Data Layer)             │  ← 정적 데이터, 상수
└─────────────────────────────────────┘
```

### 주요 데이터 플로우

1. **명령 입력** → CommandInput 컴포넌트
2. **명령 처리** → commandProcessor.js (OpenRouter API)
3. **상태 업데이트** → Stores (testStore, commandStore)
4. **UI 반영** → 컴포넌트 리렌더링
5. **TTS 실행** → ttsService.js (자동 읽기)

## 설치 및 실행

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
```

`.env` 파일에 OpenRouter API 키를 추가하세요:

```env
VITE_OPENROUTER_API_KEY=your_api_key_here
VITE_MODEL_NAME=openai/gpt-4
VITE_APP_URL=http://localhost:5173
```

### 2. 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저 자동 열기
npm run dev -- --open
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 3. 프로덕션 빌드

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 사용 방법

### 검사 페이지 접속

1. 홈페이지(`/`)에서 "검사 시작" 버튼 클릭
2. 검사 페이지(`/assessment`)로 이동

### 명령 예시

#### 답변 체크
- "A를 체크해줘"
- "보통"
- "매우 그렇다"

#### 네비게이션
- "다음 문항"
- "이전 문항"
- "3번으로 가줘"

#### 조회
- "진행 상황 알려줘"
- "앞으로 몇 문항 남았어?"
- "3번 답변 뭐였어?"

#### 복합 명령
- "C를 체크한 후 8번으로 넘어가줘"
- "보통 체크하고 다음으로 가줘"

## 개발 단계 (Phases)

### ✅ Phase 1-2: 텍스트 명령 처리 (완료)
- SvelteKit 프로젝트 설정
- OpenRouter API 연동
- Tool Calling 구현
- 기본 UI 컴포넌트
- 상태 관리 (Svelte Stores)
- Multi-tool calling 지원
- 스마트 네비게이션

### 🚧 Phase 3: 음성 인터페이스 (예정)
- Whisper API 연동 (음성 입력)
- OpenAI TTS API 연동 (음성 출력)
- 음성 녹음 UI 개선

### 📅 Phase 4: 데이터베이스 연동 (예정)
- Supabase 연동
- 사용자 세션 관리
- 검사 결과 저장
- 통계 분석

## 주요 기능 상세

### 1. LLM Tool Calling

OpenRouter API를 통해 자연어 명령을 구조화된 함수 호출로 변환:

- `check_answer`: 답변 체크
- `next_question`: 다음 문항
- `previous_question`: 이전 문항
- `go_to_question`: 특정 문항 이동
- `get_progress`: 진행 상황 조회
- `get_answer`: 특정 답변 조회

### 2. 스마트 네비게이션

답변 후 미답변 문항으로 자동 이동:
1. 현재 문항 이후 탐색
2. 없으면 처음부터 탐색
3. 모든 답변 완료 시 안내 메시지

### 3. TTS 시뮬레이션

Phase 3 준비를 위한 TTS 로그:
- 문항 자동 읽기
- 선택지 안내
- 응답 메시지 읽기

## 개발 도구

### Debug Panel

화면 우측 하단의 "Debug ON" 버튼으로 활성화:
- 현재 검사 상태
- 답변 현황
- 마지막 명령
- 성공/에러 메시지
- Store 정보 (Raw JSON)

### Command History

"히스토리 보기" 버튼으로 확인:
- 실행한 명령 목록
- 타임스탬프
- 음성 텍스트 (Phase 3)

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API 키 | (필수) |
| `VITE_MODEL_NAME` | 사용할 LLM 모델 | `openai/gpt-4` |
| `VITE_APP_URL` | 애플리케이션 URL | `http://localhost:5173` |

## 문제 해결

### API 호출 실패
- `.env` 파일에 올바른 API 키가 설정되어 있는지 확인
- 개발 서버 재시작 (`npm run dev`)

### 명령이 인식되지 않음
- Debug Panel에서 마지막 명령 확인
- 콘솔에서 OpenRouter 요청/응답 로그 확인

### 스타일이 깨짐
- 브라우저 캐시 삭제
- `node_modules` 삭제 후 재설치

## 라이선스

MIT License

## 기여

이슈 및 풀 리퀘스트는 언제든지 환영합니다.
