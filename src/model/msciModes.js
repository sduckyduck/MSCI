import * as base from "./msciModel";

const GLOBAL_BANNER = "/assets/msci-class-heroes.png";
const CHINA_BANNER_CANDIDATES = [
  "/assets/msci-class-heroes-cn.png",
  "/assets/msci-class-heroes-china.png",
  "/assets/msci-class-heroes-pirate.png",
  "/assets/msci-class-heroes-5jobs.png",
  "/assets/msci-class-heroes-5classes.png",
  "/assets/msci-class-heroes-5.png",
  GLOBAL_BANNER,
];

function makeOptions(labels) {
  return [-2, -1, 0, 1, 2].map((value, index) => ({ value, label: labels[index] }));
}

function withDimension(profile, dimensions) {
  return {
    ...profile,
    dimensions: {
      ...(profile.dimensions || {}),
      ...dimensions,
    },
  };
}

const chinaFirstJobDimensions = {
  ...base.firstJobDimensions,
  mobility: { label: "机动节奏", low: "稳站输出", high: "跳跃走位" },
};

const chinaFirstJobQuestions = [
  {
    id: "CNF01",
    text: "开服第一天，你更想选一个前期不太坐牢、练级节奏能跑起来的职业。",
    options: makeOptions(["情怀优先", "慢点也行", "看版本", "效率重要", "我就要顺"]),
    effects: { efficiency: 1.2, mobility: 0.5, lateGame: -0.3 },
  },
  {
    id: "CNF02",
    text: "怪物贴脸时，你不会马上慌，甚至觉得近身打出连段才有手感。",
    options: makeOptions(["别靠近我", "有点慌", "看职业", "能接受", "贴脸才爽"]),
    effects: { distance: 1.0, burst: 0.5, mobility: 0.7, complexity: 0.4 },
  },
  {
    id: "CNF03",
    text: "你喜欢隔着安全距离输出，怪碰不到你才是最舒服的练级方式。",
    options: makeOptions(["站撸更爽", "距离无所谓", "看地图", "远程舒服", "别碰我谢谢"]),
    effects: { distance: -1.2, burst: -0.1, mobility: 0.3 },
  },
  {
    id: "CNF04",
    text: "比起一刀一刀砍，你更喜欢技能一开，整张图的怪都安静。",
    options: makeOptions(["物理才真", "不太吃法系", "都能玩", "魔法挺香", "清图最爽"]),
    effects: { magic: 1.4, efficiency: 0.6, party: 0.2 },
  },
  {
    id: "CNF05",
    text: "如果一个职业需要跳、走位、卡距离、找节奏，你不会觉得麻烦，反而觉得有操作空间。",
    options: makeOptions(["别折磨我", "有点累", "看收益", "挺有意思", "我要秀起来"]),
    effects: { mobility: 1.4, complexity: 1.2, burst: 0.5 },
  },
  {
    id: "CNF06",
    text: "你可以接受装备贵一点，只要职业够帅、够有辨识度、截图够有排面。",
    options: makeOptions(["钱包先活着", "有点劝退", "看帅到哪", "可能会冲", "帅就完事"]),
    effects: { investment: 1.2, burst: 0.8, complexity: 0.3 },
  },
  {
    id: "CNF07",
    text: "你希望队友看到你进组时，心里想的是：稳了，这把有人兜底。",
    options: makeOptions(["我只单刷", "不想背责任", "看队伍", "被需要不错", "队伍没我不行"]),
    effects: { party: 1.2, lateGame: 0.3 },
  },
  {
    id: "CNF08",
    text: "你选职业不是只看第一天爽不爽，更想看它以后有没有江湖地位。",
    options: makeOptions(["现在爽就行", "后期先不管", "都要一点", "长期重要", "我押未来"]),
    effects: { lateGame: 1.1, efficiency: -0.5, party: 0.2 },
  },
  {
    id: "CNF09",
    text: "你不想写论文研究机制，只想上线、打怪、升级、睡觉。",
    options: makeOptions(["我要研究到天亮", "机制也香", "看心情", "简单点好", "别让我动脑"]),
    effects: { complexity: -1.1, burst: -0.2, mobility: -0.2 },
  },
  {
    id: "CNF10",
    text: "如果一个职业有点新、有点特殊、攻略还不够统一，你反而更想试。",
    options: makeOptions(["我要标准答案", "不想赌", "看数据", "有点心动", "我就爱新职业"]),
    effects: { complexity: 1.0, mobility: 0.9, investment: 0.4, lateGame: 0.3 },
  },
  {
    id: "CNF11",
    text: "你更喜欢稳定持续输出，不追求突然爆一下的刺激。",
    options: makeOptions(["爆发才爽", "想要大数字", "都可以", "稳定更好", "我爱平滑输出"]),
    effects: { burst: -1.1, complexity: -0.3, efficiency: 0.3 },
  },
  {
    id: "CNF12",
    text: "你可以打得慢，但不想动不动躺地板。活着，才有输出。",
    options: makeOptions(["死了再跑", "脆点没事", "看职业", "硬一点好", "血条是尊严"]),
    effects: { distance: 1.0, lateGame: 0.4, burst: -0.3 },
  },
  {
    id: "CNF13",
    text: "你喜欢火力、枪械、拳套这种不太传统冒险家的感觉。",
    options: makeOptions(["经典四职业最好", "不太感冒", "看强度", "有点新鲜", "海盗味对了"]),
    effects: { mobility: 1.3, complexity: 0.9, magic: -0.8, burst: 0.7, investment: 0.3 },
  },
  {
    id: "CNF14",
    text: "你更想选平民友好一点的职业，药水和装备别像房贷。",
    options: makeOptions(["钱不是问题", "能花就花", "看性价比", "省点最好", "我是零氪守门员"]),
    effects: { investment: -1.2, efficiency: 0.4, lateGame: -0.2 },
  },
  {
    id: "CNF15",
    text: "你喜欢职业有一点反差：看起来像整活，打起来却很认真。",
    options: makeOptions(["别整活", "稳点好", "看效果", "反差不错", "我就爱节目效果"]),
    effects: { mobility: 1.1, complexity: 0.8, burst: 0.5, party: -0.2 },
  },
  {
    id: "CNF16",
    text: "热门图人比怪多时，你宁愿去角落找一张没人懂的地图偷偷发育。",
    options: makeOptions(["人多才热闹", "抢怪也能忍", "看收益", "冷门图挺好", "我爱下水道"]),
    effects: { distance: -0.4, efficiency: -0.2, party: -0.4, complexity: 0.3 },
  },
  {
    id: "CNF17",
    text: "你选职业时会被技能手感影响：打击感、后摇、走位流畅度，比纸面强度更重要。",
    options: makeOptions(["只看强度", "手感其次", "都要", "手感重要", "不好按就不玩"]),
    effects: { mobility: 1.3, complexity: 0.7, efficiency: 0.2 },
  },
  {
    id: "CNF18",
    text: "你想要一个不是全服标准答案，但能玩出个人风格的职业。",
    options: makeOptions(["标准答案安全", "别太小众", "看版本", "个性不错", "我要自己的路"]),
    effects: { complexity: 1.0, mobility: 0.8, party: -0.3, lateGame: 0.3 },
  },
];

