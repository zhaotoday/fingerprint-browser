#!/usr/bin/env python3
"""Generate the static homepage (index.html) from README.md.

Every resource link in the README is rendered as server-side HTML so that the
page stays crawlable; JavaScript only adds search, filtering and scroll-spy.

Usage: python scripts/build.py
"""

from __future__ import annotations

import html
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / "README.md"
SITE = ROOT / "site"
OUT_HTML = SITE / "index.html"
OUT_SITEMAP = SITE / "sitemap.xml"
OUT_ROBOTS = SITE / "robots.txt"

SITE_URL = "https://laj.cn/"
REPO = "zhaotoday/fingerprint-browser"
REPO_URL = f"https://github.com/{REPO}"
SITE_NAME = "指纹浏览器资源合集"
SITE_TAGLINE = "防关联浏览器选型与开源资源导航"
SITE_DESC_TEMPLATE = (
    "指纹浏览器（防关联浏览器）资源合集：收录 {vendors} 款国内外主流产品的套餐价格与适用场景，"
    "并整理 {oss} 个开源项目、自动化框架、代理 IP、指纹检测工具与技术文章，"
    "帮助跨境电商与开发者快速选型。"
)
KEYWORDS = (
    "指纹浏览器,指纹浏览器有哪些,跨境指纹浏览器,防关联浏览器,反检测浏览器,"
    "antidetect browser,多账号管理,浏览器指纹,跨境电商浏览器,指纹浏览器推荐,"
    "AdsPower,Roxy浏览器,紫鸟浏览器,Multilogin,Camoufox,住宅代理,BrowserScan,跨境电商"
)


# ---------------------------------------------------------------------------
# README parsing
# ---------------------------------------------------------------------------

LINK_ITEM = re.compile(r"^-\s+\[(?P<name>.+?)\]\((?P<url>[^)]+)\)(?P<rest>.*)$")


@dataclass
class Item:
    name: str
    url: str
    desc_html: str = ""
    recommended: bool = False

    @property
    def domain(self) -> str:
        parts = urlparse(self.url)
        host = parts.netloc.lower()
        host = host[4:] if host.startswith("www.") else host
        # `github.com` alone cannot tell two same-named repos apart, so show owner/repo.
        if host == "github.com":
            segments = [p for p in parts.path.split("/") if p][:2]
            if len(segments) == 2:
                return "/".join(segments)
        return host


@dataclass
class Block:
    """One `#####` subsection (or the implicit subsection of a `####` section)."""

    title: str
    items: list[Item] = field(default_factory=list)


@dataclass
class Section:
    """One `####` section of the README."""

    title: str
    intro: str = ""
    blocks: list[Block] = field(default_factory=list)


def normalize_dashes(text: str) -> str:
    """Numeric ranges read better with plain hyphens across mixed CJK/Latin runs."""
    return text.replace("\u2014", "，").replace("\u2013", "-")


def md_inline_to_html(text: str) -> str:
    """Escape then re-apply the small subset of inline markdown the README uses."""
    out = html.escape(normalize_dashes(text), quote=False)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    out = re.sub(r"`(.+?)`", r"<code>\1</code>", out)
    return out


def parse_readme(text: str) -> list[Section]:
    sections: list[Section] = []
    section: Section | None = None
    block: Block | None = None

    for raw in text.splitlines():
        line = raw.rstrip()

        if line.startswith("##### "):
            if section is None:
                continue
            block = Block(title=line[6:].strip())
            section.blocks.append(block)
            continue

        if line.startswith("#### "):
            section = Section(title=line[5:].strip())
            sections.append(section)
            block = None
            continue

        if section is None:
            continue

        match = LINK_ITEM.match(line)
        if match:
            if block is None:
                block = Block(title="")
                section.blocks.append(block)
            rest = match.group("rest").strip()
            recommended = "⭐ 推荐" in rest
            rest = rest.replace("**⭐ 推荐**", "").replace("⭐ 推荐", "")
            rest = rest.lstrip("：: ").strip()
            block.items.append(
                Item(
                    name=normalize_dashes(match.group("name").strip()),
                    url=match.group("url").strip(),
                    desc_html=md_inline_to_html(rest),
                    recommended=recommended,
                )
            )
            continue

        if line.startswith(">") and section.intro == "":
            section.intro = md_inline_to_html(line.lstrip("> ").strip())

    # Drop duplicate URLs inside a block (the README repeats a few entries).
    for sec in sections:
        for blk in sec.blocks:
            seen: set[str] = set()
            unique: list[Item] = []
            for item in blk.items:
                if item.url in seen:
                    continue
                seen.add(item.url)
                unique.append(item)
            blk.items = unique

    return sections


