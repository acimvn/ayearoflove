// Vòng Tròn Phép Màu — web app
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const CFG = self.APP_CONFIG || {};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const dkey = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => dkey(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dkey(d); };
const daysSince = (k) => { if (!k) return 99; const [y, m, d] = k.split("-").map(Number); return Math.round((new Date(today() + "T00:00") - new Date(y, m - 1, d)) / 864e5); };
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");

/* ---------------- Mascot ---------------- */
const STAGES = [
  { at: 0, name: "Hạt", line: "Một hạt sáng nhỏ vừa được gieo." },
  { at: 50, name: "Mầm", line: "Hạt đã nứt vỏ. Mầm đầu tiên nhú lên." },
  { at: 80, name: "Chồi", line: "Chồi non vươn hai chiếc lá." },
  { at: 110, name: "Lá", line: "Lá sen trải rộng trên mặt nước." },
  { at: 140, name: "Nụ", line: "Một nụ sen bắt đầu thành hình." },
  { at: 170, name: "Sen hé", line: "Cánh sen hé mở trong tĩnh lặng." },
  { at: 220, name: "Sen nở", line: "Sen nở trọn. Bạn đã sang phần hai của sách bài tập." },
  { at: 365, name: "Ánh sáng", line: "Trọn 365 bài. Linh vật của bạn đã thành ánh sáng." },
];
const stageOf = (c) => { let i = 0; STAGES.forEach((s, k) => { if (c >= s.at) i = k; }); return i; };
let gid = 0;
function mascot(stage, sleep) {
  const g = ++gid, R = [22, 23, 25, 27, 29, 30, 32, 33][stage];
  const cx = 100, cy = stage >= 5 ? 112 : 118;
  const petal = (a, len, w, fill, op) => {
    const r = (a * Math.PI) / 180, bx = 100, by = 140, tx = bx + Math.sin(r) * len, ty = by - Math.cos(r) * len,
      nx = Math.cos(r) * w, ny = Math.sin(r) * w, mx = bx + Math.sin(r) * len * 0.55, my = by - Math.cos(r) * len * 0.55;
    return `<path d="M${bx} ${by} Q${mx + nx} ${my + ny} ${tx} ${ty} Q${mx - nx} ${my - ny} ${bx} ${by}Z" fill="${fill}" opacity="${op}"/>`;
  };
  let back = "", front = "";
  const ground = stage < 3
    ? `<ellipse cx="100" cy="160" rx="70" ry="14" fill="var(--soil)" opacity=".55"/>`
    : `<ellipse cx="100" cy="158" rx="84" ry="18" fill="var(--water)"/><path d="M40 160 q15 -5 30 0 M128 163 q14 -5 28 0" stroke="var(--surface)" stroke-width="2" fill="none" opacity=".6"/>`;
  if (stage === 0) back += `<path d="M64 150 Q100 70 136 150 Z" fill="var(--soil)"/>`;
  if (stage >= 1 && stage <= 2) {
    const h = stage === 1 ? 26 : 40, lx = stage === 1 ? 91 : 86, ly = cy - R - h * 0.65;
    front += `<path d="M100 ${cy - R + 2} q-2 -${h * 0.5} 2 -${h}" stroke="var(--leaf)" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    front += `<ellipse cx="${lx}" cy="${ly}" rx="${stage === 1 ? 8 : 13}" ry="${stage === 1 ? 4 : 6}" transform="rotate(-25 ${lx} ${ly})" fill="var(--leaf)"/>`;
    if (stage === 2) front += `<ellipse cx="114" cy="${cy - R - h * 0.85}" rx="13" ry="6" transform="rotate(25 114 ${cy - R - h * 0.85})" fill="var(--leaf)"/>`;
  }
  if (stage >= 3) back += `<ellipse cx="52" cy="152" rx="26" ry="9" fill="var(--leaf)" opacity=".85"/><ellipse cx="150" cy="154" rx="22" ry="8" fill="var(--leaf)" opacity=".7"/>`;
  if (stage === 4) back += `<path d="M146 150 q4 -30 -2 -56" stroke="var(--leaf)" stroke-width="3" fill="none"/><path d="M144 70 q-12 14 0 26 q12 -12 0 -26z" fill="var(--lotus)"/>`;
  if (stage >= 5) {
    const half = stage === 5;
    (half ? [-35, -12, 12, 35].map((a) => a * 0.55) : [-75, -50, -25, 0, 25, 50, 75]).forEach((a) => (back += petal(a, half ? 54 : 62, half ? 14 : 16, "var(--lotus)", half ? 0.9 : 0.85)));
    (half ? [-28, 28] : [-66, -40, 40, 66]).forEach((a) => (front += petal(a, half ? 26 : 30, half ? 9 : 10, "var(--lotus-soft)", 0.95)));
  }
  let rays = "";
  if (stage === 7) for (let i = 0; i < 12; i++) { const a = (i * 30 * Math.PI) / 180; rays += `<line x1="${cx + Math.cos(a) * (R + 18)}" y1="${cy + Math.sin(a) * (R + 18)}" x2="${cx + Math.cos(a) * (R + 34)}" y2="${cy + Math.sin(a) * (R + 34)}" stroke="var(--gold)" stroke-width="3" stroke-linecap="round" opacity=".7"/>`; }
  const eyes = sleep
    ? `<path d="M${cx - 10} ${cy} q4 3 8 0 M${cx + 2} ${cy} q4 3 8 0" stroke="#2A2233" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="${cx - 8}" cy="${cy - 1}" rx="2.6" ry="3.4" fill="#2A2233"/><ellipse cx="${cx + 8}" cy="${cy - 1}" rx="2.6" ry="3.4" fill="#2A2233"/><circle cx="${cx - 7}" cy="${cy - 2.3}" r=".9" fill="#fff"/><circle cx="${cx + 9}" cy="${cy - 2.3}" r=".9" fill="#fff"/>`;
  const orb = `<g class="${sleep ? "" : "bob"}">
    <circle cx="${cx}" cy="${cy}" r="${R + 16}" fill="url(#gl${g})" opacity="${sleep ? 0.25 : 0.9}"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#bd${g})"/>
    <ellipse cx="${cx - R * 0.35}" cy="${cy - R * 0.45}" rx="${R * 0.28}" ry="${R * 0.16}" fill="#fff" opacity=".55"/>
    ${eyes}
    <ellipse cx="${cx - 14}" cy="${cy + 7}" rx="4" ry="2.4" fill="#E58FA6" opacity=".55"/><ellipse cx="${cx + 14}" cy="${cy + 7}" rx="4" ry="2.4" fill="#E58FA6" opacity=".55"/>
    <path d="M${cx - 3} ${cy + 8} q3 3 6 0" stroke="#2A2233" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    ${stage === 0 ? `<path d="M${cx - R - 4} ${cy + 6} Q${cx} ${cy + R + 14} ${cx + R + 4} ${cy + 6} L${cx + R + 2} ${cy + R + 10} L${cx - R - 2} ${cy + R + 10}Z" fill="var(--soil)"/>` : ""}
  </g>`;
  return `<svg viewBox="0 0 200 190" role="img" aria-label="Linh vật ở chặng ${STAGES[stage].name}"><defs>
    <radialGradient id="gl${g}"><stop offset="0" stop-color="#FFE7A3" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7A3" stop-opacity="0"/></radialGradient>
    <radialGradient id="bd${g}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#FFFBEA"/><stop offset=".6" stop-color="#FFE29A"/><stop offset="1" stop-color="#F2B94B"/></radialGradient>
  </defs>${ground}${rays}${back}${orb}${front}</svg>`;
}

/* ---------------- UI helpers ---------------- */
function toast(t) { document.querySelectorAll(".toast").forEach((x) => x.remove()); const el = document.createElement("div"); el.className = "toast"; el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 2800); }
function showBanner(t) { const b = $("banner"); if (!t) { b.hidden = true; return; } b.textContent = t; b.hidden = false; }
function screen(name) { ["loading", "auth", "join", "main"].forEach((s) => ($(s).hidden = s !== name)); window.scrollTo(0, 0); }
const COLORS = ["#B87A12", "#C9567A", "#3F7E62", "#5B6FB0", "#9A5BB0", "#B0605B"];
const colorOf = (id) => COLORS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
const initials = (n) => (String(n || "?").trim().split(/\s+/).pop() || "?").slice(0, 1).toUpperCase();
const fmtDate = (ts) => { const d = new Date(ts); return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear(); };

const AUTH_ERR = {
  "auth/invalid-credential": "Email hoặc mật khẩu chưa đúng.",
  "auth/wrong-password": "Email hoặc mật khẩu chưa đúng.",
  "auth/user-not-found": "Chưa có tài khoản với email này. Chọn “Tạo tài khoản”.",
  "auth/email-already-in-use": "Email này đã có tài khoản. Chọn “Đăng nhập”.",
  "auth/weak-password": "Mật khẩu cần ít nhất 6 ký tự.",
  "auth/invalid-email": "Email chưa đúng định dạng.",
  "auth/missing-password": "Hãy nhập mật khẩu.",
  "auth/too-many-requests": "Bạn thử quá nhiều lần. Đợi vài phút rồi thử lại.",
  "auth/network-request-failed": "Không có kết nối mạng. Kiểm tra mạng rồi thử lại.",
};
const authMsg = (e) => AUTH_ERR[e && e.code] || "Có lỗi xảy ra: " + ((e && e.message) || "không rõ");

/* ---------------- State ---------------- */
const blank = () => ({ name: "", lesson: 1, completed: 0, days: 0, streak: 0, lastDate: "", petName: "Đốm Sáng", rem: { d: "", n: 0 }, joined: today(), joinCode: "" });
const DEFAULT_PUSH = { morning: { on: true, at: "07:00" }, evening: { on: true, at: "21:00" }, hourly: { on: false, from: "08:00", to: "21:00", every: 60 }, zoom: true };
let F = {}; // firebase functions
let auth, db, messaging = null, swReg = null;
let uid = null, me = blank(), isAdmin = false, joinCode = "";
let members = {}, sessions = [], lessons = {}, feed = [], myNotes = [], pushCfg = null;
let unsubs = [], editingSession = null, reviewSel = null, reviewNoteOpen = false, reviewOthers = { n: 0, list: [] };

/* ---------------- Boot ---------------- */
(async function boot() {
  $("authMascot").innerHTML = mascot(6, false);
  if (!CFG.firebase || /DAN_API_KEY/.test(CFG.firebase.apiKey || "")) {
    $("loading").textContent = "App chưa được cấu hình. Hãy dán thông tin Firebase vào tệp config.js.";
    return;
  }
  try {
    const [app, a, fs] = await Promise.all([import(FB + "firebase-app.js"), import(FB + "firebase-auth.js"), import(FB + "firebase-firestore.js")]);
    F = { ...app, ...a, ...fs };
  } catch (e) {
    $("loading").textContent = "Không tải được app. Kiểm tra kết nối mạng rồi mở lại.";
    return;
  }
  const fapp = F.initializeApp(CFG.firebase);
  auth = F.getAuth(fapp);
  db = F.getFirestore(fapp);
  if (CFG.emulator) { F.connectAuthEmulator(auth, CFG.emulator.auth); F.connectFirestoreEmulator(db, CFG.emulator.host, CFG.emulator.port); }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./firebase-messaging-sw.js").then((r) => (swReg = r)).catch(() => {});
  }
  F.onAuthStateChanged(auth, onUser);
})();

async function onUser(u) {
  unsubs.forEach((f) => f()); unsubs = [];
  uid = u ? u.uid : null;
  if (!u) { setMode("login"); $("aPass").value = ""; screen("auth"); return; }
  screen("loading");
  // Admin check: only the group's guide can read the join-code document.
  try { const s = await F.getDoc(F.doc(db, "config", "secret")); isAdmin = true; joinCode = s.exists() ? s.data().code || "" : ""; }
  catch (e) { isAdmin = false; joinCode = ""; }
  let snap;
  try { snap = await F.getDoc(F.doc(db, "members", uid)); }
  catch (e) { snap = null; }
  if (snap && snap.exists()) { me = { ...blank(), ...snap.data() }; startApp(); return; }
  const pendingName = sessionGet("pendingName") || u.displayName || "";
  const pendingCode = sessionGet("pendingCode") || "";
  if (isAdmin || pendingCode) {
    const ok = await tryJoin(pendingName, isAdmin ? "" : pendingCode);
    if (ok) return;
  }
  $("jName").value = pendingName; $("jCode").value = "";
  $("joinErr").hidden = !pendingCode; $("joinErr").textContent = "Mã nhóm chưa đúng. Hãy hỏi lại người hướng dẫn.";
  screen("join");
}
function sessionGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
function sessionSet(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} }

async function tryJoin(name, code) {
  const body = { ...blank(), name: (name || "").trim().slice(0, 40) || "Bạn đồng hành", joinCode: code };
  try {
    await F.setDoc(F.doc(db, "members", uid), body);
    sessionSet("pendingCode", null); sessionSet("pendingName", null);
    me = body; startApp();
    return true;
  } catch (e) { return false; }
}

/* ---------------- Auth screens ---------------- */
let mode = "login";
function setMode(m) {
  mode = m;
  $("modeLogin").setAttribute("aria-pressed", m === "login"); $("modeSignup").setAttribute("aria-pressed", m === "signup");
  $("fName").hidden = $("fCode").hidden = m === "login";
  $("authSubmit").textContent = m === "login" ? "Đăng nhập" : "Tạo tài khoản";
  $("forgot").hidden = m !== "login";
  $("aPass").autocomplete = m === "login" ? "current-password" : "new-password";
  $("authErr").hidden = true;
}
$("modeLogin").onclick = () => setMode("login");
$("modeSignup").onclick = () => setMode("signup");
const authErr = (t) => { $("authErr").textContent = t; $("authErr").hidden = !t; };
$("authForm").onsubmit = async (e) => {
  e.preventDefault();
  const email = $("aEmail").value.trim(), pass = $("aPass").value;
  if (!email || !pass) { authErr("Hãy nhập email và mật khẩu."); return; }
  const btn = $("authSubmit"); btn.disabled = true; authErr("");
  try {
    if (mode === "signup") {
      const name = $("aName").value.trim(), code = $("aCode").value.trim().toUpperCase();
      if (!name) { authErr("Hãy nhập tên của bạn."); btn.disabled = false; return; }
      sessionSet("pendingName", name); sessionSet("pendingCode", code || "-");
      const cred = await F.createUserWithEmailAndPassword(auth, email, pass);
      try { await F.updateProfile(cred.user, { displayName: name }); } catch (x) {}
    } else {
      await F.signInWithEmailAndPassword(auth, email, pass);
    }
  } catch (err) { authErr(authMsg(err)); }
  btn.disabled = false;
};
$("forgot").onclick = async () => {
  const email = $("aEmail").value.trim();
  if (!email) { authErr("Nhập email của bạn vào ô Email, rồi bấm lại “Quên mật khẩu?”."); return; }
  try { await F.sendPasswordResetEmail(auth, email); authErr(""); toast("Đã gửi email đặt lại mật khẩu. Kiểm tra cả hộp thư Spam."); }
  catch (err) { authErr(authMsg(err)); }
};
$("joinForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("jName").value.trim(), code = $("jCode").value.trim().toUpperCase();
  if (!name || !code) { $("joinErr").textContent = "Hãy nhập tên và mã nhóm."; $("joinErr").hidden = false; return; }
  const ok = await tryJoin(name, code);
  if (!ok) { $("joinErr").textContent = "Mã nhóm chưa đúng. Hãy hỏi lại người hướng dẫn."; $("joinErr").hidden = false; }
};
$("joinOut").onclick = () => F.signOut(auth);

/* ---------------- Main app ---------------- */
function startApp() {
  screen("main");
  $("who").textContent = me.name;
  $("adminSession").hidden = $("adminLesson").hidden = $("adminCode").hidden = !isAdmin;
  if (isAdmin && !joinCode) showBanner("Bạn chưa đặt mã nhóm. Vào Cài đặt để đặt mã, rồi gửi mã cùng đường link app cho học viên.");
  else showBanner("");
  const col = (n) => F.collection(db, n);
  const err = () => showBanner("Mất kết nối với nhóm. Kiểm tra mạng rồi mở lại app.");
  unsubs.push(F.onSnapshot(col("members"), (s) => {
    const m = {}; s.forEach((d) => (m[d.id] = d.data())); members = m; members[uid] = me;
    renderMembers(); renderFeed();
  }, err));
  unsubs.push(F.onSnapshot(col("sessions"), (s) => { sessions = []; s.forEach((d) => sessions.push({ id: d.id, ...d.data() })); renderSessions(); }, () => {}));
  unsubs.push(F.onSnapshot(col("lessons"), (s) => { const l = {}; s.forEach((d) => (l[d.id] = d.data())); lessons = l; renderLesson(); renderReview(); }, () => {}));
  unsubs.push(F.onSnapshot(F.query(col("notes"), F.orderBy("ts", "desc"), F.limit(60)), (s) => { feed = []; s.forEach((d) => feed.push({ id: d.id, ...d.data() })); renderFeed(); }, () => {}));
  unsubs.push(F.onSnapshot(F.query(col("notes"), F.where("uid", "==", uid)), (s) => { myNotes = []; s.forEach((d) => myNotes.push({ id: d.id, ...d.data() })); myNotes.sort((a, b) => b.ts - a.ts); renderReview(); }, () => {}));
  renderAll();
  setupSettings();
  const h = (location.hash || "").slice(1); show(TABS.includes(h) ? h : "homnay");
}

let q = Promise.resolve();
function save() {
  const body = JSON.parse(JSON.stringify(me));
  q = q.then(() => F.setDoc(F.doc(db, "members", uid), body)).catch(() => toast("Chưa lưu được. Kiểm tra kết nối rồi thử lại."));
  members[uid] = me;
}
async function addNote(l, t) {
  try { await F.addDoc(F.collection(db, "notes"), { uid, l, t: t.slice(0, 1500), ts: Date.now() }); return true; }
  catch (e) { toast("Chưa chia sẻ được. Kiểm tra kết nối rồi thử lại."); return false; }
}

/* Today */
function renderStage() {
  const st = stageOf(me.completed), next = STAGES[st + 1], sleep = daysSince(me.lastDate) >= 4 && me.days > 0;
  const prog = next ? Math.round(((me.completed - STAGES[st].at) / (next.at - STAGES[st].at)) * 100) : 100;
  $("stage").innerHTML = `${mascot(st, sleep)}
    <div class="petname"><span id="pn">${esc(me.petName)}</span><button class="linkbtn" id="rename">đổi tên</button></div>
    <p class="muted small">${sleep ? esc(me.petName) + " đang ngủ, chờ bạn quay lại. Không sao cả, bắt đầu lại lúc nào cũng được." : esc(STAGES[st].line)}</p>
    <div class="chips"><span class="chip gold">Chặng ${st + 1} · ${STAGES[st].name}</span><span class="chip leaf num">${me.completed} / 365 bài</span><span class="chip num">${me.streak} ngày liên tiếp</span></div>
    <div class="bar" aria-label="Tiến trình chặng"><i style="width:${prog}%"></i></div>
    <p class="muted num" style="font-size:12.5px">${next ? `Còn ${next.at - me.completed} bài nữa đến chặng ${next.name}` : "Đã đi trọn hành trình"}</p>
    <div class="path">${STAGES.map((s, i) => `<span class="${i <= st ? "on" : ""}">${s.name}</span>`).join("")}</div>`;
  $("rename").onclick = () => {
    const span = $("pn"), inp = document.createElement("input");
    inp.id = "petInput"; inp.value = me.petName; inp.maxLength = 24; inp.style.maxWidth = "200px";
    span.replaceWith(inp); inp.focus(); $("rename").hidden = true;
    const done = () => { const v = inp.value.trim(); if (v && v !== me.petName) { me.petName = v; save(); } renderStage(); };
    inp.onblur = done; inp.onkeydown = (e) => { if (e.key === "Enter") inp.blur(); };
  };
}
function lessonBlock(n) {
  const ln = lessons["l" + n]; let h = "";
  if (ln && ln.title) h += `<h3>${esc(ln.title)}</h3>`;
  if (ln && ln.note) h += `<div class="note">${esc(ln.note)}</div>`;
  if (ln && safeUrl(ln.link)) h += `<a class="link" href="${esc(safeUrl(ln.link))}" target="_blank" rel="noopener">Đọc bài ${n}</a>`;
  return h;
}
function renderLesson() {
  const n = me.lesson, doneToday = me.lastDate === today(), finished = me.completed >= 365;
  let h = `<div class="label">Bài học của bạn</div><div class="lesson-no">Bài ${n}<em>/ 365</em></div>` + lessonBlock(n);
  if (finished) h += `<div class="done">Bạn đã hoàn thành cả 365 bài. Bạn có thể bắt đầu lại từ bài 1 bất cứ lúc nào.</div><button class="btn ghost" id="restart">Bắt đầu vòng mới</button>`;
  else if (doneToday) h += `<div class="done">Bạn đã thực hành hôm nay. Hẹn bạn ngày mai với bài ${n}.</div>`;
  else h += `<p class="muted small">Mỗi ngày chỉ một bài. Nếu thấy cần, bạn có thể ở lại bài này thêm một ngày.</p>
    <div class="row"><button class="btn gold" id="doneBtn">Đã thực hành, sang bài ${Math.min(365, n + 1)}</button><button class="btn ghost small" id="stayBtn">Ở lại bài ${n}</button></div>`;
  $("lessonCard").innerHTML = h;
  if ($("doneBtn")) $("doneBtn").onclick = () => practice(true);
  if ($("stayBtn")) $("stayBtn").onclick = () => practice(false);
  if ($("restart")) $("restart").onclick = () => { me.lesson = 1; me.completed = 0; save(); renderAll(); };
  $("remN").textContent = me.rem && me.rem.d === today() ? me.rem.n : 0;
}
function practice(advance) {
  if (me.lastDate === today()) return;
  const before = stageOf(me.completed);
  me.streak = me.lastDate === yesterday() ? me.streak + 1 : 1;
  me.days += 1; me.lastDate = today(); me.lastLesson = me.lesson;
  if (advance) { me.completed = Math.min(365, me.completed + 1); if (me.lesson < 365) me.lesson += 1; }
  save(); renderAll();
  const after = stageOf(me.completed);
  if (after > before) celebrate(after);
  else toast(advance ? "Đã ghi nhận. " + me.petName + " sáng thêm một chút." : "Đã ghi nhận. Ở lại cũng là thực hành.");
}
function celebrate(st) {
  const o = document.createElement("div"); o.className = "overlay";
  o.innerHTML = `<div class="card">${mascot(st, false)}<div class="label">Lên chặng ${st + 1}</div><h2>${esc(me.petName)} đã thành ${STAGES[st].name}</h2><p class="muted">${STAGES[st].line}</p><button class="btn gold" id="ok">Tuyệt vời</button></div>`;
  document.body.appendChild(o); $("ok").focus(); $("ok").onclick = () => o.remove();
}
let remTimer = null;
$("remBtn").onclick = () => {
  if (!me.rem || me.rem.d !== today()) me.rem = { d: today(), n: 0 };
  me.rem.n += 1; $("remN").textContent = me.rem.n;
  clearTimeout(remTimer); remTimer = setTimeout(save, 1500);
};
$("postBtn").onclick = async () => {
  const t = $("reflect").value.trim(); if (!t) return;
  $("postBtn").disabled = true;
  const l = me.lastDate === today() && me.lastLesson ? me.lastLesson : me.lesson;
  if (await addNote(l, t)) { $("reflect").value = ""; toast("Đã chia sẻ với vòng tròn."); }
  $("postBtn").disabled = false;
};

/* Sessions */
const whenMs = (w) => (w ? Date.parse(w + (w.length === 16 ? ":00" : "") + "+07:00") : NaN);
const fmtWhen = (w) => {
  const ms = whenMs(w); if (isNaN(ms)) return w || "";
  const d = new Date(ms + 7 * 3600e3), days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return `${days[d.getUTCDay()]}, ${d.getUTCDate()}/${d.getUTCMonth() + 1} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
function upcoming() { const now = Date.now(); return sessions.filter((s) => whenMs(s.when) > now - 2 * 3600e3).sort((a, b) => whenMs(a.when) - whenMs(b.when))[0]; }
function sessionHTML(s, isNext) {
  const zoom = safeUrl(s.zoom), rec = safeUrl(s.rec);
  return `<div class="session"><div class="when">${isNext ? "Sắp tới · " : ""}${esc(fmtWhen(s.when))}</div><h3>${esc(s.title || "Buổi thực hành")}</h3>
    ${s.note ? `<p style="white-space:pre-wrap">${esc(s.note)}</p>` : ""}
    <div class="row">${zoom && isNext ? `<a class="link" href="${esc(zoom)}" target="_blank" rel="noopener">Vào Zoom</a>` : ""}
    ${rec ? `<a class="link" href="${esc(rec)}" target="_blank" rel="noopener">Xem video ghi hình</a>` : ""}
    ${isAdmin ? `<button class="btn ghost small" data-edit="${esc(s.id)}">Sửa</button><button class="btn ghost small" data-del="${esc(s.id)}">Xoá</button>` : ""}</div></div>`;
}
function renderSessions() {
  const nx = upcoming();
  if (!sessions.length) $("sessions").innerHTML = `<p class="empty">Chưa có buổi nào. Lịch Zoom hàng tuần và video ghi hình sẽ hiện ở đây.</p>`;
  else {
    const sorted = [...sessions].sort((a, b) => whenMs(b.when) - whenMs(a.when));
    $("sessions").innerHTML = (nx ? sessionHTML(nx, true) : "") + sorted.filter((s) => s !== nx).map((s) => sessionHTML(s, false)).join("");
  }
  const z = nx && safeUrl(nx.zoom);
  $("nextTeaser").innerHTML = nx ? `<div class="card next stack"><div class="label">Buổi Zoom tiếp theo</div><h3>${esc(nx.title || "Buổi thực hành")}</h3><p class="muted">${esc(fmtWhen(nx.when))}</p>${z ? `<a class="link" href="${esc(z)}" target="_blank" rel="noopener">Vào Zoom</a>` : ""}</div>` : "";
  $("sessions").querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => editSession(b.dataset.edit)));
  $("sessions").querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => delSession(b)));
}
function editSession(id) {
  const s = sessions.find((x) => x.id === id); if (!s) return; editingSession = id;
  $("sTitle").value = s.title || ""; $("sWhen").value = s.when || ""; $("sZoom").value = s.zoom || ""; $("sRec").value = s.rec || ""; $("sNote").value = s.note || "";
  $("sessFormTitle").textContent = "Sửa buổi học"; $("sCancel").hidden = false; $("adminSession").scrollIntoView({ behavior: "smooth" });
}
function resetForm() { editingSession = null; ["sTitle", "sWhen", "sZoom", "sRec", "sNote"].forEach((i) => ($(i).value = "")); $("sessFormTitle").textContent = "Thêm buổi Zoom"; $("sCancel").hidden = true; }
$("sCancel").onclick = resetForm;
function delSession(btn) {
  if (btn.dataset.armed) { F.deleteDoc(F.doc(db, "sessions", btn.dataset.del)).then(() => toast("Đã xoá buổi học.")).catch(() => toast("Chưa xoá được.")); return; }
  btn.dataset.armed = "1"; btn.textContent = "Chạm lần nữa để xoá";
  setTimeout(() => { if (btn.isConnected) { delete btn.dataset.armed; btn.textContent = "Xoá"; } }, 3000);
}
$("sSave").onclick = async () => {
  const body = { title: $("sTitle").value.trim(), when: $("sWhen").value, zoom: $("sZoom").value.trim(), rec: $("sRec").value.trim(), note: $("sNote").value.trim() };
  if (!body.when) { toast("Hãy chọn ngày giờ cho buổi học."); return; }
  const prev = editingSession && sessions.find((s) => s.id === editingSession);
  if (prev && prev.when === body.when && prev.notified) body.notified = prev.notified;
  $("sSave").disabled = true;
  try {
    const ref = editingSession ? F.doc(db, "sessions", editingSession) : F.doc(F.collection(db, "sessions"));
    await F.setDoc(ref, body); toast("Đã lưu buổi học."); resetForm();
  } catch (e) { toast("Chưa lưu được buổi học."); }
  $("sSave").disabled = false;
};
$("lNo").oninput = () => { const l = lessons["l" + $("lNo").value]; $("lTitle").value = l ? l.title || "" : ""; $("lNote").value = l ? l.note || "" : ""; $("lLink").value = l ? l.link || "" : ""; };
$("lSave").onclick = async () => {
  const n = parseInt($("lNo").value, 10); if (!(n >= 1 && n <= 365)) { toast("Số bài từ 1 đến 365."); return; }
  try { await F.setDoc(F.doc(db, "lessons", "l" + n), { n, title: $("lTitle").value.trim(), note: $("lNote").value.trim(), link: $("lLink").value.trim() }); toast("Đã lưu ghi chú bài " + n + "."); }
  catch (e) { toast("Chưa lưu được ghi chú."); }
};

