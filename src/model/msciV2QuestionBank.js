const firstJobIdsByMode = {
  global: ["warrior", "magician", "thief", "archer"],
  china: ["warrior", "magician", "thief", "archer", "pirate"],
};

export const secondJobGroups = {
  warrior: ["fighter", "page", "spearman"],
  magician: ["iceLightning", "firePoison", "cleric"],
  thief: ["assassin", "bandit"],
  archer: ["hunter", "crossbowman"],
  pirate: ["brawler", "gunslinger"],
};

export const jobDisplayNames = {
  warrior: "战士",
  magician: "法师",
  thief: "飞侠",
  archer: "弓箭手",
  pirate: "海盗",
  fighter: "剑客",
  page: "准骑士",
  spearman: "枪战士",
  iceLightning: "冰雷法师",
  firePoison: "火毒法师",
  cleric: "牧师",
  assassin: "刺客",
  bandit: "侠客",
  hunter: "猎人",
  crossbowman: "弩弓手",
  brawler: "拳手",
  gunslinger: "火枪手",
};

export const traitDisplayNames = {
  risk: "风险承受",
  safety: "安全意识",
  efficiency: "刷怪效率",
  support: "团队辅助",
  solo: "独狼倾向",
  social: "社交倾向",
  investment: "资源投入",
  economy: "省钱规划",
  control: "控场规划",
  mobility: "机动变化",
  patience: "长期耐心",
  burst: "爆发爽点",
  range: "远程偏好",
  melee: "近身承压",
  novelty: "新鲜感",
};

function opt(key, label, scoring = {}) {
  return {
    key,
    label,
    first: scoring.first || {},
    second: scoring.second || {},
    traits: scoring.traits || {},
  };
}

