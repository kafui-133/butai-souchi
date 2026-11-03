/* 舞台装置 — SF概念図鑑 : 画面構成・ルーティング・アニメーション制御 */
(function () {
  "use strict";

  const CONCEPTS = window.CONCEPTS;
  const LEVELS = window.LEVELS;
  const ANIMS = window.ANIMS;
  const sci = window.sci;

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, html) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    if (html != null) e.innerHTML = html;
    return e;
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- 数式 ---------- */
  function renderTex(node, tex) {
    if (window.katex) {
      try {
        window.katex.render(tex, node, { displayMode: true, throwOnError: false, strict: false, output: "html" });
        return;
      } catch (_) { /* フォールバックへ */ }
    }
    node.classList.add("tex-fallback");
    node.textContent = tex;
  }

  /* ---------- 実現可能性メーター ---------- */
  function meter(level) {
    const m = el("span", { class: "meter", role: "img", "aria-label": `${LEVELS[level].label}（5段階中${level + 1}）` });
    for (let i = 0; i < 5; i++) m.appendChild(el("span", { class: `seg${i <= level ? " on lv" + level : ""}` }));
    return m;
  }

  /* ---------- サイドバー ---------- */
  function buildNav() {
    const list = $("#navList");
    list.innerHTML = "";
    CONCEPTS.forEach((c, i) => {
      const li = el("li");
      const a = el("a", { href: `#${c.id}`, "data-id": c.id },
        `<span class="nav-num">${String(i + 1).padStart(2, "0")}</span><span class="nav-text"><span class="nav-title">${esc(c.title)}</span><span class="nav-cat">${esc(c.category)}</span></span>`);
      li.appendChild(a);
      list.appendChild(li);
    });
    const legend = $("#legendList");
    LEVELS.forEach((L, i) => {
      const li = el("li");
      li.appendChild(meter(i));
      li.appendChild(el("span", {}, `${esc(L.label)}`));
      li.title = L.desc;
      legend.appendChild(li);
    });
    $("#search").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      list.querySelectorAll("a").forEach((a) => {
        const c = CONCEPTS.find((x) => x.id === a.dataset.id);
        const hay = [c.title, c.en, c.category, c.kind, c.tagline, ...(c.works || []), ...c.origins.map((o) => o.title)].join(" ").toLowerCase();
        a.parentElement.hidden = q && !hay.includes(q);
      });
      if (!location.hash || location.hash === "#") renderHome(q);
    });
    $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  }

  /* ---------- アニメーション ---------- */
  let current = null; // { raf, ro, io, timer }
  function stopAnim() {
    if (!current) return;
    cancelAnimationFrame(current.raf);
    clearInterval(current.timer);
    current.ro && current.ro.disconnect();
    current.io && current.io.disconnect();
    current = null;
  }

  function mountAnimation(concept, host) {
    const def = ANIMS[concept.id];
    if (!def) return;
    const wrap = el("div", { class: "stage" });
    const canvasBox = el("div", { class: "canvas-box" });
    const canvas = el("canvas", { "aria-label": `${concept.title}のアニメーション`, role: "img" });
    canvasBox.appendChild(canvas);
    const toolbar = el("div", { class: "stage-tools" });
    const playBtn = el("button", { class: "tool-btn", type: "button" }, "❚❚ 一時停止");
    const resetBtn = el("button", { class: "tool-btn", type: "button" }, "↺ リセット");
    toolbar.append(playBtn, resetBtn);

    const side = el("div", { class: "stage-side" });
    const controls = el("div", { class: "controls" });
    const readouts = el("dl", { class: "readouts" });
    side.append(toolbar, el("h3", { class: "side-h" }, "パラメータ"), controls, el("h3", { class: "side-h" }, "計算結果"), readouts);
    wrap.append(canvasBox, side);
    host.appendChild(wrap);

    const P = {};
    const inputs = {};
    const fmtVal = (c, v) => {
      if (c.log) return `${sci(10 ** v)} ${c.unit || ""}`;
      const dec = (String(c.step).split(".")[1] || "").length;
      return `${Number(v).toFixed(dec)}${c.unit ? " " + c.unit : ""}`;
    };
    const setParam = (c, raw) => {
      const v = Number(raw);
      P[c.id] = c.log ? 10 ** v : v;
      if (inputs[c.id]) { inputs[c.id].input.value = v; inputs[c.id].out.textContent = fmtVal(c, v); }
    };

    let inst;
    const ctx = canvas.getContext("2d");
    const view = { w: 600, h: 360 };

    def.controls.forEach((c) => {
      if (c.type === "range") {
        const id = `ctl-${concept.id}-${c.id}`;
        const row = el("div", { class: "ctl" });
        const lab = el("label", { for: id }, `<span>${esc(c.label)}</span>`);
        const out = el("output", { for: id });
        lab.appendChild(out);
        const input = el("input", { type: "range", id, min: c.min, max: c.max, step: c.step, value: c.value });
        input.addEventListener("input", () => setParam(c, input.value));
        row.append(lab, input);
        controls.appendChild(row);
        inputs[c.id] = { input, out };
        setParam(c, c.value);
      } else if (c.type === "select") {
        const id = `ctl-${concept.id}-${c.id}`;
        const row = el("div", { class: "ctl" });
        const sel = el("select", { id });
        c.options.forEach(([v, t]) => sel.appendChild(el("option", { value: v }, esc(t))));
        sel.value = c.value;
        P[c.id] = c.value;
        sel.addEventListener("change", () => (P[c.id] = sel.value));
        row.append(el("label", { for: id }, `<span>${esc(c.label)}</span>`), sel);
        controls.appendChild(row);
      } else if (c.type === "button") {
        const b = el("button", { class: "action-btn", type: "button" }, esc(c.label));
        b.addEventListener("click", () => {
          const upd = inst && inst.action && inst.action(c.id);
          if (upd) for (const [k, v] of Object.entries(upd)) {
            const cd = def.controls.find((x) => x.id === k);
            if (cd) setParam(cd, v);
          }
        });
        controls.appendChild(b);
      }
    });

    function resize() {
      const r = canvasBox.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      view.w = Math.max(280, r.width);
      view.h = Math.max(240, r.height);
      canvas.width = Math.round(view.w * dpr);
      canvas.height = Math.round(view.h * dpr);
      canvas.style.width = view.w + "px";
      canvas.style.height = view.h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const create = () => { inst = def.create(ctx, view, P); };
    create();

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let playing = !reduce, visible = true, last = performance.now();
    const updatePlayLabel = () => (playBtn.textContent = playing ? "❚❚ 一時停止" : "▶ 再生");
    updatePlayLabel();
    playBtn.addEventListener("click", () => { playing = !playing; updatePlayLabel(); });
    resetBtn.addEventListener("click", () => {
      def.controls.forEach((c) => {
        if (c.type === "range") setParam(c, c.value);
        if (c.type === "select") { P[c.id] = c.value; $(`#ctl-${concept.id}-${c.id}`).value = c.value; }
      });
      create();
    });

    const writeReadouts = () => {
      const rows = inst.readouts ? inst.readouts() : [];
      readouts.innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    };

    current = { raf: 0 };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        if (playing) inst.update(dt);
        inst.draw();
      }
      current.raf = requestAnimationFrame(loop);
    };
    inst.draw();
    writeReadouts();
    current.raf = requestAnimationFrame(loop);
    current.timer = setInterval(() => visible && writeReadouts(), 150);
    current.ro = new ResizeObserver(() => { resize(); inst.draw(); });
    current.ro.observe(canvasBox);
    current.io = new IntersectionObserver((ents) => { visible = ents[0].isIntersecting; });
    current.io.observe(canvasBox);
  }

  /* ---------- ホーム ---------- */
  function renderHome(filter = "") {
    stopAnim();
    const main = $("#main");
    main.innerHTML = "";
    const hero = el("section", { class: "home-hero" }, `
      <p class="eyebrow">SF CONCEPT ENCYCLOPEDIA</p>
      <h1>SFの<span class="grad">舞台装置</span>を、物理で読み解く。</h1>
      <p class="lead">並行世界、量子もつれ、ウラシマ効果、反物質……。物語を動かす概念やマクガフィンを、<b>動くアニメーション</b>・<b>出典と元ネタ</b>・<b>数式と物理</b>・<b>現時点での実現可能性</b>の4つの視点から解説します。</p>`);
    main.appendChild(hero);
    const grid = el("div", { class: "card-grid" });
    const q = filter.toLowerCase();
    CONCEPTS.forEach((c, i) => {
      const hay = [c.title, c.en, c.category, c.kind, c.tagline, ...(c.works || [])].join(" ").toLowerCase();
      if (q && !hay.includes(q)) return;
      const card = el("a", { class: "card", href: `#${c.id}`, style: `--i:${i}` });
      card.innerHTML = `
        <div class="card-top"><span class="chip">${esc(c.kind)}</span><span class="chip ghost">${esc(c.category)}</span></div>
        <h2>${esc(c.title)}</h2>
        <p class="card-en">${esc(c.en)}</p>
        <p class="card-tag">${esc(c.tagline)}</p>`;
      const feas = el("div", { class: "card-feas" });
      c.feasibility.items.forEach((it) => {
        const row = el("div", { class: "card-feas-row", title: `${it.label}：${LEVELS[it.level].label}` });
        row.appendChild(meter(it.level));
        row.appendChild(el("span", {}, esc(it.label)));
        feas.appendChild(row);
      });
      card.appendChild(feas);
      grid.appendChild(card);
    });
    if (!grid.children.length) grid.appendChild(el("p", { class: "empty" }, "該当する概念が見つかりませんでした。"));
    main.appendChild(grid);
    main.appendChild(el("p", { class: "footnote" }, "※ 物理量の数値は代表的な文献値・概算です。作品の年は初出（雑誌掲載・放送開始など）を基準としています。"));
    setActive(null);
  }

  /* ---------- 詳細ページ ---------- */
  function renderConcept(c) {
    stopAnim();
    const main = $("#main");
    main.innerHTML = "";
    const idx = CONCEPTS.indexOf(c);

    const head = el("header", { class: "c-head" }, `
      <div class="card-top"><span class="chip">${esc(c.kind)}</span><span class="chip ghost">${esc(c.category)}</span></div>
      <h1>${esc(c.title)}</h1>
      <p class="c-en">${esc(c.en)}</p>
      <p class="c-tag">${esc(c.tagline)}</p>`);
    main.appendChild(head);

    // アニメーション
    const animSec = el("section", { class: "sec sec-anim" });
    animSec.appendChild(el("h2", { class: "sec-h" }, `<span class="sec-num">01</span>アニメーションで見る`));
    mountAnimation(c, animSec);
    animSec.appendChild(el("p", { class: "anim-note" }, c.animNote));
    main.appendChild(animSec);

    // 概要
    const sum = el("section", { class: "sec" });
    sum.appendChild(el("h2", { class: "sec-h" }, `<span class="sec-num">02</span>概要`));
    c.summary.forEach((p) => sum.appendChild(el("p", { class: "prose" }, p)));
    main.appendChild(sum);

    // 出典
    const ori = el("section", { class: "sec" });
    ori.appendChild(el("h2", { class: "sec-h" }, `<span class="sec-num">03</span>出典・元ネタ`));
    const tl = el("ol", { class: "timeline" });
    c.origins.forEach((o) => tl.appendChild(el("li", {}, `<span class="tl-year">${esc(o.year)}</span><div><b>${esc(o.title)}</b><p>${esc(o.note)}</p></div>`)));
    ori.appendChild(tl);
    main.appendChild(ori);

    // 物理と数式
    const phy = el("section", { class: "sec" });
    phy.appendChild(el("h2", { class: "sec-h" }, `<span class="sec-num">04</span>物理と数式`));
    const pg = el("div", { class: "phys-grid" });
    c.physics.forEach((f) => {
      const card = el("article", { class: "phys" });
      card.appendChild(el("h3", {}, esc(f.heading)));
      const tex = el("div", { class: "tex" });
      renderTex(tex, f.tex);
      card.appendChild(tex);
      card.appendChild(el("p", {}, f.body));
      pg.appendChild(card);
    });
    phy.appendChild(pg);
    main.appendChild(phy);

    // 実現可能性
    const fe = el("section", { class: "sec" });
    fe.appendChild(el("h2", { class: "sec-h" }, `<span class="sec-num">05</span>現時点での実現可能性`));
    const fl = el("ul", { class: "feas-list" });
    c.feasibility.items.forEach((it) => {
      const li = el("li");
      li.appendChild(el("span", { class: "feas-label" }, esc(it.label)));
      li.appendChild(meter(it.level));
      li.appendChild(el("span", { class: `feas-verdict lv${it.level}` }, esc(LEVELS[it.level].label)));
      fl.appendChild(li);
    });
    fe.appendChild(fl);
    fe.appendChild(el("p", { class: "prose" }, c.feasibility.body));
    if (c.feasibility.milestones && c.feasibility.milestones.length) {
      fe.appendChild(el("h3", { class: "sub-h" }, "主なマイルストーン"));
      const ms = el("ol", { class: "timeline compact" });
      c.feasibility.milestones.forEach((m) => ms.appendChild(el("li", {}, `<span class="tl-year">${esc(m.year)}</span><div><p>${esc(m.text)}</p></div>`)));
      fe.appendChild(ms);
    }
    main.appendChild(fe);

    // 関連作品
    if (c.works && c.works.length) {
      const wk = el("section", { class: "sec" });
      wk.appendChild(el("h2", { class: "sec-h" }, `<span class="sec-num">06</span>登場・関連する作品`));
      const chips = el("div", { class: "works" });
      c.works.forEach((w) => chips.appendChild(el("span", { class: "chip ghost" }, esc(w))));
      wk.appendChild(chips);
      main.appendChild(wk);
    }

    // 前後ナビ
    const prev = CONCEPTS[(idx - 1 + CONCEPTS.length) % CONCEPTS.length];
    const next = CONCEPTS[(idx + 1) % CONCEPTS.length];
    main.appendChild(el("nav", { class: "pager" }, `
      <a href="#${prev.id}"><small>← 前へ</small>${esc(prev.title)}</a>
      <a href="#" class="pager-home">一覧へ</a>
      <a href="#${next.id}" class="next"><small>次へ →</small>${esc(next.title)}</a>`));

    setActive(c.id);
    document.title = `${c.title} — 舞台装置`;
  }

  function setActive(id) {
    document.querySelectorAll("#navList a").forEach((a) => a.classList.toggle("active", a.dataset.id === id));
    if (!id) document.title = "舞台装置 — SF概念図鑑";
  }

  function route() {
    const id = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const c = CONCEPTS.find((x) => x.id === id);
    document.body.classList.remove("nav-open");
    if (c) renderConcept(c);
    else renderHome($("#search").value.trim());
    window.scrollTo({ top: 0 });
    $("#main").focus({ preventScroll: true });
  }

  function init() {
    buildNav();
    window.addEventListener("hashchange", route);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
