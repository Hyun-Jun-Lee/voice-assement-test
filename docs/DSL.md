# 심리검사 음성 인터페이스 시스템 DSL

## 1. 시스템 아키텍처
```dsl
system Architecture {
    frontend: SvelteKit
    ai: OpenAI GPT-4 (Function Calling)
    future_integration: [
        Whisper API (STT),
        Supabase (Backend/DB)
    ]
    structure: Frontend-First with Progressive Enhancement
    
    phases: [
        Phase1_TextCommand,    // 텍스트 명령 + LLM Tool Calling
        Phase2_UICompletion,   // UI/UX 완성
        Phase3_VoiceSTT,       // 음성 인식 추가
        Phase4_DataPersistence // DB 연동
    ]
}
```

## 2. 데이터 스키마 (Phase 4용 - 현재 미사용)
```dsl
database Schema {
    // Phase 4에서 Supabase 연동 시 사용할 스키마
    
    table test_sessions {
        id: UUID PRIMARY KEY
        started_at: DATETIME
        completed_at: DATETIME
        status: TEXT  // "in_progress" | "completed" | "abandoned"
        total_questions: INTEGER
        created_at: DATETIME
        updated_at: DATETIME
    }
    
    table answers {
        id: UUID PRIMARY KEY
        session_id: UUID FOREIGN KEY -> test_sessions(id)
        question_id: INTEGER
        answer: TEXT  // "A" | "B" | "C" | "D" | "E"
        timestamp: DATETIME
        created_at: DATETIME
    }
    
    table command_logs {
        id: UUID PRIMARY KEY
        session_id: UUID FOREIGN KEY -> test_sessions(id)
        command_text: TEXT
        llm_action: TEXT
        success: BOOLEAN
        error_message: TEXT
        timestamp: DATETIME
    }
}
```

## 3. 모듈별 정의
### 3.1 Data 모듈 (정적 데이터)
```dsl
module Data {
    
    // 더미 문항 데이터
    data Questions {
        file: "src/lib/data/questions.js"
        
        structure {
            id: Integer
            text: String
            category: String
            choices: List<{
                value: String  // "A" | "B" | "C" | "D" | "E"
                label: String  // "전혀 그렇지 않다" ~ "매우 그렇다"
            }>
        }
        
        sample_count: 10
        categories: ["스트레스", "대인관계", "수면", "성격", "감정표현"]
        
        utility_functions {
            getQuestionById(id: Integer) -> Question
            getTotalQuestions() -> Integer
            getQuestionsByCategory(category: String) -> List<Question>
        }
    }
    
    // 상수 정의
    data Constants {
        file: "src/lib/data/constants.js"
        
        APP_CONFIG {
            APP_NAME: "심리검사 음성 인터페이스"
            VERSION: "1.0.0"
            LANGUAGE: "ko-KR"
        }
        
        VOICE_CONFIG {
            MAX_RECORDING_TIME: 10000  // 10초
            MIN_CONFIDENCE: 0.7
            LANGUAGE: "ko-KR"
        }
        
        COMMAND_PATTERNS {
            CHECK_ANSWER: /(\d+)번.*([A-E]|[가-마])/
            NEXT: /(다음|담|넥스트)/
            PREVIOUS: /(이전|앞|백)/
            GO_TO: /(\d+)번.*가/
            SKIP: /(건너뛰|스킵|패스)/
        }
        
        FEEDBACK_MESSAGES {
            LISTENING: "🎤 듣고 있습니다..."
            PROCESSING: "⏳ 처리 중입니다..."
            SUCCESS: "✅ 명령이 실행되었습니다"
            ERROR: "❌ 오류가 발생했습니다"
            RETRY: "🔄 다시 한번 말씀해주세요"
            LOW_CONFIDENCE: "🤔 잘 이해하지 못했습니다"
        }
    }
}
```