/* Circle */
const nameOf = (id) => (members[id] && members[id].name) || "Một người bạn";
const avatar = (id) => `<span class="av" style="background:${colorOf(id)}" aria-hidden="true">${esc(initials(nameOf(id)))}</span>`;
function renderMembers() {
  const list = Object.entries(members).sort((a, b) => (b[1].completed || 0) - (a[1].completed || 0));
  if (!list.length) return;
  $("members").innerHTML = list.map(([id, m]) => {
    const st = stageOf(m.completed || 0), sleep = daysSince(m.lastDate) >= 4 && (m.days || 0) > 0;
    return `<div class="member">${mascot(st, sleep)}<div class="n">${esc(m.petName || "Đốm Sáng")}</div><div class="s">của ${esc(id === uid ? "bạn" : nameOf(id))}</div><div class="s num">Bài ${m.lesson || 1} · ${STAGES[st].name}</div></div>`;
  }).join("");
}
const postHTML = (p, withLesson) => `<div class="post">${avatar(p.uid)}<div><div class="meta">${esc(p.uid === uid ? "Bạn" : nameOf(p.uid))}${withLesson ? " · Bài " + p.l : ""} · ${fmtDate(p.ts)}</div><p>${esc(p.t)}</p></div></div>`;
function renderFeed() {
  $("feed").innerHTML = feed.length ? feed.map((p) => postHTML(p, true)).join("") : `<p class="empty">Chưa có chia sẻ nào. Hãy là người đầu tiên.</p>`;
}

