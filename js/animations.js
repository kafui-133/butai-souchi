/*
 * 各概念のキャンバス・アニメーション
 *
 * ANIMS[id] = {
 *   controls: [ {type:'range'|'select'|'button', id, label, ...} ],
 *   create(ctx, view, P) -> { update(dt), draw(), readouts() -> [[label, value]], action?(id) -> {paramUpdates} }
 * }
 * view.w / view.h はCSSピクセル単位のキャンバスサイズ（リサイズで更新される）。
 * P はコントロールの現在値（app.js がリアルタイムに書き換える）。
 */
(function () {
  "use strict";
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a = 0, b = 1) => a + Math.random() * (b - a);

  /* ---------- 共通ヘルパー ---------- */
  const COL = {
    bg: "#070b18",
    grid: "rgba(120,160,255,0.08)",
    text: "#cfe0ff",
    dim: "rgba(200,215,255,0.55)",
    cyan: "#4fe3ff",
    mag: "#ff5fa8",
    yel: "#ffd34f",
    grn: "#6dff9c",
    org: "#ff9a3c",
    red: "#ff4d4d",
    blue: "#5b8cff",
  };

  function makeStars(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.5 + 0.15, f: rand(0.5, 2), p: rand(0, TAU),
    }));
  }
  function drawBg(ctx, view, stars, t) {
    ctx.fillStyle = COL.bg;
    ctx.fillRect(0, 0, view.w, view.h);
    if (!stars) return;
    for (const s of stars) {
      ctx.globalAlpha = s.a * (0.7 + 0.3 * Math.sin(t * s.f + s.p));
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x * view.w, s.y * view.h, s.r, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function label(ctx, str, x, y, o = {}) {
    ctx.font = `${o.weight || 500} ${o.size || 12}px "Noto Sans JP", system-ui, sans-serif`;
    ctx.fillStyle = o.color || COL.text;
    ctx.textAlign = o.align || "left";
    ctx.textBaseline = o.base || "alphabetic";
    ctx.fillText(str, x, y);
  }
  function glow(ctx, x, y, r, color, alpha = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  function dot(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  function arrow(ctx, x0, y0, x1, y1, color, w = 2, head = 7) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    const a = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - head * Math.cos(a - 0.4), y1 - head * Math.sin(a - 0.4));
    ctx.lineTo(x1 - head * Math.cos(a + 0.4), y1 - head * Math.sin(a + 0.4));
    ctx.closePath(); ctx.fill();
  }
  function wavyLine(ctx, x0, y0, x1, y1, amp, wl, phase, color, w = 2) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
    ctx.strokeStyle = color; ctx.lineWidth = w;
    ctx.beginPath();
    for (let s = 0; s <= len; s += 2) {
      const o = amp * Math.sin((s / wl) * TAU - phase);
      const x = x0 + ux * s + nx * o, y = y0 + uy * s + ny * o;
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* 数値の整形（指数表記は ×10ⁿ） */
  const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  function sci(x, d = 2) {
    if (!isFinite(x)) return "∞";
    if (x === 0) return "0";
    const ax = Math.abs(x);
    if (ax >= 1e-2 && ax < 1e5) {
      const digits = ax >= 100 ? 0 : ax >= 10 ? 1 : d;
      return x.toLocaleString("ja-JP", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
    }
    const e = Math.floor(Math.log10(ax));
    const m = x / 10 ** e;
    return `${m.toFixed(d)}×10${String(e).split("").map((c) => SUP[c]).join("")}`;
  }
  window.sci = sci;

  const ANIMS = {};

  /* ================================================================== */
  /* 1. 並行世界：測定のたびに分岐する世界の木                                 */
  /* ================================================================== */
  ANIMS.parallel = {
    controls: [
      { type: "range", id: "speed", label: "測定（分岐）の頻度", min: 0.2, max: 2.5, step: 0.1, value: 0.8, unit: "回/秒" },
      { type: "range", id: "prob", label: "↑が出る確率 |α|²", min: 0.05, max: 0.95, step: 0.05, value: 0.5 },
    ],
    create(ctx, view, P) {
      const D = 6;
      const stars = makeStars(80);
      let p = 0, hold = 0, t = 0, path = [];
      const newPath = () => (path = Array.from({ length: D }, () => (Math.random() < P.prob ? 0 : 1)));
      newPath();
      const idxAt = (k) => path.slice(0, k).reduce((a, b) => a * 2 + b, 0);
      const pos = (k, i) => [50 + (k * (view.w - 110)) / D, 26 + ((i + 0.5) * (view.h - 52)) / 2 ** k];

      return {
        update(dt) {
          t += dt;
          if (p >= D) {
            hold += dt;
            if (hold > 2.2) { p = 0; hold = 0; newPath(); }
          } else p = Math.min(D, p + dt * P.speed);
        },
        draw() {
          drawBg(ctx, view, stars, t);
          // 時間軸
          ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
          for (let k = 0; k <= D; k++) {
            const [x] = pos(k, 0);
            ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x, view.h - 14); ctx.stroke();
          }
          label(ctx, "時間 →", view.w - 12, view.h - 6, { align: "right", color: COL.dim, size: 11 });

          // 枝
          for (let k = 0; k < D; k++) {
            const f = clamp(p - k, 0, 1);
            if (f <= 0) break;
            const n = 2 ** k;
            const ours = idxAt(k);
            for (let i = 0; i < n; i++) {
              const [x0, y0] = pos(k, i);
              for (let b = 0; b < 2; b++) {
                const [x1, y1] = pos(k + 1, 2 * i + b);
                const ex = lerp(x0, x1, f), ey = lerp(y0, y1, f);
                const isOurs = i === ours && b === path[k];
                const prob = b === 0 ? P.prob : 1 - P.prob;
                ctx.strokeStyle = isOurs ? COL.yel : `hsla(${200 + (2 * i + b) * (140 / (2 * n))},90%,65%,${0.25 + 0.55 * prob})`;
                ctx.lineWidth = isOurs ? 3 : 1 + 2 * prob;
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, ex, view.h);
                ctx.clip();
                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.bezierCurveTo(lerp(x0, x1, 0.5), y0, lerp(x0, x1, 0.5), y1, x1, y1);
                ctx.stroke();
                ctx.restore();
                if (f >= 1 && n <= 8) {
                  label(ctx, b === 0 ? "↑" : "↓", x1 - 10, y1 - 5, { size: 11, color: isOurs ? COL.yel : COL.dim, align: "right" });
                }
              }
              // 測定点
              dot(ctx, x0, y0, i === ours ? 4 : 2.5, i === ours ? COL.yel : "rgba(180,200,255,0.7)");
            }
          }
          // 観測者（この私）
          const k = Math.min(Math.floor(p), D - 1), f = clamp(p - k, 0, 1);
          const [x0, y0] = pos(k, idxAt(k));
          const [x1, y1] = pos(k + 1, idxAt(k + 1));
          const s = f * f * (3 - 2 * f);
          const ox = lerp(x0, x1, f), oy = lerp(y0, y1, s);
          glow(ctx, ox, oy, 18, "rgba(255,211,79,0.8)");
          dot(ctx, ox, oy, 4, "#fff");

          const nW = 2 ** Math.floor(p);
          label(ctx, `世界の数: 2^${Math.floor(p)} = ${nW}`, 12, 20, { size: 13, weight: 700 });
          label(ctx, "● 黄色 = 「この私」が経験する歴史", 12, 38, { size: 11, color: COL.yel });
          label(ctx, "線の太さ = その枝の重み（確率振幅²）", 12, 54, { size: 11, color: COL.dim });
        },
        readouts() {
          const n = Math.floor(p);
          const w = path.slice(0, n).reduce((a, b) => a * (b === 0 ? P.prob : 1 - P.prob), 1);
          return [
            ["分岐した世界の数", `${2 ** n}`],
            ["この世界の測定結果", path.slice(0, n).map((b) => (b ? "↓" : "↑")).join("") || "—"],
            ["この枝の重み（確率）", sci(w, 3)],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 2. 量子もつれ：ベル実験                                                  */
  /* ================================================================== */
  ANIMS.entanglement = {
    controls: [
      { type: "range", id: "a", label: "アリスの検出器角度 a", min: 0, max: 180, step: 5, value: 0, unit: "°" },
      { type: "range", id: "b", label: "ボブの検出器角度 b", min: 0, max: 180, step: 5, value: 60, unit: "°" },
      { type: "range", id: "rate", label: "粒子対の生成レート", min: 1, max: 30, step: 1, value: 6, unit: "対/秒" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(60);
      let t = 0, spawn = 0, pairs = [], n = 0, sum = 0, last = { a: P.a, b: P.b };
      const histA = [], histB = [];
      let flashA = 0, flashB = 0;
      const reset = () => { n = 0; sum = 0; histA.length = 0; histB.length = 0; };

      function measure() {
        const th = ((P.a - P.b) * Math.PI) / 180;
        const A = Math.random() < 0.5 ? 1 : -1;
        const pOpp = Math.cos(th / 2) ** 2; // 一重項：結果が逆になる確率
        const B = Math.random() < pOpp ? -A : A;
        n++; sum += A * B;
        histA.push(A); histB.push(B);
        if (histA.length > 14) { histA.shift(); histB.shift(); }
        flashA = flashB = 1;
      }
      function detector(x, y, ang, name, flash, hist) {
        ctx.strokeStyle = "rgba(160,190,255,0.6)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 26, 0, TAU); ctx.stroke();
        glow(ctx, x, y, 40, "rgba(79,227,255,0.6)", flash);
        const r = (ang * Math.PI) / 180 - Math.PI / 2;
        arrow(ctx, x - 22 * Math.cos(r), y - 22 * Math.sin(r), x + 22 * Math.cos(r), y + 22 * Math.sin(r), COL.cyan, 2.5);
        label(ctx, `${name}（${ang}°）`, x, y + 48, { align: "center", size: 12, weight: 700 });
        hist.forEach((v, i) => {
          label(ctx, v > 0 ? "+" : "−", x - 50 + i * 7.5, y - 40, { size: 12, weight: 700, color: v > 0 ? COL.cyan : COL.mag });
        });
      }
      return {
        update(dt) {
          t += dt;
          if (last.a !== P.a || last.b !== P.b) { reset(); last = { a: P.a, b: P.b }; }
          spawn += dt * P.rate;
          while (spawn >= 1) { spawn--; pairs.push({ x: 0, hue: rand(160, 320) }); }
          for (const pr of pairs) pr.x += dt * 0.9;
          pairs = pairs.filter((pr) => { if (pr.x >= 1) { measure(); return false; } return true; });
          flashA = Math.max(0, flashA - dt * 4); flashB = Math.max(0, flashB - dt * 4);
        },
        draw() {
          drawBg(ctx, view, stars, t);
          const cy = view.h * 0.38, cx = view.w / 2;
          const dxL = 70, dxR = view.w - 70, half = cx - dxL - 26;
          // ソース
          glow(ctx, cx, cy, 34, "rgba(255,95,168,0.7)", 0.6 + 0.3 * Math.sin(t * 5));
          dot(ctx, cx, cy, 6, "#fff");
          label(ctx, "もつれた対の発生源", cx, cy + 34, { align: "center", size: 11, color: COL.dim });
          for (const pr of pairs) {
            const xl = cx - pr.x * half, xr = cx + pr.x * half;
            ctx.setLineDash([3, 5]);
            ctx.strokeStyle = `hsla(${pr.hue},90%,70%,0.35)`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(xl, cy); ctx.quadraticCurveTo(cx, cy - 30 * (1 - pr.x), xr, cy); ctx.stroke();
            ctx.setLineDash([]);
            dot(ctx, xl, cy, 4, `hsl(${pr.hue},90%,70%)`);
            dot(ctx, xr, cy, 4, `hsl(${pr.hue},90%,70%)`);
          }
          detector(dxL, cy, P.a, "アリス", flashA, histA);
          detector(dxR, cy, P.b, "ボブ", flashB, histB);

          // グラフ E(θ)
          const gx = 40, gy = view.h * 0.66, gw = view.w - 80, gh = view.h * 0.28;
          ctx.strokeStyle = "rgba(160,190,255,0.35)"; ctx.lineWidth = 1;
          ctx.strokeRect(gx, gy, gw, gh);
          ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
          const X = (deg) => gx + (deg / 180) * gw, Y = (e) => gy + gh / 2 - (e * gh) / 2;
          // 古典（局所的な隠れた変数の単純モデル）
          ctx.setLineDash([5, 4]); ctx.strokeStyle = COL.org; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(X(0), Y(-1)); ctx.lineTo(X(180), Y(1)); ctx.stroke(); ctx.setLineDash([]);
          // 量子
          ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath();
          for (let d = 0; d <= 180; d += 2) { const y = Y(-Math.cos((d * Math.PI) / 180)); d ? ctx.lineTo(X(d), y) : ctx.moveTo(X(d), y); }
          ctx.stroke();
          const th = Math.abs(P.a - P.b);
          if (n > 0) {
            const E = sum / n, err = Math.sqrt(Math.max(1e-9, 1 - E * E) / n);
            ctx.strokeStyle = COL.yel; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(X(th), Y(E - err)); ctx.lineTo(X(th), Y(E + err)); ctx.stroke();
            dot(ctx, X(th), Y(E), 5, COL.yel);
          }
          label(ctx, "E(θ)", gx + 4, gy + 14, { size: 11, color: COL.dim });
          label(ctx, "+1", gx - 6, gy + 10, { size: 10, color: COL.dim, align: "right" });
          label(ctx, "−1", gx - 6, gy + gh, { size: 10, color: COL.dim, align: "right" });
          label(ctx, "0°", X(0), gy + gh + 14, { size: 10, color: COL.dim, align: "center" });
          label(ctx, "90°", X(90), gy + gh + 14, { size: 10, color: COL.dim, align: "center" });
          label(ctx, "180°  θ = |a−b|", X(180), gy + gh + 14, { size: 10, color: COL.dim, align: "right" });
          label(ctx, "— 量子論 −cosθ", gx + gw - 8, gy + 14, { size: 11, color: COL.cyan, align: "right" });
          label(ctx, "- - 局所的隠れた変数モデル", gx + gw - 8, gy + 28, { size: 11, color: COL.org, align: "right" });
          label(ctx, "● 測定値", gx + gw - 8, gy + 42, { size: 11, color: COL.yel, align: "right" });
        },
        readouts() {
          const th = Math.abs(P.a - P.b);
          return [
            ["角度差 θ", `${th}°`],
            ["測定したペア数", `${n}`],
            ["測定された相関 E", n ? (sum / n).toFixed(3) : "—"],
            ["量子論の予言 −cosθ", (-Math.cos((th * Math.PI) / 180)).toFixed(3)],
            ["結果が逆になる確率", `${(Math.cos((th * Math.PI) / 360) ** 2 * 100).toFixed(1)} %`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 3. ロボット工学三原則：「堂々めぐり」                                     */
  /* ================================================================== */
  ANIMS.robotlaws = {
    controls: [
      { type: "range", id: "k2", label: "第二条：命令の強さ k₂", min: 0.2, max: 2, step: 0.05, value: 0.5 },
      { type: "range", id: "k3", label: "第三条：自己保存の強さ k₃", min: 0.2, max: 3, step: 0.05, value: 1.6 },
      { type: "button", id: "human", label: "人間を危険にさらす（第一条を発動）" },
    ],
    create(ctx, view, P) {
      let t = 0, r = 4.2, vr = 0, th = Math.PI, mode = "circle", modeT = 0;
      let human = null, rx = 0, ry = 0;
      const trail = [];
      const U = () => Math.min(view.w, view.h) * 0.12;
      const C = () => [view.w * 0.55, view.h * 0.52];
      const toXY = (rr, a) => [rr * Math.cos(a), rr * Math.sin(a)];
      const sandSpecks = Array.from({ length: 120 }, () => [Math.random(), Math.random(), Math.random()]);

      return {
        action(id) {
          if (id === "human" && mode === "circle") {
            const a = rand(0, TAU);
            human = { x: 0.75 * Math.cos(a), y: 0.75 * Math.sin(a), carried: false };
            [rx, ry] = toXY(r, th);
            mode = "rescue"; modeT = 0;
          }
        },
        update(dt) {
          t += dt; modeT += dt;
          if (mode === "circle") {
            const F = -P.k2 + P.k3 / (r * r);
            vr += (F * 3 - 1.1 * vr) * dt + rand(-0.15, 0.15) * dt;
            r = Math.max(0.35, r + vr * dt);
            th += (dt * 0.8) / Math.max(r, 0.5);
            [rx, ry] = toXY(r, th);
          } else if (mode === "rescue") {
            const dx = human.x - rx, dy = human.y - ry, d = Math.hypot(dx, dy);
            if (d < 0.08) { mode = "carry"; human.carried = true; modeT = 0; }
            else { rx += (dx / d) * 2.6 * dt; ry += (dy / d) * 2.6 * dt; }
          } else if (mode === "carry") {
            const d = Math.hypot(rx, ry);
            if (d > 3.6) { mode = "release"; modeT = 0; }
            else { rx += (rx / d) * 1.6 * dt; ry += (ry / d) * 1.6 * dt; }
            human.x = rx + 0.15; human.y = ry;
          } else if (mode === "release") {
            human.x += 0.4 * dt;
            if (modeT > 1.5) {
              mode = "circle"; human = null;
              r = Math.hypot(rx, ry); th = Math.atan2(ry, rx); vr = 0;
            }
          }
          trail.push([rx, ry]); if (trail.length > 220) trail.shift();
        },
        draw() {
          const u = U(), [cx, cy] = C();
          // 水星の地表
          const g = ctx.createLinearGradient(0, 0, 0, view.h);
          g.addColorStop(0, "#2a1a10"); g.addColorStop(1, "#140b06");
          ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
          for (const [x, y, s] of sandSpecks) { ctx.fillStyle = `rgba(255,180,120,${0.05 + s * 0.1})`; ctx.fillRect(x * view.w, y * view.h, 2, 2); }
          // 危険度（同心円）
          for (let k = 6; k >= 1; k--) {
            ctx.fillStyle = `rgba(255,${60 + k * 20},40,${0.05 + 0.04 * (6 - k)})`;
            ctx.beginPath(); ctx.arc(cx, cy, (k * 0.5) * u, 0, TAU); ctx.fill();
          }
          glow(ctx, cx, cy, u * 0.9, "rgba(255,120,60,0.9)", 0.5 + 0.2 * Math.sin(t * 3));
          dot(ctx, cx, cy, u * 0.3, "#c0c8d0");
          label(ctx, "セレン溜まり", cx, cy + u * 0.3 + 14, { align: "center", size: 11, color: "#ffd2b0" });
          // 均衡半径
          const rs = Math.sqrt(P.k3 / P.k2);
          ctx.setLineDash([6, 6]); ctx.strokeStyle = "rgba(109,255,156,0.6)"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, rs * u, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
          label(ctx, `均衡半径 r* = √(k₃/k₂) = ${rs.toFixed(2)}`, cx + rs * u * 0.71 + 6, cy - rs * u * 0.71 - 4, { size: 11, color: COL.grn });
          // 基地
          const bx = 46, by = view.h - 50;
          ctx.fillStyle = "#3a4a66"; ctx.fillRect(bx - 22, by - 14, 44, 28);
          ctx.fillStyle = "#9fc0ff"; ctx.fillRect(bx - 16, by - 8, 10, 8);
          label(ctx, "基地", bx, by + 28, { align: "center", size: 11, color: COL.dim });
          // 軌跡
          ctx.strokeStyle = "rgba(79,227,255,0.35)"; ctx.lineWidth = 1.5; ctx.beginPath();
          trail.forEach(([x, y], i) => { const X = cx + x * u, Y = cy + y * u; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
          ctx.stroke();
          // 人間
          if (human) {
            const hx = cx + human.x * u, hy = cy + human.y * u;
            if (mode === "rescue") glow(ctx, hx, hy, 24, "rgba(255,77,77,0.9)", 0.5 + 0.5 * Math.sin(t * 10));
            dot(ctx, hx, hy - 7, 4, "#ffe0c0");
            ctx.strokeStyle = "#ffe0c0"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(hx, hy - 3); ctx.lineTo(hx, hy + 6); ctx.moveTo(hx - 5, hy + 12); ctx.lineTo(hx, hy + 6); ctx.lineTo(hx + 5, hy + 12); ctx.stroke();
          }
          // ロボット
          const X = cx + rx * u, Y = cy + ry * u;
          const wob = mode === "circle" ? Math.sin(t * 9) * 0.25 : 0;
          ctx.save(); ctx.translate(X, Y); ctx.rotate(wob);
          ctx.fillStyle = "#cfd8e8"; ctx.fillRect(-8, -10, 16, 16);
          ctx.fillStyle = mode === "circle" ? COL.cyan : COL.red; ctx.fillRect(-5, -6, 10, 4);
          ctx.strokeStyle = "#cfd8e8"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, -16); ctx.stroke(); dot(ctx, 0, -17, 2, COL.yel);
          ctx.restore();
          label(ctx, "SPD-13", X, Y + 20, { align: "center", size: 10, color: COL.dim });

          // 原則パネル
          const L1 = mode === "circle" ? 0 : 1;
          const L2 = mode === "circle" ? P.k2 / 2 : 0.05;
          const L3 = mode === "circle" ? Math.min(1, P.k3 / (r * r) / 2) : 0.05;
          const rows = [["第一条 人間を守る", L1, COL.red], ["第二条 命令に従う", L2, COL.cyan], ["第三条 自分を守る", L3, COL.yel]];
          ctx.fillStyle = "rgba(7,11,24,0.75)"; ctx.fillRect(10, 10, 210, 84);
          rows.forEach(([name, v, c], i) => {
            label(ctx, name, 18, 28 + i * 24, { size: 11 });
            ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(130, 19 + i * 24, 80, 10);
            ctx.fillStyle = c; ctx.fillRect(130, 19 + i * 24, 80 * clamp(v, 0, 1), 10);
          });
          const msg = {
            circle: "命令と自己保存が釣り合い、堂々めぐり中…",
            rescue: "第一条が発動！ すべてに優先して救助へ",
            carry: "人間を安全圏へ運搬中",
            release: "救助完了",
          }[mode];
          label(ctx, msg, view.w - 12, view.h - 12, { align: "right", size: 12, weight: 700, color: mode === "circle" ? COL.text : COL.red });
        },
        readouts() {
          return [
            ["均衡半径 r*", Math.sqrt(P.k3 / P.k2).toFixed(2)],
            ["現在の距離 r", Math.hypot(rx, ry).toFixed(2)],
            ["状態", mode === "circle" ? "堂々めぐり" : "第一条による行動"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 4. ウラシマ効果：光時計                                                  */
  /* ================================================================== */
  ANIMS.urashima = {
    controls: [
      { type: "range", id: "v", label: "宇宙船の速さ v/c", min: 0, max: 99.99, step: 0.01, value: 90, unit: "%" },
      { type: "range", id: "dist", label: "目的地までの距離（1g加速・減速の旅）", min: 0, max: 6.4, step: 0.1, value: 1.0, log: true, unit: "光年" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(90);
      let t = 0, shipX = 0;
      let trail = [];
      const T = 0.6; // 静止時の片道時間（秒）
      const gamma = () => 1 / Math.sqrt(1 - (P.v / 100) ** 2);

      return {
        update(dt) {
          t += dt;
          const L = Math.min(110, view.h * 0.38), c = L / T;
          shipX += (P.v / 100) * c * dt;
          const span = view.w - 230;
          if (shipX > span) { shipX -= span; trail = []; }
        },
        draw() {
          drawBg(ctx, view, stars, t);
          const L = Math.min(110, view.h * 0.38);
          const top = view.h * 0.16, bot = top + L;
          const g = gamma();
          const phase = (tt) => { const s = (tt / T) % 2; return s < 1 ? s : 2 - s; };
          function clock(x, tt, color, name) {
            ctx.fillStyle = "#9fb3d9";
            ctx.fillRect(x - 22, top - 6, 44, 5); ctx.fillRect(x - 22, bot + 1, 44, 5);
            ctx.strokeStyle = "rgba(160,180,220,0.3)"; ctx.lineWidth = 1;
            ctx.strokeRect(x - 26, top - 10, 52, L + 20);
            const y = lerp(bot, top, phase(tt));
            glow(ctx, x, y, 14, color);
            dot(ctx, x, y, 3.5, "#fff");
            label(ctx, name, x, bot + 26, { align: "center", size: 12, weight: 700 });
            return y;
          }
          // 地球の時計
          clock(70, t, "rgba(109,255,156,0.9)", "地球の時計");
          // 船の時計
          const sx = 170 + shipX;
          const tau = t / g;
          const py = clock(sx, tau, "rgba(255,95,168,0.9)", "宇宙船の時計");
          trail.push([sx, py]); if (trail.length > 600) trail.shift();
          ctx.strokeStyle = "rgba(255,95,168,0.55)"; ctx.lineWidth = 1.5; ctx.beginPath();
          trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
          if (P.v > 0.5) arrow(ctx, sx + 30, top + L / 2, sx + 30 + 20 + P.v * 0.3, top + L / 2, COL.mag, 2);

          // 経過時間カウンタ
          const ticksE = Math.floor(t / (2 * T)), ticksS = Math.floor(tau / (2 * T));
          const yb = view.h * 0.74;
          ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(16, yb - 26, view.w - 32, 80);
          label(ctx, `地球の時計: ${ticksE} 往復`, 30, yb, { size: 14, weight: 700, color: COL.grn });
          label(ctx, `宇宙船の時計: ${ticksS} 往復`, 30, yb + 24, { size: 14, weight: 700, color: COL.mag });
          label(ctx, `γ = ${g.toFixed(g > 10 ? 1 : 3)}`, view.w - 30, yb + 10, { size: 22, weight: 800, color: COL.yel, align: "right" });
          label(ctx, "（地球から見て、船の時計は γ 倍ゆっくり進む）", 30, yb + 46, { size: 11, color: COL.dim });
        },
        readouts() {
          const g = gamma();
          const d = P.dist; // 光年（log スライダー値は app.js で変換済み）
          const a = 1.0323; // 1g ≈ 1.032 光年/年²
          const D = d / 2;
          const tauHalf = Math.acosh(1 + a * D) / a;
          const tHalf = Math.sqrt(D * D + (2 * D) / a);
          const vmax = Math.tanh(a * tauHalf);
          return [
            ["ローレンツ因子 γ", g.toFixed(4)],
            ["船内で1年過ごすと地球では", `${sci(g, 3)} 年`],
            [`1gの旅で ${sci(d)} 光年先へ：船内時間`, `${sci(2 * tauHalf)} 年`],
            ["同：地球での経過時間", `${sci(2 * tHalf)} 年`],
            ["同：最高速度", vmax > 0.999999 ? "c × (1 − " + sci(1 - vmax) + ")" : `${(vmax * 100).toFixed(4)} % c`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 5. クロノ・シンクラスティック・インファンディブラム                         */
  /* ================================================================== */
  ANIMS.infundibulum = {
    controls: [
      { type: "select", id: "view", label: "表示", value: "spiral", options: [["spiral", "時空の漏斗（太陽〜ベテルギウス）"], ["surface", "シンクラスティック曲面 vs アンチクラスティック曲面"]] },
      { type: "range", id: "speed", label: "ラムファードの移動速度", min: 0.2, max: 3, step: 0.1, value: 1 },
    ],
    create(ctx, view, P) {
      const stars = makeStars(140);
      let t = 0, s = 0, dir = 1, events = 0;
      const planets = [
        { name: "水星", s: 0.1, col: "#b9a89a", r: 4 },
        { name: "地球", s: 0.24, col: "#4f9bff", r: 6, note: "59日ごとに実体化" },
        { name: "火星", s: 0.4, col: "#ff6b3c", r: 5 },
        { name: "タイタン", s: 0.62, col: "#e8c26a", r: 5 },
      ];
      planets.forEach((p) => (p.flash = 0));
      const N = 7;
      const geom = (u) => {
        const x0 = 60, x1 = view.w - 80;
        const A = view.h * (0.05 + 0.27 * Math.pow(u, 0.8));
        const ph = TAU * N * u + t * 0.6;
        return { x: lerp(x0, x1, u), y: view.h * 0.5 + A * Math.sin(ph), z: Math.cos(ph), A };
      };

      function drawSpiral() {
        drawBg(ctx, view, stars, t);
        // 太陽とベテルギウス
        glow(ctx, 60, view.h / 2, 60, "rgba(255,220,120,0.9)");
        dot(ctx, 60, view.h / 2, 16, "#fff3c0");
        label(ctx, "太陽", 60, view.h / 2 + 40, { align: "center", size: 11 });
        glow(ctx, view.w - 40, view.h / 2, 110, "rgba(255,80,40,0.8)", 0.8);
        dot(ctx, view.w - 40, view.h / 2, 46, "#ff6a3a");
        label(ctx, "ベテルギウス", view.w - 40, view.h / 2 + 70, { align: "center", size: 11 });
        // 螺旋（奥→手前の順に描く）
        for (const back of [true, false]) {
          for (let i = 0; i < 700; i++) {
            const u0 = i / 700, u1 = (i + 1) / 700;
            const a = geom(u0), b = geom(u1);
            if ((a.z < 0) !== back) continue;
            const d = Math.abs(u0 - s);
            const hot = Math.exp(-(d * d) / (2 * 0.02 * 0.02));
            const base = back ? 0.18 : 0.55;
            ctx.strokeStyle = `rgba(${lerp(120, 200, hot)},${lerp(140, 240, hot)},255,${base + hot * 0.45})`;
            ctx.lineWidth = (back ? 1 : 2) + hot * 4;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        // 惑星
        for (const p of planets) {
          const g = geom(p.s);
          const px = g.x;
          if (p.flash > 0) {
            glow(ctx, px, g.y, 40, "rgba(160,230,255,0.9)", p.flash);
            label(ctx, "実体化！", px, g.y - 22, { align: "center", size: 12, weight: 800, color: COL.cyan });
          }
          dot(ctx, px, g.y, p.r, p.col);
          label(ctx, p.name, px, g.y + p.r + 14, { align: "center", size: 11 });
          if (p.note) label(ctx, p.note, px, g.y + p.r + 28, { align: "center", size: 10, color: COL.dim });
        }
        // ラムファード（波束）
        const r = geom(s);
        for (let k = -12; k <= 12; k++) {
          const u = s + k * 0.004; if (u < 0 || u > 1) continue;
          const q = geom(u), w = Math.exp(-(k * k) / 40);
          dot(ctx, q.x, q.y, 1.5 + 3 * w, `rgba(200,240,255,${w})`);
        }
        glow(ctx, r.x, r.y, 26, "rgba(160,230,255,0.9)");
        label(ctx, "ラムファード＆カザック", r.x, r.y - 30, { align: "center", size: 11, weight: 700, color: "#e6f6ff" });
        label(ctx, "「あらゆる種類の真実がぴったりと噛み合う場所」", 14, 22, { size: 12, color: COL.dim });
      }

      function drawSurface() {
        drawBg(ctx, view, stars, t);
        const rot = t * 0.5, tilt = 0.95;
        const proj = (x, y, z, ox, sc) => {
          const X = x * Math.cos(rot) - y * Math.sin(rot);
          const Y = x * Math.sin(rot) + y * Math.cos(rot);
          return [ox + X * sc, view.h * 0.52 + (Y * Math.cos(tilt) - z * Math.sin(tilt)) * sc * 0.9];
        };
        const panels = [
          { ox: view.w * 0.27, f: (x, y) => 0.55 * (x * x + y * y), name: "シンクラスティック（K > 0）", sub: "どの方向にも同じ側に曲がる：球・お椀", col: COL.cyan },
          { ox: view.w * 0.73, f: (x, y) => 0.55 * (x * x - y * y), name: "アンチクラスティック（K < 0）", sub: "方向によって逆に曲がる：鞍・ポテトチップス", col: COL.mag },
        ];
        const sc = Math.min(view.w * 0.17, view.h * 0.3);
        for (const p of panels) {
          ctx.strokeStyle = p.col; ctx.globalAlpha = 0.75; ctx.lineWidth = 1;
          for (let i = -5; i <= 5; i++) {
            for (const dirn of [0, 1]) {
              ctx.beginPath();
              for (let j = -5; j <= 5; j++) {
                const x = (dirn ? i : j) / 5, y = (dirn ? j : i) / 5;
                const [X, Y] = proj(x, y, p.f(x, y), p.ox, sc);
                j === -5 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
              }
              ctx.stroke();
            }
          }
          ctx.globalAlpha = 1;
          label(ctx, p.name, p.ox, 30, { align: "center", size: 14, weight: 800, color: p.col });
          label(ctx, p.sub, p.ox, 48, { align: "center", size: 11, color: COL.dim });
        }
        label(ctx, "K = κ₁ κ₂  （ガウス曲率 ＝ 2つの主曲率の積）", view.w / 2, view.h - 14, { align: "center", size: 12 });
      }

      return {
        update(dt) {
          t += dt;
          if (P.view !== "spiral") return;
          s += dir * dt * 0.06 * P.speed;
          if (s > 1) { s = 1; dir = -1; }
          if (s < 0) { s = 0; dir = 1; }
          for (const p of planets) {
            const near = Math.abs(p.s - s) < 0.012;
            if (near && p.flash <= 0.05) { p.flash = 1; events++; }
            else p.flash = Math.max(0, p.flash - dt * 0.8);
          }
        },
        draw() { P.view === "spiral" ? drawSpiral() : drawSurface(); },
        readouts() {
          return [
            ["螺旋上の位置（太陽=0, ベテルギウス=1）", s.toFixed(3)],
            ["実体化イベント", `${events} 回`],
            ["作中での地球への出現周期", "59 日"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 6. 反物質：対消滅・対生成                                               */
  /* ================================================================== */
  ANIMS.antimatter = {
    controls: [
      { type: "select", id: "mode", label: "現象", value: "annihilation", options: [["annihilation", "対消滅 e⁻ + e⁺ → γγ"], ["pair", "対生成（磁場中の霧箱）"]] },
      { type: "range", id: "mass", label: "反物質の量（物質と同量で対消滅）", min: -9, max: 6, step: 0.1, value: 0, log: true, unit: "g" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(60);
      let t = 0, cyc = 0, ang = rand(0, Math.PI), parts = [], lastMode = P.mode;
      const fog = Array.from({ length: 200 }, () => [Math.random(), Math.random()]);

      function newPair() {
        const ox = view.w * 0.42, oy = view.h * 0.5;
        const sp = rand(140, 220);
        parts = [
          { x: ox, y: oy, vx: sp * 0.95, vy: -sp * 0.3, q: -1, trail: [] },
          { x: ox, y: oy, vx: sp * 0.9, vy: sp * 0.35, q: +1, trail: [] },
        ];
      }
      return {
        update(dt) {
          t += dt; cyc += dt;
          if (P.mode !== lastMode) { cyc = 0; lastMode = P.mode; parts = []; }
          if (P.mode === "annihilation") {
            if (cyc > 4.2) { cyc = 0; ang = rand(0, Math.PI); }
          } else {
            if (cyc > 4.5) { cyc = 0; parts = []; }
            if (cyc > 1 && !parts.length) newPair();
            for (const p of parts) {
              const w = p.q * 4.2 * dt; // 回転角 = qB/m dt（速さに依らない）
              const c = Math.cos(w), s = Math.sin(w);
              [p.vx, p.vy] = [p.vx * c - p.vy * s, p.vx * s + p.vy * c];
              const k = 1 - 0.55 * dt;
              p.vx *= k; p.vy *= k;
              p.x += p.vx * dt; p.y += p.vy * dt;
              p.trail.push([p.x, p.y]);
            }
          }
        },
        draw() {
          const cx = view.w / 2, cy = view.h / 2;
          if (P.mode === "annihilation") {
            drawBg(ctx, view, stars, t);
            const T = 1.8;
            if (cyc < T) {
              const f = cyc / T, d = lerp(view.w * 0.42, 0, f * f);
              const ex = cx - d, px = cx + d, wig = 6 * Math.sin(t * 12);
              glow(ctx, ex, cy + wig, 22, "rgba(91,140,255,0.9)"); dot(ctx, ex, cy + wig, 8, COL.blue);
              label(ctx, "e⁻", ex, cy + wig + 4, { align: "center", size: 11, weight: 800, color: "#fff" });
              label(ctx, "電子", ex, cy + 36, { align: "center", size: 11, color: COL.dim });
              glow(ctx, px, cy - wig, 22, "rgba(255,77,77,0.9)"); dot(ctx, px, cy - wig, 8, COL.red);
              label(ctx, "e⁺", px, cy - wig + 4, { align: "center", size: 11, weight: 800, color: "#fff" });
              label(ctx, "陽電子（反物質）", px, cy + 36, { align: "center", size: 11, color: COL.dim });
            } else {
              const f = (cyc - T) / (4.2 - T);
              const flash = Math.max(0, 1 - f * 4);
              glow(ctx, cx, cy, 120 * (0.3 + f), "rgba(255,255,220,1)", flash);
              const len = f * Math.hypot(view.w, view.h) * 0.5;
              const dx = Math.cos(ang), dy = Math.sin(ang);
              ctx.globalAlpha = 1 - f * 0.6;
              wavyLine(ctx, cx, cy, cx + dx * len, cy + dy * len, 6, 14, t * 20, COL.yel, 2.5);
              wavyLine(ctx, cx, cy, cx - dx * len, cy - dy * len, 6, 14, t * 20, COL.yel, 2.5);
              ctx.globalAlpha = 1;
              label(ctx, "γ 511 keV", cx + dx * len * 0.8, cy + dy * len * 0.8 - 12, { align: "center", size: 12, weight: 700, color: COL.yel });
              label(ctx, "γ 511 keV", cx - dx * len * 0.8, cy - dy * len * 0.8 - 12, { align: "center", size: 12, weight: 700, color: COL.yel });
            }
            label(ctx, "e⁻ + e⁺ → γ + γ   （質量が100%エネルギーに）", 14, 22, { size: 13, weight: 700 });
          } else {
            ctx.fillStyle = "#0b1016"; ctx.fillRect(0, 0, view.w, view.h);
            for (const [x, y] of fog) { ctx.fillStyle = "rgba(200,220,255,0.05)"; ctx.fillRect(x * view.w, y * view.h, 2, 2); }
            // 磁場記号 ⊙
            for (let x = 30; x < view.w; x += 70) for (let y = 30; y < view.h; y += 70) {
              ctx.strokeStyle = "rgba(160,190,255,0.15)"; ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.stroke(); dot(ctx, x, y, 1.5, "rgba(160,190,255,0.25)");
            }
            const ox = view.w * 0.42, oy = view.h * 0.5;
            // 入射ガンマ線（見えないので点線）
            if (cyc < 1) {
              ctx.globalAlpha = 0.8;
              wavyLine(ctx, 0, oy, lerp(0, ox, cyc), oy, 5, 14, t * 20, COL.yel, 2);
              ctx.globalAlpha = 1;
              label(ctx, "γ線（高エネルギー光子）", 14, oy - 14, { size: 11, color: COL.yel });
            }
            dot(ctx, ox, oy, 5, "#aaa"); label(ctx, "原子核", ox, oy + 18, { align: "center", size: 10, color: COL.dim });
            for (const p of parts) {
              const col = p.q < 0 ? "rgba(140,170,255,0.9)" : "rgba(255,120,120,0.9)";
              ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
              p.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
              dot(ctx, p.x, p.y, 3, "#fff");
              if (p.trail.length > 20) {
                const [lx, ly] = p.trail[20];
                label(ctx, p.q < 0 ? "e⁻ 電子" : "e⁺ 陽電子", lx + 8, ly + (p.q < 0 ? -10 : 18), { size: 12, weight: 700, color: col });
              }
            }
            label(ctx, "γ → e⁻ + e⁺   磁場 B ⊙（画面手前向き）で逆向きに曲がる", 14, 22, { size: 13, weight: 700 });
            label(ctx, "エネルギーを失いながら螺旋を描く（r = p / |q|B）", 14, 40, { size: 11, color: COL.dim });
          }
        },
        readouts() {
          const m = P.mass / 1000; // kg
          const E = 2 * m * 9e16;
          const kt = E / 4.184e12;
          return [
            ["反物質の量", `${sci(P.mass)} g`],
            ["放出エネルギー E = 2mc²", `${sci(E)} J`],
            ["TNT換算", kt >= 1 ? `${sci(kt)} kt` : `${sci(kt * 1000)} t`],
            ["広島型原爆（約15 kt）比", `${sci(kt / 15)} 倍`],
            ["日本の年間電力消費（約1兆kWh）比", `${sci(E / 3.6e18)} 倍`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 7. 反重力装置                                                          */
  /* ================================================================== */
  ANIMS.antigravity = {
    controls: [
      { type: "select", id: "mode", label: "モード", value: "cavorite", options: [["normal", "通常の重力"], ["cavorite", "重力遮蔽（ケイバーライト）"], ["negmass", "負の質量（ボンディの暴走運動）"]] },
    ],
    create(ctx, view, P) {
      const stars = makeStars(50);
      let t = 0, balls = [], spawn = 0, lastMode = null;
      let neg = null;
      const plate = () => [view.w * 0.38, view.w * 0.62];
      const ground = () => view.h - 40;
      const airs = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), s: rand(0.5, 1) }));

      function initNeg() { neg = { x: 0, v: 0, t: 0, hist: [] }; }

      return {
        update(dt) {
          t += dt;
          if (P.mode !== lastMode) { balls = []; lastMode = P.mode; initNeg(); }
          if (P.mode === "negmass") {
            const a = 30; // 一定加速度（|m+|=|m-|）
            neg.v += a * dt; neg.x += neg.v * dt; neg.t += dt;
            if (neg.t > 0.1 * neg.hist.length) neg.hist.push(neg.v);
            if (neg.t > 9) initNeg();
            return;
          }
          spawn += dt * 3;
          while (spawn > 1) { spawn--; balls.push({ x: rand(20, view.w - 20), y: -10, vx: rand(-10, 10), vy: 0, r: rand(5, 9), hue: rand(180, 320) }); }
          const [p0, p1] = plate(), G = ground();
          for (const b of balls) {
            const shielded = P.mode === "cavorite" && b.x > p0 && b.x < p1;
            const g = shielded ? -60 : 500; // 遮蔽域では上昇気流
            b.vy += g * dt;
            if (shielded) b.vy *= 1 - 0.8 * dt;
            b.x += b.vx * dt; b.y += b.vy * dt;
            if (b.y > G - b.r) { b.y = G - b.r; b.vy *= -0.55; b.vx *= 0.9; }
          }
          balls = balls.filter((b) => b.y > -60);
          if (balls.length > 70) balls.splice(0, balls.length - 70);
        },
        draw() {
          drawBg(ctx, view, stars, t);
          if (P.mode === "negmass") {
            // 背景グリッドが流れることで速度を表現
            const off = (neg.x * 2) % 60;
            ctx.strokeStyle = "rgba(120,160,255,0.12)"; ctx.lineWidth = 1;
            for (let x = -off; x < view.w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, view.h * 0.62); ctx.stroke(); }
            const cy = view.h * 0.32, cx = view.w * 0.5;
            const xm = cx - 50, xp = cx + 50;
            for (let i = 1; i < 8; i++) {
              ctx.globalAlpha = 0.15 * (8 - i) / 8 * Math.min(1, neg.v / 100);
              dot(ctx, xm - i * 10 * Math.min(3, neg.v / 80), cy, 16, COL.mag);
              dot(ctx, xp - i * 10 * Math.min(3, neg.v / 80), cy, 16, COL.cyan);
            }
            ctx.globalAlpha = 1;
            glow(ctx, xm, cy, 34, "rgba(255,95,168,0.8)"); dot(ctx, xm, cy, 16, COL.mag);
            label(ctx, "−m", xm, cy + 5, { align: "center", size: 13, weight: 800, color: "#fff" });
            glow(ctx, xp, cy, 34, "rgba(79,227,255,0.8)"); dot(ctx, xp, cy, 16, COL.cyan);
            label(ctx, "+m", xp, cy + 5, { align: "center", size: 13, weight: 800, color: "#000" });
            arrow(ctx, xm + 20, cy - 32, xm + 60, cy - 32, COL.mag); label(ctx, "+mに引き寄せられる", xm - 40, cy - 46, { size: 11, color: COL.mag });
            arrow(ctx, xp + 20, cy - 32, xp + 60, cy - 32, COL.cyan); label(ctx, "−mに押される", xp + 10, cy - 46, { size: 11, color: COL.cyan });
            label(ctx, "両者は同じ向きに加速し続ける →", cx, cy + 50, { align: "center", size: 13, weight: 700 });
            // 速度グラフ
            const gx = 40, gy = view.h * 0.66, gw = view.w - 80, gh = view.h * 0.26;
            ctx.strokeStyle = "rgba(160,190,255,0.35)"; ctx.strokeRect(gx, gy, gw, gh);
            ctx.strokeStyle = COL.yel; ctx.lineWidth = 2; ctx.beginPath();
            neg.hist.forEach((v, i) => { const X = gx + (i / 90) * gw, Y = gy + gh - (v / 280) * gh; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
            ctx.stroke();
            label(ctx, "速度 v（時間とともに直線的に増加）", gx + 6, gy + 14, { size: 11, color: COL.yel });
            label(ctx, "運動量 m·v + (−m)·v = 0　　運動エネルギー ½mv² + ½(−m)v² = 0", gx + 6, gy + gh - 8, { size: 11, color: COL.dim });
            return;
          }
          const [p0, p1] = plate(), G = ground();
          ctx.fillStyle = "#1a2236"; ctx.fillRect(0, G, view.w, view.h - G);
          if (P.mode === "cavorite") {
            const grd = ctx.createLinearGradient(0, 0, 0, G);
            grd.addColorStop(0, "rgba(109,255,156,0.0)"); grd.addColorStop(1, "rgba(109,255,156,0.12)");
            ctx.fillStyle = grd; ctx.fillRect(p0, 0, p1 - p0, G);
            for (const a of airs) {
              const y = (((a.y - t * 0.4 * a.s) % 1) + 1) % 1;
              const x = p0 + a.x * (p1 - p0);
              ctx.strokeStyle = "rgba(180,255,210,0.25)"; ctx.lineWidth = 1.2;
              ctx.beginPath(); ctx.moveTo(x, y * G); ctx.lineTo(x, y * G - 12); ctx.stroke();
            }
            ctx.fillStyle = "#6dff9c"; ctx.fillRect(p0, G - 6, p1 - p0, 6);
            glow(ctx, (p0 + p1) / 2, G - 3, (p1 - p0) * 0.6, "rgba(109,255,156,0.4)", 0.6 + 0.2 * Math.sin(t * 4));
            label(ctx, "ケイバーライト板", (p0 + p1) / 2, G + 22, { align: "center", size: 12, weight: 700, color: COL.grn });
            label(ctx, "重力 0 → 上空の空気が吹き上がる", (p0 + p1) / 2, 20, { align: "center", size: 11, color: COL.grn });
          }
          for (const b of balls) dot(ctx, b.x, b.y, b.r, `hsl(${b.hue},80%,65%)`);
          label(ctx, P.mode === "normal" ? "g = 9.8 m/s²　すべての物体は同じ加速度で落ちる（等価原理）" : "", 14, 22, { size: 12 });
        },
        readouts() {
          if (P.mode === "negmass") return [["経過時間", `${neg.t.toFixed(1)} s`], ["速度（任意単位）", neg.v.toFixed(0)], ["全運動量", "0"], ["全運動エネルギー", "0"]];
          return [["板の外の重力加速度", "9.8 m/s²"], ["遮蔽域の重力加速度", P.mode === "cavorite" ? "0 m/s²（仮想）" : "9.8 m/s²"], ["現実の対応物", "なし（反磁性浮上・磁気浮上は別物）"]];
        },
      };
    },
  };

  /* ================================================================== */
  /* 8. モビルスーツ：二乗三乗の法則                                         */
  /* ================================================================== */
  ANIMS.mobilesuit = {
    controls: [
      { type: "range", id: "H", label: "全高 H", min: 1.7, max: 60, step: 0.1, value: 18, unit: "m" },
    ],
    create(ctx, view, P) {
      let t = 0, phH = 0, phM = 0;
      function figure(x, gy, h, ph, robot) {
        const s = h / 1.7;
        const sw = Math.sin(ph) * 0.45;
        const hip = gy - 0.5 * h, sh = gy - 0.82 * h, head = gy - 0.93 * h;
        const leg = 0.5 * h, arm = 0.36 * h;
        ctx.lineCap = "round";
        const col = robot ? "#dfe6f2" : "#ffd9b8";
        const acc = robot ? "#5b8cff" : "#4a6";
        const lw = Math.max(2, 0.09 * h);
        // 脚
        ctx.strokeStyle = robot ? "#9fb0c8" : col; ctx.lineWidth = lw;
        for (const k of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(x, hip); ctx.lineTo(x + Math.sin(sw * k) * leg, hip + Math.cos(sw * k) * leg); ctx.stroke();
        }
        // 胴
        ctx.strokeStyle = acc; ctx.lineWidth = lw * (robot ? 1.9 : 1.4);
        ctx.beginPath(); ctx.moveTo(x, hip); ctx.lineTo(x, sh); ctx.stroke();
        // 腕
        ctx.strokeStyle = col; ctx.lineWidth = lw * 0.8;
        for (const k of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(x, sh); ctx.lineTo(x + Math.sin(-sw * k) * arm, sh + Math.cos(-sw * k) * arm); ctx.stroke();
        }
        // 頭
        ctx.fillStyle = col;
        if (robot) {
          ctx.fillRect(x - 0.05 * h, head - 0.05 * h, 0.1 * h, 0.09 * h);
          ctx.fillStyle = COL.grn; ctx.fillRect(x - 0.035 * h, head - 0.02 * h, 0.07 * h, 0.015 * h + 1);
          ctx.fillStyle = "#ffd34f";
          ctx.beginPath(); ctx.moveTo(x, head - 0.05 * h); ctx.lineTo(x - 0.06 * h, head - 0.1 * h); ctx.lineTo(x - 0.01 * h, head - 0.045 * h); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x, head - 0.05 * h); ctx.lineTo(x + 0.06 * h, head - 0.1 * h); ctx.lineTo(x + 0.01 * h, head - 0.045 * h); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(x, head, 0.065 * h, 0, TAU); ctx.fill();
        }
        void s;
      }
      return {
        update(dt) {
          t += dt;
          // 振り子の周期 ∝ √(ℓ/g)
          phH += dt * TAU / (1.1 * Math.sqrt(1.7 / 1.7));
          phM += dt * TAU / (1.1 * Math.sqrt(P.H / 1.7));
        },
        draw() {
          const g = ctx.createLinearGradient(0, 0, 0, view.h);
          g.addColorStop(0, "#0b1430"); g.addColorStop(1, "#1d2a4a");
          ctx.fillStyle = g; ctx.fillRect(0, 0, view.w, view.h);
          const gy = view.h - 34;
          const avail = gy - 40;
          const pxPerM = avail / Math.max(P.H * 1.12, 6);
          // ビル（参照）
          const bH = 30 * pxPerM, bx = view.w * 0.06;
          ctx.fillStyle = "rgba(160,180,220,0.12)"; ctx.fillRect(bx, gy - bH, 40 * Math.min(1, pxPerM / 4) + 18, bH);
          label(ctx, "10階建てビル ≈30 m", bx, gy - bH - 6, { size: 10, color: COL.dim });
          // 地面
          ctx.fillStyle = "#2a3550"; ctx.fillRect(0, gy, view.w, view.h - gy);
          const xH = view.w * 0.26, xM = view.w * 0.42;
          figure(xH, gy, 1.7 * pxPerM, phH, false);
          label(ctx, "人間 1.7 m", xH, gy + 20, { align: "center", size: 11 });
          figure(xM, gy, P.H * pxPerM, phM, true);
          label(ctx, `巨大人型 ${P.H.toFixed(1)} m`, xM, gy + 20, { align: "center", size: 11, weight: 700 });
          // スケーリング棒グラフ（対数）
          const k = P.H / 1.7;
          const bars = [["長さ  k", k, COL.grn], ["面積  k²", k * k, COL.cyan], ["体積・質量  k³", k ** 3, COL.mag], ["脚の応力  k", k, COL.yel]];
          const bx0 = view.w * 0.6, bw = view.w * 0.36, maxLog = Math.log10((60 / 1.7) ** 3);
          label(ctx, "人間を1としたときの倍率（対数目盛）", bx0, 30, { size: 11, color: COL.dim });
          bars.forEach(([name, v, c], i) => {
            const y = 46 + i * 40;
            label(ctx, name, bx0, y + 10, { size: 12, weight: 700, color: c });
            ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(bx0, y + 16, bw, 12);
            ctx.fillStyle = c; ctx.fillRect(bx0, y + 16, bw * Math.max(0.01, Math.log10(Math.max(1, v)) / maxLog), 12);
            label(ctx, `×${sci(v)}`, bx0 + bw, y + 10, { size: 12, align: "right" });
          });
        },
        readouts() {
          const k = P.H / 1.7;
          const m = 65 * k ** 3;
          const leg = 0.53 * P.H;
          return [
            ["拡大率 k", k.toFixed(2)],
            ["人体と同じ密度なら質量", `${sci(m / 1000)} t`],
            ["脚の骨（構造材）の応力", `人間の ${k.toFixed(1)} 倍`],
            ["一歩の周期（人間比）", `${Math.sqrt(k).toFixed(2)} 倍`],
            ["歩きの最高速度 √(0.5gℓ)", `${(Math.sqrt(0.5 * 9.8 * leg) * 3.6).toFixed(0)} km/h`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 9. マスドライバー                                                       */
  /* ================================================================== */
  ANIMS.massdriver = {
    controls: [
      { type: "select", id: "body", label: "設置場所と目標速度", value: "moon", options: [["moon", "月面 → 脱出速度 2.38 km/s"], ["earth", "地球（高山）→ 軌道速度 7.9 km/s"]] },
      { type: "range", id: "acc", label: "加速度", min: 0, max: 3.5, step: 0.05, value: 2, log: true, unit: "g" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(140);
      let t = 0, cyc = 0;
      const NC = 22;
      const coils = new Array(NC).fill(0);
      let shot = [];
      const TA = 2.2, TF = 2.4;
      return {
        update(dt) {
          t += dt; cyc += dt;
          if (cyc > TA + TF) { cyc = 0; shot = []; }
          for (let i = 0; i < NC; i++) coils[i] = Math.max(0, coils[i] - dt * 2.5);
        },
        draw() {
          const moon = P.body === "moon";
          drawBg(ctx, view, stars, t);
          // 惑星表面（大きな円弧）
          const R = view.w * 2.2, pcx = view.w * 0.35, pcy = view.h * 0.78 + R;
          if (!moon) {
            ctx.fillStyle = "rgba(80,150,255,0.18)"; ctx.beginPath(); ctx.arc(pcx, pcy, R + 40, 0, TAU); ctx.fill();
            ctx.fillStyle = "rgba(80,150,255,0.12)"; ctx.beginPath(); ctx.arc(pcx, pcy, R + 80, 0, TAU); ctx.fill();
          }
          ctx.fillStyle = moon ? "#6c6f78" : "#2f5a3a"; ctx.beginPath(); ctx.arc(pcx, pcy, R, 0, TAU); ctx.fill();
          if (moon) for (let i = 0; i < 12; i++) { const x = (i * 97) % view.w; ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(x, view.h * 0.86 + (i % 3) * 14, 18, 5, 0, 0, TAU); ctx.stroke(); }
          // レール
          const x0 = view.w * 0.06, x1 = view.w * 0.62, ry = view.h * 0.78 - 10;
          ctx.fillStyle = "#3c4252"; ctx.fillRect(x0, ry, x1 - x0, 8);
          // バケット位置（一定加速度）
          let bx = x0, inFlight = false;
          if (cyc < TA) {
            const f = cyc / TA;
            bx = lerp(x0, x1, f * f);
            const ci = Math.floor(((bx - x0) / (x1 - x0)) * NC);
            if (ci >= 0 && ci < NC) coils[ci] = 1;
          } else { bx = x1; inFlight = true; }
          for (let i = 0; i < NC; i++) {
            const cx = lerp(x0, x1, (i + 0.5) / NC);
            ctx.fillStyle = `rgb(${lerp(70, 120, coils[i])},${lerp(80, 230, coils[i])},${lerp(110, 255, coils[i])})`;
            ctx.fillRect(cx - 4, ry - 18, 8, 26);
            if (coils[i] > 0.1) glow(ctx, cx, ry - 6, 18, "rgba(79,227,255,0.8)", coils[i]);
          }
          // バケット
          ctx.fillStyle = "#cfd8e8"; ctx.fillRect(bx - 12, ry - 12, 24, 10);
          if (!inFlight) { dot(ctx, bx, ry - 16, 5, COL.yel); }
          // 射出された積荷
          if (inFlight) {
            const f = (cyc - TA) / TF;
            const vx = (x1 - x0) / TA * 2 * 0.55;
            const px = x1 + vx * (cyc - TA), py = ry - 16 - 30 * f * f * (moon ? 1 : 0.6) - 4 * (cyc - TA);
            shot.push([px, py]);
            ctx.strokeStyle = moon ? "rgba(255,211,79,0.6)" : "rgba(255,140,60,0.8)"; ctx.lineWidth = moon ? 1.5 : 3;
            ctx.beginPath(); shot.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
            if (!moon) glow(ctx, px, py, 18, "rgba(255,120,40,0.9)", 0.9);
            dot(ctx, px, py, 4, COL.yel);
          }
          // 寸法
          const v = moon ? 2380 : 7900, a = 9.8 * P.acc, L = (v * v) / (2 * a);
          ctx.strokeStyle = COL.dim; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x0, ry + 26); ctx.lineTo(x1, ry + 26); ctx.stroke();
          label(ctx, `L = v²/2a = ${sci(L / 1000)} km`, (x0 + x1) / 2, ry + 44, { align: "center", size: 13, weight: 700, color: COL.yel });
          label(ctx, moon ? "月面マスドライバー：大気なし・低重力" : "地球：濃い大気による抵抗と空力加熱", 14, 22, { size: 13, weight: 700 });
          label(ctx, `加速度 ${sci(P.acc)} g　${P.acc > 10 ? "（人間は乗れない：貨物専用）" : P.acc > 3.5 ? "（訓練された人間でも短時間が限界）" : "（人間も耐えられる）"}`, 14, 40, { size: 11, color: COL.dim });
        },
        readouts() {
          const moon = P.body === "moon";
          const v = moon ? 2380 : 7900, a = 9.8 * P.acc;
          const L = (v * v) / (2 * a), tt = v / a;
          return [
            ["目標速度", `${(v / 1000).toFixed(2)} km/s`],
            ["必要なレール長 L", `${sci(L / 1000)} km`],
            ["加速時間 t = v/a", tt > 120 ? `${sci(tt / 60)} 分` : `${sci(tt)} 秒`],
            ["積荷1 kgあたりの運動エネルギー", `${sci((v * v) / 2 / 1e6)} MJ`],
            ["1トン射出時の平均電力（効率100%）", `${sci((1000 * v * v) / 2 / tt / 1e6)} MW`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 10. テラフォーミング：火星の気候モデル                                    */
  /* ================================================================== */
  ANIMS.terraforming = {
    controls: [
      { type: "range", id: "A", label: "アルベド A（反射率）", min: 0.05, max: 0.6, step: 0.01, value: 0.25 },
      { type: "range", id: "tau", label: "温室効果（赤外線の光学的厚さ τ）", min: 0, max: 4, step: 0.01, value: 0.12 },
      { type: "range", id: "P", label: "大気圧", min: -2.5, max: 0.5, step: 0.02, value: -2.22, log: true, unit: "bar" },
      { type: "button", id: "mars", label: "現在の火星" },
      { type: "button", id: "goal", label: "テラフォーミング後（例）" },
      { type: "button", id: "earth", label: "地球と同じ大気を置くと？" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(120);
      let t = 0;
      // 高さマップ（緯度×経度）
      const TW = 256, TH = 128, hm = new Float32Array(TW * TH);
      const waves = Array.from({ length: 14 }, () => ({ a: rand(0.2, 1) / 1.5, kx: Math.floor(rand(1, 6)), ky: rand(1, 5), p: rand(0, TAU), q: rand(0, TAU) }));
      const craters = Array.from({ length: 40 }, () => ({ u: Math.random(), v: rand(0.15, 0.85), r: rand(0.01, 0.05) }));
      for (let j = 0; j < TH; j++) for (let i = 0; i < TW; i++) {
        const lon = (i / TW) * TAU, lat = (j / TH) * Math.PI;
        let h = 0;
        for (const w of waves) h += w.a * Math.sin(w.kx * lon + w.p) * Math.sin(w.ky * lat + w.q);
        h += 0.9 * (j / TH - 0.5); // 火星の南北二分性（北が低い）
        for (const c of craters) {
          let du = Math.abs(i / TW - c.u); du = Math.min(du, 1 - du);
          const d = Math.hypot(du * 2, j / TH - c.v);
          if (d < c.r) h -= 0.6 * (1 - d / c.r);
        }
        hm[j * TW + i] = h;
      }
      const sorted = Array.from(hm).sort((a, b) => a - b);
      const pct = (q) => sorted[Math.floor(clamp(q, 0, 0.999) * sorted.length)];
      let img = null, imgSize = 0;

      function climate() {
        const S = 1361 / 1.524 ** 2, sig = 5.67e-8;
        const Teq = Math.pow(((1 - P.A) * S) / (4 * sig), 0.25);
        const Ts = Teq * Math.pow(1 + 0.75 * P.tau, 0.25);
        const Pbar = P.P;
        const Tb = 1 / (1 / 373.15 - (8.314 / 40650) * Math.log(Pbar / 1.01325));
        const liquid = Pbar > 0.00611 && Ts > 273.15 && Ts < Tb;
        return { Teq, Ts, Tb, liquid, Pbar };
      }

      return {
        action(id) {
          if (id === "mars") return { A: 0.25, tau: 0.12, P: -2.22 };
          if (id === "goal") return { A: 0.2, tau: 3.2, P: -0.3 };
          if (id === "earth") return { A: 0.3, tau: 0.84, P: 0.006 };
        },
        update(dt) { t += dt; },
        draw() {
          drawBg(ctx, view, stars, t);
          const c = climate();
          const D = Math.floor(Math.min(view.h - 40, view.w * 0.5, 260));
          if (!img || imgSize !== D) { img = ctx.createImageData(D, D); imgSize = D; }
          const data = img.data, R = D / 2;
          const iceLat = clamp(lerp(50, 92, (c.Ts - 180) / 120), 40, 95); // 極冠が始まる緯度(度)
          const melt = c.liquid ? clamp((c.Ts - 273) / 30, 0, 1) : 0;
          const sea = c.liquid ? pct(0.08 + 0.45 * melt * clamp(Math.log10(c.Pbar / 0.006) / 2.3, 0, 1)) : -Infinity;
          const veg = c.liquid && c.Ts > 275 && c.Ts < 315 ? clamp((c.Ts - 275) / 15, 0, 1) * clamp(Math.log10(c.Pbar / 0.1) + 1, 0, 1) : 0;
          const rot = t * 0.12;
          const lx = -0.6, ly = -0.35, lz = 0.72;
          for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
            const nx = (x - R + 0.5) / R, ny = (y - R + 0.5) / R, rr = nx * nx + ny * ny;
            const o = (y * D + x) * 4;
            if (rr > 1) { data[o + 3] = 0; continue; }
            const nz = Math.sqrt(1 - rr);
            const lat = Math.asin(-ny);
            const lon = Math.atan2(nx, nz) + rot;
            let u = (lon / TAU) % 1; if (u < 0) u += 1;
            const v = 0.5 - lat / Math.PI;
            const h = hm[Math.floor(clamp(v, 0, 0.999) * TH) * TW + Math.floor(u * TW)];
            let r, g, b;
            if (h < sea) { const d = clamp((sea - h) * 1.5, 0, 1); r = lerp(40, 10, d); g = lerp(110, 50, d); b = lerp(170, 120, d); }
            else {
              const k = clamp((h + 1.2) / 2.4, 0, 1);
              r = lerp(120, 215, k); g = lerp(50, 110, k); b = lerp(30, 70, k);
              if (veg > 0 && h < sea + 0.6) { const vv = veg * (1 - clamp((h - sea) / 0.6, 0, 1)); r = lerp(r, 70, vv); g = lerp(g, 140, vv); b = lerp(b, 60, vv); }
            }
            if (Math.abs(lat) * 180 / Math.PI > iceLat - h * 6) { r = 235; g = 240; b = 250; }
            const lam = Math.max(0.08, nx * lx + ny * ly + nz * lz);
            data[o] = r * lam; data[o + 1] = g * lam; data[o + 2] = b * lam; data[o + 3] = 255;
          }
          const px = Math.floor(view.w * 0.3 - R), py = Math.floor(view.h / 2 - R);
          // 大気のハロー
          const atm = clamp((Math.log10(c.Pbar) + 2.5) / 3, 0, 1);
          glow(ctx, px + R, py + R, R * (1.02 + 0.18 * atm), `rgba(${lerp(255, 120, atm)},${lerp(160, 190, atm)},255,0.9)`, 0.25 + 0.6 * atm);
          ctx.putImageData(img, px, py);

          // 温度計
          const tx = view.w * 0.68, ty0 = 40, ty1 = view.h - 40;
          const TY = (T) => lerp(ty1, ty0, (T - 150) / 200);
          ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(tx - 6, ty0, 12, ty1 - ty0);
          const tc = c.Ts < 273 ? COL.cyan : c.Ts < 320 ? COL.grn : COL.red;
          ctx.fillStyle = tc; ctx.fillRect(tx - 6, TY(clamp(c.Ts, 150, 350)), 12, ty1 - TY(clamp(c.Ts, 150, 350)));
          for (const [T, name] of [[273.15, "0 °C（水の融点）"], [288, "地球平均 15 °C"], [210, "火星 −63 °C"]]) {
            ctx.strokeStyle = COL.dim; ctx.beginPath(); ctx.moveTo(tx - 10, TY(T)); ctx.lineTo(tx + 10, TY(T)); ctx.stroke();
            label(ctx, name, tx + 16, TY(T) + 4, { size: 11, color: COL.dim });
          }
          label(ctx, `表面温度 ${(c.Ts - 273.15).toFixed(1)} °C`, tx - 10, 24, { size: 14, weight: 800, color: tc });
          label(ctx, c.liquid ? "液体の水が安定して存在できる" : c.Pbar < 0.00611 ? "気圧が三重点未満：氷は昇華する" : c.Ts <= 273.15 ? "寒すぎて水は凍る" : "沸騰してしまう", 14, view.h - 12, { size: 12, weight: 700, color: c.liquid ? COL.cyan : COL.org });
        },
        readouts() {
          const c = climate();
          return [
            ["放射平衡温度 T_eq", `${c.Teq.toFixed(1)} K（${(c.Teq - 273.15).toFixed(1)} °C）`],
            ["表面温度 T_s", `${c.Ts.toFixed(1)} K（${(c.Ts - 273.15).toFixed(1)} °C）`],
            ["大気圧", `${sci(c.Pbar * 1000)} hPa（地球の ${sci(c.Pbar / 1.013 * 100)} %）`],
            ["この気圧での沸点", `${(c.Tb - 273.15).toFixed(1)} °C`],
            ["液体の水", c.liquid ? "存在できる" : "存在できない"],
          ];
        },
      };
    },
  };


  /* 3D ワイヤーフレーム用の投影ヘルパー */
  function makeProj(view, rot, tilt, cx, cy, sc) {
    const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
    return (x, y, z) => {
      const X = x * cr - y * sr;
      const Y = x * sr + y * cr;
      return [cx + X * sc, cy + (Y * ct - z * st) * sc * 0.9, Y * st + z * ct];
    };
  }

  /* ================================================================== */
  /* 11. ワープ航法：アルクビエレ・バブルの膨張率                              */
  /* ================================================================== */
  ANIMS.warp = {
    controls: [
      { type: "range", id: "v", label: "バブルの速度 v_s（光速の何倍か）", min: -1, max: 2, step: 0.05, value: 0, log: true, unit: "c" },
      { type: "range", id: "sigma", label: "バブルの壁の鋭さ σ", min: 1, max: 8, step: 0.5, value: 4 },
    ],
    create(ctx, view, P) {
      const stars = makeStars(60);
      let t = 0, flow = 0;
      const R = 1;
      const dfdr = (r, s) => {
        const sech2 = (u) => 1 / Math.cosh(u) ** 2;
        return (s * (sech2(s * (r + R)) - sech2(s * (r - R)))) / (2 * Math.tanh(s * R));
      };
      const theta = (x, y, s) => {
        const r = Math.hypot(x, y) || 1e-6;
        return (x / r) * dfdr(r, s);
      };
      return {
        update(dt) { t += dt; flow += dt * 0.35 * Math.min(3, Math.sqrt(P.v)); },
        draw() {
          drawBg(ctx, view, stars, t);
          const s = P.sigma;
          const sc = Math.min(view.w * 0.16, view.h * 0.28);
          const proj = makeProj(view, -0.55 + Math.sin(t * 0.2) * 0.15, 1.0, view.w / 2, view.h * 0.55, sc);
          const zs = 0.9 / Math.max(0.6, s * 0.45);
          const L = 3, N = 34;
          // 進行方向（+x）に沿った線：空間の流れ
          for (let j = 0; j <= 16; j++) {
            const y = -L + (2 * L * j) / 16;
            ctx.beginPath();
            for (let i = 0; i <= 80; i++) {
              const x = -L + (2 * L * i) / 80;
              const z = theta(x, y, s) * zs;
              const [X, Y] = proj(x, y, z);
              i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
            }
            ctx.strokeStyle = "rgba(160,190,255,0.28)"; ctx.lineWidth = 1; ctx.stroke();
          }
          // 横断線（後方へ流れていく）
          const sp = (2 * L) / N;
          for (let i = 0; i <= N; i++) {
            let x = -L + ((i * sp - flow) % (2 * L) + 2 * L) % (2 * L);
            ctx.beginPath();
            let zmax = 0;
            for (let j = 0; j <= 60; j++) {
              const y = -L + (2 * L * j) / 60;
              const z = theta(x, y, s) * zs;
              if (Math.abs(z) > Math.abs(zmax)) zmax = z;
              const [X, Y] = proj(x, y, z);
              j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
            }
            const k = clamp(Math.abs(zmax) * 2.2, 0, 1);
            ctx.strokeStyle = zmax < 0 ? `rgba(79,160,255,${0.25 + 0.65 * k})` : `rgba(255,95,110,${0.25 + 0.65 * k})`;
            ctx.lineWidth = 1 + k;
            ctx.stroke();
          }
          // 船
          const [sx, sy] = proj(0, 0, 0);
          glow(ctx, sx, sy, 22, "rgba(255,255,255,0.8)");
          ctx.save(); ctx.translate(sx, sy);
          const [fx, fy] = proj(0.5, 0, 0);
          ctx.rotate(Math.atan2(fy - sy, fx - sx));
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -6); ctx.lineTo(-5, 0); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill();
          ctx.restore();
          const [ax, ay] = proj(2.4, 0, 0), [bx, by] = proj(-2.4, 0, 0);
          label(ctx, "前方：空間が縮む（θ<0）", ax, ay + 30, { align: "center", size: 12, weight: 700, color: COL.cyan });
          label(ctx, "後方：空間が伸びる（θ>0）", bx, by - 30, { align: "center", size: 12, weight: 700, color: "#ff8090" });
          label(ctx, "アルクビエレ・バブルの体積膨張率 θ(x, y)", 14, 22, { size: 13, weight: 700 });
          label(ctx, "船はバブル内で自由落下：加速度も時間の遅れも感じない", 14, 40, { size: 11, color: COL.dim });
        },
        readouts() {
          const v = P.v;
          const yr = (d) => (d / v < 1 ? `${sci((d / v) * 365.25)} 日` : `${sci(d / v)} 年`);
          return [
            ["バブル速度", `${sci(v)} c`],
            ["プロキシマ・ケンタウリ（4.24光年）まで", yr(4.24)],
            ["銀河系中心（約2.6万光年）まで", yr(26000)],
            ["船内の時計の進み", "地球と同じ（時間の遅れなし）"],
            ["必要なエネルギー", "負（エキゾチック物質が必要）"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 12. ワームホール：埋め込み図                                             */
  /* ================================================================== */
  ANIMS.wormhole = {
    controls: [
      { type: "range", id: "b0", label: "喉の半径 b₀", min: 0, max: 6, step: 0.1, value: 0, log: true, unit: "m" },
      { type: "range", id: "speed", label: "宇宙船の速さ（表示）", min: 0.2, max: 2, step: 0.1, value: 1 },
    ],
    create(ctx, view, P) {
      const stars = makeStars(150);
      let t = 0, u = 0;
      return {
        update(dt) { t += dt; u += dt * 0.18 * P.speed; if (u > 1) u -= 1; },
        draw() {
          drawBg(ctx, view, stars, t);
          const sc = Math.min(view.w * 0.13, view.h * 0.15);
          const proj = makeProj(view, t * 0.15, 1.18, view.w / 2, view.h / 2, sc);
          const b = 0.55, rMax = 3.2;
          const zOf = (r) => b * Math.acosh(Math.max(1, r / b));
          const segs = [];
          // 等半径の円（上下）
          for (const sgn of [1, -1]) {
            for (let k = 0; k <= 14; k++) {
              const r = b + (rMax - b) * (k / 14) ** 1.6;
              const z = sgn * zOf(r);
              const pts = [];
              for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU; pts.push(proj(r * Math.cos(a), r * Math.sin(a), z)); }
              segs.push({ pts, sgn, k });
            }
            // 子午線
            for (let i = 0; i < 24; i++) {
              const a = (i / 24) * TAU, pts = [];
              for (let k = 0; k <= 30; k++) { const r = b + (rMax - b) * (k / 30) ** 1.6; pts.push(proj(r * Math.cos(a), r * Math.sin(a), sgn * zOf(r))); }
              segs.push({ pts, sgn, k: -1 });
            }
          }
          for (const sg of segs) {
            ctx.beginPath(); sg.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            const fade = sg.k < 0 ? 0.28 : 0.2 + 0.4 * (1 - sg.k / 14);
            ctx.strokeStyle = sg.sgn > 0 ? `rgba(79,227,255,${fade})` : `rgba(255,95,168,${fade})`;
            ctx.lineWidth = sg.k === 0 ? 2.2 : 1; ctx.stroke();
          }
          // 宇宙船：上の外側 → 喉 → 下の外側（ℓ = -L..L）
          const Lmax = 2.6, ell = lerp(-Lmax, Lmax, u);
          const r = Math.sqrt(b * b + ell * ell), a0 = 0.6 + t * 0.15 * 0;
          const z = Math.sign(ell || 1e-9) * -zOf(r);
          const [px, py] = proj(r * Math.cos(a0), r * Math.sin(a0), ell < 0 ? zOf(r) : -zOf(r));
          void z;
          glow(ctx, px, py, 20, "rgba(255,211,79,0.9)"); dot(ctx, px, py, 4, "#fff");
          const [tx, ty] = proj(b, 0, 0);
          label(ctx, "喉（スロート）", tx + 12, ty, { size: 11, color: COL.yel });
          label(ctx, "宇宙A", 18, 26, { size: 13, weight: 700, color: COL.cyan });
          label(ctx, "宇宙B（または同じ宇宙の遠く離れた場所）", 18, view.h - 14, { size: 13, weight: 700, color: COL.mag });
        },
        readouts() {
          const b0 = P.b0, M = (b0 * 8.98755e16) / 6.674e-11;
          return [
            ["喉の半径 b₀", `${sci(b0)} m`],
            ["必要な負の質量の目安 b₀c²/G", `${sci(M)} kg`],
            ["木星質量に換算", `${sci(M / 1.898e27)} 個分`],
            ["太陽質量に換算", `${sci(M / 1.989e30)} 個分`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 13. 軌道エレベーター                                                    */
  /* ================================================================== */
  const MATERIALS = {
    steel: { name: "高張力鋼", s: 2.0e9, rho: 7900 },
    kevlar: { name: "アラミド繊維（ケブラー）", s: 3.6e9, rho: 1440 },
    zylon: { name: "PBO繊維（ザイロン）", s: 5.8e9, rho: 1560 },
    cnt: { name: "カーボンナノチューブ（理論値）", s: 6.3e10, rho: 1300 },
    graphene: { name: "グラフェン（理論値）", s: 1.3e11, rho: 2200 },
  };
  ANIMS.spaceelevator = {
    controls: [
      { type: "select", id: "mat", label: "ケーブルの材料", value: "cnt", options: Object.entries(MATERIALS).map(([k, m]) => [k, m.name]) },
      { type: "range", id: "speed", label: "クライマーの速さ（表示）", min: 0.2, max: 3, step: 0.1, value: 1 },
    ],
    create(ctx, view, P) {
      const stars = makeStars(120);
      const GM = 3.986e14, Re = 6.371e6, w = 7.2921e-5, rg = Math.cbrt(GM / (w * w)), rTop = 1.0e8;
      const geff = (r) => GM / (r * r) - w * w * r;
      let t = 0, cl = 0, dir = 1;
      return {
        update(dt) {
          t += dt; cl += dir * dt * 0.06 * P.speed;
          if (cl > 1) { cl = 1; dir = -1; } if (cl < 0) { cl = 0; dir = 1; }
        },
        draw() {
          drawBg(ctx, view, stars, t);
          const leftW = view.w * 0.56;
          const cx = 40 + Math.min(leftW, view.h) * 0.0, cy = view.h / 2;
          const scale = (leftW - 60) / (rTop / Re); // px per Earth radius
          const ang = -0.25 + Math.sin(t * 0.25) * 0.2; // 回転する様子（誇張）
          const toXY = (rRe) => [cx + rRe * scale * Math.cos(ang), cy + rRe * scale * Math.sin(ang)];
          // 静止軌道
          ctx.setLineDash([4, 6]); ctx.strokeStyle = "rgba(109,255,156,0.35)";
          ctx.beginPath(); ctx.arc(cx, cy, (rg / Re) * scale, -1.2, 1.2); ctx.stroke(); ctx.setLineDash([]);
          // 地球
          const er = Math.max(6, scale);
          const eg = ctx.createRadialGradient(cx - er * 0.3, cy - er * 0.3, er * 0.1, cx, cy, er);
          eg.addColorStop(0, "#7fb8ff"); eg.addColorStop(1, "#1d4f9c");
          ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, cy, er, 0, TAU); ctx.fill();
          // ケーブル
          const [x0, y0] = toXY(1), [x1, y1] = toXY(rTop / Re);
          ctx.strokeStyle = "#cfd8e8"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
          ctx.fillStyle = "#9aa8cc"; ctx.fillRect(x1 - 5, y1 - 5, 10, 10);
          label(ctx, "カウンターウェイト", x1, y1 - 12, { align: "right", size: 10, color: COL.dim });
          const [gx, gy] = toXY(rg / Re);
          dot(ctx, gx, gy, 4, COL.grn);
          label(ctx, "静止軌道 36,000 km", gx, gy + 18, { align: "center", size: 10, color: COL.grn });
          // クライマー（地表〜静止軌道を往復）
          const rc = Re + (rg - Re) * (cl * cl * (3 - 2 * cl));
          const [kx, ky] = toXY(rc / Re);
          glow(ctx, kx, ky, 14, "rgba(255,211,79,0.9)"); dot(ctx, kx, ky, 3.5, "#fff");
          label(ctx, "北極上空から見た図（回転は誇張）", 14, 22, { size: 12, color: COL.dim });

          // 実効重力グラフ
          const gx0 = leftW + 30, gw = view.w - gx0 - 20, gy0 = 40, gh = view.h - 90;
          const rMaxG = 6e7;
          const X = (r) => gx0 + ((r - Re) / (rMaxG - Re)) * gw;
          const gMax = 9.8;
          const Y = (g) => gy0 + gh / 2 - (g / gMax) * (gh / 2) * 0.95;
          ctx.strokeStyle = "rgba(160,190,255,0.3)"; ctx.lineWidth = 1; ctx.strokeRect(gx0, gy0, gw, gh);
          ctx.beginPath(); ctx.moveTo(gx0, Y(0)); ctx.lineTo(gx0 + gw, Y(0)); ctx.stroke();
          ctx.strokeStyle = COL.cyan; ctx.lineWidth = 2; ctx.beginPath();
          for (let i = 0; i <= 200; i++) { const r = Re + ((rMaxG - Re) * i) / 200; const yy = Y(geff(r)); i ? ctx.lineTo(X(r), yy) : ctx.moveTo(X(r), yy); }
          ctx.stroke();
          ctx.setLineDash([3, 4]); ctx.strokeStyle = COL.grn; ctx.beginPath(); ctx.moveTo(X(rg), gy0); ctx.lineTo(X(rg), gy0 + gh); ctx.stroke(); ctx.setLineDash([]);
          dot(ctx, X(rc), Y(geff(rc)), 5, COL.yel);
          label(ctx, "実効重力 g_eff (m/s²)", gx0, gy0 - 10, { size: 11, color: COL.dim });
          label(ctx, "9.8", gx0 - 4, Y(9.8) + 4, { size: 10, color: COL.dim, align: "right" });
          label(ctx, "0", gx0 - 4, Y(0) + 4, { size: 10, color: COL.dim, align: "right" });
          label(ctx, "地表", gx0, gy0 + gh + 14, { size: 10, color: COL.dim });
          label(ctx, "静止軌道", X(rg), gy0 + gh + 14, { size: 10, color: COL.grn, align: "center" });
          label(ctx, "6万km", gx0 + gw, gy0 + gh + 14, { size: 10, color: COL.dim, align: "right" });
          label(ctx, "↑ 下向き（地球へ）", gx0 + 6, gy0 + 14, { size: 10, color: COL.dim });
          label(ctx, "↓ 上向き（宇宙へ）", gx0 + 6, gy0 + gh - 6, { size: 10, color: COL.dim });
        },
        readouts() {
          const m = MATERIALS[P.mat];
          const dPhi = (-GM / rg - (w * w * rg * rg) / 2) - (-GM / Re - (w * w * Re * Re) / 2);
          const taper = Math.exp((m.rho / m.s) * dPhi);
          const rc = Re + (rg - Re) * (cl * cl * (3 - 2 * cl));
          return [
            ["比強度 σ/ρ", `${sci(m.s / m.rho / 1e6)} MJ/kg`],
            ["破断長 σ/(ρg)", `${sci(m.s / (m.rho * 9.81) / 1000)} km`],
            ["必要なテーパー比 A(静止軌道)/A(地表)", Math.log10(taper) > 300 ? "∞（計算不能なほど巨大）" : sci(taper)],
            ["クライマーの高度", `${sci((rc - Re) / 1000)} km`],
            ["その高さの実効重力", `${(geff(rc) / 9.81).toFixed(3)} g`],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 14. スペースコロニー：回転による人工重力とコリオリ力                       */
  /* ================================================================== */
  ANIMS.colony = {
    controls: [
      { type: "range", id: "r", label: "半径 r", min: 1, max: 4, step: 0.02, value: 3.5, log: true, unit: "m" },
      { type: "range", id: "rpm", label: "回転数", min: 0.1, max: 10, step: 0.01, value: 0.53, unit: "rpm" },
      { type: "select", id: "frame", label: "見る立場", value: "rotating", options: [["rotating", "住民から（回転系）"], ["inertial", "外から（慣性系）"]] },
      { type: "button", id: "drop", label: "塔の上からボールを落とす" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(80);
      let t = 0, phi = 0;
      let ball = null; // 慣性系での位置（半径1で正規化）
      const H = 0.32; // 塔の高さ（半径に対する割合）
      const TV = 8; // 表示上の1回転の秒数
      const omegaVis = () => TAU / TV;
      const people = Array.from({ length: 14 }, (_, i) => (i / 14) * TAU + rand(-0.1, 0.1));
      const towerAng = -Math.PI / 2;
      return {
        action(id) {
          if (id !== "drop") return;
          const a = towerAng + phi, rr = 1 - H, w = omegaVis();
          ball = { x: rr * Math.cos(a), y: rr * Math.sin(a), vx: -w * rr * Math.sin(a), vy: w * rr * Math.cos(a), landed: false, trail: [], t0: t, tLand: 0 };
        },
        update(dt) {
          t += dt; phi += omegaVis() * dt;
          if (ball && !ball.landed) {
            ball.x += ball.vx * dt; ball.y += ball.vy * dt;
            if (Math.hypot(ball.x, ball.y) >= 1) { const k = 1 / Math.hypot(ball.x, ball.y); ball.x *= k; ball.y *= k; ball.landed = true; ball.tLand = t; ball.phiLand = phi; }
            ball.trail.push([ball.x, ball.y, phi]);
          }
          if (ball && ball.landed && t - ball.tLand > 3) ball = null;
        },
        draw() {
          drawBg(ctx, view, stars, t);
          const R = Math.min(view.w * 0.36, view.h * 0.42), cx = view.w * 0.42, cy = view.h / 2;
          const rotFrame = P.frame === "rotating";
          const view_ang = rotFrame ? 0 : phi; // 描画上の回転
          const tf = (x, y, ph) => { // 慣性系の点 → 表示座標
            const a = rotFrame ? -ph : 0;
            const X = x * Math.cos(a) - y * Math.sin(a), Y = x * Math.sin(a) + y * Math.cos(a);
            return [cx + X * R, cy + Y * R];
          };
          // 地面（内壁）
          ctx.lineWidth = 16; ctx.strokeStyle = "#2c3a5e"; ctx.beginPath(); ctx.arc(cx, cy, R + 8, 0, TAU); ctx.stroke();
          ctx.lineWidth = 3; ctx.strokeStyle = "#5aa86a"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
          // 回転の目印（スポーク）
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * TAU + view_ang;
            ctx.strokeStyle = "rgba(160,190,255,0.12)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a)); ctx.stroke();
          }
          glow(ctx, cx, cy, 30, "rgba(255,240,180,0.5)");
          // 住民
          for (const p0 of people) {
            const a = p0 + view_ang;
            const fx = cx + R * Math.cos(a), fy = cy + R * Math.sin(a);
            const hx = cx + (R - 14) * Math.cos(a), hy = cy + (R - 14) * Math.sin(a);
            ctx.strokeStyle = "#ffd9b8"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(hx, hy); ctx.stroke();
            dot(ctx, cx + (R - 17) * Math.cos(a), cy + (R - 17) * Math.sin(a), 3, "#ffd9b8");
          }
          // 塔
          const ta = towerAng + view_ang;
          ctx.strokeStyle = "#cfd8e8"; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(cx + R * Math.cos(ta), cy + R * Math.sin(ta)); ctx.lineTo(cx + R * (1 - H) * Math.cos(ta), cy + R * (1 - H) * Math.sin(ta)); ctx.stroke();
          label(ctx, "塔", cx + R * (1 - H / 2) * Math.cos(ta) + 10, cy + R * (1 - H / 2) * Math.sin(ta), { size: 11, color: COL.dim });
          // 真下の地点（塔の根元）
          // ボール
          if (ball) {
            ctx.strokeStyle = COL.yel; ctx.lineWidth = 2; ctx.beginPath();
            ball.trail.forEach(([x, y, ph], i) => { const [X, Y] = tf(x, y, ph); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
            ctx.stroke();
            const [bx, by] = tf(ball.x, ball.y, ball.landed ? ball.phiLand : phi);
            if (!(rotFrame && ball.landed)) dot(ctx, bx, by, 5, COL.yel);
            else { const lp = ball.trail[ball.trail.length - 1]; const [X, Y] = tf(lp[0], lp[1], lp[2]); dot(ctx, X, Y, 5, COL.yel); }
          }
          // 回転方向
          arrow(ctx, cx + (R + 30) * Math.cos(0.3), cy + (R + 30) * Math.sin(0.3), cx + (R + 30) * Math.cos(0.6), cy + (R + 30) * Math.sin(0.6), "rgba(160,190,255,0.6)", 2);
          label(ctx, rotFrame ? "住民から見た図（コロニーは止まって見える）" : "外から見た図（コロニーが回転）", 14, 22, { size: 13, weight: 700 });
          const g = ((TAU * P.rpm) / 60) ** 2 * P.r / 9.81;
          label(ctx, `人工重力 ${g.toFixed(2)} g`, view.w - 14, 22, { size: 15, weight: 800, align: "right", color: g > 0.8 && g < 1.2 ? COL.grn : COL.org });
          label(ctx, `表示は実時間の約 ${sci((60 / P.rpm) / TV)} 倍速`, view.w - 14, 40, { size: 11, align: "right", color: COL.dim });
        },
        readouts() {
          const w = (TAU * P.rpm) / 60, g = w * w * P.r;
          const rpm1g = (Math.sqrt(9.81 / P.r) * 60) / TAU;
          return [
            ["人工重力 a = ω²r", `${(g / 9.81).toFixed(3)} g（${g.toFixed(2)} m/s²）`],
            ["1回転の時間", `${sci(60 / P.rpm)} 秒`],
            ["内壁の速さ", `${sci(w * P.r)} m/s`],
            ["この半径で1 gになる回転数", `${rpm1g.toFixed(2)} rpm`],
            ["頭と足の重力差（身長1.7 m）", `${((1.7 / P.r) * 100).toFixed(2)} %`],
            ["快適性の目安（2 rpm以下）", P.rpm <= 2 ? "快適" : P.rpm <= 4 ? "慣れが必要" : "めまいが強い"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 15. ダイソン球                                                         */
  /* ================================================================== */
  ANIMS.dyson = {
    controls: [
      { type: "range", id: "f", label: "被覆率 f", min: 0, max: 100, step: 1, value: 40, unit: "%" },
      { type: "range", id: "rAU", label: "コレクターの軌道半径", min: 0.2, max: 3, step: 0.05, value: 1, unit: "AU" },
    ],
    create(ctx, view, P) {
      const stars = makeStars(120);
      let t = 0;
      const sats = Array.from({ length: 900 }, () => ({ inc: rand(-1.4, 1.4), node: rand(0, TAU), ph: rand(0, TAU), sp: rand(0.15, 0.4), rr: rand(0.92, 1.08) }));
      const Lsun = 3.828e26, sig = 5.670e-8, AU = 1.496e11;
      const shellT = () => Math.pow(Lsun / (4 * Math.PI * (P.rAU * AU) ** 2 * sig), 0.25);
      return {
        update(dt) { t += dt; },
        draw() {
          drawBg(ctx, view, stars, t);
          const f = P.f / 100;
          const cx = view.w * 0.27, cy = view.h * 0.5, Rv = Math.min(view.w * 0.2, view.h * 0.36) * (0.55 + 0.45 * P.rAU / 3);
          glow(ctx, cx, cy, Rv * 0.9, `rgba(255,220,120,${0.9 * (1 - f) + 0.05})`);
          dot(ctx, cx, cy, Rv * 0.16, `rgba(255,243,192,${1 - f * 0.85})`);
          // 赤外の輝き
          glow(ctx, cx, cy, Rv * 1.35, `rgba(255,80,40,${0.55 * f})`);
          const n = Math.round(sats.length * f);
          for (let i = 0; i < n; i++) {
            const s = sats[i];
            const a = s.ph + t * s.sp;
            const x0 = Math.cos(a), y0 = Math.sin(a);
            const y1 = y0 * Math.cos(s.inc), z1 = y0 * Math.sin(s.inc);
            const X = x0 * Math.cos(s.node) - y1 * Math.sin(s.node), Y = x0 * Math.sin(s.node) + y1 * Math.cos(s.node);
            const px = cx + X * Rv * s.rr, py = cy + (Y * 0.45 + z1 * 0.85) * Rv * s.rr;
            const front = Y > 0;
            ctx.fillStyle = front ? "rgba(140,170,220,0.95)" : "rgba(255,140,90,0.55)";
            ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
          }
          label(ctx, `コレクター ${n} 基（表示上）`, cx, view.h - 14, { align: "center", size: 11, color: COL.dim });

          // スペクトル
          const gx = view.w * 0.54, gw = view.w * 0.42, gy = 46, gh = view.h - 100;
          ctx.strokeStyle = "rgba(160,190,255,0.3)"; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);
          const lmin = -1, lmax = 2.3; // log10(μm)
          const X = (l) => gx + ((l - lmin) / (lmax - lmin)) * gw;
          const shape = (lumFrac, T, l) => { const lam = 10 ** l * 1e-6; const x = (6.626e-34 * 2.998e8) / (lam * 1.381e-23 * T); return x > 700 ? 0 : (lumFrac * (15 / Math.PI ** 4) * x ** 4) / Math.expm1(x); };
          const Ts = shellT();
          const peak = 0.75;
          const Y = (v) => gy + gh - (v / peak) * gh * 0.95;
          // 可視光帯
          ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(X(Math.log10(0.38)), gy, X(Math.log10(0.75)) - X(Math.log10(0.38)), gh);
          label(ctx, "可視光", (X(Math.log10(0.38)) + X(Math.log10(0.75))) / 2, gy + 14, { size: 10, align: "center", color: COL.dim });
          const curve = (fn, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); for (let i = 0; i <= 240; i++) { const l = lmin + ((lmax - lmin) * i) / 240; const yy = Y(fn(l)); i ? ctx.lineTo(X(l), yy) : ctx.moveTo(X(l), yy); } ctx.stroke(); };
          curve((l) => shape(1 - f, 5772, l), "rgba(255,220,120,0.9)", 1.5);
          curve((l) => shape(f, Ts, l), "rgba(255,110,70,0.9)", 1.5);
          curve((l) => shape(1 - f, 5772, l) + shape(f, Ts, l), "#fff", 2.2);
          for (const v of [0.1, 1, 10, 100]) label(ctx, `${v}`, X(Math.log10(v)), gy + gh + 14, { size: 10, align: "center", color: COL.dim });
          label(ctx, "波長 λ (μm)", gx + gw, gy + gh + 28, { size: 10, align: "right", color: COL.dim });
          label(ctx, "外から見たスペクトル λL_λ", gx, gy - 12, { size: 11, color: COL.dim });
          label(ctx, "— 恒星の光（透過分）", gx + gw - 6, gy + 30, { size: 10, align: "right", color: "rgba(255,220,120,0.9)" });
          label(ctx, `— コレクターの熱放射（${Ts.toFixed(0)} K）`, gx + gw - 6, gy + 44, { size: 10, align: "right", color: "rgba(255,110,70,0.95)" });
          label(ctx, "— 合計", gx + gw - 6, gy + 58, { size: 10, align: "right", color: "#fff" });
        },
        readouts() {
          const P_ = (P.f / 100) * Lsun, T = shellT();
          return [
            ["集めるエネルギー", `${sci(P_)} W`],
            ["人類の消費量（約19 TW）の", `${sci(P_ / 1.9e13)} 倍`],
            ["コレクターの温度", `${T.toFixed(0)} K（${(T - 273.15).toFixed(0)} °C）`],
            ["熱放射のピーク波長", `${(2898 / T).toFixed(1)} μm`],
            ["カルダシェフ指数 K", P_ > 0 ? ((Math.log10(P_) - 6) / 10).toFixed(2) : "—"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 16. コールドスリープ：結晶化とガラス化                                    */
  /* ================================================================== */
  ANIMS.coldsleep = {
    controls: [
      { type: "range", id: "rate", label: "冷却速度", min: 0, max: 5, step: 0.1, value: 2, log: true, unit: "°C/分" },
      { type: "select", id: "cpa", label: "凍結保護剤", value: "yes", options: [["yes", "高濃度で使う（ガラス化液）"], ["no", "使わない"]] },
    ],
    create(ctx, view, P) {
      let t = 0, temp = 37, mode = null, crystals = [], phase = 0;
      const N = 240;
      const mol = Array.from({ length: N }, () => {
        const a = rand(0, TAU), r = Math.sqrt(Math.random()) * 0.95;
        return { bx: r * Math.cos(a), by: r * Math.sin(a), x: 0, y: 0, ph: rand(0, TAU), lock: null };
      });
      const critical = () => (P.cpa === "yes" ? 2.5 : 1e7); // °C/分
      const reset = () => {
        temp = 37; phase = 0; crystals = []; mode = null;
        mol.forEach((m) => (m.lock = null));
      };
      reset();
      return {
        update(dt) {
          t += dt; phase += dt;
          if (phase < 1) temp = 37;
          else if (temp > -196) temp = Math.max(-196, 37 - (phase - 1) * 45);
          else if (phase > 9.5) reset();
          if (mode === null && temp < (P.cpa === "yes" ? -40 : -5)) {
            mode = P.rate >= critical() ? "glass" : "crystal";
            if (mode === "crystal") for (let i = 0; i < 4; i++) crystals.push({ x: rand(-0.4, 0.4), y: rand(-0.4, 0.4), a: rand(0, TAU), len: 0 });
          }
          if (mode === "crystal") for (const c of crystals) c.len = Math.min(0.5, c.len + dt * 0.18 * clamp(Math.log10(1e3 / P.rate + 1), 0.4, 1.6));
        },
        draw() {
          ctx.fillStyle = "#06101c"; ctx.fillRect(0, 0, view.w, view.h);
          const R = Math.min(view.w * 0.3, view.h * 0.4), cx = view.w * 0.38, cy = view.h / 2;
          const cold = clamp((37 - temp) / 233, 0, 1);
          // 細胞膜
          const broken = mode === "crystal" && crystals.some((c) => c.len > 0.38);
          ctx.lineWidth = 3;
          ctx.strokeStyle = broken ? COL.red : mode === "glass" ? COL.cyan : "#ffb3c8";
          ctx.beginPath();
          for (let i = 0; i <= 120; i++) {
            const a = (i / 120) * TAU;
            let rr = 1 + 0.02 * Math.sin(a * 5 + t);
            if (broken) for (const c of crystals) for (let k = 0; k < 6; k++) {
              const ca = c.a + (k * Math.PI) / 3;
              const tipx = c.x + Math.cos(ca) * c.len * 1.4, tipy = c.y + Math.sin(ca) * c.len * 1.4;
              if (Math.hypot(tipx, tipy) > 0.95) { const d = Math.abs(((a - Math.atan2(tipy, tipx) + 3 * Math.PI) % TAU) - Math.PI); if (d < 0.08) rr += 0.12 * (1 - d / 0.08); }
            }
            const X = cx + Math.cos(a) * R * rr, Y = cy + Math.sin(a) * R * rr;
            i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
          }
          ctx.stroke();
          // 結晶
          if (mode === "crystal") {
            for (const c of crystals) {
              for (let k = 0; k < 6; k++) {
                const ca = c.a + (k * Math.PI) / 3, L = c.len * 1.4;
                const x0 = cx + c.x * R, y0 = cy + c.y * R;
                ctx.strokeStyle = "rgba(220,240,255,0.95)"; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(ca) * L * R, y0 + Math.sin(ca) * L * R); ctx.stroke();
                for (let s = 0.3; s < 1; s += 0.25) {
                  const bx = x0 + Math.cos(ca) * L * R * s, by = y0 + Math.sin(ca) * L * R * s, bl = L * R * 0.25 * (1 - s);
                  ctx.lineWidth = 1.5;
                  for (const sg of [-1, 1]) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ca + sg * 0.9) * bl, by + Math.sin(ca + sg * 0.9) * bl); ctx.stroke(); }
                }
              }
            }
          }
          // 水分子
          const amp = mode === "glass" || mode === "crystal" ? 0 : 0.035 * (1 - cold) + 0.004;
          for (const m of mol) {
            let x = m.bx + Math.sin(t * 7 + m.ph) * amp, y = m.by + Math.cos(t * 6 + m.ph * 1.3) * amp;
            if (mode === "crystal") {
              let best = null, bd = 1e9;
              for (const c of crystals) { const d = Math.hypot(m.bx - c.x, m.by - c.y); if (d < c.len * 1.2 && d < bd) { bd = d; best = c; } }
              if (best) { const ang = Math.round((Math.atan2(m.by - best.y, m.bx - best.x) - best.a) / (Math.PI / 3)) * (Math.PI / 3) + best.a; x = best.x + Math.cos(ang) * bd; y = best.y + Math.sin(ang) * bd; }
            }
            const col = mode === "glass" ? "rgba(140,220,255,0.85)" : mode === "crystal" ? "rgba(200,225,255,0.8)" : `rgba(${lerp(255, 120, cold)},${lerp(140, 190, cold)},${lerp(120, 255, cold)},0.85)`;
            dot(ctx, cx + x * R, cy + y * R, 2.6, col);
          }
          // 温度計
          const tx = view.w * 0.78, ty0 = 40, ty1 = view.h - 50;
          const TY = (T) => lerp(ty1, ty0, (T + 196) / 233);
          ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(tx - 6, ty0, 12, ty1 - ty0);
          ctx.fillStyle = temp > 0 ? COL.org : COL.cyan; ctx.fillRect(tx - 6, TY(temp), 12, ty1 - TY(temp));
          for (const [T, nm] of [[37, "37 °C 体温"], [0, "0 °C"], [-130, "−130 °C ガラス転移付近"], [-196, "−196 °C 液体窒素"]]) {
            ctx.strokeStyle = COL.dim; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx - 10, TY(T)); ctx.lineTo(tx + 10, TY(T)); ctx.stroke();
            label(ctx, nm, tx + 14, TY(T) + 4, { size: 10, color: COL.dim });
          }
          label(ctx, `${temp.toFixed(0)} °C`, tx, ty0 - 12, { size: 16, weight: 800, align: "center" });
          const msg = mode === "glass" ? "ガラス化：結晶ができず、細胞はそのままの形で固まった" : mode === "crystal" ? (broken ? "氷の結晶が細胞膜を突き破った" : "氷の結晶が成長中…") : temp > 0 ? "冷却中：分子の熱運動が弱まっていく" : "0 °C以下に冷却中…";
          label(ctx, msg, 14, view.h - 14, { size: 12, weight: 700, color: mode === "glass" ? COL.cyan : broken ? COL.red : COL.text });
          label(ctx, "細胞の模式図（点は水分子）", 14, 22, { size: 12, color: COL.dim });
        },
        readouts() {
          const q = temp > 0 ? Math.pow(2.5, (temp - 37) / 10) : 0;
          return [
            ["現在の温度", `${temp.toFixed(0)} °C`],
            ["代謝の速さ（37 °C比, Q₁₀=2.5）", temp > 0 ? `${(q * 100).toFixed(1)} %` : "ほぼ停止"],
            ["冷却速度", `${sci(P.rate)} °C/分`],
            ["ガラス化に必要な臨界速度", P.cpa === "yes" ? "約2.5 °C/分（VS55などの例）" : "約10⁷ °C/分以上（純水）"],
            ["結果", mode === null ? "—" : mode === "glass" ? "ガラス化" : "結晶化（細胞損傷）"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 17. タイムパラドックス：ポルチンスキーのビリヤード                         */
  /* ================================================================== */
  ANIMS.timeparadox = {
    controls: [
      { type: "select", id: "mode", label: "衝突のしかた", value: "consistent", options: [["consistent", "かすめて当たる（自己無撞着な解）"], ["paradox", "正面から当たる（矛盾）"]] },
      { type: "range", id: "speed", label: "再生速度", min: 0.3, max: 2, step: 0.1, value: 1 },
    ],
    create(ctx, view, P) {
      let t = 0;
      const T = 6; // 1サイクル（任意時間単位）
      const A = [0.8, 0.5], B = [0.2, 0.22], C = [0.47, 0.62], Y0 = [0.06, 0.9];
      const OFF = [0.62, 0.02], AWAY = [0.15, 1.15];
      const tau = 3; // A に入ると τ だけ過去の B から出る
      const seg = (p, q, s) => [lerp(p[0], q[0], s), lerp(p[1], q[1], s)];
      // 若い玉：0→2でY0→C、2→4でC→A（一貫）／C→AWAY（矛盾）
      const young = (tt) => {
        if (tt < 2) return seg(Y0, C, tt / 2);
        if (P.mode === "consistent") return tt < 4 ? seg(C, A, (tt - 2) / 2) : null;
        return tt < 4.5 ? seg(C, AWAY, (tt - 2) / 2.5) : null;
      };
      // 年老いた玉：4−τ=1 でBから出る → 2でC → 2→4でOFFへ
      const old = (tt) => {
        if (tt < 4 - tau) return null;
        if (tt < 2) return seg(B, C, (tt - 1) / 1);
        return tt < 4.5 ? seg(C, OFF, (tt - 2) / 2.5) : null;
      };
      return {
        update(dt) { t = (t + dt * P.speed) % (T + 1); },
        draw() {
          ctx.fillStyle = "#0b2a1f"; ctx.fillRect(0, 0, view.w, view.h);
          const pad = 30, W = view.w - 2 * pad, H = view.h - 2 * pad - 30;
          const S = (p) => [pad + p[0] * W, pad + 30 + p[1] * H];
          ctx.strokeStyle = "#5a3b1e"; ctx.lineWidth = 8; ctx.strokeRect(pad - 4, pad + 26, W + 8, H + 8);
          // ワームホールの口
          const mouth = (p, name, col) => { const [x, y] = S(p); glow(ctx, x, y, 40, col, 0.7 + 0.2 * Math.sin(t * 4)); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 16, 0, TAU); ctx.stroke(); label(ctx, name, x, y + 34, { align: "center", size: 11, weight: 700 }); };
          mouth(A, "入口A（未来側）", "rgba(255,95,168,0.8)");
          mouth(B, `出口B（${tau}秒前に出る）`, "rgba(79,227,255,0.8)");
          // 予定軌道（薄く）
          ctx.setLineDash([4, 6]); ctx.lineWidth = 1.2;
          const path = (pts, col) => { ctx.strokeStyle = col; ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = S(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); };
          path([Y0, C, P.mode === "consistent" ? A : AWAY], "rgba(255,211,79,0.4)");
          path([B, C, OFF], "rgba(255,140,60,0.4)");
          ctx.setLineDash([]);
          const tt = Math.min(t, T);
          const y = young(tt), o = old(tt);
          const contradiction = P.mode === "paradox" && tt > 2;
          if (y) { const [x, yy] = S(y); dot(ctx, x, yy, 9, COL.yel); label(ctx, "若い玉", x, yy - 14, { align: "center", size: 11, weight: 700, color: COL.yel }); }
          if (o) {
            const [x, yy] = S(o);
            ctx.globalAlpha = contradiction ? 0.35 + 0.35 * Math.abs(Math.sin(t * 10)) : 1;
            dot(ctx, x, yy, 9, COL.org);
            label(ctx, "未来から来た玉", x, yy - 14, { align: "center", size: 11, weight: 700, color: COL.org });
            ctx.globalAlpha = 1;
          }
          if (Math.abs(tt - 2) < 0.12) { const [x, yy] = S(C); glow(ctx, x, yy, 30, "rgba(255,255,255,0.9)"); }
          label(ctx, `時刻 t = ${tt.toFixed(2)}`, pad, 22, { size: 14, weight: 800 });
          if (contradiction) {
            label(ctx, "矛盾！ 若い玉は入口Aに入らない → 未来から来た玉は存在できない", view.w - pad, 22, { align: "right", size: 12, weight: 800, color: COL.red });
          } else if (P.mode === "consistent" && tt > 2) {
            label(ctx, "若い玉は少しそれただけで入口Aへ → 歴史は一貫している", view.w - pad, 22, { align: "right", size: 12, weight: 700, color: COL.grn });
          }
        },
        readouts() {
          const tt = Math.min(t, T);
          return [
            ["時刻", tt.toFixed(2)],
            ["タイムマシンの時間差 τ", `${tau}`],
            ["若い玉が入口Aに入る時刻", P.mode === "consistent" ? "4.00 → 出口Bから 1.00 に出る" : "入らない"],
            ["この歴史は", P.mode === "consistent" ? "自己無撞着（実現しうる）" : "矛盾（実現しない）"],
          ];
        },
      };
    },
  };

  /* ================================================================== */
  /* 18. フェルミのパラドックス：ドレイクの方程式                              */
  /* ================================================================== */
  ANIMS.fermi = {
    controls: [
      { type: "range", id: "R", label: "R*：1年に生まれる恒星の数", min: 0.5, max: 10, step: 0.5, value: 1.5, unit: "個/年" },
      { type: "range", id: "fp", label: "f_p：惑星をもつ割合", min: 0.1, max: 1, step: 0.05, value: 1 },
      { type: "range", id: "ne", label: "n_e：生命が住める惑星の数", min: 0.01, max: 1, step: 0.01, value: 0.2 },
      { type: "range", id: "fl", label: "f_l：生命が誕生する割合", min: -6, max: 0, step: 0.1, value: -1, log: true },
      { type: "range", id: "fi", label: "f_i：知性が生まれる割合", min: -6, max: 0, step: 0.1, value: -1, log: true },
      { type: "range", id: "fc", label: "f_c：通信技術をもつ割合", min: -3, max: 0, step: 0.1, value: -1, log: true },
      { type: "range", id: "L", label: "L：通信を続ける年数", min: 1, max: 9, step: 0.1, value: 4, log: true, unit: "年" },
    ],
    create(ctx, view, P) {
      let t = 0;
      const gstars = Array.from({ length: 1600 }, () => {
        const arm = Math.floor(Math.random() * 2), r = Math.pow(Math.random(), 0.7);
        const a = arm * Math.PI + r * 5.5 + rand(-0.35, 0.35) * (1 - r * 0.4);
        return { r, a, b: rand(0.2, 0.8) };
      });
      const civs = Array.from({ length: 400 }, () => { const s = gstars[Math.floor(Math.random() * gstars.length)]; return { r: s.r, a: s.a, ph: Math.random() }; });
      const Ncalc = () => P.R * P.fp * P.ne * P.fl * P.fi * P.fc * P.L;
      return {
        update(dt) { t += dt; },
        draw() {
          ctx.fillStyle = "#03050c"; ctx.fillRect(0, 0, view.w, view.h);
          const cx = view.w * 0.5, cy = view.h * 0.5, R = Math.min(view.w * 0.42, view.h * 0.46);
          const rot = t * 0.03;
          glow(ctx, cx, cy, R * 0.35, "rgba(255,230,180,0.45)");
          for (const s of gstars) {
            const a = s.a + rot, x = cx + Math.cos(a) * s.r * R, y = cy + Math.sin(a) * s.r * R * 0.62;
            ctx.fillStyle = `rgba(200,210,255,${s.b * 0.6})`; ctx.fillRect(x, y, 1.3, 1.3);
          }
          const N = Ncalc();
          let shown = N >= 1 ? Math.min(civs.length, Math.round(N)) : (Math.random() < N * 0.02 ? 1 : 0);
          if (N < 1) shown = 0;
          const bubble = clamp(Math.log10(P.L) / 9, 0.05, 1) * R * 0.18;
          for (let i = 0; i < shown; i++) {
            const c = civs[i], a = c.a + rot;
            const x = cx + Math.cos(a) * c.r * R, y = cy + Math.sin(a) * c.r * R * 0.62;
            const ph = (t * 0.4 + c.ph) % 1;
            ctx.strokeStyle = `rgba(109,255,156,${0.5 * (1 - ph)})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(x, y, bubble * ph + 1, (bubble * ph + 1) * 0.62, 0, 0, TAU); ctx.stroke();
            dot(ctx, x, y, 2.4, COL.grn);
          }
          // 地球
          const ea = 0.9 + rot, ex = cx + Math.cos(ea) * 0.55 * R, ey = cy + Math.sin(ea) * 0.55 * R * 0.62;
          dot(ctx, ex, ey, 3.5, COL.cyan); label(ctx, "地球", ex + 8, ey + 4, { size: 11, color: COL.cyan });
          label(ctx, `N = ${sci(N)}`, 14, 30, { size: 22, weight: 800, color: N >= 1 ? COL.grn : COL.org });
          label(ctx, N >= 1 ? "銀河系で今、電波を出している文明の数" : "銀河系にいま交信可能な文明はほぼ「いない」", 14, 50, { size: 11, color: COL.dim });
          if (N > civs.length) label(ctx, `（表示は ${civs.length} 個まで）`, 14, 66, { size: 10, color: COL.dim });
        },
        readouts() {
          const N = Ncalc();
          const V = Math.PI * 5e4 ** 2 * 1e3;
          const d = N >= 1 ? Math.cbrt(V / N) : NaN;
          return [
            ["N（交信可能な文明の数）", sci(N)],
            ["文明どうしの平均距離", N >= 1 ? `${sci(d)} 光年` : "—"],
            ["往復の通信時間 vs 寿命 L", N >= 1 ? (2 * d < P.L ? `${sci(2 * d)} 年 < L：会話できる` : `${sci(2 * d)} 年 > L：返事が来る前に滅ぶ`) : "—"],
            ["光速の1%で銀河を植民するのに", "約1,000万年（銀河の年齢の0.1%）"],
          ];
        },
      };
    },
  };

  window.ANIMS = ANIMS;
})();
