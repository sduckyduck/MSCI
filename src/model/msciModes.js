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
    text: "开服第一天像赶早八，你更想一路小跑进教室，而不是在新手村门口罚站。",
    options: makeOptions(["罚站也情怀", "慢点能忍", "看当天心情", "小跑比较香", "我要冲进教室"]),
    effects: { efficiency: 1.2, mobility: 0.5, lateGame: -0.3 },
  },
  {
    id: "CNF02",
    text: "怪物贴到脸上时，你不是报警，而是觉得它终于进入了你的营业范围。",
    options: makeOptions(["马上报警", "有点冒汗", "看怪长相", "可以营业", "欢迎光临"]),
    effects: { distance: 1.0, burst: 0.5, mobility: 0.7, complexity: 0.4 },
  },
  {
    id: "CNF03",
    text: "你理想中的战斗，是怪物还没摸到你，就已经开始反思自己为什么出生。",
    options: makeOptions(["贴脸才热闹", "近点也行", "看地图", "远点舒服", "保持社交距离"]),
    effects: { distance: -1.2, burst: -0.1, mobility: 0.3 },
  },
  {
    id: "CNF04",
    text: "看到一群怪排队站好，你会忍不住想按一个按钮，让它们集体安静三秒。",
    options: makeOptions(["单挑才真", "群体太吵", "都能玩", "清场挺爽", "全体肃静"]),
    effects: { magic: 1.4, efficiency: 0.6, party: 0.2 },
  },
  {
    id: "CNF05",
    text: "地图台阶像楼梯间，别人嫌烦，你已经开始规划逃跑路线和表演路线。",
    options: makeOptions(["别让我跳", "有点累", "看收益", "有点意思", "我住楼梯间"]),
    effects: { mobility: 1.4, complexity: 1.2, burst: 0.5 },
  },
  {
    id: "CNF06",
    text: "如果一个路线贵得像在交物业费，但截图很有排面，你的钱包会先沉默三秒。",
    options: makeOptions(["钱包先活着", "有点劝退", "看帅到哪", "可能咬牙", "排面无价"]),
    effects: { investment: 1.2, burst: 0.8, complexity: 0.3 },
  },
  {
    id: "CNF07",
    text: "队友开始乱跑、乱跳、乱说话时，你希望自己是那个把场面按回桌面的人。",
    options: makeOptions(["我先跑路", "别指望我", "看队友多疯", "可以兜一下", "都坐下听我说"]),
    effects: { party: 1.2, lateGame: 0.3 },
  },
  {
    id: "CNF08",
    text: "你能接受前几天被朋友笑像坐牢，只要后面他们改口叫你大哥。",
    options: makeOptions(["我不坐牢", "最多拘留", "看刑期", "能熬", "出狱就是大哥"]),
    effects: { lateGame: 1.1, efficiency: -0.5, party: 0.2 },
  },
  {
    id: "CNF09",
    text: "攻略超过三页你就开始犯困，你更想上线把怪打完，而不是写毕业论文。",
    options: makeOptions(["论文我来写", "研究也香", "看心情", "简单点好", "别让我答辩"]),
    effects: { complexity: -1.1, burst: -0.2, mobility: -0.2 },
  },
  {
    id: "CNF10",
    text: "别人说这条路还没标准答案，你反而像发现了隐藏奶茶店，开始偷偷心动。",
    options: makeOptions(["我要连锁店", "不想踩雷", "先看评价", "有点想试", "冷门才有味"]),
    effects: { complexity: 1.0, mobility: 0.9, investment: 0.4, lateGame: 0.3 },
  },
  {
    id: "CNF11",
    text: "比起突然一声巨响，你更喜欢怪物血条稳定下降，像工资准时到账。",
    options: makeOptions(["爆响才爽", "大数字优先", "都可以", "稳定更好", "我要月薪型输出"]),
    effects: { burst: -1.1, complexity: -0.3, efficiency: 0.3 },
  },
  {
    id: "CNF12",
    text: "你可以打得慢，但不能三步一躺。毕竟躺地板也不算参与输出。",
    options: makeOptions(["死了再跑", "脆点没事", "看情况", "硬一点好", "地板不认识我"]),
    effects: { distance: 1.0, lateGame: 0.4, burst: -0.3 },
  },
  {
    id: "CNF13",
    text: "你对那种不太正统的冒险家味道很上头：边跑边打，像把怪物带进综艺节目。",
    options: makeOptions(["经典最好", "不太感冒", "看强度", "有点新鲜", "节目效果拉满"]),
    effects: { mobility: 1.3, complexity: 0.9, magic: -0.8, burst: 0.7, investment: 0.3 },
  },
  {
    id: "CNF14",
    text: "你希望养号成本别像房贷，最好是药水不漏水、装备不吃人。",
    options: makeOptions(["钱不是问题", "能花就花", "看性价比", "省点最好", "我是零氪管家"]),
    effects: { investment: -1.2, efficiency: 0.4, lateGame: -0.2 },
  },
  {
    id: "CNF15",
    text: "你喜欢角色有点反差：看起来像来整活，打起来却在认真做绩效。",
    options: makeOptions(["别整活", "稳点好", "看效果", "反差不错", "我爱绩效型整活"]),
    effects: { mobility: 1.1, complexity: 0.8, burst: 0.5, party: -0.2 },
  },
  {
    id: "CNF16",
    text: "热门图人比怪多时，你宁愿钻进没人懂的小角落，像在地图里开秘密办公室。",
    options: makeOptions(["人多才热闹", "抢怪也能忍", "看收益", "角落挺好", "我有地下工位"]),
    effects: { distance: -0.4, efficiency: -0.2, party: -0.4, complexity: 0.3 },
  },
  {
    id: "CNF17",
    text: "你会被手感收买：后摇、节奏、位移顺不顺，比表格里多几点伤害还重要。",
    options: makeOptions(["只看表格", "手感其次", "都要", "手感重要", "不好按就分手"]),
    effects: { mobility: 1.3, complexity: 0.7, efficiency: 0.2 },
  },
  {
    id: "CNF18",
    text: "你不想成为攻略评论区的复制粘贴答案，更想玩出一点个人签名。",
    options: makeOptions(["标准答案安全", "别太小众", "看版本", "有个性不错", "我要手写签名"]),
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
    range: { label: "战斗距离", low: "贴身打击", high: "距离拉扯" },
    mobility: { label: "走位节奏", low: "近身硬刚", high: "灵活漂移" },
    burst: { label: "输出爽点", low: "连段持续", high: "爆点火力" },
    style: { label: "职业气质", low: "重拳反馈", high: "潇洒弹道" },
  },
};

