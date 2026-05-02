# MSCI — MapleStory Class Indicator

MSCI 是一个给冒险岛怀旧服 / MapleStory Classic World 使用的职业人格测试网页工具。

它不是普通的 `A = 战士，B = 法师` 投票测试，而是一个更严谨的游戏职业适配模型：

1. 玩家回答 Likert 5 点量表题目。
2. 每个答案会影响多个隐藏维度。
3. 系统把玩家维度向量和职业画像向量做匹配。
4. 第一阶段输出一转职业倾向。
5. 第二阶段根据一转职业进入对应二转分支测试。
6. 最终结果显示主职业、二转分支、匹配度、副人格、置信度和隐藏维度图。

## 当前功能

- 版本选择：国际服 / 国服
- 国际服一转测试：战士 / 法师 / 飞侠 / 弓箭手
- 国服一转测试：战士 / 法师 / 飞侠 / 弓箭手 / 海盗
- 国际服二转测试：剑客 / 准骑士 / 枪战士 / 冰雷法师 / 火毒法师 / 牧师 / 刺客 / 侠客 / 猎人 / 弩弓手
- 国服新增二转测试：拳手 / 火枪手
- 国服海盗结果页：增加海盗角色预览和海盗装备预设池
- 隐藏维度：战斗距离、攻击体系、资源投入、开荒效率、输出风格、社交定位、操作复杂度、后期耐心；国服模式额外加入机动节奏
- 评分方法：Likert 5 点量表 + 维度加权 + 余弦相似度职业画像匹配
- 结果页：主职业、二转职业、副人格、匹配度、置信度、维度条形图

## 文件结构

```text
MSCI/
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ CleanCharacterBuilder.jsx
│  ├─ FastCharacterBuilder.jsx
│  ├─ styles.css
│  └─ model/
│     ├─ msciModel.js
│     └─ msciModes.js
└─ .github/
   └─ workflows/
      └─ deploy.yml
```

## 本地运行

```bash
npm install
npm run dev
```

然后打开 Vite 显示的本地地址。

## 构建

```bash
npm run build
npm run preview
```

## GitHub Pages 部署

仓库已经包含 `.github/workflows/deploy.yml`。

合并到 `main` 后，在 GitHub 仓库里设置：

1. `Settings` → `Pages`
2. `Build and deployment`
3. Source 选择 `GitHub Actions`

之后每次 push 到 `main` 都会自动构建并部署。

Vite 的 `base` 已设置为：

```js
base: "/MSCI/"
```

所以 GitHub Pages 路径会适配 `https://sduckyduck.github.io/MSCI/`。

## 国服 Banner

国服模式会优先尝试这些图片路径：

```text
/public/assets/msci-class-heroes-cn.png
/public/assets/msci-class-heroes-china.png
/public/assets/msci-class-heroes-pirate.png
/public/assets/msci-class-heroes-5jobs.png
/public/assets/msci-class-heroes-5classes.png
/public/assets/msci-class-heroes-5.png
```

如果这些图片不存在，会自动 fallback 到原来的 `/public/assets/msci-class-heroes.png`，不会卡死页面。

## 后续可加功能

- 把题库管理 JSON 化
- 中英文切换
- 把结果接到你的主攻略书工具里
- 更完整的海盗装备池自动映射
- 按国服 / 国际服分别导出题库和结果卡模板
