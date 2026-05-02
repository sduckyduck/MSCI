export const answerScale = [
  { value: -2, label: "非常不同意" },
  { value: -1, label: "不太同意" },
  { value: 0, label: "看情况" },
  { value: 1, label: "比较同意" },
  { value: 2, label: "非常同意" },
];

export const firstJobDimensions = {
  distance: {
    label: "战斗距离",
    low: "远程安全",
    high: "近战承压",
  },
  magic: {
    label: "攻击体系",
    low: "物理攻击",
    high: "魔法技能",
  },
  investment: {
    label: "资源投入",
    low: "省钱平民",
    high: "愿意投入",
  },
  efficiency: {
    label: "开荒效率",
    low: "慢慢养成",
    high: "追求效率",
  },
  burst: {
    label: "输出风格",
    low: "稳定持续",
    high: "爆发风险",
  },
  party: {
    label: "社交定位",
    low: "独狼单刷",
    high: "组队价值",
  },
  complexity: {
    label: "操作复杂度",
    low: "简单直接",
    high: "机制操作",
  },
  lateGame: {
    label: "后期耐心",
    low: "前期舒服",
    high: "愿意慢热",
  },
};

export const firstJobQuestions = [
  {
    id: "F01",
    text: "我可以接受前期练级慢一点，只要后期职业存在感更强。",
    effects: { lateGame: 1.2, efficiency: -0.6, distance: 0.4 },
  },
  {
    id: "F02",
    text: "开服第一周，我更想选择升级效率高、清怪舒服的职业。",
    effects: { efficiency: 1.2, magic: 0.7, lateGame: -0.3 },
  },
  {
    id: "F03",
    text: "为了职业手感、伤害和帅，我愿意多花一些资源。",
    effects: { investment: 1.2, burst: 0.9, complexity: 0.4 },
  },
  {
    id: "F04",
    text: "我更喜欢站在安全距离输出，而不是贴脸硬打。",
    effects: { distance: -1.2, burst: -0.2, complexity: 0.2 },
  },
  {
    id: "F05",
    text: "我喜欢技能范围、元素、魔法特效，而不是纯物理攻击。",
    effects: { magic: 1.4, efficiency: 0.4 },
  },
  {
    id: "F06",
    text: "我不介意职业前期有点坐牢，越养越强反而更有成就感。",
    effects: { lateGame: 1.1, efficiency: -0.7, investment: 0.3 },
  },
  {
    id: "F07",
    text: "我更喜欢爆发、暴击、速度感，而不是稳定慢慢磨。",
    effects: { burst: 1.3, complexity: 0.6, investment: 0.5 },
  },
  {
    id: "F08",
    text: "我希望自己的职业在组队里有明显价值，而不是完全独狼。",
    effects: { party: 1.2, efficiency: 0.2 },
  },
  {
    id: "F09",
    text: "我喜欢简单直接的职业，不想研究太多机制和细节。",
    effects: { complexity: -1.1, burst: -0.3 },
  },
  {
    id: "F10",
    text: "如果一个职业很热门、装备贵，但玩起来很帅，我还是会考虑。",
    effects: { investment: 1.1, burst: 0.8, complexity: 0.3 },
  },
  {
    id: "F11",
    text: "我更愿意选择冷门图、稳定刷怪，不喜欢在热门图抢怪。",
    effects: { distance: -0.5, efficiency: -0.2, party: -0.4, complexity: 0.3 },
  },
  {
    id: "F12",
    text: "我希望角色比较硬，能承压，打怪失误也不容易死。",
    effects: { distance: 1.0, lateGame: 0.4, burst: -0.3 },
  },
  {
    id: "F13",
    text: "我喜欢通过站位、距离和节奏来打怪。",
    effects: { distance: -1.0, complexity: 0.8, burst: -0.2 },
  },
  {
    id: "F14",
    text: "我更在意平民友好和药水压力，不想一开服就被成本卡住。",
    effects: { investment: -1.2, efficiency: 0.4, lateGame: -0.2 },
  },
  {
    id: "F15",
    text: "我希望职业有操作上限，不想只是站桩按一个技能。",
    effects: { complexity: 1.2, burst: 0.5 },
  },
  {
    id: "F16",
    text: "我选职业时会优先考虑长期价值，而不是第一天练得快不快。",
    effects: { lateGame: 1.0, efficiency: -0.6, party: 0.3 },
  },
];