const chinaSecondJobQuestions = {
  ...base.secondJobQuestions,
  pirate: [
    { id: "P01", text: "你更想把距离感直接打没：怪物站太远，你甚至觉得它不够尊重你。", options: makeOptions(["远点挺礼貌", "别太贴脸", "看怪态度", "近点有感觉", "过来开会"]), effects: { range: -1.3, style: -1.2, burst: -0.2 } },
    { id: "P02", text: "你喜欢保持礼貌距离，一边后退一边让怪物追不上你的脑回路。", options: makeOptions(["我想站撸", "跑位有点累", "看地图", "拉扯挺爽", "追不上我吧"]), effects: { range: 1.3, mobility: 1.1, style: 1.0 } },
    { id: "P03", text: "比起慢慢磨，你更喜欢突然来一轮节奏爆发，让数字像群聊消息一样刷屏。", options: makeOptions(["持续更稳", "爆点一般", "都可以", "刷屏挺爽", "我要消息99+"]), effects: { burst: 1.2, range: 0.4, style: 0.6 } },
    { id: "P04", text: "只要打起来不像复读机，你愿意多一点节奏、多一点手忙脚乱、多一点节目效果。", options: makeOptions(["复读也舒服", "别太复杂", "看收益", "节奏不错", "我要现场演出"]), effects: { mobility: 1.1, burst: 0.4 } },
    { id: "P05", text: "你能接受自己像冲进人群的外卖骑手，路线很近，态度很急，反馈很实在。", options: makeOptions(["我不接近", "有点危险", "看订单", "能冲一下", "五星好评开打"]), effects: { range: -1.1, mobility: -0.4, style: -1.0 } },
    { id: "P06", text: "你不想被地形绑架。平台、绳子、边缘，都应该成为你的临时跑道。", options: makeOptions(["站桩就好", "别太跳", "看地图", "灵活重要", "地图是我家"]), effects: { mobility: 1.3, range: 0.6 } },
    { id: "P07", text: "你喜欢每一下都有反馈，不一定惊天动地，但要像敲章一样清楚：啪，已处理。", options: makeOptions(["爆炸最重要", "反馈一般", "都行", "手感重要", "已处理已盖章"]), effects: { burst: -0.9, style: -1.2, range: -0.7 } },
    { id: "P08", text: "你喜欢别人一看就知道：这人不是照着说明书来的，他可能自己写了张小纸条。", options: makeOptions(["说明书最稳", "别太特殊", "看强度", "有辨识度好", "小纸条是灵魂"]), effects: { style: 1.0, mobility: 0.7, burst: 0.4 } },
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
