import {
  jobDisplayNames,
  msciV2Questions,
  scoreMsciV2,
} from "../src/model/msciV2QuestionBank.js";

const DEFAULT_RUNS = 100_000;
const DEFAULT_SEED = 20260503;

function parseArgs(argv) {
  const out = {
    runs: DEFAULT_RUNS,
    seed: DEFAULT_SEED,
    mode: "china",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--runs" || arg === "-n") {
      out.runs = Number(next);
      i += 1;
    } else if (arg === "--seed") {
      out.seed = Number(next);
      i += 1;
    } else if (arg === "--mode") {
      out.mode = String(next || "china").trim();
      i += 1;
    }
  }

  if (!Number.isFinite(out.runs) || out.runs <= 0) out.runs = DEFAULT_RUNS;
  if (!Number.isFinite(out.seed)) out.seed = DEFAULT_SEED;
  if (!["global", "china"].includes(out.mode)) out.mode = "china";
  return out;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pickRandom(array, random) {
  return array[Math.floor(random() * array.length)];
}

function pct(count, runs) {
  return `${((count / runs) * 100).toFixed(2)}%`;
}

function countMapToRows(counts, runs) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      name: jobDisplayNames[id] || id,
      count,
      rate: pct(count, runs),
    }));
}

function addScore(target, scores, weight = 1) {
  Object.entries(scores || {}).forEach(([id, value]) => {
    target[id] = (target[id] || 0) + Number(value || 0) * weight;
  });
}

function analyzeQuestionPressure() {
  const firstTotals = {};
  const secondTotals = {};
  const firstPositiveOptions = {};
  const secondPositiveOptions = {};

  for (const question of msciV2Questions) {
    const weight = question.weight ?? 1;
    for (const option of question.options || []) {
      for (const [id, value] of Object.entries(option.first || {})) {
        if (Number(value || 0) <= 0) continue;
        firstPositiveOptions[id] = (firstPositiveOptions[id] || 0) + 1;
      }
      for (const [id, value] of Object.entries(option.second || {})) {
        if (Number(value || 0) <= 0) continue;
        secondPositiveOptions[id] = (secondPositiveOptions[id] || 0) + 1;
      }
      addScore(firstTotals, option.first, weight);
      addScore(secondTotals, option.second, weight);
    }
  }

  function rows(totals, positiveOptions) {
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([id, total]) => ({
        id,
        name: jobDisplayNames[id] || id,
        positiveOptions: positiveOptions[id] || 0,
        totalOptionPoints: Number(total.toFixed(2)),
        expectedUniformPoints: Number((total / msciV2Questions.length / 5).toFixed(3)),
      }));
  }

  return {
    first: rows(firstTotals, firstPositiveOptions),
    second: rows(secondTotals, secondPositiveOptions),
  };
}

function simulate({ runs, seed, mode }) {
  const random = mulberry32(seed);
  const firstCounts = {};
  const secondCounts = {};
  const firstScoreTotals = {};
  const secondScoreTotals = {};

  for (let i = 0; i < runs; i += 1) {
    const responses = {};
    for (const question of msciV2Questions) {
      const option = pickRandom(question.options || [], random);
      if (option) responses[question.id] = option.key;
    }

    const result = scoreMsciV2(responses, mode);
    const first = result?.firstRanking?.[0]?.id;
    const second = result?.secondRanking?.[0]?.id || result?.secondJob;
    if (first) firstCounts[first] = (firstCounts[first] || 0) + 1;
    if (second) secondCounts[second] = (secondCounts[second] || 0) + 1;

    for (const row of result?.firstRanking || []) {
      firstScoreTotals[row.id] = (firstScoreTotals[row.id] || 0) + Number(row.score || 0);
    }
    for (const row of result?.secondRanking || []) {
      secondScoreTotals[row.id] = (secondScoreTotals[row.id] || 0) + Number(row.score || 0);
    }
  }

  function averageRows(scoreTotals) {
    return Object.entries(scoreTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([id, total]) => ({
        id,
        name: jobDisplayNames[id] || id,
        avgScore: Number((total / runs).toFixed(3)),
      }));
  }

  return {
    mode,
    runs,
    seed,
    questions: msciV2Questions.length,
    firstResultDistribution: countMapToRows(firstCounts, runs),
    secondResultDistribution: countMapToRows(secondCounts, runs),
    firstAverageScores: averageRows(firstScoreTotals),
    secondAverageScores: averageRows(secondScoreTotals),
    optionPressure: analyzeQuestionPressure(),
  };
}

const config = parseArgs(process.argv);
const result = simulate(config);

console.log(`\nMSCI balance simulation | mode=${result.mode} | runs=${result.runs} | questions=${result.questions} | seed=${result.seed}\n`);
console.log("First job result distribution");
console.table(result.firstResultDistribution);
console.log("Second job result distribution");
console.table(result.secondResultDistribution);
console.log("First job average scores");
console.table(result.firstAverageScores);
console.log("Second job average scores");
console.table(result.secondAverageScores);
console.log("First job option pressure");
console.table(result.optionPressure.first);
console.log("Second job option pressure");
console.table(result.optionPressure.second);

console.log("\nJSON summary:");
console.log(JSON.stringify(result, null, 2));
