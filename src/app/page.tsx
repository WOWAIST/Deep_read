"use client";

import { useState } from "react";
import { analyzeDocument } from "@/features/document";
import { generateQuestions, evaluateAnswer } from "@/features/evaluation";
import type { DocumentChunk, Vocabulary, LearningQuestion, EvaluationResult } from "@/shared/types";

type Phase = "input" | "analyzing" | "learning" | "evaluating" | "feedback" | "complete";

const SAMPLE_TEXT = `React Hooks are functions that let you use state and other React features in function components. Before Hooks, you could only use state in class components.

useState is a Hook that lets you add state to function components. It returns an array with two elements: the current state value and a function to update it.

useEffect is a Hook that lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React class components.

The Rules of Hooks are important: only call Hooks at the top level, and only call Hooks from React function components or custom Hooks. These rules ensure that Hook state is correctly preserved between renders.

Custom Hooks let you extract component logic into reusable functions. A custom Hook is a JavaScript function whose name starts with "use" and that may call other Hooks inside it.`;

export default function Home() {
  const [phase, setPhase] = useState<Phase>("input");
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<LearningQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [error, setError] = useState("");

  const currentChunk = chunks[currentChunkIndex];
  const progressPct = chunks.length > 0 ? Math.round((currentChunkIndex / chunks.length) * 100) : 0;

  async function handleAnalyze() {
    if (!inputText.trim()) return;
    setPhase("analyzing");
    setError("");
    try {
      const result = await analyzeDocument(inputText);
      setChunks(result.chunks);
      setVocabulary(result.vocabulary);
      const qResult = await generateQuestions(result.chunks[0].content);
      setCurrentQuestion(qResult.questions[0] ?? null);
      setCurrentChunkIndex(0);
      setPhase("learning");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setPhase("input");
    }
  }

  async function handleSubmitAnswer() {
    if (!currentQuestion || !userAnswer.trim() || !currentChunk) return;
    setPhase("evaluating");
    setError("");
    try {
      const result = await evaluateAnswer(currentChunk.content, currentQuestion.question, userAnswer, difficulty);
      setEvaluation(result);
      setPhase("feedback");
    } catch (e) {
      setError(e instanceof Error ? e.message : "평가 중 오류가 발생했습니다.");
      setPhase("learning");
    }
  }

  async function handleNextChunk() {
    const nextIndex = currentChunkIndex + 1;
    if (nextIndex >= chunks.length) { setPhase("complete"); return; }
    setCurrentChunkIndex(nextIndex);
    setUserAnswer("");
    setEvaluation(null);
    setDifficulty(1);
    setPhase("analyzing");
    try {
      const qResult = await generateQuestions(chunks[nextIndex].content);
      setCurrentQuestion(qResult.questions[0] ?? null);
      setPhase("learning");
    } catch { setPhase("learning"); }
  }

  function handleRetry() {
    setDifficulty((d) => Math.min(d + 1, 4));
    setUserAnswer("");
    setEvaluation(null);
    setPhase("learning");
  }

  if (phase === "analyzing" || phase === "evaluating") {
    return (
      <div style={styles.page}>
        <div style={styles.loadingWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadingTitle}>{phase === "analyzing" ? "문서 분석 중" : "답변 평가 중"}</p>
          <p style={styles.loadingDesc}>llama3가 처리하고 있어요. 잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (phase === "input") {
    return (
      <div style={styles.page}>
        <div style={styles.inputContainer}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={styles.badge}>Beta</div>
            <h1 style={styles.heroTitle}>영어 기술 문서,<br />번역 없이 읽는 법</h1>
            <p style={styles.heroDesc}>
              AI 코치가 원문 그대로 이해할 수 있도록 단계별로 도와드려요.<br />
              번역이 아닌 진짜 학습을 경험해보세요.
            </p>
          </div>

          {/* Input Card */}
          <div style={styles.card}>
            <label style={styles.label}>학습할 기술 문서</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="영어 기술 문서 내용을 붙여넣으세요..."
              style={styles.textarea}
              rows={10}
            />
            {error && <p style={styles.errorText}>{error}</p>}
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim()}
              style={inputText.trim() ? styles.primaryBtn : { ...styles.primaryBtn, opacity: 0.4, cursor: "not-allowed" }}
            >
              학습 시작하기
            </button>
          </div>

          {/* Features */}
          <div style={styles.featureGrid}>
            {[
              { icon: "📖", title: "원문 중심 학습", desc: "번역 없이 영어 원문을 그대로" },
              { icon: "🧠", title: "AI 이해도 검증", desc: "소크라테스식 질문으로 확인" },
              { icon: "⚡", title: "실무 연결", desc: "내 프로젝트에 바로 적용" },
            ].map((f) => (
              <div key={f.title} style={styles.featureCard}>
                <span style={{ fontSize: 28, marginBottom: 12, display: "block" }}>{f.icon}</span>
                <p style={styles.featureTitle}>{f.title}</p>
                <p style={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={styles.pageTitle}>학습 완료!</h2>
            <p style={styles.pageDesc}>총 {chunks.length}개 섹션을 완주했어요.</p>
          </div>

          {vocabulary.length > 0 && (
            <div style={styles.card}>
              <p style={styles.sectionLabel}>오늘 학습한 핵심 용어</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {vocabulary.map((v, i) => (
                  <div key={i} style={styles.vocabItem}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={styles.termBadge}>{v.term}</span>
                    </div>
                    <p style={styles.vocabMeaning}>{v.meaning}</p>
                    <p style={styles.vocabExample}>💼 {v.practicalExample}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => { setPhase("input"); setInputText(""); setChunks([]); setVocabulary([]); }} style={{ ...styles.primaryBtn, marginTop: 24 }}>
            새 문서 학습하기
          </button>
        </div>
      </div>
    );
  }

  // learning / feedback phase
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <span style={styles.topBarLogo}>TechDoc Coach</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={styles.progressLabel}>{currentChunkIndex + 1} / {chunks.length}</span>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Step 1: 원문 */}
        <div style={styles.card}>
          <div style={styles.stepHeader}>
            <span style={styles.stepBadge}>STEP 1</span>
            <span style={styles.stepTitle}>영어 원문</span>
          </div>
          {currentChunk?.heading && (
            <p style={styles.chunkHeading}>{currentChunk.heading}</p>
          )}
          <p style={styles.chunkText}>{currentChunk?.content}</p>
        </div>

        {/* Step 2: 핵심 용어 */}
        {vocabulary.length > 0 && (
          <div style={styles.card}>
            <div style={styles.stepHeader}>
              <span style={{ ...styles.stepBadge, background: "#F2F4F6", color: "#4E5968" }}>STEP 2</span>
              <span style={styles.stepTitle}>핵심 용어</span>
            </div>
            <div style={styles.vocabTable}>
              <div style={styles.vocabTableHeader}>
                <span style={{ flex: "0 0 120px" }}>용어</span>
                <span style={{ flex: 1 }}>의미</span>
                <span style={{ flex: 1 }}>실무 예시</span>
              </div>
              {vocabulary.map((v, i) => (
                <div key={i} style={styles.vocabTableRow}>
                  <span style={{ flex: "0 0 120px" }}>
                    <span style={styles.termBadge}>{v.term}</span>
                  </span>
                  <span style={{ flex: 1, color: "#333D4B", fontSize: 14 }}>{v.meaning}</span>
                  <span style={{ flex: 1, color: "#8B95A1", fontSize: 13 }}>{v.practicalExample}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4-5: 질문 & 답변 */}
        {currentQuestion && (
          <div style={styles.card}>
            <div style={styles.stepHeader}>
              <span style={{ ...styles.stepBadge, background: "#EEF2FF", color: "#3B5BDB" }}>STEP 4</span>
              <span style={styles.stepTitle}>이해도 검증</span>
            </div>

            <div style={styles.questionBox}>
              <p style={styles.questionText}>{currentQuestion.question}</p>
              <p style={styles.questionIntent}>{currentQuestion.intent}</p>
            </div>

            {phase === "feedback" && evaluation ? (
              <div style={{
                ...styles.feedbackBox,
                background: evaluation.level === "correct" ? "#F0FFF4" : evaluation.level === "partial" ? "#FFFBEB" : "#FFF5F5",
                borderColor: evaluation.level === "correct" ? "#68D391" : evaluation.level === "partial" ? "#F6AD55" : "#FC8181",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{
                    ...styles.levelBadge,
                    background: evaluation.level === "correct" ? "#C6F6D5" : evaluation.level === "partial" ? "#FEEBC8" : "#FED7D7",
                    color: evaluation.level === "correct" ? "#276749" : evaluation.level === "partial" ? "#744210" : "#742A2A",
                  }}>
                    {evaluation.level === "correct" ? "✓ 정확히 이해함" : evaluation.level === "partial" ? "△ 일부 이해함" : "✗ 오해가 있음"}
                  </span>
                </div>
                <p style={styles.feedbackText}>{evaluation.feedback}</p>
                {evaluation.nextQuestion && (
                  <div style={styles.followUpBox}>
                    <p style={styles.followUpText}>💬 {evaluation.nextQuestion}</p>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {evaluation.level === "correct" ? (
                    <button onClick={handleNextChunk} style={styles.primaryBtn}>
                      {currentChunkIndex + 1 >= chunks.length ? "학습 완료" : "다음 섹션 →"}
                    </button>
                  ) : (
                    <>
                      <button onClick={handleRetry} style={styles.secondaryBtn}>다시 시도</button>
                      <button onClick={handleNextChunk} style={styles.ghostBtn}>그냥 넘어가기</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="자신의 말로 설명해보세요..."
                  style={{ ...styles.textarea, minHeight: 120 }}
                  rows={4}
                />
                {error && <p style={styles.errorText}>{error}</p>}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim()}
                  style={userAnswer.trim() ? styles.primaryBtn : { ...styles.primaryBtn, opacity: 0.4, cursor: "not-allowed" }}
                >
                  답변 제출하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F9FAFB",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased",
  },
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "32px 20px 80px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  inputContainer: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "64px 20px 80px",
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #E5E7EB",
    borderTop: "3px solid #3B5BDB",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingTitle: { fontSize: 18, fontWeight: 600, color: "#191F28", margin: 0 },
  loadingDesc: { fontSize: 14, color: "#8B95A1", margin: 0 },

  // Hero
  badge: {
    display: "inline-block",
    background: "#EEF2FF",
    color: "#3B5BDB",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 999,
    marginBottom: 20,
    letterSpacing: "0.05em",
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 700,
    color: "#191F28",
    lineHeight: 1.25,
    margin: "0 0 16px",
    letterSpacing: "-0.02em",
  },
  heroDesc: {
    fontSize: 16,
    color: "#6B7684",
    lineHeight: 1.7,
    margin: "0 0 48px",
  },

  // Cards
  card: {
    background: "#FFFFFF",
    borderRadius: 20,
    padding: "28px 28px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#4E5968",
    marginBottom: 10,
  },
  textarea: {
    width: "100%",
    border: "1.5px solid #E5E8EB",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 14,
    color: "#191F28",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
    lineHeight: 1.7,
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    background: "#FAFAFA",
  },
  errorText: {
    fontSize: 13,
    color: "#E03131",
    margin: "8px 0 0",
  },

  // Buttons
  primaryBtn: {
    display: "block",
    width: "100%",
    marginTop: 16,
    padding: "16px 24px",
    background: "#3B5BDB",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
    letterSpacing: "-0.01em",
  },
  secondaryBtn: {
    flex: 1,
    padding: "14px 20px",
    background: "#F2F4F6",
    color: "#333D4B",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  ghostBtn: {
    flex: 1,
    padding: "14px 20px",
    background: "transparent",
    color: "#8B95A1",
    border: "1.5px solid #E5E8EB",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  },

  // Feature grid
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: 32,
  },
  featureCard: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: "24px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  featureTitle: { fontSize: 14, fontWeight: 600, color: "#191F28", margin: "0 0 4px" },
  featureDesc: { fontSize: 13, color: "#8B95A1", margin: 0, lineHeight: 1.5 },

  // Top bar
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: "0 4px",
  },
  topBarLogo: { fontSize: 15, fontWeight: 700, color: "#3B5BDB", letterSpacing: "-0.02em" },
  progressLabel: { fontSize: 13, color: "#8B95A1", fontWeight: 500 },
  progressTrack: {
    width: 120,
    height: 6,
    background: "#E5E8EB",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#3B5BDB",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },

  // Step
  stepHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  stepBadge: {
    fontSize: 11,
    fontWeight: 700,
    background: "#3B5BDB",
    color: "#FFFFFF",
    padding: "4px 10px",
    borderRadius: 999,
    letterSpacing: "0.06em",
  },
  stepTitle: { fontSize: 16, fontWeight: 700, color: "#191F28" },

  // Chunk
  chunkHeading: { fontSize: 13, fontWeight: 700, color: "#3B5BDB", marginBottom: 10 },
  chunkText: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#333D4B",
    fontFamily: "'Courier New', Courier, monospace",
    background: "#F8F9FA",
    borderRadius: 10,
    padding: "16px 18px",
    whiteSpace: "pre-wrap",
    margin: 0,
  },

  // Vocab
  sectionLabel: { fontSize: 15, fontWeight: 700, color: "#191F28", margin: "0 0 16px" },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#191F28", margin: "0 0 8px", letterSpacing: "-0.02em" },
  pageDesc: { fontSize: 16, color: "#6B7684", margin: 0 },
  vocabItem: {
    background: "#F8F9FA",
    borderRadius: 12,
    padding: "14px 16px",
  },
  vocabMeaning: { fontSize: 14, color: "#333D4B", margin: "4px 0 2px", lineHeight: 1.5 },
  vocabExample: { fontSize: 13, color: "#8B95A1", margin: 0 },
  termBadge: {
    display: "inline-block",
    background: "#EEF2FF",
    color: "#3B5BDB",
    fontSize: 13,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 6,
  },
  vocabTable: { display: "flex", flexDirection: "column", gap: 0 },
  vocabTableHeader: {
    display: "flex",
    gap: 16,
    padding: "8px 0",
    fontSize: 12,
    fontWeight: 600,
    color: "#8B95A1",
    borderBottom: "1px solid #F2F4F6",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  vocabTableRow: {
    display: "flex",
    gap: 16,
    padding: "10px 0",
    borderBottom: "1px solid #F9FAFB",
    alignItems: "flex-start",
  },

  // Question
  questionBox: {
    background: "#EEF2FF",
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 16,
  },
  questionText: { fontSize: 16, fontWeight: 600, color: "#1C3FAA", margin: "0 0 6px", lineHeight: 1.5 },
  questionIntent: { fontSize: 13, color: "#4263EB", margin: 0 },

  // Feedback
  feedbackBox: {
    borderRadius: 12,
    padding: "20px",
    border: "1.5px solid",
    marginTop: 16,
  },
  levelBadge: {
    display: "inline-block",
    fontSize: 13,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 999,
  },
  feedbackText: { fontSize: 15, color: "#191F28", lineHeight: 1.7, margin: 0 },
  followUpBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  followUpText: { fontSize: 14, color: "#495057", margin: 0, lineHeight: 1.6 },
};