/* Review */
async function loadOthers(n) {
  if (reviewOthers.n === n && reviewOthers.loaded) return;
  reviewOthers = { n, list: [], loaded: false };
  try {
    const s = await F.getDocs(F.query(F.collection(db, "notes"), F.where("l", "==", n), F.limit(100)));
    const list = []; s.forEach((d) => { const x = d.data(); if (x.uid !== uid) list.push(x); });
    list.sort((a, b) => b.ts - a.ts);
    if (reviewOthers.n === n) { reviewOthers = { n, list, loaded: true }; renderReview(); }
  } catch (e) {}
}
function renderReview() {
  if (!uid) return;
  const cur = me.lesson, max = Math.max(cur, 1);
  const mineBy = {}; myNotes.forEach((x) => (mineBy[x.l] = mineBy[x.l] || []).push(x));
  if (reviewSel == null || reviewSel > max) reviewSel = Math.max(1, cur - 1);
  $("reviewCount").textContent = cur - 1 + " bài đã học";
  let g = ""; for (let i = 1; i <= max; i++) g += `<button data-l="${i}" class="${mineBy[i] ? "has " : ""}${i === cur ? "cur" : ""}" aria-pressed="${i === reviewSel}" aria-label="Bài ${i}">${i}</button>`;
  $("reviewGrid").innerHTML = g;
  $("reviewGrid").querySelectorAll("button").forEach((b) => (b.onclick = () => { reviewSel = +b.dataset.l; reviewNoteOpen = false; renderReview(); $("reviewDetail").scrollIntoView({ behavior: "smooth", block: "start" }); }));
  const n = reviewSel, mine = mineBy[n] || [];
  let h = `<div class="row" style="justify-content:space-between"><div class="label">${n === cur ? "Bài hiện tại" : "Ôn lại"}</div><div class="row" style="gap:6px"><button class="btn ghost small" id="rvPrev" ${n <= 1 ? "disabled" : ""} aria-label="Bài trước">‹</button><button class="btn ghost small" id="rvNext" ${n >= max ? "disabled" : ""} aria-label="Bài sau">›</button></div></div>
    <div class="lesson-no">Bài ${n}<em>/ 365</em></div>` + (lessonBlock(n) || `<p class="muted">Bài này chưa có ghi chú từ người hướng dẫn.</p>`);
  h += `<div class="label" style="margin-top:6px">Cảm nhận của bạn</div>`;
  h += mine.length ? mine.map((x) => `<div class="mine"><div class="meta">${fmtDate(x.ts)}</div><p>${esc(x.t)}</p></div>`).join("") : `<p class="empty">Bạn chưa viết gì cho bài này.</p>`;
  h += reviewNoteOpen
    ? `<textarea id="rvText" maxlength="1500" placeholder="Hôm nay đọc lại bài ${n}, bạn thấy gì?"></textarea><div class="row" style="justify-content:flex-end"><button class="btn ghost small" id="rvCancel">Huỷ</button><button class="btn small" id="rvSave">Lưu và chia sẻ</button></div>`
    : `<div><button class="btn ghost small" id="rvAdd">Viết thêm cảm nhận cho bài ${n}</button></div>`;
  const others = reviewOthers.n === n ? reviewOthers.list : [];
  if (others.length) h += `<div class="label" style="margin-top:6px">Cả nhóm chia sẻ về bài này</div>` + others.slice(0, 30).map((p) => postHTML(p, false)).join("");
  $("reviewDetail").innerHTML = h;
  $("rvPrev").onclick = () => { reviewSel = n - 1; reviewNoteOpen = false; renderReview(); };
  $("rvNext").onclick = () => { reviewSel = n + 1; reviewNoteOpen = false; renderReview(); };
  if ($("rvAdd")) $("rvAdd").onclick = () => { reviewNoteOpen = true; renderReview(); $("rvText").focus(); };
  if ($("rvCancel")) $("rvCancel").onclick = () => { reviewNoteOpen = false; renderReview(); };
  if ($("rvSave")) $("rvSave").onclick = async () => {
    const t = $("rvText").value.trim(); if (!t) return;
    if (await addNote(n, t)) { reviewNoteOpen = false; renderReview(); toast("Đã lưu cảm nhận cho bài " + n + "."); }
  };
  if (!$("tab-ontap").hidden) loadOthers(n);
}