export const msciV2Questions = [
  {
    id: "Q01",
    section: "行事决策倾向",
    weight: 1,
    text: "你在野外赶路，突然撞见一群主动围过来的小怪，你的第一反应是？",
    options: [
      opt("A", "迎面而上直接处理，速战速决", { first: { warrior: 2, thief: 0.5, pirate: 1 }, second: { fighter: 1, brawler: 1 }, traits: { melee: 2, risk: 1 } }),
      opt("B", "退到安全距离外稳妥解决", { first: { archer: 2, thief: 0.8, pirate: 0.6 }, second: { hunter: 1, crossbowman: 0.8, assassin: 0.7, gunslinger: 1 }, traits: { range: 2, safety: 1 } }),
      opt("C", "控住节奏，确保状态安全", { first: { magician: 2, warrior: 0.5 }, second: { iceLightning: 1, cleric: 0.8, page: 0.6 }, traits: { control: 2, safety: 1 } }),
      opt("D", "换路线绕开，不浪费精力", { first: { thief: 1.2, archer: 0.8, pirate: 0.5 }, second: { bandit: 0.8, crossbowman: 0.5 }, traits: { mobility: 1, economy: 1 } }),
      opt("E", "喊同伴一起处理", { first: { magician: 1, warrior: 0.8, pirate: 0.4 }, second: { cleric: 1.5, spearman: 1, page: 0.6 }, traits: { support: 2, social: 1 } }),
    ],
  },
  {
    id: "Q02",
    section: "行事决策倾向",
    weight: 1,
    text: "高难度副本里，BOSS突然放出大范围高危招式，你的第一选择是？",
    options: [
      opt("A", "顶着压力继续推进", { first: { warrior: 1.8, thief: 1, pirate: 1 }, second: { fighter: 1, brawler: 1, assassin: 0.6 }, traits: { risk: 2, melee: 1, burst: 1 } }),
      opt("B", "精准躲开，安全区持续行动", { first: { archer: 1.8, thief: 1, pirate: 0.8 }, second: { hunter: 1, assassin: 0.7, gunslinger: 1 }, traits: { safety: 1, range: 1.5, mobility: 1 } }),
      opt("C", "先顾好同伴状态", { first: { magician: 1.6, warrior: 0.7 }, second: { cleric: 1.8, page: 0.7, spearman: 0.6 }, traits: { support: 2, social: 1 } }),
      opt("D", "撤到最安全角落", { first: { archer: 1.2, magician: 0.6 }, second: { crossbowman: 0.8, page: 0.6 }, traits: { safety: 2 } }),
      opt("E", "喊同伴分摊风险", { first: { warrior: 1, magician: 1, pirate: 0.4 }, second: { spearman: 1.2, cleric: 1.2, page: 0.7 }, traits: { support: 1.5, social: 1.5 } }),
    ],
  },
  {
    id: "Q03",
    section: "行事决策倾向",
    weight: 1,
    text: "日常重复刷资源的时候，你最在意哪种体验？",
    options: [
      opt("A", "一次处理一大片，效率拉满", { first: { magician: 2, warrior: 0.4, pirate: 0.6 }, second: { iceLightning: 1.3, fighter: 0.4, gunslinger: 0.5 }, traits: { efficiency: 2, control: 1 } }),
      opt("B", "每一下精准打在关键点", { first: { archer: 1.5, thief: 1.2 }, second: { crossbowman: 1.2, assassin: 1 }, traits: { burst: 1, range: 1 } }),
      opt("C", "轻松完成，节奏可控", { first: { warrior: 1, magician: 0.8, archer: 0.5 }, second: { page: 0.9, cleric: 0.8 }, traits: { safety: 1, patience: 1 } }),
      opt("D", "灵活好玩，玩得花", { first: { thief: 1.4, pirate: 1.5, archer: 0.4 }, second: { bandit: 1, brawler: 1, gunslinger: 0.8 }, traits: { mobility: 2, novelty: 1 } }),
      opt("E", "帮同伴提高效率", { first: { magician: 1.5, warrior: 0.5 }, second: { cleric: 1.8, spearman: 0.8 }, traits: { support: 2, social: 1 } }),
    ],
  },
  {
    id: "Q04",
    section: "行事决策倾向",
    weight: 1,
    text: "刷怪时突然弹出来 MISS，你的第一反应是？",
    options: [
      opt("A", "立刻换武器堆命中，必须整没", { first: { warrior: 1.5, thief: 0.8 }, second: { fighter: 0.9, assassin: 0.6 }, traits: { investment: 1.5, control: 1 } }),
      opt("B", "无所谓，手长多打一下", { first: { archer: 1.6, thief: 0.7, pirate: 0.8 }, second: { hunter: 0.8, crossbowman: 0.7, gunslinger: 1 }, traits: { range: 2, patience: 0.5 } }),
      opt("C", "血厚，慢慢磨", { first: { warrior: 2 }, second: { page: 1.2, spearman: 0.7 }, traits: { melee: 1, safety: 1, patience: 1 } }),
      opt("D", "换个怪打，不较劲", { first: { thief: 1.2, archer: 0.8, pirate: 0.6 }, second: { bandit: 0.8, crossbowman: 0.5 }, traits: { mobility: 1, economy: 1 } }),
      opt("E", "喊队友帮忙", { first: { magician: 1.2, warrior: 0.6 }, second: { cleric: 1.4, spearman: 0.8 }, traits: { support: 1.5, social: 1 } }),
    ],
  },
  {
    id: "Q05",
    section: "资源管理偏好",
    weight: 1,
    text: "升到关键等级，解锁新的成长阶段，你第一件事会做什么？",
    options: [
      opt("A", "全身配置更新到最优", { first: { thief: 1.5, warrior: 1, archer: 0.6 }, second: { assassin: 1, fighter: 0.6 }, traits: { investment: 2, control: 1 } }),
      opt("B", "消耗品备满才安心", { first: { magician: 1.4, warrior: 0.7 }, second: { cleric: 0.8, iceLightning: 0.7, page: 0.5 }, traits: { safety: 1.5, patience: 1 } }),
      opt("C", "核心能力点先分配到位", { first: { warrior: 1, archer: 1, magician: 0.6 }, second: { fighter: 0.7, crossbowman: 0.7, firePoison: 0.6 }, traits: { control: 1.5, efficiency: 0.5 } }),
      opt("D", "交易区捡漏，能省则省", { first: { thief: 1, archer: 0.8 }, second: { bandit: 1.2, crossbowman: 0.6 }, traits: { economy: 2 } }),
      opt("E", "找大佬带流程", { first: { magician: 0.8, pirate: 0.6 }, second: { cleric: 0.8, spearman: 0.5 }, traits: { social: 1, safety: 0.5 } }),
    ],
  },
  {
    id: "Q06",
    section: "资源管理偏好",
    weight: 1,
    text: "打本到一半，必备消耗品快见底了，你会？",
    options: [
      opt("A", "直接补满拉满，节奏不能断", { first: { thief: 1.4, magician: 1, pirate: 0.7 }, second: { assassin: 1, iceLightning: 0.7, gunslinger: 0.5 }, traits: { investment: 1.5, efficiency: 1 } }),
      opt("B", "先撤出去补满", { first: { archer: 1, warrior: 0.8, magician: 0.5 }, second: { page: 0.6, crossbowman: 0.6 }, traits: { safety: 1.5 } }),
      opt("C", "精准规划用量", { first: { archer: 1.2, magician: 0.9 }, second: { crossbowman: 0.8, firePoison: 0.8 }, traits: { control: 1.5, economy: 0.8 } }),
      opt("D", "低成本方式继续", { first: { archer: 1, thief: 0.8 }, second: { bandit: 1, crossbowman: 0.7 }, traits: { economy: 2, patience: 0.5 } }),
      opt("E", "跟同伴匀一点", { first: { magician: 1.2, warrior: 0.6 }, second: { cleric: 1.4, spearman: 0.8 }, traits: { support: 1.2, social: 1.2 } }),
    ],
  },
  {
    id: "Q07",
    section: "资源管理偏好",
    weight: 1,
    text: "对于游戏货币，你的核心理念更贴合哪一种？",
    options: [
      opt("A", "能变强花多少都舍得", { first: { thief: 1.8, warrior: 0.9, pirate: 0.7 }, second: { assassin: 1.2, fighter: 0.7 }, traits: { investment: 2, burst: 1 } }),
      opt("B", "货币就是安全感", { first: { magician: 1, warrior: 0.8, archer: 0.5 }, second: { cleric: 0.8, page: 0.7 }, traits: { safety: 1.5, patience: 0.8 } }),
      opt("C", "优先核心能力提升", { first: { warrior: 1, archer: 1, magician: 0.6 }, second: { fighter: 0.7, crossbowman: 0.7 }, traits: { control: 1.5 } }),
      opt("D", "高回报值得冒险", { first: { thief: 1.6, pirate: 0.9, magician: 0.5 }, second: { bandit: 1, firePoison: 0.6, brawler: 0.6 }, traits: { risk: 1.5, novelty: 1 } }),
      opt("E", "给同伴花也值", { first: { magician: 1.5, warrior: 0.7 }, second: { cleric: 1.8, spearman: 0.8 }, traits: { support: 2, social: 1 } }),
    ],
  },
  {
    id: "Q08",
    section: "资源管理偏好",
    weight: 1,
    text: "连续刷很久没出想要的装备，你会？",
    options: [
      opt("A", "继续死磕，不出不走", { first: { warrior: 1.5, thief: 1 }, second: { fighter: 0.8, assassin: 0.7 }, traits: { patience: 1.5, risk: 0.8 } }),
      opt("B", "每日固定次数，稳扎稳打", { first: { archer: 1.2, warrior: 0.8 }, second: { page: 0.8, crossbowman: 0.8 }, traits: { patience: 1.5, safety: 0.8 } }),
      opt("C", "提升配置，提高效率", { first: { thief: 1.2, warrior: 1, magician: 0.6 }, second: { assassin: 0.8, fighter: 0.7, iceLightning: 0.5 }, traits: { investment: 1, efficiency: 1 } }),
      opt("D", "换方式刷，广撒网", { first: { thief: 1.2, pirate: 1, archer: 0.5 }, second: { bandit: 0.9, brawler: 0.6, gunslinger: 0.5 }, traits: { mobility: 1.5, novelty: 1 } }),
      opt("E", "喊朋友一起刷", { first: { magician: 1.2, warrior: 0.8 }, second: { cleric: 1.2, spearman: 0.9 }, traits: { social: 1.5, support: 1 } }),
    ],
  },
  {
    id: "Q09",
    section: "社交组队模式",
    weight: 1,
    text: "周末上线玩游戏，你更倾向于？",
    options: [
      opt("A", "自己找地图单刷", { first: { archer: 1.2, thief: 1.1, magician: 0.5 }, second: { assassin: 0.7, firePoison: 0.7, crossbowman: 0.6 }, traits: { solo: 2, efficiency: 0.8 } }),
      opt("B", "固定队整齐打本", { first: { magician: 1.2, warrior: 1 }, second: { cleric: 1.2, spearman: 1, page: 0.5 }, traits: { social: 2, support: 1 } }),
      opt("C", "随便进队混", { first: { pirate: 0.8, magician: 0.5 }, second: { cleric: 0.6, brawler: 0.5 }, traits: { social: 0.8, safety: 0.5 } }),
      opt("D", "自由市场摆摊聊天", { first: { thief: 0.8, magician: 0.7 }, second: { bandit: 1, cleric: 0.7 }, traits: { social: 1.5, economy: 1 } }),
      opt("E", "抱大腿跟着混", { first: { magician: 0.7, pirate: 0.5 }, second: { cleric: 0.7, spearman: 0.5 }, traits: { social: 1, safety: 1 } }),
    ],
  },
  {
    id: "Q10",
    section: "社交组队模式",
    weight: 1,
    text: "组队打本，队友突然暴毙了，你会？",
    options: [
      opt("A", "不管他，先输出", { first: { thief: 1.5, warrior: 0.8 }, second: { assassin: 1, fighter: 0.6 }, traits: { burst: 1.5, solo: 0.8 } }),
      opt("B", "停手拉队友，全队整齐", { first: { magician: 2, warrior: 0.4 }, second: { cleric: 2 }, traits: { support: 2, social: 1 } }),
      opt("C", "边输出边喊别人拉人", { first: { archer: 1, thief: 0.8, pirate: 0.8 }, second: { hunter: 0.7, gunslinger: 0.7, assassin: 0.5 }, traits: { efficiency: 1, control: 0.8 } }),
      opt("D", "直接润，先溜为敬", { first: { archer: 0.8, thief: 0.8 }, second: { bandit: 0.7, crossbowman: 0.5 }, traits: { safety: 1.2, mobility: 1 } }),
      opt("E", "跟着一起死，同生共死", { first: { warrior: 1.2, magician: 0.8 }, second: { spearman: 1, cleric: 0.8, page: 0.4 }, traits: { social: 1.5, support: 0.8 } }),
    ],
  },
  {
    id: "Q11",
    section: "社交组队模式",
    weight: 1,
    text: "有人在频道里喊组队刷怪，你什么情况下会进队？",
    options: [
      opt("A", "等级职业效率一致才进", { first: { archer: 1, magician: 0.8, thief: 0.5 }, second: { hunter: 0.6, iceLightning: 0.6, assassin: 0.4 }, traits: { efficiency: 1.5, control: 1 } }),
      opt("B", "有人喊就进，人多热闹", { first: { magician: 1, warrior: 0.8, pirate: 0.5 }, second: { cleric: 1, spearman: 0.7 }, traits: { social: 2 } }),
      opt("C", "看职业搭配，缺我才进", { first: { magician: 1.2, warrior: 1 }, second: { cleric: 1, spearman: 0.8, page: 0.5 }, traits: { support: 1.5, control: 0.8 } }),
      opt("D", "有大佬带队就进", { first: { pirate: 0.6, magician: 0.5 }, second: { cleric: 0.5, brawler: 0.4 }, traits: { safety: 0.8, social: 0.5 } }),
      opt("E", "熟人喊才进野队", { first: { warrior: 0.8, archer: 0.8 }, second: { page: 0.6, crossbowman: 0.5 }, traits: { safety: 1.5, social: -0.3 } }),
    ],
  },
  {
    id: "Q12",
    section: "社交组队模式",
    weight: 1,
    text: "打本出了一件不是自己职业的毕业装备，你会？",
    options: [
      opt("A", "自由市场卖掉换钱提升自己", { first: { thief: 1.4, archer: 0.5 }, second: { bandit: 1.2, assassin: 0.4 }, traits: { economy: 1.5, solo: 0.8 } }),
      opt("B", "给队里能用的队友", { first: { magician: 1.7, warrior: 0.7 }, second: { cleric: 1.8, spearman: 0.8 }, traits: { support: 2, social: 1 } }),
      opt("C", "留着给小号或交换", { first: { thief: 0.9, archer: 0.8 }, second: { bandit: 0.8, crossbowman: 0.6 }, traits: { economy: 1.2, control: 0.8 } }),
      opt("D", "roll 到就 roll，佛系", { first: { archer: 0.8, magician: 0.6 }, second: { page: 0.5, cleric: 0.5, crossbowman: 0.4 }, traits: { safety: 0.5, patience: 0.7 } }),
      opt("E", "讨价还价，辛苦费不能少", { first: { thief: 1.3, pirate: 0.4 }, second: { bandit: 1.3 }, traits: { economy: 1.5, social: 0.4 } }),
    ],
  },
  {
    id: "Q13",
    section: "风险承受等级",
    weight: 1,
    text: "下面哪种玩法，你最想尝试？",
    options: [
      opt("A", "越级打怪挑战极限", { first: { warrior: 1.4, thief: 1, pirate: 1 }, second: { fighter: 0.8, brawler: 1, assassin: 0.6 }, traits: { risk: 2, melee: 1 } }),
      opt("B", "低两级稳扎稳打", { first: { warrior: 1, archer: 0.8, magician: 0.5 }, second: { page: 1, crossbowman: 0.6, cleric: 0.5 }, traits: { safety: 2, patience: 1 } }),
      opt("C", "强化赌一把", { first: { thief: 1.8, pirate: 0.5 }, second: { assassin: 0.9, bandit: 0.9 }, traits: { risk: 2, burst: 1 } }),
      opt("D", "全程风筝拉扯", { first: { archer: 2, thief: 0.7, pirate: 0.8 }, second: { hunter: 1, crossbowman: 0.8, gunslinger: 1 }, traits: { range: 2, safety: 0.8 } }),
      opt("E", "全程辅助，后面加 buff 加血", { first: { magician: 2 }, second: { cleric: 2 }, traits: { support: 2, safety: 1 } }),
    ],
  },
  {
    id: "Q14",
    section: "风险承受等级",
    weight: 1,
    text: "打 BOSS 只剩最后 1% 血，你也只剩丝血，你会？",
    options: [
      opt("A", "贴脸爆发赌它先死", { first: { warrior: 1.5, thief: 1.2, pirate: 1 }, second: { fighter: 0.8, assassin: 0.8, brawler: 1 }, traits: { risk: 2, burst: 1.2, melee: 1 } }),
      opt("B", "后退喝药，血满再打", { first: { warrior: 0.8, archer: 0.8, magician: 0.5 }, second: { page: 0.8, cleric: 0.5, crossbowman: 0.5 }, traits: { safety: 2 } }),
      opt("C", "继续远程输出，卡距离", { first: { archer: 1.8, thief: 0.7, pirate: 0.8 }, second: { hunter: 0.8, assassin: 0.6, gunslinger: 1 }, traits: { range: 2, control: 0.7 } }),
      opt("D", "喊队友拉仇恨，后面偷伤害", { first: { thief: 0.9, magician: 0.7 }, second: { bandit: 0.7, cleric: 0.5 }, traits: { social: 0.8, safety: 1 } }),
      opt("E", "停手让队友打，活着拿奖励", { first: { magician: 0.8, archer: 0.5 }, second: { cleric: 0.7, page: 0.5 }, traits: { safety: 1.5, support: 0.4 } }),
    ],
  },
  {
    id: "Q15",
    section: "风险承受等级",
    weight: 1,
    text: "游戏更新全新玩法体系，你的第一反应是？",
    options: [
      opt("A", "立刻研究并尝试新内容", { first: { pirate: 1.8, thief: 0.8, magician: 0.6 }, second: { brawler: 0.8, gunslinger: 0.8, firePoison: 0.5 }, traits: { novelty: 2, control: 0.8 } }),
      opt("B", "先看实测，确定靠谱再玩", { first: { archer: 1, warrior: 0.7, magician: 0.5 }, second: { page: 0.7, crossbowman: 0.6, cleric: 0.5 }, traits: { safety: 1.5, patience: 0.8 } }),
      opt("C", "先研究规则再决定", { first: { magician: 1.2, archer: 0.8 }, second: { firePoison: 1, crossbowman: 0.6 }, traits: { control: 2 } }),
      opt("D", "先跟风玩两天，不好玩就弃", { first: { pirate: 1.2, thief: 0.9 }, second: { brawler: 0.6, gunslinger: 0.6, bandit: 0.5 }, traits: { novelty: 1.2, mobility: 1 } }),
      opt("E", "能跟同伴一起玩就试", { first: { magician: 1.2, warrior: 0.7 }, second: { cleric: 1.2, spearman: 0.8 }, traits: { social: 1.5, support: 0.8 } }),
    ],
  },
  {
    id: "Q16",
    section: "风险承受等级",
    weight: 1,
    text: "坐船去天空之城，船舱里突然响起蝙蝠魔 BGM，你会？",
    options: [
      opt("A", "冲出去碰一碰", { first: { warrior: 1.6, thief: 1, pirate: 1 }, second: { fighter: 0.8, brawler: 0.8, assassin: 0.5 }, traits: { risk: 2, novelty: 0.8 } }),
      opt("B", "缩在船舱角落等它走", { first: { warrior: 0.7, magician: 0.6, archer: 0.4 }, second: { page: 0.8, cleric: 0.5 }, traits: { safety: 2 } }),
      opt("C", "门口观望，能打就打", { first: { archer: 1.2, thief: 0.8, pirate: 0.6 }, second: { hunter: 0.7, gunslinger: 0.6, assassin: 0.5 }, traits: { control: 1, safety: 0.7 } }),
      opt("D", "直接下线，到了再上", { first: { archer: 0.8, thief: 0.5 }, second: { crossbowman: 0.6, bandit: 0.4 }, traits: { safety: 2, mobility: 0.5 } }),
      opt("E", "喊大佬一起冲", { first: { warrior: 1, magician: 0.8, pirate: 0.5 }, second: { spearman: 0.9, cleric: 0.8, brawler: 0.4 }, traits: { social: 1.5, risk: 0.8 } }),
    ],
  },
  {
    id: "Q17",
    section: "生活抽象题",
    weight: 0.65,
    text: "朋友喊你去团建，你的真实想法更贴合哪一种？",
    options: [
      opt("A", "不如在家刷本", { first: { archer: 1, thief: 0.8 }, second: { crossbowman: 0.5, assassin: 0.5 }, traits: { solo: 1.5 } }),
      opt("B", "我来组织全场", { first: { warrior: 1, magician: 1 }, second: { spearman: 0.8, cleric: 0.7, page: 0.5 }, traits: { social: 1.5, support: 1 } }),
      opt("C", "跟着走，主打混子", { first: { pirate: 0.6, magician: 0.5 }, second: { cleric: 0.4, brawler: 0.4 }, traits: { safety: 0.6, social: 0.5 } }),
      opt("D", "有好玩好看的就去", { first: { pirate: 1, thief: 0.8 }, second: { bandit: 0.5, gunslinger: 0.5 }, traits: { novelty: 1.2, mobility: 0.8 } }),
      opt("E", "负责拍照买水照顾人", { first: { magician: 1.5 }, second: { cleric: 1.5 }, traits: { support: 2 } }),
    ],
  },
  {
    id: "Q18",
    section: "生活抽象题",
    weight: 0.65,
    text: "上班/上学被老板/老师画饼，你的第一反应是？",
    options: [
      opt("A", "表面鼓掌，内心摆烂", { first: { archer: 0.8, thief: 0.5 }, second: { crossbowman: 0.5, bandit: 0.4 }, traits: { safety: 0.8, solo: 0.6 } }),
      opt("B", "直接开怼，来点实际的", { first: { warrior: 1.5, pirate: 0.8 }, second: { fighter: 0.9, brawler: 0.7 }, traits: { melee: 1, risk: 1 } }),
      opt("C", "记下来转头吐槽", { first: { thief: 1, magician: 0.5 }, second: { bandit: 0.6, firePoison: 0.6 }, traits: { social: 0.5, control: 0.5 } }),
      opt("D", "精神离职，无所谓", { first: { archer: 0.8, thief: 0.5 }, second: { crossbowman: 0.5, bandit: 0.4 }, traits: { solo: 0.8, safety: 0.5 } }),
      opt("E", "认真听，万一实现呢", { first: { magician: 0.9, warrior: 0.7 }, second: { cleric: 0.7, page: 0.6 }, traits: { patience: 1, support: 0.4 } }),
    ],
  },
  {
    id: "Q19",
    section: "生活抽象题",
    weight: 0.65,
    text: "周末休息，你更愿意把时间花在？",
    options: [
      opt("A", "研究攻略，把号细节拉满", { first: { thief: 1, archer: 0.9, magician: 0.7 }, second: { assassin: 0.6, crossbowman: 0.6, firePoison: 0.5 }, traits: { control: 1.5, investment: 0.8 } }),
      opt("B", "跟朋友开黑打本", { first: { magician: 1.1, warrior: 0.9 }, second: { cleric: 1, spearman: 0.8 }, traits: { social: 1.5 } }),
      opt("C", "躺着刷视频，游戏挂机", { first: { magician: 0.5, archer: 0.4 }, second: { cleric: 0.4, page: 0.3 }, traits: { safety: 0.5 } }),
      opt("D", "逛地图看风景", { first: { archer: 0.8, pirate: 0.8 }, second: { hunter: 0.5, gunslinger: 0.5 }, traits: { novelty: 1, mobility: 0.8 } }),
      opt("E", "帮朋友刷装备带升级", { first: { magician: 1.6, warrior: 0.5 }, second: { cleric: 1.6, spearman: 0.6 }, traits: { support: 2 } }),
    ],
  },
  {
    id: "Q20",
    section: "生活抽象题",
    weight: 0.65,
    text: "点外卖的时候，你更倾向于？",
    options: [
      opt("A", "固定吃稳定不踩雷", { first: { warrior: 0.8, archer: 0.8 }, second: { page: 0.6, crossbowman: 0.5 }, traits: { safety: 1.2, patience: 0.5 } }),
      opt("B", "每次试新店", { first: { pirate: 1, thief: 0.8 }, second: { brawler: 0.5, gunslinger: 0.5, bandit: 0.4 }, traits: { novelty: 1.5 } }),
      opt("C", "朋友点啥我吃啥", { first: { magician: 0.5, pirate: 0.4 }, second: { cleric: 0.4 }, traits: { social: 0.5, safety: 0.3 } }),
      opt("D", "必须凑满减", { first: { thief: 0.8, archer: 0.6 }, second: { bandit: 0.8, crossbowman: 0.4 }, traits: { economy: 1.5, control: 0.5 } }),
      opt("E", "顺便给朋友带一份", { first: { magician: 1.3 }, second: { cleric: 1.3, spearman: 0.4 }, traits: { support: 1.5, social: 0.8 } }),
    ],
  },
  {
    id: "Q21",
    section: "生活抽象题",
    weight: 0.65,
    text: "出门旅游，你的行程安排更贴合？",
    options: [
      opt("A", "提前做攻略，每分钟安排好", { first: { magician: 1, archer: 0.9 }, second: { firePoison: 0.6, crossbowman: 0.6 }, traits: { control: 1.8 } }),
      opt("B", "买票就走，随心所欲", { first: { pirate: 1.3, thief: 0.8 }, second: { brawler: 0.6, gunslinger: 0.6, bandit: 0.5 }, traits: { mobility: 1.5, novelty: 1.5 } }),
      opt("C", "跟团走，躺平", { first: { magician: 0.5, warrior: 0.4 }, second: { cleric: 0.4, page: 0.4 }, traits: { safety: 0.8 } }),
      opt("D", "只去熟悉地方，安全第一", { first: { warrior: 0.8, archer: 0.8 }, second: { page: 0.7, crossbowman: 0.5 }, traits: { safety: 1.5 } }),
      opt("E", "给朋友找打卡点拍照", { first: { magician: 1.2, archer: 0.4 }, second: { cleric: 1.2, hunter: 0.3 }, traits: { support: 1.5, social: 0.8 } }),
    ],
  },
  {
    id: "Q22",
    section: "生活抽象题",
    weight: 0.65,
    text: "朋友跟你吐槽烦心事，你会？",
    options: [
      opt("A", "直接给解决方案", { first: { magician: 1, warrior: 0.8 }, second: { firePoison: 0.5, fighter: 0.5 }, traits: { control: 1.2, support: 0.8 } }),
      opt("B", "全程倾听共情", { first: { magician: 1.5 }, second: { cleric: 1.6 }, traits: { support: 2 } }),
      opt("C", "讲个更惨的事", { first: { thief: 0.9, magician: 0.4 }, second: { bandit: 0.5, firePoison: 0.5 }, traits: { social: 0.4, novelty: 0.5 } }),
      opt("D", "默默听着陪伴", { first: { archer: 0.6, magician: 0.6, warrior: 0.4 }, second: { page: 0.5, cleric: 0.5 }, traits: { support: 1, safety: 0.6 } }),
      opt("E", "拉他去打游戏", { first: { warrior: 0.8, pirate: 0.8 }, second: { fighter: 0.5, brawler: 0.5 }, traits: { social: 0.8, novelty: 0.5 } }),
    ],
  },
  {
    id: "Q23",
    section: "生活抽象题",
    weight: 0.65,
    text: "你不小心打碎了朋友的杯子，你会？",
    options: [
      opt("A", "买一样或更好的赔", { first: { warrior: 0.8, magician: 0.6, thief: 0.4 }, second: { page: 0.5, cleric: 0.5, bandit: 0.3 }, traits: { investment: 0.8, support: 0.7 } }),
      opt("B", "疯狂道歉真诚认错", { first: { magician: 1.2 }, second: { cleric: 1.2 }, traits: { support: 1.5 } }),
      opt("C", "无所谓，多大点事", { first: { pirate: 0.8, thief: 0.6 }, second: { brawler: 0.4, bandit: 0.4 }, traits: { risk: 0.6, novelty: 0.3 } }),
      opt("D", "开玩笑打哈哈糊弄过去", { first: { thief: 0.8, pirate: 0.6 }, second: { bandit: 0.6, gunslinger: 0.4 }, traits: { mobility: 0.8, social: 0.5 } }),
      opt("E", "立刻打扫，别扎手", { first: { magician: 1.4, warrior: 0.5 }, second: { cleric: 1.3, page: 0.5 }, traits: { support: 1.8, safety: 0.8 } }),
    ],
  },
  {
    id: "Q24",
    section: "生活抽象题",
    weight: 0.65,
    text: "下面哪句话，你最有共鸣？",
    options: [
      opt("A", "冲得够快，死亡追不上我", { first: { warrior: 1.2, pirate: 1, thief: 0.8 }, second: { fighter: 0.8, brawler: 0.8 }, traits: { risk: 1.5, melee: 0.8 } }),
      opt("B", "站得够远，怪碰不到我", { first: { archer: 1.5, thief: 0.6, pirate: 0.6 }, second: { hunter: 0.8, gunslinger: 0.7, assassin: 0.5 }, traits: { range: 1.8, safety: 0.8 } }),
      opt("C", "奶得够快，队友不会死", { first: { magician: 1.8 }, second: { cleric: 2 }, traits: { support: 2 } }),
      opt("D", "够佛系，就不会破防", { first: { archer: 0.8, warrior: 0.6, magician: 0.4 }, second: { page: 0.6, crossbowman: 0.5, cleric: 0.4 }, traits: { patience: 1, safety: 0.6 } }),
      opt("E", "赌得够大，单车变摩托", { first: { thief: 1.5, pirate: 0.6 }, second: { bandit: 0.8, assassin: 0.7 }, traits: { risk: 1.8, burst: 0.8 } }),
    ],
  },
  {
    id: "Q25",
    section: "生活抽象题",
    weight: 0.65,
    text: "街上小女孩递给你棒棒糖，你第一反应是？",
    options: [
      opt("A", "接过来反手给金币", { first: { magician: 0.9, thief: 0.5 }, second: { cleric: 0.7, bandit: 0.4 }, traits: { support: 0.9, social: 0.7 } }),
      opt("B", "婉拒陌生人食物", { first: { archer: 0.9, warrior: 0.6 }, second: { page: 0.6, crossbowman: 0.6 }, traits: { safety: 1.5 } }),
      opt("C", "接过来当场吃", { first: { warrior: 0.8, pirate: 0.8 }, second: { fighter: 0.5, brawler: 0.5 }, traits: { risk: 0.8, novelty: 0.5 } }),
      opt("D", "观察周围有没有大人", { first: { archer: 0.8, thief: 0.7 }, second: { crossbowman: 0.6, bandit: 0.5 }, traits: { safety: 1.2, control: 0.7 } }),
      opt("E", "蹲下来温柔聊天", { first: { magician: 1.4 }, second: { cleric: 1.4 }, traits: { support: 1.5, social: 0.8 } }),
    ],
  },
  {
    id: "Q26",
    section: "生活抽象题",
    weight: 0.65,
    text: "打游戏遇到杠精公屏骂你，你会？",
    options: [
      opt("A", "直接对喷", { first: { thief: 1, pirate: 0.9, warrior: 0.5 }, second: { bandit: 0.6, brawler: 0.6, firePoison: 0.4 }, traits: { risk: 1, social: 0.5 } }),
      opt("B", "直接屏蔽", { first: { archer: 0.9, magician: 0.5, warrior: 0.4 }, second: { crossbowman: 0.5, page: 0.5 }, traits: { safety: 1.2, solo: 0.5 } }),
      opt("C", "喊朋友一起骂", { first: { warrior: 0.8, magician: 0.7 }, second: { spearman: 0.8, cleric: 0.6 }, traits: { social: 1.2 } }),
      opt("D", "跟他 solo，用实力说话", { first: { warrior: 1.2, thief: 1, pirate: 0.6 }, second: { fighter: 0.8, assassin: 0.7 }, traits: { risk: 1.2, burst: 0.8 } }),
      opt("E", "无所谓，佛系继续玩", { first: { archer: 0.8, warrior: 0.5, magician: 0.4 }, second: { page: 0.6, crossbowman: 0.5 }, traits: { patience: 1, safety: 0.6 } }),
    ],
  },
  {
    id: "Q27",
    section: "生活抽象题",
    weight: 0.65,
    text: "你更喜欢下面哪种生活状态？",
    options: [
      opt("A", "目标明确，一步一步拿结果", { first: { warrior: 1, thief: 0.8, archer: 0.5 }, second: { fighter: 0.7, assassin: 0.6 }, traits: { control: 1.2, patience: 0.8 } }),
      opt("B", "随心所欲，没有计划", { first: { pirate: 1.2, thief: 0.8 }, second: { brawler: 0.6, gunslinger: 0.5, bandit: 0.5 }, traits: { mobility: 1.5, novelty: 0.8 } }),
      opt("C", "躺平摆烂，不被卷到", { first: { archer: 0.6, magician: 0.5 }, second: { page: 0.4, cleric: 0.4 }, traits: { safety: 0.8, patience: 0.5 } }),
      opt("D", "朋友一堆，热热闹闹", { first: { magician: 1.2, warrior: 0.8 }, second: { cleric: 1, spearman: 0.8 }, traits: { social: 1.8 } }),
      opt("E", "安稳平淡，不出错", { first: { warrior: 0.8, archer: 0.8, magician: 0.5 }, second: { page: 0.7, crossbowman: 0.5, cleric: 0.4 }, traits: { safety: 1.5, patience: 0.8 } }),
    ],
  },
  {
    id: "Q28",
    section: "生活抽象题",
    weight: 0.65,
    text: "做一件事，你更在意？",
    options: [
      opt("A", "结果好不好", { first: { warrior: 1, thief: 0.8 }, second: { fighter: 0.7, assassin: 0.6 }, traits: { control: 1, efficiency: 0.8 } }),
      opt("B", "过程开不开心", { first: { pirate: 1.1, thief: 0.8 }, second: { brawler: 0.5, gunslinger: 0.5, bandit: 0.4 }, traits: { novelty: 1.2, mobility: 0.8 } }),
      opt("C", "能不能帮到别人", { first: { magician: 1.7 }, second: { cleric: 1.8 }, traits: { support: 2 } }),
      opt("D", "有没有风险会不会翻车", { first: { archer: 1, warrior: 0.7, magician: 0.4 }, second: { page: 0.7, crossbowman: 0.6 }, traits: { safety: 1.8 } }),
      opt("E", "能不能秀操作", { first: { thief: 1.3, pirate: 1 }, second: { assassin: 0.8, brawler: 0.7, gunslinger: 0.6 }, traits: { burst: 1, mobility: 1 } }),
    ],
  },
  {
    id: "Q29",
    section: "生活抽象题",
    weight: 0.35,
    text: "此题没有题目，请盲选",
    options: [
      opt("A", "选第一个，先下手为强", { first: { warrior: 0.8, thief: 0.5 }, second: { fighter: 0.5, assassin: 0.4 }, traits: { risk: 0.5 } }),
      opt("B", "选中间，中庸之道", { first: { warrior: 0.5, magician: 0.5 }, second: { page: 0.5, cleric: 0.4 }, traits: { safety: 0.4 } }),
      opt("C", "选最后一个，压轴出场", { first: { archer: 0.6, warrior: 0.4 }, second: { spearman: 0.5, crossbowman: 0.4 }, traits: { patience: 0.5 } }),
      opt("D", "不选了，下一题", { first: { pirate: 0.8, thief: 0.4 }, second: { brawler: 0.4, gunslinger: 0.4 }, traits: { mobility: 0.5 } }),
      opt("E", "找规律，严谨细致", { first: { magician: 0.8, archer: 0.5 }, second: { firePoison: 0.5, crossbowman: 0.4 }, traits: { control: 0.8 } }),
    ],
  },
  {
    id: "Q30",
    section: "生活抽象题",
    weight: 0.65,
    text: "玩冒险岛这么多年，你心里最放不下的是？",
    options: [
      opt("A", "当年没刷出来的毕业武器", { first: { warrior: 1, thief: 0.8 }, second: { fighter: 0.6, assassin: 0.6 }, traits: { patience: 1, burst: 0.5 } }),
      opt("B", "当年一起打本的朋友", { first: { magician: 1.3, warrior: 0.8 }, second: { cleric: 1.2, spearman: 0.8 }, traits: { social: 1.5, support: 0.8 } }),
      opt("C", "当年没满级的小号", { first: { pirate: 0.8, thief: 0.7, archer: 0.5 }, second: { brawler: 0.4, gunslinger: 0.4, bandit: 0.4 }, traits: { novelty: 0.8, patience: 0.5 } }),
      opt("D", "自由市场摆摊的日子", { first: { thief: 0.9, magician: 0.5 }, second: { bandit: 0.8, cleric: 0.4 }, traits: { economy: 1, social: 0.8 } }),
      opt("E", "第一次见到蝙蝠魔的心跳", { first: { warrior: 0.8, archer: 0.7, pirate: 0.5 }, second: { fighter: 0.4, hunter: 0.4, gunslinger: 0.3 }, traits: { risk: 0.8, novelty: 0.8 } }),
    ],
  },
];

