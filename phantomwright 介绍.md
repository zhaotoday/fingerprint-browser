# phantomwright 详解与使用指南

> Undetected browser automation SDK — 隐身版 Playwright + Cloudflare 破解 + 拟人化模拟

- **当前版本**：1.59.3
- **许可协议**：MIT
- **主页**：https://github.com/gim-home/phantomwright-ts#readme
- **仓库**：https://github.com/gim-home/phantomwright-ts.git
- **npm**：https://www.npmjs.com/package/phantomwright
- **周下载量**：约 24,450
- **依赖**：`phantomwright-driver`（一个经过隐身补丁改造的 Playwright 分支）

---

## 一、phantomwright 是什么

`phantomwright` 是一个**反检测（Undetected）的浏览器自动化 SDK**。它在 [`phantomwright-driver`](https://www.npmjs.com/package/phantomwright-driver)（一个打过隐身补丁的 Playwright 分支）之上进行封装，额外提供了三大能力：

- 👤 **拟人化模拟（Human simulation）**
  - 基于**贝塞尔曲线（Bézier curve）** 的鼠标移动轨迹
  - 自然的打字延迟
  - 空闲时的微小鼠标移动（idle micro-movements）
- 🛡️ **Cloudflare 破解（Cloudflare solving）**
  - 自动检测并解决 Cloudflare 的 **Turnstile** 和 **Interstitial** 验证挑战
- 🎭 **完整的 Playwright / Patchright API**
  - 可作为**直接替换（drop-in replacement）**，兼容你现有的 Playwright 代码

一句话概括：它的目标是让自动化脚本在访问带有反爬 / 反自动化检测（如 Cloudflare）的网站时，尽可能表现得像真人，从而降低被识别和拦截的概率。

### 关键词标签
`playwright` · `phantomwright` · `automation` · `browser` · `stealth` · `captcha` · `undetected` · `anti-detection` · `cloudflare`

---

## 二、安装

```bash
npm install phantomwright
npx phantomwright-driver install --with-deps chromium
```

第一条命令安装 SDK 本体；第二条命令通过驱动下载并安装带依赖的 Chromium 浏览器（与 Playwright 的浏览器安装机制类似）。

---

## 三、快速上手

### ESM（import 写法）

```typescript
import { chromium } from 'phantomwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://example.com');
await browser.close();
```

### CommonJS（require 写法）

```javascript
const { chromium } = require('phantomwright');
```

> 用法与原生 Playwright 几乎完全一致，因此迁移成本极低。

---

## 四、拟人化模拟（Human simulation）

### 4.1 UserSimulator（高级封装类）

`UserSimulator` 用拟人化的操作替代原生 Playwright 的原始操作（点击、输入等）。

```typescript
import { chromium, UserSimulator } from 'phantomwright';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('https://example.com/login');

const sim = await UserSimulator.create(page, { visualizeMouse: true });

// 通过贝塞尔曲线轨迹进行拟人化点击
await sim.click(page.locator('button#login'));

// 带随机延迟的自然输入
await sim.type(page.locator('input[name="email"]'), 'user@example.com');
await sim.type(page.locator('input[name="password"]'), 's3cr3t');

await sim.click(page.locator('button[type="submit"]'));
await browser.close();
```

- `visualizeMouse: true`：在页面中可视化鼠标轨迹，便于调试观察。

### 4.2 浏览行为模拟

```typescript
const sim = await UserSimulator.create(page);

// 带自动冷却行为的导航
await sim.navigateToUrl('https://example.com');

// 模拟随意浏览：滚动 + 空闲移动
await sim.simulateBrowsing(3000);   // 持续 3 秒

// 模拟阅读：更慢的滚动 + 停顿
await sim.scrollAndRead(2000);
```

### 4.3 底层工具函数（Low-level utilities）

```typescript
import { waitHuman, moveToTarget, scrollHuman } from 'phantomwright';

// 基于三角分布的拟人化停顿
await waitHuman(500, 1000);         // 500–1000 毫秒

// 通过贝塞尔曲线移动鼠标
await moveToTarget(page.mouse, 500, 300, { currentX: 100, currentY: 100 });

// 小步幅的拟人化滚动
await scrollHuman(page, 200);       // 向下滚动 200 像素
```

---

## 五、Cloudflare 挑战破解

自动检测并破解 Cloudflare 的 **Turnstile** 和 **Interstitial** 挑战。

```typescript
import { chromium, CloudflareSolver } from 'phantomwright';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();

const solver = new CloudflareSolver(context, {
  maxAttempts: 3,
  attemptDelay: 5,
  logCallback: (log) => console.log(JSON.parse(log)),
});

// 必须在导航之前调用 start()
solver.start();

const page = await context.newPage();
await page.goto('https://protected-site.com');

await browser.close();
```

> ⚠️ **注意**：必须在页面导航（`page.goto`）**之前**调用 `solver.start()`，破解器才能在挑战出现时自动介入。

---

## 六、API 参考

### 6.1 Playwright / phantomwright-driver 再导出

完整的 [Playwright API](https://playwright.dev/docs/api/class-playwright) 都可直接使用：

```
chromium · firefox · webkit · devices · selectors · request · errors · ...
```

### 6.2 UserSimulator

| 方法 | 说明 |
|---|---|
| `UserSimulator.create(page, opts?)` | 创建一个模拟器实例 |
| `sim.click(locator)` | 基于贝塞尔曲线鼠标路径的拟人化点击 |
| `sim.type(locator, text)` | 带自然延迟的拟人化输入 |
| `sim.navigateToUrl(url)` | 带拟人化冷却的导航 |
| `sim.simulateBrowsing(ms)` | 在 N 毫秒内进行滚动 + 空闲移动 |
| `sim.scrollAndRead(ms)` | 更慢的滚动，模拟阅读 |

### 6.3 底层导出（Low-level exports）

| 导出项 | 说明 |
|---|---|
| `waitHuman(min, max?)` | 基于三角分布的拟人化停顿 |
| `moveToTarget(mouse, x, y, opts)` | 通过贝塞尔曲线移动鼠标 |
| `moveToBox(mouse, box, opts)` | 移动到某个包围盒（bounding box）的中心 |
| `scrollHuman(page, deltaY)` | 小步幅的拟人化滚动 |
| `bringIntoView(page, box, viewport)` | 将元素滚动进视口 |
| `idleHuman(mouse, page, opts)` | 微小的空闲鼠标移动 |
| `VISUAL_CURSOR_JS` | 用于浏览器内鼠标可视化的脚本 |

### 6.4 Cloudflare 破解相关导出

| 导出项 | 说明 |
|---|---|
| `CloudflareSolver` | 自动破解 Cloudflare Turnstile / Interstitial |
| `CloudflareSolverOptions` | 选项：`maxAttempts`、`attemptDelay`、`logCallback` |
| `ChallengeType` | 枚举：`TURNSTILE` 或 `INTERSTITIAL` |
| `detectCloudflareChallenge(page, type)` | 检测指定类型的挑战 |
| `detectCfChallengeType(page)` | 检测当前存在的是哪种挑战类型 |
| `SolveReport` | 破解结果的 JSON 日志结构 |

---

## 七、TypeScript 支持

- 内置完整的 TypeScript 类型声明。
- 同时支持 ESM 与 CommonJS：
  - `import { chromium } from 'phantomwright'`（ESM）
  - `const { chromium } = require('phantomwright')`（CJS）

---

## 八、版本历史（部分）

| 版本 | 发布时间 |
|---|---|
| 1.58.0 | 2026-01-27 |
| 1.57.1 | 2026-01-29 |
| 1.57.5 | 2026-02-06 |
| 1.58.3 | 2026-03-12 |
| 1.59.1 | 2026-04-21 |
| 1.59.3 | 2026-05-18 |

---

## 九、适用场景与说明

- **适用场景**：需要绕过反自动化检测（尤其是 Cloudflare）的爬虫 / 自动化任务、需要拟人化交互以降低被识别概率的测试与数据采集。
- **优势**：几乎零迁移成本（兼容 Playwright API）、内置拟人化与 Cloudflare 破解能力、TS 类型完善。
- **合规提醒**：反检测类工具应在遵守目标网站服务条款、相关法律法规及道德规范的前提下使用，避免用于违规抓取或攻击行为。

---

## 许可协议

[MIT](https://opensource.org/licenses/MIT)

> 文档整理自 npm 官方页面：https://www.npmjs.com/package/phantomwright
