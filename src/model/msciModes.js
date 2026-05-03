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

function withProfile(profile, overrides) {
  return {
    ...profile,
    ...overrides,
    dimensions: {
      ...(profile.dimensions || {}),
      ...(overrides.dimensions || {}),
    },
  };
}

const firstJobQuestions = [
  {
    id: "F01",
    text: "开局第一天，别人已经进城开刷了，你还在彩虹岛被蜗牛教育。只要后期能坐上主桌，你愿意先坐一阵冷板凳吗？",
    options: makeOptions(["开局不爽我就下线", "能难，但别太坐牢", "看后期桌子够不够大", "冷板凳我能坐热", "我天生后期合伙人"]),
    effects: { lateGame: 1.2, efficiency: -0.6, distance: 0.4 },
  },
  {
    id: "F02",
    text: "情怀可以有，但别把开荒做成沉浸式军训。路线顺一点、节奏快一点、少一点精神内耗，你会更舒服。",
    options: makeOptions(["情怀无敌，苦也能吃", "慢点也不是不能活", "看体验能不能圆回来", "顺滑开荒很重要", "我只想一路绿灯刷过去"]),
    effects: { efficiency: 1.2, magic: 0.7, lateGame: -0.3 },
  },
  {
    id: "F03",
    text: "有条路线大家都说前期成本高、别上头，但你看了一眼：坏了，它确实有点会装。",
    options: makeOptions(["我只走白嫖路线", "理智还能按住我", "看它到底值不值", "可能会小破一下防", "贵不是它的问题，是我的问题"]),
    effects: { investment: 1.2, burst: 0.9, complexity: 0.4 },
  },
  {
    id: "F04",
    text: "你不喜欢东西贴脸才开始处理。最好是对面还没摸到你，你已经把事情安排明白了。",
    options: makeOptions(["贴脸才有游戏感", "近点也能接受", "距离随缘，看图说话", "远一点更体面", "别碰我，我会碎"]),
    effects: { distance: -1.2, burst: -0.2, complexity: 0.2 },
  },
  {
    id: "F05",
    text: "比起一点一点刮血条，你更喜欢那种突然一下把场面清干净的爽感。",
    options: makeOptions(["慢慢磨才踏实", "有过程也挺好", "都行，看当天手感", "一波带走很舒服", "我要看到血条蒸发"]),
    effects: { magic: 1.4, efficiency: 0.4, burst: 0.3 },
  },
  {
    id: "F06",
    text: "你能接受前期像被生活按在地上搓，只要后面能从角落里站起来，变成大家都认识的狠角色。",
    options: makeOptions(["别折磨我，谢谢", "浅坐牢可以", "看后期值不值", "我能熬到翻身", "我就是版本腌出来的狠人"]),
    effects: { lateGame: 1.1, efficiency: -0.7, investment: 0.3 },
  },
  {
    id: "F07",
    text: "你不太爱稳定小确幸，你爱那种数字突然跳出来，自己嘴角都跟着违规上扬的瞬间。",
    options: makeOptions(["稳定才是福报", "别太刺激也行", "看当天精神状态", "突然爆一下挺爽", "没有大数字我不认"]),
    effects: { burst: 1.3, complexity: 0.6, investment: 0.5 },
  },
  {
    id: "F08",
    text: "你希望别人看到你进队，不只是客套一句来了，而是心里偷偷松口气：这把有人兜底了。",
    options: makeOptions(["别把我写进责任书", "压力有点大", "看队友像不像人", "被需要还不错", "没有我你们先别开"]),
    effects: { party: 1.2, efficiency: 0.2 },
  },
  {
    id: "F09",
    text: "你不想把娱乐项目玩成在职研究生。你只是想上线、刷图、升级、下线，别让大脑继续加班。",
    options: makeOptions(["我爱把机制翻烂", "研究也有点香", "看当天脑容量", "简单点挺好", "别问，脑子已经下班了"]),
    effects: { complexity: -1.1, burst: -0.3 },
  },
  {
    id: "F10",
    text: "全网都在抢同一种排面，价格像坐火箭，但它确实很会营造氛围。你会不会突然被审美诈骗？",
    options: makeOptions(["不当氛围韭菜", "我会犹豫三秒", "看余额脸色", "可能咬牙入局", "颜值就是生产力"]),
    effects: { investment: 1.1, burst: 0.8, complexity: 0.3 },
  },
  {
    id: "F11",
    text: "热门地图人挤人，像早高峰地铁还没人下车。你宁愿找个没人懂的小角落，安静发育。",
    options: makeOptions(["人多才像过年", "挤一挤也能忍", "看收益配不配", "冷门角落挺香", "我住下水道，谢谢"]),
    effects: { distance: -0.5, efficiency: -0.2, party: -0.4, complexity: 0.3 },
  },
  {
    id: "F12",
    text: "可以慢，但别动不动就回城读秒。人还站着，故事才有后续；人倒了，只剩补给和路费在哭。",
    options: makeOptions(["倒了再跑回来呗", "脆一点也能玩", "看容错有多低", "稳一点更安心", "活着就是版本答案"]),
    effects: { distance: 1.0, lateGame: 0.4, burst: -0.3 },
  },
  {
    id: "F13",
    text: "你的刷法像遛电子狗：它追你，你绕；它急了，你不急；最后事情处理完，你还挺优雅。",
    options: makeOptions(["我想原地硬刚", "跑来跑去太累", "看地图给不给面子", "拉扯有点意思", "距离就是我的嘴替"]),
    effects: { distance: -1.0, complexity: 0.8, burst: -0.2 },
  },
  {
    id: "F14",
    text: "开局消耗像水龙头没关，背包像被房贷盯上。你更想走一条不太烧钱、还能体面发育的路线。",
    options: makeOptions(["钱不是问题，是态度", "能花就花吧", "看性价比说话", "省一点很必要", "我是零氪监察组"]),
    effects: { investment: -1.2, efficiency: 0.4, lateGame: -0.2 },
  },
  {
    id: "F15",
    text: "你不想自己像复读机，站在那里反复按同一种节奏。最好有点上限，让手和脑子都参与一下。",
    options: makeOptions(["复读也很养生", "舒服比花活重要", "看复杂到哪一步", "有点操作更醒脑", "我要把手感盘出包浆"]),
    effects: { complexity: 1.2, burst: 0.5 },
  },
  {
    id: "F16",
    text: "你不只看第一天有没有爽文开头，也想看后期有没有江湖座位。短期爽可以，长期没名分不行。",
    options: makeOptions(["现在爽先爽", "以后以后再说", "两边都想要一点", "长期价值更重要", "我押一个未来传说"]),
    effects: { lateGame: 1.0, efficiency: -0.6, party: 0.3 },
  },
];

