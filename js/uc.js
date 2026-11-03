/* 宇宙世紀 年表アニメーション */
(function () {
  "use strict";
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);


  /* ---------- 大陸の簡略ポリゴン [経度, 緯度] ---------- */
  const LAND = [
    [[-168,66],[-156,71],[-128,70],[-95,72],[-80,73],[-62,60],[-56,52],[-66,45],[-70,42],[-76,35],[-81,31],[-80,25],[-82,30],[-90,29],[-97,26],[-97,21],[-92,18],[-87,21],[-88,15],[-83,9],[-78,8],[-86,12],[-92,14],[-105,20],[-110,24],[-112,31],[-117,32],[-124,40],[-124,48],[-135,57],[-150,60],[-165,60]],
    [[-73,78],[-60,82],[-30,83],[-20,75],[-22,70],[-42,60],[-50,64],[-55,70]],
    [[-80,9],[-77,1],[-81,-5],[-76,-14],[-71,-18],[-71,-30],[-74,-42],[-75,-52],[-68,-55],[-65,-45],[-58,-38],[-53,-34],[-48,-26],[-41,-22],[-39,-14],[-35,-7],[-50,0],[-60,8],[-72,12]],
    [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[8,54],[10,57],[5,62],[15,69],[28,71],[40,67],[60,69],[70,73],[80,73],[100,77],[115,74],[140,72],[160,70],[180,68],[178,62],[163,60],[156,51],[142,54],[140,47],[135,43],[129,35],[122,40],[121,31],[118,24],[109,21],[106,10],[100,13],[103,1],[98,8],[97,17],[92,22],[88,22],[80,15],[77,8],[72,21],[66,25],[57,25],[56,27],[52,24],[56,18],[52,16],[44,12],[39,22],[35,28],[34,31],[36,36],[28,37],[26,40],[23,36],[20,40],[13,45],[18,40],[16,38],[12,42],[8,44],[3,43],[-1,37],[-6,36]],
    [[-17,21],[-17,15],[-15,11],[-8,4],[5,5],[9,4],[9,-1],[12,-6],[13,-12],[12,-18],[15,-27],[18,-34],[25,-34],[32,-28],[35,-22],[40,-15],[40,-5],[43,0],[51,11],[43,12],[37,20],[33,31],[20,31],[10,37],[-1,35],[-6,35],[-10,30]],
    [[114,-22],[114,-34],[123,-34],[131,-31],[138,-35],[141,-38],[147,-38],[150,-36],[153,-28],[153,-25],[146,-19],[142,-11],[140,-17],[136,-12],[130,-12],[126,-14],[122,-18]],
    [[-5,50],[1,51],[2,53],[-3,56],[-5,58],[-6,56],[-3,54],[-5,52]],
    [[-10,52],[-6,52],[-6,55],[-10,54]],
    [[130,31],[132,34],[135,34],[140,35],[141,38],[142,43],[145,44],[140,41],[139,38],[136,36],[132,35]],
    [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
    [[109,1],[118,7],[119,1],[116,-4],[110,-3]],
    [[95,5],[106,-6],[102,-4]],
    [[131,-1],[141,-3],[150,-10],[141,-9],[138,-8]],
    [[120,18],[122,18],[124,13],[126,7],[125,6],[122,8],[121,14]],
    [[166,-46],[174,-41],[178,-38],[173,-35],[172,-41],[167,-46]],
    [[-24,66],[-14,66],[-14,64],[-22,63]],
  ];
  // 南極
  const ant = [];
  for (let lon = -180; lon <= 180; lon += 10) ant.push([lon, -68 + 3 * Math.sin(lon * D2R * 3)]);
  ant.push([180, -90], [-180, -90]);
  LAND.push(ant);

  const MW = 720, MH = 360;
  const mask = (() => {
    const c = document.createElement("canvas");
    c.width = MW; c.height = MH;
    const g = c.getContext("2d");
    g.fillStyle = "#000"; g.fillRect(0, 0, MW, MH);
    g.fillStyle = "#fff";
    for (const poly of LAND) {
      g.beginPath();
      poly.forEach(([lo, la], i) => { const x = ((lo + 180) / 360) * MW, y = ((90 - la) / 180) * MH; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.closePath(); g.fill();
    }
    const d = g.getImageData(0, 0, MW, MH).data;
    const m = new Uint8Array(MW * MH);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4] > 127 ? 1 : 0;
    return m;
  })();

  /* ---------- 地球のレンダリング（正射図法） ---------- */
  const GS = 360;
  const globeCanvas = document.createElement("canvas");
  globeCanvas.width = GS; globeCanvas.height = GS;
  const gctx = globeCanvas.getContext("2d");
  const gimg = gctx.createImageData(GS, GS);
  let lastLon = NaN, lastLat = NaN;
  function renderGlobe(lon0, lat0) {
    if (Math.abs(lon0 - lastLon) < 0.05 && Math.abs(lat0 - lastLat) < 0.05) return;
    lastLon = lon0; lastLat = lat0;
    const d = gimg.data, R = GS / 2;
    const cl = Math.cos(lat0 * D2R), sl = Math.sin(lat0 * D2R);
    const Lx = -0.45, Ly = 0.35, Lz = 0.82;
    for (let j = 0; j < GS; j++) for (let i = 0; i < GS; i++) {
      const o = (j * GS + i) * 4;
      const x = (i - R + 0.5) / R, y = -(j - R + 0.5) / R, rr = x * x + y * y;
      if (rr > 1) { d[o + 3] = 0; continue; }
      const z = Math.sqrt(1 - rr);
      const lat = Math.asin(clamp(y * cl + z * sl, -1, 1));
      let lon = lon0 * D2R + Math.atan2(x, z * cl - y * sl);
      let lond = (lon / D2R + 540) % 360 - 180, latd = lat / D2R;
      const mx = Math.floor(((lond + 180) / 360) * MW) % MW, my = clamp(Math.floor(((90 - latd) / 180) * MH), 0, MH - 1);
      const land = mask[my * MW + mx];
      let r, g, b;
      if (land) {
        if (Math.abs(latd) > 66) { r = 225; g = 232; b = 240; }
        else { const dry = Math.abs(Math.abs(latd) - 25) < 10 ? 1 : 0; r = dry ? 170 : 70; g = dry ? 150 : 135; b = dry ? 95 : 70; }
      } else { r = 18; g = 70; b = 140; }
      const grid = (Math.abs(((latd + 90) % 30) - 15) > 14.6 || Math.abs(((lond + 180) % 30) - 15) > 14.6) ? 1.18 : 1;
      const lam = clamp(0.25 + 0.85 * (x * Lx + y * Ly + z * Lz), 0.12, 1.1) * grid;
      const rim = Math.pow(1 - z, 3);
      d[o] = clamp(r * lam + 90 * rim, 0, 255); d[o + 1] = clamp(g * lam + 140 * rim, 0, 255); d[o + 2] = clamp(b * lam + 255 * rim, 0, 255); d[o + 3] = 255;
    }
    gctx.putImageData(gimg, 0, 0);
  }
  function project(lat, lon, lat0, lon0) {
    const la = lat * D2R, dl = (lon - lon0) * D2R, l0 = lat0 * D2R;
    return {
      x: Math.cos(la) * Math.sin(dl),
      y: Math.cos(l0) * Math.sin(la) - Math.sin(l0) * Math.cos(la) * Math.cos(dl),
      z: Math.sin(l0) * Math.sin(la) + Math.cos(l0) * Math.cos(la) * Math.cos(dl),
    };
  }

  /* ---------- 共通の場所（地球中心、月の公転半径 = 1） ---------- */
  const S60 = Math.sin(60 * D2R);
  const BASE_PLACES = {
    moon: { p: [1, 0], name: "月", type: "moon" },
    earthorbit: { p: [0.16, -0.1], name: "地球軌道", type: "point" },
    l1: { p: [0.84, 0], name: "L1", type: "point" },
    l2: { p: [1.2, 0], name: "L2", type: "point" },
    l3: { p: [-1, 0], name: "L3", type: "point" },
    l4: { p: [0.5, S60], name: "L4", type: "point" },
    l5: { p: [0.5, -S60], name: "L5", type: "point" },
  };
  const LPOS = [[[0.84, 0], -1], [[1.2, 0], 1], [[-1, 0], -1], [[0.5, S60], 1], [[0.5, -S60], -1]];
  const WORLDS = window.TIMELINE_WORLDS;
  let world, EVENTS, WORKS, PLACES;

  /* ---------- DOM ---------- */
  const $ = (s) => document.querySelector(s);
  const canvas = $("#ucCanvas"), ctx = canvas.getContext("2d");
  const box = $("#stage");
  const view = { w: 800, h: 500 };
  function resize() {
    const r = box.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = r.width; view.h = r.height;
    canvas.width = Math.round(view.w * dpr); canvas.height = Math.round(view.h * dpr);
    canvas.style.width = view.w + "px"; canvas.style.height = view.h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(box);
  resize();

  const list = $("#eventList");
  const scrub = $("#scrub");
  scrub.addEventListener("input", () => go(+scrub.value, true));
  $("#prev").addEventListener("click", () => go(Math.max(0, cur - 1), true));
  $("#next").addEventListener("click", () => go(Math.min(EVENTS.length - 1, cur + 1), true));
  const playBtn = $("#play");
  playBtn.addEventListener("click", () => { playing = !playing; if (playing && cur === EVENTS.length - 1 && te > dur(EVENTS[cur])) go(0); updatePlay(); });
  const speedSel = $("#speed");
  const updatePlay = () => { playBtn.textContent = playing ? "❚❚ 一時停止" : "▶ 再生"; playBtn.setAttribute("aria-pressed", String(playing)); };

  // 世界の切り替えタブ
  const tabs = $("#worldTabs");
  const SERIES = { gundam: "ガンダムシリーズ", logh: "銀河英雄伝説" };
  for (const [sid, sname] of Object.entries(SERIES)) {
    const grp = document.createElement("div");
    grp.className = "tab-group";
    grp.innerHTML = `<span class="tab-group-l">${sname}</span>`;
    const row = document.createElement("div");
    row.className = "tab-row";
    for (const w of WORLDS.filter((x) => x.series === sid)) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "world-tab"; b.dataset.id = w.id; b.textContent = w.short;
      b.addEventListener("click", () => setWorld(w.id, true));
      row.appendChild(b);
    }
    grp.appendChild(row);
    tabs.appendChild(grp);
  }

  function setWorld(id, user) {
    world = WORLDS.find((w) => w.id === id) || WORLDS[0];
    EVENTS = world.events; WORKS = world.works;
    PLACES = Object.assign({}, world.map === "earthmoon" ? BASE_PLACES : {}, world.places);
    tabs.querySelectorAll(".world-tab").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === world.id)));
    $("#worldTitle").textContent = world.era;
    $("#worldIntro").textContent = world.intro;
    list.innerHTML = "";
    let lastWork = null;
    EVENTS.forEach((e, i) => {
      if (e.work !== lastWork) {
        const h = document.createElement("li");
        h.className = "work-h";
        h.innerHTML = `<span class="dot" style="background:${WORKS[e.work].color}"></span>${WORKS[e.work].name}`;
        list.appendChild(h);
        lastWork = e.work;
      }
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button"; b.className = "ev"; b.dataset.i = i;
      b.innerHTML = `<span class="ev-date">${e.date}</span><span class="ev-title">${e.title}</span>`;
      b.addEventListener("click", () => go(i, true));
      li.appendChild(b); list.appendChild(li);
    });
    scrub.max = EVENTS.length - 1;
    zoom = 0; gcx = 0; gcy = 0; gscale = 1;
    if (user && location.hash !== "#" + world.id) history.replaceState(null, "", "#" + world.id);
    list.parentElement.scrollTop = 0;
    go(0);
  }

  /* ---------- 状態 ---------- */
  let cur = 0, te = 0, playing = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let zoom = 0, camLon = 140, camLat = 15, moonAng = -0.35, t = 0;
  let gcx = 0, gcy = 0, gscale = 1;
  const stars = Array.from({ length: 220 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.2, a: Math.random() * 0.6 + 0.2 }));
  const dur = (e) => (e.kind === "drop" ? 9 : e.kind === "axis" ? 9 : e.route ? 8 : e.kind === "earth" ? 6.5 : 6);

  function go(i, user) {
    cur = clamp(i, 0, EVENTS.length - 1); te = 0;
    const e = EVENTS[cur];
    scrub.value = cur;
    list.querySelectorAll(".ev").forEach((b) => b.classList.toggle("on", +b.dataset.i === cur));
    const btn = list.querySelector(`.ev[data-i="${cur}"]`);
    const col = list.parentElement;
    if (btn && col.scrollHeight > col.clientHeight) {
      const top = btn.offsetTop - col.clientHeight / 2 + btn.offsetHeight / 2;
      col.scrollTo({ top, behavior: user ? "smooth" : "auto" });
    }
    const w = WORKS[e.work];
    const placeName = e.placeName || (PLACES[e.place] || {}).name || "";
    $("#card").innerHTML = `
      <div class="card-meta"><span class="chip" style="--c:${w.color}">${w.name}</span><span class="date">${e.date}</span></div>
      <h2>${e.title}</h2>
      <p class="place">場所：${placeName}</p>
      <p>${e.text}</p>`;
    $("#counter").textContent = `${cur + 1} / ${EVENTS.length}`;
  }

  /* ---------- 描画ヘルパー ---------- */
  function spaceXY(p, cx, cy, Rm, k) {
    const c = Math.cos(moonAng), s = Math.sin(moonAng);
    const x = p[0] * c - p[1] * s, y = p[0] * s + p[1] * c;
    return [cx + x * Rm * k, cy + y * Rm * k];
  }
  function glow(x, y, r, col, a = 1) {
    if (r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  function text(s, x, y, o = {}) {
    ctx.font = `${o.w || 600} ${o.s || 12}px "Noto Sans JP", system-ui, sans-serif`;
    ctx.textAlign = o.a || "left"; ctx.fillStyle = o.c || "#dfe8ff";
    if (o.shadow !== false) { ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 4; }
    ctx.fillText(s, x, y); ctx.shadowBlur = 0;
  }
  function colonyShape(x, y, ang, len, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = col; ctx.fillRect(-len / 2, -len * 0.16, len, len * 0.32);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    for (let k = -1; k <= 1; k++) ctx.fillRect(-len / 2, k * len * 0.11 - 0.5, len, 1);
    ctx.restore();
  }
  function rockShape(x, y, r, col) {
    ctx.fillStyle = col; ctx.beginPath();
    for (let a = 0; a < 7; a++) { const rr = r * (a % 2 ? 1 : 0.75); const aa = (a / 7) * TAU; a ? ctx.lineTo(x + rr * Math.cos(aa), y + rr * Math.sin(aa)) : ctx.moveTo(x + rr, y); }
    ctx.closePath(); ctx.fill();
  }

  /* ---------- フレーム ---------- */
  function frame(dt) {
    t += dt;
    const e = EVENTS[cur];
    if (playing) {
      te += dt * +speedSel.value;
      if (te > dur(e) + 0.6) { if (cur < EVENTS.length - 1) go(cur + 1); else { playing = false; updatePlay(); } }
    }
    if (world.map === "galaxy") drawGalaxy(dt, e);
    else drawEarthMoon(dt, e);
    const first = e.date.split("／")[0];
    const yr = /暦/.test(first) ? first.replace(/(\d+)年.*$/, "$1年") : first.replace(/年.*$/, "");
    text(yr, 18, 34, { s: 22, w: 800, c: "#fff" });
  }

  function drawEarthMoon(dt, e) {
    moonAng += dt * 0.012;
    // カメラの目標
    let zt = 0, tLon = camLon + dt * 6, tLat = 15;
    if (e.kind === "earth") { zt = 1; tLon = e.earth[1]; tLat = clamp(e.earth[0], -55, 60); }
    if (e.kind === "drop" && te > 2.6) { zt = 1; tLon = e.earth[1]; tLat = clamp(e.earth[0], -55, 60); }
    if (e.kind === "axis") zt = te > 1 && te < 7.5 ? 0.38 : 0;
    zoom += (zt - zoom) * Math.min(1, dt * 2.2);
    const dLon = ((tLon - camLon + 540) % 360) - 180;
    camLon += dLon * Math.min(1, dt * (zt > 0.5 ? 2.5 : 1));
    camLat += (tLat - camLat) * Math.min(1, dt * 2.5);

    const W = view.w, H = view.h, z = ease(clamp(zoom, 0, 1));
    ctx.fillStyle = "#03050d"; ctx.fillRect(0, 0, W, H);
    for (const s of stars) { ctx.globalAlpha = s.a; ctx.fillStyle = "#fff"; ctx.fillRect(s.x * W, s.y * H, s.r, s.r); }
    ctx.globalAlpha = 1;

    const cx = W * 0.5, cy = H * 0.52;
    const Rm = Math.min(W * 0.34, H * 0.4);
    const k = 1 + z * 7;
    const spaceA = clamp(1 - z * 1.4, 0, 1);
    const rE = lerp(Math.max(12, Rm * 0.085), Math.min(W, H) * 0.42, z);

    if (spaceA > 0.01) {
      ctx.globalAlpha = spaceA;
      ctx.strokeStyle = "rgba(150,170,220,0.25)"; ctx.setLineDash([3, 6]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, Rm * k, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      LPOS.forEach(([p, side], i) => {
        const [x, y] = spaceXY(p, cx, cy, Rm, k);
        ctx.strokeStyle = "rgba(160,190,255,0.35)"; ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.stroke();
        text((world.lp || [])[i] || `L${i + 1}`, x, y + side * 26 + (side > 0 ? 4 : 0), { s: 10, c: "rgba(170,195,255,0.8)", a: "center" });
      });
      // 月
      const [mx, my] = spaceXY([1, 0], cx, cy, Rm, k);
      const mr = Math.max(5, rE * 0.27 * (1 + z));
      const mg = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 1, mx, my, mr);
      mg.addColorStop(0, "#e6e6ea"); mg.addColorStop(1, "#7d7f88");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
      text("月", mx, my + mr + 13, { s: 10, a: "center", c: "#bbb" });
      // 場所
      for (const [key, pl] of Object.entries(PLACES)) {
        if (pl.type === "point" || pl.type === "moon") continue;
        const active = e.place === key;
        if (pl.type === "far") {
          // 遠方の天体は縮尺に関係なく地図の端に描く
          const c = Math.cos(moonAng * 0), s = 0;
          void c; void s;
          const x = cx + pl.p[0] * Rm, y = cy + pl.p[1] * Rm * 0.62;
          const fx = clamp(x, 40, W - 40), fy = clamp(y, 50, H - 30);
          glow(fx, fy, pl.r * 2.2, pl.color, 0.35);
          ctx.fillStyle = pl.color; ctx.beginPath(); ctx.arc(fx, fy, pl.r, 0, TAU); ctx.fill();
          text(pl.name, fx, fy + pl.r + 14, { s: 10, a: "center", c: active ? "#ffe9a8" : "rgba(220,220,230,0.75)", w: active ? 800 : 500 });
          pl._xy = [fx, fy];
          continue;
        }
        const [x, y] = spaceXY(pl.p, cx, cy, Rm, k);
        if (pl.type === "colony") {
          for (let q = 0; q < 3; q++) colonyShape(x + (q - 1) * 4, y + ((q * 7) % 5) - 2, moonAng + q, 7, active ? "#ffe9a8" : "#8fa0c8");
        } else if (pl.type === "base") {
          ctx.fillStyle = active ? "#ffe9a8" : "#9aa"; ctx.fillRect(x - 2, y - 2, 4, 4);
        } else if (pl.type === "fortress") {
          ctx.fillStyle = active ? "#ffe9a8" : "#b8c0d8"; ctx.beginPath(); ctx.ellipse(x, y, 9, 4, moonAng, 0, TAU); ctx.fill();
        } else {
          rockShape(x, y, 8, active ? "#ffe9a8" : "#a0907a");
        }
        if (active) text(pl.name, x, y - 22, { s: 13, a: "center", c: "#ffe9a8", w: 800 });
        else if (pl.type === "rock" || pl.type === "fortress") text(pl.name.split("（")[0], x, y + 20, { s: 10, a: "center", c: "rgba(200,210,240,0.65)", w: 500 });
      }
      ctx.globalAlpha = 1;
    }

    const ex = cx, ey = cy;
    renderGlobe(camLon, camLat);
    glow(ex, ey, rE * 1.25, "rgba(90,160,255,0.35)");
    ctx.drawImage(globeCanvas, ex - rE, ey - rE, rE * 2, rE * 2);
    if (z < 0.3) text("地球", ex, ey + rE + 14, { s: 11, a: "center", c: "#9cc7ff" });

    drawEventFx(e, { cx, cy, Rm, k, ex, ey, rE, z, spaceA });
  }

  function placeXY(key, cx, cy, Rm, k) {
    const pl = PLACES[key];
    if (pl.type === "far") return pl._xy || [cx + pl.p[0] * Rm, cy + pl.p[1] * Rm * 0.62];
    return spaceXY(pl.p, cx, cy, Rm, k);
  }

  /* ---------- 銀河の地図（銀河英雄伝説） ---------- */
  const GAL = (() => {
    const pts = [];
    for (let i = 0; i < 2600; i++) {
      const arm = i % 2, r = Math.pow(Math.random(), 0.6) * 1.15;
      const a = arm * Math.PI + r * 3.2 + (Math.random() - 0.5) * 0.9;
      pts.push({ x: Math.cos(a) * r * 1.05, y: Math.sin(a) * r * 0.62, b: Math.random() * 0.7 + 0.2, s: Math.random() * 1.3 + 0.3 });
    }
    const neb = [];
    for (let i = 0; i < 260; i++) {
      const y = -0.75 + Math.random() * 1.5;
      if ((y > -0.4 && y < -0.2) || (y > 0.33 && y < 0.51)) continue;
      neb.push({ x: (Math.random() - 0.5) * 0.16, y, r: 0.04 + Math.random() * 0.07, h: Math.random() });
    }
    return { pts, neb };
  })();
  const fleets = Array.from({ length: 36 }, (_, i) => ({ side: i % 2, ox: Math.random(), oy: Math.random(), ph: Math.random() * TAU }));

  function drawGalaxy(dt, e) {
    const W = view.w, H = view.h;
    const pl = PLACES[e.place];
    // カメラ
    let tcx = 0, tcy = 0, ts = 1;
    const routeOn = e.route && te < 4.5;
    if (!routeOn && pl && e.fx) { tcx = pl.p[0]; tcy = pl.p[1]; ts = 2.6; }
    else if (!routeOn && pl) { tcx = pl.p[0] * 0.5; tcy = pl.p[1] * 0.5; ts = 1.5; }
    const kk = Math.min(1, dt * 2);
    gcx += (tcx - gcx) * kk; gcy += (tcy - gcy) * kk; gscale += (ts - gscale) * kk;
    const S = Math.min(W / 2.3, H / 1.55) * gscale;
    const X = (x) => W / 2 + (x - gcx) * S, Y = (y) => H / 2 + (y - gcy) * S;

    ctx.fillStyle = "#04030a"; ctx.fillRect(0, 0, W, H);
    // 勢力の色
    const tint = (x, y, col) => { const g = ctx.createRadialGradient(X(x), Y(y), 0, X(x), Y(y), S * 0.9); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    tint(-0.6, 0, "rgba(255,190,80,0.16)");
    tint(0.6, 0, "rgba(80,150,255,0.16)");
    // 星
    for (const p of GAL.pts) { ctx.globalAlpha = p.b; ctx.fillStyle = p.x < -0.1 ? "#ffe8c0" : p.x > 0.1 ? "#cfe0ff" : "#fff"; ctx.fillRect(X(p.x), Y(p.y), p.s, p.s); }
    ctx.globalAlpha = 1;
    // 航行不能宙域
    for (const n of GAL.neb) glow(X(n.x), Y(n.y), n.r * S, `hsla(${330 + n.h * 40},70%,45%,0.5)`, 0.5);
    // 回廊
    ctx.setLineDash([4, 5]); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1;
    for (const [y0, y1] of [[-0.4, -0.2], [0.33, 0.51]]) { ctx.beginPath(); ctx.moveTo(X(-0.1), Y(y0)); ctx.lineTo(X(0.1), Y(y0)); ctx.moveTo(X(-0.1), Y(y1)); ctx.lineTo(X(0.1), Y(y1)); ctx.stroke(); }
    ctx.setLineDash([]);
    text("銀河帝国", X(-0.62), Y(-0.6), { s: 15 * Math.min(1.4, gscale), w: 800, a: "center", c: "rgba(255,210,120,0.9)" });
    text("自由惑星同盟", X(0.62), Y(-0.6), { s: 15 * Math.min(1.4, gscale), w: 800, a: "center", c: "rgba(140,190,255,0.9)" });
    text("航行不能宙域", X(0), Y(0.08), { s: 10, a: "center", c: "rgba(255,150,190,0.7)" });
    text("イゼルローン回廊", X(0), Y(-0.43), { s: 10, a: "center", c: "rgba(255,255,255,0.6)" });
    text("フェザーン回廊", X(0), Y(0.56), { s: 10, a: "center", c: "rgba(255,255,255,0.6)" });

    // 場所
    for (const [key, p] of Object.entries(PLACES)) {
      if (p.type === "point") continue;
      const x = X(p.p[0]), y = Y(p.p[1]), active = e.place === key;
      if (p.type === "capital") {
        glow(x, y, 16 * Math.sqrt(gscale), p.side === "empire" ? "rgba(255,210,120,0.9)" : "rgba(140,190,255,0.9)");
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill();
      } else if (p.type === "fortress") {
        const r = 6 * Math.sqrt(gscale);
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
        g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#7f8aa0");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = active ? "#ffe9a8" : "rgba(230,230,255,0.85)"; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
      }
      text(p.name, x, y + 16 * Math.sqrt(gscale), { s: active ? 13 : 10, a: "center", w: active ? 800 : 500, c: active ? "#ffe9a8" : "rgba(220,225,245,0.75)" });
    }

    // 航路（艦隊の移動）
    if (e.route) {
      const pts = e.route.map((k) => PLACES[k].p);
      ctx.strokeStyle = "rgba(255,233,168,0.6)"; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke(); ctx.setLineDash([]);
      const f = clamp(te / 4, 0, 1) * (pts.length - 1);
      const i0 = Math.min(pts.length - 2, Math.floor(f)), u = f - i0;
      const fx = lerp(pts[i0][0], pts[i0 + 1][0], u), fy = lerp(pts[i0][1], pts[i0 + 1][1], u);
      const ang = Math.atan2(pts[i0 + 1][1] - pts[i0][1], pts[i0 + 1][0] - pts[i0][0]);
      const empire = (PLACES[e.route[0]].p[0] < 0) && e.route[0] !== "altair";
      for (let q = 0; q < 7; q++) {
        const ox = -Math.cos(ang) * (q % 4) * 7 - Math.sin(ang) * ((q % 3) - 1) * 7, oy = -Math.sin(ang) * (q % 4) * 7 + Math.cos(ang) * ((q % 3) - 1) * 7;
        ship(X(fx) + ox, Y(fy) + oy, ang, empire ? "#ffd27a" : "#8fc0ff", 5);
      }
    }

    // 会戦のクローズアップ
    if (pl && e.fx && gscale > 1.6) {
      const a = clamp((gscale - 1.6) / 1, 0, 1);
      const cx = X(pl.p[0]), cy = Y(pl.p[1]);
      ctx.globalAlpha = a;
      if (e.fx === "battle") {
        for (const f of fleets) {
          const sx = f.side ? 1 : -1;
          const x = cx + sx * (50 + f.ox * 90) + Math.sin(t * 0.8 + f.ph) * 4, y = cy + (f.oy - 0.5) * 120;
          ship(x, y, f.side ? Math.PI : 0, f.side ? "#8fc0ff" : "#ffd27a", 6);
          if (Math.sin(t * 6 + f.ph * 5) > 0.85) {
            ctx.strokeStyle = f.side ? "rgba(140,200,255,0.9)" : "rgba(255,220,140,0.9)"; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx - sx * 30 + Math.sin(f.ph) * 20, y + Math.cos(t + f.ph) * 30); ctx.stroke();
          }
          if (Math.sin(t * 3 + f.ph * 7) > 0.97) glow(x, y, 14, "rgba(255,200,120,1)");
        }
      } else if (e.fx === "nuke") {
        const f = clamp((te - 1) / 3, 0, 1);
        ctx.fillStyle = "#6a8"; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, TAU); ctx.fill();
        if (te > 1) glow(cx, cy, 14 + f * 60, "rgba(255,255,220,1)", 1 - f);
      } else if (e.fx === "flash") {
        glow(cx, cy, 30 + 6 * Math.sin(t * 4), "rgba(255,230,180,0.9)", 0.6);
      }
      ctx.globalAlpha = 1;
    }
    if (pl && !e.route) {
      const pulse = (te * 1.2) % 1;
      ctx.strokeStyle = `rgba(255,233,168,${1 - pulse})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(pl.p[0]), Y(pl.p[1]), 8 + pulse * 26, 0, TAU); ctx.stroke();
    }
    text("位置関係は物語を理解するための模式図です", W - 12, H - 10, { s: 10, a: "right", c: "rgba(200,200,220,0.5)", shadow: false });
  }
  function ship(x, y, ang, col, s) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s, -s * 0.5); ctx.lineTo(-s * 0.6, 0); ctx.lineTo(-s, s * 0.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawEventFx(e, g) {
    const { cx, cy, Rm, k, ex, ey, rE, z, spaceA } = g;
    const pulse = (te * 1.2) % 1;
    if (e.kind === "space" || e.kind === "axis") {
      const [x, y] = placeXY(e.place, cx, cy, Rm, k);
      ctx.globalAlpha = spaceA;
      if (e.kind === "space") {
        ctx.strokeStyle = `rgba(255,233,168,${1 - pulse})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 10 + pulse * 30, 0, TAU); ctx.stroke();
      }
      if (e.fx === "battle") {
        for (let i = 0; i < 10; i++) {
          const a = Math.sin(t * 3 + i * 7.1) * 0.5 + i, rr = 10 + ((t * 40 + i * 13) % 34);
          const bx = x + Math.cos(a) * rr, by = y + Math.sin(a) * rr;
          if (Math.sin(t * 9 + i * 2.3) > 0.4) glow(bx, by, 7, "rgba(255,200,120,0.9)");
          if (i % 3 === 0 && Math.sin(t * 5 + i) > 0.6) { ctx.strokeStyle = i % 2 ? "rgba(255,120,200,0.8)" : "rgba(120,220,255,0.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 18 * Math.cos(a + 2), by + 18 * Math.sin(a + 2)); ctx.stroke(); }
        }
      }
      if (e.fx === "beam" || e.fx === "laser") {
        const fromKey = e.from || e.place, toKey = e.to || e.place;
        const [fx, fy] = placeXY(fromKey, cx, cy, Rm, k);
        const [tx, ty] = placeXY(toKey, cx, cy, Rm, k);
        const on = te > 1.2 && te < 4;
        if (on) {
          const f = clamp((te - 1.2) / 0.5, 0, 1);
          const dx = tx - fx, dy = ty - fy, L = Math.hypot(dx, dy) || 1;
          const ext = e.fx === "laser" ? 1.6 : 1.3;
          const ex2 = fx + (dx / L) * L * ext * f, ey2 = fy + (dy / L) * L * ext * f;
          ctx.strokeStyle = e.fx === "laser" ? "rgba(255,120,220,0.9)" : "rgba(255,240,160,0.9)";
          ctx.lineWidth = 6 * (1 - Math.max(0, te - 3) ); ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(ex2, ey2); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2; ctx.stroke();
          glow(fx, fy, 24, "rgba(255,255,220,0.9)");
        }
      }
      if (e.fx === "nuke" && te > 1) {
        const f = clamp((te - 1) / 2, 0, 1);
        glow(x, y, 20 + f * 90, "rgba(255,255,230,1)", 1 - f);
        ctx.strokeStyle = `rgba(255,220,150,${1 - f})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 10 + f * 70, 0, TAU); ctx.stroke();
      }
      if (e.fx === "flash") glow(x, y, 26 + 8 * Math.sin(t * 6), "rgba(255,180,120,0.8)", 0.6);
      ctx.globalAlpha = 1;
    }

    if (e.kind === "axis") {
      // アクシズが地球に迫り、緑の光で押し返される
      let d;
      if (te < 4) d = lerp(0.95, 0.27, ease(clamp(te / 4, 0, 1)));
      else if (te < 5) d = 0.27;
      else d = lerp(0.27, 0.5, ease(clamp((te - 5) / 3, 0, 1)));
      const ang = -2.3;
      const ax = ex + Math.cos(ang) * d * Rm * k, ay = ey + Math.sin(ang) * d * Rm * k;
      if (te > 3.6 && te < 8) {
        const f = clamp((te - 3.6) / 1.2, 0, 1) * (1 - clamp((te - 7) / 1, 0, 1));
        glow(ax, ay, 40 + 120 * f, "rgba(120,255,170,0.9)", 0.8 * f);
      }
      ctx.fillStyle = "#8c7b66";
      ctx.beginPath();
      for (let a = 0; a < 11; a++) { const rr = (a % 2 ? 9 : 13) * (1 + z); const aa = (a / 11) * TAU + 0.3; a ? ctx.lineTo(ax + rr * Math.cos(aa), ay + rr * Math.sin(aa)) : ctx.moveTo(ax + rr, ay); }
      ctx.closePath(); ctx.fill();
      text("アクシズ", ax, ay - 20 * (1 + z), { s: 12, w: 800, a: "center", c: te > 4.5 ? "#9dffbf" : "#ffd9a8" });
    }

    if (e.kind === "drop") {
      const [sx, sy] = placeXY(e.place, cx, cy, Rm, k);
      const p = project(e.earth[0], e.earth[1], camLat, camLon);
      const fall = clamp(te / 2.6, 0, 1);
      if (te < 3.2) {
        // 宇宙を進むコロニー（または小惑星）
        const f = ease(fall);
        const mxp = (sx + ex) / 2 + (ey - sy) * 0.25, myp = (sy + ey) / 2 + (sx - ex) * 0.25;
        const bx = (1 - f) * (1 - f) * sx + 2 * (1 - f) * f * mxp + f * f * ex;
        const by = (1 - f) * (1 - f) * sy + 2 * (1 - f) * f * myp + f * f * ey;
        ctx.globalAlpha = clamp(1 - (te - 2.6) / 0.6, 0, 1);
        ctx.strokeStyle = "rgba(255,170,90,0.5)"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mxp, myp, bx, by); ctx.stroke(); ctx.setLineDash([]);
        if (e.rock) { ctx.fillStyle = "#9a8a76"; ctx.beginPath(); ctx.arc(bx, by, 7, 0, TAU); ctx.fill(); }
        else colonyShape(bx, by, t * 0.8, 16, "#ffd9a8");
        glow(bx, by, 16, "rgba(255,150,60,0.8)", 0.4 + 0.6 * f);
        ctx.globalAlpha = 1;
      }
      if (z > 0.6 && p.z > 0) {
        const X = ex + p.x * rE, Y = ey - p.y * rE;
        if (te > 2.6 && te < 4.6) {
          // 大気圏突入：斜めに落ちてくる光
          const f = clamp((te - 2.6) / 1.6, 0, 1);
          const sx2 = X - rE * 0.9 * (1 - f), sy2 = Y - rE * 0.9 * (1 - f);
          ctx.strokeStyle = "rgba(255,180,80,0.9)"; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(sx2 - 30 * (1 - f), sy2 - 30 * (1 - f)); ctx.lineTo(sx2, sy2); ctx.stroke();
          glow(sx2, sy2, 18, "rgba(255,230,180,1)");
        }
        if (te > 4.2) {
          const f = clamp((te - 4.2) / 2.5, 0, 1);
          glow(X, Y, 10 + f * rE * 0.6, "rgba(255,255,220,1)", 1 - f);
          ctx.strokeStyle = `rgba(255,170,90,${1 - f * 0.7})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(X, Y, 6 + f * rE * 0.35, 0, TAU); ctx.stroke();
          ctx.fillStyle = "rgba(40,20,10,0.75)"; ctx.beginPath(); ctx.arc(X, Y, 5 + f * 6, 0, TAU); ctx.fill();
        }
      }
    }

    // 地上の地点マーカー
    if ((e.kind === "earth" || e.kind === "drop") && z > 0.6) {
      const p = project(e.earth[0], e.earth[1], camLat, camLon);
      if (p.z > 0) {
        const X = ex + p.x * rE, Y = ey - p.y * rE;
        if (e.kind === "earth") {
          ctx.strokeStyle = `rgba(255,233,168,${1 - pulse})`; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(X, Y, 6 + pulse * 26, 0, TAU); ctx.stroke();
          if (e.fx === "battle") for (let i = 0; i < 6; i++) if (Math.sin(t * 8 + i * 1.7) > 0.5) glow(X + Math.cos(i * 2.1) * 14, Y + Math.sin(i * 2.1) * 10, 8, "rgba(255,200,120,0.9)");
          if (e.fx === "nuke" && te > 1.5) { const f = clamp((te - 1.5) / 2.5, 0, 1); glow(X, Y, 10 + f * 70, "rgba(255,255,230,1)", 1 - f); }
          ctx.fillStyle = "#ffe9a8"; ctx.beginPath(); ctx.arc(X, Y, 4, 0, TAU); ctx.fill();
        }
        text(e.placeName, X + 12, Y - 10, { s: 13, w: 800, c: "#fff" });
      }
    }
  }


  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    frame(dt);
    requestAnimationFrame(loop);
  }
  const fromHash = () => { const id = location.hash.replace("#", ""); return WORLDS.some((w) => w.id === id) ? id : "uc"; };
  window.addEventListener("hashchange", () => { if (!world || world.id !== fromHash()) setWorld(fromHash()); });
  setWorld(fromHash());
  updatePlay();
  requestAnimationFrame(loop);
})();
