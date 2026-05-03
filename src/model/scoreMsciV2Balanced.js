import {
  scoreMsciV2 as scoreMsciV2Raw,
  secondJobGroups,
} from "./msciV2QuestionBank.js";
import { msciBalanceMultipliers } from "./msciBalanceMultipliers.js";

function applyMultipliers(rows, multipliers) {
  return [...(rows || [])]
    .map((row) => ({
      ...row,
      rawScore: row.rawScore ?? row.score,
      score: Number(((Number(row.score || 0)) * (multipliers[row.id] ?? 1)).toFixed(3)),
    }))
    .sort((a, b) => b.score - a.score);
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

export function scoreMsciV2(responses, mode = "china") {
  const raw = scoreMsciV2Raw(responses, mode);
  const firstRanking = applyMultipliers(raw.firstRanking, msciBalanceMultipliers.first);
  const firstJob = firstRanking[0]?.id || raw.firstJob;
  const allowedSecondJobs = new Set(secondJobGroups[firstJob] || []);

  let secondRanking = applyMultipliers(raw.secondRanking, msciBalanceMultipliers.second);
  secondRanking = secondRanking.filter((row) => allowedSecondJobs.has(row.id));

  const secondJob = secondRanking[0]?.id || raw.secondJob;

  return {
    ...raw,
    firstJob,
    secondJob,
    firstRanking,
    secondRanking,
    firstConfidence: makeConfidence(firstRanking),
    secondConfidence: makeConfidence(secondRanking),
  };
}