### 3.2 Stores 모듈 (상태 관리)
```dsl
module Stores {
    
    // 검사 진행 상태
    store TestStore {
        file: "src/lib/stores/testStore.js"
        
        // 기본 상태 (writable)
        state {
            currentQuestion: Integer = 1
            answers: Object<Integer, String> = {}
            totalQuestions: Integer = 10
            testStartTime: DateTime = null
            sessionId: String = null
            testStatus: String = "idle"  // "idle" | "in_progress" | "completed"
        }
        
        // 계산된 상태 (derived)
        computed {
            progress: Float
                // (Object.keys(answers).length / totalQuestions) * 100
            
            answeredCount: Integer
                // Object.keys(answers).length
            
            isCompleted: Boolean
                // answeredCount === totalQuestions
            
            canGoNext: Boolean
                // currentQuestion < totalQuestions
            
            canGoPrevious: Boolean
                // currentQuestion > 1
        }
        
        // 액션 (상태 변경 함수)
        actions {
            startTest() -> Void
                // sessionId 생성, 초기 상태 설정
            
            setAnswer(questionNum: Integer, answer: String) -> Void
                // answers 업데이트
            
            removeAnswer(questionNum: Integer) -> Void
                // answers에서 제거
            
            nextQuestion() -> Void
                // currentQuestion += 1 (max 체크)
            
            previousQuestion() -> Void
                // currentQuestion -= 1 (min 체크)
            
            goToQuestion(questionNum: Integer) -> Void
                // currentQuestion = questionNum (범위 체크)
            
            completeTest() -> Void
                // testStatus = "completed"
            
            resetTest() -> Void
                // 모든 상태 초기화
        }
    }
    
    // 명령 처리 상태
    store CommandStore {
        file: "src/lib/stores/commandStore.js"
        
        state {
            isListening: Boolean = false
            isProcessing: Boolean = false
            lastTranscript: String = ""
            lastCommand: String = ""
            commandHistory: List<CommandHistoryItem> = []
            errorMessage: String = ""
            successMessage: String = ""
            confidence: Float = 0
        }
        
        computed {
            voiceStatus: String
                // "listening" | "processing" | "idle"
        }
        
        actions {
            startListening() -> Void
            stopListening() -> Void
            startProcessing() -> Void
            finishProcessing() -> Void
            setTranscript(text: String, confidence: Float) -> Void
            addToHistory(command: String, transcript: String) -> Void
            setError(message: String) -> Void
            setSuccess(message: String) -> Void
            clearMessages() -> Void
        }
        
        types {
            CommandHistoryItem {
                timestamp: DateTime
                command: String
                transcript: String
            }
        }
    }
    
    // UI 상태
    store UIStore {
        file: "src/lib/stores/uiStore.js"
        
        state {
            showCommandHistory: Boolean = false
            showHelp: Boolean = false
            theme: String = "light"  // "light" | "dark"
        }
        
        actions {
            toggleCommandHistory() -> Void
            toggleHelp() -> Void
            setTheme(theme: String) -> Void
        }
    }
}
```

### 3.3 Services 모듈 (비즈니스 로직)
```dsl
module Services {
    
    // LLM Tool Calling 처리
    service CommandProcessor {
        file: "src/lib/services/commandProcessor.js"
        
        // 메인 처리 함수
        async function processTextCommand(
            text: String,
            context: {
                current_question: Integer,
                total_questions: Integer
            }
        ) -> Result<CommandResult, Error>
        
        // OpenRouter API 설정
        config {
            OPENROUTER_API_KEY: env.VITE_OPENROUTER_API_KEY
            MODEL: env.VITE_MODEL_NAME
            ENDPOINT: "https://openrouter.ai/api/v1/chat/completions"
            HEADERS: {
                "HTTP-Referer": env.VITE_APP_URL  // Optional
                "X-Title": "심리검사 음성 인터페이스"  // Optional
            }
        }
        
        
        // 시스템 프롬프트 생성
        function buildSystemPrompt(context: Object) -> String
            prompt_template: |
                당신은 심리검사 음성 인터페이스 어시스턴트입니다.
                
                현재 상황:
                - 현재 문항: {current_question}번
                - 전체 문항: {total_questions}개
                
                사용자의 명령을 분석하고 적절한 도구를 호출하세요.
                
                답변 선택지는 A, B, C, D, E 입니다.
                "가", "나", "다", "라", "마"는 각각 A, B, C, D, E로 변환하세요.
        
        // Tool 정의
        tools {
            check_answer {
                name: "check_answer"
                description: "특정 문항에 답변을 체크합니다"
                parameters {
                    question_num: Integer  // 문항 번호
                    answer: String  // "A" | "B" | "C" | "D" | "E" | "가" | "나" | "다" | "라" | "마"
                }
                note: "한글 입력(가~마)은 자동으로 영문(A~E)으로 변환됩니다"
            }

            next_question {
                name: "next_question"
                description: "다음 문항으로 이동합니다"
            }

            previous_question {
                name: "previous_question"
                description: "이전 문항으로 이동합니다"
            }

            go_to_question {
                name: "go_to_question"
                description: "특정 문항 번호로 이동합니다"
                parameters {
                    question_num: Integer
                }
            }

            skip_question {
                name: "skip_question"
                description: "현재 문항을 건너뛰고 다음 문항으로 이동합니다 (선택사항)"
                parameters {
                    question_num?: Integer  // 선택적 - 명시하지 않으면 현재 문항
                }
            }

            get_progress {
                name: "get_progress"
                description: "현재 검사 진행 상황을 조회합니다 (완료된 문항 수, 남은 문항 수, 진행률)"
            }

            repeat_question {
                name: "repeat_question"
                description: "현재 문항을 다시 읽어줍니다"
            }

            get_answer {
                name: "get_answer"
                description: "특정 문항의 답변을 조회합니다"
                parameters {
                    question_num: Integer
                }
            }

            get_all_answers {
                name: "get_all_answers"
                description: "지금까지 답변한 모든 문항을 조회합니다"
            }
        }
        
        // Mock 처리 (API 키 없을 때)
        function mockProcess(text: String, context: Object) -> CommandResult
            patterns {
                next: /다음|넥스트/
                previous: /이전|앞|백/
                check_answer: /(\d+)번.*?([A-Ea-e가-마])/
                go_to: /(\d+)번.*(가|이동)/
            }
        
        // 결과 타입
        type CommandResult {
            action: String  // Tool 이름
            question_num?: Integer
            answer?: String
            message: String
            raw_response?: Object
        }
    }
    
    // Supabase 서비스 (Phase 4용)
    service SupabaseService {
        file: "src/lib/services/supabase.js"
        
        config {
            SUPABASE_URL: env.VITE_SUPABASE_URL
            SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY
        }
        
        // Phase 4에서 구현할 함수들
        async function createSession(sessionData: Object) -> Result<Session, Error>
        async function saveAnswer(answerData: Object) -> Result<Answer, Error>
        async function completeSession(sessionId: String, results: Object) -> Result<Session, Error>
        
        // Phase 1-2에서는 로컬 Mock 사용
        function isAvailable() -> Boolean
        function mockProcessVoice(payload: Object) -> Object
    }
}
```

