import { formatYMD, guardSameDay, formatTimeMs, formatTimeHm } from "./date.js";
import { loadRecords, saveRecords } from "./storage.js";
import { getTodayRecords, getLastTwoRecords, getBestRecord, getSortedByCreatedAt, calcSummary } from "./records.js";
import { renderRecordList } from "./recordList.js";

// データ読み込み
const records = loadRecords();
const params = new URLSearchParams(location.search);
const today = params.get("date") || formatYMD(new Date());
guardSameDay(today);

let todayRecords = [];
let memoInput = null;
let memoOutput = null;

// 初期化
function init() {
  todayRecords = getTodayRecords(records, today);
  if (todayRecords.length === 0) {
    alert("計測記録がありません。TOPに戻ります");
    location.href = "index.html";
    return;
  }
  const last = todayRecords[todayRecords.length - 1];

  const lastTime = formatTimeMs(last.time_sec);
  document.getElementById("last__time").textContent = lastTime;
  document.getElementById("last__speed").textContent = `（${last.speed.toFixed(2)}文字/秒）`;

  memoInput = document.getElementById("memo__input");
  memoOutput = document.getElementById("memo__output");
  if (last.memo) {
    memoOutput.textContent = `メモ：　${last.memo}`;
    switchMemoDisplay(true);
  }

  const { current, prev } = getLastTwoRecords(records, today);

  if (prev) {
    document.getElementById("diff-card").classList.remove("display-none");
    document.getElementById("prev__time").textContent = formatTimeMs(prev.time_sec);
    document.getElementById("prev__speed").textContent = `（${prev.speed.toFixed(2)}文字/秒）`;

    const diff = current.time_sec - prev.time_sec;
    const diffTime = document.getElementById("diff__time");
    const diffDisplay = getDiffDisplay(diff);

    diffTime.textContent = diffDisplay.text;
    if (diffDisplay.className) {
      diffTime.classList.add(diffDisplay.className);
    }
  }

  const best = Math.max(...records.map(r => r.speed));
  if (last.speed >= best) {
    document.getElementById("best-updated").classList.remove("display-none");
  }

  // recordList.jsを呼ぶ
  renderRecordList(todayRecords);
}

function getDiffDisplay(diff) {
  if (diff > 0) {
    return {
      text: `${formatTimeMs(diff)} 速度DOWN...`,
      className: "text-danger",
    };
  }

  if (diff < 0) {
    return {
      text: `${formatTimeMs(diff)} 速度UP!`,
      className: "text-success",
    };
  }

  return {
    text: formatTimeMs(diff),
    className: "",
  };
}

// ボタン
function saveMemo() {
  const last = todayRecords[todayRecords.length - 1];

  if (last) {
    last.memo = memoInput.value;
    saveRecords(records);
  }

  memoOutput.textContent = `メモ：　${memoInput.value}`;
  switchMemoDisplay(true);

  alert("保存しました！");

  // recordList.jsを呼ぶ
  renderRecordList(todayRecords);
};

function retry() {
  const url = new URL("measurement.html", location.href);
  url.searchParams.set("date", today);
  location.href = url.toString();
};

function switchMemoDisplay(isOutput) {
  if (isOutput) {
    document.getElementById("saveMemoBtn").classList.add("display-none");
    memoInput.classList.add("display-none");
    memoOutput.classList.remove("display-none");
  } else {
    document.getElementById("saveMemoBtn").classList.remove("display-none");
    memoInput.classList.remove("display-none");
    memoOutput.classList.add("display-none");
  }
}

// メイン処理
window.addEventListener("DOMContentLoaded", () => {
  init();
  document.getElementById("saveMemoBtn").addEventListener("click", saveMemo);
  document.getElementById("retryBtn").addEventListener("click", retry);
});
