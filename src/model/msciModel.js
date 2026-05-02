const optionValues = [-2, -1, 0, 1, 2];

function makeOptions(labels) {
  return optionValues.map((value, index) => ({ value, label: labels[index] }));
}

export const answerScale = makeOptions([
  "不，我会跑路",
  "有点难顶",
  "先观望",
  "能忍",
  "这就是我",
]);

export const firstJobDimensions = {
  distance: { label: "战斗距离", low: "远程安全", high: "近战承压" },
  magic: { label: "攻击体系", low: "物理攻击", high: "魔法技能" },
  investment: { label: "资源投入", low: "省钱平民", high: "愿意投入" },
  efficiency: { label: "开荒效率", low: "慢慢养成", high: "追求效率" },
  burst: { label: "输出风格", low: "稳定持续", high: "爆发风险" },
  party: { label: "社交定位", low: "独狼单刷", high: "组队价值" },
  complexity: { label: "操作复杂度", low: "简单直接", high: "机制操作" },
  lateGame: { label: "后期耐心", low: "前期舒服", high: "愿意慢热" },
};

export const firstJobQuestions = [
  {
    id: "F01",
    text: "开服第一天，别人已经开始冲级了，你还在和低级怪物互相折磨。只要后期够有排面，你能忍吗？",
    options: makeOptions(["不行，马上删号", "有点坐牢", "看后期多强", "能忍一阵", "我就爱养成"]),
    effects: { lateGame: 1.2, efficiency: -0.6, distance: 0.4 },
  },
  {
    id: "F02",
    text: "你宁愿少一点情怀，也要前期练级顺、清怪快、少坐牢。",
    options: makeOptions(["情怀最大", "不太想卷", "看版本吧", "效率重要", "开荒就是冲"]),
    effects: { efficiency: 1.2, magic: 0.7, lateGame: -0.3 },
  },
  {
    id: "F03",
    text: "如果一个职业又帅又贵，装备像在抢钱，你还会不会上头？",
    options: makeOptions(["钱包先活着", "有点劝退", "看帅到哪种程度", "可能会冲", "帅就完事了"]),
    effects: { investment: 1.2, burst: 0.9, complexity: 0.4 },
  },
  {
    id: "F04",
    text: "怪物离你越近，你越想报警；能隔着半张地图打怪才有安全感。",
    options: makeOptions(["贴脸才刺激", "近点也行", "距离随缘", "远点舒服", "别碰我谢谢"]),
    effects: { distance: -1.2, burst: -0.2, complexity: 0.2 },
  },
  {
    id: "F05",
    text: "比起一刀一刀砍，你更喜欢屏幕一亮，怪物集体安静。",
    options: makeOptions(["刀刀到肉才真", "物理更有感觉", "都可以", "魔法挺香", "全屏安静太爽"]),
    effects: { magic: 1.4, efficiency: 0.4 },
  },
  {
    id: "F06",
    text: "你可以接受前期像坐牢，只要后期出狱之后像大哥。",
    options: makeOptions(["我不坐牢", "最多拘留", "看判几年", "能熬", "牢底坐穿也行"]),
    effects: { lateGame: 1.1, efficiency: -0.7, investment: 0.3 },
  },
  {
    id: "F07",
    text: "你不喜欢慢慢磨血，你喜欢数字突然跳一下，然后自己嘴角也跳一下。",
    options: makeOptions(["稳定最好", "不太追爆发", "都行", "爆一下挺爽", "暴击是信仰"]),
    effects: { burst: 1.3, complexity: 0.6, investment: 0.5 },
  },
  {
    id: "F08",
    text: "你希望队友看到你进组时，心里想的是：稳了，这把有人兜底。",
    options: makeOptions(["我只想单刷", "不想背责任", "看队伍", "有点想被需要", "队伍没我不行"]),
    effects: { party: 1.2, efficiency: 0.2 },
  },
  {
    id: "F09",
    text: "你不想写论文研究职业机制，你只想上线、打怪、升级、睡觉。",
    options: makeOptions(["我要研究到天亮", "机制也挺香", "看心情", "简单点好", "别让我动脑"]),
    effects: { complexity: -1.1, burst: -0.3 },
  },
  {
    id: "F10",
    text: "全服都在抢这个职业的装备，价格飞到天上，但它真的很帅。你还会不会上头？",
    options: makeOptions(["不当韭菜", "有点犹豫", "看钱包脸色", "可能咬牙", "帅比经济学"]),
    effects: { investment: 1.1, burst: 0.8, complexity: 0.3 },
  },
  {
    id: "F11",
    text: "热门图人比怪多，你宁愿去角落里找一张没人懂的地图偷偷发育。",
    options: makeOptions(["人多才热闹", "抢怪也能忍", "看收益", "冷门图挺好", "我爱下水道"]),
    effects: { distance: -0.5, efficiency: -0.2, party: -0.4, complexity: 0.3 },
  },
  {
    id: "F12",
    text: "你可以打得慢，但你不想动不动就躺地板。活着，才有输出。",
    options: makeOptions(["死了再跑", "脆点没事", "看职业", "硬一点好", "血条就是尊严"]),
    effects: { distance: 1.0, lateGame: 0.4, burst: -0.3 },
  },
  {
    id: "F13",
    text: "你打怪更像放风筝：怪在追，你在跑，最后怪没了，你还在。",
    options: makeOptions(["我想站撸", "跑来跑去累", "看地图", "风筝挺香", "距离产生输出"]),
    effects: { distance: -1.0, complexity: 0.8, burst: -0.2 },
  },
  {
    id: "F14",
    text: "开服药水像漏水，装备像房贷。你更想选一个平民友好、不太烧钱的职业。",
    options: makeOptions(["钱不是问题", "能花就花", "看性价比", "省点最好", "我是零氪守门员"]),
    effects: { investment: -1.2, efficiency: 0.4, lateGame: -0.2 },
  },
  {
    id: "F15",
    text: "你希望职业有操作上限，不想只是站在原地按一个键当复读机。",
    options: makeOptions(["复读挺好", "简单舒服", "看难度", "要点操作", "我要秀起来"]),
    effects: { complexity: 1.2, burst: 0.5 },
  },
  {
    id: "F16",
    text: "你选职业时，不是只看第一天爽不爽，而是想看它以后有没有江湖地位。",
    options: makeOptions(["现在爽就行", "后期先不管", "都要一点", "长期重要", "我押未来"]),
    effects: { lateGame: 1.0, efficiency: -0.6, party: 0.3 },
  },
];

