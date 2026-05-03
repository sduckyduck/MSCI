import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import CharacterBuilder from "./CleanCharacterBuilder";
import {
  getConfidence,
  getDimensionSummary,
  getMissingQuestionCount,
  matchProfiles,
  scoreQuestions,
} from "./model/msciModel";
import { getModeModel, modeOptions } from "./model/msciModes";

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

function shuffleQuestions(questions) {
  const shuffled = [...(questions || [])];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function CompletionBadge({ missing, total }) {
  const done = total - missing;
  return (
    <div className="completion-badge">
      <span>{done}</span>/<span>{total}</span> 已回答
    </div>
  );
}

function IntroHeroBanner({ candidates }) {
  const safeCandidates = Array.isArray(candidates) && candidates.length ? candidates : ["/assets/msci-class-heroes.png"];
  const [index, setIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);
  const src = safeCandidates[index] || safeCandidates[0];

  useEffect(() => {
    setIndex(0);
    setFailedAll(false);
  }, [safeCandidates.join("|")]);

  if (failedAll || !src) return <div className="intro-heroes-banner banner-fallback" aria-hidden="true" />;

  return (
    <img
      className="intro-heroes-banner"
      src={src}
      alt="MSCI 职业角色横幅"
      draggable="false"
      onError={() => {
        setIndex((current) => {
          const next = current + 1;
          if (next >= safeCandidates.length) {
            setFailedAll(true);
            return current;
          }
          return next;
        });
      }}
    />
  );
}

function ModeSelector({ value, onChange }) {
  return (
    <section className="mode-selector" aria-label="选择服务器版本">
      <div className="mode-selector-head">
        <p className="eyebrow">Server Version</p>
        <h2>选择测试版本</h2>
      </div>
      <div className="mode-option-grid">
        {modeOptions.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`mode-option ${active ? "active" : ""}`}
              onClick={() => onChange(option.id)}
              aria-pressed={active}
            >
              <span className="mode-option-main">
                <b>{option.label}</b>
                <small>{option.description}</small>
              </span>
              <span className="mode-badge">{option.badge}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProgressDots({ questions, responses, currentIndex, onJump }) {
  const doneCount = questions.length - getMissingQuestionCount(questions, responses);
  const percent = questions.length ? Math.round((doneCount / questions.length) * 100) : 0;

  return (
    <section className="progress-panel" aria-label="答题进度">
      <div className="progress-head">
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${percent}%` }} />
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
  const options = question.options || [];

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

function ResultHero({ firstResult, secondResult, secondaryFirst, secondarySecond, confidence, modeLabel }) {
  return (
    <section className="result-hero sbti-result-card">
      <div className="result-image-panel">
        <p>你的{modeLabel}职业人格是：</p>
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
  const [mode, setMode] = useState("global");
  const modeModel = useMemo(() => getModeModel(mode), [mode]);
  const [stage, setStage] = useState("intro");
  const [firstResponses, setFirstResponses] = useState({});
  const [secondResponses, setSecondResponses] = useState({});
  const [lockedFirstJob, setLockedFirstJob] = useState(null);
  const [firstQuestionOrder, setFirstQuestionOrder] = useState([]);
  const [secondQuestionOrder, setSecondQuestionOrder] = useState([]);
  const [firstIndex, setFirstIndex] = useState(0);
  const [secondIndex, setSecondIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const resultCaptureRef = useRef(null);

  const activeFirstQuestions = firstQuestionOrder.length ? firstQuestionOrder : modeModel.firstJobQuestions;

  const firstScores = useMemo(
    () => scoreQuestions(modeModel.firstJobQuestions, firstResponses, modeModel.firstJobDimensions),
    [modeModel, firstResponses]
  );

  const firstResults = useMemo(
    () => matchProfiles(firstScores, modeModel.firstJobProfiles),
    [modeModel, firstScores]
  );

  const fallbackFirstJob = Object.keys(modeModel.firstJobProfiles)[0] || "warrior";
  const selectedFirstJob = lockedFirstJob || firstResults[0]?.id || fallbackFirstJob;
  const rawSecondQuestions = modeModel.secondJobQuestions[selectedFirstJob] || [];
  const secondQuestions = secondQuestionOrder.length ? secondQuestionOrder : rawSecondQuestions;
  const secondDimensions = modeModel.secondJobDimensions[selectedFirstJob] || {};
  const secondProfiles = modeModel.secondJobProfiles[selectedFirstJob] || {};

  const secondScores = useMemo(
    () => scoreQuestions(rawSecondQuestions, secondResponses, secondDimensions),
    [rawSecondQuestions, secondResponses, secondDimensions]
  );

  const secondResults = useMemo(
    () => matchProfiles(secondScores, secondProfiles),
    [secondScores, secondProfiles]
  );

  const firstMissing = getMissingQuestionCount(modeModel.firstJobQuestions, firstResponses);
  const secondMissing = getMissingQuestionCount(rawSecondQuestions, secondResponses);
  const isFirstComplete = firstMissing === 0;
  const isSecondComplete = rawSecondQuestions.length > 0 && secondMissing === 0;
  const confidence = getConfidence(firstResults);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollPageToTop();
      setTimeout(scrollPageToTop, 80);
    });
  }, [stage, selectedFirstJob]);

  function resetForMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStage("intro");
    setFirstResponses({});
    setSecondResponses({});
    setLockedFirstJob(null);
    setFirstQuestionOrder([]);
    setSecondQuestionOrder([]);
    setFirstIndex(0);
    setSecondIndex(0);
  }

  function startFirstTest() {
    setFirstResponses({});
    setSecondResponses({});
    setLockedFirstJob(null);
    setFirstQuestionOrder(shuffleQuestions(modeModel.firstJobQuestions));
    setSecondQuestionOrder([]);
    setFirstIndex(0);
    setSecondIndex(0);
    setStage("first");
  }

  function updateFirstAnswer(questionId, value) {
    setFirstResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  function updateSecondAnswer(questionId, value) {
    setSecondResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  function continueToSecond() {
    if (!isFirstComplete) return;
    const nextFirstJob = firstResults[0]?.id || fallbackFirstJob;
    const nextSecondQuestions = modeModel.secondJobQuestions[nextFirstJob] || [];

    setLockedFirstJob(nextFirstJob);
    setSecondResponses({});
    setSecondQuestionOrder(shuffleQuestions(nextSecondQuestions));
    setSecondIndex(0);
    setStage("second");
  }

  function showFinalResult() {
    if (!isSecondComplete || !secondResults[0]) return;
    setStage("result");
  }

  function restart() {
    setStage("intro");
    setFirstResponses({});
    setSecondResponses({});
    setLockedFirstJob(null);
    setFirstQuestionOrder([]);
    setSecondQuestionOrder([]);
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

      const fileName = `MSCI-${modeModel.id}-${secondResults[0]?.code || "result"}.png`;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "MSCI 冒险岛职业人格测试",
          text: `我的 MSCI ${modeModel.label}结果是 ${profileTitle(secondResults[0])}`,
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
    <main className={`app-shell sbti-shell msci-mode-${modeModel.id}`}>
      <header className="sbti-topbar">
        <div className="logo-mark">M</div>
        <b>MSCI Test</b>
        <span>{stageLabels[stage]}</span>
        <span>{modeModel.label}</span>
        <button type="button" className="language-pill">中文</button>
      </header>

      {stage === "intro" && (
        <section className="intro-card sbti-intro-card mode-aware-intro">
          <div>
            <IntroHeroBanner candidates={modeModel.bannerCandidates} />
            <p className="eyebrow">MapleStory Class Indicator</p>
            <h1>{modeModel.title}</h1>
            <p>{modeModel.description}</p>
            <p className="mode-note">{modeModel.note}</p>
            <ModeSelector value={mode} onChange={resetForMode} />
          </div>
          <button className="primary-btn" onClick={startFirstTest}>开始测试</button>
        </section>
      )}

      {stage === "first" && (
        <TestWizard
          title={`一转测试 · ${modeModel.label}`}
          subtitle={modeModel.firstStageSubtitle}
          questions={activeFirstQuestions}
          responses={firstResponses}
          currentIndex={firstIndex}
          setCurrentIndex={setFirstIndex}
          onAnswer={updateFirstAnswer}
          isComplete={isFirstComplete}
          scores={firstScores}
          dimensions={modeModel.firstJobDimensions}
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
          title={`二转测试 · ${modeModel.label}`}
          subtitle={`已锁定：${profileTitle(modeModel.firstJobProfiles[selectedFirstJob])}`}
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

      {stage === "result" && secondResults[0] && (
        <section className="result-page sbti-result-page">
          <div ref={resultCaptureRef} className="result-capture-card sbti-capture-card">
            <ResultHero
              firstResult={firstResults[0]}
              secondResult={secondResults[0]}
              secondaryFirst={firstResults[1]}
              secondarySecond={secondResults[1]}
              confidence={confidence}
              modeLabel={modeModel.label}
            />
            <section className="panel compact-ranking-panel">
              <h3>你的职业排名</h3>
              <RankingTable results={secondResults} />
            </section>
          </div>

          <CollapsibleDimensions
            title="一转隐藏维度"
            scores={firstScores}
            dimensions={modeModel.firstJobDimensions}
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