# ---------------------------------------------------------------------------
# Grouping: README headings -> page sections
# ---------------------------------------------------------------------------


@dataclass
class Group:
    id: str
    label: str  # short label for the sidebar
    title: str  # section headline
    lead: str
    sources: list[str]  # README `####` headings, in order
    layout: str = "chips"  # vendor | chips | articles
    density: str = "md"  # lg | md | sm
    # Optional (label, [README headings]) regrouping. An empty label renders no
    # subheading, which keeps very small sections from looking half-empty.
    regroup: list[tuple[str, list[str]]] | None = None


GROUPS: list[Group] = [
    Group(
        id="browsers",
        label="指纹浏览器",
        title="主流指纹浏览器与套餐价格",
        lead="按国内、国际两类厂商整理，含定价区间、免费额度与适用场景。价格为公开参考价，以官网为准。",
        sources=["指纹浏览器"],
        layout="vendor",
    ),
    Group(
        id="cloud",
        label="云手机与云浏览器",
        title="云手机与云浏览器",
        lead="配合指纹浏览器做移动端环境隔离，或直接把浏览器跑在云端供 AI Agent 调用。",
        sources=["云手机", "浏览器"],
        density="lg",
        regroup=[("", ["云手机", "浏览器"])],
    ),
    Group(
        id="opensource",
        label="开源项目",
        title="开源项目",
        lead="从成品反检测浏览器、内核级 Chromium 定制，到自动化框架、指纹生成库与检测工具的完整开源图谱。",
        sources=["开源"],
        density="sm",
    ),
    Group(
        id="proxy",
        label="代理 IP",
        title="代理 IP 服务商",
        lead="住宅、静态住宅、移动与数据中心代理。指纹隔离要配合干净 IP 才有意义。",
        sources=["代理"],
        density="sm",
    ),
    Group(
        id="detect",
        label="检测与导航",
        title="指纹检测工具与资源导航",
        lead="配置完环境后先自测再上号，可以省掉大量试错成本。",
        sources=["检测网站", "资源导航"],
        density="lg",
        regroup=[("", ["检测网站", "资源导航"])],
    ),
    Group(
        id="docs",
        label="技术文档",
        title="技术文档与开发教程",
        lead="Chromium 源码、WebDriver、Puppeteer 与 W3C 指纹防护规范等一手资料。",
        sources=["网址"],
    ),
    Group(
        id="articles",
        label="文章",
        title="深度文章与实战笔记",
        lead="指纹原理拆解、内核魔改、反爬绕过与风控对抗的实战记录。",
        sources=["文章"],
        layout="articles",
    ),
    Group(
        id="media",
        label="视频与社区",
        title="视频课程与社区账号",
        lead="B 站、知乎上持续更新指纹浏览器与 Chromium 定制内容的作者与专栏。",
        sources=["视频", "B 站", "知乎"],
        regroup=[("视频课程", ["视频"]), ("社区账号与专栏", ["B 站", "知乎"])],
    ),
    Group(
        id="collections",
        label="同类合集",
        title="同类资源合集",
        lead="其他值得交叉参考的 awesome 列表与横向评测仓库。",
        sources=["资源集合"],
        density="lg",
    ),
    Group(
        id="plugins",
        label="浏览器插件",
        title="浏览器插件",
        lead="代理切换与 Cookie 管理，多账号日常运营的两个高频小工具。",
        sources=["插件"],
        density="lg",
    ),
]