export const firstJobProfiles = {
  warrior: {
    code: "TANK",
    name: "战士",
    personaName: "硬抗成长人",
    subtitle: "前期承压，后期成长",
    tag: "后期成长型",
    slogan: "你不是在练级，你是在和怪物签长期劳动合同。",
    dimensions: { distance: 2, magic: -2, investment: 1, efficiency: -1, burst: -0.5, party: 0.8, complexity: -0.6, lateGame: 2 },
    description: "你更能接受前期慢热和近战压力，重视成长感、承压能力和后期存在感。",
  },
  magician: {
    code: "MAGI",
    name: "法师",
    personaName: "蓝条清图人",
    subtitle: "远程魔法，开荒效率",
    tag: "效率开荒型",
    slogan: "蓝条一亮，怪物全场安静。",
    dimensions: { distance: -2, magic: 2, investment: -0.2, efficiency: 2, burst: 0, party: 0.8, complexity: 0, lateGame: 0 },
    description: "你偏向远程、安全、魔法技能和舒服练级，适合重视开荒效率的玩家。",
  },
  thief: {
    code: "EDGE",
    name: "飞侠",
    personaName: "帅比爆发人",
    subtitle: "速度爆发，帅和操作",
    tag: "爆发操作型",
    slogan: "钱包在流血，人物在发光。",
    dimensions: { distance: -0.6, magic: -2, investment: 2, efficiency: 0, burst: 2, party: -0.8, complexity: 2, lateGame: 0.8 },
    description: "你更看重速度、爆发、手感和个性，能接受更高资源投入和操作要求。",
  },
  archer: {
    code: "ARRO",
    name: "弓箭手",
    personaName: "远程风筝人",
    subtitle: "远程物理，稳定慢热",
    tag: "稳定远程型",
    slogan: "怪还没碰到你，已经开始怀疑人生。",
    dimensions: { distance: -2, magic: -2, investment: 0, efficiency: 0, burst: -0.8, party: -0.4, complexity: 0.8, lateGame: 1.4 },
    description: "你喜欢远程、稳定、站位和慢热成长，不一定追求最快，但重视自己的节奏。",
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
    { id: "W01", text: "你选战士不是为了整花活，你就是想拿剑当主角。", options: makeOptions(["不想太正统", "有点普通", "都能玩", "主角感不错", "剑就是答案"]), effects: { feature: -1.0, weapon: -1.0 } },
    { id: "W02", text: "冷门一点没关系，只要这个职业看起来有自己的脾气。", options: makeOptions(["我要热门", "别太怪", "看强度", "有特色挺好", "我就爱冷门"]), effects: { feature: 1.2, weapon: 0.6 } },
    { id: "W03", text: "你希望后期进组时，队友不是问你能不能打，而是问你什么时候上线。", options: makeOptions(["我单刷就行", "不想被绑定", "看情况", "被需要挺好", "队伍缺我不行"]), effects: { party: 1.1, lateGame: 0.8 } },
    { id: "W04", text: "比起规规矩矩拿剑，你更想拿枪矛这种一看就很长、很有存在感的武器。", options: makeOptions(["剑最经典", "长兵器一般", "都可以", "长枪挺帅", "越长越有安全感"]), effects: { weapon: 1.3, lateGame: 0.4 } },
    { id: "W05", text: "你不想研究什么奇怪分支，只想选一个别人一看就懂的战士。", options: makeOptions(["我要邪门", "有点无聊", "都行", "简单挺好", "正统万岁"]), effects: { feature: -1.1, weapon: -0.7 } },
    { id: "W06", text: "只要后期队伍需要你，前期当路灯你也认了。", options: makeOptions(["路灯谁爱当", "有点难忍", "看后期价值", "能忍", "我先插地上"]), effects: { lateGame: 1.2, party: 0.5 } },
    { id: "W07", text: "你看到盾牌、骑士感、防御感，会觉得：这才像个正经冒险家。", options: makeOptions(["盾牌太笨", "不太感冒", "看造型", "有点帅", "骑士魂燃了"]), effects: { feature: 1.3, party: 0.4, weapon: 0.2 } },
    { id: "W08", text: "你希望输出方式直接一点：少说话，多砍怪。", options: makeOptions(["我要机制", "太单调", "都可以", "直接点好", "砍就完事"]), effects: { feature: -0.9, lateGame: -0.2 } },
  ],
  magician: [
    { id: "M01", text: "你喜欢怪刚刷新就被冻住、电住，整个地图像被你按了暂停键。", options: makeOptions(["我不爱控场", "一般", "看地图", "挺爽", "全图立正"]), effects: { control: 1.3, research: -0.2 } },
    { id: "M02", text: "别人看怪物等级，你还要顺便研究属性、路线、技能机制。", options: makeOptions(["懒得研究", "有点麻烦", "看收益", "可以研究", "我爱写小论文"]), effects: { research: 1.3, party: -0.3 } },
    { id: "M03", text: "队友可以乱走位，但不能没有你。你不是奶妈，你是队伍保险公司。", options: makeOptions(["别找我兜底", "压力有点大", "看队伍", "可以辅助", "我来保全队"]), effects: { party: 1.2, support: 1.0 } },
    { id: "M04", text: "你更想快速清图，不想每张图都像在做数学建模。", options: makeOptions(["建模也行", "机制有趣", "看心情", "清图更爽", "效率就是王道"]), effects: { control: 1.1, research: -0.9 } },
    { id: "M05", text: "少一点输出没关系，只要队友看到你就觉得安全。", options: makeOptions(["伤害第一", "不太想辅助", "看职业", "安全感重要", "我就是安全区"]), effects: { party: 1.1, support: 1.2 } },
    { id: "M06", text: "你不追求简单粗暴，你追求让怪死得很有过程。", options: makeOptions(["简单最好", "过程太麻烦", "看伤害", "有机制挺好", "慢性折磨专家"]), effects: { control: -0.8, research: 1.2, support: -0.5 } },
    { id: "M07", text: "你更喜欢自己刷怪，不想每次练级都等队友上线。", options: makeOptions(["我爱组队", "组队优先", "都可以", "单刷更稳", "独狼法爷"]), effects: { party: -1.1, support: -0.6 } },
    { id: "M08", text: "你可以不是全队伤害最高，但你想成为全队最不想失去的人。", options: makeOptions(["我要第一伤害", "不想当后勤", "看情况", "这定位不错", "没我队伍散了"]), effects: { support: 1.2, party: 0.8 } },
  ],
  thief: [
    { id: "T01", text: "飞镖丢出去那一下，像钱包在流血，但人物在发光。", options: makeOptions(["我不买单", "有点贵", "看价格", "帅能忍", "给我发光"]), effects: { range: 1.3, burst: 1.0, popularity: 0.6 } },
    { id: "T02", text: "别人都在远程丢标，你偏要贴脸拿匕首证明自己有理解。", options: makeOptions(["远程舒服", "别太贴脸", "看手感", "匕首挺酷", "我就邪门"]), effects: { range: -1.3, popularity: -0.8, burst: 0.4 } },
    { id: "T03", text: "热门也没关系，满大街都是同职业也挡不住你想装帅。", options: makeOptions(["人多劝退", "有点撞衫", "看强度", "热门也行", "帅就不怕撞"]), effects: { popularity: 1.1, investment: 0.8, burst: 0.5 } },
    { id: "T04", text: "你更愿意选一条没那么多人懂的路线，评论区吵架时你还能说：你不懂。", options: makeOptions(["我要标准答案", "别太冷门", "看数据", "有点意思", "我天生反骨"]), effects: { popularity: -1.2, range: -0.4 } },
    { id: "T05", text: "为了输出、手感和职业排面，你愿意让仓库和钱包一起减肥。", options: makeOptions(["不愿破产", "省点吧", "看收益", "能花一点", "排面无价"]), effects: { investment: 1.3, burst: 0.8 } },
    { id: "T06", text: "你不想纯跟风，更喜欢性价比、个性和一点点邪门路线。", options: makeOptions(["跟风省心", "热门更稳", "都可以", "个性不错", "我就不一样"]), effects: { investment: -0.8, popularity: -0.9 } },
    { id: "T07", text: "你选飞侠最想看到的，就是怪物头上突然跳出一个很爽的数字。", options: makeOptions(["稳定就好", "数字无所谓", "看频率", "爆一下爽", "我要大数字"]), effects: { burst: 1.2, range: 0.5 } },
    { id: "T08", text: "你喜欢操作感，但不一定非要走全服最贵、最热门的那条路。", options: makeOptions(["越贵越香", "热门优先", "看版本", "可以小众", "我走野路子"]), effects: { range: -0.5, popularity: -0.8, investment: -0.4 } },
  ],
  archer: [
    { id: "A01", text: "你喜欢轻快、顺手、传统的远程输出：怪在追，你在跑，怪没了。", options: makeOptions(["不爱放风筝", "有点麻烦", "看地图", "挺舒服", "距离产生输出"]), effects: { speed: 1.2, mainstream: 1.0, flow: 1.0 } },
    { id: "A02", text: "你喜欢单下更重、话不多、但出手很有分量的冷门路线。", options: makeOptions(["我要轻快", "太慢不行", "看伤害", "重击挺帅", "一发入魂"]), effects: { speed: -1.3, mainstream: -1.0, flow: -0.4 } },
    { id: "A03", text: "你不想前期太别扭，至少要练起来顺，不要每只怪都像面试官。", options: makeOptions(["慢也能忍", "别太顺也行", "看职业", "顺手重要", "我拒绝折磨"]), effects: { early: 1.1, flow: 1.0 } },
    { id: "A04", text: "职业慢热没关系，你喜欢那种越玩越像少数派老玩家的感觉。", options: makeOptions(["我不慢热", "有点累", "看后期", "可以坚持", "冷门老登就是我"]), effects: { early: -1.0, mainstream: -0.8 } },
    { id: "A05", text: "你想要主流一点、好理解一点的远程物理职业，不想一上来就走怪路。", options: makeOptions(["怪路才香", "主流一般", "都行", "稳点好", "我要标准远程"]), effects: { mainstream: 1.1, speed: 0.8 } },
    { id: "A06", text: "如果一个职业冷门但很有力量感，你会觉得：这才像我会偷偷喜欢的东西。", options: makeOptions(["冷门劝退", "不太想赌", "看强度", "有点心动", "懂的都懂"]), effects: { mainstream: -1.1, speed: -0.8 } },
    { id: "A07", text: "你喜欢轻快节奏和顺滑手感，不想每一下都像在拉开一扇铁门。", options: makeOptions(["重一点好", "慢也能玩", "看伤害", "顺滑舒服", "我爱丝滑"]), effects: { speed: 1.1, flow: 1.0 } },
    { id: "A08", text: "你不介意前期稍慢，只要职业最后很有自己的味道，不像复制粘贴。", options: makeOptions(["复制也稳", "慢热算了", "看收益", "有味道不错", "我要独家配方"]), effects: { early: -0.9, mainstream: -0.5, flow: -0.3 } },
  ],
};

