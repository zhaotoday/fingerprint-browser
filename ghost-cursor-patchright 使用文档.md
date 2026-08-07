# ghost-cursor-patchright 使用文档

> 在 Patchright / Playwright 中像真人一样移动鼠标，或在任意 2D 平面上生成拟真的移动轨迹。

- **npm 包地址**：<https://www.npmjs.com/package/ghost-cursor-patchright>
- **当前版本**：1.0.2
- **协议**：ISC
- **仓库**：<https://github.com/Xetera/ghost-cursor>
- **作者**：Xetera

---

## 一、简介

`ghost-cursor-patchright` 用于在 **Patchright**（Playwright 的反检测分支）中生成拟真的、类人化的鼠标移动数据，可以在坐标之间移动，也可以在页面元素之间导航。

它通过模拟真人行为（鼠标移动、机械式滚动、键盘打字）来帮助绕过机器人检测系统（bot detection）。

### 核心依赖

| 依赖 | 版本 |
| --- | --- |
| `bezier-js` | ^6.1.4 |
| `@types/bezier-js` | 4 |
| `debug` | ^4.4.3 |

### Peer 依赖

| 依赖 | 版本 |
| --- | --- |
| `patchright` | >=1.0.0 |

---

## 二、核心特性

### 1. 类人鼠标移动（贝塞尔曲线 + 费茨定律）

- **有机路径生成**：不使用直线轨迹或人工噪声，而是用三次贝塞尔曲线（cubic Bezier curves）在坐标间计算自然的曲线路径。
- **费茨定律（Fitts's Law）集成**：根据目标元素的大小和距离动态调整速度。目标越小或越远，移动越慢、越谨慎，模拟人的运动控制。
- **智能过冲与再调整（Overshooting）**：对于较远的移动，光标可能会过冲或稍微偏离目标，随后做一个小的修正动作落到元素上，模拟人手的惯性。
- **随机化坐标**：在悬停或点击元素时，会在元素边界内选取一个随机点（可通过 padding 调整），而不是总是点击正中心。

### 2. 自然的键盘输入模拟

- **QWERTY 布局错字模拟**：逐字符输入。基于 QWERTY 键盘布局的邻近映射，偶尔会敲到相邻键（例如把 `e` 打成 `w`）。
- **自我纠正（退格）**：出现错字时，打字会暂停片刻（模拟人"哎呀"的瞬间），按退格删除错字，然后继续输入正确文本。
- **随机化按键延迟**：通过随机化按键之间的延迟（如平均延迟加标准差波动）来模拟可变的打字速度。

### 3. 弹性的浏览器集成

- **CDP 会话自动恢复**：在 frame 或 page 切换期间，自动监控、重建并重新附加 Chrome DevTools Protocol（CDP）会话，避免典型的"detached session"崩溃。
- **机械式滚轮滚动**：通过在鼠标滚轮 tick 之间加入随机的 `5ms`~`15ms` 延迟步进来模拟有机的滚轮滚动，而非瞬间跳转。
- **通用选择器**：原生支持标准 CSS 选择器和复杂的 XPath 表达式。

---

## 三、安装

```sh
# 使用 yarn
yarn add ghost-cursor-patchright

# 使用 npm
npm install ghost-cursor-patchright
```

> 注意：`patchright` 是 peer 依赖，需要另外安装（`npm install patchright`）。

---

## 四、快速开始

### 1. 仅生成移动轨迹数据（无需启动浏览器）

可以在 2D 平面上生成类人的坐标序列，而不启动浏览器。

```js
import { path } from "ghost-cursor-patchright"

const from = { x: 100, y: 100 }
const to = { x: 600, y: 700 }

const route = path(from, to)
/**
 * 返回：
 * [
 *   { x: 100, y: 100 },
 *   { x: 108.75, y: 102.83 },
 *   ...
 * ]
 */
```

### 2. 浏览器导航与交互

用拟真的移动来控制 Patchright 浏览器会话。

```js
import { GhostCursor } from "ghost-cursor-patchright"
import { chromium } from "patchright"

const run = async (url) => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  // 初始化光标，并开启可视化调试辅助
  const cursor = await GhostCursor.create(page, { visible: true })

  await page.goto(url)

  // 将鼠标移动到元素并点击
  await cursor.click("#sign-up-button")

  // 逐字符输入文本，10% 的错字率
  await cursor.type("#email-input", "user@example.com", { typoRatio: 0.1 })
}
```

---

## 五、API 参考

### 创建方法

#### `GhostCursor.create(page: Page, options?: GhostCursorOptions)`

创建一个包裹 Page 会话的 ghost 光标。