function addWeightedScores(target, source, weight, allowedIds = null) {
  for (const [id, value] of Object.entries(source || {})) {
    if (allowedIds && !allowedIds.has(id)) continue;
    target[id] = (target[id] || 0) + value * weight;
  }
}

function pickScores(scores, ids) {
  return Object.fromEntries(ids.map((id) => [id, scores[id] || 0]));
}

function rankScores(scores) {
  const rows = Object.entries(scores).map(([id, score]) => ({
    id,
    name: jobDisplayNames[id] || id,
    score: Number(score.toFixed(3)),
  }));

  if (!rows.length) return [];

  const values = rows.map((row) => row.score);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return rows
    .sort((a, b) => b.score - a.score)
    .map((row) => ({
      ...row,
      matchPercent: max === min ? 50 : Math.round(50 + ((row.score - min) / (max - min)) * 50),
    }));
}

function confidenceFromRanking(ranking) {
  if (!ranking.length) return { level: "none", label: "无结果", gap: 0 };
  if (ranking.length === 1) return { level: "high", label: "高", gap: ranking[0].score };
  const gap = ranking[0].score - ranking[1].score;
  if (gap >= 5) return { level: "high", label: "高", gap: Number(gap.toFixed(2)) };
  if (gap >= 2.5) return { level: "medium", label: "中", gap: Number(gap.toFixed(2)) };
  return { level: "low", label: "低，建议展示副人格", gap: Number(gap.toFixed(2)) };
}

