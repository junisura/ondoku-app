import { getCurrentUser } from "./auth.js";
import { formatYMD, guardSameDay, formatJpMDA, formatTimeMs } from "./date.js";
import { findTodayContent } from "./contents.js";
import { getTodayRecords, createRecord } from "./records.js";
import { Timer } from "./timer.js";

// 初期化
let today;
let currentContent;
let timerValue;
let spIcon;
let spLabel;

async function init() {
  const params = new URLSearchParams(location.search);
  today = params.get("date") || formatYMD(new Date().toISOString());
  guardSameDay(today);

  document.getElementById("today-date").textContent = formatJpMDA(today);
  currentContent = await findTodayContent(today);
  if (currentContent) {
    document.getElementById("text-title").textContent = currentContent.contents.title;
    document.getElementById("text-category").textContent = currentContent.contents.category;
    document.getElementById("text-body").textContent = currentContent.contents.text_body.replace(/\\n/g, "\n");
    document.getElementById("text-count").textContent = `文字数：${currentContent.contents.char_count}字`;
  } else {
    alert("教材の取得に失敗しました。恐れ入りますがTOP画面からやり直してください。");
    location.href = "index.html";
    return;
  }

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

async function stopTimer() {
  if (!Timer.startTime && Timer.elapsedBeforePause === 0) return;
  const { user, error } = await getCurrentUser();
  if (!user) {
    alert("ログインが必要です");
    return;
  }

  const time_sec = Timer.stop();

  // ゼロ除算回避
  if (time_sec <= 0) return;

  const todayRecords = await getTodayRecords(user.id, today);
  const speed = currentContent.contents.char_count / time_sec;
  const record = {
    user_id: user.id,
    content_id: currentContent.content_id,
    work_date: today,
    attempt_index: todayRecords.length + 1,
    time_sec: time_sec,
    speed: speed,
    memo: ""
  };

  try {
    const rec = await createRecord(record);
    location.href = `result.html?rec_id=${rec.id}`;
  } catch (error) {
    console.error(error);
    alert("記録に失敗しました。恐れ入りますが計測をやり直してください。");
    location.href = "index.html";
    return false;
  }
}

// メイン処理
window.addEventListener("DOMContentLoaded", async () => {
  await init();

  const startPauseBtn = document.getElementById("startPauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");
  timerValue = document.getElementById("timer-value");

  spIcon = startPauseBtn.querySelector(".material-symbols-outlined");
  spLabel = startPauseBtn.querySelector(".btn__label");

  resetBtn.addEventListener("click", resetTimer);
  startPauseBtn.addEventListener("click", toggleTimer);
  stopBtn.addEventListener("click", stopTimer);
});