export const firstJobProfiles = {
  warrior: {
    name: "战士",
    subtitle: "前期承压，后期成长",
    tag: "后期成长型",
    dimensions: {
      distance: 2,
      magic: -2,
      investment: 1,
      efficiency: -1,
      burst: -0.5,
      party: 0.8,
      complexity: -0.6,
      lateGame: 2,
    },
    description:
      "你更能接受前期慢热和近战压力，重视成长感、承压能力和后期存在感。",
  },
  magician: {
    name: "法师",
    subtitle: "远程魔法，开荒效率",
    tag: "效率开荒型",
    dimensions: {
      distance: -2,
      magic: 2,
      investment: -0.2,
      efficiency: 2,
      burst: 0,
      party: 0.8,
      complexity: 0,
      lateGame: 0,
    },
    description:
      "你偏向远程、安全、魔法技能和舒服练级，适合重视开荒效率的玩家。",
  },
  thief: {
    name: "飞侠",
    subtitle: "速度爆发，帅和操作",
    tag: "爆发操作型",
    dimensions: {
      distance: -0.6,
      magic: -2,
      investment: 2,
      efficiency: 0,
      burst: 2,
      party: -0.8,
      complexity: 2,
      lateGame: 0.8,
    },
    description:
      "你更看重速度、爆发、手感和个性，能接受更高资源投入和操作要求。",
  },
  archer: {
    name: "弓箭手",
    subtitle: "远程物理，稳定慢热",
    tag: "稳定远程型",
    dimensions: {
      distance: -2,
      magic: -2,
      investment: 0,
      efficiency: 0,
      burst: -0.8,
      party: -0.4,
      complexity: 0.8,
      lateGame: 1.4,
    },
    description:
      "你喜欢远程、稳定、站位和慢热成长，不一定追求最快，但重视自己的节奏。",
  },
};

export const secondJobDimensions = {
  warrior: {
    feature: { label: "职业特色", low: "正统稳定", high: "机制特色" },
    party: { label: "团队价值", low: "单刷成长", high: "组队存在" },
    weapon: { label: "武器偏好", low: "剑系经典", high: "特殊/长兵器" },
    lateGame: { label: "后期耐心", low: "前期顺手", high: "后期价值" },
  },
  magician: {
    control: { label: "控图群攻", low: "单体/机制", high: "群攻控场" },
    party: { label: "组队辅助", low: "独狼输出", high: "团队辅助" },
    research: { label: "机制研究", low: "简单效率", high: "属性机制" },
    support: { label: "安全价值", low: "伤害优先", high: "生存团队" },
  },
  thief: {
    range: { label: "攻击距离", low: "近战匕首", high: "远程飞镖" },
    popularity: { label: "路线热度", low: "小众个性", high: "热门人气" },
    burst: { label: "爆发爽感", low: "稳定发育", high: "爆发暴击" },
    investment: { label: "资源投入", low: "性价比", high: "愿意投入" },
  },
  archer: {
    speed: { label: "攻击节奏", low: "重击精准", high: "灵活攻速" },
    mainstream: { label: "路线选择", low: "冷门辨识", high: "主流稳定" },
    early: { label: "前期顺手", low: "慢热耐心", high: "更顺手" },
    flow: { label: "流畅体验", low: "个性路线", high: "流畅手感" },
  },
};

