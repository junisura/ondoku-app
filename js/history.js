import { formatTimeMs, formatYMD, formatYMDhms, formatJpMDA, formatTimeHm } from "./date.js";
import { loadDateMap, loadRecords } from "./storage.js";
import { loadContents, findContent } from "./contents.js";
import { getTodayRecords, getBestRecord, sortByCreatedAt, calcStreak } from "./records.js";
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

    todayStr = formatYMD(new Date().toISOString());
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
    div.onclick = () => onDateClick(dateStr, div);

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
  const template = document.getElementById("record-item-template");
  recordContainer.innerHTML = "";

  const workDateISO = new Date(dateStr).toISOString();
  document.getElementById("record-date").textContent = formatJpMDA(workDateISO);

  // record（上）
  const dayRecords = getTodayRecords(records, selectedDate);
  const sorted = sortByCreatedAt(dayRecords, true);

  if (dayRecords.length === 0) {
    recordContainer.textContent = "記録なし";
    recordContainer.classList.remove("list");
    return;
  } else {
    recordContainer.classList.add("list");
    initRecords(dateStr);
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

// 各回の記録
function initRecords(workDate) {

  const list = document.getElementById("records");
  const template = document.getElementById("list-item-template");
  list.innerHTML = "";

  const workDateRecords = getTodayRecords(records, workDate);
  const workDateBestRec = getBestRecord(workDateRecords);
  const sorted = sortByCreatedAt(workDateRecords, true);
  sorted.forEach((record, index) => {
    const clone = template.content.cloneNode(true);

    if (workDateBestRec.attempt_index === record.attempt_index) {
      clone.querySelector(".list__item").classList.add("is-best");
      clone.querySelector(".item__best").textContent = "crown";
    }
    clone.querySelector(".item__timestamp").textContent = formatTimeHm(record.created_at);
    clone.querySelector(".item__time").textContent = formatTimeMs(record.time_sec);
    clone.querySelector(".speed").textContent = record.speed.toFixed(2);
    if (record.memo) {
      clone.querySelector(".item__memo").textContent = record.memo;
    } else {
      clone.querySelector(".item__memo").classList.add("display-none");
    }

    list.appendChild(clone);
  });
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

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevYearBtn").addEventListener("click", prevYear);
  document.getElementById("prevMonthBtn").addEventListener("click", prevMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", nextMonth);
  document.getElementById("nextYearBtn").addEventListener("click", nextYear);
});