export const secondJobProfiles = {
  warrior: {
    fighter: {
      code: "SLAY",
      name: "剑客",
      personaName: "正统砍王",
      tag: "经典主角型",
      slogan: "不整虚的，见怪就劈。",
      dimensions: { feature: -2, party: 0, weapon: -2, lateGame: 0 },
      description: "你喜欢正统、稳定、好理解的战士路线。复杂机制都让开，你要开砍了。",
    },
    page: {
      code: "SHLD",
      name: "准骑士",
      personaName: "盾牌信仰人",
      tag: "冷门信仰型",
      slogan: "别人追求秒怪，你追求怪打你像挠痒。",
      dimensions: { feature: 2, party: 0.8, weapon: 0.6, lateGame: 0.8 },
      description: "你喜欢职业特色、骑士感和辨识度。不怕小众，玩的是信仰和稳定。",
    },
    spearman: {
      code: "POLE",
      name: "枪战士",
      personaName: "长枪后期人",
      tag: "后期团队型",
      slogan: "前期像路灯，后期像队伍保险。",
      dimensions: { feature: 0.8, party: 2, weapon: 2, lateGame: 2 },
      description: "你更看重长兵器、后期价值和组队存在感。你不是弱，你只是在等版本懂你。",
    },
  },
  magician: {
    iceLightning: {
      code: "ZAPZ",
      name: "冰雷法师",
      personaName: "冰雷控图人",
      tag: "控图效率型",
      slogan: "你玩的是法师，其实干的是地图管理员。",
      dimensions: { control: 2, party: 0, research: -0.2, support: 0 },
      description: "你偏向控场、范围清怪和练级效率。怪刚走两步，就被你电到站军姿。",
    },
    firePoison: {
      code: "TOXI",
      name: "火毒法师",
      personaName: "毒火研究人",
      tag: "机制爆发型",
      slogan: "你不追求秒杀，你追求让怪死得很有过程。",
      dimensions: { control: -1, party: -0.8, research: 2, support: -0.8 },
      description: "你喜欢研究属性、持续伤害和路线机制。别人刷怪，你给怪上慢性折磨。",
    },
    cleric: {
      code: "HEAL",
      name: "牧师",
      personaName: "队伍亲妈人",
      tag: "队伍核心型",
      slogan: "别人负责输出，你负责把大家从离谱操作里捞回来。",
      dimensions: { control: 0, party: 2, research: 0, support: 2 },
      description: "你重视组队、安全感和长期价值。你可以不会走位，但队伍不能没有你。",
    },
  },
  thief: {
    assassin: {
      code: "STAR",
      name: "刺客",
      personaName: "标飞装帅人",
      tag: "人气爆发型",
      slogan: "飞镖出去的一刻，钱包也跟着飞。",
      dimensions: { range: 2, popularity: 2, burst: 2, investment: 2 },
      description: "你不是不知道它贵，你只是拒绝不了远程丢标、暴击和速度感。",
    },
    bandit: {
      code: "STAB",
      name: "侠客",
      personaName: "匕首背刺人",
      tag: "近战个性型",
      slogan: "别人玩热门，你玩自己的邪门理解。",
      dimensions: { range: -2, popularity: -1.2, burst: 0.8, investment: 0 },
      description: "你喜欢匕首、贴脸操作和小众个性。不走寻常路，专走怪物背后那条路。",
    },
  },
  archer: {
    hunter: {
      code: "KITE",
      name: "猎人",
      personaName: "风筝猎人",
      tag: "灵活远程型",
      slogan: "你追我，追到你掉经验。",
      dimensions: { speed: 2, mainstream: 2, early: 1, flow: 2 },
      description: "你喜欢灵活、顺手、主流、流畅的远程物理体验。你的人生哲学是：距离产生输出。",
    },
    crossbowman: {
      code: "SNIP",
      name: "弩弓手",
      personaName: "冷门狙击人",
      tag: "冷门精准型",
      slogan: "你话不多，但每一下都很重。",
      dimensions: { speed: -2, mainstream: -1.2, early: -0.8, flow: -0.8 },
      description: "你喜欢重击感、精准感和冷门辨识度。别人靠热度活着，你靠一发入魂活着。",
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

      return { id, ...profile, cosine: bounded, matchPercent };
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