export const secondJobQuestions = {
  warrior: [
    { id: "W01", text: "我喜欢正统战士路线，稳定、简单、主角感强。", effects: { feature: -1.0, weapon: -1.0 } },
    { id: "W02", text: "我愿意玩更有特色的战士，即使它不是最热门。", effects: { feature: 1.2, weapon: 0.6 } },
    { id: "W03", text: "我希望后期在组队里有明显存在感。", effects: { party: 1.1, lateGame: 0.8 } },
    { id: "W04", text: "比起剑，我更喜欢枪、矛、长兵器这种视觉效果。", effects: { weapon: 1.3, lateGame: 0.4 } },
    { id: "W05", text: "我不太想研究冷门路线，只想选最经典、最好理解的战士。", effects: { feature: -1.1, weapon: -0.7 } },
    { id: "W06", text: "我能忍前期不舒服，因为我更看重后期价值。", effects: { lateGame: 1.2, party: 0.5 } },
    { id: "W07", text: "我喜欢盾牌、骑士感、防御感和职业辨识度。", effects: { feature: 1.3, party: 0.4, weapon: 0.2 } },
    { id: "W08", text: "我希望职业输出方式直接，不要太多分支纠结。", effects: { feature: -0.9, lateGame: -0.2 } },
  ],
  magician: [
    { id: "M01", text: "我喜欢冰冻、雷电、控场和范围清怪。", effects: { control: 1.3, research: -0.2 } },
    { id: "M02", text: "我喜欢研究怪物属性、技能机制和路线效率。", effects: { research: 1.3, party: -0.3 } },
    { id: "M03", text: "我喜欢被队伍需要，而不是只追求自己伤害高。", effects: { party: 1.2, support: 1.0 } },
    { id: "M04", text: "我更想快速清图，不想每张图都研究太多机制。", effects: { control: 1.1, research: -0.9 } },
    { id: "M05", text: "我能接受牺牲一点输出，换来更高组队价值。", effects: { party: 1.1, support: 1.2 } },
    { id: "M06", text: "我喜欢火焰、毒、持续伤害和单体爆发这种职业味道。", effects: { control: -0.8, research: 1.2, support: -0.5 } },
    { id: "M07", text: "我更喜欢自己刷怪，不想太依赖组队。", effects: { party: -1.1, support: -0.6 } },
    { id: "M08", text: "安全感、治疗和稳定比极限输出更吸引我。", effects: { support: 1.2, party: 0.8 } },
  ],
  thief: [
    { id: "T01", text: "我喜欢远程丢标、暴击、速度感和飘逸手感。", effects: { range: 1.3, burst: 1.0, popularity: 0.6 } },
    { id: "T02", text: "我喜欢贴脸匕首、近战操作和更有个性的路线。", effects: { range: -1.3, popularity: -0.8, burst: 0.4 } },
    { id: "T03", text: "热门也没关系，只要职业够帅、够强、够有排面。", effects: { popularity: 1.1, investment: 0.8, burst: 0.5 } },
    { id: "T04", text: "我更愿意选小众路线，不想和所有人一样。", effects: { popularity: -1.2, range: -0.4 } },
    { id: "T05", text: "为了输出和手感，我愿意承担更高装备和消耗成本。", effects: { investment: 1.3, burst: 0.8 } },
    { id: "T06", text: "我更在意性价比和职业个性，不想纯跟风。", effects: { investment: -0.8, popularity: -0.9 } },
    { id: "T07", text: "我选飞侠最看重爆发和暴击数字。", effects: { burst: 1.2, range: 0.5 } },
    { id: "T08", text: "我喜欢操作感，但不一定要走最贵最热门的路线。", effects: { range: -0.5, popularity: -0.8, investment: -0.4 } },
  ],
  archer: [
    { id: "A01", text: "我喜欢更灵活、更顺手、更传统的弓箭手体验。", effects: { speed: 1.2, mainstream: 1.0, flow: 1.0 } },
    { id: "A02", text: "我喜欢单下更重、精准、冷门、有辨识度的路线。", effects: { speed: -1.3, mainstream: -1.0, flow: -0.4 } },
    { id: "A03", text: "我更看重练级流畅度，不想前期过于别扭。", effects: { early: 1.1, flow: 1.0 } },
    { id: "A04", text: "职业慢热没关系，我喜欢长期养成和冷门坚持。", effects: { early: -1.0, mainstream: -0.8 } },
    { id: "A05", text: "我想要主流一点、好理解一点的远程物理职业。", effects: { mainstream: 1.1, speed: 0.8 } },
    { id: "A06", text: "如果一个职业冷门但有力量感，我会更想尝试。", effects: { mainstream: -1.1, speed: -0.8 } },
    { id: "A07", text: "我喜欢轻快节奏和更顺的攻击手感。", effects: { speed: 1.1, flow: 1.0 } },
    { id: "A08", text: "我不介意前期稍慢，只要职业最后很有自己的味道。", effects: { early: -0.9, mainstream: -0.5, flow: -0.3 } },
  ],
};

