// Gửi nhắc nhở cho học viên. GitHub Actions chạy tệp này mỗi 15 phút.
// Mọi giờ đều tính theo giờ Việt Nam (UTC+7).
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const TZ_MIN = 7 * 60;
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) { console.error("Thiếu secret FIREBASE_SERVICE_ACCOUNT."); process.exit(1); }
initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();
const fcm = getMessaging();

function appUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/?$/, "/");
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "/").split("/");
  return repo && repo.toLowerCase() === owner.toLowerCase() + ".github.io"
    ? `https://${owner.toLowerCase()}.github.io/`
    : `https://${owner.toLowerCase()}.github.io/${repo}/`;
}
const APP = appUrl();

// Local (Vietnam) clock helpers
const local = (ms) => new Date(ms + TZ_MIN * 60e3);
const hmOf = (ms) => { const d = local(ms); return d.getUTCHours() * 60 + d.getUTCMinutes(); };
const dayOf = (ms) => local(ms).toISOString().slice(0, 10);
const toMin = (s, dflt) => { const m = /^(\d{1,2}):(\d{2})$/.exec(s || ""); return m ? +m[1] * 60 + +m[2] : dflt; };
const whenMs = (w) => (w ? Date.parse(w + (w.length === 16 ? ":00" : "") + "+07:00") : NaN);

const now = Date.now();
const stateRef = db.doc("state/cron");
const stateSnap = await stateRef.get();
let last = stateSnap.exists ? stateSnap.data().lastRun : now - 15 * 60e3;
if (now - last > 2 * 3600e3) last = now - 2 * 3600e3; // sau thời gian dài không chạy, chỉ bù tối đa 2 giờ

// Every local minute in (last, now]
const marks = [];
for (let m = Math.floor(last / 60e3) + 1; m <= Math.floor(now / 60e3); m++) marks.push(m * 60e3);
const hit = (min) => marks.some((ms) => hmOf(ms) === min);
const todayKey = dayOf(now);
console.log(`Khoảng kiểm tra: ${new Date(last).toISOString()} → ${new Date(now).toISOString()} (${marks.length} phút)`);

// Zoom sessions starting in ~60 minutes
const zoomSoon = [];
for (const d of (await db.collection("sessions").get()).docs) {
  const s = d.data(), start = whenMs(s.when);
  if (isNaN(start) || s.notified === s.when) continue;
  const remindAt = start - 60 * 60e3;
  if (remindAt <= now && start > now - 10 * 60e3) zoomSoon.push({ ref: d.ref, ...s, start });
}

const lessonCache = {};
async function lessonTitle(n) {
  if (!(n in lessonCache)) { const s = await db.doc("lessons/l" + n).get(); lessonCache[n] = s.exists ? s.data().title || "" : ""; }
  return lessonCache[n];
}

let sent = 0, removed = 0;
async function send(ref, tokens, title, body, link = APP) {
  if (!tokens.length) return [];
  const res = await fcm.sendEachForMulticast({
    tokens,
    webpush: { notification: { title, body, icon: APP + "icons/icon-192.png", badge: APP + "icons/icon-192.png" }, fcmOptions: { link } },
  });
  const bad = [];
  res.responses.forEach((r, i) => {
    if (r.success) sent++;
    else if (["messaging/registration-token-not-registered", "messaging/invalid-registration-token", "messaging/invalid-argument"].includes(r.error?.code)) bad.push(tokens[i]);
    else console.warn("Lỗi gửi:", r.error?.code);
  });
  if (bad.length) { await ref.update({ tokens: FieldValue.arrayRemove(...bad) }); removed += bad.length; }
  return bad;
}

for (const p of (await db.collection("push").get()).docs) {
  const cfg = p.data();
  let tokens = [...new Set(cfg.tokens || [])];
  if (!tokens.length) continue;
  const mSnap = await db.doc("members/" + p.id).get();
  if (!mSnap.exists) continue;
  const m = mSnap.data(), n = m.lesson || 1, pet = m.petName || "Đốm Sáng";
  const practiced = m.lastDate === todayKey;
  const messages = [];

  if (cfg.morning?.on && !practiced && hit(toMin(cfg.morning.at, 420))) {
    const t = await lessonTitle(n);
    messages.push([`Bài ${n} đang chờ bạn`, t || "Dành vài phút cho bài học hôm nay."]);
  }
  if (cfg.evening?.on && !practiced && hit(toMin(cfg.evening.at, 1260))) {
    messages.push([`${pet} đang chờ bạn`, `Hôm nay bạn chưa thực hành bài ${n}. Vài phút thôi là đủ.`]);
  }
  if (cfg.hourly?.on && !messages.length) {
    const from = toMin(cfg.hourly.from, 480), to = toMin(cfg.hourly.to, 1260), every = Math.max(15, +cfg.hourly.every || 60);
    if (marks.some((ms) => { const h = hmOf(ms); return h >= from && h <= to && (h - from) % every === 0; })) {
      const t = await lessonTitle(n);
      messages.push([`Nhớ lại bài ${n}`, t || "Dừng lại một phút và nhớ lại ý tưởng của bài hôm nay."]);
    }
  }
  if (cfg.zoom !== false) {
    for (const s of zoomSoon) {
      const d = local(s.start), hh = String(d.getUTCHours()).padStart(2, "0"), mm = String(d.getUTCMinutes()).padStart(2, "0");
      const link = /^https?:\/\//i.test(s.zoom || "") ? s.zoom : APP;
      messages.push([`Buổi Zoom lúc ${hh}:${mm}`, (s.title || "Buổi thực hành") + ". Chạm để vào phòng.", link]);
    }
  }
  for (const [title, body, link] of messages) {
    const bad = await send(p.ref, tokens, title, body, link);
    tokens = tokens.filter((t) => !bad.includes(t));
  }
}

for (const s of zoomSoon) await s.ref.update({ notified: s.when });
await stateRef.set({ lastRun: now });
console.log(`Đã gửi ${sent} thông báo. Xoá ${removed} máy không còn nhận.`);
process.exit(0);
