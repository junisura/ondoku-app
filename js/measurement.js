import { formatYMD, formatJpMDA, formatTimeMs, guardSameDay } from "./date.js";
import { loadDateMap, loadRecords, saveRecords } from "./storage.js";
import { loadContents, findContent, guardTodayContent } from "./contents.js";
import { getTodayRecords, sortByCreatedAt, generateId } from "./records.js";
import { Timer } from "./timer.js";

// 初期化
const params = new URLSearchParams(location.search);
const today = params.get("date") || formatYMD(new Date().toISOString());
const todayISO = new Date().toISOString();
const dateMap = loadDateMap();
const records = loadRecords();
guardSameDay(today);

let current;
let attempt;

async function init() {
  const contents = await loadContents();

  const contentId = dateMap[today];
  current = findContent(contents, contentId);
  if (!guardTodayContent(contentId, today)) return;

  const todayRecords = sortByCreatedAt(getTodayRecords(records, today));

  // DOM反映
  document.getElementById("today-date").textContent = formatJpMDA(todayISO);
  document.getElementById("text-title").textContent = current.title;
  document.getElementById("text-category").textContent = current.genre;
  document.getElementById("text-body").textContent = current.text;
  document.getElementById("text-count").textContent = `文字数：${current.char_count}字`;
}

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetBtn").addEventListener("click", resetTimer);
  document.getElementById("startPauseBtn").addEventListener("click", toggleTimer);
  document.getElementById("stopBtn").addEventListener("click", stopTimer);
});

// タイマー制御
const startPauseBtn = document.getElementById("startPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const spIcon = startPauseBtn.querySelector(".material-symbols-outlined");
const spLabel = startPauseBtn.querySelector(".label");

function resetTimer() {

  Timer.reset();
  updateStartPauseButton(false);
  
  document.getElementById("timer-value").textContent = "00:00.00";
};

function updateStartPauseButton(isRunning) {
  if (isRunning) {
    spIcon.textContent = "pause";
    spLabel.textContent = "一時停止";
  } else {
    spIcon.textContent = "play_arrow";
    spLabel.textContent = "開始";
  }
}

function toggleTimer() {
  if (!Timer.isRunning) {
    Timer.start((elapsed) => {
      document.getElementById("timer-value").textContent = formatTimeMs(elapsed);
    });
    updateStartPauseButton(true);
  } else {
    Timer.pause();
    updateStartPauseButton(false);
  }
};

function stopTimer() {
  if (!Timer.startTime && Timer.elapsedBeforePause === 0) return;

  const time_sec = Timer.stop();
  const speed = current.char_count / time_sec;
  const record = {
    id: generateId(),
    content_id: current.id,
    work_date: today,
    attempt_index: attempt,
    time_sec: time_sec,
    speed: speed,
    memo: "",
    created_at: new Date().toISOString(),
  };

  records.push(record);
  saveRecords(records);

  location.href = `result.html?date=${today}`;
};