const chinaFirstJobProfiles = {
  warrior: withDimension(base.firstJobProfiles.warrior, { mobility: -1.0 }),
  magician: withDimension(base.firstJobProfiles.magician, { mobility: -0.4 }),
  thief: withDimension(base.firstJobProfiles.thief, { mobility: 1.0 }),
  archer: withDimension(base.firstJobProfiles.archer, { mobility: 0.5 }),
  pirate: {
    code: "PIRT",
    name: "海盗",
    personaName: "自由火力人",
    subtitle: "新职业手感，拳枪分流",
    tag: "机动特色型",
    slogan: "你不是来循规蹈矩的，你是来把节奏打乱的。",
    dimensions: {
      distance: 0.2,
      magic: -2,
      investment: 0.7,
      efficiency: 0.5,
      burst: 1.0,
      party: 0.2,
      complexity: 1.4,
      lateGame: 0.7,
      mobility: 2,
    },
    description: "你偏向物理输出、机动手感和新职业辨识度。你不一定追求最传统答案，更想玩出自己的节奏。",
  },
};

const chinaSecondJobDimensions = {
  ...base.secondJobDimensions,
  pirate: {
    range: { label: "战斗距离", low: "近身拳套", high: "远程火枪" },
    mobility: { label: "走位节奏", low: "贴身硬刚", high: "灵活拉扯" },
    burst: { label: "输出爽点", low: "连段持续", high: "爆点射击" },
    style: { label: "职业气质", low: "拳手打击", high: "枪手漂移" },
  },
};

