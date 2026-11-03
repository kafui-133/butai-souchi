/*
 * 作品年表の“世界”定義（非公式・概要）
 *
 * map: "earthmoon"（地球・月・ラグランジュ点の地図） | "galaxy"（銀河の模式図）
 * places: 宇宙の場所 { p:[x,y], name, type: "colony"|"rock"|"base"|"far"|"point"|"star"|"fortress"|"capital" }
 *   earthmoon では地球中心・月の公転半径=1、月の方向が+x（月とともに回転）
 *   galaxy では銀河図の正規化座標（-1〜1）
 * イベント: date, work, kind("space"|"earth"|"drop"|"axis"), place, earth:[緯度,経度], placeName,
 *          fx("battle"|"beam"|"nuke"|"laser"|"flash"), from/to（ビーム・艦隊の移動）, route:[場所...]
 */
(function () {
  const S60 = Math.sin(Math.PI / 3);
  const L = { l1: [0.84, 0], l2: [1.2, 0], l3: [-1, 0], l4: [0.5, S60], l5: [0.5, -S60] };
  const far = (x, y, name, color, r) => ({ p: [x, y], name, type: "far", color, r });

  const worlds = [];

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "uc", series: "gundam", era: "宇宙世紀（U.C.）", short: "宇宙世紀",
    intro: "『機動戦士ガンダム』（1979）に始まる、最も長く描かれてきた歴史。地球連邦とジオンの戦争から、約150年にわたる宇宙移民の時代を描く。外伝作品の出来事も含めて表示する。",
    map: "earthmoon",
    lp: ["L1 サイド5", "L2 サイド3", "L3 サイド7", "L4 サイド2・6", "L5 サイド1・4"],
    works: window.UC_WORKS,
    places: {
      granada: { p: [1.06, 0.035], name: "月面都市グラナダ", type: "base" },
      side5: { p: L.l1, name: "サイド5（ルウム）", type: "colony" },
      side3: { p: L.l2, name: "サイド3（ジオン）", type: "colony" },
      side7: { p: L.l3, name: "サイド7", type: "colony" },
      gryps: { p: [-1.02, -0.13], name: "グリプス（サイド7）", type: "colony" },
      side2: { p: [0.44, S60], name: "サイド2", type: "colony" },
      side6: { p: [0.57, S60 + 0.03], name: "サイド6（リボー）", type: "colony" },
      side1: { p: [0.44, -S60], name: "サイド1", type: "colony" },
      side4: { p: [0.57, -S60 - 0.03], name: "サイド4（フロンティア）", type: "colony" },
      thunderbolt: { p: [0.66, -0.98], name: "サンダーボルト宙域（旧サイド4ムーア）", type: "rock" },
      solomon: { p: [0.72, -0.62], name: "ソロモン（コンペイトウ）", type: "rock" },
      abaoaqu: { p: [0.95, 0.26], name: "ア・バオア・クー", type: "rock" },
      laplace: { p: [0.12, 0.08], name: "地球軌道（首相官邸ラプラス跡）", type: "point" },
      jupiter: far(-1.55, 0.95, "木星圏（遠方・縮尺外）", "#d9b38c", 16),
    },
    events: window.UC_EVENTS,
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "fc", series: "gundam", era: "未来世紀（F.C.）", short: "未来世紀",
    intro: "『機動武闘伝Gガンダム』（1994）。宇宙に移住した各国のコロニーが、4年に一度、代表のガンダム同士を地球上で戦わせ（ガンダムファイト）、勝った国が次の4年間の主導権を握る世界。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { g: { name: "機動武闘伝Gガンダム", color: "#ff6b4a" } },
    places: { neojapan: { p: [0.3, -0.32], name: "ネオジャパン・コロニー", type: "colony" } },
    events: [
      { date: "F.C. 60", work: "g", kind: "earth", earth: [35.7, 139.7], placeName: "日本・新宿", fx: "battle", title: "第13回ガンダムファイトと新宿の事件", text: "ネオジャパン代表ドモン・カッシュは、デビルガンダムを奪って逃げた兄キョウジを追って地球に降りる。荒廃した新宿で、師匠の東方不敗マスター・アジアと再会する。" },
      { date: "F.C. 60", work: "g", kind: "earth", earth: [5.5, -61.5], placeName: "南米・ギアナ高地", title: "ギアナ高地の修行", text: "マスター・アジアに敗れたドモンは、ギアナ高地で修行を積み、明鏡止水の境地を目指す。" },
      { date: "F.C. 60", work: "g", kind: "earth", earth: [22.3, 114.2], placeName: "ネオホンコン", fx: "battle", title: "ネオホンコンでの決勝大会", text: "予選を勝ち抜いたガンダムファイターたちが、ネオホンコンでの決勝大会に集う。" },
      { date: "F.C. 60", work: "g", kind: "earth", earth: [22.25, 113.95], placeName: "香港・ランタオ島", fx: "battle", title: "ランタオ島の決闘", text: "ドモンと東方不敗の師弟対決。地球環境を壊す人類そのものを滅ぼそうとした師匠の思想に、ドモンは拳で答える。" },
      { date: "F.C. 60", work: "g", kind: "space", place: "neojapan", fx: "battle", title: "デビルコロニーとの最終決戦", text: "デビルガンダムはネオジャパンのコロニーを取り込み、巨大な「デビルコロニー」と化す。ドモンと仲間たちのファイターが集結し、最後の戦いに挑む。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "ac", series: "gundam", era: "アフターコロニー（A.C.）", short: "アフターコロニー",
    intro: "『新機動戦記ガンダムW』（1995）。地球圏統一連合の支配に抵抗するため、コロニー側の科学者が5機のガンダムと5人の少年を地球へ送り込む。",
    map: "earthmoon", lp: ["L1 コロニー群", "L2 コロニー群", "L3 コロニー群", "L4 コロニー群", "L5 コロニー群"],
    works: { w: { name: "新機動戦記ガンダムW", color: "#5ec2ff" }, ew: { name: "Endless Waltz", color: "#c9a7ff" } },
    places: {
      colonies: { p: L.l1, name: "コロニー群", type: "colony" },
      libra: { p: [0.35, 0.25], name: "宇宙要塞戦艦リーブラ", type: "fortress" },
    },
    events: [
      { date: "A.C. 175", work: "w", kind: "space", place: "colonies", fx: "flash", title: "ヒイロ・ユイの暗殺", text: "コロニーの非武装・自治を訴えた指導者ヒイロ・ユイが暗殺される。その名は後に、ガンダムのパイロットの少年が名乗ることになる。" },
      { date: "A.C. 195", work: "w", kind: "drop", place: "colonies", earth: [10, -150], placeName: "地球（太平洋ほか各地）", title: "オペレーション・メテオ", text: "コロニーから5機のガンダムが流星のように地球へ降下し、統一連合とその内部の秘密結社OZへの破壊工作を始める。" },
      { date: "A.C. 195", work: "w", kind: "earth", earth: [59.5, 10.5], placeName: "北欧・サンクキングダム", title: "サンクキングダムの再興", text: "リリーナ・ピースクラフトが完全平和主義の王国サンクキングダムを復活させるが、戦火の中で再び失われる。" },
      { date: "A.C. 195", work: "w", kind: "drop", place: "libra", earth: [48, 2], placeName: "地球（落下阻止）", rock: true, title: "リーブラ落下阻止", text: "ホワイトファングの要塞戦艦リーブラの一部が地球へ落下し始める。ヒイロのウイングゼロが、大気圏突入寸前で破片を破壊する。" },
      { date: "A.C. 196", work: "ew", kind: "earth", earth: [50.85, 4.35], placeName: "ベルギー・ブリュッセル", fx: "battle", title: "マリーメイア事件（Endless Waltz）", text: "トレーズの娘を名乗るマリーメイアの軍がブリュッセルの大統領府を占拠する。この戦いを最後に、地球圏から兵器は捨てられていく。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "aw", series: "gundam", era: "アフターウォー（A.W.）", short: "アフターウォー",
    intro: "『機動新世紀ガンダムX』（1996）。地球連邦と宇宙革命軍の戦争（第7次宇宙戦争）で無数のコロニーが落とされ、荒廃した地球が舞台。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5 クラウド9"],
    works: { x: { name: "機動新世紀ガンダムX", color: "#7dd3ff" } },
    places: { cloud9: { p: L.l5, name: "宇宙革命軍のコロニー", type: "colony" } },
    events: [
      { date: "A.W. 以前", work: "x", kind: "drop", place: "cloud9", earth: [35, 0], placeName: "地球各地", title: "第7次宇宙戦争とコロニー落とし", text: "宇宙革命軍が無数のコロニーを地球へ落とし、地球の人口の大半が失われる。連邦はガンダムのサテライトキャノンで応戦し、戦争は両者の疲弊で終わる。この年をもって「アフターウォー」が始まる。" },
      { date: "A.W. 0015", work: "x", kind: "earth", earth: [35, -100], placeName: "地球（旧北米ほか）", title: "ガロードとガンダムXの出会い", text: "荒廃した地上で暮らす少年ガロード・ランは、ニュータイプの少女ティファと出会い、眠っていたガンダムXを起動させる。" },
      { date: "A.W. 0015", work: "x", kind: "space", place: "moon", fx: "flash", title: "月の施設「D.O.M.E.」", text: "サテライトキャノンにエネルギーを送る月面のマイクロウェーブ送信施設。その奥で、ガロードとティファは“ニュータイプ”の真実を知る。" },
      { date: "A.W. 0015", work: "x", kind: "space", place: "moon", fx: "beam", from: "moon", to: "l5", title: "最終決戦", text: "新地球連邦と宇宙革命軍が再び衝突。ガンダムXとダブルエックスが戦争の再来を止めようとする。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "cc", series: "gundam", era: "正暦（C.C.）", short: "正暦",
    intro: "『∀ガンダム』（1999）。文明が一度滅び（黒歴史）、産業革命期程度の技術に戻った地球に、月に住む人々（ムーンレィス）が帰還しようとする。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { t: { name: "∀ガンダム", color: "#e8e0c8" } },
    places: {},
    events: [
      { date: "黒歴史", work: "t", kind: "space", place: "moon", title: "黒歴史と月への移住", text: "はるか昔、ナノマシン「月光蝶」によって地球の文明は一度埋もれた。その記録は“黒歴史”として封印され、一部の人々は月で暮らし続けた。" },
      { date: "正暦 2343", work: "t", kind: "earth", earth: [42, -88], placeName: "アメリア大陸（北米）・ビシニティ", title: "ロランの成人式と∀の目覚め", text: "地球に潜入していたムーンレィスの少年ロラン・セアックの成人式の日、ムーンレィスの艦隊が降下し、山の石像から∀ガンダムが姿を現す。" },
      { date: "正暦 2343", work: "t", kind: "drop", place: "moon", earth: [40, -95], placeName: "アメリア大陸", title: "ディアナ・カウンターの帰還作戦", text: "月の女王ディアナ・ソレルの親衛隊ディアナ・カウンターが、地球への帰還（移住）作戦を開始する。" },
      { date: "正暦 2345", work: "t", kind: "space", place: "moon", fx: "battle", title: "ターンXと月光蝶の決戦", text: "ギンガナム艦隊のターンXとロランの∀が、文明を砂に変える月光蝶を放ちながら戦う。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "ce", series: "gundam", era: "コズミック・イラ（C.E.）", short: "コズミック・イラ",
    intro: "『機動戦士ガンダムSEED』（2002）。遺伝子操作で生まれた人類「コーディネイター」の国家プラントと、地球連合の戦争を描く。",
    map: "earthmoon", lp: ["L1", "L2", "L3 ヘリオポリス", "L4", "L5 プラント"],
    works: { seed: { name: "機動戦士ガンダムSEED", color: "#4f9bff" }, destiny: { name: "SEED DESTINY", color: "#ff5f7a" } },
    places: {
      plant: { p: [0.44, -S60], name: "プラント", type: "colony" },
      junius: { p: [0.6, -S60 + 0.05], name: "ユニウスセブン", type: "colony" },
      jachin: { p: [0.62, -0.72], name: "ヤキン・ドゥーエ", type: "rock" },
      heliopolis: { p: L.l3, name: "ヘリオポリス（オーブ）", type: "colony" },
      daedalus: { p: [1.06, 0.03], name: "月面ダイダロス基地", type: "base" },
      messiah: { p: [0.35, -0.75], name: "要塞メサイア", type: "rock" },
    },
    events: [
      { date: "C.E. 70年2月14日", work: "seed", kind: "space", place: "junius", fx: "nuke", title: "血のバレンタイン", text: "地球連合軍がプラントの農業用コロニー「ユニウスセブン」に核ミサイルを撃ち込み、24万人以上が犠牲になる。プラントとの全面戦争が始まる。" },
      { date: "C.E. 70年4月1日", work: "seed", kind: "space", place: "earthorbit", fx: "flash", title: "エイプリルフール・クライシス", text: "報復としてプラント側が地球に核分裂を阻害するニュートロンジャマーを大量に撃ち込む。原子力発電が止まり、地球は深刻なエネルギー危機に陥る。" },
      { date: "C.E. 71年1月25日", work: "seed", kind: "space", place: "heliopolis", fx: "battle", title: "ヘリオポリス崩壊", text: "中立国オーブのコロニー・ヘリオポリスで、ザフトが地球連合の新型モビルスーツ（G兵器）を奪取。学生のキラ・ヤマトはストライクガンダムに乗り込み、コロニーは戦闘で崩壊する。" },
      { date: "C.E. 71年", work: "seed", kind: "earth", earth: [61, -150], placeName: "アラスカ・JOSH-A", fx: "nuke", title: "アラスカ攻防戦とサイクロプス", text: "地球連合軍本部JOSH-Aへのザフトの総攻撃。連合は基地ごと巨大マイクロ波兵器「サイクロプス」で自爆させ、味方もろとも攻撃部隊を壊滅させる。" },
      { date: "C.E. 71年", work: "seed", kind: "earth", earth: [9, -79.5], placeName: "パナマ・マスドライバー", fx: "battle", title: "パナマ攻略戦", text: "ザフトが地球連合のマスドライバーがあるパナマ基地を攻略し、連合の宇宙への輸送路を断つ。" },
      { date: "C.E. 71年", work: "seed", kind: "earth", earth: [-12, 165], placeName: "南太平洋・オーブ連合首長国", fx: "battle", title: "オーブ解放作戦", text: "マスドライバーを求める地球連合軍が中立国オーブに侵攻。オーブは国の象徴であるマスドライバーと施設を自ら破壊する。" },
      { date: "C.E. 71年9月", work: "seed", kind: "space", place: "jachin", fx: "laser", from: "jachin", to: "l4", title: "ヤキン・ドゥーエ攻防戦とジェネシス", text: "プラント防衛の要塞ヤキン・ドゥーエで最終決戦。核攻撃を仕掛ける連合と、巨大ガンマ線レーザー「ジェネシス」を放つザフト。キラたち三隻同盟がその連鎖を止める。" },
      { date: "C.E. 73年10月", work: "destiny", kind: "drop", place: "junius", earth: [40, -30], placeName: "地球各地（破片）", title: "ユニウスセブン落下（ブレイク・ザ・ワールド）", text: "ザフトの脱走兵が、廃墟となったユニウスセブンを地球へ落とす。砕いた破片が各地に降り注ぎ、再び戦争が始まる。" },
      { date: "C.E. 73年", work: "destiny", kind: "space", place: "daedalus", fx: "laser", from: "daedalus", to: "plant", title: "レクイエム", text: "地球連合が月の裏のダイダロス基地から巨大ビーム砲「レクイエム」を発射。中継ステーションで曲げたビームでプラントのコロニーを撃ち抜く。" },
      { date: "C.E. 74年", work: "destiny", kind: "space", place: "messiah", fx: "battle", title: "メサイア攻防戦", text: "デュランダル議長の「デスティニー・プラン」をめぐり、ザフトの要塞メサイアでキラとアスラン、シンが激突する。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "ad", series: "gundam", era: "西暦（A.D.）／ガンダム00", short: "西暦（00）",
    intro: "『機動戦士ガンダム00』（2007）。化石燃料が枯渇し、3本の軌道エレベーターと太陽光発電に依存する24世紀の地球。私設武装組織ソレスタルビーイングが戦争根絶を掲げて武力介入する。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { oo: { name: "機動戦士ガンダム00", color: "#5bd1c8" }, movie: { name: "劇場版 00", color: "#ffd34f" } },
    places: { jupiter: far(-1.55, 0.95, "木星（遠方・縮尺外）", "#d9b38c", 16) },
    events: [
      { date: "A.D. 2307", work: "oo", kind: "space", place: "earthorbit", fx: "flash", title: "ソレスタルビーイングの武力介入宣言", text: "4機のガンダムを擁する組織が全世界に向けて、あらゆる戦争行為に武力で介入すると宣言する。" },
      { date: "A.D. 2307〜2308", work: "oo", kind: "space", place: "l4", fx: "battle", title: "国連軍との決戦（フォーリン・エンジェルス作戦）", text: "ガンダムに対抗するため結束した三大国家群の国連軍が、ソレスタルビーイングに総攻撃をかける。" },
      { date: "A.D. 2312", work: "oo", kind: "earth", earth: [0, 37], placeName: "アフリカの軌道エレベーター", fx: "nuke", title: "ブレイク・ピラー", text: "クーデター軍の占拠をきっかけに、アフリカの軌道エレベーターの外壁が崩落し、地上へ降り注ぐ。ガンダムたちが破片の除去に全力を尽くす。" },
      { date: "A.D. 2314", work: "movie", kind: "drop", place: "jupiter", earth: [20, 140], placeName: "地球（各地へ飛来）", rock: true, title: "ELSの来訪", text: "木星方面から金属生命体ELSが地球へ向かってくる。刹那・F・セイエイは、対話によって異種族と分かり合おうとする。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "ag", series: "gundam", era: "A.G.（ガンダムAGE）", short: "A.G.",
    intro: "『機動戦士ガンダムAGE』（2011）。火星移住計画で見捨てられた人々の子孫「ヴェイガン」と地球連邦の100年にわたる戦争を、三世代の主人公で描く。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { age: { name: "機動戦士ガンダムAGE", color: "#ff9a3c" } },
    places: {
      angel: { p: [0.44, S60], name: "コロニー・エンジェル", type: "colony" },
      mars: far(1.6, -0.9, "火星（遠方・縮尺外）", "#e0673c", 12),
    },
    events: [
      { date: "A.G. 初期", work: "age", kind: "space", place: "mars", title: "マーズレイと火星移住計画の破綻", text: "火星移住計画が進められるが、火星特有の病「マーズレイ」が蔓延し、連邦は移住者を見捨てて計画を打ち切る。残された人々は後にヴェイガンを名乗る。" },
      { date: "A.G. 101", work: "age", kind: "space", place: "angel", fx: "flash", title: "天使の落日", text: "謎の敵「UE」（後のヴェイガン）がコロニー・エンジェルを破壊する。少年フリット・アスノはガンダムの開発を決意する。" },
      { date: "A.G. 115", work: "age", kind: "space", place: "l2", fx: "battle", title: "アセムの時代", text: "フリットの息子アセムがガンダムAGE-2で戦う。ヴェイガンの正体が火星の移民の子孫であることが明らかになる。" },
      { date: "A.G. 164", work: "age", kind: "space", place: "l5", fx: "battle", title: "ラ・グラミス攻防戦", text: "フリットの孫キオがガンダムAGE-3、AGE-FXで戦う。三世代の主人公がそろう最終決戦で、100年の戦争に終止符が打たれる。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "rc", series: "gundam", era: "リギルド・センチュリー（R.C.）", short: "リギルド・センチュリー",
    intro: "『ガンダム Gのレコンギスタ』（2014）。宇宙世紀の後の時代とされ、宇宙からのエネルギー「フォトン・バッテリー」を宇宙エレベーター「キャピタル・タワー」で地上へ運ぶ世界。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { greco: { name: "ガンダム Gのレコンギスタ", color: "#ff7ab8" } },
    places: {
      towasanga: { p: [1.06, -0.03], name: "月の裏・トワサンガ", type: "base" },
      venus: far(-1.6, -0.9, "金星・ビーナス・グロゥブ（遠方・縮尺外）", "#f3d58a", 12),
    },
    events: [
      { date: "R.C. 1014", work: "greco", kind: "earth", earth: [-2, -55], placeName: "キャピタル・テリトリィ（赤道付近）", fx: "battle", title: "キャピタル・タワーと宇宙海賊", text: "キャピタル・ガードの候補生ベルリ・ゼナムは、タワーを襲撃した宇宙海賊の少女アイーダと出会い、彼女の乗っていたGセルフに乗り込む。" },
      { date: "R.C. 1014", work: "greco", kind: "space", place: "towasanga", title: "月の裏のトワサンガ", text: "ベルリたちは月の裏側の人々の国トワサンガを訪れ、自らの出生の秘密に触れる。" },
      { date: "R.C. 1014", work: "greco", kind: "space", place: "venus", title: "金星のビーナス・グロゥブ", text: "フォトン・バッテリーの供給源である金星圏の巨大施設ビーナス・グロゥブへ。地球圏の人々が忘れていた宇宙世紀の歴史と“レコンギスタ（地球への帰還）”の意味が明かされる。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "pd", series: "gundam", era: "P.D.（鉄血のオルフェンズ）", short: "P.D.",
    intro: "『機動戦士ガンダム 鉄血のオルフェンズ』（2015）。約300年前の「厄祭戦」の後、治安維持組織ギャラルホルンが支配する世界。火星の少年兵たちが「鉄華団」を立ち上げる。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { ibo: { name: "鉄血のオルフェンズ", color: "#ff5a4a" } },
    places: {
      mars: far(1.6, -0.9, "火星・クリュセ（遠方・縮尺外）", "#e0673c", 14),
      dort: { p: [0.28, 0.34], name: "ドルト・コロニー群", type: "colony" },
    },
    events: [
      { date: "約300年前", work: "ibo", kind: "space", place: "earthorbit", fx: "battle", title: "厄祭戦", text: "人類を殺戮する自律兵器モビルアーマーと、それに対抗するため作られた72機のガンダム・フレームの戦い。人類の4分の1が失われ、終結後に暦がP.D.に改められた。" },
      { date: "P.D. 323", work: "ibo", kind: "space", place: "mars", fx: "battle", title: "鉄華団の結成", text: "火星の民間警備会社CGSがギャラルホルンに襲撃される。少年兵のオルガ・イツカと三日月・オーガスは、ガンダム・バルバトスを起動して反撃し、会社を乗っ取って「鉄華団」を名乗る。" },
      { date: "P.D. 323", work: "ibo", kind: "space", place: "dort", fx: "battle", title: "ドルト・コロニーの暴動", text: "地球経済圏の支配下にあるドルト・コロニーで労働者の暴動が起き、ギャラルホルンが武力で鎮圧する。" },
      { date: "P.D. 323", work: "ibo", kind: "earth", earth: [53.5, -113.5], placeName: "アーブラウ・エドモントン", fx: "battle", title: "エドモントンの戦い", text: "クーデリアを議事堂へ送り届けるため、鉄華団がギャラルホルンの部隊と市街地で激突する。" },
      { date: "P.D. 325", work: "ibo", kind: "space", place: "mars", fx: "battle", title: "モビルアーマー・ハシュマルの復活と鉄華団の最期", text: "火星で厄祭戦のモビルアーマーが目覚め、三日月がこれを撃破する。その後、鉄華団はギャラルホルンに追い詰められ、仲間を逃がすための最後の戦いに臨む。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "as", series: "gundam", era: "アド・ステラ（A.S.）", short: "アド・ステラ",
    intro: "『機動戦士ガンダム 水星の魔女』（2022）。宇宙進出企業の連合体「ベネリットグループ」が支配する時代。水星から来た少女スレッタが、企業の学園アスティカシアに転入する。",
    map: "earthmoon", lp: ["L1", "L2", "L3", "L4", "L5"],
    works: { wm: { name: "機動戦士ガンダム 水星の魔女", color: "#ff7bd5" } },
    places: {
      fronte: { p: [0.44, S60], name: "フロント（宇宙の企業都市）", type: "colony" },
      asticassia: { p: [0.6, S60 + 0.02], name: "アスティカシア高等専門学園", type: "colony" },
      quetta: { p: [-0.5, -0.6], name: "プラント・クエタ", type: "colony" },
      mercury: far(-1.6, 0.9, "水星（遠方・縮尺外）", "#b8b0a8", 9),
    },
    events: [
      { date: "A.S. 105", work: "wm", kind: "space", place: "fronte", fx: "battle", title: "ヴァナディース事変", text: "人体と機体をつなぐ技術「GUND」を研究していた機関が、ガンダムを禁じる勢力に襲撃される。幼いエリクトと母エルノラだけが生き延びる（プロローグ）。" },
      { date: "A.S. 122", work: "wm", kind: "space", place: "mercury", title: "水星から来た少女", text: "水星で育ったスレッタ・マーキュリーが、ガンダム・エアリアルとともに地球圏へ向かう。" },
      { date: "A.S. 122", work: "wm", kind: "space", place: "asticassia", fx: "battle", title: "アスティカシア学園での決闘", text: "スレッタは学園の決闘でグエルに勝ち、ミオリネの“花婿”となる。モビルスーツによる決闘が学園の秩序を決める。" },
      { date: "A.S. 122", work: "wm", kind: "space", place: "quetta", fx: "battle", title: "プラント・クエタ襲撃", text: "テロリストがプラント・クエタを襲撃。スレッタはエアリアルで戦い、人の命が奪われる現実に直面する。" },
      { date: "A.S. 122", work: "wm", kind: "space", place: "earthorbit", fx: "flash", title: "クワイエット・ゼロ", text: "プロスペラが進めるデータストーム空間の計画「クワイエット・ゼロ」をめぐる最後の戦い。スレッタとミオリネ、エリクトが家族の未来を選ぶ。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "logh", series: "logh", era: "銀河英雄伝説（宇宙暦／帝国暦）", short: "銀河英雄伝説",
    intro: "田中芳樹『銀河英雄伝説』（1982〜1987）。専制の銀河帝国と民主共和制の自由惑星同盟が、二つの回廊を挟んで150年にわたり戦う。常勝の天才ラインハルトと不敗の魔術師ヤン・ウェンリーの物語。宇宙暦（SE）＝帝国暦（IC）＋309。",
    map: "galaxy",
    works: {
      pre: { name: "前史", color: "#9aa8cc" },
      dawn: { name: "黎明篇〜野望篇", color: "#ffd34f" },
      ambition: { name: "雌伏篇〜策謀篇", color: "#ff9a3c" },
      storm: { name: "風雲篇〜飛翔篇", color: "#6dd3ff" },
      ending: { name: "怒濤篇〜落日篇", color: "#ff5f7a" },
    },
    places: {
      odin: { p: [-0.72, 0.02], name: "帝都オーディン", type: "capital", side: "empire" },
      heinessen: { p: [0.72, 0.06], name: "首都ハイネセン", type: "capital", side: "alliance" },
      iserlohn: { p: [0, -0.3], name: "イゼルローン要塞", type: "fortress", side: "corridor" },
      fezzan: { p: [0, 0.42], name: "フェザーン自治領", type: "star", side: "corridor" },
      astarte: { p: [0.24, -0.38], name: "アスターテ星域", type: "star" },
      amritsar: { p: [-0.27, -0.34], name: "アムリッツァ星系", type: "star" },
      dagon: { p: [0.2, -0.18], name: "ダゴン星域", type: "star" },
      gaiesburg: { p: [-0.45, -0.12], name: "ガイエスブルク要塞", type: "fortress" },
      westerland: { p: [-0.55, 0.38], name: "ヴェスターラント", type: "star" },
      vermillion: { p: [0.42, 0.4], name: "バーミリオン星域", type: "star" },
      maradetta: { p: [0.36, 0.18], name: "マル・アデッタ星域", type: "star" },
      dorian: { p: [0.6, -0.25], name: "ドーリア星域", type: "star" },
      shiva: { p: [0.15, -0.42], name: "シヴァ星域", type: "star" },
      altair: { p: [-0.8, -0.45], name: "アルタイル星系", type: "star" },
      terra: { p: [-0.9, 0.6], name: "地球（辺境）", type: "star" },
      lm1: { p: [-0.55, 0.78], name: "長征の航路", type: "point" },
      lm2: { p: [0.45, 0.78], name: "長征の航路", type: "point" },
    },
    events: [
      { date: "宇宙暦310年／帝国暦1年", work: "pre", kind: "space", place: "odin", title: "銀河帝国の成立", text: "銀河連邦の政治家ルドルフ・フォン・ゴールデンバウムが皇帝に即位し、銀河帝国を建国。劣悪遺伝子排除法などの専制が敷かれる。" },
      { date: "宇宙暦473年〜527年", work: "pre", kind: "space", place: "altair", route: ["altair", "lm1", "lm2", "heinessen"], title: "長征一万光年と自由惑星同盟の建国", text: "流刑星アルタイルの奴隷たちが、アーレ・ハイネセンの指導でドライアイスの宇宙船を造って脱出。半世紀に及ぶ長征の末、銀河の反対側にたどり着き、自由惑星同盟を建国する。" },
      { date: "宇宙暦640年／帝国暦331年", work: "pre", kind: "space", place: "dagon", fx: "battle", title: "ダゴン星域会戦", text: "帝国と同盟が初めて接触し、大規模な艦隊戦となる。同盟が勝利し、以後150年にわたる戦争が始まる。" },
      { date: "宇宙暦7世紀", work: "pre", kind: "space", place: "fezzan", title: "フェザーン自治領の成立", text: "帝国と同盟をつなぐもう一つの回廊に、帝国の宗主権のもとで交易国家フェザーンが生まれ、両国の間で富と情報を握る。" },
      { date: "宇宙暦796年／帝国暦487年", work: "dawn", kind: "space", place: "astarte", fx: "battle", title: "アスターテ会戦", text: "ラインハルト・フォン・ローエングラムの帝国軍2万隻が、3方向から包囲しようとする同盟軍4万隻を各個撃破する。ヤン・ウェンリーが崩壊した第2艦隊を指揮して、全滅を防ぐ。" },
      { date: "宇宙暦796年", work: "dawn", kind: "space", place: "iserlohn", fx: "flash", route: ["heinessen", "iserlohn"], title: "イゼルローン要塞攻略", text: "6度の攻撃でも落ちなかった難攻不落の要塞を、ヤンの第13艦隊が帝国軍に変装した陸戦部隊の潜入で、ほぼ無血のまま奪取する。" },
      { date: "宇宙暦796年", work: "dawn", kind: "space", place: "amritsar", fx: "battle", route: ["iserlohn", "amritsar"], title: "帝国領侵攻とアムリッツァ星域会戦", text: "同盟軍は政治的な思惑から3,000万の大軍で帝国領に侵攻するが、焦土作戦で補給が尽き、アムリッツァでラインハルトに大敗する。" },
      { date: "宇宙暦797年／帝国暦488年", work: "dawn", kind: "space", place: "gaiesburg", fx: "battle", title: "リップシュタット戦役", text: "門閥貴族の連合軍がガイエスブルク要塞を拠点に反乱を起こし、ラインハルトと戦う帝国の内戦。" },
      { date: "宇宙暦797年", work: "dawn", kind: "space", place: "westerland", fx: "nuke", title: "ヴェスターラントの虐殺", text: "貴族連合の盟主ブラウンシュヴァイク公が、反乱した自領の惑星ヴェスターラントに核攻撃を加える。ラインハルトはこれを政治的に利用するために黙認し、キルヒアイスとの間に溝が生まれる。" },
      { date: "宇宙暦797年", work: "dawn", kind: "space", place: "gaiesburg", fx: "flash", title: "キルヒアイスの死", text: "戦役の終結後、捕虜の暗殺未遂からラインハルトをかばい、ジークフリード・キルヒアイスが死亡する。" },
      { date: "宇宙暦797年", work: "dawn", kind: "space", place: "dorian", fx: "battle", title: "救国軍事会議のクーデターとドーリア星域会戦", text: "同盟でも、帝国の策謀に乗せられた軍の一派がクーデターを起こす。ヤンはドーリア星域で反乱軍の艦隊を破り、首都ハイネセンを解放する。" },
      { date: "宇宙暦798年／帝国暦489年", work: "ambition", kind: "space", place: "iserlohn", fx: "battle", route: ["gaiesburg", "iserlohn"], title: "要塞対要塞", text: "帝国軍はガイエスブルク要塞にワープエンジンを取り付けてイゼルローン回廊まで運び、要塞同士の砲撃戦を挑む。" },
      { date: "宇宙暦798年", work: "ambition", kind: "space", place: "fezzan", fx: "battle", route: ["odin", "fezzan", "heinessen"], title: "神々の黄昏（ラグナロック）作戦", text: "帝国宰相ラインハルトは、イゼルローン方面を陽動にして、本隊で中立のフェザーン回廊を突破。同盟領へ雪崩れ込む。" },
      { date: "宇宙暦799年／帝国暦490年", work: "storm", kind: "space", place: "vermillion", fx: "battle", title: "バーミリオン星域会戦", text: "ヤンとラインハルトの直接対決。ヤンはラインハルトの旗艦ブリュンヒルトに迫るが、首都を包囲された同盟政府の停戦命令に従い、攻撃を止める。同盟はバーラトの和約で事実上の属国になる。" },
      { date: "宇宙暦799年／新帝国暦1年", work: "storm", kind: "space", place: "odin", fx: "flash", title: "ローエングラム王朝の成立", text: "ラインハルトが皇帝に即位し、ゴールデンバウム王朝に代わるローエングラム王朝を開く。のちに帝都をフェザーンへ移す。" },
      { date: "宇宙暦800年／新帝国暦2年", work: "storm", kind: "space", place: "maradetta", fx: "battle", title: "マル・アデッタ星域会戦と同盟の滅亡", text: "老提督ビュコックが最後の同盟軍艦隊を率いてラインハルトに挑み、戦死する。自由惑星同盟は滅亡する。" },
      { date: "宇宙暦800年", work: "ending", kind: "space", place: "iserlohn", fx: "battle", title: "回廊の戦いとヤン・ウェンリーの死", text: "イゼルローン回廊で帝国軍の大攻勢を退けたヤンは、ラインハルトとの会談に向かう途中、地球教徒のテロによって暗殺される。" },
      { date: "宇宙暦801年／新帝国暦3年", work: "ending", kind: "space", place: "shiva", fx: "battle", title: "シヴァ星域会戦", text: "ユリアン・ミンツが率いるイゼルローン共和政府軍と帝国軍が戦う。決着ののち、共和派はバーラト星系の自治と引き換えに和平を結ぶ。" },
      { date: "新帝国暦3年", work: "ending", kind: "space", place: "fezzan", fx: "flash", title: "皇帝ラインハルトの崩御", text: "新たな帝都フェザーンで、ラインハルトは病のため25歳で世を去る。帝国は皇妃ヒルダと幼い皇子に託される。" },
    ],
  });


  /* ------------------------------------------------------------------ */
  // 銀河図の座標：グリッド（列 A〜X、行 1〜21）を参考にした模式的な配置
  const G = (col, row, dx = 0, dy = 0) => [((col.charCodeAt(0) - 65 + 1) - 12) / 12 + dx, ((row - 11) / 10) * 0.75 + dy];
  const planet = (p, name, color) => ({ p, name, type: "planet", color });
  worlds.push({
    id: "sw", series: "sw", era: "スター・ウォーズ（BBY／ABY）", short: "スター・ウォーズ",
    intro: "ジョージ・ルーカスが1977年に生んだ、遠い昔、はるか彼方の銀河系の物語。年はヤヴィンの戦い（デス・スター破壊）を基準に、それより前をBBY、後をABYで表す。映画9部作とスピンオフ作品の主な出来事を表示する（現在の公式設定「カノン」に基づく）。",
    map: "galaxy", galaxy: "sw",
    fleet: ["#c8ced8", "#ffb070"],
    works: {
      pre: { name: "前史", color: "#9aa8cc" },
      ep1: { name: "エピソード1 ファントム・メナス", color: "#ffd34f" },
      ep2: { name: "エピソード2 クローンの攻撃", color: "#ffb347" },
      tcw: { name: "クローン・ウォーズ", color: "#7dd3ff" },
      ep3: { name: "エピソード3 シスの復讐", color: "#ff5f7a" },
      rebels: { name: "反乱者たち", color: "#b6e388" },
      rogue: { name: "ローグ・ワン", color: "#9fb8c8" },
      ep4: { name: "エピソード4 新たなる希望", color: "#4f9bff" },
      ep5: { name: "エピソード5 帝国の逆襲", color: "#8fa3ff" },
      ep6: { name: "エピソード6 ジェダイの帰還", color: "#7dff9c" },
      mando: { name: "マンダロリアン ほか", color: "#d9b38c" },
      ep7: { name: "エピソード7 フォースの覚醒", color: "#ff8f6b" },
      ep8: { name: "エピソード8 最後のジェダイ", color: "#ff6b8f" },
      ep9: { name: "エピソード9 スカイウォーカーの夜明け", color: "#c79bff" },
    },
    places: {
      coruscant: { p: G("L", 9), name: "コルサント（銀河の首都）", type: "capital", side: "alliance" },
      tatooine: planet(G("R", 16), "タトゥイーン", "#e8c27a"),
      naboo: planet(G("O", 17), "ナブー", "#7fd18c"),
      kamino: planet(G("S", 15), "カミーノ", "#6aa8d8"),
      geonosis: planet(G("R", 16, 0.04, -0.07), "ジオノーシス", "#d8885a"),
      christophsis: planet([0.62, -0.18], "クリストフシス", "#a8e0ff"),
      utapau: planet(G("N", 19), "ウータパウ", "#c8b08a"),
      mustafar: planet(G("L", 19), "ムスタファー", "#ff5a2a"),
      mandalore: planet(G("O", 7), "マンダロア", "#b8c8b0"),
      lothal: planet([0.47, 0.62], "ロザル", "#a8c870"),
      yavin: planet(G("P", 6), "ヤヴィン4", "#7fbf7f"),
      alderaan: planet(G("M", 10), "オルデラン", "#7fb4ff"),
      deathstar: { p: G("M", 10, 0.13, 0.06), name: "デス・スター", type: "station" },
      jedha: planet([0.38, -0.02], "ジェダ", "#d8c8a8"),
      scarif: planet([0.66, 0.4], "スカリフ", "#5ad0d8"),
      hoth: planet(G("K", 18), "ホス", "#e8f0ff"),
      dagobah: planet(G("M", 19, 0.02, 0.03), "ダゴバ", "#6a9a5a"),
      bespin: planet(G("K", 18, 0.05, 0.05), "ベスピン", "#e8b080"),
      endor: planet(G("H", 16), "エンドア", "#6ab07a"),
      jakku: planet([-0.55, 0.2], "ジャクー", "#d8b070"),
      chandrila: planet([-0.16, -0.24], "シャンドリラ", "#9ad0a8"),
      nevarro: planet([0.58, 0.05], "ネヴァロ", "#b06a4a"),
      takodana: planet([-0.3, 0.02], "タコダナ", "#6ac08a"),
      hosnian: planet([-0.13, 0.04], "ホズニアン・プライム", "#9ab8ff"),
      starkiller: { p: [-0.74, -0.12], name: "スターキラー基地", type: "station" },
      crait: planet([0.42, 0.5], "クレイト", "#f0f0f0"),
      ahchto: planet([-0.62, -0.45], "オク＝トー", "#5a8ab0"),
      exegol: planet([-0.86, 0.18], "エクセゴル", "#8a6ab0"),
    },
    events: [
      { date: "約2万5千年前", work: "pre", kind: "space", place: "coruscant", title: "銀河共和国の成立", text: "多くの星系が集まり、民主的な銀河共和国が生まれる。ジェダイ・オーダーは平和の守護者として、長く共和国を支えた。" },
      { date: "約232BBY〜", work: "pre", kind: "space", place: "coruscant", title: "ハイ・リパブリック時代", text: "共和国とジェダイの黄金期。アウター・リムへの開拓が進む一方、略奪者集団ナイヒルとの戦いが始まる（スピンオフ小説・ドラマで描かれる時代）。" },
      { date: "32BBY", work: "ep1", kind: "space", place: "naboo", fx: "battle", title: "ナブーの危機", text: "通商連合がナブーを封鎖・侵略する。ジェダイのクワイ＝ガン・ジンとオビ＝ワン・ケノービがアミダラ女王を救い、戦いの末にナブーは解放されるが、クワイ＝ガンはシスのダース・モールに倒される。" },
      { date: "32BBY", work: "ep1", kind: "space", place: "tatooine", title: "アナキン・スカイウォーカーとの出会い", text: "砂漠の惑星タトゥイーンで、クワイ＝ガンは強いフォースをもつ奴隷の少年アナキンと出会う。ポッドレースに勝ったアナキンは自由を得て、ジェダイへの道を歩み始める。" },
      { date: "22BBY", work: "ep2", kind: "space", place: "kamino", title: "カミーノのクローン軍", text: "暗殺事件を追ったオビ＝ワンは、海の惑星カミーノで共和国のために極秘に作られていたクローン兵の大軍を発見する。" },
      { date: "22BBY", work: "ep2", kind: "space", place: "geonosis", fx: "battle", route: ["kamino", "geonosis"], routeColor: "#e8eef8", title: "ジオノーシスの戦いとクローン戦争の開戦", text: "分離主義勢力のドロイド軍と、ヨーダが率いるクローン軍が激突。共和国と独立星系連合のクローン戦争が始まる。" },
      { date: "22BBY", work: "tcw", kind: "space", place: "christophsis", fx: "battle", title: "クリストフシスの戦い", text: "アナキンと、彼の弟子となったアソーカ・タノが、結晶の惑星クリストフシスで分離主義勢力と戦う。" },
      { date: "19BBY", work: "tcw", kind: "space", place: "mandalore", fx: "battle", title: "マンダロア包囲戦", text: "アソーカとクローン部隊が、ダース・モールに支配されたマンダロアを解放しようと戦う。その最中にオーダー66が発令される。" },
      { date: "19BBY", work: "ep3", kind: "space", place: "utapau", fx: "battle", title: "ウータパウの戦い", text: "オビ＝ワンが分離主義勢力の司令官グリーヴァス将軍を倒し、クローン戦争は終わりに近づく。" },
      { date: "19BBY", work: "ep3", kind: "space", place: "coruscant", fx: "flash", title: "オーダー66と銀河帝国の成立", text: "最高議長パルパティーンの正体はシス卿ダース・シディアスだった。クローン兵に組み込まれた命令「オーダー66」でジェダイは次々に殺され、パルパティーンは共和国を銀河帝国に変えて皇帝を名乗る。アナキンはダース・ベイダーとなる。" },
      { date: "19BBY", work: "ep3", kind: "space", place: "mustafar", fx: "duel", sabers: ["#4fa8ff", "#4fa8ff"], title: "ムスタファーの決闘", text: "溶岩の惑星ムスタファーで、オビ＝ワンとアナキンが戦う。敗れたアナキンは重傷を負い、機械の体のダース・ベイダーとなる。生まれた双子ルークとレイアは、タトゥイーンとオルデランに隠される。" },
      { date: "5BBY〜", work: "rebels", kind: "space", place: "lothal", fx: "battle", title: "ロザルの反乱者たち", text: "帝国に支配された惑星ロザルで、小さな反乱者のチーム（ゴースト号の乗員）が抵抗運動を始める。各地の反乱者たちは、やがて一つの同盟へとまとまっていく。" },
      { date: "2BBY", work: "rebels", kind: "space", place: "yavin", title: "反乱同盟の結成", text: "各地の反乱組織が正式に結集し、反乱同盟軍が誕生する。" },
      { date: "0BBY", work: "rogue", kind: "space", place: "jedha", fx: "nuke", title: "デス・スターの試射（ジェダ）", text: "帝国の超兵器デス・スターが、聖地ジェダの都市を試し撃ちで消し去る。" },
      { date: "0BBY", work: "rogue", kind: "space", place: "scarif", fx: "battle", title: "スカリフの戦い", text: "ジン・アーソたち「ローグ・ワン」がスカリフの帝国の施設に潜入し、デス・スターの設計図を盗み出して反乱同盟に送る。部隊は全滅するが、設計図はレイア姫の手に渡る。" },
      { date: "0BBY", work: "ep4", kind: "space", place: "alderaan", fx: "planetkill", from: "deathstar", title: "オルデランの破壊", text: "総督ターキンは、レイア姫への見せしめとして、デス・スターのスーパーレーザーで彼女の故郷オルデランを惑星ごと破壊する。" },
      { date: "0BBY／0ABY", work: "ep4", kind: "space", place: "yavin", fx: "battle", title: "ヤヴィンの戦い", text: "ルーク・スカイウォーカーがデス・スターの排熱口にプロトン魚雷を撃ち込み、デス・スターを破壊する。この戦いが銀河の暦（BBY／ABY）の基準になる。" },
      { date: "3ABY", work: "ep5", kind: "space", place: "hoth", fx: "battle", title: "ホスの戦い", text: "氷の惑星ホスにあった反乱同盟の基地が、帝国軍のAT-AT部隊に攻め落とされる。" },
      { date: "3ABY", work: "ep5", kind: "space", place: "dagobah", title: "ダゴバでの修行", text: "ルークは沼の惑星ダゴバで、隠れ住んでいたジェダイ・マスターのヨーダから修行を受ける。" },
      { date: "3ABY", work: "ep5", kind: "space", place: "bespin", fx: "duel", sabers: ["#4fa8ff", "#ff3b3b"], title: "クラウド・シティの決闘", text: "ガス惑星ベスピンの空中都市で、ルークはダース・ベイダーと戦い、ベイダーが自分の父であると告げられる。ハン・ソロはカーボナイトで凍結される。" },
      { date: "4ABY", work: "ep6", kind: "space", place: "endor", fx: "battle", title: "エンドアの戦い", text: "反乱同盟が建造中の第2デス・スターを攻撃。森の月ではイウォークたちとともにシールド発生装置を破壊する。皇帝の玉座の間で、ベイダーはルークを救うため皇帝を倒し、アナキンに戻って息を引き取る。" },
      { date: "5ABY", work: "mando", kind: "space", place: "jakku", fx: "battle", title: "ジャクーの戦い", text: "帝国軍の残存艦隊と新共和国軍の最後の大規模な戦い。敗れた帝国は、銀河協定で新共和国と講和する。" },
      { date: "9ABY", work: "mando", kind: "space", place: "nevarro", fx: "battle", title: "マンダロリアンとグローグー", text: "賞金稼ぎのマンダロリアン（ディン・ジャリン）が、フォースをもつ子どもグローグーを守って帝国の残党と戦う。" },
      { date: "34ABY", work: "ep7", kind: "space", place: "jakku", title: "ジャクーのレイ", text: "砂漠の惑星ジャクーで廃品を集めて暮らす少女レイが、ドロイドのBB-8と、ファースト・オーダーを脱走したフィンに出会う。" },
      { date: "34ABY", work: "ep7", kind: "space", place: "hosnian", placeName: "ホズニアン・プライム（新共和国の首都）", fx: "planetkill", from: "starkiller", title: "ホズニアン星系の破壊", text: "帝国の後継組織ファースト・オーダーが、惑星そのものを兵器に改造したスターキラー基地から光線を放ち、新共和国の首都ホズニアン・プライムを含む星系を破壊する。" },
      { date: "34ABY", work: "ep7", kind: "space", place: "starkiller", fx: "battle", title: "スターキラー基地の破壊", text: "レジスタンスがスターキラー基地を攻撃し、ポー・ダメロンのXウイングが基地を破壊する。直前、ハン・ソロは息子カイロ・レンに殺される。" },
      { date: "34ABY", work: "ep8", kind: "space", place: "crait", fx: "battle", title: "クレイトの戦い", text: "追い詰められたレジスタンスが、塩の惑星クレイトに立てこもる。オク＝トーからフォースの投影で現れたルークがカイロ・レンを引きつけ、仲間を逃がした後、力を使い果たして消える。" },
      { date: "35ABY", work: "ep9", kind: "space", place: "exegol", fx: "battle", route: ["ahchto", "exegol"], routeColor: "#ffb070", title: "エクセゴルの戦い", text: "未知領域の惑星エクセゴルで、生きていたパルパティーンが大艦隊ファイナル・オーダーを率いて復活する。銀河中から集まった市民の艦隊とレジスタンスが戦い、レイとベン・ソロ（カイロ・レン）がパルパティーンを打ち倒す。" },
    ],
  });


  /* ------------------------------------------------------------------ */
  const TOKYO3 = [35.23, 139.06]; // 箱根（第3新東京市のモデル）
  worlds.push({
    id: "eva", series: "eva", era: "新世紀エヴァンゲリオン（TV版・旧劇場版）", short: "TV版・旧劇場版",
    intro: "庵野秀明監督『新世紀エヴァンゲリオン』（1995〜1996）と『新世紀エヴァンゲリオン劇場版 Air/まごころを、君に』（1997）。2000年のセカンドインパクトで人類の半数が失われた世界で、2015年、第3新東京市に“使徒”が襲来する。地球の出来事は地球に寄って表示する。",
    map: "earthmoon", noLagrange: true, earthZoom: 1.9,
    works: {
      pre: { name: "前史", color: "#9aa8cc" },
      tv: { name: "新世紀エヴァンゲリオン（TV）", color: "#9b6bff" },
      eoe: { name: "旧劇場版 Air/まごころを、君に", color: "#ff5f5f" },
    },
    places: {},
    events: [
      { date: "2000年9月13日", work: "pre", kind: "earth", earth: [-80, 20], placeName: "南極", fx: "cross", crossColor: "rgba(255,255,255,0.9)", title: "セカンドインパクト", text: "南極で巨大な爆発が起き、南極の氷が溶けて海面が上昇、地軸もずれる。続く混乱と紛争で人類の半数が失われた。表向きは大質量隕石の落下とされたが、実際は南極で発見された“第1使徒アダム”に対する接触実験が原因だった。葛城調査隊の唯一の生存者が、少女時代のミサトである。" },
      { date: "2004年", work: "pre", kind: "earth", earth: TOKYO3, placeName: "ゲヒルン（箱根の地下・ジオフロント）", fx: "flash", title: "碇ユイの消失", text: "人工進化研究所（ゲヒルン）で行われたエヴァンゲリオン初号機の起動実験で、碇ゲンドウの妻ユイが初号機に取り込まれて消える。幼いシンジはその様子を見ていた。" },
      { date: "2010年", work: "pre", kind: "earth", earth: TOKYO3, placeName: "第3新東京市・ジオフロント", title: "ゲヒルン解体と特務機関NERVの発足", text: "ゲヒルンは解体され、使徒迎撃のための国連直属の特務機関NERVが発足。スーパーコンピュータMAGIを開発した赤木ナオコ博士が死亡する。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "第3新東京市", fx: "battle", title: "第3使徒サキエル襲来", text: "15年ぶりに使徒が現れる。父ゲンドウに呼び出された14歳の碇シンジは、エヴァンゲリオン初号機に乗ることを強いられる。暴走した初号機が使徒を倒す。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "第3新東京市", fx: "battle", title: "第4使徒シャムシエル", text: "鞭のような腕をもつ使徒との戦い。シンジは戦闘に巻き込まれた同級生のトウジとケンスケをエントリープラグに乗せて戦う。" },
      { date: "2015年", work: "tv", kind: "earth", earth: [35.24, 139.04], placeName: "二子山（箱根）", fx: "beam", title: "第5使徒ラミエルとヤシマ作戦", text: "強力な加粒子砲で近づくものを撃ち抜く正八面体の使徒。日本中の電力を集めて陽電子砲で狙撃する「ヤシマ作戦」が行われ、零号機の綾波レイが盾となってシンジを守る。" },
      { date: "2015年", work: "tv", kind: "earth", earth: [25, 135], placeName: "太平洋上（国連海軍の艦隊）", fx: "battle", title: "第6使徒ガギエルとアスカの来日", text: "ドイツから弐号機を運ぶ国連海軍の太平洋艦隊が、海中の使徒に襲われる。セカンドチルドレンの惣流・アスカ・ラングレーが、シンジを同乗させて弐号機で撃破する。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "第3新東京市", fx: "battle", title: "第7使徒イスラフェル", text: "二体に分裂する使徒。シンジとアスカは息の合った同時攻撃のため、音楽に合わせた共同生活と特訓を行う。" },
      { date: "2015年", work: "tv", kind: "earth", earth: [36.4, 138.52], placeName: "浅間山の火口", fx: "battle", title: "第8使徒サンダルフォン", text: "浅間山の火口のマグマの中で、サナギの状態の使徒が見つかる。弐号機が耐熱装備でマグマに潜って捕獲を試みる。" },
      { date: "2015年", work: "tv", kind: "drop", place: "earthorbit", earth: TOKYO3, placeName: "第3新東京市", caught: true, rock: true, title: "第10使徒サハクィエル", text: "衛星軌道上から自らを落下させて、第3新東京市に体当たりしようとする使徒。エヴァ3機が落下地点を予測して走り、手で受け止めて殲滅する。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "NERV本部（MAGI）", fx: "flash", title: "第11使徒イロウル", text: "微生物サイズの群体の使徒がNERV本部に侵入し、スーパーコンピュータMAGIをハッキングして自爆させようとする。赤木リツコが逆にプログラムで撃退する。" },
      { date: "2015年", work: "tv", kind: "earth", earth: [36.56, 138.19], placeName: "松代（第2実験場）", fx: "battle", title: "第13使徒バルディエルとエヴァ参号機", text: "アメリカから運ばれたエヴァ参号機の松代での起動実験中、参号機が使徒に乗っ取られる。パイロットはトウジだった。シンジが戦いを拒む中、初号機はダミーシステムで参号機を引き裂く。" },
      { date: "2015年", work: "tv", kind: "earth", earth: [39.3, -116.5], placeName: "アメリカ・ネバダ（NERV第2支部）", fx: "nuke", title: "NERV第2支部の消滅", text: "永久機関S²機関を搭載したエヴァ四号機の起動実験中、第2支部は施設ごと消滅する。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "第3新東京市・ジオフロント", fx: "battle", title: "第14使徒ゼルエルと初号機の覚醒", text: "最強の使徒がジオフロントに侵入し、零号機と弐号機を圧倒する。エネルギーの切れた初号機が暴走して使徒を捕食し、S²機関を取り込む。" },
      { date: "2015年", work: "tv", kind: "space", place: "moon", fx: "beam", from: "earthorbit", to: "moon", title: "第15使徒アラエルとロンギヌスの槍", text: "衛星軌道上の使徒が光でアスカの心を侵す。零号機がロンギヌスの槍を投げて使徒を倒し、槍はそのまま月の軌道まで飛んでいく。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "第3新東京市", fx: "nuke", title: "第16使徒アルミサエルとレイの自爆", text: "零号機に侵食・融合しようとする使徒を道連れに、レイは零号機を自爆させ、第3新東京市に巨大なクレーターが残る。レイは“3人目”として再び現れる。" },
      { date: "2015年", work: "tv", kind: "earth", earth: TOKYO3, placeName: "NERV本部・ターミナルドグマ", fx: "flash", title: "第17使徒タブリス（渚カヲル）", text: "フィフスチルドレンとして現れた少年・渚カヲルは、最後の使徒だった。弐号機を操ってターミナルドグマへ降りたカヲルを、シンジは初号機の手で握りつぶす。" },
      { date: "2015年", work: "eoe", kind: "earth", earth: TOKYO3, placeName: "NERV本部", fx: "battle", title: "戦略自衛隊のNERV本部侵攻", text: "人類補完計画を進める秘密組織ゼーレは、NERV本部の制圧を命じる。戦略自衛隊が本部を襲撃し、弐号機のアスカはエヴァ量産機9体と戦う。" },
      { date: "2015年", work: "eoe", kind: "earth", earth: TOKYO3, placeName: "第3新東京市（地球全体へ）", fx: "redsea", title: "サードインパクトと人類補完計画", text: "量産機によって初号機が依り代とされ、巨大化したリリス（レイ）のもとで全人類の心の壁（ATフィールド）が溶けて一つになる。その中でシンジは、他者のいる世界をもう一度選ぶ。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  worlds.push({
    id: "evarebuild", series: "eva", era: "ヱヴァンゲリヲン新劇場版（序・破・Q・シン）", short: "新劇場版",
    intro: "『ヱヴァンゲリヲン新劇場版：序』（2007）から『シン・エヴァンゲリオン劇場版』（2021）までの4部作。TV版をなぞる序から、破で大きく展開が変わり、Qでは14年後の世界、シンで物語が完結する。使徒の番号はTV版と異なる。",
    map: "earthmoon", noLagrange: true, earthZoom: 1.9,
    works: {
      jo: { name: "序（2007）", color: "#9b6bff" },
      ha: { name: "破（2009）", color: "#ff7a5f" },
      q: { name: "Q（2012）", color: "#4fd1ff" },
      shin: { name: "シン・エヴァンゲリオン（2021）", color: "#ff5fa8" },
    },
    places: { tabgha: { p: [1.05, -0.04], name: "月・タブハベース", type: "base" } },
    events: [
      { date: "序", work: "jo", kind: "earth", earth: TOKYO3, placeName: "第3新東京市", fx: "battle", title: "第4の使徒の襲来", text: "シンジは父に呼ばれて第3新東京市を訪れ、初号機に乗って使徒と戦う。" },
      { date: "序", work: "jo", kind: "earth", earth: [35.24, 139.04], placeName: "二子山（箱根）", fx: "beam", title: "第6の使徒とヤシマ作戦", text: "変形しながら加粒子砲を放つ正八面体の使徒に対し、日本中の電力を集めた陽電子砲で狙撃する。" },
      { date: "序", work: "jo", kind: "space", place: "tabgha", title: "月の渚カヲル", text: "月面で目覚めた渚カヲルが「また3番目とはね」とつぶやく。" },
      { date: "破", work: "ha", kind: "earth", earth: [75, -40], placeName: "北極・ベタニアベース", fx: "battle", title: "第3の使徒と真希波・マリ", text: "北極のNERV基地で、封印されていた第3の使徒が逃げ出す。新キャラクター真希波・マリ・イラストリアスがエヴァ5号機で撃破する。" },
      { date: "破", work: "ha", kind: "drop", place: "earthorbit", earth: TOKYO3, placeName: "第3新東京市", caught: true, rock: true, title: "第8の使徒（衛星軌道からの落下）", text: "衛星軌道から落下してくる使徒を、初号機・零号機・弐号機の3機で受け止めて倒す。" },
      { date: "破", work: "ha", kind: "earth", earth: [36.56, 138.19], placeName: "松代", fx: "battle", title: "第9の使徒とエヴァ3号機", text: "3号機の起動実験中に使徒が寄生する。パイロットは式波・アスカ・ラングレーだった。初号機はダミーシステムで3号機を破壊する。" },
      { date: "破", work: "ha", kind: "earth", earth: TOKYO3, placeName: "第3新東京市・ジオフロント", fx: "cross", crossColor: "rgba(255,90,90,0.9)", title: "第10の使徒とニア・サードインパクト", text: "零号機ごとレイを取り込んだ使徒に対し、シンジの初号機が覚醒してレイを救い出す。初号機は人のかたちを超え始め、サードインパクトが起きかける。" },
      { date: "破", work: "ha", kind: "drop", place: "tabgha", earth: TOKYO3, placeName: "第3新東京市", caught: true, rock: true, title: "カヲルの槍", text: "月から降下してきたエヴァ Mark.06 の渚カヲルが槍を投げ、覚醒した初号機を止める。" },
      { date: "Q（破の14年後）", work: "q", kind: "space", place: "earthorbit", fx: "battle", title: "初号機の回収（US作戦）", text: "反NERV組織ヴィレが、衛星軌道上に封印されていた初号機を回収する。目覚めたシンジは、自分が14年眠っていたこと、そしてニア・サードインパクトの結果を知る。" },
      { date: "Q", work: "q", kind: "earth", earth: TOKYO3, placeName: "NERV本部跡・セントラルドグマ", fx: "cross", crossColor: "rgba(255,80,80,0.9)", title: "フォースインパクトの発動", text: "槍を抜けば世界をやり直せると信じたシンジは、カヲルとともに13号機に乗り込むが、それがフォースインパクトの引き金となる。カヲルは身を挺してそれを止め、命を落とす。" },
      { date: "シン", work: "shin", kind: "earth", earth: [48.86, 2.35], placeName: "フランス・パリ", fx: "battle", title: "パリ市街の復元作戦", text: "ヴィレがユーロネルフの拠点だったパリを奪還し、赤く“コア化”した街をもとに戻す作戦を行う。マリの8号機がNERVのエヴァ部隊と戦う。" },
      { date: "シン", work: "shin", kind: "earth", earth: [35.8, 138.6], placeName: "第3村（日本国内）", title: "第3村での暮らし", text: "心を閉ざしたシンジは、生き延びた人々が暮らす第3村で、大人になったトウジやケンスケと再会し、少しずつ立ち直っていく。" },
      { date: "シン", work: "shin", kind: "earth", earth: [-80, 20], placeName: "南極（NERV本部の爆心地）", fx: "battle", title: "ヤマト作戦", text: "ヴィレの戦艦ヴンダーが南極のNERV本部に突入し、ゲンドウが進める“アディショナル・インパクト”を止めようとする。" },
      { date: "シン", work: "shin", kind: "earth", earth: [-80, 20], placeName: "南極・マイナス宇宙", fx: "redsea", title: "アディショナル・インパクトとシンジの選択", text: "マイナス宇宙でシンジは父ゲンドウと向き合い、エヴァのない世界（ネオン・ジェネシス）を選ぶ。" },
      { date: "シン", work: "shin", kind: "earth", earth: [33.95, 131.25], placeName: "山口県・宇部新川駅", title: "エヴァのない世界へ", text: "大人になったシンジとマリが、駅から街へと駆け出していく。" },
    ],
  });


  /* ------------------------------------------------------------------ */
  const ATARIA = [15, 142];
  const MACWORKS = {
    zero: { name: "マクロス ゼロ", color: "#7fc8ff" },
    sdf: { name: "超時空要塞マクロス", color: "#ff6b6b" },
    plus: { name: "マクロスプラス", color: "#6dd3ff" },
    m7: { name: "マクロス7", color: "#ffb347" },
    frontier: { name: "マクロスF", color: "#7dff9c" },
    delta: { name: "マクロスΔ", color: "#ff8fd0" },
    proto: { name: "前史", color: "#9aa8cc" },
  };
  worlds.push({
    id: "macross", series: "macross", era: "マクロス：地球圏の時代（1999〜2040年）", short: "地球圏",
    intro: "『超時空要塞マクロス』（1982）に始まるシリーズの前半。1999年、異星人の巨大宇宙船が地球に墜落したことから、人類は統合政府を作り、巨人族ゼントラーディとの星間戦争を“歌”で終わらせる。可変戦闘機バルキリーと歌姫がシリーズを通した主役。",
    map: "earthmoon", noLagrange: true,
    works: MACWORKS,
    places: {
      pluto: far(-1.6, -0.9, "冥王星軌道（遠方・縮尺外）", "#c8c0b8", 8),
      mars: far(1.6, -0.9, "火星・サラ基地（遠方・縮尺外）", "#e0673c", 12),
      zentfleet: { p: [0.45, -0.35], name: "ボドルザー基幹艦隊", type: "rock" },
    },
    events: [
      { date: "1999年7月", work: "sdf", kind: "drop", place: "earthorbit", earth: ATARIA, placeName: "南アタリア島（太平洋の架空の島）", title: "異星の巨大宇宙船の墜落", text: "全長1,200 mを超える異星人の宇宙戦艦が、南太平洋の南アタリア島に墜落する。人類は宇宙に自分たち以外の知的生命がいることを知り、その超技術（オーバーテクノロジー）の解析が始まる。" },
      { date: "1999〜2001年", work: "sdf", kind: "earth", earth: [35, 10], placeName: "地球各地", fx: "battle", title: "統合戦争", text: "異星人の脅威に備えて地球統合政府を作ろうとする勢力と、それに反対する勢力の間で世界規模の戦争が起きる。統合政府側が勝利する。" },
      { date: "2008年", work: "zero", kind: "earth", earth: [-12, 168], placeName: "南太平洋・マヤン島（架空の島）", fx: "song", title: "マヤン島の戦い（マクロス ゼロ）", text: "統合戦争の末期、古い歌と伝承が残るマヤン島で、統合軍と反統合同盟の可変戦闘機が戦う。島に眠るプロトカルチャーの遺産“鳥の人”が目覚める。" },
      { date: "2009年2月", work: "sdf", kind: "earth", earth: ATARIA, placeName: "南アタリア島", fx: "battle", title: "マクロス進宙式とゼントラーディの襲来", text: "修復された宇宙戦艦は「SDF-1 マクロス」として進宙式を迎えるが、その日、巨人族ゼントラーディの艦隊が現れる。主砲が勝手に発射され、第一次星間大戦が始まる。" },
      { date: "2009年", work: "sdf", kind: "space", place: "pluto", fx: "flash", title: "フォールドの失敗と冥王星軌道", text: "マクロスは超光速航法フォールドで月の裏側へ逃れようとするが、島の住民ごと冥王星の軌道まで飛ばされてしまう。艦内に街を作り、民間人を乗せたまま、地球への長い帰還の旅が始まる。" },
      { date: "2009年", work: "sdf", kind: "space", place: "mars", fx: "battle", title: "火星のサラ基地", text: "帰還の途中、マクロスは放棄された火星のサラ基地に立ち寄り、ゼントラーディの攻撃を受ける。" },
      { date: "2009年", work: "sdf", kind: "space", place: "earthorbit", song: true, title: "歌姫リン・ミンメイ", text: "マクロスの艦内の街で、少女リン・ミンメイが歌手としてデビューする。文化を知らないゼントラーディは、歌に強い衝撃を受ける。主人公の一条輝はバルキリーのパイロットとして戦う。" },
      { date: "2010年", work: "sdf", kind: "earth", earth: [40, -100], placeName: "地球全土", fx: "nuke", title: "ボドルザー基幹艦隊による地球砲撃", text: "ゼントラーディの総司令ボドルザーが率いる約480万隻の基幹艦隊が地球軌道に現れ、地上を一斉に砲撃する。地球の人口の大部分が失われる。" },
      { date: "2010年", work: "sdf", kind: "space", place: "zentfleet", fx: "song", title: "ミンメイ・アタックと第一次星間大戦の終結", text: "マクロスと、和平を選んだブリタイの艦隊が、ミンメイの歌を戦場全体に流しながらボドルザー艦隊に突入する。歌に混乱した基幹艦隊は崩れ、ボドルザーは倒される。" },
      { date: "2011年〜", work: "sdf", kind: "earth", earth: [40, -100], placeName: "地球・マクロス・シティ", title: "地球の再建と新統合政府", text: "生き残った人類とゼントラーディは共に暮らし始め、新統合政府のもとで地球の再建と、銀河への大規模な移民計画が進められる。" },
      { date: "2040年", work: "plus", kind: "earth", earth: [40, -100], placeName: "地球・マクロス・シティ", fx: "song", title: "シャロン・アップル事件（マクロスプラス）", text: "第一次星間大戦の終結30周年を祝う式典で、人工知能のバーチャル・アイドル、シャロン・アップルが暴走し、軍のシステムと旧SDF-1マクロスを乗っ取る。テストパイロットのイサムとガルドが、地球の防衛網を突破して止めに向かう。" },
    ],
  });

  worlds.push({
    id: "macrossgal", series: "macross", era: "マクロス：銀河の移民船団（2040〜2067年）", short: "銀河の移民船団",
    intro: "第一次星間大戦の後、人類は超長距離移民船団を組んで銀河各地へ旅立った。船団や植民惑星で、未知の生命体と“歌”をめぐる物語が繰り返される。地図は銀河の模式図で、位置関係はおおよそのもの。",
    map: "galaxy", galaxy: "plain",
    fleet: ["#ff8a8a", "#8fd0ff"],
    works: MACWORKS,
    places: {
      earth: planet([0.55, 0.22], "地球（太陽系）", "#4f9bff"),
      eden: planet([0.62, 0.3], "惑星エデン", "#7fd18c"),
      varauta: planet([-0.42, 0.42], "バロータ3214星系", "#b88ae0"),
      m7route: { p: [0.1, 0.5], name: "", type: "point" },
      galaxyfleet: planet([-0.05, 0.25], "マクロス・ギャラクシー船団", "#d8c8ff"),
      vajra: planet([0.03, -0.05], "バジュラ本星（銀河中心付近）", "#ffb070"),
      frroute: { p: [0.35, 0.05], name: "", type: "point" },
      brisingr: { p: [-0.5, -0.4], name: "ブリージンガル球状星団", type: "point" },
      windermere: planet([-0.55, -0.45], "惑星ウィンダミアⅣ", "#9ad0ff"),
      ragna: planet([-0.42, -0.33], "惑星ラグナ", "#5ad0d8"),
      alshahal: planet([-0.6, -0.3], "惑星アル・シャハル", "#e8c27a"),
      protoruins: planet([0.25, -0.5], "プロトカルチャーの遺跡", "#c8b08a"),
    },
    events: [
      { date: "約50万年前", work: "proto", kind: "space", place: "protoruins", fx: "flash", title: "プロトカルチャーの繁栄と滅亡", text: "銀河に広がっていた古代種族プロトカルチャーは、戦闘用の巨人ゼントラーディを作り出し、地球人類の祖先にも手を加えたとされる。内戦とゼントラーディの暴走によって滅び、遺跡や“歌”の記憶だけが残った。" },
      { date: "2040年", work: "plus", kind: "space", place: "eden", fx: "battle", title: "惑星エデンの次期主力機競争", text: "植民惑星エデンで、新統合軍の次期主力可変戦闘機を決める「スーパーノヴァ計画」が行われる。YF-19のイサムとYF-21のガルドが激しく競い合う。" },
      { date: "2045年", work: "m7", kind: "space", place: "varauta", fx: "battle", song: true, route: ["earth", "m7route", "varauta"], routeColor: "#ffb347", title: "マクロス7船団とプロトデビルン", text: "銀河の中心方向を目指す超長距離移民船団マクロス7が、バロータ星系で“スピリチア”を吸い取る敵プロトデビルンと遭遇する。ロックバンド「Fire Bomber」の熱気バサラは、戦場で歌い続けて敵の心に訴えかける。" },
      { date: "2059年", work: "frontier", kind: "space", place: "frroute", fx: "battle", route: ["earth", "frroute"], routeColor: "#7dff9c", title: "マクロス・フロンティア船団とバジュラ", text: "銀河中心を目指す移民船団マクロス・フロンティアが、昆虫のような宇宙生命体バジュラの襲撃を受ける。少年早乙女アルトは可変戦闘機のパイロットとなり、銀河の妖精シェリル・ノームと、歌手を目指す少女ランカ・リーに出会う。" },
      { date: "2059年", work: "frontier", kind: "space", place: "galaxyfleet", fx: "flash", title: "ギャラクシー船団の陰謀", text: "シェリルの出身であるマクロス・ギャラクシー船団の一部の幹部が、バジュラを操って銀河を支配しようとしていたことが明らかになる。" },
      { date: "2059年", work: "frontier", kind: "space", place: "vajra", fx: "battle", song: true, route: ["frroute", "vajra"], routeColor: "#7dff9c", title: "バジュラ本星の決戦", text: "フロンティア船団はバジュラの母星に到達し、最終決戦に臨む。シェリルとランカの歌がバジュラとの意思疎通を可能にし、人類とバジュラは戦いを終える。フロンティアの人々はその星に移り住む。" },
      { date: "2067年", work: "delta", kind: "space", place: "alshahal", fx: "battle", song: true, title: "アル・シャハルとワルキューレ", text: "ブリージンガル球状星団で、人々を凶暴化させる「ヴァール・シンドローム」が広がる。歌でそれを鎮める戦術音楽ユニット「ワルキューレ」と、少女フレイア・ヴィオンが惑星アル・シャハルで出会う。" },
      { date: "2067年", work: "delta", kind: "space", place: "ragna", fx: "flash", title: "惑星ラグナのケイオス", text: "ワルキューレとデルタ小隊（可変戦闘機部隊）は、海の惑星ラグナを拠点に活動する。" },
      { date: "2067年", work: "delta", kind: "space", place: "windermere", fx: "battle", song: true, title: "ウィンダミア王国との戦い", text: "風の歌い手を擁するウィンダミア王国が新統合政府に宣戦し、プロトカルチャーの遺跡の力で星団の支配をもくろむ。ワルキューレの歌と、ウィンダミアの歌がぶつかり合う。" },
    ],
  });


  /* ------------------------------------------------------------------ */
  /* 攻殻機動隊 */
  const NIIHAMA = [34.9, 135.8];
  worlds.push({
    id: "gits", series: "more", era: "攻殻機動隊（2029〜2045年）", short: "攻殻機動隊",
    intro: "士郎正宗の漫画『攻殻機動隊』（1989）を原作とするシリーズ。脳を機械化する「電脳化」と全身義体が普及した近未来の日本で、公安9課（攻殻機動隊）の草薙素子たちが電脳犯罪に立ち向かう。作品ごとに設定が異なる部分があるため、主な映像作品の流れで並べている。",
    map: "earthmoon", noLagrange: true, earthZoom: 1.9,
    works: {
      pre: { name: "前史", color: "#9aa8cc" },
      gits: { name: "GHOST IN THE SHELL / 攻殻機動隊（1995）", color: "#5bd1c8" },
      innocence: { name: "イノセンス（2004）", color: "#c8a8ff" },
      sac: { name: "STAND ALONE COMPLEX", color: "#4fa8ff" },
      gig: { name: "S.A.C. 2nd GIG", color: "#ff9a3c" },
      sss: { name: "Solid State Society", color: "#ff6b8f" },
      sac2045: { name: "SAC_2045", color: "#7dff9c" },
    },
    places: {},
    events: [
      { date: "21世紀前半", work: "pre", kind: "earth", earth: [35, 10], placeName: "世界各地", fx: "nuke", title: "第三次核大戦と第四次非核大戦", text: "二度の世界大戦を経て世界の勢力図が塗り替わる。戦後の日本では、戦場で発達した義体化・電脳化の技術が一般に広まり、アジアからの難民が大量に流入する。" },
      { date: "2029年", work: "gits", kind: "earth", earth: NIIHAMA, placeName: "日本（架空の湾岸都市）", fx: "flash", title: "人形使い事件（GHOST IN THE SHELL）", text: "他人の電脳をハッキングして操る正体不明のハッカー「人形使い」を、公安9課の草薙素子が追う。その正体は、ネットの海で自我を得たプログラムだった。素子は人形使いと融合し、ネットの彼方へ姿を消す。" },
      { date: "2030年（2024年〜）", work: "sac", kind: "earth", earth: NIIHAMA, placeName: "新浜市（日本・架空の都市）", fx: "flash", title: "笑い男事件（STAND ALONE COMPLEX）", text: "2024年、マイクロマシン医療の大企業の社長誘拐から始まった「笑い男事件」。犯人は、街中の監視カメラや人々の視界の映像に“笑い男”のマークを重ねて自分の顔を隠した。オリジナルのいない模倣者が次々に現れる現象「スタンド・アローン・コンプレックス」の謎を、9課が追う。" },
      { date: "2032年", work: "gig", kind: "earth", earth: [32.75, 129.87], placeName: "長崎・出島（難民居住区）", fx: "battle", title: "個別の11人と出島の難民蜂起", text: "テロ組織「個別の11人」の事件をきっかけに、出島に集められたアジア難民と政府の対立が激化する。内閣情報庁の合田一人は、難民を利用して国を動かそうとしていた。核ミサイル発射の危機を、9課と“タチコマ”たちが食い止める。" },
      { date: "2032年", work: "innocence", kind: "earth", earth: [45.0, 147.7], placeName: "択捉経済特区", fx: "battle", title: "ガイノイド暴走事件（イノセンス）", text: "愛玩用の少女型ロボット（ガイノイド）が持ち主を殺す事件が続発する。バトーは捜査の末、択捉の製造元へ乗り込み、ネットの中から現れた素子の助けを得る。" },
      { date: "2034年", work: "sss", kind: "earth", earth: NIIHAMA, placeName: "新浜市", fx: "flash", title: "傀儡廻し事件（Solid State Society）", text: "9課を去った素子が単独でネットを渡り歩く一方、トグサが率いる新生9課は、子どもたちを誘拐する謎のハッカー「傀儡廻し」を追う。" },
      { date: "2045年", work: "sac2045", kind: "earth", earth: [33.8, -116.5], placeName: "アメリカ・カリフォルニア", fx: "battle", title: "持続可能な戦争とポスト・ヒューマン（SAC_2045）", text: "全世界同時デフォルトの後、AIが経済を回すために戦争を続ける“サスティナブル・ウォー”の時代。傭兵になっていた素子たちは、驚異的な知能をもつ新人類「ポスト・ヒューマン」と出会う。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* 宇宙戦艦ヤマト */
  worlds.push({
    id: "yamato", series: "more", era: "宇宙戦艦ヤマト（2199〜2201年）", short: "宇宙戦艦ヤマト",
    intro: "『宇宙戦艦ヤマト』（1974）。異星国家ガミラスの遊星爆弾で地表が汚染され、人類滅亡まで1年と迫った地球。宇宙戦艦ヤマトは、放射能除去装置を受け取るため、14万8千光年かなたの大マゼラン雲にある惑星イスカンダルを目指す。",
    map: "galaxy", galaxy: "plain", centerLabel: "天の川銀河の中心",
    blobs: [{ p: [0.86, 0.5], r: 0.15, name: "大マゼラン雲" }],
    fleet: ["#7fd0ff", "#ffb070"],
    works: {
      y1: { name: "宇宙戦艦ヤマト（1974）", color: "#ff6b6b" },
      y2: { name: "宇宙戦艦ヤマト2／さらば宇宙戦艦ヤマト", color: "#ffd34f" },
    },
    places: {
      solar: planet([0.42, 0.12], "太陽系（地球・冥王星）", "#4f9bff"),
      balan: planet([0.54, 0.24], "バラン星", "#c8a0e0"),
      nanairo: planet([0.66, 0.36], "七色星団", "#ffb0d8"),
      gamilas: planet([0.83, 0.48], "ガミラス星", "#7fd0ff"),
      iscandar: planet([0.89, 0.53], "イスカンダル星", "#ffe0a0"),
    },
    events: [
      { date: "2199年", work: "y1", kind: "space", place: "solar", fx: "nuke", title: "遊星爆弾と人類滅亡の危機", text: "ガミラスが送り込む遊星爆弾によって地表は放射能に汚染され、人類は地下都市に追いやられる。残された時間はあと1年。そこへ、イスカンダルの女王スターシャから、放射能除去装置を渡すというメッセージが届く。" },
      { date: "2199年", work: "y1", kind: "space", place: "solar", fx: "beam", title: "ヤマト発進と冥王星基地の攻略", text: "沈没した戦艦大和の残骸の中で建造された宇宙戦艦ヤマトが、イスカンダルから伝えられた波動エンジンで発進。太陽系の端の冥王星にあるガミラスの前線基地を攻略する。" },
      { date: "2199年", work: "y1", kind: "space", place: "balan", fx: "battle", route: ["solar", "balan"], routeColor: "#ff9a6b", title: "バラン星", text: "ワープを重ねて銀河系を離れていくヤマト。航路のなかばにあるバラン星で、ガミラスの基地と戦う。" },
      { date: "2199年", work: "y1", kind: "space", place: "nanairo", fx: "battle", route: ["balan", "nanairo"], routeColor: "#ff9a6b", title: "七色星団の決戦", text: "ガミラスの名将ドメルが率いる空母艦隊と、ヤマトの総力戦。ドメルは瞬間物質移送機で攻撃機をヤマトの目前に送り込むが、最後は自爆して散る。" },
      { date: "2199〜2200年", work: "y1", kind: "space", place: "gamilas", fx: "battle", route: ["nanairo", "gamilas"], routeColor: "#ff9a6b", title: "ガミラス本星の決戦", text: "大マゼラン雲で、イスカンダルと二重惑星をなすガミラス本星に到着。総統デスラーとの決戦の末、ガミラスの都市は壊滅する。" },
      { date: "2200年", work: "y1", kind: "space", place: "iscandar", fx: "flash", title: "イスカンダルと地球への帰還", text: "ヤマトはスターシャから放射能除去装置コスモクリーナーDを受け取り、地球へ帰る。帰路でデスラーの奇襲を退け、期限ぎりぎりで地球を青い星に戻す。" },
      { date: "2201年", work: "y2", kind: "space", place: "solar", fx: "battle", route: ["nanairo", "solar"], routeColor: "#ffffff", title: "白色彗星帝国の侵攻", text: "巨大な白色彗星の中に都市帝国をもつガトランティス（白色彗星帝国）が地球に迫る。ヤマトは再び出撃し、ズォーダー大帝と戦う。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* 機動戦艦ナデシコ */
  worlds.push({
    id: "nadesico", series: "more", era: "機動戦艦ナデシコ（2195〜2201年）", short: "ナデシコ",
    intro: "『機動戦艦ナデシコ』（1996）。“木星蜥蜴”と呼ばれる謎の無人兵器に火星を奪われた地球。民間企業ネルガルが建造した戦艦ナデシコは、個性豊かな乗員を乗せて火星へ向かう。",
    map: "earthmoon", noLagrange: true,
    works: {
      tv: { name: "機動戦艦ナデシコ（TV）", color: "#ff9fd0" },
      movie: { name: "劇場版 The prince of darkness", color: "#7f8aff" },
    },
    places: {
      mars: far(1.6, -0.9, "火星・ユートピアコロニー（遠方・縮尺外）", "#e0673c", 14),
      jupiter: far(-1.55, 0.95, "木星・木連（遠方・縮尺外）", "#d9b38c", 16),
    },
    events: [
      { date: "2195年", work: "tv", kind: "space", place: "mars", fx: "battle", title: "第一次火星会戦", text: "木星方面から現れた無人兵器群“木星蜥蜴”が火星を襲い、火星は占領される。ユートピアコロニーにいた少年テンカワ・アキトは、気がつくと地球にいた。" },
      { date: "2196年", work: "tv", kind: "earth", earth: [33.16, 129.72], placeName: "長崎・佐世保（ネルガルのドック）", fx: "battle", title: "ナデシコ発進", text: "ネルガル重工の戦艦ナデシコが佐世保から発進する。艦長はミスマル・ユリカ。コックとして乗り込んだアキトは、人型兵器エステバリスのパイロットにもなる。" },
      { date: "2196年", work: "tv", kind: "space", place: "mars", fx: "battle", route: null, title: "火星への到着", text: "ナデシコは火星に到着するが、生き残った人々の救出はうまくいかない。木星蜥蜴に囲まれたナデシコは、謎の現象“ボソンジャンプ”に巻き込まれる。" },
      { date: "2196年", work: "tv", kind: "space", place: "moon", fx: "flash", title: "ボソンジャンプと8か月後の月", text: "ナデシコが気づくと月の近くにいたが、時間は8か月も過ぎていた。ボソンジャンプは空間だけでなく時間も越える瞬間移動だった。" },
      { date: "2197年", work: "tv", kind: "space", place: "jupiter", fx: "flash", title: "木連の正体", text: "木星蜥蜴を操っていたのは、約100年前に月から追われて木星へ逃れた人々の子孫が木星圏に築いた国家「木連」だった。" },
      { date: "2197年", work: "tv", kind: "space", place: "earthorbit", fx: "flash", title: "和平会談と白鳥九十九の死", text: "地球と木連の和平の道を探った木連の白鳥九十九が、仲間の手で暗殺される。和平は遠のく。" },
      { date: "2197年", work: "tv", kind: "space", place: "mars", fx: "battle", title: "火星の遺跡の行方", text: "ボソンジャンプの鍵を握る火星の古代遺跡をめぐり、地球と木連が最後の戦いを繰り広げる。ナデシコは遺跡の中枢を宇宙のかなたへ送り出し、戦争の火種を断つ。" },
      { date: "2201年", work: "movie", kind: "space", place: "moon", fx: "battle", title: "火星の後継者（劇場版）", text: "3年後、ボソンジャンプを独占しようとする「火星の後継者」が反乱を起こす。行方不明になっていたアキトは、黒い機体に乗った復讐者として現れる。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* 装甲騎兵ボトムズ */
  worlds.push({
    id: "votoms", series: "more", era: "装甲騎兵ボトムズ（アストラギウス銀河）", short: "ボトムズ",
    intro: "『装甲騎兵ボトムズ』（1983）。アストラギウス銀河では、ギルガメスとバララントの二大陣営が100年にわたる戦争を続けていた。戦争末期、ギルガメスの兵士キリコ・キュービィーは、味方の極秘作戦に参加させられたことから、軍と秘密結社に追われる身になる。人型兵器アーマードトルーパー（AT）は使い捨ての“棺桶”と呼ばれた。",
    map: "galaxy", galaxy: "plain", centerLabel: "アストラギウス銀河の中心",
    tints: [{ p: [-0.5, 0], r: 0.8, color: "rgba(120,170,255,0.14)" }, { p: [0.5, 0], r: 0.8, color: "rgba(255,120,110,0.14)" }],
    labels: [{ p: [-0.55, -0.6], text: "ギルガメス", color: "rgba(150,190,255,0.9)" }, { p: [0.55, -0.6], text: "バララント", color: "rgba(255,150,140,0.9)" }],
    fleet: ["#8fb8ff", "#ff9a8a"],
    works: { v: { name: "装甲騎兵ボトムズ", color: "#c8a060" } },
    places: {
      lido: planet([-0.1, -0.25], "小惑星リド", "#a89a86"),
      uoodo: planet([-0.45, 0.15], "ウド（惑星メルキア）", "#c8b090"),
      kummen: planet([0.15, 0.32], "クメン王国", "#6ab07a"),
      sunsa: planet([0.4, -0.15], "惑星サンサ", "#e8c27a"),
      quent: planet([0.05, 0.6], "惑星クエント", "#c0a0e0"),
    },
    events: [
      { date: "百年戦争", work: "v", kind: "space", place: "lido", fx: "battle", title: "百年戦争", text: "ギルガメス連合とバララント同盟の戦争は100年近く続き、両陣営の惑星は荒廃した。" },
      { date: "百年戦争末期", work: "v", kind: "space", place: "lido", fx: "battle", title: "リド襲撃とプロトタイプ", text: "キリコは味方であるはずのギルガメス軍の基地を襲う謎の作戦に参加させられ、そこでカプセルに入った謎の女性（後のフィアナ）を目にする。口封じのため、キリコは軍から追われることになる。" },
      { date: "終戦後", work: "v", kind: "space", place: "uoodo", fx: "battle", title: "ウド編：退廃の街", text: "戦争が終わり、退廃した街ウドに流れ着いたキリコは、ATの賭け試合（バトリング）で生き延びながら、秘密結社と警察に追われる。" },
      { date: "終戦後", work: "v", kind: "space", place: "kummen", fx: "battle", title: "クメン編：密林の内戦", text: "キリコは傭兵として、密林の王国クメンの内戦に身を投じる。そこで再びフィアナと出会う。" },
      { date: "終戦後", work: "v", kind: "space", place: "sunsa", fx: "battle", title: "サンサ編：キリコの過去", text: "戦争で死の惑星となったサンサで、キリコは自分の過去と、異常な生存能力をもつ“異能生存体”の秘密に近づく。" },
      { date: "終戦後", work: "v", kind: "space", place: "quent", fx: "flash", title: "クエント編：神（ワイズマン）", text: "惑星クエントの地下で銀河を陰から操ってきた存在「ワイズマン」が、キリコを後継者に選ぼうとする。キリコはそれを拒んでワイズマンを倒し、フィアナとともにコールドスリープで眠りにつく。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* 伝説巨神イデオン */
  worlds.push({
    id: "ideon", series: "more", era: "伝説巨神イデオン", short: "イデオン",
    intro: "『伝説巨神イデオン』（1980）と劇場版『接触篇』『発動篇』（1982）。地球人と異星人バッフ・クランが、植民星ソロ星で出会ったことから始まる戦争。両者の争いは、古代の遺跡から発掘された巨神イデオンに宿る無限の力「イデ」を目覚めさせていく。",
    map: "galaxy", galaxy: "plain",
    fleet: ["#c8d8ff", "#ff9a6b"],
    works: { tv: { name: "伝説巨神イデオン（TV）", color: "#ff9a3c" }, movie: { name: "劇場版 接触篇／発動篇", color: "#ff5f7a" } },
    places: {
      solo: planet([0.35, 0.25], "ソロ星（バッフ・クランの呼び名：ロゴ・ダウ）", "#c8b090"),
      earth: planet([0.6, 0.05], "地球", "#4f9bff"),
      buff: planet([-0.5, -0.25], "バッフ・クラン本星", "#e8a080"),
      space: { p: [0.05, 0.1], name: "宇宙", type: "point" },
    },
    events: [
      { date: "物語のはじまり", work: "tv", kind: "space", place: "solo", fx: "battle", title: "ソロ星での遭遇", text: "地球の植民星ソロ星で、地球人は古代文明の遺跡からロボットと宇宙船を発掘していた。そこへ伝説の力“イデ”を探すバッフ・クランの部隊が現れる。ささいな行き違いから戦闘が始まり、発掘品は三台のメカが合体する巨神イデオンとして動き出す。" },
      { date: "TV版", work: "tv", kind: "space", place: "earth", fx: "battle", route: ["solo", "earth"], routeColor: "#ffd27a", title: "ソロシップの逃避行", text: "遺跡の宇宙船ソロシップに乗った民間人たちは、バッフ・クランの追撃を受けながら宇宙を逃げ続ける。たどり着いた地球も、イデの力を恐れて彼らを受け入れない。" },
      { date: "TV版", work: "tv", kind: "space", place: "space", fx: "battle", title: "イデの意思", text: "イデオンは乗員の感情に応じて力を増し、星を割るほどのイデオンガンやイデオンソードを放つ。イデには意思があり、争いをやめない二つの種族を見定めているのではないかと考えられ始める。" },
      { date: "発動篇", work: "movie", kind: "space", place: "space", fx: "nuke", title: "イデの発動", text: "憎しみ合う地球人とバッフ・クランの戦いの果てに、イデが発動する。両種族の文明はすべて滅び、命を失った魂たちは新たな星へ向かっていく。" },
    ],
  });

  /* ------------------------------------------------------------------ */
  /* 聖戦士ダンバイン */
  worlds.push({
    id: "dunbine", series: "more", era: "聖戦士ダンバイン（バイストン・ウェル）", short: "ダンバイン",
    intro: "『聖戦士ダンバイン』（1983）。海と陸のあいだにある異世界バイストン・ウェルに召喚された青年ショウ・ザマが、人の生体エネルギー“オーラ力”で動く人型兵器オーラバトラーに乗って戦う。物語の後半では、戦いが地上（現実の地球）にまで広がる。地図は物語を追うための模式図。",
    map: "galaxy", galaxy: "byston",
    fleet: ["#ffb070", "#9fd0ff"],
    labels: [{ p: [-0.55, -0.15], text: "アの国", color: "rgba(255,190,120,0.9)" }, { p: [0.45, -0.2], text: "ラウの国", color: "rgba(160,210,255,0.9)" }, { p: [0.55, 0.3], text: "ナの国", color: "rgba(160,255,190,0.9)" }, { p: [-0.35, 0.32], text: "クの国", color: "rgba(255,160,160,0.9)" }],
    works: { d: { name: "聖戦士ダンバイン", color: "#7fd0a0" } },
    places: {
      laswau: planet([-0.6, -0.05], "ラース・ワウ（ドレイク城）", "#ffb070"),
      given: planet([-0.2, -0.05], "ギブン家の領地", "#9fd0ff"),
      rau: planet([0.45, -0.1], "フォイゾン王の城", "#9fd0ff"),
      na: planet([0.6, 0.38], "シーラ女王の城", "#a0ffc0"),
      ku: planet([-0.35, 0.4], "ビショットの城", "#ff9a9a"),
      aura: { p: [0, -0.7], name: "オーラロード（地上界への道）", type: "fortress" },
      earth: planet([0.62, -0.68], "地上界（地球・東京ほか）", "#4f9bff"),
    },
    events: [
      { date: "物語のはじまり", work: "d", kind: "space", place: "aura", fx: "flash", title: "オーラロードとショウ・ザマ", text: "日本の青年ショウ・ザマは、オーラロードを通ってバイストン・ウェルに召喚される。アの国の領主ドレイク・ルフトは、地上人のもつ強いオーラ力で動くオーラバトラーの戦力を求めていた。" },
      { date: "第1部", work: "d", kind: "space", place: "given", fx: "battle", title: "ギブン家との戦いとショウの離反", text: "ドレイクの命で反ドレイク派のギブン家を攻撃したショウは、ドレイクの野心に気づき、ギブン家の側に寝返る。ショウの乗機ダンバインは、ドレイク軍と戦い続ける。" },
      { date: "第1部", work: "d", kind: "space", place: "laswau", fx: "flash", title: "ドレイクの台頭", text: "ドレイクはアの国の実権を握り、クの国のビショットらと手を組んで、バイストン・ウェル全体の支配を目指す。" },
      { date: "第1部", work: "d", kind: "space", place: "rau", fx: "battle", title: "ラウの国・ナの国との連合", text: "ドレイクに抵抗するため、ラウの国のフォイゾン王や、ナの国のシーラ女王が立ち上がる。ショウたちは彼らとともにドレイク軍と戦う。" },
      { date: "第2部", work: "d", kind: "space", place: "earth", fx: "battle", route: ["laswau", "aura", "earth"], routeColor: "#ffb070", title: "地上への噴出", text: "強大になったオーラ力のぶつかり合いでオーラロードが開き、ドレイク軍とショウたちは地上界に放り出される。東京などの上空にオーラバトラーとオーラシップが現れ、地上の軍隊も巻き込んだ戦いになる。" },
      { date: "最終決戦", work: "d", kind: "space", place: "earth", fx: "nuke", title: "最後の戦いと浄化", text: "地上で繰り広げられた最後の決戦で、ドレイクもショウも、多くの戦士が命を落とす。シーラ女王は自らのオーラ力で、地上にあふれた悪しきオーラを浄化する。" },
    ],
  });

  window.TIMELINE_WORLDS = worlds;
})();