export const secondJobProfiles = {
  warrior: {
    fighter: {
      name: "剑客",
      tag: "经典主角型",
      dimensions: { feature: -2, party: 0, weapon: -2, lateGame: 0 },
      description: "你喜欢正统、稳定、好理解的战士路线，不追求花哨，但重视主角感。",
    },
    page: {
      name: "准骑士",
      tag: "冷门信仰型",
      dimensions: { feature: 2, party: 0.8, weapon: 0.6, lateGame: 0.8 },
      description: "你喜欢职业特色、骑士感和辨识度，不怕小众，愿意玩出自己的理解。",
    },
    spearman: {
      name: "枪战士",
      tag: "后期团队型",
      dimensions: { feature: 0.8, party: 2, weapon: 2, lateGame: 2 },
      description: "你更看重长兵器、后期价值和组队存在感，能接受前期慢热。",
    },
  },
  magician: {
    iceLightning: {
      name: "冰雷法师",
      tag: "控图效率型",
      dimensions: { control: 2, party: 0, research: -0.2, support: 0 },
      description: "你偏向控场、范围清怪和练级效率，喜欢让地图变得更好刷。",
    },
    firePoison: {
      name: "火毒法师",
      tag: "机制爆发型",
      dimensions: { control: -1, party: -0.8, research: 2, support: -0.8 },
      description: "你喜欢研究属性、持续伤害和路线机制，不满足于最无脑的效率答案。",
    },
    cleric: {
      name: "牧师",
      tag: "队伍核心型",
      dimensions: { control: 0, party: 2, research: 0, support: 2 },
      description: "你重视组队、安全感和长期价值，喜欢被队伍真正需要。",
    },
  },
  thief: {
    assassin: {
      name: "刺客",
      tag: "人气爆发型",
      dimensions: { range: 2, popularity: 2, burst: 2, investment: 2 },
      description: "你拒绝不了远程丢标、暴击、速度感和热门职业的帅。",
    },
    bandit: {
      name: "侠客",
      tag: "近战个性型",
      dimensions: { range: -2, popularity: -1.2, burst: 0.8, investment: 0 },
      description: "你喜欢匕首、贴脸操作和小众个性，不太想和所有人玩一样的路线。",
    },
  },
  archer: {
    hunter: {
      name: "猎人",
      tag: "灵活远程型",
      dimensions: { speed: 2, mainstream: 2, early: 1, flow: 2 },
      description: "你喜欢灵活、顺手、主流、流畅的远程物理体验。",
    },
    crossbowman: {
      name: "弩弓手",
      tag: "冷门精准型",
      dimensions: { speed: -2, mainstream: -1.2, early: -0.8, flow: -0.8 },
      description: "你喜欢重击感、精准感和冷门辨识度，能接受慢热和个性路线。",
    },
  },
};

export function createEmptyScores(dimensions) {
  return Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0]));
}

export function scoreQuestions(questions, responses, dimensions) {
  const scores = createEmptyScores(dimensions);

  for (const question of questions) {
    const answerValue = Number(responses[question.id] ?? 0);
    for (const [dimension, weight] of Object.entries(question.effects || {})) {
      if (!(dimension in scores)) scores[dimension] = 0;
      scores[dimension] += answerValue * weight;
    }
  }

  return scores;
}

function dotProduct(a, b) {
  return Object.keys(b).reduce((total, key) => total + (Number(a[key]) || 0) * (Number(b[key]) || 0), 0);
}

function vectorMagnitude(vector) {
  return Math.sqrt(Object.values(vector).reduce((total, value) => total + Number(value || 0) ** 2, 0));
}

export function matchProfiles(scores, profiles) {
  const scoreMagnitude = vectorMagnitude(scores) || 1;

  return Object.entries(profiles)
    .map(([id, profile]) => {
      const profileMagnitude = vectorMagnitude(profile.dimensions) || 1;
      const cosine = dotProduct(scores, profile.dimensions) / (scoreMagnitude * profileMagnitude);
      const bounded = Math.max(-1, Math.min(1, cosine));
      const matchPercent = Math.round(((bounded + 1) / 2) * 100);

      return {
        id,
        ...profile,
        cosine: bounded,
        matchPercent,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export function getConfidence(topResults) {
  if (!topResults?.length) return { label: "未知", gap: 0, note: "题目尚未完成。" };
  const top = topResults[0]?.matchPercent ?? 0;
  const second = topResults[1]?.matchPercent ?? 0;
  const gap = top - second;

  if (gap >= 12) return { label: "高", gap, note: "主结果比较明确，副人格只是补充参考。" };
  if (gap >= 6) return { label: "中", gap, note: "主结果领先，但副人格也有明显适配。" };
  return { label: "低", gap, note: "你属于混合型玩家，可以参考前两名一起判断。" };
}

export function getMissingQuestionCount(questions, responses) {
  return questions.filter((question) => responses[question.id] === undefined).length;
}

export function getDimensionSummary(scores, dimensions) {
  return Object.entries(dimensions).map(([key, meta]) => {
    const value = Number(scores[key] || 0);
    return {
      key,
      ...meta,
      value,
      side: value >= 0 ? meta.high : meta.low,
      intensity: Math.min(100, Math.round((Math.abs(value) / 8) * 100)),
    };
  });
}