const chinaSecondJobQuestions = {
  ...base.secondJobQuestions,
  pirate: [
    { id: "P01", text: "你玩海盗更想贴脸打出拳拳到肉的感觉，而不是站远处慢慢点。", options: makeOptions(["远程才安全", "别太贴脸", "看地图", "近战有手感", "拳拳到肉"]), effects: { range: -1.3, style: -1.2, burst: -0.2 } },
    { id: "P02", text: "你喜欢边走边拉扯，用火枪距离和走位把怪风筝到怀疑人生。", options: makeOptions(["我想站撸", "跑位有点累", "看收益", "拉扯挺爽", "距离就是安全感"]), effects: { range: 1.3, mobility: 1.1, style: 1.0 } },
    { id: "P03", text: "比起慢慢磨，你更喜欢突然一轮火力爆出来，数字跳得很有节目效果。", options: makeOptions(["持续更稳", "爆发一般", "都可以", "爆一下爽", "我要火力倾泻"]), effects: { burst: 1.2, range: 0.4, style: 0.6 } },
    { id: "P04", text: "你不怕职业需要手感和节奏，只要打起来不像复读机。", options: makeOptions(["复读也舒服", "别太复杂", "看强度", "有节奏不错", "我要操作空间"]), effects: { mobility: 1.1, burst: 0.4 } },
    { id: "P05", text: "你喜欢更硬一点、更敢近身的玩法，怪越近越像在提醒你开打。", options: makeOptions(["怪近了烦", "近战压力大", "看职业", "能接受", "贴脸开干"]), effects: { range: -1.1, mobility: -0.4, style: -1.0 } },
    { id: "P06", text: "你不想被地形绑死，能跳、能拉、能换位置的职业更吸引你。", options: makeOptions(["站桩就好", "别太跳", "看地图", "灵活重要", "我要满场跑"]), effects: { mobility: 1.3, range: 0.6 } },
    { id: "P07", text: "你更喜欢连段和打击感，输出不一定一下爆炸，但每一下都要有反馈。", options: makeOptions(["爆炸最重要", "连段一般", "都行", "打击感重要", "拳套灵魂"]), effects: { burst: -0.9, style: -1.2, range: -0.7 } },
    { id: "P08", text: "你喜欢别人一看就知道：这不是传统四职业玩家，这是新版本味道。", options: makeOptions(["传统更稳", "别太特殊", "看强度", "有辨识度好", "新职业就要明显"]), effects: { style: 1.0, mobility: 0.7, burst: 0.4 } },
  ],
};

const chinaSecondJobProfiles = {
  ...base.secondJobProfiles,
  pirate: {
    brawler: {
      code: "BRAW",
      name: "拳手",
      personaName: "近身连拳人",
      tag: "近战打击型",
      slogan: "怪物不是被你打死的，是被你按进地里的。",
      dimensions: { range: -2, mobility: -0.2, burst: -0.4, style: -2 },
      description: "你更适合拳手路线：近身、打击感、连段反馈和硬碰硬的职业气质，比远程安全感更重要。",
    },
    gunslinger: {
      code: "GUNR",
      name: "火枪手",
      personaName: "远程走位人",
      tag: "远程机动型",
      slogan: "你和怪物之间最好隔着距离、弹道和一点点潇洒。",
      dimensions: { range: 2, mobility: 2, burst: 1.2, style: 2 },
      description: "你更适合火枪手路线：远程火力、走位拉扯、机动手感和新职业辨识度，是你的主要爽点。",
    },
  },
};

export const modeOptions = [
  {
    id: "global",
    label: "国际服",
    badge: "4职业",
    description: "战士 / 法师 / 飞侠 / 弓箭手",
  },
  {
    id: "china",
    label: "国服",
    badge: "5职业含海盗",
    description: "多海盗，并开放拳手 / 火枪手",
  },
];

const globalModel = {
  id: "global",
  label: "国际服",
  title: "MSCI 冒险岛职业人格测试",
  description: "一题一页，选择后自动跳下一题。国际服模式按四个经典冒险家职业计算，系统会隐藏后台维度，只给你最后的四字母职业人格结果。",
  note: "国际服：战士 / 法师 / 飞侠 / 弓箭手。",
  firstStageSubtitle: "先测你的冒险家底色",
  bannerCandidates: [GLOBAL_BANNER],
  firstJobDimensions: base.firstJobDimensions,
  firstJobProfiles: base.firstJobProfiles,
  firstJobQuestions: base.firstJobQuestions,
  secondJobDimensions: base.secondJobDimensions,
  secondJobProfiles: base.secondJobProfiles,
  secondJobQuestions: base.secondJobQuestions,
};

const chinaModel = {
  id: "china",
  label: "国服",
  title: "MSCI 国服职业人格测试",
  description: "国服模式会把海盗纳入一转模型，并在二转阶段加入拳手和火枪手分支。题目会更偏向国服五职业环境、海盗手感和新职业路线选择。",
  note: "国服：战士 / 法师 / 飞侠 / 弓箭手 / 海盗。海盗二转会继续分为拳手和火枪手。",
  firstStageSubtitle: "先测你的国服五职业底色",
  bannerCandidates: CHINA_BANNER_CANDIDATES,
  firstJobDimensions: chinaFirstJobDimensions,
  firstJobProfiles: chinaFirstJobProfiles,
  firstJobQuestions: chinaFirstJobQuestions,
  secondJobDimensions: chinaSecondJobDimensions,
  secondJobProfiles: chinaSecondJobProfiles,
  secondJobQuestions: chinaSecondJobQuestions,
};

const MODELS = {
  global: globalModel,
  china: chinaModel,
};

export function getModeModel(modeId) {
  return MODELS[modeId] || MODELS.global;
}