### 3.4 Components 모듈
```dsl
module Components {
    
    // 검사 관련 컴포넌트
    components Assessment {
        folder: "src/lib/components/assessment/"
        
        component QuestionCard {
            file: "QuestionCard.svelte"
            
            props {
                question: Question
                questionNumber: Integer
                selectedAnswer?: String
            }
            
            displays {
                question_text: String
                choices: List<Choice>
                current_selection: highlighted
            }
        }
        
        component ProgressBar {
            file: "ProgressBar.svelte"
            
            props {
                progress: Float  // 0-100
            }
            
            displays {
                progress_bar: animated
                percentage_text: String
            }
        }
        
        component AnswerSummary {
            file: "AnswerSummary.svelte"
            
            props {
                questions: List<Question>
                answers: Object<Integer, String>
            }
            
            displays {
                answer_grid: 5x2 or dynamic
                answered_items: highlighted
            }
        }
    }
    
    // UI 공통 컴포넌트
    components UI {
        folder: "src/lib/components/ui/"
        
        component TextInput {
            file: "TextInput.svelte"
            
            props {
                value: String
                placeholder: String
                disabled: Boolean
                onSubmit: Function
            }
            
            features {
                enter_key_submit: true
                real_time_validation: true
            }
        }
        
        component Message {
            file: "Message.svelte"
            
            props {
                type: String  // "success" | "error" | "info"
                message: String
                autoHide: Boolean
            }
        }
        
        component Button {
            file: "Button.svelte"
            
            props {
                text: String
                variant: String  // "primary" | "secondary"
                disabled: Boolean
                onClick: Function
            }
        }
    }
    
    // 디버그 컴포넌트
    components Debug {
        folder: "src/lib/components/debug/"
        
        component DebugLog {
            file: "DebugLog.svelte"
            
            props {
                logs: List<LogEntry>
                maxHeight: String
            }
            
            displays {
                log_entries: scrollable_list
                timestamp: formatted
                type: colored_badge
                content: monospace
            }
            
            features {
                auto_scroll: true
                filter_by_type: true
                clear_logs: true
            }
        }
        
        component StateViewer {
            file: "StateViewer.svelte"
            
            props {
                stores: Object
            }
            
            displays {
                store_values: json_formatted
                real_time_updates: reactive
            }
        }
    }
}
```

