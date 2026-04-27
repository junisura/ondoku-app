import { getCurrentUser } from "./auth.js";
import { formatYMD, formatJpMDA } from "./date.js";
import { findTodayContent } from "./contents.js";
import { getTodayRecords, getRecordsByPeriod, calcCurrentStreak, calcMaxStreak, getStreakContext } from "./records.js";
import { renderRecordList } from "./recordList.js";

let today = new Date();
let todayStr = "";

let selectedDate = formatYMD(new Date().toISOString()); // 初期値は当日

// 初期化
async function init() {
  const { user, error } = await getCurrentUser();
  todayStr = formatYMD(today.toISOString());

  renderCalendar(user.id);           // selected反映
  renderStreak(user.id);
  renderDetail(user.id, selectedDate); // 詳細表示
}

async function renderCalendar(userId) {
  const year = today.getFullYear();
  const month = today.getMonth();

  document.getElementById("month-label").textContent = `${year}年${month + 1}月`;

  const container = document.getElementById("calendar-date");
  container.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  todayStr = formatYMD(new Date().toISOString());

  const startDate = new Date(year, month, 1 - firstDay);
  const endDate = new Date(year, month, daysInMonth + (totalCells - firstDay - daysInMonth));
  const recordedDates = await getRecordsByPeriod(userId, formatYMD(startDate), formatYMD(endDate));

  for (let i = 0; i < totalCells; i++) {
    let day, cellMonth, isOtherMonth;

    if (i < firstDay) {
      day = prevMonthDays - firstDay + i + 1;
      cellMonth = month - 1;
      isOtherMonth = true;
    } else if (i >= firstDay + daysInMonth) {
      day = i - (firstDay + daysInMonth) + 1;
      cellMonth = month + 1;
      isOtherMonth = true;
    } else {
      day = i - firstDay + 1;
      cellMonth = month;
      isOtherMonth = false;
    }

    const date = new Date(year, cellMonth, day);
    const dateStr = formatYMD(date);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const hasRecord = recordedDates.has(dateStr);
    const div = document.createElement("div");

    div.classList.add("day");
    if (isOtherMonth) div.classList.add("other-month");
    if (hasRecord) div.classList.add("has-record");
    if (isToday) div.classList.add("today");
    if (isSelected) div.classList.add("selected");

    div.textContent = day;
    div.dataset.date = dateStr;
    div.addEventListener("click", () => onDateClick(userId, dateStr, div));

    container.appendChild(div);

  }
}

export async function renderStreak(userId) {
  const today = new Date();
  const todayStr = formatYMD(today.toISOString());

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday.toISOString());

  const streakBase = await calcCurrentStreak(userId, yesterdayStr);
  const max = await calcMaxStreak(userId, todayStr);
  const ctx = await getStreakContext(userId, todayStr);
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

function onDateClick(userId, dateStr, el) {
  // 直前の選択を解除
  const prevDateStr = selectedDate;
  if (prevDateStr) {
    const prevEl = document.querySelector(`.day[data-date="${prevDateStr}"]`);
    if (prevEl) prevEl.classList.remove("selected");
  }
  document.getElementById("text-section").classList.add("display-none");

  // 状態を更新
  selectedDate = dateStr;

  // 新しい選択
  el.classList.add("selected");

  // 詳細描画
  renderDetail(userId, dateStr);
}

async function renderDetail(userId, dateStr) {
  const recordContainer = document.getElementById("records");
  recordContainer.innerHTML = "";
  document.getElementById("record-date").textContent = formatJpMDA(dateStr);

  // record（上）
  const dayRecords = await getTodayRecords(userId, dateStr);

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
  const currentContent = await findTodayContent(dateStr);
  if (currentContent) {
    document.getElementById("text-title").textContent = currentContent.contents.title;
    document.getElementById("text-category").textContent = currentContent.contents.category;
    document.getElementById("text-body").textContent = currentContent.contents.text_body.replace(/\\n/g, "\n");
  } else {
    document.getElementById("text-title").textContent = "（教材取得失敗）";
    document.getElementById("text-body").classList.add("display-none");
  }

}

function prevYear() {
  today.setFullYear(today.getFullYear() - 1);
  renderCalendar();
}

function prevMonth() {
  today.setMonth(today.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  today.setMonth(today.getMonth() + 1);
  renderCalendar();
}

function nextYear() {
  today.setFullYear(today.getFullYear() + 1);
  renderCalendar();
}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();

  document.getElementById("prevYearBtn").addEventListener("click", prevYear);
  document.getElementById("prevMonthBtn").addEventListener("click", prevMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", nextMonth);
  document.getElementById("nextYearBtn").addEventListener("click", nextYear);
});