##### `GhostCursorOptions` 配置

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `start` | `Vector` | `{ x: 0, y: 0 }` | 光标的起始坐标。 |
| `performRandomMoves` | `boolean` | `false` | 空闲时主动触发随机移动。 |
| `visible` | `boolean` | `false` | 在浏览器上渲染一个红点表示光标位置。 |
| `defaultOptions` | `DefaultOptions` | `{}` | 为 `click`、`move`、`type` 等配置全局默认项。 |

---

### 核心实例方法

#### `click(selector?: string | ElementHandle, options?: ClickOptions)`

将鼠标移动到指定选择器或元素句柄并点击。

##### `ClickOptions`（继承自 `MoveOptions` 和 `ScrollIntoViewOptions`）

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `hesitate` | `number` | `0` | 点击前的延迟（毫秒）。 |
| `waitForClick` | `number` | `0` | mousedown 与 mouseup 之间的延迟（点击速度，毫秒）。 |
| `moveDelay` | `number` | `2000` | 移动后、点击前的延迟（毫秒）。 |
| `button` | `'left' \| 'right' \| 'middle'` | `'left'` | 要按下的鼠标按键。 |
| `clickCount` | `number` | `1` | 点击次数。 |

#### `move(selector: string | ElementHandle, options?: MoveOptions)`

平滑地把光标移动到目标元素。

##### `MoveOptions`（继承自 `ScrollIntoViewOptions`）

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `paddingPercentage` | `number` | `0` | 用于约束目标坐标的内边距百分比。`100` 表示始终瞄准绝对中心。 |
| `destination` | `Vector` | `undefined` | 绝对坐标覆盖，跳过随机计算。 |
| `moveDelay` | `number` | `0` | 移动结束后的延迟（毫秒）。 |
| `randomizeMoveDelay` | `boolean` | `true` | 将 `moveDelay` 在 `0` 到设定值之间随机化。 |
| `moveSpeed` | `number` | `random` | 鼠标移动的速度因子。 |
| `overshootThreshold` | `number` | `500` | 超过该距离时触发过冲模拟。 |

#### `type(selector: string | ElementHandle, text: string, options?: TypeOptions)`

点击元素以聚焦并输入文本。

##### `TypeOptions`

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `delay` | `number` | `80` | 按键之间的平均延迟（毫秒）。 |
| `randomizeDelay` | `boolean` | `true` | 随机化打字速度以模拟人类节奏。 |
| `typoRatio` | `number` | `0.0` | 发生 QWERTY 邻键错字的概率（`0.0`~`1.0`）。 |

#### `scrollIntoView(selector: string | ElementHandle, options?: ScrollIntoViewOptions)`

若目标元素不在视口内，则平滑滚动使其进入视口。

##### `ScrollIntoViewOptions`

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `scrollSpeed` | `number` | `100` | 滚动速度（0~100）。`100` 表示瞬间滚动。 |
| `scrollDelay` | `number` | `200` | 滚动完成后的延迟。 |
| `inViewportMargin` | `number` | `0` | 校验元素可见性时的额外像素边距。 |

#### `scroll(delta: Partial, options?: ScrollOptions)`

按指定的 `x` 和 `y` 距离偏移滚动视口。

#### `scrollTo(destination: Partial | 'top' | 'bottom' | 'left' | 'right', options?: ScrollOptions)`

将视口滚动到绝对目标位置或某个视口边缘。

#### `getLocation()`

返回当前光标坐标（`{ x: number, y: number }`）。

---

## 六、调试日志

通过设置环境变量开启完整的调试日志：

```sh
# Bash / Terminal
DEBUG="ghost-cursor:*"

# Windows PowerShell
$env:DEBUG = "ghost-cursor:*"
```

---

## 七、使用建议与技巧

- **反检测优先**：将 `typoRatio` 设为较小值（如 `0.05`~`0.1`），配合默认的随机延迟，可以更真实地模拟真人输入。
- **可视化调试**：开发阶段将 `create` 的 `visible` 设为 `true`，可以直观看到红点光标的运动轨迹。
- **谨慎瞄准中心**：默认会在元素范围内随机取点，若需要点击精确中心，可将 `paddingPercentage` 设为 `100`。
- **较远的移动**：`overshootThreshold`（默认 `500`）控制过冲行为，超过该距离才会触发"过冲 + 修正"，可根据页面布局调节。
- **滚动节奏**：`scrollSpeed` 越低滚动越"机械"越拟真；设为 `100` 则为瞬间滚动，会失去拟人效果。

---

## 八、许可证

基于 [ISC License](https://opensource.org/licenses/ISC) 发布。