### 3.5 Routes 모듈 (페이지)
```dsl
module Routes {
    
    // 라우팅 규칙
    routing {
        file_based: true
        convention: SvelteKit
        
        paths {
            "/": HomePage
            "/assessment": AssessmentPage
            "/result": ResultPage  // Phase 2+
        }
    }
    
    // 홈 페이지
    page HomePage {
        route: "/"
        file: "src/routes/+page.svelte"
        
        components {
            WelcomeCard {
                displays {
                    app_title: String
                    description: String
                    start_button: Button
                }
                
                actions {
                    startTest() -> navigateTo("/assessment")
                }
            }
        }
    }
    
    // 검사 페이지 (메인)
    page AssessmentPage {
        route: "/assessment"
        file: "src/routes/assessment/+page.svelte"
        
        layout {
            grid: "2-column"  // 좌측: 검사, 우측: 디버그
            responsive: true
        }
        
        // 좌측 영역
        section TestArea {
            components {
                ProgressBar {
                    source: testStore.progress
                }
                
                QuestionCard {
                    source: {
                        question: questions[testStore.currentQuestion - 1],
                        questionNumber: testStore.currentQuestion,
                        selectedAnswer: testStore.answers[testStore.currentQuestion]
                    }
                }
                
                TextInput {
                    placeholder: '예: "3번 A 체크", "다음 문항"'
                    onSubmit: handleTextCommand
                    disabled: commandStore.isProcessing
                }
                
                ExampleCommands {
                    buttons: [
                        "3번 A 체크",
                        "다음 문항",
                        "이전 문항",
                        "5번으로 가줘"
                    ]
                    onClick: fillTextInput
                }
                
                AnswerSummary {
                    source: {
                        questions: questions,
                        answers: testStore.answers
                    }
                }
            }
        }
        
        // 우측 영역
        section DebugArea {
            components {
                DebugLog {
                    source: testLogs
                    maxHeight: "600px"
                }
            }
        }
        
        // 로직
        logic {
            let textInput = ""
            let testLog = []
            
            // 텍스트 명령 처리
            async function handleTextCommand() {
                if (!textInput.trim()) return
                
                commandStore.startProcessing()
                
                try {
                    // 로그 추가
                    addLog("입력", textInput)
                    
                    // LLM 처리
                    const result = await processTextCommand(textInput, {
                        current_question: $currentQuestion,
                        total_questions: questions.length
                    })
                    
                    addLog("LLM 응답", JSON.stringify(result, null, 2))
                    
                    // 명령 실행
                    executeCommand(result)
                    
                    commandStore.setSuccess(result.message)
                    
                } catch (error) {
                    addLog("오류", error.message)
                    commandStore.setError(error.message)
                } finally {
                    commandStore.finishProcessing()
                    textInput = ""
                }
            }
            
            // 명령 실행
            function executeCommand(result) {
                switch (result.action) {
                    case "check_answer":
                        testActions.setAnswer(result.question_num, result.answer)
                        testActions.goToQuestion(result.question_num)
                        addLog("실행", `${result.question_num}번에 ${result.answer} 답변`)
                        break
                    case "next_question":
                        testActions.nextQuestion()
                        addLog("실행", "다음 문항")
                        break
                    case "previous_question":
                        testActions.previousQuestion()
                        addLog("실행", "이전 문항")
                        break
                    case "go_to_question":
                        testActions.goToQuestion(result.question_num)
                        addLog("실행", `${result.question_num}번으로 이동`)
                        break
                    case "skip_question":
                        testActions.nextQuestion()
                        addLog("실행", "문항 건너뛰기")
                        break
                    case "get_progress":
                        const progress = testStore.progress
                        const answered = testStore.answeredCount
                        const total = testStore.totalQuestions
                        commandStore.setSuccess(`현재 ${answered}/${total} 문항 완료 (${progress.toFixed(0)}%)`)
                        addLog("실행", "진행 상황 조회")
                        break
                    case "repeat_question":
                        // 현재 문항 다시 표시 (UI는 자동 반영)
                        addLog("실행", "현재 문항 반복")
                        break
                    case "get_answer":
                        const answer = testStore.answers[result.question_num]
                        if (answer) {
                            commandStore.setSuccess(`${result.question_num}번 문항 답변: ${answer}`)
                        } else {
                            commandStore.setSuccess(`${result.question_num}번 문항은 아직 답변하지 않았습니다`)
                        }
                        addLog("실행", `${result.question_num}번 답변 조회`)
                        break
                    case "get_all_answers":
                        const allAnswers = Object.entries(testStore.answers)
                            .map(([q, a]) => `${q}번: ${a}`)
                            .join(", ")
                        commandStore.setSuccess(`답변 현황: ${allAnswers || "아직 답변 없음"}`)
                        addLog("실행", "전체 답변 조회")
                        break
                }
            }
            
            // 로그 추가
            function addLog(type, content) {
                testLog = [
                    { timestamp: new Date(), type, content },
                    ...testLog
                ].slice(0, 50)
            }
        }
        
        // 생명주기
        lifecycle {
            onMount() {
                testActions.startTest()
            }
        }
    }
    
    // 결과 페이지 (Phase 2+)
    page ResultPage {
        route: "/result"
        file: "src/routes/result/+page.svelte"
        
        components {
            ResultSummary {
                source: testStore.answers
            }
            
            RestartButton {
                onClick: () => {
                    testActions.resetTest()
                    navigateTo("/assessment")
                }
            }
        }
    }
}
```

### 4. SvelteKit 프로젝트 구조
```dsl
application SvelteKitApp {
    
    main: "src/routes/+page.svelte"
    
    dependencies: [
        "@sveltejs/kit",
        "svelte",
        "vite"
    ]
    
    structure {
        /
        ├── src/
        │   ├── lib/
        │   │   ├── components/
        │   │   │   ├── assessment/
        │   │   │   │   ├── QuestionCard.svelte
        │   │   │   │   ├── ProgressBar.svelte
        │   │   │   │   └── AnswerSummary.svelte
        │   │   │   ├── ui/
        │   │   │   │   ├── TextInput.svelte
        │   │   │   │   ├── Message.svelte
        │   │   │   │   └── Button.svelte
        │   │   │   └── debug/
        │   │   │       ├── DebugLog.svelte
        │   │   │       └── StateViewer.svelte
        │   │   │
        │   │   ├── stores/
        │   │   │   ├── testStore.js
        │   │   │   ├── commandStore.js
        │   │   │   └── uiStore.js
        │   │   │
        │   │   ├── services/
        │   │   │   ├── commandProcessor.js
        │   │   │   └── supabase.js
        │   │   │
        │   │   ├── data/
        │   │   │   ├── questions.js
        │   │   │   └── constants.js
        │   │   │
        │   │   └── utils/
        │   │       └── helpers.js
        │   │
        │   ├── routes/
        │   │   ├── +page.svelte          // 홈
        │   │   ├── assessment/
        │   │   │   └── +page.svelte      // 검사 페이지
        │   │   └── result/
        │   │       └── +page.svelte      // 결과 페이지
        │   │
        │   ├── app.html
        │   └── app.css
        │
        ├── static/
        │   └── favicon.png
        │
        ├── .env
        ├── .env.example
        ├── svelte.config.js
        ├── vite.config.js
        └── package.json
    }
    
    startup {
        initializeStores()
        loadQuestions()
        checkEnvironmentVariables()
    }
}
```