const chinaFirstJobDimensions = {
  ...base.firstJobDimensions,
  mobility: { label: "机动节奏", low: "稳站输出", high: "跳跃走位" },
};

const chinaOnlyFirstJobQuestions = [
  {
    id: "CN-F17",
    text: "你喜欢一点街头感、游走感和反差感。不一定最端正，但最好别人看一眼就知道：这人路子很野。",
    options: makeOptions(["正经一点才稳", "别太花里胡哨", "看强度给不给脸", "辨识度挺加分", "我就是人群里的弹幕"]),
    effects: { mobility: 1.2, complexity: 0.8, burst: 0.4, party: -0.2 },
  },
  {
    id: "CN-F18",
    text: "比起一直站在安全区，或者一直硬吃生活，你更喜欢边走边处理，靠节奏把局面盘顺。",
    options: makeOptions(["站定最有安全感", "动太多我会累", "看手感合不合", "动起来更舒服", "节奏就是我的身份证"]),
    effects: { mobility: 1.3, complexity: 0.5, distance: -0.2 },
  },
  {
    id: "CN-F19",
    text: "资料还没齐，评论区一半装懂一半求救。你愿意边玩边摸，而不是等攻略组把饭喂到嘴边。",
    options: makeOptions(["不想当小白鼠", "等课代表总结", "先观望，别催", "可以自己摸索", "我来写野生说明书。"]),
    effects: { complexity: 1.1, mobility: 0.6, lateGame: 0.3, investment: 0.2 },
  },
];

const chinaFirstJobQuestions = [
  ...firstJobQuestions,
  ...chinaOnlyFirstJobQuestions,
];

