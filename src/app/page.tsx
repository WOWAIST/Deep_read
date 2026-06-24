"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  const [questions, setQuestions] = useState<LearningQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<LearningQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [error, setError] = useState("");

  const currentChunk = chunks[currentChunkIndex];
  const progress = chunks.length > 0 ? ((currentChunkIndex) / chunks.length) * 100 : 0;

  async function handleAnalyze() {
    if (!inputText.trim()) return;
    setPhase("analyzing");
    setError("");
    try {
      const result = await analyzeDocument(inputText);
      setChunks(result.chunks);
      setVocabulary(result.vocabulary);

      const qResult = await generateQuestions(result.chunks[0].content);
      setQuestions(qResult.questions);
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
    if (nextIndex >= chunks.length) {
      setPhase("complete");
      return;
    }
    setCurrentChunkIndex(nextIndex);
    setUserAnswer("");
    setEvaluation(null);
    setDifficulty(1);
    setPhase("analyzing");
    try {
      const qResult = await generateQuestions(chunks[nextIndex].content);
      setQuestions(qResult.questions);
      setCurrentQuestion(qResult.questions[0] ?? null);
      setPhase("learning");
    } catch {
      setPhase("learning");
    }
  }

  function handleRetry() {
    setDifficulty((d) => Math.min(d + 1, 4));
    setUserAnswer("");
    setEvaluation(null);
    setPhase("learning");
  }

  if (phase === "input") {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">TechDoc Coach</h1>
            <p className="text-gray-500 mt-1">영어 기술 문서를 번역 없이 스스로 읽고 이해하는 훈련</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>학습할 기술 문서를 붙여넣으세요</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={12}
                placeholder="영어 기술 문서 내용을 여기에 붙여넣으세요..."
                className="font-mono text-sm"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleAnalyze} className="w-full" size="lg">
                학습 시작
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (phase === "analyzing") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">문서를 분석하고 있습니다...</p>
          <p className="text-gray-400 text-sm mt-1">Ollama (llama3) 처리 중</p>
        </div>
      </main>
    );
  }

  if (phase === "complete") {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🎉 학습 완료!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">총 {chunks.length}개의 섹션을 학습했습니다.</p>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">학습한 핵심 용어</h3>
                <div className="space-y-3">
                  {vocabulary.map((v, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{v.term}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{v.meaning}</p>
                      <p className="text-xs text-gray-500 mt-1">💼 {v.practicalExample}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={() => { setPhase("input"); setInputText(""); }} className="w-full">
                새 문서 학습하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">TechDoc Coach</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {currentChunkIndex + 1} / {chunks.length}
            </span>
            <Progress value={progress} className="w-32" />
          </div>
        </div>

        {/* STEP 1: 원문 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge>STEP 1</Badge>
              <CardTitle className="text-base">영어 원문</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {currentChunk?.heading && (
              <p className="text-sm font-semibold text-blue-600 mb-2">{currentChunk.heading}</p>
            )}
            <p className="text-sm leading-relaxed text-gray-800 font-mono whitespace-pre-wrap">
              {currentChunk?.content}
            </p>
          </CardContent>
        </Card>

        {/* STEP 2: 핵심 용어 */}
        {vocabulary.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">STEP 2</Badge>
                <CardTitle className="text-base">핵심 용어</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4 font-semibold text-gray-600">용어</th>
                      <th className="text-left py-2 pr-4 font-semibold text-gray-600">의미</th>
                      <th className="text-left py-2 font-semibold text-gray-600">실무 예시</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vocabulary.map((v, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <Badge variant="outline">{v.term}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-gray-700">{v.meaning}</td>
                        <td className="py-2 text-gray-500">{v.practicalExample}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4-5: 이해도 질문 & 답변 */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">STEP 4</Badge>
                <CardTitle className="text-base">이해도 검증</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">{currentQuestion.question}</p>
                <p className="text-xs text-blue-600 mt-1">{currentQuestion.intent}</p>
              </div>

              {phase === "feedback" && evaluation ? (
                <div className={`rounded-lg p-4 ${
                  evaluation.level === "correct"
                    ? "bg-green-50 border border-green-200"
                    : evaluation.level === "partial"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      evaluation.level === "correct" ? "default" :
                      evaluation.level === "partial" ? "secondary" : "destructive"
                    }>
                      {evaluation.level === "correct" ? "✓ 정확히 이해함" :
                       evaluation.level === "partial" ? "△ 일부 이해함" : "✗ 오해가 있음"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-800">{evaluation.feedback}</p>
                  {evaluation.nextQuestion && (
                    <p className="text-sm font-medium text-gray-700 mt-3 pt-3 border-t">
                      💬 {evaluation.nextQuestion}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    {evaluation.level === "correct" ? (
                      <Button onClick={handleNextChunk} className="flex-1">
                        {currentChunkIndex + 1 >= chunks.length ? "학습 완료" : "다음 섹션"}
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleRetry} variant="outline" className="flex-1">
                          다시 시도 (난이도 {Math.min(difficulty + 1, 4)})
                        </Button>
                        <Button onClick={handleNextChunk} variant="ghost" className="flex-1">
                          그냥 넘어가기
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="자신의 말로 설명해보세요..."
                    rows={4}
                    disabled={phase === "evaluating"}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || phase === "evaluating"}
                    className="w-full"
                  >
                    {phase === "evaluating" ? "평가 중..." : "답변 제출"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