### 5. 주요 워크플로우
```dsl
workflow Phase1_TextBasedTesting {
    1. 사용자가 /assessment 접속
    2. testActions.startTest() 호출
       - sessionId 생성
       - 상태 초기화
    3. 텍스트 입력창에 명령 입력
       예: "3번 A 체크"
    4. handleTextCommand() 실행
       - commandStore.startProcessing()
       - processTextCommand() 호출 (LLM)
       - OpenAI Function Calling
       - Tool 결과 파싱
    5. executeCommand() 실행
       - testActions.setAnswer(3, "A")
       - testActions.goToQuestion(3)
    6. Store 업데이트 → UI 자동 반영
    7. DebugLog에 전 과정 기록
}

workflow CommandProcessing {
    1. 텍스트 입력: "다음 문항으로 넘어가줘"
    2. processTextCommand() 호출
       Input: {
           text: "다음 문항으로 넘어가줘",
           context: {
               current_question: 3,
               total_questions: 10
           }
       }
    3. OpenAI API 호출
       - System Prompt: 역할 및 컨텍스트
       - User Message: 사용자 명령
       - Tools: 4가지 도구 정의
    4. LLM 응답
       {
           tool_calls: [{
               function: {
                   name: "next_question"
               }
           }]
       }
    5. 결과 파싱
       {
           action: "next_question",
           message: "다음 문항으로 이동"
       }
    6. executeCommand() 호출
       - testActions.nextQuestion()
    7. currentQuestion: 3 → 4
    8. UI 자동 업데이트
}

workflow ErrorHandling {
    1. LLM이 명령을 이해하지 못한 경우
       {
           action: "unknown",
           message: "명령을 이해하지 못했습니다"
       }
    2. commandStore.setError() 호출
    3. 오류 메시지 UI에 표시
    4. DebugLog에 기록
}
```

```dsl
workflow TestCompletion {
    1. 사용자가 10번째 문항 답변
    2. testStore.isCompleted = true
    3. Phase 2에서 자동으로 /result 페이지 이동
    4. Phase 1에서는 AnswerSummary에 완료 표시
}
```

### 6. 환경 변수 관리
```dsl
environment EnvironmentVariables {
    
    // Phase 1-2: OpenRouter 필요
    phase1_2 {
        VITE_OPENROUTER_API_KEY: String
            required: false
            fallback: "Mock 모드로 작동"
            description: "OpenRouter API 키 (없으면 로컬 파싱)"

        VITE_MODEL_NAME: String
            required: false
            default: "openai/gpt-4"
            description: "사용할 LLM 모델 이름"

        VITE_APP_URL: String
            required: false
            default: "http://localhost:5173"
            description: "앱 URL (OpenRouter HTTP-Referer용)"
    }
    
    // Phase 4: Supabase 추가
    phase4 {
        VITE_SUPABASE_URL: String
            required: true
            description: "Supabase 프로젝트 URL"
        
        VITE_SUPABASE_ANON_KEY: String
            required: true
            description: "Supabase Anonymous Key"
    }
    
    // .env.example 파일
    example_file: |
        # Phase 1-2: OpenRouter 설정
        VITE_OPENROUTER_API_KEY=
        VITE_MODEL_NAME=openai/gpt-4
        VITE_APP_URL=http://localhost:5173

        # Phase 4 (나중에): Supabase 설정
        VITE_SUPABASE_URL=
        VITE_SUPABASE_ANON_KEY=
}
```

### 7. 스타일 가이드
```dsl
styling StyleGuide {
    
    design_system {
        colors {
            primary: "#4CAF50"  // 그린
            secondary: "#2196F3"  // 블루
            success: "#8BC34A"
            error: "#f44336"
            background: "#ffffff"
            surface: "#f5f5f5"
        }
        
        typography {
            font_family: "system-ui, -apple-system, sans-serif"
            sizes {
                h1: "2rem"
                h2: "1.5rem"
                h3: "1.25rem"
                body: "1rem"
                small: "0.875rem"
            }
        }
        
        spacing {
            unit: "0.25rem"
            scale: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]
        }
        
        components {
            card {
                background: "white"
                border_radius: "8px"
                box_shadow: "0 2px 4px rgba(0,0,0,0.1)"
                padding: "1.5rem"
            }
            
            button {
                primary {
                    background: "#4CAF50"
                    color: "white"
                    hover: "#45a049"
                }
                secondary {
                    background: "#2196F3"
                    color: "white"
                    hover: "#1976D2"
                }
            }
            
            input {
                border: "2px solid #e0e0e0"
                focus_border: "#4CAF50"
                padding: "0.75rem"
                border_radius: "4px"
            }
        }
    }
    
    layout {
        test_page {
            grid: "1fr 400px"  // 메인 | 디버그
            gap: "2rem"
            padding: "2rem"
            max_width: "1400px"
        }
        
        responsive {
            mobile: "< 768px" {
                grid: "1fr"  // 단일 컬럼
                debug_section: "collapsible"
            }
        }
    }
}
```