# ---------------------------------------------------------------------------
# Rendering helpers
# ---------------------------------------------------------------------------

ICONS = {
    # Heroicons v2 (outline) — https://heroicons.com, MIT licensed
    "search": "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
    "external": "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
    "sun": "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    "moon": "M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
    "chevron": "M19.5 8.25l-7.5 7.5-7.5-7.5",
    "star": "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
    "close": "M6 18L18 6M6 6l12 12",
    "menu": "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
}

GITHUB_PATH = (
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 "
    "0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 "
    "17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 "
    "1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 "
    "1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 "
    "3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 "
    "3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 "
    "1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
)


def icon(name: str, cls: str = "") -> str:
    """Reference the sprite instead of inlining paths; icons repeat ~250 times."""
    return f'<svg class="icon {cls}" aria-hidden="true"><use href="#i-{name}"/></svg>'


def github_icon(cls: str = "") -> str:
    return f'<svg class="icon {cls}" aria-hidden="true"><use href="#i-github"/></svg>'


def icon_sprite() -> str:
    symbols = "".join(
        f'<symbol id="i-{name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        f'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'
        f'<path d="{path}"/></symbol>'
        for name, path in ICONS.items()
    )
    symbols += (
        '<symbol id="i-github" viewBox="0 0 24 24" fill="currentColor">'
        f'<path d="{GITHUB_PATH}"/></symbol>'
    )
    return f'<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">{symbols}</svg>'


def monogram(name: str) -> tuple[str, int]:
    """Return an initial glyph plus a deterministic hue, used as a brand mark."""
    letter = "#"
    for ch in name:
        if ch.isalnum():
            letter = ch.upper()
            break
    if unicodedata.east_asian_width(letter) in ("W", "F"):
        letter = letter  # keep the CJK glyph as-is
    hue = (sum(ord(c) * (i + 7) for i, c in enumerate(name)) * 37) % 360
    # Keep marks inside a cool indigo -> teal arc so they never fight the accent.
    hue = 200 + (hue % 70)
    return letter, hue


def format_count(value: int) -> str:
    return f"{value / 1000:.1f}k".replace(".0k", "k") if value >= 1000 else str(value)


def fetch_stars() -> str:
    """Bake the star count in at build time; main.js refreshes it in the browser."""
    import json
    import urllib.request

    try:
        request = urllib.request.Request(
            f"https://api.github.com/repos/{REPO}",
            headers={"User-Agent": "fingerprint-browser-site-build"},
        )
        with urllib.request.urlopen(request, timeout=8) as response:
            return format_count(json.load(response)["stargazers_count"])
    except Exception as error:  # offline builds should still succeed
        print(f"  ! star count unavailable ({error})")
        return ""


def slugify(value: str) -> str:
    out = re.sub(r"[^\w\u4e00-\u9fff]+", "-", value).strip("-").lower()
    return out or "item"


def search_key(item: Item) -> str:
    plain = re.sub(r"<[^>]+>", "", item.desc_html)
    return html.escape(f"{item.name} {item.domain} {plain}".lower(), quote=True)


def render_vendor(item: Item) -> str:
    letter, hue = monogram(item.name)
    badge = (
        f'<span class="badge badge--star">{icon("star")}推荐</span>'
        if item.recommended
        else ""
    )
    more = (
        '<button type="button" class="card__more" aria-expanded="false">'
        f'展开完整介绍{icon("chevron", "icon--xs")}</button>'
        if len(item.desc_html) > 150
        else ""
    )
    return f"""
        <article class="card card--vendor" data-search="{search_key(item)}">
          <div class="card__head">
            <span class="mark" style="--mark-h:{hue}" aria-hidden="true">{html.escape(letter)}</span>
            <div class="card__title">
              <h4><a href="{html.escape(item.url)}" target="_blank" rel="noopener nofollow">{html.escape(item.name)}</a></h4>
              <p class="card__domain">{html.escape(item.domain)}</p>
            </div>
            {badge}
          </div>
          <p class="card__desc">{item.desc_html}</p>
          <div class="card__foot">
            {more}
            <a class="card__visit" href="{html.escape(item.url)}" target="_blank" rel="noopener nofollow">
              访问官网{icon("external", "icon--xs")}
              <span class="sr-only">（{html.escape(item.name)}，新窗口打开）</span>
            </a>
          </div>
        </article>"""


