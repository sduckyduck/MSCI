import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
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

function CompletionBadge({ missing, total }) {
  const done = total - missing;
  return (
    <div className="completion-badge">
      <span>{done}</span>/<span>{total}</span> 已回答
    </div>
  );
}

function QuestionCard({ question, value, onChange, index }) {
  const options = question.options || answerScale;

  return (
    <article className="question-card">
      <div className="question-head">
        <span className="question-index">Q{index + 1}</span>
        <h3>{question.text}</h3>
      </div>
      <div className="answer-row" role="radiogroup" aria-label={question.text}>
        {options.map((answer) => (
          <button
            key={answer.value}
            type="button"
            className={`answer-pill ${value === answer.value ? "active" : ""}`}
            onClick={() => onChange(question.id, answer.value)}
          >
            <span>{answer.label}</span>
          </button>
        ))}
      </div>
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

function WaitingForAnswers({ missing }) {
  return (
    <div className="waiting-card">
      <b>完成所有题目后显示结果</b>
      <p>还剩 {missing} 题。为了避免提前剧透职业倾向，排行榜和二转入口会在答完后出现。</p>
    </div>
  );
}

function ResultHero({ firstResult, secondResult, secondaryFirst, secondarySecond, confidence }) {
  return (
    <section className="result-hero">
      <div>
        <p className="eyebrow">你的 MSCI 职业人格</p>
        <div className="result-code">{secondResult.code}</div>
        <h2>{secondResult.personaName}</h2>
        <p className="result-tag">
          {firstResult.name} - {secondResult.name} / {secondResult.tag}
        </p>
        <p className="result-slogan">{secondResult.slogan}</p>
        <p>{firstResult.slogan}</p>
        <p>{secondResult.description}</p>
      </div>
      <div className="score-card big">
        <span>综合匹配度</span>
        <strong>{Math.round((firstResult.matchPercent + secondResult.matchPercent) / 2)}%</strong>
        <small>置信度：{confidence.label}，Top1 与 Top2 差距 {confidence.gap} 分</small>
      </div>
      <div className="secondary-card">
        <b>副人格参考</b>
        <p>
          一转副人格：{profileTitle(secondaryFirst)}
          <br />
          二转副人格：{profileTitle(secondarySecond)}
        </p>
        <small>{confidence.note}</small>
      </div>
    </section>
  );
}

function BottomCta({ title, subtitle, buttonLabel, onClick }) {
  return (
    <div className="bottom-cta" role="region" aria-label={title}>
      <div>
        <b>{title}</b>
        <span>{subtitle}</span>
      </div>
      <button type="button" className="primary-btn" onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}

function App() {
  const [stage, setStage] = useState("intro");
  const [firstResponses, setFirstResponses] = useState({});
  const [secondResponses, setSecondResponses] = useState({});
  const [lockedFirstJob, setLockedFirstJob] = useState(null);
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
    setStage("second");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showFinalResult() {
    if (!isSecondComplete) return;
    setStage("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setStage("intro");
    setFirstResponses({});
    setSecondResponses({});
    setLockedFirstJob(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveResultScreenshot() {
    const target = resultCaptureRef.current;
    if (!target || isSaving) return;

    try {
      setIsSaving(true);
      const canvas = await html2canvas(target, {
        backgroundColor: "#f4dfb7",
        scale: Math.min(window.devicePixelRatio || 2, 3),
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `MSCI-${secondResults[0]?.code || "result"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MapleStory Class Indicator</p>
          <h1>MSCI 冒险岛职业人格测试</h1>
        </div>
        <div className="stage-chip">{stageLabels[stage]}</div>
      </header>

      {stage === "intro" && (
        <section className="intro-card">
          <div>
            <p className="eyebrow">严谨一点的抽象职业测试</p>
            <h2>不是 A=战士、B=法师，而是隐藏维度匹配职业人格。</h2>
            <p>
              MSCI 会先测你的开荒效率、资源投入、战斗距离、操作复杂度、组队倾向和后期耐心，
              再把你的维度向量和职业画像做匹配，最后给出一转职业、二转分支、副人格和四字母人格代号。
            </p>
          </div>
          <div className="model-card">
            <b>当前版本</b>
            <ul>
              <li>一转：TANK / MAGI / EDGE / ARRO</li>
              <li>二转：SLAY / SHLD / POLE / ZAPZ / TOXI / HEAL / STAR / STAB / KITE / SNIP</li>
              <li>评分：抽象情景题 + 隐藏维度 + 余弦相似度</li>
              <li>输出：人格代号、职业分支、匹配度、副人格、维度图</li>
            </ul>
          </div>
          <button className="primary-btn" onClick={() => setStage("first")}>开始测试</button>
        </section>
      )}

      {stage === "first" && (
        <>
          <section className="test-layout">
            <aside className="sticky-panel">
              <h2>第一阶段：一转倾向</h2>
              <p>回答所有题目后，系统会锁定最匹配的一转职业，再进入二转分支测试。</p>
              <CompletionBadge missing={firstMissing} total={firstJobQuestions.length} />
              {isFirstComplete ? (
                <>
                  <RankingTable results={firstResults} />
                  <button className="primary-btn" onClick={continueToSecond}>
                    进入二转测试
                  </button>
                </>
              ) : (
                <WaitingForAnswers missing={firstMissing} />
              )}
            </aside>
            <div className="question-list">
              {firstJobQuestions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  value={firstResponses[question.id]}
                  onChange={updateFirstAnswer}
                />
              ))}
              {isFirstComplete && <DimensionBars scores={firstScores} dimensions={firstJobDimensions} />}
            </div>
          </section>
          {isFirstComplete && (
            <BottomCta
              title="一转结果已生成"
              subtitle={`你的一转人格：${profileTitle(firstResults[0])}`}
              buttonLabel="进入二转测试"
              onClick={continueToSecond}
            />
          )}
        </>
      )}

      {stage === "second" && (
        <>
          <section className="test-layout">
            <aside className="sticky-panel">
              <p className="eyebrow">已锁定一转</p>
              <h2>{profileTitle(firstJobProfiles[selectedFirstJob])}</h2>
              <p>{firstJobProfiles[selectedFirstJob]?.slogan}</p>
              <p>{firstJobProfiles[selectedFirstJob]?.description}</p>
              <CompletionBadge missing={secondMissing} total={secondQuestions.length} />
              {isSecondComplete ? (
                <>
                  <RankingTable results={secondResults} />
                  <button className="primary-btn" onClick={showFinalResult}>查看最终结果</button>
                </>
              ) : (
                <WaitingForAnswers missing={secondMissing} />
              )}
              <button className="ghost-btn" onClick={() => setStage("first")}>返回一转题目</button>
            </aside>
            <div className="question-list">
              {secondQuestions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  value={secondResponses[question.id]}
                  onChange={updateSecondAnswer}
                />
              ))}
              {isSecondComplete && <DimensionBars scores={secondScores} dimensions={secondDimensions} />}
            </div>
          </section>
          {isSecondComplete && (
            <BottomCta
              title="二转结果已生成"
              subtitle={`你的二转人格：${profileTitle(secondResults[0])}`}
              buttonLabel="查看最终结果"
              onClick={showFinalResult}
            />
          )}
        </>
      )}

      {stage === "result" && (
        <section className="result-page">
          <div ref={resultCaptureRef} className="result-capture-card">
            <ResultHero
              firstResult={firstResults[0]}
              secondResult={secondResults[0]}
              secondaryFirst={firstResults[1]}
              secondarySecond={secondResults[1]}
              confidence={confidence}
            />
            <div className="result-grid">
              <section className="panel">
                <h3>一转排名</h3>
                <RankingTable results={firstResults} />
              </section>
              <section className="panel">
                <h3>二转排名</h3>
                <RankingTable results={secondResults} />
              </section>
            </div>
          </div>
          <section className="panel">
            <h3>一转隐藏维度</h3>
            <DimensionBars scores={firstScores} dimensions={firstJobDimensions} />
          </section>
          <section className="panel">
            <h3>二转隐藏维度</h3>
            <DimensionBars scores={secondScores} dimensions={secondDimensions} />
          </section>
          <div className="action-row">
            <button className="primary-btn" onClick={saveResultScreenshot} disabled={isSaving}>
              {isSaving ? "正在生成截图..." : "保存结果截图"}
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