export function scoreMsciV2(responses, mode = "global") {
  const firstJobIds = firstJobIdsByMode[mode] || firstJobIdsByMode.global;
  const allowedFirstJobs = new Set(firstJobIds);
  const firstScores = Object.fromEntries(firstJobIds.map((id) => [id, 0]));
  const allSecondJobs = Object.values(secondJobGroups).flat();
  const secondScores = Object.fromEntries(allSecondJobs.map((id) => [id, 0]));
  const traitScores = {};
  let answered = 0;
  let answeredWeight = 0;

  for (const question of msciV2Questions) {
    const selectedKey = responses?.[question.id];
    const selected = question.options.find((option) => option.key === selectedKey);
    if (!selected) continue;

    const weight = question.weight ?? 1;
    answered += 1;
    answeredWeight += weight;
    addWeightedScores(firstScores, selected.first, weight, allowedFirstJobs);
    addWeightedScores(secondScores, selected.second, weight);
    addWeightedScores(traitScores, selected.traits, weight);
  }

  const firstRanking = rankScores(firstScores);
  const firstJob = firstRanking[0]?.id || firstJobIds[0];
  const branchSecondIds = secondJobGroups[firstJob] || [];
  const secondRanking = rankScores(pickScores(secondScores, branchSecondIds));
  const firstConfidence = confidenceFromRanking(firstRanking);
  const secondConfidence = confidenceFromRanking(secondRanking);
  const traitRanking = Object.entries(traitScores)
    .map(([id, score]) => ({ id, name: traitDisplayNames[id] || id, score: Number(score.toFixed(3)) }))
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return {
    mode,
    answered,
    total: msciV2Questions.length,
    answeredWeight: Number(answeredWeight.toFixed(2)),
    firstJob,
    secondJob: secondRanking[0]?.id || null,
    firstRanking,
    secondRanking,
    firstConfidence,
    secondConfidence,
    traitRanking,
    raw: {
      firstScores,
      secondScores,
      traitScores,
    },
  };
}

export function getMsciV2QuestionById(id) {
  return msciV2Questions.find((question) => question.id === id);
}

export function getMsciV2OptionScore(questionId, optionKey) {
  const question = getMsciV2QuestionById(questionId);
  return question?.options.find((option) => option.key === optionKey) || null;
}