def render_chip(item: Item) -> str:
    letter, hue = monogram(item.name)
    return f"""
        <a class="chip" href="{html.escape(item.url)}" target="_blank" rel="noopener nofollow" data-search="{search_key(item)}">
          <span class="mark mark--sm" style="--mark-h:{hue}" aria-hidden="true">{html.escape(letter)}</span>
          <span class="chip__body">
            <span class="chip__name">{html.escape(item.name)}</span>
            <span class="chip__domain">{html.escape(item.domain)}</span>
          </span>
          {icon("external", "icon--xs chip__go")}
        </a>"""


def render_article(item: Item, index: int) -> str:
    return f"""
        <li class="row" data-search="{search_key(item)}">
          <span class="row__index" aria-hidden="true">{index:02d}</span>
          <span class="row__body">
            <a class="row__link" href="{html.escape(item.url)}" target="_blank" rel="noopener nofollow">{html.escape(item.name)}</a>
            <span class="row__domain">{html.escape(item.domain)}</span>
          </span>
        </li>"""


def render_group(group: Group, sections: list[Section]) -> tuple[str, int]:
    picked = [s for name in group.sources for s in sections if s.title == name]
    total = sum(len(b.items) for s in picked for b in s.blocks)

    if group.regroup:
        by_title = {s.title: s for s in picked}
        blocks = [
            (
                label,
                [
                    item
                    for head in heads
                    if head in by_title
                    for blk in by_title[head].blocks
                    for item in blk.items
                ],
            )
            for label, heads in group.regroup
        ]
    else:
        multi_source = len(group.sources) > 1
        blocks = [
            (blk.title or (sec.title if multi_source else ""), blk.items)
            for sec in picked
            for blk in sec.blocks
        ]

    body: list[str] = []
    for heading, items in blocks:
        if heading:
            body.append(
                f'<h3 class="subhead" data-count="{len(items)}">{html.escape(heading)}</h3>'
            )
        if group.layout == "vendor":
            cards = "".join(render_vendor(i) for i in items)
            body.append(f'<div class="grid grid--vendor">{cards}</div>')
        elif group.layout == "articles":
            rows = "".join(render_article(i, n) for n, i in enumerate(items, start=1))
            body.append(f'<ol class="rows">{rows}</ol>')
        else:
            chips = "".join(render_chip(i) for i in items)
            body.append(f'<div class="grid grid--{group.density}">{chips}</div>')

    note = ""
    if group.id == "browsers":
        intro = next((s.intro for s in picked if s.intro), "")
        if intro:
            note = f'<p class="note">{intro}</p>'

    html_out = f"""
      <section class="section" id="{group.id}" aria-labelledby="{group.id}-title">
        <div class="section__head">
          <h2 id="{group.id}-title">{html.escape(group.title)}</h2>
          <p class="section__lead">{html.escape(group.lead)}</p>
          {note}
        </div>
        {''.join(body)}
        <p class="empty" hidden>该分类下没有匹配的资源。</p>
      </section>"""
    return html_out, total


# ---------------------------------------------------------------------------
# Page assembly
# ---------------------------------------------------------------------------