### 8. 타입 정의
```dsl
types TypeDefinitions {
    
    // 문항 타입
    type Question {
        id: Integer
        text: String
        category: String
        choices: List<Choice>
    }
    
    type Choice {
        value: String  // "A" | "B" | "C" | "D" | "E"
        label: String
    }
    
    // 명령 결과
    type CommandResult {
        action: CommandAction
        question_num?: Integer
        answer?: String
        message: String
        raw_response?: Object
    }
    
    type CommandAction =
        | "check_answer"
        | "next_question"
        | "previous_question"
        | "go_to_question"
        | "skip_question"
        | "get_progress"
        | "repeat_question"
        | "get_answer"
        | "get_all_answers"
        | "unknown"
    
    // 로그 엔트리
    type LogEntry {
        timestamp: DateTime
        type: LogType
        content: String
    }
    
    type LogType = "입력" | "LLM 응답" | "실행" | "오류"
    
    // Store 타입
    type TestState {
        currentQuestion: Integer
        answers: Map<Integer, String>
        totalQuestions: Integer
        testStartTime: DateTime
        sessionId: String
        testStatus: TestStatus
    }
    
    type TestStatus = "idle" | "in_progress" | "completed"
    
    type CommandState {
        isListening: Boolean
        isProcessing: Boolean
        lastTranscript: String
        lastCommand: String
        commandHistory: List<CommandHistoryItem>
        errorMessage: String
        successMessage: String
        confidence: Float
    }
    
    type CommandHistoryItem {
        timestamp: DateTime
        command: String
        transcript: String
    }
}
```

### 9. 개발 가이드
```dsl
development DevelopmentGuide {
    
    // Phase별 개발 순서
    phases {
        Phase1_Foundation {
            priority: "HIGHEST"
            tasks: [
                "프로젝트 구조 생성",
                "더미 데이터 작성",
                "Stores 구현",
                "CommandProcessor 구현 (OpenAI 연동)",
                "TestPage 기본 UI",
                "DebugLog 컴포넌트"
            ]
            completion_criteria: [
                "텍스트로 4가지 명령 실행 가능",
                "LLM Tool Calling 정상 작동",
                "UI 즉시 반영",
                "디버그 로그 확인 가능"
            ]
        }
        
        Phase2_UIPolish {
            priority: "HIGH"
            tasks: [
                "모든 컴포넌트 스타일링",
                "애니메이션 추가",
                "반응형 레이아웃",
                "에러 핸들링 개선",
                "사용자 피드백 향상",
                "ResultPage 구현"
            ]
            completion_criteria: [
                "직관적인 UI/UX",
                "명확한 시각적 피드백",
                "모바일 대응",
                "10개 문항 완주 가능"
            ]
        }
        
        Phase3_Voice {
            priority: "MEDIUM"
            tasks: [
                "음성 녹음 컴포넌트",
                "Whisper API 연동",
                "Phase 1 로직 재사용",
                "음성 인식 UI 추가"
            ]
        }
        
        Phase4_Persistence {
            priority: "LOW"
            tasks: [
                "Supabase 연동",
                "DB 저장 로직",
                "세션 관리",
                "통계 대시보드"
            ]
        }
    }
    
    // 개발 원칙
    principles {
        1. "단계적 개발 - 각 Phase 독립 작동"
        2. "코어 기능 우선 - LLM > Voice > DB"
        3. "빠른 반복 - 텍스트로 빠른 테스트"
        4. "명확한 구조 - 관심사 분리"
    }
    
    // 테스트 전략
    testing {
        manual_testing {
            method: "브라우저에서 직접 테스트"
            focus: [
                "다양한 명령 패턴",
                "UI 반응성",
                "상태 동기화",
                "에러 케이스"
            ]
        }
        
        test_cases {
            basic_commands: [
                "3번 A 체크",
                "다음 문항",
                "이전 문항",
                "5번으로 가줘"
            ]
            
            variations: [
                "3번 문항 A로 체크해줘",
                "세번째 A",
                "3번에 가 선택",
                "담 문항"
            ]
            
            edge_cases: [
                "잘못된 문항 번호",
                "범위 밖 이동",
                "빈 입력",
                "이해 불가능한 명령"
            ]
        }
    }
}
```

