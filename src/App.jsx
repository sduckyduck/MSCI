import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import CharacterBuilder from "./FastCharacterBuilder";
import {
  answerScale,
  firstJobDimensions,
  firstJobProfiles,
  firstJobQuestions,
  getConfidence,
  getDimensionSummary,
  getMissingQuestionCount,
  matchProfiles,
  scoreQuestions,
  secondJobDimensions,
  secondJobProfiles,
  secondJobQuestions,
} from "./model/msciModel";

const stageLabels = {
  intro: "说明",
  first: "一转测试",
  second: "二转测试",
  result: "结果",
};

function profileTitle(profile) {
  if (!profile) return "—";
  return profile.code ? `${profile.code} ${profile.personaName || profile.name}` : profile.name;
}

function scrollPageToTop() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function CompletionBadge({ missing, total }) {
  const done = total - missing;
  return (
    <div className="completion-badge">
      <span>{done}</span>/<span>{total}</span> 已回答
    </div>
  );
}

function ProgressDots({ questions, responses, currentIndex, onJump }) {
  const doneCount = questions.length - getMissingQuestionCount(questions, responses);

  return (
    <section className="progress-panel" aria-label="答题进度">
      <div className="progress-head">
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${Math.round((doneCount / questions.length) * 100)}%` }} />
        </div>
        <strong>{doneCount} / {questions.length}</strong>
      </div>
      <div className="question-dots">
        {questions.map((question, index) => {
          const answered = responses[question.id] !== undefined;
          const active = index === currentIndex;
          return (
            <button
              key={question.id}
              type="button"
              className={`question-dot ${answered ? "answered" : ""} ${active ? "active" : ""}`}
              aria-label={`跳转到第 ${index + 1} 题`}
              onClick={() => onJump(index)}
            />
          );
        })}
      </div>
    </section>
  );
}

function QuestionCard({ question, value, onChange, index }) {
  const options = question.options || answerScale;

  return (
    <article className="wizard-card">
      <div className="wizard-meta">
        <span className="question-index">第 {index + 1} 题</span>
        <span>维度已隐藏</span>
      </div>
      <h2>{question.text}</h2>
      <div className="wizard-options" role="radiogroup" aria-label={question.text}>
        {options.map((answer, optionIndex) => (
          <button
            key={answer.value}
            type="button"
            className={`wizard-option ${value === answer.value ? "active" : ""}`}
            onClick={() => onChange(question.id, answer.value)}
          >
            <span className="option-radio" aria-hidden="true" />
            <b>{String.fromCharCode(65 + optionIndex)}</b>
            <span>{answer.label}</span>
          </button>
        ))}
      </div>
      <p className="wizard-help">选择后会自动进入下一题，也可以点上方泡泡跳回任意题。</p>
    </article>
  );
}

function DimensionBars({ scores, dimensions }) {
  const rows = getDimensionSummary(scores, dimensions);

  return (
    <div className="dimension-grid">
      {rows.map((row) => {
        const isPositive = row.value >= 0;
        return (
          <div className="dimension-card" key={row.key}>
            <div className="dimension-title">
              <b>{row.label}</b>
              <span>{row.value.toFixed(1)}</span>
            </div>
            <div className="dimension-scale">
              <span>{row.low}</span>
              <span>{row.high}</span>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill ${isPositive ? "positive" : "negative"}`}
                style={{ width: `${Math.max(6, row.intensity)}%` }}
              />
            </div>
            <p>当前倾向：{row.side}</p>
          </div>
        );
      })}
    </div>
  );
}

function CollapsibleDimensions({ title, scores, dimensions }) {
  return (
    <details className="collapsible-dimensions">
      <summary>
        <span>{title}</span>
        <small>展开查看模型后台维度</small>
      </summary>
      <div className="collapsible-body">
        <DimensionBars scores={scores} dimensions={dimensions} />
      </div>
    </details>
  );
}

function RankingTable({ results }) {
  return (
    <div className="ranking-table">
      {results.map((result, index) => (
        <div className="ranking-row" key={result.id}>
          <span className="rank-number">#{index + 1}</span>
          <div>
            <b>{profileTitle(result)}</b>
            <small>
              {result.name} / {result.tag}
            </small>
          </div>
          <span className="rank-score">{result.matchPercent}%</span>
        </div>
      ))}
    </div>
  );
}

function StageResultPreview({ title, result, subtitle, buttonLabel, onClick }) {
  return (
    <section className="stage-result-card">
      <p className="eyebrow">{title}</p>
      <h2>{profileTitle(result)}</h2>
      <p>{subtitle}</p>
      <button type="button" className="primary-btn" onClick={onClick}>{buttonLabel}</button>
    </section>
  );
}