FAQS = [
    (
        "什么是指纹浏览器？",
        "指纹浏览器又称防关联浏览器，通过为每个账号隔离独立的浏览器指纹（Canvas、WebGL、字体、硬件等）、"
        "Cookies 与 IP 环境，让平台把多个账号识别为互不相关的真实用户，从而降低多账号运营中的关联封号风险。",
    ),
    (
        "哪些人需要用指纹浏览器？",
        "需要批量管理多账号、规避关联封号的个人卖家或运营团队；跨境电商、广告投放、社媒矩阵、联盟营销从业者；"
        "以及关注隐私保护与反追踪技术的开发者与研究者。",
    ),
    (
        "有永久免费的指纹浏览器吗？",
        "有。OKBrowser 与 ixBrowser 提供永久免费且环境数量无上限的方案（ixBrowser 每日创建与开启次数有限制）；"
        "AdsPower、MoreLogin、Multilogin、DICloak、Linken Sphere、Gologin 等主流产品也都有免费档位。"
        "若接受自行部署，Camoufox、CloakBrowser、BotBrowser 等开源项目完全免费。",
    ),
    (
        "怎么验证指纹浏览器的伪装效果？",
        "上号前先用检测站自测：BrowserScan 给出综合指纹评分，Whoer 检查 IP 与 WebRTC 泄漏，CreepJS 做深度一致性分析。"
        "三者结果一致再投入正式账号，可以省掉大量试错成本。",
    ),
    (
        "国内厂商和国际厂商怎么选？",
        "国内厂商（Roxy、紫鸟、AdsPower、比特等）中文界面与客服响应更好，支付方式友好，部分自带云端 IP 资源池，"
        "适合跨境电商团队；国际厂商（Multilogin、Gologin、Octo、Kameleo 等）指纹精度与移动端模拟更强，"
        "适合高价值账号、广告投放与海外远程团队，但需要注意网络环境与订阅支付方式。",
    ),
]


def build_faq(items: list[tuple[str, str]]) -> str:
    blocks = "".join(
        f"""
        <details class="faq__item"{' open' if n == 0 else ''}>
          <summary><span>{html.escape(q)}</span>{icon('chevron', 'icon--xs')}</summary>
          <p>{html.escape(a)}</p>
        </details>"""
        for n, (q, a) in enumerate(items)
    )
    return f"""
      <section class="section" id="faq" aria-labelledby="faq-title">
        <div class="section__head">
          <h2 id="faq-title">常见问题</h2>
          <p class="section__lead">选型前最常被问到的五个问题。</p>
        </div>
        <div class="faq">{blocks}</div>
      </section>"""


def json_ld(desc: str, groups: list[tuple[Group, int]]) -> str:
    import json

    website = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": SITE_URL + "#website",
        "url": SITE_URL,
        "name": SITE_NAME,
        "description": desc,
        "inLanguage": "zh-CN",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": SITE_URL + "?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
    }
    collection = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": SITE_URL + "#page",
        "url": SITE_URL,
        "name": f"{SITE_NAME} - {SITE_TAGLINE}",
        "description": desc,
        "inLanguage": "zh-CN",
        "isPartOf": {"@id": SITE_URL + "#website"},
        "dateModified": date.today().isoformat(),
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(groups),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": n,
                    "name": g.title,
                    "url": f"{SITE_URL}#{g.id}",
                }
                for n, (g, _) in enumerate(groups, start=1)
            ],
        },
    }
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in FAQS
        ],
    }
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "首页", "item": SITE_URL}
        ],
    }
    return "".join(
        f'<script type="application/ld+json">{json.dumps(doc, ensure_ascii=False, separators=(",", ":"))}</script>'
        for doc in (website, collection, faq, breadcrumb)
    )


