import { formatYMD, formatJpMDA } from "./date.js";
import { loadDateMap, loadRecords } from "./storage.js";
import { loadContents, findContent } from "./contents.js";
import { getTodayRecords, getSortedByCreatedAt, calcStreak } from "./records.js";
import { renderRecordList } from "./recordList.js";

let today = new Date();
let contents = null;
let dateMap = {};
let records = [];
let todayStr = "";

let selectedDate = formatYMD(new Date().toISOString()); // 初期値は当日

// 初期化
async function init() {
  // データ読み込み
  contents = await loadContents();
  dateMap = loadDateMap();
  records = loadRecords();

  renderCalendar();           // selected反映
  renderStreak();
  renderDetail(selectedDate); // 詳細表示
}

function renderCalendar() {
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

    const hasRecord = records.some(r => r.work_date === dateStr);

    const div = document.createElement("div");

    div.classList.add("day");
    if (isOtherMonth) div.classList.add("other-month");
    if (hasRecord) div.classList.add("has-record");
    if (isToday) div.classList.add("today");
    if (isSelected) div.classList.add("selected");

    div.textContent = day;
    div.dataset.date = dateStr;
    div.addEventListener("click", () => onDateClick(dateStr, div));

    container.appendChild(div);

  }
}

function renderStreak() {
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday.toISOString());
  const hasYesterday = records.some(r => r.work_date === yesterdayStr);
  const hasToday = records.some(r => r.work_date === todayStr);
  const streak = calcStreak(records);

  if (hasYesterday || hasToday) {
    document.getElementById("streak-days").textContent = streak;
  }
  if (!hasToday) {
    document.getElementById("warning").classList.remove("display-none");
  }
}

function onDateClick(dateStr, el) {
  // 1. 直前選択を解除
  const prevDateStr = selectedDate;
  if (prevDateStr) {
    const prevEl = document.querySelector(`.day[data-date="${prevDateStr}"]`);
    if (prevEl) prevEl.classList.remove("selected");
  }
  document.getElementById("text-section").classList.add("display-none");

  // 2. 状態更新
  selectedDate = dateStr;

  // 3. 新しい選択
  el.classList.add("selected");

  // 4. 詳細
  renderDetail(dateStr);
}

function renderDetail(dateStr) {
  const recordContainer = document.getElementById("records");
  recordContainer.innerHTML = "";
  document.getElementById("record-date").textContent = formatJpMDA(dateStr);

  // record（上）
  const dayRecords = getTodayRecords(records, dateStr);
  const sorted = getSortedByCreatedAt(dayRecords, true);

  if (dayRecords.length === 0) {
    recordContainer.textContent = "記録なし";
    recordContainer.classList.remove("list");
    return;
  } else {
    recordContainer.classList.add("list");
    // recordList.jsを呼ぶ
    renderRecordList(sorted);
  }

  // text（下）
  const contentId = dateMap[dateStr];
  const content = findContent(contents, contentId);

  if (content) {
    document.getElementById("text-section").classList.remove("display-none");
    document.getElementById("text-title").textContent = content.title;
    document.getElementById("text-category").textContent = content.genre;
    document.getElementById("text-body").textContent = content.text;
  } else {
    document.getElementById("text-section").classList.add("display-none");
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