function TestWizard({
  title,
  subtitle,
  questions,
  responses,
  currentIndex,
  setCurrentIndex,
  onAnswer,
  isComplete,
  completePreview,
  scores,
  dimensions,
}) {
  const currentQuestion = questions[currentIndex] || questions[0];
  const currentValue = currentQuestion ? responses[currentQuestion.id] : undefined;
  const completePreviewRef = useRef(null);

  useEffect(() => {
    if (!isComplete || !completePreviewRef.current) return;

    const timer = window.setTimeout(() => {
      completePreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [isComplete]);

  function handleAnswer(questionId, value) {
    onAnswer(questionId, value);
    const isLastQuestion = currentIndex >= questions.length - 1;
    if (!isLastQuestion) {
      window.setTimeout(() => setCurrentIndex(currentIndex + 1), 180);
    }
  }

  return (
    <section className="wizard-shell">
      <div className="wizard-title-row">
        <div>
          <p className="eyebrow">{title}</p>
          <h1>{subtitle}</h1>
        </div>
        <CompletionBadge missing={getMissingQuestionCount(questions, responses)} total={questions.length} />
      </div>

      <ProgressDots
        questions={questions}
        responses={responses}
        currentIndex={currentIndex}
        onJump={setCurrentIndex}
      />

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          value={currentValue}
          onChange={handleAnswer}
        />
      )}

      <div className="wizard-nav-row">
        <button
          type="button"
          className="ghost-btn"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
        >
          ← 上一题
        </button>
        <button
          type="button"
          className="ghost-btn"
          disabled={currentIndex >= questions.length - 1}
          onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
        >
          下一题 →
        </button>
      </div>

      {isComplete && (
        <div ref={completePreviewRef} className="completion-anchor">
          {completePreview}
        </div>
      )}

      {isComplete && (
        <CollapsibleDimensions title={`${title}隐藏维度`} scores={scores} dimensions={dimensions} />
      )}
    </section>
  );
}

function ResultHero({ firstResult, secondResult, secondaryFirst, secondarySecond, confidence }) {
  return (
    <section className="result-hero sbti-result-card">
      <div className="result-image-panel">
        <p>你的职业人格是：</p>
        <h2>{secondResult.personaName}</h2>
        <div className="result-code green-code">{secondResult.code}</div>
        <CharacterBuilder profile={secondResult} />
        <p className="result-slogan">{secondResult.slogan}</p>
      </div>
      <div className="result-info-panel">
        <p className="eyebrow">你的主类型</p>
        <h3>{secondResult.code}（{secondResult.personaName}）</h3>
        <p>{secondResult.description}</p>
        <div className="match-pill">
          匹配度 {Math.round((firstResult.matchPercent + secondResult.matchPercent) / 2)}% · 置信度 {confidence.label}
        </div>
        <p className="secondary-text">
          一转副人格：{profileTitle(secondaryFirst)}<br />
          二转副人格：{profileTitle(secondarySecond)}
        </p>
      </div>
    </section>
  );
}

function App() {
  const [stage, setStage] = useState("intro");
  const [firstResponses, setFirstResponses] = useState({});
  const [secondResponses, setSecondResponses] = useState({});
  const [lockedFirstJob, setLockedFirstJob] = useState(null);
  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const resultCaptureRef = useRef(null);

  const firstScores = useMemo(
    () => scoreQuestions(firstJobQuestions, firstResponses, firstJobDimensions),
    [firstResponses]
  );

  const firstResults = useMemo(
    () => matchProfiles(firstScores, firstJobProfiles),
    [firstScores]
  );

  const selectedFirstJob = lockedFirstJob || firstResults[0]?.id || "warrior";
  const secondQuestions = secondJobQuestions[selectedFirstJob] || [];
  const secondDimensions = secondJobDimensions[selectedFirstJob] || {};
  const secondProfiles = secondJobProfiles[selectedFirstJob] || {};

  const secondScores = useMemo(
    () => scoreQuestions(secondQuestions, secondResponses, secondDimensions),
    [secondQuestions, secondResponses, secondDimensions]
  );

  const secondResults = useMemo(
    () => matchProfiles(secondScores, secondProfiles),
    [secondScores, secondProfiles]
  );

  const firstMissing = getMissingQuestionCount(firstJobQuestions, firstResponses);
  const secondMissing = getMissingQuestionCount(secondQuestions, secondResponses);
  const isFirstComplete = firstMissing === 0;
  const isSecondComplete = secondMissing === 0;
  const confidence = getConfidence(firstResults);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollPageToTop();
      setTimeout(scrollPageToTop, 80);
    });
  }, [stage, selectedFirstJob]);

  function updateFirstAnswer(questionId, value) {
    setFirstResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  function updateSecondAnswer(questionId, value) {
    setSecondResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  function continueToSecond() {
    if (!isFirstComplete) return;
    setLockedFirstJob(firstResults[0]?.id || "warrior");
    setSecondResponses({});
    setSecondIndex(0);
    setStage("second");
  }

  function showFinalResult() {
    if (!isSecondComplete) return;
    setStage("result");
  }

  function restart() {
    setStage("intro");
    setFirstResponses({});
    setSecondResponses({});
    setLockedFirstJob(null);
    setFirstIndex(0);
    setSecondIndex(0);
  }

  function downloadImage(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function saveResultScreenshot() {
    const target = resultCaptureRef.current;
    if (!target || isSaving) return;

    try {
      setIsSaving(true);
      document.body.classList.add("exporting-png");
      await new Promise((resolve) => requestAnimationFrame(resolve));

      const canvas = await html2canvas(target, {
        backgroundColor: "#eef6ef",
        scale: Math.min(window.devicePixelRatio || 2, 3),
        useCORS: true,
        ignoreElements: (element) =>
          element.classList?.contains("character-builder-controls") ||
          element.dataset?.exportHidden === "true" ||
          element.dataset?.html2canvasIgnore === "true",
      });

      const fileName = `MSCI-${secondResults[0]?.code || "result"}.png`;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "MSCI 冒险岛职业人格测试",
          text: `我的 MSCI 结果是 ${profileTitle(secondResults[0])}`,
          files: [file],
        });
        return;
      }

      downloadImage(blob, fileName);
    } finally {
      document.body.classList.remove("exporting-png");
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell sbti-shell">
      <header className="sbti-topbar">
        <div className="logo-mark">M</div>
        <b>MSCI Test</b>
        <span>Class × Type</span>
        <span>Types</span>
        <button type="button" className="language-pill">中文</button>
      </header>

      {stage === "intro" && (
        <section className="intro-card sbti-intro-card">
          <div>
            <p className="eyebrow">MapleStory Class Indicator</p>
            <h1>MSCI 冒险岛职业人格测试</h1>
            <p>
              一题一页，选择后自动跳下一题。系统会隐藏后台维度，只给你最后的四字母职业人格结果。
            </p>
          </div>
          <button className="primary-btn" onClick={() => setStage("first")}>开始测试</button>
        </section>
      )}

      {stage === "first" && (
        <TestWizard
          title="一转测试"
          subtitle="先测你的冒险家底色"
          questions={firstJobQuestions}
          responses={firstResponses}
          currentIndex={firstIndex}
          setCurrentIndex={setFirstIndex}
          onAnswer={updateFirstAnswer}
          isComplete={isFirstComplete}
          scores={firstScores}
          dimensions={firstJobDimensions}
          completePreview={(
            <StageResultPreview
              title="一转人格已解锁"
              result={firstResults[0]}
              subtitle="第一阶段完成，继续进入二转分支测试。"
              buttonLabel="进入二转测试"
              onClick={continueToSecond}
            />
          )}
        />
      )}

      {stage === "second" && (
        <TestWizard
          title="二转测试"
          subtitle={`已锁定：${profileTitle(firstJobProfiles[selectedFirstJob])}`}
          questions={secondQuestions}
          responses={secondResponses}
          currentIndex={secondIndex}
          setCurrentIndex={setSecondIndex}
          onAnswer={updateSecondAnswer}
          isComplete={isSecondComplete}
          scores={secondScores}
          dimensions={secondDimensions}
          completePreview={(
            <StageResultPreview
              title="二转人格已解锁"
              result={secondResults[0]}
              subtitle="你的最终四字母职业人格已经生成。"
              buttonLabel="查看最终结果"
              onClick={showFinalResult}
            />
          )}
        />
      )}

      {stage === "result" && (
        <section className="result-page sbti-result-page">
          <div ref={resultCaptureRef} className="result-capture-card sbti-capture-card">
            <ResultHero
              firstResult={firstResults[0]}
              secondResult={secondResults[0]}
              secondaryFirst={firstResults[1]}
              secondarySecond={secondResults[1]}
              confidence={confidence}
            />
            <section className="panel compact-ranking-panel">
              <h3>你的职业排名</h3>
              <RankingTable results={secondResults} />
            </section>
          </div>

          <CollapsibleDimensions
            title="一转隐藏维度"
            scores={firstScores}
            dimensions={firstJobDimensions}
          />
          <CollapsibleDimensions
            title="二转隐藏维度"
            scores={secondScores}
            dimensions={secondDimensions}
          />
          <div className="action-row">
            <button className="primary-btn" onClick={saveResultScreenshot} disabled={isSaving}>
              {isSaving ? "正在生成截图..." : "导出分享卡片"}
            </button>
            <button className="primary-btn" onClick={restart}>重新测试</button>
            <button className="ghost-btn" onClick={() => setStage("second")}>调整二转答案</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