const firstJobProfiles = {
  warrior: withProfile(base.firstJobProfiles.warrior, {
    code: "TANK",
    name: "战士",
    personaName: "铁血慢热人",
    subtitle: "前期承压，后期成长",
    tag: "后期成长型",
    slogan: "你不是在坐牢，你是在给后期席位交定金。",
    description: "前期承压、后期成长；适合能忍慢热、喜欢正面推进和后期存在感的玩家。",
  }),
  magician: withProfile(base.firstJobProfiles.magician, {
    code: "MAGI",
    name: "法师",
    personaName: "刷子工具人",
    subtitle: "远程节奏，开荒效率",
    tag: "效率清图型",
    slogan: "路线顺一点，地图干净一点，大脑就能少加一点班。",
    description: "远程节奏、开荒效率、清图舒服；适合重视安全感和练级效率的玩家。",
  }),
  thief: withProfile(base.firstJobProfiles.thief, {
    code: "EDGE",
    name: "飞侠",
    personaName: "帅比爆发人",
    subtitle: "速度爆发，手感个性",
    tag: "爆发操作型",
    slogan: "钱包在报警，数字在发光，审美说它没错。",
    description: "速度、爆发、手感和个性；适合愿意投入资源并喜欢操作感的玩家。",
  }),
  archer: withProfile(base.firstJobProfiles.archer, {
    code: "ARRO",
    name: "弓箭手",
    personaName: "远程风筝人",
    subtitle: "远程物理，稳定慢热",
    tag: "体面拉扯型",
    slogan: "对面还在赶路，你已经把事情处理完了。",
    description: "远程物理、稳定慢热、重视站位和节奏；适合喜欢放风筝的玩家。",
  }),
};

const chinaFirstJobProfiles = {
  warrior: withDimension(firstJobProfiles.warrior, { mobility: -1.0 }),
  magician: withDimension(firstJobProfiles.magician, { mobility: -0.4 }),
  thief: withDimension(firstJobProfiles.thief, { mobility: 1.0 }),
  archer: withDimension(firstJobProfiles.archer, { mobility: 0.5 }),
  pirate: {
    code: "PIRA",
    name: "海盗",
    personaName: "自由火力人",
    subtitle: "国服新增，自由节奏",
    tag: "机动特色型",
    slogan: "老饭能吃，新菜也得尝。",
    dimensions: {
      distance: 0.1,
      magic: -2,
      investment: 0.6,
      efficiency: 0.4,
      burst: 0.8,
      party: 0,
      complexity: 1.5,
      lateGame: 0.6,
      mobility: 2,
    },
    description: "国服新增倾向；介于贴近打击感和远程机动之间，适合喜欢新路线和自由节奏的玩家。",
  },
};

