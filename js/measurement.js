import { formatYMD, formatJpMDA, formatTimeMs, guardSameDay } from "./date.js";
import { loadDateMap, loadRecords, saveRecords } from "./storage.js";
import { loadContents, findContent, guardTodayContent } from "./contents.js";
import { getTodayRecords, generateId } from "./records.js";
import { Timer } from "./timer.js";

// 初期化
const params = new URLSearchParams(location.search);
const today = params.get("date") || formatYMD(new Date().toISOString());
const dateMap = loadDateMap();
guardSameDay(today);

let current;
let timerValue;
let startPauseBtn;
let stopBtn;
let resetBtn;
let spIcon;
let spLabel;

async function init() {
  const contents = await loadContents();

  const contentId = dateMap[today];
  current = findContent(contents, contentId);
  if (!guardTodayContent(contentId, today)) return;

  // DOM反映
  document.getElementById("today-date").textContent = formatJpMDA(today);
  document.getElementById("text-title").textContent = current.title;
  document.getElementById("text-category").textContent = current.genre;
  document.getElementById("text-body").textContent = current.text;
  document.getElementById("text-count").textContent = `文字数：${current.char_count}字`;
}

// タイマー制御
function resetTimer() {

  Timer.reset();
  updateStartPauseButton(false);
  
  timerValue.textContent = "00:00.00";
}

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
      timerValue.textContent = formatTimeMs(elapsed);
    });
    updateStartPauseButton(true);
  } else {
    Timer.pause();
    updateStartPauseButton(false);
  }
}

function stopTimer() {
  if (!Timer.startTime && Timer.elapsedBeforePause === 0) return;

  const time_sec = Timer.stop();

  // ゼロ除算回避
  if (time_sec <= 0) return;

  // 最新のレコードを取得
  const records = loadRecords();
  const todayRecords = getTodayRecords(records, today);

  const speed = current.char_count / time_sec;
  const record = {
    id: generateId(),
    content_id: current.id,
    work_date: today,
    attempt_index: todayRecords.length + 1,
    time_sec: time_sec,
    speed: speed,
    memo: "",
    created_at: new Date().toISOString(),
  };

  records.push(record);
  saveRecords(records);

  location.href = `result.html?date=${today}`;
}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();

  startPauseBtn = document.getElementById("startPauseBtn");
  stopBtn = document.getElementById("stopBtn");
  resetBtn = document.getElementById("resetBtn");
  timerValue = document.getElementById("timer-value");

  spIcon = startPauseBtn.querySelector(".material-symbols-outlined");
  spLabel = startPauseBtn.querySelector(".btn__label");

  resetBtn.addEventListener("click", resetTimer);
  startPauseBtn.addEventListener("click", toggleTimer);
  stopBtn.addEventListener("click", stopTimer);
});