def main() -> None:
    SITE.mkdir(exist_ok=True)
    sections = parse_readme(README.read_text(encoding="utf-8"))

    rendered: list[str] = []
    counts: list[tuple[Group, int]] = []
    for group in GROUPS:
        markup, total = render_group(group, sections)
        rendered.append(markup)
        counts.append((group, total))

    total_links = sum(c for _, c in counts)
    vendor_count = next(c for g, c in counts if g.id == "browsers")
    oss_count = next(c for g, c in counts if g.id == "opensource")
    proxy_count = next(c for g, c in counts if g.id == "proxy")
    site_desc = SITE_DESC_TEMPLATE.format(vendors=vendor_count, oss=oss_count)

    updated = date.today().isoformat()
    stars = fetch_stars()

    toc = "".join(
        f'<li><a href="#{g.id}" data-toc="{g.id}"><span>{html.escape(g.label)}</span>'
        f'<span class="toc__count">{c}</span></a></li>'
        for g, c in counts
    )

    nav_links = "".join(
        f'<a class="nav__link" href="#{g.id}" data-toc="{g.id}">{html.escape(g.label)}</a>'
        for g in GROUPS
        if g.id in {"browsers", "opensource", "proxy", "articles"}
    )

    catbar_links = "".join(
        f'<a href="#{g.id}" data-toc="{g.id}">{html.escape(g.label)}'
        f'<span class="catbar__count">{c}</span></a>'
        for g, c in counts
    )

    page = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>指纹浏览器有哪些？{vendor_count} 款跨境指纹浏览器推荐与开源资源合集</title>
<meta name="description" content="{html.escape(site_desc, quote=True)}">
<meta name="keywords" content="{KEYWORDS}">
<meta name="author" content="zhaotoday">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="{SITE_URL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME}">
<meta property="og:locale" content="zh_CN">
<meta property="og:url" content="{SITE_URL}">
<meta property="og:title" content="{SITE_NAME} - {SITE_TAGLINE}">
<meta property="og:description" content="{html.escape(site_desc, quote=True)}">
<meta property="og:image" content="{SITE_URL}assets/og-cover.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="675">
<meta property="og:image:alt" content="指纹浏览器资源合集主视觉：多个隔离浏览器环境组成的网格">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{SITE_NAME} - {SITE_TAGLINE}">
<meta name="twitter:description" content="{html.escape(site_desc, quote=True)}">
<meta name="twitter:image" content="{SITE_URL}assets/og-cover.png">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b1020" media="(prefers-color-scheme: dark)">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="stylesheet" href="assets/style.css">
<script>
  (function () {{
    try {{
      var saved = localStorage.getItem('fb-theme');
      var dark = saved ? saved === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (dark) document.documentElement.dataset.theme = 'dark';
    }} catch (e) {{}}
  }})();
</script>
{json_ld(site_desc, counts)}
</head>
<body>
{icon_sprite()}
<a class="skip-link" href="#main">跳到主要内容</a>

<header class="header">
  <div class="header__inner">
    <a class="brand" href="#main" aria-label="{SITE_NAME} 首页">
      <span class="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="#4F46E5"/>
          <path d="M16 8.5c-4.1 0-7.5 3.4-7.5 7.5 0 2.3.6 4.4 1.7 6.2M16 12.2a3.8 3.8 0 00-3.8 3.8c0 3 .8 5.6 2.2 7.6M16 15.6v.4c0 3.4.9 6.3 2.5 8.3M19.9 10.4A7.5 7.5 0 0123.5 16c0 2-.2 3.9-.7 5.6"
                stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand__text">
        <strong>指纹浏览器资源合集</strong>
        <span>Fingerprint Browser Hub</span>
      </span>
    </a>

    <nav class="nav" aria-label="主导航">{nav_links}</nav>

    <div class="header__actions">
      <button type="button" class="icon-btn" id="theme-toggle" aria-label="切换深色模式">
        {icon("sun", "icon--sun")}{icon("moon", "icon--moon")}
      </button>
      <a class="btn btn--ghost btn--repo" href="{REPO_URL}" target="_blank" rel="noopener"
         aria-label="在 GitHub 上查看本项目（{stars or '0'} 个 star）">
        {github_icon()}<span>Star</span>
        <span class="btn__count" id="star-count"{'' if stars else ' hidden'}>{stars}</span>
      </a>
    </div>
  </div>

  <nav class="catbar" aria-label="分类快捷导航">
    <div class="catbar__inner">{catbar_links}</div>
  </nav>
</header>

