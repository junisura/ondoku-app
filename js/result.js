import { formatYMD, guardSameDay, formatTimeMs, formatTimeHm } from "./date.js";
import { loadRecords, saveRecords } from "./storage.js";
import { getTodayRecords, getLastTwoRecords, getBestRecord, sortByCreatedAt, calcSummary } from "./records.js";

// データ読み込み
const records = loadRecords();
const params = new URLSearchParams(location.search);
const workDate = params.get("date") || formatYMD(new Date());
const today = formatYMD(new Date().toISOString());
guardSameDay(workDate);

let memoInput = null;
let memoOutput = null;

// 初期化
async function init() {
  const todayRecords = getTodayRecords(records, workDate);
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

  const { current, prev } = getLastTwoRecords(records, workDate);

  if (prev) {
    document.getElementById("diff-card").classList.remove("display-none");
    document.getElementById("prev__time").textContent = formatTimeMs(prev.time_sec);
    document.getElementById("prev__speed").textContent = `（${prev.speed.toFixed(2)}文字/秒）`;

    const diff = current.time_sec - prev.time_sec;
    const diffTime = document.getElementById("diff__time");
    if (diff > 0) {
      // 正数の場合は符号なしで返されるので符号を付与する
      diffTime.textContent = `+${formatTimeMs(diff)}　BAD...`;
      diffTime.classList.add("text-danger");
    } else if (diff === 0) {
      diffTime.textContent = `${formatTimeMs(diff)}`;
    } else {
      // 負数の場合は符号付きで返される
      diffTime.textContent = `${formatTimeMs(diff)}　GOOD!`;
      diffTime.classList.add("text-success");
    }
  }

  const best = Math.max(...records.map(r => r.speed));
  if (last.speed >= best) {
    document.getElementById("best-updated").classList.remove("hidden");
  }

  initRecords();
}

// 各回の記録
function initRecords() {
  const list = document.getElementById("records");
  const template = document.getElementById("list-item-template");
  list.innerHTML = "";

  const todayRecords = getTodayRecords(records, workDate);
  const todayBestRec = getBestRecord(todayRecords);
  const sorted = sortByCreatedAt(todayRecords, true);
  sorted.forEach((record, index) => {
    const clone = template.content.cloneNode(true);

    if (todayBestRec.attempt_index === record.attempt_index) {
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

init();
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveMemoBtn").addEventListener("click", saveMemo);
  document.getElementById("retryBtn").addEventListener("click", retry);
});

// ボタン
function saveMemo() {
  const todayRecords = getTodayRecords(records, workDate);
  const last = todayRecords[todayRecords.length - 1];

  if (last) {
    last.memo = memoInput.value;
    saveRecords(records);
  }

  memoOutput.textContent = `メモ：　${memoInput.value}`;
  switchMemoDisplay(true);

  alert("保存しました！");
  
  initRecords();
};

function retry() {
  const url = new URL("measurement.html", location.href);
  url.searchParams.set("date", workDate);
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
