import { formatTimeMs, formatYMD, formatYMDhms } from "./date.js";
import { loadDateMap, loadRecords } from "./storage.js";
import { loadContents } from "./contents.js";
import { getTodayRecords, sortByCreatedAt, calcStreak } from "./records.js";
let current = new Date();
let contentMap = {};
let dateMap = {};
let records = [];
let todayStr = "";

let selectedDate = formatYMD(new Date().toISOString()); // 初期値は当日

// 初期化
async function init() {
  // データ読み込み
  const contents = await loadContents();
  dateMap = loadDateMap();
  records = loadRecords();
  contents.forEach(c => {
    contentMap[c.id] = c;
  });

  renderCalendar();           // selected反映
  renderStreak();
  renderDetail(selectedDate); // 詳細表示
}

function renderCalendar() {
  const year = current.getFullYear();
  const month = current.getMonth();

  document.getElementById("monthLabel").textContent = `${year} / ${month + 1}`;

  const container = document.getElementById("calendar");
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
  const hasToday = records.some(r => r.work_date === todayStr);
  const streak = calcStreak(records);

  document.getElementById("streak").textContent = `${streak}日継続中！`;
  if (!hasToday) {
    document.getElementById("warning").classList.remove("hidden");
  }
}

function onDateClick(dateStr, el) {
  // 1. 直前選択を解除
  const prevDateStr = selectedDate;
  if (prevDateStr) {
    const prevEl = document.querySelector(`.day[data-date="${prevDateStr}"]`);
    if (prevEl) prevEl.classList.remove("selected");
  }
  document.getElementById("title").textContent = "";
  document.getElementById("genre").textContent = "";
  document.getElementById("text").textContent = "";

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

  const contentId = dateMap[dateStr];
  const content = contentMap[contentId];
  if (!content) {
    recordContainer.textContent = "登録なし";
    return;
  }

  const dayRecords = getTodayRecords(records, selectedDate);
  const sorted = sortByCreatedAt(dayRecords, true);
  if (dayRecords.length === 0) {
    recordContainer.textContent = "記録なし";
    return;
  }

  // memo（上）
  sorted.forEach((record, index) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".attempt").textContent = `${record.attempt_index}回目`;
    clone.querySelector(".speed").textContent = `${record.speed.toFixed(2)}文字/秒`;
    clone.querySelector(".time").textContent = `（${record.time_sec.toFixed(2)}秒）`;

    const memoEl = clone.querySelector(".memo");
    if (record.memo) {
      memoEl.textContent = record.memo;
    } else {
      memoEl.style.display = "none";
    }

    recordContainer.appendChild(clone);
  });

  // content（下）
  document.getElementById("title").textContent = content.title;
  document.getElementById("genre").textContent = content.genre;
  document.getElementById("text").textContent = content.text;
}

function prevYear() {
  current.setFullYear(current.getFullYear() - 1);
  renderCalendar();
}

function prevMonth() {
  current.setMonth(current.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  current.setMonth(current.getMonth() + 1);
  renderCalendar();
}

function nextYear() {
  current.setFullYear(current.getFullYear() + 1);
  renderCalendar();
}

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevYearBtn").addEventListener("click", prevYear);
  document.getElementById("prevMonthBtn").addEventListener("click", prevMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", nextMonth);
  document.getElementById("nextYearBtn").addEventListener("click", nextYear);
});