const secondJobDimensions = {
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

const pirateSecondJobDimensions = {
  range: { label: "战斗距离", low: "贴近打击", high: "远程拉扯" },
  mobility: { label: "走位节奏", low: "贴脸节奏", high: "远程机动" },
  burst: { label: "输出爽点", low: "连段动作", high: "火力爆点" },
  style: { label: "职业气质", low: "拳脚反馈", high: "潇洒弹道" },
};

const secondJobQuestions = {
  warrior: [
    { id: "W01", text: "你不是来整花活的，你想走最正统、最主角、最不用解释的路线。别人问为什么，你只回：因为它合理。", options: makeOptions(["标准答案看腻了", "有点太端着", "都能接受", "主角味不错", "我就爱主线男一感"]), effects: { feature: -1.0, weapon: -1.0 } },
    { id: "W02", text: "冷门一点没关系，只要它有自己的脾气。别人觉得怪，你觉得这是少数派之间的暗号。", options: makeOptions(["我要人多的地方", "别太逆天就行", "看实际表现", "有个性挺好", "越冷越像我亲生的"]), effects: { feature: 1.2, weapon: 0.5 } },
    { id: "W03", text: "你希望后期别人不是问你行不行，而是问你什么时候来。不是存在感，是缺席感。", options: makeOptions(["我一个人也挺好", "被绑定有点窒息", "看队伍值不值", "被惦记挺爽", "没我你们先别开"]), effects: { party: 1.1, lateGame: 0.8 } },
    { id: "W04", text: "比起标准模板，你更喜欢那种一站出来就有画面、有范围、有压迫感的路线。", options: makeOptions(["经典模板最稳", "存在感太强会尴尬", "都可以，看手感", "这个气场不错", "我要自带安全距离"]), effects: { weapon: 1.3, lateGame: 0.4 } },
    { id: "W05", text: "你不想走太歪门，也不想每次都给路人做科普。最好别人一看就懂：哦，老派狠人。", options: makeOptions(["邪门才有意思", "太好懂有点无聊", "都能玩", "简单清楚挺好", "传统狠活永不过时"]), effects: { feature: -1.1, weapon: -0.7 } },
    { id: "W06", text: "只要后期能有固定席位，前期像路边背景板你也能忍。先透明，后上桌。", options: makeOptions(["谁爱当背景板谁当", "透明期有点难受", "看后面有没有饭吃", "能忍到出头", "我先在角落发芽"]), effects: { lateGame: 1.2, party: 0.5 } },
    { id: "W07", text: "你看到那种稳重、端正、有守护感的设定，会觉得：这才像个没塌房的正经冒险家。", options: makeOptions(["太端正我会困", "不太吃这一套", "看外观和强度", "有点靠谱味", "老派灵魂燃起来了"]), effects: { feature: 1.3, party: 0.4, weapon: 0.2 } },
    { id: "W08", text: "你喜欢表达方式直接一点：少铺垫，少解释，把事情处理完。评论区还在吵，你已经换图了。", options: makeOptions(["我想玩复杂叙事", "太直会无聊", "都行，看状态", "直接点舒服", "别废话，开砍"]), effects: { feature: -0.9, lateGame: -0.2 } },
  ],
  magician: [
    { id: "M01", text: "你喜欢场面刚乱起来就被你按住。上一秒满屏失控，下一秒全场突然懂事。", options: makeOptions(["我不爱管场面", "一般般吧", "看地图给不给力", "按住局面挺爽", "全场立正听我说"]), effects: { control: 1.3, research: -0.2 } },
    { id: "M02", text: "别人看热闹，你顺手查路线、算收益、看怪物分布。不是你爱卷，是脑子自己开了后台。", options: makeOptions(["懒得打开后台", "有点麻烦", "看值不值得算", "可以研究一下", "我爱写野生说明书"]), effects: { research: 1.3, party: -0.3 } },
    { id: "M03", text: "朋友可以乱，但队伍不能没有你。你不是保姆，你是事故预案，是全队最后一道保险。", options: makeOptions(["别把我写进预案", "压力有点大", "看他们像不像人", "兜一下也可以", "我在，天塌不下来"]), effects: { party: 1.2, support: 1.0 } },
    { id: "M04", text: "你更想快速把场面收干净，不想每张图都像在做数学建模。", options: makeOptions(["建模也挺上头", "机制有意思", "看当天脑容量", "效率更舒服", "我要一键清爽"]), effects: { control: 1.1, research: -0.9 } },
    { id: "M05", text: "少一点个人高光没关系，只要别人看到你就安心。你不一定最吵，但很难被替代。", options: makeOptions(["我要站聚光灯", "不太想当后盾", "看定位舒不舒服", "安全感重要", "我就是移动存档点"]), effects: { party: 1.1, support: 1.2 } },
    { id: "M06", text: "你不追求简单粗暴，你喜欢那种慢慢起效、局势自己崩掉的快乐。", options: makeOptions(["简单最好，别绕", "过程太黏牙", "看效果够不够", "有过程挺香", "我爱温水煮全图"]), effects: { control: -0.8, research: 1.2, support: -0.5 } },
    { id: "M07", text: "你更喜欢自己掌握节奏，不想每次都等别人上线。人齐是缘分，不齐是常态。", options: makeOptions(["我爱热闹局", "组队优先", "都可以，不挑", "自己来更稳", "独狼也能开席"]), effects: { party: -1.1, support: -0.6 } },
    { id: "M08", text: "你可以不是全场声音最大的那个，但你想成为大家最不想失去的那个。", options: makeOptions(["我要第一排面", "不想当幕后", "看队伍气质", "这个位置不错", "没我你们像断网"]), effects: { support: 1.2, party: 0.8 } },
  ],
  thief: [
    { id: "T01", text: "每次出手都像背包轻了一点，但画面确实亮了一点。理智在报警，审美在鼓掌。", options: makeOptions(["我不为氛围买单", "有点肉疼", "看成本能不能做人", "好看能忍一点", "让我发光，别管"]), effects: { range: 1.3, burst: 1.0, popularity: 0.6, investment: 0.7 } },
    { id: "T02", text: "别人都选安全距离，你偏想把节奏拉近一点，证明自己不是复制粘贴。", options: makeOptions(["安全区最香", "太靠前有压力", "看手感合不合", "有点酷", "我就爱不按说明书"]), effects: { range: -1.3, popularity: -0.8, burst: 0.4 } },
    { id: "T03", text: "热门也没关系，满街同款也挡不住你想变帅。撞款不可怕，谁普通谁尴尬。", options: makeOptions(["人多我会撤退", "撞款有点烦", "看强度配不配", "热门也能接受", "帅就不怕复制人"]), effects: { popularity: 1.1, investment: 0.8, burst: 0.5 } },
    { id: "T04", text: "你更愿意选一条没那么多人懂的路线。评论区吵起来时，你还能淡淡来一句：你不懂。", options: makeOptions(["我要标准答案", "别太冷", "看数据说话", "有点意思", "我天生反骨开机"]), effects: { popularity: -1.2, range: -0.4 } },
    { id: "T05", text: "为了手感、观感和那点说不清的排面，你愿意让仓库和钱包一起轻断食。", options: makeOptions(["不愿为美破产", "省点吧宝", "看收益够不够", "能花一点", "排面是另一种刚需"]), effects: { investment: 1.3, burst: 0.8 } },
    { id: "T06", text: "你不想纯跟风。比起大家都说好，你更喜欢性价比、个性，以及一点点不太正常。", options: makeOptions(["跟风省脑子", "热门更安全", "都可以，看版本", "个性不错", "我就是不一样怎么了"]), effects: { investment: -0.8, popularity: -0.9 } },
    { id: "T07", text: "你最想看到的，是头顶突然跳出一个很爽的数字。那一刻，世界都安静了，只剩你在偷笑。", options: makeOptions(["稳定就好，别吓我", "数字无所谓", "看频率舒不舒服", "突然一下挺爽", "我要大数字治愈我"]), effects: { burst: 1.2, range: 0.5 } },
    { id: "T08", text: "你喜欢操作感，但不一定非要走全服最贵、最挤、最容易被复制的那条路。", options: makeOptions(["越贵越有安全感", "热门优先别问", "看版本怎么说", "小众也可以", "我走野路也要走直"]), effects: { range: -0.5, popularity: -0.8, investment: -0.4 } },
  ],
  archer: [
    { id: "A01", text: "你喜欢轻快、顺手、保持距离的节奏：对面追，你后撤；对面没了，你还很体面。", options: makeOptions(["不爱拉扯", "有点麻烦", "看地形给不给面子", "挺舒服的", "距离就是我的体面"]), effects: { speed: 1.2, mainstream: 1.0, flow: 1.0 } },
    { id: "A02", text: "你喜欢话不多但分量重的路线。慢一点没关系，重点是出手要有压迫感。", options: makeOptions(["我要轻快一点", "太慢我会焦虑", "看效果够不够重", "这种质感挺帅", "一发入魂，懂的都懂"]), effects: { speed: -1.3, mainstream: -1.0, flow: -0.4 } },
    { id: "A03", text: "你不想前期太别扭，至少要顺手一点。别让每一次开荒都像被面试官追问职业规划。", options: makeOptions(["慢也能忍", "别太顺也行", "看后面值不值", "顺手很重要", "我拒绝电子面试"]), effects: { early: 1.1, flow: 1.0 } },
    { id: "A04", text: "慢热没关系，你喜欢那种越玩越像少数派老玩家的感觉。别人还在问值不值，你已经入味了。", options: makeOptions(["我不想慢热", "有点累人", "看后面有没有说法", "可以坚持", "冷门老登就是我"]), effects: { early: -1.0, mainstream: -0.8 } },
    { id: "A05", text: "你想要主流一点、好理解一点的远程节奏，不想一上来就走到评论区都沉默的怪路。", options: makeOptions(["怪路才香", "主流一般般", "都行，看手感", "稳点挺好", "我要标准答案但别骂我"]), effects: { mainstream: 1.1, speed: 0.8 } },
    { id: "A06", text: "如果一条路线冷门但很有力量感，你会觉得：坏了，这种东西一般会偷偷长在我审美上。", options: makeOptions(["冷门先劝退", "不太想赌", "看实际表现", "有点心动", "懂的自然懂"]), effects: { mainstream: -1.1, speed: -0.8 } },
    { id: "A07", text: "你喜欢轻快节奏和顺滑手感，不想每一下都像在拉开一扇生锈铁门。", options: makeOptions(["重一点也不错", "慢也能玩", "看效果能不能补", "顺滑舒服", "我爱丝滑到没边界"]), effects: { speed: 1.1, flow: 1.0 } },
    { id: "A08", text: "你不介意前期稍慢，只要最后有自己的味道，不像从同一个模板里复制出来的。", options: makeOptions(["复制也很稳", "慢热算了", "看收益够不够", "有味道不错", "我要独家配方"]), effects: { early: -0.9, mainstream: -0.5, flow: -0.3 } },
  ],
};

const pirateSecondJobQuestions = [
  { id: "P01", text: "你选新路线不是为了最稳，而是想要一点自由感和开荒新鲜感。老饭能吃，新菜也得尝。", options: makeOptions(["老饭最安全", "新菜有点怕", "先看别人试毒", "自由感不错", "我就要吃第一口"]), effects: { mobility: 0.4, style: 0.2 } },
  { id: "P02", text: "如果要在安全距离和贴近节奏之间选，你会更想压上去一点，用身体感把节奏打出来。", options: makeOptions(["我只想远远处理", "靠太近压力大", "看手感给不给面子", "压上去也可以", "贴近才有灵魂"]), effects: { range: -1.4, style: -1.1, mobility: -0.3 } },
  { id: "P03", text: "你喜欢拉扯、走位和持续处理，不想每次都冲到脸上和命运打麻将。", options: makeOptions(["贴脸才有意思", "远一点会无聊", "看场景适不适合", "拉扯舒服", "安全感才是硬通货"]), effects: { range: 1.3, mobility: 1.0, style: 0.7 } },
  { id: "P04", text: "你能接受前期资料不完整，因为摸索本身就是乐趣。别人等攻略，你等灵感。", options: makeOptions(["不要让我摸黑", "有点麻烦", "看收益值不值", "可以研究", "我来当野生课代表"]), effects: { mobility: 0.5, burst: 0.2, style: 0.2 } },
  { id: "P05", text: "你喜欢动作有存在感，不只是数字跳出来，而是看起来真的在做事。画面要有，手感也要有。", options: makeOptions(["数字够就行", "动作无所谓", "都可以，看表现", "动作感重要", "打击感就是活人感"]), effects: { range: -0.6, style: -1.3, burst: -0.5 } },
  { id: "P06", text: "你对冷门资源、专属需求和不稳定价格有耐心，愿意慢慢把这个号养成自己的形状。", options: makeOptions(["价格不明先撤", "怕被坑成表情包", "看市场脸色", "可以慢慢补", "我会提前囤空气"]), effects: { burst: 0.3, mobility: 0.3 } },
  { id: "P07", text: "你更喜欢机动、跳跃、走位和节奏变化，而不是站桩把自己按成一枚图钉。", options: makeOptions(["站住最舒服", "动太多会累", "看强度够不够", "动起来不错", "我就是会移动的弹幕"]), effects: { mobility: 1.4, range: 0.6, style: 0.4 } },
  { id: "P08", text: "你希望这个号以后能成为你的个人招牌，而不只是大众标准答案。别人一看就知道：哦，是他。", options: makeOptions(["标准答案最好", "别太特别", "看表现争不争气", "有特色不错", "我要一眼被记住"]), effects: { style: 0.8, mobility: 0.4 } },
];

const chinaSecondJobDimensions = {
  ...secondJobDimensions,
  pirate: pirateSecondJobDimensions,
};

const chinaSecondJobQuestions = {
  ...secondJobQuestions,
  pirate: pirateSecondJobQuestions,
};

const secondJobProfiles = {
  warrior: {
    fighter: {
      code: "SLAY",
      name: "剑客",
      personaName: "正统主角人",
      tag: "经典主角型",
      slogan: "别废话，主线男一已经进图。",
      dimensions: { feature: -2, party: 0, weapon: -2, lateGame: 0 },
      description: "经典主角型，直接、好懂、稳定。",
    },
    page: {
      code: "SHLD",
      name: "准骑士",
      personaName: "老派守护人",
      tag: "冷门信仰型",
      slogan: "你不是冷门，你是少数派之间的暗号。",
      dimensions: { feature: 2, party: 0.8, weapon: 0.4, lateGame: 0.8 },
      description: "冷门信仰型，重视稳重感、守护感和辨识度。",
    },
    spearman: {
      code: "POLE",
      name: "枪战士",
      personaName: "后期席位人",
      tag: "后期团队型",
      slogan: "前期坐冷板凳，后期别人问你什么时候来。",
      dimensions: { feature: 0.8, party: 2, weapon: 2, lateGame: 2 },
      description: "后期团队型，能忍前期，押后期队伍价值。",
    },
  },
  magician: {
    iceLightning: {
      code: "ZAPZ",
      name: "冰雷法师",
      personaName: "全场立正人",
      tag: "控场清图型",
      slogan: "上一秒满屏失控，下一秒全场懂事。",
      dimensions: { control: 2, party: 0.2, research: -0.8, support: 0.2 },
      description: "控场清图型，喜欢掌控地图节奏。",
    },
    firePoison: {
      code: "TOXI",
      name: "火毒法师",
      personaName: "试毒研究人",
      tag: "机制研究型",
      slogan: "别人等怪倒下，你等局势自己崩掉。",
      dimensions: { control: -1.4, party: -0.8, research: 2, support: -1 },
      description: "机制研究型，适合喜欢路线研究和持续效果的玩家。",
    },
    cleric: {
      code: "HEAL",
      name: "牧师",
      personaName: "队伍保险人",
      tag: "团队辅助型",
      slogan: "你不一定最吵，但队伍最怕你断网。",
      dimensions: { control: 0.3, party: 2, research: 0, support: 2 },
      description: "团队辅助型，输出不一定第一，但队伍很难失去你。",
    },
  },
  thief: {
    assassin: {
      code: "STAR",
      name: "刺客",
      personaName: "发光氪感人",
      tag: "远程爆发型",
      slogan: "理智在报警，审美在鼓掌。",
      dimensions: { range: 2, popularity: 2, burst: 2, investment: 2 },
      description: "远程爆发、热门、愿意投入。",
    },
    bandit: {
      code: "STAB",
      name: "侠盗",
      personaName: "反骨理解人",
      tag: "小众近身型",
      slogan: "你不是不走主路，你是主路不够你发挥。",
      dimensions: { range: -2, popularity: -2, burst: 0.5, investment: -0.8 },
      description: "小众近身路线，个性、操作和理解感更强。",
    },
  },
  archer: {
    hunter: {
      code: "KITE",
      name: "猎人",
      personaName: "体面拉扯人",
      tag: "主流远程型",
      slogan: "距离就是你的体面。",
      dimensions: { speed: 2, mainstream: 2, early: 1, flow: 2 },
      description: "主流远程、轻快顺手、稳定风筝。",
    },
    crossbowman: {
      code: "SNIP",
      name: "弩弓手",
      personaName: "冷门重击人",
      tag: "冷门重击型",
      slogan: "慢一点没关系，一发要有分量。",
      dimensions: { speed: -2, mainstream: -2, early: -1, flow: -1.4 },
      description: "单下更重、路线更冷门、辨识度更强。",
    },
  },
};

const chinaSecondJobProfiles = {
  ...secondJobProfiles,
  pirate: {
    brawler: {
      code: "BRAW",
      name: "拳手",
      personaName: "贴脸节奏人",
      tag: "近战打击型",
      slogan: "贴近才有灵魂，打击感才像活人。",
      dimensions: { range: -2, mobility: -0.5, burst: -0.6, style: -2 },
      description: "海盗近战分支，强调打击感、动作感和机动操作。",
    },
    gunslinger: {
      code: "GUNS",
      name: "火枪手",
      personaName: "远程机动人",
      tag: "远程机动型",
      slogan: "安全感、弹道和走位，都是你的硬通货。",
      dimensions: { range: 2, mobility: 2, burst: 1.1, style: 2 },
      description: "海盗远程分支，强调拉扯、走位和灵活安全感。",
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
  firstJobProfiles,
  firstJobQuestions,
  secondJobDimensions,
  secondJobProfiles,
  secondJobQuestions,
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