function renderAll() { renderStage(); renderLesson(); renderSessions(); renderMembers(); renderFeed(); renderReview(); }

/* Tabs */
const TABS = ["homnay", "ontap", "buoihoc", "vongtron", "caidat"];
function show(tab) {
  TABS.forEach((t) => ($("tab-" + t).hidden = t !== tab));
  document.querySelectorAll("nav.tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.tab === tab ? "true" : "false"));
  window.scrollTo(0, 0);
  if (tab === "ontap") renderReview();
  if (tab === "caidat") refreshPushStatus();
}
document.querySelectorAll("nav.tabs button").forEach((b) => (b.onclick = () => show(b.dataset.tab)));

/* ---------------- Settings ---------------- */
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; if (uid) $("installAndroid").hidden = false; });
$("installBtn").onclick = async () => { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $("installAndroid").hidden = true; };

async function setupSettings() {
  $("myName").value = me.name || "";
  $("myEmail").textContent = auth.currentUser ? "Đăng nhập bằng " + auth.currentUser.email : "";
  $("installCard").hidden = !(isIOS && !isStandalone());
  $("installAndroid").hidden = !deferredInstall;
  if (isAdmin) {
    $("codeNow").innerHTML = joinCode ? `Mã hiện tại: <span class="code">${esc(joinCode)}</span>` : "Chưa có mã nhóm.";
    $("appLink").innerHTML = `Link app để gửi học viên: <span class="code" style="font-size:13px;letter-spacing:0;overflow-wrap:anywhere">${esc(location.origin + location.pathname)}</span>`;
  }
  try { const s = await F.getDoc(F.doc(db, "push", uid)); pushCfg = { ...DEFAULT_PUSH, ...(s.exists() ? s.data() : {}) }; }
  catch (e) { pushCfg = { ...DEFAULT_PUSH }; }
  fillPush();
}
function fillPush() {
  const p = pushCfg;
  $("pMorningOn").checked = !!p.morning.on; $("pMorningAt").value = p.morning.at;
  $("pEveningOn").checked = !!p.evening.on; $("pEveningAt").value = p.evening.at;
  $("pHourlyOn").checked = !!p.hourly.on; $("pHourlyFrom").value = p.hourly.from; $("pHourlyTo").value = p.hourly.to; $("pHourlyEvery").value = String(p.hourly.every);
  $("pZoom").checked = p.zoom !== false;
}
const pushSupported = () => "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
function refreshPushStatus() {
  const st = $("pushStatus"), btn = $("pushEnable");
  btn.hidden = true;
  if (isIOS && !isStandalone()) { st.textContent = "Hãy cài app lên màn hình chính trước (xem hướng dẫn phía trên), rồi bật nhắc nhở trong app đã cài."; return; }
  if (!pushSupported()) { st.textContent = "Trình duyệt này chưa hỗ trợ thông báo. Trên iPhone cần iOS 16.4 trở lên; trên Android hãy dùng Chrome."; return; }
  if (Notification.permission === "denied") { st.textContent = "Bạn đã chặn thông báo cho app. Hãy mở Cài đặt của điện thoại hoặc trình duyệt để cho phép lại."; return; }
  if (Notification.permission === "granted" && localStorageGet("pushOn") === "1") { st.textContent = "Thông báo đang bật trên máy này. Chọn giờ nhắc bên dưới rồi bấm Lưu."; return; }
  st.textContent = "Bật thông báo để nhận nhắc nhở thực hành trên máy này.";
  btn.hidden = false;
}
function localStorageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function localStorageSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

