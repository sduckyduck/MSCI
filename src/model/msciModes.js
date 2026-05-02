import * as base from "./msciModel";

const GLOBAL_BANNER = "/assets/msci-class-heroes.png";
const CHINA_BANNER_CANDIDATES = [
  "/assets/team-figure.png",
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
    text: "开服像早八点名，全世界都在跑。你是会跟着冲，还是先在门口研究校规？",
    options: makeOptions(["我先看校规", "不急，慢慢来", "看谁在催", "可以跟跑", "点名？我已到终点"]),
    effects: { efficiency: 1.2, mobility: 0.5, lateGame: -0.3 },
  },
  {
    id: "CNF02",
    text: "怪物贴到脸上时，你脑内弹出的不是危险提示，而是：会议开始。",
    options: makeOptions(["我拒绝参会", "有点冒汗", "先看议程", "可以开会", "我主持会议"]),
    effects: { distance: 1.0, burst: 0.5, mobility: 0.7, complexity: 0.4 },
  },
  {
    id: "CNF03",
    text: "你理想中的战斗距离是：对面还在赶来的路上，你已经下班打卡。",
    options: makeOptions(["贴脸才热闹", "近点也行", "看通勤距离", "远点舒服", "本人已下班"]),
    effects: { distance: -1.2, burst: -0.1, mobility: 0.3 },
  },
  {
    id: "CNF04",
    text: "面对一屏乱糟糟的小怪，你最想做的不是沟通，是关灯。",
    options: makeOptions(["单聊比较真", "别太大场面", "看吵不吵", "关一下也行", "全场熄灯"]),
    effects: { magic: 1.4, efficiency: 0.6, party: 0.2 },
  },
  {
    id: "CNF05",
    text: "一张图三层平台两根绳，别人说头疼，你说这户型还挺适合跑酷。",
    options: makeOptions(["我讨厌楼梯", "有点晕", "看装修", "能跑两步", "我住复式"]),
    effects: { mobility: 1.4, complexity: 1.2, burst: 0.5 },
  },
  {
    id: "CNF06",
    text: "如果一条路线贵得像在养吞金兽，但人物站街很好看，你会先假装没看见余额。",
    options: makeOptions(["余额最重要", "我会清醒", "先看看价格", "可能装瞎", "余额是什么"]),
    effects: { investment: 1.2, burst: 0.8, complexity: 0.3 },
  },
  {
    id: "CNF07",
    text: "队伍开始像火锅一样沸腾时，你会不会想当那个锅盖。",
    options: makeOptions(["我先捞肉跑路", "别让我盖", "看锅多大", "可以压一下", "盖上，都别动"]),
    effects: { party: 1.2, lateGame: 0.3 },
  },
  {
    id: "CNF08",
    text: "前期被朋友笑像下水道，如果后面能翻身上桌，你愿意先在管道里住几天。",
    options: makeOptions(["不住下水道", "最多参观", "看房租", "能忍几天", "我自带被褥"]),
    effects: { lateGame: 1.1, efficiency: -0.5, party: 0.2 },
  },
  {
    id: "CNF09",
    text: "一个玩法开局要看三篇攻略两张表，你第一反应是：这不是游戏，这是答辩。",
    options: makeOptions(["答辩我来", "表格也香", "看老师严不严", "简单点好", "我拒绝开题"]),
    effects: { complexity: -1.1, burst: -0.2, mobility: -0.2 },
  },
  {
    id: "CNF10",
    text: "越是没人讲明白的路线，你越像发现隐藏菜单：不一定好吃，但很想点。",
    options: makeOptions(["我吃套餐", "怕踩雷", "先看评价", "可以点小份", "老板来一份"]),
    effects: { complexity: 1.0, mobility: 0.9, investment: 0.4, lateGame: 0.3 },
  },
  {
    id: "CNF11",
    text: "你更喜欢输出像工资到账：不一定惊天动地，但每个月准时让我安心。",
    options: makeOptions(["我要中彩票", "暴富优先", "都能接受", "稳定挺好", "月薪人万岁"]),
    effects: { burst: -1.1, complexity: -0.3, efficiency: 0.3 },
  },
  {
    id: "CNF12",
    text: "你可以慢，但不能三步一躺。毕竟地板再熟，也不会给你发经验。",
    options: makeOptions(["躺了再说", "脆点没事", "看地板材质", "硬点安心", "地板不认识我"]),
    effects: { distance: 1.0, lateGame: 0.4, burst: -0.3 },
  },
  {
    id: "CNF13",
    text: "菜单上那个最不像正经饭的新品，你总想点一次。翻车也算体验人生。",
    options: makeOptions(["经典套餐稳", "新品可疑", "看朋友脸色", "可以尝一口", "我就爱新品"]),
    effects: { mobility: 1.3, complexity: 0.9, magic: -0.8, burst: 0.7, investment: 0.3 },
  },
  {
    id: "CNF14",
    text: "你希望养号像养绿萝，浇点水就活；别像养祖宗，天天要供着。",
    options: makeOptions(["供就供吧", "贵点能忍", "看祖宗脾气", "绿萝挺好", "我只养仙人掌"]),
    effects: { investment: -1.2, efficiency: 0.4, lateGame: -0.2 },
  },
  {
    id: "CNF15",
    text: "你喜欢那种看起来像在整活，实际一查绩效还挺能打的人设。",
    options: makeOptions(["别整活", "稳点好", "查完再说", "反差不错", "我就是绩效小丑"]),
    effects: { mobility: 1.1, complexity: 0.8, burst: 0.5, party: -0.2 },
  },
  {
    id: "CNF16",
    text: "热门地方人挤人时，你会默默钻进角落，像在地图里租了个一室一厅。",
    options: makeOptions(["人多才热闹", "挤挤也行", "看租金", "角落清净", "我已签约"]),
    effects: { distance: -0.4, efficiency: -0.2, party: -0.4, complexity: 0.3 },
  },
  {
    id: "CNF17",
    text: "你很容易被手感收买。按起来顺，伤害低一点都像有滤镜。",
    options: makeOptions(["只看数值", "滤镜没用", "都要一点", "手感重要", "顺手即正义"]),
    effects: { mobility: 1.3, complexity: 0.7, efficiency: 0.2 },
  },
  {
    id: "CNF18",
    text: "你不想成为攻略评论区的复制粘贴答案，你想在职业选择上留个手写签名。",
    options: makeOptions(["复制安全", "别太个性", "看版本", "可以签一下", "我要花体字"]),
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
    { id: "P01", text: "你处理问题喜欢当面解决。能靠近说清楚，就不想隔着八百米发小作文。", options: makeOptions(["远程发文", "保持距离", "看关系", "当面可以", "来，当面对线"]), effects: { range: -1.3, style: -1.2, burst: -0.2 } },
    { id: "P02", text: "你的人生哲学是：保持一点距离，既显得礼貌，也方便随时撤退。", options: makeOptions(["撤退可耻", "贴近点好", "看场合", "距离不错", "我自带安全线"]), effects: { range: 1.3, mobility: 1.1, style: 1.0 } },
    { id: "P03", text: "你不太爱温水煮青蛙，你更喜欢突然把场面点燃，让数字和血压一起上来。", options: makeOptions(["温水舒服", "别太刺激", "看火候", "点一下也行", "烧起来"]), effects: { burst: 1.2, range: 0.4, style: 0.6 } },
    { id: "P04", text: "复读机会让你灵魂出窍。一个玩法最好有节拍、有变奏、有一点手忙脚乱。", options: makeOptions(["复读省心", "别太乱", "看节奏", "变奏不错", "我要现场演出"]), effects: { mobility: 1.1, burst: 0.4 } },
    { id: "P05", text: "你像赶最后一班车的人：看到空隙就冲，姿势不一定优雅，但态度非常明确。", options: makeOptions(["我等下一班", "冲太危险", "看车来了没", "可以冲", "让开我赶车"]), effects: { range: -1.1, mobility: -0.4, style: -1.0 } },
    { id: "P06", text: "你讨厌脚底像粘了502。平台、绳子、边缘，都应该是你的临时换座区。", options: makeOptions(["站着挺好", "别太折腾", "看座位", "换位重要", "地图是公交车"]), effects: { mobility: 1.3, range: 0.6 } },
    { id: "P07", text: "你喜欢有回弹的反馈。一下就是一下，像键盘敲得啪啪响，心里才踏实。", options: makeOptions(["爆炸更爽", "反馈其次", "都可以", "手感重要", "啪啪响才对"]), effects: { burst: -0.9, style: -1.2, range: -0.7 } },
    { id: "P08", text: "你的人设不是稳重，是先帅一下；强不强等会再说，至少出场不能像默认模板。", options: makeOptions(["默认模板稳", "别太显眼", "看强度", "帅一下可以", "出场必须有风"]), effects: { style: 1.0, mobility: 0.7, burst: 0.4 } },
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
