import { formatYMD, formatTimeMs, guardSameDay } from "./date.js";
import { loadDateMap, loadRecords, saveRecords } from "./storage.js";
import { loadContents, findContent } from "./contents.js";
import { getTodayRecords, sortByCreatedAt, generateId } from "./records.js";
import { Timer } from "./timer.js";

// 初期化
const params = new URLSearchParams(location.search);
const today = params.get("date") || formatYMD(new Date().toISOString());
const dateMap = loadDateMap();
const records = loadRecords();
guardSameDay(today);

let current;
let attempt;

async function init() {
  const contents = await loadContents();

  const contentId = dateMap[today];
  current = findContent(contents, contentId);

  const todayRecords = sortByCreatedAt(getTodayRecords(records, today));

  // 表示
  document.getElementById("title").textContent = current.title;
  document.getElementById("genre").textContent = current.genre;
  document.getElementById("text").textContent = current.text;

  attempt = todayRecords.length + 1;
  document.getElementById("attempt").textContent = `${attempt}回目`;

  if (todayRecords.length > 0) {
    const prev = todayRecords[todayRecords.length - 1].speed;
    document.getElementById("prev-speed").textContent =
      `（前回：${prev.toFixed(1)}文字/秒）`;
  }
}

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetBtn").addEventListener("click", resetTimer);
  document.getElementById("startPauseBtn").addEventListener("click", toggleTimer);
  document.getElementById("stopBtn").addEventListener("click", stopTimer);
});

// タイマー制御
function resetTimer() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");

  Timer.reset();
  startPauseBtn.textContent = "play_arrow";
  stopBtn.classList.add("hidden");
  resetBtn.classList.add("hidden");
  
  document.getElementById("timerText").textContent = "00:00.00";
};

function toggleTimer() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");

  if (!Timer.isRunning) {
    Timer.start((elapsed) => {
      document.getElementById("timerText").textContent = formatTimeMs(elapsed);
    });
    startPauseBtn.textContent = "pause";
    stopBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
  } else {
    Timer.pause();
    startPauseBtn.textContent = "play_arrow";
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
