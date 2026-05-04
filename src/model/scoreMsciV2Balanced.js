import {
  jobDisplayNames,
  msciV2Questions,
  scoreMsciV2 as scoreMsciV2Raw,
  secondJobGroups,
} from "./msciV2QuestionBank.js";
import { msciBalanceMultipliers } from "./msciBalanceMultipliers.js";

const firstJobIdsByMode = {
  global: ["warrior", "magician", "thief", "archer"],
  china: ["warrior", "magician", "thief", "archer", "pirate"],
};

function addScores(target, scores, weight = 1) {
  Object.entries(scores || {}).forEach(([id, value]) => {
    target[id] = (target[id] || 0) + Number(value || 0) * weight;
  });
}

function makeRanking(ids, scores, multipliers) {
  const rows = ids.map((id) => {
    const rawScore = Number((scores[id] || 0).toFixed(3));
    const score = Number((rawScore * (multipliers[id] ?? 1)).toFixed(3));
    return {
      id,
      name: jobDisplayNames[id] || id,
      rawScore,
      score,
      matchPercent: 0,
    };
  });

  rows.sort((a, b) => b.score - a.score);
  const topScore = rows[0]?.score || 0;
  return rows.map((row) => ({
    ...row,
    matchPercent: topScore > 0 ? Math.max(0, Math.min(100, Math.round((row.score / topScore) * 100))) : 0,
  }));
}

function makeConfidence(rows) {
  const top = rows?.[0]?.score ?? 0;
  const second = rows?.[1]?.score ?? 0;
  const gap = Number((top - second).toFixed(3));
  let label = "低";
  if (gap >= 3) label = "高";
  else if (gap >= 1.5) label = "中";
  return { gap, label };
}

function calculateBalancedRankings(responses, mode) {
  const firstIds = firstJobIdsByMode[mode] || firstJobIdsByMode.china;
  const firstScores = Object.fromEntries(firstIds.map((id) => [id, 0]));
  const secondScores = {};

  Object.values(secondJobGroups).flat().forEach((id) => {
    secondScores[id] = 0;
  });

  for (const question of msciV2Questions) {
    const answerKey = responses?.[question.id];
    if (answerKey === undefined) continue;
    const option = (question.options || []).find((item) => item.key === answerKey);
    if (!option) continue;
    const weight = question.weight ?? 1;
    addScores(firstScores, option.first, weight);
    addScores(secondScores, option.second, weight);
  }

  const firstRanking = makeRanking(firstIds, firstScores, msciBalanceMultipliers.first);
  const firstJob = firstRanking[0]?.id || firstIds[0];
  const secondIds = secondJobGroups[firstJob] || [];
  const secondRanking = makeRanking(secondIds, secondScores, msciBalanceMultipliers.second);
  const secondJob = secondRanking[0]?.id || secondIds[0];

  return { firstJob, secondJob, firstRanking, secondRanking };
}

export function scoreMsciV2(responses, mode = "china") {
  const raw = scoreMsciV2Raw(responses, mode);
  const balanced = calculateBalancedRankings(responses, mode);

  return {
    ...raw,
    ...balanced,
    firstConfidence: makeConfidence(balanced.firstRanking),
    secondConfidence: makeConfidence(balanced.secondRanking),
  };
}
