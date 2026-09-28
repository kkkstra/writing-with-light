# 光之书写 · Writing with Light

一部 72 秒的摄影史短片：从墨子的小孔成像讲到数码像素，用 [Remotion](https://www.remotion.dev/) 以 React 代码逐帧生成。署名 `@一次成像`。

完整的创作方案、分镜和史实核对见 [`docs/photography-origins-plan.md`](docs/photography-origins-plan.md)。

## 章节

| # | 时间 (s) | 内容 |
|---|---|---|
| 01 | 0–6 | 小孔成像 · 墨子，c. 400 BCE |
| 02 | 6–11 | 银盐感光 · Schulze，c. 1717 |
| 03 | 11–18 | 日光刻印 · Niépce《窗外景色》，c. 1827 |
| 04 | 18–25 | 银版法 · Daguerre《圣殿大道》，1838 |
| 05 | 25–34 | 镜头 · Petzval f/3.6，1841 |
| 06 | 34–39 | 负片 · Talbot《拉科克修道院格子窗》，1835 |
| 07 | 39–44 | 彩色 · Maxwell《格子缎带》，1861 |
| 08 | 44–49 | 运动 · Muybridge《运动中的马》，1878 |
| 09 | 49–54 | 人人都能拍 · Kodak Nº 1，1888 |
| 10 | 54–60 | 像素 · Sasson 数码相机，1975 |
| 11–13 | 60–72 | 光 → 片名卡 → 片尾 |

## 运行

需要 Node.js 18+；改动中文文案后重新裁剪字体还需要 Python 3 和 `fonttools`。

```bash
cd writing-with-light
npm install
npm run dev          # Remotion Studio 预览
npm run render       # 1080p → out/writing-with-light.mp4
npx remotion render Main out/writing-with-light-4k.mp4 --scale=2 --crf=18   # 4K
sh scripts/stills.sh # 每章一张静帧 + 总览图 → out/stills/
npm run fonts        # 按 src/ 中用到的汉字裁剪 Noto 字体
```

## 结构

```
writing-with-light/
  src/
    Root.tsx       # Composition "Main"：1920×1080 · 30 fps · 2160 帧
    Video.tsx      # 按时间线排布各章，叠加遮幅、颗粒、BGM 与音效
    timeline.ts    # 各章起止时间，唯一的时间来源
    theme.ts       # 色板与字体
    ui.tsx         # 章节标签、双语字幕、标注、计数器等
    lib.tsx        # 随机数、缓动、按设备像素比绘制的 Canvas
    scenes/        # 01Pinhole … 13Outro，每章一个组件
  public/          # 照片、字体子集、音频
  assets/fonts/    # 完整的 Noto CJK 字体（裁剪前）
```

所有动画都是帧号的纯函数（带种子的随机数，不逐帧累积状态），因此可以并行渲染。Canvas 按 `devicePixelRatio` 分配像素，`--scale=2` 渲染出的 4K 画面是原生清晰度。

## 素材与版权

- **照片**：均为 1900 年前的作品，属于公有领域，来自 Wikimedia Commons。
- **字体**：Noto Sans SC、Noto Serif SC、EB Garamond、IBM Plex Mono，均为 SIL Open Font License。
- **音效**：[Mixkit](https://mixkit.co/free-sound-effects/)，免费商用，无需署名。
- **BGM**：`public/audio/bgm.m4a` 截取自一段抖音分享视频的音轨，版权归原曲作者，仅用于个人学习；公开发布成片前请确认授权或替换音乐。
