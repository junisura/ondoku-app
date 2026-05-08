import { formatISOToYMD } from "./date.js";
import { getRecordsByPeriod } from "./records.js";

let today = new Date();
let selectedDate = "";
let onSelectDate = null;
let currentUserId;
let startDate;
let endDate;
const SERVICE_START_DATE = new Date("2026-05-09");

export async function initCalendar(userId, callback) {
  currentUserId = userId;
  onSelectDate = callback;
  selectedDate = formatISOToYMD(new Date().toISOString()); // 初期値は当日

  renderCalendarSkeleton();
  await decorateCalendarRecords();
}

async function renderCalendarSkeleton() {
  const year = today.getFullYear();
  const month = today.getMonth();

  document.getElementById("month-label").textContent = `${year}年${month + 1}月`;

  const container = document.getElementById("calendar-date");
  container.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const todayStr = formatISOToYMD(new Date().toISOString());

  startDate = new Date(year, month, 1 - firstDay);
  endDate = new Date(year, month, daysInMonth + (totalCells - firstDay - daysInMonth));

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
    const dateStr = formatISOToYMD(date);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const div = document.createElement("div");

    div.classList.add("day");
    if (isOtherMonth) div.classList.add("other-month");
    if (isToday) div.classList.add("today");
    if (isSelected) div.classList.add("selected");

    div.textContent = day;
    div.dataset.date = dateStr;
    div.addEventListener("click", () => handleDateClick(dateStr, div));

    container.appendChild(div);

  }

  activateNaviButtons();
}

async function decorateCalendarRecords() {
  const recordedDates = await getRecordsByPeriod(currentUserId, formatISOToYMD(startDate), formatISOToYMD(endDate));

  document.querySelectorAll(".day").forEach(el => {
    const dateStr = el.dataset.date;

    if (recordedDates.has(dateStr)) {
      el.classList.add("has-record");
    }
  });
}

function handleDateClick(dateStr, el) {
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
  onSelectDate(dateStr);
}

async function prevYear() {
  today.setFullYear(today.getFullYear() - 1);
  renderCalendarSkeleton();
  await decorateCalendarRecords();
}

async function prevMonth() {
  today.setMonth(today.getMonth() - 1);
  renderCalendarSkeleton();
  await decorateCalendarRecords();
}

async function nextMonth() {
  today.setMonth(today.getMonth() + 1);
  renderCalendarSkeleton();
  await decorateCalendarRecords();
}

async function nextYear() {
  today.setFullYear(today.getFullYear() + 1);
  renderCalendarSkeleton();
  await decorateCalendarRecords();
}

function activateNaviButtons() {
  const prevYearBtn = document.getElementById("prevYearBtn");
  const prevMonthBtn = document.getElementById("prevMonthBtn");
  const nextMonthBtn = document.getElementById("nextMonthBtn");
  const nextYearBtn = document.getElementById("nextYearBtn");

  // 現在表示月
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // サービス開始月（同じく月単位）
  const serviceMonth = new Date(SERVICE_START_DATE.getFullYear(), SERVICE_START_DATE.getMonth(), 1);

  // 未来月（今月まで）
  const now = new Date();
  const nowMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 判定
  const canGoPrevYear = today.getFullYear() > SERVICE_START_DATE.getFullYear();
  const canGoPrevMon = currentMonth > serviceMonth;
  const canGoNextMon = currentMonth < nowMonth;
  const canGoNextYear = today.getFullYear() < now.getFullYear();

  // 状態反映
  prevYearBtn.disabled = !canGoPrevYear;
  prevMonthBtn.disabled = !canGoPrevMon;

  nextMonthBtn.disabled = !canGoNextMon;
  nextYearBtn.disabled = !canGoNextYear;
}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("prevYearBtn").addEventListener("click", prevYear);
  document.getElementById("prevMonthBtn").addEventListener("click", prevMonth);
  document.getElementById("nextMonthBtn").addEventListener("click", nextMonth);
  document.getElementById("nextYearBtn").addEventListener("click", nextYear);
});
