# Patchright 深度解析：让自动化浏览器"隐身"的秘密武器（2026 更新版）

> 本文基于 [Patchright 官方仓库](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright) 与 [Python 包](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-python) 的最新文档整理，并在 [掘金原文](https://juejin.cn/post/7631506248647868457) 的基础上做了勘误与用法更新。
>
> ⚠️ 免责声明：官方仓库明确声明 **仅供学习研究**，请勿用于违反目标网站条款或法律法规的用途，一切风险自负。

---

## 一、为什么普通 Playwright 会被检测到？

用 Playwright（或 Selenium）控制浏览器时，网站的反爬 / 风控系统有很多方式识别出"这不是真人在操作"。这些识别点业界称为**自动化特征（Automation Leaks）**。

### 浏览器自动化的"原罪"

| 检测维度 | 正常用户浏览器 | Playwright 控制的浏览器 |
| --- | --- | --- |
| `navigator.webdriver` | `undefined` | `true` ← 直接暴露 |
| CDP 协议 | 无 `Runtime.enable` | 存在 `Runtime.enable` 调用 ← 协议层泄露 |
| 命令行参数 | 正常 | `--enable-automation` ← Flag 泄露 |
| Console 行为 | 正常 | `Console.enable` 激活 ← 协议泄露 |
| Shadow DOM | 正常访问 | 特殊方式访问 Closed Shadow Root ← 行为泄露 |

以最典型的 `navigator.webdriver` 为例，在控制台跑一行 JS 即可判断浏览器是否被自动化控制：

```js
// 正常浏览器：undefined
// Playwright 控制的浏览器：true
console.log(navigator.webdriver)
```

各大平台的风控系统正是利用这些特征来识别并封锁自动化脚本。

---

## 二、技术演进史：从 Selenium 到 Patchright

```
时间线
│
├── 早期  Selenium + ChromeDriver
│         └─ webdriver 特征明显，极易被检测
│
├── 2020  Playwright 发布（微软）
│         └─ 更强大，但同样有自动化特征
│
├── 2021  puppeteer-extra + stealth 插件（JS 生态）
│         └─ 通过注入 JS 脚本绕过部分检测（stealth.min.js）
│
├── 2022  undetected-chromedriver
│         └─ 针对 Selenium，修改 Chrome 二进制
│
├── 2023  playwright-stealth（Python 社区方案）
│         └─ 注入 stealth JS，治标不治本
│
└── 2024  Patchright 诞生 ⭐
          └─ 在源码 / 驱动层 patch Playwright 本身
          └─ 根治协议层泄露，而非表面打补丁
```

Patchright 的不同之处在于：它不是在 Playwright 外面套壳，而是直接修改 Playwright 驱动的内部实现，从根本上消除自动化特征。它以 **drop-in replacement（直接替换）** 的形式提供，切换成本几乎为零。

> 📌 **重要限制**：Patchright **只 patch Chromium 系浏览器**，Firefox 和 WebKit 不支持。

---

## 三、Patchright 核心补丁原理详解

### 补丁 1：消除 Runtime.enable 泄露（最关键）

这是 Patchright 最核心、最有价值的补丁。

**背景**：Playwright 通过 Chrome DevTools Protocol（CDP）控制浏览器。执行 JavaScript 时，Playwright 默认会调用 [`Runtime.enable`](https://vanilla.aslushnikov.com/?Runtime.enable) 来启用 JS 运行时，而这个调用本身就是可被检测的特征。

```
普通 Playwright 执行 JS：
─────────────────────────────────────
CDP → Runtime.enable()        ← 网站可以检测到！
CDP → Runtime.evaluate(...)   ← 执行 JS

Patchright 执行 JS：
─────────────────────────────────────
CDP → 在（隔离的）ExecutionContext 中执行 JS   ← 无需 Runtime.enable
                                              ← 检测不到异常调用
```

比喻：普通做法是走会被门卫记录的正门，Patchright 则从一个合法但不被监控的侧门进入。

### 补丁 2：消除 Console.enable 泄露

Playwright 默认启用浏览器 Console API 来捕获输出，而 [`Console.enable`](https://vanilla.aslushnikov.com/?Console.enable) 这个 CDP 调用同样是可检测特征。

**Patchright 的解决方案：直接禁用 Console API。**

- 代价：Patchright 控制的浏览器中，`console.log()` 不会向 Playwright 侧回传任何内容。
- 好处：`Console.enable` 特征消失，更难被检测。

需要调试输出时，可改用网络请求或 JS logger：

```js
// 在 page.evaluate 里用 fetch 传递调试信息
fetch('/debug?msg=' + encodeURIComponent('hello from browser'))
```

### 补丁 3：修复命令行 Flag 泄露

Playwright 启动 Chrome 时会加入很多"自动化专用"参数，这些参数本身就是特征。Patchright 对默认参数做了如下调整：

| 操作 | 参数 | 目的 |
| --- | --- | --- |
| ✅ 添加 | `--disable-blink-features=AutomationControlled` | 隐藏 `navigator.webdriver` |
| ❌ 移除 | `--enable-automation` | 避免 `navigator.webdriver` 检测 |
| ❌ 移除 | `--disable-popup-blocking` | 避免弹窗崩溃 |
| ❌ 移除 | `--disable-component-update` | 避免被识别为"隐身驱动" |
| ❌ 移除 | `--disable-default-apps` | 启用默认应用 |
| ❌ 移除 | `--disable-extensions` | 允许正常使用扩展 |

### 补丁 4：支持 Closed Shadow Root 访问（含 XPath）

现代 Web 组件大量使用 Shadow DOM，`mode: 'closed'` 的完全封闭组件普通 Playwright 无法直接操作。

Patchright 对此做了特殊处理，用普通 `page.locator()` 即可穿透 Closed Shadow Root，无需任何特殊写法：

```py
button = page.locator('custom-component >> button.submit')
await button.click()  # 即使 button 在 closed shadow root 里也能用
```

> 🆕 **更新**：Patchright 现已支持 **在 Closed Shadow Root 中使用 XPath**（原文发布时尚未提及）。

### 补丁 5：General Leaks（通用泄露）

Patchright 还修复了 Playwright 代码库中的一些通用泄露点，主要是粗糙的默认配置和明显的检测点。

---

## 四、Patchright vs Playwright：对比一览

| 特性 | Playwright | Patchright |
| --- | --- | --- |
| `Runtime.enable` 调用 | 有（可被检测） | 无（已消除） |
| `Console.enable` 调用 | 有（可被检测） | 无（已禁用） |
| `navigator.webdriver` | `true`（暴露） | `undefined`（隐藏） |
| `--enable-automation` | 存在（暴露） | 已移除 |
| Closed Shadow Root | 无法直接访问 | 透明支持（含 XPath） |
| API 兼容性 | 原版 | 完全兼容（drop-in） |
| 支持的浏览器 | Chromium / Firefox / WebKit | 仅 Chromium 系 |
| `console.log()` 回传 | 正常工作 | 不工作（已禁用） |
| 执行上下文选择 | — | 可选 Main / Isolated（`isolated_context`） |
| 通过 Cloudflare / Datadome / Kasada | ❌ | ✅ |
| 通过 fingerprint.com / CreepJS | ❌ | ✅（配合正确设置） |

---

## 五、安装与快速上手

### 安装

```bash
# 安装 Patchright（PyPI）
pip install patchright

# 安装 Chromium 驱动（标准流程）
patchright install chromium

# 可选：安装真实 Chrome（官方推荐配合 channel="chrome" 使用）
patchright install chrome
```

> 版本号与 Playwright 保持一致（如 `1.x.y`），Playwright 每发新版本，Patchright 都会跟进打补丁。生产环境建议**锁定版本**，升级时留意兼容性。

### 最小示例（同步 API）

```py
# 只需把 import 换成 patchright，其余与 Playwright 完全一致
from patchright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://playwright.dev')
    page.screenshot(path=f'example-{p.chromium.name}.png')
    browser.close()
```

### 最小示例（异步 API）

```py
import asyncio
from patchright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://playwright.dev')
        await page.screenshot(path=f'example-{p.chromium.name}.png')
        await browser.close()

asyncio.run(main())
```

---

## 六、官方最佳实践：真实 Chrome + 不注入指纹

> ✅ 这是官方 README 给出的"完全不可检测"配置。**核心要点：使用真实 Chrome、持久化上下文、有头模式，并且不要手动伪造任何指纹。**

```py
import asyncio
from patchright.async_api import async_playwright

async def stealth_browser_example():
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir="./user_data",  # 持久化用户数据（更像真人）
            channel="chrome",              # 使用本地真实 Chrome，而非内置 Chromium
            headless=False,                # 有头模式特征更少，官方推荐
            no_viewport=True,              # 不固定视口大小（固定尺寸是指纹特征）
            # ⚠️ 不要传 user_agent
            # ⚠️ 不要传自定义 headers
        )
        page = await context.new_page()
        await page.goto("https://bot.sannysoft.com/")
        webdriver = await page.evaluate("navigator.webdriver")
        print(f"navigator.webdriver = {webdriver}")  # 期望：None
        await page.screenshot(path="result.png")
        await context.close()

asyncio.run(stealth_browser_example())
```

### 为什么推荐 `channel="chrome"` 而非内置 Chromium？

真实 Google Chrome 拥有完整的证书、编解码器、字体、组件等浏览器特征；Patchright 内置的 Chromium 是精简版，缺少这些"正常浏览器应有"的特征，反而更容易被识别。

```py
# 不推荐：内置 Chromium，特征更少
browser = await p.chromium.launch(headless=True)

# 推荐：使用本地真实 Chrome
browser = await p.chromium.launch(channel="chrome")

# 最推荐：持久化 Context + 真实 Chrome + 有头
context = await p.chromium.launch_persistent_context(
    user_data_dir="./profile", channel="chrome",
    headless=False, no_viewport=True,
)
```

> 🔧 **勘误（重要）**：一些老教程（含掘金原文）建议在 Patchright 之上再叠加 `stealth.min.js` 做"双重防护"。但官方最佳实践的标题恰恰是 **"use Chrome without Fingerprint Injection（不注入指纹）"**，并明确要求**不要手动伪造 UA / headers / 指纹**。因为 Patchright 已在协议层解决问题，额外注入 JS 指纹反而可能引入**新的、不一致的特征**，弄巧成拙。若你确实要用某些历史项目里的 stealth 脚本，应当把它视为可选的、需要自行验证是否有反作用的补充，而**不是必须项**。

---

## 七、扩展 API：选择执行上下文（isolated_context）

> 🆕 这是官方在原文发布后**新增并已上线**的能力（对应 TODO 中"Implement Option to choose Execution Context"）。

为了不触发 `Runtime.enable`，Patchright 默认在**隔离上下文（Isolated ExecutionContext）** 中执行 JS。但隔离上下文访问不到页面主世界（Main world）里挂载的变量（例如页面自身定义的 `window.xxx`）。此时可以通过 `isolated_context=False` 切回主世界执行：

```py
# 默认在隔离上下文执行（更隐蔽，但访问不到主世界变量）
await page.evaluate("navigator.webdriver")

# 需要访问页面主世界变量时，显式切到 Main world
result = await page.evaluate(
    "window.fpPromise.then(fp => fp.get())",
    isolated_context=False,   # 关键参数
)
```

支持该参数的方法：`Page.evaluate` / `Frame.evaluate` / `Locator.evaluate` / `Worker.evaluate` / `JSHandle.evaluate`，以及对应的 `evaluate_handle` 和 `Locator.evaluate_all`。参数默认值为 `True`（隔离上下文）。

> 说明：掘金原文示例里用默认（隔离）上下文去读取 `window.fpPromise`，实际会因为主世界变量不可见而失败——正确做法是加上 `isolated_context=False`。

---

## 八、实战：Cookie 持久化登录（以视频上传类项目为例）

```py
import asyncio, json
from pathlib import Path
from patchright.async_api import async_playwright

async def save_cookies(context, cookie_file: str):
    cookies = await context.cookies()
    Path(cookie_file).parent.mkdir(parents=True, exist_ok=True)
    with open(cookie_file, "w", encoding="utf-8") as f:
        json.dump(cookies, f, ensure_ascii=False, indent=2)

async def load_cookies(context, cookie_file: str) -> bool:
    if not Path(cookie_file).exists():
        return False
    with open(cookie_file, "r", encoding="utf-8") as f:
        await context.add_cookies(json.load(f))
    return True

async def upload_with_saved_cookie(cookie_file: str):
    async with async_playwright() as p:
        # 推荐直接用持久化上下文，天然复用登录态，无需手动搬运 Cookie
        context = await p.chromium.launch_persistent_context(
            user_data_dir="./profile", channel="chrome",
            headless=False, no_viewport=True,
        )
        # 若仍需从文件恢复 Cookie：
        if not await load_cookies(context, cookie_file):
            raise RuntimeError("Cookie 文件不存在，请先登录")

        page = await context.new_page()
        await page.goto("https://creator.douyin.com/")
        await page.wait_for_timeout(2000)
        if "login" in page.url:
            raise RuntimeError("Cookie 已失效，需要重新登录")
        # ... 后续上传操作
        await context.close()
```

> 💡 建议：既然官方最佳实践本就推荐 `launch_persistent_context`，登录态会直接落在 `user_data_dir` 里，很多场景下**不必再手动导出 / 导入 Cookie**，直接复用 profile 更简单也更"像真人"。

---

## 九、隐身检测能力（官方声明通过项）

在正确配置下，Patchright 被官方认为**目前不可检测**，可通过：

| 检测目标 | 结果 | 备注 |
| --- | --- | --- |
| Brotector | ✅ | 需配合 [CDP-Patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches/) |
| Cloudflare | ✅ | |
| Kasada | ✅ | |
| Akamai | ✅ | |
| Shape / F5 | ✅ | |
| Bet365 | ✅ | |
| Datadome | ✅ | |
| Fingerprint.com | ✅ | |
| CreepJS | ✅ | |
| Sannysoft | ✅ | |
| Incolumitas | ✅ | |
| IPHey | ✅ | |
| Browserscan | ✅ | |
| Pixelscan | ✅ | |

> 注意：能否真正通过，除 Patchright 本身外还取决于 **IP 质量、代理、行为模拟、账号历史**等因素。Patchright 只负责消除浏览器层的自动化特征。

---

## 十、已知局限与常见问题

### InitScript（init 脚本）的实现方式与局限

为了在不使用 `Runtime.enable` 的前提下支持 init 脚本，Patchright 改用 **Playwright Route** 把 JS 注入到 HTML 请求中。由此带来两点已知问题：

- **可能与你自己的 Route 逻辑相互影响**：Patchright 的 init 脚本不会引入"普通 Playwright Route 本身不会产生"的额外 bug，但如果你重度使用 `page.route`，需留意交互。
- **理论上可被时序攻击（Timing Attack）检测**：官方认为目前没有反爬在检测这种时序攻击，风险较低。

### 常见问题

**Q：`console.log` 为什么不工作了？**
这是禁用 Console API 的副作用，属有意设计（`Console.enable` 是检测点）。调试改用网络请求或 JS logger。

**Q：无头模式（headless=True）还会被检测吗？**
无头模式本身存在额外特征。Patchright 尽量抹平差异，但官方建议**条件允许时优先用有头模式**。

**Q：Patchright 会一直有效吗？**
这是持续的猫鼠游戏。版本号跟随 Playwright，官方在每次发布后都会跑 Playwright 测试套件。它能通过**大多数**（但非全部）测试，个别 bug 被认为无法解决或不影响常规使用，详见官方 [Issue #30](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright/issues/30)。

**Q：可以用在 Node.js / .NET 上吗？**
可以。除 Python 包外，官方还提供 [NodeJS 包](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-nodejs)，社区提供 [.NET 包](https://github.com/DevEnterpriseSoftware/patchright-dotnet/)。Java 版仍在 TODO 中。

---

## 十一、一句话总结

**Patchright = Playwright 的隐身版**。它从 **CDP 协议层**（消除 `Runtime.enable` / `Console.enable`）、**启动参数层**（清理危险 Flag）、**执行上下文层**（隔离 / 可选主世界）三个维度同时入手，让自动化浏览器在各大平台风控眼中尽可能接近真实人类用户。

用好它的黄金法则只有一条：**用真实 Chrome + 持久化上下文 + 有头模式，并且不要画蛇添足地手动注入指纹。**

---

## 参考链接

- Patchright 主仓库（驱动）：<https://github.com/Kaliiiiiiiiii-Vinyzu/patchright>
- Patchright Python 包：<https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-python>
- Patchright NodeJS 包：<https://github.com/Kaliiiiiiiiii-Vinyzu/patchright-nodejs>
- Playwright 官方文档：<https://playwright.dev/python/docs/intro>
- 掘金原文：<https://juejin.cn/post/7631506248647868457>
