import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import CharacterBuilder from "./CleanCharacterBuilder";
import { getModeModel, modeOptions } from "./model/msciModes";
import {
  jobDisplayNames,
  msciV2Questions,
  scoreMsciV2,
  traitDisplayNames,
} from "./model/msciV2QuestionBank";

const stageLabels = {
  intro: "说明",
  test: "职业测试",
  result: "结果",
};

const resultProfiles = {
  fighter: {
    code: "SLAY",
    name: "剑客",
    personaName: "头铁平砍王",
    tag: "正统近战型",
    slogan: "不绕路，不解释，见怪就上去处理。",
    description: "你偏向正面推进、持续输出和直接解决问题。比起复杂机制，你更相信稳定成长和硬碰硬的执行力。",
  },
  page: {
    code: "SHLD",
    name: "准骑士",
    personaName: "无敌大轮椅",
    tag: "稳健防守型",
    slogan: "别人追求秒怪，你追求怪打你像挠痒。",
    description: "你更重视安全、容错和稳定节奏。你不一定最激进，但很难被局面打崩，适合走有守护感和耐心的路线。",
  },
  spearman: {
    code: "POLE",
    name: "枪战士",
    personaName: "仰卧起坐王",
    tag: "后期团队型",
    slogan: "前期能忍，后期上桌；倒下不是结束，是节目效果。",
    description: "你能接受慢热和承压，也在意后期存在感、团队位置和大场面表现。越到后面，你越想成为队伍里少不了的人。",
  },
  iceLightning: {
    code: "ZAPZ",
    name: "冰雷法师",
    personaName: "全图立正人",
    tag: "控场清图型",
    slogan: "场面一乱，你一出手，全场开始懂事。",
    description: "你喜欢效率、控场和舒服清图。你更适合用节奏把地图按住，而不是和每只怪单独讲道理。",
  },
  firePoison: {
    code: "TOXI",
    name: "火毒法师",
    personaName: "温水煮图人",
    tag: "机制研究型",
    slogan: "别人看热闹，你看机制；别人打怪，你写理解。",
    description: "你更能接受研究属性、路线和机制收益。你不怕玩法有门槛，甚至会享受把冷门逻辑玩明白的过程。",
  },
  cleric: {
    code: "HEAL",
    name: "牧师",
    personaName: "队伍保险箱",
    tag: "辅助兜底型",
    slogan: "你可以不是最吵的，但你是大家最不想失去的。",
    description: "你更看重团队价值、稳定性和照顾同伴。你适合成为队伍里的安全感来源，让别人敢冲、敢打、敢继续。",
  },
  assassin: {
    code: "STAR",
    name: "刺客",
    personaName: "钱包发光人",
    tag: "远程爆发型",
    slogan: "理智在报警，审美在鼓掌，数字在发光。",
    description: "你喜欢速度、爆发、远程安全感和帅气反馈。只要手感和排面到位，你能接受一定资源投入。",
  },
  bandit: {
    code: "STAB",
    name: "侠客",
    personaName: "反骨近身人",
    tag: "小众操作型",
    slogan: "别人选标准答案，你偏要说：你不懂。",
    description: "你偏向个性路线、近身操作和一点点邪门理解。你不一定追求最热门，但很在意玩法有没有自己的味道。",
  },
  hunter: {
    code: "KITE",
    name: "猎人",
    personaName: "体面风筝人",
    tag: "主流远程型",
    slogan: "怪还在赶路，你已经把事情处理完了。",
    description: "你喜欢远程、稳定、顺手和节奏感。你不急着硬碰硬，更愿意用距离和位置把局面处理得很体面。",
  },
  crossbowman: {
    code: "SNIP",
    name: "弩弓手",
    personaName: "冷门一发人",
    tag: "慢热精准型",
    slogan: "不求满街同款，只求一发有分量。",
    description: "你能接受慢热和冷门路线，也更喜欢精准、耐心和少数派辨识度。你不怕慢，只怕没味道。",
  },
  brawler: {
    code: "BRAW",
    name: "拳手",
    personaName: "贴脸节奏怪",
    tag: "近身机动型",
    slogan: "别人还在站位，你已经贴脸开演。",
    description: "你喜欢新鲜感、机动节奏和贴近打击反馈。你适合更主动、更灵活、更有街头感的路线。",
  },
  gunslinger: {
    code: "GUNS",
    name: "火枪手",
    personaName: "远程火力仔",
    tag: "远程机动型",
    slogan: "安全距离不是怂，是输出环境。",
    description: "你喜欢远程拉扯、火力反馈和灵活走位。你既想保持距离，也想让画面看起来有节奏、有弹道、有新鲜感。",
  },
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

function getMissingQuestionCount(questions, responses) {
  return questions.filter((question) => responses[question.id] === undefined).length;
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
  const isCoreQuestion = (question.weight ?? 1) >= 1;

  return (
    <article className="wizard-card">
      <div className="wizard-meta">
        <span className="question-index">第 {index + 1} 题</span>
        <span>{question.section} · {isCoreQuestion ? "核心题" : "趣味题"}</span>
      </div>
      <h2>{question.text}</h2>
      <div className="wizard-options" role="radiogroup" aria-label={question.text}>
        {options.map((answer) => (
          <button
            key={answer.key}
            type="button"
            className={`wizard-option ${value === answer.key ? "active" : ""}`}
            onClick={() => onChange(question.id, answer.key)}
          >
            <span className="option-radio" aria-hidden="true" />
            <b>{answer.key}</b>
            <span>{answer.label}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function RankingTable({ results }) {
  return (
    <div className="ranking-table">
      {results.map((result, index) => (
        <div className="ranking-row" key={result.id}>
          <span className="rank-number">#{index + 1}</span>
          <div>
            <b>{resultProfiles[result.id]?.personaName || result.name}</b>
            <small>
              {jobDisplayNames[result.id] || result.name} / 原始分 {result.score}
            </small>
          </div>
          <span className="rank-score">{result.matchPercent}%</span>
        </div>
      ))}
    </div>
  );
}

function TraitRanking({ traits }) {
  const topTraits = (traits || []).slice(0, 6);

  return (
    <div className="ranking-table">
      {topTraits.map((trait, index) => (
        <div className="ranking-row" key={trait.id}>
          <span className="rank-number">#{index + 1}</span>
          <div>
            <b>{traitDisplayNames[trait.id] || trait.name}</b>
            <small>隐藏倾向分：{trait.score}</small>
          </div>
          <span className="rank-score">{Math.abs(Math.round(trait.score))}</span>
        </div>
      ))}
    </div>
  );
}

function ResultHero({ result, firstResult, secondResult, confidence, modeLabel }) {
  return (
    <section className="result-hero sbti-result-card">
      <div className="result-image-panel">
        <p>你的{modeLabel}职业人格是：</p>
        <h2>{result.personaName}</h2>
        <div className="result-code green-code">{result.code}</div>
        <CharacterBuilder profile={result} />
        <p className="result-slogan">{result.slogan}</p>
      </div>
      <div className="result-info-panel">
        <p className="eyebrow">V2 题库结果</p>
        <h3>{result.code}（{result.name}）</h3>
        <p>{result.description}</p>
        <div className="match-pill">
          匹配度 {secondResult?.matchPercent || 50}% · 置信度 {confidence.label}
        </div>
        <p className="secondary-text">
          一转锁定：{jobDisplayNames[firstResult?.id] || "—"}<br />
          二转结果：{profileTitle(result)}<br />
          分差：{confidence.gap}
        </p>
      </div>
    </section>
  );
}

function TestWizard({ questions, responses, currentIndex, setCurrentIndex, onAnswer, isComplete, onShowResult }) {
  const currentQuestion = questions[currentIndex] || questions[0];
  const currentValue = currentQuestion ? responses[currentQuestion.id] : undefined;

  function handleAnswer(questionId, value) {
    onAnswer(questionId, value);
    const isLastQuestion = currentIndex >= questions.length - 1;
    if (!isLastQuestion) {
      window.setTimeout(() => setCurrentIndex(currentIndex + 1), 160);
    }
  }

  return (
    <section className="wizard-shell">
      <div className="wizard-title-row">
        <div>
          <p className="eyebrow">MSCI V2</p>
          <h1>30 题职业人格测试</h1>
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
        <section className="stage-result-card completion-anchor">
          <p className="eyebrow">测试完成</p>
          <h2>职业人格已生成</h2>
          <button type="button" className="primary-btn" onClick={onShowResult}>查看最终结果</button>
        </section>
      )}
    </section>
  );
}

function App() {
  const [mode, setMode] = useState("global");
  const modeModel = useMemo(() => getModeModel(mode), [mode]);
  const [stage, setStage] = useState("intro");
  const [responses, setResponses] = useState({});
  const [questionOrder, setQuestionOrder] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const resultCaptureRef = useRef(null);

  const activeQuestions = questionOrder.length ? questionOrder : msciV2Questions;
  const scoreResult = useMemo(() => scoreMsciV2(responses, mode), [responses, mode]);
  const missing = getMissingQuestionCount(msciV2Questions, responses);
  const isComplete = missing === 0;
  const finalProfile = resultProfiles[scoreResult.secondJob] || resultProfiles.fighter;
  const firstResult = scoreResult.firstRanking[0];
  const secondResult = scoreResult.secondRanking[0];

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollPageToTop();
      setTimeout(scrollPageToTop, 80);
    });
  }, [stage, mode]);

  function resetForMode(nextMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStage("intro");
    setResponses({});
    setQuestionOrder([]);
    setCurrentIndex(0);
  }

  function startTest() {
    setResponses({});
    setQuestionOrder(shuffleQuestions(msciV2Questions));
    setCurrentIndex(0);
    setStage("test");
  }

  function updateAnswer(questionId, value) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  function showFinalResult() {
    if (!isComplete) return;
    setStage("result");
  }

  function restart() {
    setStage("intro");
    setResponses({});
    setQuestionOrder([]);
    setCurrentIndex(0);
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

      const fileName = `MSCI-v2-${modeModel.id}-${finalProfile.code || "result"}.png`;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;

      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "MSCI 冒险岛职业人格测试",
          text: `我的 MSCI ${modeModel.label}结果是 ${profileTitle(finalProfile)}`,
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
            <p className="eyebrow">MapleStory Class Indicator · V2</p>
            <h1>{modeModel.title}</h1>
            <p>{modeModel.description}</p>
            <p className="mode-note">30 题 A/B/C/D/E 题库：前 16 题决定核心职业倾向，后 14 题用于补充抽象人格和传播梗感。</p>
            <ModeSelector value={mode} onChange={resetForMode} />
          </div>
          <button className="primary-btn" onClick={startTest}>开始 V2 测试</button>
        </section>
      )}

      {stage === "test" && (
        <TestWizard
          questions={activeQuestions}
          responses={responses}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onAnswer={updateAnswer}
          isComplete={isComplete}
          onShowResult={showFinalResult}
        />
      )}

      {stage === "result" && isComplete && (
        <section className="result-page sbti-result-page">
          <div ref={resultCaptureRef} className="result-capture-card sbti-capture-card">
            <ResultHero
              result={finalProfile}
              firstResult={firstResult}
              secondResult={secondResult}
              confidence={scoreResult.secondConfidence}
              modeLabel={modeModel.label}
            />
            <section className="panel compact-ranking-panel">
              <h3>一转大类排名</h3>
              <RankingTable results={scoreResult.firstRanking} />
            </section>
            <section className="panel compact-ranking-panel">
              <h3>二转分支排名</h3>
              <RankingTable results={scoreResult.secondRanking} />
            </section>
            <section className="panel compact-ranking-panel">
              <h3>隐藏人格倾向</h3>
              <TraitRanking traits={scoreResult.traitRanking} />
            </section>
          </div>

          <div className="action-row">
            <button className="primary-btn" onClick={saveResultScreenshot} disabled={isSaving}>
              {isSaving ? "正在生成截图..." : "导出分享卡片"}
            </button>
            <button className="primary-btn" onClick={restart}>重新测试</button>
            <button className="ghost-btn" onClick={() => setStage("test")}>调整答案</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