<main id="main">

  <section class="hero">
    <div class="hero__inner">
      <div class="hero__copy">
        <h1>指纹浏览器资源合集</h1>
        <p class="hero__sub">指纹浏览器又称防关联浏览器，为每个账号隔离独立的浏览器指纹、Cookies 与 IP 环境，让平台把多个账号识别为互不相关的真实用户，从而降低多账号运营中的关联封号风险。</p>
        <p class="hero__cta"><strong>专业接单</strong>：本人主攻浏览器与云手机生态应用开发，有需求的大佬请私聊 QQ：<strong>6421664</strong>。</p>

        <form class="search" role="search" onsubmit="return false">
          <label class="sr-only" for="q">搜索资源</label>
          {icon("search", "search__icon")}
          <input id="q" type="search" name="q" autocomplete="off" placeholder="搜索产品、开源项目或代理服务商" aria-describedby="search-hint">
          <button type="button" class="search__clear" id="search-clear" hidden aria-label="清空搜索">{icon("close", "icon--xs")}</button>
        </form>
        <p class="search__hint" id="search-hint">试试 <button type="button" class="tag" data-q="免费">免费</button>
          <button type="button" class="tag" data-q="RPA">RPA 自动化</button>
          <button type="button" class="tag" data-q="Camoufox">Camoufox</button>
          <button type="button" class="tag" data-q="住宅">住宅代理</button></p>
      </div>

      <div class="hero__visual">
        <picture>
          <source srcset="assets/hero.webp" type="image/webp">
          <img src="assets/og-cover.png" width="1200" height="675" fetchpriority="high" decoding="async"
               alt="示意图：多个相互隔离的浏览器环境组成网格，外围环绕指纹纹路">
        </picture>
      </div>
    </div>
  </section>

  <section class="stats" aria-label="资源统计">
    <dl class="stats__inner">
      <div><dt>收录资源</dt><dd>{total_links}</dd></div>
      <div><dt>指纹浏览器</dt><dd>{vendor_count}</dd></div>
      <div><dt>开源项目</dt><dd>{oss_count}</dd></div>
      <div><dt>代理服务商</dt><dd>{proxy_count}</dd></div>
      <div><dt>最近更新</dt><dd><time datetime="{updated}">{updated}</time></dd></div>
    </dl>
  </section>

  <div class="layout">
    <aside class="toc" aria-label="分类目录">
      <div class="toc__inner">
        <p class="toc__title">分类</p>
        <ul>{toc}</ul>
      </div>
    </aside>

    <div class="content">
      <p class="result" id="result" hidden role="status"></p>
      {''.join(rendered)}
      {build_faq(FAQS)}
    </div>
  </div>
</main>

<footer class="footer">
  <div class="footer__inner">
    <div>
      <p class="footer__title">{SITE_NAME}</p>
      <p class="footer__note">资料整理于 2026 年，价格为公开参考价，受汇率、活动与套餐调整影响，实际以各产品官网为准。部分链接为推广链接。</p>
    </div>
    <div class="footer__links">
      <a href="{REPO_URL}" target="_blank" rel="noopener">{github_icon("icon--xs")}<span>在 GitHub 上贡献资源</span></a>
      <a href="{REPO_URL}/issues" target="_blank" rel="noopener">{icon("external", "icon--xs")}<span>提交勘误或新增收录</span></a>
    </div>
  </div>
  <p class="footer__legal">内容仅供技术研究与合规选型参考，请遵守目标平台的服务条款与当地法律法规。</p>
</footer>

<button type="button" class="to-top" id="to-top" aria-label="回到顶部" hidden>{icon("chevron", "icon--up")}</button>

<script src="assets/main.js" defer></script>
</body>
</html>
"""

    OUT_HTML.write_text(page, encoding="utf-8")

    OUT_SITEMAP.write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"  <url>\n    <loc>{SITE_URL}</loc>\n    <lastmod>{updated}</lastmod>\n"
        "    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n"
        "</urlset>\n",
        encoding="utf-8",
    )

    OUT_ROBOTS.write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n",
        encoding="utf-8",
    )

    print(f"index.html   {total_links} links across {len(GROUPS)} groups")
    for g, c in counts:
        print(f"  {g.id:<12} {c:>4}")


if __name__ == "__main__":
    main()