$("pushEnable").onclick = async () => {
  const btn = $("pushEnable"); btn.disabled = true;
  try {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") { refreshPushStatus(); btn.disabled = false; return; }
    if (!messaging) {
      const m = await import(FB + "firebase-messaging.js");
      if (!(await m.isSupported())) throw new Error("unsupported");
      F.getToken = m.getToken; messaging = m.getMessaging();
      m.onMessage(messaging, (p) => toast((p.notification && (p.notification.title + " · " + p.notification.body)) || "Bạn có nhắc nhở mới."));
    }
    const reg = swReg || (await navigator.serviceWorker.register("./firebase-messaging-sw.js"));
    await navigator.serviceWorker.ready;
    const token = await F.getToken(messaging, { vapidKey: CFG.vapidKey, serviceWorkerRegistration: reg });
    if (!token) throw new Error("no token");
    await F.setDoc(F.doc(db, "push", uid), { ...pushCfg, tokens: F.arrayUnion(token), updated: Date.now() }, { merge: true });
    localStorageSet("pushOn", "1"); localStorageSet("pushToken", token);
    try { reg.showNotification("Đã bật nhắc nhở", { body: me.petName + " sẽ nhắc bạn thực hành.", icon: "icons/icon-192.png" }); } catch (e) {}
    toast("Đã bật thông báo trên máy này.");
  } catch (e) {
    toast("Chưa bật được thông báo. Thử mở lại app rồi bấm lại.");
  }
  btn.disabled = false; refreshPushStatus();
};
$("pSave").onclick = async () => {
  const every = parseInt($("pHourlyEvery").value, 10) || 60;
  pushCfg = {
    morning: { on: $("pMorningOn").checked, at: $("pMorningAt").value || "07:00" },
    evening: { on: $("pEveningOn").checked, at: $("pEveningAt").value || "21:00" },
    hourly: { on: $("pHourlyOn").checked, from: $("pHourlyFrom").value || "08:00", to: $("pHourlyTo").value || "21:00", every },
    zoom: $("pZoom").checked,
  };
  try { await F.setDoc(F.doc(db, "push", uid), { ...pushCfg, updated: Date.now() }, { merge: true }); toast("Đã lưu cài đặt nhắc nhở."); }
  catch (e) { toast("Chưa lưu được cài đặt."); }
};
$("codeSave").onclick = async () => {
  const c = $("codeInput").value.trim().toUpperCase().replace(/\s+/g, "");
  if (c.length < 4) { toast("Mã nhóm cần ít nhất 4 ký tự."); return; }
  try { await F.setDoc(F.doc(db, "config", "secret"), { code: c }); joinCode = c; $("codeInput").value = ""; setupSettings(); showBanner(""); toast("Đã lưu mã nhóm."); }
  catch (e) { toast("Chưa lưu được mã nhóm."); }
};
$("nameSave").onclick = () => { const v = $("myName").value.trim(); if (!v) return; me.name = v.slice(0, 40); save(); $("who").textContent = me.name; renderMembers(); toast("Đã lưu tên."); };
$("logout").onclick = async () => {
  const t = localStorageGet("pushToken");
  if (t) { try { await F.setDoc(F.doc(db, "push", uid), { tokens: F.arrayRemove(t) }, { merge: true }); } catch (e) {} }
  localStorageSet("pushOn", "0"); localStorageSet("pushToken", "");
  F.signOut(auth);
};
