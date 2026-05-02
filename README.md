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

- 一转测试：战士 / 法师 / 飞侠 / 弓箭手
- 二转测试：剑客 / 准骑士 / 枪战士 / 冰雷法师 / 火毒法师 / 牧师 / 刺客 / 侠客 / 猎人 / 弩弓手
- 隐藏维度：战斗距离、攻击体系、资源投入、开荒效率、输出风格、社交定位、操作复杂度、后期耐心
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
│  ├─ styles.css
│  └─ model/
│     └─ msciModel.js
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

## 后续可加功能

- 海盗番外测试
- 分享结果截图
- 职业结果卡片导出 PNG
- 冒险岛像素 UI / 攻略书 UI 皮肤
- 题库管理 JSON 化
- 中英文切换
- 把结果接到你的主攻略书工具里
