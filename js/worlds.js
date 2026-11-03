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

  window.TIMELINE_WORLDS = worlds;
})();