### 10. 아키텍처 원칙 및 책임 분리
```dsl
architecture ResponsibilityPrinciples {
    
    // 레이어별 책임 정의
    layer_responsibilities {
        
        Data {
            responsibility: "정적 데이터 제공"
            can_do: [
                "상수 정의",
                "더미 데이터 제공",
                "유틸리티 함수 (순수 함수)"
            ]
            cannot_do: [
                "Store 접근/변경",
                "API 호출",
                "UI 렌더링"
            ]
        }
        
        Stores {
            responsibility: "애플리케이션 상태 관리"
            can_do: [
                "상태 정의 (writable, derived)",
                "액션 함수 정의 (상태 변경 로직)",
                "상태 구독/업데이트"
            ]
            cannot_do: [
                "API 호출",
                "비즈니스 로직 구현",
                "UI 렌더링"
            ]
            note: |
                Store 액션은 상태 변경만 담당합니다.
                예: testActions.setAnswer()는 answers 객체만 업데이트
        }
        
        Services {
            responsibility: "외부 시스템 연동 및 데이터 변환"
            can_do: [
                "API 호출 (OpenRouter, Supabase)",
                "응답 파싱 및 변환",
                "에러 처리",
                "결과 반환"
            ]
            cannot_do: [
                "Store 직접 변경 ⚠️ 중요!",
                "UI 업데이트",
                "라우팅",
                "사용자 입력 처리"
            ]
            note: |
                Service는 순수한 비즈니스 로직만 담당합니다.
                결과를 반환하기만 하고, Store 변경은 호출자(Page)의 책임입니다.
        }
        
        Components {
            responsibility: "UI 렌더링 및 사용자 상호작용"
            can_do: [
                "Store 구독 (읽기)",
                "이벤트 핸들링",
                "자식 컴포넌트로 props 전달",
                "로컬 UI 상태 관리"
            ]
            cannot_do: [
                "Store 직접 변경 (액션 호출은 가능)",
                "API 직접 호출",
                "복잡한 비즈니스 로직"
            ]
        }
        
        Pages {
            responsibility: "전체 흐름 조율 (오케스트레이션)"
            can_do: [
                "Service 호출",
                "Service 결과 받아서 Store 액션 호출 ⭐",
                "컴포넌트 조합",
                "라우팅",
                "전체 페이지 로직"
            ]
            cannot_do: [
                "복잡한 비즈니스 로직 (Service에 위임)",
                "직접 API 호출 (Service 사용)"
            ]
            note: |
                Page는 "지휘자" 역할입니다.
                Service를 호출하고, 결과를 받아서 Store를 업데이트합니다.
        }
    }
    
    // 데이터 흐름 원칙
    data_flow {
        rule_1: "단방향 데이터 흐름"
            flow: |
                User Input → Page → Service → API
                           ↓                    ↓
                      Store Action ← Result ←─┘
                           ↓
                        UI Update
        
        rule_2: "Store 변경은 Page에서만"
            explanation: |
                Service는 결과만 반환하고, Page가 그 결과를 보고
                적절한 Store 액션을 호출합니다.
            
            example: |
                ✅ 올바른 방법:
                // Service
                export async function processCommand(text) {
                    const result = await callAPI(text);
                    return { action: "check_answer", data: {...} };
                }
                
                // Page
                const result = await processCommand(text);
                testActions.setAnswer(result.data);  // Store 변경
                
                ❌ 잘못된 방법:
                // Service
                export async function processCommand(text) {
                    const result = await callAPI(text);
                    testActions.setAnswer(result.data);  // ❌ Service에서 Store 변경
                    return result;
                }
        
        rule_3: "Service는 순수 함수처럼"
            explanation: |
                Service 함수는 같은 입력에 대해 (API 응답이 같다면)
                항상 같은 결과를 반환해야 합니다.
                부작용(side effect)은 최소화합니다.
        
        rule_4: "Component는 Store를 읽기만"
            explanation: |
                Component는 Store를 구독($변수)하여 읽을 수 있지만,
                Store 변경은 상위 Page에서 전달받은 이벤트 핸들러를 통해서만 합니다.
    }
    
    // 실제 코드 예시
    examples {
        
        example_1: "명령 처리 전체 흐름" {
            
            // 1. Service: 비즈니스 로직만
            service_code: |
                // src/lib/services/commandProcessor.js
                export async function processTextCommand(text, context) {
                    // OpenRouter API 호출
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        body: JSON.stringify({
                            model: 'openai/gpt-4',
                            messages: [...],
                            tools: [...]
                        })
                    });
                    
                    const data = await response.json();
                    const toolCall = data.choices[0].message.tool_calls[0];
                    const args = JSON.parse(toolCall.function.arguments);
                    
                    // 결과만 반환 (Store 변경 안 함!)
                    return {
                        action: toolCall.function.name,
                        question_num: args.question_num,
                        answer: args.answer,
                        message: "..."
                    };
                }
            
            // 2. Page: 오케스트레이션
            page_code: |
                <!-- src/routes/assessment/+page.svelte -->
                <script>
                    import { testActions } from '$lib/stores/testStore';
                    import { processTextCommand } from '$lib/services/commandProcessor';
                    
                    async function handleTextCommand() {
                        // Service 호출
                        const result = await processTextCommand(textInput, context);
                        
                        // 결과 받아서 Store 액션 호출 (여기서 Store 변경!)
                        executeCommand(result);
                    }
                    
                    function executeCommand(result) {
                        switch (result.action) {
                            case "check_answer":
                                testActions.setAnswer(result.question_num, result.answer);
                                testActions.goToQuestion(result.question_num);
                                break;
                            case "next_question":
                                testActions.nextQuestion();
                                break;
                        }
                    }
                </script>
            
            // 3. Store: 상태 관리만
            store_code: |
                // src/lib/stores/testStore.js
                export const answers = writable({});
                
                export const testActions = {
                    setAnswer: (questionNum, answer) => {
                        answers.update(current => ({
                            ...current,
                            [questionNum]: answer
                        }));
                    }
                };
        }
        
        example_2: "Component와 Page의 상호작용" {
            
            component_code: |
                <!-- src/lib/components/ui/TextInput.svelte -->
                <script>
                    export let value = "";
                    export let onSubmit;  // Page에서 전달받은 함수
                    
                    function handleKeydown(e) {
                        if (e.key === 'Enter') {
                            onSubmit();  // Page의 함수 호출 (Store 변경 안 함)
                        }
                    }
                </script>
                
                <input 
                    bind:value
                    on:keydown={handleKeydown}
                />

            page_code: |
                <!-- src/routes/assessment/+page.svelte -->
                <script>
                    let textInput = "";
                    
                    async function handleSubmit() {
                        // 여기서 Service 호출하고 Store 업데이트
                        const result = await processTextCommand(textInput);
                        executeCommand(result);
                    }
                </script>
                
                <TextInput 
                    bind:value={textInput}
                    onSubmit={handleSubmit}
                />
        }
    }
    
    // 안티패턴 (하지 말아야 할 것들)
    anti_patterns {
        
        anti_pattern_1: "Service에서 Store 직접 변경" {
            code: |
                // ❌ 나쁜 예
                export async function processCommand(text) {
                    const result = await callAPI(text);
                    testActions.setAnswer(3, "A");  // Service에서 Store 변경
                    return result;
                }
            
            problems: [
                "Service 재사용 불가",
                "테스트 어려움",
                "예측 불가능한 부작용",
                "책임 혼재"
            ]
        }
        
        anti_pattern_2: "Component에서 Store 직접 변경" {
            code: |
                <!-- ❌ 나쁜 예 -->
                <script>
                    import { testActions } from '$lib/stores/testStore';
                    
                    function handleClick() {
                        testActions.setAnswer(3, "A");  // Component에서 Store 직접 변경
                    }
                </script>
                <button on:click={handleClick}>체크</button>
            
            problems: [
                "데이터 흐름 파악 어려움",
                "컴포넌트가 Store에 강하게 결합",
                "재사용성 저하"
            ]
        }
        
        anti_pattern_3: "Page에서 직접 API 호출" {
            code: |
                <!-- ❌ 나쁜 예 -->
                <script>
                    async function handleCommand() {
                        // Page에서 직접 API 호출
                        const response = await fetch('https://openrouter.ai/...');
                        const data = await response.json();
                        // ...
                    }
                </script>
            
            problems: [
                "비즈니스 로직이 Page에 산재",
                "코드 중복 가능성",
                "테스트 어려움"
            ]
        }
    }
}
```


