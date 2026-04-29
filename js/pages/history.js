import { getCurrentUser } from "../lib/auth.js";
import { formatISOToYMD, formatYMDToJPMDA } from "../lib/date.js";
import { initCalendar } from "../lib/calendar.js";
import { getContentByDate } from "../lib/contents.js";
import { getRecordsByDate, getRecordsByPeriod, calcCurrentStreak, calcMaxStreak, getStreakContext } from "../lib/records.js";
import { renderRecordList } from "../lib/recordList.js";

let currentUserId;

// 初期化
async function init() {
  const { user, error } = await getCurrentUser();
  currentUserId = user.id;
  const todayStr = formatISOToYMD(new Date().toISOString());

  await Promise.all([
    renderStreak(),
    initCalendar(currentUserId, renderDetail),
    renderDetail(todayStr)
  ]);
}

export async function renderStreak() {
  const today = new Date();
  const todayStr = formatISOToYMD(today.toISOString());

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatISOToYMD(yesterday.toISOString());

  const streakBase = await calcCurrentStreak(currentUserId, yesterdayStr);
  const max = await calcMaxStreak(currentUserId, todayStr);
  const ctx = await getStreakContext(currentUserId, todayStr);
  if (!ctx) return;
  const { dateSet } = ctx;
  const hasToday = dateSet.has(todayStr);
  const hasYesterday = dateSet.has(yesterdayStr);

  const streak = hasToday ? (streakBase + 1) : streakBase;

  const streakEl = document.getElementById("streak-days");
  const maxEl = document.getElementById("max-streak-days");
  const warningEl = document.getElementById("warning");

  // 現在記録
  if (Number(streak) > 0) {
    streakEl.textContent = `${streak}日継続中！`;
  } else {
    streakEl.textContent = `現在 0日`;
  }

  // 最長記録
  maxEl.textContent = `最長 ${max}日`;

  if (!hasToday) {
    warningEl.classList.remove("display-none");
  } else {
    warningEl.classList.add("display-none");
  }
}

async function renderDetail(dateStr) {
  const recordContainer = document.getElementById("records");
  recordContainer.innerHTML = "";
  document.getElementById("record-date").textContent = formatYMDToJPMDA(dateStr);

  // record（上）
  const dayRecords = await getRecordsByDate(currentUserId, dateStr);

  if (dayRecords.length === 0) {
    recordContainer.textContent = "記録なし";
    recordContainer.classList.remove("list");
    return;
  } else {
    recordContainer.classList.add("list");

    // 結果一覧を描画
    renderRecordList(dayRecords);
  }

  // text（下）
  document.getElementById("text-section").classList.remove("display-none");
  const currentContent = await getContentByDate(dateStr);
  if (currentContent) {
    document.getElementById("text-title").textContent = currentContent.contents.title;
    document.getElementById("text-category").textContent = currentContent.contents.category;
    document.getElementById("text-body").textContent = currentContent.contents.text_body.replace(/\\n/g, "\n");
  } else {
    document.getElementById("text-title").textContent = "（教材取得失敗）";
    document.getElementById("text-body").classList.add("display-none");
  }

}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();
});