### 11. Claude Code 전달용 체크리스트
dslchecklist ClaudeCodeInstructions {
    
    project_setup {
        ✓ SvelteKit 프로젝트 생성
        ✓ 폴더 구조 생성 (lib/components, stores, services, data)
        ✓ 환경 변수 설정 (.env, .env.example)
    }
    
    data_layer {
        ✓ questions.js - 10개 더미 문항
        ✓ constants.js - 상수 정의
    }
    
    stores_layer {
        ✓ testStore.js - 검사 상태 관리
        ✓ commandStore.js - 명령 상태 관리
        ✓ uiStore.js - UI 상태 관리
    }
    
    services_layer {
        ✓ commandProcessor.js - LLM Tool Calling
          - OpenAI Function Calling 구현
          - Mock 처리 포함
    }
    
    components_layer {
        ✓ assessment/QuestionCard.svelte
        ✓ assessment/ProgressBar.svelte
        ✓ assessment/AnswerSummary.svelte
        ✓ ui/TextInput.svelte
        ✓ ui/Message.svelte
        ✓ ui/Button.svelte
        ✓ debug/DebugLog.svelte
    }
    
    pages_layer {
        ✓ routes/+page.svelte - 홈
        ✓ routes/assessment/+page.svelte - 메인 검사 페이지
          - 2-column 레이아웃
          - 텍스트 입력
          - 예시 버튼
          - 디버그 로그
    }
    
    styling {
        ✓ app.css - 전역 스타일
        ✓ 컴포넌트별 <style> 섹션
        ✓ 그린 계열 색상
        ✓ 카드 디자인
    }
    
    success_criteria {
        ✓ npm run dev 정상 실행
        ✓ /assessment 페이지 접속 가능
        ✓ 텍스트 명령으로 4가지 동작 실행
        ✓ UI 즉시 반영
        ✓ 디버그 로그 확인
        ✓ OpenAI 없어도 Mock 모드 작동
    }
}